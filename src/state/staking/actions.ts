import { createAction } from '@reduxjs/toolkit'

import { IStakingState, IUserStakingState } from './reducer'

export const updateStaking = createAction<{ stakingState: IStakingState }>('staking/update')
export const updateStakingUser = createAction<{ userStakingState: IUserStakingState }>('staking/updateUser')
