import React, { useContext } from 'react';
import { Menu, AlertTriangle } from 'lucide-react';
import { AppStateContext } from '../../contexts/AppStateContext';
import { FirebaseContext } from '../../contexts/FirebaseContext';
import { WingIcon } from '../common/WingIcon';

export const AppHeader = ({ onNavChange }) => {
    const { setSidebarOpen } = useContext(AppStateContext);
    const { isOnline } = useContext(FirebaseContext);

    return (
        <header className="bg-white dark:bg-gray-800/80 backdrop-blur-sm shadow-sm sticky top-0 z-40 p-4 flex justify-between items-center">
            <button onClick={() => setSidebarOpen(true)} className="p-2 md:hidden">
                <Menu />
            </button>
             <div className="flex-1 flex justify-center items-center gap-4">
                <button onClick={() => onNavChange('main')} className="flex items-center gap-2">
                     <WingIcon className="w-8 h-8" />
                     <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-600">Project Overload</h1>
                </button>
                {!isOnline && (
                    <div className="flex items-center gap-2 text-yellow-500 bg-yellow-100 dark:bg-yellow-900/50 px-3 py-1 rounded-lg text-sm font-semibold">
                        <AlertTriangle size={16} />
                        <span>Offline</span>
                    </div>
                )}
            </div>
            <div className="w-8 md:invisible"></div>
        </header>
    );
};
