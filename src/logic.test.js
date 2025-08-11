// This is a simplified copy of the presets from App.js for testing purposes.
const presets = {
    "optimal-ppl-ul": {
      "name": "Optimal PPL-UL",
      "info": {
        "weeks": 8,
        "split": "Pull/Push/Legs/Rest/Upper/Lower"
      },
      "masterExerciseList": {
        "Pullups": {
          "reps": "5-7",
          "sets": "3",
        },
        "Chest Supported Row": {
          "reps": "5-7",
          "sets": "3",
        },
      },
      "programStructure": {
        "Pull (Hypertrophy Focus)": { isRest: false,
          "label": "Pull",
          "exercises": [
            { id: '1', name: "Pullups" },
            { id: '2', name: "Chest Supported Row" },
          ]
        },
        "Rest Day": { isRest: true, exercises: [], label: "Rest" },
      },
      "weeklySchedule": [
        { "day": "Mon", "workout": "Pull (Hypertrophy Focus)" },
        { "day": "Tue", "workout": "Rest Day" },
      ],
      "workoutOrder": [
        "Pull (Hypertrophy Focus)",
        "Rest Day",
      ],
    },
};

// This is a simplified copy of the migrateProgramData function from App.js
const migrateProgramData = (program) => {
    if (!program) return presets['optimal-ppl-ul'];
    if (!program.programStructure) program.programStructure = {};
    for (const key in program.programStructure) {
        const template = program.programStructure[key];
        if (template && Array.isArray(template.exercises)) {
            template.exercises = template.exercises.map(ex => {
                if (typeof ex === 'string') return { id: Math.random().toString(), name: ex };
                if (ex && typeof ex === 'object' && ex.name) return { id: ex.id || Math.random().toString(), name: ex.name };
                return null;
            }).filter(Boolean);
        }
    }
    return program;
};


describe('EditProgramView Logic', () => {
    let programData;
    let onProgramDataChange;

    beforeEach(() => {
        // Deep copy to ensure tests are isolated
        programData = JSON.parse(JSON.stringify(presets['optimal-ppl-ul']));
        programData = migrateProgramData(programData);
        onProgramDataChange = jest.fn();
    });

    // This is a helper function to simulate the component's behavior
    const createUpdater = (logicFunc) => {
        return (...args) => {
            const updater = logicFunc(programData, onProgramDataChange, ...args);
            const newState = updater(programData);
            programData = newState; // Update programData for subsequent calls in the same test
        };
    };

    test('should rename a workout day', () => {
        const oldName = 'Pull (Hypertrophy Focus)';
        const newName = 'Pull Day A';

        // Simulate the logic from handleRenameWorkoutDay
        const updater = p => {
            if (!newName || newName === oldName || p.programStructure[newName]) {
                return p;
            }
            const newProgramStructure = { ...p.programStructure };
            newProgramStructure[newName] = { ...newProgramStructure[oldName] };
            delete newProgramStructure[oldName];
            const newWorkoutOrder = p.workoutOrder.map(name => name === oldName ? newName : name);
            const newSchedule = p.weeklySchedule.map(d => d.workout === oldName ? { ...d, workout: newName } : d);
            return { ...p, programStructure: newProgramStructure, workoutOrder: newWorkoutOrder, weeklySchedule: newSchedule };
        };

        onProgramDataChange(updater);

        const capturedUpdater = onProgramDataChange.mock.calls[0][0];
        const newState = capturedUpdater(programData);

        expect(newState.programStructure[newName]).toBeDefined();
        expect(newState.programStructure[oldName]).toBeUndefined();
        expect(newState.workoutOrder).toContain(newName);
        expect(newState.weeklySchedule.find(d => d.day === 'Mon').workout).toBe(newName);
    });

    test('should add a new exercise to a workout', () => {
        const workoutName = 'Pull (Hypertrophy Focus)';
        const newExerciseName = 'Barbell Curl';
        const newExerciseDetails = { sets: 3, reps: '8-12' };

        const updater = p => {
            const newProgramStructure = JSON.parse(JSON.stringify(p.programStructure));
            newProgramStructure[workoutName].exercises.push({ id: '3', name: newExerciseName });
            const newMasterList = { ...p.masterExerciseList, [newExerciseName]: newExerciseDetails };
            return { ...p, programStructure: newProgramStructure, masterExerciseList: newMasterList };
        };

        onProgramDataChange(updater);

        const capturedUpdater = onProgramDataChange.mock.calls[0][0];
        const newState = capturedUpdater(programData);

        const updatedWorkout = newState.programStructure[workoutName];
        expect(updatedWorkout.exercises).toHaveLength(3);
        expect(updatedWorkout.exercises[2].name).toBe(newExerciseName);
        expect(newState.masterExerciseList[newExerciseName]).toEqual(newExerciseDetails);
    });

    test('should remove an exercise from a workout', () => {
        const workoutName = 'Pull (Hypertrophy Focus)';
        const exerciseIndexToRemove = 0;

        const updater = p => {
            const newProgramStructure = JSON.parse(JSON.stringify(p.programStructure));
            newProgramStructure[workoutName].exercises.splice(exerciseIndexToRemove, 1);
            return { ...p, programStructure: newProgramStructure };
        };

        onProgramDataChange(updater);

        const capturedUpdater = onProgramDataChange.mock.calls[0][0];
        const newState = capturedUpdater(programData);

        const updatedWorkout = newState.programStructure[workoutName];
        expect(updatedWorkout.exercises).toHaveLength(1);
        expect(updatedWorkout.exercises[0].name).toBe('Chest Supported Row');
    });

    test('should reorder exercises with drag and drop', () => {
        const source = { droppableId: 'Pull (Hypertrophy Focus)', index: 0 };
        const destination = { droppableId: 'Pull (Hypertrophy Focus)', index: 1 };

        const updater = p => {
            const newProgramStructure = JSON.parse(JSON.stringify(p.programStructure));
            const list = newProgramStructure[source.droppableId].exercises;
            const [movedItem] = list.splice(source.index, 1);
            list.splice(destination.index, 0, movedItem);
            return { ...p, programStructure: newProgramStructure };
        };

        onProgramDataChange(updater);

        const capturedUpdater = onProgramDataChange.mock.calls[0][0];
        const newState = capturedUpdater(programData);

        const updatedWorkout = newState.programStructure['Pull (Hypertrophy Focus)'];
        expect(updatedWorkout.exercises[0].name).toBe('Chest Supported Row');
        expect(updatedWorkout.exercises[1].name).toBe('Pullups');
    });

    test('should edit exercise details in master list and update references', () => {
        const oldExerciseName = 'Pullups';
        const newExerciseName = 'Weighted Pullups';
        const newDetails = { sets: 4, reps: '4-6' };

        const updater = p => {
            const newMasterList = { ...p.masterExerciseList };
            if (oldExerciseName !== newExerciseName) {
                delete newMasterList[oldExerciseName];
            }
            newMasterList[newExerciseName] = newDetails;

            const newProgramStructure = JSON.parse(JSON.stringify(p.programStructure));
            Object.keys(newProgramStructure).forEach(workoutKey => {
                newProgramStructure[workoutKey].exercises = newProgramStructure[workoutKey].exercises.map(ex =>
                    ex.name === oldExerciseName ? { ...ex, name: newExerciseName } : ex
                );
            });

            return { ...p, masterExerciseList: newMasterList, programStructure: newProgramStructure };
        };

        onProgramDataChange(updater);

        const capturedUpdater = onProgramDataChange.mock.calls[0][0];
        const newState = capturedUpdater(programData);

        expect(newState.masterExerciseList[newExerciseName]).toEqual(newDetails);
        expect(newState.masterExerciseList[oldExerciseName]).toBeUndefined();
        const pullWorkout = newState.programStructure['Pull (Hypertrophy Focus)'];
        expect(pullWorkout.exercises.find(ex => ex.name === newExerciseName)).toBeDefined();
        expect(pullWorkout.exercises.find(ex => ex.name === oldExerciseName)).toBeUndefined();
    });

    test('should delete a workout day', () => {
        const workoutNameToDelete = 'Pull (Hypertrophy Focus)';
        const fallbackRestTemplate = 'Rest Day';

        const updater = p => {
            let newProgramStructure = { ...p.programStructure };
            delete newProgramStructure[workoutNameToDelete];

            let newWorkoutOrder = p.workoutOrder.filter(name => name !== workoutNameToDelete);

            const newSchedule = p.weeklySchedule.map(d => d.workout === workoutNameToDelete ? { ...d, workout: fallbackRestTemplate } : d);

            return {
                ...p,
                programStructure: newProgramStructure,
                workoutOrder: newWorkoutOrder,
                weeklySchedule: newSchedule,
            };
        };

        onProgramDataChange(updater);

        const capturedUpdater = onProgramDataChange.mock.calls[0][0];
        const newState = capturedUpdater(programData);

        expect(newState.programStructure[workoutNameToDelete]).toBeUndefined();
        expect(newState.workoutOrder).not.toContain(workoutNameToDelete);
        expect(newState.weeklySchedule.find(d => d.day === 'Mon').workout).toBe(fallbackRestTemplate);
    });
});
