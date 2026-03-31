import { getExerciseDetails } from './helpers';

export const getWorkoutForWeek = (programData, week, workoutName) => {
    if (!workoutName || !programData.programStructure[workoutName] || programData.programStructure[workoutName].isRest) return null;
    return programData.programStructure[workoutName] || null;
};

export const getWorkoutNameForDay = (pData, week, dayKey) => {
    const weekOverride = pData.weeklyOverrides?.[week];
    if (weekOverride?.schedule) {
        return weekOverride.schedule.find(s => s.day === dayKey || s.id === dayKey)?.workout || 'Rest Day';
    }
    return weekOverride?.[dayKey] || pData.weeklySchedule.find(s => s.day === dayKey || s.id === dayKey)?.workout || 'Rest Day';
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
