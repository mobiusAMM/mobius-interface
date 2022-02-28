import { gql, useQuery } from '@apollo/client'
import axios from 'axios'
import { StablePools } from 'constants/pools'
import { useWeb3Context } from 'hooks'
import { useMobi } from 'hooks/Tokens'
import { Dispatch, useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

import { CHAIN } from '../../constants'
import useDebounce from '../../hooks/useDebounce'
import useIsWindowVisible from '../../hooks/useIsWindowVisible'
import { addPrice, addPrices, updateBlockNumber } from './actions'
import { useUbeswapClient } from './hooks'
import { TokenPrices } from './reducer'

const dedupe = (strings: string[]): string[] => {
  const seen = new Set<string>()
  return strings.filter((str) => {
    if (seen.has(str)) {
      return false
    } else {
      seen.add(str)
      return true
    }
  })
}

const fetchPegPrices = async (dispatch: Dispatch<any>) => {
  const pegQueries = dedupe(StablePools[CHAIN].map(({ peg }) => peg.priceQuery).filter((s) => s !== null) as string[])
  const ids = pegQueries.reduce((acc, cur) => acc.concat(cur).concat('%2'), '')
  const resp = await axios.get(
    `https://api.coingecko.com/api/v3/simple/price?ids=${ids.slice(0, -2)}&vs_currencies=usd`
  )

  const prices: TokenPrices = pegQueries.reduce((acc, cur) => {
    console.log(resp.data[cur]?.['usd'])
    return { ...acc, [cur]: resp.data[cur]?.['usd'] }
  }, {})
  dispatch(addPrices({ prices: prices }))
}

const mobiPriceQuery = gql`
  {
    token(id: "0x73a210637f6f6b7005512677ba6b3c96bb4aa44b") {
      id
      derivedCUSD
    }
  }
`

export function PriceData(): null {
  const dispatch = useDispatch()
  const ubeswapClient = useUbeswapClient()
  const mobi = useMobi()
  const { data, loading, error } = useQuery(mobiPriceQuery, { client: ubeswapClient })
  useEffect(() => {
    if (!loading && !error && data) {
      console.log('update prices')
      fetchPegPrices(dispatch)
      dispatch(addPrice({ token: mobi.address.toLowerCase(), price: data.token.derivedCUSD }))
    }
  }, [data, loading, dispatch, error, mobi.address])
  return null
}

export default function Updater(): null {
  const { provider } = useWeb3Context()

  const dispatch = useDispatch()
  const windowVisible = useIsWindowVisible()
  const [state, setState] = useState<{ chainId: number | undefined; blockNumber: number | null }>({
    chainId: CHAIN,
    blockNumber: null,
  })

  const blockNumberCallback = useCallback(
    (blockNumber: number) => {
      setState((state) => {
        if (CHAIN === state.chainId) {
          if (typeof state.blockNumber !== 'number') return { chainId: CHAIN, blockNumber }
          return { chainId: CHAIN, blockNumber: Math.max(blockNumber, state.blockNumber) }
        }
        return state
      })
    },
    [setState]
  )

  // attach/detach listeners
  useEffect(() => {
    if (!provider || !windowVisible) return undefined

    setState({ chainId: CHAIN, blockNumber: null })

    provider
      .getBlockNumber()
      .then(blockNumberCallback)
      .catch((error) => console.error(`Failed to get block number for chainId: ${CHAIN}`, error))

    provider.on('block', blockNumberCallback)
    return () => {
      provider.removeListener('block', blockNumberCallback)
    }
  }, [dispatch, provider, blockNumberCallback, windowVisible])

  const debouncedState = useDebounce(state, 100)

  useEffect(() => {
    if (!debouncedState.chainId || !debouncedState.blockNumber || !windowVisible) return
    dispatch(updateBlockNumber({ chainId: debouncedState.chainId, blockNumber: debouncedState.blockNumber }))
  }, [windowVisible, dispatch, debouncedState.blockNumber, debouncedState.chainId])

  return null
}
