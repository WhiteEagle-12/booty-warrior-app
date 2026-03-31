import { getExerciseDetails } from './helpers';

export const getWorkoutForWeek = (programData, week, workoutName) => {
    if (!workoutName || !programData.programStructure[workoutName] || programData.programStructure[workoutName].isRest) return null;
    return programData.programStructure[workoutName] || null;
};

export const getWorkoutNameForDay = (pData, week, dayKey) => {
    // Check for workout-level override first (individual day swap)
    if (pData.weeklyOverrides?.[week]?.[dayKey]) {
        return pData.weeklyOverrides[week][dayKey];
    }
    // Check for per-week schedule override (different number of days per week)
    const weekSchedule = pData.weeklyScheduleOverrides?.[week] || pData.weeklySchedule;
    return weekSchedule.find(s => s.day === dayKey)?.workout || 'Rest Day';
};

export const getSessionInfoFromSequentialIndex = (index, programData) => {
    const { weeklySchedule, info, programStructure } = programData;
    if (!info || !weeklySchedule) return null;
    let workoutCounter = -1;
    for (let w = 1; w <= info.weeks; w++) {
        for (const day of weeklySchedule) {
            const workoutName = getWorkoutNameForDay(programData, w, day.day);
            const isRest = programStructure[workoutName]?.isRest;
            if (workoutName && !isRest) {
                workoutCounter++;
                if (workoutCounter === index) {
                    return {
                        week: w,
                        dayKey: day.day,
                        workoutName: workoutName
                    };
                }
            }
        }
    }
    return null;
};
