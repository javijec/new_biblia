import React, { useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Box,
    Button,
    useTheme,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    AutoStories as AutoStoriesIcon,
    ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { fetchDailyGospel } from '../services/gospelService';

const DailyGospel = () => {
    const [gospel, setGospel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expanded, setExpanded] = useState('GSP');
    const theme = useTheme();

    const loadGospel = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchDailyGospel();
            setGospel(data);
        } catch {
            setError('No se pudo cargar el Evangelio. Verifica tu conexión.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadGospel();
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress size={30} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" flexDirection="column" alignItems="center" p={3} textAlign="center">
                <Typography color="error" gutterBottom variant="body2">{error}</Typography>
                <Button
                    startIcon={<RefreshIcon />}
                    onClick={loadGospel}
                    variant="outlined"
                    size="small"
                    sx={{ mt: 1 }}
                >
                    Reintentar
                </Button>
            </Box>
        );
    }

    if (!gospel) return null;

    return (
        <Card
            elevation={0}
            sx={{
                mb: 4,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.paper',
                overflow: 'hidden'
            }}
        >
            <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
                    <Box
                        sx={{
                            p: 1.5,
                            borderRadius: '50%',
                            bgcolor: 'primary.50',
                            color: 'primary.main',
                            mb: 2,
                            display: 'flex'
                        }}
                    >
                        <AutoStoriesIcon />
                    </Box>
                    <Typography variant="overline" color="text.secondary" fontWeight="600" letterSpacing={2}>
                        Lecturas del Día
                    </Typography>
                    <Typography variant="h5" component="div" fontWeight="700" color="text.primary" sx={{ my: 1, fontFamily: 'serif' }}>
                        {gospel.citation}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        {gospel.date}
                    </Typography>
                    {gospel.saint && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1, fontWeight: 600, textAlign: 'center' }}
                        >
                            Santo del día: {gospel.saint}
                        </Typography>
                    )}
                </Box>

                <Box sx={{ mx: 'auto' }}>
                    {gospel.sections?.map((section) => (
                        <Accordion
                            key={section.key}
                            expanded={expanded === section.key}
                            onChange={(_, isExpanded) => setExpanded(isExpanded ? section.key : false)}
                            disableGutters
                            elevation={0}
                            sx={{
                                mb: 1.5,
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: 2,
                                '&:before': { display: 'none' }
                            }}
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                sx={{
                                    '& .MuiAccordionSummary-content': {
                                        my: 1.5
                                    }
                                }}
                            >
                                <Box>
                                    <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                                        {section.label}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                        {section.citation}
                                    </Typography>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography
                                    variant="body1"
                                    color="text.primary"
                                    sx={{
                                        lineHeight: 1.8,
                                        textAlign: 'justify',
                                        fontSize: '1.05rem',
                                        '& p': { mb: 0 }
                                    }}
                                    component="div"
                                    dangerouslySetInnerHTML={{ __html: section.content }}
                                />
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Box>
            </CardContent>
        </Card>
    );
};

export default DailyGospel;
