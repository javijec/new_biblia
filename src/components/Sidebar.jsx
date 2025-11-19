import React, { useRef } from "react";
import { Box, Typography } from "@mui/material";
import BookSelector from "./BookSelector";

export default function Sidebar({
  data,
  selectedBook,
  onSelectBook,
  onSelectChapter,
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
        <Typography variant="caption" color="text.secondary">
          Selecciona un libro para leer
        </Typography>
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
            background: "rgba(0,0,0,0.1)",
            borderRadius: "3px",
            "&:hover": {
              background: "rgba(0,0,0,0.2)",
            },
          },
        }}
      >
        <BookSelector
          data={data}
          selectedBook={selectedBook}
          onSelectBook={onSelectBook}
          onSelectChapter={onSelectChapter}
          onTestamentChange={handleTestamentChange}
        />
      </Box>
    </Box>
  );
}
