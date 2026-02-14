import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFlow } from '@/context/FlowContext'
import { createIntentFromPrompt, suggestIntentFromPrompt } from '@/agents/shopping-agent'
import styles from './IntentPage.module.css'

/**
 * User talks to Shopping Agent. Prompt-first: say what you want, agent suggests exact details
 * (summary, amount, recipient). Small back-and-forth then confirm → CartMandate from Merchant.
 */
export function IntentPage() {
  const navigate = useNavigate()
  const { setIntent } = useFlow()
  const [step, setStep] = useState<'prompt' | 'suggestion'>('prompt')
  const [prompt, setPrompt] = useState('')
  const [summary, setSummary] = useState('')
  const [amountBtc, setAmountBtc] = useState('0.001')
  const [recipient, setRecipient] = useState('')
  const [memo, setMemo] = useState('')

  const askAgent = () => {
    const trimmed = prompt.trim()
    if (!trimmed) return
    const suggestion = suggestIntentFromPrompt(trimmed)
    setSummary(suggestion.summary)
    setAmountBtc(suggestion.amountBtc)
    setRecipient(suggestion.recipient)
    setMemo(suggestion.memo ?? '')
    setStep('suggestion')
  }

  const refine = () => {
    setStep('prompt')
  }

  const confirmAndContinue = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedRecipient = recipient.trim()
    if (!trimmedRecipient) return

    const intent = createIntentFromPrompt({
      prompt: prompt.trim(),
      summary: summary.trim() || prompt.trim().slice(0, 80),
      amountBtc: amountBtc.trim() || '0.001',
      recipient: trimmedRecipient,
      memo: memo.trim() || undefined,
    })
    setIntent(intent)
    navigate('/cart')
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>What do you want to buy?</h1>
      <p className={styles.subtitle}>
        <strong>Shopping Agent</strong> — Tell us in plain language. The agent will suggest the exact thing (details + matching order when possible). Refine if needed, then continue to cart.
      </p>

      {step === 'prompt' && (
        <div className={styles.form}>
          <label className={styles.label}>Describe what you want to pay for</label>
          <textarea
            className={styles.textarea}
            placeholder="e.g. Buy 2 coffees for Alice at the office, or Pay 0.002 BTC for API credits"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            autoFocus
          />
          <button
            type="button"
            className={styles.submit}
            onClick={askAgent}
            disabled={!prompt.trim()}
          >
            Ask agent — get exact details
          </button>
        </div>
      )}

      {step === 'suggestion' && (
        <form onSubmit={confirmAndContinue} className={styles.form}>
          <p className={styles.suggestionIntro}>Shopping Agent suggests:</p>
          <label className={styles.label}>Summary</label>
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
          <label className={styles.label}>Recipient (Bitcoin address for payment)</label>
          <input
            type="text"
            className={styles.input}
            placeholder="bc1q..."
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
          <div className={styles.actions}>
            <button type="button" className={styles.secondary} onClick={refine}>
              Refine prompt
            </button>
            <button type="submit" className={styles.submit}>
              Confirm — request CartMandate from Merchant
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
