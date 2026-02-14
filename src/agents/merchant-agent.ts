/**
 * Merchant Agent — separate component.
 * Accepts CartRequest from Shopping Agent over a secure channel; returns SIGNED CartMandate.
 * Tries to find a matching order (listing) so the agent can fulfill the exact thing the user wants.
 */

import { createId } from '@/lib/id'
import { AP2_AGENT_IDS } from '@/types/ap2'
import type { CartRequest, SignedCartMandate } from '@/types/ap2'
import { signPayload } from './signing'

/** Demo order book: match by summary/amount so we can "find a matching order". */
const MOCK_ORDERS: Array<{ id: string; name: string; amountBtc: string; recipient?: string }> = [
  { id: 'order-coffee', name: '2 coffees for Alice', amountBtc: '0.001', recipient: undefined },
  { id: 'order-api', name: 'API credits', amountBtc: '0.002', recipient: undefined },
  { id: 'order-donate', name: 'Donation', amountBtc: '0.0005', recipient: undefined },
]

function findMatchingOrder(summary: string, amountBtc: string): typeof MOCK_ORDERS[0] | null {
  const s = summary.toLowerCase()
  const amount = amountBtc.trim()
  for (const order of MOCK_ORDERS) {
    const nameMatch = order.name.toLowerCase().includes(s) || s.includes(order.name.toLowerCase())
    const amountMatch = order.amountBtc === amount || Math.abs(parseFloat(order.amountBtc) - parseFloat(amount)) < 0.0001
    if (nameMatch && amountMatch) return order
  }
  for (const order of MOCK_ORDERS) {
    if (order.name.toLowerCase().includes(s) || s.includes(order.name.toLowerCase())) return order
  }
  return null
}

/** Merchant Agent API: request a signed CartMandate. Called by Shopping Agent. Finds matching order when possible. */
export async function requestCartMandate(request: CartRequest): Promise<SignedCartMandate> {
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 60 * 60 * 1000).toISOString()
  const mandateId = createId('cart')

  const match = findMatchingOrder(request.summary, request.amountBtc)
  const name = match ? match.name : request.summary
  const unitAmountBtc = match ? match.amountBtc : request.amountBtc
  const totalBtc = request.amountBtc

  const items = [
    {
      id: createId('item'),
      name: match ? `${name} (order: ${match.id})` : name,
      quantity: 1,
      unitAmountBtc,
      totalBtc,
    },
  ]

  const payloadToSign = JSON.stringify({
    mandateId,
    requestId: request.requestId,
    merchantId: 'merchant-demo',
    totalBtc,
    expiresAt,
    matchedOrderId: match?.id,
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
