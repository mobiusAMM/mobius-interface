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
  const COOKIE_NAME = 'ubi-for-ukraine'
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
          <TYPE.main fontSize={[18, 24]}>To Our Ukraine Users</TYPE.main>
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
        <TYPE.body>
          🇺🇦 Are you in Ukraine or had to flee from the country due to the war, and need financial support to overcome
          the difficulties? To start receiving basic income ubi, create a Valora wallet and send your address to
          impactMarket through Whatsapp at +351910408753. <br />
          If you are not in Ukraine but would like to provide monetary support, see the link below to donate to ubi
          beneficiaries in Ukraine.
        </TYPE.body>
        <ExternalLink href="https://www.impactmarket.com/communities/3467">UBI for Ukraine</ExternalLink>
        <RowBetween>
          <TYPE.mediumHeader>{"Don't"} show this again</TYPE.mediumHeader>
          <Toggle isActive={neverShow} toggle={() => setNeverShow(!neverShow)} />
        </RowBetween>
        <ButtonConfirmed onClick={dismiss}>Dismiss</ButtonConfirmed>
      </ContentWrapper>
    </Modal>
  )
}
