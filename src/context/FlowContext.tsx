import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { AP2FlowState, Authorization, CartMandate, PaymentIntent, Receipt, Settlement } from '@/types/ap2'

const initialState: AP2FlowState = {
  step: 'intent',
  intent: null,
  cartMandate: null,
  authorization: null,
  settlement: null,
  receipt: null,
}

type FlowContextValue = AP2FlowState & {
  setIntent: (intent: PaymentIntent) => void
  setCartMandate: (cart: CartMandate | null) => void
  setAuthorization: (auth: Authorization) => void
  setSettlement: (s: Settlement) => void
  setReceipt: (r: Receipt) => void
  setStep: (step: AP2FlowState['step']) => void
  reset: () => void
}

const FlowContext = createContext<FlowContextValue | null>(null)

export function FlowProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AP2FlowState>(initialState)

  const setIntent = useCallback((intent: PaymentIntent) => {
    setState((s) => ({ ...s, intent, step: 'cart' }))
  }, [])

  const setCartMandate = useCallback((cartMandate: CartMandate | null) => {
    setState((s) => ({ ...s, cartMandate, step: 'authorization' }))
  }, [])

  const setAuthorization = useCallback((authorization: Authorization) => {
    setState((s) => ({ ...s, authorization, step: 'settlement' }))
  }, [])

  const setSettlement = useCallback((settlement: Settlement) => {
    setState((s) => ({ ...s, settlement, step: 'receipt' }))
  }, [])

  const setReceipt = useCallback((receipt: Receipt) => {
    setState((s) => ({ ...s, receipt, step: 'receipt' }))
  }, [])

  const setStep = useCallback((step: AP2FlowState['step']) => {
    setState((s) => ({ ...s, step }))
  }, [])

  const reset = useCallback(() => {
    setState(initialState)
  }, [])

  const value = useMemo<FlowContextValue>(
    () => ({
      ...state,
      setIntent,
      setCartMandate,
      setAuthorization,
      setSettlement,
      setReceipt,
      setStep,
      reset,
    }),
    [state, setIntent, setCartMandate, setAuthorization, setSettlement, setReceipt, setStep, reset]
  )

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>
}

export function useFlow() {
  const ctx = useContext(FlowContext)
  if (!ctx) throw new Error('useFlow must be used within FlowProvider')
  return ctx
}
