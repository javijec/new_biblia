import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, IconButton, Tooltip, Fade } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import ShareIcon from "@mui/icons-material/Share";
import VerseItem from "./VerseItem";
import { useSettings } from "../context/SettingsContext";
import { useBookmarks } from "../context/BookmarksContext";

export default function ChapterView({ chapter, onWordSearch }) {
  const [selectedVerses, setSelectedVerses] = useState(new Set());
  const { fontSize } = useSettings();
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
        position: "relative"
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: "center", borderBottom: "1px solid", borderColor: "divider", pb: 2 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            fontFamily: "Georgia, serif",
            color: "primary.main",
            fontWeight: 700
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
                onClick={() => handleVerseClick(verse.number)}
                onWordSearch={onWordSearch}
              />
            </Box>
          );
        })}
      </Box>

      {/* Floating Action Bar for Selection */}
      <Fade in={selectedVerses.size > 0}>
        <Paper
          elevation={4}
          sx={{
            position: "fixed",
            bottom: 32,
            left: "50%",
            transform: "translateX(-50%)",
            bgcolor: "text.primary",
            color: "background.paper",
            px: 3,
            py: 1.5,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            gap: 2,
            zIndex: 1000,
          }}
        >
          <Typography variant="subtitle2" fontWeight="bold">
            {selectedVerses.size}
          </Typography>

          <Box sx={{ height: 24, width: 1, bgcolor: "rgba(255,255,255,0.2)" }} />

          <Tooltip title="Copiar">
            <IconButton
              size="small"
              onClick={handleCopy}
              sx={{ color: "inherit", "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Marcar/Desmarcar">
            <IconButton
              size="small"
              onClick={handleBookmarkSelection}
              sx={{ color: "inherit", "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}
            >
              <BookmarkBorderIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Compartir">
            <IconButton
              size="small"
              onClick={handleShare}
              sx={{ color: "inherit", "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}
            >
              <ShareIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Limpiar selección">
            <IconButton
              size="small"
              onClick={() => setSelectedVerses(new Set())}
              sx={{ color: "inherit", "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}
            >
              <ClearAllIcon fontSize="small" />
            </IconButton>
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
