import { Route, Token, TokenAmount, Trade, TradeType } from '@ubeswap/sdk'

export interface TradeRouter {
  routerAddress?: string
}

export interface PoolLocation {
  poolAddress?: string
}

export class UbeswapTrade extends Trade {
  hidePairAnalytics = false
  router: TradeRouter
  readonly path: readonly Token[]

  constructor(route: Route, amount: TokenAmount, tradeType: TradeType, router: TradeRouter, path: readonly Token[]) {
    super(route, amount, tradeType)
    this.router = router
    this.path = path
  }
}

export class MobiusTrade extends UbeswapTrade {
  hidePairAnalytics = false
  pool: PoolLocation

  constructor(route: Route, amount: TokenAmount, tradeType: TradeType, pool: PoolLocation, pair: readonly Token[]) {
    super(null, amount, tradeType, null, pair)
    this.pool = pool
  }
}
