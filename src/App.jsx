import React, { useMemo, lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline, CircularProgress, Box } from "@mui/material";
import { useBible } from "./context/BibleContext";
import { useSettings } from "./context/SettingsContext";
import OfflineIndicator from "./components/OfflineIndicator";
import InstallPrompt from "./components/InstallPrompt";
import PwaUpdatePrompt from "./components/PwaUpdatePrompt";
import TelemetryBootstrap from "./components/TelemetryBootstrap";
import TelemetryDebugPanel from "./components/TelemetryDebugPanel";
import "./App.css";

const MainLayout = lazy(() => import("./layouts/MainLayout"));
const HomePage = lazy(() => import("./pages/HomePage"));
const ReadPage = lazy(() => import("./pages/ReadPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));

function App() {
  const { loading } = useBible();
  const { currentTheme, fontFamily } = useSettings();

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: currentTheme.name === 'Oscuro' ? 'dark' : 'light',
          primary: {
            main: currentTheme.primary,
          },
          background: {
            default: currentTheme.bg,
            paper: currentTheme.paper,
          },
          text: {
            primary: currentTheme.text,
          },
        },
        typography: {
          fontFamily: fontFamily === 'serif'
            ? '"Georgia", "Garamond", "Times New Roman", serif'
            : '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: { fontWeight: 700 },
          h2: { fontWeight: 700 },
          h3: { fontWeight: 700 },
          h4: { fontWeight: 700 },
          h5: { fontWeight: 600 },
          h6: { fontWeight: 600 },
        },
        components: {
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundColor: currentTheme.paper,
                color: currentTheme.text,
                backgroundImage: "none",
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
    [currentTheme, fontFamily]
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
      <TelemetryBootstrap />
      <OfflineIndicator />
      <InstallPrompt />
      <PwaUpdatePrompt />
      <TelemetryDebugPanel />
      <Suspense
        fallback={
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <CircularProgress />
          </Box>
        }
      >
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="read/:bookId/:chapter" element={<ReadPage />} />
            <Route path="search" element={<SearchPage />} />
          </Route>
        </Routes>
      </Suspense>
    </ThemeProvider>
  );
}

export default App;
