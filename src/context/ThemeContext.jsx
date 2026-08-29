// src/context/ThemeContext.jsx
//
// Explicit light/dark theme, controlled via a `dark` class on <html> (see
// tailwind.config.js `darkMode: 'class'`) rather than prefers-color-scheme.
// The saved preference is also read synchronously in index.html, before
// React mounts, so there's no flash of the wrong theme on load — this
// provider just keeps <html> and localStorage in sync as the user toggles.
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export const THEME_STORAGE_KEY = 'kambeng-theme';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

const getInitialTheme = () => {
    try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        if (stored === 'dark' || stored === 'light') return stored;
    } catch {
        // localStorage unavailable (private browsing, disabled storage, etc.)
    }
    return 'light';
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        try {
            localStorage.setItem(THEME_STORAGE_KEY, theme);
        } catch {
            // Ignore write failures — theme just won't persist this session.
        }
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
