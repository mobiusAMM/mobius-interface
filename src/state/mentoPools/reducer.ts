import { createReducer } from '@reduxjs/toolkit'
import { IMentoExchange, IMentoExchangeInfo } from 'constants/mento'

import { updateMento } from './actions'

export interface MentoPools {
  readonly pools: (IMentoExchangeInfo & IMentoExchange)[]
}

const initialState: MentoPools = {
  pools: [],
}

export default createReducer<MentoPools>(initialState, (builder) =>
  builder.addCase(updateMento, (state, { payload: { mento } }) => {
    return {
      pools: state.pools.map((p) => (p.stable === mento.stable ? mento : p)),
    }
  })
)
