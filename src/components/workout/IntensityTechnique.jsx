import React from 'react';
import { Flame, Repeat, StretchVertical } from 'lucide-react';

export const IntensityTechnique = ({ technique }) => {
    if (!technique) return null;
    let icon = <Flame size={13} className="text-coral" />;
    if (technique.includes('LLP')) icon = <StretchVertical size={13} className="text-sky" />;
    if (technique.includes('Myo-reps')) icon = <Repeat size={13} className="text-amber" />;
    if (technique.includes('Stretch')) icon = <StretchVertical size={13} className="text-teal" />;
    return (
        <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-line bg-panel2 px-2.5 py-1.5 text-xs text-mute">
            {icon}
            <span><span className="font-bold text-bone">Finisher:</span> {technique}</span>
        </div>
    );
};
