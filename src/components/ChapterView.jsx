import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Divider,
  Fade,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import VerseItem from "./VerseItem";

export default function ChapterView({ chapter, onWordSearch }) {
  const [selectedVerses, setSelectedVerses] = useState(new Set());
  const [copySuccess, setCopySuccess] = useState(false);

  const toggleVerse = (verseNum) => {
    const newSelected = new Set(selectedVerses);
    if (newSelected.has(verseNum)) {
      newSelected.delete(verseNum);
    } else {
      newSelected.add(verseNum);
    }
    setSelectedVerses(newSelected);
  };

  const copySelected = () => {
    if (selectedVerses.size === 0) return;

    const selectedText = chapter.verses
      .filter((v) => selectedVerses.has(v.number))
      .map((v) => `${v.number} ${v.text}`)
      .join("\n");

    navigator.clipboard.writeText(selectedText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (!chapter || !chapter.verses) {
    return null;
  }

  return (
    <Paper
      elevation={0}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "white",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: { xs: 2, md: 4 },
          pb: { xs: 2, md: 2 },
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
          bgcolor: "#fffcf5", // Very subtle warm background for header
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              color: "secondary.main",
              mb: 0.5,
            }}
          >
            {chapter.bookTitle} {chapter.chapterNumber || chapter.number}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {chapter.verses.length} versículos
          </Typography>
        </Box>

        {/* Actions */}
        <Fade in={selectedVerses.size > 0}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              color="inherit"
              onClick={() => setSelectedVerses(new Set())}
              startIcon={<ClearIcon />}
              sx={{ borderColor: "divider" }}
            >
              Limpiar
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={copySelected}
              startIcon={copySuccess ? <CheckIcon /> : <ContentCopyIcon />}
              color={copySuccess ? "success" : "primary"}
              sx={{ color: "white" }}
            >
              {copySuccess ? "Copiado" : `Copiar (${selectedVerses.size})`}
            </Button>
          </Box>
        </Fade>
      </Box>

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: { xs: 1, md: 2 },
          scrollBehavior: "smooth",
        }}
      >
        <Box sx={{ maxWidth: "800px", mx: "auto" }}>
          {chapter.verses.map((verse) => (
            <VerseItem
              key={verse.number}
              verse={verse}
              isSelected={selectedVerses.has(verse.number)}
              onToggle={toggleVerse}
              onWordSearch={onWordSearch}
            />
          ))}
        </Box>

        <Box sx={{ mt: 8, mb: 4, textAlign: "center", opacity: 0.5 }}>
          <Typography variant="caption" sx={{ fontStyle: "italic" }}>
            Fin del capítulo
          </Typography>
        </Box>
      </Box>

      {/* Footer Hint */}
      {selectedVerses.size === 0 && (
        <Box
          sx={{
            p: 1,
            bgcolor: "grey.50",
            borderTop: "1px solid",
            borderColor: "divider",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
          }}
        >
          <InfoOutlinedIcon fontSize="small" color="action" sx={{ fontSize: 16 }} />
          <Typography variant="caption" color="text.secondary">
            Haz clic en un versículo para seleccionarlo o en una palabra para buscarla
          </Typography>
        </Box>
      )}
    </Paper>
  );
}
