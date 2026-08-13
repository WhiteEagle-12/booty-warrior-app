import React from 'react';

export const ViewHeader = ({ icon: Icon, eyebrow, title, description, children }) => (
    <div className="mb-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
                {eyebrow && (
                    <p className="ee-kicker">
                        {Icon && <Icon size={12} className="mr-2 inline -translate-y-px" />}
                        {eyebrow}
                    </p>
                )}
                <h1 className="ee-display mt-2 text-3xl sm:text-4xl">{title}</h1>
                {description && <p className="ee-lede mt-2">{description}</p>}
            </div>
            {children && <div className="flex flex-shrink-0 flex-wrap items-center gap-2">{children}</div>}
        </div>
    </div>
);
