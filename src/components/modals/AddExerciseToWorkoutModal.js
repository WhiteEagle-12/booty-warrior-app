import React, { useState, useMemo } from 'react';
import { Search, PlusCircle, BookOpen, Dumbbell } from 'lucide-react';
import { exerciseBank } from '../../data/exerciseBank';

export const AddExerciseToWorkoutModal = ({ masterExerciseList, onAdd, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('bank'); // 'bank' or 'mine'

    const listToDisplay = activeTab === 'bank' ? exerciseBank : masterExerciseList;
    const filteredExercises = useMemo(() => {
        return Object.keys(listToDisplay).filter(ex => ex.toLowerCase().includes(searchTerm.toLowerCase())).sort();
    }, [searchTerm, listToDisplay]);

    const handleAdd = (exerciseName) => {
        const details = listToDisplay[exerciseName];
        onAdd(exerciseName, details);
    };

    return (
        <div>
            <h2 className="text-xl font-black text-[#efe7d5] mb-1">Add Exercise</h2>
            <p className="mb-4 text-sm text-[#9ca89d]">Choose from the expanded exercise bank with prefilled fractional volume contributions.</p>
            <div className="flex border-b border-white/10 mb-4">
                <button onClick={() => setActiveTab('bank')} className={`flex items-center gap-2 px-4 py-2 -mb-px border-b-2 text-sm font-semibold ${activeTab === 'bank' ? 'border-[#f3b548] text-[#f3b548]' : 'border-transparent text-[#9ca89d] hover:text-[#efe7d5]'}`}>
                    <BookOpen size={16} /> Exercise Bank
                </button>
                <button onClick={() => setActiveTab('mine')} className={`flex items-center gap-2 px-4 py-2 -mb-px border-b-2 text-sm font-semibold ${activeTab === 'mine' ? 'border-[#f3b548] text-[#f3b548]' : 'border-transparent text-[#9ca89d] hover:text-[#efe7d5]'}`}>
                    <Dumbbell size={16} /> My Active Exercises
                </button>
            </div>
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca89d]" size={20} />
                <input
                    type="text"
                    placeholder="Search exercises..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="ee-input pl-10"
                />
            </div>
            <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
                {filteredExercises.map(ex => {
                    const details = listToDisplay[ex];
                    const muscles = details?.muscles;
                    return (
                    <button
                        key={ex}
                        onClick={() => handleAdd(ex)}
                        className="w-full text-left p-3 rounded-xl hover:bg-white/10 text-[#efe7d5] flex items-start gap-3 border border-white/10 bg-white/[0.035]"
                    >
                       <PlusCircle size={16} className="mt-1 text-[#4dd6c6]" />
                       <span>
                            <span className="block font-bold">{ex}</span>
                            {muscles && (
                                <span className="mt-1 block text-xs text-[#9ca89d]">
                                    {muscles.primary || 'Unassigned'} {muscles.primaryContribution ?? 1}x
                                    {muscles.secondary ? ` / ${muscles.secondary} ${muscles.secondaryContribution ?? 0.5}x` : ''}
                                    {muscles.tertiary ? ` / ${muscles.tertiary} ${muscles.tertiaryContribution ?? 0.25}x` : ''}
                                </span>
                            )}
                       </span>
                    </button>
                );})}
                 {filteredExercises.length === 0 && <p className="text-center text-[#9ca89d] py-4">No exercises found.</p>}
            </div>
             <div className="flex justify-end gap-2 mt-6">
                <button onClick={onClose} className="ee-secondary">Cancel</button>
            </div>
        </div>
    );
};
