import React, { useState } from 'react';
import { Dumbbell, BarChart2, Award, Trophy, BookOpen, Edit, Settings, LayoutDashboard, MoreHorizontal, X } from 'lucide-react';

const TABS = [
    { label: 'Program', view: 'main', icon: Dumbbell },
    { label: 'Dashboard', view: 'dashboard', icon: LayoutDashboard },
    { label: 'Analytics', view: 'analytics', icon: BarChart2 },
    { label: 'Trophies', view: 'achievements', icon: Award },
];

const MORE_ITEMS = [
    { label: 'Records', view: 'records', icon: Trophy, description: 'Your strongest estimated maxes' },
    { label: 'Program Hub', view: 'programHub', icon: BookOpen, description: 'Presets, import, and export' },
    { label: 'Edit Program', view: 'editProgram', icon: Edit, description: 'Build and tune your block' },
    { label: 'Settings', view: 'settings', icon: Settings, description: 'Sync, units, timer, and data' },
];

export const MobileNav = ({ onNavChange, currentPage }) => {
    const [moreOpen, setMoreOpen] = useState(false);
    const isMoreActive = MORE_ITEMS.some(item => item.view === currentPage);

    const go = (view) => {
        setMoreOpen(false);
        onNavChange(view);
    };

    return (
        <>
            {moreOpen && (
                <div className="fixed inset-0 z-[60] md:hidden">
                    <div className="absolute inset-0 bg-base/80 backdrop-blur-sm animate-fade-in" onClick={() => setMoreOpen(false)} />
                    <div className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-line bg-panel p-4 pb-8 shadow-2xl animate-sheet-in">
                        <div className="mb-4 flex items-center justify-between px-1">
                            <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-mute">More</p>
                            <button onClick={() => setMoreOpen(false)} className="ee-icon-btn" aria-label="Close menu">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                            {MORE_ITEMS.map(item => {
                                const isActive = currentPage === item.view;
                                return (
                                    <button
                                        key={item.view}
                                        onClick={() => go(item.view)}
                                        className={`rounded-2xl border p-4 text-left transition-colors ${
                                            isActive ? 'border-amber/40 bg-amber/10' : 'border-line bg-panel2 hover:bg-line/30'
                                        }`}
                                    >
                                        <item.icon size={20} className={isActive ? 'text-amber' : 'text-mute'} />
                                        <p className={`mt-2.5 text-sm font-bold ${isActive ? 'text-amber' : 'text-bone'}`}>{item.label}</p>
                                        <p className="mt-0.5 text-[11px] leading-4 text-mute">{item.description}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            <nav
                className="fixed inset-x-0 bottom-0 z-50 border-t border-line/70 bg-panel/90 backdrop-blur-xl md:hidden"
                style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
                aria-label="Primary"
            >
                <div className="grid grid-cols-5">
                    {TABS.map(tab => {
                        const isActive = currentPage === tab.view;
                        return (
                            <button
                                key={tab.view}
                                onClick={() => go(tab.view)}
                                aria-current={isActive ? 'page' : undefined}
                                className="relative flex flex-col items-center gap-1 py-2.5"
                            >
                                <span className={`absolute top-0 h-0.5 w-8 rounded-full bg-amber transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                                <tab.icon size={21} className={isActive ? 'text-amber' : 'text-mute'} />
                                <span className={`text-[10px] font-bold ${isActive ? 'text-amber' : 'text-mute'}`}>{tab.label}</span>
                            </button>
                        );
                    })}
                    <button onClick={() => setMoreOpen(true)} className="relative flex flex-col items-center gap-1 py-2.5">
                        <span className={`absolute top-0 h-0.5 w-8 rounded-full bg-amber transition-opacity ${isMoreActive ? 'opacity-100' : 'opacity-0'}`} />
                        <MoreHorizontal size={21} className={isMoreActive ? 'text-amber' : 'text-mute'} />
                        <span className={`text-[10px] font-bold ${isMoreActive ? 'text-amber' : 'text-mute'}`}>More</span>
                    </button>
                </div>
            </nav>
        </>
    );
};
