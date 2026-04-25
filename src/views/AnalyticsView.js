import React, { useState, useEffect, useMemo, useContext } from 'react';
import { BarChart2, Search, Activity, PieChart as PieIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AppStateContext } from '../contexts/AppStateContext';
import { calculateE1RM, getExerciseDetails, getSetVolume } from '../utils/helpers';

const CHART_COLORS = ['#4dd6c6', '#f3b548', '#5b83c4', '#f36f52', '#9dd8cf', '#c8b58a', '#7ea1d2'];
const chartTooltip = { backgroundColor: 'var(--tooltip-bg)', border: '1px solid var(--tooltip-border)', color: '#efe7d5' };

export const MuscleGroupDetailModal = ({ muscleName, exerciseData, onClose }) => {
    const contributingExercises = useMemo(() => {
        if (!exerciseData) return [];
        return Object.entries(exerciseData)
            .map(([name, volume]) => ({ name, volume: parseFloat(volume.toFixed(1)) }))
            .sort((a, b) => b.volume - a.volume);
    }, [exerciseData]);

    return (
        <div>
            <h2 className="text-xl font-black text-[#efe7d5] mb-4">Set Contribution for {muscleName}</h2>
            <div className="max-h-60 overflow-y-auto pr-2">
                <ul className="space-y-2">
                    {contributingExercises.map(({ name, volume }) => (
                        <li key={name} className="flex justify-between items-center p-3 ee-panel-soft rounded-xl">
                            <span className="font-semibold text-[#efe7d5]">{name}</span>
                            <span className="text-[#4dd6c6]">{volume.toLocaleString()} sets</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex justify-end mt-6">
                <button onClick={onClose} className="ee-primary">Close</button>
            </div>
        </div>
    );
};

export const AnalyticsView = ({ allLogs, programData }) => {
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
            .map(([week, volume]) => ({ week: `Week ${week}`, totalVolume: Math.round(volume) }))
            .sort((a, b) => parseInt(a.week.split(' ')[1], 10) - parseInt(b.week.split(' ')[1], 10));
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
        <div className="py-5 md:py-8 pb-24">
            <section className="ee-panel mb-6 rounded-2xl p-5 md:p-6">
                <div className="flex items-center gap-3">
                    <BarChart2 className="text-[#f3b548]" size={32} />
                    <div>
                        <p className="text-xs font-bold uppercase text-[#f3b548]">Performance data</p>
                        <h1 className="text-3xl font-black text-[#efe7d5]">Analytics</h1>
                    </div>
                </div>
                <p className="mt-3 text-[#9ca89d]">Exercise progression, weekly volume, and estimated effective-set distribution. Direct muscles count as 1.0 set; indirect muscles count as 0.5 set.</p>
            </section>

            <div className="space-y-6">
                <section className="ee-panel rounded-2xl p-5">
                    <div className="mb-5 flex items-center gap-2">
                        <Activity className="text-[#4dd6c6]" />
                        <h2 className="text-xl font-black text-[#efe7d5]">Individual Exercise Progression</h2>
                    </div>
                    <div className="mb-6 grid gap-4 md:grid-cols-2">
                        <div>
                            <label htmlFor="exercise-search" className="block text-sm font-medium text-[#9ca89d] mb-1">Search Exercise</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca89d]" size={18} />
                                <input id="exercise-search" type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="e.g., Bench Press" className="ee-input pl-10" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="exercise-select" className="block text-sm font-medium text-[#9ca89d] mb-1">Select Exercise</label>
                            <select id="exercise-select" value={selectedExercise} onChange={e => setSelectedExercise(e.target.value)} className="ee-input">
                                {filteredExercises.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                            </select>
                        </div>
                    </div>
                    {chartData.length > 0 ? (
                        <div className="grid gap-6 xl:grid-cols-2">
                            <div className="h-80">
                                <h3 className="font-bold text-sm text-[#efe7d5] mb-2">RIR-Adjusted e1RM</h3>
                                <ResponsiveContainer>
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(239,231,213,0.1)" />
                                        <XAxis dataKey="sessionLabel" tick={{ fill: '#9ca89d' }} />
                                        <YAxis domain={[dataMin => Math.max(0, Math.floor(dataMin * 0.9)), 'auto']} tick={{ fill: '#9ca89d' }} />
                                        <Tooltip contentStyle={chartTooltip} />
                                        <Legend align="center" />
                                        <Line type="monotone" dataKey="e1RM" name="e1RM" stroke="#4dd6c6" strokeWidth={3} dot={{ r: 4 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="h-80">
                                <h3 className="font-bold text-sm text-[#efe7d5] mb-2">Top Set Load & Reps</h3>
                                <ResponsiveContainer>
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(239,231,213,0.1)" />
                                        <XAxis dataKey="sessionLabel" tick={{ fill: '#9ca89d' }} />
                                        <YAxis yAxisId="left" stroke="#f3b548" tick={{ fill: '#f3b548' }} />
                                        <YAxis yAxisId="right" orientation="right" stroke="#5b83c4" allowDecimals={false} tick={{ fill: '#5b83c4' }} />
                                        <Tooltip contentStyle={chartTooltip} />
                                        <Legend align="center" />
                                        <Line yAxisId="left" type="monotone" dataKey="load" name="Load" stroke="#f3b548" strokeWidth={2} />
                                        <Line yAxisId="right" type="monotone" dataKey="reps" name="Reps" stroke="#5b83c4" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    ) : (
                        <div className="flex min-h-64 flex-col items-center justify-center text-center text-[#9ca89d]">
                            <BarChart2 size={48} className="mb-4" />
                            <h3 className="font-black text-xl text-[#efe7d5]">No Data Yet</h3>
                            <p>{selectedExercise ? `Log sets for ${selectedExercise} to see your progress.` : 'Select an exercise to view charts.'}</p>
                        </div>
                    )}
                </section>

                <section className="grid gap-6 lg:grid-cols-2">
                    <div className="ee-panel rounded-2xl p-5">
                        <h2 className="text-xl font-black text-[#efe7d5] mb-4">Total Weekly Volume</h2>
                        {volumeData.length > 1 ? (
                            <div className="h-80">
                                <ResponsiveContainer>
                                    <LineChart data={volumeData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(239,231,213,0.1)" />
                                        <XAxis dataKey="week" tick={{ fill: '#9ca89d' }} />
                                        <YAxis domain={[0, 'auto']} tick={{ fill: '#9ca89d' }} />
                                        <Tooltip contentStyle={chartTooltip} formatter={(value) => [`${value.toLocaleString()} lbs`, 'Total Volume']} />
                                        <Line type="monotone" dataKey="totalVolume" name="Total Volume" stroke="#f3b548" strokeWidth={3} dot={{ r: 4 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ) : <p className="py-16 text-center text-[#9ca89d]">Log at least two weeks to see volume progression.</p>}
                    </div>

                    <div className="ee-panel rounded-2xl p-5">
                        <div className="mb-4 flex items-center gap-2">
                            <PieIcon className="text-[#4dd6c6]" />
                            <h2 className="text-xl font-black text-[#efe7d5]">Muscle Group Distribution</h2>
                        </div>
                        {muscleGroupData.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-[0.95fr_1.05fr]">
                                <div className="h-72">
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie data={muscleGroupData} dataKey="sets" nameKey="name" cx="50%" cy="50%" outerRadius="70%">
                                                {muscleGroupData.map((entry, index) => <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip contentStyle={chartTooltip} formatter={(value, name, props) => [`${props.payload.sets.toLocaleString()} sets (${props.payload.setsPercentage}%)`, name]} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div>
                                    <input type="text" placeholder="Search muscle groups..." value={muscleSearchTerm} onChange={e => setMuscleSearchTerm(e.target.value)} className="ee-input mb-3" />
                                    <ul className="max-h-64 space-y-2 overflow-y-auto pr-2">
                                        {muscleGroupData.filter(d => d.name.toLowerCase().includes(muscleSearchTerm.toLowerCase())).map(d => (
                                            <li key={d.name}>
                                                <button onClick={() => openModal(<MuscleGroupDetailModal muscleName={d.name} exerciseData={d.exercises} onClose={closeModal}/>)} className="w-full flex justify-between items-center ee-panel-soft p-3 rounded-xl text-left">
                                                    <span className="font-semibold text-[#efe7d5]">{d.name}</span>
                                                    <span className="text-[#4dd6c6]">{d.sets.toLocaleString()} sets ({d.setsPercentage}%)</span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ) : <p className="py-16 text-center text-[#9ca89d]">Log workouts to see estimated effective-set distribution.</p>}
                    </div>
                </section>
            </div>
        </div>
    );
};
