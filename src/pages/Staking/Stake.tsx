import { ButtonOutlined, ButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import { RowBetween, RowFixed } from 'components/Row'
import React, { useState } from 'react'
import { MobiStakingInfo } from 'state/staking/hooks'
import styled from 'styled-components'
import { TYPE } from 'theme'

import LockModal from './LockModal'

const Container = styled.div`
  width: 49%;
  height: fit-content;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background: ${({ theme }) => theme.bg1};
  border-radius: 1rem;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  width: 100%;
  margin-bottom: 1rem;
`}
`
const Wrapper = styled(AutoColumn)<{ showBackground: boolean; background: any }>`
  border-radius: 12px;
  width: 100%;
  overflow: hidden;
  position: relative;
  padding: 1rem;
  background: ${({ theme }) => theme.bg1};
  color: ${({ theme }) => theme.text1} !important;
  ${({ showBackground }) =>
    showBackground &&
    `  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);`}
  ${({ theme }) => theme.mediaWidth.upToSmall`
  padding-left: 0.25rem;
  padding-right: 0.25rem;
`}
`
const ButtonGroup = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
`

const SmallButton = styled(ButtonOutlined)`
  padding: 0.5rem;
`

type PropTypes = {
  stakingInfo: MobiStakingInfo
}
export default function Stake({ stakingInfo }: PropTypes) {
  const { mobiLocked, lockEnd } = stakingInfo
  const [openLockModal, setOpenLockModal] = useState(false)

  return (
    <Container>
      <LockModal isOpen={openLockModal} onDismiss={() => setOpenLockModal(false)} />
      {mobiLocked && mobiLocked.greaterThan('0') ? (
        <Wrapper>
          <RowBetween marginBottom="1rem">
            <TYPE.mediumHeader>MOBI Locked:</TYPE.mediumHeader>
            <RowFixed width="33%">
              <TYPE.mediumHeader>{mobiLocked.toFixed(2)}</TYPE.mediumHeader>
              <div style={{ marginLeft: '1rem' }}>
                <SmallButton>Lock More</SmallButton>
              </div>
            </RowFixed>
          </RowBetween>
          <RowBetween>
            <TYPE.mediumHeader>You can claim on: </TYPE.mediumHeader>
            <RowFixed width="33%">
              <TYPE.mediumHeader>{lockEnd?.toLocaleDateString() ?? '--'}</TYPE.mediumHeader>
              <div style={{ marginLeft: '1rem' }}>
                <SmallButton>Extend</SmallButton>
              </div>
            </RowFixed>
          </RowBetween>
          {Date.now() > (lockEnd?.valueOf() ?? 0) && (
            <ButtonGroup>
              <ButtonPrimary disabled={Date.now() < (lockEnd?.valueOf() ?? 0)}>Claim Locked Mobi</ButtonPrimary>
            </ButtonGroup>
          )}
        </Wrapper>
      ) : (
        <Wrapper>
          <RowBetween marginBottom="1rem">
            <TYPE.mediumHeader fontSize={[16, 24]}>You currently do not have any locked MOBI</TYPE.mediumHeader>
          </RowBetween>
          <ButtonPrimary onClick={() => setOpenLockModal(true)}>Lock MOBI</ButtonPrimary>
        </Wrapper>
      )}
    </Container>
  )
}
