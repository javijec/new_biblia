import React from "react";
import { Box, Typography, Paper, alpha } from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import DailyGospel from "../components/DailyGospel";

export default function HomePage() {
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
                    p: { xs: 0, md: 8 },
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    bgcolor: "transparent",
                }}
            >
                <Box
                    sx={{
                        width: 100,
                        height: 100,
                        bgcolor: "primary.50",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 4,
                        color: "primary.main",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                    }}
                >
                    <MenuBookIcon sx={{ fontSize: 50 }} />
                </Box>

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

                <Box sx={{ width: '100%', maxWidth: 1000, mb: 4 }}>
                    <DailyGospel />
                </Box>

                <Box
                    sx={{
                        p: 2,
                        bgcolor: "warning.50",
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "warning.200"
                    }}
                >
                    <Typography variant="body2" color="warning.900" fontWeight={500}>
                        👈 Selecciona un libro del menú lateral para comenzar
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
}
