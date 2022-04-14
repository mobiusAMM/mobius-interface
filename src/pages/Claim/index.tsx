import React from 'react'
import { useLocation } from 'react-router'
import { useClaimInfo } from 'state/claim/hooks'
import { VestType } from 'state/claim/reducer'
import UpdateClaim from 'state/claim/updater'
import styled from 'styled-components'

import { ClaimCard } from '../../components/claim/ClaimCard'
import { AutoColumn } from '../../components/Column'

const PageWrapper = styled(AutoColumn)`
  max-width: 640px;
  width: 100%;
  margin-top: 3rem;
`

const PoolSection = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  column-gap: 10px;
  row-gap: 15px;
  width: 100%;
  justify-self: center;
`

export default function Claim() {
  const { pathname } = useLocation()
  const type = pathname.includes('founder')
    ? VestType.FOUNDER
    : pathname.includes('investor')
    ? VestType.INVESTOR
    : pathname.includes('advisor')
    ? VestType.ADVISOR
    : VestType.LP
  const claim = useClaimInfo(type)

  return (
    <PageWrapper gap="lg" justify="center">
      <UpdateClaim />
      <AutoColumn gap="lg" style={{ width: '100%', maxWidth: '720px' }}>
        <PoolSection>
          <ClaimCard info={claim} type={type} />
        </PoolSection>
      </AutoColumn>
    </PageWrapper>
  )
}
