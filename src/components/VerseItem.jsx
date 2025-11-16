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
            className={`px-1 rounded font-medium transition-all duration-150 cursor-pointer text-sm sm:text-base ${
              highlightedWord === cleanWord
                ? "bg-amber-400 text-amber-900 shadow-md scale-105"
                : "bg-transparent hover:bg-amber-200 text-amber-900 hover:shadow-sm hover:scale-102"
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
      className={`flex gap-2 sm:gap-3 p-2 sm:p-3 lg:p-4 rounded-lg cursor-pointer transition-all duration-200 hover-lift ${
        isSelected
          ? "bg-linear-to-r from-amber-100 to-orange-100 border-l-2 sm:border-l-4 border-amber-700 shadow-md"
          : "hover:bg-amber-50 border-l-2 sm:border-l-4 border-transparent"
      }`}
      onClick={() => onToggle(verse.number)}
    >
      {/* Verse Number */}
      <div
        className="shrink-0 font-bold text-amber-700 w-8 sm:w-10 lg:w-12 text-sm sm:text-base lg:text-lg flex items-start justify-center pt-0.5 sm:pt-1"
        style={{ fontFamily: "Georgia, serif" }}
      >
        {verse.number}
      </div>

      {/* Verse Text */}
      <div className="grow text-amber-900 leading-relaxed text-sm sm:text-base lg:text-lg">
        {renderClickableText()}
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="shrink-0 flex items-start justify-center pt-0.5 sm:pt-1">
          <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-amber-700 rounded-full flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-xs sm:text-sm">✓</span>
          </div>
        </div>
      )}
    </div>
  );
}
