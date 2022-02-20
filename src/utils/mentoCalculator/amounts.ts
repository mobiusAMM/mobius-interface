import { TokenAmount } from '@ubeswap/sdk'
import JSBI from 'jsbi'

import { BIPS_BASE } from '../../constants'
import type { IMentoExchangeInfo } from '../../constants/mento'

const ZERO = JSBI.BigInt(0)
const ONE = JSBI.BigInt(1)

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

  console.log(exchange.fee.toFixed(0))

  const [amountOut, feeAmount] = getAmountOut(
    fromAmount.raw,
    fromReserves.raw,
    toReserves.raw,
    JSBI.BigInt(exchange.fee.toFixed(0))
  )

  const fee = new TokenAmount(fromReserves.token, feeAmount)

  const outputAmount = new TokenAmount(toReserves.token, amountOut)

  return {
    outputAmount,
    fee,
  }
}

function getAmountOut(inAmount: JSBI, bucketIn: JSBI, bucketOut: JSBI, swapFee: JSBI): [JSBI, JSBI] {
  const amountInWithFee = JSBI.multiply(inAmount, JSBI.subtract(BIPS_BASE, swapFee))
  const numerator = JSBI.multiply(amountInWithFee, bucketOut)
  const denominator = JSBI.add(JSBI.multiply(bucketIn, BIPS_BASE), amountInWithFee)
  const amountOut = JSBI.divide(numerator, denominator)
  const fee = JSBI.divide(JSBI.multiply(inAmount, swapFee), BIPS_BASE)
  return [amountOut, fee]
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
  const [amountOut, feeAmount] = getAmountIn(
    toAmount.raw,
    fromReserves.raw,
    toReserves.raw,
    JSBI.BigInt(exchange.fee.toFixed(0))
  )

  const fee = new TokenAmount(fromReserves.token, feeAmount)

  const inputAmount = new TokenAmount(toReserves.token, amountOut)

  return {
    inputAmount,
    fee: fee,
  }
}

function getAmountIn(outAmount: JSBI, bucketIn: JSBI, bucketOut: JSBI, swapFee: JSBI): [JSBI, JSBI] {
  const feeMult = JSBI.subtract(big, swapFee)
  const numerator = JSBI.multiply(JSBI.multiply(outAmount, bucketIn), big)
  const denominator = JSBI.multiply(JSBI.subtract(bucketOut, outAmount), feeMult)
  const amountIn = JSBI.add(JSBI.divide(numerator, denominator), ONE)
  const fee = JSBI.divide(JSBI.multiply(feeMult, amountIn), big)
  return [amountIn, fee]
}
