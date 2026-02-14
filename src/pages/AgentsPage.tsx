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
        Four distinct agents with different roles. They communicate securely with each other via signed messages — they do not share in-memory state.
      </p>

      <ul className={styles.list}>
        {AP2_AGENTS.map((agent, i) => (
          <li key={agent.id} className={styles.card}>
            <span className={styles.number}>{i + 1}</span>
            <div className={styles.body}>
              <h2 className={styles.name}>{agent.name}</h2>
              <p className={styles.role}>{agent.role}</p>
              <p className={styles.interface}>{agent.interface}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className={styles.flow}>
        <h3>Secure communication</h3>
        <p>
          <strong>Shopping Agent</strong> orchestrates only: it sends requests to the other three and receives <strong>signed</strong> responses. <strong>Merchant Agent</strong> accepts CartRequest and returns a <strong>signed CartMandate</strong>. <strong>Credentials Provider Agent</strong> accepts ApprovalRequest and returns a <strong>signed PaymentAuthorization</strong>. <strong>Merchant Payment Processor Agent</strong> accepts SettlementRequest (with auth signature) and returns a <strong>signed SettlementResult</strong> (e.g. txid via x402). Each agent signs so the others can verify who sent the message.
        </p>
      </div>

      <Link to="/intent" className={styles.cta}>Start a payment</Link>
    </div>
  )
}
