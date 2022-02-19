import React from 'react'
import styled from 'styled-components'

export const BodyWrapper = styled.div<{ mobile: boolean; wide?: boolean }>`
  position: relative;
  max-width: ${({ wide }) => (wide ? '640px' : '420px')};
  width: 100%;
  background: ${({ theme }) => theme.bg1};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 24px;
  margin-top: ${({ mobile }) => (mobile ? '1rem' : '3rem')};
`

export const BodyWrapperNoBackground = styled.div`
  position: relative;
  max-width: 420px;
  width: 100%;
  background: none;
  border-radius: 30px;
  /* padding: 1rem; */
`

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
export default function AppBody({
  children,
  mobile,
  wide,
}: {
  children: React.ReactNode
  mobile: boolean
  wide?: boolean
}) {
  return (
    <BodyWrapper wide={wide} mobile={mobile}>
      {children}
    </BodyWrapper>
  )
}

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
export function AppBodyNoBackground({ children }: { children: React.ReactNode }) {
  return <BodyWrapperNoBackground>{children}</BodyWrapperNoBackground>
}
