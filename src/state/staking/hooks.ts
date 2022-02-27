import { JSBI, Percent, Token, TokenAmount } from '@ubeswap/sdk'
import { ExternalRewardsToken } from 'constants/staking'
import { useMobi, useVeMobi } from 'hooks/Tokens'
import { useSelector } from 'react-redux'
import { AppState } from 'state'
import { getPoolInfo } from 'state/stablePools/hooks'
import { StableSwapPool } from 'state/stablePools/reducer'
import { getDepositValues } from 'utils/stableSwaps'

import { CHAIN } from '../../constants'
import { IStakingState, IUserStakingState } from './reducer'

export function useStakingState(): IStakingState {
  return useSelector<AppState, IStakingState>((state) => state.staking)
}

export function useUserStakingState(): IUserStakingState {
  return useSelector<AppState, IUserStakingState>((state) => state.staking)
}

export function useStakingStateCombined(): IStakingState & IUserStakingState {
  return useSelector<AppState, IStakingState & IUserStakingState>((state) => state.staking)
}

export type FeeInfo = {
  toClaim: TokenAmount
  totalFeesThisWeek: TokenAmount
  totalFeesNextWeek: TokenAmount
}

export function useFeeInformation(): FeeInfo {
  const { claimable, total, nextWeek } = useSelector((state: AppState) => ({
    claimable: state.staking.claimableFees,
    total: state.staking.feesThisWeek,
    nextWeek: state.staking.feesNextWeek,
  }))
  const mobi = useMobi()

  return {
    toClaim: new TokenAmount(mobi, claimable ?? '0'),
    totalFeesThisWeek: new TokenAmount(mobi, total ?? '0'),
    totalFeesNextWeek: new TokenAmount(mobi, nextWeek ?? '0'),
  }
}

export type StakingInfo = {
  totalWeight: JSBI
  totalMobiLocked: TokenAmount
  totalVotingPower: TokenAmount
  externalRewardRate: TokenAmount
  feesThisWeek: JSBI
  feesNextWeek: JSBI
  mobiRate: TokenAmount
}

export function useStakingInfo(): StakingInfo {
  const stakingState = useStakingState()

  const mobi = useMobi()
  const veMobi = useVeMobi()

  return {
    totalWeight: stakingState.totalWeight,
    totalMobiLocked: new TokenAmount(mobi, stakingState.totalMobiLocked),
    totalVotingPower: new TokenAmount(veMobi, stakingState.totalVotingPower),
    externalRewardRate: new TokenAmount(ExternalRewardsToken[CHAIN], stakingState.externalRewardsRate),
    feesThisWeek: stakingState.feesThisWeek,
    feesNextWeek: stakingState.feesNextWeek,
    mobiRate: new TokenAmount(mobi, stakingState.mobiRate),
  }
}

export type VoteLockInfo = {
  locked: TokenAmount
  end: number // UNIX time stamp
}

export type UserStakingInfo = {
  voteUserPower: number
  votingPower: TokenAmount
  claimableExternalRewards: TokenAmount
  claimableFees: TokenAmount
  lock: VoteLockInfo | null
}

export function useUserStakingInfo(): UserStakingInfo {
  const userStakingState = useUserStakingState()

  const mobi = useMobi()
  const veMobi = useVeMobi()

  return {
    voteUserPower: parseInt(userStakingState.voteUserPower.toString()),
    votingPower: new TokenAmount(veMobi, userStakingState.votingPower),
    claimableExternalRewards: new TokenAmount(ExternalRewardsToken[CHAIN], userStakingState.claimableExternalRewards),
    claimableFees: new TokenAmount(mobi, userStakingState.claimableFees),
    lock:
      userStakingState.lock === null
        ? null
        : {
            locked: new TokenAmount(mobi, userStakingState.lock?.amount),
            end: userStakingState.lock.end,
          },
  }
}

export type GaugeSummary = {
  pool: string
  poolAddress: string
  address: string
  baseBalance: TokenAmount
  totalStaked: TokenAmount
  unclaimedMobi: TokenAmount
  firstToken: Token
  currentWeight: Percent
  workingBalance: TokenAmount
  totalWorkingBalance: TokenAmount
  workingPercentage: Percent
  actualPercentage: Percent
  lastVote: Date
  futureWeight: Percent
  powerAllocated: number
}

// export function calculateBoostedBalance(
//   votingPower: JSBI,
//   totalVotingPower: JSBI,
//   liquidity: JSBI,
//   totalLiquidity: JSBI
// ): JSBI {
//   let boosted = JSBI.BigInt('0')
//   if (!JSBI.equal(totalVotingPower, JSBI.BigInt('0')))
//     boosted = JSBI.add(
//       JSBI.divide(JSBI.multiply(JSBI.BigInt(4), liquidity), JSBI.BigInt(10)),
//       JSBI.divide(
//         JSBI.multiply(JSBI.BigInt(6), JSBI.multiply(totalLiquidity, votingPower)),
//         JSBI.multiply(totalVotingPower, JSBI.BigInt(10))
//       )
//     )
//   return JSBI.greaterThan(boosted, liquidity) ? boosted : liquidity
// }

// TODO: fix this hook

export function usePriceOfDeposits() {
  const pools = useSelector<AppState, StableSwapPool[]>((state) => {
    const allPools = state.stablePools.pools
    return Object.values(allPools)
      .map(({ pool }) => pool)
      .filter((pool) => pool.userStaked && JSBI.greaterThan(pool.userStaked, JSBI.BigInt('0')))
  })
  const prices = useSelector((state: AppState) => ({
    ethPrice: state.application.ethPrice,
    btcPrice: state.application.btcPrice,
  }))
  const dummyToken = useMobi()
  return !pools[0] || pools[0].loadingGauge
    ? undefined
    : new TokenAmount(
        dummyToken,
        pools.reduce((accum, pool) => {
          const address = pool.address
          const { valueOfStaked } = getDepositValues(getPoolInfo(pool))
          const price =
            address === '0x19260b9b573569dDB105780176547875fE9fedA3'
              ? JSBI.BigInt(prices.btcPrice)
              : address === '0xE0F2cc70E52f05eDb383313393d88Df2937DA55a'
              ? JSBI.BigInt(prices.ethPrice)
              : JSBI.BigInt('1')
          return JSBI.add(accum, JSBI.multiply(valueOfStaked.raw, price))
        }, JSBI.BigInt('0'))
      )
}

export function useVotePowerLeft(): number {
  const votePower = useSelector<AppState, JSBI>((state) => state.staking.voteUserPower)
  return (10000 - parseInt(votePower.toString())) / 100
}
