import { ApolloClient, gql, InMemoryCache, useQuery } from '@apollo/client'
import axios from 'axios'
import { useWeb3Context } from 'hooks'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

import { CHAIN } from '../../constants'
import useDebounce from '../../hooks/useDebounce'
import useIsWindowVisible from '../../hooks/useIsWindowVisible'
import { addPrices, btcEthPrice, updateBlockNumber } from './actions'

const fetchEthBtcPrices = async (dispatch: any) => {
  const resp = await axios.get(
    'https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=0x2260fac5e5542a773aa44fbcfedf7c193bc2c599%2C0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2&vs_currencies=usd'
  )
  const btcPrice: string = resp.data['0x2260fac5e5542a773aa44fbcfedf7c193bc2c599']?.['usd']
  const ethPrice: string = resp.data['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2']?.['usd']
  dispatch(btcEthPrice({ btcPrice: parseInt(btcPrice).toFixed(0), ethPrice: parseInt(ethPrice).toFixed(0) }))
}
// 0x17700282592d6917f6a73d0bf8accf4d578c131e

const ubeswapClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/ubeswap/ubeswap',
  cache: new InMemoryCache(),
})
const priceQuery = gql`
  {
    tokens(where: { derivedCUSD_gt: "0" }) {
      id
      derivedCUSD
    }
  }
`

export function PriceData(): null {
  const dispatch = useDispatch()
  const { data, loading, error } = useQuery(priceQuery, { client: ubeswapClient })
  useEffect(() => {
    if (!loading && !error && data) {
      const prices: { [address: string]: string } = data.tokens.reduce((accum, cur) => {
        return { ...accum, [cur.id.toLowerCase()]: cur.derivedCUSD }
      }, {})
      dispatch(addPrices({ prices }))
    }
  }, [data, loading, dispatch, error])
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
  fetchEthBtcPrices(dispatch)

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
