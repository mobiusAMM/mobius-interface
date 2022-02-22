import { IExchangeInfo, Volume } from 'constants/pools'
import { useSelector } from 'react-redux'
import invariant from 'tiny-invariant'

import { AppState } from '..'

export function useCurrentPool(token0: string, token1: string): IExchangeInfo | null {
  const pools = useSelector<AppState, IExchangeInfo[]>((state) =>
    state.pools.pools.filter((pool) => {
      const tokens = pool.tokens.map((t) => t.address)
      return tokens.includes(token0) && tokens.includes(token1)
    })
  )
  if (pools.length === 0) return null
  invariant(pools.length === 1)
  return pools[0]
}
export function useCurrentPoolAddress(exchangeAddress: string): IExchangeInfo | null {
  const pools = useSelector<AppState, IExchangeInfo[]>((state) =>
    state.pools.pools.filter((pool) => pool.address === exchangeAddress)
  )
  if (pools.length === 0) return null
  invariant(pools.length === 1)
  return pools[0]
}

export function usePools(): readonly IExchangeInfo[] {
  return useSelector<AppState, IExchangeInfo[]>((state) => state.pools.pools)
}

export function useCurrentPoolVolume(exchangeAddress: string): Volume | null {
  const pools = useSelector<AppState, Volume[]>((state) =>
    state.pools.pools.filter((pool) => pool.address === exchangeAddress)
  )
  if (pools.length === 0) return null
  invariant(pools.length === 1)
  return pools[0]
}

export function usePoolsVolume(): readonly Volume[] {
  return useSelector<AppState, Volume[]>((state) => state.pools.pools)
}
