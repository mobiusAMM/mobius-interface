import BigNumber from 'bignumber.js'
import JSBI from 'jsbi'

// See https://github.com/d-mooers/swappa/blob/main/src/pairs/stableswap.ts

type Address = string
export class PairStableSwap {
  allowRepeats = false

  private paused = false
  private tokenPrecisionMultipliers: BigNumber[] = []
  private balancesWithAdjustedPrecision: BigNumber[] = []
  private balances: BigNumber[] = []
  private swapFee: BigNumber = new BigNumber(0)
  private preciseA: BigNumber = new BigNumber(0)
  private lpTotalSupply: BigNumber = new BigNumber(0)

  static readonly POOL_PRECISION_DECIMALS = 18
  static readonly A_PRECISION = 100

  constructor(balances: string[], swapFee: string, preciseA: string, decimals: number[]) {
    const [decimalsA, decimalsB] = decimals
    this.tokenPrecisionMultipliers = [
      new BigNumber(10).pow(PairStableSwap.POOL_PRECISION_DECIMALS - decimalsA),
      new BigNumber(10).pow(PairStableSwap.POOL_PRECISION_DECIMALS - decimalsB),
    ]
    this.balances = balances.map((n) => new BigNumber(n))
    this.balancesWithAdjustedPrecision = balances.map((b, idx) => this.tokenPrecisionMultipliers[idx].multipliedBy(b))
    this.swapFee = new BigNumber(swapFee).div(new BigNumber(10).pow(10))
    this.preciseA = new BigNumber(preciseA)
  }

  public deposit(
    tokenA: Address,
    inputA: BigNumber,
    tokenB: Address,
    inputB: BigNumber,
    isDeposit: boolean
  ): BigNumber {
    const amounts = tokenA === this.tokenA ? [inputA, inputB] : [inputB, inputA]
    const d0 = this.getD(this.balancesWithAdjustedPrecision, this.preciseA)
    const balances = this.balances.map((b, i) => (isDeposit ? b.plus(amounts[i]) : b.minus(amounts[i])))
    const d1 = this.getD(
      balances.map((b, idx) => this.tokenPrecisionMultipliers[idx].multipliedBy(b)),
      this.preciseA
    )

    return d1.minus(d0).multipliedBy(this.lpTotalSupply).dividedBy(d0)
  }

  public outputAmount(tokenIndexFrom: number, tokenIndexTo: number, input: JSBI): [JSBI, JSBI] {
    // See: https://github.com/mobiusAMM/mobiusV1/blob/master/contracts/SwapUtils.sol#L617
    const inputAmount = new BigNumber(input.toString())
    const x = inputAmount
      .multipliedBy(this.tokenPrecisionMultipliers[tokenIndexFrom])
      .plus(this.balancesWithAdjustedPrecision[tokenIndexFrom])
    const y = this.getY(x, this.balancesWithAdjustedPrecision, this.preciseA)
    const outputAmountWithFee = this.balancesWithAdjustedPrecision[tokenIndexTo].minus(y).minus(1)
    const fee = outputAmountWithFee.multipliedBy(this.swapFee)
    const outputAmount = outputAmountWithFee.minus(fee).div(this.tokenPrecisionMultipliers[tokenIndexTo]).integerValue()
    return [JSBI.BigInt(outputAmount.toFixed(0)), JSBI.BigInt(fee.toFixed(0))]
  }

  private getY = (x: BigNumber, xp: BigNumber[], a: BigNumber) => {
    // See: https://github.com/mobiusAMM/mobiusV1/blob/master/contracts/SwapUtils.sol#L531
    const d = this.getD(xp, a)
    const nTokens = xp.length
    const nA = a.multipliedBy(nTokens)

    const s = x
    const c = d
      .multipliedBy(d)
      .div(x.multipliedBy(nTokens))
      .integerValue()
      .multipliedBy(d)
      .multipliedBy(PairStableSwap.A_PRECISION)
      .div(nA.multipliedBy(nTokens))
      .integerValue()
    const b = s.plus(d.multipliedBy(PairStableSwap.A_PRECISION).div(nA)).integerValue()

    let yPrev
    let y = d
    for (let i = 0; i < 256; i++) {
      yPrev = y
      y = y.multipliedBy(y).plus(c).div(y.multipliedBy(2).plus(b).minus(d)).integerValue()
      if (y.minus(yPrev).abs().lte(1)) {
        return y
      }
    }
    throw new Error('SwapPool approximation did not converge!')
  }

  private getD(xp: BigNumber[], a: BigNumber) {
    // See: https://github.com/mobiusAMM/mobiusV1/blob/master/contracts/SwapUtils.sol#L393
    const s = BigNumber.sum(...xp)
    if (s.eq(0)) {
      return s
    }

    let prevD
    let d = s
    const nTokens = xp.length
    const nA = a.multipliedBy(nTokens)

    for (let i = 0; i < 256; i++) {
      let dP = d
      xp.forEach((x) => {
        dP = dP.multipliedBy(d).div(x.multipliedBy(nTokens)).integerValue()
      })
      prevD = d
      d = nA
        .multipliedBy(s)
        .div(PairStableSwap.A_PRECISION)
        .plus(dP.multipliedBy(nTokens))
        .multipliedBy(d)
        .div(
          nA
            .minus(PairStableSwap.A_PRECISION)
            .multipliedBy(d)
            .div(PairStableSwap.A_PRECISION)
            .plus(new BigNumber(nTokens).plus(1).multipliedBy(dP))
        )
        .integerValue()
      if (d.minus(prevD).abs().lte(1)) {
        return d
      }
    }
    throw new Error('SwapPool D does not converge!')
  }
}
