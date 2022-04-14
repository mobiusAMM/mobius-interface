import './i18n'
import '@celo-tools/use-contractkit/lib/styles.css'

import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client'
import { ContractKitProvider, Mainnet } from '@celo-tools/use-contractkit'
import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'
import { GaugeUpdater } from 'state/gauges/updater'
import { UpdateMento } from 'state/mentoPools/updater'
import { UpdatePools } from 'state/mobiusPools/updater'
import { UpdateOpenSum } from 'state/openSum/updater'
import StakingUpdater from 'state/staking/updater'

import mobiusIcon from './assets/svg/mobius.svg'
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
    <ContractKitProvider
      dapp={{
        name: 'Mobius',
        description: 'Multi-chain, stable swap exchange',
        url: 'https://www.mobius.money/#/',
        icon: mobiusIcon,
      }}
      network={Mainnet}
      connectModal={{
        reactModalProps: {
          style: {
            content: {
              top: '50%',
              left: '50%',
              right: 'auto',
              bottom: 'auto',
              transform: 'translate(-50%, -50%)',
              border: 'unset',
              background: 'unset',
              padding: 'unset',
              color: 'black',
            },
            overlay: {
              zIndex: 100,
            },
          },
          overlayClassName: 'tw-fixed tw-bg-gray-100 dark:tw-bg-gray-700 tw-bg-opacity-75 tw-inset-0',
        },
      }}
    >
      <ApolloProvider client={client}>
        <Provider store={store}>
          <Updaters />
          <ThemeProvider>
            <ThemedGlobalStyle />
            <HashRouter>
              <App />
            </HashRouter>
          </ThemeProvider>
        </Provider>
      </ApolloProvider>
    </ContractKitProvider>
  </StrictMode>,
  document.getElementById('root')
)
