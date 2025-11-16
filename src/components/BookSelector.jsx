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
  const [bookChapters, setBookChapters] = useState({});
  const [loadingBook, setLoadingBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
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

  const filterBooks = (books) => {
    if (!searchTerm.trim()) return books;
    const term = searchTerm.toLowerCase();
    return books.filter((book) => book.name.toLowerCase().includes(term));
  };

  const renderBooks = (testament) => {
    const books = filterBooks(data.testaments[testament] || []);

    if (books.length === 0) {
      return (
        <div className="p-3 sm:p-4 text-center text-amber-700 text-sm">
          No se encontraron libros
        </div>
      );
    }

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
            className={`w-full text-left px-3 sm:px-4 lg:px-5 py-2 sm:py-3 lg:py-3.5 rounded-lg transition-all duration-200 flex items-center justify-between font-medium text-xs sm:text-sm lg:text-base hover-lift ${
              isExpanded
                ? "bg-linear-to-r from-amber-700 to-orange-700 text-white shadow-lg"
                : "bg-amber-100 hover:bg-amber-200 text-amber-900 hover:shadow-md"
            }`}
          >
            <span className="truncate">{bookName}</span>
            <span
              className={`ml-2 text-xs transition-transform shrink-0 ${isExpanded ? "rotate-180" : ""}`}
            >
              {isLoading ? "⟳" : "▼"}
            </span>
          </button>

          {isExpanded && (
            <div className="mt-2 sm:mt-3 ml-2 sm:ml-4 max-h-96 overflow-y-auto custom-scrollbar">
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
                        className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-white border-2 border-amber-300 rounded-lg text-xs sm:text-sm font-semibold hover:bg-amber-600 hover:text-white hover:border-amber-600 transition-all hover:shadow-md hover-lift"
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

  const oldBooks = filterBooks(data.testaments["old"] || []);
  const newBooks = filterBooks(data.testaments["new"] || []);

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Search Bar */}
      <div className="sticky top-0 z-10 bg-linear-to-b from-amber-50 to-transparent pb-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar libro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-amber-300 bg-white text-amber-900 rounded-lg focus:outline-none focus:border-amber-700 transition-colors font-medium text-xs sm:text-sm placeholder-amber-700/50"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-amber-100 rounded text-amber-700"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Antiguo Testamento */}
      <div>
        <button
          onClick={() =>
            setExpandedTestament(expandedTestament === "old" ? null : "old")
          }
          className="w-full text-left px-3 sm:px-4 py-3 sm:py-4 bg-linear-to-r from-amber-600 to-orange-600 text-white font-bold rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-200 flex items-center justify-between shadow-lg text-sm sm:text-base hover-lift"
        >
          <span className="flex items-center gap-2">
            <span>📜</span>
            <span className="hidden sm:inline">Antiguo Testamento</span>
            <span className="sm:hidden">A.T.</span>
            <span className="text-xs bg-white/30 px-2 py-1 rounded-full">
              {oldBooks.length}
            </span>
          </span>
          <span
            className={`transition-transform ${expandedTestament === "old" ? "rotate-180" : ""}`}
          >
            ▼
          </span>
        </button>

        {expandedTestament === "old" && (
          <div className="space-y-2 pl-1 sm:pl-2 mt-2 sm:mt-3 pb-3 sm:pb-4 max-h-[50vh] overflow-y-auto custom-scrollbar">
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
          className="w-full text-left px-3 sm:px-4 py-3 sm:py-4 bg-linear-to-r from-rose-600 to-pink-600 text-white font-bold rounded-lg hover:from-rose-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-between shadow-lg text-sm sm:text-base hover-lift"
        >
          <span className="flex items-center gap-2">
            <span>✝️</span>
            <span className="hidden sm:inline">Nuevo Testamento</span>
            <span className="sm:hidden">N.T.</span>
            <span className="text-xs bg-white/30 px-2 py-1 rounded-full">
              {newBooks.length}
            </span>
          </span>
          <span
            className={`transition-transform ${expandedTestament === "new" ? "rotate-180" : ""}`}
          >
            ▼
          </span>
        </button>

        {expandedTestament === "new" && (
          <div className="space-y-2 pl-1 sm:pl-2 mt-2 sm:mt-3 max-h-[50vh] overflow-y-auto custom-scrollbar">
            {renderBooks("new")}
          </div>
        )}
      </div>
    </div>
  );
}
