/**
 * Merchant Agent — separate component.
 * Accepts CartRequest from Shopping Agent over a secure channel; returns SIGNED CartMandate.
 * Does NOT have access to user credentials or settlement. Only creates and signs cart.
 */

import { createId } from '@/lib/id'
import { AP2_AGENT_IDS } from '@/types/ap2'
import type { CartRequest, SignedCartMandate } from '@/types/ap2'
import { signPayload } from './signing'

/** Merchant Agent API: request a signed CartMandate. Called by Shopping Agent. */
export async function requestCartMandate(request: CartRequest): Promise<SignedCartMandate> {
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 60 * 60 * 1000).toISOString()
  const mandateId = createId('cart')

  const items = [
    {
      id: createId('item'),
      name: request.summary,
      quantity: 1,
      unitAmountBtc: request.amountBtc,
      totalBtc: request.amountBtc,
    },
  ]

  const payloadToSign = JSON.stringify({
    mandateId,
    requestId: request.requestId,
    merchantId: 'merchant-demo',
    totalBtc: request.amountBtc,
    expiresAt,
  })
  const signature = signPayload(AP2_AGENT_IDS.MERCHANT_AGENT, payloadToSign)

  const mandate: SignedCartMandate = {
    id: mandateId,
    requestId: request.requestId,
    merchantId: 'merchant-demo',
    merchantName: 'Demo Merchant',
    createdAt: now.toISOString(),
    expiresAt,
    items,
    totalBtc: request.amountBtc,
    signedBy: AP2_AGENT_IDS.MERCHANT_AGENT,
    signature,
    signaturePayload: payloadToSign,
  }

  return mandate
}
