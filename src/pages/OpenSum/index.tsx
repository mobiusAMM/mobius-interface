import { useConstantSumContract } from 'hooks/useContract'
import useTransactionDeadline from 'hooks/useTransactionDeadline'
import { Token, TokenAmount } from 'lib/token-utils'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { ArrowDown } from 'react-feather'
import ReactGA from 'react-ga'
import { Text } from 'rebass'
import { getPairedToken, useOpenSumTrade } from 'state/openSum/hooks'
import { useTransactionAdder } from 'state/transactions/hooks'
import { useTokenBalance } from 'state/wallet/hooks'
import styled, { ThemeContext } from 'styled-components'

import { ButtonConfirmed, ButtonError } from '../../components/Button'
import Card from '../../components/Card'
import Column, { AutoColumn } from '../../components/Column'
import CurrencyInputPanel, { TokenType } from '../../components/CurrencyInputPanel'
import { CardNoise, CardSection, DataCard } from '../../components/earn/styled'
import Loader from '../../components/Loader'
import { SwapPoolTabs } from '../../components/NavigationTabs'
import ProgressSteps from '../../components/ProgressSteps'
import { AutoRow, RowBetween } from '../../components/Row'
import ConfirmSwapModal from '../../components/swap/ConfirmSwapModal'
import { ArrowWrapper, BottomGrouping, InfoWrapper, Wrapper } from '../../components/swap/styleds'
import SwapHeader from '../../components/swap/SwapHeader'
import TradePrice from '../../components/swap/TradePrice'
import { CHAIN } from '../../constants'
import { useWeb3Context } from '../../hooks'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { MentoTrade } from '../../state/mento/hooks'
import { useIsDarkMode } from '../../state/user/hooks'
import { TYPE } from '../../theme'
import AppBody from '../AppBody'

const VoteCard = styled(DataCard)`
  background: radial-gradient(95% 100% at 1% 50%, #35d07f 0%, #fbcc5c 100%);
  overflow: hidden;
  margin-bottom: 2rem;
`
// #fbcc5c

export default function OpenSum() {
  const isDarkMode = useIsDarkMode()

  const { address, connect, connected } = useWeb3Context()
  const theme = useContext(ThemeContext)

  const [inputValue, setInputValue] = useState<string>()
  const [inputToken, setInputToken] = useState<Token>()
  const [outputToken, setOutputToken] = useState<Token>()
  const trade = useOpenSumTrade(inputToken?.address ?? '', outputToken?.address ?? '', inputValue)
  const { input, output, poolAddress, error: swapInputError } = trade

  // modal and loading
  const [{ showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
    showConfirm: boolean
    tradeToConfirm: MentoTrade | undefined
    attemptingTxn: boolean
    swapErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    showConfirm: false,
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined,
  })

  // check whether the user has approved the router on the input token
  const [approval, approveCallback] = useApproveCallback(input, poolAddress)

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approval, approvalSubmitted])

  const maxAmountInput: TokenAmount | undefined = useTokenBalance(connected ? address : undefined, inputToken)
  const atMaxAmountInput = Boolean(maxAmountInput && input?.equalTo(maxAmountInput))
  const swapContract = useConstantSumContract(poolAddress)
  const deadline = useTransactionDeadline()
  const addTransaction = useTransactionAdder()

  const doTrade = () =>
    swapContract?.swap(
      inputToken?.address ?? '',
      outputToken?.address ?? '',
      input?.raw.toString() ?? '0',
      output?.raw.toString() ?? '0',
      deadline ?? '0'
    )

  const handleSwap = useCallback(() => {
    setSwapState({ attemptingTxn: true, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: undefined })
    doTrade()
      .then((response) => {
        addTransaction(response, {
          summary: `Swapped ${inputValue} ${inputToken?.symbol} for ${inputValue} ${outputToken?.symbol}`,
        })
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: undefined,
          txHash: response.hash,
        })
        ReactGA.event({
          category: 'Swap',
          action: 'Swap',
          label: [input?.currency?.symbol, output?.currency?.symbol].join('/'),
        })

        ReactGA.event({
          category: 'Routing',
          action: 'Swap',
        })
      })
      .catch((error) => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: error.message,
          txHash: undefined,
        })
      })
  }, [
    tradeToConfirm,
    showConfirm,
    doTrade,
    addTransaction,
    inputValue,
    inputToken?.symbol,
    outputToken?.symbol,
    input?.currency?.symbol,
    output?.currency?.symbol,
  ])
  // TODO: check for endless loop

  // errors
  const [showInverted, setShowInverted] = useState<boolean>(false)

  const isValid = !swapInputError

  // warnings on slippage

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !swapInputError &&
    (approval === ApprovalState.NOT_APPROVED ||
      approval === ApprovalState.PENDING ||
      (approvalSubmitted && approval === ApprovalState.APPROVED))

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({ showConfirm: false, tradeToConfirm, attemptingTxn, swapErrorMessage, txHash })
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      setInputValue(undefined)
    }
  }, [attemptingTxn, setInputValue, swapErrorMessage, tradeToConfirm, txHash])

  const handleAcceptChanges = useCallback(() => {
    setSwapState({ tradeToConfirm: trade, swapErrorMessage, txHash, attemptingTxn, showConfirm })
  }, [attemptingTxn, showConfirm, swapErrorMessage, trade, txHash])

  const handleInputSelect = useCallback(
    (inputCurrency: Token) => {
      setApprovalSubmitted(false) // reset 2 step UI for approvals
      setInputToken(inputCurrency)
      setOutputToken(getPairedToken(inputCurrency.address, CHAIN))
    },
    [setInputToken, setOutputToken, setApprovalSubmitted]
  )

  const handleMaxInput = useCallback(() => {
    maxAmountInput && setInputValue(maxAmountInput.toExact())
  }, [maxAmountInput, setInputValue])

  const onSwitchTokens = () => {
    alert('You can only swap FROM v1 assets TO v2 assets')
  }
  const handleOutputSelect = useCallback(
    (outputCurrency: Token) => {
      setOutputToken(outputCurrency)
      setInputToken(getPairedToken(outputCurrency.address, CHAIN))
    },
    [setInputToken, setOutputToken]
  )

  const actionLabel = 'Swap'
  return (
    <>
      <SwapPoolTabs active={'swap'} />
      <InfoWrapper mobile={isMobile}>
        <VoteCard>
          <CardNoise />
          <CardSection>
            <AutoColumn gap="md">
              <RowBetween>
                <TYPE.white fontWeight={600}>OpenSum Exchange</TYPE.white>
              </RowBetween>
              <RowBetween>
                <TYPE.white
                  fontSize={14}
                >{`Mobius Migrate tab allows you to swap from Optics v1 to v2 assets. Every swap is guaranteed to be 1:1.`}</TYPE.white>
              </RowBetween>
            </AutoColumn>
          </CardSection>
          <CardNoise />
        </VoteCard>
      </InfoWrapper>
      <AppBody mobile={false}>
        <SwapHeader title={actionLabel} />
        <Wrapper id="swap-page">
          <ConfirmSwapModal
            isOpen={showConfirm}
            trade={trade}
            originalTrade={tradeToConfirm}
            onAcceptChanges={handleAcceptChanges}
            attemptingTxn={attemptingTxn}
            txHash={txHash}
            recipient={null}
            allowedSlippage={10}
            onConfirm={handleSwap}
            swapErrorMessage={swapErrorMessage}
            onDismiss={handleConfirmDismiss}
          />
          <AutoColumn gap={'sm'}>
            <div style={{ display: 'relative' }}>
              <CurrencyInputPanel
                label={'From'}
                value={inputValue ?? ''}
                showMaxButton={!atMaxAmountInput}
                currency={inputToken}
                onUserInput={(val: string) => setInputValue(val)}
                onMax={handleMaxInput}
                onCurrencySelect={handleInputSelect}
                otherCurrency={outputToken}
                tokenType={TokenType.OpticsV1}
                id="swap-currency-input"
              />
              <ArrowWrapper clickable>
                <ArrowDown
                  size="16"
                  onClick={() => {
                    setApprovalSubmitted(false) // reset 2 step UI for approvals
                    onSwitchTokens()
                  }}
                  color={inputToken && outputToken ? theme.primary1 : theme.text2}
                />
              </ArrowWrapper>
              <CurrencyInputPanel
                value={inputValue ?? ''}
                onUserInput={(val: string) => setInputValue(val)}
                label={'To'}
                showMaxButton={false}
                currency={outputToken}
                onCurrencySelect={handleOutputSelect}
                otherCurrency={inputToken}
                tokenType={TokenType.OpticsV2}
                id="swap-currency-output"
              />
            </div>
            <Card padding={'0px'} borderRadius={'20px'}>
              <AutoColumn gap="8px" style={{ padding: '0 16px' }}>
                {Boolean(trade) && (
                  <RowBetween align="center">
                    <Text fontWeight={500} fontSize={14} color={theme.text2}>
                      Price
                    </Text>
                    <TradePrice
                      price={trade?.executionPrice}
                      showInverted={showInverted}
                      setShowInverted={setShowInverted}
                    />
                  </RowBetween>
                )}
              </AutoColumn>
            </Card>
          </AutoColumn>
          <BottomGrouping>
            {!connected ? (
              <ButtonError disabledStyle={true} onClick={connect}>
                Connect Wallet
              </ButtonError>
            ) : showApproveFlow ? (
              <RowBetween>
                <ButtonConfirmed
                  onClick={approveCallback}
                  disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
                  width="48%"
                  altDisabledStyle={approval === ApprovalState.PENDING} // show solid button while waiting
                  confirmed={approval === ApprovalState.APPROVED}
                >
                  {approval === ApprovalState.PENDING ? (
                    <AutoRow gap="6px" justify="center">
                      Approving <Loader stroke="white" />
                    </AutoRow>
                  ) : approvalSubmitted && approval === ApprovalState.APPROVED ? (
                    'Approved'
                  ) : (
                    'Approve ' + inputToken?.symbol
                  )}
                </ButtonConfirmed>
                <ButtonError
                  onClick={() => {
                    setSwapState({
                      tradeToConfirm: trade,
                      attemptingTxn: false,
                      swapErrorMessage: undefined,
                      showConfirm: true,
                      txHash: undefined,
                    })
                  }}
                  width="48%"
                  id="swap-button"
                  disabled={!isValid || approval !== ApprovalState.APPROVED}
                  error={isValid}
                >
                  <Text fontSize={16} fontWeight={500}>
                    {actionLabel}
                  </Text>
                </ButtonError>
              </RowBetween>
            ) : (
              <ButtonError
                onClick={() => {
                  setSwapState({
                    tradeToConfirm: trade,
                    attemptingTxn: false,
                    swapErrorMessage: undefined,
                    showConfirm: true,
                    txHash: undefined,
                  })
                }}
                id="swap-button"
                disabled={!isValid}
                error={!isValid}
              >
                <Text fontSize={20} fontWeight={500} color={isValid && actionLabel && (isDarkMode ? 'black' : 'white')}>
                  {swapInputError ? swapInputError : `${actionLabel}`}
                </Text>
              </ButtonError>
            )}
            {showApproveFlow && (
              <Column style={{ marginTop: '1rem' }}>
                <ProgressSteps steps={[approval === ApprovalState.APPROVED]} />
              </Column>
            )}
          </BottomGrouping>
          <AutoRow style={{ justifyContent: 'center' }}></AutoRow>
        </Wrapper>
      </AppBody>
    </>
  )
}
