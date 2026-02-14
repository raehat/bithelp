import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { FlowProvider } from '@/context/FlowContext'
import { WalletsProvider } from '@/context/WalletsContext'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <FlowProvider>
        <WalletsProvider>
          <App />
        </WalletsProvider>
      </FlowProvider>
    </BrowserRouter>
  </React.StrictMode>
)
