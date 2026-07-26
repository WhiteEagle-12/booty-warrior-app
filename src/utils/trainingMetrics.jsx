import { getExerciseDetails, getSetVolume, isSetLogComplete, calculateE1RM } from './helpers';
import { getWorkoutForWeek, getWorkoutNameForDay } from './workout';
import { calculateStreak } from './formatters';

export const getWorkoutDays = (programData) => {
    if (!programData?.info) return [];
    const days = [];
    for (let week = 1; week <= programData.info.weeks; week++) {
        const schedule = programData.weeklyScheduleOverrides?.[week] || programData.weeklySchedule || [];
        schedule.forEach((day, index) => {
            const workoutName = getWorkoutNameForDay(programData, week, day.day);
            const workout = getWorkoutForWeek(programData, week, workoutName);
            const isRest = !workoutName || programData.programStructure?.[workoutName]?.isRest || !workout;
            days.push({
                week,
                dayKey: day.day,
                dayIndex: index,
                workoutName,
                workout,
                isRest,
            });
        });
    }
    return days;
};

export const isWorkoutComplete = (workoutDay, allLogs, programData) => {
    if (!workoutDay || workoutDay.isRest) return true;
    return workoutDay.workout.exercises.every(ex => {
        const details = getExerciseDetails(ex.name, programData.masterExerciseList);
        if (!details) return false;
        return Array.from({ length: Number(details.sets) || 0 }, (_, index) => index + 1).every(setNum => {
            return isSetLogComplete(allLogs[`${workoutDay.week}-${workoutDay.dayKey}-${ex.name}-${setNum}`]);
        });
    });
};

export const getProgramMetrics = (allLogs = {}, programData, bodyWeightHistory = []) => {
    const workoutDays = getWorkoutDays(programData).filter(day => !day.isRest);
    let totalSets = 0;
    let completedSets = 0;

    workoutDays.forEach(day => {
        day.workout.exercises.forEach(ex => {
            const details = getExerciseDetails(ex.name, programData.masterExerciseList);
            const setCount = Number(details?.sets) || 0;
            totalSets += setCount;
            for (let setNum = 1; setNum <= setCount; setNum++) {
                if (isSetLogComplete(allLogs[`${day.week}-${day.dayKey}-${ex.name}-${setNum}`])) {
                    completedSets++;
                }
            }
        });
    });

    const completedWorkouts = workoutDays.filter(day => isWorkoutComplete(day, allLogs, programData)).length;
    const nextWorkout = workoutDays.find(day => !isWorkoutComplete(day, allLogs, programData)) || workoutDays[0] || null;
    const totalVolume = Object.values(allLogs).reduce((sum, log) => sum + getSetVolume(log, programData?.masterExerciseList), 0);
    const completedLogs = Object.values(allLogs).filter(isSetLogComplete);
    const rirLogs = completedLogs.filter(log => log.rir !== undefined && log.rir !== null && log.rir !== '' && !log.skipped);
    const avgRir = rirLogs.length
        ? rirLogs.reduce((sum, log) => sum + (parseFloat(log.rir) || 0), 0) / rirLogs.length
        : 2;
    const lastSevenDays = new Date();
    lastSevenDays.setDate(lastSevenDays.getDate() - 7);
    const recentSets = completedLogs.filter(log => log.date && new Date(log.date) >= lastSevenDays).length;
    const streak = calculateStreak(allLogs, programData);
    const prs = {};
    completedLogs.forEach(log => {
        if (!log.skipped && log.exercise && (log.load || log.load === 0) && log.reps) {
            const e1rm = calculateE1RM(log.load, log.reps, log.rir);
            if (!prs[log.exercise] || e1rm > prs[log.exercise].e1rm) {
                prs[log.exercise] = { exercise: log.exercise, e1rm, log };
            }
        }
    });
    const topPrs = Object.values(prs).sort((a, b) => b.e1rm - a.e1rm).slice(0, 3);

    return {
        workoutDays,
        totalSets,
        completedSets,
        completedWorkouts,
        totalWorkouts: workoutDays.length,
        nextWorkout,
        totalVolume,
        recentSets,
        streak,
        avgRir,
        topPrs,
        progressPercentage: totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0,
    };
};

export const getExerciseCompletion = (exerciseName, week, dayKey, allLogs, masterExerciseList) => {
    const exercise = getExerciseDetails(exerciseName, masterExerciseList);
    const setCount = Number(exercise?.sets) || 0;
    if (setCount === 0) return { complete: 0, total: 0, percentage: 0 };
    const complete = Array.from({ length: setCount }, (_, index) => index + 1).filter(setNum => {
        return isSetLogComplete(allLogs[`${week}-${dayKey}-${exerciseName}-${setNum}`]);
    }).length;
    return {
        complete,
        total: setCount,
        percentage: Math.round((complete / setCount) * 100),
    };
};
