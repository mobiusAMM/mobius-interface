import { invariant } from '@apollo/client/utilities/globals'
import { Connection } from '@celo/connect'
import { ContractKit } from '@celo/contractkit'
import { JSBI, Percent, TokenAmount } from '@ubeswap/sdk'
import { IMentoExchange } from 'constants/mento'
import { CELO } from 'constants/tokens'
import { Exchange } from 'generated'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useBlockNumber } from 'state/application/hooks'
import Web3 from 'web3'

import { CHAIN } from '../../constants'
import { MENTO_POOL_INFO } from '../../constants/StablePools'
import { useWeb3Context } from '../../hooks'
import { useMentoContract } from '../../hooks/useContract'
import { AppDispatch } from '../index'
import { updateMento } from './actions'
import { stableToToken } from './hooks'

export function UpdateMento(): null {
  const web3 = new Web3('https://forno.celo.org')
  const kit = new ContractKit(new Connection(web3))
  const { provider } = useWeb3Context()
  const blockNumber = useBlockNumber()
  const dispatch = useDispatch<AppDispatch>()
  const mentoPools = MENTO_POOL_INFO[CHAIN]
  const mentoContract = useMentoContract(mentoPools[0].contract)

  useEffect(() => {
    const updatePool = async (poolInfo: IMentoExchange, contract: Exchange | null) => {
      if (!contract) return
      try {
        const balances = (await contract.getBuyAndSellBuckets(false)).map((x) => JSBI.BigInt(x))
        invariant(balances.length === 2, 'mento balances')
        const swapFee = JSBI.BigInt(await contract.spread())
        dispatch(
          updateMento({
            mento: {
              ...poolInfo,
              fee: new Percent(swapFee),
              address: contract.address,
              stableReserve: new TokenAmount(stableToToken(poolInfo.stable), balances[0]),
              celoReserve: new TokenAmount(CELO[CHAIN], balances[1]),
            },
          })
        )
      } catch (error) {
        console.error(error)
      }
    }
    mentoPools.forEach(async (pool) => {
      const address = await kit.registry.addressFor(pool.contract)
      updatePool(pool, mentoContract?.attach(address) ?? null)
    })
  }, [blockNumber, provider, dispatch, kit.contracts, mentoContract, kit.registry, mentoPools])

  return null
}
