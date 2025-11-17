import React, { useCallback, useEffect } from "react";
import { Box, Typography, Button, Paper, Grid, alpha } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
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
        <Paper
          elevation={3}
          sx={{
            mb: 4,
            p: { xs: 3, md: 4 },
            background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
            border: "2px solid",
            borderColor: "primary.main",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mb: 3,
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "text.primary",
              fontFamily: "Georgia, serif",
            }}
          >
            <SearchIcon /> {searchResults.length} versículos (
            {countWordOccurrences(searchResults, searchResults[0]?.query)}{" "}
            apariciones)
          </Typography>

          <Grid container spacing={2}>
            {searchResults.slice(0, resultsVisible).map((result, idx) => (
              <Grid item xs={12} md={6} key={idx}>
                <Paper
                  elevation={2}
                  onClick={() => {
                    onSelectChapter(result.bookTitle, result.chapter || result);
                    onSearch(null);
                  }}
                  sx={{
                    p: 2.5,
                    cursor: "pointer",
                    borderLeft: "4px solid",
                    borderColor: "primary.main",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 4,
                      background: alpha("#fbbf24", 0.1),
                    },
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      color: "primary.dark",
                      mb: 1,
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
            <Box
              sx={{
                mt: 4,
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
              }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => setResultsVisible((s) => s + 20)}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  background:
                    "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #b45309 0%, #d97706 100%)",
                    transform: "translateY(-2px)",
                    boxShadow: 4,
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Mostrar más
              </Button>
              <Typography
                variant="body1"
                color="text.secondary"
                fontWeight={600}
              >
                {Math.min(resultsVisible, searchResults.length)} de{" "}
                {searchResults.length}
              </Typography>
            </Box>
          )}
        </Paper>
      )}

      {/* Main Content */}
      {!searchResults || searchResults.length === 0 ? (
        <Box sx={{ flex: 1 }}>
          {selectedBook && selectedChapter ? (
            <ChapterView
              chapter={selectedChapter}
              onWordSearch={handleWordSearch}
            />
          ) : selectedBook ? (
            <Paper
              elevation={3}
              sx={{
                p: { xs: 2, md: 2 },
                textAlign: "center",
                border: "2px solid",
                borderColor: "primary.main",
                background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
              }}
            >
              <Typography variant="h6" color="text.primary" fontWeight={600}>
                👆 Selecciona un capítulo para comenzar
              </Typography>
            </Paper>
          ) : (
            <Paper
              elevation={4}
              sx={{
                p: { xs: 2, md: 6 },
                textAlign: "center",
                border: "2px solid",
                borderColor: "primary.main",
                background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
              }}
            >
              <Box sx={{ fontSize: { xs: 64, md: 96 }, mb: 3 }}>📚</Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  fontFamily: "Georgia, serif",
                  color: "text.primary",
                  fontSize: { xs: "2rem", md: "3rem" },
                }}
              >
                Bienvenido a Biblia Digital
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  mb: 4,
                  maxWidth: 600,
                  mx: "auto",
                  lineHeight: 1.8,
                  fontSize: { xs: "1rem", md: "1.1rem" },
                }}
              >
                Selecciona un libro en el menú lateral para comenzar a explorar
              </Typography>
              <Paper
                elevation={2}
                sx={{
                  p: { xs: 3, md: 4 },
                  border: "2px solid",
                  borderColor: "primary.light",
                  maxWidth: 500,
                  mx: "auto",
                  background: alpha("#fff", 0.7),
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    fontFamily: "Georgia, serif",
                    color: "text.primary",
                  }}
                >
                  ✨ Versión: Biblia del Pueblo de Dios
                </Typography>
              </Paper>
            </Paper>
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
          backgroundColor: "#fef08a",
          padding: "2px 4px",
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
