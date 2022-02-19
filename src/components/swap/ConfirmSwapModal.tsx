import { currencyEquals } from '@ubeswap/sdk'
import React, { useCallback, useMemo } from 'react'
import { useLocation } from 'react-router'
import { MentoTrade } from 'state/mento/hooks'
import { MobiusTrade } from 'state/swap/hooks'

import TransactionConfirmationModal, {
  ConfirmationModalContent,
  TransactionErrorContent,
} from '../TransactionConfirmationModal'
import { describeTrade } from './routing/describeTrade'
import SwapModalFooter from './SwapModalFooter'
import SwapModalHeader from './SwapModalHeader'

/**
 * Returns true if the trade requires a confirmation of details before we can submit it
 * @param tradeA trade A
 * @param tradeB trade B
 */
function tradeMeaningfullyDiffers(tradeA: MobiusTrade | MentoTrade, tradeB: MobiusTrade | MentoTrade): boolean {
  return (
    !currencyEquals(tradeA.input.currency, tradeB.input.currency) ||
    !tradeA.input.equalTo(tradeB.input) ||
    !currencyEquals(tradeA.output.currency, tradeB.output.currency) ||
    !tradeA.output.equalTo(tradeB.output)
  )
}

export default function ConfirmSwapModal({
  trade,
  originalTrade,
  onAcceptChanges,
  allowedSlippage,
  onConfirm,
  onDismiss,
  recipient,
  swapErrorMessage,
  isOpen,
  attemptingTxn,
  txHash,
}: {
  isOpen: boolean
  trade: MobiusTrade | MentoTrade | undefined
  originalTrade: MobiusTrade | MentoTrade | undefined
  attemptingTxn: boolean
  txHash: string | undefined
  recipient: string | null
  allowedSlippage: number
  onAcceptChanges: () => void
  onConfirm: () => void
  swapErrorMessage: string | undefined
  onDismiss: () => void
}) {
  const location = useLocation()
  const supressMeaningfullyDiffers = location.pathname.includes('opensum')
  const showAcceptChanges = useMemo(
    () =>
      Boolean(trade && originalTrade && !supressMeaningfullyDiffers && tradeMeaningfullyDiffers(trade, originalTrade)),
    [originalTrade, trade, supressMeaningfullyDiffers]
  )
  const mento = location.pathname.includes('mint')
  const { label } = describeTrade(mento)

  const modalHeader = useCallback(() => {
    return trade ? (
      <SwapModalHeader
        trade={trade}
        allowedSlippage={allowedSlippage}
        recipient={recipient}
        showAcceptChanges={showAcceptChanges}
        onAcceptChanges={onAcceptChanges}
      />
    ) : null
  }, [allowedSlippage, onAcceptChanges, recipient, showAcceptChanges, trade])

  const modalBottom = useCallback(() => {
    return trade ? (
      <SwapModalFooter
        onConfirm={onConfirm}
        trade={trade}
        disabledConfirm={showAcceptChanges}
        swapErrorMessage={swapErrorMessage}
        allowedSlippage={allowedSlippage}
      />
    ) : null
  }, [allowedSlippage, onConfirm, showAcceptChanges, swapErrorMessage, trade])

  // text to show while loading
  const pendingText = `Swapping ${trade?.input?.toSignificant(6)} ${
    trade?.input?.currency?.symbol
  } for ${trade?.output?.toSignificant(6)} ${trade?.output?.currency?.symbol}`

  const confirmationContent = useCallback(
    () =>
      swapErrorMessage ? (
        <TransactionErrorContent onDismiss={onDismiss} message={swapErrorMessage} />
      ) : (
        <ConfirmationModalContent
          title={`Confirm ${label}`}
          onDismiss={onDismiss}
          topContent={modalHeader}
          bottomContent={modalBottom}
        />
      ),
    [onDismiss, modalBottom, modalHeader, swapErrorMessage, label]
  )

  return (
    <TransactionConfirmationModal
      isOpen={isOpen}
      onDismiss={onDismiss}
      attemptingTxn={attemptingTxn}
      hash={txHash}
      content={confirmationContent}
      pendingText={pendingText}
    />
  )
}
