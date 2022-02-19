import React, { useContext, useState } from 'react'
import { ArrowUpCircle, X } from 'react-feather'
import styled, { ThemeContext } from 'styled-components/macro'

import Circle from '../../assets/images/blue-loader.svg'
import { useUserVotes, useVoteCallback } from '../../state/governance/hooks'
import { VoteOption } from '../../state/governance/types'
import { CustomLightSpinner, TYPE } from '../../theme'
import { ExternalLink } from '../../theme/components'
import { ButtonPrimary } from '../Button'
import { AutoColumn, ColumnCenter } from '../Column'
import Modal from '../Modal'
import { RowBetween } from '../Row'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 24px;
`

const StyledClosed = styled(X)`
  :hover {
    cursor: pointer;
  }
`

const ConfirmOrLoadingWrapper = styled.div`
  width: 100%;
  padding: 24px;
`

const ConfirmedIcon = styled(ColumnCenter)`
  padding: 60px 0;
`

interface VoteModalProps {
  isOpen: boolean
  onDismiss: () => void
  voteOption: VoteOption | undefined
  proposalId: string | undefined // id for the proposal to vote on
}

export default function VoteModal({ isOpen, onDismiss, proposalId, voteOption }: VoteModalProps) {
  const { voteCallback } = useVoteCallback()
  const { votes: availableVotes } = useUserVotes()

  // monitor call to help UI loading state
  const [hash, setHash] = useState<string | undefined>()
  const [attempting, setAttempting] = useState<boolean>(false)

  // get theme for colors
  const theme = useContext(ThemeContext)

  // wrapper to reset state on modal close
  function wrappedOndismiss() {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }

  async function onVote() {
    setAttempting(true)

    // if callback not returned properly ignore
    if (!voteCallback || voteOption === undefined) return

    // try delegation and store hash
    const hash = await voteCallback(proposalId, voteOption)?.catch((error) => {
      setAttempting(false)
      console.log(error)
    })

    if (hash) {
      setHash(hash)
    }
  }

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOndismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          <AutoColumn gap="lg" justify="center">
            <RowBetween>
              {voteOption === VoteOption.Against ? (
                <TYPE.white>Vote against proposal {proposalId}</TYPE.white>
              ) : voteOption === VoteOption.For ? (
                <TYPE.white>Vote for proposal {proposalId}</TYPE.white>
              ) : (
                <TYPE.white>Vote to abstain on proposal {proposalId}</TYPE.white>
              )}
              <StyledClosed stroke="black" onClick={wrappedOndismiss} />
            </RowBetween>
            <TYPE.largeHeader>
              <TYPE.main>{availableVotes?.toFixed(4)} Votes</TYPE.main>
            </TYPE.largeHeader>
            <ButtonPrimary onClick={onVote}>
              <TYPE.mediumHeader color="white">
                {voteOption === VoteOption.Against ? (
                  <TYPE.white>Vote against proposal {proposalId}</TYPE.white>
                ) : voteOption === VoteOption.For ? (
                  <TYPE.white>Vote for proposal {proposalId}</TYPE.white>
                ) : (
                  <TYPE.white>Vote to abstain on proposal {proposalId}</TYPE.white>
                )}
              </TYPE.mediumHeader>
            </ButtonPrimary>
          </AutoColumn>
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <ConfirmOrLoadingWrapper>
          <RowBetween>
            <div />
            <StyledClosed onClick={wrappedOndismiss} />
          </RowBetween>
          <ConfirmedIcon>
            <CustomLightSpinner src={Circle} alt="loader" size={'90px'} />
          </ConfirmedIcon>
          <AutoColumn gap="100px" justify={'center'}>
            <AutoColumn gap="12px" justify={'center'}>
              <TYPE.largeHeader>
                <TYPE.main>Submitting Vote</TYPE.main>
              </TYPE.largeHeader>
            </AutoColumn>
            <TYPE.subHeader>
              <TYPE.main>Confirm this transaction in your wallet</TYPE.main>
            </TYPE.subHeader>
          </AutoColumn>
        </ConfirmOrLoadingWrapper>
      )}
      {hash && (
        <ConfirmOrLoadingWrapper>
          <RowBetween>
            <div />
            <StyledClosed onClick={wrappedOndismiss} />
          </RowBetween>
          <ConfirmedIcon>
            <ArrowUpCircle strokeWidth={0.5} size={90} color={theme.primary1} />
          </ConfirmedIcon>
          <AutoColumn gap="100px" justify={'center'}>
            <AutoColumn gap="12px" justify={'center'}>
              <TYPE.largeHeader>
                <TYPE.main>Transaction Submitted</TYPE.main>
              </TYPE.largeHeader>
            </AutoColumn>
            <ExternalLink href={`https://explorer.celo.org/tx/${hash}`} style={{ marginLeft: '4px' }}>
              <TYPE.subHeader>
                <TYPE.main>View transaction on Explorer</TYPE.main>
              </TYPE.subHeader>
            </ExternalLink>
          </AutoColumn>
        </ConfirmOrLoadingWrapper>
      )}
    </Modal>
  )
}
