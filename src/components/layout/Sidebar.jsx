import React from 'react';
import { Dumbbell, BarChart2, Award, Trophy, BookOpen, Edit, Settings, LayoutDashboard } from 'lucide-react';

export const NAV_SECTIONS = [
    {
        label: 'Train',
        items: [
            { label: 'Program', view: 'main', icon: Dumbbell },
            { label: 'Dashboard', view: 'dashboard', icon: LayoutDashboard },
        ],
    },
    {
        label: 'Track',
        items: [
            { label: 'Analytics', view: 'analytics', icon: BarChart2 },
            { label: 'Achievements', view: 'achievements', icon: Award },
            { label: 'Records', view: 'records', icon: Trophy },
        ],
    },
    {
        label: 'Manage',
        items: [
            { label: 'Program Hub', view: 'programHub', icon: BookOpen },
            { label: 'Edit Program', view: 'editProgram', icon: Edit },
            { label: 'Settings', view: 'settings', icon: Settings },
        ],
    },
];

export const Sidebar = ({ onNavChange, currentPage }) => {
    return (
        <aside className="fixed left-0 top-0 z-40 hidden h-full w-64 flex-col border-r border-line/60 bg-panel/60 backdrop-blur-xl md:flex">
            <button onClick={() => onNavChange('main')} className="flex items-center gap-3 border-b border-line/60 p-5 text-left transition-colors hover:bg-panel2/50">
                <span className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-well">
                    <img src="/brand/eagle-eye-mark.png" alt="Eagle Eye Training logo" className="h-8 w-8 object-contain" />
                    <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-amber/20" />
                </span>
                <span>
                    <span className="block font-display text-sm font-bold uppercase tracking-[0.14em] text-bone">Eagle Eye</span>
                    <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-amber">Performance OS</span>
                </span>
            </button>

            <nav className="flex-grow overflow-y-auto p-4">
                {NAV_SECTIONS.map(section => (
                    <div key={section.label} className="mb-5">
                        <p className="mb-2 px-3 font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-mute/70">
                            {section.label}
                        </p>
                        <ul className="space-y-1">
                            {section.items.map(item => {
                                const isActive = currentPage === item.view;
                                return (
                                    <li key={item.view}>
                                        <button
                                            onClick={() => onNavChange(item.view)}
                                            aria-current={isActive ? 'page' : undefined}
                                            className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-150 ${
                                                isActive
                                                    ? 'bg-amber/10 text-amber'
                                                    : 'text-mute hover:bg-panel2 hover:text-bone'
                                            }`}
                                        >
                                            <span className={`absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-amber transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                                            <item.icon size={18} className={isActive ? 'text-amber' : 'text-mute transition-colors group-hover:text-bone'} />
                                            <span>{item.label}</span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            <div className="border-t border-line/60 p-4">
                <p className="text-center font-display text-[10px] uppercase tracking-[0.24em] text-mute/50">Precision over guesswork</p>
            </div>
        </aside>
    );
};
