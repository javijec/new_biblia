import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Divider,
  alpha,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import InfoIcon from "@mui/icons-material/Info";
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
    return (
      <Paper
        elevation={3}
        sx={{
          p: { xs: 6, md: 8 },
          textAlign: "center",
          border: "2px solid",
          borderColor: "primary.main",
        }}
      >
        <Typography variant="h6" color="text.primary">
          No hay capítulo seleccionado
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={4}
      sx={{
        overflow: "hidden",
        border: "2px solid",
        borderColor: "primary.main",
      }}
    >
      {/* Header */}
<Box
  sx={{
    background: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
    color: "white",
    p: { xs: 3, md: 4 },
    display: "flex",           // 🔥 Nuevo
    justifyContent: "space-between", // 🔥 Nuevo
    alignItems: "center",      // 🔥 Nuevo
    gap: 2                     // (opcional)
  }}
>
  {/* Título a la izquierda */}
  <Typography
    variant="h4"
    sx={{
      fontWeight: 700,
      fontFamily: "Georgia, serif",
      fontSize: { xs: "1.75rem", md: "2.5rem" },
      color: "white",
    }}
  >
    {chapter.bookTitle} {chapter.chapterNumber || chapter.number}
  </Typography>

  {/* Contenedor derecho: botones + chip */}
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 2, // espacio entre botones y chip
    }}
  >
<Button
  variant="contained"
  onClick={copySelected}
  disabled={selectedVerses.size === 0}
  startIcon={copySuccess ? <CheckIcon /> : <ContentCopyIcon />}
  sx={{
    px: { xs: 2, md: 3 },
    py: { xs: 1, md: 1.5 },
    fontWeight: 700,
    background: copySuccess
      ? "#22c55e"
      : selectedVerses.size === 0
        ? "rgba(255,255,255,0.35)"
        : "#ffffff",
    color:
      copySuccess || selectedVerses.size === 0
        ? "white"
        : "#b45309",
    border: selectedVerses.size > 0 ? "2px solid #b45309" : "none",
    "&:hover": {
      background: copySuccess ? "#16a34a" : "#fef3c7",
      transform:
        selectedVerses.size === 0 ? "none" : "translateY(-2px)",
      boxShadow: selectedVerses.size === 0 ? 0 : 4,
    },
    "&:disabled": {
      color: "rgba(0,0,0,0.3)",
    },
    transition: "all 0.3s ease",
  }}
>
  {copySuccess ? `Copiado` : `Copiar (${selectedVerses.size})`}
</Button>


    {selectedVerses.size > 0 && (
<Button
  variant="outlined"
  onClick={() => setSelectedVerses(new Set())}
  startIcon={<ClearIcon />}
  sx={{
    px: { xs: 2, md: 3 },
    py: { xs: 1, md: 1.5 },
    fontWeight: 700,
    borderWidth: 2,
    borderColor: "#fafafa",
    color: "white",
    "&:hover": {
      borderColor: "white",
      background: "rgba(255,255,255,0.15)",
      transform: "translateY(-2px)",
      boxShadow: 3,
    },
    transition: "all 0.3s ease",
  }}
>
  Limpiar
</Button>

    )}

    {selectedVerses.size > 0 && (
      <Chip
        label={selectedVerses.size}
        sx={{
          background: "white",
          color: "#d97706",
          fontWeight: 700,
          fontSize: { xs: "0.9rem", md: "1rem" },
          height: { xs: 32, md: 36 },
          "& .MuiChip-label": {
            px: 2,
          },
        }}
      />
    )}
  </Box>
</Box>

      {/* Content */}
      <Box
        sx={{
          maxHeight: { xs: "60vh", md: "65vh" },
          overflow: "auto",
          "&::-webkit-scrollbar": {
            width: "10px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#fef3c7",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "linear-gradient(180deg, #d97706, #b45309)",
            "&:hover": {
              background: "#92400e",
            },
          },
        }}
      >
        {chapter.verses.map((verse, index) => (
          <React.Fragment key={verse.number}>
            <VerseItem
              verse={verse}
              isSelected={selectedVerses.has(verse.number)}
              onToggle={toggleVerse}
              onWordSearch={onWordSearch}
            />
            {index < chapter.verses.length - 1 && (
              <Divider sx={{ my: 0, opacity: 0.3 }} />
            )}
          </React.Fragment>
        ))}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          borderTop: "2px solid",
          borderColor: "primary.light",
          p: { xs: 2, md: 3 },
          background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <InfoIcon color="primary" fontSize="small" />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: { xs: "none", sm: "block" } }}
          >
            Haz clic en los versículos para seleccionarlos
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: { xs: "block", sm: "none" } }}
          >
            Toca los versículos para seleccionar
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
