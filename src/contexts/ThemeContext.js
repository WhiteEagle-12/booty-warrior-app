import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { FirebaseContext } from './FirebaseContext';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('dark');
    const { customId, db } = useContext(FirebaseContext) || {};

    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        root.style.setProperty('--tooltip-bg', theme === 'dark' ? '#374151' : '#ffffff');
        root.style.setProperty('--tooltip-border', theme === 'dark' ? '#4b5563' : '#d1d5db');
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme(prev => {
            const newTheme = prev === 'light' ? 'dark' : 'light';
            if (customId && db) {
                const userDocRef = doc(db, 'workoutLogs', customId);
                updateDoc(userDocRef, { theme: newTheme });
            }
            return newTheme;
        });
    }, [customId, db]);

    return <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>{children}</ThemeContext.Provider>;
};
