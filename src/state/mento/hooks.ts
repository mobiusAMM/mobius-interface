import { parseUnits } from '@ethersproject/units'
import { JSBI, Price, Token, TokenAmount, TradeType } from '@ubeswap/sdk'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { MentoPool } from 'state/mentoPools/reducer'
import invariant from 'tiny-invariant'
import { MentoMath } from 'utils/mentoMath'

import { useWeb3Context } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import { isAddress } from '../../utils'
import { AppDispatch, AppState } from '../index'
import { useCurrentPool, useMathUtil, usePools } from '../mentoPools/hooks'
import { useCurrencyBalances } from '../wallet/hooks'
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
  pool: MentoPool
  executionPrice: Price
  tradeType: TradeType
  fee: TokenAmount
}

function calcInputOutput(
  input: Token | undefined,
  output: Token | undefined,
  isExactIn: boolean,
  parsedAmount: TokenAmount | undefined,
  math: MentoMath,
  poolInfo: MentoPool
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

  const [balanceIn, balanceOut] =
    input.address === poolInfo.tokens[0].address
      ? [poolInfo.balances[0], poolInfo.balances[1]]
      : [poolInfo.balances[1], poolInfo.balances[0]]

  const swapFee = JSBI.divide(poolInfo.swapFee, JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18)))

  invariant(parsedAmount)
  if (isExactIn) {
    details[0] = parsedAmount
    const [expectedOut, fee] = math.getAmountOut(parsedAmount.raw, balanceIn, balanceOut, swapFee)
    details[1] = new TokenAmount(output, expectedOut)
    details[2] = new TokenAmount(input, fee)
  } else {
    details[1] = parsedAmount
    const [requiredIn, fee] = math.getAmountIn(parsedAmount.raw, balanceIn, balanceOut, swapFee)
    details[0] = new TokenAmount(input, requiredIn)
    details[2] = new TokenAmount(input, fee)
  }
  return details
}

export function useMentoTradeInfo(): {
  currencies: { [field in Field]?: Token }
  currencyBalances: { [field in Field]?: TokenAmount }
  parsedAmount: TokenAmount | undefined
  v2Trade: MentoTrade | undefined
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
  const [pool] = useCurrentPool(inputCurrency?.address ?? '', outputCurrency?.address ?? '')
  const mathUtil = useMathUtil(pool)

  const to: string | null = connected ? address : null
  const relevantTokenBalances = useCurrencyBalances(connected ? address : undefined, [
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
  if (!inputCurrency || !outputCurrency || !parsedAmount || poolsLoading || !mathUtil) {
    return {
      currencies,
      currencyBalances,
      parsedAmount,
      inputError,
      v2Trade: undefined,
    }
  }
  const [input, output, fee] = calcInputOutput(inputCurrency, outputCurrency, isExactIn, parsedAmount, mathUtil, pool)
  if (!input || !output || !fee) {
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
  const tradeType = isExactIn ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT

  const v2Trade: MentoTrade | undefined =
    input && output && pool ? { input, output, pool, executionPrice, tradeType, fee } : undefined
  return {
    currencies,
    currencyBalances,
    parsedAmount,
    v2Trade,
    inputError,
  }
}
