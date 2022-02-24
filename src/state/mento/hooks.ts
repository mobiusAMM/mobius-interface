import { parseUnits } from '@ethersproject/units'
import { JSBI, Percent, Price, Token, TokenAmount, TradeType } from '@ubeswap/sdk'
import { IMentoExchangeInfo } from 'constants/mento'
import { CELO } from 'constants/tokens'
import {
  calculateEstimatedSwapInputAmount,
  calculateEstimatedSwapOutputAmount,
  calculateSwapPrice,
} from 'lib/mentoCalculator'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import invariant from 'tiny-invariant'

import { BIPS_BASE, CHAIN } from '../../constants'
import { useWeb3Context } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import { isAddress } from '../../utils'
import { AppDispatch, AppState } from '../index'
import { tokenToStable, useCurrentPool, usePools } from '../mentoPools/hooks'
import { useTokenBalances } from '../wallet/hooks'
import { Field, selectCurrency, setRecipient, switchCurrencies, typeInput } from './actions'

export function useSwapState(): AppState['mento'] {
  return useSelector<AppState, AppState['mento']>((state) => state.mento)
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

export type MentoTrade = {
  input: TokenAmount
  output: TokenAmount
  pool: IMentoExchangeInfo
  executionPrice: Price
  tradeType: TradeType
  fee: TokenAmount
  priceImpact: Percent
}

function calcInputOutput(
  input: Token | undefined,
  output: Token | undefined,
  isExactIn: boolean,
  parsedAmount: TokenAmount | undefined,
  poolInfo: IMentoExchangeInfo
): readonly [TokenAmount | undefined, TokenAmount | undefined, TokenAmount | undefined] {
  if (!input && !output) {
    return [undefined, undefined, undefined]
  }
  if (!output) {
    return [parsedAmount, undefined, undefined]
  }
  if (!input) {
    return [undefined, parsedAmount, undefined]
  }
  const details: [TokenAmount | undefined, TokenAmount | undefined, TokenAmount | undefined] = [
    undefined,
    undefined,
    undefined,
  ]
  invariant(parsedAmount)
  if (isExactIn) {
    details[0] = parsedAmount
    const { outputAmount, fee } = calculateEstimatedSwapOutputAmount(poolInfo, new TokenAmount(input, parsedAmount.raw))
    details[1] = outputAmount
    details[2] = fee
  } else {
    details[1] = parsedAmount
    const { fee, inputAmount } = calculateEstimatedSwapInputAmount(poolInfo, new TokenAmount(output, parsedAmount.raw))
    details[0] = inputAmount
    details[2] = fee
  }
  return details
}

export function useMentoTradeInfo(): {
  currencies: { [field in Field]?: Token }
  currencyBalances: { [field in Field]?: TokenAmount }
  parsedAmount: TokenAmount | undefined
  mentoTrade: MentoTrade | undefined
  inputError?: string
} {
  const { address, connected } = useWeb3Context()

  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()
  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)
  const pools = usePools()
  const poolsLoading = pools.length === 0

  const inputStable = inputCurrency ? tokenToStable(inputCurrency) : null
  const outputStable = outputCurrency ? tokenToStable(outputCurrency) : null

  const stable = inputStable ?? outputStable

  const pool = useCurrentPool(stable)

  const to: string | null = connected ? address : null
  const relevantTokenBalances = useTokenBalances(connected ? address : undefined, [
    inputCurrency ?? undefined,
    outputCurrency ?? undefined,
  ])

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
  if (!connected) {
    inputError = 'Connect Wallet'
  }

  if (!parsedAmount) {
    inputError = inputError ?? 'Enter an amount'
  }
  if (!pool) {
    inputError = inputError ?? 'Pool Info Loading'
  }
  if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
    inputError = inputError ?? 'Select a token'
  }
  const formattedTo = isAddress(to)
  if (!to || !formattedTo) {
    inputError = inputError ?? 'Enter a recipient'
  }
  if (!inputCurrency || !outputCurrency || !parsedAmount || !pool || poolsLoading) {
    return {
      currencies,
      currencyBalances,
      parsedAmount,
      inputError,
      mentoTrade: undefined,
    }
  }
  const [input, output, fee] = calcInputOutput(inputCurrency, outputCurrency, isExactIn, parsedAmount, pool)
  if (!input || !output || !fee) {
    return {
      currencies,
      currencyBalances,
      parsedAmount,
      inputError,
      mentoTrade: undefined,
    }
  }

  if (currencyBalances[Field.INPUT]?.lessThan(input || JSBI.BigInt('0'))) {
    inputError = 'Insufficient Balance'
  }

  const executionPrice = new Price(inputCurrency, outputCurrency, input?.raw, output?.raw)
  const basisPrice = input.token !== CELO[CHAIN] ? calculateSwapPrice(pool) : calculateSwapPrice(pool).invert()
  const tradeType = isExactIn ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT
  const priceImpactFraction = basisPrice
    .subtract(executionPrice)
    .divide(basisPrice)
    .subtract(pool.fee.divide(BIPS_BASE).multiply('100'))
  const priceImpact = new Percent(priceImpactFraction.numerator, priceImpactFraction.denominator)

  const mentoTrade: MentoTrade | undefined =
    input && output && pool ? { input, output, pool, executionPrice, tradeType, fee, priceImpact } : undefined
  return {
    currencies,
    currencyBalances,
    parsedAmount,
    mentoTrade,
    inputError,
  }
}
