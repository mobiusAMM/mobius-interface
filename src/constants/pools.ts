import BigNumber from 'bignumber.js'
import JSBI from 'jsbi'
import { ChainId, Percent, Token, TokenAmount } from 'lib/token-utils'

import celoLogo from '../assets/images/celo-chain-logo.png'
import ethLogo from '../assets/images/ethereum-chain-logo.png'
import polygonLogo from '../assets/images/polygon-chain-logo.png'
import terraLogo from '../assets/images/terra-logo.png'
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

export enum WarningType {
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

export const ChainLogo: { [c in Chain]: string } = {
  [Chain.Celo]: celoLogo,
  [Chain.Ethereum]: ethLogo,
  [Chain.Polygon]: polygonLogo,
  [Chain.Solana]: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_SOL.png',
  [Chain.Avax]: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png',
  [Chain.Terra]: terraLogo,
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

function lp(chainId: ChainId, address: string, name: string): Token {
  return new Token({
    chainId,
    address,
    decimals: 18,
    symbol: 'MobLP',
    name,
  })
}

const weeklyEmissionToSeconds = (n: number) => {
  const yearlyEmission = new BigNumber(`${n}e+18`).dividedBy(7 * 24 * 60 * 60)
  return yearlyEmission.toFixed(0)
}

export const StablePools: { [K in ChainId]: DisplayPool[] } = {
  [ChainId.Mainnet]: [
    {
      name: 'UST (Allbridge)',
      chain: Chain.Terra,
      peg: Dollar,
      pool: {
        address: '0x9F4AdBD0af281C69a582eB2E6fa2A594D4204CAe',
        lpToken: lp(ChainId.Mainnet, '0x9438e7281D7E3e99A9dD21e0EAd9c6a254e17ab2', 'Mobius cUSD/aUST LP'),
        tokens: [CUSD[ChainId.Mainnet], UST[ChainId.Mainnet]],
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
        lpToken: lp(ChainId.Mainnet, '0x4fF08e2a4E7114af4B575AeF9250144f95790982', 'Mobius cETH/wETH LP'),
        tokens: [CETH[ChainId.Mainnet], WETH[ChainId.Mainnet]],
      },
      gauge: {
        address: '0x487c30CB18AA9Ced435911E2B414e0e85D7E52bB',
        additionalRewards: [],
      },
    },
  ],
  [ChainId.Alfajores]: [],
  [ChainId.Baklava]: [],
}
