import { TransactionResponse } from '@ethersproject/providers'
import CurrencyLogo from 'components/CurrencyLogo'
import { useWarning } from 'hooks/useWarning'
import { calculateEstimatedMintAmount, calculateVirtualPrice } from 'lib/calculator'
import { Fraction, TokenAmount } from 'lib/token-utils'
import { Meta } from 'pages/Pool'
import React, { useMemo, useState } from 'react'
import { tryParseAmount } from 'state/swap/hooks'
import styled from 'styled-components'

import { useWeb3Context } from '../../hooks'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { useStableSwapContract } from '../../hooks/useContract'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { useTokenBalance } from '../../state/wallet/hooks'
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
  meta: Meta
}

export default function DepositModal({ isOpen, onDismiss, meta }: DepositModalProps) {
  const { connected } = useWeb3Context()
  const warning = useWarning(meta.display.warningType)
  // monitor call to help UI loading state
  const addTransaction = useTransactionAdder()
  const [hash, setHash] = useState<string | undefined>()
  const [attempting, setAttempting] = useState(false)
  const [approving, setApproving] = useState(false)
  const [input, setInput] = useState<string[]>(new Array(meta.display.pool.tokens.length).fill(''))
  const [warningAcknowledged, setWarningAcknowledged] = useState<boolean>(!warning)

  const isFirstDeposit = meta.exchangeInfo.lpTotalSupply.equalTo(0)
  const forceEqualDeposit = isFirstDeposit || warning?.modification === 'require-equal-deposit'
  const [useEqualAmount, setUseEqualAmount] = useState<boolean>(forceEqualDeposit)
  const deadline = useTransactionDeadline()

  const inputTokens = useMemo(() => {
    return input.map(
      (el, i) => tryParseAmount(el, meta.display.pool.tokens[i]) ?? new TokenAmount(meta.display.pool.tokens[i], 0)
    )
  }, [input, meta.display.pool.tokens])

  const sumAmount = inputTokens.reduce((acc, cur) => acc.add(cur), new Fraction(0))

  const expectedAmounts = calculateEstimatedMintAmount(meta.exchangeInfo, inputTokens[0].raw, inputTokens[1].raw)

  const virtualPrice = calculateVirtualPrice(meta.exchangeInfo)
  const adjustedExpectedAmount = expectedAmounts.mintAmount.multiply(virtualPrice ?? 1)
  // const valueOfLP = new TokenAmount(
  //   poolInfo.lpToken,
  //   JSBI.divide(
  //     JSBI.multiply(expectedLPTokens.raw, poolInfo.virtualPrice),
  //     JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('18'))
  //   )
  // )

  const diff = sumAmount.greaterThan(adjustedExpectedAmount)
    ? sumAmount.subtract(adjustedExpectedAmount)
    : adjustedExpectedAmount.subtract(sumAmount)

  const perDiff = sumAmount.equalTo(0) ? new Fraction(0) : diff.divide(sumAmount)

  const decimalPlacesForLP = expectedAmounts.mintAmount.greaterThan(1)
    ? 2
    : expectedAmounts.mintAmount.greaterThan(0)
    ? 10
    : 2

  const expectAmountWithSlippage = expectedAmounts.mintAmount.multiply(0.9)
  const approvals = [
    useApproveCallback(inputTokens[0], meta.display.pool.address),
    useApproveCallback(inputTokens[1], meta.display.pool.address),
  ]
  const toApprove = approvals
    .map(([approvalState]) => {
      if (approvalState !== ApprovalState.APPROVED) return true
      else return false
    })
    .filter((x) => x !== null)
  function wrappedOndismiss() {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }

  const stakingContract = useStableSwapContract(meta.display.pool.address)
  async function onDeposit() {
    if (stakingContract && deadline) {
      setAttempting(true)
      const tokenAmounts = inputTokens.map((el) => el.raw.toString())
      await stakingContract
        .addLiquidity(tokenAmounts, expectAmountWithSlippage.toString(), deadline, { gasLimit: 10000000 })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Deposit Liquidity into ${meta.display.name}`,
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
  // TODO: try this
  // if (!poolInfo?.stakedAmount) {
  //   error = error ?? 'Enter an amount'
  // }

  const display = (str: string): string => {
    const peg = meta.display.peg
    return (peg.position === 'before' ? peg.symbol : '').concat(str).concat(peg.position === 'after' ? peg.symbol : '')
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
                <TYPE.largeHeader>Deposit to {meta.display.name}</TYPE.largeHeader>
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
              {meta.display.pool.tokens.map((token, i) => (
                <div key={`deposit-row-${token.symbol}-${i}-${meta.display.name}`}>
                  <CurrencyRow
                    tokenAmount={inputTokens[i]}
                    input={input[i]}
                    setInput={(val: string) => {
                      if (useEqualAmount) {
                        setInput(new Array(meta.display.pool.tokens.length).fill(val))
                      } else {
                        setInput([...input.slice(0, i), val, ...input.slice(i + 1)])
                      }
                    }}
                    // setUsingInsufficientFunds={setInsufficientFunds}
                  />
                  {i !== inputTokens.length - 1 && (
                    <TYPE.largeHeader style={{ marginTop: '1rem', width: '100%', textAlign: 'center' }}>
                      +
                    </TYPE.largeHeader>
                  )}
                </div>
              ))}
              <TYPE.mediumHeader style={{ textAlign: 'center' }}>
                Expected Lp Tokens Received: {expectedAmounts.mintAmount.toFixed(decimalPlacesForLP)}
              </TYPE.mediumHeader>
              {!isFirstDeposit && (
                <TYPE.mediumHeader
                  style={{
                    textAlign: 'center',
                    color: perDiff.greaterThan(0.1) ? 'red' : 'black',
                    fontSize: perDiff.greaterThan(0.1) ? 30 : 20,
                    fontWeight: perDiff.greaterThan(0.1) ? 800 : 500,
                  }}
                >
                  Equivalent to: {display(adjustedExpectedAmount.toFixed(4))}
                </TYPE.mediumHeader>
              )}
              {toApprove.length > 0 && expectedAmounts.mintAmount.greaterThan('0') && (
                <div style={{ display: 'flex' }}>
                  {toApprove.map(
                    (el, i) =>
                      el && (
                        <ApprovalButton
                          key={`Approval-modal-${i}`}
                          disabled={approving}
                          onClick={async () => {
                            setApproving(true)
                            await approvals[i][1]()
                            // TODO: see if we can remove this time
                            await new Promise((resolve) => setTimeout(resolve, 20000))
                            setApproving(false)
                          }}
                        >
                          Approve {meta.display.pool.tokens[i].symbol}
                        </ApprovalButton>
                      )
                  )}
                </div>
              )}
              {toApprove.length === 0 && (
                <ButtonError disabled={!!error} error={!!error} onClick={onDeposit}>
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
            <TYPE.body fontSize={20}>Claiming {expectedAmounts.mintAmount.toSignificant(4)} LP Tokens</TYPE.body>
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
