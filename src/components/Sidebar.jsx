import React, { useRef } from "react";
import { Box, Typography, alpha } from "@mui/material";
import BookSelector from "./BookSelector";

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
