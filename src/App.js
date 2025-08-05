import React, { useState, useEffect, useMemo, createContext, useContext, useCallback } from 'react';
import { ChevronDown, ChevronUp, Dumbbell, CheckCircle, ArrowLeft, TrendingUp, BarChart2, Settings, Flame, Repeat, StretchVertical, Lightbulb, Download, XCircle, SkipForward, Menu, X, Search, Trophy, BrainCircuit, PlusCircle, Edit, ArrowUp, ArrowDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Bar, ComposedChart, PieChart, Pie, Cell } from 'recharts';

// Firebase Imports - using modular v9+ syntax
import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";


// --- PROGRAM DATA ---
const programInfo = { name: "Project Overload", weeks: 8, split: "Pull/Push/Legs/Rest/Upper/Lower" };

const initialMasterExerciseList = {
    'Incline DB Press': { sets: 2, reps: '5-7', rir: '1-2', rest: '2-3 min', lastSetTechnique: 'Failure', equipment: 'dumbbell', muscles: { primary: 'Chest', secondary: 'Shoulders' } },
    'Barbell Bench Press': { sets: 2, reps: '5-7', rir: '1-2', rest: '2-3 min', lastSetTechnique: 'Failure', equipment: 'barbell', muscles: { primary: 'Chest', secondary: 'Triceps' } },
    'Pullups': { sets: 4, reps: '5-7', rir: '1-2', rest: '2-3 min', lastSetTechnique: 'Failure', equipment: 'bodyweight', muscles: { primary: 'Back', secondary: 'Biceps' } },
    'DB Lateral Raise': { sets: 3, reps: '8-10', rir: '0-1', rest: '1-2 min', lastSetTechnique: 'Myo-reps', equipment: 'dumbbell', muscles: { primary: 'Shoulders', secondary: null } },
    'Bayesian Cable Curl': { sets: 3, reps: '6-8', rir: '1-2', rest: '1-2 min', lastSetTechnique: 'Failure', equipment: 'machine', muscles: { primary: 'Biceps', secondary: null } },
    'Overhead Triceps Extension': { sets: 3, reps: '6-8', rir: '1-2', rest: '1-2 min', lastSetTechnique: 'Failure', equipment: 'machine', muscles: { primary: 'Triceps', secondary: null } },
    'Smith Machine Squat': { sets: 2, reps: '5-7', rir: '1-2', rest: '2-3 min', lastSetTechnique: 'Failure', equipment: 'machine', muscles: { primary: 'Quads', secondary: 'Glutes' } },
    'Hack Squat': { sets: 2, reps: '5-7', rir: '1-2', rest: '2-3 min', lastSetTechnique: 'Failure', equipment: 'machine', muscles: { primary: 'Quads', secondary: 'Glutes' } },
    'Lying Leg Curl': { sets: 3, reps: '5-7', rir: '1-2', rest: '1-2 min', lastSetTechnique: 'Failure + LLPs', equipment: 'machine', muscles: { primary: 'Hamstrings', secondary: null } },
    'Leg Extensions': { sets: 3, reps: '5-7', rir: '0-1', rest: '1-2 min', lastSetTechnique: 'Failure', equipment: 'machine', muscles: { primary: 'Quads', secondary: null } },
    'Standing Calf Raise': { sets: 4, reps: '5-7', rir: '1-2', rest: '1 min', lastSetTechnique: 'Static Stretch', equipment: 'machine', muscles: { primary: 'Calves', secondary: null } },
    'Cable Crunch': { sets: 3, reps: '10-12', rir: '0-1', rest: '1 min', lastSetTechnique: 'Myo-reps', equipment: 'machine', muscles: { primary: 'Abs', secondary: null } },
    'Chest Supported Row': { sets: 4, reps: '5-7', rir: '1-2', rest: '2-3 min', lastSetTechnique: 'Failure', equipment: 'machine', muscles: { primary: 'Back', secondary: 'Biceps' } },
    'Preacher Curl': { sets: 3, reps: '8-10', rir: '0-1', rest: '1-2 min', lastSetTechnique: 'Failure', equipment: 'barbell', muscles: { primary: 'Biceps', secondary: null } },
    'Pec Flies': { sets: 2, reps: '6-8', rir: '0-1', rest: '1-2 min', lastSetTechnique: 'Failure', equipment: 'machine', muscles: { primary: 'Chest', secondary: null } },
    'Barbell RDL': { sets: 4, reps: '5-7', rir: '1-2', rest: '2-3 min', lastSetTechnique: 'Failure', equipment: 'barbell', muscles: { primary: 'Hamstrings', secondary: 'Glutes' } },
    'DB Bulgarian Split Squat': { sets: 3, reps: '5-7', rir: '1-2', rest: '2 min', lastSetTechnique: 'Failure', equipment: 'dumbbell', muscles: { primary: 'Quads', secondary: 'Glutes' } },
    'Safety Bar Squats': { sets: 2, reps: '5-7', rir: '1-2', rest: '2-3 min', lastSetTechnique: 'Failure', equipment: 'barbell', muscles: { primary: 'Quads', secondary: 'Glutes' } },
    'DB Rows': { sets: 2, reps: '5-7', rir: '1-2', rest: '2-3 min', lastSetTechnique: 'Failure', equipment: 'dumbbell', muscles: { primary: 'Back', secondary: 'Biceps' } },
};

const initialProgramStructure = {
    'Upper (Strength Focus)': { exercises: ['Incline DB Press', 'Pullups', 'DB Rows', 'Barbell Bench Press', 'Bayesian Cable Curl', 'Overhead Triceps Extension'], label: 'Upper' },
    'Lower (Strength Focus)': { exercises: ['Smith Machine Squat', 'Hack Squat', 'Safety Bar Squats', 'Lying Leg Curl', 'Standing Calf Raise', 'Cable Crunch'], label: 'Lower' },
    'Pull (Hypertrophy Focus)': { exercises: ['Chest Supported Row', 'Pullups', 'DB Lateral Raise', 'Preacher Curl'], label: 'Pull' },
    'Push (Hypertrophy Focus)': { exercises: ['Incline DB Press', 'Barbell Bench Press', 'DB Lateral Raise', 'Overhead Triceps Extension', 'Pec Flies'], label: 'Push' },
    'Legs (Hypertrophy Focus)': { exercises: ['DB Bulgarian Split Squat', 'Barbell RDL', 'Leg Extensions', 'Lying Leg Curl', 'Standing Calf Raise'], label: 'Legs' },
};

const weeklySchedule = [
    { day: 'Mon', workout: 'Pull (Hypertrophy Focus)' }, { day: 'Tue', workout: 'Push (Hypertrophy Focus)' },
    { day: 'Wed', workout: 'Legs (Hypertrophy Focus)' }, { day: 'Thu', workout: 'Rest' },
    { day: 'Fri', workout: 'Upper (Strength Focus)' }, { day: 'Sat', workout: 'Lower (Strength Focus)' },
    { day: 'Sun', workout: 'Rest' },
];

const getWorkoutForDay = (week, day) => {
    const schedule = weeklySchedule.find(d => d.day === day);
    if (!schedule || schedule.workout === 'Rest') return null;
    return schedule.workout;
};

const getExerciseDetails = (exerciseName, masterList) => masterList[exerciseName] || null;

// --- Helper Functions & Context ---
const calculateE1RM = (weight, reps, rir) => {
    if (!weight || !reps || reps < 1) return 0;
    const effectiveReps = parseFloat(reps) + (parseFloat(rir) || 0);
    if (effectiveReps <= 1) return parseFloat(weight);
    return Math.round(parseFloat(weight) * (1 + (effectiveReps / 30)));
};

const findLastPerformanceLogs = (exerciseName, currentWeek, currentDayKey, allLogs) => {
    const dayOrder = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
    const currentDayNum = (currentWeek - 1) * 7 + dayOrder[currentDayKey];
    let lastSession = null;
    let lastDayNum = -1;
    for (const logId in allLogs) {
        const log = allLogs[logId];
        if (log.exercise === exerciseName && log.load && log.reps) {
            const logDayNum = (log.week - 1) * 7 + dayOrder[log.dayKey];
            if (logDayNum < currentDayNum && logDayNum > lastDayNum) {
                lastDayNum = logDayNum;
                lastSession = { week: log.week, dayKey: log.dayKey };
            }
        }
    }
    if (!lastSession) return null;
    const logsForSession = Object.values(allLogs).filter(log => log.exercise === exerciseName && log.week === lastSession.week && log.dayKey === lastSession.dayKey);
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

    const [minRepsStr, maxRpsStr] = exerciseDetails.reps.split('-');
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

    const openModal = (content) => setModalContent(content);
    const closeModal = () => setModalContent(null);

    const value = {
        isSidebarOpen,
        setSidebarOpen,
        modalContent,
        openModal,
        closeModal,
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
    if (!technique || technique === 'Failure') return null;
    let icon = <Flame size={14} className="text-red-500" />;
    if (technique.includes('LLP')) icon = <StretchVertical size={14} className="text-blue-500" />;
    if (technique.includes('Myo-reps')) icon = <Repeat size={14} className="text-purple-500" />;
    if (technique.includes('Stretch')) icon = <StretchVertical size={14} className="text-green-500" />;
    return (<div className="mt-2 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-md">{icon}<div><span className="font-semibold">Last Set:</span> {technique}</div></div>);
};

const SetRow = ({ set, logData, onLogChange, lastSetData, exerciseDetails }) => {
    const targetEffort = set.number === exerciseDetails.sets ? 'To Failure' : `~${exerciseDetails.rir} RIR`;
    return (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 items-center py-2 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
            <div className="text-sm font-bold text-gray-800 dark:text-gray-200 col-span-3 sm:col-span-1">Set {set.number}</div>
            <div className="hidden sm:block text-sm text-center text-gray-600 dark:text-gray-400">{exerciseDetails.reps}</div>
            <div className="hidden sm:block text-sm text-center font-medium text-blue-600 dark:text-blue-400">{targetEffort}</div>
            <div>
                <label className="sm:hidden text-xs text-gray-500">Load</label>
                <input type="number" placeholder={lastSetData?.load || "kg/lbs"} value={logData.load || ''} onChange={(e) => onLogChange(set.number, 'load', e.target.value)} className="w-full p-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"/>
            </div>
            <div>
                <label className="sm:hidden text-xs text-gray-500">Reps</label>
                <input type="number" placeholder={lastSetData?.reps || "Reps"} value={logData.reps || ''} onChange={(e) => onLogChange(set.number, 'reps', e.target.value)} className="w-full p-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"/>
            </div>
            <div>
                <label className="sm:hidden text-xs text-gray-500">RIR</label>
                <input type="number" placeholder={lastSetData?.rir ?? "RIR"} value={logData.rir || ''} onChange={(e) => onLogChange(set.number, 'rir', e.target.value)} className="w-full p-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"/>
            </div>
        </div>
    );
};


const ExerciseCard = ({ exerciseName, week, dayKey, allLogs, onLogChange, masterExerciseList }) => {
    const exercise = getExerciseDetails(exerciseName, masterExerciseList);
    const sets = Array.from({ length: exercise?.sets || 0 }, (_, i) => i + 1);
    const isCompleted = sets.every(setNumber => {
        const log = allLogs[`${week}-${dayKey}-${exerciseName}-${setNumber}`];
        return log?.load && log?.reps;
    });

    const [isOpen, setIsOpen] = useState(!isCompleted);
    
    useEffect(() => {
        if (isCompleted) {
            setIsOpen(false);
        }
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
                    <p className="text-sm text-gray-500 dark:text-gray-400">{exercise.sets} sets x {exercise.reps}</p>
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
                        <div className="hidden sm:grid grid-cols-6 gap-2 mb-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 min-w-[480px]">
                            <span></span>
                            <span className="text-center">Target Reps</span>
                            <span className="text-center">Target Effort</span>
                            <span className="text-center">Load</span>
                            <span className="text-center">Reps</span>
                            <span className="text-center">RIR</span>
                        </div>
                        <div className="space-y-2 min-w-[480px]">
                            {sets.map(setNumber => (
                                <SetRow 
                                    key={setNumber} 
                                    set={{ number: setNumber }} 
                                    logData={allLogs[`${week}-${dayKey}-${exerciseName}-${setNumber}`] || {}} 
                                    onLogChange={(setNum, field, val) => onLogChange(exerciseName, setNum, field, val)}
                                    lastSetData={lastPerformance ? lastPerformance[setNumber] : null}
                                    exerciseDetails={exercise}
                                />
                            ))}
                        </div>
                    </div>
                    <IntensityTechnique technique={exercise.lastSetTechnique} />
                </div>
            )}
        </div>
    );
};

const LiftingSession = ({ week, dayKey, onBack, allLogs, setAllLogs, onSkipDay, programStructure, masterExerciseList }) => {
    const { db, customId } = useContext(FirebaseContext);
    const workoutName = getWorkoutForDay(week, dayKey);
    const workout = programStructure[workoutName];

    const handleLogChange = (exerciseName, setNumber, field, value) => {
        const logId = `${week}-${dayKey}-${exerciseName}-${setNumber}`;
        const newLogEntry = {
            ...(allLogs[logId] || { week, dayKey, session: workoutName, exercise: exerciseName, set: setNumber, date: new Date().toISOString() }),
            [field]: value
        };
        
        setAllLogs(prev => ({ ...prev, [logId]: newLogEntry }));

        if (db && customId) {
            const userDocRef = doc(db, 'workoutLogs', customId);
            updateDoc(userDocRef, { [`logs.${logId}`]: newLogEntry });
        }
    };

    if (!workout) return <div>Workout not found</div>;

    return (
        <div className="p-4 md:p-6 pb-24">
            <div className="flex justify-between items-center mb-4">
                <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"><ArrowLeft size={16}/> Back to Program</button>
                <button onClick={() => onSkipDay(week, dayKey)} className="flex items-center gap-2 text-sm font-medium text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/50 px-3 py-1.5 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"><SkipForward size={16}/> Skip Day</button>
            </div>
            <div className="mb-6">
                <h2 className="text-3xl font-bold dark:text-white">Week {week}: {dayKey}</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">{workoutName}</p>
            </div>
            <div className="space-y-4">
                {workout.exercises.map(exName => <ExerciseCard key={exName} exerciseName={exName} week={week} dayKey={dayKey} allLogs={allLogs} onLogChange={handleLogChange} programStructure={programStructure} masterExerciseList={masterExerciseList}/>)}
            </div>
        </div>
    );
};

const WeekView = ({ week, completedDays, onSessionSelect, firstIncompleteWeek, onUnskipDay, programStructure }) => {
    const isWeekComplete = useMemo(() => weeklySchedule.every(day => day.workout === 'Rest' || completedDays.get(`${week}-${day.day}`)?.isDayComplete), [week, completedDays]);
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
                        const workoutName = getWorkoutForDay(week, day.day);
                        const workoutDetails = programStructure[workoutName];
                        const isRestDay = !workoutName;
                        
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
                                        <button onClick={() => onSessionSelect(week, day.day, 'lifting')} className="w-full flex items-center justify-between text-xs p-1.5 rounded bg-white dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 shadow-sm transition-colors">
                                            <div className="flex items-center gap-1 font-semibold">{workoutDetails?.label || 'Workout'}</div>
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

const ProgressBar = ({ completed, total }) => {
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Program Progress</span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

const StreakCounter = ({ streak }) => {
    const getStreakColor = (s) => {
        if (s < 5) return 'text-orange-400';
        if (s < 10) return 'text-orange-500';
        if (s < 20) return 'text-red-500';
        return 'text-red-600';
    };

    return (
        <div className="text-center">
            <div className={`text-3xl font-bold ${getStreakColor(streak)}`}>{streak}</div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Day Streak</div>
        </div>
    );
};

const MainView = ({ onSessionSelect, onNavChange, completedDays, onUnskipDay, programStructure }) => {
    const weeks = Array.from({ length: programInfo.weeks }, (_, i) => i + 1);
    
    const { totalWorkouts, completedWorkouts, streak } = useMemo(() => {
        let total = 0;
        let completed = 0;
        let currentStreak = 0;
        let streakBroken = false;

        for (let week = 1; week <= programInfo.weeks; week++) {
            for (const day of weeklySchedule) {
                if (day.workout !== 'Rest') {
                    total++;
                    const status = completedDays.get(`${week}-${day.day}`);
                    if (status?.isDayComplete && !status?.isSkipped) {
                        completed++;
                        if (!streakBroken) {
                            currentStreak++;
                        }
                    } else if (!status?.isSkipped) {
                        streakBroken = true;
                    }
                }
            }
        }
        return { totalWorkouts: total, completedWorkouts: completed, streak: currentStreak };
    }, [completedDays]);

    const firstIncompleteWeek = useMemo(() => {
        for (let w = 1; w <= programInfo.weeks; w++) {
            if (!weeklySchedule.every(d => d.workout === 'Rest' || completedDays.get(`${w}-${d.day}`)?.isDayComplete)) return w;
        }
        return programInfo.weeks + 1;
    }, [completedDays]);

    return (
        <div className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                <div className="flex items-center">
                    <Dumbbell className="text-blue-500 dark:text-blue-400 mr-4" size={48} />
                    <div>
                        <h1 className="text-3xl font-bold dark:text-white">{programInfo.name}</h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400">Your 8-Week Plan</p>
                    </div>
                </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6 flex justify-around items-center">
                <div className="flex-grow pr-4">
                    <ProgressBar completed={completedWorkouts} total={totalWorkouts} />
                </div>
                <div className="border-l border-gray-200 dark:border-gray-700 pl-4">
                     <StreakCounter streak={streak} />
                </div>
            </div>

            <div className="space-y-4 pb-24">
                {weeks.map(week => (
                    <WeekView key={week} week={week} completedDays={completedDays} onSessionSelect={onSessionSelect} firstIncompleteWeek={firstIncompleteWeek} onUnskipDay={onUnskipDay} programStructure={programStructure} />
                ))}
            </div>
        </div>
    );
};


const SettingsView = ({ onBack, allLogs }) => {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const { customId, handleSetCustomId } = useContext(FirebaseContext);
    const [exportSelection, setExportSelection] = useState('all');
    const [tempId, setTempId] = useState(customId);

    const exportData = (logsToExport, filename) => {
        if (Object.keys(logsToExport).length === 0) { 
            alert("No data available to export for this selection."); 
            return; 
        }
        const dayOrder = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
        const sortedLogs = Object.values(logsToExport).filter(log => log.exercise).sort((a, b) => ((a.week - 1) * 7 + dayOrder[a.dayKey]) - ((b.week - 1) * 7 + dayOrder[b.dayKey]) || a.set - b.set);
        const headers = ['Week', 'Day', 'Session', 'Exercise', 'Set', 'Load', 'Reps', 'RIR', 'e1RM'];
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
        if (exportSelection === 'all') { exportData(allLogs, 'project_overload_all_data.csv'); return; }
        const [type, value] = exportSelection.split(':');
        let logsToExport = {};
        if (type === 'week') {
            logsToExport = Object.fromEntries(Object.entries(allLogs).filter(([, log]) => log.week?.toString() === value));
        } else if (type === 'workout') {
            const [week, dayKey] = value.split('-');
            logsToExport = Object.fromEntries(Object.entries(allLogs).filter(([, log]) => log.week?.toString() === week && log.dayKey === dayKey));
        }
        exportData(logsToExport, `project_overload_${type}_${value.replace('-', '_')}_data.csv`);
    };

    const hasLogs = Object.values(allLogs).some(log => log.exercise);
    
    const exportOptions = useMemo(() => {
        if (!hasLogs) return { weeks: [], workouts: [] };
        const logs = Object.values(allLogs).filter(log => log.exercise);
        const dayOrder = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
        const loggedWeeks = [...new Set(logs.map(log => log.week))].sort((a, b) => a - b);
        const loggedWorkouts = [...new Set(logs.map(log => `workout:${log.week}-${log.dayKey}`))].sort((a, b) => {
            const [, weekA, dayA] = a.split(/-|:/);
            const [, weekB, dayB] = b.split(/-|:/);
            return ((parseInt(weekA) - 1) * 7 + dayOrder[dayA]) - ((parseInt(weekB) - 1) * 7 + dayOrder[dayB]);
        });
        return { weeks: loggedWeeks, workouts: loggedWorkouts };
    }, [allLogs, hasLogs]);

    return (
        <div className="p-4 md:p-6 pb-24">
            <div className="flex items-center mb-6"><Settings className="text-blue-500 dark:text-blue-400 mr-3" size={32} /><div><h1 className="text-3xl font-bold dark:text-white">Settings</h1></div></div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md space-y-6">
                <div className="flex justify-between items-center"><span className="font-semibold dark:text-gray-200">Dark Mode</span><button onClick={toggleTheme} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200'}`}><span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} /></button></div>
                <div className="border-t border-gray-200 dark:border-gray-700"></div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">User Profile</h3>
                    <div className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg space-y-3">
                        <div>
                            <label htmlFor="customIdInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Personal Sync ID</label>
                            <input id="customIdInput" type="text" value={tempId} onChange={e => setTempId(e.target.value)} placeholder="Enter a memorable ID" className="w-full p-2 bg-white dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600 shadow-sm" />
                        </div>
                        <button onClick={() => handleSetCustomId(tempId)} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors">Set & Sync</button>
                    </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700"></div>
                <div><h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Data Management</h3><div className="flex flex-col sm:flex-row gap-4 items-center"><select value={exportSelection} onChange={(e) => setExportSelection(e.target.value)} className="w-full sm:w-auto flex-grow p-2 bg-white dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600 shadow-sm" disabled={!hasLogs}><option value="all">All Data</option>{exportOptions.weeks?.length > 0 && (<optgroup label="By Week">{exportOptions.weeks.map(w => <option key={`week-${w}`} value={`week:${w}`}>Week {w}</option>)}</optgroup>)}{exportOptions.workouts?.length > 0 && (<optgroup label="By Single Workout">{exportOptions.workouts.map(w_key => { const [, week, day] = w_key.split(/-|:/); return (<option key={w_key} value={w_key}>Week {week} - {day}</option>);})}</optgroup>)}</select><button onClick={handleExport} disabled={!hasLogs} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"><Download size={16} /> Export CSV</button></div></div>
            </div>
        </div>
    );
};

const AnalyticsView = ({ allLogs, masterExerciseList }) => {
    const [selectedExercise, setSelectedExercise] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const uniqueExercises = useMemo(() => Object.keys(masterExerciseList).sort(), [masterExerciseList]);
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
        const dayOrder = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
        const sessions = Object.values(allLogs).reduce((acc, log) => {
            if (log.exercise === selectedExercise && log.load && log.reps) {
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
    }, [selectedExercise, allLogs]);


    const weeklyVolume = useMemo(() => {
        const volumeByWeek = {};
        Object.values(allLogs).forEach(log => {
            if (log.load && log.reps && log.week) {
                const volume = log.load * log.reps;
                if (!volumeByWeek[log.week]) {
                    volumeByWeek[log.week] = 0;
                }
                volumeByWeek[log.week] += volume;
            }
        });
        return Object.entries(volumeByWeek).map(([week, volume]) => ({
            week: `Week ${week}`,
            volume: Math.round(volume)
        })).sort((a, b) => parseInt(a.week.split(' ')[1]) - parseInt(b.week.split(' ')[1]));
    }, [allLogs]);

    const muscleGroupData = useMemo(() => {
        const dataByMuscle = {};

        const ensureMuscle = (muscle) => {
            if (muscle && !dataByMuscle[muscle]) {
                dataByMuscle[muscle] = { volume: 0, sets: 0 };
            }
        };

        Object.values(allLogs).forEach(log => {
            if (log.load && log.reps && log.exercise) {
                const exerciseDetails = getExerciseDetails(log.exercise, masterExerciseList);
                if (exerciseDetails && exerciseDetails.muscles) {
                    const volume = log.load * log.reps;
                    const { primary, secondary } = exerciseDetails.muscles;
                    
                    ensureMuscle(primary);
                    if(primary) {
                        dataByMuscle[primary].volume += volume;
                        dataByMuscle[primary].sets += 1;
                    }

                    ensureMuscle(secondary);
                    if(secondary) {
                        dataByMuscle[secondary].volume += volume * 0.5;
                        dataByMuscle[secondary].sets += 1;
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
    }, [allLogs, masterExerciseList]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF42A1', '#42A1FF'];

    return (
        <div className="p-4 md:p-6 pb-24">
            <div className="flex items-center mb-6">
                <BarChart2 className="text-blue-500 dark:text-blue-400 mr-3" size={32} />
                <div>
                    <h1 className="text-3xl font-bold dark:text-white">Analytics</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">Your Performance Breakdown</p>
                </div>
            </div>

            <div className="space-y-8">
                 <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
                    <h3 className="font-semibold dark:text-gray-200 mb-4">Total Weekly Volume Over Time</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={weeklyVolume}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                            <XAxis dataKey="week" tick={{ fill: '#9ca3af' }} />
                            <YAxis tick={{ fill: '#9ca3af' }} />
                            <Tooltip contentStyle={{ backgroundColor: 'var(--tooltip-bg)', border: '1px solid var(--tooltip-border)' }} />
                            <Legend />
                            <Line type="monotone" dataKey="volume" stroke="#8884d8" name="Total Volume" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
                     <h3 className="font-semibold dark:text-gray-200 mb-4">Individual Exercise Progression</h3>
                     <div className="mb-6 space-y-4">
                        <div>
                            <label htmlFor="exercise-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search Exercise:</label>
                            <input id="exercise-search" type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="e.g., Bench Press" className="w-full p-2 bg-white dark:bg-gray-800 rounded-md border-gray-300 dark:border-gray-600 shadow-sm"/>
                        </div>
                        <div>
                            <label htmlFor="exercise-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Exercise:</label>
                            <select id="exercise-select" value={selectedExercise} onChange={e => setSelectedExercise(e.target.value)} className="w-full p-2 bg-white dark:bg-gray-800 rounded-md border-gray-300 dark:border-gray-600 shadow-sm">
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
                    <h3 className="font-semibold dark:text-gray-200 mb-4">Muscle Group Distribution</h3>
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div className="w-full aspect-square">
                             <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={muscleGroupData} dataKey="volume" nameKey="name" cx="50%" cy="50%" outerRadius="80%" fill="#8884d8" label={({ name, volumePercentage }) => `${name} ${volumePercentage}%`}>
                                        {muscleGroupData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value, name, props) => [`${props.payload.volumePercentage}%`, 'Volume']} />
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
                </div>
            </div>
        </div>
    );
};

const RecordsView = ({ allLogs }) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    const personalRecords = useMemo(() => {
        const records = {};
        Object.values(allLogs).forEach(log => {
            if (log.load && log.reps) {
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
            <div className="flex items-center mb-6">
                <Trophy className="text-yellow-500 dark:text-yellow-400 mr-3" size={32} />
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
                        className="w-full p-2 pl-10 bg-white dark:bg-gray-800 rounded-md border-gray-300 dark:border-gray-600 shadow-sm"
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

const EditProgramView = ({ programStructure, onProgramUpdate, masterExerciseList, onMasterListUpdate }) => {
    const { openModal, closeModal } = useContext(AppStateContext);

    const handleReorderExercise = (workoutName, index, direction) => {
        const newProgramStructure = JSON.parse(JSON.stringify(programStructure));
        const exercises = newProgramStructure[workoutName].exercises;
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= exercises.length) return;
        [exercises[index], exercises[newIndex]] = [exercises[newIndex], exercises[index]]; // Swap
        onProgramUpdate(newProgramStructure);
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
                    onMasterListUpdate(newMasterList);
                    onProgramUpdate(newProgramStructure);
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
                    onMasterListUpdate({ ...masterExerciseList, [newName]: newExercise });
                    closeModal();
                }}
                onClose={closeModal}
            />
        );
    };
    
    const handleAddExerciseToWorkout = (workoutName) => {
        openModal(
            <AddExerciseToWorkoutModal 
                masterExerciseList={masterExerciseList}
                onAdd={(exerciseToAdd) => {
                    const newProgramStructure = JSON.parse(JSON.stringify(programStructure));
                    newProgramStructure[workoutName].exercises.push(exerciseToAdd);
                    onProgramUpdate(newProgramStructure);
                    closeModal();
                }}
                onClose={closeModal}
            />
        )
    };

    const handleDeleteExerciseFromWorkout = (workoutName, exerciseIndex) => {
         const newProgramStructure = JSON.parse(JSON.stringify(programStructure));
         newProgramStructure[workoutName].exercises.splice(exerciseIndex, 1);
         onProgramUpdate(newProgramStructure);
    };

    return (
        <div className="p-4 md:p-6 pb-24">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <Edit className="text-blue-500 dark:text-blue-400 mr-3" size={32} />
                    <div>
                        <h1 className="text-3xl font-bold dark:text-white">Edit Program</h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400">Customize Your Workouts</p>
                    </div>
                </div>
                <button onClick={handleCreateNewExercise} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                    <PlusCircle size={16} /> Create Exercise
                </button>
            </div>

            <div className="space-y-4">
                {Object.entries(programStructure).map(([workoutName, workoutDetails]) => (
                    <div key={workoutName} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{workoutName}</h3>
                            <button onClick={() => handleAddExerciseToWorkout(workoutName)} className="p-1 text-blue-500 hover:text-blue-700"><PlusCircle size={20}/></button>
                        </div>
                        <ul className="space-y-1">
                            {workoutDetails.exercises.map((ex, index) => (
                                <li key={`${workoutName}-${ex}-${index}`} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md group">
                                    <span className="text-gray-800 dark:text-gray-200">{ex}</span>
                                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                        <button onClick={() => handleReorderExercise(workoutName, index, -1)} disabled={index === 0} className="disabled:opacity-20 hover:text-gray-900 dark:hover:text-white"><ArrowUp size={16} /></button>
                                        <button onClick={() => handleReorderExercise(workoutName, index, 1)} disabled={index === workoutDetails.exercises.length - 1} className="disabled:opacity-20 hover:text-gray-900 dark:hover:text-white"><ArrowDown size={16} /></button>
                                        <button onClick={() => handleEditExerciseDetails(ex)} className="hover:text-blue-600 dark:hover:text-blue-400"><Edit size={16} /></button>
                                        <button onClick={() => handleDeleteExerciseFromWorkout(workoutName, index)} className="hover:text-red-600 dark:hover:text-red-400"><XCircle size={16} /></button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

const EditExerciseModal = ({ exercise, exerciseName, onSave, onClose }) => {
    const [details, setDetails] = useState({
        name: exerciseName || '',
        sets: exercise?.sets || 3,
        reps: exercise?.reps || '8-12',
        rir: exercise?.rir || '1-2',
        rest: exercise?.rest || '2-3 min',
        lastSetTechnique: exercise?.lastSetTechnique || 'Failure',
        equipment: exercise?.equipment || 'barbell',
        muscles: {
            primary: exercise?.muscles?.primary || '',
            secondary: exercise?.muscles?.secondary || ''
        }
    });

    const isNew = !exerciseName;

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'primary' || name === 'secondary') {
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
        const finalDetails = isNew ? details : { ...otherDetails };
        onSave(finalDetails, name);
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">{isNew ? 'Create New Exercise' : `Editing ${exerciseName}`}</h2>
            <div className="space-y-4">
                <input type="text" name="name" value={details.name} onChange={handleChange} placeholder="Exercise Name" className="w-full p-2 bg-white dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600" />
                <div className="grid grid-cols-3 gap-4">
                    <input type="number" name="sets" value={details.sets} onChange={handleChange} placeholder="Sets" className="w-full p-2 bg-white dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600" />
                    <input type="text" name="reps" value={details.reps} onChange={handleChange} placeholder="Reps (e.g., 8-12)" className="w-full p-2 bg-white dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600" />
                    <input type="text" name="rir" value={details.rir} onChange={handleChange} placeholder="RIR (e.g., 1-2)" className="w-full p-2 bg-white dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600" />
                </div>
                <input type="text" name="rest" value={details.rest} onChange={handleChange} placeholder="Rest (e.g., 2-3 min)" className="w-full p-2 bg-white dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600" />
                <input type="text" name="lastSetTechnique" value={details.lastSetTechnique} onChange={handleChange} placeholder="Last Set Technique" className="w-full p-2 bg-white dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600" />
                <div className="grid grid-cols-2 gap-4">
                    <input type="text" name="primary" value={details.muscles.primary} onChange={handleChange} placeholder="Primary Muscle" className="w-full p-2 bg-white dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600" />
                    <input type="text" name="secondary" value={details.muscles.secondary} onChange={handleChange} placeholder="Secondary Muscle" className="w-full p-2 bg-white dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600" />
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
    const filteredExercises = useMemo(() => {
        return Object.keys(masterExerciseList).filter(ex => ex.toLowerCase().includes(searchTerm.toLowerCase())).sort();
    }, [searchTerm, masterExerciseList]);

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Add Exercise to Workout</h2>
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
            <div className="max-h-60 overflow-y-auto space-y-2">
                {filteredExercises.map(ex => (
                    <button
                        key={ex}
                        onClick={() => onAdd(ex)}
                        className="w-full text-left p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                       <PlusCircle size={16} /> {ex}
                    </button>
                ))}
            </div>
             <div className="flex justify-end gap-2 mt-6">
                <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg">Cancel</button>
            </div>
        </div>
    )
}


// --- App Structure & Routing ---
const AppHeader = ({ onNavChange }) => {
    const { isSidebarOpen, setSidebarOpen } = useContext(AppStateContext);
    return (
        <header className="bg-white dark:bg-gray-800/80 backdrop-blur-sm shadow-sm sticky top-0 z-40 p-4 flex justify-between items-center">
            <button onClick={() => setSidebarOpen(true)} className="p-2">
                <Menu />
            </button>
            <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">{programInfo.name}</h1>
            <div className="w-8"></div> {/* Placeholder for balance */}
        </header>
    );
};

const Sidebar = ({ onNavChange, currentPage }) => {
    const { isSidebarOpen, setSidebarOpen } = useContext(AppStateContext);
    const navItems = [
        { label: 'Program', view: 'main', icon: Dumbbell },
        { label: 'Analytics', view: 'analytics', icon: BarChart2 },
        { label: 'Records', view: 'records', icon: Trophy },
        { label: 'Edit Program', view: 'editProgram', icon: Edit },
        { label: 'App Settings', view: 'settings', icon: Settings },
    ];

    return (
        <>
            <div className={`fixed inset-0 bg-black/60 z-40 transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setSidebarOpen(false)}></div>
            <div className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg z-50 transform transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                    <h2 className="font-bold text-lg">Menu</h2>
                    <button onClick={() => setSidebarOpen(false)} className="p-2"><X /></button>
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={closeModal}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="flex justify-end -mt-2 -mr-2">
                    <button onClick={closeModal} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><X size={20} /></button>
                </div>
                <div className="mt-2">
                    {modalContent}
                </div>
            </div>
        </div>
    );
};


const AppCore = () => {
    const [pageState, setPageState] = useState({ view: 'main', data: {} });
    const [allLogs, setAllLogs] = useState({});
    const [skippedDays, setSkippedDays] = useState({});
    const [programStructure, setProgramStructure] = useState(initialProgramStructure);
    const [masterExerciseList, setMasterExerciseList] = useState(initialMasterExerciseList);
    const { user, db, isLoading, customId } = useContext(FirebaseContext);
    const { setTheme } = useContext(ThemeContext);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const { openModal, closeModal } = useContext(AppStateContext);

    // Data loading from Firestore
    useEffect(() => {
        if (!user || !db || !customId) {
            setAllLogs({});
            setSkippedDays({});
            setProgramStructure(initialProgramStructure);
            setMasterExerciseList(initialMasterExerciseList);
            if (!isLoading) setIsDataLoading(false);
            return;
        }
        setIsDataLoading(true);
        const userDocRef = doc(db, 'workoutLogs', customId);
        const unsubscribe = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setAllLogs(data.logs || {});
                setSkippedDays(data.skippedDays || {});
                setTheme(data.theme || 'dark');
                setProgramStructure(data.programStructure || initialProgramStructure);
                setMasterExerciseList(data.masterExerciseList || initialMasterExerciseList);
            } else { // First time user with this ID
                setDoc(userDocRef, { 
                    logs: {}, 
                    skippedDays: {}, 
                    theme: 'dark', 
                    programStructure: initialProgramStructure,
                    masterExerciseList: initialMasterExerciseList
                });
            }
            setIsDataLoading(false);
        }, (error) => {
            console.error("Error fetching data from Firestore:", error);
            setIsDataLoading(false);
        });
        return () => unsubscribe();
    }, [user, db, customId, setTheme, isLoading]);

    // Missed day detection
    useEffect(() => {
        if (isDataLoading) return;

        const lastLogDateStr = Object.values(allLogs).reduce((latest, log) => {
            return log.date && log.date > latest ? log.date : latest;
        }, null);

        if (!lastLogDateStr) return;

        const lastLogDate = new Date(lastLogDateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        lastLogDate.setHours(0, 0, 0, 0);

        const diffTime = today - lastLogDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 1) {
            openModal(
                <div>
                    <h3 className="text-lg font-bold">Welcome Back!</h3>
                    <p>You missed {diffDays - 1} day(s). What would you like to do?</p>
                    <div className="flex justify-end gap-2 mt-4">
                        <button onClick={closeModal} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg">Decide Later</button>
                        <button onClick={() => {
                            closeModal();
                        }} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Skip and Continue</button>
                    </div>
                </div>
            );
        }
    }, [isDataLoading, allLogs, openModal, closeModal]);

    // Navigation logic
    const navigate = (view, data = {}) => {
        setPageState({ view, data });
    };

    const handleUpdateAndSave = (updates) => {
        if (db && customId) {
            const userDocRef = doc(db, 'workoutLogs', customId);
            updateDoc(userDocRef, updates);
        }
    };
    
    const handleProgramUpdate = (newProgramStructure) => {
        setProgramStructure(newProgramStructure);
        handleUpdateAndSave({ programStructure: newProgramStructure });
    };

    const handleMasterListUpdate = (newMasterList) => {
        setMasterExerciseList(newMasterList);
        handleUpdateAndSave({ masterExerciseList: newMasterList });
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

    const completedDays = useMemo(() => {
        const status = new Map();
        for (let week = 1; week <= programInfo.weeks; week++) {
            weeklySchedule.forEach(day => {
                const dayKey = `${week}-${day.day}`;
                const workoutName = getWorkoutForDay(week, day.day);
                const workout = programStructure[workoutName];
                const isSkipped = !!skippedDays[dayKey];
                
                if (!workout) {
                    status.set(dayKey, { isDayComplete: true, isSkipped: false });
                    return;
                }

                const isDayComplete = workout.exercises.every(exName => {
                    const exDetails = getExerciseDetails(exName, masterExerciseList);
                    if (!exDetails) return false;
                    return Array.from({ length: exDetails.sets }, (_, i) => i + 1).every(setNum => {
                        const log = allLogs[`${dayKey}-${exName}-${setNum}`];
                        return log?.load && log?.reps;
                    });
                });
                status.set(dayKey, { isDayComplete, isSkipped });
            });
        }
        return status;
    }, [allLogs, skippedDays, programStructure, masterExerciseList]);

    if (isLoading || (customId && isDataLoading)) {
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
            return <SettingsView onBack={() => {}} allLogs={{}} />;
        }
        switch(pageState.view) {
            case 'lifting': return <LiftingSession {...pageState.data} onBack={() => navigate('main')} allLogs={allLogs} setAllLogs={setAllLogs} onSkipDay={handleSkipDay} programStructure={programStructure} masterExerciseList={masterExerciseList} />;
            case 'analytics': return <AnalyticsView allLogs={allLogs} masterExerciseList={masterExerciseList} />;
            case 'records': return <RecordsView allLogs={allLogs} />;
            case 'editProgram': return <EditProgramView programStructure={programStructure} onProgramUpdate={handleProgramUpdate} masterExerciseList={masterExerciseList} onMasterListUpdate={handleMasterListUpdate} />;
            case 'settings': return <SettingsView onBack={() => navigate('main')} allLogs={allLogs} />;
            default: return <MainView onSessionSelect={(week, day, type) => navigate(type, { week, dayKey: day })} onNavChange={navigate} completedDays={completedDays} onUnskipDay={handleUnskipDay} programStructure={programStructure} />;
        }
    };

    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen font-sans text-gray-900 dark:text-gray-100">
            <Sidebar onNavChange={navigate} currentPage={pageState.view} />
            <div className="flex flex-col min-h-screen">
                <AppHeader onNavChange={navigate} />
                <main className="flex-grow">
                    <div className="container mx-auto max-w-4xl">{renderContent()}</div>
                </main>
            </div>
             <Modal />
        </div>
    );
}

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
