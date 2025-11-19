import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { BibleProvider } from './context/BibleContext'
import { SettingsProvider } from './context/SettingsContext'
import { SelectionProvider } from './context/SelectionContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <BibleProvider>
          <SelectionProvider>
            <App />
          </SelectionProvider>
        </BibleProvider>
      </SettingsProvider>
    </BrowserRouter>
  </StrictMode>,
)
