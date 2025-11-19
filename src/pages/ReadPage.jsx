import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography, IconButton, Tooltip, useTheme, useMediaQuery } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIcon from "@mui/icons-material/ArrowForwardIos";
import ChapterView from "../components/ChapterView";
import { useBible } from "../context/BibleContext";

export default function ReadPage() {
    const { bookId, chapter } = useParams();
    const navigate = useNavigate();
    const { loadBook, data } = useBible();
    const [currentBook, setCurrentBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    useEffect(() => {
        const fetchBook = async () => {
            setLoading(true);
            try {
                const book = await loadBook(bookId);
                setCurrentBook(book);
            } catch (error) {
                console.error("Error loading book:", error);
            } finally {
                setLoading(false);
            }
        };

        if (bookId) {
            fetchBook();
        }
    }, [bookId, loadBook]);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!currentBook) {
        return (
            <Box sx={{ textAlign: "center", pt: 8 }}>
                <Typography variant="h5" color="error">Libro no encontrado</Typography>
            </Box>
        );
    }

    const chapterNum = parseInt(chapter, 10);
    const currentChapterData = currentBook.chapters.find(c => c.number === chapterNum);

    if (!currentChapterData) {
        return (
            <Box sx={{ textAlign: "center", pt: 8 }}>
                <Typography variant="h5" color="error">Capítulo no encontrado</Typography>
            </Box>
        );
    }

    // Navigation handlers
    const handlePrevChapter = () => {
        if (chapterNum > 1) {
            navigate(`/read/${bookId}/${chapterNum - 1}`);
        }
    };

    const handleNextChapter = () => {
        if (chapterNum < currentBook.chapters.length) {
            navigate(`/read/${bookId}/${chapterNum + 1}`);
        }
    };

    const handleWordSearch = (word) => {
        navigate(`/search?q=${encodeURIComponent(word)}`);
    };

    const NavButton = ({ direction, onClick, disabled, isFixed }) => {
        const Icon = direction === 'prev' ? ArrowBackIcon : ArrowForwardIcon;
        const title = direction === 'prev' ? "Capítulo Anterior" : "Siguiente Capítulo";

        if (disabled) return isFixed ? null : <Box sx={{ width: 48 }} />;

        return (
            <Tooltip title={title} placement={direction === 'prev' ? "right" : "left"}>
                <IconButton
                    onClick={onClick}
                    sx={{
                        bgcolor: "background.paper",
                        boxShadow: 3,
                        color: "text.primary",
                        width: 48,
                        height: 48,
                        "&:hover": {
                            bgcolor: "primary.main",
                            color: "white"
                        },
                        ...(isFixed ? {
                            position: "fixed",
                            top: "50%",
                            transform: "translateY(-50%)",
                            zIndex: 10,
                            opacity: 0.8,
                            [direction === 'prev' ? 'left' : 'right']: 16,
                        } : {
                            // Sticky styles handled by parent
                        })
                    }}
                >
                    <Icon fontSize="medium" />
                </IconButton>
            </Tooltip>
        );
    };

    return (
        <Box sx={{ position: "relative", minHeight: "100%", pb: 4 }}>
            {/* Desktop Layout: Sticky Buttons */}
            <Box sx={{ display: { xs: "none", lg: "flex" }, alignItems: "flex-start", justifyContent: "center", gap: 4 }}>
                <Box sx={{ position: "sticky", top: "50vh", transform: "translateY(-50%)" }}>
                    <NavButton
                        direction="prev"
                        onClick={handlePrevChapter}
                        disabled={chapterNum <= 1}
                    />
                </Box>

                <Box sx={{ flex: 1, maxWidth: 800 }}>
                    <ChapterView
                        chapter={{
                            ...currentChapterData,
                            bookTitle: currentBook.name,
                            bookId: currentBook.id
                        }}
                        onWordSearch={handleWordSearch}
                    />
                </Box>

                <Box sx={{ position: "sticky", top: "50vh", transform: "translateY(-50%)" }}>
                    <NavButton
                        direction="next"
                        onClick={handleNextChapter}
                        disabled={chapterNum >= currentBook.chapters.length}
                    />
                </Box>
            </Box>

            {/* Mobile/Tablet Layout: Fixed Buttons */}
            <Box sx={{ display: { xs: "block", lg: "none" } }}>
                <ChapterView
                    chapter={{
                        ...currentChapterData,
                        bookTitle: currentBook.name,
                        bookId: currentBook.id
                    }}
                    onWordSearch={handleWordSearch}
                />

                <NavButton
                    direction="prev"
                    onClick={handlePrevChapter}
                    disabled={chapterNum <= 1}
                    isFixed={true}
                />

                <NavButton
                    direction="next"
                    onClick={handleNextChapter}
                    disabled={chapterNum >= currentBook.chapters.length}
                    isFixed={true}
                />
            </Box>
        </Box>
    );
}
