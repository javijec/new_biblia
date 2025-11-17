import React, { useState } from "react";
import { Box, Typography, Chip, alpha } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function VerseItem({
  verse,
  isSelected,
  onToggle,
  onWordSearch,
}) {
  const [highlightedWord, setHighlightedWord] = useState(null);

  const renderClickableText = () => {
    if (!onWordSearch) return verse.text;

    const words = verse.text.split(/(\s+)/);
    const punctuationSet = new Set(".,;:!?\"'\"\"''—-«»");
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
      if (/^\s+$/.test(word)) {
        return <span key={index}>{word}</span>;
      }

      let startIdx = 0;
      let endIdx = word.length;

      while (startIdx < word.length && punctuationSet.has(word[startIdx])) {
        startIdx++;
      }

      while (endIdx > startIdx && punctuationSet.has(word[endIdx - 1])) {
        endIdx--;
      }

      const leadingPunctuation = word.slice(0, startIdx);
      const cleanWord = word.slice(startIdx, endIdx);
      const trailingPunctuation = word.slice(endIdx);

      if (cleanWord.length <= 2 || commonWords.has(cleanWord.toLowerCase())) {
        return <span key={index}>{word}</span>;
      }

      const normalizedWord = cleanWord
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

      return (
        <span key={index}>
          <span>{leadingPunctuation}</span>
          <Chip
            label={cleanWord}
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setHighlightedWord(cleanWord);
              onWordSearch?.(normalizedWord);
            }}
            sx={{
              height: "auto",
              py: 0.2,
              px: 0.5,
              fontSize: "inherit",
              fontFamily: "inherit",
              cursor: "pointer",
              background:
                highlightedWord === cleanWord
                  ? alpha("#fbbf24", 0.9)
                  : "transparent",
              color: "inherit",
              fontWeight: highlightedWord === cleanWord ? 700 : 500,
              border: "none",
              "&:hover": {
                background: alpha("#fbbf24", 0.3),
                transform: "scale(1.02)",
              },
              "& .MuiChip-label": {
                p: 0,
              },
              transition: "all 0.2s ease",
            }}
          />
          <span>{trailingPunctuation}</span>
        </span>
      );
    });
  };

  return (
    <Box
      onClick={() => onToggle(verse.number)}
      sx={{
        display: "flex",
        gap: { xs: 1, md: 1 },
        p: { xs: 1, md: 1 },
        cursor: "pointer",
        borderLeft: "4px solid",
        borderColor: isSelected ? "primary.main" : "transparent",
        background: isSelected
          ? "linear-gradient(90deg, " +
            alpha("#fbbf24", 0.2) +
            " 0%, " +
            alpha("#f59e0b", 0.1) +
            " 100%)"
          : "transparent",
        "&:hover": {
          background: isSelected
            ? "linear-gradient(90deg, " +
              alpha("#fbbf24", 0.3) +
              " 0%, " +
              alpha("#f59e0b", 0.2) +
              " 100%)"
            : alpha("#fef3c7", 0.5),
        },
        transition: "all 0.3s ease",
      }}
    >
      {/* Verse Number */}
      <Box
        sx={{
          flexShrink: 0,
          fontWeight: 700,
          color: "primary.dark",
          width: { xs: 32, md: 40 },
          display: "flex",
          alignItems: "start",
          justifyContent: "center",
          pt: 0.5,
          fontFamily: "Georgia, serif",
          fontSize: { xs: "0.9rem", md: "1.05rem" },
        }}
      >
        {verse.number}
      </Box>

      {/* Verse Text */}
      <Typography
        sx={{
          flex: 1,
          color: "text.primary",
          lineHeight: 1.8,
          fontSize: { xs: "0.95rem", md: "1.05rem" },
          fontFamily: "Georgia, serif",
        }}
      >
        {renderClickableText()}
      </Typography>

      {/* Selection Indicator */}
      {isSelected && (
        <Box
          sx={{
            flexShrink: 0,
            display: "flex",
            alignItems: "start",
            justifyContent: "center",
            pt: 0.5,
          }}
        >
          <CheckCircleIcon
            sx={{
              fontSize: { xs: 24, md: 28 },
              color: "primary.main",
            }}
          />
        </Box>
      )}
    </Box>
  );
}
