import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFlow } from '@/context/FlowContext'
import {
  shoppingAgentBuildApprovalRequest,
  credentialsProviderSignApproval,
} from '@/agents/shopping-agent'
import type { Authorization } from '@/types/ap2'
import styles from './AuthorizePage.module.css'

/**
 * Shopping Agent → Credentials Provider Agent (secure): request payment approval.
 * Credentials Provider holds the user's wallet; it returns a SIGNED authorization so Shopping Agent can prove approval to the Processor.
 */
export function AuthorizePage() {
  const navigate = useNavigate()
  const { intent, cartMandate, setAuthorization, setStep } = useFlow()

  useEffect(() => {
    if (!intent) {
      setStep('intent')
      navigate('/intent', { replace: true })
      return
    }
    if (!cartMandate) {
      setStep('cart')
      navigate('/cart', { replace: true })
      return
    }
  }, [intent, cartMandate, navigate, setStep])

  if (!intent || !cartMandate) return null

  const request = shoppingAgentBuildApprovalRequest(intent.id, cartMandate, intent.recipient)

  const approve = () => {
    const signed = credentialsProviderSignApproval(request, { status: 'approved' })
    const auth: Authorization = {
      id: signed.id,
      intentId: signed.intentId,
      createdAt: signed.createdAt,
      authorizedBy: signed.authorizedBy,
      status: 'approved',
      facilitatedBy: signed.signedBy,
      signedBy: signed.signedBy,
      signature: signed.signature,
    }
    setAuthorization(auth)
    navigate('/settle')
  }

  const reject = () => {
    const signed = credentialsProviderSignApproval(request, {
      status: 'rejected',
      reason: 'Rejected by user',
    })
    const auth: Authorization = {
      id: signed.id,
      intentId: signed.intentId,
      createdAt: signed.createdAt,
      authorizedBy: signed.authorizedBy,
      status: 'rejected',
      reason: signed.reason,
      facilitatedBy: signed.signedBy,
      signedBy: signed.signedBy,
      signature: signed.signature,
    }
    setAuthorization(auth)
    navigate('/receipt')
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Authorize payment</h1>
      <p className={styles.subtitle}>
        <strong>Secure communication:</strong> Shopping Agent sent an ApprovalRequest to Credentials Provider Agent. Credentials Provider holds your wallet — it does not create cart or settle. Approve or reject; it will return a SIGNED authorization so only the Processor can be asked to settle.
      </p>

      <div className={styles.comms}>
        <div className={styles.commRow}>
          <span className={styles.agent}>Shopping Agent</span>
          <span className={styles.arrow}>→</span>
          <span className={styles.agent}>Credentials Provider Agent</span>
        </div>
        <p className={styles.commMsg}>ApprovalRequest (intent + cart). Waiting for signed PaymentAuthorization.</p>
      </div>

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
          CartMandate from Merchant Agent · Credentials Provider will sign your decision
        </div>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.reject} onClick={reject}>
          Reject
        </button>
        <button type="button" className={styles.approve} onClick={approve}>
          Approve — Credentials Provider signs and returns to Shopping Agent
        </button>
      </div>
    </div>
  )
}
