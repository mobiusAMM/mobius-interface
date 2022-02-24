import { ButtonConfirmed } from 'components/Button'
import Toggle from 'components/Toggle'
import React, { useState } from 'react'
import styled from 'styled-components'
import { ExternalLink } from 'theme/components'
import { getCookie, setCookie } from 'utils/cookies'

import { CloseIcon, TYPE } from '../../theme'
import { AutoColumn } from '../Column'
import Modal from '../Modal'
import { RowBetween } from '../Row'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

interface ModalProps {
  isOpen: boolean
  onDismiss: () => void
}

export default function WarningModal({ isOpen, onDismiss }: ModalProps) {
  const [neverShow, setNeverShow] = useState(false)
  const COOKIE_NAME = 'staking-rewards' // optics-warning
  const dismiss = () => {
    if (neverShow) {
      setCookie(COOKIE_NAME, 'true', 31)
    }
    onDismiss()
  }
  const cookieExists = !!getCookie(COOKIE_NAME)
  return (
    <Modal isOpen={!cookieExists && isOpen} onDismiss={dismiss} maxHeight={90}>
      <ContentWrapper gap="lg">
        <RowBetween>
          <TYPE.main fontSize={[18, 24]}>MOBI Stakers now receive CELO</TYPE.main>
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
        <TYPE.body>
          We have partnered with the Celo Foundation and DeFi for the People to bring CELO rewards to users who
          lock/stake veMOBI. As we fully decentralize, those who stake veMOBI will control all governable parameters of
          the Mobius protocol. Reserve your spot governing the future of Mobius and earn double digit yield (while
          supplies last).
        </TYPE.body>
        <ExternalLink href="https://mobius.money/#/stake">Start Staking</ExternalLink>
        <RowBetween>
          <TYPE.mediumHeader>{"Don't"} show this again</TYPE.mediumHeader>
          <Toggle isActive={neverShow} toggle={() => setNeverShow(!neverShow)} />
        </RowBetween>
        <ButtonConfirmed onClick={dismiss}>Dismiss</ButtonConfirmed>
      </ContentWrapper>
    </Modal>
  )
}
