import { invariant } from '@apollo/client/utilities/globals'
import { StableToken } from '@celo/contractkit'
import { Token } from '@ubeswap/sdk'
import { IMentoExchangeInfo } from 'constants/mento'
import { CEUR, CREAL, CUSD } from 'constants/tokens'
import { useSelector } from 'react-redux'

import { CHAIN } from '../../constants'
import { AppState } from '..'

export function useCurrentPool(stable: StableToken): IMentoExchangeInfo {
  const pools = useSelector<AppState, IMentoExchangeInfo[]>((state) =>
    state.mentoPools.pools.filter((pool) => {
      return pool.stable === stable
    })
  )
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
