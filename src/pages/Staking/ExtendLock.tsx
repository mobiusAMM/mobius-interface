import 'react-date-range/dist/styles.css' // main style file
import 'react-date-range/dist/theme/default.css' // theme css file

import { useDoTransaction } from 'hooks/useDoTransaction'
import React, { useState } from 'react'
import { Calendar } from 'react-date-range'
import { Text } from 'rebass'
import { useLockEnd } from 'state/staking/hooks'
import { useIsDarkMode } from 'state/user/hooks'

import { ButtonError } from '../../components/Button'
import { useWeb3Context } from '../../hooks'
import { useVotingEscrowContract } from '../../hooks/useContract'
import { TYPE } from '../../theme'

const MILLISECONDS_PER_SECOND = 1000
const SECONDS_PER_WEEK = 604800

interface WithdrawModalProps {
  setAttempting: (attempting: boolean) => void
  setHash: (hash: string | undefined) => void
}

export default function ExtendLock({ setHash, setAttempting }: WithdrawModalProps) {
  const { connected } = useWeb3Context()

  // monitor call to help UI loading state
  const endOfLock = useLockEnd()
  const [date, setDate] = useState<Date>(new Date(endOfLock))
  const isDarkMode = useIsDarkMode()
  const roundedDate = date
    ? new Date(
        Math.floor(date?.valueOf() / (MILLISECONDS_PER_SECOND * SECONDS_PER_WEEK)) *
          (MILLISECONDS_PER_SECOND * SECONDS_PER_WEEK)
      )
    : undefined
  const doTransaction = useDoTransaction()

  const veMobiContract = useVotingEscrowContract()

  async function onLock() {
    if (veMobiContract && date) {
      setAttempting(true)
      const dateAsUnix = date.valueOf() / MILLISECONDS_PER_SECOND
      const resp = await doTransaction(veMobiContract, 'increase_unlock_time', {
        args: [dateAsUnix.toFixed()],
        summary: `Extended lock until ${date?.toLocaleDateString()}`,
      }).catch((error: any) => {
        setAttempting(false)
        throw error
      })
      setHash(resp.hash)
      setAttempting(false)
    }
  }

  let error: string | undefined
  if (!connected) {
    error = 'Connect Wallet'
  }

  if (!roundedDate || roundedDate.getTime() < endOfLock) {
    error = error ?? 'Choose a date later than your current lock'
  }

  return (
    <>
      <TYPE.mediumHeader marginBottom={0}>Set New Lock Date</TYPE.mediumHeader>
      <TYPE.subHeader marginTop={-20} color="red">
        You will be unable to withdraw your locked MOBI until this date. This date will be rounded down to the nearest
        Thursday 00:00:00 GTM 0
      </TYPE.subHeader>
      <Calendar date={roundedDate} onChange={setDate} />

      <ButtonError onClick={onLock} id="lock-button" disabled={!!error} error={!!error}>
        <Text fontSize={20} fontWeight={500} color={!error && (isDarkMode ? 'black' : 'white')}>
          {error ? error : `Lock until ${roundedDate?.toLocaleDateString()}`}
        </Text>
      </ButtonError>
    </>
  )
}
