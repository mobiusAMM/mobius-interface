import { createAction } from '@reduxjs/toolkit'

import type { IExchange, IExchangeInfo } from '../../constants/pools'
import { ExternalRewards, GaugeOnlyInfo, StableSwapVariable } from './reducer'

export const initPools = createAction<{ pools: IExchange }>('stablePools2/initPools')

export const updateVariableData = createAction<{ address: string; variableData: StableSwapVariable }>(
  'stablePools2/updateVariableData'
)

export const updateExternalRewards = createAction<{ pool: string; externalRewards: ExternalRewards[] }>(
  'stablePools/updateExternalRewards'
)

export const updatePools = createAction<{ info: IExchangeInfo }>('stablePools2/updatePools')

export const updateGauges = createAction<{ info: GaugeOnlyInfo[] }>('stablePools/updateGauges')
