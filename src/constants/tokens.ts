import { ChainId, Token } from 'lib/token-utils'
import mapValues from 'lodash/mapValues'
import { VestType } from 'state/claim/reducer'

const makeTokens = (
  addresses: { [net in ChainId]: string },
  decimals: number,
  symbol: string,
  name: string,
  logoURI: string
): { [net in ChainId]: Token } => {
  return mapValues(addresses, (tokenAddress, network) => {
    return new Token({ chainId: parseInt(network), address: tokenAddress, decimals, symbol, name, logoURI })
  })
}

export const MOBI = makeTokens(
  {
    [ChainId.Mainnet]: '0x73a210637f6F6B7005512677Ba6B3C96bb4AA44B',
    [ChainId.Alfajores]: '0x17a139f275102bBaB5BcbF1c4b7143F08B635EA2',
    [ChainId.Baklava]: '0x00Be915B9dCf56a3CBE739D9B9c202ca692409EC',
  },
  18,
  'MOBI',
  'Mobius DAO Token',
  'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_MOBI.png'
)

export const CELO = makeTokens(
  {
    [ChainId.Mainnet]: '0x471EcE3750Da237f93B8E339c536989b8978a438',
    [ChainId.Alfajores]: '0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9',
    [ChainId.Baklava]: '0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9',
  },
  18,
  'CELO',
  'Celo native asset',
  'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_CELO.png'
)

export const CUSD = makeTokens(
  {
    [ChainId.Mainnet]: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
    [ChainId.Alfajores]: '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1',
    [ChainId.Baklava]: '0x62492A644A588FD904270BeD06ad52B9abfEA1aE',
  },
  18,
  'cUSD',
  'Celo Dollar',
  'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_cUSD.png'
)

export const CEUR = makeTokens(
  {
    [ChainId.Mainnet]: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73',
    [ChainId.Alfajores]: '0x10c892A6EC43a53E45D0B916B4b7D383B1b78C0F',
    [ChainId.Baklava]: '0xf9ecE301247aD2CE21894941830A2470f4E774ca',
  },
  18,
  'cEUR',
  'Celo Euro',
  'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_cEUR.png'
)

export const CREAL = makeTokens(
  {
    [ChainId.Mainnet]: '0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787',
    [ChainId.Alfajores]: '0xE4D517785D091D3c54818832dB6094bcc2744545',
    [ChainId.Baklava]: '0xf9ecE301247aD2CE21894941830A2470f4E774ca',
  },
  18,
  'cREAL',
  'Celo Brazilian Real',
  'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_cREAL.png'
)

export const VEMOBI = makeTokens(
  {
    [ChainId.Mainnet]: '0xd813a846aA9D572140d7ABBB4eFaC8cD786b4c0E',
    [ChainId.Alfajores]: '0x7d64708ecf5201cfE74364424AddB0A8FD32174f',
    [ChainId.Baklava]: '0xFe2434bcE62C9B4845fe0C57438f5F86fA4771A7',
  },
  18,
  'veMOBI',
  'Voting Escrow MOBI',
  'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_MOBI.png'
)

export const UST = makeTokens(
  {
    [ChainId.Mainnet]: '0xEd193C4E69F591E42398eF54DEa65aa1bb02835c',
    [ChainId.Alfajores]: '0xEd193C4E69F591E42398eF54DEa65aa1bb02835c',
    [ChainId.Baklava]: '0xEd193C4E69F591E42398eF54DEa65aa1bb02835c',
  },
  18,
  'UST',
  'Terra USD',
  'https://raw.githubusercontent.com/kyscott18/default-token-list/master/assets/asset_UST.png'
)

export const CETH = makeTokens(
  {
    [ChainId.Mainnet]: '0x2DEf4285787d58a2f811AF24755A8150622f4361',
    [ChainId.Alfajores]: '0x2DEf4285787d58a2f811AF24755A8150622f4361',
    [ChainId.Baklava]: '0x2DEf4285787d58a2f811AF24755A8150622f4361',
  },
  18,
  'cETH',
  'Wrapped Ethereum',
  'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_cETH.svg'
)

export const WETH = makeTokens(
  {
    [ChainId.Mainnet]: '0x122013fd7dF1C6F636a5bb8f03108E876548b455',
    [ChainId.Alfajores]: '0x122013fd7dF1C6F636a5bb8f03108E876548b455',
    [ChainId.Baklava]: '0x122013fd7dF1C6F636a5bb8f03108E876548b455',
  },
  18,
  'wETH',
  'Wrapped Ether (Optics Bridge)',
  'https://etherscan.io/token/images/weth_28.png'
)

export const ExternalRewards: { [K in ChainId]: Token[] } = {
  [ChainId.Mainnet]: [
    new Token({
      address: '0x00400FcbF0816bebB94654259de7273f4A05c762',
      name: 'Poof',
      symbol: 'POOF',
      chainId: ChainId.Mainnet,
      decimals: 18,
      logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_POOF.png',
    }),
    new Token({
      address: '0x17700282592D6917F6A73D0bF8AcCf4D578c131e',
      name: 'Moola',
      symbol: 'MOO',
      chainId: ChainId.Mainnet,
      decimals: 18,
      logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_MOO.png',
    }),
    new Token({
      address: '0x471EcE3750Da237f93B8E339c536989b8978a438',
      name: 'Celo',
      symbol: 'CELO',
      chainId: ChainId.Mainnet,
      decimals: 18,
      logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_CELO.png',
    }),
  ],
  [ChainId.Alfajores]: [],
  [ChainId.Baklava]: [],
}

type AddressMap = { [K in ChainId]: string }

export const LP_VEST_ADDRESSES: AddressMap = {
  [ChainId.Mainnet]: '0x74Fc71eF736feeaCfd58aeb2543c5fe4d33aDc14',
  [ChainId.Alfajores]: '0x9ff6d45F5900D7aCBdCb6d79fFFf22C9F63dF040',
  [ChainId.Baklava]: '',
}

export const FOUNDER_VEST_ADDRESSES: AddressMap = {
  [ChainId.Mainnet]: '0x34deFd314fa23821a87FCbF5393311Bc5B7608C1',
  [ChainId.Alfajores]: '0x9ff6d45F5900D7aCBdCb6d79fFFf22C9F63dF040',
  [ChainId.Baklava]: '',
}

export const INVESTOR_VEST_ADDRESSES: AddressMap = {
  [ChainId.Mainnet]: '0x5498248EaB20ff314bC465268920B48eed4Cdb7C',
  [ChainId.Alfajores]: '0x9ff6d45F5900D7aCBdCb6d79fFFf22C9F63dF040',
  [ChainId.Baklava]: '',
}

export const ADVISOR_VEST_ADDRESSES: AddressMap = {
  [ChainId.Mainnet]: '0x54Bf52862E1Fdf0D43D9B19Abb5ec72acA0a25A6',
  [ChainId.Alfajores]: '0x9ff6d45F5900D7aCBdCb6d79fFFf22C9F63dF040',
  [ChainId.Baklava]: '',
}

export const VestingAddresses: { [type in VestType]: AddressMap } = {
  [VestType.FOUNDER]: FOUNDER_VEST_ADDRESSES,
  [VestType.ADVISOR]: ADVISOR_VEST_ADDRESSES,
  [VestType.INVESTOR]: INVESTOR_VEST_ADDRESSES,
  [VestType.LP]: LP_VEST_ADDRESSES,
}
