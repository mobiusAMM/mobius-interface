import { useWeb3Context } from 'hooks'
import { SwapCallbackState, useSwapCallback } from 'hooks/useMentoCallback'
import { useMemo } from 'react'

import { INITIAL_ALLOWED_SLIPPAGE } from '../../../constants'
import { MentoTrade } from '../../../state/mento/hooks'

/**
 * Use callback to allow trading
 * @param trade
 * @param allowedSlippage
 * @param recipientAddressOrName
 * @returns
 */
export const useMentoTradeCallback = (
  trade: MentoTrade | undefined, // trade to execute, required
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
  recipientAddressOrName: string | null // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
): { state: SwapCallbackState; callback: null | (() => Promise<string>); error: string | null } => {
  const { connected } = useWeb3Context()

  const {
    state: swapState,
    callback: swapCallback,
    error,
  } = useSwapCallback(trade, allowedSlippage, recipientAddressOrName)

  return useMemo(() => {
    if (error) {
      return { state: swapState, callback: null, error }
    }

    if (!trade || !connected) {
      return { state: SwapCallbackState.INVALID, callback: null, error: 'Missing dependencies' }
    }

    if (swapCallback) {
      return { state: SwapCallbackState.VALID, callback: swapCallback, error: null }
    } else {
      return { state: SwapCallbackState.INVALID, callback: null, error: 'Unknown trade type' }
    }
  }, [error, trade, connected, swapCallback, swapState])
}
