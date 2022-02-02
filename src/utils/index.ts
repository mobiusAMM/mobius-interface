import { getAddress } from '@ethersproject/address'
import { BigNumber } from '@ethersproject/bignumber'
import { AddressZero } from '@ethersproject/constants'
import { Contract } from '@ethersproject/contracts'
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers'
import { JSBI, Percent, Token, TokenAmount } from '@ubeswap/sdk'
import { Exchange, Swap } from 'generated/index'

import EXCHANGE from '../constants/abis/Exchange.json'
import SWAP from '../constants/abis/Swap.json'
import { TokenAddressMap } from '../state/lists/hooks'

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: any): string | false {
  try {
    return getAddress(value)
  } catch {
    return false
  }
}

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
  const parsed = isAddress(address)
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`
}

// add 100%
export function calculateGasMargin(value: BigNumber): BigNumber {
  return value.mul(BigNumber.from(2))
}

// converts a basis points value to a sdk percent
export function basisPointsToPercent(num: number): Percent {
  return new Percent(JSBI.BigInt(num), JSBI.BigInt(10000))
}

export function calculateSlippageAmount(value: TokenAmount, slippage: number): [JSBI, JSBI] {
  if (slippage < 0 || slippage > 10000) {
    throw Error(`Unexpected slippage value: ${slippage}`)
  }
  return [
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 - slippage)), JSBI.BigInt(10000)),
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 + slippage)), JSBI.BigInt(10000)),
  ]
}

// account is not optional
export function getSigner(provider: JsonRpcProvider): JsonRpcSigner {
  return provider.getSigner()
}

// account is optional
export function getProviderOrSigner(provider: JsonRpcProvider, connected: boolean): JsonRpcProvider | JsonRpcSigner {
  return connected ? getSigner(provider) : provider
}

// account is optional
export function getContract(address: string, ABI: any, provider: JsonRpcProvider, connected: boolean): Contract {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
  return new Contract(address, ABI, getProviderOrSigner(provider, connected) as any)
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

export function isTokenOnList(defaultTokens: TokenAddressMap, currency?: Token): boolean {
  return Boolean(currency instanceof Token && defaultTokens[currency.chainId]?.[currency.address])
}
export function getStableSwapContract(address: string, provider: JsonRpcProvider, connected: boolean): Swap {
  return getContract(address, SWAP.abi, provider, connected) as Swap
}

export function getMentoContract(address: string, provider: JsonRpcProvider, connected: boolean): Exchange {
  return getContract(address, EXCHANGE, provider, connected) as Exchange
}
