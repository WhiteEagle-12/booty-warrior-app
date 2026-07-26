import React, { useState } from 'react';
import { Pencil } from 'lucide-react';

export const RenameWorkoutModal = ({ oldName, onSave, onClose }) => {
    const [newName, setNewName] = useState(oldName);

    const handleSave = () => {
        onSave(newName);
    };

    return (
        <div>
            <p className="ee-eyebrow text-amber"><Pencil size={12} /> Rename</p>
            <h2 className="mt-2 font-display text-xl font-bold text-bone">Rename workout</h2>
            <p className="mt-1.5 text-sm text-mute">Enter a new name for "{oldName}".</p>
            <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                className="ee-input mt-4"
                autoFocus
                aria-label="New workout name"
            />
            <div className="mt-6 flex justify-end gap-2">
                <button onClick={onClose} className="ee-secondary">Cancel</button>
                <button onClick={handleSave} className="ee-primary">Save</button>
            </div>
        </div>
    );
};
