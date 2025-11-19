import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const THEMES = {
    light: {
        name: 'Claro',
        bg: '#fdfbf7',
        paper: '#ffffff',
        text: '#292524',
        primary: '#b45309'
    },
    sepia: {
        name: 'Sepia',
        bg: '#f4ecd8',
        paper: '#fdf6e3',
        text: '#5b4636',
        primary: '#8f5e1e'
    },
    dark: {
        name: 'Oscuro',
        bg: '#1c1917',
        paper: '#292524',
        text: '#e7e5e4',
        primary: '#d97706'
    }
};

export function SettingsProvider({ children }) {
    const [fontSize, setFontSize] = useState(() => {
        const saved = localStorage.getItem('bible_font_size');
        return saved ? parseInt(saved, 10) : 18;
    });

    const [themeMode, setThemeMode] = useState(() => {
        return localStorage.getItem('bible_theme') || 'light';
    });

    const [fontFamily, setFontFamily] = useState(() => {
        return localStorage.getItem('bible_font_family') || 'serif';
    });

    useEffect(() => {
        localStorage.setItem('bible_font_size', fontSize);
    }, [fontSize]);

    useEffect(() => {
        localStorage.setItem('bible_theme', themeMode);
    }, [themeMode]);

    useEffect(() => {
        localStorage.setItem('bible_font_family', fontFamily);
    }, [fontFamily]);

    const currentTheme = THEMES[themeMode];

    return (
        <SettingsContext.Provider value={{
            fontSize,
            setFontSize,
            themeMode,
            setThemeMode,
            fontFamily,
            setFontFamily,
            currentTheme,
            THEMES
        }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings debe usarse dentro de SettingsProvider');
    }
    return context;
}
