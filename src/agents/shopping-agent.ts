/**
 * Shopping Agent — orchestrator only.
 * Does NOT hold credentials, create cart, or settle. It communicates securely with:
 * - Merchant Agent (request CartMandate)
 * - Credentials Provider Agent (request approval)
 * - Merchant Payment Processor Agent (request settlement)
 *
 * All cross-agent calls use request/response with signed responses so each party can verify the other.
 */

import { createId } from '@/lib/id'
import { AP2_AGENT_IDS } from '@/types/ap2'
import type {
  ApprovalRequest,
  CartRequest,
  PaymentIntent,
  SignedCartMandate,
  SignedPaymentAuthorization,
  SignedSettlementResult,
  SettlementRequest,
} from '@/types/ap2'
import { requestCartMandate } from './merchant-agent'
import { buildSignedAuthorization } from './credentials-provider-agent'
import { settle } from './merchant-payment-processor-agent'

/** Shopping Agent: create intent from user prompt (internal; not a cross-agent message). */
export function createIntentFromPrompt(params: {
  prompt: string
  summary: string
  amountBtc: string
  recipient: string
  memo?: string
}): PaymentIntent {
  return {
    id: createId('intent'),
    createdAt: new Date().toISOString(),
    prompt: params.prompt,
    summary: params.summary,
    amountBtc: params.amountBtc,
    recipient: params.recipient,
    memo: params.memo,
    createdBy: AP2_AGENT_IDS.SHOPPING_AGENT,
  }
}

/** Shopping Agent → Merchant Agent: request signed CartMandate. */
export async function shoppingAgentRequestCart(intent: PaymentIntent): Promise<SignedCartMandate> {
  const request: CartRequest = {
    requestId: createId('req'),
    from: AP2_AGENT_IDS.SHOPPING_AGENT,
    intentId: intent.id,
    prompt: intent.prompt,
    summary: intent.summary,
    amountBtc: intent.amountBtc,
    recipient: intent.recipient,
    memo: intent.memo,
    timestamp: new Date().toISOString(),
  }
  return requestCartMandate(request)
}

/** Shopping Agent → Credentials Provider: build approval request; Credentials Provider returns signed authorization (decision from user). */
export function shoppingAgentBuildApprovalRequest(
  intentId: string,
  cartMandate: SignedCartMandate,
  recipient: string
): ApprovalRequest {
  return {
    requestId: createId('req'),
    from: AP2_AGENT_IDS.SHOPPING_AGENT,
    intentId,
    cartMandateId: cartMandate.id,
    totalBtc: cartMandate.totalBtc,
    recipient,
    timestamp: new Date().toISOString(),
  }
}

/** Credentials Provider returns this; Shopping Agent stores it. */
export function credentialsProviderSignApproval(
  request: ApprovalRequest,
  decision: { status: 'approved' } | { status: 'rejected'; reason: string }
): SignedPaymentAuthorization {
  return buildSignedAuthorization(request, decision)
}

/** Shopping Agent → Merchant Payment Processor: request settlement. */
export async function shoppingAgentRequestSettlement(
  intentId: string,
  authorizationId: string,
  authorizationSignature: string,
  amountBtc: string,
  recipientAddress: string
): Promise<SignedSettlementResult> {
  const request: SettlementRequest = {
    requestId: createId('req'),
    from: AP2_AGENT_IDS.SHOPPING_AGENT,
    intentId,
    authorizationId,
    amountBtc,
    recipientAddress,
    authorizationSignature,
    timestamp: new Date().toISOString(),
  }
  return settle(request)
}
