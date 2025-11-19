import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Box, Typography, CircularProgress, Paper, Grid, Chip, Button, Tabs, Tab, alpha } from "@mui/material";
import { useBibleSearch } from "../hooks/useBibleSearch";

// Helper component for highlighting text
const HighlightedText = ({ text, terms }) => {
    if (!terms || terms.length === 0) return <>{text}</>;

    // Create a single regex for all terms
    // Sort by length descending to match longer phrases first if any
    const sortedTerms = [...terms].sort((a, b) => b.length - a.length);
    const pattern = new RegExp(`\\b(${sortedTerms.join('|')})\\b`, 'gi');

    // Split text by matches
    const parts = text.split(pattern);

    return (
        <>
            {parts.map((part, i) => {
                // Check if this part matches any term (case insensitive)
                const isMatch = sortedTerms.some(term =>
                    part.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === term
                );

                return isMatch ? (
                    <Box
                        component="span"
                        key={i}
                        sx={{
                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2),
                            color: "primary.dark",
                            fontWeight: 600,
                            borderRadius: "2px",
                            px: 0.5
                        }}
                    >
                        {part}
                    </Box>
                ) : (
                    <span key={i}>{part}</span>
                );
            })}
        </>
    );
};

export default function SearchPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const query = searchParams.get("q");
    const { searchAllBooks, isReady } = useBibleSearch();

    const [results, setResults] = useState([]);
    const [searchTerms, setSearchTerms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [visibleCount, setVisibleCount] = useState(20);
    const [filter, setFilter] = useState('all'); // 'all', 'old', 'new'

    useEffect(() => {
        const performSearch = async () => {
            if (!query) return;
            if (!isReady) return;

            setLoading(true);
            setResults([]);
            try {
                const { results: searchResults, terms } = await searchAllBooks(query);
                setResults(searchResults);
                setSearchTerms(terms);
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setLoading(false);
            }
        };

        performSearch();
    }, [query, searchAllBooks, isReady]);

    // Filter results based on selected tab
    const filteredResults = useMemo(() => {
        if (filter === 'all') return results;
        const isOld = filter === 'old';
        return results.filter(r => {
            const testament = r.testament?.toLowerCase() || '';
            return isOld ? testament.includes('antiguo') : testament.includes('nuevo');
        });
    }, [results, filter]);

    const handleFilterChange = (event, newValue) => {
        setFilter(newValue);
        setVisibleCount(20); // Reset visible count on filter change
    };

    if (!isReady) {
        return (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", pt: 8, gap: 2 }}>
                <CircularProgress />
                <Typography color="text.secondary">Indexando libros para la búsqueda...</Typography>
            </Box>
        );
    }

    if (loading) {
        return (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", pt: 8, gap: 2 }}>
                <CircularProgress />
                <Typography color="text.secondary">Buscando en las escrituras...</Typography>
            </Box>
        );
    }

    if (!results.length && !loading) {
        return (
            <Box sx={{ textAlign: "center", pt: 8 }}>
                <Typography variant="h6" color="text.secondary">
                    No se encontraron resultados para "{query}"
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ pb: 4 }}>
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", mb: 2 }}>
                    <Typography variant="h5" color="text.primary">
                        Resultados para "{query}"
                    </Typography>
                    <Chip
                        label={`${results.length} versículos`}
                        color="primary"
                        variant="outlined"
                        size="small"
                    />
                </Box>

                <Tabs
                    value={filter}
                    onChange={handleFilterChange}
                    textColor="primary"
                    indicatorColor="primary"
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab label="Todos" value="all" />
                    <Tab label="Antiguo Testamento" value="old" />
                    <Tab label="Nuevo Testamento" value="new" />
                </Tabs>
            </Box>

            <Grid container spacing={2}>
                {filteredResults.slice(0, visibleCount).map((result, idx) => (
                    <Grid item xs={12} md={6} key={idx}>
                        <Paper
                            elevation={0}
                            onClick={() => navigate(`/read/${result.chapter.bookId}/${result.chapterNumber}`)}
                            sx={{
                                p: 2.5,
                                cursor: "pointer",
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 2,
                                height: "100%",
                                transition: "all 0.2s ease",
                                "&:hover": {
                                    borderColor: "primary.main",
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                                },
                            }}
                        >
                            <Typography
                                variant="subtitle2"
                                sx={{
                                    color: "primary.main",
                                    mb: 1,
                                    fontWeight: 700,
                                    fontFamily: "Georgia, serif",
                                }}
                            >
                                {result.bookTitle} {result.chapterNumber}:
                                {result.verseNumber}
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.primary"
                                sx={{
                                    fontFamily: "Georgia, serif",
                                    lineHeight: 1.6,
                                    display: "-webkit-box",
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                }}
                            >
                                <HighlightedText text={result.text} terms={searchTerms} />
                            </Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {filteredResults.length > visibleCount && (
                <Box sx={{ mt: 4, textAlign: "center" }}>
                    <Button
                        variant="outlined"
                        size="large"
                        onClick={() => setVisibleCount((c) => c + 20)}
                        sx={{ px: 4, borderRadius: 8 }}
                    >
                        Cargar más resultados
                    </Button>
                </Box>
            )}
        </Box>
    );
}
