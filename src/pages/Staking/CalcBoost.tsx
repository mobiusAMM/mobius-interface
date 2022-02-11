import { Fraction, JSBI, TokenAmount } from '@ubeswap/sdk'
import { AutoColumn } from 'components/Column'
import QuestionHelper from 'components/QuestionHelper'
import { RowBetween } from 'components/Row'
import { useMobi, useVeMobi } from 'hooks/Tokens'
import { useColor } from 'hooks/useColor'
import { darken } from 'polished'
import React, { useCallback, useState } from 'react'
import { tryParseAmount } from 'state/mento/hooks'
import { MobiStakingInfo, useMobiStakingInfo } from 'state/staking/hooks'
import { useCurrencyBalance } from 'state/wallet/hooks'
import styled from 'styled-components'
import { theme, TYPE } from 'theme'
import { calcEstimatedBoost, calcVotesForMaxBoost } from 'utils/calcExpectedVeMobi'

import { ReactComponent as DropDown } from '../../assets/images/dropdown.svg'
import DoubleCurrencyLogo from '../../components/DoubleLogo'
import CurrencySearchModal from '../../components/PoolSearchModal/CurrencySearchModal'
import { useWeb3Context } from '../../hooks'
import { StablePoolInfo, useStablePoolInfo } from '../../state/stablePools/hooks'
import { useIsDarkMode } from '../../state/user/hooks'
import ClaimAllMobiModal from './ClaimAllMobiModal'
import { CurrencyRow } from './IncreaseLockAmount'

const Container = styled.div`
  width: 49%;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background: ${({ theme }) => theme.bg1};
  border-radius: 1rem;
  margin-bottom: 1rem;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
    margin-top: 1rem;

`}
`

const Wrapper = styled(AutoColumn)<{ showBackground: boolean; bgColor: any; activated: boolean }>`
  border-radius: 12px;
  width: 100%;
  overflow: hidden;
  position: relative;
  margin-bottom: 1rem;
  padding: 0.5rem;
  gap: 0.5rem;
  cursor: pointer;
  opacity: ${({ activated }) => (activated ? 1 : 0.9)};
  overflow: hidden;
  position: relative;
  background: ${({ bgColor, theme }) =>
    `radial-gradient(91.85% 100% at 1.84% 0%, ${bgColor} 0%, ${theme.black} 100%) `};
  color: ${({ theme, showBackground }) => (showBackground ? theme.white : theme.text1)} !important;
  ${({ showBackground }) =>
    showBackground &&
    `  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);`}
  ${({ theme }) => theme.mediaWidth.upToSmall`
`}
  &:hover {
    opacity: 1;
  }
`
const Divider = styled.div<{ bg?: string }>`
  width: 100%;
  height: 1px;
  background: ${({ theme, bg }) => (bg ? bg : theme.primary1)};
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
`

const CurrencySelect = styled.button<{
  selected: boolean
  walletConnected: boolean
  bgColor: any
  isDarkMode: boolean
  pair: boolean
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2.2rem;
  font-size: 20px;
  font-weight: 500;
  ${({ selected, bgColor, isDarkMode }) => selected && `background-color: ${darken(isDarkMode ? 0.2 : -0.4, bgColor)};`}
  color: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
  border-radius: 12px;
  box-shadow: ${({ selected }) => (selected ? 'none' : '0px 6px 10px rgba(0, 0, 0, 0.075)')};
  outline: none;
  cursor: pointer;
  user-select: none;
  border: none;
  width: 25rem;
  height: 3rem;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0 0.5rem;
  `}

  :focus,
  :hover {
    background-color: ${({ selected, theme, bgColor, isDarkMode }) =>
      selected ? darken(isDarkMode ? 0.2 : -0.3, bgColor) : darken(0.05, theme.primary1)};
  }
`

const Aligner = styled.span`
  display: flex;
  align-items: center;
`

const StyledTokenName = styled.span<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.75rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
  font-size:  ${({ active }) => (active ? '20px' : '16px')};
  color: ${({ theme, active }) => (active ? theme.text1 : theme.white)};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 0.9rem;
  `}
`

const StyledDropDown = styled(DropDown)<{ selected: boolean }>`
  margin: 0 0.25rem 0 0.5rem;
  height: 35%;

  path {
    stroke: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
    stroke-width: 1.5px;
  }
`

type PositionsProps = {
  stakingInfo: MobiStakingInfo
  unclaimedMobi: TokenAmount
}
export default function CalcBoost({ stakingInfo }: PositionsProps) {
  const stablePools = useStablePoolInfo()
  const { address, connected } = useWeb3Context()
  const { positions = [] } = stakingInfo
  const loading = positions.length === 0
  const greaterThanZero = positions.filter(({ baseBalance }) => baseBalance.greaterThan('0'))
  const [openModal, setOpenModal] = useState(false)
  const mobi = useMobi()
  const vemobi = useVeMobi()
  const [lpInput, setLPInput] = useState<string>('')
  const [veInput, setVEInput] = useState<string>('')
  const [pool, setPool] = useState<StablePoolInfo | undefined>(stablePools[0] ?? undefined)
  const lpBalance = pool ? pool.amountDeposited : new TokenAmount(mobi, JSBI.BigInt(0))
  const veBalance = useCurrencyBalance(connected ? address : undefined, vemobi)
  const isDarkMode = useIsDarkMode()
  const color = useColor()
  const staking = useMobiStakingInfo()
  const [modalOpen, setModalOpen] = useState(false)
  const handleDismissSearch = useCallback(() => {
    setModalOpen(false)
  }, [setModalOpen])

  const onCurrencySelect = useCallback(
    (currency) => {
      setPool(stablePools.filter((x) => x.lpToken?.address === currency.address)[0])
    },
    [stablePools]
  )

  const stake =
    staking.positions && pool
      ? staking.positions.filter((s) => s.address.toLowerCase() === pool.gaugeAddress?.toLowerCase())[0]
      : undefined

  if (!vemobi) return null

  const veParse = tryParseAmount(veInput, vemobi)
  const lpParse = pool ? tryParseAmount(lpInput, pool.lpToken) : undefined
  const boost =
    !veParse || !lpParse
      ? new Fraction(JSBI.BigInt(0))
      : calcEstimatedBoost(stake, veParse.raw, staking.totalVotingPower.raw, lpParse.raw)

  const votes = !lpParse
    ? new TokenAmount(vemobi, JSBI.BigInt(0))
    : calcVotesForMaxBoost(stake, staking.totalVotingPower.raw, lpParse.raw, vemobi)
  return (
    <Container>
      <ClaimAllMobiModal isOpen={openModal} onDismiss={() => setOpenModal(false)} summaries={greaterThanZero} />
      <RowBetween style={{ flexWrap: 'wrap' }}>
        <TYPE.largeHeader>Calculate Boosts</TYPE.largeHeader>
        <QuestionHelper text={<>Calculate how much MOBI you need to stake</>} />
      </RowBetween>
      <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
        <CurrencySelect
          isDarkMode={isDarkMode}
          bgColor={color}
          selected={true}
          walletConnected={!connected}
          pair={false}
          className="open-currency-select-button"
          onClick={() => {
            setModalOpen(true)
          }}
          style={{ width: '100%' }}
        >
          <Aligner>
            {pool ? (
              <DoubleCurrencyLogo currency0={pool.tokens[0]} currency1={pool.tokens[1]} size={24} margin={true} />
            ) : null}
            {pool ? (
              <StyledTokenName active={!!pool} className="pair-name-container">
                {pool.name}
              </StyledTokenName>
            ) : (
              <TYPE.mediumHeader>Select a pool</TYPE.mediumHeader>
            )}
            <StyledDropDown selected={true} />
          </Aligner>
        </CurrencySelect>
        <CurrencySearchModal
          isOpen={modalOpen}
          onDismiss={handleDismissSearch}
          onCurrencySelect={onCurrencySelect}
          selectedCurrency={pool ? pool.lpToken : undefined}
        />
      </div>
      {!pool ? (
        <TYPE.mediumHeader>Select a Pool</TYPE.mediumHeader>
      ) : (
        <div>
          {/* <TYPE.mediumHeader marginBottom={-20}>Enter amount</TYPE.mediumHeader> */}
          <CurrencyRow val={lpInput} token={pool.lpToken} balance={lpBalance} setTokenAmount={setLPInput} pool={pool} />
          {/* <TYPE.mediumHeader marginBottom={-20}>Enter amount</TYPE.mediumHeader> */}
          <CurrencyRow val={veInput} token={vemobi} balance={veBalance} setTokenAmount={setVEInput} />
          <Divider />
          <Wrapper>
            <RowBetween>
              <TYPE.mediumHeader>Boost</TYPE.mediumHeader>
              <TYPE.mediumHeader color={theme().primary1}>{boost.toFixed(2)}x</TYPE.mediumHeader>
            </RowBetween>
            <RowBetween>
              <TYPE.mediumHeader>veMOBI to get max boost</TYPE.mediumHeader>
              <TYPE.mediumHeader color={theme().primary1}>{votes.toFixed(2)}</TYPE.mediumHeader>
            </RowBetween>
          </Wrapper>
        </div>
      )}
    </Container>
  )
}
