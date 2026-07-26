import React, { useContext } from 'react';
import { AppStateContext } from '../../contexts/AppStateContext';
import { Award, CheckCircle, XCircle } from 'lucide-react';

const levelConfig = {
    success:  { accent: 'rgb(var(--c-teal))',  Icon: CheckCircle },
    error:    { accent: 'rgb(var(--c-coral))', Icon: XCircle },
    bronze:   { accent: '#d08a3e', Icon: Award },
    silver:   { accent: '#aab4c0', Icon: Award },
    gold:     { accent: '#f2c14e', Icon: Award },
    platinum: { accent: '#67e8f9', Icon: Award },
    pro:      { accent: '#2dd4bf', Icon: Award },
    elite:    { accent: '#34d399', Icon: Award },
    master:   { accent: '#a3e635', Icon: Award },
};

const Toast = ({ message, level }) => {
    const { accent, Icon } = levelConfig[level] || levelConfig.success;
    return (
        <div className="pointer-events-auto flex items-center gap-3 overflow-hidden rounded-xl border border-line bg-panel py-2.5 pl-3 pr-4 shadow-2xl animate-fade-in-up">
            <span className="h-8 w-1 rounded-full" style={{ backgroundColor: accent }} />
            <Icon size={18} style={{ color: accent }} className="flex-shrink-0" />
            <span className="text-sm font-bold text-bone">{message}</span>
        </div>
    );
};

export const ToastContainer = () => {
    const { toasts } = useContext(AppStateContext);
    return (
        <div className="pointer-events-none fixed bottom-24 right-4 z-[100] flex flex-col items-end gap-2 md:bottom-6 md:right-6">
            {toasts.map(toast => (
                <Toast key={toast.id} message={toast.message} level={toast.level} />
            ))}
        </div>
    );
};
