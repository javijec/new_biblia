import React from 'react';
import { Box, Typography, Paper, Grid, Divider, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import HistoryIcon from '@mui/icons-material/History';
import DeleteIcon from '@mui/icons-material/Delete';
import { useBookmarks } from '../context/BookmarksContext';

export default function BookmarksPage() {
    const { bookmarks, history, toggleBookmark } = useBookmarks();
    const navigate = useNavigate();

    return (
        <Box sx={{ pb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Georgia, serif', fontWeight: 700, color: 'primary.main' }}>
                Mi Biblioteca
            </Typography>

            <Grid container spacing={4}>
                {/* History Section */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, height: '100%', bgcolor: 'background.paper' }} elevation={0}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <HistoryIcon color="action" />
                            <Typography variant="h6" fontWeight="bold">Recientes</Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />

                        {history.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                No hay historial reciente.
                            </Typography>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {history.map((item, idx) => (
                                    <Box
                                        key={idx}
                                        onClick={() => navigate(`/read/${item.bookId}/${item.chapter}`)}
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 1,
                                            cursor: 'pointer',
                                            '&:hover': { bgcolor: 'action.hover' }
                                        }}
                                    >
                                        <Typography variant="subtitle2" fontWeight="bold">
                                            {item.bookName} {item.chapter}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(item.date).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* Bookmarks Section */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, minHeight: '50vh', bgcolor: 'background.paper' }} elevation={0}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <BookmarkIcon color="primary" />
                            <Typography variant="h6" fontWeight="bold">Versículos Guardados</Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />

                        {bookmarks.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                No tienes versículos guardados. Selecciona un versículo mientras lees para guardarlo.
                            </Typography>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {bookmarks.map((item) => (
                                    <Paper
                                        key={item.id}
                                        variant="outlined"
                                        sx={{ p: 2, position: 'relative' }}
                                    >
                                        <IconButton
                                            size="small"
                                            onClick={() => toggleBookmark(item.bookId, item.bookName, item.chapter, item.verse, item.text)}
                                            sx={{ position: 'absolute', top: 8, right: 8 }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>

                                        <Box
                                            onClick={() => navigate(`/read/${item.bookId}/${item.chapter}`)}
                                            sx={{ cursor: 'pointer', pr: 4 }}
                                        >
                                            <Typography variant="subtitle1" fontWeight="bold" color="primary.main" gutterBottom>
                                                {item.bookName} {item.chapter}:{item.verse}
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                                                "{item.text}"
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                                Guardado el {new Date(item.date).toLocaleDateString()}
                                            </Typography>
                                        </Box>
                                    </Paper>
                                ))}
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
