import React, { useState } from "react";
import { useBible } from "../context/BibleContext";
import {
  Box,
  Collapse,
  TextField,
  Typography,
  IconButton,
  Chip,
  CircularProgress,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";

export default function BookSelector({
  data,
  onNavigate,
  onTestamentChange,
}) {
  const [expandedTestament, setExpandedTestament] = useState("old");
  const [expandedBooks, setExpandedBooks] = useState(new Set());
  const [bookChapters, setBookChapters] = useState({});
  const [loadingBook, setLoadingBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { loadBook } = useBible();

  const loadBookChapters = async (bookId) => {
    if (bookChapters[bookId]) {
      return bookChapters[bookId];
    }

    setLoadingBook(bookId);
    try {
      const book = await loadBook(bookId);
      if (book && book.chapters) {
        setBookChapters((prev) => ({ ...prev, [bookId]: book.chapters }));
      }
    } catch (error) {
      console.error(`Error cargando capítulos del libro ${bookId}:`, error);
    }
    setLoadingBook(null);
  };

  const filterBooks = (books) => {
    if (!searchTerm.trim()) return books;
    const term = searchTerm.toLowerCase();
    return books.filter((book) => book.name.toLowerCase().includes(term));
  };

  const renderBooks = (testament) => {
    const books = filterBooks(data.testaments[testament] || []);

    if (books.length === 0) {
      return (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ p: 2, textAlign: "center", fontStyle: "italic" }}
        >
          No se encontraron libros
        </Typography>
      );
    }

    return (
      <List disablePadding>
        {books.map((book) => {
          const chapters = bookChapters[book.id] || [];
          const bookName = book.name;
          const isExpanded = expandedBooks.has(book.id);
          const isLoading = loadingBook === book.id;

          return (
            <Box key={book.id} sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  const next = new Set(expandedBooks);
                  if (next.has(book.id)) {
                    next.delete(book.id);
                  } else {
                    next.add(book.id);
                    loadBookChapters(book.id);
                  }
                  setExpandedBooks(next);
                }}
                selected={isExpanded}
                sx={{
                  borderRadius: 1,
                  py: 1,
                  "&.Mui-selected": {
                    bgcolor: "primary.50",
                    color: "primary.main",
                    "&:hover": {
                      bgcolor: "primary.100",
                    },
                  },
                }}
              >
                <ListItemText
                  primary={bookName}
                  primaryTypographyProps={{
                    fontWeight: isExpanded ? 700 : 500,
                    fontSize: "0.95rem",
                  }}
                />
                {isExpanded ? (
                  <ExpandLessIcon fontSize="small" color="primary" />
                ) : (
                  <ExpandMoreIcon fontSize="small" color="action" />
                )}
              </ListItemButton>

              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1, mt: 0.5 }}>
                  {isLoading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(40px, 1fr))",
                        gap: 1,
                      }}
                    >
                      {chapters
                        .slice()
                        .sort((a, b) => a.number - b.number)
                        .map((chapter, idx) => (
                          <Box
                            key={idx}
                            onClick={() => onNavigate && onNavigate(`/read/${book.id}/${chapter.number}`)}
                            sx={{
                              height: 36,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: 1,
                              cursor: "pointer",
                              bgcolor: "white",
                              border: "1px solid",
                              borderColor: "divider",
                              fontSize: "0.9rem",
                              fontWeight: 500,
                              color: "text.secondary",
                              "&:hover": {
                                bgcolor: "primary.main",
                                color: "white",
                                borderColor: "primary.main",
                              },
                              transition: "all 0.2s",
                            }}
                          >
                            {chapter.number}
                          </Box>
                        ))}
                    </Box>
                  )}
                </Box>
              </Collapse>
            </Box>
          );
        })}
      </List>
    );
  };

  if (!data) return null;

  const oldBooks = filterBooks(data.testaments["old"] || []);
  const newBooks = filterBooks(data.testaments["new"] || []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <TextField
        fullWidth
        size="small"
        placeholder="Buscar libro..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" color="action" />
            </InputAdornment>
          ),
          endAdornment: searchTerm && (
            <IconButton size="small" onClick={() => setSearchTerm("")}>
              <CloseIcon fontSize="small" />
            </IconButton>
          ),
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            bgcolor: "white",
          },
        }}
      />

      <Box>
        <Box
          onClick={() => {
            setExpandedTestament(expandedTestament === "old" ? null : "old");
            onTestamentChange?.();
          }}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            py: 1,
            px: 0.5,
            "&:hover": { opacity: 0.8 },
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, color: "text.primary", fontFamily: "Georgia, serif" }}
          >
            Antiguo Testamento
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip
              label={oldBooks.length}
              size="small"
              sx={{ height: 20, fontSize: "0.75rem", bgcolor: "grey.200" }}
            />
            {expandedTestament === "old" ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </Box>
        </Box>
        <Collapse in={expandedTestament === "old"}>
          {renderBooks("old")}
        </Collapse>
      </Box>

      <Divider />

      <Box>
        <Box
          onClick={() => {
            setExpandedTestament(expandedTestament === "new" ? null : "new");
            onTestamentChange?.();
          }}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            py: 1,
            px: 0.5,
            "&:hover": { opacity: 0.8 },
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, color: "text.primary", fontFamily: "Georgia, serif" }}
          >
            Nuevo Testamento
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip
              label={newBooks.length}
              size="small"
              sx={{ height: 20, fontSize: "0.75rem", bgcolor: "grey.200" }}
            />
            {expandedTestament === "new" ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </Box>
        </Box>
        <Collapse in={expandedTestament === "new"}>
          {renderBooks("new")}
        </Collapse>
      </Box>
    </Box>
  );
}
