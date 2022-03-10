import { ContractKit } from '@celo/contractkit'
import { Connector, useContractKit, useProvider } from '@celo-tools/use-contractkit'
import { Web3Provider } from '@ethersproject/providers'
import { useMemo } from 'react'

import { CHAIN } from '../../constants'

type onChainProvider = {
  connect: () => Promise<Connector>
  disconnect: () => void
  kit: ContractKit
  provider: Web3Provider
  address: string
  connected: boolean
  chainID: number
  providerChainID: number
}

export type Web3ContextData = {
  onChainProvider: onChainProvider
} | null

export const useWeb3Context = () => {
  const chainID = CHAIN
  const providerChainID = CHAIN

  let connected = false
  let address = ''

  const uck = useContractKit()
  const provider = useProvider()

  if (uck.address) {
    connected = true
    address = uck.address
  }
  return useMemo(
    () => ({
      connect: uck.connect,
      disconnect: uck.destroy,
      kit: uck.kit,
      provider,
      connected,
      address,
      chainID,
      providerChainID,
    }),
    [address, chainID, connected, provider, providerChainID, uck.connect, uck.destroy, uck.kit]
  )
}

export const useAddress = () => {
  const { address } = useWeb3Context()
  return address
}
