import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { BibleProvider } from './context/BibleContext'
import { SettingsProvider } from './context/SettingsContext'
import { BookmarksProvider } from './context/BookmarksContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <BookmarksProvider>
          <BibleProvider>
            <App />
          </BibleProvider>
        </BookmarksProvider>
      </SettingsProvider>
    </BrowserRouter>
  </StrictMode>,
)
