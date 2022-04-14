import 'react-vis/dist/style.css'

import { ButtonEmpty } from 'components/Button'
import useTheme from 'hooks/useTheme'
import React, { useState } from 'react'
import {
  DiscreteColorLegend,
  Highlight,
  HighlightArea,
  Hint,
  LineSeries,
  LineSeriesPoint,
  XAxis,
  XYPlot,
  YAxis,
} from 'react-vis'
import styled from 'styled-components'
import { TYPE } from 'theme'

type DataPoint = { x: number; y: number }

const ToolTip = styled.div`
  background: ${({ theme }) => theme.bg3};
  padding: 0.5rem;
  border-radius: 15px;
`

const Container = styled.div`
  position: relative;
`

const ResetButton = styled(ButtonEmpty)`
  position: absolute;
  top: auto;
  bottom: auto;
  right: 0;
  width: fit-content;
`
interface VolumeChartProps {
  data: DataPoint[][]
  labels: string[]
  xLabelFormat: (num: number) => string
  width: number
}

export default function VolumeChart({ data, labels, width, xLabelFormat }: VolumeChartProps) {
  const [area, setArea] = useState<HighlightArea | undefined | null>()
  const [hovered, setHovered] = useState<number>()
  const [hoverValue, setHoverValue] = useState<LineSeriesPoint>()
  const theme = useTheme()
  return (
    <Container>
      <XYPlot
        //   animation
        xDomain={area && [area.left, area.right]}
        yDomain={area && [area.bottom, area.top]}
        width={width}
        height={500}
        onMouseLeave={() => setHoverValue(undefined)}
      >
        {/* <HorizontalGridLines /> */}
        <DiscreteColorLegend
          items={labels.map((s) => (
            <TYPE.body key={`legend-${s}`}>{s}</TYPE.body>
          ))}
          orientation="horizontal"
          onItemMouseEnter={(_, index) => setHovered(index)}
          onItemMouseLeave={() => setHovered(undefined)}
        />
        <YAxis
          hideLine
          left={-75}
          width={120}
          tickPadding={0}
          title="Volume"
          tickFormat={(v) => {
            if (v < 1000) {
              return v
            }
            if (v < 10 ** 6) {
              return `${v / 1000}K`
            }
            if (v < 10 ** 10) {
              return `${(v / 10 ** 6).toFixed(1)}M`
            }
          }}
          style={{ text: { width: '10rem', zIndex: 999, fill: theme.text1 } }}
        />
        <XAxis tickFormat={(v) => xLabelFormat(v)} title="Time" style={{ text: { fill: theme.text1 } }} />
        {hoverValue && (
          <Hint value={hoverValue}>
            <ToolTip>
              <TYPE.italic fontWeight="bold">{hoverValue?.label}</TYPE.italic>
              <TYPE.body>{`Date: ${xLabelFormat(hoverValue?.x)}`}</TYPE.body>
              <TYPE.body>Volume: {hoverValue.y.toLocaleString()}</TYPE.body>
            </ToolTip>
          </Hint>
        )}
        {data.map((entry, i) => (
          <LineSeries
            key={labels[i]}
            data={entry}
            opacity={hovered && hovered !== i ? 0.33 : 1}
            stack={true}
            onNearestXY={(point) => setHoverValue({ ...point, label: labels[i] })}
          />
        ))}
        <Highlight
          onBrushEnd={(newArea) => setArea(newArea)}
          onDrag={(newArea) => {
            !!area &&
              !!newArea &&
              area.top &&
              area.bottom &&
              newArea.top &&
              newArea.bottom &&
              area.right &&
              area.left &&
              newArea.right &&
              newArea.left &&
              setArea({
                bottom: area.bottom + (newArea.top - newArea.bottom),
                left: area.left - (newArea.right - newArea.left),
                right: area.right - (newArea.right - newArea.left),
                top: area.top + (newArea.top - newArea.bottom),
              })
          }}
        />
      </XYPlot>
      {area && <ResetButton onClick={() => setArea(undefined)}>Reset Zoom</ResetButton>}
    </Container>
  )
}
