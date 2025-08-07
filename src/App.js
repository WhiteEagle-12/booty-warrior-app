import React, { useState, useEffect, useMemo, createContext, useContext, useCallback, useRef } from 'react';
import { ChevronDown, ChevronUp, Dumbbell, CheckCircle, ArrowLeft, BarChart2, Settings, Flame, Repeat, StretchVertical, Lightbulb, Download, XCircle, SkipForward, Menu, X, Search, Trophy, BrainCircuit, PlusCircle, Edit, ArrowUp, ArrowDown, LayoutDashboard, Save, AlertTriangle, Bell, HelpCircle, BookOpen, Star, Award, TrendingUp, Target, Zap, CalendarDays, Shield, Infinity as InfinityIcon, Weight, Upload, Eye, Timer, Pencil, History, Move } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ReferenceLine, BarChart, Bar } from 'recharts';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';


// Firebase Imports - using modular v9+ syntax
import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";


// --- PRESET PROGRAM DATA ---
const presets = {
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
          "rir": [
            "1-2",
            "1-2",
            "0"
          ],
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
          "rir": [
            "1-2",
            "1-2",
            "0"
          ],
          "lastSetTechnique": "",
          "sets": "3",
          "rest": "2-3 min"
        },
        "Safety Bar Squats": {
          "rir": [
            "0",
            "0"
          ],
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
          "rir": [
            "0",
            "0",
            "0",
            "0"
          ],
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
          "rir": [
            "0",
            "0",
            "0"
          ],
          "equipment": "machine"
        },
        "Incline DB Press": {
          "sets": 2,
          "equipment": "dumbbell",
          "reps": "5-7",
          "rest": "2-3 min",
          "rir": [
            "1",
            "1"
          ],
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
          "rir": [
            "0",
            "0",
            "0"
          ],
          "equipment": "machine",
          "sets": 3
        },
        "Cable Crunch": {
          "lastSetTechnique": "Myo-reps",
          "rir": [
            "0",
            "0",
            "0"
          ],
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
          "rir": [
            "0",
            "0",
            "0",
            "0"
          ]
        },
        "Leg Extensions": {
          "reps": "5-7",
          "rest": "1-2 min",
          "rir": [
            "0",
            "0",
            "0"
          ],
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
          "rir": [
            "0",
            "0"
          ],
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
          "rir": [
            "0",
            "0",
            "0"
          ]
        },
        "Pec Flies": {
          "rir": [
            "0",
            "0"
          ],
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
          "rir": [
            "0",
            "0",
            "0"
          ],
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
          "rir": [
            "0",
            "0"
          ]
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
          "rir": [
            "0",
            "0"
          ],
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
          "rir": [
            "0",
            "0"
          ]
        },
        "Chest Supported Row": {
          "rest": "2-3 min",
          "rir": [
            "1-2",
            "1-2",
            "0"
          ],
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
          "rir": [
            "0",
            "0"
          ]
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
          "rir": [
            "0",
            "0",
            "0"
          ],
          "lastSetTechnique": "Myo-reps",
          "rest": "1-2 min",
          "equipment": "dumbbell"
        }
      },
      "programStructure": {
        "Upper (Strength Focus)": {
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
        "Lower (Strength Focus)": {
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
        "Push (Hypertrophy Focus)": {
          "exercises": [
            "Barbell Bench Press",
            "Incline DB Press",
            "DB Lateral Raise",
            "Overhead Triceps Extension",
            "Pec Flies"
          ],
          "label": "Push"
        },
        "Legs (Hypertrophy Focus)": {
          "exercises": [
            "DB Bulgarian Split Squat",
            "Barbell RDL",
            "Leg Extensions",
            "Lying Leg Curl",
            "Standing Calf Raise"
          ],
          "label": "Legs"
        },
        "Pull (Hypertrophy Focus)": {
          "label": "Pull",
          "exercises": [
            "Pullups",
            "Chest Supported Row",
            "DB Lateral Raise",
            "Preacher Curl",
            "Lat Pullovers"
          ]
        }
      },
      "weeklySchedule": [
        {
          "day": "Mon",
          "workout": "Pull (Hypertrophy Focus)"
        },
        {
          "workout": "Push (Hypertrophy Focus)",
          "day": "Tue"
        },
        {
          "workout": "Legs (Hypertrophy Focus)",
          "day": "Wed"
        },
        {
          "day": "Thu",
          "workout": "Rest"
        },
        {
          "day": "Fri",
          "workout": "Upper (Strength Focus)"
        },
        {
          "day": "Sat",
          "workout": "Lower (Strength Focus)"
        },
        {
          "day": "Sun",
          "workout": "Rest"
        }
      ],
      "workoutOrder": [
        "Pull (Hypertrophy Focus)",
        "Push (Hypertrophy Focus)",
        "Legs (Hypertrophy Focus)",
        "Upper (Strength Focus)",
        "Lower (Strength Focus)"
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
            'Workout A': { exercises: ['Barbell Squat', 'Barbell Bench Press', 'Lat Pulldown', 'Lateral Raise', 'Triceps Pushdown'], label: 'A' },
            'Workout B': { exercises: ['Leg Press', 'Seated Dumbbell Press', 'Dumbbell Row', 'Machine Chest Press', 'Dumbbell Curl'], label: 'B' },
        },
        weeklySchedule: [
            { day: 'Mon', workout: 'Workout A' }, { day: 'Tue', workout: 'Rest' },
            { day: 'Wed', workout: 'Workout B' }, { day: 'Thu', workout: 'Rest' },
            { day: 'Fri', workout: 'Workout A' }, { day: 'Sat', workout: 'Rest' },
            { day: 'Sun', workout: 'Rest' },
        ],
        workoutOrder: ['Workout A', 'Workout B'],
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
            'Upper Strength': { exercises: ['Barbell Bench Press', 'Barbell Row', 'Overhead Press (Barbell)', 'Barbell Curl', 'Skull Crusher'], label: 'U-Str' },
            'Lower Strength': { exercises: ['Barbell Squat', 'Romanian Deadlift', 'Calf Raise'], label: 'L-Str' },
            'Upper Hypertrophy': { exercises: ['Incline Dumbbell Press', 'Lat Pulldown', 'Lateral Raise', 'Barbell Curl', 'Skull Crusher'], label: 'U-Hyp' },
            'Lower Hypertrophy': { exercises: ['Leg Press', 'Leg Curl', 'Calf Raise'], label: 'L-Hyp' },
        },
        weeklySchedule: [
            { day: 'Mon', workout: 'Upper Strength' }, { day: 'Tue', workout: 'Lower Strength' },
            { day: 'Wed', workout: 'Rest' }, { day: 'Thu', workout: 'Upper Hypertrophy' },
            { day: 'Fri', workout: 'Lower Hypertrophy' }, { day: 'Sat', workout: 'Rest' },
            { day: 'Sun', workout: 'Rest' },
        ],
        workoutOrder: ['Upper Strength', 'Lower Strength', 'Upper Hypertrophy', 'Lower Hypertrophy'],
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
            'Workout A': { exercises: ['Barbell Squat', 'Barbell Bench Press', 'Barbell Row', 'Dips'], label: 'A' },
            'Workout B': { exercises: ['Barbell Squat', 'Overhead Press (Barbell)', 'Deadlift', 'Pull-ups'], label: 'B' },
        },
        weeklySchedule: [
            { day: 'Mon', workout: 'Workout A' }, { day: 'Tue', workout: 'Rest' },
            { day: 'Wed', workout: 'Workout B' }, { day: 'Thu', workout: 'Rest' },
            { day: 'Fri', workout: 'Workout A' }, { day: 'Sat', workout: 'Rest' },
            { day: 'Sun', workout: 'Rest' },
        ],
        workoutOrder: ['Workout A', 'Workout B'],
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
            'Push': { exercises: ['Barbell Bench Press', 'Incline Dumbbell Press', 'Seated Dumbbell Press', 'Lateral Raise', 'Triceps Pushdown', 'Overhead Triceps Extension (Cable)'], label: 'Push' },
            'Pull': { exercises: ['Deadlift', 'Pull-ups', 'Barbell Row', 'Face Pull', 'Barbell Curl', 'Hammer Curl'], label: 'Pull' },
            'Legs': { exercises: ['Barbell Squat', 'Romanian Deadlift', 'Leg Press', 'Leg Curl', 'Calf Raise'], label: 'Legs' },
        },
        weeklySchedule: [
            { day: 'Mon', workout: 'Push' }, { day: 'Tue', workout: 'Pull' },
            { day: 'Wed', workout: 'Legs' }, { day: 'Thu', workout: 'Rest' },
            { day: 'Fri', workout: 'Push' }, { day: 'Sat', workout: 'Pull' },
            { day: 'Sun', workout: 'Legs' },
        ],
        workoutOrder: ['Push', 'Pull', 'Legs'],
        settings: { useWeeklySchedule: true, restTimer: { enabled: true, duration: 180 } },
        weeklyOverrides: {},
    },
};

// --- EXERCISE BANK DATA ---
const exerciseBank = {
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

// --- Helper Functions & Context ---
const getExerciseDetails = (exerciseName, masterList) => masterList?.[exerciseName] || null;

const getWorkoutForWeek = (programData, week, workoutName) => {
    // This function now only retrieves the master template. Overrides are handled at the schedule level.
    if (!workoutName || workoutName === 'Rest') return null;
    return programData?.programStructure?.[workoutName] || null;
};

const getWorkoutNameForDay = (pData, week, dayKey) => {
    // Centralized function to get the correct workout name, respecting overrides.
    return pData.weeklyOverrides?.[week]?.[dayKey] || pData.weeklySchedule.find(s => s.day === dayKey)?.workout || 'Rest';
};

const calculateE1RM = (weight, reps, rir) => {
    // Correctly use RIR in e1RM calculation
    const numWeight = parseFloat(weight);
    const numReps = parseInt(reps, 10);
    const numRir = parseInt(rir, 10) || 0;

    if (isNaN(numWeight) || isNaN(numReps) || numReps < 1) return 0;
    
    const effectiveReps = numReps + numRir;
    if (effectiveReps <= 1) return Math.round(numWeight);

    // Using the Epley formula
    return Math.round(numWeight * (1 + (effectiveReps / 30)));
};


const getSetVolume = (log, masterExerciseList) => {
    // Implement accurate dumbbell volume tracking
    if (!log || log.skipped || (log.load !== 0 && !log.load) || !log.reps) return 0;
    const volume = parseFloat(log.load) * parseInt(log.reps, 10);
    const details = getExerciseDetails(log.exercise, masterExerciseList);
    if (details?.equipment === 'dumbbell' || details?.equipment === 'kettlebell') {
        return volume * 2;
    }
    return volume;
};

// FIX: Centralized, robust helper function for checking set completion.
const isSetLogComplete = (log) => {
    if (!log) return false;
    if (log.skipped) return true;
    const isLoadValid = log.load === 0 || (log.load && !isNaN(parseFloat(log.load)));
    const areRepsValid = log.reps && !isNaN(parseInt(log.reps, 10)) && log.reps !== '';
    const isRirValid = log.rir !== undefined && log.rir !== null && log.rir !== '' && !isNaN(parseInt(log.rir, 10));
    return isLoadValid && areRepsValid && isRirValid;
}

const findLastPerformanceLogs = (exerciseName, currentWeek, currentDayKey, allLogs, sessionHistoryCount = 5) => {
    const dayOrder = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
    const allSessions = {};

    for (const logId in allLogs) {
        const log = allLogs[logId];
        if (log.exercise === exerciseName && !log.skipped && (log.load || log.load === 0) && log.reps) {
            const sessionKey = `${log.week}-${log.dayKey}`;
            if (!allSessions[sessionKey]) {
                const logDayNum = (log.week - 1) * 7 + (dayOrder[log.dayKey] || 0);
                allSessions[sessionKey] = { week: log.week, dayKey: log.dayKey, dayNum: logDayNum, logs: [] };
            }
            allSessions[sessionKey].logs.push(log);
        }
    }
    
    const currentDayNum = (currentWeek - 1) * 7 + (dayOrder[currentDayKey] || 0);
    
    const pastSessions = Object.values(allSessions)
        .filter(session => session.dayNum < currentDayNum)
        .sort((a, b) => b.dayNum - a.dayNum);

    if (pastSessions.length === 0) return { lastSession: null, historicalSessions: [] };
    
    const lastSessionLogs = pastSessions[0].logs.reduce((acc, log) => { acc[log.set] = log; return acc; }, {});
    
    return {
        lastSession: lastSessionLogs,
        historicalSessions: pastSessions.slice(0, sessionHistoryCount)
    };
};

const getProgressionSuggestion = (exerciseName, lastPerformanceData, masterList) => {
    const { lastSession, historicalSessions } = lastPerformanceData;

    if (!lastSession) {
        return "This is your first time doing this exercise. Focus on good form and finding a challenging weight for the target reps.";
    }

    const exerciseDetails = getExerciseDetails(exerciseName, masterList);
    if (!exerciseDetails) return "Log your first set to get a baseline.";

    const [minRepsStr, maxRepsStr] = (exerciseDetails.reps || '0-0').split('-');
    const minReps = parseInt(minRepsStr, 10);
    const maxReps = parseInt(maxRepsStr, 10);

    // Get the best set from the most recent session
    const lastSets = Object.values(lastSession);
    const lastTopSet = lastSets.reduce((best, current) => (!best || calculateE1RM(current.load, current.reps, current.rir) > calculateE1RM(best.load, best.reps, best.rir) ? current : best), null);
    if (!lastTopSet) return "Log your first set to get a baseline.";

    const lastReps = parseInt(lastTopSet.reps, 10);
    const lastWeight = parseFloat(lastTopSet.load);
    const lastRir = parseInt(lastTopSet.rir, 10);
    
    const historicalE1RMs = historicalSessions
        .map(s => Math.max(...s.logs.map(l => calculateE1RM(l.load, l.reps, l.rir))))
        .reverse(); // oldest to newest

    let trend = "stable";
    if (historicalE1RMs.length > 2) {
        const latestE1RM = historicalE1RMs[historicalE1RMs.length - 1];
        const avgPreviousE1RM = historicalE1RMs.slice(0, -1).reduce((a, b) => a + b, 0) / (historicalE1RMs.length - 1);
        if (latestE1RM > avgPreviousE1RM * 1.02) trend = "improving";
        if (latestE1RM < avgPreviousE1RM * 0.98) trend = "declining";
    }

    // Main progression logic
    if (lastReps >= maxReps && lastRir <= (parseInt(exerciseDetails.rir[0], 10) + 1)) {
        let increment = 5; // Default for barbell/machine
        if (['dumbbell', 'kettlebell'].includes(exerciseDetails.equipment)) increment = 5; 
        if (exerciseDetails.equipment === 'bodyweight') return `Add weight or aim for ${lastReps + 1} reps. You're getting stronger!`;
        
        const newWeight = lastWeight + increment;
        if (trend === "improving") {
            return `Trend is up! Let's increase the weight. Try for ${newWeight} lbs/kg in the ${minReps}-${maxReps} rep range.`;
        }
        return `You hit the top of the rep range. Try increasing weight to ${newWeight} lbs/kg for ${minReps}-${maxReps} reps.`;
    }
    
    if (lastReps >= minReps && lastReps < maxReps) {
        if (trend === "declining") {
            return `Strength seems to be trending down. Let's focus on hitting ${lastReps} reps with solid form at ${lastWeight} lbs/kg before pushing for more.`;
        }
        return `You're in the sweet spot. Aim for ${lastReps + 1} reps with ${lastWeight} lbs/kg to progress within the rep range.`;
    }

    if (lastReps < minReps) {
        let decrement = 5;
        if (['dumbbell', 'kettlebell'].includes(exerciseDetails.equipment)) decrement = 5;
        const newWeight = Math.max(0, lastWeight - decrement);
        return `Last session was below the target rep range. Try lowering weight to ~${newWeight} lbs/kg to hit ${minReps}-${maxReps} reps with good form.`;
    }

    return `Last: ${lastWeight}x${lastReps}. Aim for the ${minReps}-${maxReps} rep range.`;
};


// --- App State Context ---
const AppStateContext = createContext();

const AppStateProvider = ({ children }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [modalContent, setModalContent] = useState(null);
    const [toasts, setToasts] = useState([]);
    const scrollYRef = useRef(0);

    const openModal = useCallback((content, size = 'md') => {
        scrollYRef.current = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollYRef.current}px`;
        document.body.style.width = '100%';
        document.body.style.overflowY = 'scroll';
        
        if (!window.history.state?.modal) {
            window.history.pushState({ modal: true }, '');
        }
        setModalContent({ content, size });
    }, []);

    const closeModal = useCallback(() => {
        if (window.history.state?.modal) {
            window.history.back();
        } else {
            setModalContent(null);
        }
    }, []);

    useEffect(() => {
        const handlePopState = () => {
            setModalContent(null);
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    useEffect(() => {
        if (modalContent === null) {
            const isBodyFixed = document.body.style.position === 'fixed';
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.overflowY = '';
            if (isBodyFixed) {
                window.scrollTo(0, scrollYRef.current);
            }
        }
    }, [modalContent]);
    
    const addToast = useCallback((message, level = 'success') => {
        const id = crypto.randomUUID();
        setToasts(prev => [...prev, { id, message, level }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const value = {
        isSidebarOpen,
        setSidebarOpen,
        modalContent,
        openModal,
        closeModal,
        toasts,
        addToast,
    };

    return (
        <AppStateContext.Provider value={value}>
            {children}
        </AppStateContext.Provider>
    );
};

// --- Firebase Context ---
const FirebaseContext = createContext(null);

const FirebaseProvider = ({ children }) => {
    const [firebaseServices, setFirebaseServices] = useState(null);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [customId, setCustomId] = useState(() => localStorage.getItem('projectOverloadSyncId') || '');

    useEffect(() => {
        const firebaseConfig = {
            apiKey: "AIzaSyDVa7T9j2UxbURwEtwGfJne8OpbFmIYrds",
            authDomain: "booty-warrior.firebaseapp.com",
            projectId: "booty-warrior",
            storageBucket: "booty-warrior.appspot.com",
            messagingSenderId: "690053281718",
            appId: "1:690053281718:web:1b8327379d2dce4b6ab317",
            measurementId: "G-7Z18JX39Q6"
        };
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);
        setFirebaseServices({ auth, db });

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
            } else {
                signInAnonymously(auth).catch(error => console.error("Anonymous sign-in failed", error));
            }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleSetCustomId = useCallback((id) => {
        const sanitizedId = id.trim().replace(/[^a-zA-Z0-9-_]/g, '');
        if (sanitizedId && sanitizedId.length > 0) {
            localStorage.setItem('projectOverloadSyncId', sanitizedId);
            setCustomId(sanitizedId);
            return sanitizedId;
        }
        return null;
    }, []);

    const value = { 
        ...firebaseServices, 
        user, 
        isLoading, 
        customId,
        handleSetCustomId
    };

    return (
        <FirebaseContext.Provider value={value}>
            {children}
        </FirebaseContext.Provider>
    );
};

// --- Theme Context ---
const ThemeContext = createContext();
const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('dark');
    const { customId, db } = useContext(FirebaseContext) || {};

    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        root.style.setProperty('--tooltip-bg', theme === 'dark' ? '#374151' : '#ffffff');
        root.style.setProperty('--tooltip-border', theme === 'dark' ? '#4b5563' : '#d1d5db');
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme(prev => {
            const newTheme = prev === 'light' ? 'dark' : 'light';
            if (customId && db) {
                const userDocRef = doc(db, 'workoutLogs', customId);
                updateDoc(userDocRef, { theme: newTheme });
            }
            return newTheme;
        });
    }, [customId, db]);

    return <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>{children}</ThemeContext.Provider>;
};


// --- Components (Child components defined first) ---

const InfoTooltip = ({ content }) => {
    const { theme } = useContext(ThemeContext);
    const [show, setShow] = useState(false);

    // Using CSS variables set in the ThemeProvider for consistency
    const tooltipStyle = {
        backgroundColor: 'var(--tooltip-bg)',
        border: '1px solid var(--tooltip-border)',
        color: theme === 'dark' ? 'white' : 'black',
    };

    return (
        <div className="relative flex items-center"
             onMouseEnter={() => setShow(true)}
             onMouseLeave={() => setShow(false)}
        >
            <HelpCircle size={16} className="text-gray-500 dark:text-gray-400 cursor-pointer" />
            {show && (
                <div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 rounded-md shadow-lg z-10 text-xs"
                    style={tooltipStyle}
                >
                    {content}
                </div>
            )}
        </div>
    );
};

const IntensityTechnique = ({ technique }) => {
    if (!technique) return null;
    let icon = <Flame size={14} className="text-red-500" />;
    if (technique.includes('LLP')) icon = <StretchVertical size={14} className="text-blue-500" />;
    if (technique.includes('Myo-reps')) icon = <Repeat size={14} className="text-purple-500" />;
    if (technique.includes('Stretch')) icon = <StretchVertical size={14} className="text-green-500" />;
    return (<div className="mt-2 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-md">{icon}<div><span className="font-semibold">Intensity:</span> {technique}</div></div>);
};

const SetRow = ({ setNumber, logData, onLogChange, lastSetData, exerciseDetails, weightUnit, exerciseName, totalSets }) => {
    const targetRir = (exerciseDetails.rir && Array.isArray(exerciseDetails.rir) && exerciseDetails.rir[setNumber - 1]) || 'N/A';
    const targetEffort = `~${targetRir} RIR`;
    const placeholderWeight = lastSetData?.load ? (weightUnit === 'kg' ? (lastSetData.load / 2.20462).toFixed(1) : lastSetData.load) : `Weight (${weightUnit})`;

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const currentField = e.target.name;
            let nextField;
            let nextSet = setNumber;

            if (currentField === 'load') {
                nextField = 'reps';
            } else if (currentField === 'reps') {
                nextField = 'rir';
            } else if (currentField === 'rir') {
                if (setNumber < totalSets) {
                    nextField = 'load';
                    nextSet = setNumber + 1;
                } else {
                    e.target.blur();
                    return;
                }
            }
            
            const nextInputId = `input-${exerciseName}-${nextSet}-${nextField}`;
            document.getElementById(nextInputId)?.focus();
        }
    };

    return (
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 items-center py-2 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
            <div className="text-sm font-bold text-gray-800 dark:text-gray-200 col-span-4 sm:col-span-1">Set {setNumber}</div>
            <div className="hidden sm:block text-sm text-center text-gray-600 dark:text-gray-400">{exerciseDetails.reps}</div>
            <div className="hidden sm:block text-sm text-center font-medium text-blue-600 dark:text-blue-400">{targetEffort}</div>
            <div>
                <label className="sm:hidden text-xs text-gray-500">Load</label>
                <input id={`input-${exerciseName}-${setNumber}-load`} name="load" type="number" placeholder={placeholderWeight} value={logData.displayLoad || ''} onChange={(e) => onLogChange(setNumber, 'load', e.target.value)} onKeyDown={handleKeyDown} className="w-full p-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"/>
            </div>
            <div>
                <label className="sm:hidden text-xs text-gray-500">Reps</label>
                <input id={`input-${exerciseName}-${setNumber}-reps`} name="reps" type="number" placeholder={lastSetData?.reps || "Reps"} value={logData.reps || ''} onChange={(e) => onLogChange(setNumber, 'reps', e.target.value)} onKeyDown={handleKeyDown} className="w-full p-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"/>
            </div>
            <div>
                <label className="sm:hidden text-xs text-gray-500">RIR</label>
                <input id={`input-${exerciseName}-${setNumber}-rir`} name="rir" type="number" placeholder={lastSetData?.rir ?? "RIR"} value={logData.rir || ''} 
                    onChange={(e) => onLogChange(setNumber, 'rir', e.target.value)} 
                    onKeyDown={handleKeyDown}
                    className="w-full p-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
            </div>
            <div className="sm:pl-2">
                <button onClick={() => onLogChange(setNumber, 'skip', true)} className="text-xs p-1.5 w-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-md transition-colors">Skip</button>
            </div>
        </div>
    );
};


const ExerciseCard = ({ exerciseName, week, dayKey, allLogs, onLogChange, masterExerciseList, weightUnit, workoutDetails }) => {
    const { openModal } = useContext(AppStateContext);
    const exercise = getExerciseDetails(exerciseName, masterExerciseList);
    const sets = Array.from({ length: Number(exercise?.sets) || 0 }, (_, i) => i + 1);

    const isCompleted = useMemo(() => {
        return sets.every(setNumber => {
            const log = allLogs[`${week}-${dayKey}-${exerciseName}-${setNumber}`];
            return isSetLogComplete(log);
        });
    }, [allLogs, week, dayKey, exerciseName, sets]);

    const [isOpen, setIsOpen] = useState(!isCompleted);
    
    useEffect(() => {
        setIsOpen(!isCompleted);
    }, [isCompleted]);
    
    const showHistory = () => {
        openModal(<ExerciseHistoryModal exerciseName={exerciseName} allLogs={allLogs} />, 'lg');
    };

    if (!exercise) return <div className="bg-red-100 dark:bg-red-900/50 p-4 rounded-lg text-red-700 dark:text-red-300">Exercise "{exerciseName}" not found in master list.</div>;

    const lastPerformanceData = useMemo(() => findLastPerformanceLogs(exerciseName, week, dayKey, allLogs), [exerciseName, week, dayKey, allLogs]);
    const suggestion = useMemo(() => getProgressionSuggestion(exerciseName, lastPerformanceData, masterExerciseList), [exerciseName, lastPerformanceData, masterExerciseList]);
    
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full p-4 text-left flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{exerciseName}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{exercise.sets} sets &times; {exercise.reps}</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button onClick={(e) => { e.stopPropagation(); showHistory(); }} className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
                        <History size={18} className="text-teal-500 dark:text-teal-400" />
                    </button>
                    {isCompleted && <CheckCircle className="text-green-500 animate-pop-in" />}
                    {isOpen ? <ChevronUp className="text-gray-500 dark:text-gray-400" /> : <ChevronDown className="text-gray-500 dark:text-gray-400" />}
                </div>
            </button>
            {isOpen && (
                <div className="p-4">
                    <div className="mb-3 p-3 flex items-start gap-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
                        <Lightbulb className="text-blue-500 dark:text-blue-400 flex-shrink-0 mt-1" size={20}/>
                        <p className="text-sm text-blue-800 dark:text-blue-200"><span className="font-bold">Suggestion:</span> {suggestion}</p>
                    </div>
                    <div className="overflow-x-auto">
                        <div className="hidden sm:grid grid-cols-7 gap-2 mb-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 min-w-[540px]">
                            <span></span>
                            <span className="text-center">Target Reps</span>
                            <span className="text-center">Target Effort</span>
                            <span className="text-center">Load ({weightUnit})</span>
                            <span className="text-center">Reps</span>
                            <span className="text-center">RIR</span>
                            <span></span>
                        </div>
                        <div className="space-y-2 min-w-[540px]">
                            {sets.map(setNumber => (
                                <SetRow 
                                    key={setNumber} 
                                    setNumber={setNumber}
                                    logData={allLogs[`${week}-${dayKey}-${exerciseName}-${setNumber}`] || {}} 
                                    onLogChange={(s, f, v) => onLogChange(exerciseName, s, f, v)}
                                    lastSetData={lastPerformanceData.lastSession ? lastPerformanceData.lastSession[setNumber] : null}
                                    exerciseDetails={exercise}
                                    weightUnit={weightUnit}
                                    exerciseName={exerciseName}
                                    totalSets={Number(exercise.sets)}
                                />
                            ))}
                        </div>
                    </div>
                    {exercise.lastSetTechnique && <IntensityTechnique technique={exercise.lastSetTechnique} />}
                </div>
            )}
        </div>
    );
};

const LiftingSession = ({ week, dayKey, onBack, allLogs, setAllLogs, onSkipDay, programData, weightUnit, onStartTimer, sequentialWorkoutIndex }) => {
    const { db, customId } = useContext(FirebaseContext);
    const { masterExerciseList } = programData;

    const workoutName = useMemo(() => {
        if (programData.settings.useWeeklySchedule) {
            return getWorkoutNameForDay(programData, week, dayKey);
        } else {
            return programData.workoutOrder[sequentialWorkoutIndex % programData.workoutOrder.length];
        }
    }, [programData, week, dayKey, sequentialWorkoutIndex]);

    const workout = getWorkoutForWeek(programData, week, workoutName);

    const handleLogChange = (exerciseName, setNumber, field, value) => {
        const logId = `${week}-${dayKey}-${exerciseName}-${setNumber}`;
        const currentLog = allLogs[logId] || { week, dayKey, session: workoutName, exercise: exerciseName, set: setNumber, date: new Date().toISOString() };
        
        const wasCompleteBefore = isSetLogComplete(currentLog);

        let newLogEntry = { ...currentLog };

        if (field === 'skip') {
            newLogEntry.skipped = true;
            newLogEntry.load = '';
            newLogEntry.reps = '';
            newLogEntry.rir = '';
        } else if (field === 'load') {
            newLogEntry.displayLoad = value;
            if (weightUnit === 'kg') {
                newLogEntry.load = parseFloat(value) * 2.20462;
            } else {
                newLogEntry.load = parseFloat(value);
            }
        } else {
            newLogEntry[field] = value;
        }

        const isCompleteNow = isSetLogComplete(newLogEntry);

        setAllLogs(prev => ({ ...prev, [logId]: newLogEntry }));

        if (db && customId) {
            const userDocRef = doc(db, 'workoutLogs', customId);
            updateDoc(userDocRef, { [`logs.${logId}`]: newLogEntry });
        }
        
        if (!wasCompleteBefore && isCompleteNow && !newLogEntry.skipped) {
            onStartTimer();
        }
    };

    if (!workout) return (
       <div className="p-4 md:p-6 pb-24 text-center">
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline mb-4"><ArrowLeft size={16}/> Back to Program</button>
            <h2 className="text-2xl font-bold dark:text-white">Rest Day</h2>
            <p className="text-gray-600 dark:text-gray-400">Enjoy your recovery!</p>
        </div>
    );
    
    const pageTitle = programData.settings.useWeeklySchedule ? `Week ${week}: ${dayKey}` : `Day ${sequentialWorkoutIndex + 1}`;
    const workoutDisplayName = programData.settings.useWeeklySchedule ? workoutName : `${workoutName} (${programData.programStructure[workoutName]?.label || ''})`;


    return (
        <div className="p-4 md:p-6 pb-24">
            <div className="flex justify-end items-center mb-4 gap-2">
                <button onClick={onStartTimer} className="flex items-center gap-2 text-sm font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/50 px-3 py-1.5 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-800/50 transition-colors"><Timer size={16}/> Start Timer</button>
                <button onClick={() => onSkipDay(week, dayKey)} className="flex items-center gap-2 text-sm font-medium text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/50 px-3 py-1.5 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"><SkipForward size={16}/> Skip Day</button>
            </div>
            <div className="mb-6 text-center">
                <h2 className="text-3xl font-bold dark:text-white">{pageTitle}</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">{workoutDisplayName}</p>
            </div>
            <div className="space-y-4">
                {workout.exercises.map(exName => 
                    <ExerciseCard 
                        key={exName} 
                        exerciseName={exName} 
                        week={week} 
                        dayKey={dayKey} 
                        allLogs={allLogs} 
                        onLogChange={handleLogChange} 
                        masterExerciseList={masterExerciseList} 
                        weightUnit={weightUnit}
                        workoutDetails={workout}
                    />
                )}
            </div>
        </div>
    );
};

const WeekView = ({ week, completedDays, onSessionSelect, firstIncompleteWeek, onUnskipDay, programData, onNavigate }) => {
    const { weeklySchedule } = programData;
    const isWeekComplete = useMemo(() => weeklySchedule.every(day => {
        const workoutName = getWorkoutNameForDay(programData, week, day.day);
        return workoutName === 'Rest' || completedDays.get(`${week}-${day.day}`)?.isDayComplete;
    }), [week, completedDays, weeklySchedule, programData]);

    const [isOpen, setIsOpen] = useState(week === firstIncompleteWeek);
    
    useEffect(() => {
        setIsOpen(week === firstIncompleteWeek);
    }, [firstIncompleteWeek, week]);
    
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Week {week}</h3>
                <div className="flex items-center gap-2">{isWeekComplete && <CheckCircle className="text-green-500" />}{isOpen ? <ChevronUp className="text-gray-500 dark:text-gray-400" /> : <ChevronDown className="text-gray-500 dark:text-gray-400" />}</div>
            </button>
            {isOpen && (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-4">
                    {weeklySchedule.map(day => {
                        const dayKey = `${week}-${day.day}`;
                        const status = completedDays.get(dayKey);
                        const workoutName = getWorkoutNameForDay(programData, week, day.day);
                        const workoutDetails = getWorkoutForWeek(programData, week, workoutName);
                        const isRestDay = !workoutName || workoutName === 'Rest';
                        
                        let dayClass = 'bg-gray-100 dark:bg-gray-700/50';
                        if (isRestDay) dayClass = 'bg-indigo-100 dark:bg-indigo-900/50';
                        else if (status?.isSkipped) dayClass = 'bg-red-100 dark:bg-red-800/50 border border-red-500/50';
                        else if (status?.isDayComplete) dayClass = 'bg-green-100 dark:bg-green-800/50 border border-green-500/50';

                        return (
                            <div key={dayKey} className={`rounded-lg p-3 flex flex-col justify-between transition-all ${dayClass}`}>
                                <div className="flex justify-between items-center mb-2">
                                    <div className="font-bold text-sm text-gray-800 dark:text-gray-200">{day.day}</div>
                                    {onNavigate && programData.settings.useWeeklySchedule && (
                                        <button onClick={() => onNavigate('editWeek', { week, dayKey: day.day, backTo: 'main' })} className="p-1 text-gray-400 hover:text-blue-500">
                                            <Pencil size={14} />
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-2 flex-grow flex flex-col justify-end">
                                    {isRestDay ? (
                                        <div className="text-center text-xs font-semibold text-indigo-700 dark:text-indigo-300 h-7 flex items-center justify-center">Rest Day</div>
                                    ) : status?.isSkipped ? (
                                        <button onClick={() => onUnskipDay(week, day.day)} className="w-full flex items-center justify-center gap-1 text-xs p-1.5 rounded bg-white dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 shadow-sm transition-colors font-semibold text-red-600 dark:text-red-400">
                                            <XCircle size={14} /> Skipped
                                        </button>
                                    ) : (
                                        <button onClick={() => onSessionSelect(week, day.day, 'lifting')} className="w-full flex items-center justify-between text-xs p-1.5 rounded bg-white dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 shadow-sm transition-colors">
                                            <div className="flex items-center gap-1 font-semibold">{workoutDetails?.label || workoutName}</div>
                                            {status?.isDayComplete ? <CheckCircle size={14} className="text-green-500"/> : <Dumbbell size={14} className="text-blue-500"/>}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const SequentialWeekView = ({ weekNumber, sessions, onSessionSelect, isInitiallyOpen }) => {
    const [isOpen, setIsOpen] = useState(isInitiallyOpen);
    const isWeekComplete = sessions.every(s => s.isComplete);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Week {weekNumber}</h3>
                <div className="flex items-center gap-2">
                    {isWeekComplete && <CheckCircle className="text-green-500" />}
                    {isOpen ? <ChevronUp className="text-gray-500 dark:text-gray-400" /> : <ChevronDown className="text-gray-500 dark:text-gray-400" />}
                </div>
            </button>
            {isOpen && (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-4">
                    {sessions.map(session => {
                        const { sessionIndex, weekForProgram, dayKey, workoutLabel, isComplete } = session;

                        let dayClass = 'bg-gray-100 dark:bg-gray-700/50';
                        if (isComplete) {
                            dayClass = 'bg-green-100 dark:bg-green-800/50 border border-green-500/50';
                        }

                        return (
                            <div key={dayKey} className={`rounded-lg p-3 flex flex-col justify-between transition-all ${dayClass}`}>
                                <div className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-2">Day {sessionIndex + 1}</div>
                                <div className="space-y-2 flex-grow flex flex-col justify-end">
                                    <button onClick={() => onSessionSelect(weekForProgram, dayKey, 'lifting', sessionIndex)} className="w-full flex items-center justify-between text-xs p-1.5 rounded bg-white dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 shadow-sm transition-colors">
                                        <div className="flex items-center gap-1 font-semibold">{workoutLabel}</div>
                                        {isComplete ? <CheckCircle size={14} className="text-green-500"/> : <Dumbbell size={14} className="text-blue-500"/>}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const SequentialView = ({ onSessionSelect, allLogs, programData }) => {
    const { info, workoutOrder, programStructure, masterExerciseList } = programData;

    if (!workoutOrder || workoutOrder.length === 0) {
        return <div className="text-center p-8">This program has no workouts defined.</div>;
    }

    const totalWorkoutsInCycle = workoutOrder.length;
    const totalSessions = info.weeks * totalWorkoutsInCycle;

    const sessionData = useMemo(() => {
        return Array.from({ length: totalSessions }, (_, i) => {
            const weekForProgram = Math.floor(i / totalWorkoutsInCycle) + 1;
            const workoutName = workoutOrder[i % totalWorkoutsInCycle];
            // Sequential view doesn't use weekly schedule, so getWorkoutForWeek is appropriate here without overrides.
            const workout = getWorkoutForWeek(programData, weekForProgram, workoutName);
            const dayKey = `workout-${i}`;

            if (!workout) return null;

            const isComplete = workout.exercises.every(exName => {
                const exDetails = getExerciseDetails(exName, masterExerciseList);
                if (!exDetails) return false;
                return Array.from({ length: Number(exDetails.sets) }, (_, setIdx) => setIdx + 1).every(setNum => {
                    const log = allLogs[`${weekForProgram}-${dayKey}-${exName}-${setNum}`];
                    return isSetLogComplete(log);
                });
            });

            return {
                sessionIndex: i,
                weekForProgram,
                dayKey,
                workoutName,
                workoutLabel: workout.label || workoutName,
                isComplete,
            };
        }).filter(Boolean);
    }, [totalSessions, totalWorkoutsInCycle, workoutOrder, programData, allLogs, masterExerciseList]);

    const firstIncompleteIndex = useMemo(() => {
        const incompleteSession = sessionData.find(s => !s.isComplete);
        return incompleteSession ? incompleteSession.sessionIndex : totalSessions;
    }, [sessionData, totalSessions]);

    const sessionsByWeek = useMemo(() => {
        const weeks = [];
        for (let i = 0; i < sessionData.length; i += 7) {
            weeks.push(sessionData.slice(i, i + 7));
        }
        return weeks;
    }, [sessionData]);

    const firstIncompleteVisualWeek = Math.floor(firstIncompleteIndex / 7);

    return (
        <div className="space-y-4">
            {sessionsByWeek.map((weekSessions, index) => (
                <SequentialWeekView
                    key={index}
                    weekNumber={index + 1}
                    sessions={weekSessions}
                    onSessionSelect={onSessionSelect}
                    isInitiallyOpen={index === firstIncompleteVisualWeek}
                />
            ))}
        </div>
    );
};


const ProgressBar = ({ completed, total }) => {
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Program Progress</span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

const StreakCounter = ({ streak }) => {
    const getStreakColor = (s) => {
        if (s === 0) return 'text-gray-500';
        if (s < 5) return 'text-orange-400';
        if (s < 10) return 'text-red-500';
        if (s < 20) return 'text-blue-500';
        return 'text-purple-500';
    };
    const streakColorClass = getStreakColor(streak);

    return (
        <div className="text-center w-full">
            <div className={`bg-gray-100 dark:bg-gray-700/50 rounded-xl p-4 flex items-center justify-center gap-2`}>
                <span className={`text-6xl font-bold ${streakColorClass} mr-2`}>{streak}</span>
                <Flame size={64} className={streakColorClass} />
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-2">Day Streak</div>
        </div>
    );
};


const MainView = ({ onSessionSelect, onEditProgram, completedDays, onUnskipDay, programData, allLogs, onNavigate }) => {
    const { info, weeklySchedule } = programData;
    const weeks = Array.from({ length: info.weeks }, (_, i) => i + 1);
    
    const firstIncompleteWeek = useMemo(() => {
        if (!programData.settings.useWeeklySchedule) return 1;
        for (let w = 1; w <= info.weeks; w++) {
            const isWeekComplete = weeklySchedule.every(d => {
                const workoutName = getWorkoutNameForDay(programData, w, d.day);
                return workoutName === 'Rest' || completedDays.get(`${w}-${d.day}`)?.isDayComplete;
            });
            if (!isWeekComplete) return w;
        }
        return info.weeks + 1;
    }, [completedDays, weeklySchedule, info.weeks, programData]);

    return (
        <div className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <Dumbbell className="text-blue-500 dark:text-blue-400" size={48} />
                    <div>
                        <h1 className="text-3xl font-bold dark:text-white">{info.name}</h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400">Your {info.weeks}-Week Plan</p>
                    </div>
                </div>
            </div>
            
            <div className="space-y-4 pb-24">
                {programData.settings.useWeeklySchedule ? (
                     weeks.map(week => (
                        <WeekView 
                            key={week} 
                            week={week} 
                            completedDays={completedDays} 
                            onSessionSelect={onSessionSelect}
                            firstIncompleteWeek={firstIncompleteWeek} 
                            onUnskipDay={onUnskipDay} 
                            programData={programData}
                            onNavigate={onNavigate}
                        />
                    ))
                ) : (
                    <SequentialView 
                        onSessionSelect={onSessionSelect}
                        allLogs={allLogs}
                        programData={programData}
                    />
                )}
            </div>
        </div>
    );
};

const DashboardView = ({ allLogs, programData, bodyWeightHistory }) => {
    const { masterExerciseList, weeklySchedule, info, settings, workoutOrder } = programData;

    const { totalSets, completedSets, streak, firstIncompleteWeek } = useMemo(() => {
        let weeklySetsCount = 0;
        if (settings.useWeeklySchedule) {
            weeklySchedule.forEach(day => {
                const workoutName = getWorkoutNameForDay(programData, 1, day.day);
                if (workoutName !== 'Rest') {
                    const workout = getWorkoutForWeek(programData, 1, workoutName);
                    if (workout) {
                        workout.exercises.forEach(exName => {
                            const details = getExerciseDetails(exName, masterExerciseList);
                            if (details) weeklySetsCount += Number(details.sets) || 0;
                        });
                    }
                }
            });
        } else {
             workoutOrder.forEach(workoutName => {
                const workout = getWorkoutForWeek(programData, 1, workoutName);
                if(workout) {
                    workout.exercises.forEach(exName => {
                        const details = getExerciseDetails(exName, masterExerciseList);
                        if(details) weeklySetsCount += Number(details.sets) || 0;
                    });
                }
            });
            weeklySetsCount = weeklySetsCount / workoutOrder.length; // Average sets per workout
        }

        const total = weeklySetsCount * info.weeks;
        const completed = Object.values(allLogs).filter(log => !log.skipped && (log.load === 0 || log.load) && log.reps).length;
        const currentStreak = calculateStreak(allLogs, programData);
        
        let incompleteWeek = 1;
        for (let w = 1; w <= info.weeks; w++) {
             const isWeekComplete = weeklySchedule.every(day => {
                const workoutName = getWorkoutNameForDay(programData, w, day.day);
                if(workoutName === 'Rest') return true;
                const workout = getWorkoutForWeek(programData, w, workoutName);
                if(!workout) return true;
                return workout.exercises.every(ex => {
                    const details = getExerciseDetails(ex, masterExerciseList);
                    if(!details) return false;
                    return Array.from({length: Number(details.sets)}, (_, i) => i + 1).every(setNum => isSetLogComplete(allLogs[`${w}-${day.day}-${ex}-${setNum}`]));
                });
            });
            if (!isWeekComplete) {
                incompleteWeek = w;
                break;
            }
        }

        return { totalSets: total, completedSets: completed, streak: currentStreak, firstIncompleteWeek: incompleteWeek };
    }, [allLogs, programData]);

    const weeklyVolumeData = useMemo(() => {
        if (!settings.useWeeklySchedule) return [];
        const volumesByDay = {};
        weeklySchedule.forEach(d => {
            const workoutName = getWorkoutNameForDay(programData, firstIncompleteWeek, d.day);
            if (workoutName !== 'Rest') volumesByDay[d.day] = 0;
        });

        Object.values(allLogs).forEach(log => {
            if (log.week === firstIncompleteWeek && volumesByDay[log.dayKey] !== undefined) {
                volumesByDay[log.dayKey] += getSetVolume(log, masterExerciseList);
            }
        });
        
        return weeklySchedule
            .filter(d => getWorkoutNameForDay(programData, firstIncompleteWeek, d.day) !== 'Rest')
            .map(d => ({
                day: d.day,
                volume: Math.round(volumesByDay[d.day] || 0)
            }));
    }, [allLogs, masterExerciseList, firstIncompleteWeek, settings.useWeeklySchedule, weeklySchedule, programData]);
    
    const formattedBodyWeightHistory = useMemo(() => {
        return bodyWeightHistory
            .filter(entry => entry && entry.weight && parseFloat(entry.weight) > 0)
            .map(entry => ({...entry, date: new Date(entry.date) }))
            .sort((a,b) => a.date - b.date)
            .map(entry => ({
                date: entry.date.toLocaleDateString(),
                weight: entry.weight
            }));
    }, [bodyWeightHistory]);

    return (
       <div className="p-4 md:p-6">
            <div className="flex flex-col items-center text-center mb-6">
                <div className="flex justify-center items-center">
                    <LayoutDashboard className="text-blue-500 dark:text-blue-400 mr-2" size={32} />
                    <h1 className="text-3xl font-bold dark:text-white">Dashboard</h1>
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-400">Your Program At a Glance</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                    <ProgressBar completed={completedSets} total={totalSets} />
                </div>
                 <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex justify-center items-center">
                    <StreakCounter streak={streak} />
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                    <h3 className="font-semibold text-lg mb-4">This Week's Volume (Week {firstIncompleteWeek})</h3>
                    {weeklyVolumeData.length > 0 && settings.useWeeklySchedule ? (
                        <ResponsiveContainer width="100%" height={250}>
                             <BarChart data={weeklyVolumeData}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                                <XAxis dataKey="day" tick={{ fill: '#9ca3af' }} />
                                <YAxis domain={[0, 'auto']} tick={{ fill: '#9ca3af' }} />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--tooltip-bg)', border: '1px solid var(--tooltip-border)' }} formatter={(value) => [`${value.toLocaleString()} lbs`, 'Total Volume']} />
                                <Bar dataKey="volume" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <p>Log some workouts this week to see your volume data. (Weekly schedule required)</p>}
                </div>
                 <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                    <h3 className="font-semibold text-lg mb-4">Bodyweight Trend</h3>
                      {formattedBodyWeightHistory.length > 1 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={formattedBodyWeightHistory}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                                <XAxis dataKey="date" tick={{ fill: '#9ca3af' }} />
                                <YAxis domain={['auto', 'auto']} tick={{ fill: '#9ca3af' }} />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--tooltip-bg)', border: '1px solid var(--tooltip-border)' }} />
                                <Line type="monotone" dataKey="weight" stroke="#82ca9d" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : <p>Log your bodyweight multiple times in Settings to see a trend.</p>}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold mb-2">AI Weekly Summary</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Get a personalized summary of your last completed week, including highlights, areas for improvement, and tips for next week.</p>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                    <BrainCircuit size={16} /> Generate AI Summary
                </button>
            </div>
        </div>
    );
};


const SettingsView = ({ allLogs, historicalLogs, weightUnit, onWeightUnitChange, onResetMeso, programData, onProgramDataChange, onShowTutorial, bodyWeight, onBodyWeightChange, onBack, onRestoreLogs }) => {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const { customId, handleSetCustomId } = useContext(FirebaseContext);
    const { openModal, closeModal } = useContext(AppStateContext);
    const [tempId, setTempId] = useState(customId);
    const [exportSelection, setExportSelection] = useState('all');
    const fileInputRef = useRef(null);

    const handleFileImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            onRestoreLogs(e.target.result);
        };
        reader.readAsText(file);
        event.target.value = null; // Reset input
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const exportData = (logsToExport, filename) => {
        const validLogs = Object.values(logsToExport).filter(log => !log.skipped && log.exercise);
        if (validLogs.length === 0) {
            openModal(
                <div>
                    <h2 className="text-xl font-bold mb-4">No Data to Export</h2>
                    <p className="text-gray-600 dark:text-gray-400">There is no logged data for the selected option.</p>
                    <div className="flex justify-end gap-2 mt-6">
                        <button onClick={closeModal} className="px-4 py-2 bg-blue-600 text-white rounded-lg">OK</button>
                    </div>
                </div>
            );
            return;
        }
        const dayOrder = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
        const sortedLogs = validLogs.sort((a, b) => ((a.week - 1) * 7 + dayOrder[a.dayKey]) - ((b.week - 1) * 7 + dayOrder[b.dayKey]) || a.set - b.set);
        const headers = ['Week', 'Day', 'Session', 'Exercise', 'Set', 'Load (lbs)', 'Reps', 'RIR', 'e1RM'];
        const csvContent = [headers.join(','), ...sortedLogs.map(log => [log.week, log.dayKey, `"${log.session}"`, `"${log.exercise}"`, log.set, log.load, log.reps, log.rir || '', calculateE1RM(log.load, log.reps, log.rir)].join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const handleExport = () => {
        if (exportSelection === 'all') { exportData(historicalLogs, 'project_overload_all_data.csv'); return; }
        const [type, value] = exportSelection.split(':');
        let logsToExport = {};
        if (type === 'week') {
            logsToExport = Object.fromEntries(Object.entries(historicalLogs).filter(([, log]) => log.week?.toString() === value));
        } else if (type === 'workout') {
            const [week, dayKey] = value.split('-');
            logsToExport = Object.fromEntries(Object.entries(historicalLogs).filter(([, log]) => log.week?.toString() === week && log.dayKey === dayKey));
        }
        exportData(logsToExport, `project_overload_${type}_${value.replace('-', '_')}_data.csv`);
    };

    const hasLogs = Object.keys(historicalLogs).filter(k => !historicalLogs[k].skipped).length > 0;
    
    const exportOptions = useMemo(() => {
        if (!hasLogs) return { weeks: [], workouts: [] };
        const logs = Object.values(historicalLogs).filter(log => log.exercise && log.week && log.dayKey && !log.skipped);
        const dayOrder = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
        const loggedWeeks = [...new Set(logs.map(log => log.week))].sort((a, b) => a - b);
        const loggedWorkouts = [...new Set(logs.map(log => `workout:${log.week}-${log.dayKey}`))].sort((a, b) => {
            const [, weekA, dayA] = a.split(/-|:/);
            const [, weekB, dayB] = b.split(/-|:/);
            return ((parseInt(weekA) - 1) * 7 + dayOrder[dayA]) - ((parseInt(weekB) - 1) * 7 + dayOrder[dayB]);
        });
        return { weeks: loggedWeeks, workouts: loggedWorkouts };
    }, [historicalLogs, hasLogs]);


    const handleStartNewMeso = () => {
        exportData(allLogs, `mesocycle_data_${new Date().toISOString().split('T')[0]}.csv`);
        openModal(
            <div>
                <h2 className="text-xl font-bold mb-4">Confirm New Mesocycle</h2>
                <p className="text-gray-600 dark:text-gray-400">Your data has been downloaded. Are you sure you want to archive all logs and start a new mesocycle? This action cannot be undone.</p>
                <div className="flex justify-end gap-2 mt-6">
                    <button onClick={closeModal} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg">Cancel</button>
                    <button onClick={() => { onResetMeso(); closeModal(); }} className="px-4 py-2 bg-red-600 text-white rounded-lg">Confirm & Reset</button>
                </div>
            </div>
        );
    };

    const handleSettingsChange = (field, value) => {
        const newSettings = {
            ...programData.settings,
            [field]: value,
        };
        onProgramDataChange({ ...programData, settings: newSettings });
    };

    const handleTimerSettingsChange = (field, value) => {
        const newSettings = {
            ...programData.settings,
            restTimer: {
                ...programData.settings.restTimer,
                [field]: value
            }
        };
        onProgramDataChange({ ...programData, settings: newSettings });
    };

    const handleDurationChange = (part, value) => {
        const currentDuration = programData.settings.restTimer.duration;
        const minutes = Math.floor(currentDuration / 60);
        const seconds = currentDuration % 60;
        let newDuration;
        if (part === 'minutes') {
            newDuration = (parseInt(value, 10) || 0) * 60 + seconds;
        } else {
            newDuration = minutes * 60 + (parseInt(value, 10) || 0);
        }
        handleTimerSettingsChange('duration', newDuration);
    };

    const timerMinutes = Math.floor(programData.settings.restTimer.duration / 60);
    const timerSeconds = programData.settings.restTimer.duration % 60;

    return (
        <div className="p-4 md:p-6 pb-24">
            <div className="flex justify-center items-center mb-6 text-center">
                 <div className="flex flex-col items-center">
                    <Settings className="text-blue-500 dark:text-blue-400 mb-2" size={32} />
                    <h1 className="text-3xl font-bold dark:text-white">App Settings</h1>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md space-y-6">
                
                {/* Sync & Data */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Sync & Data</h3>
                    <div className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg space-y-3">
                        <div>
                            <label htmlFor="customIdInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Personal Sync ID</label>
                            <div className="flex gap-2">
                                <input id="customIdInput" type="text" value={tempId} onChange={e => setTempId(e.target.value)} placeholder="Enter a memorable ID" className="w-full p-2 bg-white dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600 shadow-sm" />
                                <button onClick={() => handleSetCustomId(tempId)} className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors">Set</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700"></div>

                {/* Display & Units */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Display & Program</h3>
                    <div className="space-y-4">
                         <div className="flex justify-between items-center">
                            <span className="font-semibold dark:text-gray-200">Dark Mode</span>
                            <button onClick={toggleTheme} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200'}`}><span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} /></button>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-semibold dark:text-gray-200">Weight Unit</span>
                            <div className="flex items-center gap-2 rounded-lg p-1 bg-gray-100 dark:bg-gray-700">
                                <button onClick={() => onWeightUnitChange('lbs')} className={`px-3 py-1 text-sm rounded-md ${weightUnit === 'lbs' ? 'bg-white dark:bg-gray-900 shadow' : ''}`}>lbs</button>
                                <button onClick={() => onWeightUnitChange('kg')} className={`px-3 py-1 text-sm rounded-md ${weightUnit === 'kg' ? 'bg-white dark:bg-gray-900 shadow' : ''}`}>kg</button>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <label htmlFor="bodyWeight" className="font-semibold dark:text-gray-200">Body Weight ({weightUnit})</label>
                            <div className="flex items-center gap-2">
                                <input id="bodyWeight" type="number" value={bodyWeight} onChange={(e) => onBodyWeightChange(e.target.value, false)} className="w-24 p-2 bg-white dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600 shadow-sm" />
                                <button onClick={() => onBodyWeightChange(bodyWeight, true)} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Log</button>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                             <div className="flex items-center gap-2">
                                <span className="font-semibold dark:text-gray-200">Use Weekly Schedule</span>
                                <InfoTooltip content="ON: Workouts follow Mon-Sun. OFF: Workouts are sequential (A, B, C...)." />
                            </div>
                            <button onClick={() => handleSettingsChange('useWeeklySchedule', !programData.settings.useWeeklySchedule)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${programData.settings.useWeeklySchedule ? 'bg-blue-600' : 'bg-gray-200'}`}><span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${programData.settings.useWeeklySchedule ? 'translate-x-6' : 'translate-x-1'}`} /></button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700"></div>

                {/* Rest Timer Settings */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Rest Timer</h3>
                    <div className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold dark:text-gray-200">Auto-start Timer After Set</span>
                            <button onClick={() => handleTimerSettingsChange('enabled', !programData.settings.restTimer.enabled)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${programData.settings.restTimer.enabled ? 'bg-blue-600' : 'bg-gray-200'}`}><span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${programData.settings.restTimer.enabled ? 'translate-x-6' : 'translate-x-1'}`} /></button>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-semibold dark:text-gray-200">Timer Duration</span>
                            <div className="flex items-center gap-2">
                                <input type="number" value={timerMinutes} onChange={(e) => handleDurationChange('minutes', e.target.value)} className="w-16 p-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" />
                                <span className="text-gray-500 dark:text-gray-400">min</span>
                                <input type="number" value={timerSeconds} onChange={(e) => handleDurationChange('seconds', e.target.value)} className="w-16 p-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" />
                                <span className="text-gray-500 dark:text-gray-400">sec</span>
                            </div>
                        </div>
                    </div>
                </div>

                 <div className="border-t border-gray-200 dark:border-gray-700"></div>

                {/* Data Management */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Data Management</h3>
                    <div className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg space-y-3">
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            <select value={exportSelection} onChange={(e) => setExportSelection(e.target.value)} className="w-full sm:w-auto flex-grow p-2 bg-white dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600 shadow-sm" disabled={!hasLogs}>
                                <option value="all">All Data</option>
                                {exportOptions.weeks?.length > 0 && (
                                    <optgroup label="By Week">
                                        {exportOptions.weeks.map(w => <option key={`week-${w}`} value={`week:${w}`}>Week {w}</option>)}
                                    </optgroup>
                                )}
                                {exportOptions.workouts?.length > 0 && (
                                    <optgroup label="By Single Workout">
                                        {exportOptions.workouts.map(w_key => { 
                                            const [, week, day] = w_key.split(/-|:/); 
                                            return (<option key={w_key} value={`workout:${week}-${day}`}>Week {week} - {day}</option>);
                                        })}
                                    </optgroup>
                                )}
                            </select>
                            <button onClick={handleExport} disabled={!hasLogs} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                                <Download size={16} /> Export CSV
                            </button>
                        </div>
                         <div className="border-t border-gray-200 dark:border-gray-700"></div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Restore workout history from a previously exported CSV file. This will overwrite all current logs.</p>
                            <button onClick={handleImportClick} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors">
                                <Upload size={16} /> Import & Restore Logs
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".csv" style={{ display: 'none' }} />
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700"></div>

                {/* Program Reset */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Program Reset</h3>
                     <div className="bg-red-100 dark:bg-red-900/50 p-4 rounded-lg space-y-3">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="text-red-500 flex-shrink-0 mt-1" />
                            <div>
                                <h4 className="font-bold text-red-800 dark:text-red-200">Start New Mesocycle</h4>
                                <p className="text-sm text-red-700 dark:text-red-300">This will download all your current logs as a CSV, then archive them and clear your progress to start fresh.</p>
                            </div>
                        </div>
                        <button onClick={handleStartNewMeso} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-colors">
                            <Repeat size={16} /> Start New Mesocycle
                        </button>
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700"></div>

                {/* Help Section */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Help</h3>
                    <div className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg space-y-3">
                        <p className="text-sm text-gray-600 dark:text-gray-300">Need a refresher on how the app works?</p>
                        <button onClick={onShowTutorial} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition-colors">
                            <HelpCircle size={16} /> Show Tutorial
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MuscleGroupDetailModal = ({ muscleName, programData, onClose }) => {
    const contributingExercises = useMemo(() => {
        const exercises = {};
        const { programStructure, masterExerciseList } = programData;

        if (!programStructure || !masterExerciseList) return [];

        Object.values(programStructure).forEach(workout => {
            if (!workout.exercises) return;
            workout.exercises.forEach(exName => {
                const details = getExerciseDetails(exName, masterExerciseList);
                if (details?.muscles?.primary === muscleName ||
                    details?.muscles?.secondary === muscleName ||
                    details?.muscles?.tertiary === muscleName) {

                    if (!exercises[exName]) {
                        exercises[exName] = { sets: 0 };
                    }
                    exercises[exName].sets += Number(details.sets) || 0;
                }
            });
        });
        return Object.entries(exercises).sort(([,a],[,b]) => b.sets - a.sets);
    }, [muscleName, programData]);

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Set Breakdown for {muscleName}</h2>
            <div className="max-h-60 overflow-y-auto pr-2">
                <ul className="space-y-2">
                    {contributingExercises.map(([name, data]) => (
                        <li key={name} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700/50 rounded-md">
                            <span className="font-semibold">{name}</span>
                            <span>{data.sets} sets</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex justify-end mt-6">
                <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Close</button>
            </div>
        </div>
    );
};

const AnalyticsView = ({ allLogs, programData, onBack }) => {
    const { masterExerciseList } = programData;
    const { openModal, closeModal } = useContext(AppStateContext);
    const [selectedExercise, setSelectedExercise] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [muscleSearchTerm, setMuscleSearchTerm] = useState('');

    const uniqueExercises = useMemo(() => Object.keys(masterExerciseList || {}).sort(), [masterExerciseList]);
    const filteredExercises = useMemo(() => uniqueExercises.filter(ex => ex.toLowerCase().includes(searchTerm.toLowerCase())), [uniqueExercises, searchTerm]);

    useEffect(() => {
        if (filteredExercises.length > 0 && !selectedExercise) {
            setSelectedExercise(filteredExercises[0]);
        } else if (filteredExercises.length > 0 && !filteredExercises.includes(selectedExercise)) {
            setSelectedExercise(filteredExercises[0]);
        } else if (filteredExercises.length === 0) {
            setSelectedExercise('');
        }
    }, [filteredExercises, selectedExercise]);
    
    const chartData = useMemo(() => {
        if (!selectedExercise || Object.keys(allLogs).length === 0) return [];
        const sessions = Object.values(allLogs).reduce((acc, log) => {
            if (log.exercise === selectedExercise && (log.load === 0 || log.load) && log.reps) {
                const sessionKey = `${log.week}-${log.dayKey}`;
                if (!acc[sessionKey]) acc[sessionKey] = { week: parseInt(log.week, 10), dayKey: log.dayKey, sets: [] };
                acc[sessionKey].sets.push({ ...log, load: parseFloat(log.load), reps: parseInt(log.reps, 10), rir: parseInt(log.rir, 10) });
            }
            return acc;
        }, {});
        const processedData = Object.values(sessions).map(session => {
            if (!session.sets || session.sets.length === 0) return null;
            const topSet = session.sets.reduce((best, current) => (calculateE1RM(current.load, current.reps, current.rir) > calculateE1RM(best.load, best.reps, best.rir) ? current : best));
            if (!topSet || isNaN(topSet.load) || isNaN(topSet.reps)) return null;
            return { sessionLabel: `W${session.week} ${session.dayKey}`, e1RM: calculateE1RM(topSet.load, topSet.reps, topSet.rir), load: topSet.load, reps: topSet.reps };
        }).filter(Boolean);
        
        const dayOrder = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
        return processedData.sort((a, b) => { 
            const [weekLabelA, dayLabelA] = a.sessionLabel.substring(1).split(' ');
            const [weekLabelB, dayLabelB] = b.sessionLabel.substring(1).split(' ');
            const weekA = parseInt(weekLabelA, 10);
            const weekB = parseInt(weekLabelB, 10);

            if (weekA !== weekB) {
                return weekA - weekB;
            }

            // Handle both day keys (e.g., "Mon") and sequential keys (e.g., "workout-5")
            const dayNumA = dayOrder[dayLabelA] || parseInt(dayLabelA.split('-')[1], 10) || 0;
            const dayNumB = dayOrder[dayLabelB] || parseInt(dayLabelB.split('-')[1], 10) || 0;
            
            return dayNumA - dayNumB;
        });
    }, [selectedExercise, allLogs]);

    const volumeData = useMemo(() => {
        if (Object.keys(allLogs).length === 0) return [];
        const volumesByWeek = {};
        Object.values(allLogs).forEach(log => {
            if ((log.load === 0 || log.load) && log.reps && log.week) {
                const week = log.week;
                if (!volumesByWeek[week]) {
                    volumesByWeek[week] = 0;
                }
                volumesByWeek[week] += getSetVolume(log, masterExerciseList);
            }
        });
        return Object.entries(volumesByWeek).map(([week, volume]) => ({
            week: `Week ${week}`,
            totalVolume: Math.round(volume)
        })).sort((a, b) => parseInt(a.week.split(' ')[1]) - parseInt(b.week.split(' ')[1]));
    }, [allLogs, masterExerciseList]);


    const muscleGroupData = useMemo(() => {
        const dataByMuscle = {};
        const { programStructure, masterExerciseList } = programData;

        if (!programStructure || !masterExerciseList) return [];

        const ensureMuscle = (muscle) => {
            if (muscle && !dataByMuscle[muscle]) {
                dataByMuscle[muscle] = { sets: 0 };
            }
        };

        Object.values(programStructure).forEach(workout => {
            if (!workout.exercises) return;
            workout.exercises.forEach(exerciseName => {
                const exerciseDetails = getExerciseDetails(exerciseName, masterExerciseList);
                if (exerciseDetails && exerciseDetails.muscles) {
                    const { primary, secondary, tertiary } = exerciseDetails.muscles;
                    const sets = Number(exerciseDetails.sets) || 0;
                    
                    ensureMuscle(primary);
                    if(primary) dataByMuscle[primary].sets += sets;

                    ensureMuscle(secondary);
                    if(secondary) dataByMuscle[secondary].sets += sets;

                    ensureMuscle(tertiary);
                    if(tertiary) dataByMuscle[tertiary].sets += sets;
                }
            });
        });

        const totalSets = Object.values(dataByMuscle).reduce((sum, d) => sum + d.sets, 0);

        return Object.entries(dataByMuscle).map(([name, data]) => ({
            name,
            sets: data.sets,
            setsPercentage: totalSets > 0 ? Math.round((data.sets / totalSets) * 100) : 0,
        })).sort((a,b) => b.sets - a.sets);
    }, [programData]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF42A1', '#42A1FF'];
    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, percent, name, setsPercentage }) => {
        const radius = outerRadius + 30;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        const sin = Math.sin(-midAngle * RADIAN);
        const cos = Math.cos(-midAngle * RADIAN);
        const sx = cx + (outerRadius + 10) * cos;
        const sy = cy + (outerRadius + 10) * sin;
        const mx = cx + (outerRadius + 20) * cos;
        const my = cy + (outerRadius + 20) * sin;
        const ex = mx + (cos >= 0 ? 1 : -1) * 12;
        const ey = my;
        const textAnchor = cos >= 0 ? 'start' : 'end';

        return (
            <g>
                <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={"#9ca3af"} fill="none" />
                <circle cx={ex} cy={ey} r={2} fill={"#9ca3af"} />
                <text x={ex + (cos >= 0 ? 1 : -1) * 8} y={ey} textAnchor={textAnchor} fill="#9ca3af" dy={4} className="text-xs">
                    {`${name} (${setsPercentage}%)`}
                </text>
            </g>
        );
    };

    return (
        <div className="p-4 md:p-6 pb-24">
            <div className="flex flex-col items-center text-center mb-6">
                <div className="flex justify-center items-center">
                    <BarChart2 className="text-blue-500 dark:text-blue-400 mr-2" size={32} />
                    <h1 className="text-3xl font-bold dark:text-white">Analytics</h1>
                </div>
            </div>

            <div className="space-y-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
                     <h3 className="font-semibold dark:text-gray-200 mb-4">Individual Exercise Progression</h3>
                     <div className="mb-6 space-y-4">
                        <div>
                            <label htmlFor="exercise-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search Exercise:</label>
                            <input id="exercise-search" type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="e.g., Bench Press" className="w-full p-2 bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-600 shadow-sm"/>
                        </div>
                        <div>
                            <label htmlFor="exercise-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Exercise:</label>
                            <select id="exercise-select" value={selectedExercise} onChange={e => setSelectedExercise(e.target.value)} className="w-full p-2 bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-600 shadow-sm">
                                {filteredExercises.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                            </select>
                        </div>
                    </div>
                    {chartData.length > 0 ? (
                        <div className="space-y-8">
                            <div className="w-full aspect-video">
                                <h4 className="font-semibold text-sm dark:text-gray-300 mb-2">RIR-Adjusted e1RM Progression</h4>
                                <ResponsiveContainer>
                                    <LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" /><XAxis dataKey="sessionLabel" tick={{ fill: '#9ca3af' }} /><YAxis domain={[dataMin => Math.max(0, Math.floor(dataMin * 0.9)), 'auto']} tick={{ fill: '#9ca3af' }} /><Tooltip contentStyle={{ backgroundColor: 'var(--tooltip-bg)', border: '1px solid var(--tooltip-border)' }} /><Legend align="center" /><Line type="monotone" dataKey="e1RM" name="e1RM" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} /></LineChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="w-full aspect-video">
                                <h4 className="font-semibold text-sm dark:text-gray-300 mb-2">Load & Reps for Top Set</h4>
                                <ResponsiveContainer>
                                    <LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" /><XAxis dataKey="sessionLabel" tick={{ fill: '#9ca3af' }} /><YAxis yAxisId="left" stroke="#8884d8" label={{ value: 'Load', angle: -90, position: 'insideLeft', fill: '#8884d8' }} domain={[dataMin => Math.max(0, Math.floor(dataMin * 0.9)), 'auto']} tick={{ fill: '#8884d8' }} /><YAxis yAxisId="right" orientation="right" stroke="#82ca9d" label={{ value: 'Reps', angle: 90, position: 'insideRight', fill: '#82ca9d' }} domain={[dataMin => Math.max(0, Math.floor(dataMin * 0.8)), 'auto']} allowDecimals={false} tick={{ fill: '#82ca9d' }} /><Tooltip contentStyle={{ backgroundColor: 'var(--tooltip-bg)', border: '1px solid var(--tooltip-border)' }} /><Legend align="center" /><Line yAxisId="left" type="monotone" dataKey="load" name="Load" stroke="#8884d8" /><Line yAxisId="right" type="monotone" dataKey="reps" name="Reps" stroke="#82ca9d" /></LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    ) : (
                        <div className="aspect-video flex flex-col justify-center items-center text-center"><BarChart2 size={48} className="text-gray-400 dark:text-gray-500 mb-4" /><h3 className="font-semibold text-xl dark:text-gray-200">No Data Yet</h3><p className="text-gray-500 dark:text-gray-400">{selectedExercise ? `Log some sets for ${selectedExercise} to see your progress.` : 'Select an exercise to view your charts.'}</p></div>
                    )}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
                    <h3 className="font-semibold dark:text-gray-200 mb-2">Total Weekly Volume</h3>
                     {volumeData.length > 1 ? (
                        <div className="w-full aspect-video">
                            <ResponsiveContainer>
                                <LineChart data={volumeData}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                                    <XAxis dataKey="week" tick={{ fill: '#9ca3af' }} />
                                    <YAxis domain={[0, 'auto']} tick={{ fill: '#9ca3af' }} />
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--tooltip-bg)', border: '1px solid var(--tooltip-border)' }} formatter={(value) => [`${value.toLocaleString()} lbs`, 'Total Volume']} />
                                    <Legend align="center" />
                                    <Line type="monotone" dataKey="totalVolume" name="Total Volume" stroke="#ffc658" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="aspect-video flex flex-col justify-center items-center text-center">
                            <BarChart2 size={48} className="text-gray-400 dark:text-gray-500 mb-4" />
                            <h3 className="font-semibold text-xl dark:text-gray-200">Not Enough Data</h3>
                            <p className="text-gray-500 dark:text-gray-400">Log at least two weeks of workouts to see your volume progression.</p>
                        </div>
                    )}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
                    <h3 className="font-semibold dark:text-gray-200 mb-2">Muscle Group Distribution (All Time)</h3>
                    {muscleGroupData.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-8 items-center">
                            <div className="w-full aspect-square">
                               <ResponsiveContainer>
                                    <PieChart margin={{ top: 40, right: 40, left: 40, bottom: 40 }}>
                                        <Pie data={muscleGroupData} dataKey="sets" nameKey="name" cx="50%" cy="50%" outerRadius="70%" fill="#8884d8" labelLine={false} label={renderCustomizedLabel}>
                                            {muscleGroupData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value, name, props) => [`${props.payload.setsPercentage}%`, 'Sets']} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="text-sm">
                                <h4 className="font-bold text-lg mb-2">Sets Per Muscle Group</h4>
                                <input
                                    type="text"
                                    placeholder="Search muscle groups..."
                                    value={muscleSearchTerm}
                                    onChange={e => setMuscleSearchTerm(e.target.value)}
                                    className="w-full p-2 mb-3 bg-white dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600"
                                />
                                <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                    {muscleGroupData
                                        .filter(d => d.name.toLowerCase().includes(muscleSearchTerm.toLowerCase()))
                                        .map(d => (
                                        <li key={d.name}>
                                            <button onClick={() => openModal(<MuscleGroupDetailModal muscleName={d.name} programData={programData} onClose={closeModal}/>)} className="w-full flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-left">
                                                <span className="font-semibold">{d.name}</span>
                                                <span>{d.sets} sets ({d.setsPercentage}%)</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ) : (
                         <div className="aspect-video flex flex-col justify-center items-center text-center"><BarChart2 size={48} className="text-gray-400 dark:text-gray-500 mb-4" /><h3 className="font-semibold text-xl dark:text-gray-200">No Data for this Period</h3><p className="text-gray-500 dark:text-gray-400">Log some workouts to see your muscle distribution.</p></div>
                    )}
                </div>
            </div>
        </div>
    );
};

const RecordsView = ({ allLogs, onBack }) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    const personalRecords = useMemo(() => {
        const records = {};
        const validLogs = Object.values(allLogs).filter(log => !log.skipped && (log.load !== undefined && log.load !== null) && log.reps);

        validLogs.forEach(log => {
            const e1rm = calculateE1RM(log.load, log.reps, log.rir);
            if (!records[log.exercise] || e1rm > records[log.exercise].e1rm) {
                records[log.exercise] = {
                    e1rm,
                    log,
                };
            }
        });
        return Object.entries(records)
            .sort(([, a], [, b]) => b.e1rm - a.e1rm)
            .map(([exercise, data]) => ({ exercise, ...data }));
    }, [allLogs]);

    const filteredRecords = useMemo(() => {
        return personalRecords.filter(record => 
            record.exercise.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [personalRecords, searchTerm]);

    return (
        <div className="p-4 md:p-6 pb-24">
             <div className="flex flex-col items-center text-center mb-6">
                <div className="flex justify-center items-center">
                    <Trophy className="text-yellow-500 dark:text-yellow-400 mr-2" size={32} />
                    <h1 className="text-3xl font-bold dark:text-white">Personal Records</h1>
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-400">Your Best Lifts (e1RM)</p>
            </div>
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text"
                        placeholder="Search for an exercise..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full p-2 pl-10 bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-600 shadow-sm"
                    />
                </div>
            </div>
            <div className="space-y-3">
                {filteredRecords.length > 0 ? filteredRecords.map(({ exercise, e1rm, log }) => (
                    <div key={exercise} className="bg-white dark:bg-gray-800 rounded-lg p-4 flex justify-between items-center shadow-md">
                        <div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{exercise}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {log.load} lbs x {log.reps} reps @ {log.rir || 0} RIR
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                Set on: Week {log.week}, {log.dayKey}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{e1rm}</p>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">e1RM</p>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-10">
                        <p className="text-gray-500 dark:text-gray-400">No records found for "{searchTerm}".</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const EditWeekCard = ({ week, program, onEditDay }) => {
    const [isOpen, setIsOpen] = useState(false);

    const hasOverrides = program.weeklyOverrides && program.weeklyOverrides[week];
    const weekLabel = hasOverrides ? `Week ${week} (Customized)` : `Week ${week}`;
    const weekLabelColor = hasOverrides ? "text-blue-500 dark:text-blue-400" : "text-gray-800 dark:text-gray-200";

    return (
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left">
                <h4 className={`font-bold text-md ${weekLabelColor}`}>{weekLabel}</h4>
                {isOpen ? <ChevronUp /> : <ChevronDown />}
            </button>
            {isOpen && (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mt-3">
                    {program.weeklySchedule.map(({ day }) => {
                        const workoutName = getWorkoutNameForDay(program, week, day);
                        const workoutDetails = getWorkoutForWeek(program, week, workoutName);
                        const isRest = !workoutDetails || workoutName === 'Rest';
                        const displayWorkoutName = isRest ? 'Rest' : (workoutDetails.label || workoutName);

                        return (
                            <div key={`${week}-${day}`} className="bg-white dark:bg-gray-700 p-2 rounded-lg text-center flex flex-col justify-between">
                                <div className="font-bold text-sm mb-1">{day}</div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 truncate h-8 flex-grow flex items-center justify-center">
                                    {displayWorkoutName}
                                </p>
                                <button
                                    onClick={() => onEditDay(week, day)}
                                    className="w-full text-xs p-1 rounded bg-blue-100 dark:bg-blue-800/50 text-blue-700 dark:text-blue-300 hover:bg-blue-200"
                                >
                                    Edit
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const EditWeekView = ({ week, dayKey, programData, onProgramDataChange, onBack }) => {
    const { programStructure, weeklySchedule, weeklyOverrides } = programData;

    // This function determines the actual workout name for a given day, considering overrides.
    const getWorkoutNameForDay = (pData, w, d) => {
        return pData.weeklyOverrides?.[w]?.[d] || pData.weeklySchedule.find(s => s.day === d)?.workout || 'Rest';
    };

    const currentWorkoutName = getWorkoutNameForDay(programData, week, dayKey);

    const handleWorkoutChange = (newWorkoutName) => {
        const newOverrides = JSON.parse(JSON.stringify(weeklyOverrides || {}));

        if (!newOverrides[week]) {
            newOverrides[week] = {};
        }

        const baseWorkoutName = programData.weeklySchedule.find(d => d.day === dayKey)?.workout || 'Rest';

        if (newWorkoutName === baseWorkoutName) {
            // If we are setting it back to the original schedule, we can remove the override
            delete newOverrides[week][dayKey];
            if (Object.keys(newOverrides[week]).length === 0) {
                delete newOverrides[week]; // Clean up empty week objects
            }
        } else {
            // Otherwise, set the new workout name as an override for that specific day
            newOverrides[week][dayKey] = newWorkoutName;
        }

        onProgramDataChange({ ...programData, weeklyOverrides: newOverrides });
        onBack(); // Go back to the previous view after making a selection
    };

    const availableWorkouts = ['Rest', ...Object.keys(programStructure)];
    const currentWorkoutDetails = programData.programStructure[currentWorkoutName];

    return (
        <div className="p-4 md:p-6 pb-24">
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline mb-4">
                <ArrowLeft size={16}/> Back to Edit Program
            </button>
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold dark:text-white">Editing Week {week}: {dayKey}</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">Current: {currentWorkoutDetails?.label || currentWorkoutName}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Select New Workout</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {availableWorkouts.map(name => (
                        <button
                            key={name}
                            onClick={() => handleWorkoutChange(name)}
                            className={`p-4 rounded-lg text-center transition-colors font-semibold
                                ${name === currentWorkoutName
                                    ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-400'
                                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/50'}`
                            }
                        >
                            {programStructure[name]?.label || name}
                        </button>
                    ))}
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4">
                    <button
                        onClick={() => handleWorkoutChange('Rest')}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
                    >
                        <Zap size={16} /> Mark as Rest Day
                    </button>
                </div>
            </div>
        </div>
    );
};

const MasterScheduleEditor = ({ program, onProgramDataChange }) => {
    const [editingDay, setEditingDay] = useState(null);

    const handleScheduleChange = (day, newWorkout) => {
        const newSchedule = program.weeklySchedule.map(d => {
            if (d.day === day) {
                return { ...d, workout: newWorkout };
            }
            return d;
        });
        onProgramDataChange({ ...program, weeklySchedule: newSchedule });
        setEditingDay(null);
    };

    const availableWorkouts = ['Rest', ...program.workoutOrder];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Master Weekly Schedule</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Set the default workout for each day of the week.</p>
            <div className="space-y-2">
                {program.weeklySchedule.map(({ day, workout }) => (
                    <div key={day} className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                            <span className="font-bold">{day}</span>
                            <span className="truncate pr-2">{program.programStructure[workout]?.label || workout}</span>
                            <button onClick={() => setEditingDay(editingDay === day ? null : day)} className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex-shrink-0">
                                {editingDay === day ? 'Cancel' : 'Change'}
                            </button>
                        </div>
                        {editingDay === day && (
                            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {availableWorkouts.map(woName => (
                                    <button
                                        key={woName}
                                        onClick={() => handleScheduleChange(day, woName)}
                                        className={`p-2 text-sm rounded-md ${woName === workout ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                    >
                                        {program.programStructure[woName]?.label || woName}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const EditProgramView = ({ programData, onProgramDataChange, onBack, onNavigate }) => {
    const { openModal, closeModal } = useContext(AppStateContext);
    const [program, setProgram] = useState(programData);
    const [isScheduleOpen, setScheduleOpen] = useState(false); // State for collapsible schedule

    useEffect(() => {
        setProgram(programData);
    }, [programData]);

    const updateProgram = (updates) => {
        const newProgram = { ...program, ...updates };
        setProgram(newProgram);
        onProgramDataChange(newProgram);
    };

    const handleInfoChange = (field, value) => {
        updateProgram({ info: { ...program.info, [field]: value } });
    };

    const handleAddWorkoutDay = () => {
        const newWorkoutName = `New Workout ${Object.keys(program.programStructure).length + 1}`;
        const newProgramStructure = { ...program.programStructure, [newWorkoutName]: { exercises: [], label: 'New' } };
        const newWorkoutOrder = [...program.workoutOrder, newWorkoutName];
        updateProgram({ programStructure: newProgramStructure, workoutOrder: newWorkoutOrder });
    };
    
    const handleDeleteWorkoutDay = (workoutNameToDelete) => {
        openModal(
            <div>
                <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
                <p className="text-gray-600 dark:text-gray-400">Are you sure you want to delete "{workoutNameToDelete}"? It will be removed from the program and replaced with a 'Rest' day in the weekly schedule.</p>
                <div className="flex justify-end gap-2 mt-6">
                    <button onClick={closeModal} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg">Cancel</button>
                    <button onClick={() => {
                        const newProgramStructure = { ...program.programStructure };
                        delete newProgramStructure[workoutNameToDelete];
                        
                        const newWorkoutOrder = program.workoutOrder.filter(name => name !== workoutNameToDelete);

                        const newSchedule = program.weeklySchedule.map(d => d.workout === workoutNameToDelete ? { ...d, workout: 'Rest' } : d);

                        updateProgram({
                            programStructure: newProgramStructure,
                            workoutOrder: newWorkoutOrder,
                            weeklySchedule: newSchedule,
                        });
                        closeModal();
                    }} className="px-4 py-2 bg-red-600 text-white rounded-lg">Delete</button>
                </div>
            </div>
        );
    };

    const handleRenameWorkoutDay = (oldName, newName) => {
        if (!newName || newName === oldName || program.programStructure[newName]) {
            closeModal();
            return;
        }

        const newProgramStructure = { ...program.programStructure };
        newProgramStructure[newName] = { ...newProgramStructure[oldName] };
        delete newProgramStructure[oldName];

        const newWorkoutOrder = program.workoutOrder.map(name => name === oldName ? newName : name);
        const newSchedule = program.weeklySchedule.map(d => d.workout === oldName ? { ...d, workout: newName } : d);

        updateProgram({
            programStructure: newProgramStructure,
            workoutOrder: newWorkoutOrder,
            weeklySchedule: newSchedule,
        });
        closeModal();
    };

    const startEditingName = (name) => {
        openModal(<RenameWorkoutModal oldName={name} onSave={(newName) => handleRenameWorkoutDay(name, newName)} onClose={closeModal} />)
    };
    
    const handleReorderWorkoutDay = (workoutIndex, direction) => {
        const newOrder = [...program.workoutOrder];
        const [movedItem] = newOrder.splice(workoutIndex, 1);
        newOrder.splice(workoutIndex + direction, 0, movedItem);
        updateProgram({ workoutOrder: newOrder });
    };

    const handleRemoveDayFromMaster = (indexToRemove) => {
        const newWorkoutOrder = program.workoutOrder.filter((_, index) => index !== indexToRemove);
        updateProgram({ workoutOrder: newWorkoutOrder });
    };

    const handleAddExerciseToWorkout = (workoutName) => {
        const myExercises = program.masterExerciseList;

        openModal(
            <AddExerciseToWorkoutModal 
                masterExerciseList={myExercises}
                onAdd={(exerciseName, exerciseDetails) => {
                    const newProgramStructure = JSON.parse(JSON.stringify(program.programStructure));
                    newProgramStructure[workoutName].exercises.push(exerciseName);
                    
                    let newMasterList = { ...program.masterExerciseList };
                    if (exerciseDetails && !newMasterList[exerciseName]) {
                        newMasterList[exerciseName] = exerciseDetails;
                    }

                    updateProgram({ 
                        programStructure: newProgramStructure,
                        masterExerciseList: newMasterList
                    });
                    closeModal();
                }}
                onClose={closeModal}
            />, 'lg'
        )
    };

    const handleEditExerciseDetails = (exerciseName) => {
        const exerciseDetails = program.masterExerciseList[exerciseName];
        openModal(
            <EditExerciseModal
                exerciseName={exerciseName}
                exercise={exerciseDetails}
                onSave={(newDetails, newName) => {
                    const newMasterList = { ...program.masterExerciseList };
                    if(exerciseName !== newName) {
                        delete newMasterList[exerciseName];
                    }
                    newMasterList[newName] = newDetails;

                    // Update all workout structures
                    const newProgramStructure = JSON.parse(JSON.stringify(program.programStructure));
                    Object.keys(newProgramStructure).forEach(workoutKey => {
                        newProgramStructure[workoutKey].exercises = newProgramStructure[workoutKey].exercises.map(ex => ex === exerciseName ? newName : ex);
                    });

                    updateProgram({ masterExerciseList: newMasterList, programStructure: newProgramStructure });
                    closeModal();
                }}
                onDelete={(nameToDelete) => {
                    const newMasterList = { ...program.masterExerciseList };
                    delete newMasterList[nameToDelete];

                    const newProgramStructure = JSON.parse(JSON.stringify(program.programStructure));
                    Object.keys(newProgramStructure).forEach(workoutKey => {
                        newProgramStructure[workoutKey].exercises = newProgramStructure[workoutKey].exercises.filter(ex => ex !== nameToDelete);
                    });

                    updateProgram({ masterExerciseList: newMasterList, programStructure: newProgramStructure });
                    closeModal();
                }}
                onClose={closeModal}
            />,
            'lg'
        );
    };
    
    const handleCreateNewExercise = () => {
        openModal(
            <EditExerciseModal
                isNew={true}
                onSave={(newDetails, newName) => {
                    const newMasterList = { ...program.masterExerciseList, [newName]: newDetails };
                    updateProgram({ masterExerciseList: newMasterList });
                    closeModal();
                }}
                onClose={closeModal}
            />,
            'lg'
        )
    };

    const handleRemoveExerciseFromWorkout = (workoutName, exerciseIndex) => {
        const newProgramStructure = JSON.parse(JSON.stringify(program.programStructure));
        newProgramStructure[workoutName].exercises.splice(exerciseIndex, 1);
        updateProgram({ programStructure: newProgramStructure });
    };
    
    const onDragEnd = (result) => {
        if (!result.destination) return;
        const { source, destination, type } = result;
    
        if (type === 'workoutDay') {
            // Reordering workout days in the workoutOrder array
            const newOrder = [...program.workoutOrder];
            const [movedItem] = newOrder.splice(source.index, 1);
            newOrder.splice(destination.index, 0, movedItem);
            updateProgram({ workoutOrder: newOrder });
            return;
        }
    
        if (type === 'exercise') {
            const sourceWorkoutName = source.droppableId;
            const destWorkoutName = destination.droppableId;
    
            const newProgramStructure = JSON.parse(JSON.stringify(program.programStructure));
            const sourceWorkout = newProgramStructure[sourceWorkoutName];
            const destWorkout = newProgramStructure[destWorkoutName];
    
            if (sourceWorkoutName === destWorkoutName) {
                // Reordering within the same list
                const [movedItem] = sourceWorkout.exercises.splice(source.index, 1);
                sourceWorkout.exercises.splice(destination.index, 0, movedItem);
            } else {
                // Moving from one list to another
                const [movedItem] = sourceWorkout.exercises.splice(source.index, 1);
                destWorkout.exercises.splice(destination.index, 0, movedItem);
            }
    
            updateProgram({ programStructure: newProgramStructure });
        }
    };
    
    const handleEditDay = (week, dayKey) => {
        // No need to pass workoutName, the view will determine it
        onNavigate('editWeek', { week, dayKey });
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="p-4 md:p-6 pb-24">
                 <div className="flex justify-between items-center text-center mb-6">
                    <div className="flex items-center gap-3">
                        <Edit className="text-blue-500 dark:text-blue-400" size={32} />
                        <div>
                            <h1 className="text-3xl font-bold dark:text-white">Edit Program</h1>
                        </div>
                    </div>
                    <button onClick={handleCreateNewExercise} className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                        <PlusCircle size={16} /> Create
                    </button>
                </div>

                {/* Program Details Editor */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Program Info</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Program Name</label>
                            <input type="text" value={program.info.name} onChange={(e) => handleInfoChange('name', e.target.value)} className="w-full p-2 bg-white dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Weeks</label>
                            <input type="number" value={program.info.weeks} onChange={(e) => handleInfoChange('weeks', parseInt(e.target.value, 10) || 1)} className="w-full p-2 bg-white dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600" />
                        </div>
                    </div>
                </div>

                <MasterScheduleEditor program={program} onProgramDataChange={updateProgram} />

                {/* Weekly Schedule Editor - Collapsible */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
                    <button onClick={() => setScheduleOpen(!isScheduleOpen)} className="w-full flex justify-between items-center text-left">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Weekly Schedule & Overrides</h3>
                        {isScheduleOpen ? <ChevronUp /> : <ChevronDown />}
                    </button>
                    {isScheduleOpen && (
                        <div className="mt-4 space-y-2">
                            {Array.from({ length: program.info.weeks }, (_, i) => i + 1).map(week => (
                                <EditWeekCard
                                    key={week}
                                    week={week}
                                    program={program}
                                    onEditDay={handleEditDay}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Workout Day List */}
                 <h3 className="text-lg font-semibold text-gray-900 dark:text-white my-3">Master Workout Templates</h3>
                 <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Drag exercises to reorder them within a day, or drag them to another day entirely.</p>
                <Droppable droppableId="all-workouts" direction="vertical" type="workoutDay">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                            {program.workoutOrder.map((workoutName, workoutIndex) => {
                                const workoutDetails = program.programStructure[workoutName];
                                if (!workoutDetails) return null;
                                return (
                                    <Draggable key={workoutName} draggableId={workoutName} index={workoutIndex}>
                                        {(provided) => (
                                            <div ref={provided.innerRef} {...provided.draggableProps} id={`workout-day-editor-${workoutName}`}>
                                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
                                                    <div className="flex justify-between items-center mb-3 border-b border-gray-200 dark:border-gray-700 pb-3">
                                                        <div {...provided.dragHandleProps} className="flex items-center gap-2 cursor-grab">
                                                            <Move size={20} className="text-gray-400" />
                                                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{workoutName}</h3>
                                                        </div>
                                                         <div className="flex items-center gap-1">
                                                            {workoutName !== 'Rest' && <button onClick={() => startEditingName(workoutName)} className="p-1 hover:text-blue-500"><Edit size={20}/></button>}
                                                            <button onClick={() => handleRemoveDayFromMaster(workoutIndex)} className="p-1 hover:text-red-500"><XCircle size={20}/></button>
                                                        </div>
                                                    </div>
                                                    <Droppable droppableId={workoutName} type="exercise">
                                                        {(provided) => (
                                                            <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-2 mb-3 min-h-[50px]">
                                                                {workoutDetails.exercises.map((ex, index) => (
                                                                    <Draggable key={`${workoutName}-${ex}-${index}`} draggableId={`${workoutName}-${ex}-${index}`} index={index}>
                                                                        {(provided) => (
                                                                            <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md group">
                                                                                <span className="font-medium">{ex}</span>
                                                                                 <div className="flex items-center gap-1 text-gray-500">
                                                                                    <button onClick={() => handleEditExerciseDetails(ex)} className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Pencil size={16}/></button>
                                                                                    <button onClick={() => handleRemoveExerciseFromWorkout(workoutName, index)} className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"><XCircle size={16}/></button>
                                                                                 </div>
                                                                            </li>
                                                                        )}
                                                                    </Draggable>
                                                                ))}
                                                                {provided.placeholder}
                                                            </ul>
                                                        )}
                                                    </Droppable>
                                                    <button onClick={() => handleAddExerciseToWorkout(workoutName)} className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/50">
                                                        <PlusCircle size={16}/> Add Exercise
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                );
                            })}
                            {provided.placeholder}
                             <button onClick={handleAddWorkoutDay} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/50 font-bold">
                                <PlusCircle size={20}/> Add New Workout Day
                            </button>
                        </div>
                    )}
                </Droppable>
            </div>
        </DragDropContext>
    );
};

const EditExerciseModal = ({ exercise, exerciseName, onSave, onClose, onDelete, isNew }) => {
    const getInitialState = () => {
        if (isNew) {
            return {
                name: '',
                sets: '',
                reps: '',
                rir: [],
                rest: '',
                lastSetTechnique: '',
                equipment: 'barbell',
                muscles: {
                    primary: '',
                    secondary: '',
                    tertiary: '',
                    primaryContribution: 1,
                    secondaryContribution: 0.5,
                    tertiaryContribution: 0.25,
                }
            };
        }
        return {
            name: exerciseName || '',
            sets: exercise?.sets || 3,
            reps: exercise?.reps || '8-12',
            rir: Array.isArray(exercise?.rir) ? exercise.rir : Array(exercise?.sets || 3).fill('1-2'),
            rest: exercise?.rest || '2-3 min',
            lastSetTechnique: exercise?.lastSetTechnique || '',
            equipment: exercise?.equipment || 'barbell',
            muscles: {
                primary: exercise?.muscles?.primary || '',
                secondary: exercise?.muscles?.secondary || '',
                tertiary: exercise?.muscles?.tertiary || '',
                primaryContribution: exercise?.muscles?.primaryContribution ?? 1,
                secondaryContribution: exercise?.muscles?.secondaryContribution ?? 0.5,
                tertiaryContribution: exercise?.muscles?.tertiaryContribution ?? 0.25,
            }
        };
    };

    const [details, setDetails] = useState(getInitialState);

    useEffect(() => {
        const numSets = parseInt(details.sets, 10) || 0;
        if (details.rir.length !== numSets) {
            setDetails(prev => ({
                ...prev,
                rir: Array.from({ length: numSets }, (_, i) => prev.rir[i] || '0')
            }));
        }
    }, [details.sets, details.rir]);

    const handleRirChange = (index, value) => {
        const newRir = [...details.rir];
        newRir[index] = value;
        setDetails(prev => ({ ...prev, rir: newRir }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (['primary', 'secondary', 'tertiary', 'primaryContribution', 'secondaryContribution', 'tertiaryContribution'].includes(name)) {
            setDetails(prev => ({ ...prev, muscles: { ...prev.muscles, [name]: value } }));
        } else {
            setDetails(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleSave = () => {
        if (!details.name) {
            alert("Exercise name is required.");
            return;
        }
        const { name, ...otherDetails } = details;
        onSave(otherDetails, name);
    };

    const handleDelete = () => {
        if(window.confirm(`Are you sure you want to delete "${exerciseName}"? This will remove it from the master list and all workouts.`)){
            onDelete(exerciseName);
        }
    };

    return (
        <div>
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{isNew ? 'Create New Exercise' : `Editing ${exerciseName}`}</h2>
                {!isNew && (
                    <button onClick={handleDelete} className="text-red-500 hover:text-red-700 p-1">
                        <XCircle size={20} />
                    </button>
                )}
            </div>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exercise Name</label>
                    <input id="name" type="text" name="name" value={details.name} onChange={handleChange} className="w-full p-2 bg-white dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="sets" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sets</label>
                        <input id="sets" type="number" name="sets" value={details.sets} onChange={handleChange} className="w-full p-2 bg-white dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600" />
                    </div>
                    <div>
                        <label htmlFor="reps" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reps</label>
                        <input id="reps" type="text" name="reps" value={details.reps} onChange={handleChange} placeholder="e.g., 8-12" className="w-full p-2 bg-white dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600" />
                    </div>
                </div>

                <div className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg space-y-3">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white -mt-1">RIR Targets Per Set</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {Array.from({ length: parseInt(details.sets, 10) || 0 }, (_, i) => (
                            <div key={i}>
                                <label htmlFor={`rir-${i}`} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Set {i + 1}</label>
                                <input id={`rir-${i}`} type="text" value={details.rir[i] || ''} onChange={(e) => handleRirChange(i, e.target.value)} className="w-full p-2 text-sm bg-white dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600" />
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <label htmlFor="rest" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rest</label>
                    <input id="rest" type="text" name="rest" value={details.rest} onChange={handleChange} placeholder="e.g., 2-3 min" className="w-full p-2 bg-white dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600" />
                </div>
                 <div className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg space-y-4">
                     <h3 className="font-semibold text-lg text-gray-900 dark:text-white -mt-1 mb-2">Muscle Groups & Volume</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="primary" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primary Muscle</label>
                            <input id="primary" type="text" name="primary" value={details.muscles.primary} onChange={handleChange} className="w-full p-2 bg-white dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600" />
                        </div>
                        <div>
                            <label htmlFor="primaryContribution" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primary Contribution</label>
                            <select id="primaryContribution" name="primaryContribution" value={details.muscles.primaryContribution} onChange={handleChange} className="w-full p-2 bg-white dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600">
                                <option value={1}>100% (Primary)</option>
                                <option value={0.75}>75%</option>
                                <option value={0.5}>50%</option>
                                <option value={0.25}>25%</option>
                            </select>
                        </div>
                         <div>
                            <label htmlFor="secondary" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Secondary Muscle</label>
                            <input id="secondary" type="text" name="secondary" value={details.muscles.secondary} onChange={handleChange} className="w-full p-2 bg-white dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600" />
                        </div>
                        <div>
                            <label htmlFor="secondaryContribution" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Secondary Contribution</label>
                            <select id="secondaryContribution" name="secondaryContribution" value={details.muscles.secondaryContribution} onChange={handleChange} className="w-full p-2 bg-white dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600">
                                <option value={0.75}>75%</option>
                                <option value={0.5}>50% (Standard)</option>
                                <option value={0.25}>25%</option>
                                <option value={0}>0%</option>
                            </select>
                        </div>
                         <div>
                            <label htmlFor="tertiary" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tertiary Muscle</label>
                            <input id="tertiary" type="text" name="tertiary" value={details.muscles.tertiary} onChange={handleChange} className="w-full p-2 bg-white dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600" />
                        </div>
                        <div>
                            <label htmlFor="tertiaryContribution" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tertiary Contribution</label>
                             <select id="tertiaryContribution" name="tertiaryContribution" value={details.muscles.tertiaryContribution} onChange={handleChange} className="w-full p-2 bg-white dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600">
                                <option value={0.5}>50%</option>
                                <option value={0.25}>25% (Standard)</option>
                                <option value={0}>0%</option>
                            </select>
                        </div>
                    </div>
                </div>
                 <div>
                    <label htmlFor="lastSetTechnique" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Intensity Technique (e.g., Dropset)</label>
                    <input id="lastSetTechnique" type="text" name="lastSetTechnique" value={details.lastSetTechnique} onChange={handleChange} className="w-full p-2 bg-white dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600" />
                </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
                <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg">Cancel</button>
                <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save</button>
            </div>
        </div>
    );
};

const AddExerciseToWorkoutModal = ({ masterExerciseList, onAdd, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('bank'); // 'bank' or 'mine'

    const listToDisplay = activeTab === 'bank' ? exerciseBank : masterExerciseList;
    const filteredExercises = useMemo(() => {
        return Object.keys(listToDisplay).filter(ex => ex.toLowerCase().includes(searchTerm.toLowerCase())).sort();
    }, [searchTerm, listToDisplay]);

    const handleAdd = (exerciseName) => {
        const details = listToDisplay[exerciseName];
        onAdd(exerciseName, details);
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Add Exercise</h2>
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                <button onClick={() => setActiveTab('bank')} className={`flex items-center gap-2 px-4 py-2 -mb-px border-b-2 text-sm font-semibold ${activeTab === 'bank' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                    <BookOpen size={16} /> Exercise Bank
                </button>
                <button onClick={() => setActiveTab('mine')} className={`flex items-center gap-2 px-4 py-2 -mb-px border-b-2 text-sm font-semibold ${activeTab === 'mine' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                    <Dumbbell size={16} /> My Active Exercises
                </button>
            </div>
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search exercises..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-2 pl-10 bg-white dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600"
                />
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                {filteredExercises.map(ex => (
                    <button
                        key={ex}
                        onClick={() => handleAdd(ex)}
                        className="w-full text-left p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                       <PlusCircle size={16} /> {ex}
                    </button>
                ))}
                 {filteredExercises.length === 0 && <p className="text-center text-gray-500 py-4">No exercises found.</p>}
            </div>
             <div className="flex justify-end gap-2 mt-6">
                <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg">Cancel</button>
            </div>
        </div>
    );
};

const ProgramPreviewModal = ({ program, onClose, onLoad }) => {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-2">{program.name}</h2>
            <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <span><CalendarDays size={14} className="inline-block mr-1"/>{program.info.weeks} Weeks</span>
                <span><Zap size={14} className="inline-block mr-1"/>{program.info.split}</span>
            </div>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {program.workoutOrder.map(workoutName => (
                    <div key={workoutName} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{workoutName}</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                            {program.programStructure[workoutName].exercises.map(ex => (
                                <li key={ex}>{ex}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
            <div className="flex justify-end gap-2 mt-6">
                <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg">Cancel</button>
                <button onClick={() => { onLoad(); onClose(); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2">
                    <Download size={16}/> Load Program
                </button>
            </div>
        </div>
    );
};

const RestoreProgramModal = ({ csvData, onRestore, onClose }) => {
    const [error, setError] = useState('');

    const handleRestore = () => {
        try {
            const lines = csvData.split('\n').filter(line => line.trim() !== '');
            if (lines.length < 2) throw new Error("CSV file must have a header and at least one data row.");

            const headers = lines[0].split(',').map(h => h.trim());
            const requiredHeaders = ['Exercise', 'Sets', 'Reps', 'RIR', 'Rest', 'Muscles Primary', 'Workout Day', 'Day of Week'];
            for(const header of requiredHeaders) {
                if(!headers.includes(header)) throw new Error(`Missing required CSV header: ${header}`);
            }

            const programName = "Restored Program";
            const masterExerciseList = {};
            const programStructure = {};
            const weeklySchedule = [
                { day: 'Mon', workout: 'Rest' }, { day: 'Tue', workout: 'Rest' },
                { day: 'Wed', workout: 'Rest' }, { day: 'Thu', workout: 'Rest' },
                { day: 'Fri', workout: 'Rest' }, { day: 'Sat', workout: 'Rest' },
                { day: 'Sun', workout: 'Rest' },
            ];

            lines.slice(1).forEach(line => {
                const values = line.split(',');
                const exerciseData = headers.reduce((obj, header, index) => {
                    obj[header] = values[index]?.trim() || '';
                    return obj;
                }, {});

                const exName = exerciseData['Exercise'];
                if (!masterExerciseList[exName]) {
                    masterExerciseList[exName] = {
                        sets: exerciseData['Sets'],
                        reps: exerciseData['Reps'],
                        rir: exerciseData['RIR'].split(';'),
                        rest: exerciseData['Rest'],
                        muscles: {
                            primary: exerciseData['Muscles Primary'],
                            secondary: exerciseData['Muscles Secondary'],
                            tertiary: exerciseData['Muscles Tertiary'],
                        }
                    };
                }

                const workoutDay = exerciseData['Workout Day'];
                if (!programStructure[workoutDay]) {
                    programStructure[workoutDay] = { exercises: [], label: workoutDay.charAt(0).toUpperCase() };
                }
                if (!programStructure[workoutDay].exercises.includes(exName)) {
                    programStructure[workoutDay].exercises.push(exName);
                }

                const dayOfWeek = exerciseData['Day of Week'];
                const scheduleEntry = weeklySchedule.find(d => d.day === dayOfWeek);
                if (scheduleEntry) {
                    scheduleEntry.workout = workoutDay;
                }
            });

            const restoredProgram = {
                name: programName,
                info: { name: programName, weeks: 8, split: "Custom" },
                masterExerciseList,
                programStructure,
                weeklySchedule,
                workoutOrder: Object.keys(programStructure),
                settings: presets['optimal-ppl-ul'].settings, // Default settings
                weeklyOverrides: {},
            };

            onRestore(restoredProgram);
            onClose();

        } catch (err) {
            setError(`Error parsing CSV: ${err.message}`);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Restore Program</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
                You've uploaded a CSV file. Review the detected data and click "Restore" to import it as a new program.
            </p>
            {error && <p className="text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-md">{error}</p>}
            <div className="flex justify-end gap-2 mt-6">
                <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg">Cancel</button>
                <button onClick={handleRestore} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Restore</button>
            </div>
        </div>
    );
};

const ProgramManagerView = ({ onProgramUpdate, activeProgram, programInstances, onInstanceSwitch, onBack }) => {
    const { openModal, closeModal, addToast } = useContext(AppStateContext);
    const fileInputRef = useRef(null);

    const handleShareProgram = () => {
        try {
            const activeExercises = new Set(Object.values(activeProgram.programStructure).flatMap(w => w.exercises));
            const activeMasterExerciseList = Object.fromEntries(
                Object.entries(activeProgram.masterExerciseList).filter(([name]) => activeExercises.has(name))
            );

            const programToExport = {
                name: activeProgram.name,
                info: activeProgram.info,
                masterExerciseList: activeMasterExerciseList,
                programStructure: activeProgram.programStructure,
                weeklySchedule: activeProgram.weeklySchedule,
                workoutOrder: activeProgram.workoutOrder,
                settings: activeProgram.settings,
                weeklyOverrides: activeProgram.weeklyOverrides || {},
            };

            const programJson = JSON.stringify(programToExport, null, 2);
            const blob = new Blob([programJson], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const fileName = activeProgram.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            link.download = `${fileName}_program.json`;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            addToast('Program exported successfully!', 'success');
        } catch (error) {
            console.error("Failed to export program:", error);
            addToast('Error exporting program.', 'error');
        }
    };

    const handleExportProgramToCSV = () => {
        const { name, masterExerciseList, programStructure, weeklySchedule, weeklyOverrides } = activeProgram.program;
        const headers = ['Workout Day', 'Day of Week', 'Exercise', 'Sets', 'Reps', 'RIR', 'Rest', 'Muscles Primary', 'Muscles Secondary', 'Muscles Tertiary'];
        const rows = [];

        weeklySchedule.forEach(({ day }) => {
            const workoutName = getWorkoutNameForDay(activeProgram.program, new Date().getWeek, day); // Simplified week, assuming for structure
            if (workoutName !== 'Rest') {
                const workoutDetails = programStructure[workoutName];
                if (workoutDetails) {
                    workoutDetails.exercises.forEach(exName => {
                        const exDetails = masterExerciseList[exName];
                        if (exDetails) {
                            rows.push([
                                `"${workoutName}"`, day, `"${exName}"`, exDetails.sets, `"${exDetails.reps}"`,
                                `"${Array.isArray(exDetails.rir) ? exDetails.rir.join(';') : exDetails.rir}"`,
                                `"${exDetails.rest}"`, `"${exDetails.muscles?.primary || ''}"`,
                                `"${exDetails.muscles?.secondary || ''}"`, `"${exDetails.muscles?.tertiary || ''}"`
                            ].join(','));
                        }
                    });
                }
            }
        });

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        const fileName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.download = `${fileName}_program_structure.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                if (file.name.endsWith('.csv')) {
                    openModal(<RestoreProgramModal csvData={e.target.result} onRestore={onProgramUpdate} onClose={closeModal} />);
                } else {
                    const importedProgram = JSON.parse(e.target.result);
                    if (
                        importedProgram.name && typeof importedProgram.name === 'string' &&
                        importedProgram.info && typeof importedProgram.info === 'object' &&
                        importedProgram.masterExerciseList && typeof importedProgram.masterExerciseList === 'object' &&
                        importedProgram.programStructure && typeof importedProgram.programStructure === 'object' &&
                        importedProgram.weeklySchedule && Array.isArray(importedProgram.weeklySchedule) &&
                        importedProgram.workoutOrder && Array.isArray(importedProgram.workoutOrder)
                    ) {
                        onProgramUpdate(importedProgram); // This will create a new instance
                        addToast(`Program "${importedProgram.name}" imported successfully!`, 'success');
                    } else {
                        throw new Error("Invalid or incomplete program file structure.");
                    }
                }
            } catch (error) {
                console.error("Failed to import program:", error);
                addToast(`Failed to import: ${error.message}`, 'error');
            }
        };
        reader.readAsText(file);
        event.target.value = null; // Reset input
    };

    const handlePreview = (programData) => {
        openModal(
            <ProgramPreviewModal 
                program={programData} 
                onClose={closeModal} 
                onLoad={() => onProgramUpdate(programData)} 
            />,
            'lg'
        );
    };

    return (
        <div className="p-4 md:p-6 pb-24">
            <div className="flex justify-center items-center mb-6 text-center">
                 <div className="flex flex-col items-center">
                    <BookOpen className="text-blue-500 dark:text-blue-400 mb-2" size={32} />
                    <h1 className="text-3xl font-bold dark:text-white">Program Hub</h1>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md mb-6">
                 <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Manage Your Program</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <button onClick={handleShareProgram} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                        <Download size={16}/> Export Program (JSON)
                    </button>
                     <button onClick={handleExportProgramToCSV} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 text-white rounded-lg shadow-md hover:bg-teal-700 transition-colors">
                        <Download size={16}/> Export Program (CSV)
                    </button>
                    <button onClick={handleImportClick} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors col-span-full">
                        <Upload size={16}/> Import from File
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".json,.csv" style={{ display: 'none' }} />
                 </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center col-span-1 sm:col-span-2">
                    Export your current program to share or back it up. Import a JSON or CSV file to load a new program structure.
                </p>
            </div>

            {/* Custom/Archived Programs */}
            {programInstances.length > 1 && (
                 <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md mb-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Your Saved Programs</h3>
                    <div className="space-y-3">
                        {programInstances.map((instance) => (
                            <div key={instance.id} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg flex justify-between items-center gap-3">
                                <div>
                                    <h4 className="font-semibold text-lg">{instance.program.name}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Last used: {new Date(instance.lastModified).toLocaleDateString()}</p>
                                </div>
                                <button onClick={() => onInstanceSwitch(instance.id)} disabled={instance.id === activeProgram.id} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 disabled:bg-gray-400">
                                    {instance.id === activeProgram.id ? 'Active' : 'Switch To'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Load a Preset Program</h3>
                <div className="space-y-3">
                    {Object.entries(presets).map(([key, preset]) => (
                        <div key={key} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-3">
                            <div>
                                <h4 className="font-semibold text-lg">{preset.name}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{preset.info.weeks} Weeks | {preset.info.split}</p>
                            </div>
                             <div className="flex items-center gap-2 flex-shrink-0">
                                <button onClick={() => handlePreview(preset)} className="flex items-center gap-1 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"><Eye size={20}/> Preview</button>
                                <button onClick={() => onProgramUpdate(preset)} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700">Load</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


const RenameWorkoutModal = ({ oldName, onSave, onClose }) => {
    const [newName, setNewName] = useState(oldName);

    const handleSave = () => {
        onSave(newName);
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Rename Workout</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Enter a new name for "{oldName}".</p>
            <input 
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full p-2 bg-white dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600"
                autoFocus
            />
            <div className="flex justify-end gap-2 mt-6">
                <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg">Cancel</button>
                <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save</button>
            </div>
        </div>
    );
};

const TutorialModal = ({ onProgramSelect, onClose, onBodyWeightSet, onSetSyncId }) => {
    const [step, setStep] = useState(1);
    const [localBodyWeight, setLocalBodyWeight] = useState('');
    const [tempId, setTempId] = useState('');
    const [previewingProgram, setPreviewingProgram] = useState(null);
    const totalSteps = 6;

    const handleSelectProgram = (presetKey) => {
        const presetData = presets[presetKey];
        onProgramSelect(presetData);
        nextStep();
    };

    const handleSetId = () => {
        if(tempId.trim()){
            onSetSyncId(tempId);
            nextStep();
        } else {
            alert("Please enter a Sync ID.");
        }
    }

    const handleFinish = () => {
        if(localBodyWeight) {
            onBodyWeightSet(localBodyWeight);
        }
        onClose();
    }

    const nextStep = () => setStep(s => Math.min(totalSteps, s + 1));
    const prevStep = () => setStep(s => Math.max(1, s - 1));

    if (previewingProgram) {
        const program = previewingProgram;
        return (
            <div>
                <h2 className="text-2xl font-bold mb-2">{program.name}</h2>
                <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <span><CalendarDays size={14} className="inline-block mr-1"/>{program.info.weeks} Weeks</span>
                    <span><Zap size={14} className="inline-block mr-1"/>{program.info.split}</span>
                </div>
                <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                    {(program.workoutOrder || []).map(workoutName => {
                        const workoutDetails = program.programStructure[workoutName];
                        if (!workoutDetails) return null;
                        return (
                            <div key={workoutName} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{workoutName}</h3>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                    {(workoutDetails.exercises || []).map(ex => (
                                        <li key={ex}>{ex}</li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>
                <div className="flex justify-between items-center mt-6">
                    <button onClick={() => setPreviewingProgram(null)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg">Back</button>
                    <button onClick={() => handleSelectProgram(program.key)} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2">
                        <Download size={16}/> Select Program
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Lightbulb size={24} className="text-blue-500" /> Welcome to Project Overload!</h2>
            
            <div className="space-y-4 min-h-[300px] text-gray-600 dark:text-gray-300">
                {step === 1 && (
                     <div className="p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">Step 1: Your Home Base</h3>
                        <p>The <span className="font-semibold">Program</span> screen is your command center. It lays out your entire mesocycle, week by week. Just click a day to jump in and start lifting.</p>
                    </div>
                )}
                {step === 2 && (
                    <div className="p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">Step 2: Logging a Workout</h3>
                        <p>Inside a workout, enter your <span className="font-semibold">Load</span>, <span className="font-semibold">Reps</span>, and <span className="font-semibold">RIR</span> (Reps In Reserve). The app gives you an AI-powered <span className="font-semibold text-blue-500">Suggestion</span> based on your last performance to guide your progressive overload.</p>
                    </div>
                )}
                 {step === 3 && (
                    <div className="p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">Step 3: Customization</h3>
                        <p>Use the <span className="font-semibold">Program Hub</span> to discover new presets, or even share and import programs. The <span className="font-semibold">Edit Program</span> view gives you full control to build your perfect routine from scratch.</p>
                    </div>
                )}
                {step === 4 && (
                     <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Step 4: Create a Sync ID</h3>
                        <p className="text-sm mb-4">Create a unique ID to sync your data across devices and browsers. Make it memorable!</p>
                        <input 
                            type="text"
                            value={tempId}
                            onChange={(e) => setTempId(e.target.value)}
                            className="w-full p-2 bg-white dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600"
                            placeholder="e.g., john-doe-lifts"
                        />
                    </div>
                )}
                {step === 5 && (
                    <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Step 5: Select Your Starting Program</h3>
                        <p className="text-sm mb-4">Choose a preset to begin. You can always change or customize it later in the Program Hub.</p>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                             {Object.entries(presets).map(([key, preset]) => (
                                <div key={key} className="w-full text-left p-3 rounded-md bg-gray-100 dark:bg-gray-700/50 flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{preset.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{preset.info.split}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setPreviewingProgram({...preset, key})} className="px-3 py-1 text-sm rounded-md bg-white dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500">Preview</button>
                                        <button onClick={() => handleSelectProgram(key)} className="px-3 py-1 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700">Select</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                 {step === 6 && (
                    <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Step 6: Enter Your Bodyweight</h3>
                        <p className="text-sm mb-4">Please enter your current bodyweight. This helps with tracking certain achievements and progress metrics. You can change this later in settings.</p>
                        <input 
                            type="number"
                            value={localBodyWeight}
                            onChange={(e) => setLocalBodyWeight(e.target.value)}
                            className="w-full p-2 bg-white dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600"
                            placeholder="Your current bodyweight"
                        />
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-6">
                <span className="text-sm text-gray-500">{step} / {totalSteps}</span>
                <div className="flex gap-2">
                     {step > 1 && step < 5 && (
                        <button onClick={prevStep} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg">Back</button>
                     )}
                     {step < 4 ? (
                        <button onClick={nextStep} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Next</button>
                     ) : step === 4 ? (
                        <button onClick={handleSetId} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Set ID & Continue</button>
                     ): step === 6 ? (
                         <button onClick={handleFinish} className="px-4 py-2 bg-green-600 text-white rounded-lg">Finish Setup</button>
                     ) : step === 5 ? (
                        <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg">Skip for Now</button>
                     ) : (
                         <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg">Close</button>
                     )
                     }
                </div>
            </div>
        </div>
    );
};

const RestTimer = ({ initialTime, onClose, onTimerEnd }) => {
    const [time, setTime] = useState(initialTime);
    const progress = (time / initialTime) * 100;

    useEffect(() => {
        if (time <= 0) {
            if (navigator.vibrate) {
                navigator.vibrate([500, 100, 500]);
            }
            onTimerEnd();
            return;
        }
        const timerId = setInterval(() => {
            setTime(t => t - 1);
        }, 1000);
        return () => clearInterval(timerId);
    }, [time, onTimerEnd]);

    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800/90 backdrop-blur-sm text-white p-3 shadow-2xl z-50 flex items-center gap-4 animate-fade-in-up">
            <div className="flex-grow">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold text-gray-300">RESTING</span>
                    <span className="text-lg font-mono font-bold tracking-wider">
                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full transition-all duration-1000 linear" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors">
                <X size={20} />
            </button>
        </div>
    );
};

// --- Achievements Data & Logic ---
const formatWeight = (value, unit, includeUnit = true) => {
    if (unit === 'kg') {
        const kgValue = (value / 2.20462).toFixed(1);
        return `${kgValue}${includeUnit ? ' kg' : ''}`;
    }
    return `${Math.round(value)}${includeUnit ? ' lbs' : ''}`;
};

const calculateStreak = (allLogs, programData) => {
    if (!programData || !programData.info) return 0;
    const { weeklySchedule, masterExerciseList, info, workoutOrder, settings } = programData;
    let currentStreak = 0;
    let streakBroken = false;
    
    const isDayComplete = (week, dayKey, workoutName) => {
        const workout = getWorkoutForWeek(programData, week, workoutName);
        if (!workout) return true; // Rest days are always "complete" for streak purposes

        return workout.exercises.every(exName => {
            const exDetails = getExerciseDetails(exName, masterExerciseList);
            if (!exDetails) return false;
            return Array.from({ length: Number(exDetails.sets) }, (_, i) => i + 1).every(setNum => {
                const log = allLogs[`${week}-${dayKey}-${exName}-${setNum}`];
                return isSetLogComplete(log);
            });
        });
    }

    const hasAnyLogInDay = (week, dayKey, workoutName) => {
        const workout = getWorkoutForWeek(programData, week, workoutName);
        if (!workout) return false;
         return workout.exercises.some(exName => {
             const exDetails = getExerciseDetails(exName, masterExerciseList);
             if (!exDetails) return false;
             return Array.from({ length: Number(exDetails.sets) }, (_, i) => i + 1).some(setNum => !!allLogs[`${week}-${dayKey}-${exName}-${setNum}`]);
        });
    }
    
    if (settings.useWeeklySchedule) {
        const sortedDays = [];
        for (let week = 1; week <= info.weeks; week++) {
            for (const day of weeklySchedule) {
                const workoutName = getWorkoutNameForDay(programData, week, day.day);
                if (workoutName !== 'Rest') {
                    sortedDays.push({ week, day: day.day, workoutName });
                }
            }
        }
        for (const { week, day, workoutName } of sortedDays) {
            if (isDayComplete(week, day, workoutName)) {
                if (!streakBroken) currentStreak++;
            } else {
                if (hasAnyLogInDay(week, day, workoutName)) streakBroken = true;
            }
        }
    } else { // Sequential Mode
        const totalSessions = info.weeks * workoutOrder.length;
        for (let i = 0; i < totalSessions; i++) {
            const week = Math.floor(i / workoutOrder.length) + 1;
            const workoutName = workoutOrder[i % workoutOrder.length];
            const dayKey = `workout-${i}`;

            if (isDayComplete(week, dayKey, workoutName)) {
                if (!streakBroken) currentStreak++;
            } else {
                 if (hasAnyLogInDay(week, dayKey, workoutName)) streakBroken = true;
            }
        }
    }

    return currentStreak;
};

// Helper function to get max e1RM for an exercise type
const getMaxE1RMFor = (logs, exerciseSubstring) => {
    const relevantLogs = Object.values(logs).filter(l => !l.skipped && l.exercise.toLowerCase().includes(exerciseSubstring));
    if (relevantLogs.length === 0) return 0;
    return Math.max(0, ...relevantLogs.map(l => calculateE1RM(l.load, l.reps, l.rir)));
};

const achievementsList = {
    total_volume: {
        name: "Total Volume",
        description: "Cumulative weight lifted across all exercises. This is your career tonnage.",
        icon: Weight,
        type: 'tiered',
        tiers: [
            { name: "Bronze", value: 10000, description: (v, u) => `Lifted a total of ${formatWeight(v, u)}! The journey begins.` },
            { name: "Silver", value: 100000, description: (v, u) => `Lifted a total of ${formatWeight(v, u)}. That's some serious weight!` },
            { name: "Gold", value: 500000, description: (v, u) => `Lifted a total of ${formatWeight(v, u)}. Incredible strength!` },
            { name: "Platinum", value: 1000000, description: (v, u) => `Joined the ${formatWeight(v, u)} club! Truly elite.` },
            { name: "Diamond", value: 2000000, description: (v, u) => `Lifted ${formatWeight(v, u)}. You are a legend.` },
        ],
        getValue: (logs, program) => Object.values(logs).reduce((sum, log) => sum + getSetVolume(log, program.masterExerciseList), 0),
    },
    bench_press_pr: {
        name: "Bench Press Club",
        description: "Achieve new e1RM milestones in any bench press variation.",
        icon: Trophy,
        type: 'tiered',
        tiers: [
            { name: "135 Club", value: 135, description: (v, u) => `Achieved an e1RM of ${formatWeight(v, u)} (a plate!) on bench press.` },
            { name: "Two Wheels", value: 225, description: (v, u) => `Achieved an e1RM of ${formatWeight(v, u)} (two plates!) on bench press.` },
            { name: "Three Wheels", value: 315, description: (v, u) => `Achieved an e1RM of ${formatWeight(v, u)} (three plates!) on bench press.` },
        ],
        getValue: (logs) => getMaxE1RMFor(logs, 'bench')
    },
    squat_pr: {
        name: "Squat Club",
        description: "Achieve new e1RM milestones in any squat variation.",
        icon: Trophy,
        type: 'tiered',
        tiers: [
             { name: "Two Wheels", value: 225, description: (v, u) => `Achieved an e1RM of ${formatWeight(v, u)} (two plates!) on the squat.` },
            { name: "Three Wheels", value: 315, description: (v, u) => `Achieved an e1RM of ${formatWeight(v, u)} (three plates!) on the squat.` },
            { name: "Four Wheels", value: 405, description: (v, u) => `Achieved an e1RM of ${formatWeight(v, u)} (four plates!) on the squat.` },
        ],
        getValue: (logs) => getMaxE1RMFor(logs, 'squat')
    },
     deadlift_pr: {
        name: "Deadlift Club",
        description: "Achieve new e1RM milestones in any deadlift variation.",
        icon: Trophy,
        type: 'tiered',
        tiers: [
            { name: "Two Wheels", value: 225, description: (v, u) => `Achieved an e1RM of ${formatWeight(v,u)} on the deadlift.` },
            { name: "Three Wheels", value: 315, description: (v, u) => `Achieved an e1RM of ${formatWeight(v,u)} on the deadlift.` },
            { name: "Four Wheels", value: 405, description: (v, u) => `Achieved an e1RM of ${formatWeight(v,u)} on the deadlift.` },
            { name: "Five Wheels", value: 495, description: (v, u) => `Achieved an e1RM of ${formatWeight(v,u)} on the deadlift.` },
        ],
        getValue: (logs) => getMaxE1RMFor(logs, 'deadlift')
    },
    bodyweight_bench: {
        name: "Bench Buddy",
        description: "Bench press a multiple of your bodyweight.",
        icon: Weight,
        type: 'tiered',
        tiers: [
            { name: "1.0x BW", value: 1.0, description: () => "Benching your bodyweight is a classic milestone." },
            { name: "1.5x BW", value: 1.5, description: () => "Benching 1.5x your bodyweight is seriously strong." },
            { name: "2.0x BW", value: 2.0, description: () => "Benching double your bodyweight is elite." },
        ],
        getValue: (logs, program, bodyWeight) => {
            if (!bodyWeight || bodyWeight <= 0) return 0;
            const maxBench = getMaxE1RMFor(logs, 'bench');
            return maxBench / bodyWeight;
        }
    },
    bodyweight_squat: {
        name: "Squat Society",
        description: "Squat a multiple of your bodyweight.",
        icon: Weight,
        type: 'tiered',
        tiers: [
            { name: "1.5x BW", value: 1.5, description: () => "Squatting 1.5x your bodyweight." },
            { name: "2.0x BW", value: 2.0, description: () => "Squatting 2x your bodyweight. Strong foundation!" },
            { name: "2.5x BW", value: 2.5, description: () => "Squatting 2.5x your bodyweight. Powerful!" },
        ],
        getValue: (logs, program, bodyWeight) => {
            if (!bodyWeight || bodyWeight <= 0) return 0;
            const maxSquat = getMaxE1RMFor(logs, 'squat');
            return maxSquat / bodyWeight;
        }
    },
     bodyweight_deadlift: {
        name: "Deadlift Department",
        description: "Deadlift a multiple of your bodyweight.",
        icon: Weight,
        type: 'tiered',
        tiers: [
            { name: "2.0x BW", value: 2.0, description: () => "Deadlifting 2x your bodyweight." },
            { name: "2.5x BW", value: 2.5, description: () => "Deadlifting 2.5x your bodyweight. Powerful!" },
            { name: "3.0x BW", value: 3.0, description: () => "Deadlifting 3x your bodyweight. Incredible!" },
        ],
        getValue: (logs, program, bodyWeight) => {
            if (!bodyWeight || bodyWeight <= 0) return 0;
            const maxDeadlift = getMaxE1RMFor(logs, 'deadlift');
            return maxDeadlift / bodyWeight;
        }
    },
    overhead_overlord: {
        name: "Overhead Overlord",
        description: "Achieve new e1RM milestones in any overhead press variation.",
        icon: Trophy,
        type: 'tiered',
        tiers: [
            { name: "135 Club", value: 135, description: (v, u) => `Achieved an e1RM of ${formatWeight(v, u)} on overhead press.` },
            { name: "185 Club", value: 185, description: (v, u) => `Achieved an e1RM of ${formatWeight(v, u)} on overhead press.` },
            { name: "225 Club", value: 225, description: (v, u) => `Achieved an e1RM of ${formatWeight(v, u)} on overhead press.` },
        ],
        getValue: (logs, program) => {
            if (!program || !program.masterExerciseList) return 0;
            const ohpExercises = new Set(
                Object.keys(program.masterExerciseList).filter(exName => {
                    const details = program.masterExerciseList[exName];
                    return details?.muscles?.primary === 'Shoulders' && exName.toLowerCase().includes('press');
                })
            );

            if (ohpExercises.size === 0) return 0;

            const relevantLogs = Object.values(logs).filter(l => !l.skipped && l.exercise && ohpExercises.has(l.exercise));

            if (relevantLogs.length === 0) return 0;

            return Math.max(0, ...relevantLogs.map(l => calculateE1RM(l.load, l.reps, l.rir)));
        }
    },
    pull_up_pro: {
        name: "Pull-up Pro",
        description: "Complete a high number of strict pull-ups in a single set.",
        icon: Award,
        type: 'tiered',
        tiers: [
            { name: "10 Reps", value: 10, description: () => "Completed 10 strict pull-ups." },
            { name: "15 Reps", value: 15, description: () => "Completed 15 strict pull-ups." },
            { name: "20 Reps", value: 20, description: () => "Completed 20 strict pull-ups." },
        ],
        getValue: (logs) => {
            const pullupLogs = Object.values(logs).filter(l => !l.skipped && l.exercise.toLowerCase().includes('pull-up'));
            if (pullupLogs.length === 0) return 0;
            return Math.max(0, ...pullupLogs.map(l => parseInt(l.reps, 10)));
        }
    },
    workouts_completed: {
        name: "Workouts Completed",
        description: "Total number of workout sessions completed.",
        icon: CalendarDays,
        type: 'tiered',
        tiers: [
            { name: "10 Sessions", value: 10, description: () => "Completed 10 workouts." },
            { name: "50 Sessions", value: 50, description: () => "Completed 50 workouts. Keep it up!" },
            { name: "100 Sessions", value: 100, description: () => "Completed 100 workouts. Incredible dedication!" },
        ],
        getValue: (logs) => {
            const completedWorkouts = new Set(Object.values(logs).filter(l => !l.skipped).map(l => `${l.week}-${l.dayKey}`));
            return completedWorkouts.size;
        }
    },
    workout_streak: {
        name: "Workout Streak",
        description: "Number of consecutive scheduled workouts completed.",
        icon: Flame,
        type: 'tiered',
        tiers: [
            { name: "10 Streak", value: 10, description: () => "Completed 10 workouts in a row." },
            { name: "30 Streak", value: 30, description: () => "30 consecutive workouts. Unstoppable!" },
            { name: "50 Streak", value: 50, description: () => "50 consecutive workouts. Legendary!" },
        ],
        getValue: (logs, program) => calculateStreak(logs, program)
    },
    volume_volcano: {
        name: "Volume Volcano",
        description: "Set a new personal record for single-day lifting volume.",
        icon: TrendingUp,
        type: 'single',
        getValue: (logs, program) => {
            const dailyVolumes = Object.values(logs).reduce((acc, log) => {
                const day = `${log.week}-${log.dayKey}`;
                acc[day] = (acc[day] || 0) + getSetVolume(log, program.masterExerciseList);
                return acc;
            }, {});
            return Math.max(0, ...Object.values(dailyVolumes));
        }
    },
    weekly_avalanche: {
        name: "Weekly Avalanche",
        description: "Set a new personal record for weekly lifting volume.",
        icon: Zap,
        type: 'single',
        getValue: (logs, program) => {
            const weeklyVolumes = Object.values(logs).reduce((acc, log) => {
                acc[log.week] = (acc[log.week] || 0) + getSetVolume(log, program.masterExerciseList);
                return acc;
            }, {});
            return Math.max(0, ...Object.values(weeklyVolumes));
        }
    },
    rpe_honesty: {
        name: "RPE Honesty",
        description: "Record your Reps in Reserve (RIR) for a large number of sets.",
        icon: Shield,
        type: 'tiered',
        tiers: [
            { name: "50 Sets", value: 50, description: () => "Logged RIR for 50 sets." },
            { name: "150 Sets", value: 150, description: () => "Logged RIR for 150 sets." },
            { name: "300 Sets", value: 300, description: () => "Logged RIR for 300 sets." },
        ],
        getValue: (logs) => Object.values(logs).filter(l => l.rir !== undefined && l.rir !== null && l.rir !== '').length
    },
    meso_master: {
        name: "Meso Master",
        description: "Complete every single workout in a full mesocycle.",
        icon: Star,
        type: 'single',
        getValue: (logs, program) => {
            if (!program || !program.info) return 0;
            const { info, weeklySchedule, workoutOrder, settings } = program;
            const totalWorkouts = settings.useWeeklySchedule
                ? info.weeks * weeklySchedule.filter(d => d.workout !== 'Rest').length
                : info.weeks * workoutOrder.length;

            const completedWorkouts = new Set(Object.values(logs).filter(l => !l.skipped).map(l => `${l.week}-${l.dayKey}`));
            return completedWorkouts.size >= totalWorkouts ? 1 : 0;
        }
    },
    the_architect: {
        name: "The Architect",
        description: "Create a custom exercise in the program editor.",
        icon: Pencil,
        type: 'single',
        getValue: (logs, program) => {
            const presetExercises = new Set(Object.keys(exerciseBank));
            const customExercises = Object.keys(program.masterExerciseList).filter(ex => !presetExercises.has(ex));
            return customExercises.length > 0 ? 1 : 0;
        }
    }
};

const AchievementCard = ({ achievementId, achievement, unlockedStatus, currentValue, weightUnit, onClick }) => {
    // ROBUSTNESS FIX: Add a strong guard clause to prevent rendering with invalid data.
    if (!achievement || typeof achievement !== 'object' || !achievement.name || !achievement.icon) {
        return null;
    }

    const { icon: Icon } = achievement;
    let isUnlocked = false;
    let displayName = achievement.name;
    let tierName = null;
    let nextTier = null;
    let progressPercentage = 0;

    if (achievement.type === 'tiered') {
        const unlockedTierIndex = unlockedStatus; // Can be undefined, -1, or a number
        if (unlockedTierIndex !== undefined && unlockedTierIndex > -1) {
            isUnlocked = true;
            const currentTier = achievement.tiers[unlockedTierIndex];
            tierName = currentTier.name;
            displayName = `${achievement.name} - ${tierName}`;
            if (unlockedTierIndex < achievement.tiers.length - 1) {
                nextTier = achievement.tiers[unlockedTierIndex + 1];
                const prevTierValue = unlockedTierIndex > 0 ? achievement.tiers[unlockedTierIndex - 1].value : 0;
                const range = nextTier.value - prevTierValue;
                progressPercentage = range > 0 ? Math.min(100, ((currentValue - prevTierValue) / range) * 100) : (currentValue >= nextTier.value ? 100 : 0);
            } else {
                progressPercentage = 100;
            }
        } else { // Not unlocked any tiers yet
            nextTier = achievement.tiers[0];
            progressPercentage = nextTier.value > 0 ? Math.min(100, (currentValue / nextTier.value) * 100) : (currentValue >= nextTier.value ? 100 : 0);
        }
    } else {
        isUnlocked = !!unlockedStatus;
        progressPercentage = isUnlocked ? 100 : 0;
    }
    
    const colorKey = tierName ? tierName.toLowerCase().split(' ')[0] : 'default';
    const colorScheme = {
        'bronze': { bg: 'bg-amber-100 dark:bg-amber-900/50', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-400', progress: 'bg-amber-500' },
        'silver': { bg: 'bg-slate-100 dark:bg-slate-800/50', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-400', progress: 'bg-slate-500' },
        'gold': { bg: 'bg-yellow-100 dark:bg-yellow-900/50', text: 'text-yellow-500 dark:text-yellow-400', border: 'border-yellow-500', progress: 'bg-yellow-500' },
        'platinum': { bg: 'bg-cyan-100 dark:bg-cyan-900/50', text: 'text-cyan-500 dark:text-cyan-400', border: 'border-cyan-400', progress: 'bg-cyan-500' },
        'diamond': { bg: 'bg-violet-100 dark:bg-violet-900/50', text: 'text-violet-500 dark:text-violet-400', border: 'border-violet-400', progress: 'bg-violet-500' },
        '1.0x': { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-600 dark:text-green-400', border: 'border-green-400', progress: 'bg-green-500' },
        '1.5x': { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-400', progress: 'bg-blue-500' },
        '2.0x': { bg: 'bg-indigo-100 dark:bg-indigo-900/50', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-400', progress: 'bg-indigo-500' },
        '2.5x': { bg: 'bg-purple-100 dark:bg-purple-900/50', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-400', progress: 'bg-purple-500' },
        '3.0x': { bg: 'bg-pink-100 dark:bg-pink-900/50', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-400', progress: 'bg-pink-500' },
        'two': { bg: 'bg-red-100 dark:bg-red-800/50', text: 'text-red-500', border: 'border-red-500', progress: 'bg-red-500'},
        'three': { bg: 'bg-blue-100 dark:bg-blue-800/50', text: 'text-blue-500', border: 'border-blue-500', progress: 'bg-blue-500'},
        'four': { bg: 'bg-green-100 dark:bg-green-800/50', text: 'text-green-500', border: 'border-green-500', progress: 'bg-green-500'},
        'five': { bg: 'bg-yellow-100 dark:bg-yellow-800/50', text: 'text-yellow-500', border: 'border-yellow-500', progress: 'bg-yellow-500'},
        '135': { bg: 'bg-gray-100 dark:bg-gray-800/50', text: 'text-gray-500', border: 'border-gray-500', progress: 'bg-gray-500'},
        '185': { bg: 'bg-red-100 dark:bg-red-800/50', text: 'text-red-500', border: 'border-red-500', progress: 'bg-red-500'},
        '225': { bg: 'bg-blue-100 dark:bg-blue-800/50', text: 'text-blue-500', border: 'border-blue-500', progress: 'bg-blue-500'},
        'default': { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500', border: 'border-transparent', progress: 'bg-blue-500' }
    }[colorKey] || { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500', border: 'border-transparent', progress: 'bg-blue-500' };

    const cardClasses = `p-4 rounded-xl flex flex-col items-center justify-center text-center aspect-square transition-all duration-300 ${isUnlocked ? `${colorScheme.bg} border-2 ${colorScheme.border} shadow-lg` : 'bg-gray-100 dark:bg-gray-800 filter grayscale opacity-60 hover:opacity-100'}`;
    const iconClasses = isUnlocked ? colorScheme.text : 'text-gray-500';
    const textClasses = isUnlocked ? 'text-gray-800 dark:text-gray-200' : 'text-gray-600 dark:text-gray-400';

    return (
        <button onClick={(e) => onClick(e, achievementId)} className={cardClasses}>
            <div className="flex flex-col items-center justify-center flex-grow">
                <Icon size={36} className={iconClasses} />
                <h3 className={`mt-2 font-bold text-sm ${textClasses}`}>{displayName}</h3>
            </div>
            {(nextTier) && (
                 <div className="w-full mt-2 self-end">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div className={`${isUnlocked ? colorScheme.progress : 'bg-blue-500'} h-1.5 rounded-full`} style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatWeight(currentValue, weightUnit, false)} / {formatWeight(nextTier.value, weightUnit, false)}
                    </p>
                </div>
            )}
        </button>
    );
};

const AchievementsView = ({ unlockedAchievements, historicalLogs, programData, bodyWeight, weightUnit, onBack }) => {
    const { openModal, closeModal } = useContext(AppStateContext);

    const processedAchievements = useMemo(() => {
        if (!programData || !historicalLogs) return [];
        
        return Object.entries(achievementsList)
            .filter(([id, achievement]) => achievement && typeof achievement === 'object' && achievement.name && achievement.getValue)
            .map(([id, achievement]) => {
                const currentValue = achievement.getValue(historicalLogs, programData, parseFloat(bodyWeight) || 0);
                const unlockedStatus = unlockedAchievements[id];
                return { id, achievement, currentValue, unlockedStatus };
            });
    }, [historicalLogs, programData, bodyWeight, unlockedAchievements]);
    
    const handleShowDescription = (e, achievementId) => {
        e.preventDefault();
        const achievementData = processedAchievements.find(a => a.id === achievementId);
        if (!achievementData || !achievementData.achievement) {
            console.error("Could not find achievement data for ID:", achievementId);
            return;
        }

        const { achievement, unlockedStatus } = achievementData;
        const Icon = achievement.icon;
        
        openModal(
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <Icon size={32} className={'text-yellow-500'} />
                    <h2 className="text-xl font-bold">{achievement.name}</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{achievement.description}</p>
                {achievement.type === 'tiered' && (
                    <div className="space-y-2">
                        <h3 className="font-semibold">Tiers:</h3>
                        {achievement.tiers.map((tier, index) => (
                            <div key={tier.name} className={`flex items-center gap-3 p-2 rounded-md ${unlockedStatus >= index ? 'bg-green-100 dark:bg-green-900/50' : 'bg-gray-100 dark:bg-gray-700/50'}`}>
                                <CheckCircle size={20} className={unlockedStatus >= index ? 'text-green-500' : 'text-gray-400'} />
                                <div>
                                    <p className="font-bold">{tier.name} ({formatWeight(tier.value, weightUnit)})</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{tier.description(tier.value, weightUnit)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex justify-end mt-6">
                    <button onClick={closeModal} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Close</button>
                </div>
            </div>,
            'lg'
        );
    };

    return (
        <div className="p-4 md:p-6 pb-24">
            <div className="flex flex-col items-center text-center mb-6">
                <div className="flex justify-center items-center">
                    <Award className="text-yellow-500 dark:text-yellow-400 mr-2" size={32} />
                    <h1 className="text-3xl font-bold dark:text-white">Achievements</h1>
                </div>
            </div>
            {Object.keys(historicalLogs).length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {processedAchievements.map(({ id, achievement, currentValue, unlockedStatus }) => (
                        <AchievementCard 
                            key={id}
                            achievementId={id}
                            achievement={achievement}
                            unlockedStatus={unlockedStatus}
                            currentValue={currentValue}
                            weightUnit={weightUnit}
                            onClick={handleShowDescription}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                    <Award size={48} className="mx-auto text-gray-400 dark:text-gray-500" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">No Achievements Yet</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Start logging your workouts to unlock achievements and track your progress!</p>
                </div>
            )}
        </div>
    );
};


// --- App Structure & Routing Components (Corrected Order) ---

const WingIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor: '#22c55e', stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: '#3b82f6', stopOpacity: 1}} />
        </linearGradient>
      </defs>
      <path d="M85.6,25.8c-3.5-3.4-7.2-6.2-11.1-8.4c-5-2.8-10.3-4.4-15.7-4.4c-4.9,0-9.6,1.2-14,3.5c-4.4,2.3-8.3,5.6-11.6,9.6c-2.8,3.4-5.1,7.3-6.7,11.5c-1.7,4.2-2.5,8.7-2.5,13.2c0,5.1,1,10.1,2.9,14.8c1.9,4.7,4.8,9,8.4,12.7c3.7,3.7,8.1,6.7,13,8.9c4.9,2.2,10.2,3.3,15.5,3.3c5.7,0,11.1-1.4,16.2-4.1c5.1-2.7,9.6-6.5,13.5-11.2l-15.9-14.3c-2.3,2.8-5.2,4.8-8.4,5.9c-3.2,1.1-6.6,1.7-10,1.7c-4.2,0-8.2-1-11.9-2.9c-3.7-1.9-6.8-4.7-9.2-8.1c-2.4-3.4-3.9-7.4-4.2-11.6c-0.4-4.2,0.5-8.4,2.4-12.2c1.9-3.8,4.8-7,8.4-9.4c3.6-2.4,7.8-3.8,12.1-3.8c4.2,0,8.2,1.2,11.8,3.5c3.6,2.3,6.7,5.4,9.2,9.1l15.9-14.3Z" fill="url(#wingGradient)"/>
    </svg>
);

const AppHeader = ({ programName, onNavChange }) => {
    const { setSidebarOpen } = useContext(AppStateContext);
    return (
        <header className="bg-white dark:bg-gray-800/80 backdrop-blur-sm shadow-sm sticky top-0 z-40 p-4 flex justify-between items-center">
            <button onClick={() => setSidebarOpen(true)} className="p-2 md:hidden">
                <Menu />
            </button>
             <div className="flex-1 flex justify-center">
                <button onClick={() => onNavChange('main')} className="flex items-center gap-2">
                     <WingIcon className="w-8 h-8" />
                     <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-600">Project Overload</h1>
                </button>
            </div>
            <div className="w-8 md:invisible"></div> {/* Placeholder for balance */}
        </header>
    );
};

const Sidebar = ({ onNavChange, currentPage }) => {
    const { isSidebarOpen, setSidebarOpen } = useContext(AppStateContext);
    const navItems = [
        { label: 'Program', view: 'main', icon: Dumbbell },
        { label: 'Dashboard', view: 'dashboard', icon: LayoutDashboard },
        { label: 'Analytics', view: 'analytics', icon: BarChart2 },
        { label: 'Achievements', view: 'achievements', icon: Award },
        { label: 'Records', view: 'records', icon: Trophy },
        { label: 'Program Hub', view: 'programHub', icon: BookOpen },
        { label: 'Edit Program', view: 'editProgram', icon: Edit },
        { label: 'App Settings', view: 'settings', icon: Settings },
    ];

    return (
        <>
            <div className={`fixed inset-0 bg-black/60 z-40 transition-opacity md:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setSidebarOpen(false)}></div>
            <div className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg z-50 transform transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                    <h2 className="font-bold text-lg">Menu</h2>
                    <button onClick={() => setSidebarOpen(false)} className="p-2 md:hidden"><X /></button>
                </div>
                <nav className="p-4">
                    <ul className="space-y-2">
                        {navItems.map(item => (
                            <li key={item.view}>
                                <button 
                                    onClick={() => {
                                        onNavChange(item.view);
                                        setSidebarOpen(false);
                                    }} 
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${currentPage === item.view ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                >
                                    <item.icon size={20} />
                                    <span>{item.label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </>
    );
};

const Modal = () => {
    const { modalContent, closeModal } = useContext(AppStateContext);
    if (!modalContent) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
    };
    
    const modalSize = sizeClasses[modalContent.size] || sizeClasses.md;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60] p-4" onClick={closeModal}>
            <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full ${modalSize}`} onClick={e => e.stopPropagation()}>
                <div className="flex justify-end -mt-2 -mr-2">
                    <button onClick={closeModal} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><X size={20} /></button>
                </div>
                <div className="mt-2">
                    {modalContent.content}
                </div>
            </div>
        </div>
    );
};

const Toast = ({ message, level }) => {
    const levelStyles = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        bronze: 'bg-amber-600 text-white',
        silver: 'bg-slate-500 text-white',
        gold: 'bg-yellow-500 text-black',
        platinum: 'bg-cyan-400 text-black',
        pro: 'bg-teal-500 text-white',
        elite: 'bg-emerald-500 text-white',
        master: 'bg-lime-400 text-black',
    };
    const style = levelStyles[level] || levelStyles.success;
    return (
        <div className={`px-4 py-2 rounded-lg shadow-lg animate-fade-in-up ${style}`}>
            {message}
        </div>
    );
};

const ToastContainer = () => {
    const { toasts } = useContext(AppStateContext);
    return (
        <div className="fixed bottom-4 right-4 z-[100] space-y-2">
            {toasts.map(toast => (
                <Toast key={toast.id} message={toast.message} level={toast.level} />
            ))}
        </div>
    );
};

const AppCore = () => {
    const [pageState, setPageState] = useState({ view: 'main', data: {} });
    const [programInstances, setProgramInstances] = useState([]);
    const [activeInstanceId, setActiveInstanceId] = useState(null);
    const [allLogs, setAllLogs] = useState({});
    const [archivedLogs, setArchivedLogs] = useState([]);
    const [skippedDays, setSkippedDays] = useState({});
    const [weightUnit, setWeightUnit] = useState('lbs');
    const [bodyWeight, setBodyWeight] = useState('');
    const [bodyWeightHistory, setBodyWeightHistory] = useState([]);
    const { user, db, isLoading, customId, handleSetCustomId } = useContext(FirebaseContext);
    const { setTheme } = useContext(ThemeContext);
    const { openModal, closeModal, addToast } = useContext(AppStateContext);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [activeTimer, setActiveTimer] = useState(null);
    const [unlockedAchievements, setUnlockedAchievements] = useState({});

    const programData = useMemo(() => {
        if (!activeInstanceId || programInstances.length === 0) {
            return presets['optimal-ppl-ul'];
        }
        const activeInstance = programInstances.find(p => p.id === activeInstanceId);
        return activeInstance ? activeInstance.program : presets['optimal-ppl-ul'];
    }, [activeInstanceId, programInstances]);

    const handleUpdateAndSave = useCallback((updates) => {
        if (db && customId) {
            const userDocRef = doc(db, 'workoutLogs', customId);
            updateDoc(userDocRef, updates);
        }
    }, [db, customId]);

    const handleProgramDataChange = useCallback((newProgramData) => {
        setProgramInstances(prevInstances => {
            const newInstances = prevInstances.map(p => {
                if (p.id === activeInstanceId) {
                    return { ...p, program: newProgramData, lastModified: new Date().toISOString() };
                }
                return p;
            });
            handleUpdateAndSave({ programInstances: newInstances });
            return newInstances;
        });
    }, [activeInstanceId, handleUpdateAndSave]);

    const handleProgramUpdate = useCallback((newProgramTemplate) => {
        const newInstance = {
            id: crypto.randomUUID(),
            program: { ...newProgramTemplate, weeklyOverrides: {} },
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };
        setProgramInstances(prevInstances => {
            const newInstances = [...prevInstances, newInstance];
            // BUG FIX: DO NOT CLEAR LOGS. Only update program instances.
            // Logs are persistent per user, not per program.
            handleUpdateAndSave({ 
                programInstances: newInstances, 
                activeInstanceId: newInstance.id, 
            });
            return newInstances;
        });
        setActiveInstanceId(newInstance.id);
        addToast(`Program "${newInstance.program.name}" loaded!`, "success");
        navigate('main');
    }, [handleUpdateAndSave, addToast]);
    
    const handleInstanceSwitch = (instanceId) => {
        setActiveInstanceId(instanceId);
        handleUpdateAndSave({ activeInstanceId: instanceId });
        addToast("Switched program!", "success");
    }

    const handleBodyWeightChange = useCallback((newWeight, save = false) => {
        setBodyWeight(newWeight);
        if (save) {
            const weightValue = parseFloat(newWeight);
            if (!isNaN(weightValue) && weightValue > 0) {
                const newEntry = { weight: weightValue, date: new Date().toISOString() };
                setBodyWeightHistory(prevHistory => {
                    const newHistory = [...prevHistory, newEntry];
                    handleUpdateAndSave({ bodyWeight: weightValue.toString(), bodyWeightHistory: newHistory });
                    addToast("Weight logged successfully!", "success");
                    return newHistory;
                });
            } else {
                addToast("Invalid weight value.", "error");
            }
        }
    }, [handleUpdateAndSave, addToast]);
    
    const showTutorial = useCallback(() => {
        openModal(
            <TutorialModal 
                onClose={closeModal} 
                onProgramSelect={handleProgramUpdate}
                onBodyWeightSet={handleBodyWeightChange}
                onSetSyncId={handleSetCustomId}
            />, 
            'lg'
        );
    }, [openModal, closeModal, handleProgramUpdate, handleBodyWeightChange, handleSetCustomId]);

    useEffect(() => {
        if (!user || !db) {
            if (!isLoading) setIsDataLoading(false);
            return;
        }
        if (!customId) {
            setIsDataLoading(false);
            showTutorial();
            return;
        }

        setIsDataLoading(true);
        const userDocRef = doc(db, 'workoutLogs', customId);
        const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setAllLogs(data.logs || {});
                setArchivedLogs(data.archivedLogs || []);
                setSkippedDays(data.skippedDays || {});
                setTheme(data.theme || 'dark');
                setWeightUnit(data.weightUnit || 'lbs');
                setBodyWeight(data.bodyWeight || '');
                setBodyWeightHistory(data.bodyWeightHistory || []);
                setUnlockedAchievements(data.unlockedAchievements || {});

                // Migration for program instances
                if (data.programInstances && data.activeInstanceId) {
                    setProgramInstances(data.programInstances);
                    setActiveInstanceId(data.activeInstanceId);
                } else {
                    // One-time migration from old data structure
                    const defaultProgram = presets['optimal-ppl-ul'];
                     const loadedProgram = {
                        name: data.name || defaultProgram.name,
                        info: data.info || defaultProgram.info,
                        masterExerciseList: data.masterExerciseList || defaultProgram.masterExerciseList,
                        programStructure: data.programStructure || defaultProgram.programStructure,
                        weeklySchedule: data.weeklySchedule || defaultProgram.weeklySchedule,
                        workoutOrder: data.workoutOrder || defaultProgram.workoutOrder,
                        settings: { ...defaultProgram.settings, ...data.settings },
                        weeklyOverrides: data.weeklyOverrides || {},
                    };
                    const initialInstance = {
                        id: crypto.randomUUID(),
                        program: loadedProgram,
                        createdAt: new Date().toISOString(),
                        lastModified: new Date().toISOString()
                    };
                    setProgramInstances([initialInstance]);
                    setActiveInstanceId(initialInstance.id);
                    // Save the new structure
                    handleUpdateAndSave({ programInstances: [initialInstance], activeInstanceId: initialInstance.id });
                }
            } else { 
                const firstProgram = presets['optimal-ppl-ul'];
                const firstInstance = {
                    id: crypto.randomUUID(),
                    program: firstProgram,
                    createdAt: new Date().toISOString(),
                    lastModified: new Date().toISOString()
                };
                const initialData = {
                    programInstances: [firstInstance],
                    activeInstanceId: firstInstance.id,
                    logs: {}, 
                    skippedDays: {}, 
                    theme: 'dark', 
                    weightUnit: 'lbs',
                    bodyWeight: '',
                    bodyWeightHistory: [],
                    archivedLogs: [],
                    unlockedAchievements: {},
                    hasSeenTutorial: true 
                };
                setDoc(userDocRef, initialData);
            }
            setIsDataLoading(false);
        }, (error) => {
            console.error("Error fetching data from Firestore:", error);
            setIsDataLoading(false);
        });
        return () => unsubscribe();
    }, [user, db, customId, setTheme, isLoading, handleUpdateAndSave, showTutorial]);

    const historicalLogs = useMemo(() => {
        const combined = { ...allLogs };
        archivedLogs.forEach(archive => {
            Object.assign(combined, archive.logs); // assuming archive is {logs: {...}}
        });
        return combined;
    }, [allLogs, archivedLogs]);

    // Achievement checking
    useEffect(() => {
        if (isDataLoading) return;

        const verifyAchievements = () => {
            const newUnlocks = {};
            let achievementsChanged = false;

            Object.entries(achievementsList).forEach(([id, achievement]) => {
                const currentValue = achievement.getValue
                    ? achievement.getValue(historicalLogs, programData, parseFloat(bodyWeight) || 0)
                    : 0;
                const oldTier = unlockedAchievements[id] ?? -1;
                let newTier = -1;

                if (achievement.type === 'tiered') {
                    achievement.tiers.forEach((tier, index) => {
                        if (currentValue >= tier.value) {
                            newTier = index;
                        }
                    });
                } else { // Single-tier
                    newTier = currentValue >= 1 ? 0 : -1;
                }

                if (newTier !== oldTier) {
                    achievementsChanged = true;
                    if (newTier > oldTier) {
                        if (achievement.type === 'tiered') {
                            const tier = achievement.tiers[newTier];
                            addToast(`Achievement: ${achievement.name} - ${tier.name}!`, tier.name.toLowerCase());
                        } else {
                            addToast(`Achievement: ${achievement.name}!`, 'success');
                        }
                    }
                }
                if (newTier > -1) {
                    newUnlocks[id] = newTier;
                }
            });

            if (achievementsChanged) {
                setUnlockedAchievements(newUnlocks);
                handleUpdateAndSave({ unlockedAchievements: newUnlocks });
            }
        };

        verifyAchievements();
    }, [isDataLoading, historicalLogs, programData, bodyWeight, addToast, unlockedAchievements, handleUpdateAndSave]);

    const navigate = (view, data = {}) => {
        setPageState({ view, data });
    };

    const handleWeightUnitChange = (newUnit) => {
        setWeightUnit(newUnit);
        handleUpdateAndSave({ weightUnit: newUnit });
    };

    const handleSkipDay = (week, dayKey) => {
        const skipKey = `${week}-${dayKey}`;
        const newSkippedDays = { ...skippedDays, [skipKey]: true };
        setSkippedDays(newSkippedDays);
        handleUpdateAndSave({ skippedDays: newSkippedDays });
        navigate('main');
    };

    const handleUnskipDay = (week, dayKey) => {
        const skipKey = `${week}-${dayKey}`;
        const newSkippedDays = { ...skippedDays };
        delete newSkippedDays[skipKey];
        setSkippedDays(newSkippedDays);
        handleUpdateAndSave({ skippedDays: newSkippedDays });
    };

    const handleResetMeso = () => {
        if (db && customId && Object.keys(allLogs).length > 0) {
            const userDocRef = doc(db, 'workoutLogs', customId);
            updateDoc(userDocRef, {
                archivedLogs: arrayUnion({ logs: allLogs, date: new Date().toISOString(), programName: programData.name }),
                logs: {},
                skippedDays: {},
            });
             // Also clear overrides in the active instance
            const newProgramData = { ...programData, weeklyOverrides: {} };
            handleProgramDataChange(newProgramData);

        } else if (db && customId) {
            // Handle case where there are no logs to archive.
            updateDoc(doc(db, 'workoutLogs', customId), { logs: {}, skippedDays: {} });
        }
    };

    const handleRestoreLogs = useCallback((csvData) => {
        if (!csvData) {
            addToast('The selected file is empty.', 'error');
            return;
        }

        try {
            const lines = csvData.trim().split('\n');
            if (lines.length < 2) {
                throw new Error("CSV is empty or has only a header.");
            }
            const headers = lines[0].split(',').map(h => h.trim());

            const requiredHeaders = ['Week', 'Day', 'Exercise', 'Set', 'Load (lbs)', 'Reps'];
            if (!requiredHeaders.every(h => headers.includes(h))) {
                throw new Error("Invalid CSV format. Missing required headers like 'Week', 'Day', 'Exercise', etc.");
            }

            const newLogs = {};
            lines.slice(1).forEach((line, index) => {
                const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g).map(v => v.replace(/"/g, ''));

                const logData = headers.reduce((obj, header, i) => {
                    obj[header] = values[i] ? values[i].trim() : '';
                    return obj;
                }, {});

                const { Week, Day, Exercise, Set } = logData;
                if (!Week || !Day || !Exercise || !Set) {
                    console.warn(`Skipping invalid row ${index + 2} in CSV.`);
                    return;
                }

                const logId = `${Week}-${Day}-${Exercise}-${Set}`;

                newLogs[logId] = {
                    week: parseInt(Week, 10),
                    dayKey: Day,
                    session: logData['Session'] || 'Restored Session',
                    exercise: Exercise,
                    set: parseInt(Set, 10),
                    load: parseFloat(logData['Load (lbs)']),
                    reps: logData['Reps'],
                    rir: logData['RIR'] || '',
                    date: new Date().toISOString(),
                };
            });

            if (Object.keys(newLogs).length === 0) {
                throw new Error("No valid log entries found in the CSV file.");
            }

            openModal(
                <div>
                    <h2 className="text-xl font-bold mb-4">Confirm Restore</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        This will replace all your current workout logs with the data from the CSV file.
                        Found {Object.keys(newLogs).length} log entries to restore. This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-2 mt-6">
                        <button onClick={closeModal} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg">Cancel</button>
                        <button onClick={() => {
                            setAllLogs(newLogs);
                            handleUpdateAndSave({ logs: newLogs });
                            addToast('Data restored successfully!', 'success');
                            closeModal();
                        }} className="px-4 py-2 bg-red-600 text-white rounded-lg">Confirm & Restore</button>
                    </div>
                </div>
            );

        } catch (error) {
            console.error("Error restoring from CSV:", error);
            addToast(`Import Failed: ${error.message}`, 'error');
        }
    }, [openModal, closeModal, addToast, handleUpdateAndSave]);

    const handleTimerEnd = useCallback(() => {
        setActiveTimer(null);
         openModal(
            <div>
                <h2 className="text-xl font-bold mb-4">Time's Up!</h2>
                <p className="text-gray-600 dark:text-gray-400">Your rest is over. Time to hit the next set!</p>
                <div className="flex justify-end gap-2 mt-6">
                    <button onClick={closeModal} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Let's Go!</button>
                </div>
            </div>
        );
    }, [openModal, closeModal]);

    const handleStartTimer = () => {
        if (programData.settings.restTimer.enabled) {
            setActiveTimer(programData.settings.restTimer.duration);
        }
    };
    
    const completedDays = useMemo(() => {
        const status = new Map();
        if (!programData || !programData.info) return status;

        for (let week = 1; week <= programData.info.weeks; week++) {
            programData.weeklySchedule.forEach(day => {
                const dayKey = `${week}-${day.day}`;
                const workoutName = getWorkoutNameForDay(programData, week, day.day);
                const workout = getWorkoutForWeek(programData, week, workoutName);
                const isSkipped = !!skippedDays[dayKey];
                
                if (!workout || workoutName === 'Rest') {
                    status.set(dayKey, { isDayComplete: true, isSkipped: false });
                    return;
                }

                const isDayComplete = workout.exercises.every(exName => {
                    const exDetails = getExerciseDetails(exName, programData.masterExerciseList);
                    if (!exDetails) return false;
                    return Array.from({ length: Number(exDetails.sets) }, (_, i) => i + 1).every(setNum => {
                        const log = allLogs[`${dayKey}-${exName}-${setNum}`];
                        return isSetLogComplete(log);
                    });
                });
                status.set(dayKey, { isDayComplete, isSkipped });
            });
        }
        return status;
    }, [allLogs, skippedDays, programData]);

    if (isLoading || isDataLoading) {
        return (
            <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex justify-center items-center">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 dark:text-gray-300 mt-4">Loading Your Program...</p>
                </div>
            </div>
        );
    }
    
    const onBack = () => navigate('main');

    const renderContent = () => {
        if (!customId) {
             return <div/>;
        }
        switch(pageState.view) {
            case 'dashboard': return <DashboardView allLogs={allLogs} programData={programData} bodyWeightHistory={bodyWeightHistory} onBack={onBack} />;
            case 'lifting': return <LiftingSession {...pageState.data} onBack={onBack} allLogs={allLogs} setAllLogs={setAllLogs} onSkipDay={handleSkipDay} programData={programData} weightUnit={weightUnit} onStartTimer={handleStartTimer} />;
            case 'analytics': return <AnalyticsView allLogs={historicalLogs} programData={programData} onBack={onBack} />;
            case 'records': return <RecordsView allLogs={historicalLogs} onBack={onBack} />;
            case 'achievements': return <AchievementsView unlockedAchievements={unlockedAchievements} historicalLogs={historicalLogs} programData={programData} bodyWeight={bodyWeight} weightUnit={weightUnit} onBack={onBack} />;
            case 'programHub': return <ProgramManagerView onProgramUpdate={handleProgramUpdate} activeProgram={{...programData, id: activeInstanceId}} programInstances={programInstances} onInstanceSwitch={handleInstanceSwitch} onBack={onBack} />;
            case 'editProgram': return <EditProgramView programData={programData} onProgramDataChange={handleProgramDataChange} onBack={onBack} onNavigate={navigate} />;
            case 'editWeek': return <EditWeekView {...pageState.data} programData={programData} onProgramDataChange={handleProgramDataChange} onBack={() => navigate(pageState.data.backTo || 'editProgram')} />;
            case 'settings': return <SettingsView allLogs={allLogs} historicalLogs={historicalLogs} weightUnit={weightUnit} onWeightUnitChange={handleWeightUnitChange} onResetMeso={handleResetMeso} programData={programData} onProgramDataChange={handleProgramDataChange} onShowTutorial={showTutorial} bodyWeight={bodyWeight} onBodyWeightChange={handleBodyWeightChange} onBack={onBack} onRestoreLogs={handleRestoreLogs} />;
            default: return <MainView onSessionSelect={(week, day, type, seqIndex) => navigate(type, { week, dayKey: day, sequentialWorkoutIndex: seqIndex })} onEditProgram={() => navigate('editProgram')} completedDays={completedDays} onUnskipDay={handleUnskipDay} programData={programData} allLogs={allLogs} onNavigate={navigate} />;
        }
    };

    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen font-sans text-gray-900 dark:text-gray-100">
            <div className="md:pl-64">
                <AppHeader programName={programData.info.name} onNavChange={navigate} />
                 <main className="flex-grow">
                    <div className="container mx-auto max-w-4xl">{renderContent()}</div>
                </main>
            </div>
            <Sidebar onNavChange={navigate} currentPage={pageState.view} />
             <Modal />
             {activeTimer && <RestTimer initialTime={activeTimer} onClose={() => setActiveTimer(null)} onTimerEnd={handleTimerEnd} />}
             <ToastContainer />
        </div>
    );
}

function App() {
  return (
    <FirebaseProvider>
        <AppStateProvider>
            <ThemeProvider>
                <AppCore />
            </ThemeProvider>
        </AppStateProvider>
    </FirebaseProvider>
  );
}

export default App;
