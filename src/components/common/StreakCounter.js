import React from 'react';
import { Flame } from 'lucide-react';

export const StreakCounter = ({ streak }) => {
    const getStreakColor = (s) => {
        if (s === 0) return 'text-gray-500';
        if (s < 5) return 'text-orange-400';
        if (s < 10) return 'text-red-500';
        if (s < 20) return 'text-blue-500';
        return 'text-purple-500';
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