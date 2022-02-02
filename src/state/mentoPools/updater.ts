import { Connection } from '@celo/connect'
import { CeloContract, ContractKit, StableToken } from '@celo/contractkit'
import { JSBI } from '@ubeswap/sdk'
import { Exchange } from 'generated'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useBlockNumber } from 'state/application/hooks'
import Web3 from 'web3'

import { CHAIN } from '../../constants'
import { MENTO_POOL_INFO } from '../../constants/StablePools'
import { useWeb3Context } from '../../hooks'
import { UseMentoContract } from '../../hooks/useContract'
import { AppDispatch } from '../index'
import { initPool } from './actions'
import { MentoConstants } from './reducer'

export function UpdateMento(): null {
  const web3 = new Web3('https://forno.celo.org')
  const kit = new ContractKit(new Connection(web3))
  const { provider } = useWeb3Context()
  const blockNumber = useBlockNumber()
  const dispatch = useDispatch<AppDispatch>()
  const pools: MentoConstants[] = MENTO_POOL_INFO[CHAIN]
  const mentoContract = UseMentoContract('0x12364a15F52b822F12dd858FAeEdC49F472fbA57')

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
      } else {
        address = await kit.registry.addressFor(CeloContract.ExchangeEUR)
      }
      updatePool(pool, mentoContract?.attach(address))
    })
  }, [blockNumber, provider, dispatch, pools, kit.contracts, mentoContract, kit.registry])

  return null
}
