import { TransactionResponse } from '@ethersproject/providers'
import { IGauge } from 'constants/pools'
import React, { useState } from 'react'
import { UserGaugeInfo } from 'state/gauges/hooks'
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
import { useAllClaimableMobi } from './'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

interface StakingModalProps {
  isOpen: boolean
  onDismiss: () => void
  userGauges: UserGaugeInfo[]
  gauges: IGauge[]
}

export default function ClaimAllMobiModal({ isOpen, onDismiss, userGauges, gauges }: StakingModalProps) {
  const { connected } = useWeb3Context()
  const claimableMobi = useAllClaimableMobi(userGauges)

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

  const gaugeAddresses = [...Array(8).keys()].map((i) =>
    i < gauges.length ? gauges[i].address : '0x0000000000000000000000000000000000000000'
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
          <AutoColumn justify="center" gap="md">
            <TYPE.body fontWeight={600} fontSize={36}>
              {claimableMobi.toSignificant(6)} MOBI
            </TYPE.body>
            <TYPE.body>{`Across ${gauges.length} farms`}</TYPE.body>
          </AutoColumn>
          <ButtonError disabled={!!error} error={!!error} onClick={onClaimReward}>
            {error ?? 'Claim'}
          </ButtonError>
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOnDismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.body fontSize={20}>Claiming {claimableMobi.toSignificant(6)} MOBI</TYPE.body>
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
