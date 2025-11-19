import React, { useState, useMemo } from "react";
import { useBible } from "../context/BibleContext";
import {
  Box,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  alpha,
  Button,
  Fade,
  Tabs,
  Tab
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

export default function BookSelector({
  data,
  onNavigate,
}) {
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [tabValue, setTabValue] = useState(0); // 0: Old, 1: New
  const { loadBook } = useBible();
  const [chapters, setChapters] = useState([]);
  const [loadingChapters, setLoadingChapters] = useState(false);

  // Filter books based on search
  const filteredBooks = useMemo(() => {
    if (!data) return { old: [], new: [] };
    const term = searchTerm.toLowerCase();
    const filter = (books) => books.filter(b => b.name.toLowerCase().includes(term));
    return {
      old: filter(data.testaments.old),
      new: filter(data.testaments.new)
    };
  }, [data, searchTerm]);

  const handleBookClick = async (book) => {
    setSelectedBook(book);
    setLoadingChapters(true);
    try {
      const fullBook = await loadBook(book.id);
      setChapters(fullBook.chapters || []);
    } catch (error) {
      console.error("Error loading chapters", error);
    } finally {
      setLoadingChapters(false);
    }
  };

  const handleBackToBooks = () => {
    setSelectedBook(null);
    setChapters([]);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const renderBookList = () => {
    const isSearching = searchTerm.length > 0;

    return (
      <Box>
        <Box
          sx={{
            position: "sticky",
            top: 0,
            bgcolor: "background.paper",
            zIndex: 10,
            pb: 1,
            pt: 2, // Add top padding
            mx: -2, // Counteract parent padding
            px: 2, // Restore internal padding
            borderBottom: "1px solid",
            borderColor: "divider"
          }}
        >
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
              mb: 1,
              "& .MuiOutlinedInput-root": {
                bgcolor: "background.paper",
              },
            }}
          />

          {!isSearching && (
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              indicatorColor="primary"
              textColor="primary"
              sx={{ minHeight: 40, "& .MuiTab-root": { minHeight: 40, py: 1 } }}
            >
              <Tab label="Antiguo" />
              <Tab label="Nuevo" />
            </Tabs>
          )}
        </Box>

        <List disablePadding sx={{ mt: 1 }}>
          {/* Search Results (Show All) */}
          {isSearching ? (
            <>
              {filteredBooks.old.length > 0 && (
                <>
                  <Typography variant="overline" sx={{ fontWeight: 700, color: "text.secondary", px: 1 }}>
                    Antiguo Testamento
                  </Typography>
                  {filteredBooks.old.map((book) => (
                    <ListItemButton key={book.id} onClick={() => handleBookClick(book)} sx={{ borderRadius: 1 }}>
                      <ListItemText primary={book.name} />
                      <ChevronRightIcon fontSize="small" color="action" />
                    </ListItemButton>
                  ))}
                </>
              )}
              {filteredBooks.new.length > 0 && (
                <>
                  <Typography variant="overline" sx={{ fontWeight: 700, color: "text.secondary", px: 1, mt: 2, display: "block" }}>
                    Nuevo Testamento
                  </Typography>
                  {filteredBooks.new.map((book) => (
                    <ListItemButton key={book.id} onClick={() => handleBookClick(book)} sx={{ borderRadius: 1 }}>
                      <ListItemText primary={book.name} />
                      <ChevronRightIcon fontSize="small" color="action" />
                    </ListItemButton>
                  ))}
                </>
              )}
            </>
          ) : (
            // Tabbed View
            <>
              {tabValue === 0 && filteredBooks.old.map((book) => (
                <ListItemButton key={book.id} onClick={() => handleBookClick(book)} sx={{ borderRadius: 1 }}>
                  <ListItemText primary={book.name} />
                  <ChevronRightIcon fontSize="small" color="action" />
                </ListItemButton>
              ))}

              {tabValue === 1 && filteredBooks.new.map((book) => (
                <ListItemButton key={book.id} onClick={() => handleBookClick(book)} sx={{ borderRadius: 1 }}>
                  <ListItemText primary={book.name} />
                  <ChevronRightIcon fontSize="small" color="action" />
                </ListItemButton>
              ))}
            </>
          )}
        </List>
      </Box>
    );
  };

  const renderChapterGrid = () => (
    <Box>
      <Box
        sx={{
          position: "sticky",
          top: 0,
          bgcolor: "background.paper",
          zIndex: 10,
          pb: 2,
          pt: 2,
          mx: -2,
          px: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          mb: 2
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToBooks}
          sx={{
            color: "text.primary",
            fontWeight: 700,
            justifyContent: "flex-start",
            px: 0,
            width: "100%"
          }}
        >
          {selectedBook?.name}
        </Button>
        <Typography variant="body2" color="text.secondary">
          Selecciona un capítulo:
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(48px, 1fr))",
          gap: 1,
        }}
      >
        {chapters.map((chapter) => (
          <Box
            key={chapter.number}
            onClick={() => onNavigate && onNavigate(`/read/${selectedBook.id}/${chapter.number}`)}
            sx={{
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 1,
              cursor: "pointer",
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              fontSize: "1rem",
              fontWeight: 500,
              color: "text.primary",
              "&:hover": {
                bgcolor: "primary.main",
                color: "primary.contrastText",
                borderColor: "primary.main",
              },
              transition: "all 0.2s",
            }}
          >
            {chapter.number}
          </Box>
        ))}
      </Box>
    </Box>
  );

  if (!data) return null;

  return (
    <Box sx={{ position: "relative", minHeight: 200 }}>
      {selectedBook ? (
        <Fade in={true}>
          <Box>{renderChapterGrid()}</Box>
        </Fade>
      ) : (
        <Fade in={true}>
          <Box>{renderBookList()}</Box>
        </Fade>
      )}
    </Box>
  );
}
