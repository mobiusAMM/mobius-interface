import { arrayify } from '@ethersproject/bytes'
import { parseBytes32String } from '@ethersproject/strings'
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

// parse a name or symbol from a token response
const BYTES32_REGEX = /^0x[a-fA-F0-9]{64}$/

function parseStringOrBytes32(str: string | undefined, bytes32: string | undefined, defaultValue: string): string {
  return str && str.length > 0
    ? str
    : // need to check for proper bytes string and valid terminator
    bytes32 && BYTES32_REGEX.test(bytes32) && arrayify(bytes32)[31] === 0
    ? parseBytes32String(bytes32)
    : defaultValue
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
