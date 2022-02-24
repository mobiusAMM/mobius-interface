import { JSBI, Price, TokenAmount } from '@ubeswap/sdk'

import type { IExchangeInfo } from '../../constants/pools'
import { calculateEstimatedSwapOutputAmount } from '.'

/**
 * Gets the price of the second token in the swap, i.e. "Token 1", with respect to "Token 0".
 *
 * To get the price of "Token 0", use `.invert()` on the result of this function.
 * @returns
 */

function min(a: JSBI, b: JSBI): JSBI {
  return JSBI.greaterThan(a, b) ? b : a
}

function max(a: JSBI, b: JSBI): JSBI {
  return JSBI.greaterThan(a, b) ? a : b
}

export const calculateSwapPrice = (exchangeInfo: IExchangeInfo): Price => {
  const reserve0 = exchangeInfo.reserves[0]
  const reserve1 = exchangeInfo.reserves[1]

  // We try to get at least 4 decimal points of precision here
  // Otherwise, we attempt to swap 1% of total supply of the pool
  // or at most, $1
  const inputAmountNum = max(
    JSBI.BigInt('10000'),
    min(
      JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt(reserve0.token.decimals)),
      JSBI.divide(reserve0.raw, JSBI.BigInt('100'))
    )
  )

  const inputAmount = new TokenAmount(reserve0.token, inputAmountNum)
  const outputAmount = calculateEstimatedSwapOutputAmount(exchangeInfo, inputAmount)

  return new Price(reserve0.token, reserve1.token, outputAmount.outputAmountBeforeFees.raw, inputAmount.raw)
}
