import React, { useState } from 'react';

export default function VerseItem({ verse, isSelected, onToggle, onWordSearch }) {
  const [showWordMenu, setShowWordMenu] = useState(false);

  // Extraer palabras del versículo (solo palabras de más de 2 caracteres)
  const words = verse.text
    .split(/\s+/)
    .filter(word => word.length > 2)
    .map(word => word.replace(/[.,;:!?""''—-]/g, ''))
    .filter((word, index, self) => word.length > 0 && self.indexOf(word) === index) // Remover duplicados
    .sort();

  const handleWordClick = (word) => {
    setShowWordMenu(false);
    onWordSearch?.(word);
  };

  return (
    <div
      className={`flex gap-2 p-1 rounded-lg cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-l-4 border-blue-600 shadow-md'
          : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 border-l-4 border-transparent'
      }`}
      onClick={() => onToggle(verse.number)}
    >
      {/* Verse Number */}
      <div className="flex-shrink-0 font-bold text-blue-600 dark:text-blue-400 w-10 text-lg flex items-start justify-center pt-1">
        {verse.number}
      </div>

      {/* Verse Text */}
      <div className="flex-grow text-slate-800 dark:text-slate-200 leading-relaxed">
        {verse.text}
      </div>

      {/* Word Search Button */}
      {onWordSearch && (
        <div className="flex-shrink-0 relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowWordMenu(!showWordMenu);
            }}
            className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-blue-600 dark:text-blue-400"
            title="Buscar palabra en este versículo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Word Menu */}
          {showWordMenu && words.length > 0 && (
            <div className="absolute right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto min-w-max">
              {words.map((word) => (
                <button
                  key={word}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWordClick(word);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-slate-800 dark:text-slate-200 text-sm transition-colors"
                >
                  {word}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selection indicator */}
      {isSelected && (
        <div className="flex-shrink-0 flex items-start justify-center pt-1">
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">✓</span>
          </div>
        </div>
      )}
    </div>
  );
}
