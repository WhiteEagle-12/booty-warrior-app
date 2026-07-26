// --- EXERCISE BANK DATA ---
import { normalizeExerciseDetails } from '../utils/helpers';

const baseExerciseBank = {
    // Chest
    'Barbell Bench Press': { sets: 3, reps: '8-12', rir: ['2', '2', '2'], rest: '2-3 min', equipment: 'barbell', muscles: { primary: 'Chest', secondary: 'Triceps', tertiary: 'Shoulders', primaryContribution: 1, secondaryContribution: 0.5, tertiaryContribution: 0.3 } },
    'Incline Dumbbell Press': { sets: 3, reps: '8-12', rir: ['2', '2', '2'], rest: '2-3 min', equipment: 'dumbbell', muscles: { primary: 'Chest', secondary: 'Shoulders', tertiary: 'Triceps', primaryContribution: 1, secondaryContribution: 0.6, tertiaryContribution: 0.3 } },
    'Dumbbell Bench Press': { sets: 3, reps: '8-12', rir: ['2', '2', '2'], rest: '2-3 min', equipment: 'dumbbell', muscles: { primary: 'Chest', secondary: 'Triceps', tertiary: 'Shoulders', primaryContribution: 1, secondaryContribution: 0.5, tertiaryContribution: 0.3 } },
    'Machine Chest Press': { sets: 3, reps: '10-15', rir: ['1', '1', '1'], rest: '1-2 min', equipment: 'machine', muscles: { primary: 'Chest', secondary: 'Triceps', tertiary: 'Shoulders', primaryContribution: 1, secondaryContribution: 0.4, tertiaryContribution: 0.2 } },
    'Cable Crossover': { sets: 3, reps: '12-15', rir: ['1', '1', '1'], rest: '1-2 min', equipment: 'machine', muscles: { primary: 'Chest', secondary: null, tertiary: null, primaryContribution: 1, secondaryContribution: 0, tertiaryContribution: 0 } },
    'Push-ups': { sets: 3, reps: 'To Failure', rir: ['0', '0', '0'], rest: '1-2 min', equipment: 'bodyweight', muscles: { primary: 'Chest', secondary: 'Triceps', tertiary: 'Shoulders', primaryContribution: 1, secondaryContribution: 0.5, tertiaryContribution: 0.4 } },
    // Back
    'Deadlift': { sets: 3, reps: '4-6', rir: ['2', '2', '2'], rest: '3-5 min', equipment: 'barbell', muscles: { primary: 'Back', secondary: 'Glutes', tertiary: 'Hamstrings', primaryContribution: 1, secondaryContribution: 0.8, tertiaryContribution: 0.7 } },
    'Pull-ups': { sets: 4, reps: '6-10', rir: ['1', '1', '1', '1'], rest: '2-3 min', equipment: 'bodyweight', muscles: { primary: 'Back', secondary: 'Biceps', tertiary: null, primaryContribution: 1, secondaryContribution: 0.6, tertiaryContribution: 0 } },
    'Lat Pulldown': { sets: 3, reps: '10-12', rir: ['1', '1', '1'], rest: '1-2 min', equipment: 'machine', muscles: { primary: 'Back', secondary: 'Biceps', tertiary: null, primaryContribution: 1, secondaryContribution: 0.5, tertiaryContribution: 0 } },
    'Barbell Row': { sets: 3, reps: '8-10', rir: ['2', '2', '2'], rest: '2-3 min', equipment: 'barbell', muscles: { primary: 'Back', secondary: 'Biceps', tertiary: 'Shoulders', primaryContribution: 1, secondaryContribution: 0.5, tertiaryContribution: 0.2 } },
    'Dumbbell Row': { sets: 3, reps: '8-12', rir: ['1', '1', '1'], rest: '2 min', equipment: 'dumbbell', muscles: { primary: 'Back', secondary: 'Biceps', tertiary: null, primaryContribution: 1, secondaryContribution: 0.5, tertiaryContribution: 0 } },
    'T-Bar Row': { sets: 3, reps: '8-12', rir: ['1', '1', '1'], rest: '2 min', equipment: 'machine', muscles: { primary: 'Back', secondary: 'Biceps', tertiary: null, primaryContribution: 1, secondaryContribution: 0.5, tertiaryContribution: 0 } },
    // Legs
    'Barbell Squat': { sets: 3, reps: '6-10', rir: ['2', '2', '2'], rest: '3-5 min', equipment: 'barbell', muscles: { primary: 'Quads', secondary: 'Glutes', tertiary: 'Hamstrings', primaryContribution: 1, secondaryContribution: 0.8, tertiaryContribution: 0.4 } },
    'Leg Press': { sets: 4, reps: '10-15', rir: ['1', '1', '1', '1'], rest: '2-3 min', equipment: 'machine', muscles: { primary: 'Quads', secondary: 'Glutes', tertiary: 'Hamstrings', primaryContribution: 1, secondaryContribution: 0.7, tertiaryContribution: 0.3 } },
    'Romanian Deadlift': { sets: 3, reps: '8-12', rir: ['2', '2', '2'], rest: '2-3 min', equipment: 'barbell', muscles: { primary: 'Hamstrings', secondary: 'Glutes', tertiary: 'Back', primaryContribution: 1, secondaryContribution: 0.8, tertiaryContribution: 0.3 } },
    'Leg Extension': { sets: 3, reps: '12-15', rir: ['1', '1', '1'], rest: '1-2 min', equipment: 'machine', muscles: { primary: 'Quads', secondary: null, tertiary: null, primaryContribution: 1, secondaryContribution: 0, tertiaryContribution: 0 } },
    'Leg Curl': { sets: 3, reps: '12-15', rir: ['1', '1', '1'], rest: '1-2 min', equipment: 'machine', muscles: { primary: 'Hamstrings', secondary: null, tertiary: null, primaryContribution: 1, secondaryContribution: 0 } },
    'Bulgarian Split Squat': { sets: 3, reps: '8-12', rir: ['1', '1', '1'], rest: '2 min', equipment: 'dumbbell', muscles: { primary: 'Quads', secondary: 'Glutes', tertiary: null, primaryContribution: 1, secondaryContribution: 0.8, tertiaryContribution: 0 } },
    'Calf Raise': { sets: 4, reps: '15-20', rir: ['1', '1', '1', '1'], rest: '1 min', equipment: 'machine', muscles: { primary: 'Calves', secondary: null, tertiary: null, primaryContribution: 1, secondaryContribution: 0, tertiaryContribution: 0 } },
    // Shoulders
    'Overhead Press (Barbell)': { sets: 3, reps: '6-10', rir: ['2', '2', '2'], rest: '2-3 min', equipment: 'barbell', muscles: { primary: 'Shoulders', secondary: 'Triceps', tertiary: 'Chest', primaryContribution: 1, secondaryContribution: 0.6, tertiaryContribution: 0.2 } },
    'Seated Dumbbell Press': { sets: 3, reps: '8-12', rir: ['1', '1', '1'], rest: '2 min', equipment: 'dumbbell', muscles: { primary: 'Shoulders', secondary: 'Triceps', tertiary: null, primaryContribution: 1, secondaryContribution: 0.5, tertiaryContribution: 0 } },
    'Lateral Raise': { sets: 4, reps: '12-15', rir: ['1', '1', '1', '1'], rest: '1-2 min', equipment: 'dumbbell', muscles: { primary: 'Shoulders', secondary: null, tertiary: null, primaryContribution: 1, secondaryContribution: 0, tertiaryContribution: 0 } },
    'Face Pull': { sets: 3, reps: '15-20', rir: ['1', '1', '1'], rest: '1 min', equipment: 'machine', muscles: { primary: 'Shoulders', secondary: 'Back', tertiary: null, primaryContribution: 1, secondaryContribution: 0.4, tertiaryContribution: 0 } },
    'Barbell Shrug': { sets: 3, reps: '10-15', rir: ['1', '1', '1'], rest: '1 min', equipment: 'barbell', muscles: { primary: 'Back', secondary: null, tertiary: null, primaryContribution: 1, secondaryContribution: 0 } },
    // Biceps
    'Barbell Curl': { sets: 3, reps: '8-12', rir: ['1', '1', '1'], rest: '1-2 min', equipment: 'barbell', muscles: { primary: 'Biceps', secondary: null, tertiary: null, primaryContribution: 1, secondaryContribution: 0, tertiaryContribution: 0 } },
    'Dumbbell Curl': { sets: 3, reps: '10-15', rir: ['1', '1', '1'], rest: '1-2 min', equipment: 'dumbbell', muscles: { primary: 'Biceps', secondary: null, tertiary: null, primaryContribution: 1, secondaryContribution: 0, tertiaryContribution: 0 } },
    'Hammer Curl': { sets: 3, reps: '10-15', rir: ['1', '1', '1'], rest: '1-2 min', equipment: 'dumbbell', muscles: { primary: 'Biceps', secondary: 'Forearms', tertiary: null, primaryContribution: 1, secondaryContribution: 0.3, tertiaryContribution: 0 } },
    'Preacher Curl': { sets: 3, reps: '10-12', rir: ['1', '1', '1'], rest: '1-2 min', equipment: 'machine', muscles: { primary: 'Biceps', secondary: null, tertiary: null, primaryContribution: 1, secondaryContribution: 0, tertiaryContribution: 0 } },
    // Triceps
    'Triceps Pushdown': { sets: 3, reps: '10-15', rir: ['1', '1', '1'], rest: '1-2 min', equipment: 'machine', muscles: { primary: 'Triceps', secondary: null, tertiary: null, primaryContribution: 1, secondaryContribution: 0, tertiaryContribution: 0 } },
    'Skull Crusher': { sets: 3, reps: '10-12', rir: ['2', '2', '2'], rest: '1-2 min', equipment: 'barbell', muscles: { primary: 'Triceps', secondary: null, tertiary: null, primaryContribution: 1, secondaryContribution: 0, tertiaryContribution: 0 } },
    'Overhead Triceps Extension (Dumbbell)': { sets: 3, reps: '10-15', rir: ['1', '1', '1'], rest: '1-2 min', equipment: 'dumbbell', muscles: { primary: 'Triceps', secondary: null, tertiary: null, primaryContribution: 1, secondaryContribution: 0, tertiaryContribution: 0 } },
    'Dips': { sets: 3, reps: 'To Failure', rir: ['1', '1', '1'], rest: '2 min', equipment: 'bodyweight', muscles: { primary: 'Triceps', secondary: 'Chest', tertiary: 'Shoulders', primaryContribution: 1, secondaryContribution: 0.6, tertiaryContribution: 0.4 } },
};

const makeExercise = (sets, reps, rir, rest, equipment, primary, secondary = null, tertiary = null) => ({
    sets,
    reps,
    rir: Array.from({ length: sets }, () => `${rir}`),
    rest,
    equipment,
    muscles: { primary, secondary, tertiary }
});

const expandedExerciseBank = {
    // Chest
    'Incline Barbell Bench Press': makeExercise(3, '6-10', 2, '2-3 min', 'barbell', 'Chest', 'Shoulders', 'Triceps', 1, 0.6, 0.4),
    'Decline Barbell Bench Press': makeExercise(3, '8-12', 2, '2-3 min', 'barbell', 'Chest', 'Triceps', 'Shoulders', 1, 0.5, 0.2),
    'Close-Grip Bench Press': makeExercise(3, '6-10', 2, '2-3 min', 'barbell', 'Triceps', 'Chest', 'Shoulders', 1, 0.6, 0.3),
    'Pec Deck Fly': makeExercise(3, '12-20', 1, '1-2 min', 'machine', 'Chest', null, null, 1, 0, 0),
    'Cable Fly Low-to-High': makeExercise(3, '12-20', 1, '1-2 min', 'machine', 'Chest', 'Shoulders', null, 1, 0.25, 0),
    'Cable Fly High-to-Low': makeExercise(3, '12-20', 1, '1-2 min', 'machine', 'Chest', null, null, 1, 0, 0),
    'Smith Machine Bench Press': makeExercise(3, '8-12', 2, '2-3 min', 'machine', 'Chest', 'Triceps', 'Shoulders', 1, 0.45, 0.25),
    'Weighted Dip': makeExercise(3, '6-10', 1, '2-3 min', 'bodyweight', 'Triceps', 'Chest', 'Shoulders', 1, 0.7, 0.35),

    // Back
    'Chest-Supported Row': makeExercise(3, '8-12', 1, '2 min', 'machine', 'Back', 'Biceps', 'Shoulders', 1, 0.4, 0.2),
    'Seated Cable Row': makeExercise(3, '8-12', 1, '2 min', 'machine', 'Back', 'Biceps', null, 1, 0.45, 0),
    'Single-Arm Cable Row': makeExercise(3, '10-15', 1, '1-2 min', 'machine', 'Back', 'Biceps', null, 1, 0.4, 0),
    'Meadows Row': makeExercise(3, '8-12', 1, '2 min', 'barbell', 'Back', 'Biceps', 'Shoulders', 1, 0.4, 0.2),
    'Machine High Row': makeExercise(3, '8-12', 1, '2 min', 'machine', 'Back', 'Biceps', null, 1, 0.45, 0),
    'Straight-Arm Pulldown': makeExercise(3, '12-20', 1, '1-2 min', 'machine', 'Back', null, null, 1, 0, 0),
    'Neutral-Grip Pulldown': makeExercise(3, '8-12', 1, '2 min', 'machine', 'Back', 'Biceps', null, 1, 0.5, 0),
    'Inverted Row': makeExercise(3, '8-15', 1, '2 min', 'bodyweight', 'Back', 'Biceps', 'Shoulders', 1, 0.5, 0.2),

    // Quads and glutes
    'Front Squat': makeExercise(3, '5-8', 2, '3-5 min', 'barbell', 'Quads', 'Glutes', 'Back', 1, 0.5, 0.3),
    'Hack Squat': makeExercise(4, '8-12', 1, '2-3 min', 'machine', 'Quads', 'Glutes', 'Hamstrings', 1, 0.5, 0.2),
    'Smith Machine Squat': makeExercise(3, '8-12', 1, '2-3 min', 'machine', 'Quads', 'Glutes', 'Hamstrings', 1, 0.6, 0.2),
    'Goblet Squat': makeExercise(3, '10-15', 1, '2 min', 'dumbbell', 'Quads', 'Glutes', 'Core', 1, 0.5, 0.25),
    'Walking Lunge': makeExercise(3, '10-16/leg', 1, '2 min', 'dumbbell', 'Quads', 'Glutes', 'Hamstrings', 1, 0.8, 0.3),
    'Reverse Lunge': makeExercise(3, '8-12/leg', 1, '2 min', 'dumbbell', 'Glutes', 'Quads', 'Hamstrings', 1, 0.75, 0.35),
    'Step-Up': makeExercise(3, '8-12/leg', 1, '2 min', 'dumbbell', 'Glutes', 'Quads', 'Hamstrings', 1, 0.7, 0.3),
    'Barbell Hip Thrust': makeExercise(4, '6-10', 1, '2-3 min', 'barbell', 'Glutes', 'Hamstrings', 'Quads', 1, 0.35, 0.15),
    'Smith Machine Hip Thrust': makeExercise(4, '8-12', 1, '2 min', 'machine', 'Glutes', 'Hamstrings', null, 1, 0.3, 0),
    'Cable Pull-Through': makeExercise(3, '12-15', 1, '1-2 min', 'machine', 'Glutes', 'Hamstrings', 'Back', 1, 0.6, 0.2),
    'Glute Bridge': makeExercise(3, '10-15', 1, '1-2 min', 'barbell', 'Glutes', 'Hamstrings', null, 1, 0.35, 0),
    'Cable Kickback': makeExercise(3, '12-20', 1, '1 min', 'machine', 'Glutes', 'Hamstrings', null, 1, 0.2, 0),
    'Hip Abduction Machine': makeExercise(3, '15-25', 1, '1 min', 'machine', 'Glutes', null, null, 1, 0, 0),
    'Banded Lateral Walk': makeExercise(3, '15-25/side', 1, '1 min', 'band', 'Glutes', null, null, 1, 0, 0),

    // Hamstrings and posterior chain
    'Seated Leg Curl': makeExercise(3, '10-15', 1, '1-2 min', 'machine', 'Hamstrings', null, null, 1, 0, 0),
    'Lying Leg Curl': makeExercise(3, '10-15', 1, '1-2 min', 'machine', 'Hamstrings', null, null, 1, 0, 0),
    'Nordic Curl': makeExercise(3, '4-8', 2, '2-3 min', 'bodyweight', 'Hamstrings', 'Glutes', null, 1, 0.25, 0),
    'Good Morning': makeExercise(3, '6-10', 2, '2-3 min', 'barbell', 'Hamstrings', 'Glutes', 'Back', 1, 0.65, 0.35),
    'Back Extension': makeExercise(3, '10-15', 1, '1-2 min', 'bodyweight', 'Glutes', 'Hamstrings', 'Back', 1, 0.7, 0.4),
    '45-Degree Hyperextension': makeExercise(3, '10-15', 1, '1-2 min', 'bodyweight', 'Glutes', 'Hamstrings', 'Back', 1, 0.7, 0.4),
    'Sumo Deadlift': makeExercise(3, '3-6', 2, '3-5 min', 'barbell', 'Glutes', 'Back', 'Hamstrings', 1, 0.8, 0.6),
    'Trap Bar Deadlift': makeExercise(3, '4-8', 2, '3-5 min', 'barbell', 'Quads', 'Glutes', 'Back', 1, 0.7, 0.5),

    // Shoulders
    'Arnold Press': makeExercise(3, '8-12', 1, '2 min', 'dumbbell', 'Shoulders', 'Triceps', null, 1, 0.45, 0),
    'Machine Shoulder Press': makeExercise(3, '8-12', 1, '2 min', 'machine', 'Shoulders', 'Triceps', null, 1, 0.45, 0),
    'Cable Lateral Raise': makeExercise(3, '12-20', 1, '1 min', 'machine', 'Shoulders', null, null, 1, 0, 0),
    'Rear Delt Fly': makeExercise(3, '12-20', 1, '1 min', 'dumbbell', 'Shoulders', 'Back', null, 1, 0.25, 0),
    'Reverse Pec Deck': makeExercise(3, '12-20', 1, '1 min', 'machine', 'Shoulders', 'Back', null, 1, 0.25, 0),
    'Upright Row': makeExercise(3, '10-15', 1, '1-2 min', 'barbell', 'Shoulders', 'Back', 'Biceps', 1, 0.3, 0.2),

    // Arms
    'Cable Curl': makeExercise(3, '10-15', 1, '1-2 min', 'machine', 'Biceps', null, null, 1, 0, 0),
    'Incline Dumbbell Curl': makeExercise(3, '10-15', 1, '1-2 min', 'dumbbell', 'Biceps', null, null, 1, 0, 0),
    'Concentration Curl': makeExercise(3, '10-15', 1, '1 min', 'dumbbell', 'Biceps', null, null, 1, 0, 0),
    'EZ-Bar Curl': makeExercise(3, '8-12', 1, '1-2 min', 'barbell', 'Biceps', 'Forearms', null, 1, 0.25, 0),
    'Rope Triceps Pushdown': makeExercise(3, '10-15', 1, '1-2 min', 'machine', 'Triceps', null, null, 1, 0, 0),
    'Cable Overhead Triceps Extension': makeExercise(3, '10-15', 1, '1-2 min', 'machine', 'Triceps', null, null, 1, 0, 0),
    'Close-Grip Push-up': makeExercise(3, 'To Failure', 0, '1-2 min', 'bodyweight', 'Triceps', 'Chest', 'Shoulders', 1, 0.45, 0.25),

    // Calves, core, conditioning
    'Standing Calf Raise': makeExercise(4, '8-12', 1, '1 min', 'machine', 'Calves', null, null, 1, 0, 0),
    'Seated Calf Raise': makeExercise(4, '12-20', 1, '1 min', 'machine', 'Calves', null, null, 1, 0, 0),
    'Tibialis Raise': makeExercise(3, '15-25', 1, '1 min', 'bodyweight', 'Tibialis', null, null, 1, 0, 0),
    'Hanging Leg Raise': makeExercise(3, '8-15', 1, '1-2 min', 'bodyweight', 'Core', 'Hip Flexors', null, 1, 0.5, 0),
    'Cable Crunch': makeExercise(3, '10-15', 1, '1-2 min', 'machine', 'Core', null, null, 1, 0, 0),
    'Pallof Press': makeExercise(3, '10-15/side', 1, '1 min', 'machine', 'Core', null, null, 1, 0, 0),
    'Plank': makeExercise(3, '30-60 sec', 1, '1 min', 'bodyweight', 'Core', null, null, 1, 0, 0),
    'Farmer Carry': makeExercise(3, '30-60 sec', 1, '1-2 min', 'dumbbell', 'Forearms', 'Core', 'Back', 1, 0.5, 0.4),
};

export const exerciseBank = {
    ...Object.fromEntries(
        Object.entries({
            ...baseExerciseBank,
            ...expandedExerciseBank,
        }).map(([name, details]) => [name, normalizeExerciseDetails(details)])
    ),
};
