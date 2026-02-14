import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFlow } from '@/context/FlowContext'
import { shoppingAgentRequestCart } from '@/agents/shopping-agent'
import type { SignedCartMandate } from '@/types/ap2'
import styles from './CartPage.module.css'

/**
 * Shopping Agent → Merchant Agent (secure): request CartMandate.
 * Merchant Agent returns a SIGNED CartMandate so Shopping Agent can verify it came from Merchant.
 */
export function CartPage() {
  const navigate = useNavigate()
  const { intent, setCartMandate, setStep } = useFlow()
  const [status, setStatus] = useState<'idle' | 'requesting' | 'done'>('idle')
  const [mandate, setMandate] = useState<SignedCartMandate | null>(null)

  useEffect(() => {
    if (!intent) {
      setStep('intent')
      navigate('/intent', { replace: true })
      return
    }
    if (status === 'idle') {
      setStatus('requesting')
      shoppingAgentRequestCart(intent).then((signedMandate) => {
        setMandate(signedMandate)
        setStatus('done')
      })
    }
  }, [intent, status, navigate, setStep])

  const continueToApproval = () => {
    if (mandate) {
      setCartMandate(mandate)
      navigate('/authorize')
    }
  }

  if (!intent) return null

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Cart mandate</h1>
      <p className={styles.subtitle}>
        <strong>Secure communication:</strong> Shopping Agent requested a CartMandate from Merchant Agent. Merchant Agent does not see your credentials or execute payment — it only creates and signs the cart.
      </p>

      {status === 'requesting' && (
        <div className={styles.comms}>
          <div className={styles.commRow}>
            <span className={styles.agent}>Shopping Agent</span>
            <span className={styles.arrow}>→</span>
            <span className={styles.agent}>Merchant Agent</span>
          </div>
          <p className={styles.commMsg}>Requesting signed CartMandate…</p>
        </div>
      )}

      {status === 'done' && mandate && (
        <>
          <div className={styles.comms}>
            <div className={styles.commRow}>
              <span className={styles.agent}>Merchant Agent</span>
              <span className={styles.arrow}>→</span>
              <span className={styles.agent}>Shopping Agent</span>
            </div>
            <p className={styles.commMsg}>Signed CartMandate received. Signature verifies origin.</p>
          </div>
          <div className={styles.card}>
            <div className={styles.merchant}>
              {mandate.merchantName} · CartMandate · signed by {mandate.signedBy}
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Summary</span>
              <span className={styles.value}>{intent.summary}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Amount</span>
              <span className={`${styles.value} ${styles.mono}`}>{mandate.totalBtc} BTC</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Recipient</span>
              <span className={`${styles.value} ${styles.mono}`}>{intent.recipient}</span>
            </div>
            <div className={styles.sig}>
              <span className={styles.label}>Merchant signature</span>
              <code className={styles.signature}>{mandate.signature.slice(0, 48)}…</code>
            </div>
            <div className={styles.meta}>
              Next: Shopping Agent will send this to Credentials Provider Agent for your approval (wallet).
            </div>
          </div>
          <button type="button" className={styles.continue} onClick={continueToApproval}>
            Continue — request approval from Credentials Provider Agent
          </button>
        </>
      )}
    </div>
  )
}
