import { currencyEquals, JSBI, Token, TokenAmount } from '@ubeswap/sdk'
import React, { CSSProperties, MutableRefObject, useCallback } from 'react'
import { FixedSizeList } from 'react-window'
import { Text } from 'rebass'
import styled from 'styled-components'

import checkedLogo from '../../assets/svg/mobius.svg'
import { useWeb3Context } from '../../hooks'
import { WrappedTokenInfo } from '../../state/lists/hooks'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import { TYPE } from '../../theme'
import Column from '../Column'
import CurrencyLogo from '../CurrencyLogo'
import Loader from '../Loader'
import { RowFixed } from '../Row'
import { MouseoverTooltip } from '../Tooltip'
import { MenuItem } from './styleds'

function currencyKey(currency: Token): string {
  return currency instanceof Token ? currency.address : ''
}

const StyledBalanceText = styled(Text)`
  white-space: nowrap;
  overflow: hidden;
  max-width: 5rem;
  text-overflow: ellipsis;
`

const Tag = styled.div`
  background-color: ${({ theme }) => theme.bg3};
  color: ${({ theme }) => theme.text2};
  font-size: 14px;
  border-radius: 4px;
  padding: 0.25rem 0.3rem 0.25rem 0.3rem;
  max-width: 6rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  justify-self: flex-end;
  margin-right: 4px;
`

function Balance({ balance }: { balance: TokenAmount }) {
  const max = balance.token.decimals
  const decimalPlacesForBalance = balance?.greaterThan(
    JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt(balance.token.decimals)).toString()
  )
    ? 2
    : balance?.greaterThan('0')
    ? Math.min(10, max)
    : 2

  return <StyledBalanceText title={balance.toExact()}>{balance.toFixed(decimalPlacesForBalance)}</StyledBalanceText>
}

const TagContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`

function TokenTags({ currency }: { currency: Token }) {
  if (!(currency instanceof WrappedTokenInfo)) {
    return <span />
  }

  const tags = currency.tags
  if (!tags || tags.length === 0) return <span />

  const tag = tags[0]

  return (
    <TagContainer>
      <MouseoverTooltip text={tag.description}>
        <Tag key={tag.id}>{tag.name}</Tag>
      </MouseoverTooltip>
      {tags.length > 1 ? (
        <MouseoverTooltip
          text={tags
            .slice(1)
            .map(({ name, description }) => `${name}: ${description}`)
            .join('; \n')}
        >
          <Tag>...</Tag>
        </MouseoverTooltip>
      ) : null}
    </TagContainer>
  )
}

function CurrencyRow({
  currency,
  onSelect,
  isSelected,
  otherSelected,
  style,
}: {
  currency: Token
  onSelect: () => void
  isSelected: boolean
  otherSelected: boolean
  style: CSSProperties
}) {
  const { address, connected } = useWeb3Context()
  const key = currencyKey(currency)
  const balance = useCurrencyBalance(connected ? address : undefined, currency)
  if (isSelected || otherSelected)
    currency = {
      ...currency,
      logoURI: checkedLogo,
    } as WrappedTokenInfo

  // only show add or remove buttons if not on selected list
  return (
    <MenuItem
      style={style}
      className={`token-item-${key}`}
      onClick={() => (isSelected ? null : onSelect())}
      disabled={isSelected}
      selected={otherSelected}
    >
      <CurrencyLogo currency={currency} size={'24px'} />
      <Column>
        <Text title={currency.name} fontWeight={500}>
          {currency.symbol}
        </Text>
        <TYPE.darkGray ml="0px" fontSize={'12px'} fontWeight={300}>
          {currency.name}
        </TYPE.darkGray>
      </Column>
      <TokenTags currency={currency} />
      <RowFixed style={{ justifySelf: 'flex-end' }}>
        {balance ? <Balance balance={balance} /> : connected ? <Loader /> : null}
      </RowFixed>
    </MenuItem>
  )
}

export default function CurrencyList({
  height,
  currencies,
  selectedCurrency,
  onCurrencySelect,
  otherCurrency,
  fixedListRef,
}: {
  height: number
  currencies: Token[]
  selectedCurrency?: Token | null
  onCurrencySelect: (currency: Token) => void
  otherCurrency?: Token | null
  fixedListRef?: MutableRefObject<FixedSizeList | undefined>
}) {
  currencies = currencies.filter((token) => !token.symbol?.includes('LP'))
  const itemData = currencies

  const Row = useCallback(
    ({ data, index, style }) => {
      const currency: Token = data[index]
      const isSelected = Boolean(selectedCurrency && currencyEquals(selectedCurrency, currency))
      const otherSelected = Boolean(otherCurrency && currencyEquals(otherCurrency, currency))
      const handleSelect = () => onCurrencySelect(currency)

      return (
        <CurrencyRow
          style={style}
          currency={currency}
          isSelected={isSelected}
          onSelect={handleSelect}
          otherSelected={otherSelected}
        />
      )
    },
    [onCurrencySelect, otherCurrency, selectedCurrency]
  )

  const itemKey = useCallback((index: number, data: any) => currencyKey(data[index]), [])

  return (
    <FixedSizeList
      height={height}
      ref={fixedListRef as any}
      width="100%"
      itemData={itemData}
      itemCount={itemData.length}
      itemSize={56}
      itemKey={itemKey}
    >
      {Row}
    </FixedSizeList>
  )
}
