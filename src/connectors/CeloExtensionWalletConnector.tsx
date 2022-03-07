import { CeloTokenContract, ContractKit, newKit, newKitFromWeb3 } from '@celo/contractkit'

type Web3Type = Parameters<typeof newKitFromWeb3>[0]

/**
 * Connects to the Celo Extension Wallet. Taken from use-contractkit.
 */
export class CeloExtensionWalletConnector {
  public initialised = false
  public kit: ContractKit
  public account: string | null = null
  private onNetworkChangeCallback?: (chainId: number) => void

  constructor(public feeCurrency: CeloTokenContract) {
    this.kit = newKit('https://forno.celo.org')
  }

  async initialise(): Promise<this> {
    const { default: Web3 } = await import('web3')

    const celo = window.celo
    if (!celo) {
      throw new Error('Celo Extension Wallet not installed')
    }
    const web3 = new Web3(celo)
    await celo.enable()
    ;(
      web3.currentProvider as unknown as {
        publicConfigStore: {
          on: (event: string, cb: (args: { networkVersion: number }) => void) => void
        }
      }
    ).publicConfigStore.on('update', ({ networkVersion }) => {
      if (this.onNetworkChangeCallback) {
        this.onNetworkChangeCallback(networkVersion)
      }
    })

    this.kit = newKitFromWeb3(web3 as unknown as Web3Type)
    const [defaultAccount] = await this.kit.web3.eth.getAccounts()
    this.kit.defaultAccount = defaultAccount
    this.account = defaultAccount ?? null

    await this.updateFeeCurrency(this.feeCurrency)
    this.initialised = true

    return this
  }
  async updateFeeCurrency(feeContract: CeloTokenContract): Promise<void> {
    this.feeCurrency = feeContract
    await this.kit.setFeeCurrency(this.feeCurrency)
  }

  onNetworkChange(callback: (chainId: number) => void): void {
    this.onNetworkChangeCallback = callback
  }

  close(): void {
    return
  }
}
