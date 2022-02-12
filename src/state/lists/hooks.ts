import { ChainId, Token } from '@ubeswap/sdk'
import { Tags, TokenInfo, TokenList } from '@uniswap/token-lists'
import { useSelector } from 'react-redux'

import { AppState } from '../index'
import { UNSUPPORTED_LIST_URLS } from './../../constants/lists'

type TagDetails = Tags[keyof Tags]
export interface TagInfo extends TagDetails {
  id: string
}

export const StableTokens: TokenList = {
  name: 'Mobius',
  timestamp: '2021-08-10T17:02:02.069Z',
  tokens: [
    {
      address: '0x00400FcbF0816bebB94654259de7273f4A05c762',
      name: 'Poof',
      symbol: 'POOF',
      chainId: ChainId.MAINNET,
      decimals: 18,
      logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_POOF.png',
    },
    {
      address: '0x17700282592D6917F6A73D0bF8AcCf4D578c131e',
      name: 'Moola',
      symbol: 'MOO',
      chainId: ChainId.MAINNET,
      decimals: 18,
      logoURI: '"https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_MOO.png"',
    },
    {
      chainId: ChainId.MAINNET,
      address: '0x471EcE3750Da237f93B8E339c536989b8978a438',
      decimals: 18,
      symbol: 'Celo',
      name: 'Celo',
      logoURI: '',
    },
    {
      chainId: ChainId.ALFAJORES,
      address: '0x7588110A070987ea0347Cf788226c28d1476d641',
      decimals: 18,
      symbol: 'cUSD',
      name: 'Celo Dollar',
      logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_cUSD.png',
    },
    {
      chainId: ChainId.ALFAJORES,
      address: '0x17Ec8dab839a9880D656c3cEF40cf4038657d168',
      decimals: 18,
      symbol: 'USDT',
      name: 'Tether',
      logoURI: 'https://bit.ly/3AMrCyD',
    },
    {
      chainId: ChainId.ALFAJORES,
      address: '0xCC531BfBA46cA251D3D9f3aCc37ABD5DCF3ed0B3',
      decimals: 18,
      symbol: 'USDC',
      name: 'US Dollar Coin',
      logoURI: 'https://bit.ly/3CwGimW',
    },
    {
      chainId: ChainId.ALFAJORES,
      address: '0x2AaF20d89277BF024F463749045964D7e7d3A774',
      decimals: 18,
      symbol: 'cTC1',
      name: 'Test Coin 1',
      logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_sCELO.png',
    },
    {
      chainId: ChainId.ALFAJORES,
      address: '0x3551d53C9CF91E222D9579A1Ac4B44117E8Ec609',
      decimals: 18,
      symbol: 'cTC2',
      name: 'Test Coin 2',
      logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_rCELO.png',
    },
  ],
  version: {
    major: 1,
    minor: 0,
    patch: 0,
  },
}

/**
 * Token instances created from token info.
 */
export class WrappedTokenInfo extends Token {
  public readonly tokenInfo: TokenInfo
  public readonly tags: TagInfo[]
  constructor(tokenInfo: TokenInfo, tags: TagInfo[]) {
    super(tokenInfo.chainId, tokenInfo.address, tokenInfo.decimals, tokenInfo.symbol, tokenInfo.name)
    this.tokenInfo = tokenInfo
    this.tags = tags
  }
  public get logoURI(): string | undefined {
    return this.tokenInfo.logoURI
  }
}

export type TokenAddressMap = Readonly<{
  [chainId: number]: Readonly<{
    [tokenAddress: string]: { token: WrappedTokenInfo; list: TokenList }
  }>
}>

/**
 * An empty result, useful as a default.
 */
const EMPTY_LIST: TokenAddressMap = {
  [ChainId.MAINNET]: {},
  [ChainId.ALFAJORES]: {},
  [ChainId.BAKLAVA]: {},
}

const listCache: WeakMap<TokenList, TokenAddressMap> | null =
  typeof WeakMap !== 'undefined' ? new WeakMap<TokenList, TokenAddressMap>() : null

export function listToTokenMap(list: TokenList): TokenAddressMap {
  const result = listCache?.get(list)
  if (result) return result

  const map = list.tokens.reduce<TokenAddressMap>(
    (tokenMap, tokenInfo) => {
      const tags: TagInfo[] =
        tokenInfo.tags
          ?.map((tagId) => {
            if (!list.tags?.[tagId]) return undefined
            return { ...list.tags[tagId], id: tagId }
          })
          ?.filter((x): x is TagInfo => Boolean(x)) ?? []
      const token = new WrappedTokenInfo(tokenInfo, tags)
      if (tokenMap[token.chainId]?.[token.address] !== undefined) throw Error('Duplicate tokens.')
      return {
        ...tokenMap,
        [token.chainId]: {
          ...tokenMap[token.chainId],
          [token.address]: {
            token,
            list: list,
          },
        },
      }
    },
    { ...EMPTY_LIST }
  )
  listCache?.set(list, map)
  return map
}

export function useAllLists(): {
  readonly [url: string]: {
    readonly current: TokenList | null
    readonly pendingUpdate: TokenList | null
    readonly loadingRequestId: string | null
    readonly error: string | null
  }
} {
  return useSelector<AppState, AppState['lists']['byUrl']>((state) => state.lists.byUrl)
}

// filter out unsupported lists
export function useActiveListUrls(): string[] | undefined {
  return useSelector<AppState, AppState['lists']['activeListUrls']>((state) => state.lists.activeListUrls)?.filter(
    (url) => !UNSUPPORTED_LIST_URLS.includes(url)
  )
}

// used to hide warnings on import for default tokens
export function useDefaultTokenList(): TokenAddressMap {
  return listToTokenMap(StableTokens)
}
