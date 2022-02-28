import { Price } from 'lib/token-utils'

import type { IMentoExchangeInfo } from '../../constants/mento'

/**
 * Gets the price of the second token in the swap, i.e. "Stable", with respect to "Celo".
 *
 * To get the price of "Celo", use `.invert()` on the result of this function.
 * @returns
 */
export const calculateSwapPrice = (exchangeInfo: IMentoExchangeInfo): Price => {
  return new Price(
    exchangeInfo.stableReserve.token,
    exchangeInfo.celoReserve.token,
    exchangeInfo.stableReserve.raw,
    exchangeInfo.celoReserve.raw
  )
}
