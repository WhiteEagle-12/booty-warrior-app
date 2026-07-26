import React from 'react';

/**
 * The Eagle Eye reticle ring — the app's signature progress device.
 * A precision-instrument ring with an optional center slot.
 */
export const ProgressRing = ({
    size = 64,
    stroke = 5,
    progress = 0,
    color = 'rgb(var(--c-amber))',
    trackColor = 'rgb(var(--c-line))',
    children,
    className = '',
    animated = true,
}) => {
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const clamped = Math.max(0, Math.min(100, progress));
    const offset = circumference - (clamped / 100) * circumference;

    return (
        <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`Progress ${Math.round(clamped)}%`}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={trackColor}
                    strokeWidth={stroke}
                    opacity={0.45}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={animated ? { transition: 'stroke-dashoffset 550ms cubic-bezier(0.16, 1, 0.3, 1)' } : undefined}
                />
            </svg>
            {children && (
                <div className="absolute inset-0 flex items-center justify-center">
                    {children}
                </div>
            )}
        </div>
    );
};
