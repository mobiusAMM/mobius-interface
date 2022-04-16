import { newKitFromWeb3 } from '@celo/contractkit'
import * as Swappa from '@terminal-fi/swappa'
import { mainnetRegistriesWhitelist } from '@terminal-fi/swappa'
import { CHAIN_INFO, ChainId } from '@ubeswap/sdk'
import { StablePools } from 'constants/pools'
import { getAllTokens } from 'hooks/Tokens'
import * as React from 'react'
import Web3 from 'web3'

export const SwappaContext = React.createContext<{
  initializing: boolean
  swappa?: Swappa.SwappaManager
}>({ initializing: true })

async function initializeSwappa(): Promise<Swappa.SwappaManager> {
  const web3 = new Web3(CHAIN_INFO[ChainId.MAINNET].fornoURL)
  const kit = newKitFromWeb3(web3)
  const registries = mainnetRegistriesWhitelist(kit).filter((reg) => reg.getName() !== 'mobius')
  const mobiusRegistry = new Swappa.RegistryStatic(
    'mobius',
    new Promise((resolve) =>
      resolve(
        StablePools[ChainId.MAINNET].map((pool) => {
          return new Swappa.PairStableSwap(ChainId.MAINNET, web3, pool.pool.address)
        })
      )
    )
  )
  const supportedTokens = getAllTokens()
  const swappa = new Swappa.SwappaManager(kit, Swappa.swappaRouterV1Address, [...registries, mobiusRegistry])
  await swappa.reinitializePairs(supportedTokens?.map(({ address }) => address) ?? [])
  return swappa
}

export default function SwappaContextProvider({ children }: { children: React.ReactNode }) {
  const [initializing, setInitializing] = React.useState<boolean>(true)
  const [manager, setManager] = React.useState<Swappa.SwappaManager>()

  React.useEffect(() => {
    ;(async () => {
      setInitializing(true)
      const time = Date.now()
      console.log('initializing buckets')
      setManager(await initializeSwappa())
      setInitializing(false)
      console.log(`Done initializing buckets, took ${(Date.now() - time) / 1000} seconds`)
    })()
  }, [setManager])

  return <SwappaContext.Provider value={{ initializing, swappa: manager }}>{children}</SwappaContext.Provider>
}
