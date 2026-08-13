import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle, ChevronDown, Flame, Play, RotateCcw, Sparkles } from 'lucide-react';
import { getWorkoutForWeek, getWorkoutNameForDay, getSessionInfoFromSequentialIndex } from '../utils/workout';
import { getExerciseDetails, isSetLogComplete } from '../utils/helpers';
import { getProgramMetrics, isWorkoutComplete } from '../utils/trainingMetrics';

const greetingForHour = (hour) => {
    if (hour < 5) return 'Still up';
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
};

const formatToday = () =>
    new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

const DAY_TONE = {
    next: 'border-amber/50 bg-amber/[0.10] text-bone',
    skipped: 'border-coral/30 bg-coral/[0.07] text-bone',
    complete: 'border-teal/30 bg-teal/[0.08] text-bone',
    rest: 'border-sky/25 bg-sky/[0.07] text-bone',
    upcoming: 'border-line/70 bg-panel2/70 text-bone',
};

const getDayState = ({ isRestDay, isSkipped, isComplete, isNext }) => {
    if (isNext) return 'next';
    if (isSkipped) return 'skipped';
    if (isComplete) return 'complete';
    if (isRestDay) return 'rest';
    return 'upcoming';
};

const dayActionLabel = (state, isComplete) => {
    if (state === 'rest') return 'Rest';
    if (state === 'skipped') return 'Restore';
    if (isComplete) return 'Review';
    if (state === 'next') return 'Start';
    return 'Open';
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

    const isCurrent = week === firstIncompleteWeek;

    return (
        <div className={`ee-panel overflow-hidden ${isCurrent ? 'ring-1 ring-amber/20' : ''}`}>
            <button onClick={() => setIsOpen(!isOpen)} className="w-full p-4 text-left sm:p-5" aria-expanded={isOpen}>
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-display text-lg font-medium text-bone">Week {week}</h3>
                            {isCurrent && <span className="ee-chip border-amber/35 text-amber">This week</span>}
                            {isWeekComplete && <CheckCircle size={15} className="text-teal" />}
                        </div>
                        <p className="mt-1 text-xs text-mute">{completedCount} of {effectiveSchedule.length} days logged</p>
                    </div>
                    <span className={`ee-icon-btn flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                        <ChevronDown size={16} />
                    </span>
                </div>
            </button>
            {isOpen && (
                <div className="grid grid-cols-2 gap-2 border-t border-line/50 p-4 animate-fade-in sm:grid-cols-3 sm:p-5 xl:grid-cols-4">
                    {effectiveSchedule.map((day, index) => {
                        const dayKey = `${week}-${day.day}`;
                        const status = completedDays.get(dayKey);
                        const workoutName = getWorkoutNameForDay(programData, week, day.day);
                        const workoutDetails = getWorkoutForWeek(programData, week, workoutName);
                        const isRestDay = !workoutName || programData.programStructure[workoutName]?.isRest;
                        const isNext = nextWorkout?.week === week && nextWorkout?.dayKey === day.day;
                        const state = getDayState({ isRestDay, isSkipped: status?.isSkipped, isComplete: status?.isDayComplete, isNext });

                        return (
                            <div key={dayKey} className={`flex flex-col rounded-2xl border p-3.5 ${DAY_TONE[state]}`}>
                                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-mute">
                                    {programData.settings.useWeeklySchedule ? day.day : `Day ${index + 1}`}
                                </p>
                                <p className="mt-1 truncate font-display text-sm font-medium text-bone">
                                    {workoutDetails?.label || workoutName || 'Recovery'}
                                </p>
                                <div className="mt-3">
                                    {isRestDay ? (
                                        <div className="rounded-full bg-well/70 px-2.5 py-1.5 text-center text-[11px] font-medium text-sky">Recovery</div>
                                    ) : status?.isSkipped ? (
                                        <button onClick={() => onUnskipDay(week, day.day)} className="flex w-full items-center justify-center gap-1 rounded-full bg-coral/15 px-2.5 py-1.5 text-[11px] font-semibold text-coral hover:bg-coral/25">
                                            <RotateCcw size={11} /> Restore
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => onSessionSelect(week, day.day, 'lifting')}
                                            className={`flex w-full items-center justify-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-semibold ${
                                                isNext ? 'bg-amber text-base' : 'bg-well/80 text-bone hover:bg-line/40'
                                            }`}
                                        >
                                            {status?.isDayComplete ? 'Review' : isNext ? <><Play size={11} /> Start</> : 'Open'}
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
                    <h3 className="font-display text-lg font-medium text-bone">Sessions {weekNumber * 7 - 6}–{weekNumber * 7}</h3>
                    {isWeekComplete && <CheckCircle size={16} className="text-teal" />}
                </div>
                <span className={`ee-icon-btn transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown size={16} />
                </span>
            </button>
            {isOpen && (
                <div className="grid grid-cols-1 gap-2 border-t border-line/50 p-4 animate-fade-in sm:grid-cols-2 lg:grid-cols-4">
                    {sessions.map(session => (
                        <button
                            key={session.dayKey}
                            onClick={() => onSessionSelect(session.weekForProgram, session.dayKey, 'lifting', session.sessionIndex)}
                            className={`rounded-2xl border p-4 text-left transition-colors ${
                                session.isComplete
                                    ? 'border-teal/30 bg-teal/[0.07]'
                                    : 'border-line bg-panel2/60 hover:bg-panel2'
                            }`}
                        >
                            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-mute">Session {session.sessionIndex + 1}</p>
                            <p className="mt-1 truncate font-display text-sm font-medium text-bone">{session.workoutLabel}</p>
                            {session.isComplete && <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-teal"><CheckCircle size={11} /> Logged</p>}
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
        <div className="space-y-3">
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

const WeekStrip = ({ week, programData, completedDays, nextWorkout, onSessionSelect, onUnskipDay }) => {
    const schedule = programData.weeklyScheduleOverrides?.[week] || programData.weeklySchedule || [];

    return (
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" style={{ scrollbarWidth: 'none' }}>
            {schedule.map((day, index) => {
                const status = completedDays.get(`${week}-${day.day}`);
                const workoutName = getWorkoutNameForDay(programData, week, day.day);
                const workoutDetails = getWorkoutForWeek(programData, week, workoutName);
                const isRestDay = !workoutName || programData.programStructure[workoutName]?.isRest;
                const isNext = nextWorkout?.week === week && nextWorkout?.dayKey === day.day;
                const state = getDayState({ isRestDay, isSkipped: status?.isSkipped, isComplete: status?.isDayComplete, isNext });
                const shortDay = programData.settings.useWeeklySchedule
                    ? String(day.day).slice(0, 3)
                    : `${index + 1}`;

                const handleClick = () => {
                    if (isRestDay) return;
                    if (status?.isSkipped) {
                        onUnskipDay(week, day.day);
                        return;
                    }
                    onSessionSelect(week, day.day, 'lifting');
                };

                return (
                    <button
                        key={`${week}-${day.day}`}
                        onClick={handleClick}
                        disabled={isRestDay}
                        className={`min-w-[4.6rem] snap-start rounded-2xl border px-2.5 py-3 text-center transition-colors ${DAY_TONE[state]} ${isRestDay ? 'cursor-default' : 'hover:brightness-110'}`}
                    >
                        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-mute">{shortDay}</p>
                        <p className="mt-1 truncate text-[11px] font-semibold leading-4">
                            {isRestDay ? 'Rest' : (workoutDetails?.label || workoutName || 'Day').split(' ')[0]}
                        </p>
                        <p className="mt-2 text-[10px] font-medium text-mute">
                            {dayActionLabel(state, status?.isDayComplete)}
                        </p>
                    </button>
                );
            })}
        </div>
    );
};

const TodayHero = ({ programData, metrics, onSessionSelect, onNavigate }) => {
    const blockComplete = metrics.totalWorkouts > 0 && metrics.completedWorkouts >= metrics.totalWorkouts;
    const next = blockComplete ? null : metrics.nextWorkout;
    const nextLabel = next?.workout?.label || next?.workoutName;
    const exercises = next?.workout?.exercises || [];
    const isRest = next?.isRest;

    if (!next) {
        return (
            <section className="ee-panel relative overflow-hidden p-6 sm:p-8">
                <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-teal/[0.08] blur-3xl" />
                <p className="ee-kicker text-teal">Block complete</p>
                <h2 className="ee-display mt-3 text-3xl sm:text-4xl">Every session is logged.</h2>
                <p className="ee-lede mt-3">Start a new mesocycle or load another template from Program.</p>
                <button onClick={() => onNavigate('programHub')} className="ee-primary mt-6">
                    <Sparkles size={16} /> Open program library
                </button>
            </section>
        );
    }

    if (isRest) {
        return (
            <section className="ee-panel relative overflow-hidden p-6 sm:p-8">
                <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-sky/[0.10] blur-3xl" />
                <p className="ee-kicker text-sky">Today</p>
                <h2 className="ee-display mt-3 text-3xl sm:text-4xl">A rest day.</h2>
                <p className="ee-lede mt-3">
                    Week {next.week} · {next.dayKey}. Recovery is part of the program — come back for the next lift.
                </p>
            </section>
        );
    }

    return (
        <section className="ee-panel relative overflow-hidden p-6 sm:p-8">
            <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-amber/[0.09] blur-3xl" />
            <div className="relative">
                <p className="ee-kicker text-amber">Up next</p>
                <h2 className="ee-display mt-3 text-3xl sm:text-[2.6rem]">{nextLabel}</h2>
                <p className="mt-2 text-sm text-mute">
                    Week {next.week} · {next.dayKey} · {exercises.length} lift{exercises.length !== 1 ? 's' : ''}
                </p>

                {exercises.length > 0 && (
                    <ul className="mt-6 space-y-2">
                        {exercises.slice(0, 5).map((ex, index) => (
                            <li key={ex.id || ex.name} className="flex items-center gap-3 text-sm">
                                <span className="w-6 font-mono text-[11px] tabular-nums text-mute/70">{String(index + 1).padStart(2, '0')}</span>
                                <span className="truncate text-bone">{ex.name}</span>
                            </li>
                        ))}
                        {exercises.length > 5 && (
                            <li className="pl-9 text-xs text-mute">+{exercises.length - 5} more</li>
                        )}
                    </ul>
                )}

                <button
                    onClick={() => onSessionSelect(next.week, next.dayKey, 'lifting')}
                    className="ee-primary mt-7 px-6 py-3.5 text-base"
                >
                    <Play size={17} /> Start session
                </button>
            </div>
        </section>
    );
};

export const MainView = ({ onSessionSelect, completedDays, onUnskipDay, programData, allLogs, onNavigate }) => {
    const { info, weeklySchedule } = programData;
    const weeks = Array.from({ length: info.weeks }, (_, i) => i + 1);
    const metrics = useMemo(() => getProgramMetrics(allLogs, programData), [allLogs, programData]);
    const greeting = greetingForHour(new Date().getHours());

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

    const laterWeeks = incompleteWeeks.filter(week => week !== firstIncompleteWeek);

    return (
        <div className="py-6 md:py-9">
            <header className="mb-6">
                <p className="ee-kicker">{formatToday()}</p>
                <h1 className="ee-display mt-2 text-3xl sm:text-4xl">{greeting}.</h1>
                <p className="ee-lede mt-2">One session in front of you. Everything else can wait.</p>
            </header>

            <TodayHero programData={programData} metrics={metrics} onSessionSelect={onSessionSelect} onNavigate={onNavigate} />

            <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
                <div className="ee-panel-soft px-3 py-3.5 sm:px-4">
                    <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-mute">Streak</p>
                    <p className="mt-1 flex items-baseline gap-1 font-display text-2xl font-medium text-bone">
                        <Flame size={16} className="translate-y-px text-coral" />
                        {metrics.streak}
                    </p>
                </div>
                <div className="ee-panel-soft px-3 py-3.5 sm:px-4">
                    <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-mute">Sessions</p>
                    <p className="mt-1 font-display text-2xl font-medium text-bone">
                        {metrics.completedWorkouts}
                        <span className="text-base text-mute">/{metrics.totalWorkouts}</span>
                    </p>
                </div>
                <div className="ee-panel-soft px-3 py-3.5 sm:px-4">
                    <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-mute">Block</p>
                    <p className="mt-1 font-display text-2xl font-medium text-bone">{metrics.progressPercentage}%</p>
                </div>
            </div>

            {programData.settings.sequentialProgression ? (
                <div className="mt-8">
                    <h2 className="font-display text-xl font-medium text-bone">The rest of the block</h2>
                    <div className="mt-4">
                        <SequentialView onSessionSelect={onSessionSelect} allLogs={allLogs} programData={programData} />
                    </div>
                </div>
            ) : (
                <>
                    {firstIncompleteWeek <= info.weeks && (
                        <section className="mt-8">
                            <div className="mb-3 flex items-end justify-between">
                                <h2 className="font-display text-xl font-medium text-bone">This week</h2>
                                <p className="text-xs text-mute">Week {firstIncompleteWeek}</p>
                            </div>
                            <WeekStrip
                                week={firstIncompleteWeek}
                                programData={programData}
                                completedDays={completedDays}
                                nextWorkout={metrics.nextWorkout}
                                onSessionSelect={onSessionSelect}
                                onUnskipDay={onUnskipDay}
                            />
                        </section>
                    )}

                    {laterWeeks.length > 0 && (
                        <section className="mt-8 space-y-3">
                            <h2 className="font-display text-xl font-medium text-bone">Coming up</h2>
                            {laterWeeks.map(week => (
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
                        </section>
                    )}

                    {completedWeeks.length > 0 && (
                        <section className="mt-10 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="h-px flex-grow bg-line/50" />
                                <span className="ee-chip">
                                    <CheckCircle size={12} className="text-teal" />
                                    {completedWeeks.length} finished week{completedWeeks.length !== 1 ? 's' : ''}
                                </span>
                                <div className="h-px flex-grow bg-line/50" />
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
                        </section>
                    )}
                </>
            )}
        </div>
    );
};
