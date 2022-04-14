import { ChainId } from 'lib/token-utils'

function parseNetwork(chainId: number): ChainId {
  return chainId === 62320 ? ChainId.Baklava : chainId === 44787 ? ChainId.Alfajores : ChainId.Mainnet
}

const networkChainIDFromHostname: ChainId = window.location.hostname.includes('alfajores')
  ? ChainId.Alfajores
  : window.location.hostname.includes('baklava')
  ? ChainId.Baklava
  : ChainId.Mainnet

export const NETWORK_CHAIN_ID: ChainId = process.env.REACT_APP_CHAIN_ID
  ? parseNetwork(parseInt(process.env.REACT_APP_CHAIN_ID))
  : networkChainIDFromHostname

console.log('Loading Mobius interface at', window.location.hostname, networkChainIDFromHostname, NETWORK_CHAIN_ID)
