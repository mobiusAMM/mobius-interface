import { Fraction, JSBI, Token, TokenAmount } from '@ubeswap/sdk'
import { GaugeSummary } from 'state/staking/hooks'

export function calcBoost(summary: GaugeSummary, votingPower: JSBI, totalVotingPower: JSBI): Fraction {
  const { baseBalance, totalStaked } = summary
  const baseWeighted = JSBI.divide(JSBI.multiply(JSBI.BigInt(4), baseBalance.raw), JSBI.BigInt(10))
  let weighted = baseWeighted
  if (JSBI.greaterThan(totalVotingPower, JSBI.BigInt('0'))) {
    weighted = JSBI.add(
      JSBI.divide(JSBI.multiply(JSBI.BigInt(4), baseBalance.raw), JSBI.BigInt(10)),
      JSBI.divide(
        JSBI.multiply(JSBI.BigInt(6), JSBI.multiply(totalStaked.raw, votingPower)),
        JSBI.multiply(totalVotingPower, JSBI.BigInt(10))
      )
    )
  }
  const min = JSBI.lessThan(weighted, baseBalance.raw) ? weighted : baseBalance.raw
  return new Fraction(min, baseWeighted)
}

export function calcEstimatedBoost(
  summary: GaugeSummary,
  votingPower: JSBI,
  totalVotingPower: JSBI,
  base: JSBI
): Fraction {
  const { totalStaked } = summary
  const baseWeighted = JSBI.divide(JSBI.multiply(JSBI.BigInt(4), base), JSBI.BigInt(10))
  let weighted = baseWeighted
  if (JSBI.greaterThan(totalVotingPower, JSBI.BigInt('0'))) {
    weighted = JSBI.add(
      JSBI.divide(JSBI.multiply(JSBI.BigInt(4), base), JSBI.BigInt(10)),
      JSBI.divide(
        JSBI.multiply(JSBI.BigInt(6), JSBI.multiply(totalStaked.raw, votingPower)),
        JSBI.multiply(totalVotingPower, JSBI.BigInt(10))
      )
    )
  }
  const min = JSBI.lessThan(weighted, base) ? weighted : base
  return new Fraction(min, baseWeighted)
}

export function calcVotesForMaxBoost(
  summary: GaugeSummary,
  totalVotingPower: JSBI,
  base: JSBI,
  token: Token
): TokenAmount {
  const { totalStaked } = summary
  if (JSBI.greaterThan(totalStaked.raw, JSBI.BigInt(0))) {
    return new TokenAmount(token, JSBI.divide(JSBI.multiply(base, totalVotingPower), totalStaked.raw))
  } else {
    return new TokenAmount(token, JSBI.BigInt(0))
  }
}

const MILLISECONDS_IN_FOUR_YEARS = JSBI.BigInt(4 * 365 * 24 * 3600 * 1000)

export function calcExpectedVeMobi(amount: TokenAmount, lockEnd: number): TokenAmount {
  const newAmount = JSBI.divide(JSBI.multiply(amount.raw, JSBI.BigInt(lockEnd)), MILLISECONDS_IN_FOUR_YEARS)
  return new TokenAmount(amount.token, newAmount)
}
