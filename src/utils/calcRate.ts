import JSBI from 'jsbi'
import { Fraction, Percent } from 'lib/token-utils'

type Rates = {
  apyF: Fraction
  apy: Percent
  dyp: Percent
}

export function calcApy(rewardPerYear: Fraction, totalStakedAmount: Fraction): Rates {
  const apyFraction = rewardPerYear
    .multiply(JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('18')))
    .divide(totalStakedAmount)
  const apy = apyFraction
    ? new Percent(
        apyFraction.numerator,
        JSBI.multiply(apyFraction.denominator, JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('18')))
      )
    : undefined
  const dpy =
    apy && !apy.equalTo('0')
      ? new Percent(Math.floor(parseFloat(apy.divide('365').toFixed(10)) * 1_000_000).toFixed(0), '1000000')
      : undefined
  return { apyFraction, apy, dpy }
}
