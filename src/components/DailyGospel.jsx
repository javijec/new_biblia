import React, { useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Box,
    Button,
    alpha,
    useTheme
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    AutoStories as AutoStoriesIcon
} from '@mui/icons-material';
import { fetchDailyGospel } from '../services/gospelService';

const DailyGospel = () => {
    const [gospel, setGospel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const theme = useTheme();

    const loadGospel = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchDailyGospel();
            setGospel(data);
        } catch (err) {
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
                        Evangelio del Día
                    </Typography>
                    <Typography variant="h5" component="div" fontWeight="700" color="text.primary" sx={{ my: 1, fontFamily: 'serif' }}>
                        {gospel.citation}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        {gospel.date}
                    </Typography>
                </Box>

                <Box sx={{ mx: 'auto' }}>
                    <Typography
                        variant="body1"
                        color="text.primary"
                        sx={{
                            lineHeight: 1.8,
                            textAlign: 'justify',
                            fontSize: '1.1rem',
                            '& p': { mb: 2 }
                        }}
                        component="div"
                        dangerouslySetInnerHTML={{ __html: gospel.content }}
                    />
                </Box>
            </CardContent>
        </Card>
    );
};

export default DailyGospel;
