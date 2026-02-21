import React, { useEffect, useState } from 'react';
import { Alert, Button, Snackbar } from '@mui/material';
import { registerSW } from 'virtual:pwa-register';
import { logError, logEvent } from '../utils/telemetry';

export default function PwaUpdatePrompt() {
  const [showRefreshPrompt, setShowRefreshPrompt] = useState(false);
  const [updateSW, setUpdateSW] = useState(null);
  const [showOfflineReady, setShowOfflineReady] = useState(false);

  useEffect(() => {
    const updateServiceWorker = registerSW({
      onNeedRefresh() {
        logEvent('pwa_update_available');
        setShowRefreshPrompt(true);
      },
      onOfflineReady() {
        logEvent('pwa_offline_ready');
        setShowOfflineReady(true);
      },
      onRegistered(registration) {
        if (!registration) return;
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      },
      onRegisterError(error) {
        logError('pwa_register_failed', error);
      },
    });

    setUpdateSW(() => updateServiceWorker);
  }, []);

  return (
    <>
      <Snackbar
        open={showRefreshPrompt}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        onClose={() => setShowRefreshPrompt(false)}
      >
        <Alert
          severity="info"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => updateSW?.(true)}
            >
              Actualizar
            </Button>
          }
          sx={{ width: '100%' }}
        >
          Hay una nueva versi&oacute;n disponible.
        </Alert>
      </Snackbar>

      <Snackbar
        open={showOfflineReady}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        onClose={() => setShowOfflineReady(false)}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          La app est&aacute; lista para usar offline.
        </Alert>
      </Snackbar>
    </>
  );
}
