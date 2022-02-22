import { JSBI } from '@ubeswap/sdk'
import { ExternalStakingRewards } from 'constants/staking'
import { useWeb3Context } from 'hooks'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from 'state'
import { useSingleCallResult } from 'state/multicall/hooks'

import { CHAIN } from '../../constants'
import {
  useGaugeControllerContract,
  useMobiContract,
  useStakingContract,
  useVotingEscrowContract,
} from '../../hooks/useContract'
import { updateStaking, updateStakingUser } from './actions'

// pools, general staking, general gauges, user staking, user gauges

export default function StakingUpdater() {
  const dispatch = useDispatch<AppDispatch>()
  const mobiContract = useMobiContract()
  const votingEscrow = useVotingEscrowContract()
  const controller = useGaugeControllerContract()
  const snxContract = useStakingContract(ExternalStakingRewards[CHAIN])
  const { address, connected } = useWeb3Context()

  const votingPower = useSingleCallResult(votingEscrow, 'balanceOf(address)', [connected ? address : undefined])
  const locked = useSingleCallResult(votingEscrow, 'locked', [connected ? address : undefined])
  const snxToClaim = useSingleCallResult(snxContract, 'earned(address)', [connected ? address : undefined])
  const allocatedPower = useSingleCallResult(controller, 'vote_user_power', [connected ? address : undefined])

  const totalVotingPower = useSingleCallResult(votingEscrow, 'totalSupply()')
  const totalWeight = useSingleCallResult(controller, 'get_total_weight')
  const totalMobiLocked = useSingleCallResult(mobiContract, 'balanceOf(address)', [votingEscrow?.address ?? undefined])
  const snxRewardRate = useSingleCallResult(snxContract, 'rewardRate()')
  useEffect(() => {
    connected &&
      dispatch(
        updateStakingUser({
          userStakingState: {
            voteUserPower: JSBI.BigInt(allocatedPower?.result?.[0] ?? '0'),
            votingPower: JSBI.BigInt(votingPower?.result?.[0] ?? '0'),
            claimableExternalRewards: JSBI.BigInt(snxToClaim?.result?.[0] ?? '0'),
            lock: {
              amount: JSBI.BigInt(locked?.result?.amount ?? '0'),
              end: parseInt(locked?.result?.end.toString()) * 1000, // Need unix in milliseconds
            },
          },
        })
      )
    dispatch(
      updateStaking({
        stakingState: {
          totalVotingPower: JSBI.BigInt(totalVotingPower?.result?.[0] ?? '0'),
          totalWeight: JSBI.BigInt(totalWeight?.result?.[0] ?? '0'),
          totalMobiLocked: JSBI.BigInt(totalMobiLocked?.result?.[0] ?? '0'),
          externalRewardsRate: JSBI.BigInt(snxRewardRate?.result?.[0] ?? '0'),
        },
      })
    )
  }, [
    allocatedPower?.result,
    connected,
    dispatch,
    locked?.result?.amount,
    locked?.result?.end,
    snxRewardRate?.result,
    snxToClaim?.result,
    totalMobiLocked?.result,
    totalVotingPower?.result,
    totalWeight?.result,
    votingPower?.result,
  ])

  return null
}
