import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import ChapterView from "../components/ChapterView";
import { useBible } from "../context/BibleContext";
import { logError, logEvent } from "../utils/telemetry";

export default function ReadPage() {
    const { bookId, chapter } = useParams();
    const navigate = useNavigate();
    const { loadBook } = useBible();
    const [currentBook, setCurrentBook] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBook = async () => {
            setLoading(true);
            try {
                const book = await loadBook(bookId);
                setCurrentBook(book);
            } catch (error) {
                logError("read_page_load_failed", error, { bookId, chapter });
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
            logEvent("chapter_navigation", { direction: "prev", bookId, chapter: chapterNum });
            navigate(`/read/${bookId}/${chapterNum - 1}`);
        }
    };

    const handleNextChapter = () => {
        if (chapterNum < currentBook.chapters.length) {
            logEvent("chapter_navigation", { direction: "next", bookId, chapter: chapterNum });
            navigate(`/read/${bookId}/${chapterNum + 1}`);
        }
    };

    const handleWordSearch = (word) => {
        logEvent("word_search_from_read", { bookId, chapter: chapterNum, wordLength: word?.length || 0 });
        navigate(`/search?q=${encodeURIComponent(word)}`);
    };

    return (
        <Box sx={{ position: "relative", minHeight: "100%", pb: 4 }}>
            <ChapterView
                chapter={{
                    ...currentChapterData,
                    bookTitle: currentBook.name,
                    bookId: currentBook.id
                }}
                onWordSearch={handleWordSearch}
                onPrevChapter={handlePrevChapter}
                onNextChapter={handleNextChapter}
                hasPrev={chapterNum > 1}
                hasNext={chapterNum < currentBook.chapters.length}
            />
        </Box>
    );
}
