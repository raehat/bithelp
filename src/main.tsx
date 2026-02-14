import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { FlowProvider } from '@/context/FlowContext'
import App from './App'
import './index.css'

;(window as unknown as { __AP2_MOCK_BTC__?: boolean }).__AP2_MOCK_BTC__ = true

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <FlowProvider>
        <App />
      </FlowProvider>
    </BrowserRouter>
  </React.StrictMode>
)
