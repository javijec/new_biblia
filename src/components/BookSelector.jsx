import React, { useState, useEffect } from 'react';
import { useBible } from '../context/BibleContext';

export default function BookSelector({ data, selectedBook, onSelectBook, onSelectChapter, onTestamentChange }) {
  const [expandedTestament, setExpandedTestament] = useState('old');
  const [expandedBooks, setExpandedBooks] = useState(new Set());
  const [bookChapters, setBookChapters] = useState({}); // Cache de capítulos por libro
  const [loadingBook, setLoadingBook] = useState(null);
  const { loadBook } = useBible();

  const loadBookChapters = async (bookId) => {
    if (bookChapters[bookId]) {
      return bookChapters[bookId];
    }

    setLoadingBook(bookId);
    try {
      const book = await loadBook(bookId);
      if (book && book.chapters) {
        setBookChapters(prev => ({ ...prev, [bookId]: book.chapters }));
      }
    } catch (error) {
      console.error(`Error cargando capítulos del libro ${bookId}:`, error);
    }
    setLoadingBook(null);
  };

  const renderBooks = (testament) => {
    const books = data.testaments[testament] || [];

    return books.map((book) => {
      const chapters = bookChapters[book.id] || [];
      const bookName = book.name;
      const isExpanded = expandedBooks.has(book.id);
      const isLoading = loadingBook === book.id;

      return (
        <div key={book.id} className="mb-3">
          <button
            onClick={() => {
              const next = new Set(expandedBooks);
              if (next.has(book.id)) {
                next.delete(book.id);
              } else {
                next.add(book.id);
                loadBookChapters(book.id);
              }
              setExpandedBooks(next);
            }}
            aria-expanded={isExpanded}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between font-medium text-sm ${
              isExpanded
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100'
            }`}
          >
            <span className="truncate">{bookName}</span>
            <span className={`ml-2 text-xs transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
              {isLoading ? '⟳' : '▼'}
            </span>
          </button>

          {isExpanded && (
            <div className="mt-3 ml-4 max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-slate-500 dark:text-slate-400">
                  <div className="animate-spin inline-block h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  <p className="text-xs mt-2">Cargando...</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {chapters
                    .slice()
                    .sort((a, b) => a.number - b.number)
                    .map((chapter, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSelectChapter && onSelectChapter({ ...chapter, bookTitle: bookName, bookId: book.id })}
                      className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold hover:bg-blue-600 hover:text-white hover:border-blue-600 dark:hover:bg-blue-600 dark:hover:border-blue-600 transition-all hover:shadow-md"
                      title={`Capítulo ${chapter.number}`}
                    >
                      {chapter.number}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      );
    });
  };

  if (!data) return <div className="p-4 text-center text-slate-500">Cargando libros...</div>;

  return (
    <div className="space-y-4">
      {/* Antiguo Testamento */}
      <div>
        <button
          onClick={() => setExpandedTestament(expandedTestament === 'old' ? null : 'old')}
          className="w-full text-left px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-200 flex items-center justify-between shadow-md"
        >
          <span className="flex items-center gap-2">
            <span>📜</span>
            <span>Antiguo Testamento</span>
          </span>
          <span className={`transition-transform ${expandedTestament === 'old' ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>

        {expandedTestament === 'old' && (
          <div className="space-y-2 pl-2 mt-3 pb-4">{renderBooks('old')}</div>
        )}
      </div>

      {/* Nuevo Testamento */}
      <div>
        <button
          onClick={() => {
            setExpandedTestament(expandedTestament === 'new' ? null : 'new');
            onTestamentChange?.();
          }}
          className="w-full text-left px-4 py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold rounded-lg hover:from-rose-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-between shadow-md"
        >
          <span className="flex items-center gap-2">
            <span>✝️</span>
            <span>Nuevo Testamento</span>
          </span>
          <span className={`transition-transform ${expandedTestament === 'new' ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>

        {expandedTestament === 'new' && (
          <div className="space-y-2 pl-2 mt-3">{renderBooks('new')}</div>
        )}
      </div>
    </div>
  );
}
