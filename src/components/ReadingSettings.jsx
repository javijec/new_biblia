import React, { useEffect, useState } from 'react';
import {
    IconButton,
    Popover,
    Box,
    Typography,
    Slider,
    ToggleButton,
    ToggleButtonGroup,
    Divider,
    Tooltip,
    Button,
    LinearProgress
} from '@mui/material';
import TextFormatIcon from '@mui/icons-material/TextFormat';
import { useSettings } from '../context/SettingsContext';
import { useBible } from '../context/BibleContext';

export default function ReadingSettings({ initialAnchorEl = null, onInitialAnchorHandled }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const {
        fontSize,
        setFontSize,
        themeMode,
        setThemeMode,
        fontFamily,
        setFontFamily,
        THEMES
    } = useSettings();
    const {
        offlineBooksCount,
        totalBooksCount,
        downloadState,
        downloadBooksForOffline,
        refreshOfflineAvailability
    } = useBible();

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    useEffect(() => {
        if (!initialAnchorEl || anchorEl) return;
        setAnchorEl(initialAnchorEl);
        onInitialAnchorHandled?.();
    }, [initialAnchorEl, anchorEl, onInitialAnchorHandled]);

    const open = Boolean(anchorEl);
    const progressValue = downloadState.total
        ? Math.round((downloadState.downloaded / downloadState.total) * 100)
        : 0;

    return (
        <>
            <Tooltip title="Configuración de lectura">
                <IconButton onClick={handleClick} color="inherit">
                    <TextFormatIcon />
                </IconButton>
            </Tooltip>

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <Box sx={{ p: 3, width: 300 }}>
                    <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                        Tamaño de letra
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Typography variant="caption">A</Typography>
                        <Slider
                            value={fontSize}
                            min={14}
                            max={32}
                            step={1}
                            onChange={(_, val) => setFontSize(val)}
                            size="small"
                        />
                        <Typography variant="h6">A</Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                        Tema
                    </Typography>
                    <ToggleButtonGroup
                        value={themeMode}
                        exclusive
                        onChange={(_, val) => val && setThemeMode(val)}
                        fullWidth
                        size="small"
                        sx={{ mb: 2 }}
                    >
                        <ToggleButton value="light">Claro</ToggleButton>
                        <ToggleButton value="sepia">Sepia</ToggleButton>
                        <ToggleButton value="dark">Oscuro</ToggleButton>
                    </ToggleButtonGroup>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                        Tipografía
                    </Typography>
                    <ToggleButtonGroup
                        value={fontFamily}
                        exclusive
                        onChange={(_, val) => val && setFontFamily(val)}
                        fullWidth
                        size="small"
                    >
                        <ToggleButton value="serif" sx={{ fontFamily: 'Georgia, serif' }}>Serif</ToggleButton>
                        <ToggleButton value="sans" sx={{ fontFamily: 'Inter, sans-serif' }}>Sans</ToggleButton>
                    </ToggleButtonGroup>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                        Offline
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {offlineBooksCount} / {totalBooksCount} libros disponibles sin conexion
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                        <Button
                            variant="contained"
                            size="small"
                            onClick={downloadBooksForOffline}
                            disabled={downloadState.isDownloading || totalBooksCount === 0}
                        >
                            {downloadState.isDownloading ? 'Descargando...' : 'Descargar libros'}
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={refreshOfflineAvailability}
                            disabled={downloadState.isDownloading}
                        >
                            Actualizar
                        </Button>
                    </Box>
                    {downloadState.isDownloading && (
                        <Box sx={{ mb: 1 }}>
                            <LinearProgress variant="determinate" value={progressValue} />
                            <Typography variant="caption" color="text.secondary">
                                {downloadState.downloaded}/{downloadState.total}
                            </Typography>
                        </Box>
                    )}
                    {downloadState.error && (
                        <Typography variant="caption" color="error.main">
                            {downloadState.error}
                        </Typography>
                    )}
                </Box>
            </Popover>
        </>
    );
}
