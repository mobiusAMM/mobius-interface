import { JSBI } from '@ubeswap/sdk'
import { AutoColumn } from 'components/Column'
import Loader from 'components/Loader'
import { AutoRow, RowBetween, RowFixed } from 'components/Row'
import { StablePools } from 'constants/pools'
import { useWindowSize } from 'hooks/useWindowSize'
import { darken } from 'polished'
import React from 'react'
import { isMobile } from 'react-device-detect'
import { RadialChart } from 'react-vis'
import { GaugeInfo } from 'state/gauges/hooks'
import styled from 'styled-components'
import { TYPE } from 'theme'

import { CHAIN } from '../../constants'

const Wrapper = styled(AutoColumn)`
  border-radius: 12px;
  width: 100%;
  overflow: hidden;
  position: relative;
  padding: 1rem;
  background: ${({ theme }) => theme.bg1};
  color: ${({ theme }) => theme.text1} !important;
  ${({ theme }) => theme.mediaWidth.upToSmall`
`}
  margin-top: 1rem;
`
const WrappedRow = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
`

const ColorBox = styled.div<{ color: string }>`
  background: ${({ color }) => color};
  width: 20px;
  height: 20px;
  border-radius: 6px;
  margin-right: 1rem;
  margin-bottom: 0.25rem;
`

const colorsForChart = ['#35D07F', '#73DDFF', '#BF97FF', '#3488EC', '#FB7C6D', '#FBCC5C', '#FEF2D6']

interface GaugeWeightsProps {
  gauges: (GaugeInfo | null)[]
}

// TO DO: Account for Vote Power Allocations
export default function GaugeWeights({ gauges }: GaugeWeightsProps) {
  const numColors = colorsForChart.length
  const data = gauges.map((g, i) => ({
    label: StablePools[CHAIN][i].name,
    angle: parseInt(g?.weight.multiply('360').toFixed(0) ?? '0'),
    radius: JSBI.greaterThan(g?.workingSupply ?? JSBI.BigInt(0), JSBI.BigInt(0)) ? 10 : 9.5,
    subLabel: `${g?.weight.toFixed(2) ?? '0'}%`,
    color: darken(Math.floor(i / numColors) * 0.2, colorsForChart[i % numColors]),
  }))

  const { width } = useWindowSize()

  return (
    <Wrapper>
      <RowBetween marginBottom="1rem">
        <TYPE.largeHeader>Governance</TYPE.largeHeader>
      </RowBetween>
      {data.length === 0 ? (
        <WrappedRow>
          <Loader />
        </WrappedRow>
      ) : (
        <>
          <AutoRow>
            <TYPE.body marginLeft="auto" marginRight="auto">
              Current Pool Weights
            </TYPE.body>{' '}
          </AutoRow>
          <WrappedRow>
            <RadialChart
              colorType="literal"
              data={data}
              width={Math.min((width ?? 0) * 0.8, 600)}
              height={Math.min((width ?? 0) * 0.8, 600)}
              margin={0}
              style={{ marginLeft: 'auto' }}
            />
            {!isMobile && (
              <RowBetween style={{ flexWrap: 'wrap', maxWidth: '20rem' }}>
                {data.map(({ label, color }) => (
                  <RowFixed key={`legend-${label}`} style={{ width: '49%' }}>
                    <ColorBox color={color} /> <TYPE.subHeader>{label}</TYPE.subHeader>
                  </RowFixed>
                ))}
              </RowBetween>
            )}
          </WrappedRow>
          {isMobile && (
            <RowBetween style={{ flexWrap: 'wrap', maxWidth: '20rem', marginRight: 'auto', marginLeft: 'auto' }}>
              {data.map(({ label, color }) => (
                <RowFixed key={`legend-${label}`} style={{ width: '49%' }}>
                  <ColorBox color={color} /> <TYPE.subHeader>{label}</TYPE.subHeader>
                </RowFixed>
              ))}
            </RowBetween>
          )}
        </>
      )}
    </Wrapper>
  )
}
