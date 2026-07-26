import React from 'react';

/**
 * Standard view masthead: eyebrow chip, display title, one-line purpose
 * statement, and an optional actions slot.
 */
export const ViewHeader = ({ icon: Icon, eyebrow, title, description, children }) => (
    <div className="ee-panel relative mb-6 overflow-hidden p-5 sm:p-6">
        <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-amber/[0.06] blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
                <p className="ee-eyebrow text-amber">
                    {Icon && <Icon size={13} />}
                    {eyebrow}
                </p>
                <h1 className="mt-2.5 font-display text-2xl font-bold text-bone sm:text-3xl">{title}</h1>
                {description && <p className="mt-1.5 max-w-xl text-sm leading-6 text-mute">{description}</p>}
            </div>
            {children && <div className="flex flex-shrink-0 flex-wrap items-center gap-2">{children}</div>}
        </div>
    </div>
);
