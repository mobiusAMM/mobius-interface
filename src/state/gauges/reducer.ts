import { createReducer } from '@reduxjs/toolkit'
import { JSBI } from '@ubeswap/sdk'
import { IGauge, StablePools } from 'constants/pools'

import { CHAIN } from '../../constants'
import { updateGauges, updateGaugesUser } from './actions'

export interface Gauges {
  readonly gauges: ((IUserGaugeState & IGaugeState & IGauge) | null)[]
}

export interface IGaugeState {
  isKilled: boolean
  lastClaim: number
  weight: JSBI
  futureWeight: JSBI
  totalSupply: JSBI
  workingSupply: JSBI
  totalEffectiveBalance: JSBI
}

export interface IUserGaugeState {
  balance: JSBI
  claimableMobi: JSBI
  lastVote: number
  powerAllocated: number
  effectiveBalance: JSBI
}

const initialGaugeInfo: IGaugeState = {
  isKilled: false,
  lastClaim: 0,
  weight: JSBI.BigInt('0'),
  futureWeight: JSBI.BigInt('0'),
  totalSupply: JSBI.BigInt(0),
  workingSupply: JSBI.BigInt(0),
  totalEffectiveBalance: JSBI.BigInt(0),
}

const initialUserGaugeInfo: IUserGaugeState = {
  balance: JSBI.BigInt(0),
  claimableMobi: JSBI.BigInt(0),
  lastVote: 0,
  powerAllocated: 0,
  effectiveBalance: JSBI.BigInt(0),
}

function emptyExchangeInfo(gauge: IGauge | null): (IGaugeState & IUserGaugeState & IGauge) | null {
  return gauge === null
    ? null
    : {
        ...gauge,
        ...initialGaugeInfo,
        ...initialUserGaugeInfo,
      }
}

const initialState: Gauges = {
  gauges: StablePools[CHAIN].map((p) => emptyExchangeInfo(p.gauge)),
}

export default createReducer<Gauges>(initialState, (builder) =>
  builder
    .addCase(updateGauges, (state, { payload: { gaugeState } }) => {
      const r = state.gauges.map((g, i) => (g ? { ...g, ...gaugeState[i] } : null))
      return {
        gauges: r,
      }
    })
    .addCase(updateGaugesUser, (state, { payload: { userGaugeState } }) => {
      const r = state.gauges.map((g, i) => (g ? { ...g, ...userGaugeState[i] } : null))
      return {
        gauges: r,
      }
    })
)
