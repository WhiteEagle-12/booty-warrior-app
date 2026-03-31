import React from 'react';
import { Flame, Repeat, StretchVertical } from 'lucide-react';

export const IntensityTechnique = ({ technique }) => {
    if (!technique) return null;
    let icon = <Flame size={14} className="text-red-500" />;
    if (technique.includes('LLP')) icon = <StretchVertical size={14} className="text-blue-500" />;
    if (technique.includes('Myo-reps')) icon = <Repeat size={14} className="text-purple-500" />;
    if (technique.includes('Stretch')) icon = <StretchVertical size={14} className="text-green-500" />;
    return (<div className="mt-2 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-md">{icon}<div><span className="font-semibold">Intensity:</span> {technique}</div></div>);
};