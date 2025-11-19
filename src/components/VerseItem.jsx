import React, { useState } from "react";
import { Box, Typography, alpha } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function VerseItem({
  verse,
  isSelected,
  onToggle,
  onWordSearch,
}) {
  const [hoveredWordIndex, setHoveredWordIndex] = useState(null);

  const renderClickableText = () => {
    if (!onWordSearch) return verse.text;

    const words = verse.text.split(/(\s+)/);
    const punctuationSet = new Set(".,;:!?\"'\"\"''—-«»");
    const commonWords = new Set([
      "a", "o", "y", "e", "u", "de", "del", "el", "la", "lo", "las", "los",
      "un", "una", "unos", "unas", "al", "en", "con", "por", "para", "sin",
      "sobre", "entre", "hasta", "ante", "bajo", "cabe", "desde", "es",
      "era", "eres", "soy", "somos", "son", "sea", "sean", "fue", "fueron",
      "ser", "seré", "hay", "haya", "había", "habría", "habla", "hablan",
      "hablaban", "hablará", "que", "cual", "cuales", "quien", "quienes",
      "donde", "cuando", "como", "cuanto", "cuantos",
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

      const isHovered = hoveredWordIndex === index;

      return (
        <span key={index}>
          <span>{leadingPunctuation}</span>
          <span
            onMouseEnter={() => setHoveredWordIndex(index)}
            onMouseLeave={() => setHoveredWordIndex(null)}
            onClick={(e) => {
              e.stopPropagation();
              onWordSearch?.(normalizedWord);
            }}
            style={{
              cursor: "pointer",
              backgroundColor: isHovered ? "#fde68a" : "transparent", // Amber 200
              color: isHovered ? "#92400e" : "inherit",
              borderRadius: "2px",
              transition: "background-color 0.15s ease",
              padding: "0 1px",
            }}
          >
            {cleanWord}
          </span>
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
        gap: { xs: 1, md: 2 },
        py: 0.5,
        px: { xs: 1, md: 2 },
        cursor: "pointer",
        borderRadius: 1,
        position: "relative",
        backgroundColor: isSelected ? "primary.50" : "transparent",
        "&:hover": {
          backgroundColor: isSelected ? "primary.100" : "action.hover",
        },
        transition: "background-color 0.2s ease",
      }}
    >
      {/* Selection Indicator Line */}
      {isSelected && (
        <Box
          sx={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            bgcolor: "primary.main",
            borderTopLeftRadius: 4,
            borderBottomLeftRadius: 4,
          }}
        />
      )}

      {/* Verse Number */}
      <Box
        sx={{
          flexShrink: 0,
          width: 24,
          pt: 0.5,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: isSelected ? "primary.main" : "primary.light",
            fontFamily: "inherit", // Inherit from parent
            fontSize: "0.85rem",
          }}
        >
          {verse.number}
        </Typography>
      </Box>

      {/* Verse Text */}
      <Typography
        variant="body1"
        component="div"
        sx={{
          flex: 1,
          color: isSelected ? "text.primary" : "text.primary",
          fontFamily: "inherit", // Inherit from parent
          fontSize: "inherit", // Inherit from parent
          lineHeight: "inherit", // Inherit from parent
        }}
      >
        {renderClickableText()}
      </Typography>
    </Box>
  );
}
