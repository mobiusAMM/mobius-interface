import { ContractKit, newKitFromWeb3 } from '@celo/contractkit'
import * as Swappa from '@mobius-money/swappa'
import { mainnetRegistryMobius, mainnetRegistryMoolaV2, mainnetRegistryUbeswap } from '@mobius-money/swappa'
import { CHAIN_INFO, ChainId } from '@ubeswap/sdk'
import { STATIC_POOL_INFO } from 'constants/StablePools'
import { getAllTokens } from 'hooks/Tokens'
import * as React from 'react'
import Web3 from 'web3'

export const SwappaContext = React.createContext<{
  initializing: boolean
  swappa?: Swappa.SwappaManager
}>({ initializing: true })

const genRegistries = (kit: ContractKit) => [
  mainnetRegistryMobius(kit),
  mainnetRegistryMoolaV2(kit),
  mainnetRegistryUbeswap(kit),
]

async function initializeSwappa(): Promise<Swappa.SwappaManager | undefined> {
  const web3 = new Web3(CHAIN_INFO[ChainId.MAINNET].fornoURL)
  const kit = newKitFromWeb3(web3)
  const registries = genRegistries(kit)
  console.log(STATIC_POOL_INFO[ChainId.MAINNET].map(({ address }) => address))
  // const mobiusRegistry = new Swappa.RegistryStatic(
  //   'mobius',
  //   new Promise((resolve) =>
  //     resolve(
  //       STATIC_POOL_INFO[ChainId.MAINNET].map(({ address }) => {
  //         return new Swappa.PairStableSwap(ChainId.MAINNET, web3, address)
  //       })
  //     )
  //   )
  // )
  try {
    const supportedTokens = getAllTokens()
    const swappa = new Swappa.SwappaManager(kit, Swappa.swappaRouterV1Address, registries)
    await swappa.reinitializePairs(supportedTokens?.map(({ address }) => address) ?? [])
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
