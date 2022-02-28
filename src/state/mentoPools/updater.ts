import { invariant } from '@apollo/client/utilities/globals'
import { newKit } from '@celo/contractkit'
import { IMentoExchange } from 'constants/mento'
import { CELO } from 'constants/tokens'
import { Exchange } from 'generated'
import JSBI from 'jsbi'
import { Percent, TokenAmount } from 'lib/token-utils'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useBlockNumber } from 'state/application/hooks'

import { CHAIN, weiScale } from '../../constants'
import { MENTO_POOL_INFO } from '../../constants/mento'
import { useWeb3Context } from '../../hooks'
import { useMentoContract } from '../../hooks/useContract'
import { AppDispatch } from '../index'
import { updateMento } from './actions'
import { stableToToken } from './hooks'

export function UpdateMento() {
  const kit = newKit('https://forno.celo.org')
  const { provider } = useWeb3Context()
  const blockNumber = useBlockNumber()
  const dispatch = useDispatch<AppDispatch>()
  const mentoPools = MENTO_POOL_INFO[CHAIN]
  const mentoContract = useMentoContract('0x12364a15F52b822F12dd858FAeEdC49F472fbA57')

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
              fee: new Percent(swapFee, JSBI.multiply(weiScale, JSBI.BigInt('10000'))),
              address: contract.address,
              celoReserve: new TokenAmount(CELO[CHAIN], balances[0]),
              stableReserve: new TokenAmount(stableToToken(poolInfo.stable), balances[1]),
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
