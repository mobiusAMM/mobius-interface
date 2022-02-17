import { createAction } from '@reduxjs/toolkit'

export enum Field {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
}

export const selectCurrency = createAction<{ field: Field; currencyId: string }>('mento/selectCurrency')
export const switchCurrencies = createAction<void>('mento/switchCurrencies')
export const typeInput = createAction<{ field: Field; typedValue: string }>('mento/typeInput')
export const setRecipient = createAction<{ recipient: string | null }>('mento/setRecipient')
