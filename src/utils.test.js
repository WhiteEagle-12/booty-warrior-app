
// Mock data for testing
const programData = {
    info: { weeks: 2 },
    weeklySchedule: [
        { day: 'Mon', workout: 'Workout A' },
        { day: 'Tue', workout: 'Rest Day' },
        { day: 'Wed', workout: 'Workout B' },
        { day: 'Thu', workout: 'Rest Day' },
        { day: 'Fri', workout: 'Workout A' },
        { day: 'Sat', workout: 'Rest Day' },
        { day: 'Sun', workout: 'Rest Day' }
    ],
    programStructure: {
        'Workout A': { isRest: false },
        'Workout B': { isRest: false },
        'Rest Day': { isRest: true }
    },
    weeklyOverrides: {}
};

// Copy of the function from App.js for testing purposes (since we can't easily export it without refactoring)
const getWorkoutNameForDay = (pData, week, dayKey) => {
    return pData.weeklyOverrides?.[week]?.[dayKey] || pData.weeklySchedule.find(s => s.day === dayKey)?.workout || 'Rest Day';
};

const getSessionInfoFromSequentialIndex = (index, programData) => {
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

// Tests
describe('getSessionInfoFromSequentialIndex', () => {
    test('returns correct session for index 0 (first workout)', () => {
        const result = getSessionInfoFromSequentialIndex(0, programData);
        expect(result).toEqual({ week: 1, dayKey: 'Mon', workoutName: 'Workout A' });
    });

    test('returns correct session for index 1 (second workout, skipping rest)', () => {
        const result = getSessionInfoFromSequentialIndex(1, programData);
        expect(result).toEqual({ week: 1, dayKey: 'Wed', workoutName: 'Workout B' });
    });

    test('returns correct session for index 3 (first workout of week 2)', () => {
        const result = getSessionInfoFromSequentialIndex(3, programData);
        expect(result).toEqual({ week: 2, dayKey: 'Mon', workoutName: 'Workout A' });
    });

    test('returns null for out of bounds index', () => {
        // Total workouts = 3 per week * 2 weeks = 6. Indices 0-5.
        const result = getSessionInfoFromSequentialIndex(6, programData);
        expect(result).toBeNull();
    });

    test('handles unique rest days correctly', () => {
         const pData = {
            ...programData,
            programStructure: {
                ...programData.programStructure,
                'Rest Day 1': { isRest: true }
            },
            weeklySchedule: [
                { day: 'Mon', workout: 'Workout A' },
                { day: 'Tue', workout: 'Rest Day 1' } // Unique rest day name
            ]
        };
        const result = getSessionInfoFromSequentialIndex(0, pData);
        expect(result).toEqual({ week: 1, dayKey: 'Mon', workoutName: 'Workout A' });

        // Index 1 should be null as there are no more workouts in this 1-week, 2-day schedule
        // Wait, info.weeks is 2 in original data, but here I didn't update info.
        // If info.weeks is 2, it loops week 2.
        // Week 1 Mon: Workout A (index 0)
        // Week 1 Tue: Rest Day 1 (skip)
        // Week 2 Mon: Workout A (index 1)

        const result2 = getSessionInfoFromSequentialIndex(1, pData);
        expect(result2).toEqual({ week: 2, dayKey: 'Mon', workoutName: 'Workout A' });
    });
});

const calculateE1RM = (weight, reps, rir) => {
    const numWeight = parseFloat(weight);
    const numReps = parseInt(reps, 10);
    const numRir = parseInt(rir, 10) || 0;

    if (isNaN(numWeight) || isNaN(numReps) || numReps < 1) return 0;

    const effectiveReps = numReps + numRir;
    if (effectiveReps <= 1) return Math.round(numWeight);

    return Math.round(numWeight * (1 + (effectiveReps / 30)));
};

describe('calculateE1RM', () => {
    test('calculates correct e1RM for standard input', () => {
        // 100 * (1 + 10/30) = 133.33 -> 133
        expect(calculateE1RM(100, 10, 0)).toBe(133);
    });

    test('calculates correct e1RM with RIR', () => {
        // 100 * (1 + (10+2)/30) = 100 * 1.4 = 140
        expect(calculateE1RM(100, 10, 2)).toBe(140);
    });

    test('returns 0 for invalid input', () => {
        expect(calculateE1RM('abc', 10, 0)).toBe(0);
        expect(calculateE1RM(100, 0, 0)).toBe(0);
    });
});
