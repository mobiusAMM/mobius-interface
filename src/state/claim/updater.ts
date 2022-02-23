import { JSBI } from '@ubeswap/sdk'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { CHAIN } from '../../constants'
import { VestingAddresses } from '../../constants/StablePools'
import { VestingEscrow } from '../../generated'
import { useWeb3Context } from '../../hooks'
import { useVestingContract } from '../../hooks/useContract'
import useCurrentBlockTimestamp from '../../hooks/useCurrentBlockTimestamp'
import { AppDispatch } from '../index'
import { update } from './actions'
import { VestType } from './reducer'

export default function UpdateClaim(): null {
  const { address, connected, provider } = useWeb3Context()
  const blockNumber = useCurrentBlockTimestamp()
  const dispatch = useDispatch<AppDispatch>()
  const claimContract = useVestingContract()

  // automatically update lists if versions are minor/patch
  useEffect(() => {
    const updateClaim = async (vesting: VestingEscrow | undefined, type: VestType) => {
      if (!vesting || !connected) return
      const initialLocked = JSBI.BigInt(await vesting?.['initial_locked'](address))
      const unclaimed = JSBI.BigInt(await vesting?.['balanceOf'](address))
      const claimed = JSBI.subtract(
        JSBI.subtract(initialLocked, JSBI.BigInt(await vesting?.['lockedOf'](address))),
        unclaimed
      )
      dispatch(
        update({
          type,
          claim: {
            allocatedAmount: initialLocked,
            claimedAmount: claimed,
            unclaimedAmount: unclaimed,
          },
        })
      )
    }
    Object.entries(VestingAddresses).forEach(([type, addresses]) => {
      const vestingContract = claimContract?.attach(addresses[CHAIN])
      updateClaim(vestingContract, parseInt(type))
    })
  }, [provider, blockNumber, claimContract, dispatch, connected, address])

  return null
}
