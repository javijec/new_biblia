import { useCallback, useRef } from 'react';
import { useBible } from '../context/BibleContext';
import { normalizeVerb } from './verbConjugations';

export function useBibleSearch() {
  const { data, loadBook } = useBible();
  const searchCacheRef = useRef({});

  const searchAllBooks = useCallback(async (term, onProgressUpdate) => {
    if (!term || !term.trim()) {
      return [];
    }

    // Normalizar término de búsqueda (remover acentos)
    let normalizedTerm = term.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // Si es un verbo conjugado, buscar por el infinitivo
    const baseVerb = normalizeVerb(normalizedTerm);
    const searchTerms = new Set([normalizedTerm, baseVerb]);

    const cacheKey = Array.from(searchTerms).sort().join('|');
    if (searchCacheRef.current[cacheKey]) {
      return searchCacheRef.current[cacheKey];
    }

    const results = [];
    // Crear múltiples regex para buscar el término o cualquier forma del verbo
    const searchRegexes = Array.from(searchTerms).map(term => new RegExp(`\\b${term}\\b`, 'g'));

    if (!data || !data.bookIndex) {
      return [];
    }

    // Buscar de forma progresiva, notificando resultados conforme se encuentran
    for (let i = 0; i < data.bookIndex.books.length; i++) {
      const bookInfo = data.bookIndex.books[i];
      const book = await loadBook(bookInfo.id);
      
      if (!book || !book.chapters) continue;

      book.chapters.forEach((chapter) => {
        if (!chapter.verses) return;

        chapter.verses.forEach((verse) => {
          // Normalizar texto para comparación
          const normalizedText = verse.text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          
          // Buscar cualquiera de los términos (original o conjugaciones del verbo)
          const matches = searchRegexes.some(regex => {
            regex.lastIndex = 0; // Reset regex
            return regex.test(normalizedText);
          });

          if (verse.text && matches) {
            results.push({
              bookTitle: book.name,
              chapterNumber: chapter.number,
              verseNumber: verse.number,
              text: verse.text,
              verse,
              chapter: {
                ...chapter,
                bookId: book.id,
                bookTitle: book.name,
                verses: chapter.verses
              },
              query: term,
            });
          }
        });
      });

      // Notificar progreso cada 5 libros o al final
      if ((i + 1) % 5 === 0 || i === data.bookIndex.books.length - 1) {
        onProgressUpdate?.({
          current: i + 1,
          total: data.bookIndex.books.length,
          results: [...results]
        });
      }
    }

    searchCacheRef.current[cacheKey] = results;
    return results;
  }, [data, loadBook]);

  return { searchAllBooks };
}
