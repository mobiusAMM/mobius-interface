import { ExternalRewardsToken } from 'constants/staking'
import JSBI from 'jsbi'
import { Percent, TokenAmount } from 'lib/token-utils'
import { useMobiPrice, useTokenPrice } from 'state/application/hooks'
import { useStakingState, useStakingStateCombined } from 'state/staking/hooks'
import { calcRates } from 'utils/calcRate'

import { CHAIN } from '../constants'

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
  const priceOfReward = useTokenPrice(ExternalRewardsToken[CHAIN].address)
  const priceOfMobi = useMobiPrice()
  const yearlyRate = JSBI.multiply(stakingState.externalRewardsRate, SECONDS_IN_YEAR)

  const avgApr =
    priceOfReward && priceOfMobi
      ? calcRates(priceOfReward?.multiply(yearlyRate), priceOfMobi?.multiply(stakingState.totalVotingPower)).apr ??
        new Percent('0')
      : new Percent('0')

  return {
    rewardRate: new TokenAmount(ExternalRewardsToken[CHAIN], stakingState.externalRewardsRate),
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
    userRewardRate: new TokenAmount(ExternalRewardsToken[CHAIN], userRateJSBI),
    claimableRewards: new TokenAmount(ExternalRewardsToken[CHAIN], stakingState.claimableExternalRewards),
  }
}
