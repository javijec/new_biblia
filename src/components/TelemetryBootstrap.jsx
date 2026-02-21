import { useEffect } from 'react';
import { logError } from '../utils/telemetry';

export default function TelemetryBootstrap() {
  useEffect(() => {
    const onError = (event) => {
      logError('window_error', event.error || event.message, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    };

    const onUnhandledRejection = (event) => {
      logError('unhandled_rejection', event.reason, {});
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);

    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, []);

  return null;
}
