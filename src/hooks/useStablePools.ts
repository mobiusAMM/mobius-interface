import { invariant } from '@apollo/client/utilities/globals'
import { IExchangeInfo, IGauge, StablePools } from 'constants/pools'
import JSBI from 'jsbi'
import { calculateVirtualPrice } from 'lib/calculator'
import { Fraction, TokenAmount } from 'lib/token-utils'
import { priceStringToFraction, useTokenPrice, useTokenPrices } from 'state/application/hooks'
import { poolInfoToDisplay, usePools } from 'state/mobiusPools/hooks'

import { CHAIN } from '../constants'

export const useStablePools = () => {
  return StablePools[CHAIN]
}

export function useValueOfLp(lpAmount: TokenAmount, exchange: IExchangeInfo): Fraction | undefined {
  const display = poolInfoToDisplay(exchange)
  const price = useTokenPrice(display.peg.priceQuery ?? undefined)
  const virtualPrice = calculateVirtualPrice(exchange)
  if (!price || !virtualPrice) return undefined
  return lpAmount.multiply(price).multiply(virtualPrice)
}

export function useValueOfPool(exchange: IExchangeInfo): Fraction | undefined {
  return useValueOfLp(exchange.lpTotalSupply, exchange)
}

export function useValueOfAllPools(): Fraction {
  const prices = useTokenPrices()
  const pools = usePools()
  return StablePools[CHAIN].reduce((acc, cur, i) => {
    const price = cur.peg.priceQuery ? priceStringToFraction(prices[cur.peg.priceQuery]) : new Fraction(0)
    if (!price) return acc
    const virtualPrice = calculateVirtualPrice(pools[i])

    return virtualPrice ? acc.add(price.multiply(virtualPrice).multiply(pools[i].lpTotalSupply)) : acc
  }, new Fraction(0))
}

export function useValueOfAllLP(amounts: JSBI[]): Fraction {
  const prices = useTokenPrices()
  const pools = usePools()
  invariant(amounts.length === pools.length, 'invalid amounts entry')
  return StablePools[CHAIN].reduce((acc, cur, i) => {
    const price = cur.peg.priceQuery ? priceStringToFraction(prices[cur.peg.priceQuery]) : new Fraction(0)
    if (!price) return acc
    const virtualPrice = calculateVirtualPrice(pools[i])

    return virtualPrice ? acc.add(price.multiply(virtualPrice).multiply(amounts[i])) : acc
  }, new Fraction(0))
}

export function useValueOfExternalRewards(gauge: IGauge | null): Fraction {
  const prices = useTokenPrices()
  if (!gauge) return new Fraction(0)
  return gauge.additionalRewards.reduce((acc, cur) => {
    const price = priceStringToFraction(prices[cur.token.address.toLowerCase()]) ?? new Fraction(0)
    if (!price) return acc
    return acc.add(price.multiply(cur))
  }, new Fraction(0))
}
