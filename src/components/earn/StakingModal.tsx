import { TransactionResponse } from '@ethersproject/providers'
import CurrencyLogo from 'components/CurrencyLogo'
import Loader from 'components/Loader'
import NumericalInput from 'components/NumericalInput'
import { useWeb3Context } from 'hooks'
import { useMobi } from 'hooks/Tokens'
import JSBI from 'jsbi'
import { Token, TokenAmount } from 'lib/token-utils'
import React, { useCallback, useState } from 'react'
import { tryParseAmount } from 'state/swap/hooks'
import { useTokenBalance } from 'state/wallet/hooks'
import styled from 'styled-components'

import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { useLiquidityGaugeContract } from '../../hooks/useContract'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { CloseIcon, TYPE } from '../../theme'
import { ButtonConfirmed, ButtonError } from '../Button'
import { AutoColumn } from '../Column'
import Modal from '../Modal'
import { LoadingView, SubmittedView } from '../ModalViews'
import ProgressCircles from '../ProgressSteps'
import { AutoRow, RowBetween } from '../Row'

const HypotheticalRewardRate = styled.div<{ dim: boolean }>`
  display: flex;
  justify-content: space-between;
  padding-right: 20px;
  padding-left: 20px;

  opacity: ${({ dim }) => (dim ? 0.5 : 1)};
`

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
  paddingright: 2rem;
`

interface StakingModalProps {
  isOpen: boolean
  onDismiss: () => void
  userDeposited: TokenAmount
  totalDeposited: TokenAmount
  userLiquidityUnstaked: TokenAmount
  gaugeAddress: string
  mobiRate: TokenAmount
}

const calcNewRewardRate = (totalMobiRate: JSBI, totalStaked: JSBI, stakedByUser: JSBI, token: Token) =>
  new TokenAmount(token, JSBI.multiply(totalMobiRate, JSBI.divide(stakedByUser, totalStaked)))

export default function StakingModal({
  isOpen,
  onDismiss,
  userDeposited,
  totalDeposited,
  userLiquidityUnstaked,
  gaugeAddress,
  mobiRate,
}: StakingModalProps) {
  const addTransaction = useTransactionAdder()
  const mobi = useMobi()
  const { connected } = useWeb3Context()

  // track and parse user input
  const [typedValue, setTypedValue] = useState('')

  const inputAmount = tryParseAmount(typedValue, userDeposited.token)
  // const { parsedAmount, error } = useDerivedStakeInfo(typedValue, stakingInfo.lpToken, userLiquidityUnstaked)
  // const parsedAmountWrapped = parsedAmount

  let hypotheticalMobiRewardRate: TokenAmount = new TokenAmount(mobi, '0')
  if (inputAmount?.greaterThan('0')) {
    if (totalDeposited.equalTo('0')) {
      hypotheticalMobiRewardRate = mobiRate
    } else {
      hypotheticalMobiRewardRate = calcNewRewardRate(
        mobiRate.raw,
        JSBI.add(totalDeposited.raw, inputAmount.raw),
        JSBI.add(userDeposited.raw, inputAmount.raw),
        mobi
      )
    }
  }

  // state for pending and submitted txn views
  const [attempting, setAttempting] = useState<boolean>(false)
  const [hash, setHash] = useState<string | undefined>()
  const wrappedOnDismiss = useCallback(() => {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }, [onDismiss])

  // approval data for stake
  const deadline = useTransactionDeadline()
  const [approval, approveCallback] = useApproveCallback(inputAmount, gaugeAddress)

  const stakingContract = useLiquidityGaugeContract(gaugeAddress)
  const depositFunction = stakingContract?.['deposit(uint256)']

  async function onStake() {
    setAttempting(true)
    if (stakingContract && inputAmount && deadline && depositFunction) {
      if (approval === ApprovalState.APPROVED) {
        await depositFunction(inputAmount.raw.toString(), { gasLimit: 10000000 }).then(
          (response: TransactionResponse) => {
            addTransaction(response, {
              summary: `Stake deposited liquidity`,
            })
            setHash(response.hash)
          }
        )
      } else {
        setAttempting(false)
        throw new Error('Attempting to stake without approval or a signature. Please contact support.')
      }
    }
  }

  let error: string | undefined
  if (!connected) {
    error = 'Connect Wallet'
  }

  async function onAttemptToApprove() {
    if (!deadline) throw new Error('missing dependencies')
    approveCallback()
  }

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          <RowBetween>
            <TYPE.mediumHeader>Deposit</TYPE.mediumHeader>
            <CloseIcon onClick={wrappedOnDismiss} />
          </RowBetween>
          <CurrencyRow tokenAmount={userLiquidityUnstaked} input={typedValue} setInput={setTypedValue} />

          <HypotheticalRewardRate dim={!hypotheticalMobiRewardRate.greaterThan('0')}>
            <div>
              <TYPE.black fontWeight={600}>Weekly Rewards</TYPE.black>
            </div>

            <div>
              <TYPE.black>
                {hypotheticalMobiRewardRate
                  .multiply((60 * 60 * 24 * 7).toString())
                  .toSignificant(4, { groupSeparator: ',' })}{' '}
                MOBI / week
              </TYPE.black>
            </div>
          </HypotheticalRewardRate>

          <RowBetween>
            <ButtonConfirmed
              mr="0.5rem"
              onClick={onAttemptToApprove}
              confirmed={approval === ApprovalState.APPROVED}
              disabled={approval !== ApprovalState.NOT_APPROVED}
            >
              {approval === ApprovalState.PENDING ? (
                <AutoRow gap="6px" justify="center">
                  Approving <Loader stroke="white" />
                </AutoRow>
              ) : (
                'Approve'
              )}
            </ButtonConfirmed>
            <ButtonError
              disabled={!!error || approval !== ApprovalState.APPROVED}
              error={!!error && !!inputAmount}
              onClick={onStake}
            >
              {error ?? 'Deposit'}
            </ButtonError>
          </RowBetween>
          <ProgressCircles steps={[approval === ApprovalState.APPROVED]} disabled={true} />
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOnDismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Depositing Liquidity</TYPE.largeHeader>
            <TYPE.body fontSize={20}>{inputAmount?.toSignificant(4)} MOBI LP</TYPE.body>
          </AutoColumn>
        </LoadingView>
      )}
      {attempting && hash && (
        <SubmittedView onDismiss={wrappedOnDismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
            <TYPE.body fontSize={20}>Deposited {inputAmount?.toSignificant(4)} MOBI LP</TYPE.body>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  )
}

type CurrencyRowProps = {
  tokenAmount: TokenAmount
  setInput: (amount: string) => void
  input: string
}

const InputRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0.75rem 0.75rem 1rem;
`

const InputDiv = styled.div`
  display: flex;
  min-width: 40%;
`

const Aligner = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const StyledTokenName = styled.span<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.75rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
  font-size:  ${({ active }) => (active ? '20px' : '16px')};
  color: ${({ theme }) => theme.text1};
`
const BalanceText = styled(TYPE.subHeader)`
  cursor: pointer;
`

const CurrencyRow = ({ tokenAmount, setInput, input }: CurrencyRowProps) => {
  const { address, connected } = useWeb3Context()
  const mobi = useMobi()
  const currency = tokenAmount.token
  const tokenBalance = useTokenBalance(connected ? address : undefined, currency ?? undefined)

  const decimalPlacesForBalance = tokenBalance?.greaterThan(
    '1' //JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt(tokenBalance.token.decimals - 2)).toString()
  )
    ? 2
    : tokenBalance?.greaterThan('0')
    ? 6
    : 2

  const mainRow = (
    <InputRow>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Aligner>
          <CurrencyLogo currency={mobi} size={'34px'} />
          <StyledTokenName className="token-symbol-container" active={Boolean(currency && currency.symbol)}>
            {(currency && currency.symbol && currency.symbol.length > 20
              ? currency.symbol.slice(0, 4) +
                '...' +
                currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
              : currency?.symbol) || ''}
          </StyledTokenName>
        </Aligner>
      </div>
      <InputDiv>
        <NumericalInput
          className="token-amount-input"
          value={input}
          onUserInput={(val) => {
            setInput(val)
          }}
        />
      </InputDiv>
    </InputRow>
  )
  const balanceRow = (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <BalanceText onClick={() => setInput(tokenBalance?.toFixed(5) ?? '')}>
        Balance: {tokenBalance?.toFixed(decimalPlacesForBalance) ?? 'Loading...'}
      </BalanceText>
    </div>
  )

  return (
    <div>
      {balanceRow}
      {mainRow}
    </div>
  )
}
