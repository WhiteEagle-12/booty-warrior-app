import { getExerciseDetails, isSetLogComplete, calculateE1RM } from './helpers';
import { getWorkoutForWeek, getWorkoutNameForDay } from './workout';

export const formatWeight = (value, unit, includeUnit = true) => {
    if (unit === 'kg') {
        const kgValue = (value / 2.20462).toFixed(1);
        return `${kgValue}${includeUnit ? ' kg' : ''}`;
    }
    return `${Math.round(value)}${includeUnit ? ' lbs' : ''}`;
};

export const calculateStreak = (allLogs, programData) => {
    if (!programData || !programData.info) return 0;
    const { weeklySchedule, masterExerciseList, info, workoutOrder, settings } = programData;
    let currentStreak = 0;
    let streakBroken = false;
    
    const isDayComplete = (week, dayKey, workoutName) => {
        const workout = getWorkoutForWeek(programData, week, workoutName);
        if (!workout) return true;

        return workout.exercises.every(ex => {
            const exDetails = getExerciseDetails(ex.name, masterExerciseList);
            if (!exDetails) return false;
            return Array.from({ length: Number(exDetails.sets) }, (_, i) => i + 1).every(setNum => {
                const log = allLogs[`${week}-${dayKey}-${ex.name}-${setNum}`];
                return isSetLogComplete(log);
            });
        });
    };

    const hasAnyLogInDay = (week, dayKey, workoutName) => {
        const workout = getWorkoutForWeek(programData, week, workoutName);
        if (!workout) return false;
         return workout.exercises.some(ex => {
             const exDetails = getExerciseDetails(ex.name, masterExerciseList);
             if (!exDetails) return false;
             return Array.from({ length: Number(exDetails.sets) }, (_, i) => i + 1).some(setNum => !!allLogs[`${week}-${dayKey}-${ex.name}-${setNum}`]);
        });
    };
    
    const sortedDays = [];
    for (let week = 1; week <= info.weeks; week++) {
        const weekSched = programData.weeklyScheduleOverrides?.[week] || weeklySchedule;
        for (const day of weekSched) {
            const workoutName = getWorkoutNameForDay(programData, week, day.day);
            if (workoutName && !programData.programStructure[workoutName]?.isRest) {
                sortedDays.push({ week, day: day.day, workoutName });
            }
        }
    }
    for (const { week, day, workoutName } of sortedDays) {
        if (isDayComplete(week, day, workoutName)) {
            currentStreak++;
        } else {
            // The first incomplete day breaks the current chain.
            break;
        }
    }

    return currentStreak;
};

// Helper function to get max e1RM for an exercise type
export const getMaxE1RMFor = (logs, exerciseSubstring) => {
    const relevantLogs = Object.values(logs).filter(l => !l.skipped && l.exercise.toLowerCase().includes(exerciseSubstring));
    if (relevantLogs.length === 0) return 0;
    return Math.max(0, ...relevantLogs.map(l => calculateE1RM(l.load, l.reps, l.rir)));
};

export const getBodyweightRatioFor = (logs, exerciseSubstring, bodyWeightHistory) => {
    const exerciseLogs = Object.values(logs).filter(
        l => !l.skipped && l.exercise.toLowerCase().includes(exerciseSubstring) && l.date && (l.load || l.load === 0) && l.reps
    );

    if (exerciseLogs.length === 0 || !bodyWeightHistory || bodyWeightHistory.length === 0) {
        return 0;
    }

    const sortedBwHistory = [...bodyWeightHistory]
        .map(e => ({ ...e, date: new Date(e.date) }))
        .sort((a, b) => a.date - b.date);

    if (sortedBwHistory.length === 0) return 0;

    let maxRatio = 0;

    for (const log of exerciseLogs) {
        const logDate = new Date(log.date);
        const suitableBwEntry = sortedBwHistory.filter(bw => bw.date <= logDate).pop();

        if (suitableBwEntry && suitableBwEntry.weight > 0) {
            const e1rm = calculateE1RM(log.load, log.reps, log.rir);
            const bodyWeightInLbs = suitableBwEntry.weight;

            if (bodyWeightInLbs > 0) {
                const ratio = e1rm / bodyWeightInLbs;
                if (ratio > maxRatio) {
                    maxRatio = ratio;
                }
            }
        }
    }

    return maxRatio;
};
