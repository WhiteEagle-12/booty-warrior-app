import React, { useState, useEffect, useMemo, useContext } from 'react';
import { BarChart2, Search, Activity, PieChart as PieIcon, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AppStateContext } from '../contexts/AppStateContext';
import { calculateE1RM, getExerciseDetails, getSetVolume } from '../utils/helpers';
import { ViewHeader } from '../components/common/ViewHeader';

const CHART_COLORS = ['#45d6c2', '#f5b942', '#6f96d8', '#f4684f', '#9dd8cf', '#c8b58a', '#7ea1d2'];
const tooltipStyle = {
    backgroundColor: 'rgb(var(--c-panel))',
    border: '1px solid rgb(var(--c-line))',
    borderRadius: 12,
    color: 'rgb(var(--c-bone))',
    fontSize: 12,
    fontWeight: 700,
};
const axisTick = { fill: 'rgb(var(--c-mute))', fontSize: 11 };

export const MuscleGroupDetailModal = ({ muscleName, exerciseData, onClose }) => {
    const contributingExercises = useMemo(() => {
        if (!exerciseData) return [];
        return Object.entries(exerciseData)
            .map(([name, volume]) => ({ name, volume: parseFloat(volume.toFixed(1)) }))
            .sort((a, b) => b.volume - a.volume);
    }, [exerciseData]);

    return (
        <div>
            <p className="ee-eyebrow text-teal"><PieIcon size={12} /> Set contribution</p>
            <h2 className="mt-2 font-display text-xl font-bold text-bone">{muscleName}</h2>
            <div className="mt-5 max-h-72 overflow-y-auto pr-1">
                <ul className="space-y-2">
                    {contributingExercises.map(({ name, volume }) => (
                        <li key={name} className="ee-panel-soft flex items-center justify-between p-3">
                            <span className="text-sm font-bold text-bone">{name}</span>
                            <span className="font-mono text-xs font-semibold tabular-nums text-teal">{volume.toLocaleString()} sets</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="mt-6 flex justify-end">
                <button onClick={onClose} className="ee-primary">Close</button>
            </div>
        </div>
    );
};

export const AnalyticsView = ({ allLogs, programData, embedded = false }) => {
    const { masterExerciseList } = programData;
    const { openModal, closeModal } = useContext(AppStateContext);
    const [selectedExercise, setSelectedExercise] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [muscleSearchTerm, setMuscleSearchTerm] = useState('');

    const uniqueExercises = useMemo(() => Object.keys(masterExerciseList || {}).sort(), [masterExerciseList]);
    const filteredExercises = useMemo(() => uniqueExercises.filter(ex => ex.toLowerCase().includes(searchTerm.toLowerCase())), [uniqueExercises, searchTerm]);

    useEffect(() => {
        if (filteredExercises.length > 0 && !selectedExercise) setSelectedExercise(filteredExercises[0]);
        else if (filteredExercises.length > 0 && !filteredExercises.includes(selectedExercise)) setSelectedExercise(filteredExercises[0]);
        else if (filteredExercises.length === 0) setSelectedExercise('');
    }, [filteredExercises, selectedExercise]);

    const chartData = useMemo(() => {
        if (!selectedExercise || Object.keys(allLogs).length === 0) return [];
        const sessions = Object.values(allLogs).reduce((acc, log) => {
            if (log.exercise === selectedExercise && (log.load === 0 || log.load) && log.reps) {
                const sessionKey = `${log.week}-${log.dayKey}`;
                if (!acc[sessionKey]) acc[sessionKey] = { week: parseInt(log.week, 10), dayKey: log.dayKey, sets: [] };
                acc[sessionKey].sets.push({ ...log, load: parseFloat(log.load), reps: parseInt(log.reps, 10), rir: parseInt(log.rir, 10) });
            }
            return acc;
        }, {});
        const processedData = Object.values(sessions).map(session => {
            if (!session.sets?.length) return null;
            const topSet = session.sets.reduce((best, current) => (
                calculateE1RM(current.load, current.reps, current.rir) > calculateE1RM(best.load, best.reps, best.rir) ? current : best
            ));
            if (!topSet || isNaN(topSet.load) || isNaN(topSet.reps)) return null;
            return { sessionLabel: `W${session.week} ${session.dayKey}`, e1RM: calculateE1RM(topSet.load, topSet.reps, topSet.rir), load: topSet.load, reps: topSet.reps };
        }).filter(Boolean);

        const dayOrder = programData.weeklySchedule.reduce((acc, day, index) => ({ ...acc, [day.day]: index }), {});
        const scheduleLength = programData.weeklySchedule.length || 7;
        return processedData.sort((a, b) => {
            const [weekLabelA, dayLabelA] = a.sessionLabel.substring(1).split(' ');
            const [weekLabelB, dayLabelB] = b.sessionLabel.substring(1).split(' ');
            const weekA = parseInt(weekLabelA, 10);
            const weekB = parseInt(weekLabelB, 10);
            const dayIndexA = dayOrder[dayLabelA] ?? parseInt(dayLabelA.split('-')[1], 10) ?? 99;
            const dayIndexB = dayOrder[dayLabelB] ?? parseInt(dayLabelB.split('-')[1], 10) ?? 99;
            return ((weekA - 1) * scheduleLength + dayIndexA) - ((weekB - 1) * scheduleLength + dayIndexB);
        });
    }, [selectedExercise, allLogs, programData]);

    const volumeData = useMemo(() => {
        if (Object.keys(allLogs).length === 0) return [];
        const volumesByWeek = {};
        Object.values(allLogs).forEach(log => {
            if ((log.load === 0 || log.load) && log.reps && log.week) {
                volumesByWeek[log.week] = (volumesByWeek[log.week] || 0) + getSetVolume(log, masterExerciseList);
            }
        });
        return Object.entries(volumesByWeek)
            .map(([week, volume]) => ({ week: `W${week}`, totalVolume: Math.round(volume) }))
            .sort((a, b) => parseInt(a.week.slice(1), 10) - parseInt(b.week.slice(1), 10));
    }, [allLogs, masterExerciseList]);

    const muscleGroupData = useMemo(() => {
        if (!allLogs || Object.keys(allLogs).length === 0 || !masterExerciseList) return [];
        const lastLoggedWeek = Math.max(0, ...Object.values(allLogs).map(log => log.week || 0));
        if (lastLoggedWeek === 0) return [];
        const weekLogs = Object.values(allLogs).filter(log => log.week === lastLoggedWeek && !log.skipped && (log.load === 0 || log.load) && log.reps);
        const dataByMuscle = {};
        const ensureMuscle = (muscle) => {
            if (muscle && !dataByMuscle[muscle]) dataByMuscle[muscle] = { sets: 0, exercises: {} };
        };
        weekLogs.forEach(log => {
            const details = getExerciseDetails(log.exercise, masterExerciseList);
            if (!details?.muscles) return;
            ['primary', 'secondary', 'tertiary'].forEach(role => {
                const muscle = details.muscles[role];
                const contribution = details.muscles[`${role}Contribution`] ?? (role === 'primary' ? 1 : 0.5);
                if (!muscle || contribution <= 0) return;
                ensureMuscle(muscle);
                dataByMuscle[muscle].sets += contribution;
                dataByMuscle[muscle].exercises[log.exercise] = (dataByMuscle[muscle].exercises[log.exercise] || 0) + contribution;
            });
        });
        const totalSets = Object.values(dataByMuscle).reduce((sum, d) => sum + d.sets, 0);
        if (totalSets === 0) return [];
        return Object.entries(dataByMuscle).map(([name, data]) => ({
            name,
            sets: parseFloat(data.sets.toFixed(1)),
            setsPercentage: Math.round((data.sets / totalSets) * 100),
            exercises: data.exercises,
        })).sort((a, b) => b.sets - a.sets);
    }, [allLogs, masterExerciseList]);

    return (
        <div className={embedded ? '' : 'py-6 md:py-9'}>
            {!embedded && (
                <ViewHeader
                    icon={BarChart2}
                    eyebrow="Trends"
                    title="Analytics"
                    description="Exercise progression, weekly volume, and how your sets land across muscle groups."
                />
            )}

            <section className="ee-panel p-5 sm:p-6">
                <p className="ee-eyebrow text-teal"><TrendingUp size={12} /> Individual progression</p>
                <h2 className="mb-5 mt-2 font-display text-xl font-medium text-bone">Lift by lift</h2>
                <div className="mb-6 grid gap-4 md:grid-cols-2">
                    <div>
                        <label htmlFor="exercise-search" className="ee-label">Search exercise</label>
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mute" size={16} />
                            <input id="exercise-search" type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="e.g., Bench Press" className="ee-input pl-10" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="exercise-select" className="ee-label">Selected exercise</label>
                        <select id="exercise-select" value={selectedExercise} onChange={e => setSelectedExercise(e.target.value)} className="ee-input">
                            {filteredExercises.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                        </select>
                    </div>
                </div>
                {chartData.length > 0 ? (
                    <div className="grid gap-6 xl:grid-cols-2">
                        <div className="h-72">
                            <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-mute">RIR-adjusted e1RM</h3>
                            <ResponsiveContainer>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--c-line))" opacity={0.4} vertical={false} />
                                    <XAxis dataKey="sessionLabel" tick={axisTick} axisLine={false} tickLine={false} />
                                    <YAxis domain={[dataMin => Math.max(0, Math.floor(dataMin * 0.9)), 'auto']} tick={axisTick} axisLine={false} tickLine={false} width={44} />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Line type="monotone" dataKey="e1RM" name="e1RM" stroke="rgb(var(--c-teal))" strokeWidth={2.5} dot={{ r: 3.5, fill: 'rgb(var(--c-teal))' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="h-72">
                            <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-mute">Top set load &amp; reps</h3>
                            <ResponsiveContainer>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--c-line))" opacity={0.4} vertical={false} />
                                    <XAxis dataKey="sessionLabel" tick={axisTick} axisLine={false} tickLine={false} />
                                    <YAxis yAxisId="left" stroke="rgb(var(--c-amber))" tick={{ fill: 'rgb(var(--c-amber))', fontSize: 11 }} axisLine={false} tickLine={false} width={44} />
                                    <YAxis yAxisId="right" orientation="right" stroke="rgb(var(--c-sky))" allowDecimals={false} tick={{ fill: 'rgb(var(--c-sky))', fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Legend align="center" wrapperStyle={{ fontSize: 12, color: 'rgb(var(--c-mute))' }} />
                                    <Line yAxisId="left" type="monotone" dataKey="load" name="Load" stroke="rgb(var(--c-amber))" strokeWidth={2} dot={false} />
                                    <Line yAxisId="right" type="monotone" dataKey="reps" name="Reps" stroke="rgb(var(--c-sky))" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                ) : (
                    <div className="flex min-h-64 flex-col items-center justify-center py-10 text-center">
                        <Activity size={40} className="text-line" />
                        <h3 className="mt-4 font-display text-lg font-bold text-bone">No data yet</h3>
                        <p className="mt-1 text-sm text-mute">{selectedExercise ? `Log sets for ${selectedExercise} to see your progress.` : 'Select an exercise to view charts.'}</p>
                    </div>
                )}
            </section>

            <section className="mt-5 grid gap-5 lg:grid-cols-2">
                <div className="ee-panel p-5 sm:p-6">
                    <p className="ee-eyebrow text-amber"><BarChart2 size={12} /> Weekly volume</p>
                    <h2 className="mb-4 mt-2 font-display text-lg font-bold text-bone">Total tonnage</h2>
                    {volumeData.length > 1 ? (
                        <div className="h-72">
                            <ResponsiveContainer>
                                <LineChart data={volumeData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--c-line))" opacity={0.4} vertical={false} />
                                    <XAxis dataKey="week" tick={axisTick} axisLine={false} tickLine={false} />
                                    <YAxis domain={[0, 'auto']} tick={axisTick} axisLine={false} tickLine={false} width={52} />
                                    <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value.toLocaleString()} lbs`, 'Total Volume']} />
                                    <Line type="monotone" dataKey="totalVolume" name="Total Volume" stroke="rgb(var(--c-amber))" strokeWidth={2.5} dot={{ r: 3.5, fill: 'rgb(var(--c-amber))' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex h-72 flex-col items-center justify-center text-center">
                            <BarChart2 size={36} className="text-line" />
                            <p className="mt-3 max-w-[220px] text-sm text-mute">Log at least two weeks to see volume progression.</p>
                        </div>
                    )}
                </div>

                <div className="ee-panel p-5 sm:p-6">
                    <p className="ee-eyebrow text-teal"><PieIcon size={12} /> Muscle distribution</p>
                    <h2 className="mb-4 mt-2 font-display text-lg font-bold text-bone">Latest week's focus</h2>
                    {muscleGroupData.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
                            <div className="h-64">
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie data={muscleGroupData} dataKey="sets" nameKey="name" cx="50%" cy="50%" innerRadius="45%" outerRadius="72%" paddingAngle={2} strokeWidth={0}>
                                            {muscleGroupData.map((entry, index) => <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip contentStyle={tooltipStyle} formatter={(value, name, props) => [`${props.payload.sets.toLocaleString()} sets (${props.payload.setsPercentage}%)`, name]} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div>
                                <div className="relative mb-3">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mute" size={15} />
                                    <input type="text" placeholder="Filter muscles..." value={muscleSearchTerm} onChange={e => setMuscleSearchTerm(e.target.value)} className="ee-input py-2 pl-10 text-xs" />
                                </div>
                                <ul className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
                                    {muscleGroupData.filter(d => d.name.toLowerCase().includes(muscleSearchTerm.toLowerCase())).map(d => (
                                        <li key={d.name}>
                                            <button onClick={() => openModal(<MuscleGroupDetailModal muscleName={d.name} exerciseData={d.exercises} onClose={closeModal} />)} className="ee-panel-soft flex w-full items-center justify-between p-2.5 text-left transition-colors hover:bg-line/30">
                                                <span className="text-sm font-bold text-bone">{d.name}</span>
                                                <span className="font-mono text-[11px] font-semibold tabular-nums text-teal">{d.sets.toLocaleString()} · {d.setsPercentage}%</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-72 flex-col items-center justify-center text-center">
                            <PieIcon size={36} className="text-line" />
                            <p className="mt-3 max-w-[220px] text-sm text-mute">Log workouts to see estimated effective-set distribution.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};
