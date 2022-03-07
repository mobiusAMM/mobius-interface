// Largely based off of CeloVote
// https://github.com/zviadm/celovote-app/blob/main/src/ledger.ts

import { ContractKit, newKit } from '@celo/contractkit'
import { AddressValidation, LedgerWallet, newLedgerWalletWithSetup } from '@celo/wallet-ledger'
import TransportWebUSB from '@ledgerhq/hw-transport-webusb'
import { CHAIN_INFO } from '@ubeswap/sdk'
import LedgerConnectorModal from 'components/WalletModal/LedgerWalletSelector'
import { ChainId } from 'lib/token-utils'
import React from 'react'
import * as ReactDOM from 'react-dom'
import { EventController } from 'utils/EventController'
import { MODAL_CARD_CLASSNAME } from 'web3modal'

export const LEDGER_MODAL_ID = 'ledger-index-select'
const INDEX_SELECTED_EVENT = 'index-selected'
const INDEX_SELECTOR_CLOSED = 'index-selector-closed'

export class LedgerKit {
  private closed = false
  private constructor(public chainId: ChainId, public kit: ContractKit, public wallet: LedgerWallet) {}

  public static async init(chainId: ChainId, idxs: number[]) {
    const transport = await TransportWebUSB.create()
    try {
      const wallet = await newLedgerWalletWithSetup(transport, idxs, undefined, AddressValidation.never)
      const kit = newKit(CHAIN_INFO[chainId].fornoURL, wallet)
      return new LedgerKit(chainId, kit, wallet)
    } catch (e) {
      transport.close()
      throw e
    }
  }

  public static async getAddresses(chainId: ChainId, idxs: number[]) {
    const transport = await TransportWebUSB.create()
    try {
      const wallet = await newLedgerWalletWithSetup(transport, idxs, undefined, AddressValidation.never)
      return wallet.getAccounts()
    } catch (e) {
      transport.close()
      throw e
    }
  }

  close = () => {
    if (this.closed) {
      return
    }
    this.closed = true
    this.wallet.transport.close()
    this.kit.stop()
  }
}

export class LedgerConnector {
  private eventController: EventController = new EventController()
  private show = false

  public activate(kit: LedgerKit) {
    return kit.kit.web3.currentProvider
  }

  public async enable(): Promise<number> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      this.eventController.on({ event: INDEX_SELECTED_EVENT, callback: (index) => resolve(index) })
      // this.on(ERROR_EVENT, (error) => reject(error))
      this.eventController.on({ event: INDEX_SELECTOR_CLOSED, callback: () => reject('Modal closed by user') })
      await this._toggleModal()
    })
  }

  public loadModal() {
    const [injectedDiv] = document.getElementsByClassName(MODAL_CARD_CLASSNAME)
    const el = document.createElement('div')
    el.id = LEDGER_MODAL_ID
    injectedDiv?.replaceChildren(el)
    ReactDOM.render(
      <LedgerConnectorModal
        handleSelectIndex={(i: number) => this.eventController.trigger(INDEX_SELECTED_EVENT, i)}
        onClose={() => console.log('closed')}
      />,
      document.getElementById(LEDGER_MODAL_ID)
    )
  }

  private _toggleModal = async () => {
    const d = typeof window !== 'undefined' ? document : ''
    const body = d ? d.body || d.getElementsByTagName('body')[0] : ''
    if (body) {
      if (this.show) {
        body.style.overflow = ''
      } else {
        body.style.overflow = 'hidden'
      }
    }
    this.show = !this.show
    window.setShowLedgerModal ? await window.setShowLedgerModal(this.show) : undefined
  }
}
