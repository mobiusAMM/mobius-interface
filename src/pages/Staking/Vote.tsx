import { AutoColumn } from 'components/Column'
import { RowFixed } from 'components/Row'
import { ChainLogo, DisplayPool, StablePools } from 'constants/pools'
import { usePoolColor } from 'hooks/useColor'
import { useVotePowerLeft } from 'hooks/useStaking'
import React, { useState } from 'react'
import { isMobile } from 'react-device-detect'
import { GaugeInfo, UserGaugeInfo } from 'state/gauges/hooks'
import { UserStakingInfo } from 'state/staking/hooks'
import styled from 'styled-components'
import { TYPE } from 'theme'
import invariant from 'tiny-invariant'

import CurrencyPoolLogo from '../../components/CurrencyPoolLogo'
import Logo from '../../components/Logo'
import { CHAIN } from '../../constants'
import GaugeVoteModal from './GaugeVoteModal'

const Wrapper = styled(AutoColumn)`
  border-radius: 12px;
  gap: 1rem;
  width: 100%;
  overflow: hidden;
  position: relative;
  padding: 1rem;
  padding-left: 0rem;
  padding-right: 0rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: ${({ theme }) => theme.text1} !important;
  ${({ theme }) => theme.mediaWidth.upToSmall`
`}
`

const CardContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  column-gap: 10px;
  row-gap: 15px;
  justify-self: center;
  width: 100%;
  max-width: 720px;
`

const TopSection = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  padding-bottom: 0.25rem;
  padding-top: 0;
  z-index: 1;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: 48px 1fr 96px;
  `};
`

interface VoteProps {
  gauges: (GaugeInfo | null)[]
  userGauges: (UserGaugeInfo | null)[]
  userStaking: UserStakingInfo
}

export default function Vote({ gauges, userGauges, userStaking }: VoteProps) {
  const votePowerLeft = useVotePowerLeft()
  const tooLateToVote = userStaking.lock.end.valueOf() - Date.now() <= 7 * 24 * 60 * 60 * 1000

  return (
    <Wrapper>
      <TYPE.darkGray>Allocate your voting power to affect the MOBI distribution of each pool.</TYPE.darkGray>
      <TYPE.darkGray>{votePowerLeft}% Left to Allocate</TYPE.darkGray>
      {tooLateToVote && (
        <TYPE.red>
          Your lock period must be greater than a week in order to vote. Extend your lock date to vote.
        </TYPE.red>
      )}
      <CardContainer>
        {gauges.map((g, i) => {
          if (g === null) return null
          const userGauge = userGauges[i]
          invariant(userGauge, 'user gauge')
          return (
            <WeightCard
              gauge={g}
              userGauge={userGauge}
              displayPool={StablePools[CHAIN][i]}
              key={`weight-card-${StablePools[CHAIN][i].name}`}
              disabled={tooLateToVote}
            />
          )
        })}
      </CardContainer>
    </Wrapper>
  )
}

const PositionWrapper = styled(AutoColumn)<{ disabled: boolean }>`
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  padding-left: 0.25rem;
  padding-right: 0.25rem;
  border-radius: 20px;
  width: 100%;
  opacity: 0.85;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  padding: 1rem;
  &:hover {
    opacity: 1;
  }
  ${({ disabled }) =>
    disabled &&
    `
  cursor: not-allowed;
  opacity: 0.7;
  `}
  background: ${({ theme }) => theme.bg1};
  color: ${({ theme }) => theme.text1} !important;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  padding-left: 0.25rem;
  padding-right: 0.25rem;
  padding-top: 1rem;
  margin-top: 1rem;
`}
`

const StyledLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  background-color: ${({ theme }) => theme.white};
`

const SecondSection = styled.div<{ mobile: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  padding-bottom: 0.25rem;
  padding-top: 0;
  z-index: 1;
  width: 100%;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: 48px 1fr 96px;
  `};
`

function WeightCard({
  userGauge,
  gauge,
  displayPool,
  disabled,
}: {
  userGauge: UserGaugeInfo
  gauge: GaugeInfo
  displayPool: DisplayPool
  disabled: boolean
}) {
  const [voteModalOpen, setVoteModalOpen] = useState(false)

  const poolColor = usePoolColor(displayPool)

  return displayPool.gauge === null ? null : (
    <>
      <GaugeVoteModal
        userGauge={userGauge}
        poolName={displayPool.name}
        gauge={displayPool.gauge}
        isOpen={voteModalOpen}
        onDismiss={() => setVoteModalOpen(false)}
      />

      <PositionWrapper disabled={disabled} onClick={() => !disabled && setVoteModalOpen(true)}>
        <TopSection>
          <RowFixed style={{ gap: '6px' }}>
            <TYPE.black fontWeight={600} fontSize={[16, 24]}>
              {displayPool.name}
            </TYPE.black>
            <StyledLogo size={'26px'} srcs={[ChainLogo[displayPool.chain]]} alt={'logo'} />
          </RowFixed>
          <RowFixed>
            <TYPE.subHeader color={poolColor} className="apr" fontWeight={800} fontSize={[16, 24]} textAlign="right">
              {`Future: ${gauge.futureWeight.toFixed(2)}%`}
            </TYPE.subHeader>
          </RowFixed>
        </TopSection>
        <SecondSection mobile={isMobile}>
          <RowFixed style={{ marginTop: 10 }}>
            <CurrencyPoolLogo tokens={displayPool.pool.tokens.slice()} size={24} margin={true} />
            <TYPE.darkGray fontWeight={450} fontSize={[15, 20]}>
              {displayPool.pool.tokens.map((t) => t.symbol).join(' / ')}
            </TYPE.darkGray>
          </RowFixed>
          <div>
            <TYPE.black
              textAlign="right"
              fontSize={[13, 16]}
              fontWeight={800}
              color={poolColor}
            >{`Current: ${gauge.weight.toFixed(2)}%`}</TYPE.black>
            <TYPE.black
              textAlign="right"
              fontSize={[13, 16]}
              fontWeight={800}
              color={poolColor}
            >{`My Vote: ${userGauge.powerAllocated.toFixed(2)}%`}</TYPE.black>
          </div>
        </SecondSection>
      </PositionWrapper>
    </>
  )
}
