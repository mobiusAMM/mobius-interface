import { Token } from '@ubeswap/sdk'
import Row, { RowBetween, RowFixed } from 'components/Row'
import { useToken } from 'hooks/Tokens'
import React, { RefObject, useCallback, useMemo, useRef, useState } from 'react'
import { useRemoveUserAddedToken } from 'state/user/hooks'
import styled from 'styled-components'
import { ButtonText, ExternalLink, ExternalLinkIcon, TrashIcon, TYPE } from 'theme'
import { isAddress } from 'utils'

import { CHAIN } from '../../constants'
import { getExplorerLink } from '../../constants/NetworkInfo'
import useTheme from '../../hooks/useTheme'
import Card from '../Card'
import Column from '../Column'
import CurrencyLogo from '../CurrencyLogo'
import { CurrencyModalView } from './CurrencySearchModal'
import ImportRow from './ImportRow'
import { PaddedColumn, SearchInput, Separator } from './styleds'

const Wrapper = styled.div`
  width: 100%;
  height: calc(100% - 60px);
  position: relative;
  padding-bottom: 60px;
`

const Footer = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  border-radius: 20px;
  border-top-right-radius: 0;
  border-top-left-radius: 0;
  border-top: 1px solid ${({ theme }) => theme.bg3};
  padding: 20px;
  text-align: center;
`

export default function ManageTokens({
  setModalView,
  setImportToken,
}: {
  setModalView: (view: CurrencyModalView) => void
  setImportToken: (token: Token) => void
}) {
  const [searchQuery, setSearchQuery] = useState<string>('')
  const theme = useTheme()

  // manage focus on modal show
  const inputRef = useRef<HTMLInputElement>()
  const handleInput = useCallback((event) => {
    const input = event.target.value
    const checksummedInput = isAddress(input)
    setSearchQuery(checksummedInput || input)
  }, [])

  // if they input an address, use it
  const isAddressSearch = isAddress(searchQuery)
  const searchToken = useToken(searchQuery)

  // all tokens for local lisr
  const userAddedTokens: Token[] = []
  const removeToken = useRemoveUserAddedToken()

  const handleRemoveAll = useCallback(() => {
    if (userAddedTokens) {
      userAddedTokens.map((token) => {
        return removeToken(CHAIN, token.address)
      })
    }
  }, [removeToken, userAddedTokens])

  const tokenList = useMemo(() => {
    return userAddedTokens.map((token) => (
      <RowBetween key={token.address} width="100%">
        <RowFixed>
          <CurrencyLogo currency={token} size={'20px'} />
          <ExternalLink href={getExplorerLink(CHAIN, token.address, 'address')}>
            <TYPE.main ml={'10px'} fontWeight={600}>
              {token.symbol}
            </TYPE.main>
          </ExternalLink>
        </RowFixed>
        <RowFixed>
          <TrashIcon onClick={() => removeToken(CHAIN, token.address)} />
          <ExternalLinkIcon href={getExplorerLink(CHAIN, token.address, 'address')} />
        </RowFixed>
      </RowBetween>
    ))
  }, [userAddedTokens, removeToken])

  return (
    <Wrapper>
      <Column style={{ width: '100%', flex: '1 1' }}>
        <PaddedColumn gap="14px">
          <Row>
            <SearchInput
              type="text"
              id="token-search-input"
              placeholder={'0x0000'}
              value={searchQuery}
              autoComplete="off"
              ref={inputRef as RefObject<HTMLInputElement>}
              onChange={handleInput}
            />
          </Row>
          {searchQuery !== '' && !isAddressSearch && <TYPE.error error={true}>Enter valid token address</TYPE.error>}
          {searchToken && (
            <Card backgroundColor={theme.bg2} padding="10px 0">
              <ImportRow
                token={searchToken}
                showImportView={() => setModalView(CurrencyModalView.importToken)}
                setImportToken={setImportToken}
                style={{ height: 'fit-content' }}
              />
            </Card>
          )}
        </PaddedColumn>
        <Separator />
        <PaddedColumn gap="lg">
          <RowBetween>
            <TYPE.main fontWeight={600}>
              {userAddedTokens?.length} Custom {userAddedTokens.length === 1 ? 'Token' : 'Tokens'}
            </TYPE.main>
            {userAddedTokens.length > 0 && (
              <ButtonText onClick={handleRemoveAll}>
                <TYPE.blue>Clear all</TYPE.blue>
              </ButtonText>
            )}
          </RowBetween>
          {tokenList}
        </PaddedColumn>
      </Column>
      <Footer>
        <TYPE.darkGray>Tip: Custom tokens are stored locally in your browser</TYPE.darkGray>
      </Footer>
    </Wrapper>
  )
}
