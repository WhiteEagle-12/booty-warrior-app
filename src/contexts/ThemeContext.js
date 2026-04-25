import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { FirebaseContext } from './FirebaseContext';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
    const { customId, db } = useContext(FirebaseContext) || {};

    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        root.style.colorScheme = theme;
        localStorage.setItem('theme', theme);
        root.style.setProperty('--tooltip-bg', theme === 'dark' ? '#101820' : '#ffffff');
        root.style.setProperty('--tooltip-border', theme === 'dark' ? 'rgba(230, 221, 203, 0.18)' : '#d1d5db');
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme(prev => {
            const newTheme = prev === 'light' ? 'dark' : 'light';
            if (customId && db) {
                const userDocRef = doc(db, 'workoutLogs', customId);
                updateDoc(userDocRef, { theme: newTheme }).catch(error => {
                    console.warn('Unable to save theme preference:', error);
                });
            }
            return newTheme;
        });
    }, [customId, db]);

    return <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>{children}</ThemeContext.Provider>;
};
