import Loader from 'components/Loader'
import QuestionHelper from 'components/QuestionHelper'
import { useMobi } from 'hooks/Tokens'
import React from 'react'
import { X } from 'react-feather'
import styled from 'styled-components'
import { useCUSDPrice } from 'utils/useCUSDPrice'

import tokenLogo from '../../assets/images/MOBI-200.png'
import { CHAIN, MOBI } from '../../constants'
import { useWeb3Context } from '../../hooks'
import { useAggregateUbeBalance } from '../../state/wallet/hooks'
import { ExternalLink, TYPE, UbeTokenAnimated } from '../../theme'
import { AutoColumn } from '../Column'
import { Break, CardNoise, CardSection, DataCard } from '../earn/styled'
import { RowBetween, RowFixed } from '../Row'
import { useCirculatingSupply } from './useCirculatingSupply'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
`

const ModalUpper = styled(DataCard)`
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, ${({ theme }) => theme.primary1} 0%, #3488ec 100%), #edeef2;
  padding: 0.5rem;
`

const StyledClose = styled(X)`
  position: absolute;
  right: 16px;
  top: 16px;

  :hover {
    cursor: pointer;
  }
`

/**
 * Content for balance stats modal
 */
export default function UbeBalanceContent({ setShowUbeBalanceModal }: { setShowUbeBalanceModal: any }) {
  const { connected } = useWeb3Context()
  const ube = MOBI[CHAIN]

  const total = useAggregateUbeBalance()
  // const ubeBalance: TokenAmount | undefined = useTokenBalance(account ?? undefined, ube)
  // const ubeToClaim: TokenAmount | undefined = useTotalUbeEarned()

  // const totalSupply: TokenAmount | undefined = useTotalSupply(ube)
  const mobi = useMobi()
  const mobiprice = useCUSDPrice(mobi)
  const ret = useCirculatingSupply()

  return (
    <ContentWrapper gap="lg">
      <ModalUpper>
        <CardNoise />
        <CardSection gap="md">
          <RowBetween>
            <TYPE.white color="white">Your MOBI Breakdown</TYPE.white>
            <StyledClose stroke="white" onClick={() => setShowUbeBalanceModal(false)} />
          </RowBetween>
        </CardSection>
        <Break />
        {connected && (
          <>
            <CardSection gap="sm">
              <AutoColumn gap="md" justify="center">
                <UbeTokenAnimated width="48px" src={tokenLogo} />{' '}
                <TYPE.white fontSize={48} fontWeight={600} color="white">
                  {total?.toFixed(2, { groupSeparator: ',' })}
                </TYPE.white>
              </AutoColumn>
              {/* <AutoColumn gap="md">
                <RowBetween>
                  <TYPE.white color="white">Balance:</TYPE.white>
                  <TYPE.white color="white">{ubeBalance?.toFixed(2, { groupSeparator: ',' })}</TYPE.white>
                </RowBetween>
                {/* <RowBetween>
                  <TYPE.white color="white">Unclaimed:</TYPE.white>
                  <TYPE.white color="white">
                    {ubeToClaim?.toFixed(4, { groupSeparator: ',' })}{' '}
                    {ubeToClaim && ubeToClaim.greaterThan('0') && (
                      <StyledInternalLink onClick={() => setShowUbeBalanceModal(false)} to="/farm">
                        (claim)
                      </StyledInternalLink>
                    )}
                  </TYPE.white>
                </RowBetween> */}
              {/* </AutoColumn> */}
            </CardSection>
            {/* <Break /> */}
          </>
        )}
        <CardSection gap="sm">
          <AutoColumn gap="md">
            <RowBetween>
              <TYPE.white color="white">MOBI price</TYPE.white>
              <TYPE.white color="white">${mobiprice?.toFixed(3) ?? '-'}</TYPE.white>
            </RowBetween>
            <RowBetween>
              <RowFixed>
                <TYPE.white color="white">MOBI in circulation</TYPE.white>
                <QuestionHelper text={'Total minted supply - treasury - unvested - staked'} />
              </RowFixed>
              <TYPE.white color="white">{ret?.supply?.toFixed(0, { groupSeparator: ',' }) ?? <Loader />}</TYPE.white>
            </RowBetween>
            <RowBetween>
              <TYPE.white color="white">Staked MOBI</TYPE.white>
              <TYPE.white color="white">{ret?.staked?.toFixed(0, { groupSeparator: ',' }) ?? <Loader />}</TYPE.white>
            </RowBetween>
            <RowBetween>
              <TYPE.white color="white">Total Supply</TYPE.white>
              <TYPE.white color="white">1,000,000,000</TYPE.white>
            </RowBetween>
            {ube && (
              <ExternalLink href={`https://info.ubeswap.org/token/${ube.address}`}>
                View MOBI Analytics on Ubeswap
              </ExternalLink>
            )}
            {ube && (
              <ExternalLink href={`https://nomics.com/assets/mobi3-mobius-money`}>View MOBI on Nomics</ExternalLink>
            )}
            {ube && (
              <ExternalLink
                href={`https://app.ubeswap.org/#/swap?outputCurrency=0x73a210637f6f6b7005512677ba6b3c96bb4aa44b`}
              >
                Trade MOBI on Ubeswap
              </ExternalLink>
            )}
          </AutoColumn>
        </CardSection>
        <CardNoise />
      </ModalUpper>
    </ContentWrapper>
  )
}
