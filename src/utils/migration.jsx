import { generateUUID } from './helpers';
import { presets } from '../data/presets';

export const migrateProgramData = (program) => {
    const defaultPreset = presets['optimal-ppl-ul'];
    const requiredKeys = ['info', 'masterExerciseList', 'programStructure', 'weeklySchedule', 'workoutOrder', 'settings'];

    let newProgram = program ? JSON.parse(JSON.stringify(program)) : JSON.parse(JSON.stringify(defaultPreset));

    // Basic validation and default-filling
    for (const key of requiredKeys) {
        if (!newProgram[key]) {
            newProgram[key] = JSON.parse(JSON.stringify(defaultPreset[key]));
        }
    }

    // --- V4 MIGRATION: Unique Day Templates ---

    // 1. Ensure all templates have an `isRest` property.
    for (const key in newProgram.programStructure) {
        const template = newProgram.programStructure[key];
        if (template.isRest === undefined) {
            template.isRest = key.toLowerCase().includes('rest') || !template.exercises || template.exercises.length === 0;
        }
    }

    // Ensure all workoutOrder entries are unique
    newProgram.workoutOrder = [...new Set(newProgram.workoutOrder)];
    
    // Add missing workouts from weeklySchedule or programStructure automatically to workoutOrder
    newProgram.weeklySchedule.forEach(day => {
        if (!newProgram.workoutOrder.includes(day.workout)) {
            newProgram.workoutOrder.push(day.workout);
        }
    });

    for (const key in newProgram.programStructure) {
        if (!newProgram.workoutOrder.includes(key) && !newProgram.programStructure[key].isRest) {
            newProgram.workoutOrder.push(key);
        }
    }

    // 3. Clean up overrides to point to new unique rest days if necessary.
    if (newProgram.weeklyOverrides) {
        for (const week in newProgram.weeklyOverrides) {
            for (const dayKey in newProgram.weeklyOverrides[week]) {
                const workoutName = newProgram.weeklyOverrides[week][dayKey];
                const template = newProgram.programStructure[workoutName];
                if (!template || (template.isRest && workoutName === 'Rest Day')) {
                    const masterWorkout = newProgram.weeklySchedule.find(d => d.day === dayKey)?.workout;
                    if (masterWorkout && newProgram.programStructure[masterWorkout]?.isRest) {
                        newProgram.weeklyOverrides[week][dayKey] = masterWorkout;
                    } else {
                        delete newProgram.weeklyOverrides[week][dayKey];
                    }
                }
            }
        }
    }


    // --- V3 MIGRATION: Exercise objects with unique IDs ---
    for (const key in newProgram.programStructure) {
        const template = newProgram.programStructure[key];
        if (!template || !Array.isArray(template.exercises)) {
            if (template) template.exercises = [];
            continue;
        }
        template.exercises = template.exercises.map(ex => {
            if (typeof ex === 'string') {
                return { id: generateUUID(), name: ex };
            }
            if (ex && typeof ex === 'object' && ex.name) {
                return { id: ex.id || generateUUID(), name: ex.name };
            }
            return null;
        }).filter(Boolean);
    }

    return newProgram;
};
