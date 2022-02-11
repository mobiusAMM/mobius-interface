import { Pair, Token } from '@ubeswap/sdk'
import { useColor } from 'hooks/useColor'
import { darken } from 'polished'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css, keyframes } from 'styled-components'

import { ReactComponent as DropDown } from '../../assets/images/dropdown.svg'
import { useWeb3Context } from '../../hooks'
import useTheme from '../../hooks/useTheme'
import { useIsDarkMode } from '../../state/user/hooks'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import { TYPE } from '../../theme'
import CurrencyLogo from '../CurrencyLogo'
import DoubleCurrencyLogo from '../DoubleLogo'
import { Input as NumericalInput } from '../NumericalInput'
import { RowBetween } from '../Row'
import CurrencySearchModal from '../SearchModal/CurrencySearchModal'

// const ColorShift = keyframes`
// 0% { background: #1b09f5;}
// 5% { background: #8879bf;}
// 10% { background: #0792f7;}
// 15% { background: #348cec;}
// 20% { background: #ab9325;}
// 25% { background: #ab9325;}
// 30% { background: #7f22dc;}
// 35% { background: #989858;}
// 40% { background: #ac9406;}
// 45% { background: #ab9325;}
// 50% { background: #23a963;}
// 55% { background: #ab9325;}
// 60% { background: #23a963;}
// 65% { background: #00a2c6;}
// 70% { background: #d38219;}
// 75% { background: #27a966;}
// 80% { background: #d2830b;}
// 85% { background: #23a963;}
// 90% { background: #52D07F;}
// 95% { background: #52D07F;}`

const ColorShift = keyframes`
0% { background: #FB7C6D;}
10% { background: #FBCC5C;}
35% { background: #35D07F; color: #2E3338 !important;}
60% { background: #3488EC;}
85% { background: #73DDFF;}
100% { background: #FB7C6D;}`

const ColorShiftAnimation = css`
  animation: ${ColorShift} 8s linear infinite;
`

const InputRow = styled.div<{ selected: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap};
  align-items: center;
  justify-content: space-between;
  padding: ${({ selected }) => (selected ? '0.75rem 1rem 1.5rem .75rem' : '0.75rem 1rem 1.5rem .75rem')};
`

const InputDiv = styled.div`
  display: flex;
  min-width: 30%;
  background-color: ${({ theme }) => theme.bg2};
`

const CurrencySelect = styled.button<{
  selected: boolean
  walletConnected: boolean
  bgColor: any
  isDarkMode: boolean
  pair: boolean
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 500;
  ${({ selected, bgColor, isDarkMode }) => selected && `background-color: ${darken(isDarkMode ? 0.2 : -0.4, bgColor)};`}
  color: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
  border-radius: 16px;
  box-shadow: ${({ selected }) => (selected ? 'none' : '0px 6px 10px rgba(0, 0, 0, 0.075)')};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  outline: none;
  ${({ selected }) => !selected && ColorShiftAnimation}
  cursor: pointer;
  user-select: none;
  border: none;
  width: ${({ pair }) => (pair ? '14rem' : '10rem')};
  height: 2.4rem;
  padding: 0 8px;

  :focus,
  :hover {
    background-color: ${({ selected, theme, bgColor, isDarkMode }) =>
      selected ? darken(isDarkMode ? 0.2 : -0.3, bgColor) : darken(0.05, theme.primary1)};
  }
`

const LabelRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  color: ${({ theme }) => theme.text1};
  font-size: 0.75rem;
  line-height: 1rem;
  padding: 0.75rem 1rem 0 1rem;
  background-color: ${({ theme }) => theme.bg2}
  span:hover {
    cursor: pointer;
    color: ${({ theme }) => darken(0.2, theme.text2)};
  }
`

const Aligner = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

const StyledDropDown = styled(DropDown)<{ selected: boolean }>`
  margin: 0 0.25rem 0 0.5rem;
  height: 35%;

  path {
    stroke: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
    stroke-width: 1.5px;
  }
`

const InputPanel = styled.div<{ hideInput?: boolean }>`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  border-radius: ${({ hideInput }) => (hideInput ? '8px' : '20px')};
  background-color: ${({ theme, hideInput }) => (hideInput ? 'transparent' : theme.bg2)};
  z-index: 1;
`

const Container = styled.div<{ hideInput: boolean }>`
  border-radius: ${({ hideInput }) => (hideInput ? '8px' : '20px')};
  border: 1px solid ${({ theme }) => theme.bg3};
  background-color: ${({ theme }) => theme.bg2};
  width: 'initial';
  :focus,
  :hover {
    border: 1px solid ${({ theme, hideInput }) => (hideInput ? ' transparent' : theme.bg3)};
  }
`

const StyledTokenName = styled.span<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.75rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
  font-size:  ${({ active }) => (active ? '20px' : '16px')};
  color: ${({ theme, active }) => (active ? theme.text1 : theme.white)};
`

const StyledBalanceMax = styled.button`
  marginleft: auto;
  height: 28px;
  background-color: ${({ theme }) => theme.bg5};
  border: 1px solid ${({ theme }) => theme.bg3};
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s ease-in-out;

  font-weight: 500;
  cursor: pointer;
  margin-right: 0.5rem;
  color: ${({ theme }) => theme.white};
  :hover {
    border: 1px solid ${({ theme }) => theme.primary1};
    background-color: ${({ theme }) => theme.primary5};
  }
  :focus {
    border: 1px solid ${({ theme }) => theme.primary1};
    background-color: ${({ theme }) => theme.primary5};
    outline: none;
  }

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin-right: 0.5rem;
  `};
`

export enum TokenType {
  OpticsV1 = 1,
  OpticsV2 = 2,
}

interface CurrencyInputPanelProps {
  value: string
  onUserInput: (value: string) => void
  onMax?: () => void
  showMaxButton: boolean
  label?: string
  onCurrencySelect?: (currency: Token) => void
  currency?: Token | null
  disableCurrencySelect?: boolean
  hideBalance?: boolean
  pair?: Pair | null
  hideInput?: boolean
  disableInput?: boolean
  otherCurrency?: Token | null
  id: string
  showCommonBases?: boolean
  customBalanceText?: string
  tokenType?: TokenType
}

export default function CurrencyInputPanel({
  value,
  onUserInput,
  onMax,
  showMaxButton,
  label = 'Input',
  onCurrencySelect,
  currency,
  disableCurrencySelect = false,
  hideBalance = false,
  disableInput = false,
  pair = null, // used for double token logo
  hideInput = false,
  otherCurrency,
  id,
  showCommonBases,
  customBalanceText,
  tokenType,
  ...rest
}: CurrencyInputPanelProps) {
  const { t } = useTranslation()
  const tokenSelectBackground = useColor(currency || undefined)
  const isDarkMode = useIsDarkMode()

  const [modalOpen, setModalOpen] = useState(false)
  const { address, connected } = useWeb3Context()
  const selectedCurrencyBalance = useCurrencyBalance(connected ? address : undefined, currency ?? undefined)
  const theme = useTheme()

  const handleDismissSearch = useCallback(() => {
    setModalOpen(false)
  }, [setModalOpen])

  return (
    <InputPanel id={id} hideInput={false} {...rest}>
      <Container hideInput={hideInput}>
        {!hideInput && (
          <LabelRow>
            <RowBetween>
              <TYPE.body color={theme.text2} fontWeight={500} fontSize={14}>
                {label}
              </TYPE.body>
              {connected && (
                <TYPE.body
                  onClick={onMax}
                  color={theme.text2}
                  fontWeight={500}
                  fontSize={14}
                  style={{ display: 'inline', cursor: 'pointer' }}
                >
                  {!hideBalance && !!currency && selectedCurrencyBalance
                    ? (customBalanceText ?? 'Balance: ') + selectedCurrencyBalance?.toSignificant(6)
                    : ' -'}
                </TYPE.body>
              )}
            </RowBetween>
          </LabelRow>
        )}
        <InputRow style={hideInput ? { padding: '0', borderRadius: '8px' } : {}} selected={disableCurrencySelect}>
          {/* <div style={{ display: 'flex', alignItems: 'center' }}> */}
          <CurrencySelect
            isDarkMode={isDarkMode}
            bgColor={tokenSelectBackground}
            selected={!!currency}
            walletConnected={connected}
            pair={!!pair}
            className="open-currency-select-button"
            onClick={() => {
              if (!disableCurrencySelect) {
                setModalOpen(true)
              }
            }}
          >
            <Aligner>
              {pair ? (
                <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={24} margin={true} />
              ) : currency ? (
                <CurrencyLogo currency={currency} size={'24px'} />
              ) : null}
              {pair ? (
                <StyledTokenName active={!!currency} className="pair-name-container">
                  {pair?.token0.symbol}:{pair?.token1.symbol}
                </StyledTokenName>
              ) : (
                <StyledTokenName className="token-symbol-container" active={Boolean(currency && currency.symbol)}>
                  {(currency && currency.symbol && currency.symbol.length > 20
                    ? currency.symbol.slice(0, 4) +
                      '...' +
                      currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
                    : currency?.symbol) || t('Select Token')}
                </StyledTokenName>
              )}
              {!disableCurrencySelect && <StyledDropDown selected={!!currency} />}
            </Aligner>
          </CurrencySelect>
          {/* TODO: why always false */}
          {false && connected && currency && showMaxButton && label !== 'To' && (
            <StyledBalanceMax onClick={onMax}>MAX</StyledBalanceMax>
          )}
          {/* </div> */}
          {!hideInput && (
            <InputDiv>
              <NumericalInput
                className="token-amount-input"
                value={value}
                disabled={disableInput}
                onUserInput={(val) => {
                  onUserInput(val)
                }}
              />
            </InputDiv>
          )}
        </InputRow>
      </Container>
      {!disableCurrencySelect && onCurrencySelect && (
        <CurrencySearchModal
          isOpen={modalOpen}
          onDismiss={handleDismissSearch}
          onCurrencySelect={onCurrencySelect}
          selectedCurrency={currency}
          otherSelectedCurrency={otherCurrency}
          showCommonBases={showCommonBases}
          tokenType={tokenType}
        />
      )}
    </InputPanel>
  )
}
