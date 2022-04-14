import JSBI from 'jsbi'
import { Fraction, TokenAmount } from 'lib/token-utils'
import React from 'react'

const CURRENCY_AMOUNT_MIN = new Fraction(JSBI.BigInt(1), JSBI.BigInt(1000000))

export default function FormattedTokenAmount({
  currencyAmount,
  significantDigits = 4,
}: {
  currencyAmount: TokenAmount | undefined
  significantDigits?: number
}) {
  return (
    <>
      {!currencyAmount || currencyAmount.equalTo(JSBI.BigInt(0))
        ? '0'
        : currencyAmount.greaterThan(CURRENCY_AMOUNT_MIN)
        ? currencyAmount.toSignificant(significantDigits)
        : `<${CURRENCY_AMOUNT_MIN.toSignificant(1)}`}
    </>
  )
}
