import { JSBI, TokenAmount } from '@ubeswap/sdk'
import { IGauge } from 'constants/pools'
import { useMobi } from 'hooks/Tokens'
import { useSelector } from 'react-redux'

import { AppState } from '..'
import { IGaugeState, IUserGaugeState } from './reducer'

export function useGauges(): readonly ((IGaugeState & IGauge) | null)[] {
  return useSelector<AppState, ((IGaugeState & IGauge) | null)[]>((state) => state.gauges.gauges)
}

export function useUserGauges(): readonly ((IUserGaugeState & IGauge) | null)[] {
  return useSelector<AppState, ((IUserGaugeState & IGauge) | null)[]>((state) => state.gauges.gauges)
}

export type GaugeInfo = {
  isKilled: boolean
  lastClaim: Date
  weight: number
  futureWeight: number
  totalSupply: JSBI
  workingSupply: JSBI
  totalEffectiveBalance: JSBI
}

export type UserGaugeInfo = {
  balance: JSBI
  claimableMobi: TokenAmount
  lastVote: number
  powerAllocated: number
  effectiveBalance: JSBI
}

export function useAllGaugesInfo(): (GaugeInfo | null)[] {
  const gauges = useGauges()

  return gauges.map((g) =>
    !g
      ? null
      : {
          ...g,
          lastClaim: new Date(g.lastClaim),
          weight: g.lastClaim.valueOf(),
          futureWeight: g.lastClaim.valueOf(),
        }
  )
}

export function useAllUserGaugesInfo(): (UserGaugeInfo | null)[] {
  const userGauges = useUserGauges()

  const mobi = useMobi()

  return userGauges.map((ug) =>
    !ug
      ? null
      : {
          ...ug,
          claimableMobi: new TokenAmount(mobi, ug.claimableMobi),
        }
  )
}

// get all user gauges
// get one gauge by IGauge
// get one user gauge by IGauge
