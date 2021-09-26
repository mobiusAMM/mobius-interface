import '@celo-tools/use-contractkit/lib/styles.css'

import { DappKitResponseStatus } from '@celo/utils'
import { useContractKit } from '@celo-tools/use-contractkit'
import { ErrorBoundary } from '@sentry/react'
import { ChainId } from '@ubeswap/sdk'
import { NETWORK, NETWORK_CHAIN_ID } from 'connectors'
import React, { Suspense } from 'react'
import { Route, Switch, useLocation } from 'react-router-dom'
import styled from 'styled-components'

import Header from '../components/Header'
import Polling from '../components/Header/Polling'
import URLWarning from '../components/Header/URLWarning'
import Popups from '../components/Popups'
import DarkModeQueryParamReader from '../theme/DarkModeQueryParamReader'
import { getMobileOperatingSystem, Mobile } from '../utils/mobile'
import Claim from './Claim'
import Earn from './Earn'
import Manage from './Earn/Manage'
import LandingPage from './LandingPage'
import RiskPage from './Risk'
import Staking from './Staking'
import Swap from './Swap'
import { RedirectToSwap } from './Swap/redirects'

const AppWrapper = styled.div`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  overflow-x: hidden;
  min-height: 100vh;
`

const HeaderWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  justify-content: space-between;
`

const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  ${({ giveSpace }) => giveSpace && `padding-top: 100px;`}
  align-items: center;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 10;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 16px;
    padding-top: 2rem;
  `};

  z-index: 1;
`

const Marginer = styled.div`
  margin-top: 5rem;
`

const localStorageKey = 'valoraRedirect'

export default function App() {
  const launchTime = new Date(Date.UTC(2021, 8, 19, 2))
  const now = new Date()
  const isLive = true
  const location = useLocation()
  const { network, updateNetwork } = useContractKit()
  const chainId = network.chainId as unknown as ChainId
  const wrongNetwork = !location.pathname.includes('optics') && chainId !== NETWORK_CHAIN_ID
  React.useEffect(() => {
    // Close window if search params from Valora redirect are present (handles Valora connection issue)
    if (typeof window !== 'undefined') {
      const url = window.location.href
      const whereQuery = url.indexOf('?')
      if (whereQuery !== -1) {
        const query = url.slice(whereQuery)
        const params = new URLSearchParams(query)
        if (params.get('status') === DappKitResponseStatus.SUCCESS) {
          localStorage.setItem(localStorageKey, window.location.href)
          const mobileOS = getMobileOperatingSystem()
          if (mobileOS === Mobile.ANDROID) {
            window.close()
          }
        }
      }
    }
    if (wrongNetwork) {
      updateNetwork(NETWORK)
    }
  }, [location])

  return (
    <Suspense fallback={null}>
      <Route component={DarkModeQueryParamReader} />
      <AppWrapper giveSpace={location.pathname !== '/'}>
        {location.pathname !== '/' && (
          <>
            <URLWarning />
            <HeaderWrapper>
              <Header />
            </HeaderWrapper>
          </>
        )}
        <BodyWrapper>
          {location.pathname !== '/' && (
            <>
              <Popups />
              <Polling />
            </>
          )}
          <ErrorBoundary fallback={<p>An unexpected error occured on this part of the page. Please reload.</p>}>
            <Switch>
              <Route exact path="/" component={LandingPage} />
              <Route exact strict path="/swap" component={Swap} />
              <Route exact strict path="/pool" component={Earn} />
              <Route exact strict path="/swap/:outputCurrency" component={RedirectToSwap} />
              <Route exact strict path="/risk" component={RiskPage} />
              <Route path="/claim" component={Claim} />
              <Route exact strict path="/farm/:poolName" component={Manage} />{' '}
              <Route exact strict path="/stake" component={Staking} />
              {/* <Route exact strict path="/optics" component={Optics} /> */}
            </Switch>
          </ErrorBoundary>
          {location.pathname !== '/' && <Marginer />}
        </BodyWrapper>
      </AppWrapper>
    </Suspense>
  )
}
