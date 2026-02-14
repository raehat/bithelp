import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFlow } from '@/context/FlowContext'
import { createId } from '@/lib/id'
import { isUnisatAvailable } from '@/lib/bitcoin'
import { shoppingAgentRequestSettlement } from '@/agents/shopping-agent'
import type { Settlement, Receipt } from '@/types/ap2'
import styles from './SettlePage.module.css'

/**
 * Shopping Agent → Merchant Payment Processor Agent (secure): request settlement.
 * Processor does not hold credentials or create cart; it only settles on-chain via x402 and returns a SIGNED result.
 */
export function SettlePage() {
  const navigate = useNavigate()
  const { intent, authorization, setReceipt } = useFlow()
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!intent || !authorization) {
      navigate('/intent', { replace: true })
      return
    }
    if (authorization.status !== 'approved') {
      navigate('/receipt', { replace: true })
      return
    }
  }, [intent, authorization, navigate])

  const executeSettlement = async () => {
    if (!intent || !authorization) return
    setStatus('pending')
    setErrorMessage('')

    const authSignature = authorization.signature ?? authorization.proof ?? 'no-signature'

    const result = await shoppingAgentRequestSettlement(
      intent.id,
      authorization.id,
      authSignature,
      intent.amountBtc,
      intent.recipient
    )

    const settlement: Settlement = {
      id: result.id,
      intentId: result.intentId,
      authorizationId: result.authorizationId,
      createdAt: result.createdAt,
      status: result.status,
      txid: result.txid,
      error: result.error,
      amountBtc: result.amountBtc,
      recipientAddress: result.recipientAddress,
      executedBy: result.signedBy,
      protocol: result.protocol,
    }
    // setSettlement(settlement)

    if (result.status === 'success') {
      const receipt: Receipt = {
        id: createId('receipt'),
        createdAt: new Date().toISOString(),
        intent,
        authorization,
        settlement,
        summary: `Paid ${settlement.amountBtc} BTC to ${settlement.recipientAddress} (tx: ${settlement.txid?.slice(0, 16)}…)`,
      }
      setReceipt(receipt)
      setStatus('success')
      navigate('/receipt')
    } else {
      setStatus('error')
      setErrorMessage(result.error ?? 'Settlement failed')
    }
  }

  if (!intent || !authorization) return null

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Settlement</h1>
      <p className={styles.subtitle}>
        <strong>Secure communication:</strong> Shopping Agent sends SettlementRequest (intent + authorization signature) to Merchant Payment Processor Agent. Processor does not hold your credentials or create cart — it only settles on-chain via x402 and returns a signed result.
      </p>

      <div className={styles.comms}>
        <div className={styles.commRow}>
          <span className={styles.agent}>Shopping Agent</span>
          <span className={styles.arrow}>→</span>
          <span className={styles.agent}>Merchant Payment Processor Agent</span>
        </div>
        <p className={styles.commMsg}>SettlementRequest with Credentials Provider signature. Processor will settle via x402 and sign the result.</p>
      </div>

      {!isUnisatAvailable() && (
        <div className={styles.error}>
          Unisat Wallet is required to execute payment. Install the Unisat extension and connect your wallet.
        </div>
      )}
      <div className={styles.card}>
        <div className={styles.row}>
          <span className={styles.label}>Intent</span>
          <span className={styles.value}>{intent.summary}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Amount</span>
          <span className={`${styles.value} ${styles.mono}`}>{intent.amountBtc} BTC</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Recipient</span>
          <span className={`${styles.value} ${styles.mono}`}>{intent.recipient}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Authorization</span>
          <span className={styles.value}>
            Signed by Credentials Provider {authorization.signature ? '· signature present' : ''}
          </span>
        </div>
      </div>

      {status === 'error' && (
        <div className={styles.error}>{errorMessage}</div>
      )}

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.execute}
          onClick={executeSettlement}
          disabled={status === 'pending' || !isUnisatAvailable()}
        >
          {status === 'pending' ? 'Shopping Agent requesting settlement from Processor…' : 'Execute — Shopping Agent calls Processor'}
        </button>
      </div>
    </div>
  )
}
