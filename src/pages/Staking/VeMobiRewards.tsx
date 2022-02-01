import { TransactionResponse } from '@ethersproject/abstract-provider'
import { ButtonEmpty, ButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import Loader from 'components/Loader'
import { RowBetween, RowFixed } from 'components/Row'
import { useActiveContractKit } from 'hooks'
import { useFeeDistributor, useStakingContract } from 'hooks/useContract'
import React, { useState } from 'react'
import { useFeeInformation, useSNXRewardInfo } from 'state/staking/hooks'
import { useTransactionAdder } from 'state/transactions/hooks'
import styled from 'styled-components'
import { TYPE } from 'theme'

import { CardNoise, CardSection, DataCard } from '../../components/earn/styled'

const VoteCard = styled(DataCard)`
  background: radial-gradient(90% 90% at 50% 5%, #3488ec 0%, #35d07f 100%);
  overflow: hidden;
  margin-top: -1rem;
`

export const InfoWrapper = styled.div<{ mobile: boolean }>`
  position: relative;
  max-width: 720px;
  width: 100%;
`

const Wrapper = styled(AutoColumn)`
  border-radius: 12px;
  gap: 1rem;
  width: 100%;
  overflow: hidden;
  position: relative;
  padding: 1rem;
  padding-left: 0rem;
  padding-right: 0rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: ${({ theme }) => theme.text1} !important;
  ${({ theme }) => theme.mediaWidth.upToSmall`
`}
`

const CardContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  column-gap: 10px;
  row-gap: 15px;
  justify-self: center;
  width: 100%;
  max-width: 720px;
`
const PositionWrapper = styled(AutoColumn)`
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  padding-left: 0.25rem;
  padding-right: 0.25rem;
  border-radius: 20px;
  width: 100%;
  overflow: hidden;
  position: relative;
  padding: 1rem;
  opacity: 1;
  background: ${({ theme }) => theme.bg1};
  color: ${({ theme }) => theme.text1} !important;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  padding-left: 0.25rem;
  padding-right: 0.25rem;
  padding-top: 1rem;
  margin-top: 1rem;
  overflow: hidden;
`}
`

const SecondSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0.25rem;
  padding-top: 0;
  z-index: 1;
  width: 100%;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: 48px 1fr 96px;
  `};
`
const TopSection = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0.25rem;
  padding-top: 0;
  z-index: 1;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: 48px 1fr 96px;
  `};
`

const Divider = styled.div`
  width: 100%;
  height: 1px;
  margin-left: auto;
  margin-right: auto;
  margin-top: 1rem;
  margin-bottom: 1rem;
  background: ${({ theme }) => theme.text1};
  opacity: 0.5;
`

const StyledButton = styled(ButtonEmpty)`
  margin-left: auto;
  margin-right: 0.5rem;
`

export default function VeMobiRewards() {
  const { rewardToken, rewardRate, avgApr, userRewardRate, leftToClaim, snxAddress } = useSNXRewardInfo()
  const { toClaim, totalFeesThisWeek } = useFeeInformation()
  const tokenColor = '#ab9325' //useColor(rewardToken)
  const { account } = useActiveContractKit()
  const stakingContract = useStakingContract(snxAddress)
  const addTransaction = useTransactionAdder()
  const [attempting, setAttempting] = useState(false)
  const [attemptingFees, setAttemptingFees] = useState(false)
  const [hash, setHash] = useState<string>()
  const feeDistributorContract = useFeeDistributor()

  async function onClaimReward() {
    if (stakingContract) {
      setAttempting(true)
      setHash(undefined)
      await stakingContract
        .getReward()
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Claimed accumulated Celo rewards from veMOBI`,
          })
          response.wait().then(() => setHash(response.hash))
        })
        .catch((error: any) => {
          setAttempting(false)
          console.log(error)
        })
    }
  }

  async function claimFees() {
    if (feeDistributorContract && account) {
      setAttemptingFees(true)
      await feeDistributorContract['claim(address)'](account)
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Claimed allocated Mobi fees`,
          })
          response.wait().then(() => setAttemptingFees(false))
        })
        .catch((error: any) => {
          console.log(error)
        })
    }
  }

  return !rewardRate || !avgApr ? (
    <Wrapper>
      <Loader />
    </Wrapper>
  ) : (
    <Wrapper>
      <InfoWrapper mobile={true}>
        <VoteCard>
          <CardNoise />
          <CardSection>
            <AutoColumn gap="md">
              <RowBetween>
                <TYPE.white fontWeight={600} fontSize={[16, 24]}>
                  Staked Mobi Rewards
                </TYPE.white>
              </RowBetween>
              <RowBetween>
                <TYPE.white
                  fontWeight={450}
                  fontSize={[12, 16]}
                >{`Earn rewards just for staking Mobi. To begin, simply lock MOBI on the \`Lock\` tab! If you already locked MOBI then you are good to go. Max APR is calculated by total celo rate / total veMOBI, actual APR will vary based on lock duration.`}</TYPE.white>
              </RowBetween>
            </AutoColumn>
          </CardSection>
          <CardNoise />
        </VoteCard>
      </InfoWrapper>
      <CardContainer>
        <PositionWrapper>
          <TopSection>
            <RowFixed style={{ gap: '6px' }}>
              <TYPE.black fontWeight={600} fontSize={[16, 24]}>
                {`${rewardToken.symbol} Rewards`}
              </TYPE.black>
            </RowFixed>
            <RowFixed>
              <TYPE.subHeader color={tokenColor} className="apr" fontWeight={800} fontSize={[16, 24]} textAlign="right">
                {`Max APR: ${avgApr.toFixed(2)}%`}
              </TYPE.subHeader>
            </RowFixed>
          </TopSection>
          <SecondSection>
            <RowFixed style={{ marginTop: 10 }}>
              <TYPE.darkGray fontWeight={450} fontSize={[15, 20]}>
                {`${rewardToken.symbol} Rate: `}
              </TYPE.darkGray>
            </RowFixed>

            <TYPE.black
              textAlign="right"
              fontSize={[13, 16]}
              fontWeight={800}
              color={tokenColor}
            >{`${rewardRate.toSignificant(4, { groupSeparator: ',' })} ${rewardToken.symbol} / WEEK`}</TYPE.black>
          </SecondSection>
          <SecondSection>
            <RowFixed style={{ marginTop: 10 }}>
              {/* <StyledLogo srcs={[rewardToken.logoURI]} size={'24'} /> */}
              <TYPE.darkGray fontWeight={450} fontSize={[15, 20]}>
                {`Your Rate: `}
              </TYPE.darkGray>
            </RowFixed>

            <TYPE.black
              textAlign="right"
              fontSize={[13, 16]}
              fontWeight={800}
              color={tokenColor}
            >{`${userRewardRate.toSignificant(4, { groupSeparator: ',' })} ${rewardToken.symbol} / WEEK`}</TYPE.black>
          </SecondSection>
          <Divider />
          <>
            {/* <StyledButton padding="8px" borderRadius="8px" width="fit-content" onClick={onClaimReward}>
              Claim
            </StyledButton> */}
            <SecondSection>
              <TYPE.largeHeader>Available to Claim: </TYPE.largeHeader>

              {leftToClaim ? (
                <TYPE.largeHeader>{`${leftToClaim.toSignificant(4, { groupSeparator: ',' })} ${
                  rewardToken.symbol
                }`}</TYPE.largeHeader>
              ) : account ? (
                <Loader />
              ) : (
                <TYPE.red>Connect Wallet</TYPE.red>
              )}
            </SecondSection>
            <SecondSection style={{ marginTop: '1rem' }}>
              <ButtonPrimary
                onClick={onClaimReward}
                disabled={attempting && !hash}
                style={{ fontWeight: 700, fontSize: 18, marginBottom: '1rem' }}
              >
                {attempting && !hash ? `Claiming ${leftToClaim?.toFixed(2)} CELO...` : 'CLAIM'}
              </ButtonPrimary>
            </SecondSection>
          </>
        </PositionWrapper>
      </CardContainer>
      <CardContainer>
        <PositionWrapper>
          <TopSection>
            <RowFixed style={{ gap: '6px' }}>
              <TYPE.black fontWeight={600} fontSize={[16, 24]}>
                {`Mobi Rewards`}
              </TYPE.black>
            </RowFixed>
          </TopSection>
          <SecondSection>
            <RowFixed style={{ marginTop: 10 }}>
              <TYPE.darkGray fontWeight={450} fontSize={[15, 20]}>
                {`Total Mobi Distributed this Week: `}
              </TYPE.darkGray>
            </RowFixed>

            <TYPE.black textAlign="right" fontSize={[13, 16]} fontWeight={800} color={tokenColor}>
              {totalFeesThisWeek
                ? `${totalFeesThisWeek?.toSignificant(4, { groupSeparator: ',' })} ${totalFeesThisWeek.token.symbol}`
                : '-'}
            </TYPE.black>
          </SecondSection>
          <Divider />
          <SecondSection style={{ marginTop: '1rem' }}>
            <ButtonPrimary
              onClick={claimFees}
              disabled={attempting && !hash}
              style={{ fontWeight: 700, fontSize: 18, marginBottom: '1rem' }}
            >
              {attemptingFees ? `Claiming MOBI...` : 'Claim my Share'}
            </ButtonPrimary>
          </SecondSection>
        </PositionWrapper>
      </CardContainer>
    </Wrapper>
  )
}
