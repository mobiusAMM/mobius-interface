import '@reach/dialog/styles.css'

import { DialogContent, DialogOverlay } from '@reach/dialog'
import { RowBetween } from 'components/Row'
import { darken, transparentize } from 'polished'
import React from 'react'
import { isMobile } from 'react-device-detect'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import { animated, useSpring, useTransition } from 'react-spring'
import { useGesture } from 'react-use-gesture'
import styled, { css } from 'styled-components'
import { ExternalLink } from 'theme/components'

import { TYPE } from '../../theme'

const activeClassName = 'ACTIVE'

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
  font-size: 1.5rem;
  width: fit-content;
  margin: 0 12px;
  font-weight: 500;
  margin-bottom: 0.5rem;

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

const LinkContainer = styled.div`
  margin-top: 1rem;
  display: flex;
  width: 100%;
  align-items: center;
  flex-direction: column;
`

const Divider = styled.div`
  height: 1px;
  width: 100%;
  background: ${({ theme }) => theme.text1};
  margin-top: 0.5rem;
  margin-bottom: 1.5rem;
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
  font-size: 1.5rem;
  width: fit-content;
  margin: 0 12px;
  font-weight: 500;
  margin-bottom: 0.5rem;

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

export default function HamburgerModal({ isOpen, onDismiss }: { isOpen: boolean; onDismiss: () => void }) {
  const { t } = useTranslation()

  return (
    <CustomModal isOpen={isOpen} onDismiss={onDismiss} maxHeight={90}>
      <LinkContainer>
        <RowBetween>
          <TYPE.mediumHeader>Links</TYPE.mediumHeader>
          <TYPE.largeHeader onClick={onDismiss}>X</TYPE.largeHeader>
        </RowBetween>
        <Divider />
        <StyledNavLink id={`swap-nav-link`} to={'/swap'} onClick={onDismiss}>
          {t('Swap')}
        </StyledNavLink>
        <StyledNavLink id={`mint-nav-link`} to={'/mint'} onClick={onDismiss}>
          {t('Mint')}
        </StyledNavLink>
        <StyledNavLink id={`migrate-nav-link`} to={'/opensum'} onClick={onDismiss}>
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
          onClick={onDismiss}
        >
          {t('Pool')}
        </StyledNavLink>
        <StyledNavLink id={`charts-nav-link`} to={'/charts'}>
          {t('Charts')}
        </StyledNavLink>
        <StyledNavLink id={`swap-nav-link`} to={'/stake'} onClick={onDismiss}>
          {t('Stake')}
        </StyledNavLink>
        <StyledNavLink id={`vote-nav-link`} to={'/vote'} onClick={onDismiss}>
          {t('Vote')}
        </StyledNavLink>
        {/* <StyledExternalLink id="bridge-nav-link" target="_self" href="https://bridge.mobius.money/#/">
          {t('Bridge')}
        </StyledExternalLink> */}
        <StyledNavLink id={`swap-nav-link`} to={'/risk'} onClick={onDismiss}>
          {t('Risks')}
        </StyledNavLink>
      </LinkContainer>
    </CustomModal>
  )
}

// Custom Modal
const AnimatedDialogOverlay = animated(DialogOverlay)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const StyledDialogOverlay = styled(AnimatedDialogOverlay)`
  &[data-reach-dialog-overlay] {
    z-index: 2;
    background-color: transparent;
    overflow: hidden;

    display: flex;
    align-items: center;
    justify-content: center;

    background-color: none;
    backdrop-filter: blur(3px);
  }
`
//${({ theme }) => theme.modalBG};

const AnimatedDialogContent = animated(DialogContent)
// destructure to not pass custom props to Dialog DOM element
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const StyledDialogContent = styled(({ minHeight, maxHeight, mobile, isOpen, ...rest }) => (
  <AnimatedDialogContent {...rest} />
)).attrs({
  'aria-label': 'dialog',
})`
  overflow-y: ${({ mobile }) => (mobile ? 'scroll' : 'hidden')};

  &[data-reach-dialog-content] {
    margin: 0 0 2rem 0;
    background-color: ${({ theme }) => theme.bg1};
    box-shadow: 0 4px 8px 0 ${({ theme }) => transparentize(0.95, theme.shadow1)};
    padding: 2rem;
    width: 50vw;
    overflow-y: ${({ mobile }) => (mobile ? 'scroll' : 'hidden')};
    overflow-x: hidden;

    align-self: ${({ mobile }) => (mobile ? 'flex-start' : 'center')};

    max-width: 420px;
    ${({ maxHeight }) =>
      maxHeight &&
      css`
        max-height: ${maxHeight}vh;
      `}
    ${({ minHeight }) =>
      minHeight &&
      css`
        min-height: ${minHeight}vh;
      `}
    display: flex;
    border-radius: 20px;
    ${({ theme }) => theme.mediaWidth.upToMedium`
      width: 65vw;
      margin: 0;
    `}
    ${({ theme, mobile }) => theme.mediaWidth.upToSmall`
      width:  85vw;
      ${
        mobile &&
        css`
          width: 100vw;
          border-radius: 20px;
          border-top-left-radius: 0;
          border-top-right-radius: 0;
        `
      }
    `}
  }
`

interface ModalProps {
  isOpen: boolean
  onDismiss: () => void
  minHeight?: number | false
  maxHeight?: number
  initialFocusRef?: React.RefObject<any>
  children?: React.ReactNode
}

function CustomModal({ isOpen, onDismiss, minHeight = false, maxHeight = 90, initialFocusRef, children }: ModalProps) {
  const fadeTransition = useTransition(isOpen, null, {
    config: { duration: 200 },
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  })

  const [{ y }, set] = useSpring(() => ({ y: 0, config: { mass: 1, tension: 210, friction: 20 } }))
  const bind = useGesture({
    onDrag: (state) => {
      set({
        y: state.down ? state.movement[1] : 0,
      })
      if (state.movement[1] > 300 || (state.velocity > 3 && state.direction[1] > 0)) {
        onDismiss()
      }
    },
  })

  return (
    <>
      {fadeTransition.map(
        ({ item, key, props }) =>
          item && (
            <StyledDialogOverlay key={key} style={{ ...props }} onDismiss={onDismiss} initialFocusRef={initialFocusRef}>
              <StyledDialogContent
                {...(isMobile
                  ? {
                      ...bind(),
                      style: {
                        transform: y.interpolate((n) => `translateY(${(n as unknown as number) > 0 ? n : 0}px)`),
                      },
                    }
                  : {})}
                aria-label="dialog content"
                minHeight={minHeight}
                maxHeight={maxHeight}
                mobile={isMobile}
              >
                {/* prevents the automatic focusing of inputs on mobile by the reach dialog */}
                {!initialFocusRef && isMobile ? <div tabIndex={1} /> : null}
                {children}
              </StyledDialogContent>
            </StyledDialogOverlay>
          )
      )}
    </>
  )
}
