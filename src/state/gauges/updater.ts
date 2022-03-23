import { Interface } from '@ethersproject/abi'
import { IGauge, StablePools } from 'constants/pools'
import { useWeb3Context } from 'hooks'
import { useDispatch } from 'react-redux'
import { AppDispatch } from 'state'
import { useBlockNumber } from 'state/application/hooks'
import { useMultipleContractSingleData, useSingleContractMultipleData } from 'state/multicall/hooks'

import { CHAIN } from '../../constants'
import GAUGE_V3 from '../../constants/abis/LiquidityGaugeV3.json'
import { useGaugeControllerContract } from '../../hooks/useContract'

const gaugeInterface = new Interface(GAUGE_V3.abi)

export function GaugeUpdater() {
  const { address, connected } = useWeb3Context()
  const blockNumber = useBlockNumber()
  const dispatch = useDispatch<AppDispatch>()
  const gauges: (IGauge | null)[] = StablePools[CHAIN].map((display) => display.gauge)
  const gaugeAddresses = gauges.map((g) => g?.address)
  const gaugeController = useGaugeControllerContract()

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

  // useEffect(() => {
  //   console.log('gauge update')
  //   connected &&
  //     dispatch(
  //       updateGaugesUser({
  //         userGaugeState: StablePools[CHAIN].map((displayPool, i) => {
  //           return displayPool.gauge === null
  //             ? null
  //             : {
  //                 balance: JSBI.BigInt(balance[i].result?.[0] ?? '0'),
  //                 claimableMobi: JSBI.BigInt(claimableMobi[i].result?.[0] ?? '0'),
  //                 lastVote: parseInt(lastVote[i].result?.[0].toString() ?? '0'),
  //                 powerAllocated: parseInt(slopes[i].result?.[1] ?? '0'),
  //                 effectiveBalance: JSBI.BigInt(effectiveBalances[i].result?.[0] ?? '0'),
  //               }
  //         }),
  //       })
  //     )
  //   dispatch(
  //     updateGauges({
  //       gaugeState: StablePools[CHAIN].map((display, i) => {
  //         return display.gauge === null
  //           ? null
  //           : {
  //               isKilled: isKilled[0].result?.[0] === true,
  //               lastClaim: parseInt(lastClaims?.[i]?.result?.[0].toString() ?? '0'),
  //               weight: JSBI.BigInt(weights[i].result?.[0] ?? 0),
  //               futureWeight: JSBI.BigInt(futureWeights[i].result?.[0] ?? 0),
  //               totalSupply: JSBI.BigInt(totalSupply[i].result?.[0] ?? 0),
  //               workingSupply: JSBI.BigInt(workingSupply[i].result?.[0] ?? 0),
  //               totalEffectiveBalance: JSBI.BigInt(totalEffectiveBalances[i].result?.[0] ?? 0),
  //             }
  //       }),
  //     })
  //   )
  // }, [
  //   connected,
  //   dispatch,
  //   blockNumber,
  //   balance,
  //   claimableMobi,
  //   lastVote,
  //   slopes,
  //   isKilled,
  //   lastClaims,
  //   totalSupply,
  //   workingSupply,
  //   weights,
  //   futureWeights,
  //   effectiveBalances,
  //   totalEffectiveBalances,
  // ])

  return null
}
