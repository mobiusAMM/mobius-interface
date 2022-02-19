import { useWeb3Context } from 'hooks'
import { useEffect, useMemo } from 'react'

import { CHAIN } from '../../constants'
import { useBlockNumber } from '../application/hooks'
import { useAppDispatch, useAppSelector } from '../hooks'
import { fetchedLogs, fetchedLogsError, fetchingLogs } from './slice'
import { EventFilter, keyToFilter } from './utils'

export default function Updater(): null {
  const dispatch = useAppDispatch()
  const state = useAppSelector((state) => state.logs)
  const { provider } = useWeb3Context()

  const blockNumber = useBlockNumber()

  const filtersNeedFetch: EventFilter[] = useMemo(() => {
    if (typeof blockNumber !== 'number') return []

    const active = state[CHAIN]
    if (!active) return []

    return Object.keys(active)
      .filter((key) => {
        const { fetchingBlockNumber, results, listeners } = active[key]
        if (listeners === 0) return false
        if (typeof fetchingBlockNumber === 'number' && fetchingBlockNumber >= blockNumber) return false
        if (results && typeof results.blockNumber === 'number' && results.blockNumber >= blockNumber) return false
        return true
      })
      .map((key) => keyToFilter(key))
  }, [blockNumber, state])

  useEffect(() => {
    if (!provider || typeof blockNumber !== 'number' || filtersNeedFetch.length === 0) return

    dispatch(fetchingLogs({ chainId: CHAIN, filters: filtersNeedFetch, blockNumber }))
    filtersNeedFetch.forEach((filter) => {
      provider
        .getLogs({
          ...filter,
          fromBlock: 0,
          toBlock: blockNumber,
        })
        .then((logs) => {
          dispatch(
            fetchedLogs({
              chainId: CHAIN,
              filter,
              results: { logs, blockNumber },
            })
          )
        })
        .catch((error) => {
          console.error('Failed to get logs', filter, error)
          dispatch(
            fetchedLogsError({
              chainId: CHAIN,
              filter,
              blockNumber,
            })
          )
        })
    })
  }, [blockNumber, dispatch, filtersNeedFetch, provider])

  return null
}
