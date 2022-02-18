import { JsonRpcProvider, StaticJsonRpcProvider, Web3Provider } from '@ethersproject/providers'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { LedgerConnector, LedgerKit } from 'connectors/ledger/LedgerConnector'
import React, { ReactNode, useCallback, useContext, useMemo, useState } from 'react'
import Web3Modal from 'web3modal'

import Ledger from '../../assets/svg/ledger.svg'
import { CHAIN } from '../../constants'

type onChainProvider = {
  connect: () => Promise<Web3Provider>
  disconnect: () => void
  checkWrongNetwork: () => Promise<boolean>
  provider: JsonRpcProvider
  address: string
  connected: boolean
  web3Modal: Web3Modal
  chainID: number
  web3?: any
  providerChainID: number
  hasCachedProvider: () => boolean
}

export type Web3ContextData = {
  onChainProvider: onChainProvider
} | null

const Web3Context = React.createContext<Web3ContextData>(null)

export const useWeb3Context = () => {
  const web3Context = useContext(Web3Context)
  if (!web3Context) {
    throw new Error(
      'useWeb3Context() can only be used inside of <Web3ContextProvider />, ' + 'please declare it at a higher level.'
    )
  }
  const { onChainProvider } = web3Context
  return useMemo(() => {
    return { ...onChainProvider }
  }, [onChainProvider])
}

export const useAddress = () => {
  const { address } = useWeb3Context()
  return address
}

//TODO make dynamic for alfajores
const switchRequest = () => {
  console.log(window.ethereum)
  return window.ethereum?.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: '0xA4EC' }],
  })
}

const addChainRequest = () => {
  return window.ethereum?.request({
    method: 'wallet_addEthereumChain',
    params: [
      {
        chainId: '0xA4EC',
        chainName: 'Celo Mainnet',
        rpcUrls: ['https://forno.celo.org'],
        blockExplorerUrls: ['https://explorer.celo.org'],
        nativeCurrency: {
          name: 'CELO',
          symbol: 'CELO',
          decimals: 18,
        },
      },
    ],
  })
}

export const switchNetwork = async () => {
  if (window.ethereum) {
    try {
      await switchRequest()
    } catch (error: any) {
      if (error.code === 4902) {
        try {
          await addChainRequest()
          await switchRequest()
        } catch (addError) {
          console.log(error)
        }
      }
      console.log(error)
    }
  }
}

export const Web3ContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [connected, setConnected] = useState(false)
  const [chainID] = useState(CHAIN)
  const [providerChainID, setProviderChainID] = useState(CHAIN)
  const [address, setAddress] = useState('')

  // TODO: make dynamic
  const uri = 'https://forno.celo.org'
  const [provider, setProvider] = useState<JsonRpcProvider>(new StaticJsonRpcProvider(uri))

  const [web3Modal] = useState<Web3Modal>(
    new Web3Modal({
      cacheProvider: true,
      providerOptions: {
        walletconnect: {
          package: WalletConnectProvider,
          options: {
            rpc: {
              [42220]: uri,
            },
          },
        },
        'custom-ledger': {
          display: {
            logo: Ledger,
            name: 'Celo Ledger',
            description: 'Connect to your Celo Ledger Wallet',
          },
          package: LedgerConnector,
          options: {
            index: 0,
          },
          connector: async (p, options) => {
            const ledgerKit = await LedgerKit.init(CHAIN, [options.index])
            const re: LedgerConnector = new p({ kit: ledgerKit, index: options.index })
            re.showModal()
            return (await re.activate()).provider
          },
        },
      },
    })
  )

  const hasCachedProvider = (): boolean => {
    if (!web3Modal) return false
    if (!web3Modal.cachedProvider) return false
    return true
  }

  const _initListeners = useCallback(
    (rawProvider: JsonRpcProvider) => {
      if (!rawProvider.on) {
        return
      }

      rawProvider.on('accountsChanged', () => setTimeout(() => window.location.reload(), 1))

      rawProvider.on('chainChanged', async (chain: number) => {
        changeNetwork(chain)
      })

      rawProvider.on('network', (_newNetwork, oldNetwork) => {
        if (!oldNetwork) return
        window.location.reload()
      })
    },
    [provider]
  )

  const changeNetwork = async (otherChainID: number) => {
    const network = Number(otherChainID)

    setProviderChainID(network)
  }

  const connect = useCallback(async () => {
    const rawProvider = await web3Modal.connect()

    _initListeners(rawProvider)

    const connectedProvider = new Web3Provider(rawProvider, 'any')

    const chainId = await connectedProvider.getNetwork().then((network) => Number(network.chainId))
    const connectedAddress = await connectedProvider.getSigner()?.getAddress()

    setAddress(connectedAddress)

    setProviderChainID(chainId)

    if (chainId === CHAIN) {
      setProvider(connectedProvider)
    } else {
      //TODO: is it possible to connect wallet after?
      await switchNetwork()
      window.location.reload()
    }

    setConnected(true)

    return connectedProvider
  }, [web3Modal, _initListeners])

  const checkWrongNetwork = async (): Promise<boolean> => {
    if (providerChainID !== CHAIN) {
      await switchNetwork()
      window.location.reload()
      await connect()
      return true
    }
    return false
  }

  const disconnect = useCallback(async () => {
    web3Modal.clearCachedProvider()
    setConnected(false)

    setTimeout(() => {
      window.location.reload()
    }, 1)
  }, [web3Modal])

  const onChainProvider = useMemo(
    () => ({
      connect,
      disconnect,
      hasCachedProvider,
      provider,
      connected,
      address,
      chainID,
      web3Modal,
      providerChainID,
      checkWrongNetwork,
    }),
    [connect, disconnect, hasCachedProvider, provider, connected, address, chainID, web3Modal, providerChainID]
  )
  return <Web3Context.Provider value={{ onChainProvider }}>{children}</Web3Context.Provider>
}
