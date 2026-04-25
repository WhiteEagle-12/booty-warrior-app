import React from 'react';

export const ProgressBar = ({ completed, total, label = "Meso Progress" }) => {
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-[#9ca89d]">{label}</span>
                <span className="text-sm font-bold text-[#4dd6c6]">{percentage}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2.5">
                <div className="bg-[#4dd6c6] h-2.5 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};
