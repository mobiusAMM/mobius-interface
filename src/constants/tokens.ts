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

export const USDC = makeTokens(
  {
    [ChainId.Mainnet]: '0xef4229c8c3250C675F21BCefa42f58EfbfF6002a',
    [ChainId.Alfajores]: '0xef4229c8c3250C675F21BCefa42f58EfbfF6002a',
    [ChainId.Baklava]: '0xef4229c8c3250C675F21BCefa42f58EfbfF6002a',
  },
  6,
  'cUSDC',
  'US Dollar Coin (Optics Bridge)',
  'https://bit.ly/3CwGimW'
)

export const DAI = makeTokens(
  {
    [ChainId.Mainnet]: '0x90Ca507a5D4458a4C6C6249d186b6dCb02a5BCCd',
    [ChainId.Alfajores]: '0x90Ca507a5D4458a4C6C6249d186b6dCb02a5BCCd',
    [ChainId.Baklava]: '0x90Ca507a5D4458a4C6C6249d186b6dCb02a5BCCd',
  },
  18,
  'DAI',
  'Optics DAI',
  'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_DAI.png'
)

export const CBTC = makeTokens(
  {
    [ChainId.Mainnet]: '0xD629eb00dEced2a080B7EC630eF6aC117e614f1b',
    [ChainId.Alfajores]: '0xD629eb00dEced2a080B7EC630eF6aC117e614f1b',
    [ChainId.Baklava]: '0xD629eb00dEced2a080B7EC630eF6aC117e614f1b',
  },
  18,
  'cBTC',
  'Wrapped Bitcoin',
  'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_cBTC.png'
)

export const WBTC = makeTokens(
  {
    [ChainId.Mainnet]: '0xBAAB46E28388d2779e6E31Fd00cF0e5Ad95E327B',
    [ChainId.Alfajores]: '0xBAAB46E28388d2779e6E31Fd00cF0e5Ad95E327B',
    [ChainId.Baklava]: '0xBAAB46E28388d2779e6E31Fd00cF0e5Ad95E327B',
  },
  8,
  'wBTC',
  'Wrapped Bitcoin (Optics Bridge)',
  'https://etherscan.io/token/images/wbtc_28.png?v=1'
)

export const PUSDC = makeTokens(
  {
    [ChainId.Mainnet]: '0x1bfc26cE035c368503fAE319Cc2596716428ca44',
    [ChainId.Alfajores]: '0x1bfc26cE035c368503fAE319Cc2596716428ca44',
    [ChainId.Baklava]: '0x1bfc26cE035c368503fAE319Cc2596716428ca44',
  },
  6,
  'pUSDC',
  'USD Coin (PoS Optics)',
  'https://bit.ly/3CwGimW'
)

export const USDC1 = makeTokens(
  {
    [ChainId.Mainnet]: '0x2A3684e9Dc20B857375EA04235F2F7edBe818FA7',
    [ChainId.Alfajores]: '0x2A3684e9Dc20B857375EA04235F2F7edBe818FA7',
    [ChainId.Baklava]: '0x2A3684e9Dc20B857375EA04235F2F7edBe818FA7',
  },
  6,
  'cUSDCxV1',
  'US Dollar Coin (Optics Bridge)',
  'https://bit.ly/3CwGimW'
)

export const AAUSDC = makeTokens(
  {
    [ChainId.Mainnet]: '0xb70e0a782b058BFdb0d109a3599BEc1f19328E36',
    [ChainId.Alfajores]: '0xb70e0a782b058BFdb0d109a3599BEc1f19328E36',
    [ChainId.Baklava]: '0xb70e0a782b058BFdb0d109a3599BEc1f19328E36',
  },
  18,
  'aaUSDC',
  'US Dollar Coin (Avalanche Allbridge)',
  'https://bit.ly/3CwGimW'
)

export const PUSD = makeTokens(
  {
    [ChainId.Mainnet]: '0xEadf4A7168A82D30Ba0619e64d5BCf5B30B45226',
    [ChainId.Alfajores]: '0xEadf4A7168A82D30Ba0619e64d5BCf5B30B45226',
    [ChainId.Baklava]: '0xEadf4A7168A82D30Ba0619e64d5BCf5B30B45226',
  },
  18,
  'pUSD',
  'Poof USD V2',
  'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_pUSD.png'
)

export const PCELO = makeTokens(
  {
    [ChainId.Mainnet]: '0x301a61D01A63c8D670c2B8a43f37d12eF181F997',
    [ChainId.Alfajores]: '0x301a61D01A63c8D670c2B8a43f37d12eF181F997',
    [ChainId.Baklava]: '0x301a61D01A63c8D670c2B8a43f37d12eF181F997',
  },
  18,
  'pCELO',
  'Poof CELO V2',
  'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_pCELO.png'
)

export const PEUR = makeTokens(
  {
    [ChainId.Mainnet]: '0xD8761DD6c7cB54febD33adD699F5E4440b62E01B',
    [ChainId.Alfajores]: '0xD8761DD6c7cB54febD33adD699F5E4440b62E01B',
    [ChainId.Baklava]: '0xD8761DD6c7cB54febD33adD699F5E4440b62E01B',
  },
  18,
  'pEUR',
  'Poof EUR',
  'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_pEUR.png'
)

export const PUSD1 = makeTokens(
  {
    [ChainId.Mainnet]: '0xB4aa2986622249B1F45eb93F28Cfca2b2606d809',
    [ChainId.Alfajores]: '0xB4aa2986622249B1F45eb93F28Cfca2b2606d809',
    [ChainId.Baklava]: '0xB4aa2986622249B1F45eb93F28Cfca2b2606d809',
  },
  18,
  'pUSDxV1',
  'Poof USD V1',
  'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_pUSD.png'
)

export const ASUSDC = makeTokens(
  {
    [ChainId.Mainnet]: '0xCD7D7Ff64746C1909E44Db8e95331F9316478817',
    [ChainId.Alfajores]: '0xCD7D7Ff64746C1909E44Db8e95331F9316478817',
    [ChainId.Baklava]: '0xCD7D7Ff64746C1909E44Db8e95331F9316478817',
  },
  18,
  'asUSDC',
  'US Dollar Coin (Solana Allbridge)',
  'https://bit.ly/3CwGimW'
)

export const PUSDC1 = makeTokens(
  {
    [ChainId.Mainnet]: '0xcC82628f6A8dEFA1e2B0aD7ed448bef3647F7941',
    [ChainId.Alfajores]: '0xcC82628f6A8dEFA1e2B0aD7ed448bef3647F7941',
    [ChainId.Baklava]: '0xcC82628f6A8dEFA1e2B0aD7ed448bef3647F7941',
  },
  6,
  'pUSDCxV1',
  'USD Coin (PoS Optics)',
  'https://bit.ly/3CwGimW'
)

export const CBTC1 = makeTokens(
  {
    [ChainId.Mainnet]: '0xD629eb00dEced2a080B7EC630eF6aC117e614f1b',
    [ChainId.Alfajores]: '0xD629eb00dEced2a080B7EC630eF6aC117e614f1b',
    [ChainId.Baklava]: '0xD629eb00dEced2a080B7EC630eF6aC117e614f1b',
  },
  18,
  'cBTC',
  'Wrapped Bitcoin',
  'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_cBTC.png'
)

export const WBTC1 = makeTokens(
  {
    [ChainId.Mainnet]: '0xBe50a3013A1c94768A1ABb78c3cB79AB28fc1aCE',
    [ChainId.Alfajores]: '0xBe50a3013A1c94768A1ABb78c3cB79AB28fc1aCE',
    [ChainId.Baklava]: '0xBe50a3013A1c94768A1ABb78c3cB79AB28fc1aCE',
  },
  8,
  'wBTCxV1',
  'Wrapped Bitcoin (Optics Bridge)',
  'https://etherscan.io/token/images/wbtc_28.png?v=1'
)

export const CETH1 = makeTokens(
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

export const WETH1 = makeTokens(
  {
    [ChainId.Mainnet]: '0xE919F65739c26a42616b7b8eedC6b5524d1e3aC4',
    [ChainId.Alfajores]: '0xE919F65739c26a42616b7b8eedC6b5524d1e3aC4',
    [ChainId.Baklava]: '0xE919F65739c26a42616b7b8eedC6b5524d1e3aC4',
  },
  18,
  'wETHxV1',
  'Wrapped Ether (Optics Bridge)',
  'https://etherscan.io/token/images/weth_28.png'
)

export const USDTM = makeTokens(
  {
    [ChainId.Mainnet]: '0xcFFfE0c89a779c09Df3DF5624f54cDf7EF5fDd5D',
    [ChainId.Alfajores]: '0xcFFfE0c89a779c09Df3DF5624f54cDf7EF5fDd5D',
    [ChainId.Baklava]: '0xcFFfE0c89a779c09Df3DF5624f54cDf7EF5fDd5D',
  },
  18,
  'cUSDTm',
  'Tether (Moss Bridge)',
  'https://bit.ly/3AMrCyD'
)

export const USDTC = makeTokens(
  {
    [ChainId.Mainnet]: '0x93DB49bE12B864019dA9Cb147ba75cDC0506190e',
    [ChainId.Alfajores]: '0x93DB49bE12B864019dA9Cb147ba75cDC0506190e',
    [ChainId.Baklava]: '0x93DB49bE12B864019dA9Cb147ba75cDC0506190e',
  },
  18,
  'cUSDCm',
  'US Dollar Coin (Moss Bridge)',
  'https://bit.ly/3CwGimW'
)

export const PCELO1 = makeTokens(
  {
    [ChainId.Mainnet]: '0xE74AbF23E1Fdf7ACbec2F3a30a772eF77f1601E1',
    [ChainId.Alfajores]: '0xE74AbF23E1Fdf7ACbec2F3a30a772eF77f1601E1',
    [ChainId.Baklava]: '0xE74AbF23E1Fdf7ACbec2F3a30a772eF77f1601E1',
  },
  18,
  'pCELOxV1',
  'Poof Celo V1',
  'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_pCELO.png'
)

export const PEUR1 = makeTokens(
  {
    [ChainId.Mainnet]: '0x56072D4832642dB29225dA12d6Fd1290E4744682',
    [ChainId.Alfajores]: '0x56072D4832642dB29225dA12d6Fd1290E4744682',
    [ChainId.Baklava]: '0x56072D4832642dB29225dA12d6Fd1290E4744682',
  },
  18,
  'pEURxV1',
  'Poof EUR V1',
  'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_pEUR.png'
)

export const POOF = makeTokens(
  {
    [ChainId.Mainnet]: '0x00400FcbF0816bebB94654259de7273f4A05c762',
    [ChainId.Alfajores]: '0x00400FcbF0816bebB94654259de7273f4A05c762',
    [ChainId.Baklava]: '0x00400FcbF0816bebB94654259de7273f4A05c762',
  },
  18,
  'Poof',
  'POOF',
  'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_POOF.png'
)

export const MOO = makeTokens(
  {
    [ChainId.Mainnet]: '0x17700282592D6917F6A73D0bF8AcCf4D578c131e',
    [ChainId.Alfajores]: '0x17700282592D6917F6A73D0bF8AcCf4D578c131e',
    [ChainId.Baklava]: '0x17700282592D6917F6A73D0bF8AcCf4D578c131e',
  },
  18,
  'Moola',
  'MOO',
  'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_MOO.png'
)

export const ExternalRewards: { [K in ChainId]: Token[] } = {
  [ChainId.Mainnet]: [POOF[ChainId.Mainnet], MOO[ChainId.Mainnet], CELO[ChainId.Mainnet]],
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
