import { Token } from '@ubeswap/sdk'
import { dedupeTokens } from 'utils/tokens'

import { CHAIN } from '../constants'
import { MENTO_POOL_INFO, MOBI_TOKEN, STATIC_POOL_INFO } from '../constants/StablePools'
import { ExternalRewards, VEMOBI } from '../constants/tokens'
import { isAddress } from '../utils'

export function useSwappableTokens(mento: boolean): Token[] {
  const pools = mento ? MENTO_POOL_INFO[CHAIN] : STATIC_POOL_INFO[CHAIN].filter((pool) => !pool.disabled)
  return dedupeTokens(pools.flatMap(({ tokens }) => tokens))
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

function getAllTokens(): Token[] | null {
  const StableTokensWithDup = STATIC_POOL_INFO[CHAIN].flatMap((pools) => pools.tokens)
  const MentoTokensWithDup = MENTO_POOL_INFO[CHAIN].flatMap((pools) => pools.tokens)
  return dedupeTokens(MentoTokensWithDup.concat(StableTokensWithDup).concat(ExternalRewards[CHAIN]))
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
