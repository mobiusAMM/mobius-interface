import { ChainId, cUSD, Percent, Token, TokenAmount } from '@ubeswap/sdk'
import type JSBI from 'jsbi'

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
  exchange: IExchange
  address: string
  additionalRewards?: string[]
  additionalRewardRate?: string[]
  isKilled?: boolean
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
}

const Bitcoin: Peg = {
  coin: Coins.Bitcoin,
  symbol: '₿',
  position: 'after',
  decimals: 2,
}

const Ether: Peg = {
  coin: Coins.Ether,
  symbol: 'Ξ',
  position: 'after',
  decimals: 2,
}

const Dollar: Peg = {
  coin: Coins.USD,
  symbol: '$',
  position: 'before',
  decimals: 0,
}

const Celo: Peg = {
  coin: Coins.Celo,
  symbol: 'Celo',
  position: 'after',
  decimals: 0,
}

const Euro: Peg = {
  coin: Coins.Eur,
  symbol: '€',
  position: 'before',
  decimals: 0,
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
  pool: IGauge | IExchange
  warningType?: WarningType
}

const UST = new Token(ChainId.MAINNET, '0xEd193C4E69F591E42398eF54DEa65aa1bb02835c', 18, 'UST', 'UST')

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

export const Pools: { [K in ChainId]: IExchange[] } = {
  [ChainId.MAINNET]: [
    {
      address: '0x9F4AdBD0af281C69a582eB2E6fa2A594D4204CAe',
      lpToken: new Token(
        ChainId.MAINNET,
        '0x9438e7281D7E3e99A9dD21e0EAd9c6a254e17ab2',
        18,
        'MobLP',
        'Mobius cUSD/aUST LP'
      ),
      tokens: [cUSD[ChainId.MAINNET], UST],
    },
  ],
  [ChainId.ALFAJORES]: [],
  [ChainId.BAKLAVA]: [],
}

export const StablePools: { [K in ChainId]: DisplayPool[] } = {
  [ChainId.MAINNET]: [
    {
      name: 'UST (Allbridge)',
      chain: Chain.Terra,
      peg: Dollar,
      pool: {
        exchange: {
          address: '0x9F4AdBD0af281C69a582eB2E6fa2A594D4204CAe',
          lpToken: new Token(
            ChainId.MAINNET,
            '0x9438e7281D7E3e99A9dD21e0EAd9c6a254e17ab2',
            18,
            'MobLP',
            'Mobius cUSD/aUST LP'
          ),
          tokens: [cUSD[ChainId.MAINNET], UST],
        },
        address: '0x107F94409746E8c8E6eFF139A100D17D9ca7FdfE',
        additionalRewards: ['0x471EcE3750Da237f93B8E339c536989b8978a438'],
        additionalRewardRate: ['12000000000000000'],
      },
    },
  ],
  [ChainId.ALFAJORES]: [],
  [ChainId.BAKLAVA]: [],
}
