import { TransactionResponse } from '@ethersproject/abstract-provider'
import { ButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import { RowBetween } from 'components/Row'
import React, { useState } from 'react'
import Countdown from 'react-countdown'
import { GaugeInfo, UserGaugeInfo } from 'state/gauges/hooks'
import { StakingInfo, UserStakingInfo } from 'state/staking/hooks'
import styled from 'styled-components'
import { theme, TYPE } from 'theme'

import { useVotingEscrowContract } from '../../hooks/useContract'
import { useTransactionAdder } from '../../state/transactions/hooks'
import LockModal, { LockType } from './Lock/LockModal'

const SECONDS_IN_DAY = 24 * 60 * 60

const Container = styled.div`
  width: 49%;
  height: fit-content;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  padding-top: 0;
  background: ${({ theme }) => theme.bg1};
  border-radius: 1rem;
  margin: 0.25rem;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  width: 100%;
  margin-bottom: 1rem;
`}
`
const Wrapper = styled(AutoColumn)<{ showBackground: boolean }>`
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

type PropTypes = {
  userStakingInfo: UserStakingInfo
  stakingInfo: StakingInfo
  userGauges: (UserGaugeInfo | null)[]
  gauges: (GaugeInfo | null)[]
}
export default function Stake({ userStakingInfo, stakingInfo, userGauges, gauges }: PropTypes) {
  const { lock } = userStakingInfo
  const [lockType, setLockType] = useState(-1)

  const veMobiContract = useVotingEscrowContract()
  const [attempting, setAttempting] = useState(false)
  const addTransaction = useTransactionAdder()

  async function onClaim() {
    if (veMobiContract) {
      setAttempting(true)
      await veMobiContract
        .withdraw({ gasLimit: 10000000 })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Claimed locked MOBI`,
          })
        })
        .catch((error: any) => {
          setAttempting(false)
          console.log(error)
        })
        .finally(() => {
          setAttempting(false)
        })
    }
  }

  return (
    <Container>
      <LockModal
        isOpen={lockType > -1}
        onDismiss={() => setLockType(-1)}
        lockType={lockType}
        stakingInfo={stakingInfo}
        userGauges={userGauges}
        gauges={gauges}
      />
      <Wrapper showBackground={false}>
        <RowBetween marginBottom="1rem">
          <TYPE.largeHeader fontSize={[20, 32]}>Locked MOBI:</TYPE.largeHeader>
          <TYPE.green fontWeight={600} fontSize={[20, 24]}>
            {lock.locked.toSignificant(2)}
          </TYPE.green>
        </RowBetween>
        {lock.locked.greaterThan('0') && Date.now() + SECONDS_IN_DAY >= lock.end ? (
          <RowBetween>
            <TYPE.mediumHeader>You can claim in: </TYPE.mediumHeader>
            <Countdown date={lock.end} />
          </RowBetween>
        ) : lock.locked.greaterThan('0') ? (
          <RowBetween>
            <TYPE.mediumHeader>You can claim on: </TYPE.mediumHeader>
            <TYPE.mediumHeader>{new Date(lock.end).toLocaleDateString()}</TYPE.mediumHeader>
          </RowBetween>
        ) : null}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '1rem',
            gap: '1rem',
          }}
        >
          {Date.now() > lock.end && lock.locked.greaterThan('0') ? (
            <ButtonPrimary
              onClick={onClaim}
              style={{ fontWeight: 700, fontSize: 18, backgroundColor: theme(false).celoRed }}
            >
              {attempting ? 'CLAIMING...' : 'CLAIM'}
            </ButtonPrimary>
          ) : (
            <>
              <ButtonPrimary
                onClick={() =>
                  lock.locked.greaterThan('0') ? setLockType(LockType.increase) : setLockType(LockType.initial)
                }
                style={{ fontWeight: 700, fontSize: 18, backgroundColor: theme(false).celoGreen }}
              >
                DEPOSIT
              </ButtonPrimary>
              {lock.locked.greaterThan('0') && (
                <ButtonPrimary
                  onClick={() => setLockType(LockType.extend)}
                  style={{ fontWeight: 700, fontSize: 18, backgroundColor: theme(false).celoGold }}
                >
                  EXTEND
                </ButtonPrimary>
              )}
            </>
          )}
        </div>
      </Wrapper>
    </Container>
  )
}
