import React, { useContext } from 'react';
import { Dumbbell, BarChart2, Award, Trophy, BookOpen, Edit, Settings, LayoutDashboard, X } from 'lucide-react';
import { AppStateContext } from '../../contexts/AppStateContext';

export const Sidebar = ({ onNavChange, currentPage }) => {
    const { isSidebarOpen, setSidebarOpen } = useContext(AppStateContext);
    const navItems = [
        { label: 'Program', view: 'main', icon: Dumbbell },
        { label: 'Dashboard', view: 'dashboard', icon: LayoutDashboard },
        { label: 'Analytics', view: 'analytics', icon: BarChart2 },
        { label: 'Achievements', view: 'achievements', icon: Award },
        { label: 'Records', view: 'records', icon: Trophy },
        { label: 'Program Hub', view: 'programHub', icon: BookOpen },
        { label: 'Edit Program', view: 'editProgram', icon: Edit },
        { label: 'App Settings', view: 'settings', icon: Settings },
    ];

    return (
        <>
            <div className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity md:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setSidebarOpen(false)}></div>
            <div className={`fixed top-0 left-0 z-50 h-full w-72 border-r border-white/10 bg-[#090d12]/95 shadow-2xl backdrop-blur-xl transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                <div className="p-5 flex justify-between items-center border-b border-white/10">
                    <button onClick={() => onNavChange('main')} className="flex items-center gap-3 text-left">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                            <img src="/brand/eagle-eye-mark.png" alt="" className="h-9 w-9 object-contain" />
                        </span>
                        <span>
                            <span className="block text-sm font-black uppercase text-[#efe7d5]">Eagle Eye</span>
                            <span className="block text-xs font-semibold text-[#f3b548]">Performance OS</span>
                        </span>
                    </button>
                    <button onClick={() => setSidebarOpen(false)} className="p-2 md:hidden"><X /></button>
                </div>
                <nav className="p-4">
                    <ul className="space-y-2">
                        {navItems.map(item => (
                            <li key={item.view}>
                                <button 
                                    onClick={() => {
                                        onNavChange(item.view);
                                        setSidebarOpen(false);
                                    }} 
                                    className={`w-full flex items-center gap-3 rounded-xl p-3 text-sm font-semibold transition ${currentPage === item.view ? 'bg-[#f3b548] text-[#14100a] shadow-lg shadow-[#f3b548]/10' : 'text-[#9ca89d] hover:bg-white/[0.07] hover:text-[#efe7d5]'}`}
                                >
                                    <item.icon size={20} />
                                    <span>{item.label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </>
    );
};
