import { Token } from '@ubeswap/sdk'
import React, { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router'

import useLast from '../../hooks/useLast'
import { TokenType } from '../CurrencyInputPanel'
import Modal from '../Modal'
import { CurrencySearch } from './CurrencySearch'

interface CurrencySearchModalProps {
  isOpen: boolean
  onDismiss: () => void
  selectedCurrency?: Token | null
  onCurrencySelect: (currency: Token) => void
  otherSelectedCurrency?: Token | null
  tokenType?: TokenType
}

export enum CurrencyModalView {
  search,
  manage,
  importToken,
  importList,
}

export default function CurrencySearchModal({
  isOpen,
  onDismiss,
  onCurrencySelect,
  selectedCurrency,
  otherSelectedCurrency,
  tokenType,
}: CurrencySearchModalProps) {
  const location = useLocation()
  const [modalView, setModalView] = useState<CurrencyModalView>(CurrencyModalView.manage)
  const lastOpen = useLast(isOpen)

  useEffect(() => {
    if (isOpen && !lastOpen) {
      setModalView(CurrencyModalView.search)
    }
  }, [isOpen, lastOpen])

  const handleCurrencySelect = useCallback(
    (currency: Token) => {
      onCurrencySelect(currency)
      onDismiss()
    },
    [onDismiss, onCurrencySelect]
  )

  // change min height if not searching
  const minHeight = modalView === CurrencyModalView.importToken || modalView === CurrencyModalView.importList ? 40 : 80

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={80} minHeight={minHeight}>
      <CurrencySearch
        isOpen={isOpen}
        onDismiss={onDismiss}
        onCurrencySelect={handleCurrencySelect}
        selectedCurrency={selectedCurrency}
        otherSelectedCurrency={otherSelectedCurrency}
        tokenType={tokenType}
        mento={location.pathname.includes('mint')}
      />
    </Modal>
  )
}
