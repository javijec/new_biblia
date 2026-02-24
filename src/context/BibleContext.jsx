import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { logError } from '../utils/telemetry';

const BibleContext = createContext();
const MAX_PRELOAD_BOOKS = 12;
const OFFLINE_BOOKS_CACHE = 'biblia-offline-books-v1';

// Cache para libros cargados
const bookCache = {};
const getBookCacheKey = (bookId, version) => `${bookId}@${version || 'base'}`;

export function BibleProvider({ children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadedBooks, setLoadedBooks] = useState(new Set());
  const [offlineBooksCount, setOfflineBooksCount] = useState(0);
  const [downloadState, setDownloadState] = useState({
    isDownloading: false,
    downloaded: 0,
    total: 0,
    failed: [],
    error: null,
  });
  const loadedBooksRef = useRef(new Set());
  const dataRef = useRef(null);

  const getBookVersion = useCallback((bookId) => {
    const entry = dataRef.current?.bookIndex?.books?.find((book) => book.id === bookId);
    return entry?.version || null;
  }, []);

  const loadBook = useCallback(async (bookId, options = {}) => {
    const { force = false } = options;
    const bookVersion = getBookVersion(bookId);
    const cacheKey = getBookCacheKey(bookId, bookVersion);
    if (!force && (bookCache[cacheKey] || loadedBooksRef.current.has(cacheKey))) {
      return bookCache[cacheKey];
    }

    try {
      const versionedUrl = bookVersion
        ? `/books/${bookId}.json?v=${encodeURIComponent(bookVersion)}`
        : `/books/${bookId}.json`;
      let response;

      try {
        response = await fetch(versionedUrl);
      } catch {
        // Si falla el fetch versionado (red/SW), intentamos el base.
        response = null;
      }

      // Fallback para modo offline o SW viejo cuando existe cache anterior sin version.
      if ((!response || !response.ok) && bookVersion) {
        response = await fetch(`/books/${bookId}.json`).catch(() => null);
      }
      if (!response || !response.ok) throw new Error('Network response was not ok');

      const book = await response.json();

      // Normalize chapters for single-chapter books
      if (book.chapters) {
        book.chapters.forEach((chapter) => {
          if (chapter.number === null) {
            chapter.number = 1;
          }
        });
      }

      bookCache[cacheKey] = book;
      setLoadedBooks((prev) => {
        if (prev.has(cacheKey)) return prev;
        const next = new Set(prev).add(cacheKey);
        loadedBooksRef.current = next;
        return next;
      });
      return book;
    } catch (error) {
      logError('book_load_failed', error, { bookId });
      return null;
    }
  }, [getBookVersion]);

  const preloadAllBooks = useCallback(async (books) => {
    const connection = navigator?.connection;
    const saveData = connection?.saveData === true;
    const lowBandwidth = connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g';
    if (saveData || lowBandwidth) return;

    const booksToPreload = books.slice(0, MAX_PRELOAD_BOOKS);

    // Precarga todos los libros en background sin bloquear
    for (const bookInfo of booksToPreload) {
      // Usar requestIdleCallback si disponible, si no, usar setTimeout
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => loadBook(bookInfo.id));
      } else {
        setTimeout(() => loadBook(bookInfo.id), 100);
      }
    }
  }, [loadBook]);

  const refreshOfflineAvailability = useCallback(async () => {
    if (!('caches' in window)) {
      setOfflineBooksCount(0);
      return 0;
    }

    const cachedBookIds = new Set();
    const cacheNames = await caches.keys();

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      for (const request of requests) {
        const pathname = new URL(request.url).pathname;
        if (!pathname.startsWith('/books/') || !pathname.endsWith('.json') || pathname === '/books/index.json') {
          continue;
        }

        const bookId = pathname.split('/').pop()?.replace('.json', '');
        if (bookId) cachedBookIds.add(bookId);
      }
    }

    const count = cachedBookIds.size;
    setOfflineBooksCount(count);
    return count;
  }, []);

  const downloadBooksForOffline = useCallback(async () => {
    if (!dataRef.current?.bookIndex?.books?.length || downloadState.isDownloading) return;
    if (!('caches' in window)) {
      setDownloadState({
        isDownloading: false,
        downloaded: 0,
        total: 0,
        failed: [],
        error: 'Cache API no disponible en este navegador',
      });
      return;
    }

    const books = dataRef.current.bookIndex.books;
    const total = books.length;
    const failed = [];

    setDownloadState({
      isDownloading: true,
      downloaded: 0,
      total,
      failed: [],
      error: null,
    });

    try {
      const cache = await caches.open(OFFLINE_BOOKS_CACHE);
      const indexResponse = await fetch('/books/index.json', { cache: 'no-store' });
      if (indexResponse.ok) {
        await cache.put('/books/index.json', indexResponse.clone());
      }

      for (let i = 0; i < books.length; i += 1) {
        const book = books[i];
        const baseUrl = `/books/${book.id}.json`;
        const versionedUrl = book.version
          ? `${baseUrl}?v=${encodeURIComponent(book.version)}`
          : baseUrl;

        try {
          let response = await fetch(versionedUrl, { cache: 'no-store' });
          if (!response.ok && book.version) {
            response = await fetch(baseUrl, { cache: 'no-store' });
          }
          if (!response.ok) throw new Error(`No se pudo descargar ${book.id}`);

          await cache.put(baseUrl, response.clone());
        } catch (error) {
          failed.push(book.id);
          logError('offline_book_download_failed', error, { bookId: book.id });
        } finally {
          setDownloadState((prev) => ({
            ...prev,
            downloaded: i + 1,
          }));
        }
      }

      await refreshOfflineAvailability();
      setDownloadState({
        isDownloading: false,
        downloaded: total,
        total,
        failed,
        error: failed.length ? `No se pudieron descargar ${failed.length} libros` : null,
      });
    } catch (error) {
      logError('offline_download_failed', error);
      setDownloadState({
        isDownloading: false,
        downloaded: 0,
        total,
        failed,
        error: 'Fallo la descarga para uso offline',
      });
    }
  }, [downloadState.isDownloading, refreshOfflineAvailability]);

  useEffect(() => {
    let ignore = false;
    let preloadTimer = null;

    // Cargar el índice inicial
    const fetchIndex = async () => {
      try {
        const res = await fetch('/books/index.json');
        const indexData = await res.json();
        if (ignore) return;

        const organized = organizeIndex(indexData);
        dataRef.current = organized;
        setData(organized);
        setLoading(false);

        // Precarga de libros en background (después de 2 segundos)
        preloadTimer = setTimeout(() => {
          preloadAllBooks(organized.bookIndex.books);
        }, 2000);
      } catch (err) {
        if (ignore) return;
        logError('bible_index_load_failed', err);
        setLoading(false);
      }
    };

    fetchIndex();

    return () => {
      ignore = true;
      if (preloadTimer) {
        clearTimeout(preloadTimer);
      }
    };
  }, [preloadAllBooks]);

  useEffect(() => {
    refreshOfflineAvailability();
  }, [refreshOfflineAvailability]);

  return (
    <BibleContext.Provider
      value={{
        data,
        loading,
        loadBook,
        loadedBooks,
        offlineBooksCount,
        totalBooksCount: data?.bookIndex?.books?.length || 0,
        downloadState,
        downloadBooksForOffline,
        refreshOfflineAvailability,
      }}
    >
      {children}
    </BibleContext.Provider>
  );
}

export function useBible() {
  const context = useContext(BibleContext);
  if (!context) {
    throw new Error('useBible debe usarse dentro de BibleProvider');
  }
  return context;
}

function identifyTestamentKey(testamentName) {
  if (!testamentName) return 'unknown';
  const key = testamentName.toLowerCase();
  if (key.includes('antiguo')) return 'old';
  if (key.includes('nuevo')) return 'new';
  return 'new';
}

function organizeIndex(indexData) {
  // Crear estructura desde el índice de libros
  const organized = {
    testaments: { old: [], new: [] },
    allChapters: {},
    booksById: {},
    totals: indexData.totals || {},
    bookIndex: indexData // Guardar índice para referencias rápidas
  };

  indexData.books.forEach((book) => {
    const tKey = identifyTestamentKey(book.testament);

    organized.booksById[book.id] = {
      id: book.id,
      name: book.name,
      testament: tKey,
      chapters: book.chapters,
      version: book.version || null,
    };

    organized.testaments[tKey].push({
      id: book.id,
      name: book.name,
      chapters: [], // Se cargarán bajo demanda
      version: book.version || null,
    });
  });

  return organized;
}
