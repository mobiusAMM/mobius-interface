import { defaultAbiCoder } from '@ethersproject/abi'
import { getAddress, isAddress } from '@ethersproject/address'
import { Token, TokenAmount } from '@ubeswap/sdk'
import { ButtonError } from 'components/Button'
import { BlueCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import { GAUGE_CONTROLLER, GAUGE_PROXY } from 'constants/StablePools'
import { useWeb3Context } from 'hooks'
import JSBI from 'jsbi'
import { Wrapper } from 'pages/Pool/styleds'
import React, { useCallback, useMemo, useState } from 'react'
import {
  CreateProposalData,
  ProposalState,
  useCreateProposalCallback,
  useLatestProposalId,
  useProposalData,
  useProposalThreshold,
  useUserVotes,
} from 'state/governance/hooks'
import { tryParseAmount } from 'state/swap/hooks'
import styled from 'styled-components/macro'
import { ExternalLink, TYPE } from 'theme'
import invariant from 'tiny-invariant'

import { CreateProposalTabs } from '../../components/NavigationTabs'
import { CHAIN } from '../../constants'
import { MOBI } from '../../constants/tokens'
import { ProposalActionDetail } from './ProposalActionDetail'
import { ProposalAction, ProposalActionSelector, ProposalActionSelectorModal } from './ProposalActionSelector'
import { ProposalEditor } from './ProposalEditor'
import { ProposalSubmissionModal } from './ProposalSubmissionModal'

const Upper = styled(AutoColumn)`
  border-radius: 20px;
  width: 640px;
  overflow: hidden;
  position: relative;
  padding: 1rem;
  background: ${({ theme }) => theme.bg1};
  color: ${({ theme }) => theme.text1} !important;
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  ${({ theme }) => theme.mediaWidth.upToSmall`
  padding-left: 0.25rem;
  padding-right: 0.25rem;
  max-width: 420px;
`}
`

const CreateProposalButton = ({
  proposalThreshold,
  hasActiveOrPendingProposal,
  hasEnoughVote,
  isFormInvalid,
  handleCreateProposal,
}: {
  proposalThreshold?: TokenAmount
  hasActiveOrPendingProposal: boolean
  hasEnoughVote: boolean
  isFormInvalid: boolean
  handleCreateProposal: () => void
}) => {
  const formattedProposalThreshold = proposalThreshold
    ? JSBI.divide(
        proposalThreshold.quotient,
        JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(proposalThreshold.currency.decimals))
      ).toLocaleString()
    : undefined
  return (
    <ButtonError
      style={{ marginTop: '18px' }}
      error={hasActiveOrPendingProposal || !hasEnoughVote}
      disabled={isFormInvalid || hasActiveOrPendingProposal || !hasEnoughVote}
      onClick={handleCreateProposal}
    >
      {hasActiveOrPendingProposal ? (
        <TYPE.main>You already have an active or pending proposal</TYPE.main>
      ) : !hasEnoughVote ? (
        <>
          {formattedProposalThreshold ? (
            <TYPE.main>You must have {formattedProposalThreshold} votes to submit a proposal</TYPE.main>
          ) : (
            <TYPE.main>You don&apos;t have enough votes to submit a proposal</TYPE.main>
          )}
        </>
      ) : (
        <TYPE.main>Create Proposal</TYPE.main>
      )}
    </ButtonError>
  )
}

const CreateProposalWrapper = styled(Wrapper)`
  display: flex;
  flex-flow: column wrap;
`

export default function CreateProposal() {
  const { connected, address } = useWeb3Context()

  const latestProposalId = useLatestProposalId(connected ? address : undefined) ?? '0'
  // the first argument below should be the index of the latest governor
  const latestProposalData = useProposalData(latestProposalId)
  const { votes: availableVotes } = useUserVotes()
  const proposalThreshold: TokenAmount | undefined = useProposalThreshold()

  const [modalOpen, setModalOpen] = useState(false)
  const [hash, setHash] = useState<string | undefined>()
  const [attempting, setAttempting] = useState(false)
  const [proposalAction, setProposalAction] = useState(ProposalAction.TRANSFER_TOKEN)
  const [toAddressValue, setToAddressValue] = useState('')
  const [gaugeAddressValue, setGaugeAddressValue] = useState('')
  const [currencyValue, setCurrencyValue] = useState<Token>(MOBI[CHAIN])
  const [amountValue, setAmountValue] = useState('')
  const [titleValue, setTitleValue] = useState('')
  const [bodyValue, setBodyValue] = useState('')

  const handleActionSelectorClick = useCallback(() => {
    setModalOpen(true)
  }, [setModalOpen])

  const handleActionChange = useCallback(
    (proposalAction: ProposalAction) => {
      setProposalAction(proposalAction)
    },
    [setProposalAction]
  )

  const handleDismissActionSelector = useCallback(() => {
    setModalOpen(false)
  }, [setModalOpen])

  const handleDismissSubmissionModal = useCallback(() => {
    setHash(undefined)
    setAttempting(false)
  }, [setHash, setAttempting])

  const handleToAddressInput = useCallback(
    (toAddress: string) => {
      setToAddressValue(toAddress)
    },
    [setToAddressValue]
  )

  const handleGaugeAddressInput = useCallback(
    (gaugeAddress: string) => {
      setGaugeAddressValue(gaugeAddress)
    },
    [setGaugeAddressValue]
  )

  const handleCurrencySelect = useCallback(
    (currency: Token) => {
      setCurrencyValue(currency)
    },
    [setCurrencyValue]
  )

  const handleAmountInput = useCallback(
    (amount: string) => {
      setAmountValue(amount)
    },
    [setAmountValue]
  )

  const handleTitleInput = useCallback(
    (title: string) => {
      setTitleValue(title)
    },
    [setTitleValue]
  )

  const handleBodyInput = useCallback(
    (body: string) => {
      setBodyValue(body)
    },
    [setBodyValue]
  )

  const isFormInvalid = useMemo(
    () =>
      Boolean(
        !proposalAction ||
          (proposalAction === ProposalAction.TRANSFER_TOKEN && !isAddress(toAddressValue)) ||
          ((proposalAction === ProposalAction.ADD_GAUGE || proposalAction === ProposalAction.KILL_GAUGE) &&
            !isAddress(gaugeAddressValue)) ||
          (proposalAction === ProposalAction.TRANSFER_TOKEN && amountValue === '') ||
          titleValue === '' ||
          bodyValue === ''
      ),
    [proposalAction, toAddressValue, gaugeAddressValue, amountValue, titleValue, bodyValue]
  )

  const hasEnoughVote = Boolean(
    availableVotes && proposalThreshold && JSBI.greaterThanOrEqual(availableVotes.quotient, proposalThreshold.quotient)
  )

  const createProposalCallback = useCreateProposalCallback()

  const handleCreateProposal = useCallback(async () => {
    setAttempting(true)

    const createProposalData: CreateProposalData = {} as CreateProposalData

    if (!createProposalCallback || !proposalAction) return

    const tokenAmount = tryParseAmount(amountValue, currencyValue)
    if (!tokenAmount && proposalAction === ProposalAction.TRANSFER_TOKEN) return
    switch (proposalAction) {
      case ProposalAction.TRANSFER_TOKEN: {
        createProposalData.targets = [currencyValue.address]
        break
      }
      case ProposalAction.ADD_GAUGE: {
        createProposalData.targets = [GAUGE_CONTROLLER[CHAIN]]
        break
      }
      case ProposalAction.KILL_GAUGE: {
        createProposalData.targets = [GAUGE_PROXY[CHAIN]]
        break
      }
    }
    createProposalData.values = ['0']
    createProposalData.description = `# ${titleValue}

${bodyValue}
`

    let types: string[][]
    let values: string[][]
    switch (proposalAction) {
      case ProposalAction.TRANSFER_TOKEN: {
        invariant(tokenAmount, 'token amount')
        types = [['address', 'uint256']]
        values = [[getAddress(toAddressValue), tokenAmount.quotient.toString()]]
        createProposalData.signatures = [`transfer(${types[0].join(',')})`]
        break
      }

      case ProposalAction.ADD_GAUGE: {
        types = [['address', 'int128', 'uint256']]
        values = [[getAddress(gaugeAddressValue), '0', '0']]
        createProposalData.signatures = [`add_gauge(${types[0].join(',')})`]
        break
      }

      case ProposalAction.KILL_GAUGE: {
        types = [['address', 'bool']]
        values = [[getAddress(gaugeAddressValue), '1']]
        createProposalData.signatures = [`set_killed(${types[0].join(',')})`]
      }
    }

    createProposalData.calldatas = []
    for (let i = 0; i < createProposalData.signatures.length; i++) {
      createProposalData.calldatas[i] = defaultAbiCoder.encode(types[i], values[i])
    }

    const hash = await createProposalCallback(createProposalData ?? undefined)?.catch(() => {
      setAttempting(false)
    })

    if (hash) setHash(hash)
  }, [
    amountValue,
    bodyValue,
    createProposalCallback,
    currencyValue,
    gaugeAddressValue,
    proposalAction,
    titleValue,
    toAddressValue,
  ])

  return (
    <Upper>
      <CreateProposalTabs />
      <CreateProposalWrapper>
        <BlueCard>
          <AutoColumn gap="10px">
            <TYPE.link fontWeight={400} color={'primaryText1'}>
              <TYPE.main>
                <strong>Tip:</strong> Select an action and describe your proposal for the community. The proposal cannot
                be modified after submission, so please verify all information before submitting. The voting period will
                begin after 1 day and last for 3 days. To propose a custom action,
                <ExternalLink href="https://github.com/mobiusAMM/mobius-governance/blob/main/README.md">
                  {' read the docs'}
                </ExternalLink>
                .
              </TYPE.main>
            </TYPE.link>
          </AutoColumn>
        </BlueCard>

        <ProposalActionSelector onClick={handleActionSelectorClick} proposalAction={proposalAction} />
        <ProposalActionDetail
          proposalAction={proposalAction}
          currency={currencyValue}
          amount={amountValue}
          toAddress={toAddressValue}
          gaugeAddress={gaugeAddressValue}
          onCurrencySelect={handleCurrencySelect}
          onAmountInput={handleAmountInput}
          onToAddressInput={handleToAddressInput}
          onGaugeAddressInput={handleGaugeAddressInput}
        />
        <ProposalEditor
          title={titleValue}
          body={bodyValue}
          onTitleInput={handleTitleInput}
          onBodyInput={handleBodyInput}
        />
        <CreateProposalButton
          proposalThreshold={proposalThreshold}
          hasActiveOrPendingProposal={
            latestProposalData?.status === ProposalState.ACTIVE || latestProposalData?.status === ProposalState.PENDING
          }
          hasEnoughVote={hasEnoughVote}
          isFormInvalid={isFormInvalid}
          handleCreateProposal={handleCreateProposal}
        />
      </CreateProposalWrapper>
      <ProposalActionSelectorModal
        isOpen={modalOpen}
        onDismiss={handleDismissActionSelector}
        onProposalActionSelect={(proposalAction: ProposalAction) => handleActionChange(proposalAction)}
      />
      <ProposalSubmissionModal isOpen={attempting} hash={hash} onDismiss={handleDismissSubmissionModal} />
    </Upper>
  )
}
