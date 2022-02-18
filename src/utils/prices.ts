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

// computes price breakdown for the trade
export function computeTradePriceBreakdown(trade?: MobiusTrade | null): {
  priceImpactWithoutFee: Percent | undefined
  realizedLPFee: TokenAmount | undefined | null
} {
  if (!trade) return {}
  //todo: issue here

  let inAmount: JSBI = trade.input.raw
  let outAmount: JSBI = trade.output.raw
  if (trade.input.token.decimals > trade.output.token.decimals) {
    outAmount = JSBI.multiply(
      outAmount,
      JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(trade.input.token.decimals - trade.output.token.decimals))
    )
  } else if (trade.input.token.decimals < trade.output.token.decimals) {
    inAmount = JSBI.multiply(
      inAmount,
      JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(trade.output.token.decimals - trade.input.token.decimals))
    )
  }
  const priceImpact = new Percent(JSBI.subtract(inAmount, outAmount), outAmount)

  return { priceImpactWithoutFee: priceImpact, realizedLPFee: trade.fee }
}

export function computeMentoTradePriceBreakdown(trade: MentoTrade): {
  priceImpactWithoutFee: Percent | undefined
  realizedLPFee: TokenAmount | undefined | null
} {
  const inAmount: JSBI = trade.input.raw
  const outAmount: JSBI = trade.output.raw
  const reserveIn: JSBI =
    trade.pool.tokens[0].address === trade.input.currency.address ? trade.pool.balances[0] : trade.pool.balances[1]
  const reserveOut: JSBI =
    trade.pool.tokens[0].address === trade.input.currency.address ? trade.pool.balances[1] : trade.pool.balances[0]

  const priceImpact = new Percent(
    JSBI.subtract(JSBI.multiply(inAmount, reserveOut), JSBI.multiply(outAmount, reserveIn)),
    JSBI.multiply(outAmount, reserveIn)
  )

  const fee = new Percent(trade.pool.swapFee, JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(24)))

  return { priceImpactWithoutFee: priceImpact.subtract(fee), realizedLPFee: trade.fee }
}

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

export function formatExecutionPrice(trade?: MobiusTrade, inverted?: boolean): string {
  if (!trade) {
    return ''
  }
  return inverted
    ? `${trade.executionPrice.invert().toSignificant(6)} ${trade.input.currency.symbol} / ${
        trade.output.currency.symbol
      }`
    : `${trade.executionPrice.toSignificant(6)} ${trade.output.currency.symbol} / ${trade.input.currency.symbol}`
}
