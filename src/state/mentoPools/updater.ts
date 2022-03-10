import { CeloContract, StableToken } from '@celo/contractkit'
import { JSBI } from '@ubeswap/sdk'
import { Exchange } from 'generated'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useBlockNumber } from 'state/application/hooks'

import { CHAIN } from '../../constants'
import { MENTO_POOL_INFO } from '../../constants/StablePools'
import { useWeb3Context } from '../../hooks'
import { useMentoContract } from '../../hooks/useContract'
import { AppDispatch } from '../index'
import { initPool } from './actions'
import { MentoConstants } from './reducer'

export function UpdateMento(): null {
  const { provider, kit } = useWeb3Context()
  const blockNumber = useBlockNumber()
  const dispatch = useDispatch<AppDispatch>()
  const pools: MentoConstants[] = MENTO_POOL_INFO[CHAIN]
  const mentoContract = useMentoContract('0x12364a15F52b822F12dd858FAeEdC49F472fbA57')

  useEffect(() => {
    const updatePool = async (poolInfo: MentoConstants, contract: Exchange | undefined) => {
      if (!contract) return
      try {
        const balances = (await contract.getBuyAndSellBuckets(false)).map((x) => JSBI.BigInt(x))
        const swapFee = JSBI.BigInt(await contract.spread())
        dispatch(
          initPool({
            address: contract.address,
            pool: {
              ...poolInfo,
              balances,
              address: contract.address,
              swapFee,
            },
          })
        )
      } catch (error) {
        console.error(error)
      }
    }
    pools.forEach(async (pool) => {
      let address: string
      if (pool.stable === StableToken.cUSD) {
        address = await kit.registry.addressFor(CeloContract.Exchange)
      } else if (pool.stable === StableToken.cEUR) {
        address = await kit.registry.addressFor(CeloContract.ExchangeEUR)
      } else {
        address = await kit.registry.addressFor(CeloContract.ExchangeBRL)
      }
      updatePool(pool, mentoContract?.attach(address))
    })
  }, [blockNumber, provider, dispatch, pools, kit.contracts, mentoContract, kit.registry])

  return null
}
