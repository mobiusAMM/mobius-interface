import { invariant } from '@apollo/client/utilities/globals'
import { JSBI, Token, TokenAmount } from '@ubeswap/sdk'
import { getAllTokens } from 'hooks/Tokens'
import { useEffect, useMemo, useState } from 'react'
import { useBlockNumber } from 'state/application/hooks'

import ERC20_INTERFACE from '../../constants/abis/erc20'
import { useWeb3Context } from '../../hooks'
import { useMobi } from '../../hooks/Tokens'
import { useTokenContract } from '../../hooks/useContract'
import { isAddress } from '../../utils'
import { useMultipleContractSingleData } from '../multicall/hooks'

export function useTokenBalance(address?: string, token?: Token): TokenAmount | undefined {
  const tokenContract = useTokenContract(token?.address ?? undefined)
  const [tokenBalance, setTokenBalance] = useState<TokenAmount>()
  const block = useBlockNumber()
  useEffect(() => {
    const update = async () => {
      invariant(address && token)
      const amt = await tokenContract?.balanceOf(address)
      const balance = JSBI.BigInt(amt?.toString() || '0')
      setTokenBalance(new TokenAmount(token, balance))
    }
    token && address && update()
  }, [address, token, block, tokenContract])
  return token ? tokenBalance : undefined
}

/**
 * Returns a map of token addresses to their eventually consistent token balances for a single account.
 */
export function useTokenBalances(
  address?: string,
  tokens?: (Token | undefined)[]
): { [tokenAddress: string]: TokenAmount | undefined } {
  const validatedTokens: Token[] = useMemo(
    () => tokens?.filter((t?: Token): t is Token => isAddress(t?.address) !== false) ?? [],
    [tokens]
  )

  const validatedTokenAddresses = useMemo(() => validatedTokens.map((vt) => vt.address), [validatedTokens])
  const balances = useMultipleContractSingleData(validatedTokenAddresses, ERC20_INTERFACE, 'balanceOf', [address])

  return useMemo(
    () =>
      address && validatedTokens.length > 0
        ? validatedTokens.reduce<{ [tokenAddress: string]: TokenAmount | undefined }>((memo, token, i) => {
            const value = balances?.[i]?.result?.[0]
            const amount = value ? JSBI.BigInt(value.toString()) : undefined
            if (amount) {
              memo[token.address] = new TokenAmount(token, amount)
            }
            return memo
          }, {})
        : {},
    [address, validatedTokens, balances]
  )
}

// mimics useAllBalances
export function useAllTokenBalances(): { [tokenAddress: string]: TokenAmount | undefined } {
  const { address, connected } = useWeb3Context()
  const allTokens = getAllTokens()
  const allTokensArray = useMemo(() => allTokens ?? [], [allTokens])
  const balances = useTokenBalances(connected ? address : undefined, allTokensArray)
  return balances ?? {}
}

// get the total owned, unclaimed, and unharvested UBE for account
export function useAggregateUbeBalance(): TokenAmount | undefined {
  const { address, connected } = useWeb3Context()

  const mobi = useMobi()

  const ubeBalance: TokenAmount | undefined = useTokenBalance(connected ? address : undefined, mobi)

  if (!mobi) return undefined

  return ubeBalance
}
