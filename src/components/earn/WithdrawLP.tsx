import { TransactionResponse } from '@ethersproject/providers'
import { JSBI, Token, TokenAmount } from '@ubeswap/sdk'
import CurrencyLogo from 'components/CurrencyLogo'
import React, { useState } from 'react'
import styled from 'styled-components'

import { useWeb3Context } from '../../hooks'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { useStableSwapContract } from '../../hooks/useContract'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import { StablePoolInfo, useExpectedTokens } from '../../state/stablePools/hooks'
import { tryParseAmount } from '../../state/swap/hooks'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { TYPE } from '../../theme'
import { ButtonError, ButtonPrimary } from '../Button'
import { Input as NumericalInput } from '../NumericalInput'

interface WithdrawModalProps {
  setAttempting: (attempting: boolean) => void
  setHash: (hash: string | undefined) => void
  poolInfo: StablePoolInfo
}

export default function WithdrawLP({ poolInfo, setHash, setAttempting }: WithdrawModalProps) {
  const { connected } = useWeb3Context()

  // monitor call to help UI loading state
  const addTransaction = useTransactionAdder()
  const { tokens, lpToken } = poolInfo
  const lpBalance = poolInfo.amountDeposited?.subtract(poolInfo.stakedAmount)
  const [approving, setApproving] = useState(false)
  const [input, setInput] = useState<string>('')
  const selectedAmount = tryParseAmount(input, lpToken) || new TokenAmount(lpToken, '0')
  // const [selectedAmount, setSelectedAmount] = useState<TokenAmount>(new TokenAmount(lpToken, JSBI.BigInt('0')))

  const deadline = useTransactionDeadline()

  const expectedTokens = useExpectedTokens(poolInfo, selectedAmount)
  const [approvalStatus, approvalCallback] = useApproveCallback(selectedAmount, poolInfo.poolAddress)
  const stakingContract = useStableSwapContract(poolInfo.poolAddress)
  async function onWithdraw() {
    if (stakingContract && poolInfo?.stakedAmount) {
      setAttempting(true)
      const expected = expectedTokens.map((amount) => BigInt(amount.raw.toString()))
      await stakingContract
        .removeLiquidity(selectedAmount.raw.toString(), expected, deadline)
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Withdraw Liquidity from ${poolInfo.name}`,
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

  if (selectedAmount.greaterThan(lpBalance || JSBI.BigInt('0'))) {
    error = error ?? 'Insufficient Funds'
  }

  const decimalPlacesForBalance = lpBalance?.greaterThan('1') ? 2 : lpBalance?.greaterThan('0') ? 10 : 2

  return (
    <>
      {poolInfo.stakedAmount.greaterThan(JSBI.BigInt(0)) && (
        <TYPE.mediumHeader>
          {poolInfo.stakedAmount.toFixed(decimalPlacesForBalance)} MobLP currently deposited in the farm
        </TYPE.mediumHeader>
      )}
      <CurrencyRow val={input} token={lpToken} balance={lpBalance} setTokenAmount={setInput} />
      {selectedAmount.greaterThan(JSBI.BigInt('0')) && (
        <div>
          <TYPE.mediumHeader style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
            You will receive
          </TYPE.mediumHeader>
          {expectedTokens.map((tokenAmount, i) => (
            <>
              <CurrencyRow
                key={'expected-' + tokenAmount.token.address}
                token={tokenAmount.currency}
                val={tokenAmount.toExact()}
                setTokenAmount={(val: string) => null}
                readOnly={true}
                balance={lpBalance}
              />
              {i !== expectedTokens.length - 1 && (
                <TYPE.largeHeader style={{ marginTop: '1rem', width: '100%', textAlign: 'center' }}>+</TYPE.largeHeader>
              )}
            </>
          ))}
        </div>
      )}
      {approvalStatus !== ApprovalState.APPROVED && selectedAmount.greaterThan(JSBI.BigInt('0')) && (
        <ButtonPrimary
          disabled={approving}
          onClick={async () => {
            setApproving(true)
            await approvalCallback()
            await new Promise((resolve) => setTimeout(resolve, 20000))
            setApproving(false)
          }}
        >
          Approve LP Token
        </ButtonPrimary>
      )}
      {approvalStatus === ApprovalState.APPROVED && (
        <ButtonError disabled={!!error} error={!!error && !!poolInfo?.stakedAmount} onClick={onWithdraw}>
          {error ?? 'Withdraw'}
        </ButtonError>
      )}
    </>
  )
}

type CurrencyRowProps = {
  val: string
  token: Token
  setTokenAmount: (tokenAmount: string) => void
  readOnly: boolean | undefined
  balance?: TokenAmount
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
  background-color: ${({ theme }) => theme.bg2};
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

const CurrencyRow = ({ val, token, setTokenAmount, balance, readOnly }: CurrencyRowProps) => {
  const currency = token
  const tokenBalance = balance
  const TEN = JSBI.BigInt('10')

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
          disabled={readOnly}
          value={val}
          onUserInput={(val) => {
            setTokenAmount(val)
          }}
        />
      </InputDiv>
    </InputRow>
  )
  const decimalPlacesForBalance = tokenBalance?.greaterThan('1') ? 2 : tokenBalance?.greaterThan('0') ? 10 : 2

  const balanceRow = !readOnly && (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <BalanceText onClick={() => setTokenAmount(tokenBalance?.toExact() || '0')}>
        Balance: {tokenBalance?.toFixed(decimalPlacesForBalance)}
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
