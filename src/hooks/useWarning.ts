import { WarningType } from 'constants/pools'

import WARNINGS from '../constants/PoolWarnings.json'

export type WarningModifications = 'require-equal-deposit' | 'none'

export function useWarning(
  warning: WarningType | undefined
): { warning: string; link?: string; modification?: WarningModifications } | undefined {
  if (!warning) return undefined
  return WARNINGS[warning] as any as { warning: string; link?: string; modification?: WarningModifications }
}
