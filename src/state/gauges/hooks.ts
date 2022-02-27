import { IGauge } from 'constants/pools'
import { useSelector } from 'react-redux'

import { AppState } from '..'
import { IGaugeInfo, IUserGaugeInfo } from './reducer'

export function useGauges(): readonly ((IUserGaugeInfo & IGaugeInfo & IGauge) | null)[] {
  return useSelector<AppState, ((IUserGaugeInfo & IGaugeInfo & IGauge) | null)[]>((state) => state.gauges.gauges)
}
