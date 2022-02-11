import { TransactionResponse } from '@ethersproject/providers'
import { JSBI, TokenAmount } from '@ubeswap/sdk'
import CurrencyLogo from 'components/CurrencyLogo'
import React, { useState } from 'react'
import { tryParseAmount } from 'state/swap/hooks'
import styled from 'styled-components'

import { weiScale } from '../../constants'
import { useWeb3Context } from '../../hooks'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { useStableSwapContract } from '../../hooks/useContract'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import { StablePoolInfo, useExpectedLpTokens, useWarning } from '../../state/stablePools/hooks'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import { CloseIcon, ExternalLink, TYPE } from '../../theme'
import { ButtonConfirmed, ButtonError, ButtonPrimary } from '../Button'
import { AutoColumn } from '../Column'
import Modal from '../Modal'
import { LoadingView, SubmittedView } from '../ModalViews'
import { Input as NumericalInput } from '../NumericalInput'
import QuestionHelper from '../QuestionHelper'
import { AutoRow, RowBetween, RowFixed } from '../Row'
import Toggle from '../Toggle'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

const ApprovalButton = styled(ButtonPrimary)`
  margin-right: 0.25rem;
  margin-left: 0.25rem;
`

interface DepositModalProps {
  isOpen: boolean
  onDismiss: () => void
  poolInfo: StablePoolInfo
}

export default function DepositModal({ isOpen, onDismiss, poolInfo }: DepositModalProps) {
  const { address, connected } = useWeb3Context()
  // monitor call to help UI loading state
  const addTransaction = useTransactionAdder()
  const { tokens, peggedTo, pegComesAfter, totalDeposited } = poolInfo
  const warning = useWarning(poolInfo.poolAddress ?? undefined)
  const [hash, setHash] = useState<string | undefined>()
  const [attempting, setAttempting] = useState(false)
  const [approving, setApproving] = useState(false)
  const [input, setInput] = useState<(string | undefined)[]>(new Array(tokens.length).fill(undefined))
  const [warningAcknowledged, setWarningAcknowledged] = useState<boolean>(!warning)
  const isFirstDeposit = totalDeposited.equalTo('0')
  const forceEqualDeposit = isFirstDeposit || warning?.modification === 'require-equal-deposit'
  const [useEqualAmount, setUseEqualAmount] = useState<boolean>(forceEqualDeposit)
  const deadline = useTransactionDeadline()

  const sumAmount = tokens
    .map((t, i) =>
      JSBI.multiply(
        tryParseAmount(input[i], t)?.raw ?? JSBI.BigInt(0),
        JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18 - t.decimals))
      )
    )
    .reduce((acc, cur) => JSBI.add(acc, cur), JSBI.BigInt(0))

  const [expectedLPTokens, selectedAmounts] = useExpectedLpTokens(poolInfo, tokens, input)
  const valueOfLP = new TokenAmount(
    poolInfo.lpToken,
    JSBI.divide(
      JSBI.multiply(expectedLPTokens.raw, poolInfo.virtualPrice),
      JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('18'))
    )
  )

  const diff = JSBI.greaterThan(valueOfLP.raw, sumAmount)
    ? JSBI.subtract(valueOfLP.raw, sumAmount)
    : JSBI.subtract(sumAmount, valueOfLP.raw)

  const perDiff = JSBI.equal(sumAmount, JSBI.BigInt(0))
    ? JSBI.BigInt(0)
    : JSBI.divide(JSBI.multiply(diff, weiScale), sumAmount)

  const decimalPlacesForLP = expectedLPTokens?.greaterThan('1') ? 2 : expectedLPTokens?.greaterThan('0') ? 10 : 2

  const withSlippage = JSBI.subtract(expectedLPTokens.raw, JSBI.divide(expectedLPTokens.raw, JSBI.BigInt('10')))
  const approvals = [
    useApproveCallback(selectedAmounts[0], poolInfo.poolAddress),
    useApproveCallback(selectedAmounts[1], poolInfo.poolAddress),
  ]
  const toApprove = approvals
    .map(([approvalState], i) => {
      if (approvalState !== ApprovalState.APPROVED) return i
      else return null
    })
    .filter((x) => x !== null)
  function wrappedOndismiss() {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }

  const stakingContract = useStableSwapContract(poolInfo.poolAddress)
  async function onDeposit() {
    const allValid = selectedAmounts.reduce((accum, cur) => accum && !!cur && !!cur.raw, true)
    if (stakingContract && poolInfo?.stakedAmount && allValid) {
      setAttempting(true)
      const tokenAmounts = selectedAmounts.map((amount) => BigInt(amount.raw.toString()))
      await stakingContract
        .addLiquidity(tokenAmounts, withSlippage.toString(), deadline, { gasLimit: 10000000 })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Deposit Liquidity into ${poolInfo.name}`,
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
  if (!poolInfo?.stakedAmount) {
    error = error ?? 'Enter an amount'
  }

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOndismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          {!warningAcknowledged && warning ? (
            <>
              <RowBetween>
                <TYPE.main fontSize={[18, 24]}>WARNING</TYPE.main>
                <CloseIcon onClick={onDismiss} />
              </RowBetween>
              <TYPE.body>{warning.warning}</TYPE.body>
              {warning.link && <ExternalLink href={warning?.link}>Learn More</ExternalLink>}
              <ButtonConfirmed onClick={() => setWarningAcknowledged(true)}>Acknowledge</ButtonConfirmed>
            </>
          ) : (
            <>
              <RowBetween>
                <TYPE.largeHeader>Deposit to {poolInfo.name}</TYPE.largeHeader>
                <CloseIcon onClick={wrappedOndismiss} />
              </RowBetween>
              {forceEqualDeposit && (
                <AutoRow>
                  <TYPE.body color="red">
                    Due to the current conditions of this pool, deposits must be made in equal amounts of both tokens.
                  </TYPE.body>
                </AutoRow>
              )}
              <RowBetween>
                <RowFixed>
                  <TYPE.subHeader fontWeight={400} fontSize={14}>
                    Equal Amount
                  </TYPE.subHeader>
                  <QuestionHelper text="Automatically deposit an equal amount of each token." />
                </RowFixed>
                <Toggle
                  id="toggle-equal-amount-button"
                  isActive={useEqualAmount}
                  toggle={() => !forceEqualDeposit && setUseEqualAmount(!useEqualAmount)}
                />
              </RowBetween>
              {poolInfo.tokens.map((token, i) => (
                <div key={`deposit-row-${token.symbol}-${i}-${poolInfo.name}`}>
                  <CurrencyRow
                    tokenAmount={selectedAmounts[i]}
                    input={input[i]}
                    setInput={(val: string) => {
                      if (useEqualAmount) {
                        setInput(new Array(tokens.length).fill(val))
                      } else {
                        setInput([...input.slice(0, i), val, ...input.slice(i + 1)])
                      }
                    }}
                    // setUsingInsufficientFunds={setInsufficientFunds}
                  />
                  {i !== selectedAmounts.length - 1 && (
                    <TYPE.largeHeader style={{ marginTop: '1rem', width: '100%', textAlign: 'center' }}>
                      +
                    </TYPE.largeHeader>
                  )}
                </div>
              ))}
              <TYPE.mediumHeader style={{ textAlign: 'center' }}>
                Expected Lp Tokens Received: {expectedLPTokens.toFixed(decimalPlacesForLP)}
              </TYPE.mediumHeader>
              {!isFirstDeposit && (
                <TYPE.mediumHeader
                  style={{
                    textAlign: 'center',
                    color: JSBI.greaterThan(perDiff, JSBI.divide(weiScale, JSBI.BigInt(100))) ? 'red' : 'black',
                    fontSize: JSBI.greaterThan(perDiff, JSBI.divide(weiScale, JSBI.BigInt(100))) ? 30 : 20,
                    fontWeight: JSBI.greaterThan(perDiff, JSBI.divide(weiScale, JSBI.BigInt(100))) ? 800 : 500,
                  }}
                >
                  Equivalent to: {pegComesAfter ? '' : peggedTo}
                  {valueOfLP.toFixed(4)} {pegComesAfter ? poolInfo.peggedTo : ''}
                </TYPE.mediumHeader>
              )}
              {toApprove.length > 0 && expectedLPTokens.greaterThan('0') && (
                <div style={{ display: 'flex' }}>
                  {toApprove.map((i) => (
                    <ApprovalButton
                      key={`Approval-modal-${i}`}
                      disabled={approving}
                      onClick={async () => {
                        setApproving(true)
                        await approvals[i][1]()
                        await new Promise((resolve) => setTimeout(resolve, 20000))
                        setApproving(false)
                      }}
                    >
                      Approve {tokens[i].symbol}
                    </ApprovalButton>
                  ))}
                </div>
              )}
              {toApprove.length === 0 && (
                <ButtonError disabled={!!error} error={!!error && !!poolInfo?.stakedAmount} onClick={onDeposit}>
                  {error ?? 'Deposit'}
                </ButtonError>
              )}
            </>
          )}
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOndismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.body fontSize={20}>Depositing</TYPE.body>
            <TYPE.body fontSize={20}>Claiming {expectedLPTokens.toSignificant(4)} LP Tokens</TYPE.body>
          </AutoColumn>
        </LoadingView>
      )}
      {hash && (
        <SubmittedView onDismiss={wrappedOndismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
            <TYPE.body fontSize={20}>Claimed LP Tokens!</TYPE.body>
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
  setUsingInsufficientFunds: (isInsufficient: boolean) => void
}

const InputRowLeft = styled.div``

const TokenInfo = styled.div``

const InputRow = styled.div<{ selected: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap};
  align-items: center;
  justify-content: space-between;
  padding: ${({ selected }) => (selected ? '0.75rem 0.5rem 0.75rem 1rem' : '0.75rem 0.75rem 0.75rem 1rem')};
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

const InputPanel = styled.div<{ hideInput?: boolean }>`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  border-radius: ${({ hideInput }) => (hideInput ? '8px' : '20px')};
  background-color: ${({ theme }) => theme.bg1};
  z-index: 1;
  width: 100%;
`

const Container = styled.div<{ hideInput: boolean }>`
  border-radius: ${({ hideInput }) => (hideInput ? '8px' : '20px')};
  border: 1px solid ${({ theme }) => theme.bg2};
  background-color: ${({ theme }) => theme.bg1};
  padding: 0.5rem;
`

const StyledTokenName = styled.span<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.75rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
  font-size:  ${({ active }) => (active ? '20px' : '16px')};
  color: ${({ theme }) => theme.text1};
`
const BalanceText = styled(TYPE.subHeader)`
  cursor: pointer;
`

const CurrencyRow = ({ tokenAmount, setInput, input, setUsingInsufficientFunds }: CurrencyRowProps) => {
  const { address, connected } = useWeb3Context()
  const currency = tokenAmount.currency
  const tokenBalance = useCurrencyBalance(connected ? address : undefined, currency ?? undefined)
  const TEN = JSBI.BigInt('10')
  const ZERO_TOK = new TokenAmount(currency, JSBI.BigInt('0'))

  const scaledDown = (num: JSBI) => JSBI.divide(num, JSBI.exponentiate(TEN, JSBI.BigInt(currency.decimals)))
  const scaleUp = (num: JSBI) => JSBI.multiply(num, JSBI.exponentiate(TEN, JSBI.BigInt(currency.decimals)))

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
          <CurrencyLogo currency={currency} size={'34px'} />
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
          white={true}
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

const insertDecimal = (tokenAmount: TokenAmount) => {
  const { token } = tokenAmount
  const amount = tokenAmount.divide(
    new TokenAmount(token, JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt(token.decimals)))
  )
  return amount.toFixed(2)
}
