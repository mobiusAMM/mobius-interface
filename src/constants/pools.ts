import JSBI from 'jsbi'
import { ChainId, Percent, Token, TokenAmount } from 'lib/token-utils'

import { CHAIN } from './'
import { CELO, CETH, CUSD, UST, WETH } from './tokens'

export type Fees = {
  trade: Percent
  admin: Percent
  deposit: Percent
  withdraw: Percent
}

/**
 * Static definition of an exchange.
 */
export interface IExchange {
  address: string
  lpToken: Token
  tokens: readonly [Token, Token]
}

/**
 * Info loaded from the exchange. This is used by the calculator.
 */
export interface IExchangeInfo {
  ampFactor: JSBI
  fees: Fees
  lpTotalSupply: TokenAmount
  reserves: readonly [TokenAmount, TokenAmount]
}

export interface IGauge {
  address: string
  additionalRewards: TokenAmount[]
}

export interface Volume {
  volume: {
    total: number
    day: number
    week: number
  } | null
}

export enum Coins {
  Bitcoin,
  Ether,
  USD,
  Celo,
  Eur,
}

enum WarningType {
  POOF = 'poof',
}

export interface Peg {
  coin: Coins
  symbol: string
  position: 'before' | 'after'
  decimals: number
  priceQuery: string | null
}

const Bitcoin: Peg = {
  coin: Coins.Bitcoin,
  symbol: '₿',
  position: 'after',
  decimals: 2,
  priceQuery: 'bitcoin',
}

const Ether: Peg = {
  coin: Coins.Ether,
  symbol: 'Ξ',
  position: 'after',
  decimals: 2,
  priceQuery: 'ethereum',
}

const Dollar: Peg = {
  coin: Coins.USD,
  symbol: '$',
  position: 'before',
  decimals: 0,
  priceQuery: null,
}

const Celo: Peg = {
  coin: Coins.Celo,
  symbol: 'Celo',
  position: 'after',
  decimals: 0,
  priceQuery: 'celo',
}

const Euro: Peg = {
  coin: Coins.Eur,
  symbol: '€',
  position: 'before',
  decimals: 0,
  priceQuery: 'celo-euro',
}

export enum Chain {
  Celo,
  Ethereum,
  Polygon,
  Solana,
  Avax,
  Terra,
}

export interface DisplayPool {
  name: string
  chain: Chain
  peg: Peg
  pool: IExchange
  gauge: IGauge | null
  warningType?: WarningType
}

const recommendedFeesRaw = {
  adminFeeNumerator: '50',
  adminFeeDenominator: '100',
  depositFeeNumerator: '50',
  depositFeeDenominator: '100',
  tradeFeeNumerator: '20',
  tradeFeeDenominator: '10000',
  withdrawFeeNumerator: '50',
  withdrawFeeDenominator: '10000',
}

export const RECOMMENDED_FEES: Fees = {
  trade: new Percent(recommendedFeesRaw.tradeFeeNumerator, recommendedFeesRaw.tradeFeeDenominator),
  withdraw: new Percent(recommendedFeesRaw.withdrawFeeNumerator, recommendedFeesRaw.withdrawFeeDenominator),
  admin: new Percent(recommendedFeesRaw.adminFeeNumerator, recommendedFeesRaw.adminFeeDenominator),
  deposit: new Percent(recommendedFeesRaw.depositFeeNumerator, recommendedFeesRaw.depositFeeDenominator),
}

export const RECOMMENDED_AMP = JSBI.BigInt('100')

export const StablePools: { [K in ChainId]: DisplayPool[] } = {
  [ChainId.MAINNET]: [
    {
      name: 'UST (Allbridge)',
      chain: Chain.Terra,
      peg: Dollar,
      pool: {
        address: '0x9F4AdBD0af281C69a582eB2E6fa2A594D4204CAe',
        lpToken: new Token({
          chainId: ChainId.MAINNET,
          address: '0x9438e7281D7E3e99A9dD21e0EAd9c6a254e17ab2',
          decimals: 18,
          symbol: 'MobLP',
          name: 'Mobius cUSD/aUST LP',
        }),
        tokens: [CUSD[ChainId.MAINNET], UST[ChainId.MAINNET]],
      },
      gauge: {
        address: '0x107F94409746E8c8E6eFF139A100D17D9ca7FdfE',
        additionalRewards: [new TokenAmount(CELO[CHAIN], '12000000000000000')],
      },
    },
    {
      name: 'WETH (Optics V2)',
      chain: Chain.Ethereum,
      peg: Ether,
      pool: {
        address: '0x74ef28D635c6C5800DD3Cd62d4c4f8752DaACB09',
        lpToken: new Token({
          chainId: ChainId.MAINNET,
          address: '0x4fF08e2a4E7114af4B575AeF9250144f95790982',
          decimals: 18,
          symbol: 'MobLP',
          name: 'Mobius cUSD/aUST LP',
        }),
        tokens: [CETH[ChainId.MAINNET], WETH[ChainId.MAINNET]],
      },
      gauge: {
        address: '0x487c30CB18AA9Ced435911E2B414e0e85D7E52bB',
        additionalRewards: [],
      },
    },
  ],
  [ChainId.ALFAJORES]: [],
  [ChainId.BAKLAVA]: [],
}
