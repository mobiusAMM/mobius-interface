import { Token } from '@ubeswap/sdk'
/**
 * Dedupes a list of tokens, picking the first instance of the token in a list.
 * @param tokens
 * @returns
 */
export const dedupeTokens = (tokens: Token[]): Token[] => {
  const seen = new Set<string>()
  return tokens.filter((token) => {
    const tokenID = `${token.address}_${token.chainId}`
    if (seen.has(tokenID)) {
      return false
    } else {
      seen.add(tokenID)
      return true
    }
  })
}
