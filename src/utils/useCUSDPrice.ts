import { cUSD, Fraction, Price, Token } from '@ubeswap/sdk'
import { TokenPrices } from 'state/application/reducer'

import { CHAIN } from '../constants'
import { priceStringToFraction, useTokenPrice } from '../state/application/hooks'

type TokenPair = [Token | undefined, Token | undefined]

export function getCUSDPrices(prices?: TokenPrices): { [address: string]: Fraction } {
  return (
    Object.entries(prices ?? {})?.reduce(
      (accum, [address, price]) => ({ ...accum, [address]: priceStringToFraction(price) }),
      {}
    ) ?? {}
  )
}

/**
 * Returns the price in cUSD of the input currency
 * @param currency currency to compute the cUSD price of
 */
export function useCUSDPrice(tokens?: Token[] | Token): Price | undefined {
  const CUSD = cUSD[CHAIN]
  if (tokens instanceof Token) {
    tokens = [tokens]
  }

  const p1 = useTokenPrice(tokens?.[0]?.address)
  const p2 = useTokenPrice(tokens?.[1]?.address)
  return p1
    ? new Price(tokens?.[0], CUSD, p1.denominator, p1.numerator)
    : p2
    ? new Price(tokens?.[1], CUSD, p2.denominator, p2.numerator)
    : undefined

  // const CUSD = cUSD[chainId as unknown as UbeswapChainId]
  // const celo = CELO[chainId as unknown as UbeswapChainId]
  // const tokenPairs: TokenPair[] = useMemo(
  //   () =>
  //     tokens
  //       ?.map((token) => [
  //         [token && currencyEquals(token, CUSD) ? undefined : token, CUSD],
  //         [token && currencyEquals(token, celo) ? undefined : token, celo],
  //         [celo, CUSD],
  //       ])
  //       .flat() as TokenPair[],
  //   [CUSD, celo, tokens]
  // )
  // const pairs = usePairs(tokenPairs).map((x) => x[1])

  // return useMemo(() => {
  //   if (!tokens || !chainId) {
  //     return undefined
  //   }

  //   const prices = tokens.map((token, idx) => {
  //     const start = idx * 3
  //     const [cUSDPair, celoPair, celoCUSDPair] = [pairs[start], pairs[start + 1], pairs[start + 2]]

  //     // handle cUSD
  //     if (token.equals(CUSD)) {
  //       return new Price(CUSD, CUSD, '1', '1')
  //     }
  //     let price: Price | undefined = undefined

  //     if (celoPair && celoCUSDPair) {
  //       price = celoPair.priceOf(token).multiply(celoCUSDPair.priceOf(celo))
  //     }

  //     if (cUSDPair) {
  //       const newPrice = cUSDPair.priceOf(token)
  //       price = !price || newPrice.greaterThan(new Fraction(price.numerator, price.denominator)) ? newPrice : price
  //     }

  //     return price
  //   })
  //   return prices.filter((p: Price | undefined) => !p)[0] ?? undefined
  // }, [chainId, tokens, CUSD, celo, pairs])
}
