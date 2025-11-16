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
        p: { xs: 2, md: 3 },
        overflow: "hidden",
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
        📚 Libros
      </Typography>
      <Box
        ref={scrollContainerRef}
        sx={{
          flex: 1,
          overflow: "auto",
          pr: 1,
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#fef3c7",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "linear-gradient(180deg, #d97706, #b45309)",
            borderRadius: "4px",
            "&:hover": {
              background: "#92400e",
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
