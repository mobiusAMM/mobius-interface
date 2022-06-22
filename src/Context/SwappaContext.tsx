import { newKitFromWeb3 } from '@celo/contractkit'
import * as Swappa from '@mobius-money/swappa'
import { mainnetRegistriesWhitelist } from '@mobius-money/swappa'
import { CHAIN_INFO, ChainId } from '@ubeswap/sdk'
import axios from 'axios'
import * as React from 'react'
import Web3 from 'web3'

const DESCRIPTORS_PATH = 'https://raw.githubusercontent.com/mobiusAMM/swappa/main/descriptors.json'

export const SwappaContext = React.createContext<{
  initializing: boolean
  swappa?: Swappa.SwappaManager
}>({ initializing: true })

async function initializeSwappa(): Promise<Swappa.SwappaManager | undefined> {
  const web3 = new Web3(CHAIN_INFO[ChainId.MAINNET].fornoURL)
  const kit = newKitFromWeb3(web3)
  const registries = mainnetRegistriesWhitelist(kit)
  try {
    const swappa = new Swappa.SwappaManager(kit, Swappa.swappaRouterV1Address, registries, web3)
    const descriptors = await axios.get<Swappa.PairDescriptor[]>(DESCRIPTORS_PATH)
    await swappa.bulkInitializePairs(descriptors.data)
    return swappa
  } catch (e) {
    console.log(e)
    return undefined
  }
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
    const updater = setInterval(() => {
      if (manager) {
        manager.refreshPairs()
      }
    }, 60 * 1000)
    return () => {
      clearInterval(updater)
    }
  }, [setManager])

  return <SwappaContext.Provider value={{ initializing, swappa: manager }}>{children}</SwappaContext.Provider>
}
