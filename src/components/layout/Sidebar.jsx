import React from 'react';
import { CalendarDays, TrendingUp, Layers, UserRound } from 'lucide-react';

export const PRIMARY_NAV = [
    { label: 'Today', view: 'main', icon: CalendarDays, match: ['main'] },
    { label: 'Progress', view: 'dashboard', icon: TrendingUp, match: ['dashboard', 'analytics', 'records', 'achievements'] },
    { label: 'Program', view: 'programHub', icon: Layers, match: ['programHub', 'editProgram'] },
    { label: 'You', view: 'settings', icon: UserRound, match: ['settings'] },
];

export const Sidebar = ({ onNavChange, currentPage }) => {
    return (
        <aside className="fixed left-0 top-0 z-40 hidden h-full w-60 flex-col border-r border-line/50 bg-panel/40 backdrop-blur-2xl md:flex">
            <button onClick={() => onNavChange('main')} className="flex items-center gap-3 px-5 pb-6 pt-7 text-left">
                <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-line bg-well">
                    <img src="/brand/eagle-eye-mark.png" alt="Eagle Eye logo" className="h-8 w-8 object-contain" />
                </span>
                <span>
                    <span className="block font-display text-xl font-medium leading-none text-bone">Eagle Eye</span>
                    <span className="mt-1 block text-[11px] font-medium tracking-[0.16em] text-amber">TRAINING</span>
                </span>
            </button>

            <nav className="flex-grow px-3">
                <ul className="space-y-1">
                    {PRIMARY_NAV.map((item) => {
                        const isActive = item.match.includes(currentPage);
                        return (
                            <li key={item.view}>
                                <button
                                    onClick={() => onNavChange(item.view)}
                                    aria-current={isActive ? 'page' : undefined}
                                    className={`flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                                        isActive ? 'bg-amber/10 text-bone' : 'text-mute hover:bg-panel2 hover:text-bone'
                                    }`}
                                >
                                    <item.icon size={18} className={isActive ? 'text-amber' : ''} />
                                    <span>{item.label}</span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="px-6 pb-6">
                <p className="font-display text-sm italic text-mute/70">See the next set clearly.</p>
            </div>
        </aside>
    );
};
