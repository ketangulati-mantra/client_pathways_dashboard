import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n' // Initialize i18next
import App from './App.jsx'
import { ToastProvider } from './components'
import { AuthProvider } from './auth/AuthContext'
import { AuthGate } from './auth/AuthGate'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={<div>Loading...</div>}>
      <AuthProvider>
        <ToastProvider>
          <AuthGate>
            <App />
          </AuthGate>
        </ToastProvider>
      </AuthProvider>
    </Suspense>
  </StrictMode>,
)
