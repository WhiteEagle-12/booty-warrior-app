import React, { useState, useEffect, useMemo } from 'react';
import { Dumbbell, CheckCircle, ChevronDown, ChevronUp, XCircle } from 'lucide-react';
import { getWorkoutForWeek, getWorkoutNameForDay, getSessionInfoFromSequentialIndex } from '../utils/workout';
import { getExerciseDetails, isSetLogComplete } from '../utils/helpers';

export const WeekView = ({ week, completedDays, onSessionSelect, firstIncompleteWeek, onUnskipDay, programData, onNavigate }) => {
    const { weeklySchedule } = programData;
    // Support per-week schedule overrides (different number of days per week)
    const effectiveSchedule = programData.weeklyScheduleOverrides?.[week] || weeklySchedule;
    
    const isWeekComplete = useMemo(() => effectiveSchedule.every(day => {
        const workoutName = getWorkoutNameForDay(programData, week, day.day);
        return workoutName === 'Rest' || programData.programStructure[workoutName]?.isRest || completedDays.get(`${week}-${day.day}`)?.isDayComplete;
    }), [week, completedDays, effectiveSchedule, programData]);

    const [isOpen, setIsOpen] = useState(week === firstIncompleteWeek);
    
    useEffect(() => {
        setIsOpen(week === firstIncompleteWeek);
    }, [firstIncompleteWeek, week]);
    
    const gridColsMap = {
        1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4',
        5: 'lg:grid-cols-5', 6: 'lg:grid-cols-6', 7: 'lg:grid-cols-7', 8: 'lg:grid-cols-8',
        9: 'lg:grid-cols-9', 10: 'lg:grid-cols-10', 11: 'lg:grid-cols-11', 12: 'lg:grid-cols-12',
    };
    const gridColsClass = gridColsMap[effectiveSchedule.length] || 'lg:grid-cols-7';

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Week {week}</h3>
                <div className="flex items-center gap-2">{isWeekComplete && <CheckCircle className="text-green-500" />}{isOpen ? <ChevronUp className="text-gray-500 dark:text-gray-400" /> : <ChevronDown className="text-gray-500 dark:text-gray-400" />}</div>
            </button>
            {isOpen && (
                <div className={`grid grid-cols-2 sm:grid-cols-4 ${gridColsClass} gap-3 mt-4`}>
                    {effectiveSchedule.map((day, index) => {
                        const dayKey = `${week}-${day.day}`;
                        const status = completedDays.get(dayKey);
                        const workoutName = getWorkoutNameForDay(programData, week, day.day);
                        const workoutDetails = getWorkoutForWeek(programData, week, workoutName);
                        const isRestDay = !workoutName || programData.programStructure[workoutName]?.isRest;
                        
                        let dayClass = 'bg-gray-100 dark:bg-gray-700/50';
                        if (isRestDay) dayClass = 'bg-indigo-100 dark:bg-indigo-900/50';
                        else if (status?.isSkipped) dayClass = 'bg-red-100 dark:bg-red-800/50 border border-red-500/50';
                        else if (status?.isDayComplete) dayClass = 'bg-green-100 dark:bg-green-800/50 border border-green-500/50';

                        return (
                            <div key={dayKey} className={`rounded-lg p-3 flex flex-col justify-between transition-all ${dayClass}`}>
                                <div className="flex justify-between items-center mb-2">
                                    <div className="font-bold text-sm text-gray-800 dark:text-gray-200">
                                        {programData.settings.useWeeklySchedule ? day.day : `Day ${index + 1}`}
                                    </div>
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
                                            <div className="flex items-center gap-1 font-semibold text-gray-800 dark:text-gray-200">{workoutDetails?.label || workoutName}</div>
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

export const SequentialWeekView = ({ weekNumber, sessions, onSessionSelect, isInitiallyOpen }) => {
    const [isOpen, setIsOpen] = useState(isInitiallyOpen);
    const isWeekComplete = sessions.every(s => s.isComplete);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Week {weekNumber}</h3>
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
                                        <div className="flex items-center gap-1 font-semibold text-gray-800 dark:text-gray-200">{workoutLabel}</div>
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

export const SequentialView = ({ onSessionSelect, allLogs, programData }) => {
    const { workoutOrder, masterExerciseList } = programData;

    if (!workoutOrder || workoutOrder.length === 0) {
        return <div className="text-center p-8 text-gray-600 dark:text-gray-400">This program has no workouts defined.</div>;
    }

    const sessionData = useMemo(() => {
        const sessions = [];
        let i = 0;
        while (true) {
            const sessionInfo = getSessionInfoFromSequentialIndex(i, programData);
            if (!sessionInfo) break;

            const { week, dayKey, workoutName } = sessionInfo;
            const workout = getWorkoutForWeek(programData, week, workoutName);
            if (!workout) {
                i++;
                continue;
            }

            const isComplete = workout.exercises.every(ex => {
                const exDetails = getExerciseDetails(ex.name, masterExerciseList);
                if (!exDetails) return false;
                return Array.from({ length: Number(exDetails.sets) }, (_, setIdx) => setIdx + 1).every(setNum => {
                    const log = allLogs[`${week}-${dayKey}-${ex.name}-${setNum}`];
                    return isSetLogComplete(log);
                });
            });

            sessions.push({
                sessionIndex: i,
                weekForProgram: week,
                dayKey: dayKey,
                workoutLabel: workout.label || workoutName,
                isComplete,
            });
            i++;
        }
        return sessions;
    }, [programData, allLogs, masterExerciseList]);

    const firstIncompleteIndex = useMemo(() => {
        const incompleteSession = sessionData.find(s => !s.isComplete);
        return incompleteSession ? incompleteSession.sessionIndex : sessionData.length;
    }, [sessionData]);

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


export const ProgressBar = ({ completed, total }) => {
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

export const StreakCounter = ({ streak }) => {
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


export const MainView = ({ onSessionSelect, onEditProgram, completedDays, onUnskipDay, programData, allLogs, onNavigate }) => {
    const { info, weeklySchedule } = programData;
    const weeks = Array.from({ length: info.weeks }, (_, i) => i + 1);
    
    const firstIncompleteWeek = useMemo(() => {
        for (let w = 1; w <= info.weeks; w++) {
            const isWeekComplete = weeklySchedule.every(d => {
                const workoutName = getWorkoutNameForDay(programData, w, d.day);
                return programData.programStructure[workoutName]?.isRest || completedDays.get(`${w}-${d.day}`)?.isDayComplete;
            });
            if (!isWeekComplete) return w;
        }
        return info.weeks + 1;
    }, [completedDays, weeklySchedule, info.weeks, programData]);

    // Partition weeks: incomplete first, completed at the bottom
    const { incompleteWeeks, completedWeeks } = useMemo(() => {
        const incomplete = [];
        const completed = [];
        weeks.forEach(week => {
            const weekSchedule = programData.weeklyScheduleOverrides?.[week] || weeklySchedule;
            const isComplete = weekSchedule.every(d => {
                const workoutName = getWorkoutNameForDay(programData, week, d.day);
                return programData.programStructure[workoutName]?.isRest || completedDays.get(`${week}-${d.day}`)?.isDayComplete;
            });
            if (isComplete) {
                completed.push(week);
            } else {
                incomplete.push(week);
            }
        });
        return { incompleteWeeks: incomplete, completedWeeks: completed };
    }, [weeks, weeklySchedule, completedDays, programData]);

    return (
        <div className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <Dumbbell className="text-blue-500 dark:text-blue-400" size={48} />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{info.name}</h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400">Your {info.weeks}-Week Plan</p>
                    </div>
                </div>
            </div>
            
            <div className="space-y-4 pb-24">
                {/* Active / Incomplete Weeks */}
                {incompleteWeeks.map(week => (
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
                ))}

                {/* Completed Weeks Section */}
                {completedWeeks.length > 0 && (
                    <>
                        <div className="flex items-center gap-3 pt-4 pb-1">
                            <div className="flex-grow h-px bg-gray-200 dark:bg-gray-700"></div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/40 border border-green-200 dark:border-green-800">
                                <CheckCircle size={14} className="text-green-600 dark:text-green-400" />
                                <span className="text-xs font-semibold text-green-700 dark:text-green-300">
                                    {completedWeeks.length} Completed Week{completedWeeks.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                            <div className="flex-grow h-px bg-gray-200 dark:bg-gray-700"></div>
                        </div>
                        {completedWeeks.map(week => (
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
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};