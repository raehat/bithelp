import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFlow } from '@/context/FlowContext'
import { createId } from '@/lib/id'
import type { PaymentIntent } from '@/types/ap2'
import styles from './IntentPage.module.css'

export function IntentPage() {
  const navigate = useNavigate()
  const { setIntent } = useFlow()
  const [prompt, setPrompt] = useState('')
  const [amountBtc, setAmountBtc] = useState('0.001')
  const [recipient, setRecipient] = useState('')
  const [memo, setMemo] = useState('')
  const [summary, setSummary] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedPrompt = prompt.trim()
    const trimmedRecipient = recipient.trim()
    if (!trimmedPrompt || !trimmedRecipient) return

    const intent: PaymentIntent = {
      id: createId('intent'),
      createdAt: new Date().toISOString(),
      prompt: trimmedPrompt,
      summary: summary.trim() || trimmedPrompt.slice(0, 80),
      amountBtc: amountBtc.trim() || '0.001',
      recipient: trimmedRecipient,
      memo: memo.trim() || undefined,
      createdBy: 'user',
    }
    setIntent(intent)
    navigate('/authorize')
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Create payment intent</h1>
      <p className={styles.subtitle}>
        Describe what you want to buy in plain language. You’ll approve and settle in the next steps.
      </p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.label}>
          What do you want to pay for? (prompt)
        </label>
        <textarea
          className={styles.textarea}
          placeholder="e.g. Buy 2 coffees for Alice at the office, or Pay for API credits"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          required
        />

        <label className={styles.label}>Short summary (optional)</label>
        <input
          type="text"
          className={styles.input}
          placeholder="e.g. 2 coffees for Alice"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />

        <div className={styles.row}>
          <label className={styles.label}>
            Amount (BTC)
          </label>
          <input
            type="text"
            className={styles.input}
            placeholder="0.001"
            value={amountBtc}
            onChange={(e) => setAmountBtc(e.target.value)}
            required
          />
        </div>

        <label className={styles.label}>Recipient (address or label)</label>
        <input
          type="text"
          className={styles.input}
          placeholder="bc1q... or alice@company"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          required
        />

        <label className={styles.label}>Memo (optional)</label>
        <input
          type="text"
          className={styles.input}
          placeholder="Payment for..."
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />

        <button type="submit" className={styles.submit}>
          Continue to authorization
        </button>
      </form>
    </div>
  )
}
