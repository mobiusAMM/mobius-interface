import { ChainId } from 'lib/token-utils'

import { CELO } from './tokens'

export const ExternalRewardsToken = CELO

export const ExternalStakingRewards: { [K in ChainId]: string } = {
  [ChainId.MAINNET]: '0x0812f6de916667C5aa820E757704c4ac69159529',
  [ChainId.ALFAJORES]: '',
  [ChainId.BAKLAVA]: '',
}
