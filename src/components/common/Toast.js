import React, { useContext } from 'react';
import { AppStateContext } from '../../contexts/AppStateContext';

const Toast = ({ message, level }) => {
    const levelStyles = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        bronze: 'bg-amber-600 text-white',
        silver: 'bg-slate-500 text-white',
        gold: 'bg-yellow-500 text-black',
        platinum: 'bg-cyan-400 text-black',
        pro: 'bg-teal-500 text-white',
        elite: 'bg-emerald-500 text-white',
        master: 'bg-lime-400 text-black',
    };
    const style = levelStyles[level] || levelStyles.success;
    return (
        <div className={`px-4 py-2 rounded-lg shadow-lg animate-fade-in-up ${style}`}>
            {message}
        </div>
    );
};

export const ToastContainer = () => {
    const { toasts } = useContext(AppStateContext);
    return (
        <div className="fixed bottom-4 right-4 z-[100] space-y-2">
            {toasts.map(toast => (
                <Toast key={toast.id} message={toast.message} level={toast.level} />
            ))}
        </div>
    );
};
