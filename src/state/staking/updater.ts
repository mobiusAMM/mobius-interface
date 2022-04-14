import { ExternalStakingRewards } from 'constants/staking'
import { VEMOBI } from 'constants/tokens'
import { useWeb3Context } from 'hooks'
import { roundDate } from 'pages/Staking/Lock/Lock'
import { useDispatch } from 'react-redux'
import { AppDispatch } from 'state'
import { useSingleCallResult } from 'state/multicall/hooks'

import { CHAIN, SECONDS_IN_WEEK } from '../../constants'
import {
  useFeeDistributor,
  useGaugeControllerContract,
  useMobiContract,
  useStakingContract,
  useVotingEscrowContract,
} from '../../hooks/useContract'

export default function StakingUpdater() {
  const dispatch = useDispatch<AppDispatch>()
  const mobiContract = useMobiContract()
  const votingEscrow = useVotingEscrowContract()
  const controller = useGaugeControllerContract()
  const snxContract = useStakingContract(ExternalStakingRewards[CHAIN])
  const feeDistributorContract = useFeeDistributor()
  const { address, connected } = useWeb3Context()

  const votingPower = useSingleCallResult(votingEscrow, 'balanceOf(address)', [connected ? address : undefined])
  const locked = useSingleCallResult(votingEscrow, 'locked', [connected ? address : undefined])
  const snxToClaim = useSingleCallResult(snxContract, 'earned(address)', [connected ? address : undefined])
  const allocatedPower = useSingleCallResult(controller, 'vote_user_power', [connected ? address : undefined])

  const totalVotingPower = useSingleCallResult(votingEscrow, 'totalSupply()')
  const totalWeight = useSingleCallResult(controller, 'get_total_weight')
  const totalMobiLocked = useSingleCallResult(mobiContract, 'balanceOf(address)', [VEMOBI[CHAIN].address])
  const snxRewardRate = useSingleCallResult(snxContract, 'rewardRate()')
  const mobiRate = useSingleCallResult(mobiContract, 'rate')

  const feesToClaim = useSingleCallResult(feeDistributorContract, 'claim()')
  const totalFeesNextWeek = useSingleCallResult(feeDistributorContract, 'tokens_per_week', [
    (roundDate(Date.now()).valueOf() / 1000).toFixed(0),
  ])
  const totalFeesThisWeek = useSingleCallResult(feeDistributorContract, 'tokens_per_week', [
    (roundDate(Date.now()).valueOf() / 1000 - SECONDS_IN_WEEK).toFixed(0),
  ])
  // useEffect(() => {
  //   console.log('staking update')
  //   connected &&
  //     dispatch(
  //       updateStakingUser({
  //         userStakingState: {
  //           voteUserPower: JSBI.BigInt(allocatedPower?.result?.[0] ?? '0'),
  //           votingPower: JSBI.BigInt(votingPower?.result?.[0] ?? '0'),
  //           claimableExternalRewards: JSBI.BigInt(snxToClaim?.result?.[0] ?? '0'),
  //           claimableFees: JSBI.BigInt(feesToClaim?.result?.[0] ?? '0'),
  //           lock: {
  //             amount: JSBI.BigInt(locked?.result?.amount ?? '0'),
  //             end: parseInt(locked?.result?.end.toString()) * 1000, // Need unix in milliseconds
  //           },
  //         },
  //       })
  //     )
  //   dispatch(
  //     updateStaking({
  //       stakingState: {
  //         totalVotingPower: JSBI.BigInt(totalVotingPower?.result?.[0] ?? '0'),
  //         totalWeight: JSBI.BigInt(totalWeight?.result?.[0] ?? '0'),
  //         totalMobiLocked: JSBI.BigInt(totalMobiLocked?.result?.[0] ?? '0'),
  //         externalRewardsRate: JSBI.BigInt(snxRewardRate?.result?.[0] ?? '0'),
  //         feesThisWeek: JSBI.BigInt(totalFeesThisWeek?.result?.[0] ?? '0'),
  //         feesNextWeek: JSBI.BigInt(totalFeesNextWeek?.result?.[0] ?? '0'),
  //         mobiRate: JSBI.BigInt(mobiRate?.result?.[0] ?? '0'),
  //       },
  //     })
  //   )
  // }, [
  //   allocatedPower?.result,
  //   connected,
  //   dispatch,
  //   feesToClaim?.result,
  //   locked?.result?.amount,
  //   locked?.result?.end,
  //   mobiRate?.result,
  //   snxRewardRate?.result,
  //   snxToClaim?.result,
  //   totalFeesNextWeek?.result,
  //   totalFeesThisWeek?.result,
  //   totalMobiLocked?.result,
  //   totalVotingPower?.result,
  //   totalWeight?.result,
  //   votingPower?.result,
  // ])

  return null
}
