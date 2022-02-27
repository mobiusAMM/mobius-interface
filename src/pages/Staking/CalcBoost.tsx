import { JSBI, TokenAmount } from '@ubeswap/sdk'
import { AutoColumn } from 'components/Column'
import QuestionHelper from 'components/QuestionHelper'
import { RowBetween } from 'components/Row'
import { DisplayPool, StablePools } from 'constants/pools'
import { useVeMobi } from 'hooks/Tokens'
import { useColor } from 'hooks/useColor'
import useTheme from 'hooks/useTheme'
import { darken } from 'polished'
import React, { useCallback, useState } from 'react'
import { GaugeInfo, UserGaugeInfo } from 'state/gauges/hooks'
import { tryParseAmount } from 'state/mento/hooks'
import { StakingInfo, UserStakingInfo } from 'state/staking/hooks'
import styled from 'styled-components'
import { TYPE } from 'theme'

import { ReactComponent as DropDown } from '../../assets/images/dropdown.svg'
import DoubleCurrencyLogo from '../../components/DoubleLogo'
import CurrencySearchModal from '../../components/PoolSearchModal/CurrencySearchModal'
import { CHAIN } from '../../constants'
import { useWeb3Context } from '../../hooks'
import { useIsDarkMode } from '../../state/user/hooks'
import { CurrencyRow } from './Lock/IncreaseLockAmount'

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

const Wrapper = styled(AutoColumn)`
  border-radius: 12px;
  width: 100%;
  overflow: hidden;
  position: relative;
  margin-bottom: 1rem;
  padding: 0.5rem;
  gap: 0.5rem;
  cursor: pointer;
  opacity: 0.9;
  overflow: hidden;
  position: relative;
  color: theme.white !important;
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
  stakingInfo: StakingInfo
  userStakingInfo: UserStakingInfo
  gauges: (GaugeInfo | null)[]
  userGauges: (UserGaugeInfo | null)[]
}

export default function CalcBoost({ stakingInfo, userStakingInfo, gauges, userGauges }: PositionsProps) {
  const { connected } = useWeb3Context()

  const displays = StablePools[CHAIN]
  const openPositions = userGauges.filter((ug) => ug !== null && JSBI.greaterThan(ug.balance, JSBI.BigInt('0')))

  const vemobi = useVeMobi()
  const theme = useTheme()
  const color = useColor()
  const isDarkMode = useIsDarkMode()

  const [lpInput, setLPInput] = useState<string>('')
  const [veInput, setVEInput] = useState<string>('')
  const [pool, setPool] = useState<DisplayPool | undefined>(undefined)
  const index = pool ? displays.indexOf(pool) : null
  const gauge = index ? userGauges[index] : null

  const lpBalance = pool && gauge ? new TokenAmount(pool.pool.lpToken, gauge.balance) : null

  const [modalOpen, setModalOpen] = useState(false)
  const handleDismissSearch = useCallback(() => {
    setModalOpen(false)
  }, [setModalOpen])

  const onCurrencySelect = useCallback(
    (currency) => {
      setPool(displays.filter((x) => x.pool.lpToken?.address === currency.address)[0])
    },
    [displays]
  )

  const veParse = tryParseAmount(veInput, vemobi)
  const lpParse = pool ? tryParseAmount(lpInput, pool.pool.lpToken) : undefined

  // TODO: fix this math
  // const boost =
  //   !veParse || !lpParse
  //     ? new Fraction(JSBI.BigInt(0))
  //     : calcEstimatedBoost(stake, veParse.raw, staking.totalVotingPower.raw, lpParse.raw)

  // const votes = !lpParse
  //   ? new TokenAmount(vemobi, JSBI.BigInt(0))
  //   : calcVotesForMaxBoost(stake, staking.totalVotingPower.raw, lpParse.raw, vemobi)
  return (
    <Container>
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
              <DoubleCurrencyLogo
                currency0={pool.pool.tokens[0]}
                currency1={pool.pool.tokens[1]}
                size={24}
                margin={true}
              />
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
          selectedCurrency={pool?.pool.lpToken}
        />
      </div>
      {pool && (
        <div>
          {/* <TYPE.mediumHeader marginBottom={-20}>Enter amount</TYPE.mediumHeader> */}
          <CurrencyRow
            val={lpInput}
            balance={lpBalance ?? undefined}
            token={pool.pool.lpToken}
            setTokenAmount={setLPInput}
            pool={pool}
          />
          {/* <TYPE.mediumHeader marginBottom={-20}>Enter amount</TYPE.mediumHeader> */}
          <CurrencyRow val={veInput} token={vemobi} balance={userStakingInfo.votingPower} setTokenAmount={setVEInput} />
          <Divider />
          <Wrapper>
            <RowBetween>
              <TYPE.mediumHeader>Boost</TYPE.mediumHeader>
              <TYPE.mediumHeader color={theme.primary1}>4.9x</TYPE.mediumHeader>
            </RowBetween>
            <RowBetween>
              <TYPE.mediumHeader>veMOBI to get max boost</TYPE.mediumHeader>
              <TYPE.mediumHeader color={theme.primary1}>67,780.98</TYPE.mediumHeader>
            </RowBetween>
          </Wrapper>
        </div>
      )}
    </Container>
  )
}
