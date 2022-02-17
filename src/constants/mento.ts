import { StableToken } from '@celo/contractkit'
import { ChainId, Percent, TokenAmount } from '@ubeswap/sdk'

/**
 * Static definition of a Mento exchange.
 */
export interface IMentoExchange {
  stable: StableToken
}

/**
 * Info loaded from the exchange. This is used by the calculator.
 */
export interface IMentoExchangeInfo {
  address: string
  fee: Percent
  stableReserve: TokenAmount
  celoReserve: TokenAmount
}

export const MENTO_POOL_INFO: { [K in ChainId]: IMentoExchange[] } = {
  [ChainId.MAINNET]: [
    {
      stable: StableToken.cUSD,
    },
  ],
  [ChainId.ALFAJORES]: [],
  [ChainId.BAKLAVA]: [],
}
