import type { IExchangeInfo } from 'constants/pools'
import JSBI from 'jsbi'
import { Price, TEN, TokenAmount } from 'lib/token-utils'

import { calculateEstimatedSwapOutputAmount } from './'

function min(a: JSBI, b: JSBI): JSBI {
  return JSBI.greaterThanOrEqual(a, b) ? b : a
}

function max(a: JSBI, b: JSBI): JSBI {
  return JSBI.greaterThanOrEqual(a, b) ? a : b
}

/**
 * Gets the price of the second token in the swap, i.e. "Token 1", with respect to "Token 0".
 *
 * To get the price of "Token 0", use `.invert()` on the result of this function.
 * @returns
 */
export const calculateSwapPrice = (exchangeInfo: IExchangeInfo): Price => {
  const reserve0 = exchangeInfo.reserves[0]
  const reserve1 = exchangeInfo.reserves[1]

  // We try to get at least 4 decimal points of precision here
  // Otherwise, we attempt to swap 1% of total supply of the pool
  // or at most, $1
  const inputAmountNum = max(
    JSBI.BigInt(10_000),
    min(JSBI.exponentiate(TEN, JSBI.BigInt(reserve0.token.decimals)), reserve0.divide(100).quotient)
  )

  const inputAmount = new TokenAmount(reserve0.token, inputAmountNum)
  const outputAmount = calculateEstimatedSwapOutputAmount(exchangeInfo, inputAmount)

  const frac = outputAmount.outputAmountBeforeFees.asFraction.divide(inputAmount.asFraction)

  return new Price(reserve0.token, reserve1.token, frac.denominator, frac.numerator)
}
