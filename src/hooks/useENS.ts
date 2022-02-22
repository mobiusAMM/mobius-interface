import ENS from '@ensdomains/ensjs'
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'

import { NOM_REGISTRY_ADDRESS } from '../constants'
import { isAddress } from '../utils'

/**
 * Given an address, does a lookup to resolve to a name
 * @param address address
 */
export default function useENS(address?: string | null): {
  loading: boolean
  address: string | null
  name: string | null
} {
  const validated = isAddress(address)
  const [name, setName] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const provider = new ethers.providers.JsonRpcProvider('https://forno.celo.org')
      const ens = new ENS({ provider, ensAddress: NOM_REGISTRY_ADDRESS })
      try {
        const { name } = await ens.getName(address)
        if (name) setName(`${name}.nom`)
      } catch (e) {
        console.error('Could not fetch name data', e)
      }
    })()
  }, [address])

  return {
    loading: false,
    address: validated ? validated : null,
    name,
  }
}
