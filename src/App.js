import React, { useState, useEffect, useMemo, createContext, useContext, useCallback } from 'react';
import { ChevronDown, ChevronUp, Dumbbell, CheckCircle, ArrowLeft, TrendingUp, BarChart2, Sun, Moon, Settings, Flame, Repeat, StretchVertical, Lightbulb, Download, LogOut, User } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Firebase Imports - using modular v9+ syntax
import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, setDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signInAnonymously, signOut } from "firebase/auth";


// --- PROGRAM DATA (Unchanged) ---
const programInfo = { name: "Booty Warrior Program", weeks: 8, split: "Pull/Push/Legs/Rest/Upper/Lower" };
const exercises = {
    'Incline DB Press': { sets: 4, reps: '6-10', rest: '2-3 min', lastSetTechnique: 'Failure', equipment: 'dumbbell' },
    'Barbell Bench Press': { sets: 2, reps: '5-8', rest: '2-3 min', lastSetTechnique: 'Failure', equipment: 'barbell' },
    'Pullups': { sets: 4, reps: '6-10', rest: '2-3 min', lastSetTechnique: 'Failure', equipment: 'bodyweight' },
    'DB Lateral Raise': { sets: 3, reps: '12-15', rest: '1-2 min', lastSetTechnique: 'Myo-reps', equipment: 'dumbbell' },
    'Bayesian Cable Curl': { sets: 3, reps: '10-12', rest: '1-2 min', lastSetTechnique: 'Failure', equipment: 'machine' },
    'Overhead Cable Triceps Extension': { sets: 3, reps: '10-12', rest: '1-2 min', lastSetTechnique: 'Failure', equipment: 'machine' },
    'Smith Machine Squat': { sets: 2, reps: '6-8', rest: '2-3 min', lastSetTechnique: 'Failure', equipment: 'machine' }, 
    'Hack Squat': { sets: 2, reps: '6-8', rest: '2-3 min', lastSetTechnique: 'Failure', equipment: 'machine' }, 
    'Lying Leg Curl': { sets: 3, reps: '10-12', rest: '1-2 min', lastSetTechnique: 'Failure + LLPs', equipment: 'machine' },
    'Leg Extensions': { sets: 3, reps: '10-15', rest: '1-2 min', lastSetTechnique: 'Failure', equipment: 'machine' },
    'Standing Calf Raise': { sets: 4, reps: '10-15', rest: '1 min', lastSetTechnique: 'Static Stretch', equipment: 'machine' }, 
    'Cable Crunch': { sets: 3, reps: '10-15', rest: '1 min', lastSetTechnique: 'Myo-reps', equipment: 'machine' },
    'Chest Supported Row': { sets: 4, reps: '6-8', rest: '2-3 min', lastSetTechnique: 'Failure', equipment: 'machine' }, 
    'Preacher Curl': { sets: 3, reps: '12-15', rest: '1-2 min', lastSetTechnique: 'Failure', equipment: 'barbell' }, 
    'Pec Flies': { sets: 2, reps: '10-15', rest: '1-2 min', lastSetTechnique: 'Failure', equipment: 'machine' },
    'EZ-Bar Skull Crusher': { sets: 3, reps: '10-12', rest: '1-2 min', lastSetTechnique: 'Failure', equipment: 'barbell' },
    'Barbell RDL': { sets: 4, reps: '8-10', rest: '2-3 min', lastSetTechnique: 'Failure', equipment: 'barbell' },
    'DB Bulgarian Split Squat': { sets: 3, reps: '8-12', rest: '2 min', lastSetTechnique: 'Failure', equipment: 'dumbbell' },
};
const programStructure = {
    'Upper (Strength Focus)': { exercises: ['Incline DB Press', 'Pullups', 'DB Lateral Raise', 'Barbell Bench Press', 'Bayesian Cable Curl', 'Overhead Cable Triceps Extension'] },
    'Lower (Strength Focus)': { exercises: ['Smith Machine Squat', 'Hack Squat', 'Lying Leg Curl', 'Standing Calf Raise', 'Cable Crunch'] },
    'Pull (Hypertrophy Focus)': { exercises: ['Chest Supported Row', 'Pullups', 'DB Lateral Raise', 'Preacher Curl'] },
    'Push (Hypertrophy Focus)': { exercises: ['Incline DB Press', 'Barbell Bench Press', 'DB Lateral Raise', 'EZ-Bar Skull Crusher', 'Pec Flies'] },
    'Legs (Hypertrophy Focus)': { exercises: ['DB Bulgarian Split Squat', 'Barbell RDL', 'Leg Extensions', 'Lying Leg Curl', 'Standing Calf Raise'] },
};
const weeklySchedule = [
    { day: 'Mon', workout: 'Pull (Hypertrophy Focus)' }, { day: 'Tue', workout: 'Push (Hypertrophy Focus)' },
    { day: 'Wed', workout: 'Legs (Hypertrophy Focus)' }, { day: 'Thu', workout: 'Rest' },
    { day: 'Fri', workout: 'Upper (Strength Focus)' }, { day: 'Sat', workout: 'Lower (Strength Focus)' },
    { day: 'Sun', workout: 'Rest' },
];

const getWorkoutForDay = (week, day) => weeklySchedule.find(d => d.day === day)?.workout || null;
const getExerciseDetails = (exerciseName) => exercises[exerciseName] || null;

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

const getProgressionSuggestion = (exerciseName, lastPerformance) => {
    if (!lastPerformance) return "Log your first set to get a baseline.";
    const exerciseDetails = getExerciseDetails(exerciseName);
    const lastSets = Object.values(lastPerformance);
    const topSet = lastSets.reduce((best, current) => (!best || calculateE1RM(current.load, current.reps, current.rir) > calculateE1RM(best.load, best.reps, best.rir) ? current : best), null);
    if (!topSet) return "Log your first set to get a baseline.";
    const [minReps, maxReps] = exerciseDetails.reps.split('-').map(Number);
    const lastReps = parseInt(topSet.reps, 10);
    const lastWeight = parseFloat(topSet.load);
    const lastRir = parseInt(topSet.rir, 10) || 0;
    if (lastReps + lastRir >= maxReps) {
        let increment = 5;
        if (exerciseDetails.equipment === 'dumbbell') increment = 5;
        if (exerciseDetails.equipment === 'machine') increment = 10;
        if (exerciseDetails.equipment === 'bodyweight') return `Aim for ${lastReps + 1} reps or add weight.`;
        const newWeight = lastWeight + increment;
        return `Try ${newWeight} lbs/kg for ${minReps}-${minReps + 2} reps.`;
    }
    return `Aim for ${lastReps + 1} reps with ${lastWeight} lbs/kg.`;
};

// --- Firebase Context ---
const FirebaseContext = createContext(null);

const FirebaseProvider = ({ children }) => {
    const [firebaseServices, setFirebaseServices] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const firebaseConfig = {
            apiKey: "AIzaSyDVa7T9j2UxbURwEtwGfJne8OpbFmIYrds",
            authDomain: "booty-warrior.firebaseapp.com",
            projectId: "booty-warrior",
            storageBucket: "booty-warrior.firebasestorage.app",
            messagingSenderId: "690053281718",
            appId: "1:690053281718:web:1b8327379d2dce4b6ab317",
            measurementId: "G-7Z18JX39Q6"
        };
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);
        setFirebaseServices({ auth, db });

        const unsubscribe = onAuthStateChanged(auth, user => {
            if (user) {
                setUserId(user.uid);
            } else {
                signInAnonymously(auth).catch(error => {
                    console.error("Anonymous sign-in failed", error);
                    setIsLoading(false);
                });
            }
        });
        return () => unsubscribe();
    }, []);

    const handleSignOut = () => {
        if (firebaseServices?.auth) {
            signOut(firebaseServices.auth).catch(error => {
                console.error("Sign out failed", error);
            });
        }
    };

    const value = { ...firebaseServices, userId, isLoading, setIsLoading, handleSignOut };

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
    const { userId, db } = useContext(FirebaseContext) || {};

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme(prev => {
            const newTheme = prev === 'light' ? 'dark' : 'light';
            if (userId && db) {
                const userDocRef = doc(db, 'workoutLogs', userId);
                setDoc(userDocRef, { theme: newTheme }, { merge: true });
            }
            return newTheme;
        });
    }, [userId, db]);

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

const SetRow = ({ set, logData, onLogChange, lastSetData }) => (<div className="grid grid-cols-6 gap-2 items-center py-2 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-md"><div className="text-sm font-bold text-gray-800 dark:text-gray-200">Set {set.number}</div><div className="text-sm text-center text-gray-600 dark:text-gray-400">{set.reps}</div><div className="text-sm text-center font-medium text-blue-600 dark:text-blue-400">{set.effort}</div><div><input type="number" placeholder={lastSetData?.load || "kg/lbs"} value={logData.load || ''} onChange={(e) => onLogChange(set.number, 'load', e.target.value)} className="w-full p-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"/></div><div><input type="number" placeholder={lastSetData?.reps || "Reps"} value={logData.reps || ''} onChange={(e) => onLogChange(set.number, 'reps', e.target.value)} className="w-full p-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"/></div><div><input type="number" placeholder={lastSetData?.rir ?? "RIR"} value={logData.rir || ''} onChange={(e) => onLogChange(set.number, 'rir', e.target.value)} className="w-full p-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"/></div></div>);

const ExerciseCard = ({ exerciseName, week, dayKey, allLogs, onLogChange }) => {
    const [isOpen, setIsOpen] = useState(true);
    const exercise = getExerciseDetails(exerciseName);
    if (!exercise) return null;
    const lastPerformance = useMemo(() => findLastPerformanceLogs(exerciseName, week, dayKey, allLogs), [exerciseName, week, dayKey, allLogs]);
    const suggestion = useMemo(() => getProgressionSuggestion(exerciseName, lastPerformance), [exerciseName, lastPerformance]);
    const sets = Array.from({ length: exercise.sets }, (_, i) => i + 1);
    const isCompleted = sets.every(setNumber => allLogs[`${week}-${dayKey}-${exerciseName}-${setNumber}`]?.load && allLogs[`${week}-${dayKey}-${exerciseName}-${setNumber}`]?.reps);
    return (<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"><button onClick={() => setIsOpen(!isOpen)} className="w-full p-4 text-left flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><div><h3 className="text-lg font-semibold text-gray-900 dark:text-white">{exerciseName}</h3><p className="text-sm text-gray-500 dark:text-gray-400">{exercise.sets} sets x {exercise.reps}</p></div><div className="flex items-center space-x-3">{isCompleted && <CheckCircle className="text-green-500" />}{isOpen ? <ChevronUp className="text-gray-500 dark:text-gray-400" /> : <ChevronDown className="text-gray-500 dark:text-gray-400" />}</div></button>{isOpen && (<div className="p-4"><div className="mb-3 p-3 flex items-center gap-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg"><Lightbulb className="text-blue-500 dark:text-blue-400 flex-shrink-0" size={20}/><p className="text-sm text-blue-800 dark:text-blue-200"><span className="font-bold">Suggestion:</span> {suggestion}</p></div><div className="overflow-x-auto"><div className="grid grid-cols-6 gap-2 mb-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 min-w-[480px]"><span></span><span className="text-center">Target Reps</span><span className="text-center">Target Effort</span><span className="text-center">Load</span><span className="text-center">Reps</span><span className="text-center">RIR</span></div><div className="space-y-2 min-w-[480px]">{sets.map(setNumber => (<SetRow key={setNumber} set={{ number: setNumber, reps: exercise.reps, effort: setNumber === exercise.sets ? 'To Failure' : '~1-2 RIR' }} logData={allLogs[`${week}-${dayKey}-${exerciseName}-${setNumber}`] || {}} onLogChange={(setNum, field, val) => onLogChange(exerciseName, setNum, field, val)} lastSetData={lastPerformance ? lastPerformance[setNumber] : null}/>))}</div></div><IntensityTechnique technique={exercise.lastSetTechnique} /></div>)}</div>);
};

const LiftingSession = ({ week, dayKey, onBack, allLogs, setAllLogs }) => {
    const workoutName = getWorkoutForDay(week, dayKey);
    const workout = programStructure[workoutName];
    const handleLogChange = (exerciseName, setNumber, field, value) => {
        const logId = `${week}-${dayKey}-${exerciseName}-${setNumber}`;
        setAllLogs(prev => ({...prev, [logId]: {...(prev[logId] || { week, dayKey, session: workoutName, exercise: exerciseName, set: setNumber }), [field]: value }}));
    };
    if (!workout) return <div>Workout not found</div>;
    return (<div className="p-4 md:p-6 pb-24"><button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 mb-4 hover:underline"><ArrowLeft size={16}/> Back to Program</button><div className="mb-6"><h2 className="text-3xl font-bold dark:text-white">Week {week}: {dayKey}</h2><p className="text-lg text-gray-600 dark:text-gray-400">{workoutName}</p></div><div className="space-y-4">{workout.exercises.map(exName => <ExerciseCard key={exName} exerciseName={exName} week={week} dayKey={dayKey} allLogs={allLogs} onLogChange={handleLogChange} />)}</div></div>);
};

const WeekView = ({ week, completedDays, onSessionSelect, firstIncompleteWeek }) => {
    const isWeekComplete = useMemo(() => weeklySchedule.every(day => day.workout === 'Rest' || completedDays.get(`${week}-${day.day}`)?.isDayComplete), [week, completedDays]);
    const [isOpen, setIsOpen] = useState(week === firstIncompleteWeek);
    useEffect(() => {
        if (isWeekComplete) setIsOpen(false);
        else if (week === firstIncompleteWeek) setIsOpen(true);
    }, [isWeekComplete, firstIncompleteWeek, week]);
    return (<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4"><button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left"><h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Week {week}</h3><div className="flex items-center gap-2">{isWeekComplete && <CheckCircle className="text-green-500" />}{isOpen ? <ChevronUp className="text-gray-500 dark:text-gray-400" /> : <ChevronDown className="text-gray-500 dark:text-gray-400" />}</div></button>{isOpen && (<div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-4">{weeklySchedule.map(day => { const dayKey = `${week}-${day.day}`; const status = completedDays.get(dayKey); const workoutName = getWorkoutForDay(week, day.day); const isRestDay = !workoutName; return (<div key={dayKey} className={`rounded-lg p-3 flex flex-col justify-between transition-all ${isRestDay ? 'bg-indigo-100 dark:bg-indigo-900/50' : status?.isDayComplete ? 'bg-green-100 dark:bg-green-800/50 border border-green-500/50' : status?.pm ? 'bg-yellow-100 dark:bg-yellow-800/50 border border-yellow-500/50' : 'bg-gray-100 dark:bg-gray-700/50'}`}><div className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-2">{day.day}</div><div className="space-y-2 flex-grow flex flex-col justify-end">{!isRestDay ? (<button onClick={() => onSessionSelect(week, day.day, 'lifting')} className="w-full flex items-center justify-between text-xs p-1.5 rounded bg-white dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 shadow-sm transition-colors"><div className="flex items-center gap-1 font-semibold"><Moon size={12} className="text-blue-500"/> PM</div>{status?.pm ? <CheckCircle size={14} className="text-green-500"/> : <Dumbbell size={14} className="text-blue-500"/>}</button>) : <div className="text-center text-xs font-semibold text-indigo-700 dark:text-indigo-300 h-7 flex items-center justify-center">REST</div>}</div></div>);})}</div>)}</div>);
};

const MainView = ({ onSessionSelect, onNavChange, completedDays }) => {
    const weeks = Array.from({ length: programInfo.weeks }, (_, i) => i + 1);
    const firstIncompleteWeek = useMemo(() => {
        for (let w = 1; w <= programInfo.weeks; w++) {
            if (!weeklySchedule.every(d => d.workout === 'Rest' || completedDays.get(`${w}-${d.day}`)?.isDayComplete)) return w;
        }
        return programInfo.weeks + 1; 
    }, [completedDays]);
    return (<div className="p-4 md:p-6"><div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4"><div className="flex items-center"><Dumbbell className="text-blue-500 dark:text-blue-400 mr-3" size={36} /><div><h1 className="text-3xl font-bold dark:text-white">{programInfo.name}</h1><p className="text-lg text-gray-600 dark:text-gray-400">Your 8-Week Plan</p></div></div><div className="flex gap-2 w-full sm:w-auto"><button onClick={() => onNavChange('dashboard')} className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"><BarChart2 size={16} /> <span className="sm:hidden">Dashboard</span></button><button onClick={() => onNavChange('settings')} className="p-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"><Settings size={16} /></button></div></div><div className="space-y-4 pb-24">{weeks.map(week => (<WeekView key={week} week={week} completedDays={completedDays} onSessionSelect={onSessionSelect} firstIncompleteWeek={firstIncompleteWeek} />))}</div></div>);
};

const SettingsView = ({ onBack, allLogs }) => {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const { userId, handleSignOut } = useContext(FirebaseContext);
    const [exportSelection, setExportSelection] = useState('all');

    const exportData = (logsToExport, filename) => {
        if (Object.keys(logsToExport).length === 0) { alert("No data available to export for this selection."); return; }
        const dayOrder = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
        const sortedLogs = Object.values(logsToExport).sort((a, b) => ((a.week - 1) * 7 + dayOrder[a.dayKey]) - ((b.week - 1) * 7 + dayOrder[b.dayKey]) || a.set - b.set);
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
        if (exportSelection === 'all') { exportData(allLogs, 'booty_warrior_all_data.csv'); return; }
        const [type, value] = exportSelection.split(':');
        let logsToExport = {};
        if (type === 'week') {
            logsToExport = Object.fromEntries(Object.entries(allLogs).filter(([, log]) => log.week.toString() === value));
        } else if (type === 'workout') {
            const [week, dayKey] = value.split('-');
            logsToExport = Object.fromEntries(Object.entries(allLogs).filter(([, log]) => log.week.toString() === week && log.dayKey === dayKey));
        }
        exportData(logsToExport, `booty_warrior_${type}_${value.replace('-', '_')}_data.csv`);
    };

    const hasLogs = Object.keys(allLogs).length > 0;
    
    const exportOptions = useMemo(() => {
        const logs = Object.values(allLogs);
        if (logs.length === 0) {
            return { weeks: [], workouts: [] };
        }
    
        const dayOrder = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
        const loggedWeeks = [...new Set(logs.map(log => log.week))].sort((a, b) => a - b);
        const loggedWorkouts = [...new Set(logs.map(log => `workout:${log.week}-${log.dayKey}`))].sort((a, b) => {
            const [, weekA, dayA] = a.split(/-|:/);
            const [, weekB, dayB] = b.split(/-|:/);
            return ((parseInt(weekA) - 1) * 7 + dayOrder[dayA]) - ((parseInt(weekB) - 1) * 7 + dayOrder[dayB]);
        });
        return { weeks: loggedWeeks, workouts: loggedWorkouts };
    }, [allLogs]);

    return (<div className="p-4 md:p-6 pb-24"><button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 mb-4 hover:underline"><ArrowLeft size={16}/> Back to Program</button><div className="flex items-center mb-6"><Settings className="text-blue-500 dark:text-blue-400 mr-3" size={32} /><div><h1 className="text-3xl font-bold dark:text-white">Settings</h1></div></div><div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md space-y-6"><div className="flex justify-between items-center"><span className="font-semibold dark:text-gray-200">Dark Mode</span><button onClick={toggleTheme} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200'}`}><span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} /></button></div><div className="border-t border-gray-200 dark:border-gray-700"></div><div><h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Data Management</h3><div className="flex flex-col sm:flex-row gap-4 items-center"><select value={exportSelection} onChange={(e) => setExportSelection(e.target.value)} className="w-full sm:w-auto flex-grow p-2 bg-white dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600 shadow-sm" disabled={!hasLogs}><option value="all">All Data</option>{exportOptions.weeks?.length > 0 && (<optgroup label="By Week">{exportOptions.weeks.map(w => <option key={`week-${w}`} value={`week:${w}`}>Week {w}</option>)}</optgroup>)}{exportOptions.workouts?.length > 0 && (<optgroup label="By Single Workout">{exportOptions.workouts.map(w_key => { const [, week, day] = w_key.split(/-|:/); return (<option key={w_key} value={w_key}>Week {week} - {day}</option>);})}</optgroup>)}</select><button onClick={handleExport} disabled={!hasLogs} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"><Download size={16} /> Export CSV</button></div></div><div className="border-t border-gray-200 dark:border-gray-700"></div><div><h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Account</h3><div className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg space-y-3"><div className="flex items-center gap-3"><User className="text-gray-500 dark:text-gray-400" size={20} /><p className="text-sm text-gray-600 dark:text-gray-300 break-all"><strong>User ID:</strong> {userId || 'Loading...'}</p></div><button onClick={handleSignOut} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-colors"><LogOut size={16} /> Sign Out & Start New Program</button></div></div></div></div>);
};

const DashboardView = ({ onBack, allLogs }) => {
    const [selectedExercise, setSelectedExercise] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const uniqueExercises = useMemo(() => Object.keys(exercises).sort(), []);
    const filteredExercises = useMemo(() => uniqueExercises.filter(ex => ex.toLowerCase().includes(searchTerm.toLowerCase())), [uniqueExercises, searchTerm]);
    useEffect(() => {
        if (filteredExercises.length > 0 && !filteredExercises.includes(selectedExercise)) setSelectedExercise(filteredExercises[0]);
        else if (filteredExercises.length === 0 && selectedExercise !== '') setSelectedExercise('');
        else if (filteredExercises.length > 0 && selectedExercise === '') setSelectedExercise(filteredExercises[0]);
    }, [filteredExercises, selectedExercise]);
    const chartData = useMemo(() => {
        if (!selectedExercise || !allLogs) return [];
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
        return processedData.sort((a, b) => { const [wA, dA] = a.sessionLabel.substring(1).split(' '); const [wB, dB] = b.sessionLabel.substring(1).split(' '); return wA - wB || dayOrder[dA] - dayOrder[dB]; });
    }, [selectedExercise, allLogs]);
    return (<div className="p-4 md:p-6 pb-24"><button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 mb-4 hover:underline"><ArrowLeft size={16} /> Back to Program</button><div className="flex items-center mb-6"><TrendingUp className="text-blue-500 dark:text-blue-400 mr-3" size={32} /><div><h1 className="text-3xl font-bold dark:text-white">Dashboard</h1><p className="text-lg text-gray-600 dark:text-gray-400">Track Your Progress</p></div></div><div className="mb-6 space-y-4"><div><label htmlFor="exercise-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search Exercise:</label><input id="exercise-search" type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="e.g., Bench Press" className="w-full p-2 bg-white dark:bg-gray-800 rounded-md border-gray-300 dark:border-gray-600 shadow-sm"/></div><div><label htmlFor="exercise-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Exercise:</label><select id="exercise-select" value={selectedExercise} onChange={e => setSelectedExercise(e.target.value)} className="w-full p-2 bg-white dark:bg-gray-800 rounded-md border-gray-300 dark:border-gray-600 shadow-sm">{filteredExercises.map(ex => <option key={ex} value={ex}>{ex}</option>)}</select></div></div>{chartData.length > 0 ? (<div className="space-y-8"><div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 w-full aspect-video"><h3 className="font-semibold dark:text-gray-200 mb-4">RIR-Adjusted e1RM Progression</h3><ResponsiveContainer><LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" /><XAxis dataKey="sessionLabel" tick={{ fill: 'var(--text-color-secondary)' }} /><YAxis domain={[dataMin => Math.max(0, Math.floor(dataMin * 0.9)), 'auto']} tick={{ fill: 'var(--text-color-secondary)' }} /><Tooltip contentStyle={{ backgroundColor: 'var(--tooltip-bg)', border: '1px solid var(--tooltip-border)' }} /><Legend /><Line type="monotone" dataKey="e1RM" name="e1RM" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} /></LineChart></ResponsiveContainer></div><div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 w-full aspect-video"><h3 className="font-semibold dark:text-gray-200 mb-4">Load & Reps for Top Set</h3><ResponsiveContainer><LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" /><XAxis dataKey="sessionLabel" tick={{ fill: 'var(--text-color-secondary)' }} /><YAxis yAxisId="left" stroke="#8884d8" label={{ value: 'Load', angle: -90, position: 'insideLeft', fill: '#8884d8' }} domain={[dataMin => Math.max(0, Math.floor(dataMin * 0.9)), 'auto']} tick={{ fill: '#8884d8' }} /><YAxis yAxisId="right" orientation="right" stroke="#82ca9d" label={{ value: 'Reps', angle: 90, position: 'insideRight', fill: '#82ca9d' }} domain={[dataMin => Math.max(0, Math.floor(dataMin * 0.8)), 'auto']} allowDecimals={false} tick={{ fill: '#82ca9d' }} /><Tooltip contentStyle={{ backgroundColor: 'var(--tooltip-bg)', border: '1px solid var(--tooltip-border)' }} /><Legend /><Line yAxisId="left" type="monotone" dataKey="load" name="Load" stroke="#8884d8" /><Line yAxisId="right" type="monotone" dataKey="reps" name="Reps" stroke="#82ca9d" /></LineChart></ResponsiveContainer></div></div>) : (<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 w-full aspect-video flex flex-col justify-center items-center text-center"><BarChart2 size={48} className="text-gray-400 dark:text-gray-500 mb-4" /><h3 className="font-semibold text-xl dark:text-gray-200">No Data Yet</h3><p className="text-gray-500 dark:text-gray-400">{selectedExercise ? `Log some sets for ${selectedExercise} to see your progress.` : 'Select an exercise to view your charts.'}</p></div>)}</div>);
};

// --- App Structure & Routing ---
const AppCore = () => {
    const [pageState, setPageState] = useState({ view: 'main', data: {} });
    const [allLogs, setAllLogs] = useState({});
    const { db, userId, isLoading, setIsLoading } = useContext(FirebaseContext);
    const { setTheme } = useContext(ThemeContext);

    // Data loading from Firestore
    useEffect(() => {
        if (!userId || !db) return;
        setIsLoading(true);
        const userDocRef = doc(db, 'workoutLogs', userId);
        const unsubscribe = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setAllLogs(data.logs || {});
                setTheme(data.theme || 'dark');
            } else {
                setAllLogs({});
                setTheme('dark');
            }
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching data from Firestore:", error);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [userId, db, setTheme, setIsLoading]);

    // Debounced data saving to Firestore
    useEffect(() => {
        if (isLoading || !userId || !db) return; // Don't save on initial load
        const handler = setTimeout(() => {
            const userDocRef = doc(db, 'workoutLogs', userId);
            setDoc(userDocRef, { logs: allLogs }, { merge: true });
        }, 2000); // Debounce for 2 seconds
        return () => clearTimeout(handler);
    }, [allLogs, userId, db, isLoading]);

    // Navigation logic
    useEffect(() => {
        const handlePopState = (event) => setPageState(event.state || { view: 'main', data: {} });
        window.addEventListener('popstate', handlePopState);
        window.history.replaceState({ view: 'main', data: {} }, '');
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const navigate = (view, data = {}) => {
        const newPageState = { view, data };
        window.history.pushState(newPageState, '', `#${view}`);
        setPageState(newPageState);
    };

    const completedDays = useMemo(() => {
        const status = new Map();
        for (let week = 1; week <= programInfo.weeks; week++) {
            weeklySchedule.forEach(day => {
                const dayKey = `${week}-${day.day}`;
                const workoutName = getWorkoutForDay(week, day.day);
                const workout = programStructure[workoutName];
                
                if (!workout) {
                    status.set(dayKey, { pm: false, isDayComplete: true });
                    return;
                }

                const pmCompleted = workout.exercises.every(exName => {
                    const exDetails = getExerciseDetails(exName);
                    if (!exDetails) return false;
                    return Array.from({ length: exDetails.sets }, (_, i) => i + 1).every(setNum => {
                        const log = allLogs[`${dayKey}-${exName}-${setNum}`];
                        return log?.load && log?.reps;
                    });
                });
                status.set(dayKey, { pm: pmCompleted, isDayComplete: pmCompleted });
            });
        }
        return status;
    }, [allLogs]);

    if (isLoading) {
        return (
            <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex justify-center items-center">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-white mt-4">Loading Your Program...</p>
                </div>
            </div>
        );
    }
    
    const renderContent = () => {
        switch(pageState.view) {
            case 'lifting': return <LiftingSession {...pageState.data} onBack={() => window.history.back()} allLogs={allLogs} setAllLogs={setAllLogs} />;
            case 'dashboard': return <DashboardView onBack={() => window.history.back()} allLogs={allLogs} />;
            case 'settings': return <SettingsView onBack={() => window.history.back()} allLogs={allLogs} />;
            default: return <MainView onSessionSelect={(week, day, type) => navigate(type, { week, dayKey: day })} onNavChange={navigate} completedDays={completedDays} />;
        }
    };

    return (<div className="bg-gray-100 dark:bg-gray-900 min-h-screen font-sans text-gray-900 dark:text-gray-100"><div className="container mx-auto max-w-4xl">{renderContent()}</div></div>);
}

export default function App() {
    return (
        <FirebaseProvider>
            <ThemeProvider>
                <AppCore />
            </ThemeProvider>
        </FirebaseProvider>
    );
}
