import { JSBI, Percent, TokenAmount } from '@ubeswap/sdk'
import { MentoTrade } from 'state/mento/hooks'
import { MobiusTrade } from 'state/swap/hooks'

import {
  ALLOWED_PRICE_IMPACT_HIGH,
  ALLOWED_PRICE_IMPACT_LOW,
  ALLOWED_PRICE_IMPACT_MEDIUM,
  BLOCKED_PRICE_IMPACT_NON_EXPERT,
} from '../constants'
import { Field } from '../state/swap/actions'
import { basisPointsToPercent } from './index'

// computes the minimum amount out and maximum amount in for a trade given a user specified allowed slippage in bips
export function computeSlippageAdjustedAmounts(
  trade: MobiusTrade | MentoTrade | undefined,
  allowedSlippage: number
): { [field in Field]?: TokenAmount } {
  if (!trade) return {}
  const pct = basisPointsToPercent(allowedSlippage)
  const inputRaw = trade?.input.raw
  const outputRaw = trade?.output.raw

  const maxInput = JSBI.add(inputRaw, JSBI.divide(JSBI.multiply(inputRaw, pct.numerator), pct.denominator))
  const minOutput = JSBI.subtract(outputRaw, JSBI.divide(JSBI.multiply(outputRaw, pct.numerator), pct.denominator))
  return {
    [Field.INPUT]: new TokenAmount(trade?.input.currency, maxInput),
    [Field.OUTPUT]: new TokenAmount(trade?.output.currency, minOutput),
  }
}

export function warningSeverity(priceImpact: Percent | undefined): 0 | 1 | 2 | 3 | 4 {
  if (!priceImpact?.lessThan(BLOCKED_PRICE_IMPACT_NON_EXPERT)) return 4
  if (!priceImpact?.lessThan(ALLOWED_PRICE_IMPACT_HIGH)) return 3
  if (!priceImpact?.lessThan(ALLOWED_PRICE_IMPACT_MEDIUM)) return 2
  if (!priceImpact?.lessThan(ALLOWED_PRICE_IMPACT_LOW)) return 1
  return 0
}

export function formatExecutionPrice(trade?: MobiusTrade | MentoTrade, inverted?: boolean): string {
  if (!trade) {
    return ''
  }
  return inverted
    ? `${trade.executionPrice.invert().toSignificant(6)} ${trade.input.currency.symbol} / ${
        trade.output.currency.symbol
      }`
    : `${trade.executionPrice.toSignificant(6)} ${trade.output.currency.symbol} / ${trade.input.currency.symbol}`
}
