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
            main: "#d97706",
            light: "#fbbf24",
            dark: "#92400e",
            contrastText: "#ffffff",
          },
          secondary: {
            main: "#f59e0b",
            light: "#fcd34d",
            dark: "#b45309",
          },
          background: {
            default: "#fef3c7",
            paper: "#fffbeb",
          },
          text: {
            primary: "#78350f",
            secondary: "#92400e",
          },
        },
        typography: {
          fontFamily: '"Georgia", "Garamond", "Times New Roman", serif',
          h4: {
            fontWeight: 700,
            color: "#78350f",
          },
          h5: {
            fontWeight: 600,
            color: "#92400e",
          },
          h6: {
            fontWeight: 600,
          },
          body1: {
            fontSize: "1.05rem",
            lineHeight: 1.7,
          },
        },
        shape: {
          borderRadius: 12,
        },
        components: {
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundImage:
                  "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
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
            background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 6,
              textAlign: "center",
              borderRadius: 4,
              background: "rgba(255, 255, 255, 0.95)",
            }}
          >
            <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
            <Typography variant="h5" color="primary.main" fontWeight={600}>
              Cargando Biblia Digital...
            </Typography>
          </Paper>
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
            background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
          }}
        >
          <Paper
            elevation={6}
            sx={{
              p: 6,
              textAlign: "center",
              borderRadius: 4,
              border: "2px solid",
              borderColor: "primary.main",
            }}
          >
            <Typography
              variant="h5"
              color="error"
              fontWeight={700}
              gutterBottom
            >
              Error al cargar
            </Typography>
            <Typography variant="body1" color="text.secondary">
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
          background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
        }}
      >
        {/* AppBar */}
        <AppBar position="static" elevation={4}>
          <Toolbar sx={{ gap: 2 }}>
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
                gap: 1,
                cursor: "pointer",
                flexShrink: 0,
              }}
              onClick={handleClearAll}
            >
              <MenuBookIcon
                sx={{ fontSize: 32, display: { xs: "none", sm: "block" } }}
              />
              <Typography
                variant="h5"
                component="h1"
                sx={{
                  fontWeight: 700,
                  display: { xs: "none", sm: "block" },
                  fontFamily: "Georgia, serif",
                }}
              >
                Biblia Digital
              </Typography>
              <Typography
                variant="h6"
                component="h1"
                sx={{
                  fontWeight: 700,
                  display: { xs: "block", sm: "none" },
                }}
              >
                Biblia
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            <Fade in={searchOpen}>
              <Paper
                component="form"
                onSubmit={(e) => e.preventDefault()}
                sx={{
                  p: "2px 8px",
                  display: searchOpen ? "flex" : "none",
                  alignItems: "center",
                  width: { xs: "100%", sm: 400 },
                  backgroundColor: alpha("#fff", 0.9),
                  position: { xs: "absolute", sm: "relative" },
                  left: { xs: 0, sm: "auto" },
                  right: { xs: 0, sm: "auto" },
                  top: { xs: "100%", sm: "auto" },
                  mx: { xs: 2, sm: 0 },
                  mt: { xs: 1, sm: 0 },
                  zIndex: 1,
                }}
              >
                <SearchIcon sx={{ color: "primary.main", mr: 1 }} />
                <InputBase
                  id="search-input"
                  sx={{ ml: 1, flex: 1 }}
                  placeholder="Buscar en la Biblia..."
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

            <IconButton color="inherit" onClick={handleSearchToggle}>
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
              width: { md: 320, lg: 380 },
              flexShrink: 0,
              display: { xs: "none", md: "block" },
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
                background: "linear-gradient(180deg, #fffbeb 0%, #fef3c7 100%)",
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
              p: { xs: 2, sm: 3, md: 4 },
            }}
          >
            <Container maxWidth="xl" sx={{ height: "100%" }}>
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
