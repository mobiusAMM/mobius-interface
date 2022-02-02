import { CELO, TokenAmount } from '@ubeswap/sdk'
import { CardNoise } from 'components/earn/styled'
import Modal from 'components/Modal'
import usePrevious from 'hooks/usePrevious'
import { darken } from 'polished'
import React, { useState } from 'react'
import { isMobile } from 'react-device-detect'
import { Moon, Sun } from 'react-feather'
import Hamburger from 'react-hamburger-menu'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import { Text } from 'rebass'
import { useAggregateUbeBalance, useTokenBalance } from 'state/wallet/hooks'
import styled from 'styled-components'
import { TYPE } from 'theme'
import { ExternalLink } from 'theme/components'
import { CountUp } from 'use-count-up'

import Logo from '../../assets/svg/mobius.svg'
import { CHAIN } from '../../constants'
import { useWeb3Context } from '../../hooks'
import useTheme from '../../hooks/useTheme'
import { useDarkModeManager } from '../../state/user/hooks'
import Menu from '../Menu'
import Row, { RowFixed } from '../Row'
import Web3Status from '../Web3Status'
import HamburgerModal from './HamburgerModal'
import UbeBalanceContent from './UbeBalanceContent'

const HeaderFrame = styled.div`
  display: grid;
  grid-template-columns: 1fr 120px;
  align-items: center;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  width: 100%;
  top: 0;
  position: relative;
  padding: 1rem;
  z-index: 2;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: 1fr;
    padding: 0 1rem;
    width: calc(100%);
    position: relative;
  `};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
        padding: 0.5rem 1rem;
  `}
`

const HeaderControls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-self: flex-end;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: row;
    justify-content: space-between;
    justify-self: center;
    width: 100%;
    max-width: 960px;
    padding: 1rem;
    position: fixed;
    bottom: 0px;
    left: 0px;
    width: 100%;
    z-index: 99;
    height: 72px;
    border-radius: 12px 12px 0 0;
    background-color: ${({ theme }) => theme.bg1};
  `};
`

const HeaderElement = styled.div`
  display: flex;
  align-items: center;

  /* addresses safari's lack of support for "gap" */
  & > *:not(:first-child) {
    margin-left: 8px;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
   flex-direction: row-reverse;
    align-items: center;
  `};
`

const HeaderElementWrap = styled.div`
  display: flex;
  align-items: center;
`

const HeaderRow = styled(RowFixed)`
  ${({ theme }) => theme.mediaWidth.upToMedium`
   width: 100%;
    justify-content: space-between;
  `};
`

const HeaderLinks = styled(Row)`
  justify-content: center;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem 0 1rem 1rem;
    justify-content: flex-end;
`};
`

const AccountElement = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme, active }) => (!active ? theme.bg1 : theme.bg3)};
  border-radius: 12px;
  white-space: nowrap;
  width: 100%;
  cursor: pointer;

  :focus {
    border: 1px solid blue;
  }
`

const HideSmall = styled.span`
  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: none;
  `};
`

// const NetworkCard = styled(YellowCard)`
//   border-radius: 12px;
//   padding: 8px 12px;
//   ${({ theme }) => theme.mediaWidth.upToSmall`
//     margin: 0;
//     margin-right: 0.5rem;
//     width: initial;
//     overflow: hidden;
//     text-overflow: ellipsis;
//     flex-shrink: 1;
//   `};
// `

const BalanceText = styled(Text)`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};
`
const activeClassName = 'ACTIVE'

const Title = styled(NavLink)`
  display: flex;
  color: ${({ theme }) => theme.text1};
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: 1000;
  align-items: center;
  pointer-events: auto;
  justify-self: flex-start;
  margin-right: 12px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    justify-self: center;
    font-size: 1.25rem;
  `};
  :hover {
    cursor: pointer;
  }
`
const MobiusIcon = styled.div`
  transition: transform 0.3s ease;
  margin-right: 0.1rem;
  margin-top: 0.35rem;
  // :hover {
  //   transform: rotate(-5deg);
  // }
`

const StyledNavLink = styled(NavLink).attrs({
  activeClassName,
})`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text2};
  font-size: 1rem;
  width: fit-content;
  margin: 0 12px;
  font-weight: 500;

  &.${activeClassName} {
    border-radius: 12px;
    font-weight: 600;
    color: ${({ theme }) => theme.text1};
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.text1)};
  }
`

const StyledExternalLink = styled(ExternalLink).attrs({
  activeClassName,
})<{ isActive?: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text2};
  font-size: 1rem;
  width: fit-content;
  margin: 0 12px;
  font-weight: 500;

  &.${activeClassName} {
    border-radius: 12px;
    font-weight: 600;
    color: ${({ theme }) => theme.text1};
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.text1)};
  }

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
      display: none;
`}
`

export const StyledMenuButton = styled.button`
  position: relative;
  width: 100%;
  height: 100%;
  border: none;
  background-color: transparent;
  margin: 0;
  padding: 0;
  height: 35px;
  width: 35px;
  background-color: ${({ theme }) => theme.bg3};
  margin-left: 8px;
  padding: 0.15rem 0.5rem;
  border-radius: 0.5rem;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    background-color: ${({ theme }) => theme.bg4};
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

export default function Header() {
  const { address, connected } = useWeb3Context()
  const { t } = useTranslation()
  const theme = useTheme()
  const userCELOBalance = useTokenBalance(connected ? address : undefined, CELO[CHAIN])
  const [darkMode, toggleDarkMode] = useDarkModeManager()
  const [showUbeBalanceModal, setShowUbeBalanceModal] = useState<boolean>(false)
  const [toggleMenu, setToggleMenu] = useState<boolean>(false)
  const aggregateBalance: TokenAmount | undefined = useAggregateUbeBalance()
  const countUpValue = aggregateBalance?.toFixed(0) ?? '0'
  const countUpValuePrevious = usePrevious(countUpValue) ?? '0'

  return (
    <HeaderFrame>
      <HamburgerModal isOpen={toggleMenu} onDismiss={() => setToggleMenu(false)} />
      <Modal isOpen={showUbeBalanceModal} onDismiss={() => setShowUbeBalanceModal(false)}>
        <UbeBalanceContent setShowUbeBalanceModal={setShowUbeBalanceModal} />
      </Modal>
      <HeaderRow>
        <Title to="/swap">
          <MobiusIcon>
            <img width={'50px'} src={Logo} alt="logo" />
          </MobiusIcon>
          Mobius
        </Title>
        <HeaderLinks>
          {isMobile ? (
            <Hamburger
              isOpen={toggleMenu}
              menuClicked={() => setToggleMenu(!toggleMenu)}
              width={18}
              height={15}
              strokeWidth={1}
              rotate={0}
              color={theme.text1}
              borderRadius={0}
              animationDuration={0.5}
            />
          ) : (
            <>
              <StyledNavLink id={`swap-nav-link`} to={'/swap'}>
                {t('Swap')}
              </StyledNavLink>
              <StyledNavLink id={`mint-nav-link`} to={'/mint'}>
                {t('Mint')}
              </StyledNavLink>
              <StyledNavLink id={`migrate-nav-link`} to={'/opensum'}>
                {t('Migrate')}
              </StyledNavLink>
              <StyledNavLink
                id={`pool-nav-link`}
                to={'/pool'}
                isActive={(match, { pathname }) =>
                  Boolean(match) ||
                  pathname.startsWith('/add') ||
                  pathname.startsWith('/remove') ||
                  pathname.startsWith('/create') ||
                  pathname.startsWith('/find')
                }
              >
                {t('Pool')}
              </StyledNavLink>
              <StyledNavLink id={`charts-nav-link`} to={'/charts'}>
                {t('Charts')}
              </StyledNavLink>
              <StyledNavLink id={`swap-nav-link`} to={'/stake'}>
                {t('Stake')}
              </StyledNavLink>
              <StyledNavLink id={`vote-nav-link`} to={'/vote'}>
                {t('Vote')}
              </StyledNavLink>
              <StyledNavLink id={`swap-nav-link`} to={'/risk'}>
                {t('Risks')}
              </StyledNavLink>
            </>
          )}
        </HeaderLinks>
      </HeaderRow>
      <HeaderControls>
        <HeaderElement>
          {aggregateBalance && (
            <UBEWrapper onClick={() => setShowUbeBalanceModal(true)}>
              <UBEAmount active={connected} style={{ pointerEvents: 'auto' }}>
                {connected && (
                  <HideSmall>
                    <TYPE.white
                      style={{
                        paddingRight: '.4rem',
                      }}
                    >
                      <CountUp
                        key={countUpValue}
                        isCounting
                        start={parseFloat(countUpValuePrevious)}
                        end={parseFloat(countUpValue)}
                        thousandsSeparator={','}
                        duration={1}
                      />
                    </TYPE.white>
                  </HideSmall>
                )}
                MOBI
              </UBEAmount>
              <CardNoise />
            </UBEWrapper>
          )}

          <AccountElement active={connected} style={{ pointerEvents: 'auto' }}>
            {connected && userCELOBalance ? (
              <BalanceText style={{ flexShrink: 0 }} pl="0.75rem" pr="0.5rem" fontWeight={500}>
                {userCELOBalance?.toFixed(2, { groupSeparator: ',' }) ?? '0.00'} CELO
              </BalanceText>
            ) : null}
            <Web3Status />
          </AccountElement>
        </HeaderElement>
        <RowFixed>
          <StyledMenuButton onClick={() => toggleDarkMode()}>
            {darkMode ? <Moon size={20} /> : <Sun size={20} />}
          </StyledMenuButton>
          <Menu />
        </RowFixed>
      </HeaderControls>
    </HeaderFrame>
  )
}

const UBEAmount = styled(AccountElement)`
  color: white;
  padding: 4px 8px;
  height: 36px;
  font-weight: 500;
  background-color: ${({ theme }) => theme.bg3};
  background: radial-gradient(174.47% 188.91% at 1.84% 0%, ${({ theme }) => theme.primary1} 0%, #3488ec 100%), #edeef2;
`

const UBEWrapper = styled.span`
  margin-left: 8px;
  width: fit-content;
  position: relative;
  cursor: pointer;
  :hover {
    opacity: 0.8;
  }
  :active {
    opacity: 0.9;
  }
`
