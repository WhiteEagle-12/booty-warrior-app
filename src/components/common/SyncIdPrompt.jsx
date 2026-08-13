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
        <div className="flex min-h-[78vh] flex-col items-center justify-center py-12">
            <img src="/brand/eagle-eye-mark.png" alt="" className="h-16 w-16 object-contain" />
            <h1 className="ee-display mt-8 text-center text-4xl sm:text-5xl">Welcome in.</h1>
            <p className="ee-lede mt-3 text-center">
                Pick a private athlete ID. It keeps every set with you — on this phone, and the next one.
            </p>
            <form onSubmit={handleSubmit} className="ee-panel mt-8 w-full max-w-sm p-6 sm:p-7">
                <label htmlFor="athlete-id" className="ee-label">Athlete ID</label>
                <input
                    id="athlete-id"
                    type="text"
                    value={tempId}
                    onChange={e => setTempId(e.target.value)}
                    placeholder="e.g. gavin-lifts"
                    className="ee-input text-center"
                    autoComplete="username"
                    autoFocus
                />
                <button type="submit" className="ee-primary mt-4 w-full">
                    Enter the journal
                </button>
                <p className="mt-4 text-center text-xs leading-5 text-mute">
                    Use the same ID later to restore this journal on another device.
                </p>
            </form>
        </div>
    );
};
