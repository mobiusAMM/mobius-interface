import CurrencyPoolLogo from 'components/CurrencyPoolLogo'
import ExternalRewardsModal from 'components/earn/ClaimExternalRewardsModal'
import Loader from 'components/Loader'
import QuestionHelper from 'components/QuestionHelper'
import { useMobi } from 'hooks/Tokens'
import JSBI from 'jsbi'
import { Fraction, JSBI, TokenAmount } from 'lib/token-utils'
import React, { useCallback, useState } from 'react'
import { Link, RouteComponentProps } from 'react-router-dom'
import { useExternalRewards, useStablePoolInfoByName } from 'state/stablePools/hooks'
import styled from 'styled-components'
import { CountUp } from 'use-count-up'
import { getDepositValues } from 'utils/stableSwaps'

import { ButtonEmpty, ButtonPrimary } from '../../components/Button'
import { AutoColumn } from '../../components/Column'
import ClaimRewardModal from '../../components/earn/ClaimRewardModal'
import StakingModal from '../../components/earn/StakingModal'
import { CardNoise, CardSection, DataCard } from '../../components/earn/styled'
import UnstakingModal from '../../components/earn/UnstakingModal'
import { AutoRow, RowBetween, RowFixed } from '../../components/Row'
import { BIG_INT_SECONDS_IN_WEEK } from '../../constants'
import { useWeb3Context } from '../../hooks'
import { useColor } from '../../hooks/useColor'
import usePrevious from '../../hooks/usePrevious'
import { useTokenBalance } from '../../state/wallet/hooks'
import { ExternalLinkIcon, TYPE } from '../../theme'

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

const StyledDataCard = styled(DataCard)<{ bgColor?: any; showBackground?: any }>`
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #1e1a31 0%, #3d51a5 100%);
  z-index: 2;
  background: ${({ theme, bgColor, showBackground }) =>
    `radial-gradient(91.85% 100% at 1.84% 0%, ${bgColor} 0%,  ${showBackground ? theme.black : theme.bg5} 100%) `};
  ${({ showBackground }) =>
    showBackground &&
    `  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);`}
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
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #27ae60 0%, #000000 100%);
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
    params: { poolName },
  },
}: RouteComponentProps<{ poolName: string }>) {
  const { connect, connected, address } = useWeb3Context()
  const mobi = useMobi()
  const externalRewards = useExternalRewards({ address: poolName })
  console.log(externalRewards, poolName, 101)

  // get currencies and pair

  const stakingInfo = useStablePoolInfoByName(poolName)

  const { balances, stakedAmount, totalStakedAmount, tokens, peggedTo, pegComesAfter, lastClaim } = stakingInfo ?? {
    balances: [],
    stakedAmount: undefined,
    totalStakedAmount: undefined,
    tokens: [],
  }

  const nextClaimableTime = lastClaim?.valueOf() + MS_IN_HOUR
  const minutesUntilRefresh = Math.max(0, (nextClaimableTime - Date.now()) / MS_IN_MINUTE)

  const earnedMobi = new TokenAmount(mobi, stakingInfo?.pendingMobi ?? '0')

  const { valueOfStaked, totalValueDeposited } = getDepositValues(stakingInfo)

  let userMobiRate = new TokenAmount(mobi, JSBI.BigInt('0'))
  if (
    stakingInfo &&
    totalStakedAmount &&
    totalStakedAmount.greaterThan('0') &&
    stakingInfo?.workingPercentage.greaterThan('0')
  ) {
    userMobiRate = new TokenAmount(
      mobi,
      stakingInfo?.workingPercentage.multiply(stakingInfo?.mobiRate ?? '0').toFixed(0) ?? '0'
    )
  }
  let userExternalRates: TokenAmount[] = []
  if (
    connected &&
    stakingInfo &&
    stakingInfo.externalRewardRates &&
    totalStakedAmount &&
    totalStakedAmount.greaterThan('0') &&
    stakingInfo?.workingPercentage.greaterThan('0')
  ) {
    userExternalRates = stakingInfo.externalRewardRates.map(
      (rate) => new TokenAmount(rate.token, stakingInfo.totalPercentage.multiply(rate.raw).toFixed(0))
    )
  }

  const totalMobiRate = new TokenAmount(mobi, stakingInfo?.mobiRate ?? JSBI.BigInt('0'))

  const userBalances = balances.map((amount) => {
    const fraction = new Fraction(stakedAmount?.raw.toString() ?? '0', totalStakedAmount?.raw || JSBI.BigInt('0'))
    const ratio = fraction.multiply(amount.raw)

    if (JSBI.equal(ratio.denominator, JSBI.BigInt('0'))) {
      return new TokenAmount(amount.currency, JSBI.BigInt('0'))
    }
    return new TokenAmount(amount.currency, JSBI.divide(ratio.numerator, ratio.denominator))
  })

  const decimalPlacesForLP = stakedAmount?.greaterThan('1') ? 6 : stakedAmount?.greaterThan('0') ? 12 : 2

  // detect existing unstaked LP position to show add button if none found
  const userLiquidityUnstaked = useTokenBalance(connected ? address : undefined, stakingInfo?.lpToken)
  const showAddLiquidityButton = Boolean(stakingInfo?.stakedAmount?.equalTo('0') && userLiquidityUnstaked?.equalTo('0'))

  // toggle for staking modal and unstaking modal
  const [showStakingModal, setShowStakingModal] = useState(false)
  const [showUnstakingModal, setShowUnstakingModal] = useState(false)
  const [showClaimRewardModal, setShowClaimRewardModal] = useState(false)
  const [showExternalRewardModal, setShowExternalRewardModal] = useState(false)

  // fade cards if nothing staked or nothing earned yet
  const disableTop = !stakingInfo?.stakedAmount || stakingInfo.stakedAmount.equalTo(JSBI.BigInt(0))

  const token = stakingInfo?.tokens[0]
  const backgroundColor = useColor(token ?? undefined)

  // get CUSD value of staked LP tokens

  const mobiCountUpAmount = earnedMobi?.toFixed(6) ?? '0'
  const mobiCountUpAmountPrevious = usePrevious(mobiCountUpAmount) ?? '0'
  const countUpAmount = earnedMobi?.toFixed(6) ?? '0'
  const countUpAmountPrevious = usePrevious(countUpAmount) ?? '0'

  const handleDepositClick = useCallback(() => {
    if (connected) {
      setShowStakingModal(true)
    } else {
      connect()
    }
  }, [connect, connected])

  return (
    <PageWrapper gap="lg" justify="center">
      {!stakingInfo && <Loader />}
      {stakingInfo && (
        <>
          <RowBetween style={{ gap: '24px' }}>
            <TYPE.mediumHeader style={{ margin: 0 }}>{stakingInfo.name} Liquidity Mining</TYPE.mediumHeader>
            <CurrencyPoolLogo tokens={stakingInfo.tokens.slice()} size={24} />
          </RowBetween>

          <DataRow style={{ gap: '24px' }}>
            <PoolData>
              <AutoColumn gap="sm">
                <TYPE.body style={{ margin: 0 }}>Total deposits</TYPE.body>
                <TYPE.body fontSize={24} fontWeight={500}>
                  {totalValueDeposited
                    ? `${stakingInfo.pegComesAfter ? '' : stakingInfo.peggedTo}${
                        totalValueDeposited.lessThan('1')
                          ? totalValueDeposited.toFixed(stakingInfo.displayDecimals, {
                              groupSeparator: ',',
                            })
                          : totalValueDeposited.toFixed(stakingInfo.displayDecimals, {
                              groupSeparator: ',',
                            })
                      } ${stakingInfo.pegComesAfter ? stakingInfo.peggedTo : ''}`
                    : '-'}
                </TYPE.body>
              </AutoColumn>
            </PoolData>
            <PoolData>
              <AutoColumn gap="sm">
                <TYPE.body style={{ margin: 0 }}>Pool Rate</TYPE.body>
                <TYPE.body fontSize={24} fontWeight={500}>
                  {stakingInfo
                    ? totalMobiRate?.multiply(BIG_INT_SECONDS_IN_WEEK)?.toFixed(0, { groupSeparator: ',' }) ?? '-'
                    : '0'}
                  {' MOBI / week'}
                </TYPE.body>
                {stakingInfo &&
                  stakingInfo.externalRewardRates &&
                  stakingInfo.externalRewardRates.map((rate) => (
                    <TYPE.body fontSize={24} fontWeight={500} key={`total-rate-manage-${rate.token.symbol}`}>
                      {`${rate?.multiply(BIG_INT_SECONDS_IN_WEEK)?.toFixed(0, { groupSeparator: ',' })} ${
                        rate.token.symbol
                      } / week`}
                    </TYPE.body>
                  ))}
              </AutoColumn>
            </PoolData>
          </DataRow>
        </>
      )}

      {stakingInfo && showAddLiquidityButton && (
        <VoteCard>
          <CardNoise />
          <CardSection>
            <AutoColumn gap="md">
              <RowBetween>
                <TYPE.white fontWeight={600}>Step 1. Get MOBI-LP Liquidity tokens</TYPE.white>
              </RowBetween>
              <RowBetween style={{ marginBottom: '1rem' }}>
                <TYPE.white fontSize={14}>
                  {`Mobi-LP tokens are required. Once you've added liquidity to the ${stakingInfo.name} pool you can stake your liquidity tokens on this page.`}
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

      {stakingInfo && (
        <>
          <StakingModal
            isOpen={showStakingModal}
            onDismiss={() => setShowStakingModal(false)}
            stakingInfo={stakingInfo}
            userLiquidityUnstaked={userLiquidityUnstaked}
          />
          <UnstakingModal
            isOpen={showUnstakingModal}
            onDismiss={() => setShowUnstakingModal(false)}
            stakingInfo={stakingInfo}
          />
          <ClaimRewardModal
            isOpen={showClaimRewardModal}
            onDismiss={() => setShowClaimRewardModal(false)}
            stakingInfo={stakingInfo}
          />
          <ExternalRewardsModal
            isOpen={showExternalRewardModal}
            onDismiss={() => setShowExternalRewardModal(false)}
            stakingInfo={stakingInfo}
          />
        </>
      )}

      {stakingInfo && (
        <PositionInfo gap="lg" justify="center" dim={showAddLiquidityButton}>
          <BottomSection gap="lg" justify="center">
            <StyledDataCard disabled={disableTop} bgColor={backgroundColor} showBackground={!showAddLiquidityButton}>
              <CardSection>
                <CardNoise />
                <AutoColumn gap="md">
                  <RowBetween>
                    <TYPE.white fontWeight={600}>Your staked liquidity deposits</TYPE.white>
                  </RowBetween>
                  <RowBetween style={{ alignItems: 'baseline' }}>
                    <TYPE.white fontSize={36} fontWeight={600}>
                      {stakingInfo?.stakedAmount?.toSignificant(decimalPlacesForLP) ?? '-'}
                    </TYPE.white>
                    <RowFixed>
                      <TYPE.white>MOBI-LP {stakingInfo.tokens.map(({ symbol }) => symbol).join('-')}</TYPE.white>
                    </RowFixed>
                  </RowBetween>
                  {stakingInfo?.stakedAmount && stakingInfo.stakedAmount.greaterThan('0') && (
                    <RowBetween>
                      <RowFixed>
                        <TYPE.white>
                          Current value:{' '}
                          {valueOfStaked
                            ? `${pegComesAfter ? '' : peggedTo}${valueOfStaked.toFixed(4, {
                                separator: ',',
                              })} ${pegComesAfter ? peggedTo : ''}`
                            : '--'}
                        </TYPE.white>
                        <QuestionHelper
                          text={userBalances
                            .map(
                              (balance) =>
                                `${balance?.toFixed(Math.min(decimalPlacesForLP, balance.token.decimals), {
                                  groupSeparator: ',',
                                })} ${balance.token.symbol}`
                            )
                            .join(', ')}
                        />
                      </RowFixed>
                    </RowBetween>
                  )}
                </AutoColumn>
              </CardSection>
            </StyledDataCard>
            <StyledBottomCard dim={stakingInfo?.stakedAmount?.equalTo(JSBI.BigInt(0))}>
              <CardNoise />
              <AutoColumn gap="sm">
                <RowBetween>
                  <div>
                    <TYPE.black>Your unclaimed rewards</TYPE.black>
                  </div>
                  {earnedMobi && (
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
                      ? userMobiRate?.multiply(BIG_INT_SECONDS_IN_WEEK)?.toSignificant(4, { groupSeparator: ',' }) ??
                        '-'
                      : '0'}
                    {' MOBI / week'}
                  </TYPE.black>
                </RowBetween>
                {externalRewards && (
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
                    {externalRewards.map((reward, i) => (
                      <RowBetween style={{ alignItems: 'baseline' }} key={`reward-line-${stakingInfo.name}-${i}`}>
                        <TYPE.largeHeader fontSize={36} fontWeight={600}>
                          <CountUp
                            key={`${mobiCountUpAmount}-countup`}
                            isCounting
                            decimalPlaces={4}
                            start={parseFloat(reward.toFixed(4))}
                            end={parseFloat(reward.toFixed(4))}
                            thousandsSeparator={','}
                            duration={1}
                          />
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
                          {` ${stakingInfo.externalRewardRates?.[i].token.symbol} / week`}
                        </TYPE.black>
                      </RowBetween>
                    ))}
                  </>
                )}
              </AutoColumn>
            </StyledBottomCard>
          </BottomSection>
          {/* <TYPE.main style={{ textAlign: 'center' }} fontSize={14}>
          <span role="img" aria-label="wizard-icon" style={{ marginRight: '8px' }}>
            ⭐️
          </span>
          When you withdraw, the contract will automagically claim MOBI on your behalf!
        </TYPE.main> */}

          {!showAddLiquidityButton && (
            <DataRow style={{ marginBottom: '1rem' }}>
              {stakingInfo && (
                <ButtonPrimary padding="8px" borderRadius="8px" width="160px" onClick={handleDepositClick}>
                  {stakingInfo?.stakedAmount?.greaterThan(JSBI.BigInt(0)) ? 'Deposit' : 'Deposit MOBI-LP Tokens'}
                </ButtonPrimary>
              )}

              {stakingInfo?.stakedAmount?.greaterThan(JSBI.BigInt(0)) && (
                <>
                  <ButtonPrimary
                    padding="8px"
                    borderRadius="8px"
                    width="160px"
                    onClick={() => setShowUnstakingModal(true)}
                  >
                    Withdraw
                  </ButtonPrimary>
                </>
              )}
              {/* {stakingInfo && !stakingInfo.active && (
              <TYPE.main style={{ textAlign: 'center' }} fontSize={14}>
                Staking Rewards inactive for this pair.
              </TYPE.main>
            )} */}
            </DataRow>
          )}
          {!userLiquidityUnstaked ? null : userLiquidityUnstaked.equalTo('0') ? null : !stakingInfo ? null : (
            <TYPE.main>{userLiquidityUnstaked.toSignificant(6)} MOBI LP tokens available</TYPE.main>
          )}
        </PositionInfo>
      )}
    </PageWrapper>
  )
}

const PairLinkIcon = styled(ExternalLinkIcon)`
  svg {
    stroke: ${(props) => props.theme.primary1};
  }
`
