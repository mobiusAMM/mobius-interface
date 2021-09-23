import { Token } from '@ubeswap/sdk'
import { WrappedTokenInfo } from 'state/lists/hooks'

import celoLogo from '../assets/images/celo-chain-logo.png'
import ethLogo from '../assets/images/ethereum-chain-logo.png'
import polygonLogo from '../assets/images/polygon-chain-logo.png'

export enum MultiChainIds {
  ETHEREUM = 1,
  POLYGON = 137,
  CELO = 42220,
  ALFAJORES = 44787,
  KOVAN = 42,
  RINKEBY = 4,
  BAKLAVA = 62320,
}

export type OpticsDomainInfo = {
  chainId: number
  bridgeRouter: string
  domain: number
  name: string
  logoUri: string
}

export const ETH_OPTICS: OpticsDomainInfo = {
  name: 'Ethereum',
  logoUri: ethLogo,
  chainId: 1,
  bridgeRouter: '0x6a39909e805A3eaDd2b61fFf61147796ca6aBB47',
  domain: 6648936,
}

export const POLYGON_OPTICS: OpticsDomainInfo = {
  name: 'Polygon',
  logoUri: polygonLogo,
  chainId: 137,
  bridgeRouter: '0xf244eA81F715F343040569398A4E7978De656bf6',
  domain: 1886350457,
}

export const CELO_OPTICS: OpticsDomainInfo = {
  name: 'Celo',
  logoUri: celoLogo,
  chainId: 42220,
  bridgeRouter: '0xf244eA81F715F343040569398A4E7978De656bf6',
  domain: 1667591279,
}

export const OpticsMainnetDomains = [ETH_OPTICS, POLYGON_OPTICS, CELO_OPTICS]

export const ALFAJORES_OPTICS: OpticsDomainInfo = {
  name: 'Celo Alfajores',
  logoUri: celoLogo,
  chainId: 44787,
  bridgeRouter: '0xd6930Ee55C141E5Bb4079d5963cF64320956bb3E',
  domain: 1000,
}

export const KOVAN_OPTICS: OpticsDomainInfo = {
  name: 'Ethereum Kovan',
  logoUri: ethLogo,
  chainId: 42,
  bridgeRouter: '0x359089D34687bDbFD019fCC5093fFC21bE9905f5',
  domain: 3000,
}

export const RINKEBY_OPTICS: OpticsDomainInfo = {
  name: 'Ethereum Rinkeby',
  logoUri: ethLogo,
  chainId: 4,
  bridgeRouter: '0x8FbEA25D0bFDbff68F2B920df180e9498E9c856A',
  domain: 2000,
}

export const OpticsDevDomains = [ALFAJORES_OPTICS, KOVAN_OPTICS, RINKEBY_OPTICS]

export const BridgeableTokens: { [chainId in MultiChainIds]: Token[] } = {
  [MultiChainIds.CELO]: [
    new WrappedTokenInfo(
      {
        symbol: 'USDC',
        name: 'US Dollar Coin (ETH)',
        address: '0x2A3684e9Dc20B857375EA04235F2F7edBe818FA7',
        chainId: MultiChainIds.CELO,
        logoURI: 'https://etherscan.io/token/images/centre-usdc_28.png',
        decimals: 6,
      },
      []
    ),
    new WrappedTokenInfo(
      {
        symbol: 'USDC',
        name: 'US Dollar Coin (POLY)',
        address: '0xcC82628f6A8dEFA1e2B0aD7ed448bef3647F7941',
        chainId: MultiChainIds.CELO,
        logoURI: 'https://etherscan.io/token/images/centre-usdc_28.png',
        decimals: 6,
      },
      []
    ),
    new WrappedTokenInfo(
      {
        symbol: 'wETH',
        name: 'Wrapped Ether',
        address: '0xE919F65739c26a42616b7b8eedC6b5524d1e3aC4',
        chainId: MultiChainIds.CELO,
        logoURI: 'https://etherscan.io/token/images/weth_28.png',
        decimals: 18,
      },
      []
    ),
    new WrappedTokenInfo(
      {
        symbol: 'WBTC',
        name: 'Wrapped BTC',
        address: '0xBe50a3013A1c94768A1ABb78c3cB79AB28fc1aCE',
        chainId: MultiChainIds.CELO,
        logoURI:
          'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png',
        decimals: 8,
      },
      []
    ),
  ],
  [MultiChainIds.ETHEREUM]: [
    new WrappedTokenInfo(
      {
        symbol: 'USDC',
        name: 'US Dollar Coin',
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        chainId: MultiChainIds.ETHEREUM,
        logoURI: 'https://etherscan.io/token/images/centre-usdc_28.png',
        decimals: 6,
      },
      []
    ),
    new WrappedTokenInfo(
      {
        symbol: 'wETH',
        name: 'Wrapped Ether',
        address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        chainId: MultiChainIds.ETHEREUM,
        logoURI: 'https://etherscan.io/token/images/weth_28.png',
        decimals: 18,
      },
      []
    ),
    new WrappedTokenInfo(
      {
        symbol: 'WBTC',
        name: 'Wrapped BTC',
        address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
        chainId: MultiChainIds.ETHEREUM,
        logoURI:
          'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png',
        decimals: 8,
      },
      []
    ),
  ],
  [MultiChainIds.POLYGON]: [
    new WrappedTokenInfo(
      {
        symbol: 'USDC',
        name: 'US Dollar Coin (PoS)',
        address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        chainId: MultiChainIds.POLYGON,
        logoURI: 'https://etherscan.io/token/images/centre-usdc_28.png',
        decimals: 6,
      },
      []
    ),
    // new WrappedTokenInfo(
    //   {
    //     symbol: 'Bridged USDC',
    //     name: 'Bridged US Dollar Coin',
    //     address: '0xe919f65739c26a42616b7b8eedc6b5524d1e3ac4',
    //     chainId: MultiChainIds.POLYGON,
    //     logoURI: 'https://etherscan.io/token/images/centre-usdc_28.png',
    //     decimals: 6,
    //   },
    //   []
    // ),
    new WrappedTokenInfo(
      {
        symbol: 'USDC',
        name: 'US Dollar Coin (ETH)',
        address: '0x2A3684e9Dc20B857375EA04235F2F7edBe818FA7',
        chainId: MultiChainIds.POLYGON,
        logoURI: 'https://etherscan.io/token/images/centre-usdc_28.png',
        decimals: 6,
      },
      []
    ),
  ],
  [MultiChainIds.ALFAJORES]: [],
  [MultiChainIds.BAKLAVA]: [],
  [MultiChainIds.KOVAN]: [
    new WrappedTokenInfo(
      {
        symbol: 'USDC',
        name: 'US Dollar Coin',
        address: '0x7079f3762805cff9c979a5bdc6f5648bcfee76c8',
        chainId: MultiChainIds.KOVAN,
        logoURI: 'https://etherscan.io/token/images/centre-usdc_28.png',
        decimals: 6,
      },
      []
    ),
    new WrappedTokenInfo(
      {
        symbol: 'wETH',
        name: 'Wrapped Ether',
        address: '0xf3a6679b266899042276804930b3bfbaf807f15b',
        chainId: MultiChainIds.KOVAN,
        logoURI: 'https://etherscan.io/token/images/weth_28.png',
        decimals: 18,
      },
      []
    ),
  ],
  [MultiChainIds.RINKEBY]: [
    new WrappedTokenInfo(
      {
        symbol: 'USDC',
        name: 'US Dollar Coin',
        address: '0xab5400b26149a3ff5918efcdeb2c37903042e9ee',
        chainId: MultiChainIds.RINKEBY,
        logoURI: 'https://etherscan.io/token/images/centre-usdc_28.png',
        decimals: 6,
      },
      []
    ),
    new WrappedTokenInfo(
      {
        symbol: 'wETH',
        name: 'Wrapped Ether',
        address: '0xdf032bc4b9dc2782bb09352007d4c57b75160b15',
        chainId: MultiChainIds.RINKEBY,
        logoURI: 'https://etherscan.io/token/images/weth_28.png',
        decimals: 18,
      },
      []
    ),
  ],
}
