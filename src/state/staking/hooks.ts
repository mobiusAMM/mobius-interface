import { Fraction, JSBI, Percent, Token, TokenAmount } from '@ubeswap/sdk'
import { calcApy } from 'components/earn/StablePoolCard'
import { useMobi, useToken, useVeMobi } from 'hooks/Tokens'
import { useSelector } from 'react-redux'
import { AppState } from 'state'
import { useTokenPrice } from 'state/application/hooks'
import { getPoolInfo } from 'state/stablePools/hooks'
import { StableSwapPool } from 'state/stablePools/reducer'
import { getDepositValues } from 'utils/stableSwaps'

import { StakingState } from './reducer'

const SECONDS_IN_YEAR = JSBI.BigInt(365 * 24 * 60 * 60)
const SECONDS_IN_WEEK = JSBI.BigInt(7 * 24 * 60 * 60)
const ONE_FRACTION = new Fraction('1', '1')

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

export type MobiStakingInfo = {
  votingPower: TokenAmount
  totalVotingPower: TokenAmount
  mobiLocked?: TokenAmount
  lockEnd?: Date
  positions?: GaugeSummary[]
}

export type FeeInfo = {
  toClaim?: TokenAmount
  totalFeesThisWeek?: TokenAmount
}

export type SNXRewardInfo = {
  snxAddress: string
  rewardToken: Token
  rewardRate?: TokenAmount
  leftToClaim?: TokenAmount
  avgApr?: Percent
  userRewardRate?: TokenAmount
}
export function calculateBoostedBalance(
  votingPower: JSBI,
  totalVotingPower: JSBI,
  liquidity: JSBI,
  totalLiquidity: JSBI
): JSBI {
  let boosted = JSBI.BigInt('0')
  if (!JSBI.equal(totalVotingPower, JSBI.BigInt('0')))
    boosted = JSBI.add(
      JSBI.divide(JSBI.multiply(JSBI.BigInt(4), liquidity), JSBI.BigInt(10)),
      JSBI.divide(
        JSBI.multiply(JSBI.BigInt(6), JSBI.multiply(totalLiquidity, votingPower)),
        JSBI.multiply(totalVotingPower, JSBI.BigInt(10))
      )
    )
  return JSBI.greaterThan(boosted, liquidity) ? boosted : liquidity
}

export function useMobiStakingInfo(): MobiStakingInfo {
  const stakingInfo = useSelector<AppState, StakingState>((state) => state.staking)
  const pools = useSelector<AppState, StableSwapPool[]>((state) => {
    const allPools = state.stablePools.pools
    return Object.values(allPools).map(({ pool }) => pool)
  })
  const veMobi = useVeMobi()
  const mobi = useMobi()
  const baseInfo: MobiStakingInfo = {
    votingPower: new TokenAmount(veMobi, stakingInfo.votingPower),
    totalVotingPower: new TokenAmount(veMobi, stakingInfo.totalVotingPower),
    mobiLocked: new TokenAmount(mobi, stakingInfo.locked?.amount ?? '0'),
    lockEnd: stakingInfo.locked ? new Date(stakingInfo.locked.end) : undefined,
  }
  if (pools && pools.length === 0) {
    return baseInfo
  }
  const positions = pools.map((pool) => ({
    pool: pool.name,
    poolAddress: pool.address,
    address: pool.gaugeAddress ?? '',
    baseBalance: new TokenAmount(pool.lpToken, pool.userStaked ?? '0'),
    totalStaked: new TokenAmount(pool.lpToken, pool.totalStakedAmount ?? '0'),
    unclaimedMobi: new TokenAmount(mobi, pool.pendingMobi ?? '0'),
    firstToken: pool.tokens[0],
    currentWeight: pool.poolWeight,
    futureWeight: new Percent(
      pool.futureWeight,
      JSBI.divide(stakingInfo.totalWeight, JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18)))
    ),
    workingBalance: new TokenAmount(pool.lpToken, pool.effectiveBalance),
    totalWorkingBalance: new TokenAmount(pool.lpToken, pool.totalEffectiveBalance),
    workingPercentage: new Percent(pool.effectiveBalance, pool.totalEffectiveBalance),
    actualPercentage: new Percent(pool.userStaked ?? '0', pool.totalStakedAmount ?? '1'),
    lastVote: new Date(pool.lastUserVote * 1000),
    powerAllocated: pool.powerAllocated,
  }))
  return {
    ...baseInfo,
    positions,
  }
}

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

export function useLockEnd(): number {
  const lockEnd = useSelector<AppState, number>((state) => state.staking?.locked?.end ?? 0)
  return lockEnd
}

export function useVotePowerLeft(): number {
  const votePower = useSelector<AppState, JSBI>((state) => state.staking.voteUserPower)
  return (10000 - parseInt(votePower.toString())) / 100
}

export function useSNXRewardInfo(): SNXRewardInfo {
  const stakingInfo = useSelector<AppState, StakingState>((state) => state.staking)
  const snxInfo = stakingInfo.snx
  const mobi = useMobi()

  const rewardToken = useToken(false, snxInfo?.rewardToken ?? '')
  const priceOfReward = useTokenPrice(snxInfo?.rewardToken)
  const priceOfMobi = useTokenPrice(mobi?.address)
  if (!snxInfo || !snxInfo.tokenRate) return { snxAddress: snxInfo?.address, rewardToken }
  const yearlyRate = JSBI.multiply(snxInfo.tokenRate, SECONDS_IN_YEAR)
  const apy =
    priceOfReward && priceOfMobi
      ? calcApy(priceOfReward?.multiply(yearlyRate), priceOfMobi?.multiply(stakingInfo.totalVotingPower))[1]
      : undefined
  const rewardRate = new TokenAmount(rewardToken, JSBI.multiply(snxInfo.tokenRate, SECONDS_IN_WEEK))
  const userRateJSBI = JSBI.divide(JSBI.multiply(rewardRate.raw, stakingInfo.votingPower), stakingInfo.totalVotingPower)
  //rewardRate.multiply(stakingInfo.votingPower).divide(stakingInfo.totalVotingPower)
  const userRewardRate = new TokenAmount(rewardToken, userRateJSBI)

  return {
    snxAddress: snxInfo.address,
    rewardToken,
    rewardRate,
    leftToClaim: snxInfo.leftToClaim ? new TokenAmount(rewardToken, snxInfo.leftToClaim) : undefined,
    avgApr: apy,
    userRewardRate,
  }
}

export function useFeeInformation(): FeeInfo {
  const { claimable, total } = useSelector((state: AppState) => ({
    claimable: state.staking.claimableFees,
    total: state.staking.feesThisWeek,
  }))
  const mobi = useMobi()

  return {
    toClaim: claimable ? new TokenAmount(mobi, claimable) : undefined,
    totalFeesThisWeek: total ? new TokenAmount(mobi, total) : undefined,
  }
}
