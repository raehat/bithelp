import { Link } from 'react-router-dom'
import { AP2_AGENTS } from '@/types/ap2'
import styles from './AgentsPage.module.css'

/**
 * The 4 components in any AP2 project. Reusable pattern for other teams.
 */
export function AgentsPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>AP2 has 4 components</h1>
      <p className={styles.subtitle}>
        Every AP2 project uses these four agents. Copy this pattern for your own implementation.
      </p>

      <ul className={styles.list}>
        {AP2_AGENTS.map((agent, i) => (
          <li key={agent.id} className={styles.card}>
            <span className={styles.number}>{i + 1}</span>
            <div className={styles.body}>
              <h2 className={styles.name}>{agent.name}</h2>
              <p className={styles.role}>{agent.role}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className={styles.flow}>
        <h3>How they work together</h3>
        <p>
          <strong>Shopping Agent</strong> handles the user request (prompt) and orchestrates the flow.
          It asks the <strong>Merchant Agent</strong> for product/cart details; the Merchant returns a signed <strong>CartMandate</strong>.
          The <strong>Credentials Provider Agent</strong> holds the user’s payment credentials (wallets) and facilitates approval.
          The <strong>Merchant Payment Processor Agent</strong> settles the payment on-chain via <strong>x402</strong>.
        </p>
      </div>

      <Link to="/intent" className={styles.cta}>Start a payment</Link>
    </div>
  )
}
