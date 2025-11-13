import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import bookIndex from '../data/books/index.json';

const BibleContext = createContext();

// Cache para libros cargados
const bookCache = {};

export function BibleProvider({ children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadedBooks, setLoadedBooks] = useState(new Set());

  useEffect(() => {
    // Cargar el índice inicial
    const organized = organizeIndex(bookIndex);
    setData(organized);
    setLoading(false);

    // Precarga de libros en background (después de 2 segundos)
    const preloadTimer = setTimeout(() => {
      preloadAllBooks(organized.bookIndex.books);
    }, 2000);

    return () => clearTimeout(preloadTimer);
  }, []);

  const preloadAllBooks = useCallback(async (books) => {
    // Precarga todos los libros en background sin bloquear
    for (const bookInfo of books) {
      // Usar requestIdleCallback si disponible, si no, usar setTimeout
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => loadBook(bookInfo.id));
      } else {
        setTimeout(() => loadBook(bookInfo.id), 100);
      }
    }
  }, []);

  const loadBook = useCallback(async (bookId) => {
    if (bookCache[bookId] || loadedBooks.has(bookId)) {
      return bookCache[bookId];
    }

    try {
      const module = await import(`../data/books/${bookId}.json`);
      const book = module.default;
      bookCache[bookId] = book;
      setLoadedBooks(prev => new Set(prev).add(bookId));
      return book;
    } catch (error) {
      console.error(`Error cargando libro ${bookId}:`, error);
      return null;
    }
  }, [loadedBooks]);

  return (
    <BibleContext.Provider value={{ data, loading, loadBook, loadedBooks }}>
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
      chapters: book.chapters
    };

    organized.testaments[tKey].push({
      id: book.id,
      name: book.name,
      chapters: [] // Se cargarán bajo demanda
    });
  });

  return organized;
}
