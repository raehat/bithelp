import { Routes, Route, Navigate } from 'react-router-dom'
import { useFlow } from '@/context/FlowContext'
import { Layout } from '@/components/Layout'
import { AgentsPage } from '@/pages/AgentsPage'
import { IntentPage } from '@/pages/IntentPage'
import { CartPage } from '@/pages/CartPage'
import { AuthorizePage } from '@/pages/AuthorizePage'
import { SettlePage } from '@/pages/SettlePage'
import { ReceiptPage } from '@/pages/ReceiptPage'
import { AuditPage } from '@/pages/AuditPage'

function FlowRedirect() {
  const { step } = useFlow()
  const to = step === 'intent' ? '/intent' : step === 'cart' ? '/cart' : step === 'authorization' ? '/authorize' : step === 'settlement' ? '/settle' : '/receipt'
  return <Navigate to={to} replace />
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<FlowRedirect />} />
        <Route path="/agents" element={<AgentsPage />} />
        <Route path="/intent" element={<IntentPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/authorize" element={<AuthorizePage />} />
        <Route path="/settle" element={<SettlePage />} />
        <Route path="/receipt" element={<ReceiptPage />} />
        <Route path="/audit" element={<AuditPage />} />
      </Routes>
    </Layout>
  )
}
