import { Token } from 'lib/token-utils'

export function currencyId(currency: Token): string {
  return currency.address
}
