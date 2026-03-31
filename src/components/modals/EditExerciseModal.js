import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, ChevronUp, PlusCircle, Dumbbell, X, XCircle } from 'lucide-react';
import { exerciseBank } from '../../data/exerciseBank';
import { generateUUID } from '../../utils/helpers';

export const EditExerciseModal = ({ exercise, exerciseName, onSave, onClose, onDelete, isNew }) => {
    const getInitialState = () => {
        if (isNew) {
            return {
                name: '',
                sets: '',
                reps: '',
                rir: [],
                rest: '',
                lastSetTechnique: '',
                equipment: 'barbell',
                muscles: {
                    primary: '',
                    secondary: '',
                    tertiary: '',
                    primaryContribution: 1,
                    secondaryContribution: 0.5,
                    tertiaryContribution: 0.25,
                }
            };
        }
        return {
            name: exerciseName || '',
            sets: exercise?.sets || 3,
            reps: exercise?.reps || '8-12',
            rir: Array.isArray(exercise?.rir) ? exercise.rir : Array(exercise?.sets || 3).fill('1-2'),
            rest: exercise?.rest || '2-3 min',
            lastSetTechnique: exercise?.lastSetTechnique || '',
            equipment: exercise?.equipment || 'barbell',
            muscles: {
                primary: exercise?.muscles?.primary || '',
                secondary: exercise?.muscles?.secondary || '',
                tertiary: exercise?.muscles?.tertiary || '',
                primaryContribution: exercise?.muscles?.primaryContribution ?? 1,
                secondaryContribution: exercise?.muscles?.secondaryContribution ?? 0.5,
                tertiaryContribution: exercise?.muscles?.tertiaryContribution ?? 0.25,
            }
        };
    };

    const [details, setDetails] = useState(getInitialState);

    useEffect(() => {
        const numSets = parseInt(details.sets, 10) || 0;
        if (details.rir.length !== numSets) {
            setDetails(prev => ({
                ...prev,
                rir: Array.from({ length: numSets }, (_, i) => prev.rir[i] || '0')
            }));
        }
    }, [details.sets, details.rir]);

    const handleRirChange = (index, value) => {
        const newRir = [...details.rir];
        newRir[index] = value;
        setDetails(prev => ({ ...prev, rir: newRir }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (['primary', 'secondary', 'tertiary', 'primaryContribution', 'secondaryContribution', 'tertiaryContribution'].includes(name)) {
            setDetails(prev => ({ ...prev, muscles: { ...prev.muscles, [name]: value } }));
        } else {
            setDetails(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleSave = () => {
        if (!details.name) {
            alert("Exercise name is required.");
            return;
        }
        const { name, ...otherDetails } = details;
        onSave(otherDetails, name);
    };

    const handleDelete = () => {
        if(window.confirm(`Are you sure you want to delete "${exerciseName}"? This will remove it from the master list and all workouts.`)){
            onDelete(exerciseName);
        }
    };

    return (
        <div>
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{isNew ? 'Create New Exercise' : `Editing ${exerciseName}`}</h2>
                {!isNew && (
                    <button onClick={handleDelete} className="text-red-500 hover:text-red-700 p-1">
                        <XCircle size={20} />
                    </button>
                )}
            </div>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exercise Name</label>
                    <input id="name" type="text" name="name" value={details.name} onChange={handleChange} className="w-full p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md border-gray-300 dark:border-gray-600" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="sets" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sets</label>
                        <input id="sets" type="number" name="sets" value={details.sets} onChange={handleChange} className="w-full p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md border-gray-300 dark:border-gray-600" />
                    </div>
                    <div>
                        <label htmlFor="reps" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reps</label>
                        <input id="reps" type="text" name="reps" value={details.reps} onChange={handleChange} placeholder="e.g., 8-12" className="w-full p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md border-gray-300 dark:border-gray-600" />
                    </div>
                </div>

                <div className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg space-y-3">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white -mt-1">RIR Targets Per Set</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {Array.from({ length: parseInt(details.sets, 10) || 0 }, (_, i) => (
                            <div key={i}>
                                <label htmlFor={`rir-${i}`} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Set {i + 1}</label>
                                <input id={`rir-${i}`} type="text" value={details.rir[i] || ''} onChange={(e) => handleRirChange(i, e.target.value)} className="w-full p-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md border-gray-300 dark:border-gray-600" />
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <label htmlFor="rest" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rest</label>
                    <input id="rest" type="text" name="rest" value={details.rest} onChange={handleChange} placeholder="e.g., 2-3 min" className="w-full p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md border-gray-300 dark:border-gray-600" />
                </div>
                 <div className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg space-y-4">
                     <h3 className="font-semibold text-lg text-gray-900 dark:text-white -mt-1 mb-2">Muscle Groups & Volume</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="primary" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primary Muscle</label>
                            <input id="primary" type="text" name="primary" value={details.muscles.primary} onChange={handleChange} className="w-full p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md border-gray-300 dark:border-gray-600" />
                        </div>
                        <div>
                            <label htmlFor="primaryContribution" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primary Contribution</label>
                            <select id="primaryContribution" name="primaryContribution" value={details.muscles.primaryContribution} onChange={handleChange} className="w-full p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md border-gray-300 dark:border-gray-600">
                                <option value={1}>100% (Primary)</option>
                                <option value={0.75}>75%</option>
                                <option value={0.5}>50%</option>
                                <option value={0.25}>25%</option>
                            </select>
                        </div>
                         <div>
                            <label htmlFor="secondary" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Secondary Muscle</label>
                            <input id="secondary" type="text" name="secondary" value={details.muscles.secondary} onChange={handleChange} className="w-full p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md border-gray-300 dark:border-gray-600" />
                        </div>
                        <div>
                            <label htmlFor="secondaryContribution" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Secondary Contribution</label>
                            <select id="secondaryContribution" name="secondaryContribution" value={details.muscles.secondaryContribution} onChange={handleChange} className="w-full p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md border-gray-300 dark:border-gray-600">
                                <option value={0.75}>75%</option>
                                <option value={0.5}>50% (Standard)</option>
                                <option value={0.25}>25%</option>
                                <option value={0}>0%</option>
                            </select>
                        </div>
                         <div>
                            <label htmlFor="tertiary" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tertiary Muscle</label>
                            <input id="tertiary" type="text" name="tertiary" value={details.muscles.tertiary} onChange={handleChange} className="w-full p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md border-gray-300 dark:border-gray-600" />
                        </div>
                        <div>
                            <label htmlFor="tertiaryContribution" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tertiary Contribution</label>
                             <select id="tertiaryContribution" name="tertiaryContribution" value={details.muscles.tertiaryContribution} onChange={handleChange} className="w-full p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md border-gray-300 dark:border-gray-600">
                                <option value={0.5}>50%</option>
                                <option value={0.25}>25% (Standard)</option>
                                <option value={0}>0%</option>
                            </select>
                        </div>
                    </div>
                </div>
                 <div>
                    <label htmlFor="lastSetTechnique" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Intensity Technique (e.g., Dropset)</label>
                    <input id="lastSetTechnique" type="text" name="lastSetTechnique" value={details.lastSetTechnique} onChange={handleChange} className="w-full p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md border-gray-300 dark:border-gray-600" />
                </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
                <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg">Cancel</button>
                <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save</button>
            </div>
        </div>
    );
};