import React from 'react';
import { Flame } from 'lucide-react';

export const StreakCounter = ({ streak }) => {
    const getStreakColor = (s) => {
        if (s === 0) return 'text-[#9ca89d]';
        if (s < 7) return 'text-[#f3b548]';
        if (s < 21) return 'text-[#f36f52]';
        if (s < 60) return 'text-[#4dd6c6]';
        return 'text-emerald-300';
    };
    const streakColorClass = getStreakColor(streak);

    return (
        <div className="text-center w-full">
            <div className="rounded-xl border border-white/10 bg-white/[0.055] p-4 flex items-center justify-center gap-2">
                <span className={`text-6xl font-bold ${streakColorClass} mr-2`}>{streak}</span>
                <Flame size={64} className={streakColorClass} />
            </div>
            <div className="text-sm font-medium text-[#9ca89d] mt-2">Session Streak</div>
        </div>
    );
};
