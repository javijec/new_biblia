import { useCallback, useRef } from 'react';
import { useBible } from '../context/BibleContext';

export function useBibleSearch() {
  const { data, loadBook, loadedBooks } = useBible();
  const searchCacheRef = useRef({});

  const searchAllBooks = useCallback(async (term) => {
    if (!term || !term.trim()) {
      return [];
    }

    const cacheKey = term.toLowerCase();
    if (searchCacheRef.current[cacheKey]) {
      return searchCacheRef.current[cacheKey];
    }

    const results = [];
    const searchRegex = new RegExp(`\\b${term.toLowerCase()}\\b`, 'g');

    // Cargar todos los libros
    if (!data || !data.bookIndex) {
      return [];
    }

    for (const bookInfo of data.bookIndex.books) {
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
    }

    searchCacheRef.current[cacheKey] = results;
    return results;
  }, [data, loadBook]);

  return { searchAllBooks };
}
