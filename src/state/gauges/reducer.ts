import { createReducer } from '@reduxjs/toolkit'
import { JSBI, Percent } from '@ubeswap/sdk'
import { IGauge, StablePools } from 'constants/pools'

import { CHAIN } from '../../constants'
import { updateGauges, updateGaugesUser } from './actions'

export interface Gauges {
  readonly gauges: ((IUserGaugeInfo & IGaugeInfo & IGauge) | null)[]
}

export interface IGaugeInfo {
  isKilled: boolean
  lastClaim: Date
  weight: Percent
  futureWeight: Percent
  totalSupply: JSBI
  workingSupply: JSBI
}

export interface IUserGaugeInfo {
  balance: JSBI
  claimableMobi: JSBI
  lastVote: number
  powerAllocated: number
}

const initialGaugeInfo: IGaugeInfo = {
  isKilled: false,
  lastClaim: new Date(),
  weight: new Percent('0'),
  futureWeight: new Percent('0'),
  totalSupply: JSBI.BigInt(0),
  workingSupply: JSBI.BigInt(0),
}

const initialUserGaugeInfo: IUserGaugeInfo = {
  balance: JSBI.BigInt(0),
  claimableMobi: JSBI.BigInt(0),
  lastVote: 0,
  powerAllocated: 0,
}

function emptyExchangeInfo(gauge: IGauge | null): (IGaugeInfo & IUserGaugeInfo & IGauge) | null {
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
