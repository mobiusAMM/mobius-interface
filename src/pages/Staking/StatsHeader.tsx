import Column from 'components/Column'
import Loader from 'components/Loader'
import { useExternalStakingRewards } from 'hooks/useExternalStakingRewards'
import React from 'react'
import { isMobile } from 'react-device-detect'
import { MobiStakingInfo, usePriceOfDeposits } from 'state/staking/hooks'
import { useIsDarkMode } from 'state/user/hooks'
import styled from 'styled-components'
import { TYPE } from 'theme'

import atmLight from '../../assets/images/atm.png'
import atmDark from '../../assets/images/atm-d.png'
import bankLight from '../../assets/images/bank.png'
import bankDark from '../../assets/images/bank-d.png'
import cashLight from '../../assets/images/cash.png'
import cashDark from '../../assets/images/cash-d.png'
import lockLight from '../../assets/images/lock.png'
import lockDark from '../../assets/images/lock-d.png'

const Container = styled.div`
  display: block;
  column-rule: 1px solid ${({ theme }) => theme.bg4};
  row-rule: 1px solid ${({ theme }) => theme.bg4};
  gap: 0;
  padding: 0;
  overflow-x: auto;
  text-align: center;
  font-size: 0.9em;
  columns: 4;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  columns: 2;
`}
  background: ${({ theme }) => theme.bg1};
  border-radius: 1rem;
  &::> * {
    break-inside: avoid;
  }
`
const Stat = styled.div<{ showBottom: boolean }>`
  margin: auto;
  display: grid;
  grid-template-columns: 2.75rem 1fr;
  gap: 0.5em;
  align-items: center;
  padding: 1em;
  text-align: left;
  break-inside: avoid;
  ${({ showBottom, theme }) => showBottom && `border-bottom: 1px ${theme.bg4} solid`};
`

const StatIcon = styled.img`
  width: 100%;
  max-height: 3rem;
`

const StatSpan = styled.span`
  opacity: 0.5;
  white-space: nowrap;
  font-size: 1em;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 0.6em;
  `}
`

type PropType = {
  stakingInfo: MobiStakingInfo
}
function StatsHeader({ stakingInfo }: PropType) {
  const priceOfDeposits = usePriceOfDeposits()
  const { avgApr } = useExternalStakingRewards()
  const isDarkMode = useIsDarkMode()

  const displayData = [
    {
      label: 'Your Voting Power',
      value: stakingInfo?.votingPower?.toSignificant(4, { groupSeparator: ',' }),
      img: isDarkMode ? lockDark : lockLight,
    },
    {
      label: 'Your total deposits',
      value: priceOfDeposits ? '$' + priceOfDeposits?.toSignificant(4, { groupSeparator: ',' }) : undefined,
      img: isDarkMode ? cashDark : cashLight,
    },
    {
      label: 'Total Voting Power',
      value: stakingInfo?.totalVotingPower?.toSignificant(4, { groupSeparator: ',' }),
      img: isDarkMode ? bankDark : bankLight,
    },
    {
      label: 'Max Staking APR',
      value: avgApr ? `${avgApr?.toSignificant(2, { groupSeparator: ',' })}%` : undefined,
      img: isDarkMode ? atmDark : atmLight,
    },
  ]

  return (
    <Container>
      {displayData.map(({ label, value, img }, i) => (
        <Stat key={`staking-stats-${label}`} showBottom={isMobile && i % 2 === 0}>
          <StatIcon src={img} alt={label} />
          <Column>
            <StatSpan>{label}</StatSpan>
            {value ? <TYPE.subHeader fontSize={[15, 20]}>{value}</TYPE.subHeader> : <Loader />}
          </Column>
        </Stat>
      ))}
    </Container>
  )
}

export default StatsHeader
