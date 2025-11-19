import { verbConjugations, normalizeVerb } from '../hooks/verbConjugations';

// Cache for loaded books in the worker
const bookCache = {};
let bookIndex = null;

self.onmessage = async (e) => {
    const { type, payload } = e.data;

    if (type === 'INIT') {
        bookIndex = payload;
    } else if (type === 'SEARCH') {
        const { term } = payload;
        await performSearch(term);
    }
};

async function performSearch(term) {
    if (!term || !term.trim() || !bookIndex) {
        self.postMessage({ type: 'COMPLETE', results: [], terms: [] });
        return;
    }

    const normalizedTerm = term.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const baseVerb = normalizeVerb(normalizedTerm);
    const searchTerms = new Set([normalizedTerm, baseVerb]);

    if (baseVerb === normalizedTerm) {
        Object.entries(verbConjugations).forEach(([conjugation, infinitive]) => {
            if (infinitive === baseVerb) {
                searchTerms.add(conjugation);
            }
        });
    }

    const termsArray = Array.from(searchTerms);
    // Create regexes for matching whole words
    const searchRegexes = termsArray.map(t => new RegExp(`\\b${t}\\b`, 'gi')); // Case insensitive flag 'i' added just in case, though we normalize text

    const results = [];
    const books = bookIndex.books;

    for (let i = 0; i < books.length; i++) {
        const bookId = books[i].id;
        let book = bookCache[bookId];

        if (!book) {
            try {
                const response = await fetch(`/books/${bookId}.json`);
                if (!response.ok) continue;
                book = await response.json();
                bookCache[bookId] = book;
            } catch (err) {
                continue;
            }
        }

        if (book) {
            book.chapters.forEach(chapter => {
                chapter.verses.forEach(verse => {
                    const normalizedText = verse.text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

                    // Check if any of our terms match
                    const matches = searchRegexes.some(regex => {
                        regex.lastIndex = 0;
                        return regex.test(normalizedText);
                    });

                    if (matches) {
                        results.push({
                            bookTitle: book.name,
                            chapterNumber: chapter.number,
                            verseNumber: verse.number,
                            text: verse.text,
                            chapter: { bookId: book.id, bookTitle: book.name, number: chapter.number },
                            testament: books[i].testament, // Pass testament for filtering
                            query: term
                        });
                    }
                });
            });
        }

        if ((i + 1) % 5 === 0) {
            self.postMessage({ type: 'PROGRESS', count: i + 1, total: books.length });
        }
    }

    self.postMessage({ type: 'COMPLETE', results, terms: termsArray });
}
