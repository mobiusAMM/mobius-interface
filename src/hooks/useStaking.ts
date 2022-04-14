import { useUserStakingInfo } from 'state/staking/hooks'

export function useVotePowerLeft(): number {
  const userStakingInfo = useUserStakingInfo()
  return (10000 - userStakingInfo.voteUserPower) / 100
}
