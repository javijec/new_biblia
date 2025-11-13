import { useCallback, useRef } from 'react';
import { useBible } from '../context/BibleContext';

export function useBibleSearch() {
  const { data, loadBook } = useBible();
  const searchCacheRef = useRef({});

  const searchAllBooks = useCallback(async (term, onProgressUpdate) => {
    if (!term || !term.trim()) {
      return [];
    }

    const cacheKey = term.toLowerCase();
    if (searchCacheRef.current[cacheKey]) {
      return searchCacheRef.current[cacheKey];
    }

    const results = [];
    const searchRegex = new RegExp(`\\b${term.toLowerCase()}\\b`, 'g');

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
          if (verse.text && searchRegex.test(verse.text.toLowerCase())) {
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
