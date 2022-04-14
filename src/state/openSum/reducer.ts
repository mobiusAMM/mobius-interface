import { createReducer } from '@reduxjs/toolkit'
import { ConstantSum } from 'constants/ConstantSum'
import JSBI from 'jsbi'
import { Token } from 'lib/token-utils'

import { CHAIN } from '../../constants'
import { updateBalances } from './actions'

export type ConstantSumPool = {
  address: string
  tokens: [Token, Token]
  balances?: JSBI[]
}

export interface PoolState {
  readonly pools: ConstantSumPool[]
}

const initialState: PoolState = {
  pools: ConstantSum[CHAIN] ?? [],
}

export default createReducer<PoolState>(initialState, (builder) =>
  builder.addCase(updateBalances, (state, { payload: { balances } }) => {
    balances.forEach((balance, i) => (state.pools[i].balances = balance))
  })
)
