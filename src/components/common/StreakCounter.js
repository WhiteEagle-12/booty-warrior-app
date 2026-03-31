import React from 'react';
import { Flame } from 'lucide-react';

export const StreakCounter = ({ streak }) => {
    const getStreakColor = (s) => {
        if (s === 0) return 'text-gray-500';
        if (s < 3) return 'text-orange-400';
        if (s < 7) return 'text-red-500';
        if (s < 14) return 'text-rose-500';
        if (s < 21) return 'text-pink-500';
        if (s < 30) return 'text-purple-500';
        if (s < 45) return 'text-violet-500';
        if (s < 60) return 'text-blue-500';
        if (s < 90) return 'text-cyan-500';
        return 'text-emerald-500';
    };
    const streakColorClass = getStreakColor(streak);

    return (
        <div className="text-center w-full">
            <div className={`bg-gray-100 dark:bg-gray-700/50 rounded-xl p-4 flex items-center justify-center gap-2`}>
                <span className={`text-6xl font-bold ${streakColorClass} mr-2`}>{streak}</span>
                <Flame size={64} className={streakColorClass} />
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-2">Day Streak</div>
        </div>
    );
};