import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFlow } from '@/context/FlowContext'
import { createId } from '@/lib/id'
import { AP2_AGENT_IDS } from '@/types/ap2'
import type { CartMandate } from '@/types/ap2'
import styles from './CartPage.module.css'

/**
 * Merchant Agent returns a signed CartMandate for the intent.
 * In a full implementation this would be a call to the Merchant Agent; here we derive it from the intent.
 */
export function CartPage() {
  const navigate = useNavigate()
  const { intent, setCartMandate } = useFlow()

  useEffect(() => {
    if (!intent) {
      navigate('/intent', { replace: true })
      return
    }
  }, [intent, navigate])

  const acceptCart = () => {
    if (!intent) return
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000).toISOString()
    const mandate: CartMandate = {
      id: createId('cart'),
      merchantId: 'merchant-demo',
      merchantName: 'Demo Merchant',
      createdAt: now.toISOString(),
      expiresAt,
      items: [
        {
          id: createId('item'),
          name: intent.summary,
          quantity: 1,
          unitAmountBtc: intent.amountBtc,
          totalBtc: intent.amountBtc,
        },
      ],
      totalBtc: intent.amountBtc,
      signature: 'mock-sig-merchant',
      createdBy: AP2_AGENT_IDS.MERCHANT_AGENT,
    }
    setCartMandate(mandate)
    navigate('/authorize')
  }

  if (!intent) return null

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Cart mandate</h1>
      <p className={styles.subtitle}>
        <strong>Merchant Agent</strong> has returned a signed CartMandate for your request. Review and continue to payment approval.
      </p>

      <div className={styles.card}>
        <div className={styles.merchant}>
          {intent.cartMandate?.merchantName ?? 'Demo Merchant'} · CartMandate
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
        <div className={styles.meta}>
          Created by Merchant Agent · Ready for Credentials Provider (approval)
        </div>
      </div>

      <button type="button" className={styles.continue} onClick={acceptCart}>
        Continue to approval (Credentials Provider)
      </button>
    </div>
  )
}
