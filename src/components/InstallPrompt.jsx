import React, { useState, useEffect } from 'react';
import { Button, Snackbar, Alert, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import GetAppIcon from '@mui/icons-material/GetApp';

/**
 * InstallPrompt Component
 * Prompts users to install the PWA when available
 * Remembers user preference in localStorage
 */
export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Check if user has already dismissed the prompt
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (dismissed === 'true') {
            return;
        }

        const handleBeforeInstallPrompt = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Save the event so it can be triggered later
            setDeferredPrompt(e);
            // Show the install prompt after a short delay
            setTimeout(() => {
                setShowPrompt(true);
            }, 3000); // Wait 3 seconds before showing
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Check if app is already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            // App is already installed, don't show prompt
            return;
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            return;
        }

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }

        // Clear the deferredPrompt
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        // Remember that user dismissed the prompt
        localStorage.setItem('pwa-install-dismissed', 'true');
    };

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setShowPrompt(false);
    };

    return (
        <Snackbar
            open={showPrompt}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            sx={{ bottom: { xs: 80, sm: 24 } }}
        >
            <Alert
                severity="info"
                icon={<GetAppIcon />}
                action={
                    <>
                        <Button
                            color="inherit"
                            size="small"
                            onClick={handleInstallClick}
                            sx={{ fontWeight: 600 }}
                        >
                            Instalar
                        </Button>
                        <IconButton
                            size="small"
                            aria-label="close"
                            color="inherit"
                            onClick={handleDismiss}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </>
                }
                sx={{ width: '100%', alignItems: 'center' }}
            >
                Instala Biblia Digital para acceso rápido y offline
            </Alert>
        </Snackbar>
    );
}
