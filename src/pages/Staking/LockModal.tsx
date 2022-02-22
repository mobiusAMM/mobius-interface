import { TransactionResponse } from '@ethersproject/abstract-provider'
import { ButtonConfirmed } from 'components/Button'
import Loader from 'components/Loader'
import { ExternalStakingRewards } from 'constants/staking'
import { useStakingContract } from 'hooks/useContract'
import React, { useState } from 'react'
import { useTransactionAdder } from 'state/transactions/hooks'
import styled from 'styled-components'

import { AutoColumn } from '../../components/Column'
import Modal from '../../components/Modal'
import { LoadingView, SubmittedView } from '../../components/ModalViews'
import { RowBetween } from '../../components/Row'
import { CHAIN } from '../../constants'
import { CloseIcon, TYPE } from '../../theme'
import ExtendLock from './ExtendLock'
import IncreaseLockAmount from './IncreaseLockAmount'
import Lock from './Lock'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`
export enum LockType {
  initial,
  extend,
  increase,
}

interface LockModalProps {
  isOpen: boolean
  onDismiss: () => void
  lockType?: LockType
}

const ModifiedWrapper = styled(ContentWrapper)`
  overflow-y: scroll;
  ::-webkit-scrollbar {
    width: 0px;
    background: transparent; /* make scrollbar transparent */
  }
`

export default function LockModal({ isOpen, onDismiss, lockType = LockType.initial }: LockModalProps) {
  // monitor call to help UI loading state
  const stakingContract = useStakingContract(ExternalStakingRewards[CHAIN])
  const addTransaction = useTransactionAdder()
  const [hash, setHash] = useState<string | undefined>()
  const [hasSnapshot, setHasSnapshot] = useState(0)
  const [attempting, setAttempting] = useState(false)

  async function onSnapshotRewards() {
    if (stakingContract) {
      setHasSnapshot(1)
      await stakingContract
        .getReward()
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Snapshot for MOBI staking rewards`,
          })
          response.wait().then(() => setHasSnapshot(2))
        })
        .catch((error: any) => {
          setAttempting(false)
          console.log(error)
        })
    }
  }

  function wrappedOndismiss() {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOndismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ModifiedWrapper gap="lg">
          <RowBetween>
            <TYPE.largeHeader>
              {lockType === LockType.initial
                ? 'Lock Mobi'
                : lockType === LockType.extend
                ? 'Extend Lock'
                : 'Increase Amount of Mobi Locked'}
            </TYPE.largeHeader>
            <CloseIcon onClick={wrappedOndismiss} />
          </RowBetween>
          {hasSnapshot !== 2 ? (
            <ButtonConfirmed onClick={onSnapshotRewards} disabled={hasSnapshot > 0}>
              {hasSnapshot === 0 ? <TYPE.mediumHeader>Snapshot veMOBI Celo Rewards</TYPE.mediumHeader> : <Loader />}
            </ButtonConfirmed>
          ) : lockType === LockType.initial ? (
            <Lock setAttempting={setAttempting} setHash={setHash} />
          ) : lockType === LockType.extend ? (
            <ExtendLock setAttempting={setAttempting} setHash={setHash} />
          ) : (
            <IncreaseLockAmount setAttempting={setAttempting} setHash={setHash} />
          )}
        </ModifiedWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOndismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.body fontSize={20}>Locking Mobi</TYPE.body>
          </AutoColumn>
        </LoadingView>
      )}
      {hash && (
        <SubmittedView onDismiss={wrappedOndismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
            <TYPE.body fontSize={20}>Mobi Locked!</TYPE.body>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  )
}
