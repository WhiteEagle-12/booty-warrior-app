import React, { useState, useContext } from 'react';
import { FirebaseContext } from '../../contexts/FirebaseContext';

export const SyncIdPrompt = () => {
    const { handleSetCustomId } = useContext(FirebaseContext);
    const [tempId, setTempId] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSetCustomId(tempId);
    };

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 w-full max-w-sm">
                <h2 className="text-xl font-bold mb-4 text-center">Set Up Sync ID</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm text-center">
                    Create a Sync ID to back up and sync your data across devices.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        value={tempId}
                        onChange={e => setTempId(e.target.value)}
                        placeholder="Enter Sync ID"
                        className="w-full p-2 bg-white dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600 shadow-sm"
                    />
                    <button
                        type="submit"
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                    >
                        Save
                    </button>
                </form>
            </div>
        </div>
    );
};