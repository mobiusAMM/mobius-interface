import { JSBI } from '@ubeswap/sdk'
import { MentoPool } from 'state/mentoPools/reducer'

const ZERO = JSBI.BigInt(0)
const ONE = JSBI.BigInt(1)
const big = JSBI.BigInt(1000000)
export class MentoMath {
  public swapFee: JSBI
  public balances: JSBI[]

  constructor({ balances, swapFee }: MentoPool) {
    this.swapFee = ONE
    this.balances = [ZERO, ZERO]
    this.updateInfo(swapFee, balances)
  }

  updateInfo(swapFee: JSBI, balances: JSBI[]) {
    this.swapFee = swapFee
    this.balances = balances
  }

  getAmountIn(outAmount: JSBI, bucketIn: JSBI, bucketOut: JSBI, swapFee: JSBI): [JSBI, JSBI] {
    const feeMult = JSBI.subtract(big, swapFee)
    const numerator = JSBI.multiply(JSBI.multiply(outAmount, bucketIn), big)
    const denominator = JSBI.multiply(JSBI.subtract(bucketOut, outAmount), feeMult)
    const amountIn = JSBI.add(JSBI.divide(numerator, denominator), ONE)
    const fee = JSBI.divide(JSBI.multiply(feeMult, amountIn), big)
    return [amountIn, fee]
  }

  getAmountOut(inAmount: JSBI, bucketIn: JSBI, bucketOut: JSBI, swapFee: JSBI): [JSBI, JSBI] {
    const feeMult = JSBI.subtract(big, swapFee)
    const amountInWithFee = JSBI.multiply(inAmount, feeMult)
    const numerator = JSBI.multiply(amountInWithFee, bucketOut)
    const denominator = JSBI.add(JSBI.multiply(bucketIn, big), amountInWithFee)
    const amountOut = JSBI.divide(numerator, denominator)
    const fee = JSBI.divide(JSBI.subtract(JSBI.multiply(inAmount, feeMult), amountInWithFee), big)
    return [amountOut, fee]
  }
}
