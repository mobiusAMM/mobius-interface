import { invariant } from '@apollo/client/utilities/globals'
import { IGauge, StablePools } from 'constants/pools'
import { useMobi } from 'hooks/Tokens'
import JSBI from 'jsbi'
import { Percent, TokenAmount } from 'lib/token-utils'
import { useSelector } from 'react-redux'

import { CHAIN } from '../../constants'
import { AppState } from '..'
import { IGaugeState, IUserGaugeState } from './reducer'

export function useGauges(): readonly (IGaugeState | null)[] {
  return useSelector<AppState, (IGaugeState | null)[]>((state) => state.gauges.gauges)
}

export function useUserGauges(): readonly (IUserGaugeState | null)[] {
  return useSelector<AppState, (IUserGaugeState | null)[]>((state) => state.gauges.gauges)
}

export type GaugeInfo = {
  isKilled: boolean
  lastClaim: Date
  weight: Percent
  futureWeight: Percent
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
          weight: new Percent(g.weight),
          futureWeight: new Percent(g.futureWeight),
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

export function useGaugeInfo(gauge: IGauge | undefined): GaugeInfo | undefined {
  const gauges = useGauges()

  if (!gauge) return undefined

  const gaugeInfo = gauges
    .filter((g, i) => !StablePools[CHAIN][i].gauge && (StablePools[CHAIN][i].gauge?.address === gauge.address ?? false))
    .map((g) =>
      !g
        ? null
        : {
            ...g,
            lastClaim: new Date(g.lastClaim),
            weight: new Percent(g.weight),
            futureWeight: new Percent(g.futureWeight),
          }
    )
  invariant(gaugeInfo.length === 1, 'duplicate gauges')
  invariant(!!gaugeInfo[0], 'gauge not found')
  return gaugeInfo[0]
}

export function useUserGaugeInfo(gauge: IGauge | undefined): UserGaugeInfo | undefined {
  const gauges = useUserGauges()
  const mobi = useMobi()

  if (!gauge) return undefined

  const gaugeInfo = gauges
    .filter(
      (ug, i) => !StablePools[CHAIN][i].gauge && (StablePools[CHAIN][i].gauge?.address === gauge.address ?? false)
    )
    .map((ug) =>
      !ug
        ? null
        : {
            ...ug,
            claimableMobi: new TokenAmount(mobi, ug.claimableMobi),
          }
    )
  invariant(gaugeInfo.length === 1, 'duplicate gauges')
  invariant(!!gaugeInfo[0], 'gauge not found')
  return gaugeInfo[0]
}
