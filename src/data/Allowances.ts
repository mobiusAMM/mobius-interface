import useCurrentBlockTimestamp from 'hooks/useCurrentBlockTimestamp'
import { Token, TokenAmount } from 'lib/token-utils'
import { useEffect, useMemo, useState } from 'react'
import { useBlockNumber } from 'state/application/hooks'

import { useTokenContract } from '../hooks/useContract'

export function useTokenAllowance(token?: Token, owner?: string, spender?: string): TokenAmount | undefined {
  const contract = useTokenContract(token?.address, false)
  const time = useCurrentBlockTimestamp()
  const block = useBlockNumber()

  const [allowance, setAllowance] = useState<string>('')
  useEffect(() => {
    async function getAllowance() {
      if (!owner || !spender) return
      const newAllowance = await contract?.allowance(owner, spender)
      setAllowance(newAllowance?.toString() ?? '0')
    }
    getAllowance()
  }, [token, allowance, block, time, owner, spender, contract])

  return useMemo(
    () => (token && allowance ? new TokenAmount(token, allowance.toString()) : undefined),
    [token, allowance]
  )
}
