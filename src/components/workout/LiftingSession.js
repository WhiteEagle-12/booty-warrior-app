import React, { useMemo, useContext } from 'react';
import { ArrowLeft, Dumbbell, SkipForward, Timer } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { FirebaseContext } from '../../contexts/FirebaseContext';
import { getWorkoutForWeek, getWorkoutNameForDay } from '../../utils/workout';
import { isSetLogComplete } from '../../utils/helpers';
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
            updateDoc(userDocRef, { [`logs.${logId}`]: newLogEntry });
        }
        
        if (!isDropSet && !wasCompleteBefore && isCompleteNow && !newLogEntry.skipped) {
            onStartTimer();
        }
    };

    if (!workout) return (
       <div className="p-4 md:p-6 pb-24 text-center">
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline mb-4"><ArrowLeft size={16}/> Back to Program</button>
            <h2 className="text-2xl font-bold dark:text-white">Rest Day</h2>
            <p className="text-gray-600 dark:text-gray-400">Enjoy your recovery!</p>
        </div>
    );
    
    const dayIndex = programData.weeklySchedule.findIndex(d => d.day === dayKey);
    const pageTitle = programData.settings.useWeeklySchedule ? `Week ${week}: ${dayKey}` : `Week ${week}: Day ${dayIndex + 1}`;
    const workoutDisplayName = programData.settings.useWeeklySchedule ? workoutName : `${workoutName} (${programData.programStructure[workoutName]?.label || ''})`;


    return (
        <div className="py-5 md:py-8 pb-24">
            <div className="ee-panel mb-5 rounded-2xl p-5 md:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <button onClick={onBack} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[#9ca89d] hover:text-[#efe7d5]"><ArrowLeft size={16}/> Program timeline</button>
                        <div className="ee-chip"><Dumbbell size={14} /> Session</div>
                        <h2 className="mt-3 text-3xl font-black text-[#efe7d5] md:text-4xl">{pageTitle}</h2>
                        <p className="mt-2 text-lg text-[#f3b548]">{workoutDisplayName}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button onClick={onStartTimer} className="ee-primary"><Timer size={16}/> Start Timer</button>
                        <button onClick={() => onSkipDay(week, dayKey)} className="ee-secondary text-[#f36f52]"><SkipForward size={16}/> Skip Day</button>
                    </div>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-white/5 p-3">
                        <p className="text-xs font-bold uppercase text-[#9ca89d]">Exercises</p>
                        <p className="text-2xl font-black text-[#efe7d5]">{workout.exercises.length}</p>
                    </div>
                    <div className="rounded-xl bg-white/5 p-3">
                        <p className="text-xs font-bold uppercase text-[#9ca89d]">Rest Timer</p>
                        <p className="text-2xl font-black text-[#f3b548]">{programData.settings.restTimer?.enabled ? `${programData.settings.restTimer.duration}s` : 'Off'}</p>
                    </div>
                </div>
            </div>
            <div className="space-y-4">
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
        </div>
    );
};
