import { StableToken } from '@celo/contractkit'
import { ChainId, JSBI, Token } from '@ubeswap/sdk'
import { VestType } from 'state/claim/reducer'
import { WrappedTokenInfo } from 'state/lists/hooks'
import { MentoConstants } from 'state/mentoPools/reducer'

import celoLogo from '../assets/images/celo-chain-logo.png'
import ethLogo from '../assets/images/ethereum-chain-logo.png'
import polygonLogo from '../assets/images/polygon-chain-logo.png'
import terraLogo from '../assets/images/terra-logo.png'

const mobiToken = (chainId: number, address: string) =>
  new WrappedTokenInfo(
    {
      chainId,
      address,
      decimals: 18,
      symbol: 'MOBI',
      name: 'Mobius DAO Token',
      logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_MOBI.png',
    },
    []
  )

export enum Coins {
  Bitcoin,
  Ether,
  USD,
  Celo,
  Eur,
}

export enum Chain {
  Celo,
  Ethereum,
  Polygon,
  Solana,
  Avax,
  All,
  Terra,
  Other,
}

enum WarningType {
  POOF = 'poof',
}

type StableSwapMathConstants = {
  name: string
  rates: JSBI[]
  lendingPrecision: JSBI
  precision: JSBI
  feeDenominator: JSBI
  precisionMul: JSBI[]
  feeIndex: number
  decimals: JSBI[]
  swapFee: JSBI
}
type StableSwapConstants = StableSwapMathConstants & {
  tokens: WrappedTokenInfo[]
  tokenAddresses: string[]
  address: string
  gaugeAddress: string
  lpToken: Token
  peggedTo: string
  pegComesAfter: boolean | undefined
  displayDecimals: number
  additionalRewards?: string[]
  additionalRewardRate?: string[]
  lastClaim?: Date
  displayChain: Chain
  coin: Coins
  disabled?: boolean
  metaPool?: string
  isKilled?: boolean
  warningType?: WarningType
}

export const ChainLogo: { [c in Chain]: string } = {
  [Chain.Celo]: celoLogo,
  [Chain.Ethereum]: ethLogo,
  [Chain.Polygon]: polygonLogo,
  [Chain.Solana]: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_SOL.png',
  [Chain.Avax]: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png',
  [Chain.All]: '',
  [Chain.Terra]: terraLogo,
  [Chain.Other]: '',
}

export const PRICE: { [c in Coins]: number } = {
  [Coins.Bitcoin]: 38000,
  [Coins.Ether]: 2700,
  [Coins.USD]: 1,
  [Coins.Celo]: 6,
  [Coins.Eur]: 1.17,
}

export const MOBIUS_STRIP_ADDRESS: { [K in ChainId]: string } = {
  [ChainId.MAINNET]: '',
  [ChainId.ALFAJORES]: '0x20707684E796c7cb04CBB1a3bDB6AB40A02f2D12',
  [ChainId.BAKLAVA]: '',
}

export const MOBIUS_MINTER_ADDRESS: { [K in ChainId]: string } = {
  [ChainId.MAINNET]: '0x5F0200CA03196D5b817E2044a0Bb0D837e0A7823',
  [ChainId.ALFAJORES]: '0x5c212FA1cf8b1143f2142C26161e65404034c01f',
  [ChainId.BAKLAVA]: '',
}

export const MOBI_TOKEN: { [K in ChainId]: Token | undefined } = {
  [ChainId.MAINNET]: mobiToken(ChainId.MAINNET, '0x73a210637f6F6B7005512677Ba6B3C96bb4AA44B'),
  [ChainId.ALFAJORES]: mobiToken(ChainId.ALFAJORES, '0x6dDcbC22c1ED5D0662635ffb020c82DF4e1Ba234'),
  [ChainId.BAKLAVA]: undefined,
}

export const GAUGE_CONTROLLER: { [K in ChainId]: string } = {
  [ChainId.MAINNET]: '0x7530E03056D3a8eD0323e61091ea2f17a1aC5C25',
  [ChainId.ALFAJORES]: '0x00063Fbe0c90834EE90C6191d0D9F04eaB01A14f',
  [ChainId.BAKLAVA]: '',
}

export const STATIC_POOL_INFO: { [K in ChainId]: StableSwapConstants[] } = {
  [ChainId.MAINNET]: [
    {
      name: 'UST (Allbridge)',
      tokenAddresses: ['0x765DE816845861e75A25fCA122bb6898B8B1282a', '0xEd193C4E69F591E42398eF54DEa65aa1bb02835c'],
      tokens: [
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
            decimals: 18,
            symbol: 'cUSD',
            name: 'Celo Dollar',
            logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_cUSD.png',
          },
          []
        ),
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0xEd193C4E69F591E42398eF54DEa65aa1bb02835c',
            decimals: 18,
            symbol: 'UST',
            name: 'Allbridge UST',
            logoURI: 'https://raw.githubusercontent.com/kyscott18/default-token-list/master/assets/asset_UST.png',
          },
          []
        ),
      ],
      address: '0x9F4AdBD0af281C69a582eB2E6fa2A594D4204CAe',
      lpToken: new Token(
        ChainId.MAINNET,
        '0x9438e7281D7E3e99A9dD21e0EAd9c6a254e17ab2',
        18,
        'MobLP',
        'Mobius cUSD/aUST LP'
      ),
      swapFee: JSBI.multiply(JSBI.BigInt('2'), JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('7'))),
      rates: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      lendingPrecision: JSBI.BigInt('1'),
      precision: JSBI.BigInt('18'),
      feeDenominator: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('10')),
      precisionMul: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      feeIndex: 0,
      decimals: [JSBI.BigInt('18'), JSBI.BigInt('18')],
      peggedTo: '$',
      pegComesAfter: false,
      displayDecimals: 0,
      gaugeAddress: '0x107F94409746E8c8E6eFF139A100D17D9ca7FdfE',
      additionalRewards: ['0x471EcE3750Da237f93B8E339c536989b8978a438'],
      additionalRewardRate: ['12000000000000000'], // ['14776041660000000'], //['18468900000000000'], // ['7302827380000000']
      displayChain: Chain.Terra,
      coin: Coins.USD,
    },
    {
      name: 'USDC (Optics V2)',
      tokenAddresses: ['0x765DE816845861e75A25fCA122bb6898B8B1282a', '0xef4229c8c3250C675F21BCefa42f58EfbfF6002a'],
      tokens: [
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
            decimals: 18,
            symbol: 'cUSD',
            name: 'Celo Dollar',
            logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_cUSD.png',
          },
          []
        ),
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0xef4229c8c3250C675F21BCefa42f58EfbfF6002a',
            decimals: 6,
            symbol: 'cUSDC',
            name: 'US Dollar Coin (Optics Bridge)',
            logoURI: 'https://bit.ly/3CwGimW',
          },
          []
        ),
      ],
      address: '0x9906589Ea8fd27504974b7e8201DF5bBdE986b03',
      lpToken: new Token(
        ChainId.MAINNET,
        '0x39b6F09ef97dB406ab78D869471adb2384C494E3',
        18,
        'MobLP',
        'Mobius cUSD/cUSDC LP'
      ),
      swapFee: JSBI.multiply(JSBI.BigInt('2'), JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('7'))),
      rates: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      lendingPrecision: JSBI.BigInt('1'),
      precision: JSBI.BigInt('18'),
      feeDenominator: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('10')),
      precisionMul: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      feeIndex: 0,
      decimals: [JSBI.BigInt('18'), JSBI.BigInt('6')],
      peggedTo: '$',
      pegComesAfter: false,
      displayDecimals: 0,
      gaugeAddress: '0xc96AeeaFF32129da934149F6134Aa7bf291a754E',
      additionalRewards: ['0x471EcE3750Da237f93B8E339c536989b8978a438'],
      additionalRewardRate: ['23000000000000000'], // ['29552083330000000'], // ['36940104160000000'], // ['7302827380000000']
      displayChain: Chain.Ethereum,
      coin: Coins.USD,
    },
    {
      name: 'DAI (Optics V2)',
      tokenAddresses: ['0x765DE816845861e75A25fCA122bb6898B8B1282a', '0x90Ca507a5D4458a4C6C6249d186b6dCb02a5BCCd'],
      tokens: [
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
            decimals: 18,
            symbol: 'cUSD',
            name: 'Celo Dollar',
            logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_cUSD.png',
          },
          []
        ),
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0x90Ca507a5D4458a4C6C6249d186b6dCb02a5BCCd',
            decimals: 18,
            symbol: 'DAI',
            name: 'Optics DAI',
            logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_DAI.png',
          },
          []
        ),
      ],
      address: '0xF3f65dFe0c8c8f2986da0FEc159ABE6fd4E700B4',
      lpToken: new Token(
        ChainId.MAINNET,
        '0x274DD2dF039f1f6131419C82173D97770e6af6B7',
        18,
        'MobLP',
        'Mobius cUSD/cDAI LP'
      ),
      swapFee: JSBI.multiply(JSBI.BigInt('2'), JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('7'))),
      rates: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      lendingPrecision: JSBI.BigInt('1'),
      precision: JSBI.BigInt('18'),
      feeDenominator: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('10')),
      precisionMul: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      feeIndex: 0,
      decimals: [JSBI.BigInt('18'), JSBI.BigInt('18')],
      peggedTo: '$',
      pegComesAfter: false,
      displayDecimals: 0,
      gaugeAddress: '0xE1f9D952EecC07cfEFa69df9fBB0cEF260957119',
      additionalRewards: ['0x471EcE3750Da237f93B8E339c536989b8978a438'],
      additionalRewardRate: ['13300000000000000'], // ['14776041660000000'], //['18468900000000000'], // ['7302827380000000']
      displayChain: Chain.Ethereum,
      coin: Coins.USD,
    },
    {
      name: 'WETH (Optics V2)',
      tokenAddresses: ['0x2DEf4285787d58a2f811AF24755A8150622f4361', '0x122013fd7dF1C6F636a5bb8f03108E876548b455'],
      tokens: [
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0x2DEf4285787d58a2f811AF24755A8150622f4361',
            decimals: 18,
            symbol: 'cETH',
            name: 'Wrapped Ethereum',
            logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_cETH.svg',
          },
          []
        ),
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0x122013fd7dF1C6F636a5bb8f03108E876548b455',
            decimals: 18,
            symbol: 'wETH',
            name: 'Wrapped Ether (Optics Bridge)',
            logoURI: 'https://etherscan.io/token/images/weth_28.png',
          },
          []
        ),
      ],
      address: '0x74ef28D635c6C5800DD3Cd62d4c4f8752DaACB09',
      lpToken: new Token(
        ChainId.MAINNET,
        '0x4fF08e2a4E7114af4B575AeF9250144f95790982',
        18,
        'MobLP',
        'Mobius cETH/wETH LP'
      ),
      swapFee: JSBI.multiply(JSBI.BigInt('2'), JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('7'))),
      rates: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      lendingPrecision: JSBI.BigInt('1'),
      precision: JSBI.BigInt('18'),
      feeDenominator: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('10')),
      precisionMul: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      feeIndex: 0,
      decimals: [JSBI.BigInt('18'), JSBI.BigInt('18')],
      peggedTo: 'Ξ',
      pegComesAfter: true,
      displayDecimals: 2,
      gaugeAddress: '0x487c30CB18AA9Ced435911E2B414e0e85D7E52bB',
      displayChain: Chain.Ethereum,
      coin: Coins.Ether,
      additionalRewards: ['0x471EcE3750Da237f93B8E339c536989b8978a438'],
      additionalRewardRate: ['0'], // ['3694010416000000'], // ['7302827380000000']
    },
    {
      name: 'wBTC (Optics V2)',
      tokenAddresses: ['0xD629eb00dEced2a080B7EC630eF6aC117e614f1b', '0xBAAB46E28388d2779e6E31Fd00cF0e5Ad95E327B'],
      tokens: [
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0xD629eb00dEced2a080B7EC630eF6aC117e614f1b',
            decimals: 18,
            symbol: 'cBTC',
            name: 'Wrapped Bitcoin',
            logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_cBTC.png',
          },
          []
        ),
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0xBAAB46E28388d2779e6E31Fd00cF0e5Ad95E327B',
            decimals: 8,
            symbol: 'wBTC',
            name: 'Wrapped Bitcoin (Optics Bridge)',
            logoURI: 'https://etherscan.io/token/images/wbtc_28.png?v=1',
          },
          []
        ),
      ],
      address: '0xaEFc4e8cF655a182E8346B24c8AbcE45616eE0d2',
      lpToken: new Token(
        ChainId.MAINNET,
        '0x20d7274C5aF4f9DE6e8C93025e44aF3979d9Ab2b',
        18,
        'MobLP',
        'Mobius cBTC/wBTC LP'
      ),
      swapFee: JSBI.multiply(JSBI.BigInt('2'), JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('7'))),
      rates: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      lendingPrecision: JSBI.BigInt('1'),
      precision: JSBI.BigInt('18'),
      feeDenominator: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('10')),
      precisionMul: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      feeIndex: 0,
      decimals: [JSBI.BigInt('18'), JSBI.BigInt('8')],
      peggedTo: '₿',
      pegComesAfter: true,
      displayDecimals: 2,
      gaugeAddress: '0x127b524c74C2162Ee4BB2e42d8d2eB9050C0293E',
      displayChain: Chain.Ethereum,
      coin: Coins.Bitcoin,
      additionalRewards: ['0x471EcE3750Da237f93B8E339c536989b8978a438'],
      additionalRewardRate: ['0'], // ['3694010416000000'], // ['7302827380000000']
    },
    {
      name: 'pUSDC (Optics V2)',
      tokenAddresses: ['0x765DE816845861e75A25fCA122bb6898B8B1282a', '0x1bfc26cE035c368503fAE319Cc2596716428ca44'],
      tokens: [
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
            decimals: 18,
            symbol: 'cUSD',
            name: 'Celo Dollar',
            logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_cUSD.png',
          },
          []
        ),
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0x1bfc26cE035c368503fAE319Cc2596716428ca44',
            decimals: 6,
            symbol: 'pUSDC',
            name: 'USD Coin (PoS Optics)',
            logoURI: 'https://bit.ly/3CwGimW',
          },
          []
        ),
      ],
      address: '0xcCe0d62Ce14FB3e4363Eb92Db37Ff3630836c252',
      lpToken: new Token(
        ChainId.MAINNET,
        '0x68b239b415970dD7a5234A9701cbB5BfaB544C7C',
        18,
        'MobLP',
        'Mobius cUSD/pUSDC LP'
      ),
      swapFee: JSBI.multiply(JSBI.BigInt('2'), JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('7'))),
      rates: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      lendingPrecision: JSBI.BigInt('1'),
      precision: JSBI.BigInt('18'),
      feeDenominator: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('10')),
      precisionMul: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      feeIndex: 0,
      decimals: [JSBI.BigInt('18'), JSBI.BigInt('6')],
      peggedTo: '$',
      pegComesAfter: false,
      displayDecimals: 0,
      gaugeAddress: '0x0A125D473cd3b1968e728DDF7d424c928C09222A',
      additionalRewards: ['0x471EcE3750Da237f93B8E339c536989b8978a438'],
      additionalRewardRate: ['3050000000000000'], // ['7388020830000000'], //['11080000000000000'], // ['2190848200000000'],
      displayChain: Chain.Polygon,
      coin: Coins.USD,
    },
    {
      name: 'USDC (Optics V1)',
      tokenAddresses: ['0x765DE816845861e75A25fCA122bb6898B8B1282a', '0x2A3684e9Dc20B857375EA04235F2F7edBe818FA7'],
      tokens: [
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
            decimals: 18,
            symbol: 'cUSD',
            name: 'Celo Dollar',
            logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_cUSD.png',
          },
          []
        ),
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0x2A3684e9Dc20B857375EA04235F2F7edBe818FA7',
            decimals: 6,
            symbol: 'cUSDCxV1',
            name: 'US Dollar Coin (Optics Bridge)',
            logoURI: 'https://bit.ly/3CwGimW',
          },
          []
        ),
      ],
      address: '0xA5037661989789d0310aC2B796fa78F1B01F195D',
      lpToken: new Token(
        ChainId.MAINNET,
        '0xd7Bf6946b740930c60131044bD2F08787e1DdBd4',
        18,
        'MobLP',
        'Mobius cUSD/cUSDC(O) LP'
      ),
      swapFee: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('7')),
      rates: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      lendingPrecision: JSBI.BigInt('1'),
      precision: JSBI.BigInt('18'),
      feeDenominator: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('10')),
      precisionMul: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      feeIndex: 0,
      decimals: [JSBI.BigInt('18'), JSBI.BigInt('6')],
      peggedTo: '$',
      pegComesAfter: false,
      displayDecimals: 0,
      gaugeAddress: '0xdAA2ab880b7f3D5697e6F85e63c28b9120AA9E07',
      additionalRewards: ['0x471EcE3750Da237f93B8E339c536989b8978a438'],
      additionalRewardRate: ['0'], // ['7302827380000000']
      displayChain: Chain.Ethereum,
      coin: Coins.USD,
      isKilled: true,
    },
    {
      name: 'aaUSDC (Allbridge)',
      tokenAddresses: ['0x765DE816845861e75A25fCA122bb6898B8B1282a', '0xb70e0a782b058BFdb0d109a3599BEc1f19328E36'],
      tokens: [
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
            decimals: 18,
            symbol: 'cUSD',
            name: 'Celo Dollar',
            logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_cUSD.png',
          },
          []
        ),
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0xb70e0a782b058BFdb0d109a3599BEc1f19328E36',
            decimals: 18,
            symbol: 'aaUSDC',
            name: 'US Dollar Coin (Avalanche Allbridge)',
            logoURI: 'https://bit.ly/3CwGimW',
          },
          []
        ),
      ],
      address: '0x0986B42F5f9C42FeEef66fC23eba9ea1164C916D',
      lpToken: new Token(
        ChainId.MAINNET,
        '0x730e677f39C4Ca96012c394B9Da09A025E922F81',
        18,
        'MobLP',
        'Mobius cUSD/aaUSDC LP'
      ),
      swapFee: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('7')),
      rates: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      lendingPrecision: JSBI.BigInt('1'),
      precision: JSBI.BigInt('18'),
      feeDenominator: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('10')),
      precisionMul: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      feeIndex: 0,
      decimals: [JSBI.BigInt('18'), JSBI.BigInt('18')],
      peggedTo: '$',
      pegComesAfter: false,
      displayDecimals: 0,
      gaugeAddress: '0xF2ae5c2D2D2eD13dd324C0942163054fc4A3D4d9',
      displayChain: Chain.Avax,
      coin: Coins.USD,
    },
    {
      name: 'Poof cUSD V2',
      warningType: WarningType.POOF,
      tokenAddresses: ['0x765DE816845861e75A25fCA122bb6898B8B1282a', '0xEadf4A7168A82D30Ba0619e64d5BCf5B30B45226'],
      tokens: [
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
            decimals: 18,
            symbol: 'cUSD',
            name: 'Celo Dollar',
            logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_cUSD.png',
          },
          []
        ),
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0xEadf4A7168A82D30Ba0619e64d5BCf5B30B45226',
            decimals: 18,
            symbol: 'pUSD',
            name: 'Poof USD V2',
            logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_pUSD.png',
          },
          []
        ),
      ],
      address: '0xa2F0E57d4cEAcF025E81C76f28b9Ad6E9Fbe8735',
      lpToken: new Token(
        ChainId.MAINNET,
        '0x07e137E5605E15C93f22545868Fa70CECfCbbFFE',
        18,
        'MobLP',
        'Mobius pUSD V2 LP'
      ),
      swapFee: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('7')),
      rates: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      lendingPrecision: JSBI.BigInt('1'),
      precision: JSBI.BigInt('18'),
      feeDenominator: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('10')),
      precisionMul: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      feeIndex: 0,
      decimals: [JSBI.BigInt('18'), JSBI.BigInt('18')],
      peggedTo: '$',
      pegComesAfter: false,
      displayDecimals: 0,
      gaugeAddress: '0xE7195E651Cc47853f0054d85c8ADFc79D532929f',
      additionalRewards: ['0x00400FcbF0816bebB94654259de7273f4A05c762', '0x17700282592D6917F6A73D0bF8AcCf4D578c131e'],
      additionalRewardRate: ['6283068780000000', '16534391530000000'],
      displayChain: Chain.Celo,
      coin: Coins.USD,
    },
    {
      name: 'Poof CELO V2',
      warningType: WarningType.POOF,
      tokenAddresses: ['0x471EcE3750Da237f93B8E339c536989b8978a438', '0x301a61D01A63c8D670c2B8a43f37d12eF181F997'],
      tokens: [
        new WrappedTokenInfo(
          {
            address: '0x471EcE3750Da237f93B8E339c536989b8978a438',
            name: 'Celo',
            symbol: 'CELO',
            chainId: 42220,
            decimals: 18,
            logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_CELO.png',
          },
          []
        ),
        new WrappedTokenInfo(
          {
            address: '0x301a61D01A63c8D670c2B8a43f37d12eF181F997',
            name: 'Poof Celo V2',
            symbol: 'pCELO',
            chainId: 42220,
            decimals: 18,
            logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_pCELO.png',
          },
          []
        ),
      ],
      address: '0xFc9e2C63370D8deb3521922a7B2b60f4Cff7e75a',
      lpToken: new Token(
        ChainId.MAINNET,
        '0xAfFD8d6b5e5A0e25034DD3D075532F9CE01C305c',
        18,
        'MobLP',
        'Mobius pCelo V2 LP'
      ),
      swapFee: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('7')),
      rates: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      lendingPrecision: JSBI.BigInt('1'),
      precision: JSBI.BigInt('18'),
      feeDenominator: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('10')),
      precisionMul: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      feeIndex: 0,
      decimals: [JSBI.BigInt('18'), JSBI.BigInt('18')],
      peggedTo: 'Celo',
      pegComesAfter: true,
      displayDecimals: 0,
      gaugeAddress: '0xD0d57a6689188F854F996BEAE0Cb1949FDB5FF86',
      additionalRewards: ['0x00400FcbF0816bebB94654259de7273f4A05c762', '0x17700282592D6917F6A73D0bF8AcCf4D578c131e'],
      additionalRewardRate: ['6283068780000000', '8267195760000000'],
      // additionalRewards: [''],
      // additionalRewardRate: ['730282730000000'],
      displayChain: Chain.Celo,
      coin: Coins.Celo,
    },
    {
      name: 'Poof cEUR V2',
      warningType: WarningType.POOF,
      tokenAddresses: ['0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73', '0xD8761DD6c7cB54febD33adD699F5E4440b62E01B'],
      tokens: [
        new WrappedTokenInfo(
          {
            address: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73',
            name: 'Celo Euro',
            symbol: 'cEUR',
            chainId: 42220,
            decimals: 18,
            logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_cEUR.png',
          },
          []
        ),
        new WrappedTokenInfo(
          {
            address: '0xD8761DD6c7cB54febD33adD699F5E4440b62E01B',
            name: 'Poof EUR',
            symbol: 'pEUR',
            chainId: 42220,
            decimals: 18,
            logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_pEUR.png',
          },
          []
        ),
      ],
      address: '0x23C95678862a229fAC088bd9705622d78130bC3e',
      lpToken: new Token(
        ChainId.MAINNET,
        '0xec8e37876Fd9De919B58788B87A078e546149F87',
        18,
        'MobLP',
        'Mobius pEUR V2 LP'
      ),
      swapFee: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('7')),
      rates: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      lendingPrecision: JSBI.BigInt('1'),
      precision: JSBI.BigInt('18'),
      feeDenominator: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('10')),
      precisionMul: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      feeIndex: 0,
      decimals: [JSBI.BigInt('18'), JSBI.BigInt('18')],
      peggedTo: '€',
      pegComesAfter: false,
      displayDecimals: 0,
      gaugeAddress: '0xCAEd243de23264Bdd8297c6eECcF320846eee18A',
      additionalRewards: ['0x00400FcbF0816bebB94654259de7273f4A05c762', '0x17700282592D6917F6A73D0bF8AcCf4D578c131e'],
      additionalRewardRate: ['6283068780000000', '8267195760000000'],
      // additionalRewards: [''],
      // additionalRewardRate: ['730282730000000'],
      displayChain: Chain.Celo,
      coin: Coins.Eur,
    },
    {
      name: 'Poof cUSD V1',
      warningType: WarningType.POOF,
      tokenAddresses: ['0x765DE816845861e75A25fCA122bb6898B8B1282a', '0xB4aa2986622249B1F45eb93F28Cfca2b2606d809'],
      tokens: [
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
            decimals: 18,
            symbol: 'cUSD',
            name: 'Celo Dollar',
            logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_cUSD.png',
          },
          []
        ),
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0xB4aa2986622249B1F45eb93F28Cfca2b2606d809',
            decimals: 18,
            symbol: 'pUSDxV1',
            name: 'Poof USD V1',
            logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_pUSD.png',
          },
          []
        ),
      ],
      address: '0x02Db089fb09Fda92e05e92aFcd41D9AAfE9C7C7C',
      lpToken: new Token(
        ChainId.MAINNET,
        '0x18d71b8664E69D6Dd61C79247dBf12bFAaf66C10',
        18,
        'MobLP',
        'Mobius pUSD V1 LP'
      ),
      swapFee: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('7')),
      rates: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      lendingPrecision: JSBI.BigInt('1'),
      precision: JSBI.BigInt('18'),
      feeDenominator: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('10')),
      precisionMul: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      feeIndex: 0,
      decimals: [JSBI.BigInt('18'), JSBI.BigInt('18')],
      peggedTo: '$',
      pegComesAfter: false,
      displayDecimals: 0,
      gaugeAddress: '0x2459BDb59a3BF6Ab6C412Ac0b220e7CDA1D4ea26',
      additionalRewards: ['0x00400FcbF0816bebB94654259de7273f4A05c762', '0x17700282592D6917F6A73D0bF8AcCf4D578c131e'],
      additionalRewardRate: ['0', '0'],
      displayChain: Chain.Celo,
      coin: Coins.USD,
      isKilled: true,
    },
    {
      name: 'asUSDC (AllBridge)',
      tokenAddresses: ['0x765DE816845861e75A25fCA122bb6898B8B1282a', '0xCD7D7Ff64746C1909E44Db8e95331F9316478817'],
      tokens: [
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
            decimals: 18,
            symbol: 'cUSD',
            name: 'Celo Dollar',
            logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_cUSD.png',
          },
          []
        ),
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0xCD7D7Ff64746C1909E44Db8e95331F9316478817',
            decimals: 18,
            symbol: 'asUSDC',
            name: 'US Dollar Coin (Solana AllBridge)',
            logoURI: 'https://bit.ly/3CwGimW',
          },
          []
        ),
      ],
      address: '0x63C1914bf00A9b395A2bF89aaDa55A5615A3656e',
      lpToken: new Token(
        ChainId.MAINNET,
        '0xAFEe90ab6A2D3B265262f94F6e437E7f6d94e26E',
        18,
        'MobLP',
        'Mobius cUSD/asUSDC LP'
      ),
      swapFee: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('7')),
      rates: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      lendingPrecision: JSBI.BigInt('1'),
      precision: JSBI.BigInt('18'),
      feeDenominator: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('10')),
      precisionMul: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      feeIndex: 0,
      decimals: [JSBI.BigInt('18'), JSBI.BigInt('18')],
      peggedTo: '$',
      pegComesAfter: false,
      displayDecimals: 0,
      gaugeAddress: '0x27D9Bfa5F864862BeDC23cFab7e00b6b94488CC6',
      additionalRewards: ['0x471EcE3750Da237f93B8E339c536989b8978a438'],
      additionalRewardRate: ['10000000000000000'],
      displayChain: Chain.Solana,
      coin: Coins.USD,
    },
    {
      name: 'pUSDC (Optics V1)',
      tokenAddresses: ['0x765DE816845861e75A25fCA122bb6898B8B1282a', '0xcC82628f6A8dEFA1e2B0aD7ed448bef3647F7941'],
      tokens: [
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
            decimals: 18,
            symbol: 'cUSD',
            name: 'Celo Dollar',
            logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_cUSD.png',
          },
          []
        ),
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0xcC82628f6A8dEFA1e2B0aD7ed448bef3647F7941',
            decimals: 6,
            symbol: 'pUSDCxV1',
            name: 'USD Coin (PoS Optics)',
            logoURI: 'https://bit.ly/3CwGimW',
          },
          []
        ),
      ],
      address: '0x2080AAa167e2225e1FC9923250bA60E19a180Fb2',
      lpToken: new Token(
        ChainId.MAINNET,
        '0xf5b454cF47Caca418D95930AA03975Ee4bf409bc',
        18,
        'MobLP',
        'Mobius cUSD/pUSDC LP'
      ),
      swapFee: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('7')),
      rates: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      lendingPrecision: JSBI.BigInt('1'),
      precision: JSBI.BigInt('18'),
      feeDenominator: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('10')),
      precisionMul: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      feeIndex: 0,
      decimals: [JSBI.BigInt('18'), JSBI.BigInt('6')],
      peggedTo: '$',
      pegComesAfter: false,
      displayDecimals: 0,
      gaugeAddress: '0x52517feb1Fc6141d5CF6718111C7Cc0FD764fA5d',
      additionalRewards: ['0x471EcE3750Da237f93B8E339c536989b8978a438'],
      additionalRewardRate: ['0'], // ['2190848200000000'],
      displayChain: Chain.Polygon,
      coin: Coins.USD,
      isKilled: true,
    },
    {
      name: 'wBTC (Optics V1)',
      tokenAddresses: ['0xD629eb00dEced2a080B7EC630eF6aC117e614f1b', '0xBe50a3013A1c94768A1ABb78c3cB79AB28fc1aCE'],
      tokens: [
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0xD629eb00dEced2a080B7EC630eF6aC117e614f1b',
            decimals: 18,
            symbol: 'cBTC',
            name: 'Wrapped Bitcoin',
            logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_cBTC.png',
          },
          []
        ),
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0xBe50a3013A1c94768A1ABb78c3cB79AB28fc1aCE',
            decimals: 8,
            symbol: 'wBTCxV1',
            name: 'Wrapped Bitcoin (Optics Bridge)',
            logoURI: 'https://etherscan.io/token/images/wbtc_28.png?v=1',
          },
          []
        ),
      ],
      address: '0x19260b9b573569dDB105780176547875fE9fedA3',
      lpToken: new Token(
        ChainId.MAINNET,
        '0x8cD0E2F11ed2E896a8307280dEEEE15B27e46BbE',
        18,
        'MobLP',
        'Mobius cBTC/wBTC LP'
      ),
      swapFee: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('7')),
      rates: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      lendingPrecision: JSBI.BigInt('1'),
      precision: JSBI.BigInt('18'),
      feeDenominator: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('10')),
      precisionMul: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      feeIndex: 0,
      decimals: [JSBI.BigInt('18'), JSBI.BigInt('8')],
      peggedTo: '₿',
      pegComesAfter: true,
      displayDecimals: 2,
      gaugeAddress: '0x1A8938a37093d34581B21bAd2AE7DC1c19150C05',
      displayChain: Chain.Ethereum,
      coin: Coins.Bitcoin,
      isKilled: true,
    },
    {
      name: 'WETH (Optics V1)',
      tokenAddresses: ['0x2DEf4285787d58a2f811AF24755A8150622f4361', '0xE919F65739c26a42616b7b8eedC6b5524d1e3aC4'],
      tokens: [
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0x2DEf4285787d58a2f811AF24755A8150622f4361',
            decimals: 18,
            symbol: 'cETH',
            name: 'Wrapped Ethereum',
            logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_cETH.svg',
          },
          []
        ),
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0xE919F65739c26a42616b7b8eedC6b5524d1e3aC4',
            decimals: 18,
            symbol: 'wETHxV1',
            name: 'Wrapped Ether (Optics Bridge)',
            logoURI: 'https://etherscan.io/token/images/weth_28.png',
          },
          []
        ),
      ],
      address: '0xE0F2cc70E52f05eDb383313393d88Df2937DA55a',
      lpToken: new Token(
        ChainId.MAINNET,
        '0x846b784Ab5302155542c1B3952B54305F220fd84',
        18,
        'MobLP',
        'Mobius cETH/wETH LP'
      ),
      swapFee: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('7')),
      rates: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      lendingPrecision: JSBI.BigInt('1'),
      precision: JSBI.BigInt('18'),
      feeDenominator: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('10')),
      precisionMul: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      feeIndex: 0,
      decimals: [JSBI.BigInt('18'), JSBI.BigInt('18')],
      peggedTo: 'Ξ',
      pegComesAfter: true,
      displayDecimals: 2,
      gaugeAddress: '0xD38e76E17E66b562B61c149Ca0EE53CEa1145733',
      displayChain: Chain.Ethereum,
      coin: Coins.Ether,
      isKilled: true,
    },
    {
      name: 'USDT (Moss)',
      tokenAddresses: ['0x765DE816845861e75A25fCA122bb6898B8B1282a', '0xcFFfE0c89a779c09Df3DF5624f54cDf7EF5fDd5D'],
      tokens: [
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
            decimals: 18,
            symbol: 'cUSD',
            name: 'Celo Dollar',
            logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_cUSD.png',
          },
          []
        ),
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0xcFFfE0c89a779c09Df3DF5624f54cDf7EF5fDd5D',
            decimals: 18,
            symbol: 'cUSDTm',
            name: 'Tether (Moss Bridge)',
            logoURI: 'https://bit.ly/3AMrCyD',
          },
          []
        ),
      ],
      address: '0xdBF27fD2a702Cc02ac7aCF0aea376db780D53247',
      lpToken: new Token(
        ChainId.MAINNET,
        '0xC7a4c6EF4A16Dc24634Cc2A951bA5Fec4398f7e0',
        18,
        'MobLP',
        'Mobius cUSD/cUSDT LP'
      ),
      swapFee: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('7')),
      rates: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      lendingPrecision: JSBI.BigInt('1'),
      precision: JSBI.BigInt('18'),
      feeDenominator: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('10')),
      precisionMul: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      feeIndex: 0,
      decimals: [JSBI.BigInt('18'), JSBI.BigInt('18')],
      peggedTo: '$',
      pegComesAfter: false,
      displayDecimals: 0,
      gaugeAddress: '0xe2d6095685248F38Ae9fef1b360D772b78Ea19D1',
      displayChain: Chain.Ethereum,
      coin: Coins.USD,
    },
    {
      name: 'USDC (Moss)',
      tokenAddresses: ['0x765DE816845861e75A25fCA122bb6898B8B1282a', '0x93DB49bE12B864019dA9Cb147ba75cDC0506190e'],
      tokens: [
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
            decimals: 18,
            symbol: 'cUSD',
            name: 'Celo Dollar',
            logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_cUSD.png',
          },
          []
        ),
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0x93DB49bE12B864019dA9Cb147ba75cDC0506190e',
            decimals: 18,
            symbol: 'cUSDCm',
            name: 'US Dollar Coin (Moss Bridge)',
            logoURI: 'https://bit.ly/3CwGimW',
          },
          []
        ),
      ],
      address: '0x0ff04189Ef135b6541E56f7C638489De92E9c778',
      lpToken: new Token(
        ChainId.MAINNET,
        '0x635aec36c4b61bac5eB1C3EEe191147d006F8a21',
        18,
        'MobLP',
        'Mobius cUSD/cUSDC LP'
      ),
      swapFee: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('7')),
      rates: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      lendingPrecision: JSBI.BigInt('1'),
      precision: JSBI.BigInt('18'),
      feeDenominator: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('10')),
      precisionMul: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      feeIndex: 0,
      decimals: [JSBI.BigInt('18'), JSBI.BigInt('18')],
      peggedTo: '$',
      pegComesAfter: false,
      displayDecimals: 0,
      gaugeAddress: '0xd1B3C05FE24bda6F52e704daf1ACBa8c440d8573',
      additionalRewards: ['0x471EcE3750Da237f93B8E339c536989b8978a438'],
      additionalRewardRate: ['0'], //['730282730000000'],
      displayChain: Chain.Ethereum,
      coin: Coins.USD,
    },
    {
      name: 'Poof CELO V1',
      warningType: WarningType.POOF,
      tokenAddresses: ['0x471EcE3750Da237f93B8E339c536989b8978a438', '0xE74AbF23E1Fdf7ACbec2F3a30a772eF77f1601E1'],
      tokens: [
        new WrappedTokenInfo(
          {
            address: '0x471EcE3750Da237f93B8E339c536989b8978a438',
            name: 'Celo',
            symbol: 'CELO',
            chainId: 42220,
            decimals: 18,
            logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_CELO.png',
          },
          []
        ),
        new WrappedTokenInfo(
          {
            address: '0xE74AbF23E1Fdf7ACbec2F3a30a772eF77f1601E1',
            name: 'Poof Celo V1',
            symbol: 'pCELOxV1',
            chainId: 42220,
            decimals: 18,
            logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_pCELO.png',
          },
          []
        ),
      ],
      address: '0x413FfCc28e6cDDE7e93625Ef4742810fE9738578',
      lpToken: new Token(
        ChainId.MAINNET,
        '0x4D6B17828d0173668e8Eb730106444556a98c0F9',
        18,
        'MobLP',
        'Mobius pCelo V1 LP'
      ),
      swapFee: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('7')),
      rates: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      lendingPrecision: JSBI.BigInt('1'),
      precision: JSBI.BigInt('18'),
      feeDenominator: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('10')),
      precisionMul: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      feeIndex: 0,
      decimals: [JSBI.BigInt('18'), JSBI.BigInt('18')],
      peggedTo: 'Celo',
      pegComesAfter: true,
      displayDecimals: 0,
      gaugeAddress: '0x5489b2F0A1992b889F47601D71E068Fd15c63f26',
      additionalRewards: ['0x00400FcbF0816bebB94654259de7273f4A05c762', '0x17700282592D6917F6A73D0bF8AcCf4D578c131e'],
      additionalRewardRate: ['0', '0'],
      // additionalRewards: [''],
      // additionalRewardRate: ['730282730000000'],
      displayChain: Chain.Celo,
      coin: Coins.Celo,
      isKilled: true,
    },
    {
      name: 'Poof cEUR V1',
      warningType: WarningType.POOF,
      tokenAddresses: ['0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73', '0x56072D4832642dB29225dA12d6Fd1290E4744682'],
      tokens: [
        new WrappedTokenInfo(
          {
            address: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73',
            name: 'Celo Euro',
            symbol: 'cEUR',
            chainId: 42220,
            decimals: 18,
            logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_cEUR.png',
          },
          []
        ),
        new WrappedTokenInfo(
          {
            address: '0x56072D4832642dB29225dA12d6Fd1290E4744682',
            name: 'Poof EUR V1',
            symbol: 'pEURxV1',
            chainId: 42220,
            decimals: 18,
            logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_pEUR.png',
          },
          []
        ),
      ],
      address: '0x382Ed834c6b7dBD10E4798B08889eaEd1455E820',
      lpToken: new Token(
        ChainId.MAINNET,
        '0x2642Ab16Bfb7A8b36EE42c9CbA2289C4Ca9F33b9',
        18,
        'MobLP',
        'Mobius pEUR V1 LP'
      ),
      swapFee: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('7')),
      rates: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      lendingPrecision: JSBI.BigInt('1'),
      precision: JSBI.BigInt('18'),
      feeDenominator: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('10')),
      precisionMul: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      feeIndex: 0,
      decimals: [JSBI.BigInt('18'), JSBI.BigInt('18')],
      peggedTo: '€',
      pegComesAfter: false,
      displayDecimals: 0,
      gaugeAddress: '0xCF34F4ec5DC9E09428A4f4a45475f6277694166c',
      additionalRewards: ['0x00400FcbF0816bebB94654259de7273f4A05c762', '0x17700282592D6917F6A73D0bF8AcCf4D578c131e'],
      additionalRewardRate: ['0', '0'],
      // additionalRewards: [''],
      // additionalRewardRate: ['730282730000000'],
      displayChain: Chain.Celo,
      coin: Coins.Eur,
      isKilled: true,
    },
    {
      name: 'Poof cUSD V1 [DISABLED]',
      warningType: WarningType.POOF,
      tokenAddresses: ['0xB4aa2986622249B1F45eb93F28Cfca2b2606d809'],
      tokens: [
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0xB4aa2986622249B1F45eb93F28Cfca2b2606d809',
            decimals: 18,
            symbol: 'pUSDxV1',
            name: 'Poof USD V1',
            logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_pUSD.png',
          },
          []
        ),
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0xd7Bf6946b740930c60131044bD2F08787e1DdBd4',
            decimals: 18,
            symbol: 'Mob LP',
            name: 'Mobius USDC LP',
            logoURI: 'https://bit.ly/3CwGimW',
          },
          []
        ),
      ],
      address: '0x81B6a3d9f725AB5d706d9e552b128bC5bB0B58a1',
      lpToken: new Token(
        ChainId.MAINNET,
        '0x57f008172cF89b972db3db7dD032e66BE4AF1A8c',
        18,
        'MobLP',
        'Mobius pUSD Meta LP'
      ),
      swapFee: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('7')),
      rates: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      lendingPrecision: JSBI.BigInt('1'),
      precision: JSBI.BigInt('18'),
      feeDenominator: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('10')),
      precisionMul: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      feeIndex: 0,
      decimals: [JSBI.BigInt('18'), JSBI.BigInt('18')],
      peggedTo: '$',
      pegComesAfter: false,
      displayDecimals: 0,
      gaugeAddress: '0x1250D6dd3B51D20c14a8ECb10CC2dd713967767e',
      metaPool: 'USDC (Optics)',
      displayChain: Chain.Celo,
      coin: Coins.USD,
      disabled: true,
      isKilled: true,
    },
  ],
  [ChainId.ALFAJORES]: [],
  [ChainId.BAKLAVA]: [],
}

export const MENTO_POOL_INFO: { [K in ChainId]: MentoConstants[] } = {
  [ChainId.MAINNET]: [
    {
      stable: StableToken.cUSD,
      tokens: [
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0x471EcE3750Da237f93B8E339c536989b8978a438',
            decimals: 18,
            symbol: 'CELO',
            name: 'Celo native asset',
            logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_CELO.png',
          },
          []
        ),
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
            decimals: 18,
            symbol: 'cUSD',
            name: 'Celo Dollar',
            logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_cUSD.png',
          },
          []
        ),
      ],
    },
    {
      stable: StableToken.cEUR,
      tokens: [
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0x471EcE3750Da237f93B8E339c536989b8978a438',
            decimals: 18,
            symbol: 'CELO',
            name: 'Celo native asset',
            logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_CELO.png',
          },
          []
        ),
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73',
            decimals: 18,
            symbol: 'cEUR',
            name: 'Celo Euro',
            logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_cEUR.png',
          },
          []
        ),
      ],
    },
  ],
  [ChainId.ALFAJORES]: [],
  [ChainId.BAKLAVA]: [],
}

//todo: replace Mainnet and Baklava Pool Addresses
type AddressMap = { [K in ChainId]: string }

export const LP_VEST_ADDRESSES: AddressMap = {
  [ChainId.MAINNET]: '0x74Fc71eF736feeaCfd58aeb2543c5fe4d33aDc14',
  [ChainId.ALFAJORES]: '0x9ff6d45F5900D7aCBdCb6d79fFFf22C9F63dF040',
  [ChainId.BAKLAVA]: '',
}

export const FOUNDER_VEST_ADDRESSES: AddressMap = {
  [ChainId.MAINNET]: '0x34deFd314fa23821a87FCbF5393311Bc5B7608C1',
  [ChainId.ALFAJORES]: '0x9ff6d45F5900D7aCBdCb6d79fFFf22C9F63dF040',
  [ChainId.BAKLAVA]: '',
}

export const INVESTOR_VEST_ADDRESSES: AddressMap = {
  [ChainId.MAINNET]: '0x5498248EaB20ff314bC465268920B48eed4Cdb7C',
  [ChainId.ALFAJORES]: '0x9ff6d45F5900D7aCBdCb6d79fFFf22C9F63dF040',
  [ChainId.BAKLAVA]: '',
}

export const ADVISOR_VEST_ADDRESSES: AddressMap = {
  [ChainId.MAINNET]: '0x54Bf52862E1Fdf0D43D9B19Abb5ec72acA0a25A6',
  [ChainId.ALFAJORES]: '0x9ff6d45F5900D7aCBdCb6d79fFFf22C9F63dF040',
  [ChainId.BAKLAVA]: '',
}

export const VestingAddresses: { [type in VestType]: AddressMap } = {
  [VestType.FOUNDER]: FOUNDER_VEST_ADDRESSES,
  [VestType.ADVISOR]: ADVISOR_VEST_ADDRESSES,
  [VestType.INVESTOR]: INVESTOR_VEST_ADDRESSES,
  [VestType.LP]: LP_VEST_ADDRESSES,
}
