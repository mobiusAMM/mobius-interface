import { createReducer } from '@reduxjs/toolkit'
import { Percent, TokenAmount } from '@ubeswap/sdk'
import { IMentoExchange, IMentoExchangeInfo } from 'constants/mento'
import { CELO } from 'constants/tokens'

import { CHAIN } from '../../constants'
import { MENTO_POOL_INFO } from '../../constants/mento'
import { updateMento } from './actions'
import { stableToToken } from './hooks'

export interface MentoPools {
  readonly pools: (IMentoExchangeInfo & IMentoExchange)[]
}

function emptyMentoExchangeInfo(mentoExchange: IMentoExchange): IMentoExchangeInfo & IMentoExchange {
  return {
    ...mentoExchange,
    fee: new Percent('0'),
    address: '',
    stableReserve: new TokenAmount(stableToToken(mentoExchange.stable), '0'),
    celoReserve: new TokenAmount(CELO[CHAIN], '0'),
  }
}

const initialState: MentoPools = {
  pools: MENTO_POOL_INFO[CHAIN].map((p) => emptyMentoExchangeInfo(p)),
}

export default createReducer<MentoPools>(initialState, (builder) =>
  builder.addCase(updateMento, (state, { payload: { mento } }) => {
    console.log(mento)
    return {
      pools: state.pools.map((p) => (p.stable === mento.stable ? mento : p)),
    }
  })
)
