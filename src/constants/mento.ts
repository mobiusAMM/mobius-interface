import { CeloContract, StableToken } from '@celo/contractkit'
import { ChainId, Percent, TokenAmount } from 'lib/token-utils'

/**
 * Static definition of a Mento exchange.
 */
export interface IMentoExchange {
  stable: StableToken
  contract: CeloContract
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
      contract: CeloContract.Exchange,
    },
    {
      stable: StableToken.cEUR,
      contract: CeloContract.ExchangeEUR,
    },
    {
      stable: StableToken.cREAL,
      contract: CeloContract.ExchangeBRL,
    },
  ],
  [ChainId.ALFAJORES]: [],
  [ChainId.BAKLAVA]: [],
}
