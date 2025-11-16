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
      <div className="bg-white p-6 sm:p-8 lg:p-12 rounded-2xl shadow-lg border-2 border-amber-700">
        <p className="text-amber-900 text-center text-lg">
          No hay capítulo seleccionado
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg sm:rounded-2xl shadow-xl overflow-hidden border border-amber-700 sm:border-2 hover-lift">
      {/* Header */}
      <div className="bg-linear-to-r from-amber-700 to-orange-700 text-white p-4 sm:p-6 lg:p-8">
        <h1
          className="text-2xl sm:text-3xl lg:text-4xl font-bold"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {chapter.bookTitle} {chapter.chapterNumber || chapter.number}
        </h1>
      </div>

      {/* Toolbar */}
      <div className="border-b-2 border-amber-200 p-3 sm:p-4 lg:p-6 flex flex-wrap gap-2 sm:gap-3 lg:gap-4 bg-linear-to-r from-amber-50 to-orange-50">
        <button
          onClick={copySelected}
          disabled={selectedVerses.size === 0}
          className={`px-4 py-2 sm:px-6 sm:py-3 lg:px-8 lg:py-4 rounded-lg font-medium text-sm sm:text-base lg:text-lg transition-all flex items-center gap-2 hover-lift ${
            selectedVerses.size === 0
              ? "bg-amber-200 text-amber-700 cursor-not-allowed"
              : copySuccess
                ? "bg-green-600 hover:bg-green-700 text-white shadow-lg"
                : "bg-linear-to-r from-amber-700 to-orange-700 hover:shadow-xl text-white"
          }`}
        >
          {copySuccess ? (
            <>
              <span className="text-lg">✓</span> Copiado
            </>
          ) : (
            <>
              <span className="text-lg">📋</span> Copiar ({selectedVerses.size})
            </>
          )}
        </button>

        {selectedVerses.size > 0 && (
          <button
            onClick={() => setSelectedVerses(new Set())}
            className="px-4 py-2 sm:px-6 sm:py-3 lg:px-8 lg:py-4 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg font-medium text-sm sm:text-base lg:text-lg transition-all hover:shadow-md hover-lift"
          >
            ✕ Limpiar
          </button>
        )}

        <div className="ml-auto text-amber-700 text-sm sm:text-base lg:text-lg flex items-center">
          {selectedVerses.size > 0 && (
            <span className="bg-amber-100 text-amber-900 px-3 sm:px-4 lg:px-5 py-2 lg:py-3 rounded-full font-bold text-sm sm:text-base">
              {selectedVerses.size}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 lg:p-8 max-h-[60vh] sm:max-h-[65vh] lg:max-h-[70vh] overflow-y-auto custom-scrollbar space-y-2 lg:space-y-3">
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
      <div className="border-t-2 border-amber-200 p-3 sm:p-4 lg:p-6 bg-linear-to-r from-amber-50 to-orange-50 text-sm sm:text-base lg:text-lg text-amber-800">
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
