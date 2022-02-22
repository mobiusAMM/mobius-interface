import { createAction } from '@reduxjs/toolkit'
import { IMentoExchange, IMentoExchangeInfo } from 'constants/mento'

export const updateMento = createAction<{ mento: IMentoExchangeInfo & IMentoExchange }>('mentoPools/initPools')
