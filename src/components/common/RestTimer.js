import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export const RestTimer = ({ initialTime, onClose, onTimerEnd }) => {
    const [time, setTime] = useState(initialTime);
    const progress = (time / initialTime) * 100;

    useEffect(() => {
        if (time <= 0) {
            if (navigator.vibrate) {
                navigator.vibrate([500, 100, 500]);
            }
            onTimerEnd();
            return;
        }
        const timerId = setInterval(() => {
            setTime(t => t - 1);
        }, 1000);
        return () => clearInterval(timerId);
    }, [time, onTimerEnd]);

    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800/90 backdrop-blur-sm text-white p-3 shadow-2xl z-50 flex items-center gap-4 animate-fade-in-up">
            <div className="flex-grow">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold text-gray-300">RESTING</span>
                    <span className="text-lg font-mono font-bold tracking-wider">
                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full transition-all duration-1000 linear" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors">
                <X size={20} />
            </button>
        </div>
    );
};
