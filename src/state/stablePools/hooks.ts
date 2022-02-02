// To-Do: Implement Hooks to update Client-Side contract representation
import { JSBI, Percent, Token, TokenAmount } from '@ubeswap/sdk'
import { TokenList } from '@uniswap/token-lists'
import { Chain, Coins } from 'constants/StablePools'
import { useWeb3Context } from 'hooks'
import { useLiquidityGaugeContract, useStableSwapContract } from 'hooks/useContract'
import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useEthBtcPrice } from 'state/application/hooks'
import { useDefaultTokenList, WrappedTokenInfo } from 'state/lists/hooks'
import { useSingleContractMultipleData } from 'state/multicall/hooks'
import { tryParseAmount } from 'state/swap/hooks'

import { CHAIN } from '../../constants'
import WARNINGS from '../../constants/PoolWarnings.json'
import { StableSwapMath } from '../../utils/stableSwapMath'
import { AppState } from '..'
import { StableSwapConstants, StableSwapPool, WarningType } from './reducer'
import { BigIntToJSBI } from './updater'

export type WarningModifications = 'require-equal-deposit' | 'none'

export interface StablePoolInfo {
  readonly name: string
  readonly poolAddress?: string
  readonly stakingToken?: Token
  readonly lpToken?: Token
  readonly tokens: readonly Token[]
  readonly amountDeposited?: TokenAmount
  readonly totalDeposited: TokenAmount
  readonly apr?: TokenAmount
  readonly totalStakedAmount?: TokenAmount
  readonly workingSupply?: JSBI
  readonly stakedAmount: TokenAmount
  readonly totalVolume?: TokenAmount
  readonly peggedTo: string
  readonly displayDecimals: number
  readonly virtualPrice: JSBI
  readonly priceOfStaked: TokenAmount
  readonly balances: TokenAmount[]
  readonly pegComesAfter: boolean | undefined
  readonly mobiRate: JSBI | undefined
  readonly pendingMobi: JSBI | undefined
  readonly gaugeAddress?: string
  readonly workingPercentage: Percent
  readonly totalPercentage: Percent
  readonly externalRewardRates?: TokenAmount[]
  readonly lastClaim?: Date
  readonly meta?: string
  readonly displayChain: Chain
  readonly coin: Coins
  readonly isDisabled?: boolean
  readonly weeklyVolume?: TokenAmount
  readonly poolLoading: boolean
  readonly gaugeLoading: boolean
  readonly isKilled?: boolean
}

export function useCurrentPool(tok1: string, tok2: string): readonly [StableSwapPool | undefined] {
  const withMetaPools = useSelector<AppState, (StableSwapPool | StableSwapConstants)[]>((state) =>
    Object.values(state.stablePools.pools).map(({ pool }) => {
      if (!pool.metaPool || pool.disabled) return pool
      const underlying = state.stablePools.pools[pool.metaPool]?.pool
      return {
        ...pool,
        tokenAddresses: pool.tokenAddresses.concat(underlying.tokenAddresses),
      }
    })
  )
  const pools = withMetaPools.filter(({ tokenAddresses }) => {
    return tokenAddresses.includes(tok1) && tokenAddresses.includes(tok2)
  })

  return [pools.length > 0 ? pools[0] : null]
}

export function usePools(): readonly StableSwapPool[] {
  const pools = useSelector<AppState, StableSwapPool[]>((state) =>
    Object.values(state.stablePools.pools).map(({ pool }) => pool)
  )
  return pools
}

const tokenAmountScaled = (token: Token, amount: JSBI): TokenAmount =>
  new TokenAmount(token, JSBI.divide(amount, JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt(token.decimals))))

export const getPoolInfo = (
  pool: StableSwapPool,
  tokens: {
    [tokenAddress: string]: {
      token: WrappedTokenInfo
      list: TokenList
    }
  } = {}
): StablePoolInfo | Record<string, never> | undefined =>
  !pool.lpTotalSupply
    ? undefined
    : {
        name: pool.name,
        poolAddress: pool.address,
        lpToken: pool.lpToken,
        tokens: pool.tokens,
        amountDeposited: new TokenAmount(
          pool.lpToken,
          JSBI.add(pool.lpOwned ?? JSBI.BigInt('0'), pool.userStaked ?? JSBI.BigInt('0'))
        ),
        totalDeposited: new TokenAmount(pool.lpToken, pool.lpTotalSupply ?? JSBI.BigInt('0')),
        stakedAmount: new TokenAmount(pool.lpToken, pool.userStaked || JSBI.BigInt('0')),
        apr: new TokenAmount(pool.lpToken, JSBI.BigInt('100000000000000000')),
        peggedTo: pool.peggedTo,
        virtualPrice: pool.virtualPrice,
        priceOfStaked: tokenAmountScaled(
          pool.lpToken,
          JSBI.multiply(
            pool.virtualPrice ?? JSBI.BigInt('0'),
            JSBI.add(pool.lpOwned ?? JSBI.BigInt('0'), pool.userStaked ?? JSBI.BigInt('0'))
          )
        ),
        workingSupply: pool.workingLiquidity,
        balances: pool.tokens.map(
          (token, i) => new TokenAmount(token, pool.balances?.[i] ?? pool.approxBalances?.[i] ?? '0')
        ),
        pegComesAfter: pool.pegComesAfter,
        mobiRate: pool.isKilled ? JSBI.BigInt('0') : pool.totalMobiRate,
        pendingMobi: pool.pendingMobi,
        gaugeAddress: pool.gaugeAddress,
        displayDecimals: pool.displayDecimals,
        totalStakedAmount: new TokenAmount(pool.lpToken, pool.totalStakedAmount ?? '0'),
        workingPercentage: new Percent(pool.effectiveBalance, pool.totalEffectiveBalance),
        totalPercentage: new Percent(pool.userStaked ?? '0', pool.totalStakedAmount ?? '1'),
        externalRewardRates:
          pool.additionalRewardRate?.map(
            (rate, i) =>
              tokens[pool.additionalRewards?.[i]] &&
              new TokenAmount(tokens[pool.additionalRewards?.[i] ?? ''].token, rate)
          ) ?? undefined,
        lastClaim: pool.lastClaim,
        meta: pool.metaPool,
        displayChain: pool.displayChain,
        coin: pool.coin,
        isDisabled: pool.disabled,
        isKilled: pool.isKilled,
        weeklyVolume: pool.volume ? tryParseAmount(pool.volume.week.toFixed(6), pool.lpToken) : undefined,
        totalVolume: pool.volume ? tryParseAmount(pool.volume.total?.toFixed(6), pool.lpToken) : undefined,
        poolLoading: pool.loadingPool,
        gaugeLoading: pool.loadingGauge,
      }

export function useStablePoolInfoByName(name: string): StablePoolInfo | undefined {
  const pool = useSelector<AppState, StableSwapPool>((state) => state.stablePools.pools[name.toLowerCase()]?.pool)
  const tokens = useDefaultTokenList()[CHAIN]
  return !pool ? undefined : { ...getPoolInfo(pool, tokens) }
}

export function useStablePoolInfo(): readonly StablePoolInfo[] {
  const pools = usePools()
  const tokens = useDefaultTokenList()[CHAIN]
  return pools.map((pool) => getPoolInfo(pool, tokens)).filter((el) => el)
}

export function useExpectedTokens(pool: StablePoolInfo, lpAmount: TokenAmount): TokenAmount[] {
  const contract = useStableSwapContract(pool.poolAddress)
  const { tokens } = pool
  const { address } = useWeb3Context()
  const [expectedOut, setExpectedOut] = useState<TokenAmount[]>(
    tokens.map((token) => new TokenAmount(token, JSBI.BigInt('0')))
  )
  useEffect(() => {
    const updateData = async () => {
      try {
        const newTokenAmounts = await contract?.calculateRemoveLiquidity(address, lpAmount.raw.toString())
        setExpectedOut(tokens.map((token, i) => new TokenAmount(token, JSBI.BigInt(newTokenAmounts[i].toString()))))
      } catch (e) {
        console.error(e)
        setExpectedOut(tokens.map((token, i) => new TokenAmount(token, JSBI.BigInt('0'))))
      }
    }
    lpAmount && lpAmount.raw && updateData()
  }, [address, contract, lpAmount, tokens])
  return expectedOut
}

export function useExpectedLpTokens(
  pool: StablePoolInfo,
  tokens: Token[],
  input: (string | undefined)[],
  isDeposit = true
): [TokenAmount, TokenAmount[]] {
  const mathUtil = useMathUtil(pool.poolAddress ?? pool.address)
  const tokenAmounts = useMemo(
    () => tokens.map((t, i) => tryParseAmount(input[i], t) ?? new TokenAmount(t, '0')),
    [input]
  )

  return useMemo(() => {
    const allZero = tokenAmounts.reduce((accum, cur) => accum && cur.equalTo('0'), true)
    if (allZero) {
      return [new TokenAmount(pool.lpToken, '0'), tokenAmounts]
    }

    if (!pool.totalDeposited || pool.totalDeposited.equalTo('0')) {
      const amount =
        tryParseAmount(
          tokenAmounts.reduce((accum, cur) => (parseFloat(accum) + parseFloat(cur.toExact())).toString(), '0'),
          pool.lpToken
        ) ?? new TokenAmount(pool.lpToken, '0')

      return [amount, tokenAmounts]
    }
    const amount =
      mathUtil?.calculateTokenAmount(
        tokenAmounts.map((ta) => ta?.raw || JSBI.BigInt('0')),
        isDeposit
      ) ?? JSBI.BigInt('0')
    return [new TokenAmount(pool.lpToken, amount), tokenAmounts]
  }, [input, mathUtil, tokenAmounts])
}

export function useMathUtil(pool: StableSwapPool | string): StableSwapMath | undefined {
  const name = !pool ? '' : typeof pool == 'string' ? pool : pool.address
  const math = useSelector<AppState, StableSwapMath>((state) => state.stablePools.pools[name.toLowerCase()]?.math)
  return math
}

export function useUnderlyingPool(metaPoolName: string): StableSwapPool | undefined {
  const underlying = useSelector<AppState, StableSwapPool>((state) => {
    const meta = state.stablePools.pools[metaPoolName]?.pool
    if (!meta || !meta.metaPool) return meta
    return state.stablePools.pools[meta.metaPool]?.pool
  })
  return underlying
}

export function usePool(): readonly [StableSwapPool] {
  const [tok1, tok2] = useSelector<AppState, [string, string]>((state) => [
    state.swap.INPUT.currencyId,
    state.swap.OUTPUT.currencyId,
  ])
  return useCurrentPool(tok1, tok2)
}

export function usePriceOfLp(address: string, amountOfLp: TokenAmount): TokenAmount | undefined {
  const pool = useStablePoolInfoByName(address)
  const price = useEthBtcPrice(pool?.poolAddress ?? '')
  return pool && price && amountOfLp
    ? new TokenAmount(
        amountOfLp.token,
        JSBI.divide(
          JSBI.multiply(amountOfLp.raw, JSBI.multiply(pool?.virtualPrice, price)),
          JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('18'))
        )
      )
    : undefined
}

export function useExternalRewards({ address }: { address: string }): TokenAmount[] {
  const pool = useSelector<AppState, StableSwapPool>((state) => state.stablePools.pools[address.toLowerCase()]?.pool)
  const gauge = useLiquidityGaugeContract(pool?.gaugeAddress ?? undefined)
  const { address: userAddress, connected } = useWeb3Context()
  gauge?.claimable_reward_write
  const tokens = useDefaultTokenList()[CHAIN]
  const claimableTokens = useSingleContractMultipleData(
    gauge,
    'claimable_reward_write',
    pool?.additionalRewards?.map((token) => [connected ? userAddress : undefined, token ?? undefined]) ?? undefined
  )
  // console.log(claimableTokens)
  const externalRewards = claimableTokens?.map(
    (result, i) =>
      new TokenAmount(
        tokens[pool?.additionalRewards?.[i] ?? '']?.token,
        BigIntToJSBI(result?.result?.[0] ?? '0', '0') ?? '0'
      )
  )
  return externalRewards
}

export function useWarning(
  pool: string | undefined
): { warning: string; link?: string; modification?: WarningModifications } | undefined {
  const warningType = useSelector<AppState, WarningType | undefined>(
    (state) => state.stablePools.pools[pool?.toLowerCase() ?? '']?.pool?.warningType ?? undefined
  )
  if (!warningType) return undefined
  return WARNINGS[warningType] as any as { warning: string; link?: string; modification?: WarningModifications }
}
