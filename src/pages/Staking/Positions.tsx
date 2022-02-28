import { ButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import { CardNoise } from 'components/earn/styled'
import { RowBetween, RowFixed } from 'components/Row'
import { DisplayPool, IGauge, StablePools } from 'constants/pools'
import { ChainLogo } from 'constants/StablePools'
import { CUSD } from 'constants/tokens'
import { usePoolColor } from 'hooks/useColor'
import JSBI from 'jsbi'
import { TokenAmount } from 'lib/token-utils'
import React, { useState } from 'react'
import { isMobile } from 'react-device-detect'
import { ChevronDown, ChevronUp } from 'react-feather'
import { GaugeInfo, UserGaugeInfo } from 'state/gauges/hooks'
import { StakingInfo, UserStakingInfo } from 'state/staking/hooks'
import styled from 'styled-components'
import { TYPE } from 'theme'
import invariant from 'tiny-invariant'
import { calcBoost } from 'utils/calcExpectedVeMobi'

import Logo from '../../components/Logo'
import { CHAIN } from '../../constants'
import { useAllClaimableMobi } from '.'
import ClaimAllMobiModal from './ClaimAllMobiModal'

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background: ${({ theme }) => theme.bg1};
  border-radius: 1rem;
  margin-bottom: 1rem;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%
`}
`

const Wrapper = styled(AutoColumn)<{ showBackground: boolean; bgColor: any }>`
  width: 100%;
  overflow: hidden;
  position: relative;
  margin-bottom: 1rem;
  padding: 1rem;
  overflow: hidden;
  position: relative;
  background: ${({ theme }) => theme.bg1};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    box-shadow: 1px 1px 3px ${({ theme }) => theme.bg4};
    border-radius: 10px;

`}
  &:hover {
    opacity: 1;
  }
`

const StyledLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  background-color: ${({ theme }) => theme.white};
`
function parse<T>(include: boolean[], toParse: T[]): T[] {
  invariant(include.length === toParse.length, 'length mismatch')
  return toParse.filter((_, i) => include[i])
}

type PositionsProps = {
  stakingInfo: StakingInfo
  userStakingInfo: UserStakingInfo
  gauges: (GaugeInfo | null)[]
  userGauges: (UserGaugeInfo | null)[]
}

export default function Positions({ stakingInfo, userStakingInfo, gauges, userGauges }: PositionsProps) {
  const claimableMobi = useAllClaimableMobi(userGauges)
  const openPosition = userGauges.map(
    (ug) => ug !== null && (JSBI.greaterThan(ug.balance, JSBI.BigInt('0')) || ug.claimableMobi.greaterThan('0'))
  )

  const [openModal, setOpenModal] = useState(false)
  return (
    <Container>
      <ClaimAllMobiModal
        isOpen={openModal}
        onDismiss={() => setOpenModal(false)}
        userGauges={
          parse(openPosition, userGauges).filter(
            (ug) => ug !== null && ug.claimableMobi.greaterThan('0')
          ) as UserGaugeInfo[]
        }
        gauges={parse(openPosition, StablePools[CHAIN]).map((d) => d.gauge as IGauge)}
      />
      <RowBetween style={{ marginBottom: '1rem' }}>
        <TYPE.largeHeader>Your Positions</TYPE.largeHeader>
        <TYPE.green
          style={{ paddingLeft: '.15rem', textAlign: 'right' }}
          className="apr"
          fontWeight={800}
          fontSize={[18, 24]}
        >
          {claimableMobi.toSignificant(4)} Unclaimed MOBI
        </TYPE.green>
      </RowBetween>
      {openPosition.map((p, i) =>
        p ? (
          <PositionCard
            key={`positions-card-${StablePools[CHAIN][i].name}`}
            stakingInfo={stakingInfo}
            userStakingInfo={userStakingInfo}
            displayPool={StablePools[CHAIN][i]}
            gaugeInfo={gauges[i] as GaugeInfo}
            userGaugeInfo={userGauges[i] as UserGaugeInfo}
          />
        ) : null
      )}
      {claimableMobi.greaterThan('0') && (
        <ButtonPrimary
          onClick={() => setOpenModal(true)}
          style={{ fontWeight: 700, fontSize: 18, marginBottom: '1rem' }}
        >
          CLAIM MOBI
        </ButtonPrimary>
      )}
    </Container>
  )
}

function PositionCard({
  stakingInfo,
  userStakingInfo,
  gaugeInfo,
  userGaugeInfo,
  displayPool,
}: {
  stakingInfo: StakingInfo
  userStakingInfo: UserStakingInfo
  gaugeInfo: GaugeInfo
  userGaugeInfo: UserGaugeInfo
  displayPool: DisplayPool
}) {
  const lpAsUsd = new TokenAmount(CUSD[CHAIN], '1')
  const boost = calcBoost(
    userGaugeInfo.balance,
    gaugeInfo.totalSupply,
    userStakingInfo.votingPower.raw,
    stakingInfo.totalVotingPower.raw
  )

  const poolColor = usePoolColor(displayPool)
  const [expand, setExpand] = useState(false)

  const mobileView = (
    <div>
      <RowBetween>
        <RowFixed style={{ gap: '10px' }}>
          <StyledLogo size={'32px'} srcs={[ChainLogo[displayPool.chain]]} alt={'logo'} />
          <TYPE.mediumHeader>{displayPool.name}</TYPE.mediumHeader>
        </RowFixed>
        {expand ? <ChevronUp /> : <ChevronDown />}
      </RowBetween>
      {expand && (
        <div style={{ width: '100%', display: 'flex' }}>
          <TYPE.darkGray style={{ width: '100%', textAlign: 'right' }} fontSize={20}>
            {`Value: $${lpAsUsd?.toSignificant(4)}`}
          </TYPE.darkGray>
          <TYPE.subHeader
            style={{ alignContent: 'right', alignItems: 'right', textAlign: 'right' }}
            color={poolColor}
            className="apr"
            fontWeight={800}
            fontSize={[18, 24]}
          >
            {`Boost: ${boost.greaterThan(JSBI.BigInt(0)) ? boost.toFixed(2) : '1'}x`}
          </TYPE.subHeader>
        </div>
      )}
    </div>
  )

  return (
    <>
      <Wrapper showBackground={true} bgColor={poolColor} onClick={() => setExpand(!expand)}>
        <CardNoise />
        {isMobile ? (
          mobileView
        ) : (
          <RowBetween>
            <RowFixed style={{ gap: '10px' }}>
              <StyledLogo size={'32px'} srcs={[ChainLogo[displayPool.chain]]} alt={'logo'} />
              <TYPE.mediumHeader>{displayPool.name}</TYPE.mediumHeader>
              <TYPE.darkGray fontSize={20}>{`  -  $${lpAsUsd?.toSignificant(4)}`}</TYPE.darkGray>
            </RowFixed>
            <TYPE.subHeader
              style={{ alignContent: 'right', alignItems: 'right', textAlign: 'right' }}
              color={poolColor}
              className="apr"
              fontWeight={800}
              fontSize={[18, 24]}
            >
              {`${boost.greaterThan(JSBI.BigInt(0)) ? boost.toFixed(2) : '1'}x`}
            </TYPE.subHeader>
          </RowBetween>
        )}{' '}
      </Wrapper>
    </>
  )
}
