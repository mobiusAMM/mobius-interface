import QuestionHelper from 'components/QuestionHelper'
import { ChainLogo, Coins } from 'constants/pools'
import { useWeb3Context } from 'hooks'
import { useValueOfExternalRewards } from 'hooks/useStablePools'
import JSBI from 'jsbi'
import { calculateEstimatedWithdrawAmount, calculateVirtualPrice } from 'lib/calculator'
import { Fraction, TokenAmount } from 'lib/token-utils'
import { Meta } from 'pages/Pool'
import { darken } from 'polished'
import React, { useState } from 'react'
import { isMobile } from 'react-device-detect'
import { useHistory } from 'react-router'
import { NavLink } from 'react-router-dom'
import { useMobiPrice, useTokenPrice } from 'state/application/hooks'
import { StakingInfo, UserStakingInfo } from 'state/staking/hooks'
import styled from 'styled-components'
import { calcRates } from 'utils/calcRate'

import { BIG_INT_SECONDS_IN_WEEK, BIG_INT_SECONDS_IN_YEAR } from '../../constants'
import { usePoolColor } from '../../hooks/useColor'
import { theme, TYPE } from '../../theme'
import { ButtonPrimary } from '../Button'
import { AutoColumn } from '../Column'
import CurrencyPoolLogo from '../CurrencyPoolLogo'
import Logo from '../Logo'
import { Row, RowBetween, RowFixed } from '../Row'
import DepositModal from './DepositModal'
import WithdrawModal from './WithdrawModal'

const StyledButton = styled(ButtonPrimary)<{ background: any; backgroundHover: any; eth: boolean }>`
  background: ${({ background }) => background};
  flex: 0.6;
  &:hover {
    background: ${({ background }) => darken(0.1, background)};
  }
  color: ${({ theme, eth }) => eth && theme.text6};
`

const StatContainer = styled.div<{ isOpen: boolean }>`
  width: ${({ isOpen }) => (isOpen ? '100%' : '45%')};
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 1rem;
  margin-right: 1rem;
  margin-left: 1rem;
  ${({ theme }) => theme.mediaWidth.upToSmall`;
`};
`

const InfoContainer = styled.div`
  display: flex;
  align-items: flex-end;
  width: 100%;
  padding: 0px;
  margin-top: 16px;
`
const Bottom = styled.div`
  width: 100%;
  align-items: center;
  justify-content: space-between;
  padding-left: 1rem;
  padding-right: 1rem;
`

const Wrapper = styled(AutoColumn)<{ showBackground: boolean; background: any }>`
  border-radius: 20px;
  width: 100%;
  overflow: hidden;
  position: relative;
  padding: 1rem;
  background: ${({ theme }) => theme.bg1};
  color: ${({ theme }) => theme.text1} !important;
  ${({ showBackground }) =>
    showBackground &&
    `  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);`}
  ${({ theme }) => theme.mediaWidth.upToSmall`
  padding-left: 0.25rem;
  padding-right: 0.25rem;
  max-width: 420px;
`}
`

const TopSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  padding-bottom: 0.25rem;
  padding-top: 0;
  z-index: 1;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: 48px 1fr 96px;
  `};
`
const SecondSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  padding-bottom: 0.25rem;
  padding-top: 0;
  z-index: 1;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: 48px 1fr 96px;
  `};
`

const StyledLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  background-color: ${({ theme }) => theme.white};
`

const DepositWithdrawBtn = styled(StyledButton)<{ background: string; backgroundHover: string }>`
  display: flex;
`

const ExpandedRow = styled(Row)<{ open: boolean }>`
  justify-content: ${({ open }) => !open && 'space-between'};
  width: 100%;
`

const StyledNavLink = styled(NavLink)<{ color: string }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  color: ${({ color }) => color};
  font-size: 20;
  width: fit-content;
  font-weight: 800;
  paddingLeft: '.15rem',
  textDecoration: underline,
`

interface Props {
  meta: Meta
  stakingInfo: StakingInfo
  userStakingInfo: UserStakingInfo
}

export const StablePoolCard: React.FC<Props> = ({ meta, stakingInfo, userStakingInfo }: Props) => {
  const { connect, connected } = useWeb3Context()
  const history = useHistory()

  const [openDeposit, setOpenDeposit] = useState(false)
  const [openWithdraw, setOpenWithdraw] = useState(false)
  const [openManage, setOpenManage] = useState(false)

  const mobiPrice = useMobiPrice()

  const virtualPrice = calculateVirtualPrice(meta.exchangeInfo)

  const totalDeposited =
    virtualPrice?.multiply(meta.exchangeInfo.lpTotalSupply) ?? new TokenAmount(meta.display.pool.lpToken, 0)

  const userDeposited =
    virtualPrice?.multiply(meta.lpBalance.asFraction.add(meta.userGauge?.balance ?? JSBI.BigInt(0))) ??
    new TokenAmount(meta.display.pool.lpToken, 0)

  const pegPrice = useTokenPrice(meta.display.peg.priceQuery ?? undefined)

  const totalDepositedValue = pegPrice ? totalDeposited.multiply(pegPrice) : new Fraction(0)

  const mobiRate = meta.gauge?.weight.multiply(stakingInfo.mobiRate).asFraction ?? new Fraction(0)
  const mobiRateValue = mobiPrice.multiply(mobiRate).multiply(BIG_INT_SECONDS_IN_YEAR)

  // const totalStakedAmount = totalValueDeposited
  //   ? totalValueDeposited.multiply(new Fraction(coinPrice?.numerator ?? '1', coinPrice?.denominator ?? '1'))
  //   : new Fraction(JSBI.BigInt(0))
  // const totalMobiRate = new TokenAmount(mobi, mobiRate ?? JSBI.BigInt('0'))

  // const rewardPerYear = priceOfMobi.raw.multiply(totalMobiRate.multiply(BIG_INT_SECONDS_IN_YEAR))
  const externalRewardValue = useValueOfExternalRewards(meta.display.gauge).multiply(BIG_INT_SECONDS_IN_YEAR)
  // let rewardPerYearExternal = new Fraction('0', '1')
  // for (let i = 0; i < 8; i++) {
  //   const rate = poolInfo.externalRewardRates?.[i] ?? totalMobiRate
  //   const priceOfToken =
  //     tokenPrices[rate.token.address.toLowerCase()] ?? tokenPrices['0x00be915b9dcf56a3cbe739d9b9c202ca692409ec']
  //   if (poolInfo.externalRewardRates && i < poolInfo.externalRewardRates.length) {
  //     rewardPerYearExternal = rewardPerYearExternal.add(
  //       priceOfToken?.multiply(rate.multiply(BIG_INT_SECONDS_IN_YEAR)) ?? '0'
  //     )
  //   }
  // }

  // TODO: investigate if this is the right method
  const { apr, dpr, apy } = calcRates(mobiRateValue.add(externalRewardValue), totalDepositedValue)
  const { apr: boostedApr } = calcRates(mobiRateValue.add(externalRewardValue), totalDepositedValue)

  // const [boostedApyFraction, boostedApy, boostedDpy] =
  //   mobiRate && totalStakedAmount && !totalStakedAmount.equalTo(JSBI.BigInt(0))
  //     ? calcApy(
  //         rewardPerYear.multiply(new Fraction(JSBI.BigInt(5), JSBI.BigInt(2))).add(rewardPerYearExternal),
  //         totalStakedAmount
  //       )
  //     : [new Fraction('0', '1'), new Fraction('0', '1'), new Fraction('0', '1')]

  // let weeklyAPY: React.ReactNode | undefined = <>🤯</>
  // try {
  //   weeklyAPY = apy
  //     ? new Percent(
  //         Math.floor(parseFloat(apy.divide('52').add('1').toFixed(10)) ** 52 * 1_000_000 - 1_000_000).toFixed(0),
  //         '1000000'
  //       ).toFixed(0, { groupSeparator: ',' })
  //     : undefined
  // } catch (e) {
  //   console.error('Weekly apy overflow', e)
  // }
  const balances = calculateEstimatedWithdrawAmount({ poolTokenAmount: meta.lpBalance, ...meta.exchangeInfo })
  const userBalances = calculateEstimatedWithdrawAmount({
    poolTokenAmount: meta.exchangeInfo.lpTotalSupply,
    ...meta.exchangeInfo,
  })
  // let userBalances: TokenAmount[] = []
  // if (totalDeposited.greaterThan('0')) {
  //   userBalances = balances.map((amount) => {
  //     const fraction = new Fraction(userLP ? userLP.raw : JSBI.BigInt(0), totalDeposited.raw)
  //     const ratio = fraction.multiply(amount.raw)
  //     return new TokenAmount(amount.currency, JSBI.divide(ratio.numerator, ratio.denominator))
  //   })
  // }

  const poolColor = usePoolColor(meta.display)

  const display = (str: string): string => {
    const peg = meta.display.peg
    return (peg.position === 'before' ? peg.symbol : '').concat(str).concat(peg.position === 'after' ? peg.symbol : '')
  }

  const totalDisplay = (amount: TokenAmount | Fraction): string => {
    const decimals = meta.display.peg.decimals
    if (amount.lessThan(10 ** (2 - decimals))) return display(amount.toFixed(decimals + 1))
    else if (amount.lessThan(10 ** 6)) return display(amount.toFixed(decimals))
    else return display(amount.divide(10 ** 6).toFixed(2))
  }

  return (
    <Wrapper showBackground={true} background={null} onClick={() => setOpenManage(!openManage)}>
      {openDeposit && <DepositModal isOpen={openDeposit} onDismiss={() => setOpenDeposit(false)} poolInfo={poolInfo} />}
      {openWithdraw && (
        <WithdrawModal isOpen={openWithdraw} onDismiss={() => setOpenWithdraw(false)} poolInfo={poolInfo} />
      )}
      <TopSection>
        <RowFixed style={{ gap: '10px' }}>
          <TYPE.black fontWeight={600} fontSize={[18, 24]}>
            {meta.display.name}
          </TYPE.black>
          <StyledLogo size={'32px'} srcs={[ChainLogo[meta.display.chain]]} alt={'logo'} />
        </RowFixed>
        <RowFixed>
          <QuestionHelper
            text={
              <>
                Yield/day: {dpr?.toSignificant(4)}%<br />
                APY (daily compounded): {apy.toSignificant(4)}%
              </>
            }
          />
          <TYPE.subHeader
            style={{ alignContent: 'right', alignItems: 'right' }}
            color={poolColor}
            className="apr"
            fontWeight={800}
            fontSize={[16, 24]}
            textAlign="right"
          >
            {apr.denominator.toString() !== '0' ? `${apr.toFixed(1, { groupSeparator: ',' })}%` : ' -'} APR
          </TYPE.subHeader>
        </RowFixed>
      </TopSection>
      <SecondSection>
        <RowFixed>
          <CurrencyPoolLogo tokens={meta.display.pool.tokens.slice()} size={24} margin={true} />
          <TYPE.darkGray fontWeight={450} fontSize={[14, 20]}>
            {meta.display.pool.tokens.map((t) => t.symbol).join(' / ')}
          </TYPE.darkGray>
        </RowFixed>

        <RowFixed>
          <StyledNavLink style={{ fontSize: 15, textAlign: 'right' }} color={poolColor} to={'/stake'} className="bapr">
            up to {apy.denominator.toString() !== '0' ? `${boostedApr.toFixed(1, { groupSeparator: ',' })}%` : ' -'} w/
            boost
          </StyledNavLink>
        </RowFixed>
      </SecondSection>
      <InfoContainer>
        <div style={{ flex: 3, width: '100%' }}>
          <ExpandedRow open={openManage}>
            <StatContainer isOpen={openManage || isMobile}>
              <RowBetween>
                <TYPE.darkGray>Total deposited</TYPE.darkGray>
                <RowFixed>
                  <QuestionHelper
                    text={balances.withdrawAmountsBeforeFees
                      .map(
                        (balance) =>
                          `${balance?.toFixed(meta.display.peg.decimals, { groupSeparator: ',' })} ${
                            balance.token.symbol
                          }`
                      )
                      .join(', ')}
                  />
                  <TYPE.black fontWeight={800}>{totalDisplay(totalDeposited)}</TYPE.black>
                </RowFixed>
              </RowBetween>

              <RowBetween>
                <TYPE.darkGray>Weekly volume</TYPE.darkGray>
                <RowFixed>
                  <TYPE.black fontWeight={800}>
                    {meta.volume.volume ? totalDisplay(new Fraction(meta.volume.volume?.week)) : 'Subgraph Syncing...'}
                  </TYPE.black>
                </RowFixed>
              </RowBetween>

              {openManage && (
                <>
                  <RowBetween>
                    <TYPE.darkGray>Total volume</TYPE.darkGray>
                    <RowFixed>
                      <TYPE.black fontWeight={800}>
                        {meta.volume.volume
                          ? totalDisplay(new Fraction(meta.volume.volume?.total))
                          : 'Subgraph Syncing...'}
                      </TYPE.black>
                    </RowFixed>
                  </RowBetween>

                  {mobiRate && (
                    <RowBetween>
                      <TYPE.darkGray>MOBI rate</TYPE.darkGray>
                      <TYPE.black fontWeight={800}>
                        {mobiRate.multiply(BIG_INT_SECONDS_IN_WEEK)?.toFixed(0, { groupSeparator: ',' })}
                        {' / week'}
                      </TYPE.black>
                    </RowBetween>
                  )}
                  {meta.display.gauge?.additionalRewards.length !== 0 &&
                    meta.display.gauge?.additionalRewards.map((rate) => (
                      <RowBetween key={rate.toExact()}>
                        <TYPE.darkGray>{rate.token.symbol?.toUpperCase()} rate</TYPE.darkGray>
                        <TYPE.black
                          fontWeight={800}
                          marginLeft="auto"
                          key={`additional-reward-total-${rate.token.symbol}-${meta.display.name}`}
                        >
                          {rate.multiply(BIG_INT_SECONDS_IN_WEEK)?.toSignificant(4, { groupSeparator: ',' })}
                          {` / week`}
                        </TYPE.black>
                      </RowBetween>
                    ))}
                  {connected && userDeposited.greaterThan(0) && (
                    <RowBetween>
                      <TYPE.darkGray fontWeight={500}>Your share</TYPE.darkGray>
                      <RowFixed>
                        {/* <QuestionHelper
                        text={userBalances
                          .map(
                            (balance) =>
                              // eslint-disable-next-line prettier/prettier
                              `${balance?.toFixed(displayDecimals + 1, { groupSeparator: ',' })} ${
                                balance.token.symbol
                              }`
                          )
                          .join(', ')}
                      /> */}
                        <TYPE.black fontWeight={800}>{totalDisplay(userDeposited)}</TYPE.black>
                      </RowFixed>
                    </RowBetween>
                  )}
                </>
              )}
            </StatContainer>
            {!openManage && !isMobile && (
              <StyledButton
                background={poolColor}
                backgroundHover={poolColor}
                onClick={
                  connected
                    ? () => (userDeposited.greaterThan(0) ? setOpenManage(true) : setOpenDeposit(true))
                    : connect
                }
                eth={meta.display.peg.coin === Coins.Ether}
                style={{
                  width: '10%',
                  fontWeight: 700,
                  fontSize: 18,
                  maxWidth: '150px',
                  marginTop: '-20px',
                }}
              >
                {userDeposited.greaterThan(0) ? 'MANAGE' : 'DEPOSIT'}
              </StyledButton>
            )}
          </ExpandedRow>
        </div>
      </InfoContainer>
      <Bottom>
        {!userDeposited.greaterThan(0) && (openManage || isMobile) && (
          <StyledButton
            background={poolColor}
            backgroundHover={poolColor}
            onClick={connected ? () => setOpenDeposit(true) : connect}
            eth={meta.display.peg.coin === Coins.Ether}
            style={{ fontWeight: 700, fontSize: 18 }}
          >
            DEPOSIT
          </StyledButton>
        )}
        {connected && userDeposited.greaterThan(0) && (openManage || isMobile) && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              transition: 'all 0.3s ease-in',
              gap: isMobile ? '0.25rem' : '1rem',
              flexWrap: 'wrap',
              padding: isMobile ? 0 : '1rem',
              paddingBottom: '0',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            <DepositWithdrawBtn
              background={theme(false).celoGreen}
              backgroundHover={theme(false).celoGreen}
              onClick={() => setOpenDeposit(true)}
              style={{ fontWeight: 700, fontSize: isMobile ? 15 : 18 }}
              eth={false}
            >
              DEPOSIT
            </DepositWithdrawBtn>
            <DepositWithdrawBtn
              background={theme(false).celoRed}
              backgroundHover={theme(false).celoRed}
              onClick={() => setOpenWithdraw(true)}
              style={{ fontWeight: 700, fontSize: isMobile ? 15 : 18 }}
              eth={false}
            >
              WITHDRAW
            </DepositWithdrawBtn>
            {meta.display.gauge !== null && (
              <DepositWithdrawBtn
                background={theme(false).celoGold}
                backgroundHover={theme(false).celoGold}
                style={{ fontWeight: 700, fontSize: isMobile ? 15 : 18 }}
                onClick={() => history.push(`/farm/${meta.display.gauge?.address}`)}
                eth={false}
              >
                FARM
              </DepositWithdrawBtn>
            )}
          </div>
        )}
      </Bottom>
    </Wrapper>
  )
}
