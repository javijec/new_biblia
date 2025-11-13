import React, { useState } from 'react';
import VerseItem from './VerseItem';

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
      .filter(v => selectedVerses.has(v.number))
      .map(v => `${v.number} ${v.text}`)
      .join('\n');

    navigator.clipboard.writeText(selectedText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (!chapter || !chapter.verses) {
    return (
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg">
        <p className="text-slate-500 dark:text-slate-400">No hay capítulo seleccionado</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 text-white p-6">
        <h1 className="text-3xl font-bold">
          {chapter.bookTitle} {chapter.chapterNumber || chapter.number}
        </h1>
        <p className="text-blue-100 mt-2">
          📖 {(chapter.verses || []).length} versículos
        </p>
      </div>

      {/* Toolbar */}
      <div className="border-b border-slate-200 dark:border-slate-700 p-4 flex flex-wrap gap-3 bg-slate-50 dark:bg-slate-700/30">
        <button
          onClick={copySelected}
          disabled={selectedVerses.size === 0}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
            selectedVerses.size === 0
              ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
              : copySuccess
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg text-white'
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
            className="px-4 py-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 rounded-lg font-medium text-sm transition-colors"
          >
            ✕ Limpiar selección
          </button>
        )}

        <div className="ml-auto text-slate-600 dark:text-slate-400 text-sm flex items-center">
          {selectedVerses.size > 0 && <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full font-semibold">{selectedVerses.size} seleccionados</span>}
        </div>
      </div>

      {/* Content */}
      <div className="p-2  max-h-[65vh] overflow-y-auto custom-scrollbar">
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
      <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-700/30 text-sm text-slate-600 dark:text-slate-400">
        <p className="flex items-center gap-2">
          <span>💡</span>
          Haz clic en los versículos para seleccionarlos
        </p>
      </div>
    </div>
  );
}
