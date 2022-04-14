/**
 * These types all come from the @solana/spl-token-registry package.
 *
 * We re-export them here so we do not have to have a hard dependency on
 * that package, which is massive.
 */

export enum ChainId {
  Mainnet = 42220,
  Alfajores = 44787,
  Baklava = 62320,
}
export enum TradeType {
  EXACT_INPUT = 0,
  EXACT_OUTPUT = 1,
}

export enum NetworkNames {
  Alfajores = 'Alfajores',
  Baklava = 'Baklava',
  Mainnet = 'Mainnet',
}

export interface Network {
  name: NetworkNames
  rpcUrl: string
  graphQl: string
  explorer: string
  chainId: ChainId
}

export const Alfajores: Network = {
  name: NetworkNames.Alfajores,
  rpcUrl: 'https://alfajores-forno.celo-testnet.org',
  graphQl: 'https://alfajores-blockscout.celo-testnet.org/graphiql',
  explorer: 'https://alfajores-blockscout.celo-testnet.org',
  chainId: ChainId.Alfajores,
}
export const Baklava: Network = {
  name: NetworkNames.Baklava,
  rpcUrl: 'https://baklava-forno.celo-testnet.org',
  graphQl: 'https://baklava-blockscout.celo-testnet.org/graphiql',
  explorer: 'https://baklava-blockscout.celo-testnet.org',
  chainId: ChainId.Baklava,
}
export const Mainnet: Network = {
  name: NetworkNames.Mainnet,
  rpcUrl: 'https://forno.celo.org',
  graphQl: 'https://explorer.celo.org/graphiql',
  explorer: 'https://explorer.celo.org',
  chainId: ChainId.Mainnet,
}

/**
 * A token list.
 */
export interface SPLTokenList {
  readonly name: string
  readonly logoURI: string
  readonly tags: { [tag: string]: TagDetails }
  readonly timestamp: string
  readonly tokens: SPLTokenInfo[]
}

/**
 * Tag details.
 */
export interface TagDetails {
  readonly name: string
  readonly description: string
}

/**
 * TokenExtensions.
 */
export interface SPLTokenExtensions {
  readonly website?: string
  readonly bridgeContract?: string
  readonly assetContract?: string
  readonly address?: string
  readonly explorer?: string
  readonly twitter?: string
  readonly github?: string
  readonly medium?: string
  readonly tgann?: string
  readonly tggroup?: string
  readonly discord?: string
  readonly serumV3Usdt?: string
  readonly serumV3Usdc?: string
  readonly coingeckoId?: string
  readonly imageUrl?: string
  readonly description?: string
}

/**
 * TokenInfo.
 */
export interface SPLTokenInfo {
  readonly chainId: number
  readonly address: string
  readonly name: string
  readonly decimals: number
  readonly symbol: string
  readonly logoURI?: string
  readonly tags?: string[]
  readonly extensions?: SPLTokenExtensions
}
