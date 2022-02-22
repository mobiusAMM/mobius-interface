import { createAction } from '@reduxjs/toolkit'
import { IExchange, IExchangeInfo, Volume } from 'constants/pools'

export const updatePools = createAction<{ pools: (IExchangeInfo & IExchange & Volume)[] }>('pools/updatePools')
