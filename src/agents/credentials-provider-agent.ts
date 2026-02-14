/**
 * Credentials Provider Agent — separate component.
 * Holds user payment credentials. Accepts ApprovalRequest from Shopping Agent;
 * returns SIGNED PaymentAuthorization (approved/rejected). Does NOT create cart or settle.
 */

import { createId } from '@/lib/id'
import { AP2_AGENT_IDS } from '@/types/ap2'
import type { ApprovalRequest, SignedPaymentAuthorization } from '@/types/ap2'
import { signPayload } from './signing'

export type ApprovalDecision = { status: 'approved' } | { status: 'rejected'; reason: string }

/**
 * Credentials Provider Agent API: request payment approval.
 * In production this would be a secure channel to the wallet/credentials service.
 * Here we accept the decision from the caller (UI that represents the user approving via their wallet).
 */
export function buildSignedAuthorization(
  request: ApprovalRequest,
  decision: ApprovalDecision
): SignedPaymentAuthorization {
  const id = createId('auth')
  const now = new Date().toISOString()
  const payloadToSign = JSON.stringify({
    id,
    requestId: request.requestId,
    intentId: request.intentId,
    status: decision.status,
    timestamp: now,
  })
  const signature = signPayload(AP2_AGENT_IDS.CREDENTIALS_PROVIDER_AGENT, payloadToSign)

  return {
    id,
    requestId: request.requestId,
    intentId: request.intentId,
    createdAt: now,
    authorizedBy: 'user',
    status: decision.status,
    reason: decision.status === 'rejected' ? decision.reason : undefined,
    signedBy: AP2_AGENT_IDS.CREDENTIALS_PROVIDER_AGENT,
    signature,
    signaturePayload: payloadToSign,
  }
}
