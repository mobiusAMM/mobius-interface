import { createReducer } from '@reduxjs/toolkit'
import { JSBI } from '@ubeswap/sdk'

import { update } from './actions'

export type Claim = {
  allocatedAmount: JSBI
  claimedAmount: JSBI
  unclaimedAmount: JSBI
}

export enum VestType {
  LP,
  FOUNDER,
  INVESTOR,
  ADVISOR,
}

export type ClaimState = { [type in VestType]: Claim }

const initialState: ClaimState = {
  [VestType.LP]: {
    allocatedAmount: JSBI.BigInt(0),
    claimedAmount: JSBI.BigInt(0),
    unclaimedAmount: JSBI.BigInt(0),
  },
  [VestType.FOUNDER]: {
    allocatedAmount: JSBI.BigInt(0),
    claimedAmount: JSBI.BigInt(0),
    unclaimedAmount: JSBI.BigInt(0),
  },
  [VestType.INVESTOR]: {
    allocatedAmount: JSBI.BigInt(0),
    claimedAmount: JSBI.BigInt(0),
    unclaimedAmount: JSBI.BigInt(0),
  },
  [VestType.ADVISOR]: {
    allocatedAmount: JSBI.BigInt(0),
    claimedAmount: JSBI.BigInt(0),
    unclaimedAmount: JSBI.BigInt(0),
  },
}

export default createReducer<ClaimState>(initialState, (builder) =>
  builder.addCase(update, (state, { payload: { type, claim } }) => {
    return {
      ...state,
      [type]: claim,
    }
  })
)
