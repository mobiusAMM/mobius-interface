import { ButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import Modal from 'components/Modal'
import { LoadingView, SubmittedView } from 'components/ModalViews'
import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components/macro'
import { ExternalLink, TYPE } from 'theme'

import { getExplorerLink } from '../../constants/NetworkInfo'

export const ProposalSubmissionModal = ({
  isOpen,
  hash,
  onDismiss,
}: {
  isOpen: boolean
  hash: string | undefined
  onDismiss: () => void
}) => {
  const theme = useContext(ThemeContext)

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss}>
      {!hash ? (
        <LoadingView onDismiss={onDismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>
              <TYPE.main>Submitting Proposal</TYPE.main>
            </TYPE.largeHeader>
          </AutoColumn>
        </LoadingView>
      ) : (
        <SubmittedView onDismiss={onDismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <Text fontWeight={500} fontSize={20} textAlign="center">
              <TYPE.main>Proposal Submitted</TYPE.main>
            </Text>
            {hash && (
              <ExternalLink href={getExplorerLink(42220, hash, 'transaction')}>
                <Text fontWeight={500} fontSize={14} color={theme.primary1}>
                  <TYPE.main>View on Etherscan</TYPE.main>
                </Text>
              </ExternalLink>
            )}
            <ButtonPrimary as={Link} to="/vote" onClick={onDismiss} style={{ margin: '20px 0 0 0' }}>
              <Text fontWeight={500} fontSize={20}>
                <TYPE.main>Return</TYPE.main>
              </Text>
            </ButtonPrimary>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  )
}
