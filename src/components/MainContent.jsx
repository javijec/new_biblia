import React, { useMemo, useCallback } from "react";
import ChapterView from "./ChapterView";
import { useBibleSearch } from "../hooks/useBibleSearch";
import { verbConjugations, normalizeVerb } from "../hooks/verbConjugations";

export default function MainContent({
  data,
  selectedBook,
  selectedChapter,
  searchResults,
  resultsVisible,
  setResultsVisible,
  onSearch,
  onSelectChapter,
  onClearAll,
}) {
  const { searchAllBooks } = useBibleSearch();

  // Wrapper para búsqueda de palabras desde versículos
  const handleWordSearch = useCallback(
    async (word) => {
      const results = await searchAllBooks(word);
      onSearch(results); // Pasar resultados como array
    },
    [searchAllBooks, onSearch]
  );

  // Contar apariciones totales de la palabra en los resultados
  const countWordOccurrences = useCallback((results, query) => {
    if (!results || !query) return 0;

    const normalizeText = (str) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const normalizedQuery = normalizeText(query);

    // Obtener todas las formas del verbo si es un verbo conjugado
    const baseVerb = normalizeVerb(normalizedQuery);
    const allVerbForms = new Set([normalizedQuery]);

    if (baseVerb !== normalizedQuery) {
      Object.entries(verbConjugations).forEach(([conjugation, infinitive]) => {
        if (infinitive === baseVerb) {
          allVerbForms.add(conjugation);
        }
      });
    }
    allVerbForms.add(baseVerb);

    let totalOccurrences = 0;

    results.forEach((result) => {
      const normalizedText = normalizeText(result.text);

      // Contar cada forma del verbo en el texto
      allVerbForms.forEach((form) => {
        const regex = new RegExp(`\\b${form}\\b`, "gi");
        const matches = normalizedText.match(regex);
        if (matches) {
          totalOccurrences += matches.length;
        }
      });
    });

    return totalOccurrences;
  }, []);

  return (
    <div className="flex-grow min-w-0">
      {/* Search Results */}
      {searchResults && searchResults.length > 0 && (
        <div className="mb-4 sm:mb-8 bg-gradient-to-r from-amber-50 to-orange-50 p-3 sm:p-6 lg:p-8 rounded-lg sm:rounded-2xl border border-amber-700 sm:border-2 shadow-xl">
          <h2
            className="text-sm sm:text-lg lg:text-2xl font-bold mb-3 sm:mb-4 lg:mb-6 text-amber-900"
            style={{ fontFamily: "Georgia, serif" }}
          >
            🔍 {searchResults.length} versículos (
            {countWordOccurrences(searchResults, searchResults[0]?.query)}{" "}
            apariciones)
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-4">
            {searchResults.slice(0, resultsVisible).map((result, idx) => (
              <div
                key={idx}
                className="bg-white p-2 sm:p-3 lg:p-4 rounded-lg border-l-2 sm:border-l-4 border-amber-700 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-start gap-2 sm:gap-3"
                onClick={() => {
                  onSelectChapter(result.bookTitle, result.chapter || result);
                  onSearch(null);
                }}
              >
                <span
                  className="font-bold text-amber-800 text-xs sm:text-sm lg:text-base flex-shrink-0 min-w-max"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {result.bookTitle} {result.chapterNumber}:{result.verseNumber}
                </span>
                <p className="text-amber-900 text-xs sm:text-sm lg:text-base line-clamp-2 lg:line-clamp-3">
                  {highlight(result.text, result.query)}
                </p>
              </div>
            ))}
          </div>
          {searchResults.length > resultsVisible && (
            <div className="mt-3 sm:mt-4 lg:mt-6 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
              <button
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-700 to-orange-700 text-white rounded-lg font-medium hover:shadow-xl hover:scale-105 transition-all duration-200 text-sm lg:text-base"
                onClick={() => setResultsVisible((s) => s + 20)}
              >
                Mostrar más
              </button>
              <p className="text-amber-800 text-xs sm:text-sm lg:text-base font-medium">
                {Math.min(resultsVisible, searchResults.length)} de{" "}
                {searchResults.length}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Main Layout */}
      {!searchResults || searchResults.length === 0 ? (
        <div>
          {selectedBook && selectedChapter ? (
            <ChapterView
              chapter={selectedChapter}
              onWordSearch={handleWordSearch}
            />
          ) : selectedBook ? (
            <div className="bg-amber-50 p-6 sm:p-12 lg:p-16 rounded-lg sm:rounded-2xl shadow-xl text-center border border-amber-700 sm:border-2">
              <p className="text-amber-900 text-sm sm:text-lg lg:text-xl">
                👆 Selecciona un capítulo para comenzar
              </p>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 sm:p-12 lg:p-20 rounded-lg sm:rounded-2xl shadow-xl text-center border border-amber-700 sm:border-2">
              <div className="mb-3 sm:mb-4 lg:mb-6 text-3xl sm:text-5xl lg:text-7xl">
                📚
              </div>
              <p
                className="text-lg sm:text-2xl lg:text-4xl font-bold text-amber-900 mb-2 lg:mb-4"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Bienvenido a Biblia Digital
              </p>
              <p className="text-amber-800 dark:text-slate-400 mb-4 sm:mb-6 lg:mb-8 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">
                Selecciona un libro en el menú lateral para comenzar
              </p>
              <div className="text-amber-900 space-y-2 lg:space-y-3 bg-white/70 p-4 sm:p-6 lg:p-8 rounded-lg sm:rounded-xl border border-amber-700 max-w-xl mx-auto">
                <p
                  className="text-sm sm:text-base lg:text-lg"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  ✨ Versión: Biblia del Pueblo de Dios
                </p>
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

  // Normalizar tanto el texto como la query para comparación
  const normalizeText = (str) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const normalizedText = normalizeText(text);
  const normalizedQuery = normalizeText(query);

  // Obtener todas las formas del verbo si es un verbo conjugado
  const baseVerb = normalizeVerb(normalizedQuery);
  const allVerbForms = new Set([normalizedQuery]);

  // Si es un verbo, agregar todas sus conjugaciones
  if (baseVerb !== normalizedQuery) {
    // Buscar todas las conjugaciones que mapean a este infinitivo
    Object.entries(verbConjugations).forEach(([conjugation, infinitive]) => {
      if (infinitive === baseVerb) {
        allVerbForms.add(conjugation);
      }
    });
  }
  allVerbForms.add(baseVerb);

  // Crear regex para buscar cualquier forma del verbo
  const regexPattern = Array.from(allVerbForms)
    .map((term) => escapeRegExp(term))
    .join("|");
  const re = new RegExp(`\\b(${regexPattern})\\b`, "gi");

  // Encontrar todas las coincidencias
  const matches = [];
  let match;
  while ((match = re.exec(normalizedText)) !== null) {
    matches.push({
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  if (matches.length === 0) return text;

  // Reconstruir el texto con resaltados
  const result = [];
  let lastIndex = 0;

  matches.forEach((matchPos) => {
    // Agregar texto antes del match
    if (matchPos.start > lastIndex) {
      result.push(
        <span key={`text-${lastIndex}`}>
          {text.slice(lastIndex, matchPos.start)}
        </span>
      );
    }

    // Agregar texto resaltado
    result.push(
      <mark
        key={`mark-${matchPos.start}`}
        className="bg-yellow-300 dark:bg-yellow-500/50 px-1 rounded font-semibold"
      >
        {text.slice(matchPos.start, matchPos.end)}
      </mark>
    );

    lastIndex = matchPos.end;
  });

  // Agregar texto restante
  if (lastIndex < text.length) {
    result.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex)}</span>);
  }

  return result;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
}
