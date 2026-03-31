// --- PRESET PROGRAM DATA ---
export const presets = {
    "optimal-ppl-ul": {
      "name": "Optimal PPL-UL",
      "info": {
        "weeks": 8,
        "split": "Pull/Push/Legs/Rest/Upper/Lower"
      },
      "masterExerciseList": {
        "Preacher Curl": {
          "rest": "1-2 min",
          "muscles": {
            "secondaryContribution": 0.5,
            "tertiaryContribution": 0.25,
            "primary": "Biceps",
            "primaryContribution": 1,
            "secondary": "",
            "tertiary": ""
          },
          "reps": "6-8",
          "sets": 3,
          "lastSetTechnique": "",
          "rir": ["1-2", "1-2", "0"],
          "equipment": "barbell"
        },
        "Pullups": {
          "reps": "5-7",
          "equipment": "bodyweight",
          "muscles": {
            "primaryContribution": 1,
            "secondaryContribution": 0.5,
            "secondary": "Biceps",
            "tertiaryContribution": 0.25,
            "tertiary": "",
            "primary": "Back"
          },
          "rir": ["1-2", "1-2", "0"],
          "lastSetTechnique": "",
          "sets": "3",
          "rest": "2-3 min"
        },
        "Safety Bar Squats": {
          "rir": ["0", "0"],
          "reps": "5-7",
          "muscles": {
            "secondaryContribution": 0.5,
            "secondary": "Glutes",
            "tertiary": "",
            "primaryContribution": 1,
            "primary": "Quads",
            "tertiaryContribution": 0.25
          },
          "rest": "2-3 min",
          "equipment": "barbell",
          "sets": 2,
          "lastSetTechnique": ""
        },
        "Standing Calf Raise": {
          "muscles": {
            "primaryContribution": 1,
            "tertiaryContribution": 0.25,
            "secondary": "",
            "primary": "Calves",
            "tertiary": "",
            "secondaryContribution": 0.5
          },
          "rir": ["0", "0", "0", "0"],
          "rest": "1 min",
          "sets": 4,
          "equipment": "machine",
          "lastSetTechnique": "Static Stretch",
          "reps": "5-7"
        },
        "Bayesian Cable Curl": {
          "rest": "1-2 min",
          "lastSetTechnique": "",
          "reps": "6-8",
          "sets": 3,
          "muscles": {
            "tertiary": "",
            "secondary": "",
            "primary": "Biceps",
            "secondaryContribution": 0.5,
            "primaryContribution": 1,
            "tertiaryContribution": 0.25
          },
          "rir": ["0", "0", "0"],
          "equipment": "machine"
        },
        "Incline DB Press": {
          "sets": 2,
          "equipment": "dumbbell",
          "reps": "5-7",
          "rest": "2-3 min",
          "rir": ["1", "1"],
          "lastSetTechnique": "",
          "muscles": {
            "tertiary": "",
            "secondary": "Shoulders",
            "tertiaryContribution": 0.25,
            "secondaryContribution": 0.5,
            "primary": "Chest",
            "primaryContribution": 1
          }
        },
        "Lying Leg Curl": {
          "muscles": {
            "tertiary": "",
            "primaryContribution": 1,
            "secondary": "",
            "secondaryContribution": 0.5,
            "primary": "Hamstrings",
            "tertiaryContribution": 0.25
          },
          "reps": "5-7",
          "lastSetTechnique": "LLPs",
          "rest": "1-2 min",
          "rir": ["0", "0", "0"],
          "equipment": "machine",
          "sets": 3
        },
        "Cable Crunch": {
          "lastSetTechnique": "Myo-reps",
          "rir": ["0", "0", "0"],
          "reps": "10-12",
          "muscles": {
            "tertiary": "",
            "primary": "Abs",
            "secondary": "",
            "primaryContribution": 1,
            "tertiaryContribution": 0.25,
            "secondaryContribution": 0.5
          },
          "equipment": "machine",
          "sets": 3,
          "rest": "1 min"
        },
        "Barbell RDL": {
          "lastSetTechnique": "",
          "equipment": "barbell",
          "reps": "5-7",
          "sets": 4,
          "muscles": {
            "tertiary": "",
            "secondary": "Glutes",
            "secondaryContribution": 0.5,
            "tertiaryContribution": 0.25,
            "primary": "Hamstrings",
            "primaryContribution": 1
          },
          "rest": "2-3 min",
          "rir": ["0", "0", "0", "0"]
        },
        "Leg Extensions": {
          "reps": "5-7",
          "rest": "1-2 min",
          "rir": ["0", "0", "0"],
          "lastSetTechnique": "",
          "sets": 3,
          "muscles": {
            "primary": "Quads",
            "secondary": "",
            "secondaryContribution": 0.5,
            "tertiary": "",
            "tertiaryContribution": 0.25,
            "primaryContribution": 1
          },
          "equipment": "machine"
        },
        "Smith Machine Squat": {
          "lastSetTechnique": "",
          "rir": ["0", "0"],
          "muscles": {
            "tertiaryContribution": 0.25,
            "primary": "Quads",
            "secondaryContribution": 0.5,
            "tertiary": "",
            "primaryContribution": 1,
            "secondary": "Glutes"
          },
          "equipment": "machine",
          "rest": "2-3 min",
          "sets": 2,
          "reps": "5-7"
        },
        "Overhead Triceps Extension": {
          "rest": "1-2 min",
          "lastSetTechnique": "",
          "reps": "6-8",
          "sets": 3,
          "equipment": "machine",
          "muscles": {
            "tertiaryContribution": 0.25,
            "tertiary": "",
            "primary": "Triceps",
            "secondary": "",
            "secondaryContribution": 0.5,
            "primaryContribution": 1
          },
          "rir": ["0", "0", "0"]
        },
        "Pec Flies": {
          "rir": ["0", "0"],
          "reps": "6-8",
          "lastSetTechnique": "Stretch Focus",
          "rest": "1-2 min",
          "muscles": {
            "secondary": "",
            "primary": "Chest",
            "primaryContribution": 1,
            "tertiaryContribution": 0.25,
            "secondaryContribution": 0.5,
            "tertiary": ""
          },
          "equipment": "machine",
          "sets": 2
        },
        "DB Bulgarian Split Squat": {
          "rir": ["0", "0", "0"],
          "muscles": {
            "tertiary": "",
            "tertiaryContribution": 0.25,
            "primaryContribution": 1,
            "primary": "Quads",
            "secondary": "Glutes",
            "secondaryContribution": 0.5
          },
          "equipment": "dumbbell",
          "reps": "5-7",
          "lastSetTechnique": "",
          "sets": 3,
          "rest": "2 min"
        },
        "Barbell Bench Press": {
          "rest": "2-3 min",
          "equipment": "barbell",
          "lastSetTechnique": "",
          "reps": "5-7",
          "muscles": {
            "tertiary": "",
            "secondaryContribution": 0.5,
            "primaryContribution": 1,
            "tertiaryContribution": 0.25,
            "secondary": "Triceps",
            "primary": "Chest"
          },
          "sets": 2,
          "rir": ["0", "0"]
        },
        "Hack Squat": {
          "sets": 2,
          "reps": "5-7",
          "equipment": "machine",
          "rest": "2-3 min",
          "muscles": {
            "tertiary": "",
            "secondary": "Glutes",
            "secondaryContribution": 0.5,
            "primary": "Quads",
            "primaryContribution": 1,
            "tertiaryContribution": 0.25
          },
          "rir": ["0", "0"],
          "lastSetTechnique": ""
        },
        "Lat Pullovers": {
          "equipment": "barbell",
          "lastSetTechnique": "LLPs",
          "muscles": {
            "primary": "Back",
            "secondary": ""
          },
          "sets": "2",
          "rest": "2-3 min",
          "reps": "6-8",
          "rir": ["0", "0"]
        },
        "Chest Supported Row": {
          "rest": "2-3 min",
          "rir": ["1-2", "1-2", "0"],
          "reps": "5-7",
          "equipment": "machine",
          "lastSetTechnique": "",
          "sets": "3",
          "muscles": {
            "tertiaryContribution": 0.25,
            "tertiary": "",
            "secondary": "Biceps",
            "primaryContribution": 1,
            "primary": "Back",
            "secondaryContribution": 0.5
          }
        },
        "DB Rows": {
          "muscles": {
            "secondaryContribution": 0.5,
            "tertiaryContribution": 0.25,
            "primaryContribution": 1,
            "secondary": "Biceps",
            "tertiary": "",
            "primary": "Back"
          },
          "rest": "2-3 min",
          "sets": 2,
          "reps": "5-7",
          "equipment": "dumbbell",
          "lastSetTechnique": "",
          "rir": ["0", "0"]
        },
        "DB Lateral Raise": {
          "sets": 3,
          "reps": "8-10",
          "muscles": {
            "secondaryContribution": 0.5,
            "primary": "Shoulders",
            "tertiaryContribution": 0.25,
            "tertiary": "",
            "primaryContribution": 1,
            "secondary": ""
          },
          "rir": ["0", "0", "0"],
          "lastSetTechnique": "Myo-reps",
          "rest": "1-2 min",
          "equipment": "dumbbell"
        }
      },
      "programStructure": {
        "Upper (Strength Focus)": { isRest: false,
          "exercises": [
            "Incline DB Press",
            "Pullups",
            "DB Rows",
            "Barbell Bench Press",
            "DB Lateral Raise",
            "Bayesian Cable Curl",
            "Overhead Triceps Extension"
          ],
          "label": "Upper"
        },
        "Lower (Strength Focus)": { isRest: false,
          "exercises": [
            "Smith Machine Squat",
            "Hack Squat",
            "Safety Bar Squats",
            "Lying Leg Curl",
            "Standing Calf Raise",
            "Cable Crunch"
          ],
          "label": "Lower"
        },
        "Push (Hypertrophy Focus)": { isRest: false,
          "exercises": [
            "Barbell Bench Press",
            "Incline DB Press",
            "DB Lateral Raise",
            "Overhead Triceps Extension",
            "Pec Flies"
          ],
          "label": "Push"
        },
        "Legs (Hypertrophy Focus)": { isRest: false,
          "exercises": [
            "DB Bulgarian Split Squat",
            "Barbell RDL",
            "Leg Extensions",
            "Lying Leg Curl",
            "Standing Calf Raise"
          ],
          "label": "Legs"
        },
        "Pull (Hypertrophy Focus)": { isRest: false,
          "label": "Pull",
          "exercises": [
            "Pullups",
            "Chest Supported Row",
            "DB Lateral Raise",
            "Preacher Curl",
            "Lat Pullovers"
          ]
        },
        "Rest Day": { isRest: true, exercises: [], label: "Rest" },
      },
      "weeklySchedule": [
        { "day": "Mon", "workout": "Pull (Hypertrophy Focus)" },
        { "day": "Tue", "workout": "Push (Hypertrophy Focus)" },
        { "day": "Wed", "workout": "Legs (Hypertrophy Focus)" },
        { "day": "Thu", "workout": "Rest Day" },
        { "day": "Fri", "workout": "Upper (Strength Focus)" },
        { "day": "Sat", "workout": "Lower (Strength Focus)" },
        { "day": "Sun", "workout": "Rest Day" },
      ],
      "workoutOrder": [
        "Pull (Hypertrophy Focus)",
        "Push (Hypertrophy Focus)",
        "Legs (Hypertrophy Focus)",
        "Upper (Strength Focus)",
        "Lower (Strength Focus)",
        "Rest Day",
      ],
      "settings": {
        "restTimer": {
          "enabled": true,
          "duration": 180
        },
        "useWeeklySchedule": true
      },
      "weeklyOverrides": {}
    },
    "beginner-3day-fullbody": {
        name: "Beginner 3-Day Full Body",
        info: { name: "Beginner Full Body", weeks: 6, split: "Full Body A/B" },
        masterExerciseList: {
            'Barbell Squat': { sets: 3, reps: '8-12', rir: ['2','2','2'], rest: '2-3 min', equipment: 'barbell', muscles: { primary: 'Quads', secondary: 'Glutes', primaryContribution: 1, secondaryContribution: 0.8 } },
            'Leg Press': { sets: 3, reps: '10-15', rir: ['1','1','1'], rest: '2-3 min', equipment: 'machine', muscles: { primary: 'Quads', secondary: 'Glutes', primaryContribution: 1, secondaryContribution: 0.7 } },
            'Barbell Bench Press': { sets: 3, reps: '8-12', rir: ['2','2','2'], rest: '2-3 min', equipment: 'barbell', muscles: { primary: 'Chest', secondary: 'Triceps', primaryContribution: 1, secondaryContribution: 0.5 } },
            'Machine Chest Press': { sets: 3, reps: '10-15', rir: ['1','1','1'], rest: '2-3 min', equipment: 'machine', muscles: { primary: 'Chest', secondary: 'Triceps', primaryContribution: 1, secondaryContribution: 0.4 } },
            'Lat Pulldown': { sets: 3, reps: '10-12', rir: ['1','1','1'], rest: '1-2 min', equipment: 'machine', muscles: { primary: 'Back', secondary: 'Biceps', primaryContribution: 1, secondaryContribution: 0.5 } },
            'Dumbbell Row': { sets: 3, reps: '8-12', rir: ['1','1','1'], rest: '2 min', equipment: 'dumbbell', muscles: { primary: 'Back', secondary: 'Biceps', primaryContribution: 1, secondaryContribution: 0.5 } },
            'Seated Dumbbell Press': { sets: 3, reps: '8-12', rir: ['1','1','1'], rest: '2 min', equipment: 'dumbbell', muscles: { primary: 'Shoulders', secondary: 'Triceps', primaryContribution: 1, secondaryContribution: 0.5 } },
            'Lateral Raise': { sets: 3, reps: '12-15', rir: ['1','1','1'], rest: '1-2 min', equipment: 'dumbbell', muscles: { primary: 'Shoulders', secondary: null, primaryContribution: 1, secondaryContribution: 0 } },
            'Dumbbell Curl': { sets: 2, reps: '10-15', rir: ['1','1'], rest: '1-2 min', equipment: 'dumbbell', muscles: { primary: 'Biceps', secondary: null, primaryContribution: 1, secondaryContribution: 0 } },
            'Triceps Pushdown': { sets: 2, reps: '10-15', rir: ['1','1'], rest: '1-2 min', equipment: 'machine', muscles: { primary: 'Triceps', secondary: null, primaryContribution: 1, secondaryContribution: 0 } },
        },
        programStructure: {
            'Workout A': { isRest: false, exercises: ['Barbell Squat', 'Barbell Bench Press', 'Lat Pulldown', 'Lateral Raise', 'Triceps Pushdown'], label: 'A' },
            'Workout B': { isRest: false, exercises: ['Leg Press', 'Seated Dumbbell Press', 'Dumbbell Row', 'Machine Chest Press', 'Dumbbell Curl'], label: 'B' },
            "Rest Day": { isRest: true, exercises: [], label: "Rest" },
        },
        weeklySchedule: [
            { day: 'Mon', workout: 'Workout A' }, { day: 'Tue', workout: 'Rest Day' },
            { day: 'Wed', workout: 'Workout B' }, { day: 'Thu', workout: 'Rest Day' },
            { day: 'Fri', workout: 'Workout A' }, { day: 'Sat', workout: 'Rest Day' },
            { day: 'Sun', workout: 'Rest Day' },
        ],
        workoutOrder: ['Workout A', 'Workout B', 'Rest Day'],
        settings: { useWeeklySchedule: true, restTimer: { enabled: true, duration: 120 } },
        weeklyOverrides: {},
    },
    "upper-lower-4day": {
        name: "4-Day Upper/Lower Split",
        info: { name: "Upper/Lower Split", weeks: 8, split: "Upper/Lower" },
        masterExerciseList: {
            'Barbell Bench Press': { sets: 3, reps: '6-8', rir: ['2','2','2'], rest: '2-3 min', equipment: 'barbell', muscles: { primary: 'Chest', secondary: 'Triceps', tertiary: 'Shoulders', primaryContribution: 1, secondaryContribution: 0.5, tertiaryContribution: 0.3 } },
            'Incline Dumbbell Press': { sets: 3, reps: '8-12', rir: ['1','1','1'], rest: '2 min', equipment: 'dumbbell', muscles: { primary: 'Chest', secondary: 'Shoulders', tertiary: 'Triceps', primaryContribution: 1, secondaryContribution: 0.6, tertiaryContribution: 0.3 } },
            'Barbell Row': { sets: 3, reps: '6-8', rir: ['2','2','2'], rest: '2-3 min', equipment: 'barbell', muscles: { primary: 'Back', secondary: 'Biceps', primaryContribution: 1, secondaryContribution: 0.5 } },
            'Lat Pulldown': { sets: 3, reps: '8-12', rir: ['1','1','1'], rest: '2 min', equipment: 'machine', muscles: { primary: 'Back', secondary: 'Biceps', primaryContribution: 1, secondaryContribution: 0.5 } },
            'Overhead Press (Barbell)': { sets: 3, reps: '6-8', rir: ['2','2','2'], rest: '2-3 min', equipment: 'barbell', muscles: { primary: 'Shoulders', secondary: 'Triceps', primaryContribution: 1, secondaryContribution: 0.6 } },
            'Lateral Raise': { sets: 4, reps: '10-15', rir: ['1','1','1','1'], rest: '1-2 min', equipment: 'dumbbell', muscles: { primary: 'Shoulders', secondary: null, primaryContribution: 1, secondaryContribution: 0 } },
            'Barbell Curl': { sets: 3, reps: '8-12', rir: ['1','1','1'], rest: '1-2 min', equipment: 'barbell', muscles: { primary: 'Biceps', secondary: null, primaryContribution: 1, secondaryContribution: 0 } },
            'Skull Crusher': { sets: 3, reps: '8-12', rir: ['1','1','1'], rest: '1-2 min', equipment: 'barbell', muscles: { primary: 'Triceps', secondary: null, primaryContribution: 1, secondaryContribution: 0 } },
            'Barbell Squat': { sets: 3, reps: '6-8', rir: ['2','2','2'], rest: '3 min', equipment: 'barbell', muscles: { primary: 'Quads', secondary: 'Glutes', primaryContribution: 1, secondaryContribution: 0.8 } },
            'Romanian Deadlift': { sets: 3, reps: '8-12', rir: ['2','2','2'], rest: '2-3 min', equipment: 'barbell', muscles: { primary: 'Hamstrings', secondary: 'Glutes', primaryContribution: 1, secondaryContribution: 0.8 } },
            'Leg Press': { sets: 3, reps: '10-15', rir: ['1','1','1'], rest: '2 min', equipment: 'machine', muscles: { primary: 'Quads', secondary: 'Glutes', primaryContribution: 1, secondaryContribution: 0.7 } },
            'Leg Curl': { sets: 3, reps: '10-15', rir: ['1','1','1'], rest: '1-2 min', equipment: 'machine', muscles: { primary: 'Hamstrings', secondary: null, primaryContribution: 1, secondaryContribution: 0 } },
            'Calf Raise': { sets: 4, reps: '10-15', rir: ['1','1','1','1'], rest: '1 min', equipment: 'machine', muscles: { primary: 'Calves', secondary: null, primaryContribution: 1, secondaryContribution: 0 } },
        },
        programStructure: {
            'Upper Strength': { isRest: false, exercises: ['Barbell Bench Press', 'Barbell Row', 'Overhead Press (Barbell)', 'Barbell Curl', 'Skull Crusher'], label: 'U-Str' },
            'Lower Strength': { isRest: false, exercises: ['Barbell Squat', 'Romanian Deadlift', 'Calf Raise'], label: 'L-Str' },
            'Upper Hypertrophy': { isRest: false, exercises: ['Incline Dumbbell Press', 'Lat Pulldown', 'Lateral Raise', 'Barbell Curl', 'Skull Crusher'], label: 'U-Hyp' },
            'Lower Hypertrophy': { isRest: false, exercises: ['Leg Press', 'Leg Curl', 'Calf Raise'], label: 'L-Hyp' },
            "Rest Day": { isRest: true, exercises: [], label: "Rest" },
        },
        weeklySchedule: [
            { day: 'Mon', workout: 'Upper Strength' }, { day: 'Tue', workout: 'Lower Strength' },
            { day: 'Wed', workout: 'Rest Day' }, { day: 'Thu', workout: 'Upper Hypertrophy' },
            { day: 'Fri', workout: 'Lower Hypertrophy' }, { day: 'Sat', workout: 'Rest Day' },
            { day: 'Sun', workout: 'Rest Day' },
        ],
        workoutOrder: ['Upper Strength', 'Lower Strength', 'Upper Hypertrophy', 'Lower Hypertrophy', 'Rest Day'],
        settings: { useWeeklySchedule: true, restTimer: { enabled: true, duration: 150 } },
        weeklyOverrides: {},
    },
    "strength-5x5": {
        name: "Strength Focused 5x5",
        info: { name: "Classic 5x5", weeks: 12, split: "Full Body A/B" },
        masterExerciseList: {
            'Barbell Squat': { sets: 5, reps: '5', rir: ['2','2','2','2','2'], rest: '3-5 min', equipment: 'barbell', muscles: { primary: 'Quads', secondary: 'Glutes', primaryContribution: 1, secondaryContribution: 0.8 } },
            'Barbell Bench Press': { sets: 5, reps: '5', rir: ['2','2','2','2','2'], rest: '3-5 min', equipment: 'barbell', muscles: { primary: 'Chest', secondary: 'Triceps', primaryContribution: 1, secondaryContribution: 0.5 } },
            'Deadlift': { sets: 1, reps: '5', rir: ['2'], rest: '5 min', equipment: 'barbell', muscles: { primary: 'Back', secondary: 'Glutes', tertiary: 'Hamstrings', primaryContribution: 1, secondaryContribution: 0.8, tertiaryContribution: 0.7 } },
            'Overhead Press (Barbell)': { sets: 5, reps: '5', rir: ['2','2','2','2','2'], rest: '3-5 min', equipment: 'barbell', muscles: { primary: 'Shoulders', secondary: 'Triceps', primaryContribution: 1, secondaryContribution: 0.6 } },
            'Barbell Row': { sets: 5, reps: '5', rir: ['2','2','2','2','2'], rest: '3 min', equipment: 'barbell', muscles: { primary: 'Back', secondary: 'Biceps', primaryContribution: 1, secondaryContribution: 0.5 } },
            'Dips': { sets: 3, reps: '8-12', rir: ['1','1','1'], rest: '2 min', equipment: 'bodyweight', muscles: { primary: 'Triceps', secondary: 'Chest', primaryContribution: 1, secondaryContribution: 0.6 } },
            'Pull-ups': { sets: 3, reps: 'To Failure', rir: ['1','1','1'], rest: '2-3 min', equipment: 'bodyweight', muscles: { primary: 'Back', secondary: 'Biceps', primaryContribution: 1, secondaryContribution: 0.6 } },
        },
        programStructure: {
            'Workout A': { isRest: false, exercises: ['Barbell Squat', 'Barbell Bench Press', 'Barbell Row', 'Dips'], label: 'A' },
            'Workout B': { isRest: false, exercises: ['Barbell Squat', 'Overhead Press (Barbell)', 'Deadlift', 'Pull-ups'], label: 'B' },
            "Rest Day": { isRest: true, exercises: [], label: "Rest" },
        },
        weeklySchedule: [
            { day: 'Mon', workout: 'Workout A' }, { day: 'Tue', workout: 'Rest Day' },
            { day: 'Wed', workout: 'Workout B' }, { day: 'Thu', workout: 'Rest Day' },
            { day: 'Fri', workout: 'Workout A' }, { day: 'Sat', workout: 'Rest Day' },
            { day: 'Sun', workout: 'Rest Day' },
        ],
        workoutOrder: ['Workout A', 'Workout B', 'Rest Day'],
        settings: { useWeeklySchedule: true, restTimer: { enabled: true, duration: 240 } },
        weeklyOverrides: {},
    },
    "classic-ppl": {
        name: "Classic PPL Split",
        info: { name: "Push/Pull/Legs", weeks: 8, split: "Push/Pull/Legs" },
        masterExerciseList: {
            'Barbell Bench Press': { sets: 4, reps: '6-8', rir: ['2','2','1','1'], rest: '2-3 min', equipment: 'barbell', muscles: { primary: 'Chest', secondary: 'Triceps', tertiary: 'Shoulders', primaryContribution: 1, secondaryContribution: 0.5, tertiaryContribution: 0.3 } },
            'Incline Dumbbell Press': { sets: 3, reps: '8-12', rir: ['1','1','1'], rest: '2 min', equipment: 'dumbbell', muscles: { primary: 'Chest', secondary: 'Shoulders', tertiary: 'Triceps', primaryContribution: 1, secondaryContribution: 0.6, tertiaryContribution: 0.3 } },
            'Seated Dumbbell Press': { sets: 3, reps: '8-10', rir: ['2','1','1'], rest: '2-3 min', equipment: 'dumbbell', muscles: { primary: 'Shoulders', secondary: 'Triceps', primaryContribution: 1, secondaryContribution: 0.6 } },
            'Lateral Raise': { sets: 4, reps: '10-15', rir: ['1','1','0','0'], rest: '90s', equipment: 'dumbbell', muscles: { primary: 'Shoulders', secondary: null, primaryContribution: 1, secondaryContribution: 0 } },
            'Triceps Pushdown': { sets: 3, reps: '10-12', rir: ['1','1','0'], rest: '1-2 min', equipment: 'machine', muscles: { primary: 'Triceps', secondary: null, primaryContribution: 1, secondaryContribution: 0 } },
            'Overhead Triceps Extension (Cable)': { sets: 3, reps: '10-15', rir: ['1','0','0'], rest: '1-2 min', equipment: 'machine', muscles: { primary: 'Triceps', secondary: null, primaryContribution: 1, secondaryContribution: 0 } },
            'Deadlift': { sets: 3, reps: '4-6', rir: ['2','2','2'], rest: '3-5 min', equipment: 'barbell', muscles: { primary: 'Back', secondary: 'Glutes', tertiary: 'Hamstrings', primaryContribution: 1, secondaryContribution: 0.8, tertiaryContribution: 0.7 } },
            'Pull-ups': { sets: 4, reps: '6-10', rir: ['1','1','1','1'], rest: '2-3 min', equipment: 'bodyweight', muscles: { primary: 'Back', secondary: 'Biceps', primaryContribution: 1, secondaryContribution: 0.6 } },
            'Barbell Row': { sets: 3, reps: '8-10', rir: ['2','1','1'], rest: '2 min', equipment: 'barbell', muscles: { primary: 'Back', secondary: 'Biceps', primaryContribution: 1, secondaryContribution: 0.5 } },
            'Face Pull': { sets: 3, reps: '15-20', rir: ['1','1','1'], rest: '1 min', equipment: 'machine', muscles: { primary: 'Shoulders', secondary: 'Back', primaryContribution: 1, secondaryContribution: 0.4 } },
            'Barbell Curl': { sets: 4, reps: '8-12', rir: ['1','1','0','0'], rest: '90s', equipment: 'barbell', muscles: { primary: 'Biceps', secondary: null, primaryContribution: 1, secondaryContribution: 0 } },
            'Hammer Curl': { sets: 3, reps: '10-15', rir: ['1','1','0'], rest: '1-2 min', equipment: 'dumbbell', muscles: { primary: 'Biceps', secondary: 'Forearms', primaryContribution: 1, secondaryContribution: 0.3 } },
            'Barbell Squat': { sets: 4, reps: '6-8', rir: ['2','2','1','1'], rest: '3-4 min', equipment: 'barbell', muscles: { primary: 'Quads', secondary: 'Glutes', tertiary: 'Hamstrings', primaryContribution: 1, secondaryContribution: 0.8, tertiaryContribution: 0.4 } },
            'Romanian Deadlift': { sets: 3, reps: '8-12', rir: ['2','2','2'], rest: '2-3 min', equipment: 'barbell', muscles: { primary: 'Hamstrings', secondary: 'Glutes', primaryContribution: 1, secondaryContribution: 0.8 } },
            'Leg Press': { sets: 3, reps: '10-15', rir: ['1','1','1'], rest: '2-3 min', equipment: 'machine', muscles: { primary: 'Quads', secondary: 'Glutes', primaryContribution: 1, secondaryContribution: 0.7 } },
            'Leg Curl': { sets: 3, reps: '10-15', rir: ['1','1','0'], rest: '1-2 min', equipment: 'machine', muscles: { primary: 'Hamstrings', secondary: null, primaryContribution: 1, secondaryContribution: 0 } },
            'Calf Raise': { sets: 5, reps: '10-15', rir: ['1','1','1','1','1'], rest: '1 min', equipment: 'machine', muscles: { primary: 'Calves', secondary: null, primaryContribution: 1, secondaryContribution: 0 } },
        },
        programStructure: {
            'Push': { isRest: false, exercises: ['Barbell Bench Press', 'Incline Dumbbell Press', 'Seated Dumbbell Press', 'Lateral Raise', 'Triceps Pushdown', 'Overhead Triceps Extension (Cable)'], label: 'Push' },
            'Pull': { isRest: false, exercises: ['Deadlift', 'Pull-ups', 'Barbell Row', 'Face Pull', 'Barbell Curl', 'Hammer Curl'], label: 'Pull' },
            'Legs': { isRest: false, exercises: ['Barbell Squat', 'Romanian Deadlift', 'Leg Press', 'Leg Curl', 'Calf Raise'], label: 'Legs' },
            "Rest Day": { isRest: true, exercises: [], label: "Rest" },
        },
        weeklySchedule: [
            { day: 'Mon', workout: 'Push' }, { day: 'Tue', workout: 'Pull' },
            { day: 'Wed', workout: 'Legs' }, { day: 'Thu', workout: 'Rest Day' },
            { day: 'Fri', workout: 'Push' }, { day: 'Sat', workout: 'Pull' },
            { day: 'Sun', workout: 'Legs' },
        ],
        workoutOrder: ['Push', 'Pull', 'Legs', 'Rest Day'],
        settings: { useWeeklySchedule: true, restTimer: { enabled: true, duration: 180 } },
        weeklyOverrides: {},
    },
};
