import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFlow } from '@/context/FlowContext'
import { createId } from '@/lib/id'
import { AP2_AGENT_IDS } from '@/types/ap2'
import type { Authorization } from '@/types/ap2'
import styles from './AuthorizePage.module.css'

export function AuthorizePage() {
  const navigate = useNavigate()
  const { intent, setAuthorization, setStep } = useFlow()

  useEffect(() => {
    if (!intent) {
      setStep('intent')
      navigate('/intent', { replace: true })
    }
  }, [intent, navigate, setStep])

  if (!intent) return null

  const approve = () => {
    const auth: Authorization = {
      id: createId('auth'),
      intentId: intent.id,
      createdAt: new Date().toISOString(),
      authorizedBy: 'user',
      status: 'approved',
      facilitatedBy: AP2_AGENT_IDS.CREDENTIALS_PROVIDER_AGENT,
    }
    setAuthorization(auth)
    navigate('/settle')
  }

  const reject = () => {
    const auth: Authorization = {
      id: createId('auth'),
      intentId: intent.id,
      createdAt: new Date().toISOString(),
      authorizedBy: 'user',
      status: 'rejected',
      reason: 'Rejected by user',
      facilitatedBy: AP2_AGENT_IDS.CREDENTIALS_PROVIDER_AGENT,
    }
    setAuthorization(auth)
    navigate('/receipt')
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Authorize payment</h1>
      <p className={styles.subtitle}>
        <strong>Credentials Provider Agent</strong> — Review the intent and cart. Approve or reject using your payment credentials (wallet).
      </p>

      <div className={styles.card}>
        <div className={styles.row}>
          <span className={styles.label}>Prompt</span>
          <span className={styles.value}>{intent.prompt}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Summary</span>
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
        {intent.memo && (
          <div className={styles.row}>
            <span className={styles.label}>Memo</span>
            <span className={styles.value}>{intent.memo}</span>
          </div>
        )}
        <div className={styles.meta}>
          Created by {intent.createdBy} · {new Date(intent.createdAt).toLocaleString()}
        </div>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.reject} onClick={reject}>
          Reject
        </button>
        <button type="button" className={styles.approve} onClick={approve}>
          Approve & continue to settlement
        </button>
      </div>
    </div>
  )
}
