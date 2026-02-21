import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import CloseIcon from '@mui/icons-material/Close';

function isLocalhostEnv() {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host === '::1';
}

async function persistVerseToJson({ bookId, chapterNumber, verseNumber, text, target = 'both' }) {
  const response = await fetch('/__local/book-verse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookId, chapterNumber, verseNumber, text, target }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || 'No se pudo guardar en JSON');
  }

  return response.json();
}

export default function BookCorrectionsPanel({ book, chapter, onApply, onPersist }) {
  const [open, setOpen] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState('');
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [baseVerseTexts, setBaseVerseTexts] = useState({});

  const isLocalhost = isLocalhostEnv();
  const verses = useMemo(() => chapter?.verses || [], [chapter]);

  useEffect(() => {
    if (!chapter?.verses?.length) {
      setSelectedVerse('');
      setText('');
      setBaseVerseTexts({});
      return;
    }

    const nextBase = {};
    chapter.verses.forEach((verse) => {
      nextBase[String(verse.number)] = verse.text;
    });
    setBaseVerseTexts(nextBase);
    setSelectedVerse(String(chapter.verses[0].number));
    setStatus('');
  }, [chapter?.number, chapter?.verses]);

  useEffect(() => {
    if (!selectedVerse) {
      setText('');
      return;
    }
    const verse = verses.find((v) => String(v.number) === String(selectedVerse));
    setText(verse?.text || '');
  }, [selectedVerse, verses]);

  if (!isLocalhost || !book || !chapter) return null;

  const handleSave = async () => {
    if (!selectedVerse) return;
    setSaving(true);
    setStatus('');
    try {
      const result = await persistVerseToJson({
        bookId: book.id,
        chapterNumber: chapter.number,
        verseNumber: selectedVerse,
        text,
        target: 'public',
      });
      onApply?.(selectedVerse, text);
      await onPersist?.();
      setStatus(`Guardado en JSON (version: ${result.version || 'n/a'})`);
    } catch (error) {
      setStatus(`Error guardando: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedVerse) return;
    const originalText = baseVerseTexts[String(selectedVerse)] || '';
    setSaving(true);
    setStatus('');
    try {
      const result = await persistVerseToJson({
        bookId: book.id,
        chapterNumber: chapter.number,
        verseNumber: selectedVerse,
        text: originalText,
        target: 'public',
      });
      setText(originalText);
      onApply?.(selectedVerse, originalText);
      await onPersist?.();
      setStatus(`Versiculo restaurado en JSON (version: ${result.version || 'n/a'})`);
    } catch (error) {
      setStatus(`Error restaurando: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ position: 'fixed', right: 16, bottom: 16, zIndex: 1450 }}>
      {!open ? (
        <Button variant="contained" size="small" startIcon={<BuildIcon />} onClick={() => setOpen(true)}>
          Corregir JSON
        </Button>
      ) : (
        <Paper sx={{ width: 420, maxWidth: 'calc(100vw - 32px)', p: 1.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              Editor JSON ({book.name} {chapter.number})
            </Typography>
            <IconButton size="small" onClick={() => setOpen(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Stack spacing={1.2}>
            <TextField
              select
              size="small"
              label="Versículo"
              value={selectedVerse}
              onChange={(e) => setSelectedVerse(e.target.value)}
            >
              {verses.map((verse) => (
                <MenuItem key={verse.number} value={String(verse.number)}>
                  {verse.number}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              multiline
              minRows={4}
              maxRows={10}
              size="small"
              label="Texto"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <Stack direction="row" spacing={1}>
              <Button size="small" variant="contained" onClick={handleSave} disabled={saving}>
                Guardar JSON
              </Button>
              <Button size="small" variant="outlined" onClick={handleRestore} disabled={saving}>
                Restaurar verso
              </Button>
            </Stack>

            <Typography variant="caption" color={status.startsWith('Error') ? 'error.main' : 'text.secondary'}>
              {status || 'Solo disponible en localhost (vite dev).'}
            </Typography>
          </Stack>
        </Paper>
      )}
    </Box>
  );
}
