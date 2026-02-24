# Biblia Digital

Aplicación web para lectura y búsqueda de la Biblia del Pueblo de Dios, optimizada para uso online/offline.

## Stack Real

- React 19 + React Router 7
- Vite 7
- MUI 7 (Material UI)
- Vitest + Testing Library
- PWA con `vite-plugin-pwa`
- Web Worker para búsqueda global

## Qué Hace

- Navegación por libros y capítulos.
- Lectura de capítulos con navegación anterior/siguiente.
- Búsqueda en toda la Biblia con ranking de relevancia.
- Lecturas del día (Evangelio) con fallback de fuentes.
- Modo offline con service worker.
- Modo local de corrección de versículos (solo `vite dev`, localhost).

## Datos

- Fuente principal en runtime: `public/books/*.json`.
- Índice de catálogo: `public/books/index.json`.
- Los JSON de `src/data/` se usan como insumo de scripts de extracción/normalización, no como fuente principal en runtime.

## Arquitectura (resumen)

- `src/context/BibleContext.jsx`: carga índice, versionado de libros, caché en memoria, carga bajo demanda.
- `src/workers/search.worker.js`: búsqueda global y scoring fuera del hilo principal.
- `src/services/gospelService.js`: integración de lecturas diarias con cache local y sanitización HTML.
- `src/components/DailyGospel.jsx`: render de lecturas del día.
- `vite.config.js`: PWA, proxy dev, y endpoint local `POST /__local/book-verse`.

## Desarrollo

```bash
npm install
npm run dev
```

## Scripts Disponibles

```bash
# App
npm run dev
npm run build
npm run preview
npm run lint
npm run test
npm run test:run

# Performance
npm run performance

# Utilidades de datos
npm run extract:bible
npm run books:init-versions
```

`npm run performance`:
1. Build de producción.
2. Levanta `vite preview` en `http://127.0.0.1:4173`.
3. Ejecuta Lighthouse.
4. Genera `lighthouse-report.html`.

## PWA y Caché

- `books/index.json`: estrategia `NetworkFirst` para detectar cambios rápido.
- `books/*.json`: estrategia `CacheFirst` con versionado por query param `?v=...`.
- Limpieza de caches viejas activada (`cleanupOutdatedCaches`).

## Calidad

- Lint con ESLint.
- Tests unitarios con Vitest.
- Cobertura de contexto, páginas principales, conjugaciones y sanitización de evangelio.

## Notas de Seguridad

- El contenido HTML remoto del Evangelio se sanitiza con `DOMPurify` antes de renderizarse.

## Deploy

- Configuración de headers y rewrites en `vercel.json`.
- SPA rewrite a `index.html`.
- Rewrites de API para Evangelizo y Vatican News.
