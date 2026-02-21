
/**
 * Service to fetch the Gospel of the Day from Evangelizo Reader API
 * Docs: /v2/reader.php?type=reading&content=GSP
 */

const EVANGELIZO_READER_PATH = '/api/evangelizo/v2/reader.php';
const DEFAULT_LANG = 'SP';

const buildReaderUrl = ({ date, type, lang = DEFAULT_LANG, content = 'GSP' }) => {
    const params = new URLSearchParams({ date, type, lang });
    if (content) params.set('content', content);
    return `${EVANGELIZO_READER_PATH}?${params.toString()}`;
};

const formatDateForApi = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
};

const fetchText = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
    }
    return response.text();
};

const decodeHtml = (value) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<!doctype html><body>${value}`, 'text/html');
    return (doc.body.textContent || '').trim();
};

const sanitizeReadingLines = (rawReading) => {
    const withLineBreaks = rawReading.replace(/<br\s*\/?>/gi, '\n');
    const decoded = decodeHtml(withLineBreaks);
    return decoded
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line)
        .filter((line) =>
            !/extra[ií]do de la biblia/i.test(line) &&
            !/para recibir cada ma[nñ]ana el evangelio/i.test(line) &&
            !/evangeliodeldia\.org/i.test(line)
        );
};

const extractVerseStart = (citation) => {
    const match = citation.match(/(\d+)\s*[,.:]\s*(\d+)(?:\s*[-\u2013]\s*(\d+))?/);
    if (!match) return null;
    return Number.parseInt(match[2], 10);
};

const formatReadingWithVerseNumbers = (lines, citation) => {
    const verseStart = extractVerseStart(citation);
    if (!verseStart) {
        return `<p>${lines.join(' ')}</p>`;
    }

    const html = lines
        .map((line, index) => {
            const verse = verseStart + index;
            return `<sup style="font-size: 0.7em; font-weight: bold; color: #b45309; margin-right: 4px;">${verse}</sup>${line}`;
        })
        .join(' ');

    return `<p>${html}</p>`;
};

const extractSaintOfDay = (rawSaint) => {
    const anchorsAsLines = rawSaint
        .replace(/<a\b[^>]*>/gi, '')
        .replace(/<\/a>/gi, '\n')
        .replace(/<br\s*\/?>/gi, '\n');

    const lines = decodeHtml(anchorsAsLines)
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line);

    const uniqueLines = Array.from(new Set(lines));
    return uniqueLines[0] || '';
};

export const fetchDailyGospel = async () => {
    const date = formatDateForApi();

    try {
        const [citationRaw, contentRaw, saintRaw] = await Promise.all([
            fetchText(buildReaderUrl({ date, type: 'reading_lt', content: 'GSP' })),
            fetchText(buildReaderUrl({ date, type: 'reading', content: 'GSP' })),
            fetchText(buildReaderUrl({ date, type: 'saint', content: null }))
        ]);

        const citation = decodeHtml(citationRaw);
        const readingLines = sanitizeReadingLines(contentRaw);

        return {
            title: 'Evangelio del Día',
            citation,
            saint: extractSaintOfDay(saintRaw),
            date: new Date().toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            content: formatReadingWithVerseNumbers(readingLines, citation)
        };
    } catch (error) {
        console.error('Error fetching Gospel:', error);
        throw error;
    }
};
