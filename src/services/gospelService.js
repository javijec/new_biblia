
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

const stripHtml = (value) => value.replace(/<[^>]*>/g, '').trim();

export const fetchDailyGospel = async () => {
    const date = formatDateForApi();

    try {
        const [citationRaw, contentRaw] = await Promise.all([
            fetchText(buildReaderUrl({ date, type: 'reading_lt', content: 'GSP' })),
            fetchText(buildReaderUrl({ date, type: 'reading', content: 'GSP' }))
        ]);

        return {
            title: 'Evangelio del Día',
            citation: stripHtml(citationRaw),
            date: new Date().toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            content: `<p>${contentRaw.trim()}</p>`
        };
    } catch (error) {
        console.error('Error fetching Gospel:', error);
        throw error;
    }
};
