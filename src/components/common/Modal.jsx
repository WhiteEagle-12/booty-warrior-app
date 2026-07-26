import React, { useContext, useEffect } from 'react';
import { AppStateContext } from '../../contexts/AppStateContext';
import { X } from 'lucide-react';

const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-xl',
    xl: 'max-w-3xl',
};

export const Modal = () => {
    const { modalContent, closeModal } = useContext(AppStateContext);

    useEffect(() => {
        if (!modalContent) return;
        const handleKey = (e) => {
            if (e.key === 'Escape') closeModal();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [modalContent, closeModal]);

    if (!modalContent) return null;

    const modalSize = sizeClasses[modalContent.size] || sizeClasses.md;

    return (
        <div
            className="fixed inset-0 z-[70] flex items-end justify-center bg-base/80 p-0 backdrop-blur-sm animate-fade-in sm:items-center sm:p-6"
            onClick={closeModal}
            role="dialog"
            aria-modal="true"
        >
            <div
                className={`ee-panel relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-b-none rounded-t-3xl animate-sheet-in sm:rounded-2xl sm:animate-modal-in ${modalSize}`}
                onClick={e => e.stopPropagation()}
            >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber/50 to-transparent" />
                <div className="flex justify-center pt-2.5 sm:hidden">
                    <span className="h-1 w-10 rounded-full bg-line" />
                </div>
                <button
                    onClick={closeModal}
                    className="ee-icon-btn absolute right-3.5 top-3.5 z-10"
                    aria-label="Close dialog"
                >
                    <X size={18} />
                </button>
                <div className="overflow-y-auto p-5 pt-6 sm:p-7">
                    {modalContent.content}
                </div>
            </div>
        </div>
    );
};
