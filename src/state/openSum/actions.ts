import { createAction } from '@reduxjs/toolkit'
import JSBI from 'jsbi'

export const updateBalances = createAction<{ balances: JSBI[][] }>('openSum/updateBalances')
