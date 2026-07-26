import React from 'react';

export const ProgressBar = ({ completed, total, label = "Meso Progress" }) => {
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return (
        <div>
            <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-mute">{label}</span>
                <span className="font-mono text-xs font-semibold tabular-nums text-teal">{percentage}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-line/50">
                <div className="h-full rounded-full bg-teal transition-all duration-500 ease-out-expo" style={{ width: `${percentage}%` }} />
            </div>
        </div>
    );
};
