import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, IconButton, Tooltip, Fade, Divider, alpha } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import ShareIcon from "@mui/icons-material/Share";
import ArrowBackIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIcon from "@mui/icons-material/ArrowForwardIos";
import VerseItem from "./VerseItem";
import { useSettings } from "../context/SettingsContext";
import { useBookmarks } from "../context/BookmarksContext";

export default function ChapterView({
  chapter,
  onWordSearch,
  onPrevChapter,
  onNextChapter,
  hasPrev,
  hasNext
}) {
  const [selectedVerses, setSelectedVerses] = useState(new Set());
  const { fontSize, fontFamily } = useSettings();
  const { toggleBookmark, isBookmarked, addToHistory } = useBookmarks();

  // Reset selection when chapter changes and track history
  useEffect(() => {
    setSelectedVerses(new Set());
    if (chapter) {
      addToHistory(chapter.bookId, chapter.bookTitle, chapter.number);
    }
  }, [chapter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleVerseClick = (verseNumber) => {
    const newSelection = new Set(selectedVerses);
    if (newSelection.has(verseNumber)) {
      newSelection.delete(verseNumber);
    } else {
      newSelection.add(verseNumber);
    }
    setSelectedVerses(newSelection);
  };

  const handleCopy = () => {
    const sortedVerses = [...selectedVerses].sort((a, b) => a - b);
    const textToCopy = sortedVerses
      .map((num) => {
        const verse = chapter.verses.find((v) => v.number === num);
        return `${num}. ${verse.text}`;
      })
      .join("\n");

    const reference = `${chapter.bookTitle} ${chapter.number}:${sortedVerses.join(",")}`;
    navigator.clipboard.writeText(`${reference}\n\n${textToCopy}`);
    setSelectedVerses(new Set());
  };

  const handleBookmarkSelection = () => {
    selectedVerses.forEach(verseNum => {
      const verse = chapter.verses.find(v => v.number === verseNum);
      toggleBookmark(chapter.bookId, chapter.bookTitle, chapter.number, verseNum, verse.text);
    });
    setSelectedVerses(new Set());
  };

  const handleShare = async () => {
    const sortedVerses = [...selectedVerses].sort((a, b) => a - b);
    const textToShare = sortedVerses
      .map((num) => {
        const verse = chapter.verses.find((v) => v.number === num);
        return `${num}. ${verse.text}`;
      })
      .join("\n");

    const reference = `${chapter.bookTitle} ${chapter.number}:${sortedVerses.join(",")}`;
    const fullText = `${reference}\n\n${textToShare}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: reference,
          text: fullText,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      handleCopy(); // Fallback to copy
    }
    setSelectedVerses(new Set());
  };

  if (!chapter) return null;

  const isSelectionMode = selectedVerses.size > 0;

  // Map font family setting to actual CSS font-family
  const getFontFamily = (font) => {
    switch (font) {
      case 'sans': return '"Inter", "Roboto", "Helvetica", "Arial", sans-serif';
      case 'serif': return '"Georgia", "Times New Roman", serif';
      default: return '"Georgia", "Times New Roman", serif';
    }
  };

  const currentFontFamily = getFontFamily(fontFamily);

  return (
    <Paper
      elevation={0}
      sx={{
        maxWidth: 800,
        mx: "auto",
        p: { xs: 2, md: 6 },
        minHeight: "80vh",
        bgcolor: "background.paper",
        borderRadius: 2,
        position: "relative",
        pb: 12 // Extra padding for floating bar
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: "center", borderBottom: "1px solid", borderColor: "divider", pb: 2 }}>
        <Typography
          variant="h5"
          component="h1"
          gutterBottom
          sx={{
            fontFamily: currentFontFamily,
            color: "primary.main",
            fontWeight: 700,
            fontSize: { xs: "1.5rem", md: "2rem" }
          }}
        >
          {chapter.bookTitle} {chapter.number}
        </Typography>
      </Box>

      {/* Verses */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {chapter.verses.map((verse) => {
          const marked = isBookmarked(chapter.bookId, chapter.number, verse.number);
          return (
            <Box
              key={verse.number}
              sx={{
                fontSize: `${fontSize}px`,
                fontFamily: currentFontFamily,
                lineHeight: 1.6,
                position: "relative",
                pr: marked ? 3 : 0
              }}
            >
              {marked && (
                <BookmarkIcon
                  sx={{
                    position: "absolute",
                    right: 0,
                    top: 4,
                    fontSize: 16,
                    color: "primary.light",
                    opacity: 0.5
                  }}
                />
              )}
              <VerseItem
                verse={verse}
                isSelected={selectedVerses.has(verse.number)}
                onToggle={() => handleVerseClick(verse.number)}
                onWordSearch={onWordSearch}
              />
            </Box>
          );
        })}
      </Box>

      {/* Unified Floating Action Bar */}
      <Fade in={true}>
        <Paper
          elevation={4}
          sx={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            bgcolor: "background.paper", // Theme aware
            color: "text.primary", // Theme aware
            border: "1px solid",
            borderColor: "divider",
            px: 2,
            py: 1,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            gap: 1,
            zIndex: 1000,
            minWidth: 200,
            justifyContent: "space-between",
            transition: "all 0.3s ease",
            boxShadow: (theme) => `0 4px 20px ${alpha(theme.palette.common.black, 0.15)}`
          }}
        >
          {/* Previous Chapter Button */}
          <Tooltip title="Capítulo Anterior">
            <span>
              <IconButton
                onClick={onPrevChapter}
                disabled={!hasPrev}
                sx={{
                  color: "primary.main",
                  opacity: hasPrev ? 1 : 0.3,
                  "&:hover": { bgcolor: "action.hover" }
                }}
              >
                <ArrowBackIcon />
              </IconButton>
            </span>
          </Tooltip>

          {/* Center Content: Actions or Spacer */}
          {isSelectionMode ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mx: 1 }}>
              <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

              <Typography variant="subtitle2" fontWeight="bold" sx={{ minWidth: 20, textAlign: "center" }}>
                {selectedVerses.size}
              </Typography>

              <Tooltip title="Copiar">
                <IconButton
                  size="small"
                  onClick={handleCopy}
                  sx={{ color: "text.secondary", "&:hover": { color: "primary.main", bgcolor: "action.hover" } }}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Marcar/Desmarcar">
                <IconButton
                  size="small"
                  onClick={handleBookmarkSelection}
                  sx={{ color: "text.secondary", "&:hover": { color: "primary.main", bgcolor: "action.hover" } }}
                >
                  <BookmarkBorderIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Compartir">
                <IconButton
                  size="small"
                  onClick={handleShare}
                  sx={{ color: "text.secondary", "&:hover": { color: "primary.main", bgcolor: "action.hover" } }}
                >
                  <ShareIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Limpiar selección">
                <IconButton
                  size="small"
                  onClick={() => setSelectedVerses(new Set())}
                  sx={{ color: "text.secondary", "&:hover": { color: "error.main", bgcolor: "action.hover" } }}
                >
                  <ClearAllIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
            </Box>
          ) : (
            <Box sx={{ width: 24 }} /> // Spacer to keep buttons separated
          )}

          {/* Next Chapter Button */}
          <Tooltip title="Siguiente Capítulo">
            <span>
              <IconButton
                onClick={onNextChapter}
                disabled={!hasNext}
                sx={{
                  color: "primary.main",
                  opacity: hasNext ? 1 : 0.3,
                  "&:hover": { bgcolor: "action.hover" }
                }}
              >
                <ArrowForwardIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Paper>
      </Fade>

      {/* Footer Hint */}
      <Box sx={{ mt: 8, pt: 4, borderTop: "1px solid", borderColor: "divider", textAlign: "center", opacity: 0.6 }}>
        <Typography variant="caption" fontStyle="italic">
          Tip: Haz clic en un versículo para seleccionarlo. Haz clic en una palabra para buscarla.
        </Typography>
      </Box>
    </Paper>
  );
}
