import { createAction } from '@reduxjs/toolkit'

import { IGaugeState, IUserGaugeState } from './reducer'

export const updateGauges = createAction<{ gaugeState: (IGaugeState | null)[] }>('gauges/update')
export const updateGaugesUser = createAction<{ userGaugeState: (IUserGaugeState | null)[] }>('gauges/updateUser')
