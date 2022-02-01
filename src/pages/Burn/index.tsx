import { TransactionResponse } from '@ethersproject/providers'
import { ChainId } from '@ubeswap/sdk'
import { ButtonConfirmed } from 'components/Button'
import { AutoColumn } from 'components/Column'
import { STATIC_POOL_INFO } from 'constants/StablePools'
import { useChainId } from 'hooks'
import { useFeeDistributor, usePoolProxy } from 'hooks/useContract'
import React, { useState } from 'react'
import { isMobile } from 'react-device-detect'
import { useStablePoolInfo } from 'state/stablePools/hooks'
import { useTransactionAdder } from 'state/transactions/hooks'
import styled from 'styled-components'
import { TYPE } from 'theme'

const PageWrapper = styled(AutoColumn)`
  max-width: 640px;
  width: 100%;
`

const blackList: Set<string> = new Set([
  '0xcC82628f6A8dEFA1e2B0aD7ed448bef3647F7941',
  '0xBe50a3013A1c94768A1ABb78c3cB79AB28fc1aCE',
  '0xE919F65739c26a42616b7b8eedC6b5524d1e3aC4',
  '0xcFFfE0c89a779c09Df3DF5624f54cDf7EF5fDd5D',
  '0x93DB49bE12B864019dA9Cb147ba75cDC0506190e',
  '0xd7Bf6946b740930c60131044bD2F08787e1DdBd4',
])

export default function BurnPage() {
  const [stage, setStage] = useState('Initiate')
  const poolProxy = usePoolProxy()
  const feeDistributor = useFeeDistributor()
  const addTransaction = useTransactionAdder()
  const chainId = useChainId()
  const tokenSeen: Set<string> = new Set<string>()
  const tokens: string[] = STATIC_POOL_INFO[chainId ?? ChainId.MAINNET]
    .flatMap((el) => el.tokens.map((tok) => tok.address))
    .filter((el) => {
      if (tokenSeen.has(el)) return false
      tokenSeen.add(el)
      return !blackList.has(el)
    })
  const pools = useStablePoolInfo()

  const initProcess = async () => {
    for (let i = 0; i < pools.length; i += 20) {
      const addresses = pools.slice(i, Math.min(i + 20, pools.length)).map((p) => p.poolAddress)
      await poolProxy
        ?.withdraw_many(addresses, { gasLimit: 10000000 })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Collected fees for ${addresses?.length} pools`,
          })
          setStage(`Collecting fees for ${addresses?.length} pools`)
          response.wait().then(() => null)
        })
        .catch((error: any) => {
          console.log(error)
        })
    }
    for (let i = 0; i < tokens.length; i++) {
      await poolProxy
        ?.burn(tokens[i], { gasLimit: 10000000 })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Converted ${tokens[i]} into Mobi`,
          })
          setStage(`Converting ${tokens[i]} into Mobi`)
        })
        .catch((error: any) => {
          console.log(error)
        })
    }
    await feeDistributor
      ?.checkpoint_token()
      .then((response: TransactionResponse) => {
        addTransaction(response, {
          summary: `Checkpointed FeeDistributor`,
        })
        setStage(`Checkpointing FeeDistributor`)
        response.wait().then(() => null)
      })
      .catch((error: any) => {
        console.log(error)
      })
    setStage('Done!')
  }
  return (
    <PageWrapper gap="lg" justify="center" style={{ marginTop: isMobile ? '-1rem' : '3rem' }}>
      <TYPE.mediumHeader>{`On Step: ${stage}`}</TYPE.mediumHeader>
      <TYPE.red>WARNING: Whoever initiates is responsible to pay gas for multiple transactions.</TYPE.red>
      <ButtonConfirmed onClick={initProcess} disabled={stage !== 'Initiate'}>
        {stage === 'Initiate' ? 'Click to Start' : stage === 'Done!' ? 'Finished' : 'Working...'}
      </ButtonConfirmed>
    </PageWrapper>
  )
}
