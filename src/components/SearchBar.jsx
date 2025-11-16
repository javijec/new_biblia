import React, { useState, useEffect, useCallback, useRef } from "react";
import { useBibleSearch } from "../hooks/useBibleSearch";

export default function SearchBar({
  data,
  onSearch,
  clearOnChapterSelect,
  initialTerm = "",
}) {
  const [searchTerm, setSearchTerm] = useState(initialTerm);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);
  const { searchAllBooks } = useBibleSearch();

  const doSearch = useCallback(
    async (term) => {
      if (!term || !term.trim()) {
        onSearch(null);
        return;
      }

      setSearching(true);
      const results = await searchAllBooks(term, (progress) => {
        // Actualizar resultados progresivamente
        if (progress.results.length > 0) {
          onSearch(progress.results);
        }
      });
      setSearching(false);
      onSearch(results);
    },
    [searchAllBooks, onSearch]
  );

  // Actualizar término si viene de un botón de palabra en versículo
  useEffect(() => {
    if (initialTerm && initialTerm !== searchTerm) {
      setSearchTerm(initialTerm);
      doSearch(initialTerm);
    }
  }, [initialTerm, doSearch]);

  // Limpiar búsqueda cuando se selecciona un capítulo
  useEffect(() => {
    if (clearOnChapterSelect) {
      setSearchTerm("");
      onSearch(null);
    }
  }, [clearOnChapterSelect, onSearch]);

  // Enfocar input cuando se abre la búsqueda
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Debounce effect: run search when searchTerm changes after delay
  useEffect(() => {
    // clear previous timer
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // if empty -> clear results
    if (!searchTerm || !searchTerm.trim()) {
      // small delay to avoid flicker when typing quickly
      debounceRef.current = setTimeout(() => onSearch(null), 150);
      return () => clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => doSearch(searchTerm), 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchTerm, doSearch, onSearch]);

  // helper: immediate clear
  const handleClear = () => {
    setSearchTerm("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onSearch(null);
  };

  return (
    <div className="mb-0">
      <div className="relative">
        <div className="flex gap-2 sm:gap-3">
          <div className="grow relative">
            <div className="absolute left-3 sm:left-4 top-2 sm:top-3 text-white/70 pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              ref={inputRef}
              type="text"
              placeholder="Busca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-10 py-2.5 sm:py-3 lg:py-4 border-2 border-white/30 bg-white/20 backdrop-blur-sm text-white placeholder-white/60 rounded-lg focus:outline-none focus:border-white focus:bg-white/30 transition-colors font-medium text-sm sm:text-base"
            />
            {searching && (
              <div className="absolute right-10 sm:right-12 top-2.5 sm:top-3">
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
          <button
            onClick={handleClear}
            className="shrink-0 px-3 sm:px-4 py-2.5 sm:py-3 lg:py-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg font-medium transition-all text-sm sm:text-base hover-lift"
            title="Limpiar búsqueda"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
