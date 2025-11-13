import React, { useMemo, useCallback } from 'react';
import ChapterView from './ChapterView';
import { useBibleSearch } from '../hooks/useBibleSearch';

export default function MainContent({
  data,
  selectedBook,
  selectedChapter,
  searchResults,
  resultsVisible,
  setResultsVisible,
  onSearch,
  onSelectChapter,
  onClearAll
}) {
  const { searchAllBooks } = useBibleSearch();

  // Wrapper para búsqueda de palabras desde versículos
  const handleWordSearch = useCallback(async (word) => {
    const results = await searchAllBooks(word);
    onSearch(results); // Pasar resultados como array
  }, [searchAllBooks, onSearch]);

  return (
    <div className="flex-grow">
      {/* Search Results */}
      {searchResults && searchResults.length > 0 && (
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
          <h2 className="text-lg font-bold mb-4 text-slate-900 dark:text-slate-100">
            🔍 {searchResults.length} versículos encontrados
          </h2>
          <div className="space-y-1">
            {searchResults.slice(0, resultsVisible).map((result, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-800 p-2 rounded-lg border-l-4 border-blue-600 cursor-pointer hover:shadow-md transition-shadow flex items-start gap-3"
                onClick={() => {
                  onSelectChapter(result.bookTitle, result.chapter || result);
                  onSearch(null);
                }}
              >
                <span className="font-bold text-blue-600 dark:text-blue-400 text-sm flex-shrink-0 min-w-max">
                  {result.bookTitle} {result.chapterNumber}:{result.verseNumber}
                </span>
                <p className="text-slate-700 dark:text-slate-300 text-sm line-clamp-1">
                  {highlight(result.text, result.query)}
                </p>
              </div>
            ))}
          </div>
          {searchResults.length > resultsVisible && (
            <div className="mt-4 flex items-center gap-4">
              <button
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
                onClick={() => setResultsVisible((s) => s + 20)}
              >
                Mostrar más
              </button>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                {Math.min(resultsVisible, searchResults.length)} de {searchResults.length}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Main Layout */}
      {!searchResults || searchResults.length === 0 ? (
        <div>
          {selectedBook && selectedChapter ? (
            <ChapterView chapter={selectedChapter} onWordSearch={handleWordSearch} />
          ) : selectedBook ? (
            <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl shadow-lg text-center">
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                👆 Selecciona un capítulo para comenzar
              </p>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 p-12 rounded-2xl shadow-lg text-center border border-blue-200 dark:border-blue-800">
              <div className="mb-4 text-5xl">📚</div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Bienvenido a Biblia Digital
              </p>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Selecciona un libro en el menú lateral para comenzar
              </p>
              <div className="text-slate-600 dark:text-slate-400 space-y-2 bg-white/50 dark:bg-slate-800/50 p-6 rounded-xl">
                <p>✨ Versión: Biblia del Pueblo de Dios</p>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

// Helper to highlight matches (returns an array of React nodes)
function highlight(text, query) {
  if (!query || !text) return text;
  const re = new RegExp(`(${escapeRegExp(query)})`, 'ig');
  const parts = text.split(re);
  return parts.map((part, i) =>
    re.test(part) ? (
      <mark key={i} className="bg-yellow-300 dark:bg-yellow-500/50 px-1 rounded font-semibold">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
}
