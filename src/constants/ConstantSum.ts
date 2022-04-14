import { ChainId, Token } from 'lib/token-utils'

import { USDC, USDC1, WBTC, WBTC1, WETH, WETH1 } from './tokens'

export type ConstantSumInfo = {
  address: string
  tokens: [Token, Token]
}

export const ConstantSum: { [K in ChainId]: ConstantSumInfo[] } = {
  [ChainId.Mainnet]: [
    {
      // wETH v1/v2 pool
      address: '0xb1a0BDe36341065cA916c9f5619aCA82A43659A3',
      tokens: [WETH1[ChainId.Mainnet], WETH[ChainId.Mainnet]],
    },
    {
      // BTC v1/v2
      address: '0xd5ab1BA8b2Ec70752068d1d728e728eAd0E19CBA',
      tokens: [WBTC1[ChainId.Mainnet], WBTC[ChainId.Mainnet]],
    },
    {
      // USDC v1/v2
      address: '0x70bfA1C8Ab4e42B9BE74f65941EFb6e5308148c7',
      tokens: [USDC1[ChainId.Mainnet], USDC[ChainId.Mainnet]],
    },
    // {
    //   // TEST pool
    //   address: '0xdd61Ab1e6a9A18ad16F952e23e973C94E877e809',
    //   tokens: [
    //     new WrappedTokenInfo(
    //       {
    //         chainId: ChainId.MAINNET,
    //         address: '0xC271C9c30C0185d461B51D6B2C8A71EA8E541FBE',
    //         decimals: 8,
    //         symbol: 'TESTxV1',
    //         name: 'US Dollar Coin (Optics Bridge)',
    //         logoURI: 'https://bit.ly/3CwGimW',
    //       },
    //       []
    //     ),
    //     new WrappedTokenInfo(
    //       {
    //         chainId: ChainId.MAINNET,
    //         address: '0xf505453b50477a6099E9a86b2B7977Ff6F7Fa306',
    //         decimals: 8,
    //         symbol: 'TEST',
    //         name: 'US Dollar Coin (Optics Bridge)',
    //         logoURI: 'https://bit.ly/3CwGimW',
    //       },
    //       []
    //     ),
    //   ],
    // },
  ],
  [ChainId.Alfajores]: [],
  [ChainId.Baklava]: [],
}
