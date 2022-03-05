import { ReadOnlyWallet } from '@celo/connect'
import { CeloTokenContract, ContractKit, newKit } from '@celo/contractkit'
import {
  WalletConnectWallet as WalletConnectWalletV1,
  WalletConnectWalletOptions as WalletConnectWalletOptionsV1,
} from '@celo/wallet-walletconnect-v1'
import { Connector, Network, WalletTypes } from '@celo-tools/use-contractkit'
import { BigNumber } from 'bignumber.js'

export class ValoraConnector implements Connector {
  public initialised = false
  public type = WalletTypes.WalletConnect
  public kit: ContractKit
  public account: string | null = null

  private onUriCallback?: (uri: string) => void
  private onCloseCallback?: () => void

  constructor(
    readonly network: Network,
    public feeCurrency: CeloTokenContract,
    // options: WalletConnectWalletOptions | WalletConnectWalletOptionsV1,
    options: WalletConnectWalletOptionsV1,
    readonly autoOpen = false,
    readonly getDeeplinkUrl?: (uri: string) => string,
    readonly version?: number
  ) {
    const wallet = new WalletConnectWalletV1(options)
    // Uncomment with WCV2 support
    // version == 1
    //   ? new WalletConnectWalletV1(options as WalletConnectWalletOptionsV1)
    //   : new WalletConnectWallet(options as WalletConnectWalletOptions);
    this.kit = newKit(network.rpcUrl, wallet as ReadOnlyWallet)
    this.version = version
  }

  onUri(callback: (uri: string) => void): void {
    this.onUriCallback = callback
  }

  onClose(callback: () => void): void {
    this.onCloseCallback = callback
  }

  async initialise(): Promise<this> {
    const wallet = this.kit.getWallet() as WalletConnectWalletV1

    if (this.onCloseCallback) {
      // Uncomment with WCV2 support
      // wallet.onPairingDeleted = () => this.onCloseCallback?.();
      wallet.onSessionDeleted = () => this.onCloseCallback?.()
    }

    const uri = await wallet.getUri()
    if (uri && this.onUriCallback) {
      this.onUriCallback(uri)
    }

    if (uri && this.autoOpen) {
      const deepLink = this.getDeeplinkUrl ? this.getDeeplinkUrl(uri) : uri
      location.href = deepLink
    }

    await wallet.init()
    const [address] = wallet.getAccounts()
    const defaultAccount = await this.fetchWalletAddressForAccount(address)
    this.kit.defaultAccount = defaultAccount
    this.account = defaultAccount ?? null

    await this.updateFeeCurrency(this.feeCurrency)
    this.initialised = true

    return this
  }

  private async fetchWalletAddressForAccount(address?: string) {
    if (!address) {
      return undefined
    }
    const accounts = await this.kit.contracts.getAccounts()
    const walletAddress = await accounts.getWalletAddress(address)
    return new BigNumber(walletAddress).isZero() ? address : walletAddress
  }

  async updateFeeCurrency(feeContract: CeloTokenContract): Promise<void> {
    this.feeCurrency = feeContract
    await this.kit.setFeeCurrency(feeContract)
  }

  close(): Promise<void> {
    const wallet = this.kit.getWallet() as WalletConnectWalletV1
    return wallet.close()
  }
}
