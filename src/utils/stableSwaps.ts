import JSBI from 'jsbi'
import { Token, TokenAmount } from 'lib/token-utils'

import { StablePoolInfo } from '../state/stablePools/hooks'

const dummyToken = new Token(1, '0x8cD0E2F11ed2E896a8307280dEEEE15B27e46BbE', 18, 'MobLP', 'Mobius cBTC/wBTC LP')
const dummyAmount = new TokenAmount(dummyToken, '0')
const WEI_SCALE = JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('18'))

const scaleAmount =
  (toScale: JSBI) =>
  (ta: TokenAmount | undefined, addition = JSBI.BigInt('0')) =>
    toScale && ta
      ? new TokenAmount(ta.token, JSBI.divide(JSBI.multiply(JSBI.add(addition, ta.raw), toScale), WEI_SCALE))
      : new TokenAmount(dummyToken, '0')

export const getDepositValues = (
  pool: StablePoolInfo | undefined,
  workingSupply?: JSBI
): {
  valueOfStaked: TokenAmount
  valueOfDeposited: TokenAmount
  totalValueDeposited: TokenAmount
  totalValueStaked: TokenAmount
} => {
  if (!pool)
    return {
      valueOfDeposited: dummyAmount,
      valueOfStaked: dummyAmount,
      totalValueDeposited: dummyAmount,
      totalValueStaked: dummyAmount,
    }
  const { totalDeposited, amountDeposited, virtualPrice, stakedAmount, totalStakedAmount } = pool
  const scale = scaleAmount(virtualPrice)

  const valueOfStaked = scale(stakedAmount)
  const valueOfDeposited = scale(amountDeposited) //?.add(stakedAmount))
  const totalValueStaked = workingSupply
    ? scale(totalStakedAmount?.add(new TokenAmount(totalStakedAmount.token, workingSupply)))
    : scale(totalStakedAmount)
  const totalValueDeposited = scale(totalDeposited)
  return {
    valueOfStaked,
    valueOfDeposited,
    totalValueDeposited,
    totalValueStaked,
  }
}
