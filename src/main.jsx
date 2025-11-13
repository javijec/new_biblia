import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BibleProvider } from './context/BibleContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BibleProvider>
      <App />
    </BibleProvider>
  </StrictMode>,
)
