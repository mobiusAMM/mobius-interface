import { currencyEquals, Token } from '@ubeswap/sdk'
import React, { CSSProperties, MutableRefObject, useCallback } from 'react'
import { FixedSizeList } from 'react-window'
import { Text } from 'rebass'
import styled from 'styled-components'

import checkedLogo from '../../assets/svg/mobius.svg'
import { WrappedTokenInfo } from '../../state/lists/hooks'
import Column from '../Column'
import { MenuItem } from '../SearchModal/styleds'
import { MouseoverTooltip } from '../Tooltip'

function currencyKey(currency: Token): string {
  return currency instanceof Token ? currency.address : ''
}

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
  style,
}: {
  currency: Token
  onSelect: () => void
  isSelected: boolean
  style: CSSProperties
}) {
  const key = currencyKey(currency)
  if (isSelected)
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
    >
      <Column>
        <Text title={currency.name} fontWeight={500}>
          {currency.symbol}
        </Text>
      </Column>
      <TokenTags currency={currency} />
    </MenuItem>
  )
}

export default function CurrencyList({
  height,
  currencies,
  selectedCurrency,
  onCurrencySelect,
  fixedListRef,
}: {
  height: number
  currencies: Token[]
  selectedCurrency?: Token | null
  onCurrencySelect: (currency: Token) => void
  fixedListRef?: MutableRefObject<FixedSizeList | undefined>
  displayNames?: string[]
}) {
  const itemData = currencies

  // const inactiveTokens: {
  //   [address: string]: Token
  // } = useAllInactiveTokens()

  const Row = useCallback(
    ({ data, index, style }) => {
      const currency: Token = data[index]
      const isSelected = Boolean(selectedCurrency && currencyEquals(selectedCurrency, currency))
      const handleSelect = () => onCurrencySelect(currency)

      // const token = currency

      return <CurrencyRow style={style} currency={currency} isSelected={isSelected} onSelect={handleSelect} />
    },
    [onCurrencySelect, selectedCurrency]
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
