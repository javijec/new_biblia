import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Box, Typography, CircularProgress, Paper, Chip, Tabs, Tab, alpha } from "@mui/material";
import { useBibleSearch } from "../hooks/useBibleSearch";
import { getAbbreviation } from "../utils/bookAbbreviations";

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
                            bgcolor: (theme) => alpha(theme.palette.warning.main, 0.3),
                            color: "warning.dark",
                            fontWeight: 700,
                            borderRadius: "3px",
                            px: 0.5,
                            py: 0.25
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
    const [visibleCount, setVisibleCount] = useState(50);
    const [filter, setFilter] = useState('all'); // 'all', 'old', 'new'

    // Infinite scroll
    const observerTarget = useRef(null);

    useEffect(() => {
        const performSearch = async () => {
            if (!query) return;
            if (!isReady) return;

            setLoading(true);
            setResults([]);
            setVisibleCount(50); // Reset on new search
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
        setVisibleCount(50); // Reset visible count on filter change
    };

    // Infinite scroll observer
    const loadMore = useCallback(() => {
        if (visibleCount < filteredResults.length) {
            setVisibleCount(prev => Math.min(prev + 50, filteredResults.length));
        }
    }, [visibleCount, filteredResults.length]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && !loading) {
                    loadMore();
                }
            },
            { threshold: 0.1 }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [loadMore, loading]);

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
                        label={`${filteredResults.length} versículos`}
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

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {filteredResults.slice(0, visibleCount).map((result, idx) => (
                    <Paper
                        key={idx}
                        elevation={0}
                        onClick={() => navigate(`/read/${result.chapter.bookId}/${result.chapterNumber}`)}
                        sx={{
                            p: 1.5,
                            cursor: "pointer",
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 1,
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 1.5,
                            transition: "all 0.2s ease",
                            "&:hover": {
                                borderColor: "primary.main",
                                bgcolor: "action.hover",
                            },
                        }}
                    >
                        <Typography
                            variant="body2"
                            sx={{
                                color: "primary.main",
                                fontWeight: 700,
                                fontFamily: "Georgia, serif",
                                whiteSpace: "nowrap",
                                minWidth: "fit-content",
                                pt: 0.25
                            }}
                        >
                            {getAbbreviation(result.bookTitle)} {result.chapterNumber}:{result.verseNumber}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.primary"
                            sx={{
                                fontFamily: "Georgia, serif",
                                flex: 1,
                                lineHeight: 1.5
                            }}
                        >
                            <HighlightedText text={result.text} terms={searchTerms} />
                        </Typography>
                    </Paper>
                ))}
            </Box>

            {/* Infinite scroll trigger + loading indicator */}
            {visibleCount < filteredResults.length && (
                <Box
                    ref={observerTarget}
                    sx={{
                        mt: 4,
                        textAlign: "center",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 2
                    }}
                >
                    <CircularProgress size={24} />
                    <Typography variant="body2" color="text.secondary">
                        Cargando más resultados...
                    </Typography>
                </Box>
            )}

            {/* End of results message */}
            {visibleCount >= filteredResults.length && filteredResults.length > 50 && (
                <Box sx={{ mt: 4, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary" fontStyle="italic">
                        Has visto todos los resultados ({filteredResults.length} versículos)
                    </Typography>
                </Box>
            )}
        </Box>
    );
}
