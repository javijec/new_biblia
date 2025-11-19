import React, { createContext, useContext, useState, useCallback } from 'react';

const SelectionContext = createContext();

export function SelectionProvider({ children }) {
    // Store selections as a Map for easy lookup and iteration
    // Key: `${bookId}-${chapterNumber}-${verseNumber}`
    // Value: { bookId, bookTitle, chapterNumber, verseNumber, text }
    const [selections, setSelections] = useState(new Map());

    const toggleSelection = useCallback((verseData) => {
        setSelections((prev) => {
            const newSelections = new Map(prev);
            const key = `${verseData.bookId}-${verseData.chapterNumber}-${verseData.verseNumber}`;

            if (newSelections.has(key)) {
                newSelections.delete(key);
            } else {
                newSelections.set(key, verseData);
            }
            return newSelections;
        });
    }, []);

    const clearSelection = useCallback(() => {
        setSelections(new Map());
    }, []);

    const isSelected = useCallback((bookId, chapterNumber, verseNumber) => {
        return selections.has(`${bookId}-${chapterNumber}-${verseNumber}`);
    }, [selections]);

    const getSelectedVerses = useCallback(() => {
        return Array.from(selections.values());
    }, [selections]);

    return (
        <SelectionContext.Provider value={{
            selections,
            toggleSelection,
            clearSelection,
            isSelected,
            getSelectedVerses,
            selectionCount: selections.size
        }}>
            {children}
        </SelectionContext.Provider>
    );
}

export function useSelection() {
    const context = useContext(SelectionContext);
    if (!context) {
        throw new Error('useSelection must be used within a SelectionProvider');
    }
    return context;
}
