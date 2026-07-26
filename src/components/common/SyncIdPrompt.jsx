import React, { useState, useContext } from 'react';
import { CloudUpload } from 'lucide-react';
import { FirebaseContext } from '../../contexts/FirebaseContext';

export const SyncIdPrompt = () => {
    const { handleSetCustomId } = useContext(FirebaseContext);
    const [tempId, setTempId] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSetCustomId(tempId);
    };

    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center py-10">
            <div className="relative mb-8 flex h-24 w-24 items-center justify-center">
                <span className="absolute inset-0 rounded-full border border-amber/40 animate-reticle" />
                <span className="absolute inset-3 rounded-full border border-line" />
                <img src="/brand/eagle-eye-mark.png" alt="" className="h-14 w-14 object-contain" />
            </div>
            <div className="ee-panel w-full max-w-sm p-6 text-center sm:p-8">
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-amber/10 text-amber">
                    <CloudUpload size={22} />
                </span>
                <h2 className="mt-4 font-display text-xl font-bold text-bone">Set up your sync ID</h2>
                <p className="mt-2 text-sm leading-6 text-mute">
                    One memorable ID backs up every set to the cloud and mirrors it across your devices.
                </p>
                <form onSubmit={handleSubmit} className="mt-5 space-y-3">
                    <input
                        type="text"
                        value={tempId}
                        onChange={e => setTempId(e.target.value)}
                        placeholder="e.g., john-doe-lifts"
                        className="ee-input text-center"
                        aria-label="Sync ID"
                    />
                    <button type="submit" className="ee-primary w-full">
                        Save &amp; continue
                    </button>
                </form>
            </div>
        </div>
    );
};
