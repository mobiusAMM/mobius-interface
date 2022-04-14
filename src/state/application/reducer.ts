import { ApolloClient, InMemoryCache, NormalizedCacheObject } from '@apollo/client'
import { createReducer, nanoid } from '@reduxjs/toolkit'

import {
  addPopup,
  addPrice,
  addPrices,
  ApplicationModal,
  PopupContent,
  removePopup,
  setOpenModal,
  updateBlockNumber,
} from './actions'

type PopupList = Array<{ key: string; show: boolean; content: PopupContent; removeAfterMs: number | null }>

export type TokenPrices = {
  [address: string]: string
}

export interface ApplicationState {
  readonly blockNumber: { readonly [chainId: number]: number }
  readonly popupList: PopupList
  readonly openModal: ApplicationModal | null
  readonly tokenPrices: TokenPrices
  readonly ubeswapClient: ApolloClient<NormalizedCacheObject>
}

const initialState: ApplicationState = {
  blockNumber: {},
  popupList: [],
  openModal: null,
  tokenPrices: {},
  ubeswapClient: new ApolloClient({
    uri: 'https://api.thegraph.com/subgraphs/name/ubeswap/ubeswap-backup',
    cache: new InMemoryCache(),
  }),
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateBlockNumber, (state, action) => {
      const { chainId, blockNumber } = action.payload
      if (typeof state.blockNumber[chainId] !== 'number') {
        state.blockNumber[chainId] = blockNumber
      } else {
        state.blockNumber[chainId] = Math.max(blockNumber, state.blockNumber[chainId])
      }
    })
    .addCase(setOpenModal, (state, action) => {
      state.openModal = action.payload
    })
    .addCase(addPopup, (state, { payload: { content, key, removeAfterMs = 15000 } }) => {
      state.popupList = (key ? state.popupList.filter((popup) => popup.key !== key) : state.popupList).concat([
        {
          key: key || nanoid(),
          show: true,
          content,
          removeAfterMs,
        },
      ])
    })
    .addCase(removePopup, (state, { payload: { key } }) => {
      state.popupList.forEach((p) => {
        if (p.key === key) {
          p.show = false
        }
      })
    })
    .addCase(addPrice, (state, { payload: { token, price } }) => {
      state.tokenPrices = {
        ...state.tokenPrices,
        [token]: price,
      }
    })
    .addCase(addPrices, (state, { payload: { prices } }) => {
      state.tokenPrices = {
        ...state.tokenPrices,
        ...prices,
      }
    })
)
