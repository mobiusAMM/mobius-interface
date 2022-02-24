import { createReducer } from '@reduxjs/toolkit'
import { TokenAmount } from '@ubeswap/sdk'
import { IExchange, IExchangeInfo, RECOMMENDED_AMP, RECOMMENDED_FEES, StablePools, Volume } from 'constants/pools'

import { CHAIN } from '../../constants'
import { updatePools } from './actions'

export interface Pools {
  readonly pools: (IExchangeInfo & IExchange & Volume)[]
}

function emptyExchangeInfo(exchange: IExchange): IExchangeInfo & IExchange & Volume {
  return {
    ...exchange,
    fees: RECOMMENDED_FEES,
    ampFactor: RECOMMENDED_AMP,
    lpTotalSupply: new TokenAmount(exchange.lpToken, '0'),
    reserves: [new TokenAmount(exchange.tokens[0], '0'), new TokenAmount(exchange.tokens[1], '0')],
    volume: null,
  }
}

const initialState: Pools = {
  pools: StablePools[CHAIN].map((p) => emptyExchangeInfo(p.pool)),
}

export default createReducer<Pools>(initialState, (builder) =>
  builder.addCase(updatePools, (state, { payload: { pools } }) => {
    return {
      ...state,
      pools: pools,
    }
  })
)
