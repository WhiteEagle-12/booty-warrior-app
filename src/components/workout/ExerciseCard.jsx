import React, { useState, useEffect, useMemo, useContext } from 'react';
import { ChevronDown, CheckCircle, Lightbulb, PlusCircle, History } from 'lucide-react';
import { AppStateContext } from '../../contexts/AppStateContext';
import { getExerciseDetails, isSetLogComplete } from '../../utils/helpers';
import { findLastPerformanceLogs, getProgressionSuggestion } from '../../utils/progression';
import { ExerciseHistoryModal } from './ExerciseHistoryModal';
import { SetRow } from './SetRow';
import { IntensityTechnique } from './IntensityTechnique';
import { getExerciseCompletion } from '../../utils/trainingMetrics';
import { ProgressRing } from '../common/ProgressRing';

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
    const suggestion = useMemo(() => getProgressionSuggestion(exerciseName, lastPerformanceData, masterExerciseList, programData, weightUnit), [exerciseName, lastPerformanceData, masterExerciseList, programData, weightUnit]);

    if (!exercise) return (
        <div className="rounded-2xl border border-coral/30 bg-coral/10 p-4 text-sm font-semibold text-coral">
            Exercise "{exerciseName}" not found in master list.
        </div>
    );

    const primaryMuscle = exercise.muscles?.primary;

    return (
        <div className={`ee-panel overflow-hidden transition-colors ${isCompleted ? 'border-teal/30' : ''}`}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setIsOpen(!isOpen)}
                className="w-full cursor-pointer p-4 text-left transition-colors hover:bg-panel2/40 sm:p-5"
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-4">
                    <ProgressRing
                        size={48}
                        stroke={4}
                        progress={completion.percentage}
                        color={isCompleted ? 'rgb(var(--c-teal))' : 'rgb(var(--c-amber))'}
                    >
                        {isCompleted
                            ? <CheckCircle size={17} className="text-teal animate-pop-in" />
                            : <span className="font-mono text-[11px] font-semibold text-bone">{completion.complete}/{completion.total}</span>}
                    </ProgressRing>
                    <div className="min-w-0 flex-grow">
                        <h3 className="truncate font-display text-lg font-medium text-bone sm:text-xl">{exerciseName}</h3>
                        <p className="mt-0.5 text-xs text-mute">
                            {exercise.sets} sets × {exercise.reps} reps
                            {primaryMuscle && <span className="text-mute/70"> · {primaryMuscle}</span>}
                        </p>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); showHistory(); }}
                            className="ee-icon-btn"
                            title="Exercise history"
                            aria-label={`History for ${exerciseName}`}
                        >
                            <History size={16} className="text-teal" />
                        </button>
                        <span className={`ee-icon-btn transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                            <ChevronDown size={16} />
                        </span>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div
                    className="border-t border-line/60 p-4 animate-fade-in sm:p-5"
                    onBlur={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget)) {
                            if (isCompleted) setIsOpen(false);
                        }
                    }}
                >
                    {suggestion && (
                        <div className="mb-4 flex items-start gap-3 rounded-xl border border-teal/20 bg-teal/[0.07] p-3">
                            <Lightbulb className="mt-0.5 flex-shrink-0 text-teal" size={17} />
                            <p className="text-sm leading-6 text-bone"><span className="font-bold text-teal">Suggested next step:</span> {suggestion}</p>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <div className="mb-2 hidden grid-cols-[3.5rem_4.5rem_5.5rem_1fr_1fr_1fr_4rem] gap-2 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-mute sm:grid sm:min-w-[560px]">
                            <span>Set</span>
                            <span className="text-center">Target</span>
                            <span className="text-center">Effort</span>
                            <span className="text-center">Load ({weightUnit})</span>
                            <span className="text-center">Reps</span>
                            <span className="text-center">RIR</span>
                            <span></span>
                        </div>
                        <div className="space-y-2 sm:min-w-[560px]">
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

                    {exercise.lastSetTechnique && !exercise.lastSetTechnique.toLowerCase().includes('drop') && (
                        <IntensityTechnique technique={exercise.lastSetTechnique} />
                    )}
                    {isCompleted && exercise.lastSetTechnique?.toLowerCase().includes('drop') && (
                        <button onClick={handleAddDropSet} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-coral/40 bg-coral/[0.06] p-2.5 text-sm font-bold text-coral transition-colors hover:bg-coral/15">
                            <PlusCircle size={15} /> Add drop set
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};
