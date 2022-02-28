import JSBI from 'jsbi'
import { ChainId, Percent, Token } from 'lib/token-utils'

export { MOBI } from './tokens'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

// a list of tokens by chain
type ChainTokenList = {
  // readonly [chainId in ChainId]: Token[]
  readonly [chainId: number]: Token[]
}

// Block time here is slightly higher (~1s) than average in order to avoid ongoing proposals past the displayed time
export const AVERAGE_BLOCK_TIME_IN_SECS = 13
export const PROPOSAL_LENGTH_IN_BLOCKS = 40_320
export const PROPOSAL_LENGTH_IN_SECS = AVERAGE_BLOCK_TIME_IN_SECS * PROPOSAL_LENGTH_IN_BLOCKS

export const weiScale = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18))
export const FEE_DISTRIBUTOR = '0xeF4788e8C79c5B2dc1d70484C86161102879b0cc'
export const POOL_PROXY = '0x1bc2DbB8c4d04AaCF4A7fefcDB060766964B5237'

// used for display in the default list when adding liquidity
export const SUGGESTED_BASES: ChainTokenList = {}

export const CHAIN = ChainId.MAINNET

// default allowed slippage, in bips
export const INITIAL_ALLOWED_SLIPPAGE = 50
// 20 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 20

// used for rewards deadlines
export const BIG_INT_SECONDS_IN_WEEK = JSBI.BigInt(60 * 60 * 24 * 7)

export const BIG_INT_SECONDS_IN_YEAR = JSBI.BigInt(60 * 60 * 24 * 365)

export const BIG_INT_ZERO = JSBI.BigInt(0)

// one basis point
export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000))
export const BIPS_BASE = JSBI.BigInt(10000)
// used for warning states
export const ALLOWED_PRICE_IMPACT_LOW: Percent = new Percent(JSBI.BigInt(100), BIPS_BASE) // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM: Percent = new Percent(JSBI.BigInt(300), BIPS_BASE) // 3%
export const ALLOWED_PRICE_IMPACT_HIGH: Percent = new Percent(JSBI.BigInt(500), BIPS_BASE) // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: Percent = new Percent(JSBI.BigInt(1000), BIPS_BASE) // 10%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT: Percent = new Percent(JSBI.BigInt(1500), BIPS_BASE) // 15%

export const ZERO_PERCENT = new Percent('0')
export const ONE_HUNDRED_PERCENT = new Percent('1')

export const NOM_REGISTRY_ADDRESS = '0x3DE51c3960400A0F752d3492652Ae4A0b2A36FB3'
export const SECONDS_IN_WEEK = 7 * 24 * 60 * 60
