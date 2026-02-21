import React, { useState } from 'react';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { clearTelemetryEntries, getTelemetryEntries } from '../utils/telemetry';

function isLocalhostHost(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

export default function TelemetryDebugPanel() {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState(() => getTelemetryEntries().slice(-30).reverse());

  const isLocalhost = typeof window !== 'undefined' && isLocalhostHost(window.location.hostname);

  if (!isLocalhost) return null;

  const handleRefresh = () => setEntries(getTelemetryEntries().slice(-30).reverse());
  const handleClear = () => {
    clearTelemetryEntries();
    handleRefresh();
  };

  return (
    <Box sx={{ position: 'fixed', right: 16, bottom: 16, zIndex: 1400 }}>
      {!open ? (
        <Button variant="contained" size="small" onClick={() => setOpen(true)}>
          Debug Telemetry
        </Button>
      ) : (
        <Paper sx={{ width: 360, maxHeight: 420, p: 1.5, overflow: 'auto' }}>
          <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
            <Button size="small" variant="contained" onClick={handleRefresh}>Refrescar</Button>
            <Button size="small" variant="outlined" color="error" onClick={handleClear}>Limpiar</Button>
            <Button size="small" variant="text" onClick={() => setOpen(false)}>Cerrar</Button>
          </Stack>

          <Typography variant="caption" color="text.secondary">
            Entradas: {entries.length} (ultimas 30)
          </Typography>

          <Stack spacing={1} sx={{ mt: 1 }}>
            {entries.map((entry, index) => (
              <Paper key={`${entry.ts}-${index}`} variant="outlined" sx={{ p: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {entry.ts} | {entry.type}
                </Typography>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 11 }}>
                  {JSON.stringify(entry, null, 2)}
                </pre>
              </Paper>
            ))}
            {entries.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Sin telemetria registrada.
              </Typography>
            )}
          </Stack>
        </Paper>
      )}
    </Box>
  );
}
