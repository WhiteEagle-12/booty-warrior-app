import React, { useMemo, useContext } from 'react';
import { ArrowLeft, Moon, SkipForward, Timer } from 'lucide-react';
import { doc } from 'firebase/firestore';
import { FirebaseContext } from '../../contexts/FirebaseContext';
import { getWorkoutForWeek, getWorkoutNameForDay } from '../../utils/workout';
import { getExerciseDetails, isSetLogComplete } from '../../utils/helpers';
import { queueUpdate } from '../../utils/syncQueue';
import { ExerciseCard } from './ExerciseCard';

export const LiftingSession = ({ week, dayKey, onBack, allLogs, setAllLogs, onSkipDay, programData, weightUnit, onStartTimer, sequentialWorkoutIndex }) => {
    const { db, customId } = useContext(FirebaseContext);
    const { masterExerciseList } = programData;

    const workoutName = useMemo(() => {
        return getWorkoutNameForDay(programData, week, dayKey);
    }, [programData, week, dayKey]);

    const workout = getWorkoutForWeek(programData, week, workoutName);

    const handleLogChange = (exerciseName, setNumber, field, value, isDropSet = false) => {
        const logId = `${week}-${dayKey}-${exerciseName}-${setNumber}`;
        const currentLog = allLogs[logId] || { week, dayKey, session: workoutName, exercise: exerciseName, set: setNumber, date: new Date().toISOString() };

        const wasCompleteBefore = isSetLogComplete(currentLog);

        let newLogEntry = { ...currentLog };

        if (field === 'skip') {
            newLogEntry.skipped = true;
            newLogEntry.load = '';
            newLogEntry.reps = '';
            newLogEntry.rir = '';
        } else if (field === 'unskip') {
            newLogEntry.skipped = false;
        } else if (field === 'load') {
            newLogEntry.displayLoad = value;
            if (weightUnit === 'kg') {
                newLogEntry.load = parseFloat(value) * 2.20462;
            } else {
                newLogEntry.load = parseFloat(value);
            }
        } else {
            newLogEntry[field] = value;
        }

        const isCompleteNow = isSetLogComplete(newLogEntry);

        setAllLogs(prev => ({ ...prev, [logId]: newLogEntry }));

        if (db && customId) {
            const userDocRef = doc(db, 'workoutLogs', customId);
            queueUpdate(userDocRef, { [`logs.${logId}`]: newLogEntry });
        }

        if (!isDropSet && !wasCompleteBefore && isCompleteNow && !newLogEntry.skipped) {
            onStartTimer();
        }
    };

    const sessionProgress = useMemo(() => {
        if (!workout) return { complete: 0, total: 0, percent: 0 };
        let complete = 0;
        let total = 0;
        workout.exercises.forEach(ex => {
            const details = getExerciseDetails(ex.name, masterExerciseList);
            const setCount = Number(details?.sets) || 0;
            total += setCount;
            for (let setNum = 1; setNum <= setCount; setNum++) {
                if (isSetLogComplete(allLogs[`${week}-${dayKey}-${ex.name}-${setNum}`])) complete++;
            }
        });
        return { complete, total, percent: total > 0 ? Math.round((complete / total) * 100) : 0 };
    }, [workout, allLogs, week, dayKey, masterExerciseList]);

    if (!workout) return (
        <div className="flex flex-col items-center py-20 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full border border-sky/30 bg-sky/10">
                <Moon size={28} className="text-sky" />
            </span>
            <h2 className="mt-5 font-display text-2xl font-bold text-bone">Rest day</h2>
            <p className="mt-2 max-w-xs text-sm text-mute">Recovery is where the adaptation happens. Enjoy it.</p>
            <button onClick={onBack} className="ee-secondary mt-6"><ArrowLeft size={15} /> Back to program</button>
        </div>
    );

    const dayIndex = programData.weeklySchedule.findIndex(d => d.day === dayKey);
    const pageTitle = programData.settings.useWeeklySchedule ? `${dayKey} · Week ${week}` : `Day ${dayIndex + 1} · Week ${week}`;
    const workoutDisplayName = workout.label || workoutName;

    return (
        <div className="py-5 md:py-7">
            <div className="ee-panel sticky top-[57px] z-30 mb-5 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <button onClick={onBack} className="ee-icon-btn flex-shrink-0" aria-label="Back to program">
                            <ArrowLeft size={16} />
                        </button>
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-mute">{pageTitle}</p>
                            <h1 className="truncate font-display text-lg font-bold text-bone sm:text-xl">{workoutDisplayName}</h1>
                        </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2">
                        <button onClick={onStartTimer} className="ee-icon-btn" title="Start rest timer" aria-label="Start rest timer">
                            <Timer size={16} className="text-amber" />
                        </button>
                        <button onClick={() => onSkipDay(week, dayKey)} className="ee-icon-btn" title="Skip this day" aria-label="Skip this day">
                            <SkipForward size={16} className="text-coral" />
                        </button>
                    </div>
                </div>
                <div className="mt-3.5 flex items-center gap-3">
                    <div className="h-1.5 flex-grow overflow-hidden rounded-full bg-line/50">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ease-out-expo ${sessionProgress.percent === 100 ? 'bg-teal' : 'bg-amber'}`}
                            style={{ width: `${sessionProgress.percent}%` }}
                        />
                    </div>
                    <span className="font-mono text-xs font-semibold tabular-nums text-mute">
                        {sessionProgress.complete}/{sessionProgress.total} sets
                    </span>
                </div>
            </div>

            <div className="space-y-4 animate-stagger">
                {workout.exercises.map(ex =>
                    <ExerciseCard
                        key={ex.id}
                        exerciseName={ex.name}
                        week={week}
                        dayKey={dayKey}
                        allLogs={allLogs}
                        onLogChange={handleLogChange}
                        masterExerciseList={masterExerciseList}
                        weightUnit={weightUnit}
                        workoutDetails={workout}
                        programData={programData}
                    />
                )}
            </div>

            <div className="mt-8 flex justify-center">
                <button onClick={onBack} className="ee-secondary">
                    <ArrowLeft size={15} /> Back to program timeline
                </button>
            </div>
        </div>
    );
};
