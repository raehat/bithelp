import { useFlow } from '@/context/FlowContext'
import { Link } from 'react-router-dom'
import { AP2_AGENTS } from '@/types/ap2'
import styles from './AuditPage.module.css'

function agentName(id: string): string {
  return AP2_AGENTS.find((a) => a.id === id)?.name ?? id
}

/**
 * Audit trail: for humans and systems.
 * In a full implementation, this would list all past receipts (e.g. from API or local store).
 * Here we show the current flow's receipt if available, and document the pattern.
 */
export function AuditPage() {
  const { intent, authorization, settlement, receipt } = useFlow()

  const hasRecord = intent && authorization

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Audit trail</h1>
      <p className={styles.subtitle}>
        Accountability: who authorized what, what was executed, what was delivered.
        This view is the reusable pattern for audit logs.
      </p>

      {hasRecord ? (
        <div className={styles.card}>
          <div className={styles.auditRow}>
            <span className={styles.auditStep}>Intent</span>
            <span className={styles.auditWho}>{agentName(intent.createdBy)}</span>
            <span className={styles.auditWhat}>{intent.summary}</span>
            <span className={styles.auditWhen}>{new Date(intent.createdAt).toLocaleString()}</span>
          </div>
          <div className={styles.auditRow}>
            <span className={styles.auditStep}>Authorization</span>
            <span className={styles.auditWho}>{authorization.authorizedBy}</span>
            <span className={styles.auditWhat}>{authorization.status}</span>
            <span className={styles.auditWhen}>{new Date(authorization.createdAt).toLocaleString()}</span>
          </div>
          {settlement && (
            <div className={styles.auditRow}>
              <span className={styles.auditStep}>Settlement</span>
              <span className={styles.auditWho}>{agentName(settlement.executedBy)}</span>
              <span className={styles.auditWhat}>
                {settlement.status} {settlement.txid ? `· ${settlement.txid.slice(0, 16)}…` : ''}
              </span>
              <span className={styles.auditWhen}>{new Date(settlement.createdAt).toLocaleString()}</span>
            </div>
          )}
          {receipt && (
            <div className={styles.receiptSummary}>
              {receipt.summary}
            </div>
          )}
          <Link to="/receipt" className={styles.receiptLink}>View full receipt →</Link>
        </div>
      ) : (
        <div className={styles.empty}>
          <p>No payment in this session yet.</p>
          <p className={styles.hint}>Create an intent, authorize, and settle to see the audit trail here.</p>
          <Link to="/intent" className={styles.cta}>Create intent</Link>
        </div>
      )}
    </div>
  )
}
