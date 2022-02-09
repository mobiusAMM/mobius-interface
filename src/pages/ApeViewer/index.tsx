import { ButtonConfirmed } from 'components/Button'
import Card from 'components/Card'
import React from 'react'
import Countdown from 'react-countdown'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

import { colors, TYPE } from '../../theme'

const { primary1: mobiGreen, bg4 } = colors(false)

const StyledCountdown = styled(Countdown)`
  padding: 2rem;
  font-size: 3rem;
`

const Container = styled.div`
  width: 100vw;
  padding-top: 4rem;
  display: flex;
  flex-wrap: wrap;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 1.25rem;
    padding-top: 0;
    margin-top: 0;
`}
  overflow: none;
`

const Footer = styled.div`
  display: flex;
  justify-content: space-around;
`

const ExternalLink = styled.a`
  margin: 0.5rem;
  height: 3rem;
  width: 3rem;
  border-radius: 2rem;
  background: white;
  cursor: pointer;
`

const LogoContainer = styled.div`
  width: min(25rem, 95%);
  margin-top: 2rem;
`

export const StyledMenuButton = styled(NavLink)`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: min(15rem, 70%);
  height: 100%;
  border: none;
  background-color: ${mobiGreen};
  margin: 2rem;
  margin-top: 0.5rem;
  padding: 1rem;
  height: 35px;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 1000;
  color: black;
  text-decoration: none;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    background-color: ${({ theme }) => theme.primary2};
  }

  svg {
    margin-top: 2px;
  }
  > * {
    stroke: ${({ theme }) => theme.text1};
  }
`

const Divider = styled.div`
  width: 100%;
  background: ${({ theme, show }) => show && theme.primary3};
  height: 1px;
  margin: auto;
  margin-top: 1rem;
  margin-bottom: 2.5rem;
`

export const ComingSoon = styled.a`
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: min(15rem, 70%);
  height: 100%;
  border: none;
  background-color: ${bg4};
  margin: 2rem;
  margin-top: 0;
  padding: 1.5rem;
  height: 35px;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 1000;
  color: black;
  text-decoration: none;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
  }

  svg {
    margin-top: 2px;
  }
  > * {
    stroke: ${({ theme }) => theme.text1};
  }
`

// const NETWORK_LABELS: { [chainId in ChainId]?: string } = {
//   [ChainId.ALFAJORES]: 'Alfajores',
//   [ChainId.BAKLAVA]: 'Baklava',
// }

const Image = styled.img`
  width: 10rem;
  height: 10rem;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  width: 5rem;
  height: 5rem;
`}
`
const ImageContainer = styled(Card)`
  display: flex;
  width: fit-content;
  flex-direction: column;
  align-items: center;
  align-content: center;
  padding: 2.5rem;
  margin: 1rem;
  border-radius: 1rem;
  background: ${({ theme }) => theme.bg1};
  ${({ theme }) => theme.mediaWidth.upToSmall`
  padding: 1rem;
`}
`
const InputApes = styled.div`
  display: flex;
  align-items: center;
  width: min(100%, 100rem);
  flex-wrap: wrap;
`
const Input = styled.input<{ error?: boolean }>`
  font-size: 1.25rem;
  margin: 0.5rem;
  outline: none;
  border: none;
  flex: 1 1 auto;
  background-color: ${({ theme }) => theme.bg1};
  transition: color 300ms ${({ error }) => (error ? 'step-end' : 'step-start')};
  color: ${({ error, theme }) => (error ? theme.red1 : theme.primary1)};
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
  width: min(50rem, 100%);
  height: 3rem;
  border-radius: 0.5rem;
  ::placeholder {
    color: ${({ theme }) => theme.text4};
  }
  padding: 0px;
  -webkit-appearance: textfield;
  ::-webkit-search-decoration {
    -webkit-appearance: none;
  }
  ::-webkit-outer-spin-button,
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
  ::placeholder {
    color: ${({ theme }) => theme.text4};
  }
`

const MyButton = styled(ButtonConfirmed)`
  max-width: 20rem;
`

export default function ApeViewer() {
  const [apeIDs, setApeIDs] = React.useState<string[]>([])
  const [id, setId] = React.useState<string>()
  // for (let i = 293; i < 393; i++) apeIDs.push(i)
  const addApes = () => {
    const val: string = id
    const add: string[] = []
    val.split(',').forEach((num) => {
      const split = num
        .trim()
        .split(':')
        .map((s) => s.trim())
      if (split.length === 1) {
        add.push(split[0])
      } else if (split.length > 1) {
        for (let i = parseInt(split[0]); i <= parseInt(split[1]); i++) add.push(i.toString())
      }
      setApeIDs([...apeIDs, ...add])
      setId('')
    })
  }
  const baseUrl = 'https://ipfs.io/ipfs/bafybeiasnbk7bztvmytiqf2a5aw5jmivvnxhrdwtp72ihbpjrlh33g32ee/apes/'
  return (
    <Container>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <InputApes>
          <Input
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="Type your ape IDs! Separate individual IDs with ' , ' or specify a range using ' : '"
          />
          <MyButton onClick={addApes}>View Apes!</MyButton>
        </InputApes>
      </div>
      {apeIDs.map((id) => (
        <ImageContainer key={id}>
          <Image src={`${baseUrl}${id}.png`} />
          <TYPE.mediumHeader>ID: {id}</TYPE.mediumHeader>
        </ImageContainer>
      ))}
    </Container>
  )
}
