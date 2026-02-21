import React from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import { logError } from '../utils/telemetry';

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    logError('react_error_boundary', error, {
      componentStack: errorInfo?.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
          <Paper sx={{ maxWidth: 560, width: '100%', p: 4, textAlign: 'center' }}>
            <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
              Ocurri&oacute; un error inesperado
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Puedes recargar la app. Si el problema persiste, env&iacute;a un reporte.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="contained" onClick={() => window.location.reload()}>
                Recargar
              </Button>
              <Button
                variant="outlined"
                component="a"
                href="mailto:javijec@gmail.com?subject=Error%20en%20Biblia%20Digital"
              >
                Reportar error
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}
