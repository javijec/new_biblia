import React, { useEffect, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { registerSW } from 'virtual:pwa-register';
import { logError, logEvent } from '../utils/telemetry';

export default function PwaUpdatePrompt() {
  const [showOfflineReady, setShowOfflineReady] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const updateServiceWorker = registerSW({
      onNeedRefresh() {
        logEvent('pwa_update_available');
        setIsUpdating(true);
        updateServiceWorker(true);
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

  }, []);

  return (
    <>
      <Snackbar
        open={isUpdating}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        onClose={() => setIsUpdating(false)}
      >
        <Alert
          severity="info"
          sx={{ width: '100%' }}
        >
          Actualizando a la nueva versi&oacute;n...
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
