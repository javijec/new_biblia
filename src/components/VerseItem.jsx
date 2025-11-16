import React, { useState } from "react";

export default function VerseItem({
  verse,
  isSelected,
  onToggle,
  onWordSearch,
}) {
  const [highlightedWord, setHighlightedWord] = useState(null);

  // Renderizar el texto con palabras clickeables
  const renderClickableText = () => {
    if (!onWordSearch) return verse.text;

    const words = verse.text.split(/(\s+)/); // Mantener espacios
    const punctuationSet = new Set(".,;:!?\"'\"\"''—-«»");
    // Palabras comunes no seleccionables (conectores, artículos, preposiciones)
    const commonWords = new Set([
      "a",
      "o",
      "y",
      "e",
      "u",
      "de",
      "del",
      "el",
      "la",
      "lo",
      "las",
      "los",
      "un",
      "una",
      "unos",
      "unas",
      "al",
      "en",
      "con",
      "por",
      "para",
      "sin",
      "sobre",
      "entre",
      "hasta",
      "ante",
      "bajo",
      "cabe",
      "desde",
      "es",
      "era",
      "eres",
      "soy",
      "somos",
      "son",
      "sea",
      "sean",
      "fue",
      "fueron",
      "ser",
      "seré",
      "hay",
      "haya",
      "había",
      "habría",
      "habla",
      "hablan",
      "hablaban",
      "hablará",
      "que",
      "cual",
      "cuales",
      "quien",
      "quienes",
      "donde",
      "cuando",
      "como",
      "cuanto",
      "cuantos",
    ]);

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

      // No hacer seleccionables palabras muy cortas o conectores comunes
      if (cleanWord.length <= 2 || commonWords.has(cleanWord.toLowerCase())) {
        return <span key={index}>{word}</span>;
      }

      // Normalizar para búsqueda (remover acentos)
      const normalizedWord = cleanWord
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

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
                ? "bg-amber-400 text-amber-900 shadow-md"
                : "bg-transparent hover:bg-amber-200 text-amber-900 hover:shadow-sm"
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
      className={`flex gap-1.5 sm:gap-2 p-1 sm:p-1.5 rounded-lg cursor-pointer transition-all duration-200 ${
        isSelected
          ? "bg-gradient-to-r from-amber-100 to-orange-100 border-l-2 sm:border-l-4 border-amber-700 shadow-md"
          : "hover:bg-amber-50 border-l-2 sm:border-l-4 border-transparent"
      }`}
      onClick={() => onToggle(verse.number)}
    >
      {/* Verse Number */}
      <div
        className="flex-shrink-0 font-bold text-amber-700 w-7 sm:w-10 text-sm sm:text-lg flex items-start justify-center pt-0.5 sm:pt-1"
        style={{ fontFamily: "Georgia, serif" }}
      >
        {verse.number}
      </div>

      {/* Verse Text */}
      <div className="flex-grow text-amber-900 leading-relaxed text-sm sm:text-base">
        {renderClickableText()}
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="flex-shrink-0 flex items-start justify-center pt-0.5 sm:pt-1">
          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-amber-700 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xs sm:text-sm">✓</span>
          </div>
        </div>
      )}
    </div>
  );
}
