import React, { useMemo } from 'react';
import { Activity, BarChart2, Crosshair, Flame, LayoutDashboard, Medal, Play, Scale, Trophy } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getSetVolume } from '../utils/helpers';
import { getProgramMetrics } from '../utils/trainingMetrics';
import { ProgressRing } from '../components/common/ProgressRing';
import { ViewHeader } from '../components/common/ViewHeader';

const tooltipStyle = {
    backgroundColor: 'rgb(var(--c-panel))',
    border: '1px solid rgb(var(--c-line))',
    borderRadius: 12,
    color: 'rgb(var(--c-bone))',
    fontSize: 12,
    fontWeight: 700,
};

const StatCard = ({ icon: Icon, label, value, detail, accentClass = 'text-amber', accentBg = 'bg-amber/10' }) => (
    <div className="ee-panel-soft p-4">
        <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-mute">{label}</p>
                <p className="mt-1.5 truncate font-display text-2xl font-bold text-bone">{value}</p>
            </div>
            <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${accentBg} ${accentClass}`}>
                <Icon size={19} />
            </span>
        </div>
        {detail && <p className="mt-2 text-xs text-mute">{detail}</p>}
    </div>
);

const EmptyChart = ({ message }) => (
    <div className="flex h-64 flex-col items-center justify-center text-center">
        <BarChart2 size={36} className="text-line" />
        <p className="mt-3 max-w-[220px] text-sm text-mute">{message}</p>
    </div>
);

export const DashboardView = ({ allLogs, programData, bodyWeightHistory, onNavigate }) => {
    const metrics = useMemo(() => getProgramMetrics(allLogs, programData, bodyWeightHistory), [allLogs, programData, bodyWeightHistory]);

    const weeklyVolumeData = useMemo(() => {
        const weeks = {};
        Object.values(allLogs).forEach(log => {
            if (!log.week) return;
            weeks[log.week] = (weeks[log.week] || 0) + getSetVolume(log, programData.masterExerciseList);
        });
        return Object.entries(weeks)
            .map(([week, volume]) => ({ week: `W${week}`, volume: Math.round(volume) }))
            .sort((a, b) => parseInt(a.week.slice(1), 10) - parseInt(b.week.slice(1), 10));
    }, [allLogs, programData.masterExerciseList]);

    const bodyWeightData = useMemo(() => {
        return (bodyWeightHistory || [])
            .filter(entry => parseFloat(entry?.weight) > 0)
            .map(entry => ({ ...entry, dateObj: new Date(entry.date) }))
            .sort((a, b) => a.dateObj - b.dateObj)
            .slice(-12)
            .map(entry => ({
                date: entry.dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                weight: Math.round(entry.weight * 10) / 10,
            }));
    }, [bodyWeightHistory]);

    const nextWorkout = metrics.nextWorkout;
    const nextExercises = nextWorkout?.workout?.exercises?.slice(0, 4) || [];
    const xp = metrics.completedSets * 25 + metrics.completedWorkouts * 150 + metrics.streak * 80;
    const level = Math.max(1, Math.floor(xp / 1200) + 1);
    const levelProgress = Math.round(((xp % 1200) / 1200) * 100);

    return (
        <div className="py-5 md:py-7">
            <ViewHeader
                icon={LayoutDashboard}
                eyebrow="Command deck"
                title="Training overview"
                description="Today's target, block progress, recent load, and the trends that matter — at a glance."
            />

            <div className="grid grid-cols-2 gap-3.5 animate-stagger lg:grid-cols-4">
                <div className="ee-panel-soft flex items-center gap-3.5 p-4">
                    <ProgressRing size={52} stroke={4.5} progress={metrics.progressPercentage} color="rgb(var(--c-amber))">
                        <span className="font-mono text-[11px] font-semibold text-bone">{metrics.progressPercentage}%</span>
                    </ProgressRing>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-mute">Block progress</p>
                        <p className="mt-1 text-xs text-mute">{metrics.completedSets}/{metrics.totalSets} sets</p>
                    </div>
                </div>
                <StatCard icon={Flame} label="Streak" value={metrics.streak} detail="consecutive sessions" accentClass="text-coral" accentBg="bg-coral/10" />
                <StatCard icon={Activity} label="7-day sets" value={metrics.recentSets} detail="logged this week" accentClass="text-teal" accentBg="bg-teal/10" />
                <div className="ee-panel-soft flex items-center gap-3.5 p-4">
                    <ProgressRing size={52} stroke={4.5} progress={levelProgress} color="rgb(var(--c-sky))">
                        <Medal size={17} className="text-sky" />
                    </ProgressRing>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-mute">Level {level}</p>
                        <p className="mt-1 text-xs text-mute">{levelProgress}% to next</p>
                    </div>
                </div>
            </div>

            <section className="ee-panel mt-5 p-5 sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <p className="ee-eyebrow text-amber"><Crosshair size={12} /> Next workout</p>
                        <h2 className="mt-2 truncate font-display text-xl font-bold text-bone sm:text-2xl">
                            {nextWorkout ? nextWorkout.workout?.label || nextWorkout.workoutName : 'Program complete'}
                        </h2>
                        <p className="mt-1 text-sm text-mute">
                            {nextWorkout ? `Week ${nextWorkout.week} · ${nextWorkout.dayKey}` : 'Start a new block from the Program Hub.'}
                        </p>
                    </div>
                    {nextWorkout && (
                        <button
                            onClick={() => onNavigate && onNavigate('lifting', { week: nextWorkout.week, dayKey: nextWorkout.dayKey })}
                            className="ee-primary flex-shrink-0"
                        >
                            <Play size={15} /> Start
                        </button>
                    )}
                </div>
                {nextExercises.length > 0 && (
                    <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        {nextExercises.map((ex, index) => (
                            <div key={ex.id || ex.name} className="rounded-xl border border-line bg-well/50 p-3">
                                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-mute/70">0{index + 1}</p>
                                <p className="mt-1 truncate text-sm font-bold text-bone">{ex.name}</p>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="ee-panel mt-5 p-5 sm:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="ee-eyebrow text-amber"><Trophy size={12} /> Top estimated maxes</p>
                        <h2 className="mt-2 font-display text-lg font-bold text-bone">Strongest sightings</h2>
                    </div>
                </div>
                <div className="mt-4 grid gap-2.5 md:grid-cols-3">
                    {metrics.topPrs.length > 0 ? metrics.topPrs.map((record, i) => (
                        <div key={record.exercise} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-well/50 p-3.5">
                            <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-bone">{record.exercise}</p>
                                <p className="mt-0.5 text-[11px] text-mute">Week {record.log.week} · {record.log.dayKey}</p>
                            </div>
                            <div className="flex-shrink-0 text-right">
                                <p className="font-display text-xl font-bold text-teal">{record.e1rm}</p>
                                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-mute">e1RM</p>
                            </div>
                        </div>
                    )) : (
                        <p className="rounded-xl border border-line bg-well/50 p-4 text-sm text-mute md:col-span-3">
                            Log a few sets to establish your first PR records.
                        </p>
                    )}
                </div>
            </section>

            <div className="mt-5 grid gap-5 lg:grid-cols-2">
                <section className="ee-panel p-5 sm:p-6">
                    <p className="ee-eyebrow text-teal"><BarChart2 size={12} /> Weekly volume</p>
                    <h2 className="mb-4 mt-2 font-display text-lg font-bold text-bone">Load trajectory</h2>
                    {weeklyVolumeData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <AreaChart data={weeklyVolumeData}>
                                <defs>
                                    <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="rgb(var(--c-teal))" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="rgb(var(--c-teal))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--c-line))" opacity={0.4} vertical={false} />
                                <XAxis dataKey="week" tick={{ fill: 'rgb(var(--c-mute))', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: 'rgb(var(--c-mute))', fontSize: 11 }} axisLine={false} tickLine={false} width={52} />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Area type="monotone" dataKey="volume" stroke="rgb(var(--c-teal))" fill="url(#volumeGradient)" strokeWidth={2.5} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : <EmptyChart message="The volume chart activates after your first logged set." />}
                </section>

                <section className="ee-panel p-5 sm:p-6">
                    <p className="ee-eyebrow text-amber"><Scale size={12} /> Bodyweight</p>
                    <h2 className="mb-4 mt-2 font-display text-lg font-bold text-bone">Trend line</h2>
                    {bodyWeightData.length > 1 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <LineChart data={bodyWeightData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--c-line))" opacity={0.4} vertical={false} />
                                <XAxis dataKey="date" tick={{ fill: 'rgb(var(--c-mute))', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis domain={['auto', 'auto']} tick={{ fill: 'rgb(var(--c-mute))', fontSize: 11 }} axisLine={false} tickLine={false} width={44} />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Line type="monotone" dataKey="weight" stroke="rgb(var(--c-amber))" strokeWidth={2.5} dot={{ r: 3.5, fill: 'rgb(var(--c-amber))' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : <EmptyChart message="Log bodyweight twice in Settings to unlock trend tracking." />}
                </section>
            </div>
        </div>
    );
};
