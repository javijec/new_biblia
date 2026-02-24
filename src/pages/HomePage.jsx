import React, { lazy, Suspense, useEffect, useState } from "react";
import { Box, Typography, Paper, CircularProgress } from "@mui/material";

const DAILY_GOSPEL_DELAY_MS = 1200;
let hasDailyGospelInMemory = false;

const loadDailyGospel = () =>
    import("../components/DailyGospel").then((module) => {
        hasDailyGospelInMemory = true;
        return module;
    });

const DailyGospel = lazy(loadDailyGospel);

export default function HomePage() {
    const [showDailyGospel, setShowDailyGospel] = useState(hasDailyGospelInMemory);

    useEffect(() => {
        if (hasDailyGospelInMemory) return;

        const timer = setTimeout(() => {
            setShowDailyGospel(true);
            void loadDailyGospel();
        }, DAILY_GOSPEL_DELAY_MS);

        return () => clearTimeout(timer);
    }, []);

    return (
        <Box
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                opacity: 0.9,
                p: { xs: 0, md: 2 },
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 0, md: 6 },
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    bgcolor: "transparent",
                }}
            >


                <Typography
                    variant="h3"
                    gutterBottom
                    color="text.primary"
                    sx={{
                        fontWeight: 700,
                        fontFamily: "Georgia, serif",
                        fontSize: { xs: "2rem", md: "3rem" }
                    }}
                >
                    Biblia Digital
                </Typography>

                <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{
                        maxWidth: 600,
                        mb: 4,
                        fontWeight: 400,
                        lineHeight: 1.6
                    }}
                >
                    Una experiencia de lectura moderna para la Biblia del Pueblo de Dios.
                    Navega por los libros, busca versículos y estudia con comodidad.
                </Typography>

                <Box sx={{ width: '100%', maxWidth: 1000, mb: 4, minHeight: 120 }}>
                    {showDailyGospel ? (
                        <Suspense
                            fallback={
                                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                                    <CircularProgress size={28} />
                                </Box>
                            }
                        >
                            <DailyGospel />
                        </Suspense>
                    ) : (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                            <CircularProgress size={24} />
                        </Box>
                    )}
                </Box>


            </Paper>
        </Box>
    );
}
