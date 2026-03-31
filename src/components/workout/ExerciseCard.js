import React, { useState, useEffect, useMemo, useContext } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, Lightbulb, PlusCircle, History } from 'lucide-react';
import { AppStateContext } from '../../contexts/AppStateContext';
import { getExerciseDetails, isSetLogComplete } from '../../utils/helpers';
import { findLastPerformanceLogs, getProgressionSuggestion } from '../../utils/progression';
import { ExerciseHistoryModal } from './ExerciseHistoryModal';
import { SetRow } from './SetRow';
import { IntensityTechnique } from './IntensityTechnique';

export const ExerciseCard = ({ exerciseName, week, dayKey, allLogs, onLogChange, masterExerciseList, weightUnit, workoutDetails, programData }) => {
    const { openModal } = useContext(AppStateContext);
    const exercise = getExerciseDetails(exerciseName, masterExerciseList);
    const sets = Array.from({ length: Number(exercise?.sets) || 0 }, (_, i) => i + 1);
    const [numDropSets, setNumDropSets] = useState(0);

    useEffect(() => {
        let count = 0;
        while(allLogs[`${week}-${dayKey}-${exerciseName}-d${count + 1}`]) {
            count++;
        }
        setNumDropSets(count);
    }, []); // Only on mount

    const handleAddDropSet = () => {
        setNumDropSets(n => n + 1);
    };

    const isCompleted = useMemo(() => {
        return sets.every(setNumber => {
            const log = allLogs[`${week}-${dayKey}-${exerciseName}-${setNumber}`];
            return isSetLogComplete(log);
        });
    }, [allLogs, week, dayKey, exerciseName, sets]);

    const [isOpen, setIsOpen] = useState(!isCompleted);
    
    const showHistory = () => {
        openModal(<ExerciseHistoryModal exerciseName={exerciseName} allLogs={allLogs} programData={programData} />, 'lg');
    };

    if (!exercise) return <div className="bg-red-100 dark:bg-red-900/50 p-4 rounded-lg text-red-700 dark:text-red-300">Exercise "{exerciseName}" not found in master list.</div>;

    const lastPerformanceData = useMemo(() => findLastPerformanceLogs(exerciseName, week, dayKey, allLogs, programData), [exerciseName, week, dayKey, allLogs, programData]);
    const suggestion = useMemo(() => getProgressionSuggestion(exerciseName, lastPerformanceData, masterExerciseList, programData), [exerciseName, lastPerformanceData, masterExerciseList, programData]);
    
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div onClick={() => setIsOpen(!isOpen)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setIsOpen(!isOpen)} className="w-full p-4 text-left flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{exerciseName}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{exercise.sets} sets &times; {exercise.reps}</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button onClick={(e) => { e.stopPropagation(); showHistory(); }} className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
                        <History size={18} className="text-teal-500 dark:text-teal-400" />
                    </button>
                    {isCompleted && <CheckCircle className="text-green-500 animate-pop-in" />}
                    {isOpen ? <ChevronUp className="text-gray-500 dark:text-gray-400" /> : <ChevronDown className="text-gray-500 dark:text-gray-400" />}
                </div>
            </div>
            {isOpen && (
                <div className="p-4" onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                        if (isCompleted) setIsOpen(false);
                    }
                }}>
                    <div className="mb-3 p-3 flex items-start gap-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
                        <Lightbulb className="text-blue-500 dark:text-blue-400 flex-shrink-0 mt-1" size={20}/>
                        <p className="text-sm text-blue-800 dark:text-blue-200"><span className="font-bold">Suggestion:</span> {suggestion}</p>
                    </div>
                    <div className="overflow-x-auto">
                        <div className="hidden sm:grid grid-cols-7 gap-2 mb-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 min-w-[540px]">
                            <span></span>
                            <span className="text-center">Target Reps</span>
                            <span className="text-center">Target Effort</span>
                            <span className="text-center">Load ({weightUnit})</span>
                            <span className="text-center">Reps</span>
                            <span className="text-center">RIR</span>
                            <span></span>
                        </div>
                        <div className="space-y-2 min-w-[540px]">
                            {sets.map(setNumber => (
                                <SetRow 
                                    key={setNumber} 
                                    setNumber={setNumber}
                                    setIdentifier={`${setNumber}`}
                                    logData={allLogs[`${week}-${dayKey}-${exerciseName}-${setNumber}`] || {}} 
                                    onLogChange={(id, f, v) => onLogChange(exerciseName, id, f, v, false)}
                                    lastSetData={lastPerformanceData.lastSession ? lastPerformanceData.lastSession[setNumber] : null}
                                    exerciseDetails={exercise}
                                    weightUnit={weightUnit}
                                    exerciseName={exerciseName}
                                    totalSets={Number(exercise.sets)}
                                />
                            ))}
                            {Array.from({ length: numDropSets }).map((_, index) => {
                                const setIdentifier = `d${index + 1}`;
                                return (
                                    <SetRow
                                        key={setIdentifier}
                                        setIdentifier={setIdentifier}
                                        setNumber={sets.length + index + 1}
                                        displaySetNumber={`Drop ${index + 1}`}
                                        isDropSet={true}
                                        logData={allLogs[`${week}-${dayKey}-${exerciseName}-${setIdentifier}`] || {}}
                                        onLogChange={(id, field, value) => onLogChange(exerciseName, id, field, value, true)}
                                        lastSetData={null}
                                        exerciseDetails={exercise}
                                        weightUnit={weightUnit}
                                        exerciseName={exerciseName}
                                        totalSets={sets.length + numDropSets}
                                    />
                                );
                            })}
                        </div>
                    </div>
                    {exercise.lastSetTechnique && !exercise.lastSetTechnique.toLowerCase().includes('drop') && <IntensityTechnique technique={exercise.lastSetTechnique} />}
                    {isCompleted && exercise.lastSetTechnique?.toLowerCase().includes('drop') && (
                        <div className="p-4 pt-0">
                            <button onClick={handleAddDropSet} className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/50 font-semibold">
                                <PlusCircle size={16}/> Add Drop Set
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};