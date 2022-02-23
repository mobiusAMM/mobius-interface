export * from './web3'

// export function useActiveContractKit() {
//   const kit = useContractKit()
//   const {
//     address: account,
//     network: { chainId },
//   } = kit
//   const library = useProvider()
//   return {
//     ...kit,
//     account,
//     library,
//     chainId,
//   }
// }

// export function useChainId(): number | undefined {
//   const {
//     network: { chainId },
//   } = useContractKit()
//   return chainId
// }
