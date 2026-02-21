
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
const READING_ORDER = ['FR', 'PS', 'SR', 'GSP'];
const READING_LABELS = {
    FR: 'Primera lectura',
    PS: 'Salmo',
    SR: 'Segunda lectura',
    GSP: 'Evangelio'
};
const GOSPEL_CACHE_KEY = 'daily_gospel_cache_v1';
let cachedDate = null;
let cachedGospel = null;
let inFlightDate = null;
let inFlightPromise = null;

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

const readPersistedGospel = (date) => {
    try {
        const raw = localStorage.getItem(GOSPEL_CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (parsed?.date === date && parsed?.data) {
            return parsed.data;
        }
    } catch (error) {
        console.warn('No se pudo leer cache local del evangelio:', error);
    }
    return null;
};

const persistGospel = (date, data) => {
    try {
        localStorage.setItem(GOSPEL_CACHE_KEY, JSON.stringify({ date, data }));
    } catch (error) {
        console.warn('No se pudo persistir cache local del evangelio:', error);
    }
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

const sanitizeReadingHtml = (rawReading) => {
    let cleaned = rawReading.replace(/\r/g, '');

    cleaned = cleaned.replace(
        /<br\s*\/?>\s*<br\s*\/?>\s*(?:<br\s*\/?>\s*)?Extra[íi]do\s+de\s+la\s+Biblia[\s\S]*$/i,
        ''
    );
    cleaned = cleaned.replace(/Extra[íi]do\s+de\s+la\s+Biblia[\s\S]*$/i, '');

    cleaned = cleaned.trim();
    if (!cleaned) return '';

    // If after cleanup there is no readable text, treat as missing reading.
    const plainText = decodeHtml(cleaned).replace(/\s+/g, ' ').trim();
    if (!plainText) return '';

    return `<p>${cleaned}</p>`;
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

export const fetchDailyGospel = async ({ force = false } = {}) => {
    const date = formatDateForApi();

    if (!force && cachedDate === date && cachedGospel) {
        return cachedGospel;
    }

    if (!force) {
        const persisted = readPersistedGospel(date);
        if (persisted) {
            cachedDate = date;
            cachedGospel = persisted;
            return persisted;
        }
    }

    if (!force && inFlightDate === date && inFlightPromise) {
        return inFlightPromise;
    }

    inFlightDate = date;
    inFlightPromise = (async () => {
        const saintPromise = fetchReaderWithFallback({
            date,
            type: 'saint',
            content: null,
            langs: ['SP', 'AM'],
            optional: true
        });

        const sectionPromises = READING_ORDER.map(async (contentCode) => {
            const isRequired = contentCode === 'GSP';
            const [titleResult, contentResult] = await Promise.all([
                fetchReaderWithFallback({
                    date,
                    type: 'reading_lt',
                    content: contentCode,
                    langs: ['SP', 'AM'],
                    optional: !isRequired
                }),
                fetchReaderWithFallback({
                    date,
                    type: 'reading',
                    content: contentCode,
                    langs: ['SP', 'AM'],
                    optional: !isRequired
                })
            ]);

            if (!contentResult.text) {
                return null;
            }

            const citation = decodeHtml(titleResult.text);
            const formattedContent = sanitizeReadingHtml(contentResult.text);
            if (!formattedContent) {
                return null;
            }

            return {
                key: contentCode,
                label: READING_LABELS[contentCode],
                citation: citation || READING_LABELS[contentCode],
                content: formattedContent
            };
        });

        const [saintResult, ...sectionsWithNulls] = await Promise.all([saintPromise, ...sectionPromises]);
        const sections = sectionsWithNulls.filter(Boolean);
        const gospelSection = sections.find((section) => section.key === 'GSP');
        if (!gospelSection) {
            throw new Error('No se pudo obtener el evangelio del día.');
        }

        const gospel = {
            title: 'Lecturas del Día',
            citation: gospelSection.citation,
            saint: extractSaintOfDay(saintResult.text),
            date: new Date().toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            content: gospelSection.content,
            sections
        };
        cachedDate = date;
        cachedGospel = gospel;
        persistGospel(date, gospel);
        return gospel;
    })();

    try {
        return await inFlightPromise;
    } catch (error) {
        console.error('Error fetching Gospel:', error);
        throw error;
    } finally {
        inFlightPromise = null;
        inFlightDate = null;
    }
};
