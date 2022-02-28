import JSBI from 'jsbi'
import { darken } from 'polished'
import React, { useState } from 'react'
import styled from 'styled-components'

import { useColor } from '../../hooks/useColor'
import { CloseIcon, StyledInternalLink, TYPE } from '../../theme'
import { ButtonPrimary } from '../Button'
import { AutoColumn } from '../Column'
import Modal from '../Modal'
import { LoadingView, SubmittedView } from '../ModalViews'
import { RowBetween } from '../Row'
import WithdrawLP from './WithdrawLP'
import WithdrawTokens from './WithdrawTokens'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
  gap: 2rem;
`
const StyledButton = styled(ButtonPrimary)<{ background: any; backgroundHover: any }>`
  background: ${({ background }) => background};
  flex: 0.6;
  &:hover {
    background: ${({ background }) => darken(0.1, background)};
  }
`

const DepositWithdrawBtn = styled(StyledButton)`
  width: 100%;
  flex: none;
`

interface WithdrawModalProps {
  isOpen: boolean
  onDismiss: () => void
  poolInfo: StablePoolInfo
}

export default function WithdrawModal({ isOpen, onDismiss, poolInfo }: WithdrawModalProps) {
  // monitor call to help UI loading state
  const [byToken, setByToken] = useState<boolean>(false)
  const [hash, setHash] = useState<string | undefined>()
  const [attempting, setAttempting] = useState(false)

  function wrappedOndismiss() {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }

  // get the color of the token
  const backgroundColor = useColor()

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOndismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          <RowBetween>
            <TYPE.largeHeader>Withdraw from {poolInfo.name}</TYPE.largeHeader>
            <CloseIcon onClick={wrappedOndismiss} />
          </RowBetween>
          {/* <RowBetween>
            <RowFixed>
              <TYPE.subHeader fontWeight={400} fontSize={14}>
                By Token Amount
              </TYPE.subHeader>
              <QuestionHelper text="Withdraw by specific token amounts rather than LP tokens." />
            </RowFixed>
            <Toggle id="toggle-equal-amount-button" isActive={byToken} toggle={() => setByToken(!byToken)} />
          </RowBetween> */}
          {JSBI.greaterThan(JSBI.subtract(poolInfo.amountDeposited?.raw, poolInfo.stakedAmount.raw), JSBI.BigInt(0)) ? (
            byToken ? (
              <WithdrawTokens poolInfo={poolInfo} setAttempting={setAttempting} setHash={setHash} />
            ) : (
              <WithdrawLP poolInfo={poolInfo} setAttempting={setAttempting} setHash={setHash} />
            )
          ) : (
            <ContentWrapper>
              <RowBetween>
                <TYPE.mediumHeader>Withdraw from farm first</TYPE.mediumHeader>
              </RowBetween>
              <StyledInternalLink to={`/farm/${poolInfo.name}`} style={{ width: '100%' }}>
                <DepositWithdrawBtn
                  background={backgroundColor}
                  backgroundHover={backgroundColor}
                  style={{ width: '100%' }}
                >
                  Farm
                </DepositWithdrawBtn>
              </StyledInternalLink>
            </ContentWrapper>
          )}
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOndismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.body fontSize={20}>Withdrawing</TYPE.body>
            <TYPE.body fontSize={20}>Claiming Tokens!</TYPE.body>
          </AutoColumn>
        </LoadingView>
      )}
      {hash && (
        <SubmittedView onDismiss={wrappedOndismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
            <TYPE.body fontSize={20}>Claimed Tokens!</TYPE.body>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  )
}
