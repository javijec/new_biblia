import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { BibleProvider } from './context/BibleContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <BibleProvider>
        <App />
      </BibleProvider>
    </BrowserRouter>
  </StrictMode>,
)
