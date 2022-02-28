import { ChainId } from 'lib/token-utils'

import { CELO } from './tokens'

export const ExternalRewardsToken = CELO

export const ExternalStakingRewards: { [K in ChainId]: string } = {
  [ChainId.Mainnet]: '0x0812f6de916667C5aa820E757704c4ac69159529',
  [ChainId.Alfajores]: '',
  [ChainId.Baklava]: '',
}

export const MOBIUS_MINTER_ADDRESS: { [K in ChainId]: string } = {
  [ChainId.Mainnet]: '0x5F0200CA03196D5b817E2044a0Bb0D837e0A7823',
  [ChainId.Alfajores]: '0x5c212FA1cf8b1143f2142C26161e65404034c01f',
  [ChainId.Baklava]: '',
}

export const GAUGE_CONTROLLER: { [K in ChainId]: string } = {
  [ChainId.Mainnet]: '0x7530E03056D3a8eD0323e61091ea2f17a1aC5C25',
  [ChainId.Alfajores]: '0x00063Fbe0c90834EE90C6191d0D9F04eaB01A14f',
  [ChainId.Baklava]: '',
}

export const GAUGE_PROXY: { [K in ChainId]: string } = {
  [ChainId.Mainnet]: '0x0a3Ac12422C95F84b5bD18A6d9904d132a161C68',
  [ChainId.Alfajores]: '',
  [ChainId.Baklava]: '',
}
