import CurrencyPoolLogo from 'components/CurrencyPoolLogo'
import ClaimRewardModal from 'components/earn/ClaimRewardModal'
import StakingModal from 'components/earn/StakingModal'
import { useMobi } from 'hooks/Tokens'
import JSBI from 'jsbi'
import { calculateVirtualPrice } from 'lib/calculator'
import { Fraction, TokenAmount } from 'lib/token-utils'
import React, { useCallback, useState } from 'react'
import { Link, RouteComponentProps } from 'react-router-dom'
import { usePegPrice } from 'state/application/hooks'
import { useGaugeInfo, useUserGaugeInfo } from 'state/gauges/hooks'
import { getCurrentDisplayFromGauge, useCurrentPoolAddress } from 'state/mobiusPools/hooks'
import { useStakingInfo } from 'state/staking/hooks'
import styled from 'styled-components'
import { CountUp } from 'use-count-up'

import { ButtonEmpty, ButtonPrimary } from '../../components/Button'
import { AutoColumn } from '../../components/Column'
import { CardNoise, CardSection, DataCard } from '../../components/earn/styled'
import { AutoRow, RowBetween, RowFixed } from '../../components/Row'
import { BIG_INT_SECONDS_IN_WEEK } from '../../constants'
import { useWeb3Context } from '../../hooks'
import usePrevious from '../../hooks/usePrevious'
import { useTokenBalance } from '../../state/wallet/hooks'
import { TYPE } from '../../theme'

const PageWrapper = styled(AutoColumn)`
  margin-top: 3rem;
  max-width: 640px;
  width: 100%;
`

const PositionInfo = styled(AutoColumn)<{ dim: any }>`
  position: relative;
  max-width: 640px;
  width: 100%;
  opacity: ${({ dim }) => (dim ? 0.6 : 1)};
`

const BottomSection = styled(AutoColumn)`
  border-radius: 12px;
  width: 100%;
  position: relative;
`

const StyledDataCard = styled(DataCard)`
  background: radial-gradient(50% 50% at 10% 10%, #35d07f 0%, #3488ec 180%);
  z-index: 2;
`

const StyledBottomCard = styled(DataCard)<{ dim: any }>`
  background: ${({ theme }) => theme.bg3};
  opacity: ${({ dim }) => (dim ? 0.4 : 1)};
  margin-top: -40px;
  padding: 0 1.25rem 1rem 1.25rem;
  padding-top: 32px;
  z-index: 1;
`

const PoolData = styled(DataCard)`
  background: none;
  border: 1px solid ${({ theme }) => theme.bg4};
  padding: 1rem;
  z-index: 1;
`

const VoteCard = styled(DataCard)`
  background: radial-gradient(50% 50% at 10% 10%, #35d07f 0%, #3488ec 180%);
  overflow: hidden;
`

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: ${({ theme }) => theme.text3};
  margin-top: 0.5rem;
  margin-bottom: 1.5rem;
`

const DataRow = styled(RowBetween)`
  justify-content: center;
  gap: 12px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    gap: 12px;
  `};
`

const MS_IN_HOUR = 1000 * 60 * 60
const MS_IN_MINUTE = 1000 * 60

export default function Manage({
  match: {
    params: { gaugeAddress },
  },
}: RouteComponentProps<{ gaugeAddress: string }>) {
  const { connect, connected, address } = useWeb3Context()
  const mobi = useMobi()
  const stakingInfo = useStakingInfo()
  const display = getCurrentDisplayFromGauge(gaugeAddress)
  const gaugeInfo = useGaugeInfo(display?.gauge ?? undefined)
  const userGaugeInfo = useUserGaugeInfo(display?.gauge ?? undefined)
  const exchangeInfo = useCurrentPoolAddress(display?.pool.address ?? '')
  // get currencies and pair

  // const stakingInfo = useStablePoolInfoByName(poolName)

  // const { balances, stakedAmount, totalStakedAmount, tokens, peggedTo, pegComesAfter, lastClaim } = stakingInfo ?? {
  //   balances: [],
  //   stakedAmount: undefined,
  //   totalStakedAmount: undefined,
  //   tokens: [],
  // }

  const userLiquidityUnstaked = useTokenBalance(connected ? address : undefined, display?.pool.lpToken)
  const [showStakingModal, setShowStakingModal] = useState(false)
  const [showUnstakingModal, setShowUnstakingModal] = useState(false)
  const [showClaimRewardModal, setShowClaimRewardModal] = useState(false)
  const [showExternalRewardModal, setShowExternalRewardModal] = useState(false)
  const pegPrice = usePegPrice(display?.peg.priceQuery ?? null)

  const mobiCountUpAmount = userGaugeInfo?.claimableMobi.toFixed(6) ?? '0'
  const mobiCountUpAmountPrevious = usePrevious(mobiCountUpAmount) ?? '0'

  const handleDepositClick = useCallback(() => {
    if (connected) {
      setShowStakingModal(true)
    } else {
      connect()
    }
  }, [connect, connected])

  if (!display || !gaugeInfo || !userGaugeInfo || !exchangeInfo || !userLiquidityUnstaked || !display.gauge) return null

  const mobiRate = new TokenAmount(mobi, gaugeInfo.weight.multiply(stakingInfo.mobiRate).quotient ?? 0)

  const nextClaimableTime = gaugeInfo.lastClaim.valueOf() + MS_IN_HOUR
  const minutesUntilRefresh = Math.max(0, (nextClaimableTime - Date.now()) / MS_IN_MINUTE)

  // const earnedMobi = new TokenAmount(mobi, stakingInfo?.pendingMobi ?? '0')

  const totalDeposited = exchangeInfo.lpTotalSupply

  const userDeposited = new TokenAmount(display.pool.lpToken, userGaugeInfo.balance)
  const virtualPrice = calculateVirtualPrice(exchangeInfo)
  const userDepositedValue =
    pegPrice && virtualPrice ? virtualPrice.multiply(totalDeposited).multiply(pegPrice) : new Fraction(0)

  // const { valueOfStaked, totalValueDeposited } = getDepositValues(stakingInfo)

  const userMobiRate = new TokenAmount(mobi, mobiRate.multiply(userDeposited).divide(totalDeposited).quotient)
  const userExternalRates = display.gauge.additionalRewards.map(
    (reward) => new TokenAmount(reward.token, reward.multiply(userDeposited).divide(totalDeposited).quotient)
  )
  // const userExternalRates: TokenAmount[] = []
  // if (
  //   connected &&
  //   stakingInfo &&
  //   stakingInfo.externalRewardRates &&
  //   totalStakedAmount &&
  //   totalStakedAmount.greaterThan('0') &&
  //   stakingInfo?.workingPercentage.greaterThan('0')
  // ) {
  //   userExternalRates = stakingInfo.externalRewardRates.map(
  //     (rate) => new TokenAmount(rate.token, stakingInfo.totalPercentage.multiply(rate.raw).toFixed(0))
  //   )
  // }

  // const totalMobiRate = new TokenAmount(mobi, stakingInfo?.mobiRate ?? JSBI.BigInt('0'))

  // const userBalances = balances.map((amount) => {
  //   const fraction = new Fraction(stakedAmount?.raw.toString() ?? '0', totalStakedAmount?.raw || JSBI.BigInt('0'))
  //   const ratio = fraction.multiply(amount.raw)

  //   if (JSBI.equal(ratio.denominator, JSBI.BigInt('0'))) {
  //     return new TokenAmount(amount.currency, JSBI.BigInt('0'))
  //   }
  //   return new TokenAmount(amount.currency, JSBI.divide(ratio.numerator, ratio.denominator))
  // })

  const decimalPlacesForLP = userDeposited.greaterThan('1') ? 6 : userDeposited.greaterThan('0') ? 12 : 2

  // fade cards if nothing staked or nothing earned yet
  const disableTop = userGaugeInfo.claimableMobi.equalTo(0) && userDeposited.equalTo(0)

  const format = (str: string): string => {
    const peg = display.peg
    return (peg.position === 'before' ? peg.symbol : '').concat(str).concat(peg.position === 'after' ? peg.symbol : '')
  }

  return (
    <PageWrapper gap="lg" justify="center">
      <>
        <RowBetween style={{ gap: '24px' }}>
          <TYPE.mediumHeader style={{ margin: 0 }}>{display.name} Liquidity Mining</TYPE.mediumHeader>
          <CurrencyPoolLogo tokens={display.pool.tokens.slice()} size={24} />
        </RowBetween>

        <DataRow style={{ gap: '24px' }}>
          <PoolData>
            <AutoColumn gap="sm">
              <TYPE.body style={{ margin: 0 }}>Total deposits</TYPE.body>
              <TYPE.body fontSize={24} fontWeight={500}>
                {format(totalDeposited.toFixed(display.peg.decimals, { groupSeparator: ',' }))}
              </TYPE.body>
            </AutoColumn>
          </PoolData>
          <PoolData>
            <AutoColumn gap="sm">
              <TYPE.body style={{ margin: 0 }}>Pool Rate</TYPE.body>
              <TYPE.body fontSize={24} fontWeight={500}>
                {mobiRate.multiply(BIG_INT_SECONDS_IN_WEEK)?.toFixed(0, { groupSeparator: ',' }) ?? '-'}
                {' MOBI / week'}
              </TYPE.body>
              {display.gauge.additionalRewards.map((tokenRate) => (
                <TYPE.body fontSize={24} fontWeight={500} key={`total-rate-manage-${tokenRate.token.symbol}`}>
                  {`${tokenRate?.multiply(BIG_INT_SECONDS_IN_WEEK)?.toFixed(0, { groupSeparator: ',' })} ${
                    tokenRate.token.symbol
                  } / week`}
                </TYPE.body>
              ))}
            </AutoColumn>
          </PoolData>
        </DataRow>
      </>

      {userDeposited.equalTo('0') && userLiquidityUnstaked.equalTo('0') && (
        <VoteCard>
          <CardNoise />
          <CardSection>
            <AutoColumn gap="md">
              <RowBetween>
                <TYPE.white fontWeight={600}>Step 1. Get MOBI-LP tokens</TYPE.white>
              </RowBetween>
              <RowBetween style={{ marginBottom: '1rem' }}>
                <TYPE.white fontSize={14}>
                  {`Mobi-LP tokens are required. Once you've added liquidity to the ${display.name} pool you can stake your liquidity tokens on this page.`}
                </TYPE.white>
              </RowBetween>
              <ButtonPrimary padding="8px" borderRadius="8px" width={'fit-content'} as={Link} to={`/pool`}>
                {`Add liquidity`}
              </ButtonPrimary>
            </AutoColumn>
          </CardSection>
          <CardNoise />
        </VoteCard>
      )}

      <>
        <StakingModal
          isOpen={showStakingModal}
          onDismiss={() => setShowStakingModal(false)}
          userDeposited={userDeposited}
          totalDeposited={totalDeposited}
          userLiquidityUnstaked={userLiquidityUnstaked}
          gaugeAddress={display.gauge.address}
          mobiRate={mobiRate}
        />
        <ClaimRewardModal
          isOpen={showClaimRewardModal}
          onDismiss={() => setShowClaimRewardModal(false)}
          gaugeAddress={display.gauge.address}
          userGaugeInfo={userGaugeInfo}
        />
        {/* <UnstakingModal
          isOpen={showUnstakingModal}
          onDismiss={() => setShowUnstakingModal(false)}
          stakingInfo={stakingInfo}
        />
       
        <ExternalRewardsModal
          isOpen={showExternalRewardModal}
          onDismiss={() => setShowExternalRewardModal(false)}
          stakingInfo={stakingInfo}
        /> */}
      </>

      <PositionInfo gap="lg" justify="center" dim={userDeposited.equalTo(0)}>
        <BottomSection gap="lg" justify="center">
          <StyledDataCard disabled={disableTop}>
            <CardSection>
              <CardNoise />
              <AutoColumn gap="md">
                <RowBetween>
                  <TYPE.white fontWeight={600}>Your staked liquidity deposits</TYPE.white>
                </RowBetween>
                <RowBetween style={{ alignItems: 'baseline' }}>
                  <TYPE.white fontSize={36} fontWeight={600}>
                    {userDeposited.toSignificant(decimalPlacesForLP) ?? '-'}
                  </TYPE.white>
                  <RowFixed>
                    <TYPE.white>MOBI-LP {display.pool.tokens.map(({ symbol }) => symbol).join('-')}</TYPE.white>
                  </RowFixed>
                </RowBetween>
                {userDeposited.greaterThan('0') && (
                  <RowBetween>
                    <RowFixed>
                      <TYPE.white>
                        Current value: $
                        {userDepositedValue.toFixed(4, {
                          groupSeparator: ',',
                        })}
                      </TYPE.white>
                      {/* <QuestionHelper
                        text={userBalances
                          .map(
                            (balance) =>
                              `${balance?.toFixed(Math.min(decimalPlacesForLP, balance.token.decimals), {
                                groupSeparator: ',',
                              })} ${balance.token.symbol}`
                          )
                          .join(', ')}
                      /> */}
                    </RowFixed>
                  </RowBetween>
                )}
              </AutoColumn>
            </CardSection>
          </StyledDataCard>
          <StyledBottomCard dim={userDeposited.equalTo(JSBI.BigInt(0))}>
            <CardNoise />
            <AutoColumn gap="sm">
              <RowBetween>
                <div>
                  <TYPE.black>Your unclaimed rewards</TYPE.black>
                </div>
                {userGaugeInfo.claimableMobi && (
                  <RowFixed>
                    <ButtonEmpty
                      padding="8px"
                      borderRadius="8px"
                      width="fit-content"
                      onClick={() => setShowClaimRewardModal(true)}
                    >
                      Claim MOBI
                    </ButtonEmpty>
                  </RowFixed>
                )}
              </RowBetween>
              <RowBetween style={{ alignItems: 'baseline' }}>
                <TYPE.largeHeader fontSize={36} fontWeight={600}>
                  <CountUp
                    key={`${mobiCountUpAmount}-countup`}
                    isCounting
                    decimalPlaces={4}
                    start={parseFloat(mobiCountUpAmountPrevious)}
                    end={parseFloat(mobiCountUpAmount)}
                    thousandsSeparator={','}
                    duration={1}
                  />
                </TYPE.largeHeader>
                <TYPE.black fontSize={16} fontWeight={500}>
                  <span role="img" aria-label="wizard-icon" style={{ marginRight: '8px ' }}>
                    ⚡
                  </span>
                  {stakingInfo
                    ? userMobiRate?.multiply(BIG_INT_SECONDS_IN_WEEK)?.toSignificant(4, { groupSeparator: ',' }) ?? '-'
                    : '0'}
                  {' MOBI / week'}
                </TYPE.black>
              </RowBetween>
              {display.gauge.additionalRewards.length > 0 && (
                <>
                  <Divider />
                  <RowBetween>
                    <TYPE.black>External rewards refresh once per hour</TYPE.black>
                    <ButtonEmpty
                      padding="8px"
                      borderRadius="8px"
                      width="fit-content"
                      onClick={() => setShowExternalRewardModal(true)}
                    >
                      Claim External
                    </ButtonEmpty>
                  </RowBetween>
                  <AutoRow>
                    <TYPE.subHeader>Next Refresh in {minutesUntilRefresh.toFixed(0)} minutes</TYPE.subHeader>
                  </AutoRow>
                  {display.gauge.additionalRewards.map((rewardToken, i) => (
                    <RowBetween
                      style={{ alignItems: 'baseline' }}
                      key={`reward-line-${display.name}-${rewardToken.token.address}`}
                    >
                      <TYPE.largeHeader fontSize={36} fontWeight={600}>
                        {rewardToken.toFixed(4, { groupSeparator: ',' })}
                      </TYPE.largeHeader>
                      <TYPE.black fontSize={16} fontWeight={500}>
                        <span role="img" aria-label="wizard-icon" style={{ marginRight: '8px ' }}>
                          ⚡
                        </span>
                        {stakingInfo
                          ? userExternalRates?.[i]
                              ?.multiply(BIG_INT_SECONDS_IN_WEEK)
                              ?.toSignificant(4, { groupSeparator: ',' }) ?? '-'
                          : '0'}
                        {` ${rewardToken.token.symbol} / week`}
                      </TYPE.black>
                    </RowBetween>
                  ))}
                </>
              )}
            </AutoColumn>
          </StyledBottomCard>
        </BottomSection>
        <DataRow style={{ marginBottom: '1rem' }}>
          {!userLiquidityUnstaked.equalTo('0') && (
            <ButtonPrimary padding="8px" borderRadius="8px" width="160px" onClick={handleDepositClick}>
              Deposit
            </ButtonPrimary>
          )}

          {!userDeposited.equalTo('0') && (
            <>
              <ButtonPrimary padding="8px" borderRadius="8px" width="160px" onClick={() => setShowUnstakingModal(true)}>
                Withdraw
              </ButtonPrimary>
            </>
          )}
        </DataRow>
        {!userLiquidityUnstaked.equalTo('0') && (
          <TYPE.main>{userLiquidityUnstaked.toSignificant(6)} MOBI LP tokens available</TYPE.main>
        )}
      </PositionInfo>
    </PageWrapper>
  )
}
