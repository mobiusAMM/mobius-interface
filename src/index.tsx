import './i18n'

import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client'
import * as Sentry from '@sentry/react'
import { Integrations } from '@sentry/tracing'
import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'
import { UpdateMento } from 'state/mentoPools/updater'
import { UpdateOpenSum } from 'state/openSum/updater'
import { BatchUpdateGauges, UpdateVariablePoolInfo } from 'state/stablePools/updater'
import StakingUpdater from 'state/staking/updater'

import { Web3ContextProvider } from './hooks'
import App from './pages/App'
import store from './state'
import ApplicationUpdater, { PriceData } from './state/application/updater'
import LogsUpdater from './state/logs/updater'
import MulticallUpdater from './state/multicall/updater'
import TransactionUpdater from './state/transactions/updater'
import UserUpdater from './state/user/updater'
import ThemeProvider, { FixedGlobalStyle, ThemedGlobalStyle } from './theme'

if (window.celo) {
  window.celo.autoRefreshOnNetworkChange = false
}

if (process.env.REACT_APP_SENTRY_DSN) {
  const sentryCfg = {
    environment: `${process.env.REACT_APP_VERCEL_ENV ?? 'unknown'}`,
    release: `${process.env.REACT_APP_VERCEL_GIT_COMMIT_REF?.replace(/\//g, '--') ?? 'unknown'}-${
      process.env.REACT_APP_VERCEL_GIT_COMMIT_SHA ?? 'unknown'
    }`,
  }
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: 0.2,
    ...sentryCfg,
  })
  console.log(`Initializing Sentry environment at release ${sentryCfg.release} in environment ${sentryCfg.environment}`)
} else {
  console.warn(`REACT_APP_SENTRY_DSN not found. Sentry will not be loaded.`)
}

const client = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/d-mooers/mobius',
  cache: new InMemoryCache(),
})

function Updaters() {
  return (
    <>
      <UserUpdater />
      <ApplicationUpdater />
      <TransactionUpdater />
      <MulticallUpdater />
      <BatchUpdateGauges />
      <UpdateVariablePoolInfo />
      <StakingUpdater />
      <UpdateMento />
      <PriceData />
      <LogsUpdater />
      <UpdateOpenSum />
    </>
  )
}

ReactDOM.render(
  <StrictMode>
    <FixedGlobalStyle />
    <ApolloProvider client={client}>
      <Provider store={store}>
        <Web3ContextProvider>
          <Updaters />
          <ThemeProvider>
            <ThemedGlobalStyle />
            <HashRouter>
              <App />
            </HashRouter>
          </ThemeProvider>
        </Web3ContextProvider>
      </Provider>
    </ApolloProvider>
  </StrictMode>,
  document.getElementById('root')
)
