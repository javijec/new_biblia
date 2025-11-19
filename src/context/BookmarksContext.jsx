import React, { createContext, useContext, useState, useEffect } from 'react';

const BookmarksContext = createContext();

export function BookmarksProvider({ children }) {
    const [bookmarks, setBookmarks] = useState(() => {
        const saved = localStorage.getItem('bible_bookmarks');
        return saved ? JSON.parse(saved) : [];
    });

    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem('bible_history');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('bible_bookmarks', JSON.stringify(bookmarks));
    }, [bookmarks]);

    useEffect(() => {
        localStorage.setItem('bible_history', JSON.stringify(history));
    }, [history]);

    const toggleBookmark = (bookId, bookName, chapter, verse, text) => {
        setBookmarks(prev => {
            const exists = prev.find(b =>
                b.bookId === bookId &&
                b.chapter === chapter &&
                b.verse === verse
            );

            if (exists) {
                return prev.filter(b => b !== exists);
            }

            return [{
                id: Date.now(),
                bookId,
                bookName,
                chapter,
                verse,
                text,
                date: new Date().toISOString()
            }, ...prev];
        });
    };

    const isBookmarked = (bookId, chapter, verse) => {
        return bookmarks.some(b =>
            b.bookId === bookId &&
            b.chapter === chapter &&
            b.verse === verse
        );
    };

    const addToHistory = (bookId, bookName, chapter) => {
        setHistory(prev => {
            // Remove if exists to move to top
            const filtered = prev.filter(h => !(h.bookId === bookId && h.chapter === chapter));
            return [{
                bookId,
                bookName,
                chapter,
                date: new Date().toISOString()
            }, ...filtered].slice(0, 20); // Keep last 20
        });
    };

    return (
        <BookmarksContext.Provider value={{
            bookmarks,
            history,
            toggleBookmark,
            isBookmarked,
            addToHistory
        }}>
            {children}
        </BookmarksContext.Provider>
    );
}

export function useBookmarks() {
    const context = useContext(BookmarksContext);
    if (!context) {
        throw new Error('useBookmarks debe usarse dentro de BookmarksProvider');
    }
    return context;
}
