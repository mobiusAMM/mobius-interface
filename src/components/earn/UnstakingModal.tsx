import { TransactionResponse } from '@ethersproject/providers'
import { TokenAmount } from 'lib/token-utils'
import React, { useCallback, useState } from 'react'
import styled from 'styled-components'

import { useWeb3Context } from '../../hooks'
import { useLiquidityGaugeContract } from '../../hooks/useContract'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { CloseIcon, TYPE } from '../../theme'
import { ButtonError } from '../Button'
import { AutoColumn } from '../Column'
import FormattedCurrencyAmount from '../FormattedCurrencyAmount'
import Modal from '../Modal'
import { LoadingView, SubmittedView } from '../ModalViews'
import { RowBetween } from '../Row'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

interface StakingModalProps {
  isOpen: boolean
  onDismiss: () => void
  userDeposited: TokenAmount
  gaugeAddress: string
}

export default function UnstakingModal({ isOpen, onDismiss, userDeposited, gaugeAddress }: StakingModalProps) {
  const { connected } = useWeb3Context()

  // monitor call to help UI loading state
  const addTransaction = useTransactionAdder()
  const [hash, setHash] = useState<string | undefined>()
  const [attempting, setAttempting] = useState(false)

  function wrappedOndismiss() {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }

  const stakingContract = useLiquidityGaugeContract(gaugeAddress)
  const withdrawFunction = stakingContract?.['withdraw(uint256,bool)']

  const onWithdraw = useCallback(async () => {
    if (withdrawFunction) {
      setAttempting(true)
      await withdrawFunction(userDeposited.raw.toString(), true, { gasLimit: 3000000 })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Withdraw deposited liquidity`,
          })
          setHash(response.hash)
        })
        .catch((error: any) => {
          setAttempting(false)
          console.log(error)
        })
    }
  }, [addTransaction, userDeposited.raw, withdrawFunction])

  let error: string | undefined
  if (!connected) {
    error = 'Connect Wallet'
  }

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOndismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          <RowBetween>
            <TYPE.mediumHeader>Withdraw</TYPE.mediumHeader>
            <CloseIcon onClick={wrappedOndismiss} />
          </RowBetween>

          <AutoColumn justify="center" gap="md">
            <TYPE.body fontWeight={600} fontSize={36}>
              {<FormattedCurrencyAmount currencyAmount={userDeposited} />}
            </TYPE.body>
            <TYPE.body>Deposited liquidity</TYPE.body>
          </AutoColumn>

          <TYPE.subHeader style={{ textAlign: 'center' }}>
            When you withdraw, your liquidity is removed from the mining pool.
          </TYPE.subHeader>
          <ButtonError disabled={!!error} error={!!error} onClick={onWithdraw}>
            {error ?? 'Withdraw'}
          </ButtonError>
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOndismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.body fontSize={20}>Withdrawing {userDeposited.toSignificant(4)} MOBI-LP</TYPE.body>
          </AutoColumn>
        </LoadingView>
      )}
      {hash && (
        <SubmittedView onDismiss={wrappedOndismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
            <TYPE.body fontSize={20}>Withdrew MOBI-LP!</TYPE.body>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  )
}
