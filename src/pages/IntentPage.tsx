import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFlow } from '@/context/FlowContext'
import { createIntentFromPrompt } from '@/agents/shopping-agent'
import styles from './IntentPage.module.css'

/**
 * User talks to Shopping Agent. Shopping Agent creates an intent (internal);
 * it will later call Merchant Agent, Credentials Provider, and Processor — each over secure channels.
 */
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

    const intent = createIntentFromPrompt({
      prompt: trimmedPrompt,
      summary: summary.trim() || trimmedPrompt.slice(0, 80),
      amountBtc: amountBtc.trim() || '0.001',
      recipient: trimmedRecipient,
      memo: memo.trim() || undefined,
    })
    setIntent(intent)
    navigate('/cart')
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Create payment intent</h1>
      <p className={styles.subtitle}>
        <strong>Shopping Agent</strong> — You talk to the orchestrator. It will then communicate securely with Merchant Agent (cart), Credentials Provider (your wallet approval), and Processor (x402 settlement). It does not hold your credentials or settle payments itself.
      </p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.label}>What do you want to pay for? (prompt)</label>
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
          <label className={styles.label}>Amount (BTC)</label>
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
          Continue — Shopping Agent will request CartMandate from Merchant Agent
        </button>
      </form>
    </div>
  )
}
