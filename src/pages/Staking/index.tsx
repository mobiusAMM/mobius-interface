import React from 'react'
import { isMobile } from 'react-device-detect'
import { useStakingInfo, useUserStakingInfo } from 'state/staking/hooks'
import styled from 'styled-components'

import { Row } from '../../components/Row'
import CalcBoost from './CalcBoost'
import GaugeWeights from './GaugeWeights'
import Positions from './Positions'
import Stake from './Stake'
import StatsHeader from './StatsHeader'
import VeMobiRewards from './VeMobiRewards'
import Vote from './Vote'

const PositionsContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
  `}
  flex-wrap: wrap;
`

const OuterContainer = styled.div`
  width: min(1280px, 100%);
  margin-top: ${!isMobile ? '3rem' : '-1rem'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`

const HeaderLinks = styled(Row)`
  justify-self: center;
  background-color: ${({ theme }) => theme.bg1};
  width: fit-content;
  padding: 4px;
  border-radius: 16px;
  display: grid;
  grid-auto-flow: column;
  grid-gap: 10px;
  align-items: center;
  margin-right: auto;
  margin-left: auto;
`

const Sel = styled.div<{ selected: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  border-radius: ${({ selected }) => (selected ? '12px' : '3rem')};
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme, selected }) => (selected ? theme.white : theme.text1)};
  font-size: 1rem;
  font-weight: ${({ selected }) => (selected ? '999' : '300')};
  padding: 8px 12px;
  word-break: break-word;
  overflow: hidden;
  white-space: nowrap;
  background-color: ${({ theme, selected }) => (selected ? theme.celoGreen : theme.bg1)};
`

enum View {
  Lock = 1,
  Vote = 2,
  Analyze = 3,
  Rewards = 4,
}

export default function Staking() {
  // const unclaimedMobi = new TokenAmount(mobi, getAllUnclaimedMobi(stakingInfo.positions ?? []))
  const stakingInfo = useStakingInfo()
  const userStakingInfo = useUserStakingInfo()

  const [view, setView] = React.useState<View>(View.Lock)

  return (
    <OuterContainer>
      <StatsHeader stakingInfo={stakingInfo} userStakingInfo={userStakingInfo} />
      <div style={{ alignItems: 'center', marginBottom: '1rem', marginTop: '1rem', display: 'flex', width: '100%' }}>
        <HeaderLinks>
          <Sel onClick={() => setView(View.Lock)} selected={view === View.Lock}>
            Lock
          </Sel>
          <Sel onClick={() => setView(View.Vote)} selected={view === View.Vote}>
            Vote
          </Sel>
          <Sel onClick={() => setView(View.Analyze)} selected={view === View.Analyze}>
            Analyze
          </Sel>
          <Sel onClick={() => setView(View.Rewards)} selected={view === View.Rewards}>
            Rewards
          </Sel>
        </HeaderLinks>
      </div>
      {view === View.Lock ? (
        <PositionsContainer>
          <Stake userStakingInfo={userStakingInfo} />
          <CalcBoost stakingInfo={stakingInfo} unclaimedMobi={unclaimedMobi} />
          <Positions stakingInfo={stakingInfo} unclaimedMobi={unclaimedMobi} />
        </PositionsContainer>
      ) : view === View.Vote ? (
        <PositionsContainer>
          <Vote summaries={stakingInfo.positions ?? []} lockDate={stakingInfo.lockEnd ?? new Date()} />
        </PositionsContainer>
      ) : view === View.Analyze ? (
        <PositionsContainer>
          <GaugeWeights summaries={stakingInfo.positions ?? []} />
        </PositionsContainer>
      ) : (
        <PositionsContainer>
          <VeMobiRewards />
        </PositionsContainer>
      )}
    </OuterContainer>
  )
}
