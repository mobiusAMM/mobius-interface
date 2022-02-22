import { gql, useQuery } from '@apollo/client'
import Card from 'components/Card'
import { AutoColumn } from 'components/Column'
import Logo from 'components/Logo'
import Row, { RowBetween, RowFixed } from 'components/Row'
import Toggle from 'components/Toggle'
import VolumeChart from 'components/VolumeChart'
import { ChainLogo, Coins, PRICE } from 'constants/StablePools'
import useTheme from 'hooks/useTheme'
import { useWindowSize } from 'hooks/useWindowSize'
import React, { useState } from 'react'
import { isMobile } from 'react-device-detect'
import { usePools } from 'state/mobiusPools/hooks'
import { StableSwapPool } from 'state/stablePools/reducer'
import styled from 'styled-components'
import { Sel, TYPE } from 'theme'

const OuterContainer = styled.div`
  width: min(1280px, 100%);
  margin-top: ${!isMobile ? '3rem' : '-1rem'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`

const StyledLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  background-color: ${({ theme }) => theme.white};
`

const PoolSelection = styled(RowBetween)`
  padding: 0.5rem;
  background: ${({ theme }) => theme.bg1};
  margin: 0.1rem;
  border-radius: 10px;
`

const ChartContainer = styled(Card)`
  background: ${({ theme }) => theme.bg1};
  padding-bottom: 5rem;
`

const PoolDropDown = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  z-index: 999;
  background: ${({ theme }) => theme.bg4};
  padding: 0.5rem;
  border-radius: 0.5rem;
  width: min(420px, 80vw);
`

const SelectPoolsButton = styled.div`
  position: relative;
`

const volumeQuery = gql`
  {
    swaps {
      id
      tokens {
        id
        name
      }
      hourlyVolumes {
        volume
        timestamp
      }
      dailyVolumes {
        volume
        timestamp
      }
      weeklyVolumes {
        volume
        timestamp
      }
    }
  }
`
enum Granularity {
  Hour = 1,
  Day = 2,
  Week = 3,
}

const granularityMapping: { [g in Granularity]: string } = {
  [Granularity.Hour]: 'hourlyVolumes',
  [Granularity.Day]: 'dailyVolumes',
  [Granularity.Week]: 'weeklyVolumes',
}

const timeFormat: { [g: Granularity]: (n: number) => string } = {
  [Granularity.Hour]: (t: number) => new Date(t * 1000).toLocaleTimeString(),
  [Granularity.Day]: (t: number) => new Date(t * 1000).toLocaleDateString(),
  [Granularity.Week]: (t: number) => new Date(t * 1000).toLocaleDateString(),
}

function getPoolName(pools: StableSwapPool[], address: string) {
  return pools.filter((p) => p.address.toLowerCase() == address)[0]?.name ?? 'Unknown'
}

export default function Charts() {
  const { data, loading, error } = useQuery(volumeQuery)
  const [granularity, setGranularity] = useState<Granularity>(Granularity.Week)
  const [showTotal, setShowTotal] = useState(true)
  const [selectedPools, setSelectedPools] = useState<Record<string, number | undefined>>({})
  const [showPoolSelect, setShowPoolSelect] = useState(false)
  const pools = usePools().slice()
  const { width } = useWindowSize()
  const theme = useTheme()

  const totals = data
    ? data.swaps.reduce((accum, info) => {
        const price =
          info.id === '0x19260b9b573569dDB105780176547875fE9fedA3'.toLowerCase()
            ? PRICE[Coins.Bitcoin]
            : info.id === '0xE0F2cc70E52f05eDb383313393d88Df2937DA55a'.toLowerCase()
            ? PRICE[Coins.Ether]
            : PRICE[Coins.USD]
        info[granularityMapping[granularity]].forEach((vol, i) => {
          accum[vol.timestamp] = price * parseInt(vol.volume) + (accum[vol.timestamp] ?? 0)
        })
        return accum
      }, {})
    : undefined

  let dataAndLabels = data
    ? data.swaps
        .filter(({ id }: { id: string }) => selectedPools[id])
        .sort((p1, p2) => {
          if (selectedPools[p1.id] < selectedPools[p2.id]) return 1
          if (selectedPools[p1.id] > selectedPools[p2.id]) return -1
          return 0
        })
        .map((info) => [
          getPoolName(pools, info.id),
          info[granularityMapping[granularity]].map((vol) => ({
            x: parseInt(vol.timestamp),
            y: parseInt(vol.volume),
          })),
        ])
    : []
  if (showTotal && totals) {
    dataAndLabels.push(['Total', Object.entries(totals).map(([time, vol]) => ({ x: time, y: vol }))])
  }
  dataAndLabels = dataAndLabels.reverse()
  const chartData = dataAndLabels.map((group) => group[1])
  const labels = dataAndLabels.map((group) => group[0])

  return (
    <OuterContainer>
      <Row>
        {!loading && !error && (
          <ChartContainer paddingBottom="10rem">
            <TYPE.mediumHeader marginRight="auto" marginLeft="auto" textAlign="center">
              Volume Over Time
            </TYPE.mediumHeader>

            <RowBetween>
              <RowFixed>
                <Sel selected={granularity === Granularity.Hour} onClick={() => setGranularity(Granularity.Hour)}>
                  1hr
                </Sel>
                <Sel selected={granularity === Granularity.Day} onClick={() => setGranularity(Granularity.Day)}>
                  24hr
                </Sel>
                <Sel selected={granularity === Granularity.Week} onClick={() => setGranularity(Granularity.Week)}>
                  7d
                </Sel>
              </RowFixed>
              <SelectPoolsButton onMouseEnter={() => setShowPoolSelect(true)}>
                <TYPE.mediumHeader color={theme.primary1}>Select Pools</TYPE.mediumHeader>

                {showPoolSelect && (
                  <PoolDropDown onMouseLeave={() => setShowPoolSelect(false)}>
                    {' '}
                    <AutoColumn>
                      <PoolSelection>
                        <RowFixed>
                          <TYPE.mediumHeader>Total</TYPE.mediumHeader>
                        </RowFixed>
                        <Toggle isActive={showTotal} toggle={() => setShowTotal(!showTotal)} />
                      </PoolSelection>

                      {pools
                        .sort((p1, p2) => p1.displayChain - p2.displayChain)
                        .filter(({ disabled }) => !disabled)
                        .map((p) => (
                          <PoolSelection key={`charts-${p.name}`}>
                            <RowFixed>
                              <StyledLogo size={'32px'} srcs={[ChainLogo[p.displayChain]]} alt={'logo'} />{' '}
                              <TYPE.mediumHeader style={{ marginLeft: '0.2rem' }}>{p.name}</TYPE.mediumHeader>
                            </RowFixed>
                            <Toggle
                              isActive={!!selectedPools[p.address.toLowerCase()]}
                              toggle={() => {
                                if (selectedPools[p.address.toLowerCase()]) {
                                  setSelectedPools({ ...selectedPools, [p.address.toLowerCase()]: undefined })
                                } else {
                                  setSelectedPools({
                                    ...selectedPools,
                                    [p.address.toLowerCase()]: Object.keys(selectedPools).length + 1,
                                  })
                                }
                              }}
                            />
                          </PoolSelection>
                        ))}
                    </AutoColumn>
                  </PoolDropDown>
                )}
              </SelectPoolsButton>
            </RowBetween>
            <VolumeChart
              data={chartData}
              labels={labels}
              width={Math.min(0.9 * width, 0.95 * 1280)}
              xLabelFormat={timeFormat[granularity]}
            />
          </ChartContainer>
        )}
      </Row>
    </OuterContainer>
  )
}
