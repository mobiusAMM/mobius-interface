import { TransactionResponse } from '@ethersproject/providers'
import { JSBI, TokenAmount } from '@ubeswap/sdk'
import { useMobi } from 'hooks/Tokens'
import React, { useState } from 'react'
import { GaugeSummary } from 'state/staking/hooks'
import styled from 'styled-components'

import { ButtonError } from '../../components/Button'
import { AutoColumn } from '../../components/Column'
import Modal from '../../components/Modal'
import { LoadingView, SubmittedView } from '../../components/ModalViews'
import { RowBetween } from '../../components/Row'
import { useWeb3Context } from '../../hooks'
import { useMobiMinterContract } from '../../hooks/useContract'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { CloseIcon, TYPE } from '../../theme'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

interface StakingModalProps {
  isOpen: boolean
  onDismiss: () => void
  summaries: GaugeSummary[]
}

export const getAllUnclaimedMobi = (summaries: GaugeSummary[]): JSBI =>
  summaries.reduce((accum, { unclaimedMobi }) => JSBI.add(accum, unclaimedMobi.raw), JSBI.BigInt(0))

export default function ClaimAllMobiModal({ isOpen, onDismiss, summaries }: StakingModalProps) {
  const { connected } = useWeb3Context()
  const mobi = useMobi()

  // monitor call to help UI loading state
  const addTransaction = useTransactionAdder()
  const [hash, setHash] = useState<string | undefined>()
  const [attempting, setAttempting] = useState(false)

  function wrappedOnDismiss() {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }

  const minter = useMobiMinterContract()

  const pendingMobi = new TokenAmount(mobi, getAllUnclaimedMobi(summaries))
  const gaugeAddresses = [...Array(8).keys()].map((i) =>
    i < summaries.length ? summaries[i].address : '0x0000000000000000000000000000000000000000'
  )

  async function onClaimReward() {
    if (minter) {
      setAttempting(true)
      await minter
        .mint_many(gaugeAddresses, { gasLimit: 10000000 })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Claim accumulated MOBI rewards`,
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

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          <RowBetween>
            <TYPE.mediumHeader>Claim</TYPE.mediumHeader>
            <CloseIcon onClick={wrappedOnDismiss} />
          </RowBetween>
          {pendingMobi && (
            <AutoColumn justify="center" gap="md">
              <TYPE.body fontWeight={600} fontSize={36}>
                {pendingMobi.toSignificant(6)} MOBI
              </TYPE.body>
              <TYPE.body>{`Across ${summaries.length} farms`}</TYPE.body>
            </AutoColumn>
          )}
          <ButtonError disabled={!!error} error={!!error} onClick={onClaimReward}>
            {error ?? 'Claim'}
          </ButtonError>
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOnDismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.body fontSize={20}>Claiming {pendingMobi.toSignificant(6)} MOBI</TYPE.body>
          </AutoColumn>
        </LoadingView>
      )}
      {hash && (
        <SubmittedView onDismiss={wrappedOnDismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
            <TYPE.body fontSize={20}>Claimed MOBI!</TYPE.body>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  )
}
