import React, { useContext, useMemo, useState } from 'react'
import { Repeat } from 'react-feather'
import { useLocation } from 'react-router'
import { Text } from 'rebass'
import { MentoTrade } from 'state/mento/hooks'
import { MobiusTrade } from 'state/swap/hooks'
import { ThemeContext } from 'styled-components'

import {
  computeMentoTradePriceBreakdown,
  computeTradePriceBreakdown,
  formatExecutionPrice,
  warningSeverity,
} from '../../utils/prices'
import { ButtonError } from '../Button'
import { AutoColumn } from '../Column'
import { AutoRow, RowBetween } from '../Row'
import { describeTrade } from './routing/describeTrade'
import { TradeDetails } from './routing/TradeDetails'
import { StyledBalanceMaxMini, SwapCallbackError } from './styleds'

export default function SwapModalFooter({
  trade,
  onConfirm,
  allowedSlippage,
  swapErrorMessage,
  disabledConfirm,
}: {
  trade: MobiusTrade | MentoTrade
  allowedSlippage: number
  onConfirm: () => void
  swapErrorMessage: string | undefined
  disabledConfirm: boolean
}) {
  const location = useLocation()
  const mento = location.pathname.includes('mint')
  const { label } = describeTrade(mento)
  const [showInverted, setShowInverted] = useState<boolean>(false)
  const theme = useContext(ThemeContext)
  const { priceImpactWithoutFee } = useMemo(
    () => (mento ? computeMentoTradePriceBreakdown(trade) : computeTradePriceBreakdown(trade)),
    [mento, trade]
  )
  const severity = warningSeverity(priceImpactWithoutFee)

  let info: React.ReactNode = null
  info = (
    <AutoColumn gap="0px">
      <RowBetween align="center">
        <Text fontWeight={400} fontSize={14} color={theme.text2}>
          Price
        </Text>
        <Text
          fontWeight={500}
          fontSize={14}
          color={theme.text1}
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            display: 'flex',
            textAlign: 'right',
            paddingLeft: '10px',
          }}
        >
          {formatExecutionPrice(trade, showInverted)}
          <StyledBalanceMaxMini onClick={() => setShowInverted(!showInverted)}>
            <Repeat size={14} />
          </StyledBalanceMaxMini>
        </Text>
      </RowBetween>

      <TradeDetails trade={trade} allowedSlippage={allowedSlippage} />
    </AutoColumn>
  )

  return (
    <>
      {info}
      <AutoRow>
        <ButtonError
          onClick={onConfirm}
          disabled={disabledConfirm}
          error={severity > 2}
          style={{ margin: '10px 0 0 0' }}
          id="confirm-swap-or-send"
        >
          <Text fontSize={20} fontWeight={500}>
            {severity > 2 ? `${label} Anyway` : `Confirm ${label}`}
          </Text>
        </ButtonError>
        {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
      </AutoRow>
    </>
  )
}
