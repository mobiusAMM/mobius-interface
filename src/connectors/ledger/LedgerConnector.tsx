// Largely based off of CeloVote
// https://github.com/zviadm/celovote-app/blob/main/src/ledger.ts

import { ContractKit, newKit } from '@celo/contractkit'
import { AddressValidation, LedgerWallet, newLedgerWalletWithSetup } from '@celo/wallet-ledger'
import TransportWebUSB from '@ledgerhq/hw-transport-webusb'
import { CHAIN_INFO, ChainId } from '@ubeswap/sdk'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { ConnectorUpdate } from '@web3-react/types'
import LedgerConnectorModal from 'components/WalletModal/LedgerWalletSelector'
import React from 'react'
import * as ReactDOM from 'react-dom'
import { EventController } from 'utils/EventController'

import { NETWORK_CHAIN_ID } from '..'

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

  close = () => {
    if (this.closed) {
      return
    }
    this.closed = true
    this.wallet.transport.close()
    this.kit.stop()
  }
}

export class LedgerConnector extends AbstractConnector {
  private kit: LedgerKit | null = null
  private index: number | null = null
  private eventController: EventController = new EventController()
  private show = false

  constructor(connectedKit?: { kit: LedgerKit; index: number }) {
    super({ supportedChainIds: [NETWORK_CHAIN_ID] })
    if (connectedKit) {
      this.kit = connectedKit.kit
      this.index = connectedKit.index
    }
  }

  public async activate(): Promise<ConnectorUpdate> {
    console.log('Activating')
    if (this.kit && this.index !== null) {
      return {
        provider: this.kit.kit.web3.currentProvider,
        chainId: NETWORK_CHAIN_ID,
        account: this.kit.wallet.getAccounts()[this.index],
      }
    }
    const idxs = [0, 1, 2, 3, 4]
    const ledgerKit = await LedgerKit.init(NETWORK_CHAIN_ID, idxs)
    this.kit = ledgerKit
    return {
      provider: ledgerKit.kit.web3.currentProvider,
      chainId: NETWORK_CHAIN_ID,
      account: ledgerKit.wallet.getAccounts()[0],
    }
  }

  public async enable(): Promise<number> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      this.on(INDEX_SELECTED_EVENT, (index) => resolve(index))
      // this.on(ERROR_EVENT, (error) => reject(error))
      this.on(INDEX_SELECTOR_CLOSED, () => reject('Modal closed by user'))
      await this._toggleModal()
    })
  }

  public async getProvider(): Promise<any> {
    return this.kit?.kit.web3.currentProvider ?? null
  }

  public async getChainId(): Promise<number> {
    return NETWORK_CHAIN_ID
  }

  public async getAccount(): Promise<string | null> {
    return this.kit?.wallet.getAccounts()?.[0] ?? null
  }

  public deactivate() {
    this.kit?.close()
  }

  public loadModal() {
    const el = document.createElement('div')
    el.id = LEDGER_MODAL_ID
    document.body.appendChild(el)

    ReactDOM.render(
      <LedgerConnectorModal handleSelectIndex={(i: number) => console.log(i)} onClose={() => console.log('closed')} />,
      document.getElementById(LEDGER_MODAL_ID)
    )
  }

  async close() {
    this.kit?.close()
    this.kit = null
    this.emitDeactivate()
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
