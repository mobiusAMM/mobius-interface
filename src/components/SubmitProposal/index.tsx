import { AbiCoder } from '@ethersproject/abi'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { ButtonConfirmed } from 'components/Button'
import { AutoColumn } from 'components/Column'
import Loader from 'components/Loader'
import { Coins } from 'constants/StablePools'
import { useActiveContractKit } from 'hooks'
import { useGovernanceContract } from 'hooks/useContract'
import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { useTransactionAdder } from 'state/transactions/hooks'
import { TYPE } from 'theme'

export const burnerAddresses: { [c in Coins]: string } = {
  [Coins.USD]: '0x13bCDEB0947200Dd2F1933c2dC47a01157aA9414',
  [Coins.Bitcoin]: '0x2f0e18532b18Ac3D67f055e652C87Ed78560A556',
  [Coins.Celo]: '0xbA270ceb17621CEb240A1A62dE43B37D148d2774',
  [Coins.Ether]: '0xf14A820565010d95bD7ebda754e32811325394a4',
  [Coins.Eur]: '0xe26b9d9C77ac382222D9473d029b6ffaE1aa13Ca',
}

const blackList: Set<string> = new Set([
  '0xcC82628f6A8dEFA1e2B0aD7ed448bef3647F7941',
  '0xBe50a3013A1c94768A1ABb78c3cB79AB28fc1aCE',
  '0xE919F65739c26a42616b7b8eedC6b5524d1e3aC4',
  '0xcFFfE0c89a779c09Df3DF5624f54cDf7EF5fDd5D',
  '0x93DB49bE12B864019dA9Cb147ba75cDC0506190e',
  '0xd7Bf6946b740930c60131044bD2F08787e1DdBd4',
])

export default function SubmitProposal() {
  const { chainId } = useActiveContractKit()
  const abi = new AbiCoder()
  const governance = useGovernanceContract()
  const GAUGE_PROXY = '0x0a3Ac12422C95F84b5bD18A6d9904d132a161C68'
  const [submitting, setSubmitting] = useState<boolean>(false)
  const submitTxn = useTransactionAdder()
  const gauges = {
    pUSD: '0xE7195E651Cc47853f0054d85c8ADFc79D532929f',
    pCELO: '0xD0d57a6689188F854F996BEAE0Cb1949FDB5FF86',
    pEURO: '0xCAEd243de23264Bdd8297c6eECcF320846eee18A',
  }
  const nGauges = Object.values(gauges).length

  const signature = ['set_killed(address,bool)']

  const data = Object.values(gauges).map((addr) => abi.encode(['address', 'bool'], [addr, true]))
  const value = new Array(nGauges).fill(0)
  const target = new Array(nGauges).fill(GAUGE_PROXY)

  const description = `# Kill Gauges from Proposals 4, 5, 6
  ## TLDR: Proposals 4, 5, 6 passed but contained the incorrect contract calls, so they cannot be executed.  This proposal lumps all three into one, with the correct calls.

    * Proposal 4 - Kill pUSD gauge
    * Proposal 5 - Kill pCelo gauge
    * Proposal 6 - Kill pEURO gauge

  ### Details / Addresses
    * Gauge Proxy: ${GAUGE_PROXY}
    * Poof USD Gauge: ${gauges.pUSD}
    * Poof CELO Gauge: ${gauges.pCELO}
    * Poof cEURO Gauge: ${gauges.pEURO}
  ### Who is Proposing?
  A community member who knows how to use the command line. 
  `

  const onSubmit = async () => {
    setSubmitting(true)
    const txn = await governance
      ?.propose(target, value, signature, data, description, { gasLimit: 10000000 })
      .then((resp: TransactionResponse) => submitTxn(resp, { summary: 'Submitted proposal!' }))
      .catch((e) => console.log(e))
      .finally(() => setSubmitting(false))
  }
  return (
    <AutoColumn>
      <TYPE.mediumHeader>Proposal Description: </TYPE.mediumHeader>
      <TYPE.main width={900} wrap>
        <ReactMarkdown>{description}</ReactMarkdown>
      </TYPE.main>
      <ButtonConfirmed onClick={submitting ? () => null : onSubmit}>
        {submitting ? <Loader /> : 'Submit Proposal'}
      </ButtonConfirmed>
    </AutoColumn>
  )
}
