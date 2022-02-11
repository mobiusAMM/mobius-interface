import { defaultAbiCoder, Interface } from '@ethersproject/abi'
import { Contract } from '@ethersproject/contracts'
import { TransactionResponse } from '@ethersproject/providers'
import { toUtf8String, Utf8ErrorFuncs } from '@ethersproject/strings'
import { formatUnits } from '@ethersproject/units'
// eslint-disable-next-line no-restricted-imports
import { TokenAmount } from '@ubeswap/sdk'
import { abi as GOV_ABI } from '@uniswap/governance/build/GovernorAlpha.json'
import { useWeb3Context } from 'hooks'
import { useGovernanceContract, useVotingEscrowContract } from 'hooks/useContract'
import { useCallback, useMemo } from 'react'
import { calculateGasMargin } from 'utils/calculateGasMargin'

import { CHAIN } from '../../constants'
import { VEMOBI } from '../../constants/tokens'
import { useLogs } from '../logs/hooks'
import { useSingleCallResult, useSingleContractMultipleData } from '../multicall/hooks'
import { useTransactionAdder } from '../transactions/hooks'
import { VoteOption } from './types'

interface ProposalDetail {
  target: string
  functionSig: string
  callData: string
}

export interface ProposalData {
  id: string
  title: string
  description: string
  proposer: string
  status: ProposalState
  forCount: number
  againstCount: number
  startBlock: number
  endBlock: number
  details: ProposalDetail[]
}

export interface CreateProposalData {
  targets: string[]
  values: string[]
  signatures: string[]
  calldatas: string[]
  description: string
}

export enum ProposalState {
  UNDETERMINED = -1,
  PENDING,
  ACTIVE,
  CANCELED,
  DEFEATED,
  SUCCEEDED,
  QUEUED,
  EXPIRED,
  EXECUTED,
}

const GovernanceInterface = new Interface(GOV_ABI)

// get count of all proposals made in the governor contract
function useProposalCount(contract: Contract | null): number | undefined {
  const { result } = useSingleCallResult(contract, 'proposalCount')

  return result?.[0]?.toNumber()
}

interface FormattedProposalLog {
  description: string
  details: { target: string; functionSig: string; callData: string }[]
}
/**
 * Need proposal events to get description data emitted from
 * new proposal event.
 */
function useFormattedProposalCreatedLogs(
  contract: Contract | null,
  indices: number[][]
): FormattedProposalLog[] | undefined {
  // create filters for ProposalCreated events
  const filter = useMemo(() => contract?.filters?.ProposalCreated(), [contract])

  const useLogsResult = useLogs(filter)

  return useMemo(() => {
    return useLogsResult?.logs
      ?.map((log) => {
        const parsed = GovernanceInterface.parseLog(log).args
        return parsed
      })
      ?.filter((parsed) => indices.flat().some((i) => i === parsed.id.toNumber()))
      ?.map((parsed) => {
        let description!: string
        try {
          description = parsed.description
        } catch (error) {
          // replace invalid UTF-8 in the description with replacement characters
          const onError = Utf8ErrorFuncs.replace

          // Bravo proposal reverses the codepoints for U+2018 (‘) and U+2026 (…)
          // const startBlock = parseInt(parsed.startBlock?.toString())
          // if (startBlock === BRAVO_START_BLOCK) {
          //   const U2018 = [0xe2, 0x80, 0x98].toString()
          //   const U2026 = [0xe2, 0x80, 0xa6].toString()
          //   onError = (reason, offset, bytes, output) => {
          //     if (reason === Utf8ErrorReason.UNEXPECTED_CONTINUE) {
          //       const charCode = [bytes[offset], bytes[offset + 1], bytes[offset + 2]].reverse().toString()
          //       if (charCode === U2018) {
          //         output.push(0x2018)
          //         return 2
          //       } else if (charCode === U2026) {
          //         output.push(0x2026)
          //         return 2
          //       }
          //     }
          //     return Utf8ErrorFuncs.replace(reason, offset, bytes, output)
          //   }
          // }

          description = JSON.parse(toUtf8String(error.error.value, onError)) || ''

          // Bravo proposal omits newlines
          description = description.replace(/ {2}/g, '\n').replace(/\d\. /g, '\n$&')
        }
        return {
          description,
          details: parsed.targets.map((target: string, i: number) => {
            const signature = parsed.signatures[i]
            const [name, types] = signature.substr(0, signature.length - 1).split('(')
            const calldata = parsed.calldatas[i]
            const decoded = defaultAbiCoder.decode(types.split(','), calldata)
            return {
              target,
              functionSig: name,
              callData: decoded.join(', '),
            }
          }),
        }
      })
  }, [indices, useLogsResult])
}

function countToIndices(count: number | undefined, skip = 0) {
  return typeof count === 'number' ? new Array(count - skip).fill(0).map((_, i) => [i + 1 + skip]) : []
}

// get data for all past and active proposals
export function useAllProposalData(): { data: ProposalData[]; loading: boolean } {
  const gov = useGovernanceContract()
  const proposalCount = useProposalCount(gov)

  const govProposalIndexes = useMemo(() => {
    return countToIndices(proposalCount)
  }, [proposalCount])

  const proposals = useSingleContractMultipleData(gov, 'proposals', govProposalIndexes)

  // get all proposal states
  const proposalStates = useSingleContractMultipleData(gov, 'state', govProposalIndexes)

  // get metadata from past events

  // early return until events are fetched
  const formattedLogs = useFormattedProposalCreatedLogs(gov, govProposalIndexes) ?? []
  return useMemo(() => {
    const proposalsCallData = proposals
    const proposalStatesCallData = proposalStates

    if (
      proposalsCallData.some((p) => p.loading) ||
      proposalStatesCallData.some((p) => p.loading) ||
      (gov && !formattedLogs)
    ) {
      return { data: [], loading: true }
    }

    return {
      data: proposalsCallData.map((proposal, i) => {
        const description = formattedLogs[i]?.description
        const startBlock = parseInt(proposal?.result?.startBlock?.toString())
        return {
          id: proposal?.result?.id.toString(),
          title: description?.split(/# |\n/g)[1] ?? 'Untitled',
          description: description ?? 'No description.',
          proposer: proposal?.result?.proposer,
          status: proposalStatesCallData[i]?.result?.[0] ?? ProposalState.UNDETERMINED,
          forCount: parseFloat(formatUnits(proposal?.result?.forVotes?.toString() ?? 0, 18)),
          againstCount: parseFloat(formatUnits(proposal?.result?.againstVotes?.toString() ?? 0, 18)),
          abstainCount: parseFloat(formatUnits(proposal?.result?.abstainVotes?.toString() ?? 0, 18)),
          startBlock,
          endBlock: parseInt(proposal?.result?.endBlock?.toString()),
          details: formattedLogs[i]?.details,
        }
      }),
      loading: false,
    }
  }, [formattedLogs, gov, proposalStates, proposals])
}

export function useProposalData(id: string): ProposalData | undefined {
  const { data } = useAllProposalData()
  return data.find((p) => p.id === id)
}

// gets the users current votes
export function useUserVotes(): { loading: boolean; votes: TokenAmount | undefined } {
  const { address, connected } = useWeb3Context()
  const veMOBIContract = useVotingEscrowContract()

  // check for available votes
  const { result, loading } = useSingleCallResult(veMOBIContract, 'balanceOf(address)', [
    connected ? address : undefined,
  ])
  return useMemo(() => {
    const veMOBI = VEMOBI[CHAIN]
    return { loading, votes: veMOBI && result ? new TokenAmount(veMOBI, result?.[0]) : undefined }
  }, [loading, result])
}

// fetch available votes as of block (usually proposal start block)
export function useUserVotesAsOfBlock(block: number | undefined): TokenAmount | undefined {
  const { connected, address } = useWeb3Context()
  const veMOBIContract = useVotingEscrowContract()

  // check for available votes
  const veMOBI = VEMOBI[CHAIN]
  const votes = useSingleCallResult(veMOBIContract, 'balanceOfAt(address, uint256)', [
    connected ? address : undefined,
    block ?? undefined,
  ])?.result?.[0]
  return votes && veMOBI ? new TokenAmount(veMOBI, votes) : undefined
}

export function useVoteCallback(): {
  voteCallback: (proposalId: string | undefined, voteOption: VoteOption) => undefined | Promise<string>
} {
  const { connected } = useWeb3Context()

  const GovernanceContract = useGovernanceContract()

  const addTransaction = useTransactionAdder()

  const voteCallback = useCallback(
    (proposalId: string | undefined, voteOption: VoteOption) => {
      if (!connected || !GovernanceContract || !proposalId) return
      return GovernanceContract.estimateGas
        .castVote(proposalId, voteOption === VoteOption.Against ? 0 : voteOption === VoteOption.For ? 1 : 2, {})
        .then((estimatedGasLimit) => {
          return GovernanceContract.castVote(
            proposalId,
            voteOption === VoteOption.Against ? 0 : voteOption === VoteOption.For ? 1 : 2,
            {
              gasLimit: calculateGasMargin(estimatedGasLimit),
            }
          ).then((response: TransactionResponse) => {
            addTransaction(response, {
              summary: `Vote ${
                voteOption == VoteOption.For ? 'yes' : voteOption == VoteOption.Against ? 'no' : 'none'
              } on proposal ${parseInt(proposalId)}`,
            })
            return response.hash
          })
        })
    },
    [connected, GovernanceContract, addTransaction]
  )
  return { voteCallback }
}

export function useCreateProposalCallback(): (
  createProposalData: CreateProposalData | undefined
) => undefined | Promise<string> {
  const { connected } = useWeb3Context()

  const GovernanceContract = useGovernanceContract()
  const addTransaction = useTransactionAdder()

  return useCallback(
    (createProposalData: CreateProposalData | undefined) => {
      if (!connected || !GovernanceContract || !createProposalData) return undefined

      return GovernanceContract.estimateGas
        .propose(
          createProposalData.targets,
          createProposalData.values,
          createProposalData.signatures,
          createProposalData.calldatas,
          createProposalData.description
        )
        .then((estimatedGasLimit) => {
          return GovernanceContract.propose(
            createProposalData.targets,
            createProposalData.values,
            createProposalData.signatures,
            createProposalData.calldatas,
            createProposalData.description,
            { gasLimit: calculateGasMargin(estimatedGasLimit) }
          ).then((response: TransactionResponse) => {
            addTransaction(response, {
              summary: 'Proposal created',
            })
            return response.hash
          })
        })
    },
    [connected, GovernanceContract, addTransaction]
  )
}

export function useLatestProposalId(address: string | undefined): string | undefined {
  const GovernanceContract = useGovernanceContract()
  const res = useSingleCallResult(GovernanceContract, 'latestProposalIds', [address])
  return res?.result?.[0]?.toString()
}

export function useProposalThreshold(): TokenAmount | undefined {
  const GovernanceContract = useGovernanceContract()
  const res = useSingleCallResult(GovernanceContract, 'proposalThreshold')
  const veMOBI = VEMOBI[CHAIN]

  if (res?.result?.[0] && veMOBI) {
    return new TokenAmount(veMOBI, res.result[0])
  }

  return undefined
}
