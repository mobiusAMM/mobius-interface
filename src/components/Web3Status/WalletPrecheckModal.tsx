import { AbstractConnector } from '@web3-react/abstract-connector'
import Column from 'components/Column'
import Modal from 'components/Modal'
import { RowBetween } from 'components/Row'
import { LedgerWalletSelector } from 'components/WalletModal/LedgerWalletSelector'
import { useWeb3Context } from 'hooks'
import React from 'react'
import { useIsDarkMode } from 'state/user/hooks'
import styled from 'styled-components'

import ledger_dark from '../../assets/images/ledger-dark.png'
import ledger_light from '../../assets/images/ledger-logo.png'
import metamask_logo from '../../assets/svg/metamask.svg'
import wallet_connect_logo from '../../assets/svg/walletconnect.svg'

type WalletPrecheckProps = {
  open: boolean
  onClose: () => void
}

const ContentWrapper = styled(Column)`
  width: 100%;
  flex: 1 1;
  position: relative;
  padding: 10px;
  padding-left: 20px;
  padding-right: 20px;
  align-items: center;
`

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: ${({ theme }) => theme.text3};
  margin-bottom: 1rem;
  margin-top: 1rem;
`

const ConnectorLogo = styled.img`
  border-radius: 30px;
  width: 12rem;
  padding: 1rem;
`

export function WalletPrecheckModal({ open, onClose }: WalletPrecheckProps) {
  const { connect } = useWeb3Context()
  const isDarkMode = useIsDarkMode()
  const [selectedLedger, setSelectedLedger] = React.useState(false)

  return (
    <Modal isOpen={open} onDismiss={onClose}>
      <ContentWrapper>
        {!selectedLedger ? (
          <>
            <ConnectorLogo src={isDarkMode ? ledger_dark : ledger_light} onClick={() => setSelectedLedger(true)} />
            <Divider />
            <RowBetween
              onClick={() => {
                onClose()
                connect()
              }}
            >
              <ConnectorLogo src={wallet_connect_logo} />
              <ConnectorLogo src={metamask_logo} />
            </RowBetween>{' '}
          </>
        ) : (
          <LedgerWalletSelector
            tryActivation={async (connector: AbstractConnector | undefined) => {
              await connect(connector)
              onClose()
            }}
          />
        )}
      </ContentWrapper>
    </Modal>
  )
}
