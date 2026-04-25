import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle, ChevronDown, ChevronUp, Crosshair, Dumbbell, Moon, Target, XCircle } from 'lucide-react';
import { getWorkoutForWeek, getWorkoutNameForDay, getSessionInfoFromSequentialIndex } from '../utils/workout';
import { getExerciseDetails, isSetLogComplete } from '../utils/helpers';
import { getProgramMetrics, isWorkoutComplete } from '../utils/trainingMetrics';

const getTileTone = ({ isRestDay, isSkipped, isComplete, isNext }) => {
    if (isNext) return 'border-[#f3b548] bg-[#f3b548]/14 text-[#efe7d5]';
    if (isSkipped) return 'border-[#f36f52]/50 bg-[#f36f52]/12 text-[#f36f52]';
    if (isComplete) return 'border-[#4dd6c6]/45 bg-[#4dd6c6]/12 text-[#4dd6c6]';
    if (isRestDay) return 'border-[#5b83c4]/35 bg-[#5b83c4]/10 text-[#9db8e6]';
    return 'border-white/10 bg-white/[0.055] text-[#efe7d5]';
};

export const WeekView = ({ week, completedDays, onSessionSelect, firstIncompleteWeek, onUnskipDay, programData, nextWorkout }) => {
    const effectiveSchedule = programData.weeklyScheduleOverrides?.[week] || programData.weeklySchedule;
    
    const isWeekComplete = useMemo(() => effectiveSchedule.every(day => {
        const workoutName = getWorkoutNameForDay(programData, week, day.day);
        return workoutName === 'Rest' || programData.programStructure[workoutName]?.isRest || completedDays.get(`${week}-${day.day}`)?.isDayComplete;
    }), [week, completedDays, effectiveSchedule, programData]);

    const completedCount = useMemo(() => effectiveSchedule.filter(day => {
        const workoutName = getWorkoutNameForDay(programData, week, day.day);
        if (programData.programStructure[workoutName]?.isRest) return true;
        return completedDays.get(`${week}-${day.day}`)?.isDayComplete;
    }).length, [completedDays, effectiveSchedule, programData, week]);

    const [isOpen, setIsOpen] = useState(week === firstIncompleteWeek);
    
    useEffect(() => {
        setIsOpen(week === firstIncompleteWeek);
    }, [firstIncompleteWeek, week]);

    const percent = effectiveSchedule.length > 0 ? Math.round((completedCount / effectiveSchedule.length) * 100) : 0;

    return (
        <div className="ee-panel rounded-2xl p-4">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full text-left">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="ee-chip">Week {week}</span>
                            {isWeekComplete && <CheckCircle size={18} className="text-[#4dd6c6]" />}
                        </div>
                        <h3 className="mt-2 text-xl font-black text-[#efe7d5]">{week === firstIncompleteWeek ? 'Active mission block' : 'Training block'}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden text-right sm:block">
                            <p className="text-sm font-black text-[#efe7d5]">{percent}%</p>
                            <p className="text-xs text-[#9ca89d]">{completedCount}/{effectiveSchedule.length} days</p>
                        </div>
                        {isOpen ? <ChevronUp className="text-[#9ca89d]" /> : <ChevronDown className="text-[#9ca89d]" />}
                    </div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-[#4dd6c6] transition-all duration-500" style={{ width: `${percent}%` }} />
                </div>
            </button>
            {isOpen && (
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {effectiveSchedule.map((day, index) => {
                        const dayKey = `${week}-${day.day}`;
                        const status = completedDays.get(dayKey);
                        const workoutName = getWorkoutNameForDay(programData, week, day.day);
                        const workoutDetails = getWorkoutForWeek(programData, week, workoutName);
                        const isRestDay = !workoutName || programData.programStructure[workoutName]?.isRest;
                        const isNext = nextWorkout?.week === week && nextWorkout?.dayKey === day.day;
                        const tileTone = getTileTone({ isRestDay, isSkipped: status?.isSkipped, isComplete: status?.isDayComplete, isNext });

                        return (
                            <div key={dayKey} className={`rounded-xl border p-4 transition ${tileTone}`}>
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-bold uppercase opacity-70">{programData.settings.useWeeklySchedule ? day.day : `Day ${index + 1}`}</p>
                                        <p className="mt-1 font-black">{workoutDetails?.label || workoutName || 'Recovery'}</p>
                                    </div>
                                    {isRestDay ? <Moon size={18} /> : status?.isDayComplete ? <CheckCircle size={18} /> : isNext ? <Crosshair size={18} /> : <Dumbbell size={18} />}
                                </div>
                                <div className="mt-4">
                                    {isRestDay ? (
                                        <div className="rounded-lg bg-black/20 px-3 py-2 text-center text-xs font-bold">Recovery day</div>
                                    ) : status?.isSkipped ? (
                                        <button onClick={() => onUnskipDay(week, day.day)} className="w-full rounded-lg bg-[#f36f52]/18 px-3 py-2 text-xs font-bold text-[#f36f52]">
                                            <XCircle size={14} className="mr-1 inline" /> Restore session
                                        </button>
                                    ) : (
                                        <button onClick={() => onSessionSelect(week, day.day, 'lifting')} className="w-full rounded-lg bg-black/25 px-3 py-2 text-xs font-bold hover:bg-black/40">
                                            {status?.isDayComplete ? 'Review log' : isNext ? 'Start target' : 'Open session'}
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
        <div className="ee-panel rounded-2xl p-4">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left">
                <h3 className="text-xl font-black text-[#efe7d5]">Training Flight {weekNumber}</h3>
                <div className="flex items-center gap-2">
                    {isWeekComplete && <CheckCircle className="text-[#4dd6c6]" />}
                    {isOpen ? <ChevronUp className="text-[#9ca89d]" /> : <ChevronDown className="text-[#9ca89d]" />}
                </div>
            </button>
            {isOpen && (
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {sessions.map(session => (
                        <button
                            key={session.dayKey}
                            onClick={() => onSessionSelect(session.weekForProgram, session.dayKey, 'lifting', session.sessionIndex)}
                            className={`rounded-xl border p-4 text-left ${session.isComplete ? 'border-[#4dd6c6]/40 bg-[#4dd6c6]/10' : 'border-white/10 bg-white/[0.055]'}`}
                        >
                            <p className="text-xs font-bold uppercase text-[#9ca89d]">Day {session.sessionIndex + 1}</p>
                            <p className="mt-1 font-black text-[#efe7d5]">{session.workoutLabel}</p>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export const SequentialView = ({ onSessionSelect, allLogs, programData }) => {
    const { workoutOrder, masterExerciseList } = programData;

    const sessionData = useMemo(() => {
        if (!workoutOrder || workoutOrder.length === 0) return [];
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
                    return isSetLogComplete(allLogs[`${week}-${dayKey}-${ex.name}-${setNum}`]);
                });
            });
            sessions.push({ sessionIndex: i, weekForProgram: week, dayKey, workoutLabel: workout.label || workoutName, isComplete });
            i++;
        }
        return sessions;
    }, [programData, allLogs, masterExerciseList, workoutOrder]);

    const firstIncompleteIndex = sessionData.find(s => !s.isComplete)?.sessionIndex ?? sessionData.length;
    const sessionsByWeek = [];
    for (let i = 0; i < sessionData.length; i += 7) sessionsByWeek.push(sessionData.slice(i, i + 7));
    const firstIncompleteVisualWeek = Math.floor(firstIncompleteIndex / 7);

    if (sessionData.length === 0) {
        return <div className="ee-panel rounded-2xl p-8 text-center text-[#9ca89d]">This program has no workouts defined.</div>;
    }

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

export const MainView = ({ onSessionSelect, onEditProgram, completedDays, onUnskipDay, programData, allLogs, onNavigate }) => {
    const { info, weeklySchedule } = programData;
    const weeks = Array.from({ length: info.weeks }, (_, i) => i + 1);
    const metrics = useMemo(() => getProgramMetrics(allLogs, programData), [allLogs, programData]);
    
    const firstIncompleteWeek = useMemo(() => {
        const next = metrics.workoutDays.find(day => !day.isRest && !isWorkoutComplete(day, allLogs, programData));
        return next?.week || info.weeks + 1;
    }, [allLogs, info.weeks, metrics.workoutDays, programData]);

    const { incompleteWeeks, completedWeeks } = useMemo(() => {
        const incomplete = [];
        const completed = [];
        weeks.forEach(week => {
            const weekSchedule = programData.weeklyScheduleOverrides?.[week] || weeklySchedule;
            const isComplete = weekSchedule.every(d => {
                const workoutName = getWorkoutNameForDay(programData, week, d.day);
                return programData.programStructure[workoutName]?.isRest || completedDays.get(`${week}-${d.day}`)?.isDayComplete;
            });
            if (isComplete) completed.push(week);
            else incomplete.push(week);
        });
        return { incompleteWeeks: incomplete, completedWeeks: completed };
    }, [weeks, weeklySchedule, completedDays, programData]);

    return (
        <div className="py-5 md:py-8">
            <section className="ee-panel mb-6 rounded-2xl p-5 md:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="ee-chip"><Target size={14} /> Program</div>
                        <h1 className="mt-3 text-3xl font-black text-[#efe7d5] md:text-4xl">{info.name}</h1>
                        <p className="mt-2 text-[#9ca89d]">{info.weeks}-week block with {metrics.totalWorkouts} training sessions and {metrics.totalSets} logged-set targets.</p>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="rounded-xl bg-white/5 p-3"><p className="text-2xl font-black text-[#4dd6c6]">{metrics.progressPercentage}%</p><p className="text-xs text-[#9ca89d]">Meso</p></div>
                        <div className="rounded-xl bg-white/5 p-3"><p className="text-2xl font-black text-[#f3b548]">{metrics.completedWorkouts}</p><p className="text-xs text-[#9ca89d]">Wins</p></div>
                        <div className="rounded-xl bg-white/5 p-3"><p className="text-2xl font-black text-[#f36f52]">{metrics.streak}</p><p className="text-xs text-[#9ca89d]">Streak</p></div>
                    </div>
                </div>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-[#f3b548]" style={{ width: `${metrics.progressPercentage}%` }} />
                </div>
            </section>

            {programData.settings.sequentialProgression ? (
                <SequentialView onSessionSelect={onSessionSelect} allLogs={allLogs} programData={programData} />
            ) : (
                <div className="space-y-4 pb-24">
                    {incompleteWeeks.map(week => (
                        <WeekView
                            key={week}
                            week={week}
                            completedDays={completedDays}
                            onSessionSelect={onSessionSelect}
                            firstIncompleteWeek={firstIncompleteWeek}
                            onUnskipDay={onUnskipDay}
                            programData={programData}
                            nextWorkout={metrics.nextWorkout}
                        />
                    ))}

                    {completedWeeks.length > 0 && (
                        <>
                            <div className="flex items-center gap-3 pt-4 pb-1">
                                <div className="h-px flex-grow bg-white/10"></div>
                                <div className="ee-chip"><CheckCircle size={14} /> {completedWeeks.length} completed week{completedWeeks.length !== 1 ? 's' : ''}</div>
                                <div className="h-px flex-grow bg-white/10"></div>
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
                                    nextWorkout={metrics.nextWorkout}
                                />
                            ))}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
