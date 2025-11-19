import React, { useCallback, useEffect } from "react";
import { Box, Typography, Button, Paper, Grid, Chip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ChapterView from "./ChapterView";
import { useBibleSearch } from "../hooks/useBibleSearch";
import { verbConjugations, normalizeVerb } from "../hooks/verbConjugations";

export default function MainContent({
  data,
  selectedBook,
  selectedChapter,
  searchResults,
  resultsVisible,
  setResultsVisible,
  onSearch,
  onSelectChapter,
  searchTerm,
}) {
  const { searchAllBooks } = useBibleSearch();

  // Search when searchTerm changes
  useEffect(() => {
    let timeoutId;
    if (searchTerm && searchTerm.trim()) {
      timeoutId = setTimeout(async () => {
        const results = await searchAllBooks(searchTerm);
        onSearch(results);
      }, 500);
    } else {
      onSearch(null);
    }
    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchAllBooks, onSearch]);

  const handleWordSearch = useCallback(
    async (word) => {
      const results = await searchAllBooks(word);
      onSearch(results);
    },
    [searchAllBooks, onSearch]
  );

  const countWordOccurrences = useCallback((results, query) => {
    if (!results || !query) return 0;

    const normalizeText = (str) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const normalizedQuery = normalizeText(query);

    const baseVerb = normalizeVerb(normalizedQuery);
    const allVerbForms = new Set([normalizedQuery]);

    if (baseVerb !== normalizedQuery) {
      Object.entries(verbConjugations).forEach(([conjugation, infinitive]) => {
        if (infinitive === baseVerb) {
          allVerbForms.add(conjugation);
        }
      });
    }
    allVerbForms.add(baseVerb);

    let totalOccurrences = 0;

    results.forEach((result) => {
      const normalizedText = normalizeText(result.text);
      allVerbForms.forEach((form) => {
        const regex = new RegExp(`\\b${form}\\b`, "gi");
        const matches = normalizedText.match(regex);
        if (matches) {
          totalOccurrences += matches.length;
        }
      });
    });

    return totalOccurrences;
  }, []);

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Search Results */}
      {searchResults && searchResults.length > 0 && (
        <Box sx={{ pb: 4 }}>
          <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="h5" color="text.primary">
              Resultados de búsqueda
            </Typography>
            <Chip
              label={`${searchResults.length} versículos`}
              color="primary"
              variant="outlined"
              size="small"
            />
            <Chip
              label={`${countWordOccurrences(searchResults, searchResults[0]?.query)} coincidencias`}
              size="small"
              sx={{ bgcolor: "grey.100" }}
            />
          </Box>

          <Grid container spacing={2}>
            {searchResults.slice(0, resultsVisible).map((result, idx) => (
              <Grid item xs={12} md={6} key={idx}>
                <Paper
                  elevation={0}
                  onClick={() => {
                    onSelectChapter(result.bookTitle, result.chapter || result);
                    onSearch(null);
                  }}
                  sx={{
                    p: 2.5,
                    cursor: "pointer",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    height: "100%",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: "primary.main",
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    },
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: "primary.main",
                      mb: 1,
                      fontWeight: 700,
                      fontFamily: "Georgia, serif",
                    }}
                  >
                    {result.bookTitle} {result.chapterNumber}:
                    {result.verseNumber}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.primary"
                    sx={{
                      fontFamily: "Georgia, serif",
                      lineHeight: 1.6,
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {highlight(result.text, result.query)}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {searchResults.length > resultsVisible && (
            <Box sx={{ mt: 4, textAlign: "center" }}>
              <Button
                variant="outlined"
                size="large"
                onClick={() => setResultsVisible((s) => s + 20)}
                sx={{ px: 4, borderRadius: 8 }}
              >
                Cargar más resultados
              </Button>
            </Box>
          )}
        </Box>
      )}

      {/* Main Content */}
      {!searchResults || searchResults.length === 0 ? (
        <Box sx={{ flex: 1, height: "100%" }}>
          {selectedBook && selectedChapter ? (
            <ChapterView
              chapter={selectedChapter}
              onWordSearch={handleWordSearch}
            />
          ) : (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                opacity: 0.8,
                p: 4,
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: "primary.50",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 3,
                  color: "primary.main",
                }}
              >
                <MenuBookIcon sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="h4" gutterBottom color="text.primary">
                Bienvenido a la Biblia Digital
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mb: 4 }}>
                Selecciona un libro del menú lateral para comenzar tu lectura.
                Puedes buscar palabras específicas o navegar capítulo por capítulo.
              </Typography>
            </Box>
          )}
        </Box>
      ) : null}
    </Box>
  );
}

function highlight(text, query) {
  if (!query || !text) return text;

  const normalizeText = (str) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const normalizedText = normalizeText(text);
  const normalizedQuery = normalizeText(query);

  const baseVerb = normalizeVerb(normalizedQuery);
  const allVerbForms = new Set([normalizedQuery]);

  if (baseVerb !== normalizedQuery) {
    Object.entries(verbConjugations).forEach(([conjugation, infinitive]) => {
      if (infinitive === baseVerb) {
        allVerbForms.add(conjugation);
      }
    });
  }
  allVerbForms.add(baseVerb);

  const regexPattern = Array.from(allVerbForms)
    .map((term) => escapeRegExp(term))
    .join("|");
  const re = new RegExp(`\\b(${regexPattern})\\b`, "gi");

  const matches = [];
  let match;
  while ((match = re.exec(normalizedText)) !== null) {
    matches.push({
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  if (matches.length === 0) return text;

  const result = [];
  let lastIndex = 0;

  matches.forEach((matchPos) => {
    if (matchPos.start > lastIndex) {
      result.push(
        <span key={`text-${lastIndex}`}>
          {text.slice(lastIndex, matchPos.start)}
        </span>
      );
    }

    result.push(
      <mark
        key={`mark-${matchPos.start}`}
        style={{
          backgroundColor: "#fde68a", // Amber 200
          color: "#451a03", // Amber 950
          padding: "0 2px",
          borderRadius: "2px",
          fontWeight: 600,
        }}
      >
        {text.slice(matchPos.start, matchPos.end)}
      </mark>
    );

    lastIndex = matchPos.end;
  });

  if (lastIndex < text.length) {
    result.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex)}</span>);
  }

  return result;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
