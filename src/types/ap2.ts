/**
 * AP2 — Agent Payment Protocol
 * Clean separation: Intent → Authorization → Settlement → Receipt
 * Reusable, auditable pattern for who authorized what and what was delivered.
 */

export type Step = 'intent' | 'authorization' | 'settlement' | 'receipt'

/** Step 1: What the user/agent wants to buy (prompt-driven). */
export interface PaymentIntent {
  id: string
  createdAt: string // ISO
  /** Natural language: "Buy 2 coffees for Alice", "Pay 0.001 BTC for API credits" */
  prompt: string
  /** Human-readable summary (can be derived from prompt or filled by UI). */
  summary: string
  /** Amount in BTC (string for precision). */
  amountBtc: string
  /** Recipient identifier (address or label). */
  recipient: string
  /** Optional memo for the payment. */
  memo?: string
  /** Who created this intent (e.g. "user", "agent:assistant-1"). */
  createdBy: string
}

/** Step 2: Explicit approval (who approved, when, optional conditions). */
export interface Authorization {
  id: string
  intentId: string
  createdAt: string
  /** Who authorized: "user", "agent:xyz", "delegate:wallet-1". */
  authorizedBy: string
  /** Approved | Rejected. */
  status: 'approved' | 'rejected'
  /** Optional rejection reason. */
  reason?: string
  /** Signature or token for audit (optional in MVP). */
  proof?: string
}

/** Step 3: Execution against the ledger (local Bitcoin node). */
export interface Settlement {
  id: string
  intentId: string
  authorizationId: string
  createdAt: string
  /** Success | Failed. */
  status: 'success' | 'failed'
  /** Bitcoin txid if success. */
  txid?: string
  /** Error code/message if failed. */
  error?: string
  /** Amount actually sent (BTC). */
  amountBtc: string
  /** Recipient address used. */
  recipientAddress: string
  /** Executed by (e.g. "system", "agent"). */
  executedBy: string
}

/** Step 4: Auditable record tying intent → authorization → settlement. */
export interface Receipt {
  id: string
  createdAt: string
  intent: PaymentIntent
  authorization: Authorization
  settlement: Settlement
  /** Human/system readable one-liner. */
  summary: string
}

/** In-memory flow state (could be replaced by URL state or store). */
export interface AP2FlowState {
  step: Step
  intent: PaymentIntent | null
  authorization: Authorization | null
  settlement: Settlement | null
  receipt: Receipt | null
}
