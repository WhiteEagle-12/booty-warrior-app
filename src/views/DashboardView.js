import React, { useMemo } from 'react';
import { Activity, BarChart2, BrainCircuit, Crosshair, Dumbbell, Flame, Medal, Target, Trophy } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getSetVolume } from '../utils/helpers';
import { getProgramMetrics } from '../utils/trainingMetrics';

const StatCard = ({ icon: Icon, label, value, detail, accent = '#f3b548' }) => (
    <div className="ee-panel-soft rounded-xl p-4">
        <div className="flex items-center justify-between gap-3">
            <div>
                <p className="text-xs font-bold uppercase text-[#9ca89d]">{label}</p>
                <p className="mt-2 text-2xl font-black text-[#efe7d5]">{value}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: `${accent}1f`, color: accent }}>
                <Icon size={22} />
            </div>
        </div>
        {detail && <p className="mt-3 text-sm text-[#9ca89d]">{detail}</p>}
    </div>
);

const MissionBrief = ({ nextWorkout, nextExercises }) => (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="flex items-start justify-between gap-4">
            <div>
                <p className="text-xs font-bold uppercase text-[#f3b548]">Today's work</p>
                <h2 className="mt-1 text-2xl font-black text-[#efe7d5]">
                    {nextWorkout ? nextWorkout.workout?.label || nextWorkout.workoutName : 'Program complete'}
                </h2>
                <p className="mt-1 text-sm text-[#9ca89d]">
                    {nextWorkout ? `Week ${nextWorkout.week} / ${nextWorkout.dayKey}` : 'Start a new block from Program Hub.'}
                </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f3b548]/15 text-[#f3b548]">
                <Dumbbell size={22} />
            </div>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {nextExercises.length > 0 ? nextExercises.map((ex, index) => (
                <div key={ex.id || ex.name} className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-xs font-bold uppercase text-[#9ca89d]">Target {index + 1}</p>
                    <p className="mt-1 truncate font-bold text-[#efe7d5]">{ex.name}</p>
                </div>
            )) : (
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-[#9ca89d]">No upcoming exercises found.</div>
            )}
        </div>
    </div>
);

export const DashboardView = ({ allLogs, programData, bodyWeightHistory }) => {
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
       <div className="py-5 md:py-8">
            <section className="ee-panel overflow-hidden rounded-2xl p-5 md:p-7">
                <div>
                    <div>
                        <div className="ee-chip"><Crosshair size={14} /> Dashboard</div>
                        <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-normal text-[#efe7d5] md:text-5xl">Training Overview</h1>
                        <p className="mt-3 max-w-2xl text-base leading-7 text-[#9ca89d] md:text-lg">
                            A cleaner mission view for today's work, mesocycle progress, recent training load, and the signals that matter before the next set.
                        </p>
                        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                            <StatCard icon={Target} label="Meso lock" value={`${metrics.progressPercentage}%`} detail={`${metrics.completedSets}/${metrics.totalSets} sets`} />
                            <StatCard icon={Flame} label="Streak" value={metrics.streak} detail="Scheduled sessions" accent="#f36f52" />
                            <StatCard icon={Activity} label="7-day sets" value={metrics.recentSets} detail="Recent load" accent="#4dd6c6" />
                            <StatCard icon={Medal} label="Level" value={level} detail={`${levelProgress}% to next`} accent="#5b83c4" />
                        </div>
                        <div className="mt-5">
                            <MissionBrief nextWorkout={nextWorkout} nextExercises={nextExercises} />
                        </div>
                    </div>
                </div>
            </section>

            <div className="mt-6">
                <section className="ee-panel rounded-2xl p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase text-[#f3b548]">PR scope</p>
                            <h2 className="text-xl font-black text-[#efe7d5]">Top sights</h2>
                        </div>
                        <Trophy className="text-[#f3b548]" />
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                        {metrics.topPrs.length > 0 ? metrics.topPrs.map(record => (
                            <div key={record.exercise} className="flex items-center justify-between gap-3 rounded-xl bg-white/5 p-3">
                                <div>
                                    <p className="font-bold text-[#efe7d5]">{record.exercise}</p>
                                    <p className="text-xs text-[#9ca89d]">Week {record.log.week}, {record.log.dayKey}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-black text-[#4dd6c6]">{record.e1rm}</p>
                                    <p className="text-xs text-[#9ca89d]">e1RM</p>
                                </div>
                            </div>
                        )) : (
                            <p className="rounded-xl bg-white/5 p-4 text-sm text-[#9ca89d]">Log a few sets to establish your first PR sights.</p>
                        )}
                    </div>
                </section>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <section className="ee-panel rounded-2xl p-5">
                    <div className="mb-4 flex items-center gap-2">
                        <BarChart2 className="text-[#4dd6c6]" />
                        <h2 className="text-xl font-black text-[#efe7d5]">Weekly volume trajectory</h2>
                    </div>
                    {weeklyVolumeData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={weeklyVolumeData}>
                                <defs>
                                    <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4dd6c6" stopOpacity={0.45}/>
                                        <stop offset="95%" stopColor="#4dd6c6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(239,231,213,0.1)" />
                                <XAxis dataKey="week" tick={{ fill: '#9ca89d' }} />
                                <YAxis tick={{ fill: '#9ca89d' }} />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--tooltip-bg)', border: '1px solid var(--tooltip-border)', color: '#efe7d5' }} />
                                <Area type="monotone" dataKey="volume" stroke="#4dd6c6" fill="url(#volumeGradient)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : <p className="py-16 text-center text-[#9ca89d]">Volume chart activates after your first logged set.</p>}
                </section>

                <section className="ee-panel rounded-2xl p-5">
                    <div className="mb-4 flex items-center gap-2">
                        <BrainCircuit className="text-[#f3b548]" />
                        <h2 className="text-xl font-black text-[#efe7d5]">Bodyweight signal</h2>
                    </div>
                    {bodyWeightData.length > 1 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={bodyWeightData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(239,231,213,0.1)" />
                                <XAxis dataKey="date" tick={{ fill: '#9ca89d' }} />
                                <YAxis domain={['auto', 'auto']} tick={{ fill: '#9ca89d' }} />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--tooltip-bg)', border: '1px solid var(--tooltip-border)', color: '#efe7d5' }} />
                                <Line type="monotone" dataKey="weight" stroke="#f3b548" strokeWidth={3} dot={{ r: 4, fill: '#f3b548' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="py-16 text-center">
                            <p className="text-[#9ca89d]">Log bodyweight twice in Settings to unlock trend tracking.</p>
                        </div>
                    )}
                </section>
            </div>
       </div>
    );
};
