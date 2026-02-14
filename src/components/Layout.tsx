import { Link, useLocation } from 'react-router-dom'
import { useFlow } from '@/context/FlowContext'
import styles from './Layout.module.css'

const STEPS: { path: string; label: string; key: string }[] = [
  { path: '/intent', label: 'Intent', key: 'intent' },
  { path: '/authorize', label: 'Authorize', key: 'authorization' },
  { path: '/settle', label: 'Settle', key: 'settlement' },
  { path: '/receipt', label: 'Receipt', key: 'receipt' },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const { step, reset } = useFlow()
  const currentIndex = STEPS.findIndex((s) => s.key === step)

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <Link to="/intent" className={styles.logo} onClick={reset}>
          AP2
        </Link>
        <span className={styles.tagline}>Agent Payment Protocol</span>
        <nav className={styles.nav}>
          {STEPS.map((s, i) => {
            const active = location.pathname === s.path
            const done = currentIndex > i
            return (
              <Link
                key={s.path}
                to={s.path}
                className={`${styles.step} ${active ? styles.active : ''} ${done ? styles.done : ''}`}
              >
                <span className={styles.stepNum}>{i + 1}</span>
                {s.label}
              </Link>
            )
          })}
          <Link to="/audit" className={styles.auditLink}>
            Audit
          </Link>
        </nav>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  )
}
