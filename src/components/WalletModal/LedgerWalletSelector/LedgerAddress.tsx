import { AbstractConnector } from '@web3-react/abstract-connector'
import { LedgerConnector, LedgerKit } from 'connectors/ledger/LedgerConnector'
import React from 'react'
import { shortenAddress } from 'utils'

import { InfoCard } from '.'

interface Props {
  index: number
  address: string
  kit: LedgerKit
  tryActivation: (connector: AbstractConnector | undefined) => Promise<void>
}

export const LedgerAddress = ({ address, kit, tryActivation, index }: Props) => {
  return (
    <InfoCard
      onClick={() => {
        const connector = new LedgerConnector({ kit, index })
        tryActivation(connector)
      }}
    >
      <span>{shortenAddress(address)}</span>
    </InfoCard>
  )
}
