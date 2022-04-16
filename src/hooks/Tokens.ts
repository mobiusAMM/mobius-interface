import UBE_TOKENS from '@ubeswap/default-token-list'
import { ChainId, Token } from '@ubeswap/sdk'
import { WrappedTokenInfo } from 'state/lists/hooks'
import { dedupeTokens } from 'utils/tokens'

import { CHAIN } from '../constants'
import { MENTO_POOL_INFO, MOBI_TOKEN, STATIC_POOL_INFO } from '../constants/StablePools'
import { ExternalRewards, VEMOBI } from '../constants/tokens'
import { isAddress } from '../utils'

export function useSwappableTokens(mento: boolean): Token[] {
  if (mento) {
    return dedupeTokens(MENTO_POOL_INFO[CHAIN].flatMap(({ tokens }) => tokens))
  }
  return getAllTokens() ?? []
}

export function useDefaultTokens(): { [address: string]: Token } {
  return {}
}

export function useAllTokens(): { [address: string]: Token } {
  return {}
}

export function useAllInactiveTokens(): { [address: string]: Token } {
  return {}
}

function getUbeTokenList(chain: ChainId): Token[] | null {
  return UBE_TOKENS.tokens.filter(({ chainId }) => chainId === chain).map((info) => new WrappedTokenInfo(info, []))
}

export function getAllTokens(): Token[] | null {
  const StableTokensWithDup = STATIC_POOL_INFO[CHAIN].flatMap((pools) => pools.tokens)
  const MentoTokensWithDup = MENTO_POOL_INFO[CHAIN].flatMap((pools) => pools.tokens)
  const UbeTokenList = getUbeTokenList(CHAIN) ?? []
  return dedupeTokens(
    MentoTokensWithDup.concat(StableTokensWithDup).concat(ExternalRewards[CHAIN]).concat(UbeTokenList)
  )
}

// undefined if invalid or does not exist
// null if loading
// otherwise returns the token
export function addressToToken(tokenAddress?: string): Token | null {
  const tokens = getAllTokens()

  const address = isAddress(tokenAddress)
  const token = tokens?.filter((t) => t.address === address)[0]
  return token ?? null
}

export function useCurrency(currencyId: string | undefined): Token | null {
  const token = addressToToken(currencyId)
  return token
}

export function useMobi(): Token | undefined {
  return MOBI_TOKEN[CHAIN]
}

export function useVeMobi(): Token | undefined {
  return VEMOBI[CHAIN]
}
