import { TransactionResponse } from '@ethersproject/providers'
import { JSBI, TokenAmount } from '@ubeswap/sdk'
import CurrencyLogo from 'components/CurrencyLogo'
import React, { useState } from 'react'
import styled from 'styled-components'

import { useWeb3Context } from '../../hooks'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { useStableSwapContract } from '../../hooks/useContract'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import { StablePoolInfo, useExpectedLpTokens } from '../../state/stablePools/hooks'
import { tryParseAmount } from '../../state/swap/hooks'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { useCurrencyBalance, useTokenBalance } from '../../state/wallet/hooks'
import { TYPE } from '../../theme'
import { ButtonError, ButtonPrimary } from '../Button'
import { AutoColumn } from '../Column'
import { Input as NumericalInput } from '../NumericalInput'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

interface WithdrawModalProps {
  setAttempting: (attempting: boolean) => void
  setHash: (hash: string | undefined) => void
  poolInfo: StablePoolInfo
}

export default function WithdrawTokens({ poolInfo, setHash, setAttempting }: WithdrawModalProps) {
  const { address, connected } = useWeb3Context()

  // monitor call to help UI loading state
  const addTransaction = useTransactionAdder()
  const { tokens, lpToken } = poolInfo
  const [approving, setApproving] = useState(false)
  const lpBalance = useTokenBalance(connected ? address : undefined, lpToken)

  const [selectedAmounts, setSelectedAmounts] = useState<TokenAmount[]>(
    tokens.map((t) => new TokenAmount(t, JSBI.BigInt('0')))
  )
  const deadline = useTransactionDeadline()

  const expectedLPTokens = useExpectedLpTokens(poolInfo, selectedAmounts, false)
  const withSlippage = JSBI.add(expectedLPTokens.raw, JSBI.divide(expectedLPTokens.raw, JSBI.BigInt('10')))
  const [approvalStatus, tryApprove] = useApproveCallback(expectedLPTokens, poolInfo.poolAddress)

  const stakingContract = useStableSwapContract(poolInfo.poolAddress)
  async function onDeposit() {
    if (stakingContract && poolInfo?.stakedAmount) {
      setAttempting(true)
      const amounts = selectedAmounts.map((amount) => BigInt(amount.raw.toString()))
      await stakingContract
        .removeLiquidityImbalance(amounts, withSlippage.toString(), deadline)
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Remove ${selectedAmounts
              .map((amount) => `${amount.toFixed(2)} ${amount.currency.symbol}`)
              .join(', ')} from ${poolInfo.name}`,
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

  if (expectedLPTokens.greaterThan(lpBalance || JSBI.BigInt('0'))) {
    error = error ?? 'Insufficient Funds'
  }

  return (
    <>
      {poolInfo.tokens.map((token, i) => (
        <div key={`deposit-row-${token.symbol}-${i}-${poolInfo.name}`}>
          <CurrencyRow
            tokenAmount={selectedAmounts[i]}
            setTokenAmount={(val: TokenAmount) =>
              setSelectedAmounts([
                ...selectedAmounts.slice(0, i),
                val,
                ...selectedAmounts.slice(i + 1, selectedAmounts.length),
              ])
            }
          />
          {i !== selectedAmounts.length - 1 && (
            <TYPE.largeHeader style={{ marginTop: '1rem', width: '100%', textAlign: 'center' }}>+</TYPE.largeHeader>
          )}
        </div>
      ))}
      <TYPE.mediumHeader style={{ textAlign: 'center' }}>
        Expected Lp Tokens Required: {expectedLPTokens.toFixed(2)}
      </TYPE.mediumHeader>
      {expectedLPTokens.greaterThan(JSBI.BigInt('0')) && approvalStatus !== ApprovalState.APPROVED && (
        <div style={{ display: 'flex' }}>
          <ButtonPrimary
            disabled={approving}
            onClick={async () => {
              setApproving(true)
              await tryApprove()
              await new Promise((resolve) => setTimeout(resolve, 20000))
              setApproving(false)
            }}
          >
            Approve LP Tokens
          </ButtonPrimary>
        </div>
      )}
      {approvalStatus === ApprovalState.APPROVED && (
        <ButtonError disabled={!!error} error={!!error && !!poolInfo?.stakedAmount} onClick={onDeposit}>
          {error ?? 'Withdraw'}
        </ButtonError>
      )}
    </>
  )
}

type CurrencyRowProps = {
  tokenAmount: TokenAmount
  setTokenAmount: (tokenAmount: TokenAmount) => void
  readOnly: boolean | undefined
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

const CurrencyRow = ({ tokenAmount, setTokenAmount, readOnly }: CurrencyRowProps) => {
  const { address, connected } = useWeb3Context()
  const currency = tokenAmount.currency
  const tokenBalance = useCurrencyBalance(connected ? address : undefined, currency ?? undefined)
  const TEN = JSBI.BigInt('10')
  const ZERO_TOK = new TokenAmount(currency, JSBI.BigInt('0'))

  const scaledDown = (num: JSBI) => JSBI.divide(num, JSBI.exponentiate(TEN, JSBI.BigInt(currency.decimals)))
  const scaleUp = (num: JSBI) => JSBI.multiply(num, JSBI.exponentiate(TEN, JSBI.BigInt(currency.decimals)))

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
          value={scaledDown(tokenAmount.raw)}
          onUserInput={(val) => {
            const amount = tryParseAmount(val, currency)
            setTokenAmount(amount || ZERO_TOK)
          }}
        />
      </InputDiv>
    </InputRow>
  )
  const balanceRow = !readOnly && (
    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
      <BalanceText onClick={() => setTokenAmount(tokenBalance || ZERO_TOK)}>
        Balance: {tokenBalance?.toFixed(2)}
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
