import { TransactionResponse } from '@ethersproject/providers'
import CurrencyLogo from 'components/CurrencyLogo'
import JSBI from 'jsbi'
import { calculateEstimatedWithdrawAmount } from 'lib/calculator'
import { Token, TokenAmount } from 'lib/token-utils'
import { Meta } from 'pages/Pool'
import React, { useState } from 'react'
import styled from 'styled-components'

import { useWeb3Context } from '../../hooks'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { useStableSwapContract } from '../../hooks/useContract'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import { tryParseAmount } from '../../state/swap/hooks'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { TYPE } from '../../theme'
import { ButtonError, ButtonPrimary } from '../Button'
import { Input as NumericalInput } from '../NumericalInput'

interface WithdrawModalProps {
  setAttempting: (attempting: boolean) => void
  setHash: (hash: string | undefined) => void
  meta: Meta
}

export default function WithdrawLP({ meta, setHash, setAttempting }: WithdrawModalProps) {
  const { connected } = useWeb3Context()

  const addTransaction = useTransactionAdder()
  const [approving, setApproving] = useState(false)
  const [input, setInput] = useState<string>('')
  const selectedAmount =
    tryParseAmount(input, meta.display.pool.lpToken) || new TokenAmount(meta.display.pool.lpToken, 0)

  const deadline = useTransactionDeadline()

  const expectedAmount = calculateEstimatedWithdrawAmount({ poolTokenAmount: selectedAmount, ...meta.exchangeInfo })
  const [approvalStatus, approvalCallback] = useApproveCallback(selectedAmount, meta.display.pool.address)
  const stakingContract = useStableSwapContract(meta.display.pool.address)

  async function onWithdraw() {
    if (stakingContract && deadline) {
      setAttempting(true)
      const expected = expectedAmount.withdrawAmounts.map((amount) => amount.raw.toString())
      await stakingContract
        .removeLiquidity(selectedAmount.raw.toString(), expected, deadline)
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Withdraw Liquidity from ${meta.display.name}`,
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

  if (selectedAmount.greaterThan(meta.lpBalance)) {
    error = error ?? 'Insufficient Funds'
  }

  const decimalPlacesForBalance = meta.lpBalance?.greaterThan('1') ? 2 : meta.lpBalance?.greaterThan('0') ? 10 : 2

  return (
    <>
      {meta.userGauge && JSBI.greaterThan(meta.userGauge.balance, JSBI.BigInt(0)) && (
        <TYPE.mediumHeader>
          {new TokenAmount(meta.display.pool.lpToken, meta.userGauge.balance).toFixed(decimalPlacesForBalance)} MobLP
          currently deposited in the farm
        </TYPE.mediumHeader>
      )}
      <CurrencyRow
        val={input}
        token={meta.display.pool.lpToken}
        balance={meta.lpBalance}
        setTokenAmount={setInput}
        readOnly={false}
      />
      {selectedAmount.greaterThan(JSBI.BigInt('0')) && (
        <div>
          <TYPE.mediumHeader style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
            You will receive
          </TYPE.mediumHeader>
          {expectedAmount.withdrawAmounts.map((tokenAmount, i) => (
            <>
              <CurrencyRow
                key={'expected-' + tokenAmount.token.address}
                token={tokenAmount.token}
                val={tokenAmount.toExact()}
                setTokenAmount={() => null}
                readOnly={true}
                balance={meta.lpBalance}
              />
              {i !== expectedAmount.withdrawAmounts.length - 1 && (
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
        <ButtonError disabled={!!error} error={!!error} onClick={onWithdraw}>
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

const CurrencyRow = ({ val, token, setTokenAmount, balance, readOnly }: CurrencyRowProps) => {
  const currency = token
  const tokenBalance = balance

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
