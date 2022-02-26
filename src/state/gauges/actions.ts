import { createAction } from '@reduxjs/toolkit'

import { IGaugeInfo, IUserGaugeInfo } from './reducer'

export const updateGauges = createAction<{ gaugeState: (IGaugeInfo | null)[] }>('gauges/update')
export const updateGaugesUser = createAction<{ userGaugeState: (IUserGaugeInfo | null)[] }>('gauges/updateUser')
