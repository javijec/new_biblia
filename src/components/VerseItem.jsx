import React, { useState } from 'react';

export default function VerseItem({ verse, isSelected, onToggle, onWordSearch }) {
  const [highlightedWord, setHighlightedWord] = useState(null);

  // Renderizar el texto con palabras clickeables
  const renderClickableText = () => {
    if (!onWordSearch) return verse.text;

    const words = verse.text.split(/(\s+)/); // Mantener espacios
    const punctuationSet = new Set('.,;:!?"\'""\'\'—-«»');
    
    return words.map((word, index) => {
      // Mantener espacios como está
      if (/^\s+$/.test(word)) {
        return <span key={index}>{word}</span>;
      }

      // Encontrar donde comienza y termina la palabra real (sin puntuación)
      let startIdx = 0;
      let endIdx = word.length;
      
      // Remover puntuación del inicio
      while (startIdx < word.length && punctuationSet.has(word[startIdx])) {
        startIdx++;
      }
      
      // Remover puntuación del final
      while (endIdx > startIdx && punctuationSet.has(word[endIdx - 1])) {
        endIdx--;
      }

      const leadingPunctuation = word.slice(0, startIdx);
      const cleanWord = word.slice(startIdx, endIdx);
      const trailingPunctuation = word.slice(endIdx);
      
      if (cleanWord.length <= 2) {
        return <span key={index}>{word}</span>;
      }

      // Normalizar para búsqueda (remover acentos)
      const normalizedWord = cleanWord.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

      return (
        <span key={index}>
          <span>{leadingPunctuation}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setHighlightedWord(cleanWord);
              onWordSearch?.(normalizedWord);
            }}
            className={`px-0 rounded font-medium transition-all duration-150 cursor-pointer ${
              highlightedWord === cleanWord
                ? 'bg-amber-400 dark:bg-amber-500 text-slate-900 dark:text-white shadow-md'
                : 'bg-transparent hover:bg-amber-200 dark:hover:bg-amber-600/60 text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:shadow-sm'
            }`}
            title="Haz clic para buscar esta palabra"
          >
            {cleanWord}
          </button>
          <span>{trailingPunctuation}</span>
        </span>
      );
    });
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
      <div className="flex-grow text-slate-800 dark:text-slate-200 leading-relaxed text-base">
        {renderClickableText()}
      </div>

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
