import React from 'react';
import { Flame } from 'lucide-react';

export const StreakCounter = ({ streak }) => {
    const getStreakColor = (s) => {
        if (s === 0) return 'text-mute';
        if (s < 7) return 'text-amber';
        if (s < 21) return 'text-coral';
        return 'text-teal';
    };
    const streakColorClass = getStreakColor(streak);

    return (
        <div className="w-full text-center">
            <div className="ee-panel-soft flex items-center justify-center gap-3 p-4">
                <span className={`font-display text-5xl font-bold ${streakColorClass}`}>{streak}</span>
                <Flame size={44} className={streakColorClass} />
            </div>
            <div className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-mute">Session streak</div>
        </div>
    );
};
