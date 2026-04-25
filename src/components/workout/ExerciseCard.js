import React, { useState, useEffect, useMemo, useContext } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, Lightbulb, PlusCircle, History, Target } from 'lucide-react';
import { AppStateContext } from '../../contexts/AppStateContext';
import { getExerciseDetails, isSetLogComplete } from '../../utils/helpers';
import { findLastPerformanceLogs, getProgressionSuggestion } from '../../utils/progression';
import { ExerciseHistoryModal } from './ExerciseHistoryModal';
import { SetRow } from './SetRow';
import { IntensityTechnique } from './IntensityTechnique';
import { getExerciseCompletion } from '../../utils/trainingMetrics';

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
    const completion = useMemo(() => getExerciseCompletion(exerciseName, week, dayKey, allLogs, masterExerciseList), [exerciseName, week, dayKey, allLogs, masterExerciseList]);
    
    const showHistory = () => {
        openModal(<ExerciseHistoryModal exerciseName={exerciseName} allLogs={allLogs} programData={programData} />, 'lg');
    };

    const lastPerformanceData = useMemo(() => findLastPerformanceLogs(exerciseName, week, dayKey, allLogs, programData), [exerciseName, week, dayKey, allLogs, programData]);
    const suggestion = useMemo(() => getProgressionSuggestion(exerciseName, lastPerformanceData, masterExerciseList, programData), [exerciseName, lastPerformanceData, masterExerciseList, programData]);

    if (!exercise) return <div className="rounded-xl border border-[#f36f52]/30 bg-[#f36f52]/10 p-4 text-[#ff9d88]">Exercise "{exerciseName}" not found in master list.</div>;
    
    return (
        <div className="ee-panel overflow-hidden rounded-2xl">
            <div onClick={() => setIsOpen(!isOpen)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setIsOpen(!isOpen)} className="w-full cursor-pointer border-b border-white/10 bg-white/[0.035] p-4 text-left transition hover:bg-white/[0.065]">
                <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <Target size={16} className="text-[#f3b548]" />
                        <h3 className="truncate text-lg font-black text-[#efe7d5]">{exerciseName}</h3>
                    </div>
                    <p className="mt-1 text-sm text-[#9ca89d]">{exercise.sets} sets x {exercise.reps} reps</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button onClick={(e) => { e.stopPropagation(); showHistory(); }} className="rounded-lg border border-white/10 bg-white/5 p-2 hover:bg-white/10" title="Exercise history">
                        <History size={18} className="text-[#4dd6c6]" />
                    </button>
                    {isCompleted && <CheckCircle className="text-[#4dd6c6] animate-pop-in" />}
                    {isOpen ? <ChevronUp className="text-[#9ca89d]" /> : <ChevronDown className="text-[#9ca89d]" />}
                </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-[#4dd6c6] transition-all duration-500" style={{ width: `${completion.percentage}%` }} />
                    </div>
                    <span className="text-xs font-bold text-[#9ca89d]">{completion.complete}/{completion.total}</span>
                </div>
            </div>
            {isOpen && (
                <div className="p-4" onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                        if (isCompleted) setIsOpen(false);
                    }
                }}>
                    <div className="mb-3 flex items-start gap-3 rounded-xl border border-[#4dd6c6]/20 bg-[#4dd6c6]/10 p-3">
                        <Lightbulb className="text-[#4dd6c6] flex-shrink-0 mt-1" size={20}/>
                        <p className="text-sm text-[#d8fffa]"><span className="font-bold">Eagle Eye cue:</span> {suggestion}</p>
                    </div>
                    <div className="overflow-x-auto">
                        <div className="hidden sm:grid grid-cols-7 gap-2 mb-2 px-3 text-xs font-bold uppercase text-[#9ca89d] min-w-[540px]">
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
                            <button onClick={handleAddDropSet} className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-[#f36f52]/15 text-[#ff9d88] hover:bg-[#f36f52]/25 font-semibold">
                                <PlusCircle size={16}/> Add Drop Set
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
