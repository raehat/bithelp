/**
 * AP2 — Agent Payment Protocol
 *
 * Every AP2 project has exactly 4 components (agents):
 *
 * 1. Shopping Agent       — Main orchestrator; handles user requests
 * 2. Merchant Agent       — Handles product queries; creates signed CartMandates
 * 3. Credentials Provider Agent — Holds user's payment credentials (wallets); facilitates payment
 * 4. Merchant Payment Processor Agent — Settles payment on-chain via x402
 *
 * Flow: Intent (Shopping) → CartMandate (Merchant) → Authorization (Credentials Provider) → Settlement (Processor via x402) → Receipt
 */

export type Step = 'intent' | 'cart' | 'authorization' | 'settlement' | 'receipt'

// ─── Four AP2 agents (canonical) ───────────────────────────────────────────

export const AP2_AGENT_IDS = {
  SHOPPING_AGENT: 'shopping-agent',
  MERCHANT_AGENT: 'merchant-agent',
  CREDENTIALS_PROVIDER_AGENT: 'credentials-provider-agent',
  MERCHANT_PAYMENT_PROCESSOR_AGENT: 'merchant-payment-processor-agent',
} as const

export type AP2AgentId = (typeof AP2_AGENT_IDS)[keyof typeof AP2_AGENT_IDS]

export interface AP2Agent {
  id: AP2AgentId
  name: 'Shopping Agent' | 'Merchant Agent' | 'Credentials Provider Agent' | 'Merchant Payment Processor Agent'
  role: string
}

export const AP2_AGENTS: AP2Agent[] = [
  { id: AP2_AGENT_IDS.SHOPPING_AGENT, name: 'Shopping Agent', role: 'Main orchestrator; handles user requests' },
  { id: AP2_AGENT_IDS.MERCHANT_AGENT, name: 'Merchant Agent', role: 'Handles product queries; creates signed CartMandates' },
  { id: AP2_AGENT_IDS.CREDENTIALS_PROVIDER_AGENT, name: 'Credentials Provider Agent', role: "Holds user's payment credentials (wallets); facilitates payment" },
  { id: AP2_AGENT_IDS.MERCHANT_PAYMENT_PROCESSOR_AGENT, name: 'Merchant Payment Processor Agent', role: 'Settles payment on-chain via x402' },
]

// ─── CartMandate (from Merchant Agent) ──────────────────────────────────────

export interface CartItem {
  id: string
  name: string
  quantity: number
  unitAmountBtc: string
  totalBtc: string
}

/** Signed by Merchant Agent; represents an agreed cart and total. */
export interface CartMandate {
  id: string
  merchantId: string
  merchantName: string
  createdAt: string // ISO
  expiresAt: string // ISO
  items: CartItem[]
  totalBtc: string
  /** Signature / proof from Merchant Agent. */
  signature?: string
  /** Who created this mandate (Merchant Agent). */
  createdBy: AP2AgentId
}

// ─── Intent (Shopping Agent) ────────────────────────────────────────────────

/** Step 1: What the user wants (orchestrated by Shopping Agent). */
export interface PaymentIntent {
  id: string
  createdAt: string
  /** Natural language prompt from user. */
  prompt: string
  summary: string
  amountBtc: string
  recipient: string
  memo?: string
  /** Shopping Agent orchestrates. */
  createdBy: AP2AgentId
  /** Filled after Shopping Agent gets CartMandate from Merchant Agent. */
  cartMandate?: CartMandate | null
}

// ─── Authorization (Credentials Provider Agent) ──────────────────────────────

/** Step 2: User approval using credentials (Credentials Provider Agent). */
export interface Authorization {
  id: string
  intentId: string
  createdAt: string
  /** Credentials Provider Agent facilitates; "user" is the principal. */
  authorizedBy: string
  status: 'approved' | 'rejected'
  reason?: string
  proof?: string
  /** Agent that facilitated (Credentials Provider). */
  facilitatedBy?: AP2AgentId
}

// ─── Settlement (Merchant Payment Processor Agent via x402) ──────────────────

/** Step 3: On-chain settlement via Merchant Payment Processor (x402). */
export interface Settlement {
  id: string
  intentId: string
  authorizationId: string
  createdAt: string
  status: 'success' | 'failed'
  txid?: string
  error?: string
  amountBtc: string
  recipientAddress: string
  /** Merchant Payment Processor Agent executes. */
  executedBy: AP2AgentId
  /** e.g. "x402" */
  protocol?: string
}

// ─── Receipt (auditable) ────────────────────────────────────────────────────

/** Step 4: Auditable record tying intent → authorization → settlement. */
export interface Receipt {
  id: string
  createdAt: string
  intent: PaymentIntent
  authorization: Authorization
  settlement: Settlement
  summary: string
}

/** In-memory flow state. */
export interface AP2FlowState {
  step: Step
  intent: PaymentIntent | null
  cartMandate: CartMandate | null
  authorization: Authorization | null
  settlement: Settlement | null
  receipt: Receipt | null
}
