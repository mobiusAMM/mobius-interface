// To-Do: Implement Hooks to update Client-Side contract representation
import { useMobi } from 'hooks/Tokens'
import { TokenAmount } from 'lib/token-utils'
import { useSelector } from 'react-redux'

import { AppState } from '..'
import { Claim, VestType } from './reducer'

export interface ClaimInfo {
  readonly allocatedAmount: TokenAmount
  readonly claimedAmount: TokenAmount
  readonly unclaimedAmount: TokenAmount
}

export function useClaimInfo(type = VestType.LP): ClaimInfo {
  const claim = useSelector<AppState, Claim>((state) => state.claim[type])
  const mobi = useMobi()
  return {
    allocatedAmount: new TokenAmount(mobi, claim.allocatedAmount),
    claimedAmount: new TokenAmount(mobi, claim.claimedAmount),
    unclaimedAmount: new TokenAmount(mobi, claim.unclaimedAmount),
  }
}
