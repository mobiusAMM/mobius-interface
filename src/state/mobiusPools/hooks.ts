import { DisplayPool, IExchange, IExchangeInfo, StablePools, Volume } from 'constants/pools'
import { useWeb3Context } from 'hooks'
import { TokenAmount } from 'lib/token-utils'
import { useSelector } from 'react-redux'
import { useTokenBalance, useTokenBalances } from 'state/wallet/hooks'
import invariant from 'tiny-invariant'

import { CHAIN } from '../../constants'
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
  return useSelector<AppState, Volume[]>((state) => state.pools.pools.map((p) => p as Volume))
}

export function poolInfoToExchange(info: IExchangeInfo): IExchange {
  const exchange = StablePools[CHAIN].filter(
    (e) => e.pool.lpToken.address.toLowerCase() === info.lpTotalSupply.token.address.toLowerCase()
  )
  invariant(exchange.length === 1, 'cant find exchange')
  return exchange[0].pool
}

export function poolInfoToDisplay(info: IExchangeInfo): DisplayPool {
  const exchange = StablePools[CHAIN].filter(
    (e) => e.pool.lpToken.address.toLowerCase() === info.lpTotalSupply.token.address.toLowerCase()
  )
  invariant(exchange.length === 1, 'cant find exchange')
  return exchange[0]
}

export function useLpBalance(exchange: IExchange): TokenAmount {
  const { address, connected } = useWeb3Context()
  const balance = useTokenBalance(address, exchange.lpToken)
  return connected ? balance ?? new TokenAmount(exchange.lpToken, 0) : new TokenAmount(exchange.lpToken, 0)
}

export function useAllLpBalances(): TokenAmount[] {
  const { address, connected } = useWeb3Context()

  const balances = useTokenBalances(
    connected ? address : undefined,
    StablePools[CHAIN].map(({ pool }) => pool.lpToken)
  )

  return StablePools[CHAIN].map((el) =>
    connected
      ? balances[el.pool.lpToken.address] ?? new TokenAmount(el.pool.lpToken, 0)
      : new TokenAmount(el.pool.lpToken, 0)
  )
}
