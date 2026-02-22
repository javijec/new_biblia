import { verbConjugations, normalizeVerb } from '../hooks/verbConjugations';

// Cache for loaded books in the worker
const bookCache = {};
let bookIndex = null;
const getWorkerBookCacheKey = (bookId, version) => `${bookId}@${version || 'base'}`;
const SPANISH_STOP_WORDS = new Set([
    'a', 'al', 'de', 'del', 'el', 'la', 'las', 'los', 'en', 'y', 'o', 'u',
    'un', 'una', 'unos', 'unas', 'con', 'por', 'para', 'sin', 'que', 'se',
    'su', 'sus', 'lo', 'le', 'les', 'como', 'es', 'son'
]);

self.onmessage = async (e) => {
    const { type, payload } = e.data;

    if (type === 'INIT') {
        bookIndex = payload;
    } else if (type === 'SEARCH') {
        const { term, requestId } = payload;
        await performSearch(term, requestId);
    }
};

function normalizeText(text) {
    return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function countMatches(text, regex) {
    regex.lastIndex = 0;
    const matches = text.match(regex);
    return matches ? matches.length : 0;
}

function buildSearchPayload(term) {
    const normalizedQuery = normalizeText(term.trim());
    const tokens = normalizedQuery
        .split(/\s+/)
        .map(t => t.trim())
        .filter(Boolean)
        .filter(t => t.length >= 2 && !SPANISH_STOP_WORDS.has(t));

    const expandedTerms = new Set();
    tokens.forEach((token) => {
        expandedTerms.add(token);
        const baseVerb = normalizeVerb(token);
        expandedTerms.add(baseVerb);

        if (baseVerb === token) {
            Object.entries(verbConjugations).forEach(([conjugation, infinitive]) => {
                if (infinitive === baseVerb) {
                    expandedTerms.add(conjugation);
                }
            });
        }
    });

    if (tokens.length === 0 && normalizedQuery) {
        expandedTerms.add(normalizedQuery);
    }

    return {
        normalizedQuery,
        termsArray: Array.from(expandedTerms),
    };
}

function computeRelevance(normalizedText, normalizedQuery, termRegexes, phraseRegex) {
    const wordMatches = termRegexes.reduce((acc, regex) => acc + countMatches(normalizedText, regex), 0);
    const phraseMatches = phraseRegex ? countMatches(normalizedText, phraseRegex) : 0;

    const startsWithQuery = normalizedText.startsWith(normalizedQuery) ? 1 : 0;
    const score = (phraseMatches * 40) + (wordMatches * 10) + (startsWithQuery * 5);

    return { score, wordMatches, phraseMatches };
}

async function performSearch(term, requestId) {
    if (!term || !term.trim() || !bookIndex) {
        self.postMessage({ type: 'COMPLETE', requestId, results: [], terms: [], elapsedMs: 0, resultCount: 0 });
        return;
    }

    const startTime = performance.now();
    const { normalizedQuery, termsArray } = buildSearchPayload(term);
    const searchRegexes = termsArray.map(t => new RegExp(`\\b${escapeRegExp(t)}\\b`, 'g'));
    const phraseRegex = normalizedQuery.includes(' ')
        ? new RegExp(`\\b${escapeRegExp(normalizedQuery)}\\b`, 'g')
        : null;

    const results = [];
    const books = bookIndex.books;

    for (let i = 0; i < books.length; i++) {
        const bookId = books[i].id;
        const bookVersion = books[i].version || null;
        const cacheKey = getWorkerBookCacheKey(bookId, bookVersion);
        let book = bookCache[cacheKey];

        if (!book) {
            try {
                const versionedUrl = bookVersion
                    ? `/books/${bookId}.json?v=${encodeURIComponent(bookVersion)}`
                    : `/books/${bookId}.json`;
                let response;
                try {
                    response = await fetch(versionedUrl);
                } catch {
                    response = null;
                }

                if ((!response || !response.ok) && bookVersion) {
                    response = await fetch(`/books/${bookId}.json`).catch(() => null);
                }
                if (!response || !response.ok) continue;
                book = await response.json();
                bookCache[cacheKey] = book;
            } catch {
                continue;
            }
        }

        if (book) {
            book.chapters.forEach(chapter => {
                chapter.verses.forEach(verse => {
                    const normalizedText = normalizeText(verse.text);
                    const { score, wordMatches, phraseMatches } = computeRelevance(
                        normalizedText,
                        normalizedQuery,
                        searchRegexes,
                        phraseRegex
                    );

                    if (score > 0) {
                        results.push({
                            bookTitle: book.name,
                            chapterNumber: chapter.number,
                            verseNumber: verse.number,
                            text: verse.text,
                            chapter: { bookId: book.id, bookTitle: book.name, number: chapter.number },
                            testament: books[i].testament, // Pass testament for filtering
                            query: term,
                            wordMatches,
                            phraseMatches,
                            score,
                            bookOrder: i,
                        });
                    }
                });
            });
        }

        if ((i + 1) % 5 === 0) {
            self.postMessage({ type: 'PROGRESS', requestId, count: i + 1, total: books.length });
        }
    }

    results.sort((a, b) =>
        (b.score - a.score) ||
        (a.bookOrder - b.bookOrder) ||
        (a.chapterNumber - b.chapterNumber) ||
        (a.verseNumber - b.verseNumber)
    );

    results.forEach((result) => {
        delete result.bookOrder;
    });

    const elapsedMs = Math.round(performance.now() - startTime);
    self.postMessage({ type: 'COMPLETE', requestId, results, terms: termsArray, elapsedMs, resultCount: results.length });
}
