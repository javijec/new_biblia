import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, Box } from '@mui/material';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import WifiIcon from '@mui/icons-material/Wifi';

/**
 * OfflineIndicator Component
 * Displays a notification when the user goes offline or comes back online
 * Shows a persistent indicator when offline
 */
export default function OfflineIndicator() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setNotificationMessage('Conexión restaurada');
            setShowNotification(true);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setNotificationMessage('Sin conexión - Modo offline');
            setShowNotification(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleCloseNotification = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setShowNotification(false);
    };

    return (
        <>
            {/* Persistent offline indicator */}
            {!isOnline && (
                <Box
                    sx={{
                        position: 'fixed',
                        bottom: 16,
                        right: 16,
                        backgroundColor: 'warning.main',
                        color: 'warning.contrastText',
                        padding: '8px 16px',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        boxShadow: 3,
                        zIndex: 1300,
                    }}
                >
                    <WifiOffIcon fontSize="small" />
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                        Modo Offline
                    </span>
                </Box>
            )}

            {/* Notification snackbar */}
            <Snackbar
                open={showNotification}
                autoHideDuration={4000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseNotification}
                    severity={isOnline ? 'success' : 'warning'}
                    icon={isOnline ? <WifiIcon /> : <WifiOffIcon />}
                    sx={{ width: '100%' }}
                >
                    {notificationMessage}
                </Alert>
            </Snackbar>
        </>
    );
}
