import React, { useRef } from "react";
import { Box, Typography, Button } from "@mui/material";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
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

      <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<MailOutlineIcon />}
          component="a"
          href="mailto:javijec@gmail.com?subject=Errores%20o%20sugerencias%20-%20Biblia%20Digital"
          sx={{ justifyContent: "flex-start", textTransform: "none" }}
        >
          Errores o sugerencias
        </Button>
      </Box>
    </Box>
  );
}
