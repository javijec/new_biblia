import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ChapterView from "../components/ChapterView";
import { useBible } from "../context/BibleContext";

export default function ReadPage() {
    const { bookId, chapter } = useParams();
    const navigate = useNavigate();
    const { loadBook, data } = useBible();
    const [currentBook, setCurrentBook] = useState(null);
    const [loading, setLoading] = useState(true);

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
        // TODO: Handle previous book
    };

    const handleNextChapter = () => {
        if (chapterNum < currentBook.chapters.length) {
            navigate(`/read/${bookId}/${chapterNum + 1}`);
        }
        // TODO: Handle next book
    };

    const handleWordSearch = (word) => {
        navigate(`/search?q=${encodeURIComponent(word)}`);
    };

    return (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ flex: 1, overflow: "hidden" }}>
                <ChapterView
                    chapter={{
                        ...currentChapterData,
                        bookTitle: currentBook.name,
                        bookId: currentBook.id
                    }}
                    onWordSearch={handleWordSearch}
                />
            </Box>

            {/* Navigation Footer */}
            <Box sx={{ display: "flex", justifyContent: "space-between", px: 2, pb: 2 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={handlePrevChapter}
                    disabled={chapterNum <= 1}
                >
                    Anterior
                </Button>
                <Button
                    endIcon={<ArrowForwardIcon />}
                    onClick={handleNextChapter}
                    disabled={chapterNum >= currentBook.chapters.length}
                >
                    Siguiente
                </Button>
            </Box>
        </Box>
    );
}
