// To-Do: Implement Hooks to update Client-Side contract representation
import { ChainId, JSBI, Price, Token, TokenAmount } from '@ubeswap/sdk'
import { ConstantSum, ConstantSumInfo } from 'constants/ConstantSum'
import { useSelector } from 'react-redux'
import { tryParseAmount } from 'state/swap/hooks'

import { CHAIN } from '../../constants'
import { AppState } from '..'
import { ConstantSumPool } from './reducer'

const ZERO = JSBI.BigInt('0')
export interface MentoPoolInfo {
  readonly poolAddress?: string
  readonly tokens: readonly Token[]
  readonly balances: TokenAmount[]
}

export function useCurrentOpenPool(tok1: string, tok2: string): ConstantSumPool | null {
  const pools = useSelector<AppState, ConstantSumPool[]>((state) =>
    state.openSum.pools.filter((pool) => {
      const tokenAddresses = pool.tokens.map((x) => x.address)
      return tokenAddresses.includes(tok1) && tokenAddresses.includes(tok2)
    })
  )
  return pools.length > 0 ? pools[0] : null
}

export function useOpenPools(): readonly ConstantSumPool[] {
  const pools = useSelector<AppState, ConstantSumPool[]>((state) => state.openSum.pools)
  return pools
}

export function useOpenSumTokenPair(inputToken: string): { [address: string]: Token } {
  const tradeableTokens = ConstantSum[CHAIN]?.filter(
    ({ tokens }) => tokens[0].address === inputToken || tokens[1].address === inputToken
  ).reduce(
    (accum: { [address: string]: Token }, { tokens }: ConstantSumInfo) => ({
      ...accum,
      [tokens[0].address]: tokens[0],
      [tokens[1].address]: tokens[1],
    }),
    {}
  )
  if (tradeableTokens && tradeableTokens[inputToken]) delete tradeableTokens[inputToken]
  return tradeableTokens ?? {}
}

export function useOpenSumTradeableTokens(): { [address: string]: Token } {
  const openSumTokens = ConstantSum[CHAIN]?.reduce(
    (accum: { [address: string]: Token }, { tokens }: ConstantSumInfo) => ({
      ...accum,
      [tokens[0].address]: tokens[0],
      [tokens[1].address]: tokens[1],
    }),
    {}
  )
  return openSumTokens ?? {}
}

export function useOpenSumTrade(
  tokenIdIn: string,
  tokenIdOut: string,
  input: string | undefined
): {
  input?: TokenAmount
  poolAddress?: string
  output?: TokenAmount
  error?: string
  executionPrice?: Price
  fee?: TokenAmount
} {
  const pool = useCurrentOpenPool(tokenIdIn, tokenIdOut)

  if (!pool)
    return {
      error: 'Select a token',
    }

  const { tokens, balances } = pool
  const tokenInIndex = tokens[0].address == tokenIdIn ? 0 : 1
  const tokenOutIndex = tokens[0].address == tokenIdOut ? 0 : 1
  const tokenIn = tokens[tokenInIndex]
  const tokenOut = tokens[tokenOutIndex]

  const inputAmount = tryParseAmount(input, tokenIn)

  let error = ''

  if (!balances) {
    error = 'Pool Balances Loading'
  }

  if (!inputAmount && !error) {
    error = 'Input an Amount'
  }

  const expectedOut = tryParseAmount(input, tokenOut)
  if (JSBI.greaterThan(expectedOut?.raw ?? ZERO, balances?.[tokenOutIndex] ?? ZERO)) {
    error = 'Insufficient Liquidity'
  }

  if (error)
    return {
      error,
    }
  return {
    output: expectedOut,
    input: inputAmount,
    poolAddress: pool.address,
    executionPrice: new Price(tokenIn, tokenOut, '1', '1'),
    fee: new TokenAmount(tokenIn, 0),
  }
}

export function useOpticsV1Tokens(): { [address: string]: Token } {
  const openSumTokens = ConstantSum[CHAIN]?.reduce(
    (accum: { [address: string]: Token }, { tokens }: ConstantSumInfo) => ({
      ...accum,
      [tokens[0].address]: tokens[0],
    }),
    {}
  )
  return openSumTokens ?? {}
}

export function useOpticsV2Tokens(): { [address: string]: Token } {
  const openSumTokens = ConstantSum[CHAIN]?.reduce(
    (accum: { [address: string]: Token }, { tokens }: ConstantSumInfo) => ({
      ...accum,
      [tokens[1].address]: tokens[1],
    }),
    {}
  )
  return openSumTokens ?? {}
}

export function getPairedToken(selectedTokenAddress: string, chainId: ChainId): Token | undefined {
  const pool =
    ConstantSum[chainId]?.filter(
      ({ tokens }) => tokens[0].address === selectedTokenAddress || tokens[1].address === selectedTokenAddress
    )?.[0] ?? undefined

  return !pool ? undefined : pool.tokens[0].address == selectedTokenAddress ? pool.tokens[1] : pool.tokens[0]
}
