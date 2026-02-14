import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { Wallet } from '@/types/wallet'

const STORAGE_KEY = 'ap2_wallets'

function loadWallets(): Wallet[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveWallets(wallets: Wallet[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(wallets))
}

type WalletsContextValue = {
  wallets: Wallet[]
  addWallet: (wallet: Wallet) => void
  removeWallet: (id: string) => void
}

const WalletsContext = createContext<WalletsContextValue | null>(null)

export function WalletsProvider({ children }: { children: React.ReactNode }) {
  const [wallets, setWallets] = useState<Wallet[]>(loadWallets)

  useEffect(() => {
    saveWallets(wallets)
  }, [wallets])

  const addWallet = useCallback((wallet: Wallet) => {
    setWallets((prev) => [...prev, wallet])
  }, [])

  const removeWallet = useCallback((id: string) => {
    setWallets((prev) => prev.filter((w) => w.id !== id))
  }, [])

  const value = useMemo(
    () => ({ wallets, addWallet, removeWallet }),
    [wallets, addWallet, removeWallet]
  )

  return <WalletsContext.Provider value={value}>{children}</WalletsContext.Provider>
}

export function useWallets() {
  const ctx = useContext(WalletsContext)
  if (!ctx) throw new Error('useWallets must be used within WalletsProvider')
  return ctx
}
