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
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add Exercise</h2>
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                <button onClick={() => setActiveTab('bank')} className={`flex items-center gap-2 px-4 py-2 -mb-px border-b-2 text-sm font-semibold ${activeTab === 'bank' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                    <BookOpen size={16} /> Exercise Bank
                </button>
                <button onClick={() => setActiveTab('mine')} className={`flex items-center gap-2 px-4 py-2 -mb-px border-b-2 text-sm font-semibold ${activeTab === 'mine' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                    <Dumbbell size={16} /> My Active Exercises
                </button>
            </div>
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search exercises..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-2 pl-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md border-gray-300 dark:border-gray-600"
                />
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                {filteredExercises.map(ex => (
                    <button
                        key={ex}
                        onClick={() => handleAdd(ex)}
                        className="w-full text-left p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 flex items-center gap-2"
                    >
                       <PlusCircle size={16} /> {ex}
                    </button>
                ))}
                 {filteredExercises.length === 0 && <p className="text-center text-gray-500 py-4">No exercises found.</p>}
            </div>
             <div className="flex justify-end gap-2 mt-6">
                <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg">Cancel</button>
            </div>
        </div>
    );
};