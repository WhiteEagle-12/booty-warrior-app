import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { ProgressRing } from './ProgressRing';

export const RestTimer = ({ initialTime, onClose, onTimerEnd }) => {
    const [time, setTime] = useState(initialTime);
    const [total, setTotal] = useState(initialTime);
    const finishedRef = useRef(false);
    const progress = total > 0 ? (time / total) * 100 : 0;

    useEffect(() => {
        if (time <= 0) {
            if (!finishedRef.current) {
                finishedRef.current = true;
                if (navigator.vibrate) navigator.vibrate([400, 120, 400]);
                onTimerEnd();
            }
            return;
        }
        const timerId = setInterval(() => setTime(t => t - 1), 1000);
        return () => clearInterval(timerId);
    }, [time, onTimerEnd]);

    const adjust = (delta) => {
        setTime(t => Math.max(0, t + delta));
        setTotal(t => Math.max(1, t + delta));
    };

    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    const isLow = time <= 10 && time > 0;

    return (
        <div className="fixed inset-x-3 bottom-20 z-[65] flex justify-center animate-sheet-in md:inset-x-auto md:bottom-6 md:right-6 md:left-auto">
            <div className="ee-panel flex w-full max-w-sm items-center gap-4 p-3.5 shadow-2xl">
                <ProgressRing
                    size={64}
                    stroke={5}
                    progress={progress}
                    color={isLow ? 'rgb(var(--c-coral))' : 'rgb(var(--c-amber))'}
                >
                    <span className={`font-mono text-sm font-semibold tabular-nums ${isLow ? 'text-coral' : 'text-bone'}`}>
                        {minutes}:{String(seconds).padStart(2, '0')}
                    </span>
                </ProgressRing>
                <div className="min-w-0 flex-grow">
                    <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-amber">Rest</p>
                    <p className="mt-0.5 truncate text-xs text-mute">Breathe. Next set when the ring closes.</p>
                    <div className="mt-2 flex items-center gap-1.5">
                        <button onClick={() => adjust(-15)} className="ee-icon-btn h-7 w-7 p-0" aria-label="Subtract 15 seconds">
                            <Minus size={13} />
                        </button>
                        <button onClick={() => adjust(15)} className="ee-icon-btn h-7 w-7 p-0" aria-label="Add 15 seconds">
                            <Plus size={13} />
                        </button>
                    </div>
                </div>
                <button onClick={onClose} className="ee-icon-btn self-start" aria-label="Dismiss rest timer">
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};
