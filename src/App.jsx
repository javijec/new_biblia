import React, { useMemo, lazy, Suspense, useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline, CircularProgress, Box } from "@mui/material";
import { useBible } from "./context/BibleContext";
import { useSettings } from "./context/SettingsContext";
import { SelectionProvider } from "./context/SelectionContext";
import TelemetryBootstrap from "./components/TelemetryBootstrap";
import "./App.css";

const MainLayout = lazy(() => import("./layouts/MainLayout"));
const HomePage = lazy(() => import("./pages/HomePage"));
const ReadPage = lazy(() => import("./pages/ReadPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const OfflineIndicator = lazy(() => import("./components/OfflineIndicator"));
const InstallPrompt = lazy(() => import("./components/InstallPrompt"));
const PwaUpdatePrompt = lazy(() => import("./components/PwaUpdatePrompt"));
const TelemetryDebugPanel = lazy(() => import("./components/TelemetryDebugPanel"));

function App() {
  const { loading } = useBible();
  const { currentTheme, fontFamily } = useSettings();
  const showTelemetryDebugPanel = import.meta.env.DEV;
  const [deferNonCriticalUi, setDeferNonCriticalUi] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDeferNonCriticalUi(true), 1200);
    return () => clearTimeout(timer);
  }, []);

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
      {deferNonCriticalUi && (
        <Suspense fallback={null}>
          <OfflineIndicator />
          <InstallPrompt />
          <PwaUpdatePrompt />
        </Suspense>
      )}
      {showTelemetryDebugPanel && (
        <Suspense fallback={null}>
          <TelemetryDebugPanel />
        </Suspense>
      )}
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
            <Route
              path="read/:bookId/:chapter"
              element={(
                <SelectionProvider>
                  <ReadPage />
                </SelectionProvider>
              )}
            />
            <Route path="search" element={<SearchPage />} />
          </Route>
        </Routes>
      </Suspense>
    </ThemeProvider>
  );
}

export default App;
