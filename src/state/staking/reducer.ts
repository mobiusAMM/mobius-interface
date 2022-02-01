import { createReducer } from '@reduxjs/toolkit'
import { JSBI } from '@ubeswap/sdk'

import { updateSNX, updateStaking } from './actions'

export type VoteLock = {
  amount: JSBI
  end: number // UNIX time stamp
}

export type SnxRewardsInfo = {
  address: string
  rewardToken: string
  tokenRate?: JSBI
  leftToClaim?: JSBI
}

export type StakingState = {
  claimableFees?: JSBI
  feesThisWeek?: JSBI
  votingPower: JSBI
  totalVotingPower: JSBI
  snx?: SnxRewardsInfo
  locked?: VoteLock
  voteWeightLeft?: JSBI
  voteUserPower: JSBI
  totalWeight: JSBI
  totalMobiLocked: JSBI
}

const SNX_STATIC: SnxRewardsInfo = {
  address: '0x0812f6de916667C5aa820E757704c4ac69159529',
  rewardToken: '0x471EcE3750Da237f93B8E339c536989b8978a438',
}

const initialState: StakingState = {
  votingPower: JSBI.BigInt(0),
  totalVotingPower: JSBI.BigInt(0),
  voteWeightLeft: JSBI.BigInt(0),
  voteUserPower: JSBI.BigInt(0),
  totalWeight: JSBI.BigInt(0),
  totalMobiLocked: JSBI.BigInt(1),
  snx: SNX_STATIC,
}

export default createReducer<StakingState>(initialState, (builder) => {
  builder.addCase(updateStaking, (state, { payload: { stakingInfo } }) => ({
    ...state,
    ...stakingInfo,
  }))
  builder.addCase(updateSNX, (state, { payload }) => {
    if (state.snx) {
      state.snx.tokenRate = payload.rewardRate ?? state.snx.tokenRate
      state.snx.leftToClaim = payload.leftToClaim ?? state.snx.leftToClaim
    }
  })
})
