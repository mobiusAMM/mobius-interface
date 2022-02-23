import { createAction } from '@reduxjs/toolkit'
import { Fraction } from '@ubeswap/sdk'

export type PopupContent = {
  txn: {
    hash: string
    success: boolean
    summary?: string
  }
}

export enum ApplicationModal {
  WALLET,
  SETTINGS,
  SELF_CLAIM,
  ADDRESS_CLAIM,
  CLAIM_POPUP,
  MENU,
  DELEGATE,
  VOTE,
}

export const updateBlockNumber = createAction<{ chainId: number; blockNumber: number }>('application/updateBlockNumber')
export const setOpenModal = createAction<ApplicationModal | null>('application/setOpenModal')
export const addPopup =
  createAction<{ key?: string; removeAfterMs?: number | null; content: PopupContent }>('application/addPopup')
export const removePopup = createAction<{ key: string }>('application/removePopup')
export const btcEthPrice = createAction<{ ethPrice: string; btcPrice: string }>('application/btcEthPrice')
export const addPrice = createAction<{ token: string; price: Fraction }>('application/addPrice')
export const addPrices = createAction<{ prices: { [address: string]: string } }>('application/addPrices')
