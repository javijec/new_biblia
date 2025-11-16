import React, { useState } from "react";
import VerseItem from "./VerseItem";

export default function ChapterView({ chapter, onWordSearch }) {
  const [selectedVerses, setSelectedVerses] = useState(new Set());
  const [copySuccess, setCopySuccess] = useState(false);

  const toggleVerse = (verseNum) => {
    const newSelected = new Set(selectedVerses);
    if (newSelected.has(verseNum)) {
      newSelected.delete(verseNum);
    } else {
      newSelected.add(verseNum);
    }
    setSelectedVerses(newSelected);
  };

  const copySelected = () => {
    if (selectedVerses.size === 0) return;

    const selectedText = chapter.verses
      .filter((v) => selectedVerses.has(v.number))
      .map((v) => `${v.number} ${v.text}`)
      .join("\n");

    navigator.clipboard.writeText(selectedText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (!chapter || !chapter.verses) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-amber-700">
        <p className="text-amber-900">No hay capítulo seleccionado</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg sm:rounded-2xl shadow-xl overflow-hidden border border-amber-700 sm:border-2">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-700 to-orange-700 text-white p-3 sm:p-6 lg:p-8">
        <h1
          className="text-xl sm:text-2xl lg:text-4xl font-bold"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {chapter.bookTitle} {chapter.chapterNumber || chapter.number}
        </h1>
      </div>

      {/* Toolbar */}
      <div className="border-b border-amber-300 p-2 sm:p-4 lg:p-6 flex flex-wrap gap-2 sm:gap-3 lg:gap-4 bg-amber-50">
        <button
          onClick={copySelected}
          disabled={selectedVerses.size === 0}
          className={`px-3 py-1.5 sm:px-4 sm:py-2 lg:px-6 lg:py-3 rounded-lg font-medium text-xs sm:text-sm lg:text-base transition-all flex items-center gap-1.5 sm:gap-2 ${
            selectedVerses.size === 0
              ? "bg-amber-200 text-amber-700 cursor-not-allowed"
              : copySuccess
                ? "bg-green-600 hover:bg-green-700 text-white shadow-lg"
                : "bg-gradient-to-r from-amber-700 to-orange-700 hover:shadow-xl hover:scale-105 text-white"
          }`}
        >
          {copySuccess ? (
            <>
              <span>✓</span> Copiado
            </>
          ) : (
            <>
              <span>📋</span> Copiar ({selectedVerses.size})
            </>
          )}
        </button>

        {selectedVerses.size > 0 && (
          <button
            onClick={() => setSelectedVerses(new Set())}
            className="px-3 py-1.5 sm:px-4 sm:py-2 lg:px-6 lg:py-3 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg font-medium text-xs sm:text-sm lg:text-base transition-all hover:shadow-md"
          >
            ✕ Limpiar
          </button>
        )}

        <div className="ml-auto text-amber-700 text-xs sm:text-sm lg:text-base flex items-center">
          {selectedVerses.size > 0 && (
            <span className="bg-amber-100 text-amber-700 px-2 sm:px-3 lg:px-4 py-1 lg:py-2 rounded-full font-semibold">
              {selectedVerses.size}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-2 sm:p-3 lg:p-6 max-h-[60vh] sm:max-h-[65vh] lg:max-h-[70vh] overflow-y-auto custom-scrollbar">
        {chapter.verses.map((verse) => (
          <VerseItem
            key={verse.number}
            verse={verse}
            isSelected={selectedVerses.has(verse.number)}
            onToggle={toggleVerse}
            onWordSearch={onWordSearch}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-amber-300 p-2 sm:p-4 lg:p-6 bg-amber-50 text-xs sm:text-sm lg:text-base text-amber-800">
        <p className="flex items-center gap-2">
          <span>💡</span>
          <span className="hidden sm:inline">
            Haz clic en los versículos para seleccionarlos
          </span>
          <span className="sm:hidden">
            Toca los versículos para seleccionar
          </span>
        </p>
      </div>
    </div>
  );
}
