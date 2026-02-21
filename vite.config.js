import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'
import { existsSync, readFileSync } from 'node:fs'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'))
const APP_VERSION = packageJson.version || '0.0.0'
const BUILD_ID = (process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || APP_VERSION).slice(0, 12)
const CACHE_PREFIX = `biblia-digital-${BUILD_ID}`
const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url))

function jsonResponse(res, statusCode, body) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

async function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
    })
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {})
      } catch (error) {
        reject(error)
      }
    })
    req.on('error', reject)
  })
}

function getTargetPaths(bookId, target = 'both') {
  const candidates = {
    public: path.join(ROOT_DIR, 'public', 'books', `${bookId}.json`),
    src: path.join(ROOT_DIR, 'src', 'data', 'books', `${bookId}.json`),
  }

  if (target === 'public') return [candidates.public]
  if (target === 'src') return [candidates.src]
  return [candidates.public, candidates.src]
}

function getIndexPathForBookFile(filePath) {
  const publicBooksDir = path.join(ROOT_DIR, 'public', 'books')
  const srcBooksDir = path.join(ROOT_DIR, 'src', 'data', 'books')

  if (filePath.startsWith(publicBooksDir)) {
    return path.join(publicBooksDir, 'index.json')
  }
  if (filePath.startsWith(srcBooksDir)) {
    return path.join(srcBooksDir, 'index.json')
  }
  return null
}

function generateBookVersion() {
  return String(Date.now())
}

async function updateVerseInFile(filePath, chapterNumber, verseNumber, text) {
  const raw = await fs.readFile(filePath, 'utf-8')
  const book = JSON.parse(raw)
  const chapter = book?.chapters?.find((c) => String(c.number) === String(chapterNumber))
  if (!chapter) {
    throw new Error(`Capitulo ${chapterNumber} no encontrado en ${path.basename(filePath)}`)
  }
  const verse = chapter?.verses?.find((v) => String(v.number) === String(verseNumber))
  if (!verse) {
    throw new Error(`Versiculo ${verseNumber} no encontrado en ${path.basename(filePath)}`)
  }

  verse.text = text
  await fs.writeFile(filePath, `${JSON.stringify(book, null, 2)}\n`, 'utf-8')
}

async function bumpBookVersionInIndex(indexPath, bookId, nextVersion) {
  if (!indexPath || !existsSync(indexPath)) return false

  const raw = await fs.readFile(indexPath, 'utf-8')
  const index = JSON.parse(raw)
  const bookEntry = index?.books?.find((book) => book.id === bookId)
  if (!bookEntry) return false

  bookEntry.version = nextVersion
  await fs.writeFile(indexPath, `${JSON.stringify(index, null, 2)}\n`, 'utf-8')
  return true
}

function localBookEditorPlugin() {
  return {
    name: 'local-book-editor',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__local/book-verse', async (req, res) => {
        if (req.method !== 'POST') {
          return jsonResponse(res, 405, { error: 'Method not allowed' })
        }

        try {
          const body = await readJsonBody(req)
          const { bookId, chapterNumber, verseNumber, text, target = 'both' } = body

          if (!bookId || !chapterNumber || !verseNumber || typeof text !== 'string') {
            return jsonResponse(res, 400, { error: 'Payload invalido' })
          }

          const targetPaths = getTargetPaths(bookId, target).filter((p) => existsSync(p))
          if (targetPaths.length === 0) {
            return jsonResponse(res, 404, { error: `No se encontro archivo para ${bookId}` })
          }

          await Promise.all(targetPaths.map((filePath) =>
            updateVerseInFile(filePath, chapterNumber, verseNumber, text)
          ))

          const nextVersion = generateBookVersion()
          const indexPaths = Array.from(
            new Set(targetPaths.map((filePath) => getIndexPathForBookFile(filePath)).filter(Boolean))
          )

          const bumped = []
          for (const indexPath of indexPaths) {
            const changed = await bumpBookVersionInIndex(indexPath, bookId, nextVersion)
            if (changed) bumped.push(indexPath)
          }

          return jsonResponse(res, 200, {
            ok: true,
            files: targetPaths,
            version: nextVersion,
            bumpedIndexes: bumped,
          })
        } catch (error) {
          return jsonResponse(res, 500, { error: error.message || 'No se pudo actualizar el archivo' })
        }
      })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    localBookEditorPlugin(),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      useCredentials: true,
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
        cacheId: CACHE_PREFIX,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff,woff2}'],
        runtimeCaching: [
          {
            // Books index is small: check network first to detect catalog changes fast
            urlPattern: ({ url }) => url.pathname === '/books/index.json',
            handler: 'NetworkFirst',
            options: {
              cacheName: `${CACHE_PREFIX}-books-index`,
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 2,
                maxAgeSeconds: 60 * 60 * 24 // 1 day
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Individual books: prioritize cache to avoid hammering server
            urlPattern: ({ url }) =>
              url.pathname.startsWith('/books/') &&
              url.pathname.endsWith('.json') &&
              url.pathname !== '/books/index.json',
            handler: 'CacheFirst',
            options: {
              cacheName: `${CACHE_PREFIX}-books`,
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
              cacheName: `${CACHE_PREFIX}-api`,
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
              cacheName: `${CACHE_PREFIX}-assets`,
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
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setupTests.js'],
    css: true,
  },
  server: {
    proxy: {
      '/api/vatican': {
        target: 'https://www.vaticannews.va',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/vatican/, '')
      },
      '/api/evangelizo': {
        target: 'https://feed.evangelizo.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/evangelizo/, '')
      }
    }
  }
})
