import { parseUnits } from '@ethersproject/units'
import { JSBI, Percent, Price, Token, TokenAmount } from '@ubeswap/sdk'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { StableSwapPool } from 'state/stablePools/reducer'
import invariant from 'tiny-invariant'
import { StableSwapMath } from 'utils/stableSwapMath'

import { useWeb3Context } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import { isAddress } from '../../utils'
import { AppDispatch, AppState } from '../index'
import { useCurrentPool, useMathUtil, usePools } from '../stablePools/hooks'
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
  pool: StableSwapPool
  indexFrom: number
  indexTo: number
  executionPrice: Price
  fee: TokenAmount
  priceImpact: Percent
}

function calcInputOutput(
  input: Token | undefined,
  output: Token | undefined,
  isExactIn: boolean,
  parsedAmount: TokenAmount | undefined,
  math: StableSwapMath,
  poolInfo: StableSwapPool
): readonly [TokenAmount | undefined, TokenAmount | undefined, TokenAmount | undefined] {
  if (!input && !output) {
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
  if (isExactIn) {
    details[0] = parsedAmount
    const [expectedOut, fee] = math.calculateSwap(indexFrom, indexTo, parsedAmount.raw, math.calc_xp())
    details[1] = new TokenAmount(output, expectedOut)
    details[2] = new TokenAmount(input, fee)
  } else {
    details[1] = parsedAmount
    const requiredIn = math.get_dx(indexFrom, indexTo, parsedAmount.raw, math.calc_xp())
    details[0] = new TokenAmount(input, requiredIn)
    details[2] = new TokenAmount(input, JSBI.BigInt('0'))
  }
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
  const mathUtil = useMathUtil(pool ?? '')

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
  if (!pool || pool.loadingPool) {
    inputError = inputError ?? 'Pool Info Loading'
  }

  if (pool && JSBI.equal(pool.lpTotalSupply, JSBI.BigInt('0'))) {
    inputError = inputError ?? 'Insufficient Liquidity'
  }

  if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
    inputError = inputError ?? 'Select a token'
  }
  const formattedTo = isAddress(to)
  if (!to || !formattedTo) {
    inputError = inputError ?? 'Enter a recipient'
  }
  if (
    !inputCurrency ||
    !outputCurrency ||
    !parsedAmount ||
    !pool ||
    !mathUtil ||
    poolsLoading ||
    JSBI.equal(pool.lpTotalSupply, JSBI.BigInt('0'))
  ) {
    return {
      currencies,
      currencyBalances,
      parsedAmount,
      inputError,
      v2Trade: undefined,
    }
  }
  const { tokens = [] } = pool || {}

  const indexFrom = inputCurrency ? tokens.map(({ address }) => address).indexOf(inputCurrency.address) : 0
  const indexTo = outputCurrency ? tokens.map(({ address }) => address).indexOf(outputCurrency.address) : 0

  const tradeData = calcInputOutput(inputCurrency, outputCurrency, isExactIn, parsedAmount, mathUtil, pool)

  const basisTrade = calcInputOutput(
    inputCurrency,
    outputCurrency,
    isExactIn,
    tryParseAmount('1', inputCurrency),
    mathUtil,
    pool
  )
  const input = tradeData[0]
  const output = tradeData[1]
  const fee = tradeData[2]

  if (!input || !output || !fee || !basisTrade[0] || !basisTrade[1]) {
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
  const basisPrice = new Price(inputCurrency, outputCurrency, basisTrade[0]?.raw, basisTrade[1]?.raw)
  const priceImpactFraction = basisPrice.subtract(executionPrice).divide(basisPrice)
  const priceImpact = new Percent(priceImpactFraction.numerator, priceImpactFraction.denominator)

  const v2Trade: MobiusTrade | undefined =
    input && output && pool ? { input, output, pool, indexFrom, indexTo, executionPrice, fee, priceImpact } : undefined

  return {
    currencies,
    currencyBalances,
    parsedAmount,
    v2Trade,
    inputError,
  }
}
