import { Token } from '@ubeswap/sdk'
import AddressInputPanel from 'components/AddressInputPanel'
import CurrencyInputPanel from 'components/CurrencyInputPanel'
import React from 'react'
import styled from 'styled-components/macro'

import { ProposalAction } from './ProposalActionSelector'

enum ProposalActionDetailField {
  ADDRESS,
  CURRENCY,
  GAUGE,
}

const ProposalActionDetailContainer = styled.div`
  margin-top: 10px;
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  grid-gap: 10px;
`

export const ProposalActionDetail = ({
  className,
  proposalAction,
  currency,
  amount,
  toAddress,
  gaugeAddress,
  onCurrencySelect,
  onAmountInput,
  onToAddressInput,
  onGaugeAddressInput,
}: {
  className?: string
  proposalAction: ProposalAction
  currency: Token | undefined
  amount: string
  toAddress: string
  gaugeAddress: string
  onCurrencySelect: (currency: Token) => void
  onAmountInput: (amount: string) => void
  onToAddressInput: (address: string) => void
  onGaugeAddressInput: (address: string) => void
}) => {
  const proposalActionsData = {
    [ProposalAction.ADD_GAUGE]: [
      {
        type: ProposalActionDetailField.GAUGE,
        label: 'Gauge Address',
      },
    ],
    [ProposalAction.KILL_GAUGE]: [
      {
        type: ProposalActionDetailField.GAUGE,
        label: 'Gauge Address',
      },
    ],
    [ProposalAction.TRANSFER_TOKEN]: [
      {
        type: ProposalActionDetailField.ADDRESS,
        label: 'To',
      },
      {
        type: ProposalActionDetailField.CURRENCY,
      },
    ],
  }

  return (
    <ProposalActionDetailContainer className={className}>
      {proposalActionsData[proposalAction].map((field, i) =>
        field.type === ProposalActionDetailField.ADDRESS ? (
          <AddressInputPanel key={i} label={field.label} value={toAddress} onChange={onToAddressInput} />
        ) : field.type === ProposalActionDetailField.GAUGE ? (
          <AddressInputPanel key={i} label={field.label} value={gaugeAddress} onChange={onGaugeAddressInput} />
        ) : field.type === ProposalActionDetailField.CURRENCY ? (
          <CurrencyInputPanel
            key={i}
            value={amount}
            currency={currency}
            onUserInput={(amount: string) => onAmountInput(amount)}
            onCurrencySelect={(currency: Token) => onCurrencySelect(currency)}
            showMaxButton={false}
            showCommonBases={false}
            hideBalance={true}
            disableCurrencySelect={true}
            id="currency-input"
          />
        ) : null
      )}
    </ProposalActionDetailContainer>
  )
}
