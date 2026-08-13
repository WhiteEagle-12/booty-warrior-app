import React from 'react';
import { PRIMARY_NAV } from './Sidebar';

export const MobileNav = ({ onNavChange, currentPage }) => {
    return (
        <nav
            className="fixed inset-x-0 bottom-0 z-50 border-t border-line/60 bg-panel/88 backdrop-blur-2xl md:hidden"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            aria-label="Primary"
        >
            <div className="grid grid-cols-4">
                {PRIMARY_NAV.map((tab) => {
                    const isActive = tab.match.includes(currentPage);
                    return (
                        <button
                            key={tab.view}
                            onClick={() => onNavChange(tab.view)}
                            aria-current={isActive ? 'page' : undefined}
                            className="relative flex flex-col items-center gap-1 py-2.5"
                        >
                            <span className={`h-1 w-1 rounded-full bg-amber transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                            <tab.icon size={20} className={isActive ? 'text-amber' : 'text-mute'} />
                            <span className={`text-[11px] font-medium ${isActive ? 'text-bone' : 'text-mute'}`}>{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};
