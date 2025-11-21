import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Biblia Digital - Pueblo de Dios',
        short_name: 'Biblia Digital',
        description: 'Lectura y estudio de la Biblia del Pueblo de Dios offline',
        theme_color: '#b45309',
        background_color: '#fdfbf7',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        categories: ['books', 'education', 'lifestyle'],
        icons: [
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff,woff2}'],
        // Precache all Bible books for offline access
        globDirectory: 'public',
        additionalManifestEntries: [
          { url: '/books/index.json', revision: null }
        ],
        runtimeCaching: [
          {
            // Bible books - Cache First (they rarely change)
            urlPattern: ({ url }) => url.pathname.startsWith('/books/') && url.pathname.endsWith('.json'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'bible-books-cache',
              expiration: {
                maxEntries: 80, // 77 books + index + extras
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // API calls - Network First with fallback
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 1 day
              },
              networkTimeoutSeconds: 10
            }
          },
          {
            // Images and fonts - Cache First
            urlPattern: ({ request }) =>
              request.destination === 'image' ||
              request.destination === 'font',
            handler: 'CacheFirst',
            options: {
              cacheName: 'assets-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ],
        // Increase maximum cache size
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true
      },
      devOptions: {
        enabled: false // Disable in dev mode for easier debugging
      }
    })
  ],
  server: {
    proxy: {
      '/api/vatican': {
        target: 'https://www.vaticannews.va',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/vatican/, '')
      },
      '/api/evangelizo': {
        target: 'https://rss.evangelizo.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/evangelizo/, '')
      }
    }
  }
})
