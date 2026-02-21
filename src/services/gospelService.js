
/**
 * Service to fetch the Gospel of the Day from Evangelizo Reader API
 * Docs: /v2/reader.php?type=reading&content=GSP
 */

const EVANGELIZO_READER_PATHS = [
    '/api/evangelizo/v2/reader.php',
    'https://feed.evangelizo.org/v2/reader.php',
    'https://rss.evangelizo.org/v2/reader.php'
];
const DEFAULT_LANG = 'SP';

const buildReaderUrl = ({ basePath, date, type, lang = DEFAULT_LANG, content = 'GSP' }) => {
    const params = new URLSearchParams({ date, type, lang });
    if (content) params.set('content', content);
    return `${basePath}?${params.toString()}`;
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

const fetchReaderWithFallback = async ({ date, type, content, langs, optional = false }) => {
    const errors = [];

    for (const lang of langs) {
        for (const basePath of EVANGELIZO_READER_PATHS) {
            try {
                const url = buildReaderUrl({ basePath, date, type, lang, content });
                const text = await fetchText(url);
                return { text, lang };
            } catch (error) {
                errors.push(`[${type}] ${basePath} lang=${lang}: ${error.message}`);
            }
        }
    }

    if (optional) {
        console.warn(`Optional Evangelizo request failed (${type}):`, errors.join(' | '));
        return { text: '', lang: langs[0] };
    }

    throw new Error(`Evangelizo request failed (${type}). ${errors.join(' | ')}`);
};

export const fetchDailyGospel = async () => {
    const date = formatDateForApi();

    try {
        const [citationResult, contentResult, saintResult] = await Promise.all([
            fetchReaderWithFallback({ date, type: 'reading_lt', content: 'GSP', langs: ['SP', 'AM'] }),
            fetchReaderWithFallback({ date, type: 'reading', content: 'GSP', langs: ['SP', 'AM'] }),
            fetchReaderWithFallback({ date, type: 'saint', content: null, langs: ['SP', 'AM'], optional: true })
        ]);

        const citation = decodeHtml(citationResult.text);
        const readingLines = sanitizeReadingLines(contentResult.text);

        return {
            title: 'Evangelio del Día',
            citation,
            saint: extractSaintOfDay(saintResult.text),
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
