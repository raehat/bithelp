/**
 * Secure signing for agent-to-agent messages.
 * Each agent signs its responses so the receiver can verify the message came from that agent.
 * In production: use real crypto (e.g. Ed25519, agent's key). Here: deterministic mock for demo.
 */

import type { AP2AgentId } from '@/types/ap2'

export function signPayload(agentId: AP2AgentId, payload: string): string {
  const combined = `${agentId}:${payload}`
  const mockSig = btoa(combined).replace(/=/g, '').slice(0, 64)
  return `mock.${agentId}.${mockSig}`
}

export function verifySignature(agentId: AP2AgentId, payload: string, signature: string): boolean {
  if (!signature.startsWith(`mock.${agentId}.`)) return false
  const expected = signPayload(agentId, payload)
  return signature === expected
}
