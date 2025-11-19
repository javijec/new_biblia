import React, { useRef } from "react";
import { Box, Typography, Button, alpha } from "@mui/material";
import BookSelector from "./BookSelector";
import BookmarkIcon from "@mui/icons-material/Bookmark";

export default function Sidebar({
  data,
  onNavigate,
}) {
  const scrollContainerRef = useRef(null);

  const handleTestamentChange = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box sx={{ p: 3, pb: 2, borderBottom: "1px solid", borderColor: "divider" }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "text.primary",
            fontFamily: "Georgia, serif",
          }}
        >
          Navegación
        </Typography>
        <Button
          startIcon={<BookmarkIcon />}
          onClick={() => onNavigate('/bookmarks')}
          fullWidth
          sx={{
            mt: 2,
            justifyContent: "flex-start",
            color: "primary.main",
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
            "&:hover": { bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2) }
          }}
        >
          Mi Biblioteca
        </Button>
      </Box>

      <Box
        ref={scrollContainerRef}
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 2,
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: (theme) => theme.palette.action.hover,
            borderRadius: "3px",
            "&:hover": {
              background: (theme) => theme.palette.action.selected,
            },
          },
        }}
      >
        <BookSelector
          data={data}
          onNavigate={onNavigate}
          onTestamentChange={handleTestamentChange}
        />
      </Box>
    </Box>
  );
}
