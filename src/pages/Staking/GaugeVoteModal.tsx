import { TransactionResponse } from '@ethersproject/providers'
import { JSBI } from '@ubeswap/sdk'
import { MaxButton } from 'pages/Pool/styleds'
import React, { useState } from 'react'
import { GaugeSummary, useVotePowerLeft } from 'state/staking/hooks'
import styled from 'styled-components'

import { ButtonError } from '../../components/Button'
import { AutoColumn } from '../../components/Column'
import Modal from '../../components/Modal'
import { LoadingView, SubmittedView } from '../../components/ModalViews'
import { RowBetween, RowFixed } from '../../components/Row'
import Slider from '../../components/Slider'
import { useWeb3Context } from '../../hooks'
import { useGaugeControllerContract } from '../../hooks/useContract'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { CloseIcon, TYPE } from '../../theme'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

interface GaugeVoteModalProps {
  isOpen: boolean
  onDismiss: () => void
  summary: GaugeSummary
  disabled: boolean
}

export const getAllUnclaimedMobi = (summaries: GaugeSummary[]): JSBI =>
  summaries.reduce((accum, { unclaimedMobi }) => JSBI.add(accum, unclaimedMobi.raw), JSBI.BigInt(0))

function daysBetween(d1: Date, d2: Date): number {
  return Math.floor((d1.getTime() - d2.getTime()) / (1000 * 3600 * 24))
}

export default function GaugeVoteModal({ isOpen, onDismiss, summary, disabled }: GaugeVoteModalProps) {
  const { connected } = useWeb3Context()

  // monitor call to help UI loading state
  const addTransaction = useTransactionAdder()
  const [hash, setHash] = useState<string | undefined>()
  const [attempting, setAttempting] = useState(false)
  const [input, setInput] = useState(0)
  const votesLeft = useVotePowerLeft() + summary.powerAllocated
  const today = new Date(Date.now())
  const lastVote = summary.lastVote

  function wrappedOnDismiss() {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }

  const controller = useGaugeControllerContract()

  async function onClaimReward() {
    if (controller) {
      setAttempting(true)
      await controller
        .vote_for_gauge_weights(summary.address, input * 100, { gasLimit: 350000 })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Voted ${disabled ? 'to burn' : `for ${summary.pool} to receive`} ${input}% of MOBI inflation`,
          })
          setHash(response.hash)
        })
        .catch((error: any) => {
          setAttempting(false)
          console.log(error)
        })
    }
  }

  let error: string | undefined
  if (!connected) {
    error = 'Connect Wallet'
  }

  if (daysBetween(today, lastVote) < 10) {
    error = error ?? `Wait ${10 - daysBetween(today, lastVote)} days to vote for this pool again`
  }

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          <RowBetween>
            <TYPE.mediumHeader>Vote for {disabled ? 'BURN' : summary.pool}</TYPE.mediumHeader>
            <CloseIcon onClick={wrappedOnDismiss} />
          </RowBetween>
          {votesLeft === 0 ? (
            <TYPE.mediumHeader fontWeight={1000} color="red" textAlign="center">
              You have already allocated 100%, you will have to change your vote on other pools first.
            </TYPE.mediumHeader>
          ) : (
            <>
              <RowFixed>
                <TYPE.body>You will not be able to vote on a new weight for this pool for 10 days!</TYPE.body>
              </RowFixed>
              <RowFixed>
                <TYPE.body>You have {votesLeft}% left to allocate!</TYPE.body>
              </RowFixed>
              <>
                <RowBetween>
                  <Slider value={input} onChange={setInput} step={0.01} max={votesLeft} />
                  <TYPE.body>{input.toFixed(0)}%</TYPE.body>
                </RowBetween>
                <RowBetween marginTop={-20}>
                  <MaxButton onClick={() => setInput(votesLeft / 4)} width="20%">
                    25%
                  </MaxButton>
                  <MaxButton onClick={() => setInput(votesLeft / 2)} width="20%">
                    50%
                  </MaxButton>
                  <MaxButton onClick={() => setInput(votesLeft * (3 / 4))} width="20%">
                    75%
                  </MaxButton>
                  <MaxButton onClick={() => setInput(votesLeft)} width="20%">
                    Max
                  </MaxButton>
                </RowBetween>
              </>
              <RowFixed>
                <TYPE.body>{`Vote ${
                  disabled ? 'to burn' : `for ${summary.pool} to receive`
                } ${input}% of MOBI inflation`}</TYPE.body>
              </RowFixed>
              <ButtonError disabled={!!error} error={!!error} onClick={onClaimReward}>
                {error ?? `Vote!`}
              </ButtonError>{' '}
            </>
          )}
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOnDismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.body fontSize={20}>Allocating veMOBI</TYPE.body>
          </AutoColumn>
        </LoadingView>
      )}
      {hash && (
        <SubmittedView onDismiss={wrappedOnDismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
            <TYPE.body fontSize={20}>veMOBI allocated to {summary.pool}</TYPE.body>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  )
}
