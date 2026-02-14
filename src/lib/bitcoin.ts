/**
 * Bitcoin via Unisat Wallet — clean and simple.
 * No local node or RPC. User signs and sends with Unisat extension.
 */

declare global {
  interface Window {
    unisat?: {
      getAccounts(): Promise<string[]>
      requestAccounts(): Promise<string[]>
      sendBitcoin(address: string, amount: number): Promise<string> // amount in satoshis; returns txid
    }
  }
}

const BTC_TO_SATS = 100_000_000

function getUnisat(): NonNullable<typeof window.unisat> {
  if (typeof window === 'undefined' || !window.unisat) {
    throw new Error('Unisat Wallet not found. Install the Unisat extension to send Bitcoin.')
  }
  return (window as any).unisat
}

export interface SendResult {
  txid: string
  amountBtc: string
  recipientAddress: string
}

/** Send BTC to address (amount in BTC string). Opens Unisat for user to sign. Returns txid. */
export async function sendToAddress(recipientAddress: string, amountBtc: string): Promise<SendResult> {
  
  const amount = parseFloat(amountBtc)
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Invalid amount')
  const unisat = (window as any).unisat

  await unisat.switchNetwork("testnet");

  const satoshis = Math.round(amount * BTC_TO_SATS)

  const txid = await unisat.sendBitcoin(recipientAddress, satoshis)
  return { txid, amountBtc, recipientAddress }
}

/** Validate address (basic format check). */
export async function validateAddress(address: string): Promise<boolean> {
  if (!address || typeof address !== 'string') return false
  const trimmed = address.trim()
  return /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(trimmed)
}

/** Get current Unisat address (requires prior connection). */
export async function getNewAddress(): Promise<string> {
  const unisat = getUnisat()
  const accounts = await unisat.getAccounts()
  if (!accounts?.length) throw new Error('Unisat not connected. Connect your wallet first.')
  return accounts[0]
}

/** Connect Unisat and return the first address (for Credentials Provider / wallet list). */
export async function createBitcoinWallet(): Promise<{ address: string }> {
  const unisat = getUnisat()
  const accounts = await unisat.requestAccounts()
  if (!accounts?.length) throw new Error('Unisat connection refused or no accounts.')
  return { address: accounts[0] }
}

/** Check if Unisat is available (extension installed). */
export function isUnisatAvailable(): boolean {
  return typeof window !== 'undefined' && !!window.unisat
}

/** @deprecated Use isUnisatAvailable. Kept for compatibility. */
export function isMockBitcoin(): boolean {
  return !isUnisatAvailable()
}
