import { Token } from 'lib/token-utils'
import React from 'react'
import styled from 'styled-components'

import CurrencyLogo from '../CurrencyLogo'

const Wrapper = styled.div<{ margin: boolean; sizeraw: number }>`
  position: relative;
  display: flex;
  flex-direction: row;
  margin-right: ${({ sizeraw, margin }) => margin && (sizeraw / 3 + 2).toString() + 'px'};
`

interface CurrencyLogoProps {
  margin?: boolean
  size?: number
  tokens: Token[]
}

const HigherLogo = styled(CurrencyLogo)`
  z-index: 2;
`
const CoveredLogo = styled(CurrencyLogo)<{ sizeraw: number }>`
  position: absolute;
  left: ${({ sizeraw }) => '-' + (sizeraw / 2).toString() + 'px'} !important;
`

export default function CurrencyPoolLogo({ tokens, size = 16, margin = false }: CurrencyLogoProps) {
  return (
    <Wrapper sizeraw={size} margin={margin}>
      {tokens[0] && <HigherLogo currency={tokens[0]} size={size.toString() + 'px'} />}
      {tokens[1] && <CoveredLogo currency={tokens[1]} size={size.toString() + 'px'} sizeraw={size} />}
      {tokens[2] && <CoveredLogo currency={tokens[2]} size={size.toString() + 'px'} sizeraw={size} />}
    </Wrapper>
  )
}
