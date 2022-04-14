import { invariant } from '@apollo/client/utilities/globals'
import { IGauge, StablePools } from 'constants/pools'
import { useWeb3Context } from 'hooks'
import { useMobi } from 'hooks/Tokens'
import { useLiquidityGaugeContract } from 'hooks/useContract'
import JSBI from 'jsbi'
import { Percent, TokenAmount } from 'lib/token-utils'
import { useSelector } from 'react-redux'
import { useSingleContractMultipleData } from 'state/multicall/hooks'

import { CHAIN, ZERO_ADDRESS } from '../../constants'
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
    .filter(
      (g, i) =>
        StablePools[CHAIN][i].gauge && (StablePools[CHAIN][i].gauge?.address === gauge.address.toLowerCase() ?? false)
    )
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
      (ug, i) =>
        StablePools[CHAIN][i].gauge && (StablePools[CHAIN][i].gauge?.address === gauge.address.toLowerCase() ?? false)
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

export function useExternalRewards(gauge: IGauge | undefined | null): TokenAmount[] | undefined {
  const gaugeContract = useLiquidityGaugeContract(gauge?.address ?? ZERO_ADDRESS)
  const { address: userAddress, connected } = useWeb3Context()

  const claimableTokens = useSingleContractMultipleData(
    gaugeContract,
    'claimable_reward_write',
    gauge?.additionalRewards.map((token) => [
      connected ? userAddress : ZERO_ADDRESS,
      token.token.address ?? ZERO_ADDRESS,
    ]) ?? []
  )

  if (!gauge) return undefined

  return claimableTokens?.map((result, i) => {
    return new TokenAmount(gauge.additionalRewards[i].token, JSBI.BigInt(result.result?.[0] ?? '0'))
  })
}
