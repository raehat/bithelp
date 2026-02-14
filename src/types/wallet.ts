/**
 * Wallets are held by the Credentials Provider Agent only.
 * Other agents do not have access to wallet addresses or keys.
 */

export type WalletType = 'bitcoin'

export interface Wallet {
  id: string
  type: WalletType
  /** Receive address (for Bitcoin: the address to fund). */
  address: string
  label: string
  createdAt: string // ISO
  /** Optional: which agent manages this (always Credentials Provider). */
  managedBy: 'credentials-provider-agent'
}
