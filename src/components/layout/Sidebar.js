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
            <div className={`fixed inset-0 bg-black/60 z-40 transition-opacity md:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setSidebarOpen(false)}></div>
            <div className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg z-50 transform transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                    <h2 className="font-bold text-lg text-gray-900 dark:text-white">Menu</h2>
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
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${currentPage === item.view ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
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
