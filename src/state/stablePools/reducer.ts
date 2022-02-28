import { createReducer, current } from '@reduxjs/toolkit'
import { NETWORK_CHAIN_ID } from 'connectors'
import { Chain, Coins, STATIC_POOL_INFO } from 'constants/StablePools'
import JSBI from 'jsbi'
import { Fraction, Percent, Token } from 'lib/token-utils'
import { PairStableSwap } from 'utils/StablePairMath'
import { StableSwapMath } from 'utils/stableSwapMath'

import { updateExternalRewards, updateGauges, updatePools } from './actions'

const ZERO = JSBI.BigInt('0')
export enum WarningType {
  POOF = 'poof',
}

export type ExternalRewards = {
  token: string
  unclaimed: JSBI
}

export type PoolOnlyInfo = {
  id: string
  volume: {
    total: number
    day: number
    week: number
  }
  approxBalances: JSBI[]
  balances: JSBI[]
  amp: JSBI
  virtualPrice: JSBI
  aPrecise: JSBI
  lpTotalSupply: JSBI
  lpOwned: JSBI
  loadingPool: boolean
}

export type GaugeOnlyInfo = {
  id: string
  userStaked: JSBI
  totalStakedAmount: JSBI
  totalMobiRate: JSBI
  pendingMobi: JSBI
  workingLiquidity: JSBI
  poolWeight: Percent
  effectiveBalance: JSBI
  totalEffectiveBalance: JSBI
  lastUserVote: number
  powerAllocated: number
  futureWeight: JSBI
  externalRewards?: ExternalRewards[]
  gaugeAddress?: string
  relativeGaugeWeight?: Fraction
  lastClaim: Date
}

export type StableSwapVariable = PoolOnlyInfo & GaugeOnlyInfo

export type StableSwapMathConstants = {
  name: string
  rates: JSBI[]
  lendingPrecision: JSBI
  precision: JSBI
  feeDenominator: JSBI
  precisionMul: JSBI[]
  feeIndex: number
  decimals: JSBI[]
  swapFee: JSBI
}

export type StableSwapConstants = StableSwapMathConstants & {
  tokens: Token[]
  tokenAddresses: string[]
  address: string
  gaugeAddress: string
  lpToken: Token
  peggedTo: string
  pegComesAfter: boolean | undefined
  displayDecimals: number
  additionalRewards?: string[]
  additionalRewardRate?: string[]
  lastClaim?: Date
  displayChain: Chain
  coin: Coins
  disabled?: boolean
  metaPool?: string
  isKilled?: boolean
  warningType?: WarningType
}

export type StableSwapPool = StableSwapConstants & StableSwapVariable
export interface PoolState {
  readonly pools: {
    [address: string]: {
      rehydrate?: boolean
      pool: StableSwapPool | StableSwapConstants
      math: StableSwapMath | undefined
      pair?: PairStableSwap | undefined
    }
  }
}

const initialState: PoolState = {
  pools: Object.values(STATIC_POOL_INFO[NETWORK_CHAIN_ID]).reduce(
    (
      accum: {
        [address: string]: {
          pool: StableSwapConstants
          math: StableSwapMath | undefined
        }
      },
      cur: StableSwapConstants
    ) => ({
      ...accum,
      [cur.address.toLowerCase()]: {
        pool: {
          ...cur,
          rehydrate: true,
          balances: Array(cur.tokenAddresses.length).fill(ZERO),
          userStaked: ZERO,
          totalStakedAmount: ZERO,
          totalMobiRate: ZERO,
          pendingMobi: ZERO,
          workingLiquidity: ZERO,
          virtualPrice: ZERO,
          poolWeight: new Percent('0', '1'),
          effectiveBalance: ZERO,
          totalEffectiveBalance: ZERO,
          futureWeight: ZERO,
          lpTotalSupply: ZERO,
          lpOwned: ZERO,
          loadingGauge: true,
          loadingPool: true,
          volume: {
            day: 0,
            week: 0,
          },
        },
        math: undefined,
      },
    }),
    {}
  ),
}

export default createReducer<PoolState>(initialState, (builder) =>
  builder
    .addCase(updateExternalRewards, (state, { payload: { pool, externalRewards } }) => {
      if (!state.pools[pool].math) return
      state.pools[pool].pool.externalRewards = externalRewards
    })
    .addCase(updatePools, (state, { payload: { info } }) => {
      const copiedState = current(state)
      info.forEach((pool) => {
        const cur = copiedState.pools[pool.id].pool as any as StableSwapPool
        const newPool = { ...cur, ...pool }
        const { balances, aPrecise, swapFee, tokens } = newPool
        // console.log(
        //   balances?.map((el) => el.toString()) ?? ['0', '0'],
        //   swapFee?.toString() ?? '0',
        //   aPrecise?.toString() ?? '0'
        // )
        const math = new StableSwapMath(newPool)
        const pair =
          balances && aPrecise && swapFee
            ? new PairStableSwap(
                balances?.map((el) => el.toString()) ?? ['0', '0'],
                swapFee?.toString() ?? '0',
                aPrecise?.toString() ?? '0',
                tokens.map((t) => t.decimals)
              )
            : undefined

        state.pools[pool.id] = {
          pool: newPool,
          math,
          pair,
        }
      })
    })
    .addCase(updateGauges, (state, { payload: { info } }) => {
      const copiedState = current(state)
      info.forEach((gauge) => {
        const cur = copiedState.pools[gauge.id].pool as any as StableSwapPool
        const newPool = { ...cur, ...gauge, loadingGauge: false }
        state.pools[gauge.id] = {
          pool: newPool,
          math: state.pools[gauge.id].math,
        }
      })
    })
)
