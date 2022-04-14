import 'react-date-range/dist/styles.css' // main style file
import 'react-date-range/dist/theme/default.css' // theme css file

import CurrencyLogo from 'components/CurrencyLogo'
import Loader from 'components/Loader'
import { AutoRow, RowBetween } from 'components/Row'
import { StablePools } from 'constants/pools'
import { useMobi } from 'hooks/Tokens'
import { useDoTransaction } from 'hooks/useDoTransaction'
import JSBI from 'jsbi'
import { Token, TokenAmount } from 'lib/token-utils'
import React, { useState } from 'react'
import { Calendar } from 'react-date-range'
import { Text } from 'rebass'
import { GaugeInfo, UserGaugeInfo } from 'state/gauges/hooks'
import { StakingInfo } from 'state/staking/hooks'
import { useTokenBalance } from 'state/wallet/hooks'
import styled from 'styled-components'
import invariant from 'tiny-invariant'
import { calcBoost, calcExpectedVeMobi } from 'utils/calcExpectedVeMobi'

import { ButtonConfirmed, ButtonError } from '../../../components/Button'
import Column from '../../../components/Column'
import { Input as NumericalInput } from '../../../components/NumericalInput'
import ProgressSteps from '../../../components/ProgressSteps'
import { CHAIN } from '../../../constants'
import { useWeb3Context } from '../../../hooks'
import { ApprovalState, useApproveCallback } from '../../../hooks/useApproveCallback'
import { useVotingEscrowContract } from '../../../hooks/useContract'
import { tryParseAmount } from '../../../state/swap/hooks'
import { TYPE } from '../../../theme'

const MILLISECONDS_PER_SECOND = 1000
const SECONDS_PER_WEEK = 604800

export const roundDate = (date: number) =>
  new Date(
    Math.floor(date / (MILLISECONDS_PER_SECOND * SECONDS_PER_WEEK)) * (MILLISECONDS_PER_SECOND * SECONDS_PER_WEEK)
  )
interface LockProps {
  setAttempting: (attempting: boolean) => void
  setHash: (hash: string | undefined) => void
  userGauges: (UserGaugeInfo | null)[]
  gauges: (GaugeInfo | null)[]
  stakingInfo: StakingInfo
}

export default function Lock({ setHash, setAttempting, userGauges, gauges, stakingInfo }: LockProps) {
  const { connected, address } = useWeb3Context()

  // monitor call to help UI loading state
  const mobi = useMobi()
  const balance = useTokenBalance(connected ? address : undefined, mobi)

  const [approving, setApproving] = useState(false)
  const [input, setInput] = useState<string>('')
  const [showBoosts, setShowBoosts] = useState(false)

  const selectedAmount = tryParseAmount(input, mobi) || new TokenAmount(mobi, '0')
  const [date, setDate] = useState<Date>()
  const roundedDate = date ? roundDate(date.getSeconds()) : undefined
  const doTransaction = useDoTransaction()

  const veMobiContract = useVotingEscrowContract()
  const expectedVeMobi = calcExpectedVeMobi(
    selectedAmount,
    roundedDate ? roundedDate.getTime() - roundDate(Date.now()).getTime() : 0
  )

  invariant(veMobiContract, 'veMobi contract')

  const [approval, approveCallback] = useApproveCallback(selectedAmount, veMobiContract.address)
  const showApproveFlow =
    approval === ApprovalState.NOT_APPROVED ||
    approval === ApprovalState.PENDING ||
    (approving && approval === ApprovalState.APPROVED)
  async function onLock() {
    if (veMobiContract && date && selectedAmount) {
      setAttempting(true)
      const dateAsUnix = date.valueOf() / MILLISECONDS_PER_SECOND
      const resp = await doTransaction(veMobiContract, 'create_lock', {
        args: [selectedAmount.raw.toString(), dateAsUnix.toFixed()],
        summary: `Lock ${selectedAmount.toExact()} MOBI until ${date?.toLocaleDateString()}`,
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

  if (!roundedDate || roundedDate.getTime() < Date.now()) {
    error = error ?? 'Choose a Date in the Future'
  }

  return (
    <>
      <CurrencyRow val={input} token={mobi} balance={balance} setTokenAmount={setInput} />
      <TYPE.mediumHeader marginBottom={0}>Set Lock Date</TYPE.mediumHeader>
      <TYPE.subHeader marginTop={-20} color="red">
        You will be unable to withdraw your locked MOBI until this date. This date will be rounded down to the nearest
        Thursday 00:00:00 GTM 0
      </TYPE.subHeader>
      <Calendar date={roundedDate} onChange={setDate} />
      <RowBetween>
        <TYPE.body>Expected veMobi</TYPE.body>
        <TYPE.body>{expectedVeMobi.toFixed(2)}</TYPE.body>
      </RowBetween>
      {!showBoosts ? (
        <AutoRow onClick={() => setShowBoosts(true)} style={{ cursor: 'pointer' }}>
          <TYPE.body>Show Boosts</TYPE.body>
        </AutoRow>
      ) : (
        userGauges.map((ug, i) => {
          if (ug === null || JSBI.equal(ug.balance, JSBI.BigInt(0))) return null
          const boost = calcBoost(
            ug?.balance,
            gauges[i]?.totalSupply ?? JSBI.BigInt(0),
            expectedVeMobi.raw,
            JSBI.add(expectedVeMobi.raw, stakingInfo.totalVotingPower.raw)
          )
          const poolName = StablePools[CHAIN][i].name
          return (
            <RowBetween key={`boost-info-${poolName}`}>
              <TYPE.body>{poolName}</TYPE.body>
              <TYPE.body>{boost.toFixed(2)}x</TYPE.body>
            </RowBetween>
          )
        })
      )}
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
              {error ? error : `Lock until ${roundedDate?.toLocaleDateString()}`}
            </Text>
          </ButtonError>
        </RowBetween>
      ) : (
        <ButtonError onClick={onLock} id="lock-button" disabled={!!error} error={!!error}>
          <Text fontSize={20} fontWeight={500}>
            {error ? error : `Lock until ${roundedDate?.toLocaleDateString()}`}
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
  balance?: TokenAmount
}

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

const StyledTokenName = styled.span<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.75rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
  font-size:  ${({ active }) => (active ? '20px' : '16px')};
  color: ${({ theme }) => theme.text1};
`
const BalanceText = styled(TYPE.subHeader)`
  cursor: pointer;
`

const CurrencyRow = ({ val, token, setTokenAmount, balance }: CurrencyRowProps) => {
  const currency = token
  const tokenBalance = balance

  const mainRow = (
    <InputRow selected={false}>
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
          value={val}
          onUserInput={(val) => {
            setTokenAmount(val)
          }}
        />
      </InputDiv>
    </InputRow>
  )
  const decimalPlacesForBalance = tokenBalance?.greaterThan('1') ? 2 : tokenBalance?.greaterThan('0') ? 10 : 2

  const balanceRow = (
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
