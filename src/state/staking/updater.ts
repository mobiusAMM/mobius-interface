import { JSBI } from '@ubeswap/sdk'
import { useWeb3Context } from 'hooks'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, AppState } from 'state'
import { useSingleCallResult } from 'state/multicall/hooks'

import {
  useGaugeControllerContract,
  useMobiContract,
  useStakingContract,
  useVotingEscrowContract,
} from '../../hooks/useContract'
import { updateSNX, updateStaking } from './actions'

export default function StakingUpdater() {
  const snxAddress: string = useSelector((state: AppState) => state.staking.snx.address)
  const dispatch = useDispatch<AppDispatch>()
  const mobiContract = useMobiContract()
  const votingEscrow = useVotingEscrowContract()
  const controller = useGaugeControllerContract()
  const snxContract = useStakingContract(snxAddress)
  const { address, connected } = useWeb3Context()

  const votingPower = useSingleCallResult(votingEscrow, 'balanceOf(address)', [connected ? address : undefined])
  const totalVotingPower = useSingleCallResult(votingEscrow, 'totalSupply()')
  const totalMobiLocked = useSingleCallResult(mobiContract, 'balanceOf(address)', [votingEscrow?.address ?? undefined])
  const locked = useSingleCallResult(votingEscrow, 'locked', [connected ? address : undefined])
  const allocatedPower = useSingleCallResult(controller, 'vote_user_power', [connected ? address : undefined])
  const totalWeight = useSingleCallResult(controller, 'get_total_weight')
  const snxRewardRate = useSingleCallResult(snxContract, 'rewardRate()')
  const snxToClaim = useSingleCallResult(snxContract, 'earned(address)', [connected ? address : undefined])
  dispatch(
    updateSNX({
      rewardRate: snxRewardRate?.result ? JSBI.BigInt(snxRewardRate?.result?.[0] ?? '0') : undefined,
      leftToClaim: snxToClaim?.result ? JSBI.BigInt(snxToClaim?.result?.[0] ?? '0') : undefined,
    })
  )
  dispatch(
    updateStaking({
      stakingInfo: {
        votingPower: JSBI.BigInt(votingPower?.result?.[0] ?? '0'),
        totalVotingPower: JSBI.BigInt(totalVotingPower?.result?.[0] ?? '0'),
        locked: {
          amount: JSBI.BigInt(locked?.result?.amount ?? '0'),
          end: parseInt(locked?.result?.end.toString()) * 1000, // Need unix in milliseconds
        },
        voteUserPower: JSBI.BigInt(allocatedPower?.result?.[0] ?? '0'),
        totalWeight: JSBI.BigInt(totalWeight?.result?.[0] ?? '0'),
        totalMobiLocked: JSBI.BigInt(totalMobiLocked?.result?.[0] ?? '0'),
      },
    })
  )
  return null
}
