/**
 * Local Bitcoin node client (regtest/signet or mainnet node on localhost).
 * Uses JSON-RPC over HTTP. Vite proxy forwards /btc → 127.0.0.1:8332.
 * For dev without a node, use mock mode (see env or window.__AP2_MOCK_BTC__).
 */

const RPC_URL = '/btc'
const MOCK = typeof window !== 'undefined' && (window as unknown as { __AP2_MOCK_BTC__?: boolean }).__AP2_MOCK_BTC__

let requestId = 0

async function rpc<T>(method: string, params: unknown[] = []): Promise<T> {
  if (MOCK) {
    return mockRpc(method, params) as Promise<T>
  }
  const res = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '1.0',
      id: ++requestId,
      method,
      params,
    }),
  })
  if (!res.ok) throw new Error(`Bitcoin RPC HTTP ${res.status}`)
  const data = await res.json()
  if (data.error) throw new Error(data.error.message || 'RPC error')
  return data.result as T
}

/** Mock responses for development without a real node. */
function mockRpc(method: string, params: unknown[]): unknown {
  switch (method) {
    case 'getblockcount':
      return 210000
    case 'getwalletinfo':
      return { balance: 0.5, walletname: 'ap2' }
    case 'getnewaddress':
      return 'bcrt1qmock' + Math.random().toString(36).slice(2, 12)
    case 'sendtoaddress': {
      const txid = 'mock' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
      return txid
    }
    case 'validateaddress': {
      const [address] = params as [string]
      return { isvalid: address.length >= 10 }
    }
    default:
      return null
  }
}

export interface SendResult {
  txid: string
  amountBtc: string
  recipientAddress: string
}

/** Send BTC to address (amount in BTC string). Returns txid. */
export async function sendToAddress(recipientAddress: string, amountBtc: string): Promise<SendResult> {
  const amount = parseFloat(amountBtc)
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Invalid amount')
  const txid = await rpc<string>('sendtoaddress', [recipientAddress, amount])
  return { txid, amountBtc, recipientAddress }
}

/** Validate address (optional pre-check). */
export async function validateAddress(address: string): Promise<boolean> {
  const result = await rpc<{ isvalid: boolean }>('validateaddress', [address])
  return result?.isvalid ?? false
}

/** Get a new receive address (for demo/display). */
export async function getNewAddress(): Promise<string> {
  return rpc<string>('getnewaddress', [])
}

/** Check if we're using mock (no real node). */
export function isMockBitcoin(): boolean {
  return !!MOCK
}
