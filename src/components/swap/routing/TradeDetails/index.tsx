import React from 'react'
import { MentoTrade } from 'state/mento/hooks'
import { MobiusTrade } from 'state/swap/hooks'

import { MobiusTradeDetails } from './MobiusTradeDetails'

interface Props {
  trade: MobiusTrade | MentoTrade
  allowedSlippage: number
}

export const TradeDetails: React.FC<Props> = ({ trade, allowedSlippage }: Props) => {
  return <MobiusTradeDetails trade={trade} allowedSlippage={allowedSlippage} />
}
