import { createReducer } from '@reduxjs/toolkit'
import JSBI from 'jsbi'

import { updateStaking, updateStakingUser } from './actions'

export type VoteLock = {
  amount: JSBI
  end: number // UNIX time stamp
}

export type IStakingState = {
  totalWeight: JSBI
  totalMobiLocked: JSBI
  totalVotingPower: JSBI
  externalRewardsRate: JSBI
  feesThisWeek: JSBI
  feesNextWeek: JSBI
  mobiRate: JSBI
}

export type IUserStakingState = {
  voteUserPower: JSBI
  votingPower: JSBI
  claimableExternalRewards: JSBI
  claimableFees: JSBI
  lock: VoteLock
}

const initialStakingState: IStakingState = {
  totalWeight: JSBI.BigInt(0),
  totalMobiLocked: JSBI.BigInt(1),
  totalVotingPower: JSBI.BigInt(0),
  externalRewardsRate: JSBI.BigInt(0),
  feesThisWeek: JSBI.BigInt(0),
  feesNextWeek: JSBI.BigInt(0),
  mobiRate: JSBI.BigInt(0),
}

const initialUserStakingState: IUserStakingState = {
  voteUserPower: JSBI.BigInt(0),
  votingPower: JSBI.BigInt(0),
  claimableExternalRewards: JSBI.BigInt(0),
  claimableFees: JSBI.BigInt(0),
  lock: { amount: JSBI.BigInt(0), end: 0 },
}

const initialState: IStakingState & IUserStakingState = {
  ...initialStakingState,
  ...initialUserStakingState,
}

export default createReducer<IStakingState & IUserStakingState>(initialState, (builder) => {
  builder
    .addCase(updateStaking, (state, { payload: { stakingState } }) => ({
      ...state,
      ...stakingState,
    }))
    .addCase(updateStakingUser, (state, { payload: { userStakingState } }) => ({
      ...state,
      ...userStakingState,
    }))
})
