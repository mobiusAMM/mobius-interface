import { parseUnits } from '@ethersproject/units'
import { ChainId, cUSD, JSBI, Percent, Price, Token, TokenAmount, Trade, TradeType } from '@ubeswap/sdk'
import { useUbeswapTradeExactIn, useUbeswapTradeExactOut } from 'components/swap/routing/hooks/useTrade'
import { UbeswapTrade } from 'components/swap/routing/trade'
import { useStableSwapContract } from 'hooks/useContract'
import { ParsedQs } from 'qs'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { StableSwapPool } from 'state/stablePools/reducer'
import { PairStableSwap } from 'utils/StablePairMath'
import { StableSwapMath } from 'utils/stableSwapMath'

import { ROUTER_ADDRESS } from '../../constants'
import { useActiveContractKit } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import useENS from '../../hooks/useENS'
import useParsedQueryString from '../../hooks/useParsedQueryString'
import { isAddress } from '../../utils'
import { computeSlippageAdjustedAmounts } from '../../utils/prices'
import { AppDispatch, AppState } from '../index'
import { useCurrentPool, useMathUtil, usePairUtil, usePools, useUnderlyingPool } from '../stablePools/hooks'
import { useUserSlippageTolerance } from '../user/hooks'
import { useCurrencyBalances } from '../wallet/hooks'
import { Field, replaceSwapState, selectCurrency, setRecipient, switchCurrencies, typeInput } from './actions'
import { SwapState } from './reducer'

const ZERO = JSBI.BigInt('0')

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

const BAD_RECIPIENT_ADDRESSES: string[] = [
  '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f', // v2 factory
  '0xf164fC0Ec4E93095b804a4795bBe1e041497b92a', // v2 router 01
  '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // v2 router 02
  ROUTER_ADDRESS,
]

/**
 * Returns true if any of the pairs or tokens in a trade have the given checksummed address
 * @param trade to check for the given address
 * @param checksummedAddress address to check in the pairs and tokens
 */
function involvesAddress(trade: Trade, checksummedAddress: string): boolean {
  return (
    trade.route.path.some((token) => token.address === checksummedAddress) ||
    trade.route.pairs.some((pair) => pair.liquidityToken.address === checksummedAddress)
  )
}

export type MobiTrade = {
  poolName?: string
  poolAddress?: string
  inputAmount?: TokenAmount
  outputAmount?: TokenAmount
  executionPrice?: Price
  nextMidPrice?: Price
  priceImpact?: Percent
}

type PoolInfo = {
  name: string
  address: string
  lpToken: string
  tokens: string[]
}

export const POOLS_TO_TOKENS: { [c: number]: PoolInfo[] } = {
  [ChainId.MAINNET]: [
    {
      name: 'Staked Celo Pool',
      tokens: ['0xf194afdf50b03e69bd7d057c1aa9e10c9954e4c9', '0xBDeedCDA79BAbc4Eb509aB689895a3054461691e'],
      address: '',
      lpToken: '',
    },
    {
      name: 'US Dollar Pool',
      address: '0xe83e3750eeE33218586015Cf3a34c6783C0F63Ac',
      tokens: [
        '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1',
        '0x695218A22c805Bab9C6941546CF5395F169Ad871',
        '0x4DA9471c101e0cac906E52DF4f00943b21863efF',
      ],
      lpToken: '0x751c70e8f062071bDE19597e2766a5078709FCb9',
    },
  ],
  [ChainId.ALFAJORES]: [
    {
      name: 'Staked Celo Pool',
      tokens: ['0xf194afdf50b03e69bd7d057c1aa9e10c9954e4c9', '0xBDeedCDA79BAbc4Eb509aB689895a3054461691e'],
      address: '',
      lpToken: '',
    },
    {
      name: 'US Dollar Pool',
      address: '0xe83e3750eeE33218586015Cf3a34c6783C0F63Ac',
      tokens: [
        '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1',
        '0x695218A22c805Bab9C6941546CF5395F169Ad871',
        '0x4DA9471c101e0cac906E52DF4f00943b21863efF',
      ],
      lpToken: '0x751c70e8f062071bDE19597e2766a5078709FCb9',
    },
  ],
}

export function useDerivedStableSwapInfo(): {
  currencies?: { [field in Field]?: Token }
  currencyBalances?: { [field in Field]?: TokenAmount }
  parsedAmount?: TokenAmount | undefined
  v2Trade?: MobiTrade | undefined
  inputError?: string
} {
  const { account, chainId } = useActiveContractKit()
  const ONE = JSBI.BigInt(1)

  const {
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
    recipient,
  } = useSwapState()

  const inputCurrency = useCurrency(false, inputCurrencyId)
  const outputCurrency = useCurrency(false, outputCurrencyId)
  const recipientLookup = useENS(recipient ?? undefined)
  const to: string | null = (recipient === null ? account : recipientLookup.address) ?? null
  const [poolInfo] = POOLS_TO_TOKENS[chainId].filter(
    ({ tokens }) => tokens.includes(inputCurrency?.address || '') && tokens.includes(outputCurrency?.address || '')
  )

  const relevantTokenBalances = useCurrencyBalances(account ?? undefined, [
    inputCurrency ?? undefined,
    outputCurrency ?? undefined,
  ])

  const currencies: { [field in Field]?: Token } = {
    [Field.INPUT]: inputCurrency ?? undefined,
    [Field.OUTPUT]: outputCurrency ?? undefined,
  }

  const currencyBalances = {
    [Field.INPUT]: relevantTokenBalances[0],
    [Field.OUTPUT]: relevantTokenBalances[1],
  }

  const parsedAmount = tryParseAmount(typedValue, inputCurrency ?? undefined)

  const stableSwapContract = useStableSwapContract(poolInfo?.address)
  const tokenOrder = poolInfo ? poolInfo.tokens : []
  const inputIndex = tokenOrder.indexOf(inputCurrencyId || '')
  const outputIndex = tokenOrder.indexOf(outputCurrencyId || '')

  let inputError: string | undefined
  if (!account) {
    inputError = 'Connect Wallet'
  }

  if (!parsedAmount) {
    inputError = inputError ?? 'Enter an amount'
  }

  if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
    inputError = inputError ?? 'Select a token'
  }

  const v2Trade: MobiTrade = {
    poolAddress: poolInfo?.address || '',
    poolName: poolInfo?.name || 'Inactive pool',
    inputAmount: parsedAmount,
  }

  const formattedTo = isAddress(to)
  if (!to || !formattedTo) {
    inputError = inputError ?? 'Enter a recipient'
  }

  if (!poolInfo) {
    console.log('No pool!')
    return {
      currencies,
      currencyBalances,
    }
  }
  const asyncUpdateMobiTrade = async () => {
    const expectedOut = await stableSwapContract?.functions.get_dy_underlying(inputIndex, outputIndex, parsedAmount)
    const price = new Price(inputCurrency, outputCurrency, parsedAmount?.raw, expectedOut?.raw)
    v2Trade.outputAmount = new TokenAmount(outputCurrency, expectedOut)
    v2Trade.executionPrice = price
  }

  parsedAmount && asyncUpdateMobiTrade()

  return {
    currencies,
    currencyBalances,
    parsedAmount,
    v2Trade: v2Trade ?? undefined,
    inputError,
  }
}

export type MobiusTrade = {
  input: TokenAmount
  output: TokenAmount
  pool: StableSwapPool
  indexFrom: number
  indexTo: number
  executionPrice: Price
  tradeType: TradeType
  fee: TokenAmount
  priceImpact: Percent
  isMeta?: boolean
}

function calcInputOutput(
  input: Token | undefined,
  output: Token | undefined,
  isExactIn: boolean,
  parsedAmount: TokenAmount | undefined,
  math: PairStableSwap,
  poolInfo: StableSwapPool,
  underlyingMath?: StableSwapMath,
  underlyingPool?: StableSwapPool
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
  const { account } = useActiveContractKit()

  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
    recipient,
  } = useSwapState()
  const inputCurrency = useCurrency(false, inputCurrencyId)
  const outputCurrency = useCurrency(false, outputCurrencyId)
  const recipientLookup = useENS(recipient ?? undefined)

  const pools = usePools()
  const poolsLoading = pools.length === 0
  const [pool] = useCurrentPool(inputCurrency?.address, outputCurrency?.address)
  const underlyingMath = useMathUtil(pool?.metaPool ?? '')
  const mathUtil = usePairUtil(pool)
  const underlyingPool = useUnderlyingPool(pool?.name ?? '')

  const to: string | null = (recipient === null ? account : recipientLookup.address) ?? null
  const relevantTokenBalances = useCurrencyBalances(account ?? undefined, [
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
  if (!account) {
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
  } else {
    if (BAD_RECIPIENT_ADDRESSES.indexOf(formattedTo) !== -1) {
      inputError = inputError ?? 'Invalid recipient'
    }
  }
  if (
    !inputCurrency ||
    !outputCurrency ||
    !parsedAmount ||
    !pool ||
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

  let indexFrom = inputCurrency ? tokens.map(({ address }) => address).indexOf(inputCurrency.address) : 0
  let indexTo = outputCurrency ? tokens.map(({ address }) => address).indexOf(outputCurrency.address) : 0

  const indexFromUnderlying = inputCurrency
    ? underlyingPool?.tokens.map(({ address }) => address).indexOf(inputCurrency.address) ?? 0
    : 0
  const indexToUnderlying = outputCurrency
    ? underlyingPool?.tokens.map(({ address }) => address).indexOf(outputCurrency.address) ?? 0
    : 0

  if (underlyingPool && indexFrom == -1) {
    indexFrom = tokens.length + indexFromUnderlying
  }

  if (underlyingPool && indexTo == -1) {
    indexTo = tokens.length + indexToUnderlying
  }
  const tradeData = calcInputOutput(
    inputCurrency,
    outputCurrency,
    isExactIn,
    parsedAmount,
    mathUtil,
    pool,
    underlyingMath,
    underlyingPool
  )

  const basisTrade = calcInputOutput(
    inputCurrency,
    outputCurrency,
    isExactIn,
    tryParseAmount('1', inputCurrency),
    mathUtil,
    pool,
    underlyingMath,
    underlyingPool
  )
  const input = tradeData[0]
  const output = tradeData[1]
  const fee = tradeData[2]

  if (currencyBalances[Field.INPUT]?.lessThan(input || JSBI.BigInt('0'))) {
    inputError = 'Insufficient Balance'
  }

  const executionPrice = new Price(inputCurrency, outputCurrency, input?.raw, output?.raw)
  const basisPrice = new Price(inputCurrency, outputCurrency, basisTrade[0]?.raw, basisTrade[1]?.raw)
  const priceImpactFraction = basisPrice.subtract(executionPrice).divide(basisPrice)
  const priceImpact = new Percent(priceImpactFraction.numerator, priceImpactFraction.denominator)
  const tradeType = isExactIn ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT
  const isMeta = indexFrom >= tokens.length || indexTo >= tokens.length

  if (isMeta && indexTo >= tokens.length) {
    indexTo -= 1
  }
  if (isMeta && indexFrom >= tokens.length) {
    indexFrom -= 1
  }

  const v2Trade: MobiusTrade | undefined =
    input && output && pool
      ? { input, output, pool, indexFrom, indexTo, executionPrice, tradeType, fee, isMeta, priceImpact }
      : undefined

  return {
    currencies,
    currencyBalances,
    parsedAmount,
    v2Trade,
    inputError,
  }
}

// from the current swap inputs, compute the best trade and return it.
export function useDerivedSwapInfo(): {
  currencies: { [field in Field]?: Token }
  currencyBalances: { [field in Field]?: TokenAmount }
  parsedAmount: TokenAmount | undefined
  v2Trade: UbeswapTrade | undefined
  inputError?: string
} {
  const { account } = useActiveContractKit()

  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
    recipient,
  } = useSwapState()

  const inputCurrency = useCurrency(false, inputCurrencyId)
  const outputCurrency = useCurrency(false, outputCurrencyId)
  const recipientLookup = useENS(recipient ?? undefined)
  const to: string | null = (recipient === null ? account : recipientLookup.address) ?? null

  const relevantTokenBalances = useCurrencyBalances(account ?? undefined, [
    inputCurrency ?? undefined,
    outputCurrency ?? undefined,
  ])

  const isExactIn: boolean = independentField === Field.INPUT
  const parsedAmount = tryParseAmount(typedValue, (isExactIn ? inputCurrency : outputCurrency) ?? undefined)

  const bestTradeExactIn = useUbeswapTradeExactIn(isExactIn ? parsedAmount : undefined, outputCurrency ?? undefined)
  const bestTradeExactOut = useUbeswapTradeExactOut(inputCurrency ?? undefined, !isExactIn ? parsedAmount : undefined)

  const v2Trade = isExactIn ? bestTradeExactIn : bestTradeExactOut

  const currencyBalances = {
    [Field.INPUT]: relevantTokenBalances[0],
    [Field.OUTPUT]: relevantTokenBalances[1],
  }

  const currencies: { [field in Field]?: Token } = {
    [Field.INPUT]: inputCurrency ?? undefined,
    [Field.OUTPUT]: outputCurrency ?? undefined,
  }

  let inputError: string | undefined
  if (!account) {
    inputError = 'Connect Wallet'
  }

  if (!parsedAmount) {
    inputError = inputError ?? 'Enter an amount'
  }

  if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
    inputError = inputError ?? 'Select a token'
  }

  const formattedTo = isAddress(to)
  if (!to || !formattedTo) {
    inputError = inputError ?? 'Enter a recipient'
  } else {
    if (
      BAD_RECIPIENT_ADDRESSES.indexOf(formattedTo) !== -1 ||
      (bestTradeExactIn && involvesAddress(bestTradeExactIn, formattedTo)) ||
      (bestTradeExactOut && involvesAddress(bestTradeExactOut, formattedTo))
    ) {
      inputError = inputError ?? 'Invalid recipient'
    }
  }

  const [allowedSlippage] = useUserSlippageTolerance()

  const slippageAdjustedAmounts = v2Trade && allowedSlippage && computeSlippageAdjustedAmounts(v2Trade, allowedSlippage)

  // compare input balance to max input based on version
  const [balanceIn, amountIn] = [
    currencyBalances[Field.INPUT],
    slippageAdjustedAmounts ? slippageAdjustedAmounts[Field.INPUT] : null,
  ]

  if (balanceIn && amountIn && balanceIn.lessThan(amountIn)) {
    inputError = 'Insufficient ' + amountIn.currency.symbol + ' balance'
  }

  return {
    currencies,
    currencyBalances,
    parsedAmount,
    v2Trade: v2Trade ?? undefined,
    inputError,
  }
}

function parseCurrencyFromURLParameter(urlParam: any, chainId: ChainId): string {
  if (typeof urlParam === 'string') {
    const valid = isAddress(urlParam)
    if (valid) return valid
    if (urlParam.toUpperCase() === 'CUSD') return cUSD[chainId].address
    if (valid === false) return cUSD[chainId].address
  }
  return chainId === ChainId.ALFAJORES
    ? '0x2AaF20d89277BF024F463749045964D7e7d3A774'
    : '0x765DE816845861e75A25fCA122bb6898B8B1282a'
}

function parseTokenAmountURLParameter(urlParam: any): string {
  return typeof urlParam === 'string' && !isNaN(parseFloat(urlParam)) ? urlParam : ''
}

function parseIndependentFieldURLParameter(urlParam: any): Field {
  return typeof urlParam === 'string' && urlParam.toLowerCase() === 'output' ? Field.OUTPUT : Field.INPUT
}

const ENS_NAME_REGEX = /^[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)?$/
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/
function validatedRecipient(recipient: any): string | null {
  if (typeof recipient !== 'string') return null
  const address = isAddress(recipient)
  if (address) return address
  if (ENS_NAME_REGEX.test(recipient)) return recipient
  if (ADDRESS_REGEX.test(recipient)) return recipient
  return null
}

export function queryParametersToSwapState(parsedQs: ParsedQs, chainId: ChainId): SwapState {
  let inputCurrency = parseCurrencyFromURLParameter(parsedQs.inputCurrency, chainId)
  let outputCurrency = parseCurrencyFromURLParameter(parsedQs.outputCurrency, chainId)
  if (inputCurrency === outputCurrency) {
    if (typeof parsedQs.outputCurrency === 'string') {
      inputCurrency = ''
    } else {
      outputCurrency = ''
    }
  }

  const recipient = validatedRecipient(parsedQs.recipient)

  return {
    [Field.INPUT]: {
      currencyId: inputCurrency,
    },
    [Field.OUTPUT]: {
      currencyId: outputCurrency,
    },
    typedValue: parseTokenAmountURLParameter(parsedQs.exactAmount),
    independentField: parseIndependentFieldURLParameter(parsedQs.exactField),
    recipient,
  }
}

// updates the swap state to use the defaults for a given network
export function useDefaultsFromURLSearch():
  | { inputCurrencyId: string | undefined; outputCurrencyId: string | undefined }
  | undefined {
  const { chainId } = useActiveContractKit()
  const dispatch = useDispatch<AppDispatch>()
  const parsedQs = useParsedQueryString()
  const [result, setResult] = useState<
    { inputCurrencyId: string | undefined; outputCurrencyId: string | undefined } | undefined
  >()
  useEffect(() => {
    if (!chainId) return
    const parsed = queryParametersToSwapState(parsedQs, chainId)

    dispatch(
      replaceSwapState({
        typedValue: parsed.typedValue,
        field: parsed.independentField,
        inputCurrencyId: parsed[Field.INPUT].currencyId,
        outputCurrencyId: parsed[Field.OUTPUT].currencyId,
        recipient: parsed.recipient,
      })
    )

    setResult({ inputCurrencyId: parsed[Field.INPUT].currencyId, outputCurrencyId: parsed[Field.OUTPUT].currencyId })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, chainId])

  return result
}
