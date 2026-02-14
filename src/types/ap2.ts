/**
 * AP2 — Agent Payment Protocol
 *
 * Four distinct agents with different roles. They do NOT share in-memory state;
 * they communicate securely with each other via signed messages.
 *
 * 1. Shopping Agent       — Orchestrator; talks to user and to the other three agents
 * 2. Merchant Agent       — Product/cart; returns SIGNED CartMandates (only it can create these)
 * 3. Credentials Provider Agent — Holds payment credentials; returns SIGNED approval (only it can authorize)
 * 4. Merchant Payment Processor Agent — Settles on-chain via x402; returns SIGNED settlement proof
 *
 * Security: Every cross-agent message is signed by the sending agent so the receiver can verify origin.
 */

export type Step = 'intent' | 'cart' | 'authorization' | 'settlement' | 'receipt'

// ─── Agent identity (each agent has its own id; used in signatures) ─────────

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
  /** What this agent can do; what it accepts and returns when others communicate with it. */
  interface: string
  /** Explicit responsibilities (this agent does these). */
  does: string[]
  /** Explicit non-responsibilities (this agent must NOT do these). */
  doesNot: string[]
}

export const AP2_AGENTS: AP2Agent[] = [
  {
    id: AP2_AGENT_IDS.SHOPPING_AGENT,
    name: 'Shopping Agent',
    role: 'Main orchestrator; handles user requests',
    interface: 'Receives user prompt → calls Merchant (cart), Credentials Provider (approval), Processor (settlement).',
    does: [
      'Receives user prompt and creates intent',
      'Sends CartRequest to Merchant Agent',
      'Sends ApprovalRequest to Credentials Provider Agent',
      'Sends SettlementRequest to Merchant Payment Processor Agent',
      'Orchestrates flow; does not hold data from other agents long-term',
    ],
    doesNot: ['Hold wallets or credentials', 'Create or sign CartMandates', 'Sign payment approvals', 'Execute on-chain settlement'],
  },
  {
    id: AP2_AGENT_IDS.MERCHANT_AGENT,
    name: 'Merchant Agent',
    role: 'Handles product queries; creates signed CartMandates',
    interface: 'Accepts CartRequest from Shopping Agent. Returns SIGNED CartMandate.',
    does: [
      'Accepts CartRequest from Shopping Agent',
      'Builds cart (items, total)',
      'Signs and returns CartMandate',
    ],
    doesNot: ['Hold or see user wallets/credentials', 'Sign payment approvals', 'Execute on-chain settlement'],
  },
  {
    id: AP2_AGENT_IDS.CREDENTIALS_PROVIDER_AGENT,
    name: 'Credentials Provider Agent',
    role: "Holds user's payment credentials (wallets); facilitates payment",
    interface: 'Accepts ApprovalRequest (intent + cart) from Shopping Agent. Returns SIGNED PaymentAuthorization.',
    does: [
      'Holds user wallets (e.g. Bitcoin addresses)',
      'Creates new wallets (e.g. Add Bitcoin wallet) and shows address/QR to fund',
      'Accepts ApprovalRequest from Shopping Agent',
      'Returns SIGNED PaymentAuthorization (approve/reject)',
    ],
    doesNot: ['Create or sign CartMandates', 'Execute on-chain settlement', 'See Merchant or Processor internal data'],
  },
  {
    id: AP2_AGENT_IDS.MERCHANT_PAYMENT_PROCESSOR_AGENT,
    name: 'Merchant Payment Processor Agent',
    role: 'Settles payment on-chain via x402',
    interface: 'Accepts SettlementRequest (intent + cart + authorization) from Shopping Agent. Returns SIGNED SettlementResult.',
    does: [
      'Accepts SettlementRequest with authorization signature from Shopping Agent',
      'Executes on-chain settlement (e.g. via x402)',
      'Returns SIGNED SettlementResult (txid or error)',
    ],
    doesNot: ['Hold or see user wallets/credentials', 'Create or sign CartMandates', 'Sign payment approvals'],
  },
]

// ─── Secure message: Cart (Shopping → Merchant → Shopping) ───────────────────

export interface CartItem {
  id: string
  name: string
  quantity: number
  unitAmountBtc: string
  totalBtc: string
}

/** Shopping Agent sends this to Merchant Agent to request a cart. */
export interface CartRequest {
  requestId: string
  from: AP2AgentId
  intentId: string
  prompt: string
  summary: string
  amountBtc: string
  recipient: string
  memo?: string
  timestamp: string
}

/** Merchant Agent returns this to Shopping Agent. MUST be signed by Merchant so Shopping can verify. */
export interface SignedCartMandate {
  id: string
  requestId: string
  merchantId: string
  merchantName: string
  createdAt: string
  expiresAt: string
  items: CartItem[]
  totalBtc: string
  /** Merchant Agent signs this payload so Shopping Agent can verify it came from Merchant. */
  signedBy: AP2AgentId
  signature: string
  /** Payload that was signed (e.g. hash or canonical JSON). */
  signaturePayload?: string
}

// ─── Legacy CartMandate (same shape but with signature required for cross-agent use) ─

export type CartMandate = SignedCartMandate

// ─── Secure message: Approval (Shopping → Credentials Provider → Shopping) ───

/** Shopping Agent sends this to Credentials Provider to request user approval. */
export interface ApprovalRequest {
  requestId: string
  from: AP2AgentId
  intentId: string
  cartMandateId: string
  totalBtc: string
  recipient: string
  timestamp: string
}

/** Credentials Provider returns this to Shopping Agent. MUST be signed so Shopping can verify. */
export interface SignedPaymentAuthorization {
  id: string
  requestId: string
  intentId: string
  createdAt: string
  authorizedBy: string
  status: 'approved' | 'rejected'
  reason?: string
  /** Credentials Provider signs so Shopping Agent can verify it came from Credentials Provider. */
  signedBy: AP2AgentId
  signature: string
  signaturePayload?: string
}

// ─── Legacy Authorization (alias for signed version) ──────────────────────────

export interface Authorization {
  id: string
  intentId: string
  createdAt: string
  authorizedBy: string
  status: 'approved' | 'rejected'
  reason?: string
  proof?: string
  facilitatedBy?: AP2AgentId
  /** When from Credentials Provider secure channel. */
  signedBy?: AP2AgentId
  signature?: string
}

// ─── Secure message: Settlement (Shopping → Processor → Shopping) ──────────────

/** Shopping Agent sends this to Merchant Payment Processor. */
export interface SettlementRequest {
  requestId: string
  from: AP2AgentId
  intentId: string
  authorizationId: string
  amountBtc: string
  recipientAddress: string
  /** Proof that Credentials Provider approved (e.g. signature). */
  authorizationSignature: string
  timestamp: string
}

/** Processor returns this to Shopping Agent. Settlement proof (e.g. txid) is the on-chain receipt. */
export interface SignedSettlementResult {
  id: string
  requestId: string
  intentId: string
  authorizationId: string
  status: 'success' | 'failed'
  txid?: string
  error?: string
  amountBtc: string
  recipientAddress: string
  signedBy: AP2AgentId
  /** Processor signature or on-chain proof id. */
  signature: string
  protocol: string
  createdAt: string
}

// ─── Intent (Shopping Agent internal; not sent to others as-is) ───────────────

export interface PaymentIntent {
  id: string
  createdAt: string
  prompt: string
  summary: string
  amountBtc: string
  recipient: string
  memo?: string
  createdBy: AP2AgentId
  cartMandate?: SignedCartMandate | null
}

// ─── Settlement (legacy / receipt view) ──────────────────────────────────────

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
  executedBy: AP2AgentId
  protocol?: string
}

// ─── Receipt (auditable) ────────────────────────────────────────────────────

export interface Receipt {
  id: string
  createdAt: string
  intent: PaymentIntent
  authorization: Authorization
  settlement: Settlement
  summary: string
}

export interface AP2FlowState {
  step: Step
  intent: PaymentIntent | null
  cartMandate: SignedCartMandate | null
  authorization: Authorization | null
  settlement: Settlement | null
  receipt: Receipt | null
}
