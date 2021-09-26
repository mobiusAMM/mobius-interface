import { ButtonOutlined } from 'components/Button'
import { AutoColumn } from 'components/Column'
import { CardNoise } from 'components/earn/styled'
import Loader from 'components/Loader'
import { AutoRow, RowBetween } from 'components/Row'
import { useColor } from 'hooks/useColor'
import React, { useState } from 'react'
import { GaugeSummary, MobiStakingInfo } from 'state/staking/hooks'
import styled from 'styled-components'
import { TYPE } from 'theme'

import ClaimAllMobiModal from './ClaimAllMobiModal'

const Container = styled.div`
  width: 49%;
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
const SmallButton = styled(ButtonOutlined)`
  padding: 0.5rem;
  width: 8rem;
  border-color: ${({ theme }) => theme.primary1};
`
const Wrapper = styled(AutoColumn)<{ showBackground: boolean; bgColor: any }>`
  border-radius: 12px;
  width: 100%;
  overflow: hidden;
  position: relative;
  margin-bottom: 1rem;
  padding: 1rem;
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
`
const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: ${({ theme }) => theme.primary1};
  margin-top: 0.25rem;
  margin-bottom: 1.5rem;
`

type PositionsProps = {
  stakingInfo: MobiStakingInfo
}
export default function Positions({ stakingInfo }: PositionsProps) {
  const { positions = [] } = stakingInfo
  const loading = positions.length === 0
  const greaterThanZero = positions.filter(({ baseBalance }) => baseBalance.greaterThan('0'))
  const [openModal, setOpenModal] = useState(false)
  return (
    <Container>
      <ClaimAllMobiModal isOpen={openModal} onDismiss={() => setOpenModal(false)} summaries={greaterThanZero} />
      <RowBetween>
        <TYPE.largeHeader>Your Unclaimed Mobi</TYPE.largeHeader>
        <SmallButton onClick={() => setOpenModal(true)}>Claim All</SmallButton>
      </RowBetween>
      <Divider />
      {loading ? (
        <AutoRow>
          <Loader style={{ margin: 'auto' }} />
        </AutoRow>
      ) : greaterThanZero.length > 0 ? (
        greaterThanZero.map((position) => <PositionCard key={`positions-card-${position.pool}`} position={position} />)
      ) : (
        <TYPE.largeHeader>You do not have any deposits</TYPE.largeHeader>
      )}
    </Container>
  )
}

const ButtonGroup = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
`

function PositionCard({ position }: { position: GaugeSummary }) {
  const backgroundColor = useColor(position.firstToken)

  return (
    <>
      <Wrapper showBackground={true} bgColor={backgroundColor}>
        <CardNoise />
        <RowBetween>
          <TYPE.mediumHeader color="white">{position.pool}</TYPE.mediumHeader>
          <TYPE.white color="white">{`${position.unclaimedMobi.toFixed(2)}`}</TYPE.white>
        </RowBetween>
      </Wrapper>
    </>
  )
}
