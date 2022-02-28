import type { Token as UToken } from '@ubeswap/token-math'

import { Alfajores, Baklava, ChainId, Mainnet, Network } from './'
import type { TokenInfo } from './tokenList'

/**
 * Token information.
 */
export class Token implements UToken<Token> {
  /**
   * The network that the Token is on.
   */
  readonly network: Network

  constructor(readonly info: TokenInfo) {
    this.network = chainIdToNetwork(info.chainId) ?? 'localnet'
  }

  /**
   * The Base58 string representation of the mint address.
   */
  get address(): string {
    return this.info.address
  }

  /**
   * The chain ID of the token.
   */
  get chainId(): number {
    return this.info.chainId
  }

  /**
   * Number of decimals of the token.
   */
  get decimals(): number {
    return this.info.decimals
  }

  /**
   * The name of the token.
   */
  get name(): string {
    return this.info.name
  }

  /**
   * The symbol of the token.
   */
  get symbol(): string {
    return this.info.symbol
  }

  /**
   * The token's icon to render.
   */
  get icon(): string | undefined {
    return this.info.logoURI
  }

  equals(other: Token): boolean {
    return tokensEqual(this, other)
  }

  toString(): string {
    return `Token[address=${this.address}, decimals=${this.decimals}, network=${this.network}]`
  }

  toJSON(): unknown {
    return this.info
  }

  /**
   * Returns true if the given tag is present.
   * @param tag The tag to check.
   * @returns
   */
  hasTag(tag: string): boolean {
    return !!this.info.tags?.includes(tag)
  }
}

/**
 * Checks if two tokens are equal.
 * @param a
 * @param b
 * @returns
 */
export const tokensEqual = (a: Token | undefined, b: Token | undefined): boolean =>
  a !== undefined && b !== undefined && a.address === b.address && a.network === b.network

/**
 * Map of network to Token
 */
export type TokenMap = { [c in ChainId]: Token }

export const CHAIN_ID_TO_NETWORK = {
  [ChainId.MAINNET]: Mainnet,
  [ChainId.ALFAJORES]: Alfajores,
  [ChainId.BAKLAVA]: Baklava,
}

/**
 * Gets the Network associated with a chain id.
 * @param network
 * @returns
 */
export const chainIdToNetwork = (env: ChainId): Network => CHAIN_ID_TO_NETWORK[env]
