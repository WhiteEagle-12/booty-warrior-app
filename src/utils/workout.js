import { getExerciseDetails } from './helpers';

export const getWorkoutForWeek = (programData, week, workoutName) => {
    if (!workoutName || !programData.programStructure[workoutName] || programData.programStructure[workoutName].isRest) return null;
    return programData.programStructure[workoutName] || null;
};

export const getWorkoutNameForDay = (pData, week, dayKey) => {
    if (!pData) return 'Rest Day';
    return pData.weeklyOverrides?.[week]?.[dayKey] || pData.weeklySchedule.find(s => s.day === dayKey)?.workout || 'Rest Day';
};

export const getSessionInfoFromSequentialIndex = (index, programData) => {
    const { weeklySchedule, info, programStructure, weeklyOverrides } = programData;
    if (!info || !weeklySchedule) return null;
    let workoutCounter = -1;
    for (let w = 1; w <= info.weeks; w++) {
        const overrides = weeklyOverrides?.[w] || {};
        const customLength = overrides['_length'];
        
        const weekSchedule = customLength !== undefined 
            ? Array.from({ length: customLength }, (_, i) => i < 7 ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i] : `Day ${i + 1}`)
            : weeklySchedule.map(d => d.day);

        for (const dayKey of weekSchedule) {
            const workoutName = getWorkoutNameForDay(programData, w, dayKey);
            const isRest = programStructure[workoutName]?.isRest;
            if (workoutName && !isRest) {
                workoutCounter++;
                if (workoutCounter === index) {
                    return {
                        week: w,
                        dayKey: dayKey,
                        workoutName: workoutName
                    };
                }
            }
        }
    }
    return null;
};
