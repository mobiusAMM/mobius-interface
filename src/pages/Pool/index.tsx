import QuestionHelper from 'components/QuestionHelper'
import { RowFixed } from 'components/Row'
import { Chain, DisplayPool, IExchangeInfo, StablePools, Volume } from 'constants/pools'
import { useValueOfAllPools } from 'hooks/useStablePools'
import JSBI from 'jsbi'
import { TokenAmount } from 'lib/token-utils'
import React from 'react'
import { isMobile } from 'react-device-detect'
import { useMobiPrice } from 'state/application/hooks'
import { GaugeInfo, useAllGaugesInfo, useAllUserGaugesInfo, UserGaugeInfo } from 'state/gauges/hooks'
import { useAllLpBalances, usePools, usePoolsVolume } from 'state/mobiusPools/hooks'
import { useStakingInfo } from 'state/staking/hooks'
import styled from 'styled-components'

import { AutoColumn } from '../../components/Column'
import { StablePoolCard } from '../../components/earn/StablePoolCard'
import { CardNoise, CardSection, DataCard } from '../../components/earn/styled'
import { Row, RowBetween } from '../../components/Row'
import { InfoWrapper } from '../../components/swap/styleds'
import { CHAIN } from '../../constants'
import { Sel, TYPE } from '../../theme'

const PageWrapper = styled(AutoColumn)`
  max-width: 640px;
  width: 100%;
`

const VoteCard = styled(DataCard)`
  justify-self: center;
  background: radial-gradient(90% 90% at 50% 5%, #fbcc5c 0%, #fb7c6d 100%);
  width: 100%;
  max-width: 640px;
  overflow: hidden;
  margin-bottom: 4rem;
  align-items: center;
  justify-content: center;
  display: flex;
  position: relative;
`

const PoolSection = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  column-gap: 10px;
  row-gap: 15px;
  width: 100%;
  justify-self: center;
`

const HeaderLinks = styled(Row)`
  justify-self: center;
  background-color: ${({ theme }) => theme.bg1};
  width: fit-content;
  padding: 4px;
  border-radius: 16px;
  display: grid;
  grid-auto-flow: column;
  grid-gap: 10px;
  align-items: center;
`

enum SpecialChain {
  Other = 'other',
  All = 'all',
}

type SelectChain = SpecialChain | Chain

const OtherChains = new Set<Chain>([Chain.Avax, Chain.Polygon, Chain.Celo])

export type Meta = {
  display: DisplayPool
  userGauge: UserGaugeInfo | null
  gauge: GaugeInfo | null
  lpBalance: TokenAmount
  exchangeInfo: IExchangeInfo
  volume: Volume
}

export default function Pool() {
  const userGauges = useAllUserGaugesInfo()
  const gauges = useAllGaugesInfo()
  const stakingInfo = useStakingInfo()
  const exchanges = usePools()
  const lpBalances = useAllLpBalances()
  const volumes = usePoolsVolume()
  const meta: Meta[] = StablePools[CHAIN].map((el, i) => {
    return {
      display: el,
      userGauge: userGauges[i],
      gauge: gauges[i],
      lpBalance: lpBalances[i],
      exchangeInfo: exchanges[i],
      volume: volumes[i],
    }
  })

  const [selection, setSelection] = React.useState<SelectChain>(SpecialChain.All)
  const [showDeprecated, setShowDeprecated] = React.useState(false)

  const tvl = useValueOfAllPools()
  const mobiprice = useMobiPrice()

  const sortCallback = (pool1: Meta, pool2: Meta) => {
    const isStaking1 =
      pool1.lpBalance.greaterThan(0) || (pool1.userGauge && JSBI.greaterThan(pool1.userGauge.balance, JSBI.BigInt(0)))
    const isStaking2 =
      pool2.lpBalance.greaterThan(0) || (pool2.userGauge && JSBI.greaterThan(pool2.userGauge?.balance, JSBI.BigInt(0)))
    if (isStaking1 && !isStaking2) return 1
    return -1
  }

  const sortedFilterdPools = meta
    .sort(sortCallback)
    .filter(
      (pool) =>
        selection === SpecialChain.All ||
        selection === pool.display.chain ||
        (selection === SpecialChain.Other && OtherChains.has(pool.display.chain))
    )
  return (
    <PageWrapper gap="lg" justify="center" style={{ marginTop: isMobile ? '-1rem' : '3rem' }}>
      <AutoColumn gap="lg" style={{ width: '100%', maxWidth: '720px', justifyContent: 'center', alignItems: 'center' }}>
        <TYPE.tvlHeader>TVL: ${tvl.toFixed(0, { groupSeparator: ',' })}</TYPE.tvlHeader>
      </AutoColumn>
      <AutoColumn gap="lg" style={{ width: '100%', maxWidth: '720px', justifyContent: 'center', alignItems: 'center' }}>
        {mobiprice && <TYPE.price opacity={'.8'}>Latest MOBI Price: ${mobiprice.toFixed(3)}</TYPE.price>}
      </AutoColumn>
      <AutoColumn gap="lg" style={{ width: '100%', maxWidth: '720px' }}>
        <HeaderLinks>
          <Sel onClick={() => setSelection(SpecialChain.All)} selected={selection === SpecialChain.All}>
            ALL
          </Sel>
          <Sel onClick={() => setSelection(Chain.Ethereum)} selected={selection === Chain.Ethereum}>
            ETH
          </Sel>
          <Sel onClick={() => setSelection(Chain.Solana)} selected={selection === Chain.Solana}>
            SOL
          </Sel>
          <Sel onClick={() => setSelection(Chain.Terra)} selected={selection === Chain.Terra}>
            TERRA
          </Sel>
          <Sel onClick={() => setSelection(SpecialChain.Other)} selected={selection === SpecialChain.Other}>
            OTHER
          </Sel>
        </HeaderLinks>
        <InfoWrapper mobile={true} style={{ maxWidth: '640px' }}>
          <VoteCard>
            <CardNoise />
            <CardSection>
              <AutoColumn gap="md">
                <RowBetween>
                  <TYPE.white fontWeight={600} fontSize={20}>
                    Liquidity Pools
                  </TYPE.white>
                </RowBetween>
                <RowBetween>
                  <TYPE.white
                    fontSize={16}
                  >{`Please use caution when providing liquidity into pools. Do your own research to understand the stablility mechanisms behind each token--Mobius does not guarantee the value of any asset.`}</TYPE.white>
                </RowBetween>
              </AutoColumn>
            </CardSection>
            <CardNoise />
          </VoteCard>
        </InfoWrapper>
        <PoolSection>
          {sortedFilterdPools
            .filter((pool) => !pool.gauge?.isKilled)
            .map((pool) => (
              <StablePoolCard meta={pool} stakingInfo={stakingInfo} key={pool.display.pool.address} />
            ))}
        </PoolSection>
        <AutoColumn gap="lg" style={{ width: '100%', maxWidth: '720px', justifyContent: 'center' }}>
          <RowFixed>
            <TYPE.largeHeader
              style={{ textDecoration: 'underline', cursor: 'pointer' }}
              onClick={() => setShowDeprecated(!showDeprecated)}
            >
              {showDeprecated ? 'Hide deprecated pools' : 'Show deprecated pools'}
            </TYPE.largeHeader>
            <QuestionHelper
              text={
                <>
                  Users are encouraged to withdraw from these pools as they have been replaced with new ones. The gauges
                  for these pools have been killed and will no longer produce any mobi rewards
                </>
              }
            />
          </RowFixed>
        </AutoColumn>
        <PoolSection>
          {showDeprecated &&
            sortedFilterdPools
              .filter((pool) => pool.gauge?.isKilled)
              .map((pool) => <StablePoolCard meta={pool} stakingInfo={stakingInfo} key={pool.display.pool.address} />)}
        </PoolSection>
      </AutoColumn>
    </PageWrapper>
  )
}
