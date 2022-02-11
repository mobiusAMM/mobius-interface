import { ButtonDropdown } from 'components/Button'
import Column from 'components/Column'
import Modal from 'components/Modal'
import { RowBetween } from 'components/Row'
import { MenuItem, PaddedColumn, Separator } from 'components/SearchModal/styleds'
import React, { useCallback } from 'react'
import { Text } from 'rebass'
import styled from 'styled-components/macro'
import { CloseIcon, TYPE } from 'theme'

export enum ProposalAction {
  TRANSFER_TOKEN = 'Transfer Token',
  ADD_GAUGE = 'Add Gauge',
  KILL_GAUGE = 'Kill Gauge',
}

interface ProposalActionSelectorModalProps {
  isOpen: boolean
  onDismiss: () => void
  onProposalActionSelect: (proposalAction: ProposalAction) => void
}

const ContentWrapper = styled(Column)`
  width: 100%;
  flex: 1 1;
  position: relative;
`
const ActionSelectorHeader = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.text2};
`

const ActionDropdown = styled(ButtonDropdown)`
  padding: 0px;
  background-color: transparent;
  color: ${({ theme }) => theme.text1};
  font-size: 1.25rem;

  :hover,
  :active,
  :focus {
    outline: 0px;
    box-shadow: none;
    background-color: transparent;
  }
`

const ProposalActionSelectorFlex = styled.div`
  margin-top: 10px;
  display: flex;
  flex-flow: column nowrap;
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.bg2};
  background-color: ${({ theme }) => theme.bg1};
`

const ProposalActionSelectorContainer = styled.div`
  flex: 1;
  padding: 1rem;
  display: grid;
  grid-auto-rows: auto;
  grid-row-gap: 10px;
`

export const ProposalActionSelector = ({
  className,
  onClick,
  proposalAction,
}: {
  className?: string
  onClick: () => void
  proposalAction: ProposalAction
}) => {
  return (
    <ProposalActionSelectorFlex>
      <ProposalActionSelectorContainer className={className}>
        <ActionSelectorHeader>
          <TYPE.main>Proposed Action</TYPE.main>
        </ActionSelectorHeader>
        <ActionDropdown onClick={onClick}>{proposalAction}</ActionDropdown>
      </ProposalActionSelectorContainer>
    </ProposalActionSelectorFlex>
  )
}

export function ProposalActionSelectorModal({
  isOpen,
  onDismiss,
  onProposalActionSelect,
}: ProposalActionSelectorModalProps) {
  const handleProposalActionSelect = useCallback(
    (proposalAction: ProposalAction) => {
      onProposalActionSelect(proposalAction)
      onDismiss()
    },
    [onDismiss, onProposalActionSelect]
  )

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss}>
      <ContentWrapper>
        <PaddedColumn gap="16px">
          <RowBetween>
            <Text fontWeight={500} fontSize={16}>
              <TYPE.main>Select an action</TYPE.main>
            </Text>
            <CloseIcon onClick={onDismiss} />
          </RowBetween>
        </PaddedColumn>
        <Separator />
        <MenuItem onClick={() => handleProposalActionSelect(ProposalAction.ADD_GAUGE)}>
          <Column>
            <Text fontWeight={500}>
              <TYPE.main>Add Gauge</TYPE.main>
            </Text>
          </Column>
        </MenuItem>
        <MenuItem onClick={() => handleProposalActionSelect(ProposalAction.KILL_GAUGE)}>
          <Column>
            <Text fontWeight={500}>
              <TYPE.main>Kill Gauge</TYPE.main>
            </Text>
          </Column>
        </MenuItem>
        <MenuItem onClick={() => handleProposalActionSelect(ProposalAction.TRANSFER_TOKEN)}>
          <Column>
            <Text fontWeight={500}>
              <TYPE.main>Transfer Token</TYPE.main>
            </Text>
          </Column>
        </MenuItem>
      </ContentWrapper>
    </Modal>
  )
}
