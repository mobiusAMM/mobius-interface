import QuestionHelper from 'components/QuestionHelper'
import { ChainLogo, Coins } from 'constants/pools'
import { useWeb3Context } from 'hooks'
import { useMobi } from 'hooks/Tokens'
import { useValueOfExternalRewards } from 'hooks/useStablePools'
import { calculateVirtualPrice } from 'lib/calculator'
import { Fraction, TokenAmount } from 'lib/token-utils'
import { Meta } from 'pages/Pool'
import { darken } from 'polished'
import React, { useCallback, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { useHistory } from 'react-router'
import { NavLink } from 'react-router-dom'
import { useMobiPrice, usePegPrice } from 'state/application/hooks'
import { StakingInfo } from 'state/staking/hooks'
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
}

export const StablePoolCard: React.FC<Props> = ({ meta, stakingInfo }: Props) => {
  const { connect, connected } = useWeb3Context()
  const history = useHistory()

  const [openDeposit, setOpenDeposit] = useState(false)
  const [openWithdraw, setOpenWithdraw] = useState(false)
  const [openManage, setOpenManage] = useState(false)

  const mobi = useMobi()
  const mobiPrice = useMobiPrice()

  const pegPrice = usePegPrice(meta.display.peg.priceQuery)

  const externalRewardValue = useValueOfExternalRewards(meta.display.gauge).multiply(BIG_INT_SECONDS_IN_YEAR)

  const poolColor = usePoolColor(meta.display)

  const virtualPrice = calculateVirtualPrice(meta.exchangeInfo)

  const { totalDeposited, userDeposited, mobiRate, apr, dpr, apy, boostedApr } = useMemo(() => {
    const totalDeposited =
      virtualPrice?.multiply(meta.exchangeInfo.lpTotalSupply) ?? new TokenAmount(meta.display.pool.lpToken, 0)

    const userDeposited = new TokenAmount(
      meta.display.pool.lpToken,
      virtualPrice?.multiply(meta.lpBalance.asFraction.add(meta.userGauge?.balance ?? 0)).quotient ?? 0
    )

    const totalDepositedValue = pegPrice ? totalDeposited.multiply(pegPrice) : new Fraction(0)

    const mobiRate = new TokenAmount(mobi, meta.gauge?.weight.multiply(stakingInfo.mobiRate).quotient ?? 0)
    const mobiRateValue = mobiPrice.multiply(mobiRate).multiply(BIG_INT_SECONDS_IN_YEAR)

    // TODO: investigate if this is the right method
    const { apr, dpr, apy } = calcRates(mobiRateValue.add(externalRewardValue), totalDepositedValue)
    const { apr: boostedApr } = calcRates(mobiRateValue.add(externalRewardValue), totalDepositedValue)

    return {
      totalDeposited,
      userDeposited,
      mobiRate,
      apr,
      dpr,
      apy,
      boostedApr,
    }
  }, [
    externalRewardValue,
    meta.display.pool.lpToken,
    meta.exchangeInfo.lpTotalSupply,
    meta.gauge?.weight,
    meta.lpBalance.asFraction,
    meta.userGauge?.balance,
    mobi,
    mobiPrice,
    pegPrice,
    stakingInfo.mobiRate,
    virtualPrice,
  ])

  const balances = meta.exchangeInfo.reserves
  const display = useCallback(
    (str: string): string => {
      const peg = meta.display.peg
      return (peg.position === 'before' ? peg.symbol : '')
        .concat(str)
        .concat(peg.position === 'after' ? peg.symbol : '')
    },
    [meta.display.peg]
  )

  const totalDisplay = useCallback(
    (amount: TokenAmount | Fraction): string => {
      const decimals = meta.display.peg.decimals
      if (amount.lessThan(10 ** (2 - decimals))) return display(amount.toFixed(decimals + 1, { groupSeparator: ',' }))
      else if (amount.lessThan(10 ** 6) || openManage) return display(amount.toFixed(decimals, { groupSeparator: ',' }))
      else
        return display(
          amount
            .divide(10 ** 6)
            .toFixed(2, { groupSeparator: ',' })
            .concat('M')
        )
    },
    [display, meta.display.peg.decimals, openManage]
  )

  return (
    <Wrapper showBackground={true} background={null} onClick={() => setOpenManage(!openManage)}>
      {openDeposit && <DepositModal isOpen={openDeposit} onDismiss={() => setOpenDeposit(false)} meta={meta} />}
      {openWithdraw && <WithdrawModal isOpen={openWithdraw} onDismiss={() => setOpenWithdraw(false)} meta={meta} />}
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
          <StyledNavLink
            style={{ fontSize: 15, textAlign: 'right' }}
            color={poolColor ?? ''}
            to={'/stake'}
            className="bapr"
          >
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
                    text={balances
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
                    {meta.volume.volume
                      ? totalDisplay(new Fraction(Math.floor(meta.volume.volume?.week)))
                      : 'Subgraph Syncing...'}
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
                          ? totalDisplay(new Fraction(Math.floor(meta.volume.volume?.total)))
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
