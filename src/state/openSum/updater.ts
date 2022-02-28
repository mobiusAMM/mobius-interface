import { Interface } from '@ethersproject/abi'
import { ConstantSum, ConstantSumInfo } from 'constants/ConstantSum'
import JSBI from 'jsbi'
import { useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { useMultipleContractSingleData } from 'state/multicall/hooks'

import { CHAIN } from '../../constants'
import CONSTANT_SUM from '../../constants/abis/ConstantSum.json'
import { AppDispatch } from '../index'
import { updateBalances } from './actions'

export const BigIntToJSBI = (num: BigInt | undefined, fallBack = '0') => {
  return JSBI.BigInt(num?.toString() ?? fallBack)
}

const ConstantSumInterface = new Interface(CONSTANT_SUM.abi)
const ZERO = JSBI.BigInt('0')

export function UpdateOpenSum(): null {
  const dispatch = useDispatch<AppDispatch>()
  const pools: ConstantSumInfo[] = ConstantSum[CHAIN] ?? []

  const balancesMany = useMultipleContractSingleData(
    pools.map(({ address }) => address),
    ConstantSumInterface,
    'getBalances'
  )

  useMemo(() => {
    const balances = balancesMany?.map(
      ({ result }) => result?.[0].map((n) => BigIntToJSBI(n as BigInt, '0')) ?? [ZERO, ZERO]
    )
    dispatch(updateBalances({ balances }))
  }, [dispatch, balancesMany])

  return null
}
