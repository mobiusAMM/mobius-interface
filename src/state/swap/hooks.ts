import { parseUnits } from '@ethersproject/units'
import { Route } from '@terminal-fi/swappa'
import { JSBI, Percent, Price, Token, TokenAmount } from '@ubeswap/sdk'
import BigNumber from 'bignumber.js'
import { useCallback, useContext, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { StableSwapPool } from 'state/stablePools/reducer'
import invariant from 'tiny-invariant'
import { PairStableSwap } from 'utils/StablePairMath'

import { SwappaContext } from '../../Context/SwappaContext'
import { useWeb3Context } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import useDebounce from '../../hooks/useDebounce'
import { isAddress } from '../../utils'
import { AppDispatch, AppState } from '../index'
import { useCurrencyBalances } from '../wallet/hooks'
import { Field, selectCurrency, setRecipient, switchCurrencies, typeInput } from './actions'

export function useSwapState(): AppState['swap'] {
  return useSelector<AppState, AppState['swap']>((state) => state.swap)
}

export function useSwapActionHandlers(): {
  onCurrencySelection: (field: Field, currency: Token) => void
  onSwitchTokens: () => void
  onUserInput: (field: Field, typedValue: string) => void
  onChangeRecipient: (recipient: string | null) => void
} {
  const dispatch = useDispatch<AppDispatch>()
  const onCurrencySelection = useCallback(
    (field: Field, currency: Token) => {
      dispatch(
        selectCurrency({
          field,
          currencyId: currency instanceof Token ? currency.address : '',
        })
      )
    },
    [dispatch]
  )

  const onSwitchTokens = useCallback(() => {
    dispatch(switchCurrencies())
  }, [dispatch])

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      dispatch(typeInput({ field, typedValue }))
    },
    [dispatch]
  )

  const onChangeRecipient = useCallback(
    (recipient: string | null) => {
      dispatch(setRecipient({ recipient }))
    },
    [dispatch]
  )

  return {
    onSwitchTokens,
    onCurrencySelection,
    onUserInput,
    onChangeRecipient,
  }
}

// try to parse a user entered amount for a given token
export function tryParseAmount(value?: string, currency?: Token): TokenAmount | undefined {
  if (!value || !currency) {
    return undefined
  }
  try {
    const typedValueParsed = parseUnits(value, currency.decimals).toString()
    if (typedValueParsed !== '0') {
      return new TokenAmount(currency as Token, JSBI.BigInt(typedValueParsed))
    }
  } catch (error) {
    // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.debug(`Failed to parse input amount: "${value}"`, error)
  }
  // necessary for all paths to return a value
  return undefined
}

export type MobiusTrade = {
  input: TokenAmount
  output: TokenAmount
  executionPrice: Price
  fee: TokenAmount
  priceImpact: Percent
  route: Route
}

function calcInputOutput(
  input: Token | undefined,
  output: Token | undefined,
  isExactIn: boolean,
  parsedAmount: TokenAmount | undefined,
  math: PairStableSwap,
  poolInfo: StableSwapPool
): readonly [TokenAmount | undefined, TokenAmount | undefined, TokenAmount | undefined] {
  if ((!input && !output) || !parsedAmount) {
    return [undefined, undefined, undefined]
  }
  const { tokens } = poolInfo
  if (!output) {
    return [parsedAmount, undefined, undefined]
  }
  if (!input) {
    return [undefined, parsedAmount, undefined]
  }

  const indexFrom = tokens.map(({ address }) => address).indexOf(input.address)
  const indexTo = tokens.map(({ address }) => address).indexOf(output.address)

  const details: [TokenAmount | undefined, TokenAmount | undefined, TokenAmount | undefined] = [
    undefined,
    undefined,
    undefined,
  ]

  invariant(parsedAmount)
  details[0] = parsedAmount
  const [expectedOut, fee] = math.outputAmount(indexFrom, indexTo, parsedAmount.raw)
  details[1] = new TokenAmount(output, expectedOut)
  details[2] = new TokenAmount(input, fee)
  return details
}

export function useMobiusTradeInfo(): {
  currencies: { [field in Field]?: Token }
  currencyBalances: { [field in Field]?: TokenAmount }
  parsedAmount: TokenAmount | undefined
  v2Trade: MobiusTrade | undefined
  inputError?: string
} {
  const { address, connected } = useWeb3Context()
  const { swappa, initializing } = useContext(SwappaContext)

  const {
    independentField,
    typedValue: unbouncedTypedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()
  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)
  const typedValue = useDebounce(unbouncedTypedValue, 100)
  const relevantTokenBalances = useCurrencyBalances(connected ? address : undefined, [
    inputCurrency ?? undefined,
    outputCurrency ?? undefined,
  ])

  return useMemo(() => {
    const to: string | null = connected ? address : null

    const isExactIn: boolean = independentField === Field.INPUT
    const parsedAmount = tryParseAmount(typedValue, (isExactIn ? inputCurrency : outputCurrency) ?? undefined)

    const currencyBalances = {
      [Field.INPUT]: relevantTokenBalances[0],
      [Field.OUTPUT]: relevantTokenBalances[1],
    }

    const currencies: { [field in Field]?: Token } = {
      [Field.INPUT]: inputCurrency ?? undefined,
      [Field.OUTPUT]: outputCurrency ?? undefined,
    }

    let inputError: string | undefined

    if (!parsedAmount) {
      inputError = inputError ?? 'Enter an amount'
    }
    if (initializing) {
      inputError = inputError ?? 'Pool Info Loading'
    }

    if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
      inputError = inputError ?? 'Select a token'
    }
    const formattedTo = isAddress(to)
    if (!to || !formattedTo) {
      inputError = inputError ?? 'Enter a recipient'
    }
    if (!connected) {
      inputError = inputError ?? 'Connect Wallet'
    }

    if (!inputCurrency || !outputCurrency || !parsedAmount || initializing) {
      return {
        currencies,
        currencyBalances,
        parsedAmount,
        inputError,
        v2Trade: undefined,
      }
    }

    const basisInput = new BigNumber(`1e+${inputCurrency.decimals}`)
    const basisTrade = swappa?.findBestRoutesForFixedInputAmount(
      inputCurrencyId ?? '',
      outputCurrencyId ?? '',
      basisInput
    )?.[0]
    const trade = swappa?.findBestRoutesForFixedInputAmount(
      inputCurrencyId ?? '',
      outputCurrencyId ?? '',
      new BigNumber(parsedAmount.raw.toString())
    )?.[0]
    const input = trade ? parsedAmount : undefined
    const output = trade ? new TokenAmount(outputCurrency, trade.outputAmount.toFixed(0)) : undefined
    const fee = trade ? new TokenAmount(inputCurrency, '0') : undefined

    if (!input || !output || !fee || !basisTrade || !trade) {
      return {
        currencies,
        currencyBalances,
        parsedAmount,
        inputError,
        v2Trade: undefined,
      }
    }

    if (currencyBalances[Field.INPUT]?.lessThan(input || JSBI.BigInt('0'))) {
      inputError = 'Insufficient Balance'
    }

    const executionPrice = new Price(inputCurrency, outputCurrency, input?.raw, output?.raw)
    const basisPrice = new Price(
      inputCurrency,
      outputCurrency,
      basisInput.toFixed(0),
      basisTrade?.outputAmount.toFixed(0)
    )
    const priceImpactFraction = basisPrice.subtract(executionPrice).divide(basisPrice)
    const priceImpact = new Percent(priceImpactFraction.numerator, priceImpactFraction.denominator)

    const v2Trade: MobiusTrade | undefined =
      input && output ? { input, output, executionPrice, fee, priceImpact, route: trade } : undefined

    return {
      currencies,
      currencyBalances,
      parsedAmount,
      v2Trade,
      inputError,
    }
  }, [
    typedValue,
    inputCurrencyId,
    outputCurrencyId,
    initializing,
    swappa,
    address,
    relevantTokenBalances,
    inputCurrency,
    outputCurrency,
    connected,
    independentField,
  ])
}
