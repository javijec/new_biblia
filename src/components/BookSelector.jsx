import React, { useState, useEffect } from "react";
import { useBible } from "../context/BibleContext";

export default function BookSelector({
  data,
  selectedBook,
  onSelectBook,
  onSelectChapter,
  onTestamentChange,
}) {
  const [expandedTestament, setExpandedTestament] = useState("old");
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
        setBookChapters((prev) => ({ ...prev, [bookId]: book.chapters }));
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
        <div key={book.id} className="mb-2 sm:mb-3">
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
            className={`w-full text-left px-3 sm:px-4 lg:px-5 py-2 sm:py-3 lg:py-3.5 rounded-lg transition-all duration-200 flex items-center justify-between font-medium text-xs sm:text-sm lg:text-base ${
              isExpanded
                ? "bg-gradient-to-r from-amber-700 to-orange-700 text-white shadow-lg"
                : "bg-amber-100 hover:bg-amber-200 text-amber-900 hover:shadow-md"
            }`}
          >
            <span className="truncate">{bookName}</span>
            <span
              className={`ml-2 text-xs transition-transform ${isExpanded ? "rotate-180" : ""}`}
            >
              {isLoading ? "⟳" : "▼"}
            </span>
          </button>

          {isExpanded && (
            <div className="mt-2 sm:mt-3 ml-2 sm:ml-4 max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-3 sm:p-4 text-center text-amber-700">
                  <div className="animate-spin inline-block h-4 w-4 border-2 border-amber-700 border-t-transparent rounded-full"></div>
                  <p className="text-xs mt-2">Cargando...</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {chapters
                    .slice()
                    .sort((a, b) => a.number - b.number)
                    .map((chapter, idx) => (
                      <button
                        key={idx}
                        onClick={() =>
                          onSelectChapter &&
                          onSelectChapter({
                            ...chapter,
                            bookTitle: bookName,
                            bookId: book.id,
                          })
                        }
                        className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-white border-2 border-amber-300 rounded-lg text-xs sm:text-sm font-semibold hover:bg-amber-600 hover:text-white hover:border-amber-600 transition-all hover:shadow-md"
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

  if (!data)
    return (
      <div className="p-4 text-center text-slate-500">Cargando libros...</div>
    );

  return (
    <div className="space-y-4">
      {/* Antiguo Testamento */}
      <div>
        <button
          onClick={() =>
            setExpandedTestament(expandedTestament === "old" ? null : "old")
          }
          className="w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-200 flex items-center justify-between shadow-md text-sm sm:text-base"
        >
          <span className="flex items-center gap-2">
            <span>📜</span>
            <span className="hidden sm:inline">Antiguo Testamento</span>
            <span className="sm:hidden">A.T.</span>
          </span>
          <span
            className={`transition-transform ${expandedTestament === "old" ? "rotate-180" : ""}`}
          >
            ▼
          </span>
        </button>

        {expandedTestament === "old" && (
          <div className="space-y-2 pl-1 sm:pl-2 mt-2 sm:mt-3 pb-3 sm:pb-4">
            {renderBooks("old")}
          </div>
        )}
      </div>

      {/* Nuevo Testamento */}
      <div>
        <button
          onClick={() => {
            setExpandedTestament(expandedTestament === "new" ? null : "new");
            onTestamentChange?.();
          }}
          className="w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold rounded-lg hover:from-rose-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-between shadow-md text-sm sm:text-base"
        >
          <span className="flex items-center gap-2">
            <span>✝️</span>
            <span className="hidden sm:inline">Nuevo Testamento</span>
            <span className="sm:hidden">N.T.</span>
          </span>
          <span
            className={`transition-transform ${expandedTestament === "new" ? "rotate-180" : ""}`}
          >
            ▼
          </span>
        </button>

        {expandedTestament === "new" && (
          <div className="space-y-2 pl-1 sm:pl-2 mt-2 sm:mt-3">
            {renderBooks("new")}
          </div>
        )}
      </div>
    </div>
  );
}
