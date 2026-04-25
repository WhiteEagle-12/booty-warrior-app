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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[60] p-4" onClick={closeModal}>
            <div className={`ee-panel rounded-2xl p-6 w-full ${modalSize}`} onClick={e => e.stopPropagation()}>
                <div className="flex justify-end -mt-2 -mr-2">
                    <button onClick={closeModal} className="p-2 rounded-full hover:bg-white/10"><X size={20} /></button>
                </div>
                <div className="mt-2">
                    {modalContent.content}
                </div>
            </div>
        </div>
    );
};
