import { StablePools } from 'constants/pools'

import { CHAIN } from '../constants'

export const useStablePools = () => {
  return StablePools[CHAIN]
}
