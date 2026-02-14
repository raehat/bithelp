import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFlow } from '@/context/FlowContext'
import { Link } from 'react-router-dom'
import styles from './ReceiptPage.module.css'

export function ReceiptPage() {
  const navigate = useNavigate()
  const { intent, authorization, settlement, receipt, reset } = useFlow()

  useEffect(() => {
    if (!intent) {
      navigate('/intent', { replace: true })
      return
    }
  }, [intent, navigate])

  if (!intent) return null

  const auth = authorization ?? { status: 'rejected' as const, authorizedBy: '—', reason: 'Skipped' }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Receipt</h1>
      <p className={styles.subtitle}>
        Auditable record: intent → authorization → settlement.
      </p>

      <div className={styles.card}>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>1. Intent</h3>
          <div className={styles.row}>
            <span className={styles.label}>Prompt</span>
            <span className={styles.value}>{intent.prompt}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Summary</span>
            <span className={styles.value}>{intent.summary}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Amount · Recipient</span>
            <span className={`${styles.value} ${styles.mono}`}>{intent.amountBtc} BTC → {intent.recipient}</span>
          </div>
          <div className={styles.meta}>Created by {intent.createdBy} · {new Date(intent.createdAt).toLocaleString()}</div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>2. Authorization</h3>
          <div className={styles.row}>
            <span className={styles.label}>Status</span>
            <span className={`${styles.value} ${auth.status === 'approved' ? styles.ok : styles.fail}`}>
              {auth.status === 'approved' ? 'Approved' : 'Rejected'}
            </span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Authorized by</span>
            <span className={styles.value}>{auth.authorizedBy}</span>
          </div>
          {'reason' in auth && auth.reason && (
            <div className={styles.row}>
              <span className={styles.label}>Reason</span>
              <span className={styles.value}>{auth.reason}</span>
            </div>
          )}
        </section>

        {settlement && (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>3. Settlement</h3>
            <div className={styles.row}>
              <span className={styles.label}>Status</span>
              <span className={`${styles.value} ${settlement.status === 'success' ? styles.ok : styles.fail}`}>
                {settlement.status === 'success' ? 'Success' : 'Failed'}
              </span>
            </div>
            {settlement.txid && (
              <div className={styles.row}>
                <span className={styles.label}>Txid</span>
                <span className={`${styles.value} ${styles.mono}`}>{settlement.txid}</span>
              </div>
            )}
            {settlement.error && (
              <div className={styles.row}>
                <span className={styles.label}>Error</span>
                <span className={styles.value}>{settlement.error}</span>
              </div>
            )}
            <div className={styles.meta}>Executed by {settlement.executedBy} · {new Date(settlement.createdAt).toLocaleString()}</div>
          </section>
        )}

        {receipt && (
          <div className={styles.summary}>
            {receipt.summary}
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <Link to="/audit" className={styles.audit}>View audit trail</Link>
        <button type="button" className={styles.new} onClick={() => { reset(); navigate('/intent'); }}>
          New payment
        </button>
      </div>
    </div>
  )
}
