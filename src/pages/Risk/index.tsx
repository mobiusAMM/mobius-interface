import React from 'react'
import Countdown from 'react-countdown'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

import { colors, TYPE } from '../../theme'

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
  width: min(15rem, 70%);
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

export default function RiskPage() {
  return (
    <Container>
      <TYPE.subHeader fontStyle="italic" fontSize={[16, 20]}>
        Providing liquidity to Mobius is highly risky. Before using the protocol, we highly recommend{' '}
        <a href="https://github.com/mobiusAMM/mobiusV1" target="_blank" rel="noreferrer">
          reading the code
        </a>{' '}
        and understanding the risks involved with being a Liquidity Provider (LP) and/or using the AMM to trade pegged
        value crypto assets.
      </TYPE.subHeader>
      <Divider show />
      <TYPE.largeHeader fontWeight={1000} fontSize={[24, 30]}>
        Audits
      </TYPE.largeHeader>
      <br />
      <TYPE.body fontSize={[16, 22]}>
        Mobius is a fork of{' '}
        <a href="https://nerve.fi/" target="_blank" rel="noreferrer">
          Nerve.
        </a>{' '}
        <br />
        <br /> The Nerve contracts have previously been{' '}
        <a
          href="https://github.com/nerve-finance/contracts/blob/main/audits/Certik%20-%20REP-Nerve_Finance_Core_Contracts-06_04_2021.pdf"
          target="_blank"
          rel="noreferrer"
        >
          {' '}
          audited by Certik{' '}
        </a>
        {', '} and as of 09/03/2021, we are in the process of getting the Mobius contracts audited as well. <br />
        <br />
        In general we did not change much from the Nerve contracts, besides adding a few methods to retrieve pool
        information, and removing the withdrawal fee for LP providers.
        <br /> <br /> You can view the exact differences between our contracts{' '}
        <a
          href="https://github.com/nerve-finance/contracts/compare/main...mobiusAMM:main"
          target="_blank"
          rel="noreferrer"
        >
          {' '}
          here.
        </a>
      </TYPE.body>
      <Divider />
      <TYPE.largeHeader fontWeight={1000} fontSize={[24, 30]}>
        Permanent loss of a peg
      </TYPE.largeHeader>
      <br />
      <TYPE.body fontSize={[16, 22]}>
        If one of the assets in a pool significantly depegs, it will effectively mean that pool liquidity providers will
        be left holding only that asset.
      </TYPE.body>
    </Container>
  )
}
