import React, { useMemo } from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline, CircularProgress, Box } from "@mui/material";
import { useBible } from "./context/BibleContext";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import ReadPage from "./pages/ReadPage";
import SearchPage from "./pages/SearchPage";
import "./App.css";

function App() {
  const { loading } = useBible();

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          primary: {
            main: "#b45309", // Amber 700
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
            primary: "#292524", // Stone 800
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
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="read/:bookId/:chapter" element={<ReadPage />} />
          <Route path="search" element={<SearchPage />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;
