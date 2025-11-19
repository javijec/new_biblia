import React, { useState } from 'react';
import {
    IconButton,
    Popover,
    Box,
    Typography,
    Slider,
    ToggleButton,
    ToggleButtonGroup,
    Divider,
    Tooltip
} from '@mui/material';
import TextFormatIcon from '@mui/icons-material/TextFormat';
import { useSettings } from '../context/SettingsContext';

export default function ReadingSettings() {
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

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

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
                </Box>
            </Popover>
        </>
    );
}
