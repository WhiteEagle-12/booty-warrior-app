import React, { createContext, useState, useCallback, useEffect, useRef } from 'react';
import { generateUUID } from '../utils/helpers';

export const AppStateContext = createContext();

export const AppStateProvider = ({ children }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [modalContent, setModalContent] = useState(null);
    const [toasts, setToasts] = useState([]);
    const scrollYRef = useRef(0);

    const openModal = useCallback((content, size = 'md') => {
        scrollYRef.current = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollYRef.current}px`;
        document.body.style.width = '100%';
        document.body.style.overflowY = 'scroll';
        
        setModalContent({ content, size });
    }, []);

    const closeModal = useCallback(() => {
        setModalContent(null);
    }, []);

    useEffect(() => {
        if (modalContent === null) {
            const isBodyFixed = document.body.style.position === 'fixed';
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.overflowY = '';
            if (isBodyFixed) {
                window.scrollTo(0, scrollYRef.current);
            }
        }
    }, [modalContent]);
    
    const addToast = useCallback((message, level = 'success') => {
        const id = generateUUID();
        setToasts(prev => [...prev, { id, message, level }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const value = {
        isSidebarOpen,
        setSidebarOpen,
        modalContent,
        openModal,
        closeModal,
        toasts,
        addToast,
    };

    return (
        <AppStateContext.Provider value={value}>
            {children}
        </AppStateContext.Provider>
    );
};
