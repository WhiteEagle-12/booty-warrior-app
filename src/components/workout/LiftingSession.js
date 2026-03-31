import React, { useMemo, useContext } from 'react';
import { ArrowLeft, SkipForward, Timer } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { FirebaseContext } from '../../contexts/FirebaseContext';
import { getWorkoutForWeek, getWorkoutNameForDay } from '../../utils/workout';
import { isSetLogComplete } from '../../utils/helpers';
import { ExerciseCard } from './ExerciseCard';

export const LiftingSession = ({ week, dayKey, onBack, allLogs, setAllLogs, onSkipDay, programData, weightUnit, onStartTimer, sequentialWorkoutIndex }) => {
    const { db, customId } = useContext(FirebaseContext);
    const { masterExerciseList } = programData;

    const workoutName = useMemo(() => {
        if (programData.settings.useWeeklySchedule) {
            return getWorkoutNameForDay(programData, week, dayKey);
        } else {
            return programData.workoutOrder[sequentialWorkoutIndex % programData.workoutOrder.length];
        }
    }, [programData, week, dayKey, sequentialWorkoutIndex]);

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
    
    const pageTitle = programData.settings.useWeeklySchedule ? `Week ${week}: ${dayKey}` : `Day ${sequentialWorkoutIndex + 1}`;
    const workoutDisplayName = programData.settings.useWeeklySchedule ? workoutName : `${workoutName} (${programData.programStructure[workoutName]?.label || ''})`;


    return (
        <div className="p-4 md:p-6 pb-24">
            <div className="flex justify-end items-center mb-4 gap-2">
                <button onClick={onStartTimer} className="flex items-center gap-2 text-sm font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/50 px-3 py-1.5 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-800/50 transition-colors"><Timer size={16}/> Start Timer</button>
                <button onClick={() => onSkipDay(week, dayKey)} className="flex items-center gap-2 text-sm font-medium text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/50 px-3 py-1.5 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"><SkipForward size={16}/> Skip Day</button>
            </div>
            <div className="mb-6 text-center">
                <h2 className="text-3xl font-bold dark:text-white">{pageTitle}</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">{workoutDisplayName}</p>
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