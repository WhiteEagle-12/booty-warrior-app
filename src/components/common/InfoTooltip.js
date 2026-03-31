import React, { useState, useContext } from 'react';
import { HelpCircle } from 'lucide-react';
import { ThemeContext } from '../../contexts/ThemeContext';

export const InfoTooltip = ({ content }) => {
    const { theme } = useContext(ThemeContext);
    const [show, setShow] = useState(false);

    // Using CSS variables set in the ThemeProvider for consistency
    const tooltipStyle = {
        backgroundColor: 'var(--tooltip-bg)',
        border: '1px solid var(--tooltip-border)',
        color: theme === 'dark' ? 'white' : 'black',
    };

    return (
        <div className="relative flex items-center"
             onMouseEnter={() => setShow(true)}
             onMouseLeave={() => setShow(false)}
        >
            <HelpCircle size={16} className="text-gray-500 dark:text-gray-400 cursor-pointer" />
            {show && (
                <div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 rounded-md shadow-lg z-10 text-xs"
                    style={tooltipStyle}
                >
                    {content}
                </div>
            )}
        </div>
    );
};