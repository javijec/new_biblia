import React, { useState } from "react";
import { Box, Typography, alpha } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

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
      sx={{
        display: "flex",
        gap: { xs: 1.5, md: 2 },
        py: 1,
        px: { xs: 1, md: 2 },
        borderRadius: 2,
        position: "relative",
        backgroundColor: isSelected ? "primary.50" : "transparent",
        transition: "all 0.2s ease",
        "&:hover": {
          backgroundColor: isSelected ? "primary.100" : "action.hover",
          "& .selection-indicator": {
            opacity: 1,
            transform: "scale(1)",
          }
        },
      }}
    >
      {/* Verse Number & Text */}
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: "inline", mr: 1 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: "primary.main",
              fontSize: "0.85rem",
              verticalAlign: "text-top",
            }}
          >
            {verse.number}
          </Typography>
        </Box>

        <Typography
          variant="body1"
          component="span"
          sx={{
            color: "text.primary",
            fontSize: "1.05rem",
            lineHeight: 1.7,
          }}
        >
          {renderClickableText()}
        </Typography>
      </Box>

      {/* Selection Indicator Area */}
      <Box
        onClick={() => onToggle(verse.number)}
        sx={{
          pt: 0.5,
          cursor: "pointer",
          display: "flex",
          alignItems: "flex-start",
          color: isSelected ? "primary.main" : "text.disabled",
          "&:hover": {
            color: "primary.main",
          }
        }}
      >
        {isSelected ? (
          <CheckCircleIcon sx={{ fontSize: 22 }} />
        ) : (
          <RadioButtonUncheckedIcon
            className="selection-indicator"
            sx={{
              fontSize: 22,
              opacity: { xs: 1, md: 0.5 }, // Always visible on mobile, semi-transparent on desktop until hover
              transition: "all 0.2s ease"
            }}
          />
        )}
      </Box>
    </Box>
  );
}
