import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFlow } from '@/context/FlowContext'
import { createId } from '@/lib/id'
import { sendToAddress } from '@/lib/bitcoin'
import type { Settlement, Receipt } from '@/types/ap2'
import styles from './SettlePage.module.css'

export function SettlePage() {
  const navigate = useNavigate()
  const { intent, authorization, setSettlement, setReceipt } = useFlow()
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

    try {
      const result = await sendToAddress(intent.recipient, intent.amountBtc)
      const settlement: Settlement = {
        id: createId('settle'),
        intentId: intent.id,
        authorizationId: authorization.id,
        createdAt: new Date().toISOString(),
        status: 'success',
        txid: result.txid,
        amountBtc: result.amountBtc,
        recipientAddress: result.recipientAddress,
        executedBy: 'system',
      }
      setSettlement(settlement)

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
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Settlement failed')
      const settlement: Settlement = {
        id: createId('settle'),
        intentId: intent.id,
        authorizationId: authorization.id,
        createdAt: new Date().toISOString(),
        status: 'failed',
        error: err instanceof Error ? err.message : 'Unknown error',
        amountBtc: intent.amountBtc,
        recipientAddress: intent.recipient,
        executedBy: 'system',
      }
      setSettlement(settlement)
    }
  }

  if (!intent || !authorization) return null

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Settlement</h1>
      <p className={styles.subtitle}>
        Execute the approved payment using your local Bitcoin node. No real network by default (mock mode).
      </p>

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
          <span className={styles.label}>Authorized by</span>
          <span className={styles.value}>{authorization.authorizedBy}</span>
        </div>
      </div>

      {status === 'error' && (
        <div className={styles.error}>
          {errorMessage}
        </div>
      )}

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.execute}
          onClick={executeSettlement}
          disabled={status === 'pending'}
        >
          {status === 'pending' ? 'Executing…' : 'Execute settlement'}
        </button>
      </div>
    </div>
  )
}
