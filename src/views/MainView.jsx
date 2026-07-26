import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle, ChevronDown, Crosshair, Dumbbell, Flame, Moon, Play, RotateCcw, XCircle } from 'lucide-react';
import { getWorkoutForWeek, getWorkoutNameForDay, getSessionInfoFromSequentialIndex } from '../utils/workout';
import { getExerciseDetails, isSetLogComplete } from '../utils/helpers';
import { getProgramMetrics, isWorkoutComplete } from '../utils/trainingMetrics';
import { ProgressRing } from '../components/common/ProgressRing';

const DAY_STYLES = {
    next: 'border-amber/60 bg-amber/10',
    skipped: 'border-coral/40 bg-coral/[0.07]',
    complete: 'border-teal/35 bg-teal/[0.07]',
    rest: 'border-sky/30 bg-sky/[0.06]',
    upcoming: 'border-line bg-panel2/60',
};

const getDayState = ({ isRestDay, isSkipped, isComplete, isNext }) => {
    if (isNext) return 'next';
    if (isSkipped) return 'skipped';
    if (isComplete) return 'complete';
    if (isRestDay) return 'rest';
    return 'upcoming';
};

const DayIcon = ({ state }) => {
    switch (state) {
        case 'next': return <Crosshair size={16} className="text-amber" />;
        case 'skipped': return <XCircle size={16} className="text-coral" />;
        case 'complete': return <CheckCircle size={16} className="text-teal" />;
        case 'rest': return <Moon size={16} className="text-sky" />;
        default: return <Dumbbell size={16} className="text-mute" />;
    }
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
    const isCurrent = week === firstIncompleteWeek;

    return (
        <div className={`ee-panel overflow-hidden ${isCurrent ? 'ring-1 ring-amber/25' : ''}`}>
            <button onClick={() => setIsOpen(!isOpen)} className="w-full p-4 text-left sm:p-5" aria-expanded={isOpen}>
                <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3.5">
                        <ProgressRing size={46} stroke={4} progress={percent} color={isWeekComplete ? 'rgb(var(--c-teal))' : 'rgb(var(--c-amber))'}>
                            {isWeekComplete
                                ? <CheckCircle size={16} className="text-teal" />
                                : <span className="font-mono text-[11px] font-semibold text-bone">{percent}</span>}
                        </ProgressRing>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="font-display text-base font-bold text-bone">Week {week}</h3>
                                {isCurrent && <span className="ee-chip border-amber/40 text-amber">Current</span>}
                            </div>
                            <p className="mt-0.5 text-xs text-mute">{completedCount} of {effectiveSchedule.length} days logged</p>
                        </div>
                    </div>
                    <span className={`ee-icon-btn flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                        <ChevronDown size={16} />
                    </span>
                </div>
            </button>
            {isOpen && (
                <div className="grid grid-cols-2 gap-2.5 border-t border-line/60 p-4 animate-fade-in sm:grid-cols-3 sm:p-5 xl:grid-cols-4">
                    {effectiveSchedule.map((day, index) => {
                        const dayKey = `${week}-${day.day}`;
                        const status = completedDays.get(dayKey);
                        const workoutName = getWorkoutNameForDay(programData, week, day.day);
                        const workoutDetails = getWorkoutForWeek(programData, week, workoutName);
                        const isRestDay = !workoutName || programData.programStructure[workoutName]?.isRest;
                        const isNext = nextWorkout?.week === week && nextWorkout?.dayKey === day.day;
                        const state = getDayState({ isRestDay, isSkipped: status?.isSkipped, isComplete: status?.isDayComplete, isNext });

                        return (
                            <div key={dayKey} className={`relative flex flex-col rounded-2xl border p-3.5 transition-all duration-150 ${DAY_STYLES[state]}`}>
                                {isNext && (
                                    <span className="absolute -top-1.5 right-3 rounded-full bg-amber px-2 py-0.5 font-display text-[9px] font-bold uppercase tracking-[0.14em] text-base shadow-lg">
                                        Up next
                                    </span>
                                )}
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-mute">
                                            {programData.settings.useWeeklySchedule ? day.day : `Day ${index + 1}`}
                                        </p>
                                        <p className="mt-1 truncate font-display text-sm font-bold text-bone">
                                            {workoutDetails?.label || workoutName || 'Recovery'}
                                        </p>
                                    </div>
                                    <DayIcon state={state} />
                                </div>
                                <div className="mt-3.5">
                                    {isRestDay ? (
                                        <div className="rounded-lg bg-well/60 px-2.5 py-1.5 text-center text-[11px] font-bold text-sky">Recovery</div>
                                    ) : status?.isSkipped ? (
                                        <button onClick={() => onUnskipDay(week, day.day)} className="flex w-full items-center justify-center gap-1 rounded-lg bg-coral/15 px-2.5 py-1.5 text-[11px] font-bold text-coral transition-colors hover:bg-coral/25">
                                            <RotateCcw size={11} /> Restore
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => onSessionSelect(week, day.day, 'lifting')}
                                            className={`flex w-full items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-colors ${
                                                isNext
                                                    ? 'bg-amber text-base hover:brightness-110'
                                                    : 'bg-well/80 text-bone hover:bg-line/50'
                                            }`}
                                        >
                                            {status?.isDayComplete ? 'Review log' : isNext ? <><Play size={11} /> Start</> : 'Open'}
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
        <div className="ee-panel overflow-hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="flex w-full items-center justify-between p-4 text-left sm:p-5" aria-expanded={isOpen}>
                <div className="flex items-center gap-3">
                    <h3 className="font-display text-base font-bold text-bone">Sessions {weekNumber * 7 - 6}–{weekNumber * 7}</h3>
                    {isWeekComplete && <CheckCircle size={16} className="text-teal" />}
                </div>
                <span className={`ee-icon-btn transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown size={16} />
                </span>
            </button>
            {isOpen && (
                <div className="grid grid-cols-1 gap-2.5 border-t border-line/60 p-4 animate-fade-in sm:grid-cols-2 lg:grid-cols-4">
                    {sessions.map(session => (
                        <button
                            key={session.dayKey}
                            onClick={() => onSessionSelect(session.weekForProgram, session.dayKey, 'lifting', session.sessionIndex)}
                            className={`rounded-2xl border p-4 text-left transition-colors ${
                                session.isComplete
                                    ? 'border-teal/35 bg-teal/[0.07]'
                                    : 'border-line bg-panel2/60 hover:bg-panel2'
                            }`}
                        >
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-mute">Session {session.sessionIndex + 1}</p>
                            <p className="mt-1 truncate font-display text-sm font-bold text-bone">{session.workoutLabel}</p>
                            {session.isComplete && <p className="mt-1 flex items-center gap-1 text-[11px] font-bold text-teal"><CheckCircle size={11} /> Logged</p>}
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
        return <div className="ee-panel p-8 text-center text-mute">This program has no workouts defined.</div>;
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

const UpNextHero = ({ programData, metrics, onSessionSelect }) => {
    const next = metrics.nextWorkout;
    const nextLabel = next?.workout?.label || next?.workoutName;
    const exerciseCount = next?.workout?.exercises?.length || 0;

    return (
        <section className="ee-panel relative mb-6 overflow-hidden p-5 sm:p-7">
            <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-amber/[0.07] blur-2xl" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-5">
                    <ProgressRing size={92} stroke={6} progress={metrics.progressPercentage}>
                        <div className="text-center">
                            <span className="font-display text-2xl font-bold leading-none text-bone">
                                {metrics.progressPercentage}
                                <span className="text-sm font-semibold text-mute">%</span>
                            </span>
                        </div>
                    </ProgressRing>
                    <div className="min-w-0">
                        <p className="ee-eyebrow text-amber"><Crosshair size={12} /> {next ? 'Up next' : 'Block complete'}</p>
                        <h1 className="mt-2 truncate font-display text-2xl font-bold text-bone sm:text-3xl">
                            {next ? nextLabel : programData.info.name}
                        </h1>
                        <p className="mt-1 text-sm text-mute">
                            {next
                                ? `Week ${next.week} · ${next.dayKey} · ${exerciseCount} exercise${exerciseCount !== 1 ? 's' : ''}`
                                : 'Every session in this block is logged. Load a new block from the Program Hub.'}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4 rounded-2xl border border-line bg-panel2/70 px-4 py-3">
                        <div className="flex items-center gap-2">
                            <Flame size={16} className="text-coral" />
                            <div>
                                <p className="font-display text-lg font-bold leading-none text-bone">{metrics.streak}</p>
                                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-mute">Streak</p>
                            </div>
                        </div>
                        <span className="h-8 w-px bg-line/70" />
                        <div>
                            <p className="font-display text-lg font-bold leading-none text-bone">{metrics.completedWorkouts}<span className="text-mute">/{metrics.totalWorkouts}</span></p>
                            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-mute">Sessions</p>
                        </div>
                    </div>
                    {next && (
                        <button
                            onClick={() => onSessionSelect(next.week, next.dayKey, 'lifting')}
                            className="ee-primary px-6 py-3.5 text-base"
                        >
                            <Play size={17} /> Start session
                        </button>
                    )}
                </div>
            </div>
        </section>
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
        <div className="py-5 md:py-7">
            <UpNextHero programData={programData} metrics={metrics} onSessionSelect={onSessionSelect} />

            {programData.settings.sequentialProgression ? (
                <SequentialView onSessionSelect={onSessionSelect} allLogs={allLogs} programData={programData} />
            ) : (
                <div className="space-y-3.5 animate-stagger">
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
                            <div className="flex items-center gap-3 pb-1 pt-5">
                                <div className="h-px flex-grow bg-line/60" />
                                <span className="ee-chip"><CheckCircle size={12} className="text-teal" /> {completedWeeks.length} completed week{completedWeeks.length !== 1 ? 's' : ''}</span>
                                <div className="h-px flex-grow bg-line/60" />
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
