import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Box, Typography, CircularProgress, Paper, Grid, Chip, Button } from "@mui/material";
import { useBibleSearch } from "../hooks/useBibleSearch";

export default function SearchPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const query = searchParams.get("q");
    const { searchAllBooks } = useBibleSearch();

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [visibleCount, setVisibleCount] = useState(20);

    useEffect(() => {
        const performSearch = async () => {
            if (!query) return;

            setLoading(true);
            setResults([]);
            try {
                // TODO: This will be updated to use the Web Worker later
                const searchResults = await searchAllBooks(query);
                setResults(searchResults);
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setLoading(false);
            }
        };

        performSearch();
    }, [query, searchAllBooks]);

    if (loading) {
        return (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", pt: 8, gap: 2 }}>
                <CircularProgress />
                <Typography color="text.secondary">Buscando en las escrituras...</Typography>
            </Box>
        );
    }

    if (!results.length) {
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
            <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
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

            <Grid container spacing={2}>
                {results.slice(0, visibleCount).map((result, idx) => (
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
                                {result.text}
                            </Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {results.length > visibleCount && (
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
