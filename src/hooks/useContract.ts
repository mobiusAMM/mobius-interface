import { Contract } from '@ethersproject/contracts'
import { GOVERNANCE_ADDRESS } from 'constants/governance'
import { GAUGE_CONTROLLER as GAUGE_CONTROLLER_ADDRESS, MOBIUS_MINTER_ADDRESS } from 'constants/StablePools'
import { VEMOBI } from 'constants/tokens'
import { useMemo } from 'react'

import { CHAIN } from '../constants'
import CONSTANT_SUM from '../constants/abis/ConstantSum.json'
import ERC20_ABI from '../constants/abis/erc20'
import ERC20_MOBI from '../constants/abis/ERC20MOBI.json'
import EXCHANGE from '../constants/abis/Exchange.json'
import GAUGE_CONTROLLER from '../constants/abis/GaugeController.json'
import GOVERNOR_ABI from '../constants/abis/GovernorBravoDelegate.json'
import LIQUIDITY_GAUGE_V3 from '../constants/abis/LiquidityGaugeV3.json'
import LP from '../constants/abis/LPToken.json'
import MINTER from '../constants/abis/Minter.json'
import STAKING_REWARDS_ABI from '../constants/abis/StakingRewards.json'
import STABLE_SWAP from '../constants/abis/Swap.json'
import VESTING_ABI from '../constants/abis/VestingEscrow.json'
import VOTING_ESCROW from '../constants/abis/VotingEscrow.json'
import { MULTICALL_ABI, MULTICALL_NETWORKS } from '../constants/multicall'
import {
  ConstantSum,
  Erc20,
  ERC20MOBI,
  Exchange,
  GaugeController,
  GovernorBravoDelegate,
  LiquidityGaugeV3,
  Minter,
  StakingRewards,
  Swap,
  VestingEscrow,
  VotingEscrow,
} from '../generated'
import { getContract } from '../utils'
import { useWeb3Context } from './index'
import { useMobi } from './Tokens'

// returns null on errors
function useContract(address: string | undefined, ABI: any, withSignerIfPossible = true): Contract | null {
  const { provider, connected } = useWeb3Context()

  return useMemo(() => {
    if (!address || !ABI || !provider) return null
    try {
      return getContract(address, ABI, provider, connected && withSignerIfPossible)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [address, ABI, provider, connected])
}

export function useTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Erc20 | null {
  return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible) as Erc20 | null
}

export function useLiquidityGaugeContract(address?: string, withSignerIfPossible?: boolean): LiquidityGaugeV3 | null {
  return useContract(address, LIQUIDITY_GAUGE_V3.abi, withSignerIfPossible) as LiquidityGaugeV3
}

export function useMobiContract(address?: string, withSignerIfPossible?: boolean): ERC20MOBI | null {
  const mobi = useMobi()
  return useContract(address ?? mobi?.address, ERC20_MOBI.abi, withSignerIfPossible) as ERC20MOBI
}

export function useGovernanceContract(address?: string, withSignerIfPossible?: boolean): GovernorBravoDelegate | null {
  const govAddress = GOVERNANCE_ADDRESS[CHAIN]
  return useContract(address ?? govAddress, GOVERNOR_ABI.abi, withSignerIfPossible) as GovernorBravoDelegate
}

export function useMobiMinterContract(address?: string, withSignerIfPossible?: boolean): Minter | null {
  return useContract(address ?? MOBIUS_MINTER_ADDRESS[CHAIN], MINTER.abi, withSignerIfPossible) as Minter
}

export function useVotingEscrowContract(address?: string, withSignerIfPossible?: boolean): VotingEscrow | null {
  return useContract(address ?? VEMOBI[CHAIN].address, VOTING_ESCROW.abi, withSignerIfPossible) as VotingEscrow
}

export function useGaugeControllerContract(address?: string, withSignerIfPossible?: boolean): GaugeController | null {
  const fallBackAddress = GAUGE_CONTROLLER_ADDRESS[CHAIN]
  return useContract(address ?? fallBackAddress, GAUGE_CONTROLLER.abi, withSignerIfPossible) as GaugeController
}

export function useConstantSumContract(address?: string, withSignerIfPossible?: boolean): ConstantSum | null {
  return useContract(address, CONSTANT_SUM.abi, withSignerIfPossible) as ConstantSum
}

export function useStableSwapContract(swapAddress?: string, withSignerIfPossible?: boolean): Swap | null {
  return useContract(swapAddress, STABLE_SWAP.abi, withSignerIfPossible) as Swap | null
}

export function useLpTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Erc20 | null {
  return useContract(tokenAddress, LP.abi, withSignerIfPossible) as Erc20 | null
}

export function UseMentoContract(exchangeAddress: string, withSignerIfPossible?: boolean): Exchange | null {
  return useContract(exchangeAddress, EXCHANGE, withSignerIfPossible) as Exchange | null
}

export function useMulticallContract(): Contract | null {
  return useContract(MULTICALL_NETWORKS[CHAIN], MULTICALL_ABI, false)
}

export function useStakingContract(stakingAddress?: string, withSignerIfPossible?: boolean): StakingRewards | null {
  return useContract(stakingAddress, STAKING_REWARDS_ABI, withSignerIfPossible) as StakingRewards | null
}

export function useVestingContract(address?: string, withSignerIfPossible?: boolean): VestingEscrow | null {
  return useContract(
    address ?? '0x9ff6d45F5900D7aCBdCb6d79fFFf22C9F63dF040',
    VESTING_ABI.abi,
    withSignerIfPossible
  ) as VestingEscrow | null
}
