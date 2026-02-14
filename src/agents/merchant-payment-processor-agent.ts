/**
 * Merchant Payment Processor Agent — separate component.
 * Settles payment on-chain via x402. Accepts SettlementRequest from Shopping Agent;
 * returns SIGNED SettlementResult. Does NOT hold credentials or create cart.
 */

import { createId } from '@/lib/id'
import { sendToAddress } from '@/lib/bitcoin'
import { AP2_AGENT_IDS } from '@/types/ap2'
import type { SettlementRequest, SignedSettlementResult } from '@/types/ap2'
import { signPayload } from './signing'

/**
 * Merchant Payment Processor Agent API: settle payment.
 * Called by Shopping Agent with intent + authorization proof. Processor executes on-chain (x402) and returns signed result.
 */
export async function settle(request: SettlementRequest): Promise<SignedSettlementResult> {
  const id = createId('settle')
  const now = new Date().toISOString()

  try {
    const result = await sendToAddress(request.recipientAddress, request.amountBtc)
    const payloadToSign = JSON.stringify({
      id,
      requestId: request.requestId,
      intentId: request.intentId,
      status: 'success',
      txid: result.txid,
      timestamp: now,
    })
    const signature = signPayload(AP2_AGENT_IDS.MERCHANT_PAYMENT_PROCESSOR_AGENT, payloadToSign)

    return {
      id,
      requestId: request.requestId,
      intentId: request.intentId,
      authorizationId: request.authorizationId,
      status: 'success',
      txid: result.txid,
      amountBtc: result.amountBtc,
      recipientAddress: result.recipientAddress,
      signedBy: AP2_AGENT_IDS.MERCHANT_PAYMENT_PROCESSOR_AGENT,
      signature,
      protocol: 'x402',
      createdAt: now,
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Settlement failed'
    const payloadToSign = JSON.stringify({
      id,
      requestId: request.requestId,
      intentId: request.intentId,
      status: 'failed',
      error: errorMessage,
      timestamp: now,
    })
    const signature = signPayload(AP2_AGENT_IDS.MERCHANT_PAYMENT_PROCESSOR_AGENT, payloadToSign)

    return {
      id,
      requestId: request.requestId,
      intentId: request.intentId,
      authorizationId: request.authorizationId,
      status: 'failed',
      error: errorMessage,
      amountBtc: request.amountBtc,
      recipientAddress: request.recipientAddress,
      signedBy: AP2_AGENT_IDS.MERCHANT_PAYMENT_PROCESSOR_AGENT,
      signature,
      protocol: 'x402',
      createdAt: now,
    }
  }
}
