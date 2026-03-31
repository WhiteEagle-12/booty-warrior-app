import React, { useMemo } from 'react';
import { LayoutDashboard, BrainCircuit } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getWorkoutForWeek, getWorkoutNameForDay } from '../utils/workout';
import { getExerciseDetails, getSetVolume, isSetLogComplete } from '../utils/helpers';
import { calculateStreak } from '../utils/formatters';
import { ProgressBar } from '../components/common/ProgressBar';
import { StreakCounter } from '../components/common/StreakCounter';

export const DashboardView = ({ allLogs, programData, bodyWeightHistory }) => {
    const { masterExerciseList, weeklySchedule, info, settings, workoutOrder } = programData;

    const { totalSets, completedSets, streak, firstIncompleteWeek } = useMemo(() => {
        let weeklySetsCount = 0;
        weeklySchedule.forEach(day => {
            const workoutName = getWorkoutNameForDay(programData, 1, day.day);
            if (workoutName && !programData.programStructure[workoutName]?.isRest) {
                const workout = getWorkoutForWeek(programData, 1, workoutName);
                if (workout) {
                    workout.exercises.forEach(ex => {
                        const details = getExerciseDetails(ex.name, masterExerciseList);
                        if (details) weeklySetsCount += Number(details.sets) || 0;
                    });
                }
            }
        });

        const total = weeklySetsCount * info.weeks;
        const masterList = programData?.masterExerciseList || {};
        const completed = Object.values(allLogs).filter(log => 
            !log.skipped && 
            (log.load === 0 || log.load) && 
            log.reps &&
            !!masterList[log.exercise]
        ).length;
        const currentStreak = calculateStreak(allLogs, programData);
        
        let incompleteWeek = 1;
        for (let w = 1; w <= info.weeks; w++) {
             const weekSched = programData.weeklyScheduleOverrides?.[w] || weeklySchedule;
             const isWeekComplete = weekSched.every(day => {
                const workoutName = getWorkoutNameForDay(programData, w, day.day);
                if(programData.programStructure[workoutName]?.isRest) return true;
                const workout = getWorkoutForWeek(programData, w, workoutName);
                if(!workout) return true;
                return workout.exercises.every(ex => {
                    const details = getExerciseDetails(ex.name, masterExerciseList);
                    if(!details) return false;
                    return Array.from({length: Number(details.sets)}, (_, i) => i + 1).every(setNum => isSetLogComplete(allLogs[`${w}-${day.day}-${ex.name}-${setNum}`]));
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
        const volumesByDay = {};
        weeklySchedule.forEach(d => {
            const workoutName = getWorkoutNameForDay(programData, firstIncompleteWeek, d.day);
            if (workoutName && !programData.programStructure[workoutName]?.isRest) volumesByDay[d.day] = 0;
        });

        Object.values(allLogs).forEach(log => {
            if (log.week === firstIncompleteWeek && volumesByDay[log.dayKey] !== undefined) {
                volumesByDay[log.dayKey] += getSetVolume(log, masterExerciseList);
            }
        });
        
        return weeklySchedule
            .filter(d => {
                const workoutName = getWorkoutNameForDay(programData, firstIncompleteWeek, d.day);
                return workoutName && !programData.programStructure[workoutName]?.isRest;
            })
            .map((d, index) => ({
                day: settings.useWeeklySchedule ? d.day : `Day ${index + 1}`,
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
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">This Week's Volume (Week {firstIncompleteWeek})</h3>
                    {weeklyVolumeData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                             <BarChart data={weeklyVolumeData}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                                <XAxis dataKey="day" tick={{ fill: '#9ca3af' }} />
                                <YAxis domain={[0, 'auto']} tick={{ fill: '#9ca3af' }} />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--tooltip-bg)', border: '1px solid var(--tooltip-border)' }} formatter={(value) => [`${value.toLocaleString()} lbs`, 'Total Volume']} />
                                <Bar dataKey="volume" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <p className="text-gray-600 dark:text-gray-400">Log some workouts this week to see your volume data.</p>}
                </div>
                 <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">Bodyweight Trend</h3>
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
                    ) : <p className="text-gray-600 dark:text-gray-400">Log your bodyweight multiple times in Settings to see a trend.</p>}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">AI Weekly Summary</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Get a personalized summary of your last completed week, including highlights, areas for improvement, and tips for next week.</p>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                    <BrainCircuit size={16} /> Generate AI Summary
                </button>
            </div>
        </div>
    );
};