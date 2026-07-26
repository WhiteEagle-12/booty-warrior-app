import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

export const InfoTooltip = ({ content }) => {
    const [show, setShow] = useState(false);

    return (
        <span
            className="relative inline-flex items-center"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            <button
                type="button"
                onClick={() => setShow(s => !s)}
                className="text-mute transition-colors hover:text-bone"
                aria-label="More information"
                aria-expanded={show}
            >
                <HelpCircle size={14} />
            </button>
            {show && (
                <span className="absolute bottom-full left-1/2 z-20 mb-2 w-52 -translate-x-1/2 rounded-lg border border-line bg-panel p-2.5 text-left text-xs font-medium leading-5 text-bone shadow-2xl">
                    {content}
                </span>
            )}
        </span>
    );
};
