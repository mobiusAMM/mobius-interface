export const describeTrade = (
  mento?: boolean
): {
  label: string
  makeLabel: (isInverted: boolean) => string
  isEstimate: boolean
} => {
  let label = 'Swap'
  if (mento) {
    label = 'Mint'
  }
  return {
    label: label,
    isEstimate: true,
    makeLabel: () => label,
  }
}
