import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import AppErrorBoundary from './components/AppErrorBoundary'
import { BibleProvider } from './context/BibleContext'
import { SettingsProvider } from './context/SettingsContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <BibleProvider>
          <AppErrorBoundary>
            <App />
          </AppErrorBoundary>
        </BibleProvider>
      </SettingsProvider>
    </BrowserRouter>
  </StrictMode>,
)
