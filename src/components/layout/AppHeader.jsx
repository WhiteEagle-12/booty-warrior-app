import React, { useContext, useEffect, useState } from 'react';
import { CloudUpload, WifiOff, Check, Sun, Moon } from 'lucide-react';
import { FirebaseContext } from '../../contexts/FirebaseContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import { onSyncStatusChange } from '../../utils/syncQueue';

const SyncStatus = () => {
    const { isOnline } = useContext(FirebaseContext);
    const [pending, setPending] = useState(0);

    useEffect(() => onSyncStatusChange(setPending), []);

    if (!isOnline) {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-coral/30 bg-coral/10 px-2.5 py-1 text-[11px] font-bold text-coral">
                <WifiOff size={12} />
                Offline
            </span>
        );
    }
    if (pending > 0) {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber/30 bg-amber/10 px-2.5 py-1 text-[11px] font-bold text-amber">
                <CloudUpload size={12} className="animate-pulse" />
                Syncing
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-teal/25 bg-teal/10 px-2.5 py-1 text-[11px] font-bold text-teal">
            <Check size={12} />
            Synced
        </span>
    );
};

export const AppHeader = ({ programName, onNavChange }) => {
    const { theme, toggleTheme } = useContext(ThemeContext);

    return (
        <header className="sticky top-0 z-40 border-b border-line/60 bg-base/85 backdrop-blur-xl">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-3 sm:px-5">
                <button onClick={() => onNavChange('main')} className="flex min-w-0 items-center gap-3 text-left">
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-line bg-well md:hidden">
                        <img src="/brand/eagle-eye-mark.png" alt="" className="h-7 w-7 object-contain" />
                    </span>
                    <span className="min-w-0">
                        <span className="block font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-amber md:hidden">Eagle Eye Training</span>
                        <span className="hidden font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-mute md:block">Active program</span>
                        <span className="block truncate text-sm font-bold text-bone">{programName}</span>
                    </span>
                </button>
                <div className="flex items-center gap-2">
                    <SyncStatus />
                    <button
                        onClick={toggleTheme}
                        className="ee-icon-btn"
                        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                    </button>
                </div>
            </div>
        </header>
    );
};
