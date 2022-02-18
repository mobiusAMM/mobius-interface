import { invariant } from '@apollo/client/utilities/globals'
import { StableToken } from '@celo/contractkit'
import { Token } from '@ubeswap/sdk'
import { IMentoExchangeInfo } from 'constants/mento'
import { CEUR, CREAL, CUSD } from 'constants/tokens'
import { useSelector } from 'react-redux'

import { CHAIN } from '../../constants'
import { AppState } from '..'

export function useCurrentPool(stable: StableToken | null): IMentoExchangeInfo | null {
  const pools = useSelector<AppState, IMentoExchangeInfo[]>((state) =>
    state.mentoPools.pools.filter((pool) => pool.stable === stable)
  )
  console.log(stable, pools)
  if (pools.length === 0) return null
  invariant(pools.length === 1)
  return pools[0]
}

export function usePools(): readonly IMentoExchangeInfo[] {
  return useSelector<AppState, IMentoExchangeInfo[]>((state) => state.mentoPools.pools)
}

export function stableToToken(stable: StableToken): Token {
  invariant(stable in StableToken)
  if (stable === StableToken.cUSD) return CUSD[CHAIN]
  if (stable === StableToken.cEUR) return CEUR[CHAIN]
  return CREAL[CHAIN]
}

export function tokenToStable(token: Token): StableToken | null {
  if (token.address === CUSD[CHAIN].address) return StableToken.cUSD
  if (token.address === CEUR[CHAIN].address) return StableToken.cEUR
  if (token.address === CREAL[CHAIN].address) return StableToken.cREAL
  return null
}
