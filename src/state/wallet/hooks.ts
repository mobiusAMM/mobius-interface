import { JSBI, Token, TokenAmount } from '@ubeswap/sdk'
import { useEffect, useMemo, useState } from 'react'
import { useBlockNumber } from 'state/application/hooks'

import ERC20_INTERFACE from '../../constants/abis/erc20'
import { useWeb3Context } from '../../hooks'
import { useAllTokens, useMobi } from '../../hooks/Tokens'
import { useTokenContract } from '../../hooks/useContract'
import { isAddress } from '../../utils'
import { useMultipleContractSingleData } from '../multicall/hooks'

export function useTokenBalanceSingle(address?: string, token?: Token | undefined): TokenAmount | undefined {
  const tokenContract = useTokenContract(token?.address ?? undefined)
  const [tokenBalance, setTokenBalance] = useState<TokenAmount>()
  const block = useBlockNumber()
  useEffect(() => {
    const update = async () => {
      const amt = await tokenContract?.balanceOf(address)
      const balance = JSBI.BigInt(amt?.toString() || '0')
      setTokenBalance(new TokenAmount(token, balance))
    }
    token && address && update()
  }, [address, token, block])
  return token ? tokenBalance : undefined
}

export function useTokenBalanceDirect(
  address?: string,
  tokens?: (Token | undefined)[]
): [{ [tokenAddress: string]: TokenAmount | undefined }, boolean] {
  const tokenContract = useTokenContract(tokens.length > 0 ? tokens[0].address : undefined)
  const [tokenBalances, setTokenBalances] = useState<{ [tokenAddress: string]: TokenAmount | undefined }>()
  const loading = false
  useEffect(() => {
    const updateToken = async (token: Token) => {
      const contract = tokenContract?.attach(token.address)
      const balance = JSBI.BigInt((await contract?.balanceOf(address))?.toString() || '0')
      setTokenBalances({
        ...tokenBalances,
        [token.address]: new TokenAmount(token, balance),
      })
    }
    tokens?.filter((t) => !!t).forEach((t) => updateToken(t))
  }, [address, tokens])
  return tokenBalances ? [tokenBalances, loading] : [{}, loading]
}

/**
 * Returns a map of token addresses to their eventually consistent token balances for a single account.
 */
export function useTokenBalancesWithLoadingIndicator(
  address?: string,
  tokens?: (Token | undefined)[]
): [{ [tokenAddress: string]: TokenAmount | undefined }, boolean] {
  const validatedTokens: Token[] = useMemo(
    () => tokens?.filter((t?: Token): t is Token => isAddress(t?.address) !== false) ?? [],
    [tokens]
  )

  const validatedTokenAddresses = useMemo(() => validatedTokens.map((vt) => vt.address), [validatedTokens])
  const balances = useMultipleContractSingleData(validatedTokenAddresses, ERC20_INTERFACE, 'balanceOf', [address])

  const anyLoading: boolean = useMemo(() => balances.some((callState) => callState.loading), [balances])

  return [
    useMemo(
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
    ),
    anyLoading,
  ]
}

export function useTokenBalances(
  address?: string,
  tokens?: (Token | undefined)[]
): { [tokenAddress: string]: TokenAmount | undefined } {
  return useTokenBalancesWithLoadingIndicator(address, tokens)[0]
}

// get the balance for a single token/account combo
export function useTokenBalance(account?: string, token?: Token): TokenAmount | undefined {
  const tokenBalances = useTokenBalances(account, [token])
  if (!token) return undefined
  return tokenBalances[token.address]
}

export function useCurrencyBalances(account?: string, currencies?: (Token | undefined)[]): (TokenAmount | undefined)[] {
  const tokens = useMemo(
    () => currencies?.filter((currency): currency is Token => currency instanceof Token) ?? [],
    [currencies]
  )

  const tokenBalances = useTokenBalances(account, tokens)

  return useMemo(
    () =>
      currencies?.map((currency) => {
        if (!account || !currency) return undefined
        if (currency instanceof Token) return tokenBalances[currency.address]
        return undefined
      }) ?? [],
    [account, currencies, tokenBalances]
  )
}

export function useCurrencyBalance(account?: string, currency?: Token): TokenAmount | undefined {
  return useCurrencyBalances(account, [currency])[0]
}

// mimics useAllBalances
export function useAllTokenBalances(): { [tokenAddress: string]: TokenAmount | undefined } {
  const { address, connected } = useWeb3Context()
  const allTokens = useAllTokens()
  const allTokensArray = useMemo(() => Object.values(allTokens ?? {}), [allTokens])
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
