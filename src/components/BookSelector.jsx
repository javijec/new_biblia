import React, { useState } from "react";
import { useBible } from "../context/BibleContext";
import {
  Box,
  Button,
  Collapse,
  TextField,
  Typography,
  IconButton,
  Chip,
  CircularProgress,
  Paper,
  alpha,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";

export default function BookSelector({
  data,
  selectedBook,
  onSelectBook,
  onSelectChapter,
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
          sx={{ p: 2, textAlign: "center" }}
        >
          No se encontraron libros
        </Typography>
      );
    }

    return books.map((book) => {
      const chapters = bookChapters[book.id] || [];
      const bookName = book.name;
      const isExpanded = expandedBooks.has(book.id);
      const isLoading = loadingBook === book.id;

      return (
        <Box key={book.id} sx={{ mb: 1.5 }}>
          <Button
            fullWidth
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
            sx={{
              //justifyContent: "space-between",
              textTransform: "none",
              py: 1.5,
              px: 2,
              fontWeight: 600,
              fontSize: "0.95rem",
              background: isExpanded
                ? "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)"
                : alpha("#d97706", 0.1),
              color: isExpanded ? "white" : "text.primary",
              "&:hover": {
                background: isExpanded
                  ? "linear-gradient(135deg, #b45309 0%, #d97706 100%)"
                  : alpha("#d97706", 0.2),
                transform: "translateY(-2px)",
                boxShadow: 2,
              },
              transition: "all 0.3s ease",
            }}
          >
            <Typography sx={{ fontWeight: 600, fontSize: "inherit" }}>
              {bookName}
            </Typography>
            <ExpandMoreIcon
              sx={{
                transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.3s",
              }}
            />
          </Button>

          <Collapse in={isExpanded}>
            <Box sx={{ mt: 1.5, ml: 2, maxHeight: 400, overflow: "auto" }}>
              {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                  <CircularProgress size={30} />
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  {chapters
                    .slice()
                    .sort((a, b) => a.number - b.number)
                    .map((chapter, idx) => (
                      <Chip
                        key={idx}
                        label={chapter.number}
                        onClick={() =>
                          onSelectChapter &&
                          onSelectChapter({
                            ...chapter,
                            bookTitle: bookName,
                            bookId: book.id,
                          })
                        }
                        sx={{
                          width: 45,
                          fontWeight: 600,
                          cursor: "pointer",
                          background: "white",
                          border: "2px solid",
                          borderColor: "primary.light",
                          "&:hover": {
                            background: "primary.main",
                            color: "white",
                            borderColor: "primary.dark",
                          },
                          transition: "all 0.2s ease",
                        }}
                      />
                    ))}
                </Box>
              )}
            </Box>
          </Collapse>
        </Box>
      );
    });
  };

  if (!data)
    return (
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ p: 2, textAlign: "center" }}
      >
        Cargando libros...
      </Typography>
    );

  const oldBooks = filterBooks(data.testaments["old"] || []);
  const newBooks = filterBooks(data.testaments["new"] || []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Search Bar */}
      <Paper
        elevation={0}
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1,
          background: alpha("#fffbeb", 0.95),
          backdropFilter: "blur(8px)",
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar libro..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            endAdornment: searchTerm && (
              <IconButton size="small" onClick={() => setSearchTerm("")}>
                <CloseIcon fontSize="small" />
              </IconButton>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              background: "white",
              "& fieldset": {
                borderColor: "primary.light",
                borderWidth: 2,
              },
              "&:hover fieldset": {
                borderColor: "primary.main",
              },
              "&.Mui-focused fieldset": {
                borderColor: "primary.main",
              },
            },
          }}
        />
      </Paper>

      {/* Antiguo Testamento */}
      <Box>
        <Button
          fullWidth
          onClick={() => {
            setExpandedTestament(expandedTestament === "old" ? null : "old");
            onTestamentChange?.();
          }}
          sx={{
            justifyContent: "space-between",
            textTransform: "none",
            py: 2,
            px: 2.5,
            fontWeight: 700,
            fontSize: "1rem",
            background: "linear-gradient(135deg, #d97706 0%, #ea580c 100%)",
            color: "white",
            boxShadow: 3,
            "&:hover": {
              background: "linear-gradient(135deg, #b45309 0%, #c2410c 100%)",
              boxShadow: 4,
              transform: "translateY(-2px)",
            },
            transition: "all 0.3s ease",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <span>📜</span>
            <Typography sx={{ fontWeight: 700, fontSize: "inherit" }}>
              Antiguo Testamento
            </Typography>
            <Chip
              label={oldBooks.length}
              size="small"
              sx={{
                background: alpha("#fff", 0.3),
                color: "white",
                fontWeight: 700,
                height: 24,
              }}
            />
          </Box>
          <ExpandMoreIcon
            sx={{
              transform:
                expandedTestament === "old" ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s",
            }}
          />
        </Button>

        <Collapse in={expandedTestament === "old"}>
          <Box sx={{ mt: 2, pl: 0.5 }}>{renderBooks("old")}</Box>
        </Collapse>
      </Box>

      {/* Nuevo Testamento */}
      <Box>
        <Button
          fullWidth
          onClick={() => {
            setExpandedTestament(expandedTestament === "new" ? null : "new");
            onTestamentChange?.();
          }}
          sx={{
            justifyContent: "space-between",
            textTransform: "none",
            py: 2,
            px: 2.5,
            fontWeight: 700,
            fontSize: "1rem",
            background: "linear-gradient(135deg, #dc2626 0%, #e11d48 100%)",
            color: "white",
            boxShadow: 3,
            "&:hover": {
              background: "linear-gradient(135deg, #b91c1c 0%, #be123c 100%)",
              boxShadow: 4,
              transform: "translateY(-2px)",
            },
            transition: "all 0.3s ease",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <span>✝️</span>
            <Typography sx={{ fontWeight: 700, fontSize: "inherit" }}>
              Nuevo Testamento
            </Typography>
            <Chip
              label={newBooks.length}
              size="small"
              sx={{
                background: alpha("#fff", 0.3),
                color: "white",
                fontWeight: 700,
                height: 24,
              }}
            />
          </Box>
          <ExpandMoreIcon
            sx={{
              transform:
                expandedTestament === "new" ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s",
            }}
          />
        </Button>

        <Collapse in={expandedTestament === "new"}>
          <Box sx={{ mt: 2, pl: 0.5 }}>{renderBooks("new")}</Box>
        </Collapse>
      </Box>
    </Box>
  );
}
