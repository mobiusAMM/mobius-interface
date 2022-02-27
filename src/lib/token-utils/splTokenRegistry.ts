import { ChainId } from '@ubeswap/sdk'
/**
 * These types all come from the @solana/spl-token-registry package.
 *
 * We re-export them here so we do not have to have a hard dependency on
 * that package, which is massive.
 */

export declare enum NetworkNames {
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

export declare const Alfajores: {
  readonly name: NetworkNames.Alfajores
  readonly rpcUrl: 'https://alfajores-forno.celo-testnet.org'
  readonly graphQl: 'https://alfajores-blockscout.celo-testnet.org/graphiql'
  readonly explorer: 'https://alfajores-blockscout.celo-testnet.org'
  readonly chainId: ChainId.ALFAJORES
}
export declare const Baklava: {
  readonly name: NetworkNames.Baklava
  readonly rpcUrl: 'https://baklava-forno.celo-testnet.org'
  readonly graphQl: 'https://baklava-blockscout.celo-testnet.org/graphiql'
  readonly explorer: 'https://baklava-blockscout.celo-testnet.org'
  readonly chainId: ChainId.BAKLAVA
}
export declare const Mainnet: {
  readonly name: NetworkNames.Mainnet
  readonly rpcUrl: 'https://forno.celo.org'
  readonly graphQl: 'https://explorer.celo.org/graphiql'
  readonly explorer: 'https://explorer.celo.org'
  readonly chainId: ChainId.MAINNET
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
