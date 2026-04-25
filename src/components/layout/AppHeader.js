import React, { useContext } from 'react';
import { Menu, AlertTriangle, Radar, Wifi } from 'lucide-react';
import { AppStateContext } from '../../contexts/AppStateContext';
import { FirebaseContext } from '../../contexts/FirebaseContext';

export const AppHeader = ({ programName, onNavChange }) => {
    const { setSidebarOpen } = useContext(AppStateContext);
    const { isOnline } = useContext(FirebaseContext);

    return (
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#090d12]/[.86] px-3 py-3 backdrop-blur-xl sm:px-5">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <button onClick={() => setSidebarOpen(true)} className="rounded-lg border border-white/10 p-2 md:hidden">
                <Menu />
            </button>
             <div className="flex min-w-0 flex-1 items-center gap-3">
                <button onClick={() => onNavChange('main')} className="flex min-w-0 items-center gap-3 text-left">
                     <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                        <img src="/brand/eagle-eye-mark.png" alt="" className="h-8 w-8 object-contain" />
                     </span>
                     <span className="min-w-0">
                        <span className="block text-xs font-bold uppercase text-[#f3b548]">Eagle Eye Training</span>
                        <span className="block truncate text-sm text-[#9ca89d]">{programName}</span>
                     </span>
                </button>
            </div>
            <div className="flex items-center gap-2">
                <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[#9ca89d] sm:flex">
                    <Radar size={14} className="text-[#4dd6c6]" />
                    Live command deck
                </div>
                {isOnline ? (
                    <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                        <Wifi size={14} />
                        Synced
                    </div>
                ) : (
                    <div className="flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1.5 text-xs font-semibold text-yellow-300">
                        <AlertTriangle size={14} />
                        Offline
                    </div>
                )}
            </div>
            </div>
        </header>
    );
};
