import React, { useState } from 'react'
import Countdown from 'react-countdown'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

import { ButtonConfirmed } from '../../components/Button'
import OpenSumDepositModal from '../../components/earn/OpenSumDepositModal'
import { useOpenPools } from '../../state/openSum/hooks'
import { ConstantSumPool } from '../../state/openSum/reducer'
import { colors } from '../../theme'

const { primary1: mobiGreen, bg4 } = colors(false)

const StyledCountdown = styled(Countdown)`
  padding: 2rem;
  font-size: 3rem;
`

const Container = styled.div`
  padding-top: 4rem;
  width: min(1080px, 90vw);
  display: flex;
  flex-direction: column;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 1.25rem;
    padding-top: 0;
    margin-top: 0;
`}
  overflow: none;
`

const Footer = styled.div`
  display: flex;
  justify-content: space-around;
`

const ExternalLink = styled.a`
  margin: 0.5rem;
  height: 3rem;
  width: 3rem;
  border-radius: 2rem;
  background: white;
  cursor: pointer;
`

const LogoContainer = styled.div`
  width: min(25rem, 95%);
  margin-top: 2rem;
`

export const StyledMenuButton = styled(NavLink)`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: min(15rem, 50%);
  height: 100%;
  border: none;
  background-color: ${mobiGreen};
  margin: 2rem;
  margin-top: 0.5rem;
  padding: 1rem;
  height: 35px;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 1000;
  color: black;
  text-decoration: none;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    background-color: ${({ theme }) => theme.primary2};
  }

  svg {
    margin-top: 2px;
  }
  > * {
    stroke: ${({ theme }) => theme.text1};
  }
`

const Divider = styled.div`
  width: 100%;
  background: ${({ theme, show }) => show && theme.primary3};
  height: 1px;
  margin: auto;
  margin-top: 1rem;
  margin-bottom: 2.5rem;
`

export const ComingSoon = styled.a`
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: min(15rem, 70%);
  height: 100%;
  border: none;
  background-color: ${bg4};
  margin: 2rem;
  margin-top: 0;
  padding: 1.5rem;
  height: 35px;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 1000;
  color: black;
  text-decoration: none;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
  }

  svg {
    margin-top: 2px;
  }
  > * {
    stroke: ${({ theme }) => theme.text1};
  }
`

// const NETWORK_LABELS: { [chainId in ChainId]?: string } = {
//   [ChainId.ALFAJORES]: 'Alfajores',
//   [ChainId.BAKLAVA]: 'Baklava',
// }

export default function OpenSumDeposit() {
  const pools = useOpenPools()
  return (
    <Container>
      {pools.map((p) => (
        <OpenPoolCard key={`open-pool-card-${p.name}`} poolInfo={p} />
      ))}
    </Container>
  )
}

function OpenPoolCard({ poolInfo }: { poolInfo: ConstantSumPool }) {
  const [openModal, setOpenModal] = useState(false)
  return (
    <>
      <OpenSumDepositModal isOpen={openModal} onDismiss={() => setOpenModal(false)} poolInfo={poolInfo} />
      <ButtonConfirmed
        marginBottom="1rem"
        onClick={() => setOpenModal(true)}
      >{`Deposit into ${poolInfo.name} pool`}</ButtonConfirmed>
    </>
  )
}
