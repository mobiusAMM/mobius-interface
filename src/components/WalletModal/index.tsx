import { useWeb3Context } from 'hooks'
import React from 'react'
import styled from 'styled-components'

import { ApplicationModal } from '../../state/application/actions'
import { useCloseModals, useModalOpen } from '../../state/application/hooks'
import AccountDetails from '../AccountDetails'
import Modal from '../Modal'

const Wrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  margin: 0;
  padding: 0;
  width: 100%;
`

export default function WalletModal({
  pendingTransactions,
  confirmedTransactions,
  ENSName,
}: {
  pendingTransactions: string[] // hashes of pending
  confirmedTransactions: string[] // hashes of confirmed
  ENSName?: string
}) {
  const { address } = useWeb3Context()
  const walletModalOpen = useModalOpen(ApplicationModal.WALLET)
  const closeModals = useCloseModals()

  function getModalContent() {
    if (address) {
      return (
        <AccountDetails
          toggleWalletModal={closeModals}
          pendingTransactions={pendingTransactions}
          confirmedTransactions={confirmedTransactions}
          ENSName={ENSName}
        />
      )
    }
    return null
  }

  return (
    <Modal isOpen={walletModalOpen} onDismiss={closeModals} minHeight={false} maxHeight={90}>
      <Wrapper>{getModalContent()}</Wrapper>
    </Modal>
  )
}
