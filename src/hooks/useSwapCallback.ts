import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { JSBI, SwapParameters } from '@ubeswap/sdk'
import { ContractTransaction } from 'ethers'
import { useMemo } from 'react'
import isZero from 'utils/isZero'

import { BIPS_BASE, INITIAL_ALLOWED_SLIPPAGE } from '../constants'
import { MobiusTrade } from '../state/swap/hooks'
import { useTransactionAdder } from '../state/transactions/hooks'
import { getStableSwapContract } from '../utils'
import useENS from './useENS'
import useTransactionDeadline from './useTransactionDeadline'
import { useWeb3Context } from './web3'

export enum SwapCallbackState {
  INVALID,
  LOADING,
  VALID,
}

interface SwapCall {
  contract: Contract
  parameters: SwapParameters
}

interface SuccessfulCall {
  call: SwapCall
  gasEstimate: BigNumber
}

interface FailedCall {
  call: SwapCall
  error: Error
}

type EstimatedSwapCall = SuccessfulCall | FailedCall

/**
 * Returns the swap calls that can be used to make the trade
 * @param trade trade to execute
 * @param allowedSlippage user allowed slippage
 * @param recipientAddressOrName
 */
function useSwapCallArguments(
  trade: MobiusTrade | undefined, // trade to execute, required
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
  recipientAddressOrName: string | null // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
): SwapCall[] {
  const { provider, connected, address: account } = useWeb3Context()

  const { address: recipientAddress } = useENS(recipientAddressOrName)
  const recipient = recipientAddressOrName === null ? account : recipientAddress
  const deadline = useTransactionDeadline()

  return useMemo(() => {
    if (!trade || !recipient || !provider || !connected || !deadline) return []

    const contract = getStableSwapContract(trade.pool.address, provider, connected)
    const { indexFrom = 0, indexTo = 0 } = trade || {}
    const outputRaw = trade.output.raw
    const minDy = JSBI.subtract(outputRaw, JSBI.divide(outputRaw, JSBI.divide(BIPS_BASE, JSBI.BigInt(allowedSlippage))))
    const swapCallParameters: SwapParameters = {
      methodName: trade.isMeta ? 'swapUnderlying' : 'swap',
      args: [
        indexFrom.toString(),
        indexTo.toString(),
        trade.input.raw.toString(),
        minDy.toString(),
        deadline.toString(),
      ],
      value: '0',
    }
    const swapMethods = [swapCallParameters]

    return swapMethods.map((parameters) => ({ parameters, contract }))
  }, [allowedSlippage, connected, deadline, provider, recipient, trade])
}

// returns a function that will execute a swap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade
export function useSwapCallback(
  trade: MobiusTrade | undefined, // trade to execute, required
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
  recipientAddressOrName: string | null // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
): { state: SwapCallbackState; callback: null | (() => Promise<string>); error: string | null } {
  const { address, connected, provider } = useWeb3Context()

  const swapCalls = useSwapCallArguments(trade, allowedSlippage, recipientAddressOrName)

  const addTransaction = useTransactionAdder()
  const recipient = address

  return useMemo(() => {
    if (!trade || !provider || !connected) {
      return { state: SwapCallbackState.INVALID, callback: null, error: 'Missing dependencies' }
    }
    if (!recipient) {
      if (recipientAddressOrName !== null) {
        return { state: SwapCallbackState.INVALID, callback: null, error: 'Invalid recipient' }
      } else {
        return { state: SwapCallbackState.LOADING, callback: null, error: null }
      }
    }

    return {
      state: SwapCallbackState.VALID,
      callback: async function onSwap(): Promise<string> {
        const estimatedCalls: EstimatedSwapCall[] = await Promise.all(
          swapCalls.map((call) => {
            const {
              parameters: { methodName, args, value },
              contract,
            } = call
            const options = !value || isZero(value) ? {} : { value }

            return contract.estimateGas[methodName](...args, options)
              .then((gasEstimate) => {
                return {
                  call,
                  gasEstimate,
                }
              })
              .catch((gasError) => {
                console.debug('Gas estimate failed, trying eth_call to extract error', call)

                return contract.callStatic[methodName](...args, options)
                  .then((result) => {
                    console.debug('Unexpected successful call after failed estimate gas', call, gasError, result)
                    return { call, error: new Error('Unexpected issue with estimating the gas. Please try again.') }
                  })
                  .catch((callError) => {
                    console.debug('Call threw error', call, callError)
                    let errorMessage: string
                    switch (callError.reason) {
                      case 'UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT':
                      case 'UniswapV2Router: EXCESSIVE_INPUT_AMOUNT':
                        errorMessage =
                          'This transaction will not succeed either due to price movement or fee on transfer. Try increasing your slippage tolerance.'
                        break
                      default:
                        errorMessage = `The transaction cannot succeed due to error: ${callError.reason}. This is probably an issue with one of the tokens you are swapping.`
                    }
                    return { call, error: new Error(errorMessage) }
                  })
              })
          })
        )

        // a successful estimation is a bignumber gas estimate and the next call is also a bignumber gas estimate
        const successfulEstimation = estimatedCalls.find(
          (el, ix, list): el is SuccessfulCall =>
            'gasEstimate' in el && (ix === list.length - 1 || 'gasEstimate' in list[ix + 1])
        )

        if (!successfulEstimation) {
          const errorCalls = estimatedCalls.filter((call): call is FailedCall => 'error' in call)
          if (errorCalls.length > 0) throw errorCalls[errorCalls.length - 1].error
          throw new Error('Unexpected error. Please contact support: none of the calls threw an error')
        }

        const {
          call: {
            contract: disconnectedContract,
            parameters: { methodName, args },
          },
          gasEstimate,
        } = successfulEstimation

        const contract = disconnectedContract.connect(provider.getSigner())
        return contract[methodName](...args, {
          gasLimit: gasEstimate,
        })
          .then((response: ContractTransaction) => {
            const inputSymbol = trade.input.currency.symbol
            const outputSymbol = trade.output.currency.symbol
            const inputAmount = trade.input.toSignificant(6)
            const outputAmount = trade.output.toSignificant(6)

            const base = `Swap ${inputAmount} ${inputSymbol} for ${outputAmount} ${outputSymbol}`
            const withRecipient = base

            addTransaction(response, {
              summary: withRecipient,
            })

            return response.hash
          })
          .catch((error: any) => {
            // if the user rejected the tx, pass this along
            if (error?.code === 4001) {
              throw new Error('Transaction rejected.')
            } else {
              // otherwise, the error was unexpected and we need to convey that
              console.error(`Swap failed`)
              throw new Error(`Swap failed: ${error.message}`)
            }
          })
      },
      error: null,
    }
  }, [trade, provider, connected, recipient, recipientAddressOrName, swapCalls, addTransaction])
}
