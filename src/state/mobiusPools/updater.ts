import { gql, useQuery } from '@apollo/client'
import { Interface } from '@ethersproject/abi'
import { TokenAmount } from '@ubeswap/sdk'
import { RECOMMENDED_AMP, RECOMMENDED_FEES, StablePools } from 'constants/pools'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useBlockNumber } from 'state/application/hooks'
import { useMultipleContractSingleData } from 'state/multicall/hooks'
import { BigIntToJSBI } from 'state/stablePools/updater'

import { CHAIN } from '../../constants'
import LP from '../../constants/abis/LPToken.json'
import SWAP from '../../constants/abis/Swap.json'
import { AppDispatch } from '../index'
import { updatePools } from './actions'

const lpInterface = new Interface(LP.abi)
const SwapInterface = new Interface(SWAP.abi)

export function UpdateMento() {
  const blockNumber = useBlockNumber()
  const dispatch = useDispatch<AppDispatch>()
  const stablePools = StablePools[CHAIN]
  const lpTokenAddress = stablePools.map((p) => p.pool.lpToken.address)
  const poolAddress = stablePools.map((p) => p.pool.address)
  const lpTotalSupply = useMultipleContractSingleData(lpTokenAddress, lpInterface, 'totalSupply')
  const balances = useMultipleContractSingleData(poolAddress, SwapInterface, 'getBalances')

  const query = gql`
    {
      swaps {
        id
        A
        balances
        virtualPrice
        dailyVolumes(orderBy: timestamp, orderDirection: desc) {
          volume
        }
        weeklyVolumes(first: 2, orderBy: timestamp, orderDirection: desc) {
          volume
        }
      }
    }
  `
  const { data, loading, error } = useQuery(query)

  useEffect(() => {
    if (loading) return
    const inSubgraph: Set<string> =
      data?.swaps.reduce((accum: Set<string>, cur: any) => new Set([...accum, cur.id]), new Set()) ?? new Set()
    try {
      dispatch(
        updatePools({
          pools: stablePools.map((displayPool, i) => {
            return {
              ...displayPool.pool,
              fees: RECOMMENDED_FEES,
              volume: null,
              ampFactor: RECOMMENDED_AMP,
              lpTotalSupply: new TokenAmount(displayPool.pool.lpToken, lpTotalSupply[i]?.result?.[0] ?? '0'),
              reserves: balances?.[i]?.result?.[0]
                ? balances?.[i]?.result?.[0].map(
                    (amt: BigInt, j: number): TokenAmount =>
                      new TokenAmount(displayPool.pool.tokens[j], BigIntToJSBI(amt))
                  )
                : [new TokenAmount(displayPool.pool.tokens[0], '0'), new TokenAmount(displayPool.pool.tokens[1], '0')],
            }
          }),
        })
      )
    } catch (error) {
      console.error(error)
    }
  }, [loading, data?.swaps, dispatch, stablePools, lpTotalSupply, blockNumber, balances])
  return null
}
