import { Fraction } from '@ubeswap/sdk'
import { useWeb3Context } from 'hooks'
import JSBI from 'jsbi'
import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { CHAIN } from '../../constants'
import { AppDispatch, AppState } from '../index'
import { addPopup, ApplicationModal, PopupContent, removePopup, setOpenModal } from './actions'

export function useBlockNumber(): number | undefined {
  return useSelector((state: AppState) => state.application.blockNumber[CHAIN])
}

export function useModalOpen(modal: ApplicationModal): boolean {
  const openModal = useSelector((state: AppState) => state.application.openModal)
  return openModal === modal
}

export function useToggleModal(modal: ApplicationModal): () => void {
  const open = useModalOpen(modal)
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(() => dispatch(setOpenModal(open ? null : modal)), [dispatch, modal, open])
}

export function useOpenModal(modal: ApplicationModal): () => void {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(() => dispatch(setOpenModal(modal)), [dispatch, modal])
}

export function useCloseModals(): () => void {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(() => dispatch(setOpenModal(null)), [dispatch])
}

export function useWalletModalToggle(): () => void {
  const { connect, address } = useWeb3Context()
  const toggle = useToggleModal(ApplicationModal.WALLET)
  return address === null ? connect : toggle
}

export function useToggleSettingsMenu(): () => void {
  return useToggleModal(ApplicationModal.SETTINGS)
}

export function useShowClaimPopup(): boolean {
  return useModalOpen(ApplicationModal.CLAIM_POPUP)
}

export function useToggleShowClaimPopup(): () => void {
  return useToggleModal(ApplicationModal.CLAIM_POPUP)
}

export function useToggleSelfClaimModal(): () => void {
  return useToggleModal(ApplicationModal.SELF_CLAIM)
}

export function useToggleDelegateModal(): () => void {
  return useToggleModal(ApplicationModal.DELEGATE)
}

export function useToggleVoteModal(): () => void {
  return useToggleModal(ApplicationModal.VOTE)
}

// returns a function that allows adding a popup
export function useAddPopup(): (content: PopupContent, key?: string) => void {
  const dispatch = useDispatch()

  return useCallback(
    (content: PopupContent, key?: string) => {
      dispatch(addPopup({ content, key }))
    },
    [dispatch]
  )
}

// returns a function that allows removing a popup via its key
export function useRemovePopup(): (key: string) => void {
  const dispatch = useDispatch()
  return useCallback(
    (key: string) => {
      dispatch(removePopup({ key }))
    },
    [dispatch]
  )
}

// get the list of active popups
export function useActivePopups(): AppState['application']['popupList'] {
  const list = useSelector((state: AppState) => state.application.popupList)
  return useMemo(() => list.filter((item) => item.show), [list])
}

export function useEthBtcPrice(address: string): JSBI {
  const prices = useSelector((state: AppState) => ({
    ethPrice: state.application.ethPrice,
    btcPrice: state.application.btcPrice,
  }))
  return address === '0x19260b9b573569dDB105780176547875fE9fedA3' ||
    address === '0xBe50a3013A1c94768A1ABb78c3cB79AB28fc1aCE'
    ? JSBI.BigInt(prices.btcPrice)
    : address === '0xE0F2cc70E52f05eDb383313393d88Df2937DA55a' ||
      address === '0xE919F65739c26a42616b7b8eedC6b5524d1e3aC4'
    ? JSBI.BigInt(prices.ethPrice)
    : JSBI.BigInt('1')
}

export function useTokenPrice(address: string | undefined): Fraction | undefined {
  const priceString = useSelector((state: AppState) => {
    return state.application.tokenPrices[address?.toLowerCase()]
  })
  return priceStringToFraction(priceString)
}

export function priceStringToFraction(priceString: string | undefined): Fraction | undefined {
  if (!priceString) return undefined
  const price = parseFloat(priceString) * 10 ** 4
  const asFraction = new Fraction(price.toFixed(0), '10000')
  return asFraction ?? undefined
}

export function useTokenPrices() {
  return useSelector((state: AppState) => state.application.tokenPrices)
}
