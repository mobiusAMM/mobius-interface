import { JSBI, Percent, TokenAmount } from '@ubeswap/sdk'
import { calcApy } from 'components/earn/StablePoolCard'
import { CELO } from 'constants/tokens'
import { useTokenPrice } from 'state/application/hooks'
import { useStakingState, useStakingStateCombined } from 'state/staking/hooks'

import { CHAIN } from '../constants'
import { useMobi } from './Tokens'

const SECONDS_IN_YEAR = JSBI.BigInt(365 * 24 * 60 * 60)
const SECONDS_IN_WEEK = JSBI.BigInt(7 * 24 * 60 * 60)

export type ExternalRewardInfo = {
  rewardRate: TokenAmount
  avgApr: Percent
}

export type ExternalUserRewardInfo = {
  userRewardRate: TokenAmount
  claimableRewards: TokenAmount
}

export function useExternalStakingRewards(): ExternalRewardInfo {
  const stakingState = useStakingState()
  const mobi = useMobi()
  const priceOfReward = useTokenPrice(CELO[CHAIN].address)
  const priceOfMobi = useTokenPrice(mobi?.address)
  const yearlyRate = JSBI.multiply(stakingState.externalRewardsRate, SECONDS_IN_YEAR)

  const avgApr =
    priceOfReward && priceOfMobi
      ? calcApy(priceOfReward?.multiply(yearlyRate), priceOfMobi?.multiply(stakingState.totalVotingPower))[1] ??
        new Percent('0')
      : new Percent('0')

  return {
    rewardRate: new TokenAmount(CELO[CHAIN], stakingState.externalRewardsRate),
    avgApr,
  }
}

export function useUserExternalStakingRewards(): ExternalUserRewardInfo {
  const stakingState = useStakingStateCombined()
  const userRateJSBI = JSBI.divide(
    JSBI.multiply(SECONDS_IN_WEEK, JSBI.multiply(stakingState.externalRewardsRate, stakingState.votingPower)),
    stakingState.totalVotingPower
  )

  return {
    userRewardRate: new TokenAmount(CELO[CHAIN], userRateJSBI),
    claimableRewards: new TokenAmount(CELO[CHAIN], stakingState.claimableExternalRewards),
  }
}
