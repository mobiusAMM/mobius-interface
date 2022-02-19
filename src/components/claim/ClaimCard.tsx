import { TransactionResponse } from '@ethersproject/providers'
import { VestingAddresses } from 'constants/StablePools'
import { useWeb3Context } from 'hooks'
import { darken } from 'polished'
import React from 'react'
import { VestType } from 'state/claim/reducer'
import styled from 'styled-components'
import { humanFriendlyWei } from 'utils/eth'

import { useVestingContract } from '../../hooks/useContract'
import { ClaimInfo } from '../../state/claim/hooks'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { ExternalLink, TYPE } from '../../theme'
import { ButtonPrimary } from '../Button'
import { AutoColumn } from '../Column'
import { CardNoise, CardSection, DataCard } from '../earn/styled'
import { RowBetween, RowFixed } from '../Row'

const SubHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  padding-top: 0;
`

const PageWrapper = styled(AutoColumn)`
  max-width: 640px;
  width: 100%;
`

const VoteCard = styled(DataCard)`
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #27ae60 0%, #222 100%);
  overflow: hidden;
  margin-bottom: 2rem;
`

const VerticalDivider = styled.div`
  width: 1px;
  height: 100%;
  margin-right: 0.5rem;
  background: ${({ theme }) => theme.bg4};
`

const StyledButton = styled(ButtonPrimary)<{ background: any; backgroundHover: any }>`
  background: ${({ background }) => background};
  flex: 0.6;
  &:hover {
    background: ${({ background }) => darken(0.1, background)};
  }
`

const StatContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 1rem;
  margin-right: 1rem;
  margin-left: 1rem;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  
`};
`

const InfoContainer = styled.div`
  display: flex;
  align-items: flex-end;
  width: 100%;
  padding: 8px;
`
// background: ${({ bgColor1, bgColor2 }) =>
// `radial-gradient(91.85% 100% at 1.84% 0%, ${bgColor1} 0%, ${bgColor2} 100%) `};

const Wrapper = styled(AutoColumn)<{ showBackground: boolean; background: any }>`
  border-radius: 12px;
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

const BottomSection = styled.div<{ showBackground: boolean }>`
  padding: 12px 16px;
  opacity: ${({ showBackground }) => (showBackground ? '1' : '0.4')};
  border-radius: 0 0 12px 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
  z-index: 1;
`

const DepositWithdrawBtn = styled(StyledButton)`
  width: 40%;
  flex: none;
`

interface Props {
  info: ClaimInfo
  type: VestType
}

export const ClaimCard: React.FC<Props> = ({ info, type }: Props) => {
  // get the color of the token
  const backgroundColorStart = '#35D07F'
  const backgroundColorEnd = '#212429'
  const backgroundGradient = null //generateGradient(tokens.slice())
  const { allocatedAmount, claimedAmount, unclaimedAmount } = info
  const { chainId } = useWeb3Context()
  const vestAddress = VestingAddresses[type][chainId]
  const claimContract = useVestingContract(vestAddress)
  const addTransaction = useTransactionAdder()

  async function onClaim() {
    if (claimContract && unclaimedAmount) {
      await claimContract?.['claim()']()
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Claim ${humanFriendlyWei(unclaimedAmount.toString())} MOBI`,
          })
          // setHash(response.hash)
        })
        .catch((error: any) => {
          // setAttempting(false)
          console.log(error)
        })
    }
  }

  return (
    <PageWrapper>
      <VoteCard>
        <CardNoise />
        <CardSection>
          <AutoColumn gap="md">
            <RowBetween>
              <TYPE.white fontWeight={600}>Early liquidity provider rewards</TYPE.white>
            </RowBetween>
            <RowBetween>
              <TYPE.white fontSize={14}>
                {`To reward our early users for adding liqudity to Mobius pools, we have decided to retroactively reward these users with the MOBI token. These tokens are linearly vesting over a one week period.`}
              </TYPE.white>
            </RowBetween>
            <ExternalLink
              style={{ color: 'white', textDecoration: 'underline' }}
              target="_blank"
              href="https://medium.com/@mobiusmoney/introducing-mobi-the-governance-token-for-the-mobiusdao-7b83dc230295"
            >
              <TYPE.white fontSize={14}>Read more about the Mobius token</TYPE.white>
            </ExternalLink>
          </AutoColumn>
        </CardSection>
        <CardNoise />
      </VoteCard>

      <Wrapper
        showBackground={true}
        background={backgroundGradient}
        bgColor1={backgroundColorStart}
        bgColor2={backgroundColorEnd}
      >
        <TopSection>
          <TYPE.black fontWeight={600} fontSize={[18, 24]}>
            Claim $MOBI
          </TYPE.black>
        </TopSection>
        <SubHeader>
          <RowBetween></RowBetween>
        </SubHeader>
        <InfoContainer>
          <div style={{ flex: 3 }}>
            <StatContainer>
              <RowBetween>
                <TYPE.black>Total allocated amount</TYPE.black>
                <RowFixed>
                  <TYPE.black>{allocatedAmount ? humanFriendlyWei(allocatedAmount.toString()) : '--'}</TYPE.black>
                  <div style={{ width: '26px' }} />
                </RowFixed>
              </RowBetween>
              <RowBetween>
                <TYPE.black>Claimed amount</TYPE.black>
                <RowFixed>
                  <TYPE.black>{claimedAmount ? humanFriendlyWei(claimedAmount.toString()) : '--'}</TYPE.black>
                  <div style={{ width: '26px' }} />
                </RowFixed>
              </RowBetween>
              <RowBetween>
                <TYPE.black>Unclaimed vested amount</TYPE.black>
                <RowFixed>
                  <TYPE.black>{unclaimedAmount ? humanFriendlyWei(unclaimedAmount.toString()) : '--'}</TYPE.black>
                  <div style={{ width: '26px' }} />
                </RowFixed>
              </RowBetween>
            </StatContainer>
          </div>
          <StyledButton
            onClick={onClaim}
            disabled={false}
            background={backgroundColorStart}
            backgroundHover={backgroundColorEnd}
          >
            Claim
          </StyledButton>
        </InfoContainer>
      </Wrapper>
    </PageWrapper>
  )
}
