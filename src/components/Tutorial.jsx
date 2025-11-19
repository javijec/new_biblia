import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogActions,
    Typography,
    Button,
    Box,
    MobileStepper,
    useTheme,
    Fade
} from '@mui/material';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SearchIcon from '@mui/icons-material/Search';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import SettingsIcon from '@mui/icons-material/Settings';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';

const steps = [
    {
        label: 'Bienvenido',
        description: 'Descubre una nueva forma de leer la Biblia del Pueblo de Dios. Disfruta de un diseño moderno, limpio y fácil de usar.',
        icon: <MenuBookIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
    },
    {
        label: 'Navegación Intuitiva',
        description: 'Usa el menú lateral para explorar rápidamente entre el Antiguo y Nuevo Testamento. Filtra los libros y salta directamente al capítulo que buscas.',
        icon: <AutoStoriesIcon sx={{ fontSize: 60, color: 'secondary.main' }} />,
    },

    {
        label: 'Interactúa con el Texto',
        description: 'Haz clic en cualquier versículo para seleccionarlo. Puedes seleccionar múltiples versículos (incluso de diferentes capítulos) para copiarlos o compartirlos con formato profesional.',
        icon: <TouchAppIcon sx={{ fontSize: 60, color: 'warning.main' }} />,
    },
    {
        label: 'A tu Gusto',
        description: 'Personaliza tu experiencia de lectura. Cambia el tamaño de la letra, la tipografía y alterna entre modo claro y oscuro desde el menú de configuración.',
        icon: <SettingsIcon sx={{ fontSize: 60, color: 'success.main' }} />,
    },
];

export default function Tutorial() {
    const [activeStep, setActiveStep] = useState(0);
    const [open, setOpen] = useState(false);
    const theme = useTheme();
    const maxSteps = steps.length;

    useEffect(() => {
        const tutorialSeen = localStorage.getItem('tutorial_seen');
        if (!tutorialSeen) {
            // Small delay to allow app to load first
            const timer = setTimeout(() => setOpen(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleClose = () => {
        setOpen(false);
        localStorage.setItem('tutorial_seen', 'true');
    };

    const handleFinish = () => {
        handleClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    p: 1,
                    backgroundImage: 'none'
                }
            }}
            TransitionComponent={Fade}
            transitionDuration={500}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 4, px: 2 }}>
                <Box sx={{
                    mb: 3,
                    p: 2,
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'action.hover' : 'grey.50',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {steps[activeStep].icon}
                </Box>

                <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 700 }}>
                    {steps[activeStep].label}
                </Typography>

                <Typography variant="body1" align="center" color="text.secondary" sx={{ minHeight: 80 }}>
                    {steps[activeStep].description}
                </Typography>
            </Box>

            <DialogContent sx={{ p: 0, mt: 2 }}>
                <MobileStepper
                    variant="dots"
                    steps={maxSteps}
                    position="static"
                    activeStep={activeStep}
                    sx={{
                        bgcolor: 'transparent',
                        justifyContent: 'center',
                        '& .MuiMobileStepper-dot': {
                            width: 8,
                            height: 8,
                            mx: 0.5
                        },
                        '& .MuiMobileStepper-dotActive': {
                            width: 20,
                            borderRadius: 4
                        }
                    }}
                />
            </DialogContent>

            <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
                <Button
                    size="small"
                    onClick={handleBack}
                    disabled={activeStep === 0}
                    sx={{ minWidth: 80 }}
                >
                    {activeStep === 0 ? '' : 'Anterior'}
                </Button>

                {activeStep === maxSteps - 1 ? (
                    <Button
                        variant="contained"
                        onClick={handleFinish}
                        sx={{ borderRadius: 8, px: 3 }}
                    >
                        Comenzar
                    </Button>
                ) : (
                    <Button
                        variant="contained"
                        onClick={handleNext}
                        endIcon={<KeyboardArrowRight />}
                        sx={{ borderRadius: 8, px: 3 }}
                    >
                        Siguiente
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}
