import './i18n'

import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client'
import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'
import { GaugeUpdater } from 'state/gauges/updater'
import { UpdateMento } from 'state/mentoPools/updater'
import { UpdatePools } from 'state/mobiusPools/updater'
import { UpdateOpenSum } from 'state/openSum/updater'
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
      {/* <BatchUpdateGauges /> */}
      <GaugeUpdater />
      {/* <UpdateVariablePoolInfo /> */}
      <UpdatePools />
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
