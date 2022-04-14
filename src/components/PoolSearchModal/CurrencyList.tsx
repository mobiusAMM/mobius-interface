import { Token } from 'lib/token-utils'
import React, { CSSProperties, MutableRefObject, useCallback } from 'react'
import { FixedSizeList } from 'react-window'
import { Text } from 'rebass'

import Column from '../Column'
import { MenuItem } from '../SearchModal/styleds'

function currencyKey(currency: Token): string {
  return currency instanceof Token ? currency.address : ''
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
      const isSelected = Boolean(selectedCurrency && selectedCurrency.equals(currency))
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
