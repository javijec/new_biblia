import React from "react";
import { Box, Typography, Paper, IconButton, Tooltip, Fade, Divider, alpha } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import ShareIcon from "@mui/icons-material/Share";
import ArrowBackIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIcon from "@mui/icons-material/ArrowForwardIos";
import VerseItem from "./VerseItem";
import { useSettings } from "../context/SettingsContext";
import { useSelection } from "../context/SelectionContext";
import { getAbbreviation } from "../utils/bookAbbreviations";

export default function ChapterView({
  chapter,
  onWordSearch,
  onPrevChapter,
  onNextChapter,
  hasPrev,
  hasNext
}) {
  const { fontSize, fontFamily } = useSettings();
  const { toggleSelection, isSelected, clearSelection, getSelectedVerses, selectionCount } = useSelection();

  const handleVerseClick = (verse) => {
    toggleSelection({
      bookId: chapter.bookId,
      bookTitle: chapter.bookTitle,
      chapterNumber: chapter.number,
      verseNumber: verse.number,
      text: verse.text
    });
  };

  const formatSelectionForExport = () => {
    const verses = getSelectedVerses();

    // Group by Book
    const versesByBook = {};
    verses.forEach(v => {
      if (!versesByBook[v.bookTitle]) versesByBook[v.bookTitle] = [];
      versesByBook[v.bookTitle].push(v);
    });

    let exportBlocks = [];

    Object.entries(versesByBook).forEach(([bookTitle, bookVerses]) => {
      // Sort by chapter then verse
      bookVerses.sort((a, b) => {
        if (a.chapterNumber !== b.chapterNumber) return a.chapterNumber - b.chapterNumber;
        return a.verseNumber - b.verseNumber;
      });

      // Build continuous blocks
      const blocks = [];
      let currentBlock = [bookVerses[0]];

      for (let i = 1; i < bookVerses.length; i++) {
        const prev = bookVerses[i - 1];
        const curr = bookVerses[i];

        const isSameChapterConsecutive = curr.chapterNumber === prev.chapterNumber && curr.verseNumber === prev.verseNumber + 1;
        const isNextChapterStart = curr.chapterNumber === prev.chapterNumber + 1 && curr.verseNumber === 1;

        if (isSameChapterConsecutive || isNextChapterStart) {
          currentBlock.push(curr);
        } else {
          blocks.push(currentBlock);
          currentBlock = [curr];
        }
      }
      blocks.push(currentBlock);

      // Format each block
      blocks.forEach(block => {
        const start = block[0];
        const end = block[block.length - 1];
        const abbr = getAbbreviation(bookTitle);

        let header = "";
        if (start.chapterNumber === end.chapterNumber) {
          // Single chapter: "Gn 1:1-3" or "Gn 1:1"
          const range = start.verseNumber === end.verseNumber
            ? `${start.verseNumber}`
            : `${start.verseNumber}-${end.verseNumber}`;
          header = `${abbr} ${start.chapterNumber}:${range}`;
        } else {
          // Multi chapter: "Gn 1:31-2:3"
          header = `${abbr} ${start.chapterNumber}:${start.verseNumber}-${end.chapterNumber}:${end.verseNumber}`;
        }

        // Format text lines
        const textLines = block.map(v => {
          // Only show (Book Chapter) suffix if we are crossing chapters to avoid confusion? 
          // Or just keep it simple: "Number. Text"
          // User asked for: "10. Text... (GENESIS 25)" in previous prompt, but then "con todo los versiculos abajo" in the latest.
          // Let's stick to "Number. Text" to keep it clean, as the header explains the range.
          // BUT, if crossing chapters, we might want to indicate where the new chapter starts in the text?
          // Example:
          // 31. Text...
          // 1. Text...
          // It's implicit.
          return `${v.verseNumber}. ${v.text}`;
        });

        exportBlocks.push(`${header}\n${textLines.join("\n")}`);
      });
    });

    return {
      text: exportBlocks.join("\n\n")
    };
  };

  const handleCopy = () => {
    const { text } = formatSelectionForExport();
    navigator.clipboard.writeText(text);
    clearSelection();
  };

  const handleShare = async () => {
    const { text } = formatSelectionForExport();

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Versículos Bíblicos",
          text: text,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      handleCopy(); // Fallback to copy
    }
    clearSelection();
  };

  if (!chapter) return null;

  const isSelectionMode = selectionCount > 0;

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
          return (
            <Box
              key={verse.number}
              sx={{
                fontSize: `${fontSize}px`,
                fontFamily: currentFontFamily,
                lineHeight: 1.6,
                position: "relative",
              }}
            >
              <VerseItem
                verse={verse}
                isSelected={isSelected(chapter.bookId, chapter.number, verse.number)}
                onToggle={() => handleVerseClick(verse)}
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
                {selectionCount}
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
                  onClick={clearSelection}
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
