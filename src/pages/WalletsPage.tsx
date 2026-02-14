import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { createId } from '@/lib/id'
import { createBitcoinWallet } from '@/lib/bitcoin'
import { useWallets } from '@/context/WalletsContext'
import type { Wallet } from '@/types/wallet'
import styles from './WalletsPage.module.css'

/**
 * Credentials Provider Agent holds wallets. Only this agent has access to addresses and keys.
 * Other agents (Shopping, Merchant, Processor) never see wallet data.
 */
export function WalletsPage() {
  const { wallets, addWallet } = useWallets()
  const [adding, setAdding] = useState(false)
  const [newWallet, setNewWallet] = useState<Wallet | null>(null)
  const [error, setError] = useState('')

  const handleConnectUnisat = async () => {
    setAdding(true)
    setError('')
    setNewWallet(null)
    try {
      const { address } = await createBitcoinWallet()
      const existing = wallets.find((w) => w.address === address)
      if (existing) {
        setNewWallet(existing)
        setError('')
        setAdding(false)
        return
      }
      const wallet: Wallet = {
        id: createId('wallet'),
        type: 'bitcoin',
        address,
        label: wallets.some((w) => w.type === 'bitcoin') ? `Unisat ${wallets.filter((w) => w.type === 'bitcoin').length + 1}` : 'Unisat',
        createdAt: new Date().toISOString(),
        managedBy: 'credentials-provider-agent',
      }
      setNewWallet(wallet)
      addWallet(wallet)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to connect Unisat')
    } finally {
      setAdding(false)
    }
  }

  const closeNewWallet = () => setNewWallet(null)

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Wallets</h1>
      <p className={styles.subtitle}>
        <strong>Credentials Provider Agent</strong> holds your payment credentials. Only this agent can see and use these wallets. Shopping, Merchant, and Processor agents never have access.
      </p>

      <div className={styles.roles}>
        <strong>Who does what:</strong> Credentials Provider stores wallets and signs approvals. Shopping Agent only requests approval; Merchant Agent only creates cart; Processor only settles on-chain.
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.addBtn}
          onClick={handleConnectUnisat}
          disabled={adding}
        >
          {adding ? 'Connecting…' : 'Connect Unisat'}
        </button>
      </div>

      {newWallet && (
        <div className={styles.newWalletCard}>
          <h2>Unisat connected</h2>
          <p className={styles.newWalletHint}>This address is your Unisat wallet. Managed by Credentials Provider Agent.</p>
          <div className={styles.qrWrap}>
            <QRCodeSVG value={newWallet.address} size={200} level="M" includeMargin />
          </div>
          <div className={styles.addressWrap}>
            <span className={styles.addressLabel}>Address</span>
            <code className={styles.address}>{newWallet.address}</code>
            <button
              type="button"
              className={styles.copyBtn}
              onClick={() => navigator.clipboard.writeText(newWallet.address)}
            >
              Copy
            </button>
          </div>
          <button type="button" className={styles.doneBtn} onClick={closeNewWallet}>
            Done
          </button>
        </div>
      )}

      <section className={styles.listSection}>
        <h2>Your wallets</h2>
        {wallets.length === 0 && !newWallet && (
          <p className={styles.empty}>No wallets yet. Connect Unisat above to pay with Bitcoin.</p>
        )}
        <ul className={styles.list}>
          {wallets.map((w) => (
            <li key={w.id} className={styles.walletCard}>
              <span className={styles.walletLabel}>{w.label}</span>
              <span className={styles.walletType}>{w.type}</span>
              <code className={styles.walletAddress}>{w.address}</code>
              <span className={styles.walletMeta}>Managed by Credentials Provider · {new Date(w.createdAt).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
