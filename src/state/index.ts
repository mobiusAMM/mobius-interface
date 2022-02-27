import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import { load, save } from 'redux-localstorage-simple'

import application from './application/reducer'
import claim from './claim/reducer'
import gauges from './gauges/reducer'
import { updateVersion } from './global/actions'
import logs from './logs/slice'
import mento from './mento/reducer'
import mentoPools from './mentoPools/reducer'
import pools from './mobiusPools/reducer'
import multicall from './multicall/reducer'
import openSum from './openSum/reducer'
import stablePools from './stablePools/reducer'
import staking from './staking/reducer'
import swap from './swap/reducer'
import transactions from './transactions/reducer'
import user from './user/reducer'

const PERSISTED_KEYS: string[] = ['user', 'transactions']

const store = configureStore({
  reducer: {
    application,
    user,
    transactions,
    swap,
    multicall,
    stablePools,
    pools,
    mentoPools,
    mento,
    claim,
    staking,
    gauges,
    logs,
    openSum,
  },
  middleware: [...getDefaultMiddleware({ thunk: false }), save({ states: PERSISTED_KEYS })],
  preloadedState: load({ states: PERSISTED_KEYS }),
})

store.dispatch(updateVersion())

export default store

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
