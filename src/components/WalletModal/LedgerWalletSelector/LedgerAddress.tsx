import React from 'react'
import { shortenAddress } from 'utils'

import { InfoCard } from '.'

interface Props {
  address: string
  tryActivation: () => Promise<void>
}

export const LedgerAddress = ({ address, tryActivation }: Props) => {
  return (
    <InfoCard
      onClick={() => {
        tryActivation()
      }}
    >
      <span>{shortenAddress(address)}</span>
    </InfoCard>
  )
}
