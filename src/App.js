import React, { useState, useEffect, useMemo, createContext, useContext, useCallback, useRef } from 'react';
import { ChevronDown, ChevronUp, Dumbbell, CheckCircle, ArrowLeft, BarChart2, Settings, Flame, Repeat, StretchVertical, Lightbulb, Download, XCircle, SkipForward, Menu, X, Search, Trophy, BrainCircuit, PlusCircle, Edit, ArrowUp, ArrowDown, LayoutDashboard, Save, AlertTriangle, Bell, HelpCircle, BookOpen, Star, Award, TrendingUp, Target, Zap, CalendarDays, Shield, Infinity as InfinityIcon, Weight, Upload, Eye, Timer, Pencil } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Firebase Imports - using modular v9+ syntax
import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";


// --- PRESET PROGRAM DATA ---
const presets = {
    "optimal-ppl-ul": {
        name: "Optimal PPL-UL",
        info: { name: "Project Overload", weeks: 8, split: "Pull/Push/Legs/Rest/Upper/Lower" },
        masterExerciseList: {
            'Incline DB Press': { sets: 2, reps: '5-7', rir: ['0', '0'], rest: '2-3 min', equipment: 'dumbbell', muscles: { primary: 'Chest', secondary: 'Shoulders', tertiary: null, primaryContribution: 1, secondaryContribution: 0.5, tertiaryContribution: 0 } },
            'Barbell Bench Press': { sets: 2, reps: '5-7', rir: ['0', '0'], rest: '2-3 min', equipment: 'barbell', muscles: { primary: 'Chest', secondary: 'Triceps', tertiary: null, primaryContribution: 1, secondaryContribution: 0.5, tertiaryContribution: 0 } },
            'Pullups': { sets: 4, reps: '5-7', rir: ['0', '0', '0', '0'], rest: '2-3 min', equipment: 'bodyweight', muscles: { primary: 'Back', secondary: 'Biceps', tertiary: null, primaryContribution: 1, secondaryContribution: 0.5, tertiaryContribution: 0 } },
            'DB Lateral Raise': { sets: 3, reps: '8-10', rir: ['0', '0', '0'], rest: '1-2 min', equipment: 'dumbbell', muscles: { primary: 'Shoulders', secondary: null, tertiary: null, primaryContribution: 1, secondaryContribution: 0, tertiaryContribution: 0 } },
            'Bayesian Cable Curl': { sets: 3, reps: '6-8', rir: ['0', '0', '0'], rest: '1-2 min', equipment: 'machine', muscles: { primary: 'Biceps', secondary: null, tertiary: null, primaryContribution: 1, secondaryContribution: 0, tertiaryContribution: 0 } },
            'Overhead Triceps Extension': { sets: 3, reps: '6-8', rir: ['0', '0', '0'], rest: '1-2 min', equipment: 'machine', muscles: { primary: 'Triceps', secondary: null, tertiary: null, primaryContribution: 1, secondaryContribution: 0, tertiaryContribution: 0 } },
            'Smith Machine Squat': { sets: 2, reps: '5-7', rir: ['0', '0'], rest: '2-3 min', equipment: 'machine', muscles: { primary: 'Quads', secondary: 'Glutes', tertiary: null, primaryContribution: 1, secondaryContribution: 0.5, tertiaryContribution: 0 } },
            'Hack Squat': { sets: 2, reps: '5-7', rir: ['0', '0'], rest: '2-3 min', equipment: 'machine', muscles: { primary: 'Quads', secondary: 'Glutes', tertiary: null, primaryContribution: 1, secondaryContribution: 0.5, tertiaryContribution: 0 } },
            'Lying Leg Curl': { sets: 3, reps: '5-7', rir: ['0', '0', '0'], rest: '1-2 min', equipment: 'machine', muscles: { primary: 'Hamstrings', secondary: null, tertiary: null, primaryContribution: 1, secondaryContribution: 0, tertiaryContribution: 0 } },
            'Leg Extensions': { sets: 3, reps: '5-7', rir: ['0', '0', '0'], rest: '1-2 min', equipment: 'machine', muscles: { primary: 'Quads', secondary: null, tertiary: null, primaryContribution: 1, secondaryContribution: 0, tertiaryContribution: 0 } },
            'Standing Calf Raise': { sets: 4, reps: '5-7', rir: ['0', '0', '0', '0'], rest: '1 min', equipment: 'machine', muscles: { primary: 'Calves', secondary: null, tertiary: null, primaryContribution: 1, secondaryContribution: 0, tertiaryContribution: 0 } },
            'Cable Crunch': { sets: 3, reps: '10-12', rir: ['0', '0', '0'], rest: '1 min', equipment: 'machine', muscles: { primary: 'Abs', secondary: null, tertiary: null, primaryContribution: 1, secondaryContribution: 0, tertiaryContribution: 0 } },
            'Chest Supported Row': { sets: 4, reps: '5-7', rir: ['0', '0', '0', '0'], rest: '2-3 min', equipment: 'machine', muscles: { primary: 'Back', secondary: 'Biceps', tertiary: null, primaryContribution: 1, secondaryContribution: 0.5, tertiaryContribution: 0 } },
            'Preacher Curl': { sets: 3, reps: '8-10', rir: ['0', '0', '0'], rest: '1-2 min', equipment: 'barbell', muscles: { primary: 'Biceps', secondary: null, tertiary: null, primaryContribution: 1, secondaryContribution: 0, tertiaryContribution: 0 } },
            'Pec Flies': { sets: 2, reps: '6-8', rir: ['0', '0'], rest: '1-2 min', equipment: 'machine', muscles: { primary: 'Chest', secondary: null, tertiary: null, primaryContribution: 1, secondaryContribution: 0, tertiaryContribution: 0 } },
            'Barbell RDL': { sets: 4, reps: '5-7', rir: ['0', '0', '0', '0'], rest: '2-3 min', equipment: 'barbell', muscles: { primary: 'Hamstrings', secondary: 'Glutes', tertiary: null, primaryContribution: 1, secondaryContribution: 0.5, tertiaryContribution: 0 } },
            'DB Bulgarian Split Squat': { sets: 3, reps: '5-7', rir: ['0', '0', '0'], rest: '2 min', equipment: 'dumbbell', muscles: { primary: 'Quads', secondary: 'Glutes', tertiary: null, primaryContribution: 1, secondaryContribution: 0.5, tertiaryContribution: 0 } },
            'Safety Bar Squats': { sets: 2, reps: '5-7', rir: ['0', '0'], rest: '2-3 min', equipment: 'barbell', muscles: { primary: 'Quads', secondary: 'Glutes', tertiary: null, primaryContribution: 1, secondaryContribution: 0.5, tertiaryContribution: 0 } },
            'DB Rows': { sets: 2, reps: '5-7', rir: ['0', '0'], rest: '2-3 min', equipment: 'dumbbell', muscles: { primary: 'Back', secondary: 'Biceps', tertiary: null, primaryContribution: 1, secondaryContribution: 0.5, tertiaryContribution: 0 } },
        },
        programStructure: {
            'Upper (Strength Focus)': { exercises: ['Incline DB Press', 'Pullups', 'DB Rows', 'Barbell Bench Press', 'Bayesian Cable Curl', 'Overhead Triceps Extension'], label: 'Upper' },
            'Lower (Strength Focus)': { exercises: ['Smith Machine Squat', 'Hack Squat', 'Safety Bar Squats', 'Lying Leg Curl', 'Standing Calf Raise', 'Cable Crunch'], label: 'Lower' },
            'Pull (Hypertrophy Focus)': { exercises: ['Chest Supported Row', 'Pullups', 'DB Lateral Raise', 'Preacher Curl'], label: 'Pull' },
            'Push (Hypertrophy Focus)': { exercises: ['Incline DB Press', 'Barbell Bench Press', 'DB Lateral Raise', 'Overhead Triceps Extension', 'Pec Flies'], label: 'Push' },
            'Legs (Hypertrophy Focus)': { exercises: ['DB Bulgarian Split Squat', 'Barbell RDL', 'Leg Extensions', 'Lying Leg Curl', 'Standing Calf Raise'], label: 'Legs' },
        },
        weeklySchedule: [
            { day: 'Mon', workout: 'Pull (Hypertrophy Focus)' }, { day: 'Tue', workout: 'Push (Hypertrophy Focus)' },
            { day: 'Wed', workout: 'Legs (Hypertrophy Focus)' }, { day: 'Thu', workout: 'Rest' },
            { day: 'Fri', workout: 'Upper (Strength Focus)' }, { day: 'Sat', workout: 'Lower (Strength Focus)' },
            { day: 'Sun', workout: 'Rest' },
        ],
        workoutOrder: [
            'Pull (Hypertrophy Focus)',
            'Push (Hypertrophy Focus)',
            'Legs (Hypertrophy Focus)',
            'Upper (Strength Focus)',
            'Lower (Strength Focus)'
        ],
        settings: {
            useWeeklySchedule: true,
            restTimer: {
                enabled: true,
                duration: 120 // 2 minutes in seconds
            }
        },
        weeklyOverrides: {},
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
    'Leg Curl': { sets: 3, reps: '12-15', rir: ['1', '1', '1'], rest: '1-2 min', equipment: 'machine', muscles: { primary: 'Hamstrings', secondary: null, tertiary: null, primaryContribution: 1, secondaryContribution: 0, tertiaryContribution: 0 } },
    'Bulgarian Split Squat': { sets: 3, reps: '8-12', rir: ['1', '1', '1'], rest: '2 min', equipment: 'dumbbell', muscles: { primary: 'Quads', secondary: 'Glutes', tertiary: null, primaryContribution: 1, secondaryContribution: 0.8, tertiaryContribution: 0 } },
    'Calf Raise': { sets: 4, reps: '15-20', rir: ['1', '1', '1', '1'], rest: '1 min', equipment: 'machine', muscles: { primary: 'Calves', secondary: null, tertiary: null, primaryContribution: 1, secondaryContribution: 0, tertiaryContribution: 0 } },
    // Shoulders
    'Overhead Press (Barbell)': { sets: 3, reps: '6-10', rir: ['2', '2', '2'], rest: '2-3 min', equipment: 'barbell', muscles: { primary: 'Shoulders', secondary: 'Triceps', tertiary: 'Chest', primaryContribution: 1, secondaryContribution: 0.6, tertiaryContribution: 0.2 } },
    'Seated Dumbbell Press': { sets: 3, reps: '8-12', rir: ['1', '1', '1'], rest: '2 min', equipment: 'dumbbell', muscles: { primary: 'Shoulders', secondary: 'Triceps', tertiary: null, primaryContribution: 1, secondaryContribution: 0.5, tertiaryContribution: 0 } },
    'Lateral Raise': { sets: 4, reps: '12-15', rir: ['1', '1', '1', '1'], rest: '1-2 min', equipment: 'dumbbell', muscles: { primary: 'Shoulders', secondary: null, tertiary: null, primaryContribution: 1, secondaryContribution: 0, tertiaryContribution: 0 } },
    'Face Pull': { sets: 3, reps: '15-20', rir: ['1', '1', '1'], rest: '1 min', equipment: 'machine', muscles: { primary: 'Shoulders', secondary: 'Back', tertiary: null, primaryContribution: 1, secondaryContribution: 0.4, tertiaryContribution: 0 } },
    'Barbell Shrug': { sets: 3, reps: '10-15', rir: ['1', '1', '1'], rest: '1 min', equipment: 'barbell', muscles: { primary: 'Back', secondary: null, tertiary: null, primaryContribution: 1, secondaryContribution: 0, tertiaryContribution: 0 } },
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
const getExerciseDetails = (exerciseName, masterList) => masterList[exerciseName] || null;

const getWorkoutForWeek = (programData, week, workoutName) => {
    // Return the override if it exists, otherwise fall back to the master template
    return programData?.weeklyOverrides?.[week]?.[workoutName] || programData?.programStructure?.[workoutName] || null;
};

const calculateE1RM = (weight, reps, rir) => {
    // FIX: Correctly use RIR in e1RM calculation
    if (weight === null || weight === undefined || !reps || reps < 1) return 0;
    const effectiveReps = parseFloat(reps) + (parseFloat(rir) || 0);
    if (effectiveReps <= 1) return parseFloat(weight);
    // Using the Epley formula
    return Math.round(parseFloat(weight) * (1 + (effectiveReps / 30)));
};

const getSetVolume = (log, masterExerciseList) => {
    // FIX: Implement accurate dumbbell volume tracking
    if (!log || log.skipped || !log.load || !log.reps) return 0;
    const volume = parseFloat(log.load) * parseInt(log.reps, 10);
    const details = getExerciseDetails(log.exercise, masterExerciseList);
    if (details?.equipment === 'dumbbell') {
        return volume * 2;
    }
    return volume;
};


const findLastPerformanceLogs = (exerciseName, currentWeek, currentDayKey, allLogs) => {
    const dayOrder = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
    const currentDayNum = (currentWeek - 1) * 7 + dayOrder[currentDayKey];
    let lastSession = null;
    let lastDayNum = -1;
    for (const logId in allLogs) {
        const log = allLogs[logId];
        if (log.exercise === exerciseName && (log.load || log.load === 0) && log.reps && !log.skipped) {
            const logDayNum = (log.week - 1) * 7 + dayOrder[log.dayKey];
            if (logDayNum < currentDayNum && logDayNum > lastDayNum) {
                lastDayNum = logDayNum;
                lastSession = { week: log.week, dayKey: log.dayKey };
            }
        }
    }
    if (!lastSession) return null;
    const logsForSession = Object.values(allLogs).filter(log => log.exercise === exerciseName && log.week === lastSession.week && log.dayKey === lastSession.dayKey && !log.skipped);
    return logsForSession.reduce((acc, log) => { acc[log.set] = log; return acc; }, {});
};

const getProgressionSuggestion = (exerciseName, lastPerformance, currentPerformance, masterList) => {
    if (!lastPerformance) return "Log your first set to get a baseline.";
    
    const lastSets = Object.values(lastPerformance);
    const lastTopSet = lastSets.reduce((best, current) => (!best || calculateE1RM(current.load, current.reps, current.rir) > calculateE1RM(best.load, best.reps, best.rir) ? current : best), null);
    
    if (currentPerformance) {
        const currentE1RM = calculateE1RM(currentPerformance.load, currentPerformance.reps, currentPerformance.rir);
        const lastE1RM = calculateE1RM(lastTopSet.load, lastTopSet.reps, lastTopSet.rir);
        if (lastE1RM > 0 && currentE1RM < lastE1RM * 0.9) {
            return "Performance dropped significantly. Focus on recovery. Consider maintaining weight or reducing it slightly.";
        }
    }

    const exerciseDetails = getExerciseDetails(exerciseName, masterList);
    if (!lastTopSet || !exerciseDetails) return "Log your first set to get a baseline.";

    const [minRepsStr, maxRpsStr] = (exerciseDetails.reps || '0-0').split('-');
    const minReps = parseInt(minRepsStr, 10);
    const maxReps = parseInt(maxRpsStr, 10);
    const lastReps = parseInt(lastTopSet.reps, 10);
    const lastWeight = parseFloat(lastTopSet.load);

    if (lastReps >= maxReps) {
        let increment = 5;
        if (exerciseDetails.equipment === 'dumbbell') increment = 5;
        if (exerciseDetails.equipment === 'bodyweight') return `Aim for ${lastReps + 1} reps or add weight.`;
        const newWeight = lastWeight + increment;
        return `Try increasing weight to ${newWeight} lbs/kg for ${minReps}-${maxReps} reps.`;
    }
    
    if (lastReps >= minReps && lastReps < maxReps) {
        return `Aim for ${lastReps + 1} reps with ${lastWeight} lbs/kg to reach the top of the rep range.`;
    }

    if (lastReps < minReps) {
        let decrement = 5;
        if (exerciseDetails.equipment === 'dumbbell') decrement = 5;
        const newWeight = Math.max(0, lastWeight - decrement);
        return `Try lowering weight to ~${newWeight} lbs/kg to hit the ${minReps}-${maxReps} rep range.`;
    }

    return `Aim for ${minReps}-${maxReps} reps.`;
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
        setModalContent({ content, size });
    }, []);

    const closeModal = useCallback(() => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflowY = '';
        window.scrollTo(0, scrollYRef.current);
        setModalContent(null);
    }, []);
    
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

    const handleSetCustomId = (id) => {
        const sanitizedId = id.trim().replace(/[^a-zA-Z0-9-_]/g, '');
        if (sanitizedId) {
            localStorage.setItem('projectOverloadSyncId', sanitizedId);
            setCustomId(sanitizedId);
        }
        return sanitizedId;
    };

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


// --- Components ---
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
    const exercise = getExerciseDetails(exerciseName, masterExerciseList);
    const sets = Array.from({ length: exercise?.sets || 0 }, (_, i) => i + 1);
    
    const isSetComplete = (log) => {
        // FIX: Allow load of 0 to be valid for bodyweight exercises
        const isLoadValid = (log?.load !== undefined && log?.load !== null && log.load !== '');
        const areRepsValid = !!log?.reps;
        const isRirValid = (log?.rir !== undefined && log?.rir !== null && log?.rir !== '');
        // FIX: A set is also "complete" for UI purposes if it's skipped
        return log?.skipped || (isLoadValid && areRepsValid && isRirValid);
    }

    const isCompleted = useMemo(() => {
        return sets.every(setNumber => {
            const log = allLogs[`${week}-${dayKey}-${exerciseName}-${setNumber}`];
            return isSetComplete(log);
        });
    }, [allLogs, week, dayKey, exerciseName, sets]);

    const [isOpen, setIsOpen] = useState(!isCompleted);
    
    useEffect(() => {
        setIsOpen(!isCompleted);
    }, [isCompleted]);

    if (!exercise) return <div className="bg-red-100 dark:bg-red-900/50 p-4 rounded-lg text-red-700 dark:text-red-300">Exercise "{exerciseName}" not found in master list.</div>;

    const lastPerformance = useMemo(() => findLastPerformanceLogs(exerciseName, week, dayKey, allLogs), [exerciseName, week, dayKey, allLogs]);
    const currentSetLog = allLogs[`${week}-${dayKey}-${exerciseName}-1`];
    const suggestion = useMemo(() => getProgressionSuggestion(exerciseName, lastPerformance, currentSetLog, masterExerciseList), [exerciseName, lastPerformance, currentSetLog, masterExerciseList]);
    
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full p-4 text-left flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{exerciseName}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{exercise.sets} sets &times; {exercise.reps}</p>
                </div>
                <div className="flex items-center space-x-3">
                    {isCompleted && <CheckCircle className="text-green-500" />}
                    {isOpen ? <ChevronUp className="text-gray-500 dark:text-gray-400" /> : <ChevronDown className="text-gray-500 dark:text-gray-400" />}
                </div>
            </button>
            {isOpen && (
                <div className="p-4">
                    <div className="mb-3 p-3 flex items-center gap-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
                        <Lightbulb className="text-blue-500 dark:text-blue-400 flex-shrink-0" size={20}/>
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
                                    lastSetData={lastPerformance ? lastPerformance[setNumber] : null}
                                    exerciseDetails={exercise}
                                    weightUnit={weightUnit}
                                    exerciseName={exerciseName}
                                    totalSets={exercise.sets}
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
            return programData.weeklySchedule.find(s => s.day === dayKey)?.workout;
        } else {
            return programData.workoutOrder[sequentialWorkoutIndex % programData.workoutOrder.length];
        }
    }, [programData, dayKey, sequentialWorkoutIndex]);

    const workout = getWorkoutForWeek(programData, week, workoutName);

    const handleLogChange = (exerciseName, setNumber, field, value) => {
        const logId = `${week}-${dayKey}-${exerciseName}-${setNumber}`;
        const currentLog = allLogs[logId] || { week, dayKey, session: workoutName, exercise: exerciseName, set: setNumber, date: new Date().toISOString() };
        
        const wasSetComplete = (log) => {
             const isLoadValid = (log?.load === 0 || log?.load);
             const areRepsValid = !!log?.reps;
             const isRirValid = (log?.rir !== undefined && log?.rir !== null && log?.rir !== '');
             return log?.skipped || (isLoadValid && areRepsValid && isRirValid);
        }
        const wasCompleteBefore = wasSetComplete(currentLog);

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

        const isCompleteNow = wasSetComplete(newLogEntry);

        setAllLogs(prev => ({ ...prev, [logId]: newLogEntry }));

        if (db && customId) {
            const userDocRef = doc(db, 'workoutLogs', customId);
            updateDoc(userDocRef, { [`logs.${logId}`]: newLogEntry });
        }
        
        // FIX: Start timer when set becomes complete
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
    
    const pageTitle = programData.settings.useWeeklySchedule ? `Week ${week}: ${dayKey}` : `Workout #${sequentialWorkoutIndex + 1}`;

    return (
        <div className="p-4 md:p-6 pb-24">
            <div className="flex justify-between items-center mb-4">
                <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"><ArrowLeft size={16}/> Back to Program</button>
                <div className="flex items-center gap-2">
                    <button onClick={onStartTimer} className="flex items-center gap-2 text-sm font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/50 px-3 py-1.5 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-800/50 transition-colors"><Timer size={16}/> Start Timer</button>
                    <button onClick={() => onSkipDay(week, dayKey)} className="flex items-center gap-2 text-sm font-medium text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/50 px-3 py-1.5 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"><SkipForward size={16}/> Skip Day</button>
                </div>
            </div>
            <div className="mb-6 text-center">
                <h2 className="text-3xl font-bold dark:text-white">{pageTitle}</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">{workoutName}</p>
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

const WeekView = ({ week, completedDays, onSessionSelect, firstIncompleteWeek, onUnskipDay, programData, onEditWorkout }) => {
    const { programStructure, weeklySchedule } = programData;
    const isWeekComplete = useMemo(() => weeklySchedule.every(day => day.workout === 'Rest' || completedDays.get(`${week}-${day.day}`)?.isDayComplete), [week, completedDays, weeklySchedule]);
    const [isOpen, setIsOpen] = useState(week === firstIncompleteWeek);
    
    useEffect(() => {
        setIsOpen(week === firstIncompleteWeek);
    }, [firstIncompleteWeek, week]);
    
    const getWorkoutForDay = (w, d) => weeklySchedule.find(s => s.day === d)?.workout;

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
                        const workoutName = getWorkoutForDay(week, day.day);
                        const workoutDetails = programStructure[workoutName];
                        const isRestDay = !workoutName || workoutName === 'Rest';
                        const isOverridden = !!programData.weeklyOverrides?.[week]?.[workoutName];
                        
                        let dayClass = 'bg-gray-100 dark:bg-gray-700/50';
                        if (isRestDay) dayClass = 'bg-indigo-100 dark:bg-indigo-900/50';
                        else if (status?.isSkipped) dayClass = 'bg-red-100 dark:bg-red-800/50 border border-red-500/50';
                        else if (status?.isDayComplete) dayClass = 'bg-green-100 dark:bg-green-800/50 border border-green-500/50';

                        return (
                            <div key={dayKey} className={`rounded-lg p-3 flex flex-col justify-between transition-all ${dayClass}`}>
                                <div className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-2">{day.day}</div>
                                <div className="space-y-2 flex-grow flex flex-col justify-end">
                                    {isRestDay ? (
                                        <div className="text-center text-xs font-semibold text-indigo-700 dark:text-indigo-300 h-7 flex items-center justify-center">Rest Day</div>
                                    ) : status?.isSkipped ? (
                                        <button onClick={() => onUnskipDay(week, day.day)} className="w-full flex items-center justify-center gap-1 text-xs p-1.5 rounded bg-white dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 shadow-sm transition-colors font-semibold text-red-600 dark:text-red-400">
                                            <XCircle size={14} /> Skipped
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => onSessionSelect(week, day.day, 'lifting')} className="w-full flex items-center justify-between text-xs p-1.5 rounded bg-white dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 shadow-sm transition-colors">
                                                <div className="flex items-center gap-1 font-semibold">{workoutDetails?.label || workoutName}</div>
                                                {status?.isDayComplete ? <CheckCircle size={14} className="text-green-500"/> : <Dumbbell size={14} className="text-blue-500"/>}
                                            </button>
                                            <button onClick={() => onEditWorkout(week, workoutName)} className="p-1.5 rounded bg-white dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 shadow-sm">
                                                <Pencil size={14} className={isOverridden ? 'text-blue-500' : 'text-gray-500'}/>
                                            </button>
                                        </div>
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

const SequentialView = ({ onSessionSelect, allLogs, programData }) => {
    const { info, workoutOrder, programStructure, masterExerciseList } = programData;
    const totalWorkoutsInCycle = workoutOrder.length;
    const totalSessions = info.weeks * totalWorkoutsInCycle;

    // Find the index of the first incomplete workout
    const firstIncompleteIndex = useMemo(() => {
        for (let i = 0; i < totalSessions; i++) {
            const week = Math.floor(i / totalWorkoutsInCycle) + 1;
            const workoutName = workoutOrder[i % totalWorkoutsInCycle];
            const workout = getWorkoutForWeek(programData, week, workoutName);
            const dayKey = workoutName; // Use workout name as the key for sequential
            
            if (!workout) continue;

            const isComplete = workout.exercises.every(exName => {
                const exDetails = getExerciseDetails(exName, masterExerciseList);
                if (!exDetails) return false;
                return Array.from({ length: exDetails.sets }, (_, setIdx) => setIdx + 1).every(setNum => {
                    const log = allLogs[`${week}-${dayKey}-${exName}-${setNum}`];
                    return log?.skipped || ((log?.load === 0 || log?.load) && log?.reps && (log.rir !== undefined && log.rir !== null && log.rir !== ''));
                });
            });

            if (!isComplete) {
                return i;
            }
        }
        return totalSessions; // All completed
    }, [allLogs, programData, totalSessions, totalWorkoutsInCycle, workoutOrder, masterExerciseList]);

    return (
        <div className="space-y-3">
            {Array.from({ length: totalSessions }, (_, i) => {
                const week = Math.floor(i / totalWorkoutsInCycle) + 1;
                const workoutName = workoutOrder[i % totalWorkoutsInCycle];
                const workout = getWorkoutForWeek(programData, week, workoutName);
                if (!workout) return null;
                const dayKey = workoutName;

                 const isComplete = workout.exercises.every(exName => {
                    const exDetails = getExerciseDetails(exName, masterExerciseList);
                    if (!exDetails) return false;
                    return Array.from({ length: exDetails.sets }, (_, setIdx) => setIdx + 1).every(setNum => {
                        const log = allLogs[`${week}-${dayKey}-${exName}-${setNum}`];
                        return log?.skipped || ((log?.load === 0 || log?.load) && log?.reps && (log.rir !== undefined && log.rir !== null && log.rir !== ''));
                    });
                });

                const isNext = i === firstIncompleteIndex;
                const cardClass = isComplete
                    ? 'bg-green-100 dark:bg-green-800/50 border-l-4 border-green-500'
                    : isNext
                    ? 'bg-blue-100 dark:bg-blue-900/50 border-l-4 border-blue-500'
                    : 'bg-gray-100 dark:bg-gray-700/50';

                return (
                    <button 
                        key={i} 
                        onClick={() => onSessionSelect(week, dayKey, 'lifting', i)}
                        className={`w-full text-left p-4 rounded-lg shadow-sm flex justify-between items-center transition-all ${cardClass}`}
                    >
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Workout #{i + 1}</p>
                            <h3 className="font-bold text-lg">{workoutName}</h3>
                        </div>
                        {isComplete ? <CheckCircle size={24} className="text-green-500" /> : <Dumbbell size={24} className="text-gray-500" />}
                    </button>
                )
            })}
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


const MainView = ({ onSessionSelect, completedDays, onUnskipDay, programData, onEditWorkout, allLogs }) => {
    const { info, weeklySchedule, workoutOrder } = programData;
    const weeks = Array.from({ length: info.weeks }, (_, i) => i + 1);
    
    const firstIncompleteWeek = useMemo(() => {
        if (!programData.settings.useWeeklySchedule) return 1;
        for (let w = 1; w <= info.weeks; w++) {
            if (!weeklySchedule.every(d => d.workout === 'Rest' || completedDays.get(`${w}-${d.day}`)?.isDayComplete)) return w;
        }
        return info.weeks + 1;
    }, [completedDays, weeklySchedule, info.weeks, programData.settings.useWeeklySchedule]);

    return (
        <div className="p-4 md:p-6">
            <div className="flex flex-col items-center text-center mb-6 gap-4">
                <Dumbbell className="text-blue-500 dark:text-blue-400" size={48} />
                <div>
                    <h1 className="text-3xl font-bold dark:text-white">{info.name}</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">Your {info.weeks}-Week Plan</p>
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
                            onEditWorkout={onEditWorkout}
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

const DashboardView = ({ allLogs, programData }) => {
    const { masterExerciseList, weeklySchedule, info } = programData;
    const { totalSets, completedSets, streak } = useMemo(() => {
        let weeklySets = 0;
        weeklySchedule.forEach(day => {
            if (day.workout !== 'Rest') {
                const workout = getWorkoutForWeek(programData, 1, day.workout);
                if (workout) {
                    workout.exercises.forEach(exName => {
                        const details = getExerciseDetails(exName, masterExerciseList);
                        if (details) {
                            weeklySets += Number(details.sets) || 0;
                        }
                    });
                }
            }
        });
        const total = weeklySets * info.weeks;
        const completed = Object.values(allLogs).filter(log => !log.skipped && (log.load === 0 || log.load) && log.reps).length;

        const currentStreak = calculateStreak(allLogs, programData);

        return { totalSets: total, completedSets: completed, streak: currentStreak };
    }, [allLogs, programData]);

    return (
       <div className="p-4 md:p-6">
            <div className="flex flex-col items-center text-center mb-6">
                <LayoutDashboard className="text-blue-500 dark:text-blue-400 mb-2" size={32} />
                <div>
                    <h1 className="text-3xl font-bold dark:text-white">Dashboard</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">Your Program At a Glance</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                    <ProgressBar completed={completedSets} total={totalSets} />
                </div>
                 <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex justify-center items-center">
                    <StreakCounter streak={streak} />
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


const SettingsView = ({ allLogs, historicalLogs, weightUnit, onWeightUnitChange, onResetMeso, programData, onProgramDataChange, onShowTutorial, bodyWeight, onBodyWeightChange }) => {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const { customId, handleSetCustomId } = useContext(FirebaseContext);
    const { openModal, closeModal } = useContext(AppStateContext);
    const [tempId, setTempId] = useState(customId);
    const [exportSelection, setExportSelection] = useState('all');

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
            <div className="flex flex-col items-center text-center mb-6"><Settings className="text-blue-500 dark:text-blue-400 mb-2" size={32} /><div><h1 className="text-3xl font-bold dark:text-white">App Settings</h1></div></div>
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
                            <input id="bodyWeight" type="number" value={bodyWeight} onChange={(e) => onBodyWeightChange(e.target.value)} className="w-24 p-2 bg-white dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600 shadow-sm" />
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <span className="font-semibold dark:text-gray-200">Use Weekly Schedule</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Off for sequential workouts.</span>
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

const AnalyticsView = ({ allLogs, masterExerciseList }) => {
    const [selectedExercise, setSelectedExercise] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [timeFilter, setTimeFilter] = useState('all'); // 'week', 'month', 'all'

    const uniqueExercises = useMemo(() => Object.keys(masterExerciseList).sort(), [masterExerciseList]);
    const filteredExercises = useMemo(() => uniqueExercises.filter(ex => ex.toLowerCase().includes(searchTerm.toLowerCase())), [uniqueExercises, searchTerm]);

    const filteredLogs = useMemo(() => {
        const logs = Object.fromEntries(Object.entries(allLogs).filter(([, log]) => !log.skipped));
        if (timeFilter === 'all') return logs;
        const now = new Date();
        const filterDate = new Date();
        if (timeFilter === 'week') filterDate.setDate(now.getDate() - 7);
        if (timeFilter === 'month') filterDate.setDate(now.getDate() - 30);
        
        return Object.fromEntries(
            Object.entries(logs).filter(([, log]) => {
                if (!log.date) return false;
                return new Date(log.date) >= filterDate;
            })
        );
    }, [allLogs, timeFilter]);

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
        if (!selectedExercise || Object.keys(filteredLogs).length === 0) return [];
        const dayOrder = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
        const sessions = Object.values(filteredLogs).reduce((acc, log) => {
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
        return processedData.sort((a, b) => { 
            const [wA, dA] = a.sessionLabel.substring(1).split(' '); 
            const [wB, dB] = b.sessionLabel.substring(1).split(' '); 
            return (parseInt(wA) - parseInt(wB)) || (dayOrder[dA] - dayOrder[dB]); 
        });
    }, [selectedExercise, filteredLogs]);

    const volumeData = useMemo(() => {
        if (Object.keys(filteredLogs).length === 0) return [];
        const volumesByWeek = {};
        Object.values(filteredLogs).forEach(log => {
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
    }, [filteredLogs, masterExerciseList]);


    const muscleGroupData = useMemo(() => {
        const dataByMuscle = {};

        const ensureMuscle = (muscle) => {
            if (muscle && !dataByMuscle[muscle]) {
                dataByMuscle[muscle] = { volume: 0, sets: 0 };
            }
        };

        Object.values(filteredLogs).forEach(log => {
            if ((log.load === 0 || log.load) && log.reps && log.exercise) {
                const exerciseDetails = getExerciseDetails(log.exercise, masterExerciseList);
                if (exerciseDetails && exerciseDetails.muscles) {
                    const volume = getSetVolume(log, masterExerciseList);
                    const { primary, secondary, tertiary, primaryContribution = 1, secondaryContribution = 0.5, tertiaryContribution = 0.25 } = exerciseDetails.muscles;
                    
                    ensureMuscle(primary);
                    if(primary) {
                        dataByMuscle[primary].volume += volume * primaryContribution;
                        dataByMuscle[primary].sets += 1;
                    }

                    ensureMuscle(secondary);
                    if(secondary) {
                        dataByMuscle[secondary].volume += volume * secondaryContribution;
                        dataByMuscle[secondary].sets += 1;
                    }

                    ensureMuscle(tertiary);
                    if(tertiary) {
                        dataByMuscle[tertiary].volume += volume * tertiaryContribution;
                        dataByMuscle[tertiary].sets += 1;
                    }
                }
            }
        });

        const totalVolume = Object.values(dataByMuscle).reduce((sum, d) => sum + d.volume, 0);
        const totalSets = Object.values(dataByMuscle).reduce((sum, d) => sum + d.sets, 0);

        return Object.entries(dataByMuscle).map(([name, data]) => ({
            name,
            volume: Math.round(data.volume),
            sets: data.sets,
            volumePercentage: totalVolume > 0 ? Math.round((data.volume / totalVolume) * 100) : 0,
            setsPercentage: totalSets > 0 ? Math.round((data.sets / totalSets) * 100) : 0,
        })).sort((a,b) => b.volume - a.volume);
    }, [filteredLogs, masterExerciseList]);

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
                <BarChart2 className="text-blue-500 dark:text-blue-400 mb-2" size={32} />
                <div>
                    <h1 className="text-3xl font-bold dark:text-white">Analytics</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">Your Performance Breakdown</p>
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
                    <h3 className="font-semibold dark:text-gray-200 mb-2">Muscle Group Distribution</h3>
                    <div className="flex justify-center gap-2 mb-4 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <button onClick={() => setTimeFilter('week')} className={`px-3 py-1 text-sm rounded-md ${timeFilter === 'week' ? 'bg-white dark:bg-gray-900 shadow' : ''}`}>This Week</button>
                        <button onClick={() => setTimeFilter('month')} className={`px-3 py-1 text-sm rounded-md ${timeFilter === 'month' ? 'bg-white dark:bg-gray-900 shadow' : ''}`}>This Month</button>
                        <button onClick={() => setTimeFilter('all')} className={`px-3 py-1 text-sm rounded-md ${timeFilter === 'all' ? 'bg-white dark:bg-gray-900 shadow' : ''}`}>All Time</button>
                    </div>
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
                                <ul className="space-y-2">
                                    {muscleGroupData.map(d => (
                                        <li key={d.name} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md">
                                            <span className="font-semibold">{d.name}</span>
                                            <span>{d.sets} sets ({d.setsPercentage}%)</span>
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

const RecordsView = ({ allLogs }) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    const personalRecords = useMemo(() => {
        const records = {};
        const validLogs = Object.values(allLogs).filter(log => !log.skipped);

        validLogs.forEach(log => {
            if ((log.load === 0 || log.load) && log.reps) {
                const e1rm = calculateE1RM(log.load, log.reps, log.rir);
                if (!records[log.exercise] || e1rm > records[log.exercise].e1rm) {
                    records[log.exercise] = {
                        e1rm,
                        log,
                    };
                }
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
                <Trophy className="text-yellow-500 dark:text-yellow-400 mb-2" size={32} />
                <div>
                    <h1 className="text-3xl font-bold dark:text-white">Personal Records</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">Your Best Lifts</p>
                </div>
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
                                {log.load} lbs/kg x {log.reps} reps @ {log.rir || 0} RIR
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

const EditProgramView = ({ programData, onProgramDataChange }) => {
    const { openModal, closeModal } = useContext(AppStateContext);
    const { programStructure, masterExerciseList, weeklySchedule, workoutOrder, info } = programData;
    const [programName, setProgramName] = useState(info.name);
    const [nameFeedback, setNameFeedback] = useState('');
    const [isScheduleOpen, setIsScheduleOpen] = useState(false);

    // Update local state if programData from props changes
    useEffect(() => {
        setProgramName(info.name);
    }, [info.name]);

    const handleSaveProgramName = () => {
        const newProgramData = {
            ...programData,
            info: {
                ...programData.info,
                name: programName
            }
        };
        onProgramDataChange(newProgramData);
        setNameFeedback('Saved!');
        setTimeout(() => setNameFeedback(''), 2000);
    };

    const handleInfoChange = (field, value) => {
        const newProgramData = {
            ...programData,
            info: {
                ...programData.info,
                [field]: value
            }
        };
        onProgramDataChange(newProgramData);
    };

    // Generic update handler
    const updateProgramData = (field, value) => {
        onProgramDataChange({ ...programData, [field]: value });
    };

    // --- Weekly Schedule Handlers ---
    const handleScheduleChange = (day, newWorkoutName) => {
        const newSchedule = weeklySchedule.map(d => d.day === day ? { ...d, workout: newWorkoutName } : d);
        updateProgramData('weeklySchedule', newSchedule);
    };

    // --- Workout Day Handlers ---
    const handleAddWorkoutDay = () => {
        const newWorkoutName = `New Workout ${Object.keys(programStructure).length + 1}`;
        const newProgramStructure = { ...programStructure, [newWorkoutName]: { exercises: [], label: 'New' } };
        const newWorkoutOrder = [...workoutOrder, newWorkoutName];
        onProgramDataChange({ ...programData, programStructure: newProgramStructure, workoutOrder: newWorkoutOrder });
    };

    const handleReorderWorkoutDay = (index, direction) => {
        const newOrder = [...workoutOrder];
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= newOrder.length) return;
        [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
        updateProgramData('workoutOrder', newOrder);
    };

    const handleDeleteWorkoutDay = (workoutNameToDelete) => {
        openModal(
            <div>
                <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
                <p className="text-gray-600 dark:text-gray-400">Are you sure you want to delete the workout "{workoutNameToDelete}"? This will also remove it from your weekly schedule. This action cannot be undone.</p>
                <div className="flex justify-end gap-2 mt-6">
                    <button onClick={closeModal} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg">Cancel</button>
                    <button onClick={() => {
                        const newProgramStructure = { ...programStructure };
                        delete newProgramStructure[workoutNameToDelete];

                        const newWorkoutOrder = workoutOrder.filter(name => name !== workoutNameToDelete);
                        
                        const newWeeklySchedule = weeklySchedule.map(day => 
                            day.workout === workoutNameToDelete ? { ...day, workout: 'Rest' } : day
                        );

                        onProgramDataChange({
                            ...programData,
                            programStructure: newProgramStructure,
                            workoutOrder: newWorkoutOrder,
                            weeklySchedule: newWeeklySchedule,
                        });
                        closeModal();
                    }} className="px-4 py-2 bg-red-600 text-white rounded-lg">Confirm Delete</button>
                </div>
            </div>
        );
    };
    
    const handleRenameWorkoutDay = (oldName) => {
        openModal(
            <RenameWorkoutModal
                oldName={oldName}
                onClose={closeModal}
                onSave={(newName) => {
                    if (newName && newName.trim() && newName !== oldName) {
                        const newProgramStructure = { ...programStructure };
                        newProgramStructure[newName] = newProgramStructure[oldName];
                        delete newProgramStructure[oldName];

                        const newWorkoutOrder = workoutOrder.map(name => name === oldName ? newName : name);
                        const newWeeklySchedule = weeklySchedule.map(day => day.workout === oldName ? { ...day, workout: newName } : day);

                        onProgramDataChange({
                            ...programData,
                            programStructure: newProgramStructure,
                            workoutOrder: newWorkoutOrder,
                            weeklySchedule: newWeeklySchedule,
                        });
                    }
                    closeModal();
                }}
            />
        );
    };


    // --- Exercise Handlers ---
    const handleReorderExercise = (workoutName, index, direction) => {
        const newProgramStructure = JSON.parse(JSON.stringify(programStructure));
        const exercises = newProgramStructure[workoutName].exercises;
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= exercises.length) return;
        [exercises[index], exercises[newIndex]] = [exercises[newIndex], exercises[index]];
        updateProgramData('programStructure', newProgramStructure);
    };

    const handleDeleteExerciseFromWorkout = (workoutName, exerciseIndex) => {
       const newProgramStructure = JSON.parse(JSON.stringify(programStructure));
       newProgramStructure[workoutName].exercises.splice(exerciseIndex, 1);
       updateProgramData('programStructure', newProgramStructure);
    };
    
    const handleAddExerciseToWorkout = (workoutName) => {
        openModal(
            <AddExerciseToWorkoutModal 
                masterExerciseList={masterExerciseList}
                onAdd={(exerciseName, exerciseDetails) => {
                    const newProgramStructure = JSON.parse(JSON.stringify(programStructure));
                    newProgramStructure[workoutName].exercises.push(exerciseName);
                    
                    let newMasterList = { ...masterExerciseList };
                    if (exerciseDetails && !newMasterList[exerciseName]) {
                        // This is a new exercise from the bank, add its copy to our personal list
                        newMasterList[exerciseName] = exerciseDetails;
                    }

                    onProgramDataChange({ 
                        ...programData, 
                        programStructure: newProgramStructure,
                        masterExerciseList: newMasterList
                    });
                    closeModal();
                }}
                onClose={closeModal}
            />
        )
    };
    
    const handleEditExerciseDetails = (exerciseName) => {
        const exerciseDetails = getExerciseDetails(exerciseName, masterExerciseList);
        openModal(
            <EditExerciseModal
                exercise={exerciseDetails}
                exerciseName={exerciseName}
                onSave={(updatedExercise, newName) => {
                    const newMasterList = { ...masterExerciseList };
                    if (newName !== exerciseName) {
                        delete newMasterList[exerciseName];
                    }
                    newMasterList[newName] = updatedExercise;

                    const newProgramStructure = JSON.parse(JSON.stringify(programStructure));
                    for(const workout in newProgramStructure) {
                        newProgramStructure[workout].exercises = newProgramStructure[workout].exercises.map(ex => ex === exerciseName ? newName : ex);
                    }
                    onProgramDataChange({ ...programData, masterExerciseList: newMasterList, programStructure: newProgramStructure });
                    closeModal();
                }}
                onClose={closeModal}
            />
        );
    };

    const handleCreateNewExercise = () => {
        openModal(
            <EditExerciseModal
                onSave={(newExercise, newName) => {
                    updateProgramData('masterExerciseList', { ...masterExerciseList, [newName]: newExercise });
                    closeModal();
                }}
                onClose={closeModal}
            />
        );
    };
    
    return (
        <div className="p-4 md:p-6 pb-24">
            <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left mb-6">
                <div className="flex items-center gap-3 mb-4 sm:mb-0">
                    <Edit className="text-blue-500 dark:text-blue-400" size={32} />
                    <div>
                        <h1 className="text-3xl font-bold dark:text-white">Edit Program</h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400">Customize Your Workouts</p>
                    </div>
                </div>
                 <button onClick={handleCreateNewExercise} className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                    <PlusCircle size={16} /> Create Exercise
                </button>
            </div>


            {/* Program Details Editor */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Program Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="programName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Program Name</label>
                        <div className="flex items-center gap-2">
                             <input 
                                 id="programName"
                                 type="text" 
                                 value={programName} 
                                 onChange={(e) => setProgramName(e.target.value)}
                                 className="w-full p-2 bg-gray-50 dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600 shadow-sm"
                             />
                             <button 
                                 onClick={handleSaveProgramName}
                                 className="p-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                             >
                                 <Save size={20} />
                             </button>
                        </div>
                        {nameFeedback && <p className="text-green-500 text-xs mt-1">{nameFeedback}</p>}
                    </div>
                    <div>
                        <label htmlFor="programWeeks" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Number of Weeks</label>
                        <input 
                            id="programWeeks"
                            type="number"
                            value={info.weeks}
                            onChange={(e) => handleInfoChange('weeks', parseInt(e.target.value, 10) || 1)}
                            className="w-full p-2 bg-gray-50 dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600 shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Weekly Schedule Editor */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
                <button onClick={() => setIsScheduleOpen(!isScheduleOpen)} className="w-full flex justify-between items-center text-left">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Weekly Schedule</h3>
                    {isScheduleOpen ? <ChevronUp className="text-gray-500 dark:text-gray-400" /> : <ChevronDown className="text-gray-500 dark:text-gray-400" />}
                </button>
                {isScheduleOpen && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mt-4">
                        {weeklySchedule.map(({ day, workout }) => (
                            <div key={day}>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{day}</label>
                                <select value={workout} onChange={(e) => handleScheduleChange(day, e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600 shadow-sm">
                                    <option value="Rest">Rest</option>
                                    {workoutOrder.map(woName => <option key={woName} value={woName}>{woName}</option>)}
                                </select>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Workout Day List */}
            <div className="space-y-4">
                {workoutOrder.map((workoutName, workoutIndex) => {
                    const workoutDetails = programStructure[workoutName];
                    if (!workoutDetails) return null;
                    return (
                        <div key={workoutName} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
                            <div className="flex justify-between items-center mb-3 border-b border-gray-200 dark:border-gray-700 pb-3">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{workoutName}</h3>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => handleReorderWorkoutDay(workoutIndex, -1)} disabled={workoutIndex === 0} className="p-1 disabled:opacity-20"><ArrowUp size={20}/></button>
                                    <button onClick={() => handleReorderWorkoutDay(workoutIndex, 1)} disabled={workoutIndex === workoutOrder.length - 1} className="p-1 disabled:opacity-20"><ArrowDown size={20}/></button>
                                    <button onClick={() => handleRenameWorkoutDay(workoutName)} className="p-1 hover:text-blue-500"><Edit size={20}/></button>
                                    <button onClick={() => handleDeleteWorkoutDay(workoutName)} className="p-1 hover:text-red-500"><XCircle size={20}/></button>
                                </div>
                            </div>
                            
                            <ul className="space-y-2 mb-3">
                                {workoutDetails.exercises.map((ex, index) => (
                                    <li key={`${workoutName}-${ex}-${index}`} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md group">
                                        <span className="text-gray-800 dark:text-gray-200">{ex}</span>
                                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                            <button onClick={() => handleReorderExercise(workoutName, index, -1)} disabled={index === 0} className="disabled:opacity-20 p-1 hover:text-gray-900 dark:hover:text-white"><ArrowUp size={16} /></button>
                                            <button onClick={() => handleReorderExercise(workoutName, index, 1)} disabled={index === workoutDetails.exercises.length - 1} className="disabled:opacity-20 p-1 hover:text-gray-900 dark:hover:text-white"><ArrowDown size={16} /></button>
                                            <button onClick={() => handleEditExerciseDetails(ex)} className="p-1 hover:text-blue-600 dark:hover:text-blue-400"><Edit size={16} /></button>
                                            <button onClick={() => handleDeleteExerciseFromWorkout(workoutName, index)} className="p-1 hover:text-red-600 dark:hover:text-red-400"><XCircle size={16} /></button>
                                        </div>
                                    </li>
                                ))}
                                {workoutDetails.exercises.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 py-2">No exercises yet.</p>}
                            </ul>
                            <button onClick={() => handleAddExerciseToWorkout(workoutName)} className="w-full flex items-center justify-center gap-2 text-sm p-2 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/50">
                                <PlusCircle size={16}/> Add Exercise
                            </button>
                        </div>
                    )
                })}
                 <button onClick={handleAddWorkoutDay} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/50 font-bold">
                    <PlusCircle size={20}/> Add New Workout Day
                </button>
            </div>
        </div>
    );
};

const EditExerciseModal = ({ exercise, exerciseName, onSave, onClose }) => {
    const [details, setDetails] = useState({
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
    });

    useEffect(() => {
        const numSets = parseInt(details.sets, 10) || 0;
        if (details.rir.length !== numSets) {
            setDetails(prev => ({
                ...prev,
                rir: Array.from({ length: numSets }, (_, i) => prev.rir[i] || '0')
            }));
        }
    }, [details.sets]);

    const isNew = !exerciseName;

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

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">{isNew ? 'Create New Exercise' : `Editing ${exerciseName}`}</h2>
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
                        {Array.from({ length: details.sets }, (_, i) => (
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
                    <Dumbbell size={16} /> My Exercises
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

const ProgramManagerView = ({ onProgramUpdate, activeProgram }) => {
    const { openModal, closeModal, addToast } = useContext(AppStateContext);
    const fileInputRef = useRef(null);

    const handleShareProgram = () => {
        try {
            // FIX: Ensure only the active program structure is exported, without logs or other user data.
            const programToExport = {
                name: activeProgram.name,
                info: activeProgram.info,
                masterExerciseList: activeProgram.masterExerciseList,
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
            addToast('Program shared successfully!', 'success');
        } catch (error) {
            console.error("Failed to share program:", error);
            addToast('Error sharing program.', 'error');
        }
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
                const importedProgram = JSON.parse(e.target.result);
                // Basic validation
                if (importedProgram.name && importedProgram.info && importedProgram.masterExerciseList && importedProgram.programStructure) {
                    onProgramUpdate(importedProgram);
                    addToast(`Program "${importedProgram.name}" imported successfully!`, 'success');
                } else {
                    throw new Error("Invalid program file structure.");
                }
            } catch (error) {
                console.error("Failed to import program:", error);
                addToast('Failed to import: Invalid file format.', 'error');
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
            'lg' // large modal
        );
    };

    return (
        <div className="p-4 md:p-6 pb-24">
            <div className="flex flex-col items-center text-center mb-6">
                <BookOpen className="text-blue-500 dark:text-blue-400 mb-2" size={32} />
                <div>
                    <h1 className="text-3xl font-bold dark:text-white">Program Hub</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">Manage, Share, and Discover Programs</p>
                </div>
            </div>

            {/* Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md mb-6">
                 <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Manage Your Program</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <button onClick={handleShareProgram} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                        <Download size={16}/> Share Active Program
                    </button>
                    <button onClick={handleImportClick} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors">
                        <Upload size={16}/> Import Program from File
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".json" style={{ display: 'none' }} />
                 </div>
            </div>

            {/* Preset Programs */}
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
                                <button onClick={() => handlePreview(preset)} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"><Eye size={20}/></button>
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
                                <button 
                                    key={key}
                                    onClick={() => handleSelectProgram(key)}
                                    className="w-full text-left p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex flex-col"
                                >
                                    <span className="font-semibold">{preset.name}</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{preset.info.split}</span>
                                </button>
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
                     ) : step === 5 ? null : ( // Hide buttons on step 5
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
const calculateStreak = (allLogs, programData) => {
    if (!programData) return 0;
    const { weeklySchedule, programStructure, masterExerciseList, info, workoutOrder, settings } = programData;
    let currentStreak = 0;
    let streakBroken = false;
    
    const isDayComplete = (week, dayKey, workoutName) => {
        const workout = getWorkoutForWeek(programData, week, workoutName);
        if (!workout) return false;

        return workout.exercises.every(exName => {
            const exDetails = getExerciseDetails(exName, masterExerciseList);
            if (!exDetails) return false;
            return Array.from({ length: exDetails.sets }, (_, i) => i + 1).every(setNum => {
                const log = allLogs[`${week}-${dayKey}-${exName}-${setNum}`];
                return log?.skipped || ((log?.load === 0 || log?.load) && log?.reps && (log.rir !== undefined && log.rir !== null && log.rir !== ''));
            });
        });
    }

    const hasAnyLogInDay = (week, dayKey, workoutName) => {
        const workout = getWorkoutForWeek(programData, week, workoutName);
        if (!workout) return false;
         return workout.exercises.some(exName => {
             const exDetails = getExerciseDetails(exName, masterExerciseList);
             if (!exDetails) return false;
             return Array.from({ length: exDetails.sets }, (_, i) => i + 1).some(setNum => !!allLogs[`${week}-${dayKey}-${exName}-${setNum}`]);
        });
    }
    
    if (settings.useWeeklySchedule) {
        const sortedDays = [];
        for (let week = 1; week <= info.weeks; week++) {
            for (const day of weeklySchedule) {
                if (day.workout !== 'Rest') {
                    sortedDays.push({ week, day: day.day });
                }
            }
        }
        for (const { week, day } of sortedDays) {
            const workoutName = weeklySchedule.find(d => d.day === day)?.workout;
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
            const dayKey = workoutName;

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
    // --- Core Progress Achievements ---
    total_volume: {
        name: "Total Volume",
        description: "Cumulative weight lifted across all exercises. This is your career tonnage.",
        icon: Weight,
        type: 'tiered',
        tiers: [
            { name: "Bronze", value: 10000, description: "Lifted a total of 10,000 lbs! The journey begins." },
            { name: "Silver", value: 100000, description: "Lifted a total of 100,000 lbs. That's some serious weight!" },
            { name: "Gold", value: 500000, description: "Lifted a total of 500,000 lbs. Incredible strength!" },
            { name: "Platinum", value: 1000000, description: "Joined the 1,000,000 lbs club! Truly elite." },
        ],
        getValue: (logs, program) => Object.values(logs).reduce((sum, log) => sum + getSetVolume(log, program.masterExerciseList), 0),
    },
    volume_volcano: {
        name: "Volume Volcano",
        description: "Set a new personal record for total volume in a single day.",
        icon: TrendingUp,
        type: 'tiered',
        tiers: [
            { name: "Bronze", value: 12000, description: "Lifted over 12,000 lbs in a single workout." },
            { name: "Silver", value: 20000, description: "Lifted over 20,000 lbs in a single workout." },
            { name: "Gold", value: 30000, description: "Lifted over 30,000 lbs in a single workout. A truly volcanic session!" },
        ],
        getValue: (logs, program) => {
            const dailyVolumes = Object.values(logs).reduce((acc, log) => {
                const dayKey = `${log.week}-${log.dayKey}`;
                acc[dayKey] = (acc[dayKey] || 0) + getSetVolume(log, program.masterExerciseList);
                return acc;
            }, {});
            return Math.max(0, ...Object.values(dailyVolumes));
        },
    },
    weekly_avalanche: {
        name: "Weekly Avalanche",
        description: "Set a new personal record for total volume in a single week.",
        icon: TrendingUp,
        type: 'tiered',
        tiers: [
            { name: "Bronze", value: 50000, description: "Lifted over 50,000 lbs in a single week." },
            { name: "Silver", value: 75000, description: "Lifted over 75,000 lbs in a single week." },
            { name: "Gold", value: 100000, description: "Lifted over 100,000 lbs in a single week. An avalanche of gains!" },
        ],
        getValue: (logs, program) => {
            const weeklyVolumes = Object.values(logs).reduce((acc, log) => {
                const weekKey = log.week;
                acc[weekKey] = (acc[weekKey] || 0) + getSetVolume(log, program.masterExerciseList);
                return acc;
            }, {});
            return Math.max(0, ...Object.values(weeklyVolumes));
        },
    },
    bench_press_pr: {
        name: "Bench Press Club",
        description: "Achieve new e1RM milestones in any bench press variation.",
        icon: Trophy,
        type: 'tiered',
        tiers: [
            { name: "135 Club", value: 135, description: "Achieved an e1RM of 135 lbs (a plate!) on bench press." },
            { name: "185 Club", value: 185, description: "Achieved an e1RM of 185 lbs on bench press." },
            { name: "Two Wheels", value: 225, description: "Achieved an e1RM of 225 lbs (two plates!) on bench press." },
            { name: "275 Club", value: 275, description: "Achieved an e1RM of 275 lbs on bench press." },
            { name: "Three Wheels", value: 315, description: "Achieved an e1RM of 315 lbs (three plates!) on bench press." },
        ],
        getValue: (logs) => getMaxE1RMFor(logs, 'bench')
    },
    squat_pr: {
        name: "Squat Club",
        description: "Achieve new e1RM milestones in any squat variation.",
        icon: Trophy,
        type: 'tiered',
        tiers: [
            { name: "135 Club", value: 135, description: "Achieved an e1RM of 135 lbs on the squat." },
            { name: "Two Wheels", value: 225, description: "Achieved an e1RM of 225 lbs (two plates!) on the squat." },
            { name: "Three Wheels", value: 315, description: "Achieved an e1RM of 315 lbs (three plates!) on the squat." },
            { name: "Four Wheels", value: 405, description: "Achieved an e1RM of 405 lbs (four plates!) on the squat." },
        ],
        getValue: (logs) => getMaxE1RMFor(logs, 'squat')
    },
    deadlift_pr: {
        name: "Deadlift Club",
        description: "Achieve new e1RM milestones in any deadlift variation.",
        icon: Trophy,
        type: 'tiered',
        tiers: [
            { name: "Two Wheels", value: 225, description: "Achieved an e1RM of 225 lbs on the deadlift." },
            { name: "Three Wheels", value: 315, description: "Achieved an e1RM of 315 lbs (three plates!) on the deadlift." },
            { name: "Four Wheels", value: 405, description: "Achieved an e1RM of 405 lbs (four plates!) on the deadlift." },
            { name: "Five Wheels", value: 495, description: "Achieved an e1RM of 495 lbs (five plates!) on the deadlift." },
        ],
        getValue: (logs) => getMaxE1RMFor(logs, 'deadlift')
    },
    overhead_overlord: {
        name: "Overhead Overlord",
        description: "Achieve new e1RM milestones in any overhead press variation.",
        icon: Trophy,
        type: 'tiered',
        tiers: [
            { name: "Press Prince", value: 135, description: "Achieved an e1RM of 135 lbs on the overhead press." },
            { name: "Overlord", value: 185, description: "Achieved an e1RM of 185 lbs on the overhead press." },
        ],
        getValue: (logs) => Math.max(0, ...Object.values(logs).filter(l => l.exercise.toLowerCase().includes('press') && !l.exercise.toLowerCase().includes('bench') && !l.exercise.toLowerCase().includes('leg')).map(l => calculateE1RM(l.load, l.reps, l.rir)))
    },
    rep_monster: {
        name: "Rep Monster",
        description: "Set new repetition personal records at a given weight.",
        icon: Repeat,
        type: 'tiered',
        tiers: [
            { name: "Bronze", value: 5, description: "Set 5 new rep PRs." },
            { name: "Silver", value: 25, description: "Set 25 new rep PRs." },
            { name: "Gold", value: 100, description: "Set 100 new rep PRs." },
        ],
        getValue: (logs) => {
            const prs = {}; // { "exercise-load": maxReps }
            let prCount = 0;
            const sortedLogs = Object.values(logs).filter(l => !l.skipped && l.date).sort((a, b) => new Date(a.date) - new Date(b.date));
            
            for (const log of sortedLogs) {
                if ((log.load || log.load === 0) && log.reps) {
                    const key = `${log.exercise}-${log.load}`;
                    const currentReps = parseInt(log.reps, 10);
                    const existingPr = prs[key] || 0;
                    
                    if (currentReps > existingPr) {
                        if(existingPr > 0) { // Only count it as a PR if a previous record existed
                           prCount++;
                        }
                        prs[key] = currentReps;
                    }
                }
            }
            return prCount;
        },
    },
    plate_pr: {
        name: "Plate PR",
        description: "First time using 45lb plates on a barbell movement (135 lbs+).",
        icon: Weight,
        type: 'simple',
        criteria: (logs, program) => Object.values(logs).some(l => {
            const details = getExerciseDetails(l.exercise, program.masterExerciseList);
            return !l.skipped && details?.equipment === 'barbell' && l.load >= 135;
        }),
    },

    // --- Consistency Achievements ---
    workouts_completed: {
        name: "Workouts Completed",
        description: "Total number of workout sessions logged.",
        icon: CheckCircle,
        type: 'tiered',
        tiers: [
            { name: "Bronze", value: 10, description: "Completed 10 workouts. Keep building the habit!" },
            { name: "Silver", value: 50, description: "Completed 50 workouts! You're a regular." },
            { name: "Gold", value: 100, description: "Completed 100 workouts! A true veteran of the iron." },
            { name: "Platinum", value: 250, description: "Completed 250 workouts. This is a lifestyle." },
        ],
        getValue: (logs) => new Set(Object.values(logs).filter(l => l.week && l.dayKey && !l.skipped).map(l => `${l.week}-${l.dayKey}`)).size,
    },
    workout_streak: {
        name: "Workout Streak",
        description: "Consecutive scheduled workouts completed.",
        icon: Flame,
        type: 'tiered',
        tiers: [
            { name: "Bronze", value: 10, description: "Completed 10 workouts in a row without missing a scheduled day." },
            { name: "Silver", value: 30, description: "Maintained a 30-workout streak. Unstoppable!" },
            { name: "Gold", value: 50, description: "Maintained a 50-workout streak. Legendary consistency." },
        ],
        getValue: (logs, program) => calculateStreak(logs, program),
    },
    four_week_flame: {
        name: "4-Week Flame",
        description: "Completed 3 or more sessions per week for 4 straight weeks.",
        icon: Flame,
        type: 'simple',
        criteria: (logs) => {
            const weeklySessions = Object.values(logs).reduce((acc, log) => {
                if (log.week && log.dayKey && !log.skipped) {
                    if (!acc[log.week]) acc[log.week] = new Set();
                    acc[log.week].add(log.dayKey);
                }
                return acc;
            }, {});

            const weeks = Object.keys(weeklySessions).map(Number).sort((a,b) => a-b);
            let consecutiveWeeks = 0;
            for (let i = 0; i < weeks.length; i++) {
                if (weeklySessions[weeks[i]].size >= 3) {
                    if (i > 0 && weeks[i] === weeks[i-1] + 1) {
                        consecutiveWeeks++;
                    } else {
                        consecutiveWeeks = 1;
                    }
                    if (consecutiveWeeks >= 4) return true;
                } else {
                    consecutiveWeeks = 0;
                }
            }
            return false;
        }
    },
    weekend_warrior: {
        name: "Weekend Warrior",
        description: "Completed workouts on both a Saturday and Sunday in the same week.",
        icon: CalendarDays,
        type: 'simple',
        criteria: (logs) => {
            const weeklySessions = Object.values(logs).reduce((acc, log) => {
                if (log.week && log.dayKey && !log.skipped) {
                    if (!acc[log.week]) acc[log.week] = new Set();
                    acc[log.week].add(log.dayKey);
                }
                return acc;
            }, {});
            return Object.values(weeklySessions).some(days => days.has('Sat') && days.has('Sun'));
        }
    },

    // --- Strength Standards Achievements ---
    bodyweight_bench: {
        name: "Bench Buddy",
        description: "Bench press a multiple of your bodyweight.",
        icon: Weight,
        type: 'tiered',
        tiers: [
            { name: "1.0x BW", value: 1.0, description: "Benching your bodyweight is a classic milestone." },
            { name: "1.25x BW", value: 1.25, description: "Benching 1.25x your bodyweight." },
            { name: "1.5x BW", value: 1.5, description: "Benching 1.5x your bodyweight is seriously strong." },
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
            { name: "1.5x BW", value: 1.5, description: "Squatting 1.5x your bodyweight." },
            { name: "2.0x BW", value: 2.0, description: "Squatting 2x your bodyweight. Strong foundation!" },
            { name: "2.5x BW", value: 2.5, description: "Squatting 2.5x your bodyweight is elite." },
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
            { name: "2.0x BW", value: 2.0, description: "Deadlifting 2x your bodyweight." },
            { name: "2.5x BW", value: 2.5, description: "Deadlifting 2.5x your bodyweight. Powerful!" },
            { name: "3.0x BW", value: 3.0, description: "Deadlifting 3x your bodyweight is world-class." },
        ],
        getValue: (logs, program, bodyWeight) => {
            if (!bodyWeight || bodyWeight <= 0) return 0;
            const maxDeadlift = getMaxE1RMFor(logs, 'deadlift');
            return maxDeadlift / bodyWeight;
        }
    },
    pull_up_pro: {
        name: "Pull-up Pro",
        description: "Perform as many unweighted pull-ups as possible in a single set.",
        icon: Award,
        type: 'tiered',
        tiers: [
            { name: "Initiate", value: 5, description: "Completed 5 strict pull-ups." },
            { name: "Pro", value: 10, description: "Completed 10 strict pull-ups." },
            { name: "Elite", value: 15, description: "Completed 15 strict pull-ups." },
            { name: "Master", value: 20, description: "Completed 20 strict pull-ups." },
        ],
        getValue: (logs) => Math.max(0, ...Object.values(logs).filter(l => (l.exercise.toLowerCase().includes('pullup') || l.exercise.toLowerCase().includes('pull-up')) && (!l.load || l.load == 0) && !l.skipped).map(l => parseInt(l.reps, 10) || 0))
    },
    unbroken_20: {
        name: "Unbroken 20",
        description: "Complete a 20-rep squat set with at least 135 lbs.",
        icon: InfinityIcon,
        type: 'simple',
        criteria: (logs) => Object.values(logs).some(l => !l.skipped && l.exercise.toLowerCase().includes('squat') && l.reps >= 20 && l.load >= 135),
    },

    // --- Technique & Quality Achievements ---
    rpe_honesty: {
        name: "RPE Honesty",
        description: "Log your Reps in Reserve (RIR) for your sets.",
        icon: Target,
        type: 'tiered',
        tiers: [
            { name: "Bronze", value: 50, description: "Logged RIR for 50 sets." },
            { name: "Silver", value: 250, description: "Logged RIR for 250 sets." },
            { name: "Gold", value: 1000, description: "Logged RIR for 1000 sets. You're in tune with your body." },
        ],
        getValue: (logs) => Object.values(logs).filter(l => !l.skipped && l.rir !== undefined && l.rir !== null && l.rir !== '').length,
    },
    paused_and_proud: {
        name: "Paused & Proud",
        description: "Log sets for a paused bench press variation.",
        icon: Shield,
        type: 'tiered',
        tiers: [
            { name: "Bronze", value: 10, description: "Completed 10 sets of paused bench press." },
            { name: "Silver", value: 50, description: "Completed 50 sets of paused bench press." },
        ],
        getValue: (logs) => Object.values(logs).filter(l => !l.skipped && l.exercise.toLowerCase().includes('paused') && l.exercise.toLowerCase().includes('bench')).length,
    },
    bail_smart: {
        name: "Bail Smart",
        description: "Hit the target RIR exactly, showing great effort control.",
        icon: CheckCircle,
        type: 'tiered',
        tiers: [
            { name: "Bronze", value: 25, description: "Matched the target RIR on 25 sets." },
            { name: "Silver", value: 100, description: "Matched the target RIR on 100 sets." },
        ],
        getValue: (logs, program) => {
            return Object.values(logs).filter(log => {
                if (log.skipped) return false;
                const details = getExerciseDetails(log.exercise, program.masterExerciseList);
                if (!details || !details.rir || !log.rir) return false;
                const targetRir = details.rir[log.set - 1];
                return targetRir !== undefined && targetRir.toString() === log.rir.toString();
            }).length;
        },
    },

    // --- Program & Meta Achievements ---
    program_complete: { 
        name: "Meso Master", 
        description: "Completed every workout in a full program cycle.", 
        icon: Award, 
        type: 'simple',
        criteria: (logs, program) => {
            if(!program || !program.info || !program.weeklySchedule) return false;
            const totalWorkouts = program.info.weeks * program.weeklySchedule.filter(d => d.workout !== 'Rest').length;
            const completedWorkouts = new Set(Object.values(logs).filter(l => l.week && l.dayKey && !l.skipped).map(l => `${l.week}-${l.dayKey}`)).size;
            return completedWorkouts > 0 && completedWorkouts >= totalWorkouts;
        }
    },
    customizer: { 
        name: "The Architect", 
        description: "Create your own custom exercises to add to your program.", 
        icon: Edit, 
        type: 'tiered',
        tiers: [
            { name: "Apprentice", value: 1, description: "Created your first custom exercise." },
            { name: "Journeyman", value: 5, description: "Created 5 custom exercises." },
            { name: "Master", value: 10, description: "Created 10 custom exercises. You've built a unique arsenal." },
        ],
        getValue: (logs, program) => {
            if(!program || !program.masterExerciseList) return 0;
            const presetExercises = new Set(Object.keys(presets['optimal-ppl-ul'].masterExerciseList));
            return Object.keys(program.masterExerciseList).filter(ex => !presetExercises.has(ex)).length;
        }
    },
};

const AchievementCard = ({ achievementId, achievement, unlockedStatus, currentValue, onClick }) => {
    const { icon: Icon } = achievement;
    let isUnlocked = false;
    let displayName = achievement.name;
    let tierName = null;
    let nextTier = null;
    let progressPercentage = 0;

    if (achievement.type === 'tiered') {
        const unlockedTierIndex = unlockedStatus;
        if (unlockedTierIndex !== undefined && unlockedTierIndex > -1) {
            isUnlocked = true;
            const currentTier = achievement.tiers[unlockedTierIndex];
            tierName = currentTier.name;
            displayName = `${achievement.name} - ${tierName}`;
            if (unlockedTierIndex < achievement.tiers.length - 1) {
                nextTier = achievement.tiers[unlockedTierIndex + 1];
                const prevTierValue = unlockedTierIndex > 0 ? achievement.tiers[unlockedTierIndex - 1].value : 0;
                progressPercentage = Math.min(100, ((currentValue - prevTierValue) / (nextTier.value - prevTierValue)) * 100);
            } else {
                // Max tier reached
                progressPercentage = 100;
            }
        } else {
            // Not unlocked yet, show progress towards the first tier
            nextTier = achievement.tiers[0];
            progressPercentage = Math.min(100, (currentValue / nextTier.value) * 100);
        }
    } else {
        isUnlocked = !!unlockedStatus;
    }

    const tierColors = {
        bronze: { bg: 'bg-amber-100 dark:bg-amber-900/50', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-400', progress: 'bg-amber-500' },
        silver: { bg: 'bg-slate-100 dark:bg-slate-800/50', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-400', progress: 'bg-slate-500' },
        gold: { bg: 'bg-yellow-100 dark:bg-yellow-900/50', text: 'text-yellow-500 dark:text-yellow-400', border: 'border-yellow-500', progress: 'bg-yellow-500' },
        platinum: { bg: 'bg-cyan-100 dark:bg-cyan-900/50', text: 'text-cyan-500 dark:text-cyan-400', border: 'border-cyan-400', progress: 'bg-cyan-500' },
        '1.0x bw': { bg: 'bg-gray-100 dark:bg-gray-800/50', text: 'text-gray-600 dark:text-gray-400', border: 'border-gray-400', progress: 'bg-gray-500' },
        '1.25x bw': { bg: 'bg-gray-100 dark:bg-gray-800/50', text: 'text-gray-600 dark:text-gray-400', border: 'border-gray-400', progress: 'bg-gray-500' },
        '1.5x bw': { bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-600 dark:text-red-400', border: 'border-red-400', progress: 'bg-red-500' },
        '2.0x bw': { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-400', progress: 'bg-blue-500' },
        '2.5x bw': { bg: 'bg-purple-100 dark:bg-purple-900/50', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-400', progress: 'bg-purple-500' },
        '3.0x bw': { bg: 'bg-pink-100 dark:bg-pink-900/50', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-400', progress: 'bg-pink-500' },
        '135 club': { bg: 'bg-gray-100 dark:bg-gray-800/50', text: 'text-gray-600 dark:text-gray-400', border: 'border-gray-400', progress: 'bg-gray-500' },
        '185 club': { bg: 'bg-gray-100 dark:bg-gray-800/50', text: 'text-gray-600 dark:text-gray-400', border: 'border-gray-400', progress: 'bg-gray-500' },
        'two wheels': { bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-600 dark:text-red-400', border: 'border-red-400', progress: 'bg-red-500' },
        '275 club': { bg: 'bg-gray-100 dark:bg-gray-800/50', text: 'text-gray-600 dark:text-gray-400', border: 'border-gray-400', progress: 'bg-gray-500' },
        'three wheels': { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-400', progress: 'bg-blue-500' },
        'four wheels': { bg: 'bg-purple-100 dark:bg-purple-900/50', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-400', progress: 'bg-purple-500' },
        'five wheels': { bg: 'bg-pink-100 dark:bg-pink-900/50', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-400', progress: 'bg-pink-500' },
        'press prince': { bg: 'bg-indigo-100 dark:bg-indigo-900/50', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-400', progress: 'bg-indigo-500' },
        'overlord': { bg: 'bg-violet-100 dark:bg-violet-900/50', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-400', progress: 'bg-violet-500' },
        'initiate': { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-600 dark:text-green-400', border: 'border-green-400', progress: 'bg-green-500' },
        pro: { bg: 'bg-teal-100 dark:bg-teal-900/50', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-400', progress: 'bg-teal-500' },
        elite: { bg: 'bg-emerald-100 dark:bg-emerald-900/50', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-400', progress: 'bg-emerald-500' },
        master: { bg: 'bg-lime-100 dark:bg-lime-900/50', text: 'text-lime-600 dark:text-lime-400', border: 'border-lime-400', progress: 'bg-lime-500' },
        apprentice: { bg: 'bg-gray-100 dark:bg-gray-800/50', text: 'text-gray-600 dark:text-gray-400', border: 'border-gray-400', progress: 'bg-gray-500' },
        journeyman: { bg: 'bg-stone-100 dark:bg-stone-800/50', text: 'text-stone-600 dark:text-stone-400', border: 'border-stone-400', progress: 'bg-stone-500' },
    };

    const colorKey = tierName ? tierName.toLowerCase() : 'default';
    const colorScheme = tierColors[colorKey] || { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500', border: 'border-transparent', progress: 'bg-blue-500' };

    const cardClasses = `p-4 rounded-xl flex flex-col items-center justify-center text-center aspect-square transition-all duration-300 ${isUnlocked ? `${colorScheme.bg} border-2 ${colorScheme.border} shadow-lg` : 'bg-gray-100 dark:bg-gray-800 filter grayscale opacity-60'}`;
    const iconClasses = isUnlocked ? colorScheme.text : 'text-gray-500';
    const textClasses = isUnlocked ? 'text-gray-800 dark:text-gray-200' : 'text-gray-600 dark:text-gray-400';

    return (
        <button onClick={(e) => onClick(e, achievementId)} className={cardClasses}>
            <div className="flex flex-col items-center justify-center flex-grow">
                <Icon size={36} className={iconClasses} />
                <h3 className={`mt-2 font-bold text-sm ${textClasses}`}>{displayName}</h3>
            </div>
            {(nextTier || (isUnlocked && achievement.type === 'tiered')) && (
                 <div className="w-full mt-2 self-end">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div className={`${isUnlocked ? colorScheme.progress : 'bg-blue-500'} h-1.5 rounded-full`} style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                    {nextTier && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {Math.floor(currentValue).toLocaleString()} / {nextTier.value.toLocaleString()}
                    </p>}
                </div>
            )}
        </button>
    );
};

const AchievementsView = ({ unlockedAchievements, historicalLogs, programData, bodyWeight }) => {
    const { openModal, closeModal } = useContext(AppStateContext);

    if (Object.keys(historicalLogs).length === 0) {
        return (
            <div className="p-4 md:p-6 pb-24 text-center flex flex-col items-center justify-center h-full">
                <Award className="text-gray-400 dark:text-gray-500 mb-4" size={48} />
                <h1 className="text-2xl font-bold dark:text-white">Your Journey Starts Here</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">Log your first workout to start unlocking achievements and tracking your progress!</p>
            </div>
        );
    }
    
    const handleShowDescription = (e, id) => {
        e.preventDefault();
        const achievement = achievementsList[id];
        const unlockedStatus = unlockedAchievements[id];
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
                                    <p className="font-bold">{tier.name} ({tier.value.toLocaleString()})</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{tier.description}</p>
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
                <Award className="text-yellow-500 dark:text-yellow-400 mb-2" size={32} />
                <div>
                    <h1 className="text-3xl font-bold dark:text-white">Achievements</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">Your Milestones & Trophies</p>
                </div>
            </div>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(achievementsList).map(([id, achievement]) => (
                    <AchievementCard 
                        key={id}
                        achievementId={id}
                        achievement={achievement}
                        unlockedStatus={unlockedAchievements[id]}
                        currentValue={achievement.getValue ? achievement.getValue(historicalLogs, programData, bodyWeight) : (achievement.criteria ? (achievement.criteria(historicalLogs, programData, bodyWeight) ? 1 : 0) : 0)}
                        onClick={handleShowDescription}
                    />
                ))}
            </div>
        </div>
    );
};


// --- App Structure & Routing ---
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
            <button onClick={() => setSidebarOpen(true)} className="p-2 md:invisible">
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
    const [allLogs, setAllLogs] = useState({});
    const [archivedLogs, setArchivedLogs] = useState([]);
    const [skippedDays, setSkippedDays] = useState({});
    const [programData, setProgramData] = useState(presets['optimal-ppl-ul']);
    const [weightUnit, setWeightUnit] = useState('lbs');
    const [bodyWeight, setBodyWeight] = useState('');
    const { user, db, isLoading, customId, handleSetCustomId } = useContext(FirebaseContext);
    const { setTheme } = useContext(ThemeContext);
    const { openModal, closeModal, addToast } = useContext(AppStateContext);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [activeTimer, setActiveTimer] = useState(null);
    const [unlockedAchievements, setUnlockedAchievements] = useState({});

    useEffect(() => {
        document.title = "Project Overload | Fitness Tracker";
    }, []);

    const handleUpdateAndSave = (updates) => {
        if (db && customId) {
            const userDocRef = doc(db, 'workoutLogs', customId);
            updateDoc(userDocRef, updates);
        }
    };

    const handleProgramDataChange = (newProgramData) => {
        setProgramData(newProgramData);
        // Only save serializable fields to Firestore
        const { name, info, masterExerciseList, programStructure, weeklySchedule, workoutOrder, settings, weeklyOverrides } = newProgramData;
        handleUpdateAndSave({ name, info, masterExerciseList, programStructure, weeklySchedule, workoutOrder, settings, weeklyOverrides });
    };

    const handleProgramUpdate = useCallback((newProgramData) => {
        // When loading a new program, reset overrides
        const programWithResetOverrides = { ...newProgramData, weeklyOverrides: {} };
        handleProgramDataChange(programWithResetOverrides);
        addToast("Program updated successfully!", "success");
    }, [addToast]);

     const handleBodyWeightChange = (newWeight) => {
        setBodyWeight(newWeight);
        handleUpdateAndSave({ bodyWeight: newWeight });
    };
    
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

    // Data loading from Firestore
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
                setUnlockedAchievements(data.unlockedAchievements || {});
                
                const defaultProgram = presets['optimal-ppl-ul'];
                const masterListFromDb = data.masterExerciseList || defaultProgram.masterExerciseList;
                const migratedMasterList = { ...masterListFromDb };
                for (const exName in migratedMasterList) {
                    const exercise = migratedMasterList[exName];
                    if (!Array.isArray(exercise.rir)) {
                        const numSets = parseInt(exercise.sets, 10) || 0;
                        const defaultRirValue = typeof exercise.rir === 'string' ? exercise.rir.split('-')[0].trim() : '0';
                        migratedMasterList[exName].rir = Array(numSets).fill(defaultRirValue);
                    }
                }

                const loadedProgram = {
                    name: data.name || defaultProgram.name,
                    info: data.info || defaultProgram.info,
                    masterExerciseList: migratedMasterList,
                    programStructure: data.programStructure || defaultProgram.programStructure,
                    weeklySchedule: data.weeklySchedule || defaultProgram.weeklySchedule,
                    workoutOrder: data.workoutOrder || defaultProgram.workoutOrder,
                    settings: { ...defaultProgram.settings, ...data.settings },
                    weeklyOverrides: data.weeklyOverrides || {},
                };
                setProgramData(loadedProgram);

            } else { 
                const defaultProgram = presets['optimal-ppl-ul'];
                const initialData = {
                    ...defaultProgram,
                    logs: {}, 
                    skippedDays: {}, 
                    theme: 'dark', 
                    weightUnit: 'lbs',
                    bodyWeight: '',
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
    }, [user, db, customId, setTheme, isLoading, showTutorial]);

    const historicalLogs = useMemo(() => {
        const combined = { ...allLogs };
        archivedLogs.forEach(archive => {
            Object.assign(combined, archive);
        });
        return combined;
    }, [allLogs, archivedLogs]);

    // Achievement checking
    useEffect(() => {
        if (isDataLoading) return;
        const newUnlockedStatus = {};
        for (const id in achievementsList) {
            const achievement = achievementsList[id];
            if (achievement.type === 'tiered') {
                const value = achievement.getValue(historicalLogs, programData, bodyWeight);
                let highestTier = -1;
                achievement.tiers.forEach((tier, index) => {
                    if (value >= tier.value) {
                        highestTier = index;
                    }
                });
                if (highestTier > -1) {
                    newUnlockedStatus[id] = highestTier;
                }
            } else { // Simple boolean achievement
                if (achievement.criteria(historicalLogs, programData, bodyWeight)) {
                    newUnlockedStatus[id] = true;
                }
            }
        }
        
        const newlyAchievedMessages = [];
        for (const id in newUnlockedStatus) {
            const oldStatus = unlockedAchievements[id];
            const newStatus = newUnlockedStatus[id];
            const achievement = achievementsList[id];

            if (oldStatus === undefined && newStatus !== undefined) {
                if (achievement.type === 'tiered' && newStatus > -1) {
                    const tier = achievement.tiers[newStatus];
                    newlyAchievedMessages.push({ message: `New Achievement: ${achievement.name} - ${tier.name}`, level: tier.name.toLowerCase() });
                } else if(achievement.type === 'simple' && newStatus === true) {
                    newlyAchievedMessages.push({ message: `New Achievement: ${achievement.name}`, level: 'gold' });
                }
            } else if (typeof oldStatus === 'number' && typeof newStatus === 'number' && newStatus > oldStatus) {
                const tier = achievement.tiers[newStatus];
                newlyAchievedMessages.push({ message: `Tier Up: ${achievement.name} - ${tier.name}`, level: tier.name.toLowerCase() });
            }
        }
        
        if (newlyAchievedMessages.length > 0) {
            newlyAchievedMessages.forEach(item => addToast(item.message, item.level));
            setUnlockedAchievements(newUnlockedStatus);
            if (db && customId) {
                const userDocRef = doc(db, 'workoutLogs', customId);
                updateDoc(userDocRef, { unlockedAchievements: newUnlockedStatus });
            }
        } else if (Object.keys(newUnlockedStatus).length !== Object.keys(unlockedAchievements).length) {
            setUnlockedAchievements(newUnlockedStatus);
        }
    }, [historicalLogs, programData, bodyWeight, addToast, unlockedAchievements, db, customId, isDataLoading]);


    // Navigation logic
    const navigate = (view, data = {}) => {
        window.history.pushState({ view, data }, '', `#/${view}`);
        setPageState({ view, data });
    };

    useEffect(() => {
        const handlePopState = (event) => {
            const hash = window.location.hash.replace('#/', '');
            const view = hash || 'main';
            setPageState({ view, data: event.state?.data || {} });
        };

        window.addEventListener('popstate', handlePopState);
        const initialHash = window.location.hash.replace('#/', '') || 'main';
        setPageState({ view: initialHash, data: window.history.state?.data || {} });


        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);
    
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
                archivedLogs: arrayUnion(allLogs),
                logs: {},
                skippedDays: {},
                weeklyOverrides: {},
            });
        } else if (db && customId) {
            // Handle case where there are no logs to archive.
            const userDocRef = doc(db, 'workoutLogs', customId);
            updateDoc(userDocRef, {
                logs: {},
                skippedDays: {},
                weeklyOverrides: {},
            });
        }
    };

    const handleTimerEnd = useCallback(() => {
        setActiveTimer(null);
        openModal(
            <div>
                <h2 className="text-3xl font-bold text-center text-green-500">Rest Over!</h2>
                <p className="text-center mt-2">Time to start your next set.</p>
                <div className="flex justify-center mt-6">
                    <button onClick={closeModal} className="px-6 py-2 bg-blue-600 text-white rounded-lg">Let's Go!</button>
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
        const getWorkoutForDay = (w, d) => programData.weeklySchedule.find(s => s.day === d)?.workout;
        for (let week = 1; week <= programData.info.weeks; week++) {
            programData.weeklySchedule.forEach(day => {
                const dayKey = `${week}-${day.day}`;
                const workoutName = getWorkoutForDay(week, day.day);
                const workout = getWorkoutForWeek(programData, week, workoutName);
                const isSkipped = !!skippedDays[dayKey];
                
                if (!workout || workoutName === 'Rest') {
                    status.set(dayKey, { isDayComplete: true, isSkipped: false });
                    return;
                }

                const isDayComplete = workout.exercises.every(exName => {
                    const exDetails = getExerciseDetails(exName, programData.masterExerciseList);
                    if (!exDetails) return false;
                    return Array.from({ length: exDetails.sets }, (_, i) => i + 1).every(setNum => {
                        const log = allLogs[`${dayKey}-${exName}-${setNum}`];
                        return log?.skipped || ((log?.load === 0 || log?.load) && log?.reps && (log.rir !== undefined && log.rir !== null && log.rir !== ''));
                    });
                });
                status.set(dayKey, { isDayComplete, isSkipped });
            });
        }
        return status;
    }, [allLogs, skippedDays, programData]);

    const handleEditWorkout = (week, workoutName) => {
        openModal(<EditChoiceModal onChoice={(type) => {
            closeModal();
            if (type === 'master') {
                navigate('editProgram');
            } else {
                navigate('editWeek', { week, workoutName });
            }
        }}/>);
    }

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
    
    const renderContent = () => {
        if (!customId) {
             return <div/> // The tutorial modal will be forced open, so this view is temporary
        }
        switch(pageState.view) {
            case 'dashboard': return <DashboardView allLogs={allLogs} programData={programData} />;
            case 'lifting': return <LiftingSession {...pageState.data} onBack={() => navigate('main')} allLogs={allLogs} setAllLogs={setAllLogs} onSkipDay={handleSkipDay} programData={programData} weightUnit={weightUnit} onStartTimer={handleStartTimer} />;
            case 'analytics': return <AnalyticsView allLogs={historicalLogs} masterExerciseList={programData.masterExerciseList} />;
            case 'records': return <RecordsView allLogs={historicalLogs} />;
            case 'achievements': return <AchievementsView unlockedAchievements={unlockedAchievements} historicalLogs={historicalLogs} programData={programData} bodyWeight={bodyWeight} />;
            case 'programHub': return <ProgramManagerView onProgramUpdate={handleProgramUpdate} activeProgram={programData} />;
            case 'editProgram': return <EditProgramView programData={programData} onProgramDataChange={handleProgramDataChange} />;
            case 'editWeek': return <EditWeekView {...pageState.data} programData={programData} onProgramDataChange={handleProgramDataChange} onBack={() => navigate('main')} />;
            case 'settings': return <SettingsView allLogs={allLogs} historicalLogs={historicalLogs} weightUnit={weightUnit} onWeightUnitChange={handleWeightUnitChange} onResetMeso={handleResetMeso} programData={programData} onProgramDataChange={handleProgramDataChange} onShowTutorial={showTutorial} bodyWeight={bodyWeight} onBodyWeightChange={handleBodyWeightChange} />;
            default: return <MainView onSessionSelect={(week, day, type, seqIndex) => navigate(type, { week, dayKey: day, sequentialWorkoutIndex: seqIndex })} completedDays={completedDays} onUnskipDay={handleUnskipDay} programData={programData} allLogs={allLogs} onEditWorkout={handleEditWorkout} />;
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

const EditChoiceModal = ({ onChoice }) => {
    return (
        <div>
            <h2 className="text-xl font-bold mb-4">How do you want to edit?</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">You can either change this single workout for this week, or edit the master template for all weeks.</p>
            <div className="space-y-3">
                 <button onClick={() => onChoice('week')} className="w-full text-left p-4 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600">
                    <h3 className="font-bold text-blue-600 dark:text-blue-400">Edit This Week Only</h3>
                    <p className="text-sm">Make a one-time change to this workout session.</p>
                </button>
                 <button onClick={() => onChoice('master')} className="w-full text-left p-4 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600">
                    <h3 className="font-bold">Edit Master Template</h3>
                    <p className="text-sm">Permanently change this workout for all current and future weeks.</p>
                </button>
            </div>
        </div>
    );
}

const EditWeekView = ({ week, workoutName, programData, onProgramDataChange, onBack }) => {
    const { openModal, closeModal } = useContext(AppStateContext);
    const { masterExerciseList } = programData;

    const baseWorkout = getWorkoutForWeek(programData, week, workoutName);
    const [exercises, setExercises] = useState(baseWorkout.exercises);

    const handleReorderExercise = (index, direction) => {
        const newExercises = [...exercises];
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= newExercises.length) return;
        [newExercises[index], newExercises[newIndex]] = [newExercises[newIndex], newExercises[index]];
        setExercises(newExercises);
    };

    const handleDeleteExercise = (exerciseIndex) => {
        const newExercises = [...exercises];
        newExercises.splice(exerciseIndex, 1);
        setExercises(newExercises);
    };

    const handleAddExercise = () => {
         openModal(
            <AddExerciseToWorkoutModal 
                masterExerciseList={masterExerciseList}
                onAdd={(exerciseName) => {
                    setExercises(prev => [...prev, exerciseName]);
                    closeModal();
                }}
                onClose={closeModal}
            />
        )
    };

    const handleSaveChanges = () => {
        const newOverrides = JSON.parse(JSON.stringify(programData.weeklyOverrides || {}));
        if(!newOverrides[week]) {
            newOverrides[week] = {};
        }
        newOverrides[week][workoutName] = { ...baseWorkout, exercises };
        onProgramDataChange({ ...programData, weeklyOverrides: newOverrides });
        onBack();
    };


    return (
         <div className="p-4 md:p-6 pb-24">
            <div className="flex justify-between items-center mb-6">
                <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"><ArrowLeft size={16}/> Back to Program</button>
                 <button onClick={handleSaveChanges} className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <Save size={16} /> Save Changes
                </button>
            </div>
            <div className="text-center mb-6">
                 <h1 className="text-3xl font-bold dark:text-white">Editing Workout</h1>
                 <p className="text-lg text-gray-600 dark:text-gray-400">Week {week} - {workoutName}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
                 <ul className="space-y-2 mb-3">
                    {exercises.map((ex, index) => (
                        <li key={`${ex}-${index}`} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md group">
                            <span className="text-gray-800 dark:text-gray-200">{ex}</span>
                            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                <button onClick={() => handleReorderExercise(index, -1)} disabled={index === 0} className="disabled:opacity-20 p-1 hover:text-gray-900 dark:hover:text-white"><ArrowUp size={16} /></button>
                                <button onClick={() => handleReorderExercise(index, 1)} disabled={index === exercises.length - 1} className="disabled:opacity-20 p-1 hover:text-gray-900 dark:hover:text-white"><ArrowDown size={16} /></button>
                                <button onClick={() => handleDeleteExercise(index)} className="p-1 hover:text-red-600 dark:hover:text-red-400"><XCircle size={16} /></button>
                            </div>
                        </li>
                    ))}
                    {exercises.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 py-2">No exercises yet.</p>}
                </ul>
                 <button onClick={handleAddExercise} className="w-full flex items-center justify-center gap-2 text-sm p-2 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/50">
                    <PlusCircle size={16}/> Add Exercise
                </button>
            </div>
         </div>
    );
};


export default function App() {
    return (
        <FirebaseProvider>
            <ThemeProvider>
                <AppStateProvider>
                    <AppCore />
                </AppStateProvider>
            </ThemeProvider>
        </FirebaseProvider>
    );
}
