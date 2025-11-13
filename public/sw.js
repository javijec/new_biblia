// Service Worker para caché offline y optimización de rendimiento
const CACHE_NAME = 'biblia-digital-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.jsx',
  '/src/index.css',
  '/src/App.jsx',
  '/src/data/bible.json',
  '/src/data/bible-complete.json'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activar Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptar peticiones
self.addEventListener('fetch', (event) => {
  // No cachear peticiones de API externas o POST
  if (event.request.method !== 'GET' || 
      event.request.url.includes('api') || 
      event.request.url.includes('analytics')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - devolver respuesta
        if (response) {
          return response;
        }

        // Clonar la petición
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Verificar si recibimos una respuesta válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clonar la respuesta
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});

// Optimización: Precachear recursos críticos
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PRECACHE_NEW_ROUTE') {
    const urls = event.data.urls;
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urls);
    });
  }
});

// Estrategia de cache para diferentes tipos de recursos
const cacheStrategies = {
  // Cache primero, red como respaldo
  cacheFirst: async (request) => {
    const cached = await caches.match(request);
    if (cached) return cached;
    
    try {
      const response = await fetch(request);
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
      return response;
    } catch (error) {
      return new Response('Offline');
    }
  },

  // Red primero, cache como respaldo
  networkFirst: async (request) => {
    try {
      const response = await fetch(request);
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
      return response;
    } catch (error) {
      const cached = await caches.match(request);
      return cached || new Response('Offline');
    }
  }
};