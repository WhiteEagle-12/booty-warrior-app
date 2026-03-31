import React, { useContext } from 'react';
import { AppStateContext } from '../../contexts/AppStateContext';
import { X } from 'lucide-react';

export const Modal = () => {
    const { modalContent, closeModal } = useContext(AppStateContext);
    if (!modalContent) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
    };
    
    const modalSize = sizeClasses[modalContent.size] || sizeClasses.md;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60] p-4" onClick={closeModal}>
            <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full ${modalSize}`} onClick={e => e.stopPropagation()}>
                <div className="flex justify-end -mt-2 -mr-2">
                    <button onClick={closeModal} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><X size={20} /></button>
                </div>
                <div className="mt-2">
                    {modalContent.content}
                </div>
            </div>
        </div>
    );
};
