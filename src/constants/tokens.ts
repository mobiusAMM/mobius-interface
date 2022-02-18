import { ChainId, Token } from '@ubeswap/sdk'
import mapValues from 'lodash/mapValues'
import { WrappedTokenInfo } from 'state/lists/hooks'

const makeTokens = (
  addresses: { [net in ChainId]: string },
  decimals: number,
  symbol: string,
  name: string
): { [net in ChainId]: Token } => {
  return mapValues(addresses, (tokenAddress, network) => {
    return new Token(parseInt(network), tokenAddress, decimals, symbol, name)
  })
}

export const MOBI = makeTokens(
  {
    [ChainId.MAINNET]: '0x73a210637f6F6B7005512677Ba6B3C96bb4AA44B',
    [ChainId.ALFAJORES]: '0x17a139f275102bBaB5BcbF1c4b7143F08B635EA2',
    [ChainId.BAKLAVA]: '0x00Be915B9dCf56a3CBE739D9B9c202ca692409EC',
  },
  18,
  'MOBI',
  'Mobius DAO Token'
)

export const CELO = makeTokens(
  {
    [ChainId.MAINNET]: '0x471EcE3750Da237f93B8E339c536989b8978a438',
    [ChainId.ALFAJORES]: '0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9',
    [ChainId.BAKLAVA]: '0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9',
  },
  18,
  'CELO',
  'Celo native asset'
)

export const CUSD = makeTokens(
  {
    [ChainId.MAINNET]: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
    [ChainId.ALFAJORES]: '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1',
    [ChainId.BAKLAVA]: '0x62492A644A588FD904270BeD06ad52B9abfEA1aE',
  },
  18,
  'cUSD',
  'Celo Dollar'
)

export const CEUR = makeTokens(
  {
    [ChainId.MAINNET]: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73',
    [ChainId.ALFAJORES]: '0x10c892A6EC43a53E45D0B916B4b7D383B1b78C0F',
    [ChainId.BAKLAVA]: '0xf9ecE301247aD2CE21894941830A2470f4E774ca',
  },
  18,
  'cEUR',
  'Celo Euro'
)

export const CREAL = makeTokens(
  {
    [ChainId.MAINNET]: '0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787',
    [ChainId.ALFAJORES]: '0xE4D517785D091D3c54818832dB6094bcc2744545',
    [ChainId.BAKLAVA]: '0xf9ecE301247aD2CE21894941830A2470f4E774ca',
  },
  18,
  'cREAL',
  'Celo Brazilian Real'
)

export const VEMOBI = makeTokens(
  {
    [ChainId.MAINNET]: '0xd813a846aA9D572140d7ABBB4eFaC8cD786b4c0E',
    [ChainId.ALFAJORES]: '0x7d64708ecf5201cfE74364424AddB0A8FD32174f',
    [ChainId.BAKLAVA]: '0xFe2434bcE62C9B4845fe0C57438f5F86fA4771A7',
  },
  18,
  'veMOBI',
  'Voting Escrow MOBI'
)

export const ExternalRewards: { [K in ChainId]: WrappedTokenInfo[] } = {
  [ChainId.MAINNET]: [
    new WrappedTokenInfo(
      {
        address: '0x00400FcbF0816bebB94654259de7273f4A05c762',
        name: 'Poof',
        symbol: 'POOF',
        chainId: ChainId.MAINNET,
        decimals: 18,
        logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_POOF.png',
      },
      []
    ),
    new WrappedTokenInfo(
      {
        address: '0x17700282592D6917F6A73D0bF8AcCf4D578c131e',
        name: 'Moola',
        symbol: 'MOO',
        chainId: ChainId.MAINNET,
        decimals: 18,
        logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_MOO.png',
      },
      []
    ),
    new WrappedTokenInfo(
      {
        address: '0x471EcE3750Da237f93B8E339c536989b8978a438',
        name: 'Celo',
        symbol: 'CELO',
        chainId: ChainId.MAINNET,
        decimals: 18,
        logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_CELO.png',
      },
      []
    ),
  ],
  [ChainId.ALFAJORES]: [],
  [ChainId.BAKLAVA]: [],
}
