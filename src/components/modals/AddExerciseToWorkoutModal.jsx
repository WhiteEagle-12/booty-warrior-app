import React, { useState, useMemo } from 'react';
import { Search, PlusCircle, BookOpen, Dumbbell } from 'lucide-react';
import { exerciseBank } from '../../data/exerciseBank';
import { normalizeExerciseDetails } from '../../utils/helpers';

export const AddExerciseToWorkoutModal = ({ masterExerciseList, onAdd, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('bank'); // 'bank' or 'mine'

    const listToDisplay = activeTab === 'bank' ? exerciseBank : masterExerciseList;
    const filteredExercises = useMemo(() => {
        return Object.keys(listToDisplay).filter(ex => ex.toLowerCase().includes(searchTerm.toLowerCase())).sort();
    }, [searchTerm, listToDisplay]);

    const handleAdd = (exerciseName) => {
        const details = normalizeExerciseDetails(listToDisplay[exerciseName]);
        onAdd(exerciseName, details);
    };

    return (
        <div>
            <p className="ee-eyebrow text-amber"><PlusCircle size={12} /> Build</p>
            <h2 className="mt-2 font-display text-xl font-bold text-bone">Add exercise</h2>
            <p className="mt-1.5 text-sm text-mute">Choose from the bank or your active list. Direct muscles count as 1.0 set; indirect as 0.5.</p>

            <div className="mt-5 flex gap-1 rounded-xl border border-line bg-well p-1">
                {[
                    { key: 'bank', label: 'Exercise bank', Icon: BookOpen },
                    { key: 'mine', label: 'My exercises', Icon: Dumbbell },
                ].map(({ key, label, Icon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                            activeTab === key ? 'bg-amber text-base' : 'text-mute hover:text-bone'
                        }`}
                    >
                        <Icon size={14} /> {label}
                    </button>
                ))}
            </div>

            <div className="relative mt-4">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mute" size={16} />
                <input
                    type="text"
                    placeholder="Search exercises..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="ee-input pl-10"
                    autoFocus
                />
            </div>

            <div className="mt-4 max-h-80 space-y-1.5 overflow-y-auto pr-1">
                {filteredExercises.map(ex => {
                    const details = normalizeExerciseDetails(listToDisplay[ex]);
                    const muscles = details?.muscles;
                    return (
                        <button
                            key={ex}
                            onClick={() => handleAdd(ex)}
                            className="group flex w-full items-start gap-3 rounded-xl border border-line bg-panel2/60 p-3 text-left transition-colors hover:border-amber/40 hover:bg-amber/[0.05]"
                        >
                            <PlusCircle size={16} className="mt-0.5 flex-shrink-0 text-teal transition-transform group-hover:scale-110" />
                            <span className="min-w-0">
                                <span className="block truncate text-sm font-bold text-bone">{ex}</span>
                                {muscles && (
                                    <span className="mt-0.5 block text-[11px] text-mute">
                                        {muscles.primary || 'Unassigned'} {muscles.primaryContribution ?? 1}x
                                        {muscles.secondary ? ` / ${muscles.secondary} ${muscles.secondaryContribution ?? 0.5}x` : ''}
                                        {muscles.tertiary ? ` / ${muscles.tertiary} ${muscles.tertiaryContribution ?? 0.5}x` : ''}
                                    </span>
                                )}
                            </span>
                        </button>
                    );
                })}
                {filteredExercises.length === 0 && (
                    <p className="py-8 text-center text-sm text-mute">No exercises found.</p>
                )}
            </div>

            <div className="mt-6 flex justify-end">
                <button onClick={onClose} className="ee-secondary">Cancel</button>
            </div>
        </div>
    );
};
