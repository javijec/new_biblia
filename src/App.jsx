import React, { useState, useMemo } from "react";
import { useBible } from "./context/BibleContext";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Container,
  Drawer,
  useMediaQuery,
  CircularProgress,
  Paper,
  InputBase,
  Fade,
  alpha,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import "./App.css";

function App() {
  const { data, loading } = useBible();
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [resultsVisible, setResultsVisible] = useState(20);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const isMobile = useMediaQuery("(max-width:900px)");

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          primary: {
            main: "#b45309", // Amber 700 - More sophisticated than bright orange
            light: "#d97706",
            dark: "#78350f",
            contrastText: "#ffffff",
          },
          secondary: {
            main: "#78350f", // Amber 900
            light: "#92400e",
            dark: "#451a03",
          },
          background: {
            default: "#fdfbf7", // Warm off-white/paper
            paper: "#ffffff",
          },
          text: {
            primary: "#292524", // Stone 800 - Softer than pure black
            secondary: "#57534e", // Stone 600
          },
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: { fontFamily: '"Georgia", serif', fontWeight: 700 },
          h2: { fontFamily: '"Georgia", serif', fontWeight: 700 },
          h3: { fontFamily: '"Georgia", serif', fontWeight: 700 },
          h4: { fontFamily: '"Georgia", serif', fontWeight: 700 },
          h5: { fontFamily: '"Georgia", serif', fontWeight: 600 },
          h6: { fontFamily: '"Georgia", serif', fontWeight: 600 },
          body1: {
            fontSize: "1.05rem",
            lineHeight: 1.8,
            color: "#292524",
          },
        },
        shape: {
          borderRadius: 12,
        },
        components: {
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundColor: "#ffffff",
                color: "#451a03",
                boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
                backgroundImage: "none",
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 8,
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
              },
              elevation1: {
                boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
              },
            },
          },
        },
      }),
    []
  );

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            bgcolor: "background.default",
          }}
        >
          <CircularProgress size={40} thickness={4} sx={{ color: "primary.main" }} />
        </Box>
      </ThemeProvider>
    );
  }

  if (!data) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            bgcolor: "background.default",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 4,
              textAlign: "center",
              border: "1px solid",
              borderColor: "error.light",
              bgcolor: "#fff5f5",
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" color="error.main" gutterBottom>
              Error al cargar
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Por favor, recarga la página
            </Typography>
          </Paper>
        </Box>
      </ThemeProvider>
    );
  }

  const handleSelectChapter = (book, chapter) => {
    setSelectedBook(book);
    setSelectedChapter(chapter);
    setSearchResults(null);
    if (isMobile) setMobileOpen(false);
  };

  const handleClearAll = () => {
    setSelectedBook(null);
    setSelectedChapter(null);
    setSearchResults(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSearchToggle = () => {
    setSearchOpen(!searchOpen);
    if (!searchOpen) {
      setTimeout(() => document.getElementById("search-input")?.focus(), 100);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          bgcolor: "background.default",
        }}
      >
        {/* AppBar */}
        <AppBar position="static" elevation={0} sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
          <Toolbar sx={{ gap: 2, minHeight: { xs: 56, sm: 64 } }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 1, display: { md: "none" } }}
            >
              <MenuIcon />
            </IconButton>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                cursor: "pointer",
                flexShrink: 0,
              }}
              onClick={handleClearAll}
            >
              <Box
                sx={{
                  bgcolor: "primary.main",
                  color: "white",
                  p: 0.5,
                  borderRadius: 1,
                  display: "flex",
                }}
              >
                <MenuBookIcon sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  component="h1"
                  sx={{
                    fontWeight: 700,
                    lineHeight: 1.2,
                    color: "text.primary",
                    fontSize: { xs: "1rem", sm: "1.1rem" },
                  }}
                >
                  Biblia Digital
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    display: { xs: "none", sm: "block" },
                    lineHeight: 1,
                  }}
                >
                  Pueblo de Dios
                </Typography>
              </Box>
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            <Fade in={searchOpen}>
              <Paper
                component="form"
                onSubmit={(e) => e.preventDefault()}
                elevation={0}
                sx={{
                  p: "2px 8px",
                  display: searchOpen ? "flex" : "none",
                  alignItems: "center",
                  width: { xs: "100%", sm: 300, md: 400 },
                  backgroundColor: "grey.100",
                  position: { xs: "absolute", sm: "relative" },
                  left: { xs: 0, sm: "auto" },
                  right: { xs: 0, sm: "auto" },
                  top: { xs: "100%", sm: "auto" },
                  mx: { xs: 0, sm: 0 },
                  zIndex: 10,
                  borderBottom: { xs: "1px solid #e5e7eb", sm: "none" },
                  borderRadius: { xs: 0, sm: 8 },
                }}
              >
                <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />
                <InputBase
                  id="search-input"
                  sx={{ ml: 1, flex: 1 }}
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSearchTerm("");
                      setSearchResults(null);
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                )}
              </Paper>
            </Fade>

            <IconButton
              onClick={handleSearchToggle}
              sx={{
                bgcolor: searchOpen ? "grey.100" : "transparent",
                color: searchOpen ? "primary.main" : "text.secondary"
              }}
            >
              {searchOpen ? <CloseIcon /> : <SearchIcon />}
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Desktop Sidebar */}
          <Box
            component="nav"
            sx={{
              width: { md: 300, lg: 340 },
              flexShrink: 0,
              display: { xs: "none", md: "block" },
              borderRight: "1px solid",
              borderColor: "divider",
              bgcolor: "white",
            }}
          >
            <Sidebar
              data={data}
              selectedBook={selectedBook}
              onSelectBook={(book) => {
                setSelectedBook(book);
                setSelectedChapter(null);
                setSearchResults(null);
              }}
              onSelectChapter={(chapter) => {
                handleSelectChapter(chapter.bookTitle, chapter);
              }}
            />
          </Box>

          {/* Mobile Drawer */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: "block", md: "none" },
              "& .MuiDrawer-paper": {
                width: 280,
                boxSizing: "border-box",
                bgcolor: "white",
              },
            }}
          >
            <Sidebar
              data={data}
              selectedBook={selectedBook}
              onSelectBook={(book) => {
                setSelectedBook(book);
                setSelectedChapter(null);
                setSearchResults(null);
              }}
              onSelectChapter={(chapter) => {
                handleSelectChapter(chapter.bookTitle, chapter);
              }}
            />
          </Drawer>

          {/* Main Content Area */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              overflow: "auto",
              bgcolor: "background.default",
              position: "relative",
            }}
          >
            <Container
              maxWidth="lg"
              sx={{
                height: "100%",
                py: { xs: 2, md: 4 },
                px: { xs: 2, md: 4 }
              }}
            >
              <MainContent
                data={data}
                selectedBook={selectedBook}
                selectedChapter={selectedChapter}
                searchResults={searchResults}
                resultsVisible={resultsVisible}
                setResultsVisible={setResultsVisible}
                onSearch={setSearchResults}
                onSelectChapter={handleSelectChapter}
                searchTerm={searchTerm}
              />
            </Container>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
