import React, { useState } from 'react';

export const RenameWorkoutModal = ({ oldName, onSave, onClose }) => {
    const [newName, setNewName] = useState(oldName);

    const handleSave = () => {
        onSave(newName);
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Rename Workout</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Enter a new name for "{oldName}".</p>
            <input 
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full p-2 bg-white dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600"
                autoFocus
            />
            <div className="flex justify-end gap-2 mt-6">
                <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg">Cancel</button>
                <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save</button>
            </div>
        </div>
    );
};