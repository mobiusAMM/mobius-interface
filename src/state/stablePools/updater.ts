import { gql, useQuery } from '@apollo/client'
import { Interface } from '@ethersproject/abi'
import { JSBI, Percent } from '@ubeswap/sdk'
import { useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { useBlockNumber } from 'state/application/hooks'
import {
  useMultipleContractSingleData,
  useSingleCallResult,
  useSingleContractMultipleData,
} from 'state/multicall/hooks'

import { CHAIN } from '../../constants'
import GAUGE_V3 from '../../constants/abis/LiquidityGaugeV3.json'
import LP from '../../constants/abis/LPToken.json'
import SWAP from '../../constants/abis/Swap.json'
import { STATIC_POOL_INFO } from '../../constants/StablePools'
import { useWeb3Context } from '../../hooks'
import { useGaugeControllerContract, useMobiContract } from '../../hooks/useContract'
import { AppDispatch } from '../index'
import { updateGauges, updatePools } from './actions'
import { GaugeOnlyInfo, PoolOnlyInfo, StableSwapConstants } from './reducer'

const SECONDS_PER_BLOCK = JSBI.BigInt('5')
const SwapInterface = new Interface(SWAP.abi)
const lpInterface = new Interface(LP.abi)
const gaugeInterface = new Interface(GAUGE_V3.abi)

export const BigIntToJSBI = (num: BigInt | undefined, fallBack = '0') => {
  return JSBI.BigInt(num?.toString() ?? fallBack)
}

export function UpdateVariablePoolInfo(): null {
  const { connected, address } = useWeb3Context()
  const blockNumber = useBlockNumber()
  const dispatch = useDispatch<AppDispatch>()
  const pools: StableSwapConstants[] = STATIC_POOL_INFO[CHAIN] ?? []
  const poolAddresses = pools.map(({ address }) => address)
  const lpTokenAddresses = pools.map(({ lpToken: { address } }) => address)
  const lpTotalSupplies = useMultipleContractSingleData(lpTokenAddresses, lpInterface, 'totalSupply')
  const lpOwned_multiple = useMultipleContractSingleData(lpTokenAddresses, lpInterface, 'balanceOf', [
    connected ? address : undefined,
  ])
  const virtualPrices = useMultipleContractSingleData(poolAddresses, SwapInterface, 'getVirtualPrice')
  const balances = useMultipleContractSingleData(poolAddresses, SwapInterface, 'getBalances')

  const query = gql`
    {
      swaps {
        id
        A
        balances
        virtualPrice
        dailyVolumes(orderBy: timestamp, orderDirection: desc) {
          volume
        }
        weeklyVolumes(first: 2, orderBy: timestamp, orderDirection: desc) {
          volume
        }
      }
    }
  `
  const { data, loading, error } = useQuery(query)
  const lpInfo: { [address: string]: { total: JSBI; user: JSBI; virtualPrice: JSBI; balances: JSBI[] } } =
    lpTotalSupplies
      .filter((total, i) => !(total?.loading || lpOwned_multiple[i]?.loading))
      .map((total, i) => [
        BigIntToJSBI((total?.result?.[0] as BigInt) ?? '0'),
        BigIntToJSBI((lpOwned_multiple?.[i]?.result?.[0] as BigInt) ?? '0'),
        BigIntToJSBI((virtualPrices?.[i]?.result?.[0] as BigInt) ?? '0'),
        balances?.[i]?.result?.[0]
          ? balances?.[i]?.result?.[0].map((amt: BigInt): JSBI => BigIntToJSBI(amt))
          : undefined,
        poolAddresses[i],
      ])
      .reduce(
        (accum, [total, user, virtualPrice, balances, address]) => ({
          ...accum,
          [(address as any as string).toLowerCase()]: { total, user, balances, virtualPrice },
        }),
        {}
      )
  const inSubgraph: Set<string> =
    data?.swaps.reduce((accum: Set<string>, cur: any) => new Set([...accum, cur.id]), new Set()) ?? new Set()
  const poolsNotInSubgraph = poolAddresses.map((a) => a.toLowerCase()).filter((addr) => !inSubgraph.has(addr))
  return useMemo(() => {
    if (error) console.log(error)
    if (loading) return null
    const poolInfo: PoolOnlyInfo[] = data.swaps
      .filter(({ id }) => !!lpInfo[id])
      .map((pool) => ({
        id: pool.id,
        volume: {
          total: pool.dailyVolumes.reduce((accum: number, el: string) => accum + parseFloat(el.volume), 0),
          day: parseFloat(pool.dailyVolumes[0]?.volume ?? '0'),
          week: parseFloat(pool.weeklyVolumes[0]?.volume ?? '0'),
        },
        approxBalances: pool.balances.map((b: string) => JSBI.BigInt(b)),
        balances: lpInfo[pool.id].total ? lpInfo[pool.id].balances : undefined,
        amp: JSBI.BigInt(pool.A),
        aPrecise: JSBI.BigInt(parseInt(pool.A) * 100),
        virtualPrice: lpInfo[pool.id].virtualPrice,
        lpTotalSupply: lpInfo[pool.id].total,
        lpOwned: lpInfo[pool.id].user,
        loadingPool: !lpInfo[pool.id].total,
      }))

    dispatch(
      updatePools({
        info:
          poolsNotInSubgraph.length > 0
            ? poolInfo.concat(
                poolsNotInSubgraph.map((id) => ({
                  id,
                  volume: undefined,
                  balances: lpInfo[id]?.total ? lpInfo[id].balances : undefined,
                  amp: JSBI.BigInt(50),
                  aPrecise: JSBI.BigInt(50 * 100),
                  virtualPrice: lpInfo[id]?.virtualPrice,
                  lpTotalSupply: lpInfo[id]?.total ?? JSBI.BigInt('1'),
                  lpOwned: lpInfo[id]?.user ?? JSBI.BigInt('0'),
                  loadingPool: !lpInfo[id]?.total,
                }))
              )
            : poolInfo,
      })
    )
    return null
  }, [data, loading, error, dispatch, blockNumber, lpInfo])
}

export function BatchUpdateGauges(): null {
  const { address, connected } = useWeb3Context()
  const blockNumber = useBlockNumber()
  const dispatch = useDispatch<AppDispatch>()
  const pools: StableSwapConstants[] = STATIC_POOL_INFO[CHAIN] ?? []
  const gaugeAddresses = pools.map(({ gaugeAddress }) => gaugeAddress)
  const gaugeController = useGaugeControllerContract()
  const mobiContract = useMobiContract()

  const totalStakedAmount_multi = useMultipleContractSingleData(gaugeAddresses, gaugeInterface, 'totalSupply')
  const lpStaked_multi = useMultipleContractSingleData(gaugeAddresses, gaugeInterface, 'balanceOf', [
    connected ? address : undefined,
  ])
  const workingLiquidityMulti = useMultipleContractSingleData(gaugeAddresses, gaugeInterface, 'working_supply')
  const pendingMobi_multi = useMultipleContractSingleData(gaugeAddresses, gaugeInterface, 'claimable_tokens', [
    connected ? address : undefined,
  ])
  const mobiRate: JSBI = BigIntToJSBI(useSingleCallResult(mobiContract, 'rate')?.result?.[0] ?? '0')
  const weights = useSingleContractMultipleData(
    gaugeController,
    'gauge_relative_weight(address)',
    gaugeAddresses.map((a) => [a ?? undefined])
  )
  const futureWeights = useSingleContractMultipleData(
    gaugeController,
    'get_gauge_weight',
    gaugeAddresses.map((a) => [a ?? undefined])
  )

  const lastClaims = useMultipleContractSingleData(gaugeAddresses, gaugeInterface, 'last_claim')

  const effectiveBalances = useMultipleContractSingleData(gaugeAddresses, gaugeInterface, 'working_balances', [
    connected ? address : undefined,
  ])
  const totalEffectiveBalances = useMultipleContractSingleData(gaugeAddresses, gaugeInterface, 'working_supply')
  const lastUserVotes = useSingleContractMultipleData(
    gaugeController,
    'last_user_vote',
    gaugeAddresses.map((a) => [connected ? address : a, a])
  )
  // vote_user_slopes
  const slopes = useSingleContractMultipleData(
    gaugeController,
    'vote_user_slopes',
    gaugeAddresses.map((a) => [connected ? address : a, a])
  )

  useMemo(() => {
    dispatch(
      updateGauges({
        info: pools
          .filter((_, i) => !(totalStakedAmount_multi?.[i]?.loading ?? true))
          .map((poolInfo, i) => {
            const effectiveBalance: JSBI = BigIntToJSBI((effectiveBalances?.[i]?.result?.[0] as BigInt) ?? '0')
            const totalEffectiveBalance: JSBI = BigIntToJSBI(
              (totalEffectiveBalances?.[i]?.result?.[0] as BigInt) ?? '1'
            )
            const lpStaked: JSBI = BigIntToJSBI((lpStaked_multi?.[i]?.result?.[0] as BigInt) ?? '0')
            const pendingMobi: JSBI = BigIntToJSBI((pendingMobi_multi?.[i]?.result?.[0] as BigInt) ?? '0')
            const weight: JSBI = BigIntToJSBI((weights?.[i]?.result?.[0] as BigInt) ?? '0')
            const futureWeight: JSBI = BigIntToJSBI((futureWeights?.[i]?.result?.[0] as BigInt) ?? '0')
            const totalStakedAmount: JSBI = BigIntToJSBI((totalStakedAmount_multi?.[i]?.result?.[0] as BigInt) ?? '0')
            const workingLiquidity: JSBI = BigIntToJSBI((workingLiquidityMulti?.[i]?.result?.[0] as BigInt) ?? '0')
            const lastUserVote: number = parseInt((lastUserVotes?.[i]?.result?.[0] ?? BigInt('0')).toString() ?? '0')
            const lastClaim: Date = new Date(
              parseInt((lastClaims?.[i]?.result?.[0] ?? BigInt('0')).toString() ?? '0') * 1000
            )
            const powerAllocated: number = parseInt((slopes?.[i]?.result?.[1] ?? BigInt('0')).toString() ?? '0')

            const totalMobiRate = JSBI.divide(
              poolInfo.disabled ? JSBI.BigInt('0') : JSBI.multiply(mobiRate, weight),
              JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('18'))
            )

            const collectedData: GaugeOnlyInfo = {
              id: poolInfo.address.toLowerCase(),
              poolWeight: new Percent(weight, JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('18'))),
              userStaked: lpStaked,
              pendingMobi,
              totalMobiRate,
              totalStakedAmount,
              workingLiquidity,
              effectiveBalance,
              totalEffectiveBalance,
              lastUserVote,
              futureWeight,
              lastClaim,
              powerAllocated: powerAllocated / 100,
            }
            return collectedData
          }),
      })
    )
  }, [blockNumber, dispatch])
  return null
}
