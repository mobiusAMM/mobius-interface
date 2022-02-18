import { TokenAmount } from '@ubeswap/sdk'
import { ONE, ZERO } from '@ubeswap/sdk/dist/constants'
import JSBI from 'jsbi'

import type { IMentoExchangeInfo } from '../../constants/mento'

/**
 * Calculates the estimated output amount of a swap.
 * @param exchange
 * @param fromAmount
 * @returns
 */
export const calculateEstimatedSwapOutputAmount = (
  exchange: IMentoExchangeInfo,
  fromAmount: TokenAmount
): {
  [K in 'outputAmount' | 'fee']: TokenAmount
} => {
  const [fromReserves, toReserves] = fromAmount.token.equals(exchange.stableReserve.token)
    ? [exchange.stableReserve, exchange.celoReserve]
    : [exchange.celoReserve, exchange.stableReserve]

  if (fromAmount.equalTo('0')) {
    const zero = new TokenAmount(toReserves.token, ZERO)
    return {
      outputAmount: zero,
      fee: zero,
    }
  }
  const [amountOut, feeAmount] = getAmountOut(fromAmount.raw, fromReserves.raw, toReserves.raw, exchange.fee.quotient)

  const fee = new TokenAmount(fromReserves.token, feeAmount)

  const outputAmount = new TokenAmount(toReserves.token, amountOut)

  return {
    outputAmount,
    fee: fee,
  }
}

/**
 * Calculates the estimated input amount of a swap.
 * @param exchange
 * @param toAmount
 * @returns
 */
export const calculateEstimatedSwapInputAmount = (
  exchange: IMentoExchangeInfo,
  toAmount: TokenAmount
): {
  [K in 'inputAmount' | 'fee']: TokenAmount
} => {
  const [toReserves, fromReserves] = toAmount.token.equals(exchange.stableReserve.token)
    ? [exchange.stableReserve, exchange.celoReserve]
    : [exchange.celoReserve, exchange.stableReserve]

  if (toAmount.equalTo('0')) {
    const zero = new TokenAmount(toReserves.token, ZERO)
    return {
      inputAmount: zero,
      fee: zero,
    }
  }
  const [amountOut, feeAmount] = getAmountIn(toAmount.raw, fromReserves.raw, toReserves.raw, exchange.fee.quotient)

  const fee = new TokenAmount(fromReserves.token, feeAmount)

  const inputAmount = new TokenAmount(toReserves.token, amountOut)

  return {
    inputAmount,
    fee: fee,
  }
}

const big = JSBI.BigInt(1000000)

function getAmountIn(outAmount: JSBI, bucketIn: JSBI, bucketOut: JSBI, swapFee: JSBI): [JSBI, JSBI] {
  const feeMult = JSBI.subtract(big, swapFee)
  const numerator = JSBI.multiply(JSBI.multiply(outAmount, bucketIn), big)
  const denominator = JSBI.multiply(JSBI.subtract(bucketOut, outAmount), feeMult)
  const amountIn = JSBI.add(JSBI.divide(numerator, denominator), ONE)
  const fee = JSBI.divide(JSBI.multiply(feeMult, amountIn), big)
  return [amountIn, fee]
}

function getAmountOut(inAmount: JSBI, bucketIn: JSBI, bucketOut: JSBI, swapFee: JSBI): [JSBI, JSBI] {
  const feeMult = JSBI.subtract(big, swapFee)
  const amountInWithFee = JSBI.multiply(inAmount, feeMult)
  const numerator = JSBI.multiply(amountInWithFee, bucketOut)
  const denominator = JSBI.add(JSBI.multiply(bucketIn, big), amountInWithFee)
  const amountOut = JSBI.divide(numerator, denominator)
  const fee = JSBI.divide(JSBI.subtract(JSBI.multiply(inAmount, feeMult), amountInWithFee), big)
  return [amountOut, fee]
}
