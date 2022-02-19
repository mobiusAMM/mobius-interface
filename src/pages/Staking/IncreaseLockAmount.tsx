import 'react-date-range/dist/styles.css' // main style file
import 'react-date-range/dist/theme/default.css' // theme css file

import { JSBI, Token, TokenAmount } from '@ubeswap/sdk'
import CurrencyLogo from 'components/CurrencyLogo'
import Loader from 'components/Loader'
import { AutoRow, RowBetween } from 'components/Row'
import { useMobi } from 'hooks/Tokens'
import { useDoTransaction } from 'hooks/useDoTransaction'
import React, { useState } from 'react'
import { Text } from 'rebass'
import { StablePoolInfo } from 'state/stablePools/hooks'
import { useIsDarkMode } from 'state/user/hooks'
import { useCurrencyBalance } from 'state/wallet/hooks'
import styled from 'styled-components'

import { ButtonConfirmed, ButtonError } from '../../components/Button'
import Column from '../../components/Column'
import DoubleCurrencyLogo from '../../components/DoubleLogo'
import { Input as NumericalInput } from '../../components/NumericalInput'
import ProgressSteps from '../../components/ProgressSteps'
import { useWeb3Context } from '../../hooks'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { useVotingEscrowContract } from '../../hooks/useContract'
import { tryParseAmount } from '../../state/swap/hooks'
import { TYPE } from '../../theme'

const MILLISECONDS_PER_SECOND = 1000
const SECONDS_PER_WEEK = 604800
interface IncreaseLockAmountProps {
  setAttempting: (attempting: boolean) => void
  setHash: (hash: string | undefined) => void
}

export default function IncreaseLockAmount({ setHash, setAttempting }: IncreaseLockAmountProps) {
  const { address, connected } = useWeb3Context()

  // monitor call to help UI loading state
  const mobi = useMobi()
  const balance = useCurrencyBalance(connected ? address : undefined, mobi)
  const [approving, setApproving] = useState(false)
  const [input, setInput] = useState<string>('')
  const selectedAmount = tryParseAmount(input, mobi) || new TokenAmount(mobi, '0')
  const isDarkMode = useIsDarkMode()
  const doTransaction = useDoTransaction()

  const veMobiContract = useVotingEscrowContract()

  const [approval, approveCallback] = useApproveCallback(selectedAmount, veMobiContract.address)
  const showApproveFlow =
    approval === ApprovalState.NOT_APPROVED ||
    approval === ApprovalState.PENDING ||
    (approving && approval === ApprovalState.APPROVED)
  async function onLock() {
    if (veMobiContract && selectedAmount) {
      setAttempting(true)
      const resp = await doTransaction(veMobiContract, 'increase_amount', {
        args: [selectedAmount.raw.toString()],
        summary: `Increase lock by ${selectedAmount.toExact()} MOBI`,
      }).catch((error: any) => {
        setAttempting(false)
        throw error
      })
      setHash(resp.hash)
      setAttempting(false)
    }
  }

  let error: string | undefined
  if (!connected) {
    error = 'Connect Wallet'
  }

  if (!selectedAmount || selectedAmount.equalTo('0')) {
    error = error ?? 'Enter an Amount'
  }

  if (selectedAmount.greaterThan(balance || JSBI.BigInt('0'))) {
    error = error ?? 'Insufficient Funds'
  }

  return (
    <>
      <TYPE.mediumHeader marginBottom={0}>Select Additional Mobi</TYPE.mediumHeader>
      <CurrencyRow val={input} token={mobi} balance={balance} setTokenAmount={setInput} />
      <TYPE.subHeader marginTop={-20} color="red">
        You will be unable to withdraw this additional MOBI until your lock date is reached.
      </TYPE.subHeader>

      {showApproveFlow ? (
        <RowBetween>
          <ButtonConfirmed
            onClick={() => {
              approveCallback()
              setApproving(true)
            }}
            disabled={approval !== ApprovalState.NOT_APPROVED || approving}
            width="48%"
            altDisabledStyle={approval === ApprovalState.PENDING} // show solid button while waiting
            confirmed={approval === ApprovalState.APPROVED}
          >
            {approval === ApprovalState.PENDING ? (
              <AutoRow gap="6px" justify="center">
                Approving <Loader stroke="white" />
              </AutoRow>
            ) : approving && approval === ApprovalState.APPROVED ? (
              'Approved'
            ) : (
              'Approve Mobi'
            )}
          </ButtonConfirmed>
          <ButtonError
            onClick={onLock}
            width="48%"
            id="lock-button"
            disabled={!!error || approval !== ApprovalState.APPROVED}
            error={!!error}
          >
            <Text fontSize={16} fontWeight={500}>
              {error ? error : `Increase Lock`}
            </Text>
          </ButtonError>
        </RowBetween>
      ) : (
        <ButtonError onClick={onLock} id="lock-button" disabled={!!error} error={!!error}>
          <Text fontSize={20} fontWeight={500} color={!error && (isDarkMode ? 'black' : 'white')}>
            {error ? error : `Increase Lock`}
          </Text>
        </ButtonError>
      )}
      {showApproveFlow && (
        <Column style={{ marginTop: '1rem' }}>
          <ProgressSteps steps={[approval === ApprovalState.APPROVED]} />
        </Column>
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
  pool?: StablePoolInfo
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

export const CurrencyRow = ({ val, token, setTokenAmount, balance, readOnly, pool }: CurrencyRowProps) => {
  const currency = token
  const tokenBalance = balance
  const TEN = JSBI.BigInt('10')

  const mainRow = (
    <InputRow>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Aligner>
          {pool ? (
            <DoubleCurrencyLogo currency0={pool.tokens[0]} currency1={pool.tokens[1]} size={24} margin={true} />
          ) : (
            <CurrencyLogo currency={currency} size={'34px'} />
          )}
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
