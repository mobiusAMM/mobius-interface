import { Interface } from '@ethersproject/abi'
import { JSBI, Percent } from '@ubeswap/sdk'
import { IGauge, StablePools } from 'constants/pools'
import { useWeb3Context } from 'hooks'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from 'state'
import { useBlockNumber } from 'state/application/hooks'
import { useMultipleContractSingleData, useSingleContractMultipleData } from 'state/multicall/hooks'

import { CHAIN } from '../../constants'
import GAUGE_V3 from '../../constants/abis/LiquidityGaugeV3.json'
import { useGaugeControllerContract, useMobiContract } from '../../hooks/useContract'
import { updateGauges, updateGaugesUser } from './actions'

const gaugeInterface = new Interface(GAUGE_V3.abi)

export function GaugeUpdater() {
  const { address, connected } = useWeb3Context()
  const blockNumber = useBlockNumber()
  const dispatch = useDispatch<AppDispatch>()
  const gauges: (IGauge | null)[] = StablePools[CHAIN].map((display) => display.gauge)
  const gaugeAddresses = gauges.map((g) => g?.address)
  const gaugeController = useGaugeControllerContract()
  const mobiContract = useMobiContract()

  const totalSupply = useMultipleContractSingleData(gaugeAddresses, gaugeInterface, 'totalSupply')
  const workingSupply = useMultipleContractSingleData(gaugeAddresses, gaugeInterface, 'working_supply')
  const totalEffectiveBalances = useMultipleContractSingleData(gaugeAddresses, gaugeInterface, 'working_supply')
  const weights = useSingleContractMultipleData(
    gaugeController,
    'gauge_relative_weight(address)',
    gaugeAddresses.map((a) => [a])
  )
  const futureWeights = useSingleContractMultipleData(
    gaugeController,
    'get_gauge_weight',
    gaugeAddresses.map((a) => [a])
  )
  const lastClaims = useMultipleContractSingleData(gaugeAddresses, gaugeInterface, 'last_claim')
  const isKilled = useMultipleContractSingleData(gaugeAddresses, gaugeInterface, 'is_killed')

  const balance = useMultipleContractSingleData(gaugeAddresses, gaugeInterface, 'balanceOf', [
    connected ? address : undefined,
  ])
  const claimableMobi = useMultipleContractSingleData(gaugeAddresses, gaugeInterface, 'claimable_tokens', [
    connected ? address : undefined,
  ])
  const effectiveBalances = useMultipleContractSingleData(gaugeAddresses, gaugeInterface, 'working_balances', [
    connected ? address : undefined,
  ])
  const lastVote = useSingleContractMultipleData(
    gaugeController,
    'last_user_vote',
    gaugeAddresses.map((a) => [connected ? address : a, a])
  )
  // vote_user_slopes
  const slopes = useSingleContractMultipleData(
    gaugeController,
    'vote_user_slopes',
    gaugeAddresses.map((a) => [connected ? address : a, a])
  )

  console.log('returl', lastVote[0].result?.[0].toString())

  useEffect(() => {
    connected &&
      dispatch(
        updateGaugesUser({
          userGaugeState: StablePools[CHAIN].map((displayPool, i) => {
            return displayPool === null
              ? null
              : {
                  balance: JSBI.BigInt(balance[i].result?.[0]),
                  claimableMobi: JSBI.BigInt(claimableMobi[i].result?.[0]),
                  lastVote: parseInt((lastVote?.[i]?.result?.[0] ?? BigInt('0')).toString() ?? '0'),
                  powerAllocated: parseInt((slopes?.[i]?.result?.[1] ?? BigInt('0')).toString() ?? '0'),
                }
          }),
        })
      )
    dispatch(
      updateGauges({
        gaugeState: StablePools[CHAIN].map((display, i) => {
          return display === null
            ? null
            : {
                isKilled: isKilled[0].result?.[0] === false,
                lastClaim: new Date(),
                weight: new Percent('0'),
                futureWeight: new Percent('0'),
                totalSupply: JSBI.BigInt(0),
                workingSupply: JSBI.BigInt(0),
              }
        }),
      })
    )
  }, [connected, dispatch, blockNumber, balance, claimableMobi, lastVote, slopes])

  return null
}
