import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { BibleProvider } from './context/BibleContext'
import { SettingsProvider } from './context/SettingsContext'
import { SelectionProvider } from './context/SelectionContext'

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('Service Worker registered successfully:', registration.scope);

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available, prompt user to reload
              if (confirm('Nueva versión disponible. ¿Desea actualizar?')) {
                window.location.reload();
              }
            }
          });
        });
      },
      (error) => {
        console.log('Service Worker registration failed:', error);
      }
    );
  });
}

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
