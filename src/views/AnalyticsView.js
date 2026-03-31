import React, { useState, useEffect, useMemo, useContext } from 'react';
import { BarChart2, Search } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AppStateContext } from '../contexts/AppStateContext';
import { calculateE1RM, getExerciseDetails, getSetVolume } from '../utils/helpers';

export const MuscleGroupDetailModal = ({ muscleName, exerciseData, onClose }) => {
    const contributingExercises = useMemo(() => {
        if (!exerciseData) return [];
        return Object.entries(exerciseData)
            .map(([name, volume]) => ({ name, volume: parseFloat(volume.toFixed(1)) }))
            .sort((a, b) => b.volume - a.volume);
    }, [exerciseData]);

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Set Contribution for {muscleName}</h2>
            <div className="max-h-60 overflow-y-auto pr-2">
                <ul className="space-y-2">
                    {contributingExercises.map(({ name, volume }) => (
                        <li key={name} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700/50 rounded-md">
                            <span className="font-semibold text-gray-900 dark:text-white">{name}</span>
                            <span className="text-gray-700 dark:text-gray-300">{volume.toLocaleString()} sets</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex justify-end mt-6">
                <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Close</button>
            </div>
        </div>
    );
};

export const AnalyticsView = ({ allLogs, programData, onBack }) => {
    const { masterExerciseList } = programData;
    const { openModal, closeModal } = useContext(AppStateContext);
    const [selectedExercise, setSelectedExercise] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [muscleSearchTerm, setMuscleSearchTerm] = useState('');

    const uniqueExercises = useMemo(() => Object.keys(masterExerciseList || {}).sort(), [masterExerciseList]);
    const filteredExercises = useMemo(() => uniqueExercises.filter(ex => ex.toLowerCase().includes(searchTerm.toLowerCase())), [uniqueExercises, searchTerm]);

    useEffect(() => {
        if (filteredExercises.length > 0 && !selectedExercise) {
            setSelectedExercise(filteredExercises[0]);
        } else if (filteredExercises.length > 0 && !filteredExercises.includes(selectedExercise)) {
            setSelectedExercise(filteredExercises[0]);
        } else if (filteredExercises.length === 0) {
            setSelectedExercise('');
        }
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
            if (!session.sets || session.sets.length === 0) return null;
            const topSet = session.sets.reduce((best, current) => (calculateE1RM(current.load, current.reps, current.rir) > calculateE1RM(best.load, best.reps, best.rir) ? current : best));
            if (!topSet || isNaN(topSet.load) || isNaN(topSet.reps)) return null;
            return { sessionLabel: `W${session.week} ${session.dayKey}`, e1RM: calculateE1RM(topSet.load, topSet.reps, topSet.rir), load: topSet.load, reps: topSet.reps };
        }).filter(Boolean);
        
        const dayOrder = programData.weeklySchedule.reduce((acc, day, index) => {
            acc[day.day] = index;
            return acc;
        }, {});
        const scheduleLength = programData.weeklySchedule.length || 7;

        return processedData.sort((a, b) => {
            const [weekLabelA, dayLabelA] = a.sessionLabel.substring(1).split(' ');
            const [weekLabelB, dayLabelB] = b.sessionLabel.substring(1).split(' ');
            const weekA = parseInt(weekLabelA, 10);
            const weekB = parseInt(weekLabelB, 10);

            const dayIndexA = dayOrder[dayLabelA] ?? parseInt(dayLabelA.split('-')[1], 10) ?? 99;
            const dayIndexB = dayOrder[dayLabelB] ?? parseInt(dayLabelB.split('-')[1], 10) ?? 99;

            const dayNumA = (weekA - 1) * scheduleLength + dayIndexA;
            const dayNumB = (weekB - 1) * scheduleLength + dayIndexB;

            return dayNumA - dayNumB;
        });
    }, [selectedExercise, allLogs]);

    const volumeData = useMemo(() => {
        if (Object.keys(allLogs).length === 0) return [];
        const volumesByWeek = {};
        Object.values(allLogs).forEach(log => {
            if ((log.load === 0 || log.load) && log.reps && log.week) {
                const week = log.week;
                if (!volumesByWeek[week]) {
                    volumesByWeek[week] = 0;
                }
                volumesByWeek[week] += getSetVolume(log, masterExerciseList);
            }
        });
        return Object.entries(volumesByWeek).map(([week, volume]) => ({
            week: `Week ${week}`,
            totalVolume: Math.round(volume)
        })).sort((a, b) => parseInt(a.week.split(' ')[1]) - parseInt(b.week.split(' ')[1]));
    }, [allLogs, masterExerciseList]);


    const muscleGroupData = useMemo(() => {
        if (!allLogs || Object.keys(allLogs).length === 0 || !masterExerciseList) return [];

        const lastLoggedWeek = Math.max(0, ...Object.values(allLogs).map(log => log.week || 0));
        if (lastLoggedWeek === 0) return [];

        const weekLogs = Object.values(allLogs).filter(log => log.week === lastLoggedWeek && !log.skipped && (log.load === 0 || log.load) && log.reps);
        if (weekLogs.length === 0) return [];

        const dataByMuscle = {};

        const ensureMuscle = (muscle) => {
            if (muscle && !dataByMuscle[muscle]) {
                dataByMuscle[muscle] = { sets: 0, exercises: {} };
            }
        };

        weekLogs.forEach(log => {
            const exerciseDetails = getExerciseDetails(log.exercise, masterExerciseList);
            if (exerciseDetails?.muscles) {
                const { primary, secondary, tertiary, primaryContribution, secondaryContribution, tertiaryContribution } = exerciseDetails.muscles;

                // Each log is one set
                const numSets = 1;

                if (primary) {
                    ensureMuscle(primary);
                    const contributedSets = (primaryContribution || 1) * numSets;
                    dataByMuscle[primary].sets += contributedSets;
                    dataByMuscle[primary].exercises[log.exercise] = (dataByMuscle[primary].exercises[log.exercise] || 0) + contributedSets;
                }
                if (secondary) {
                    ensureMuscle(secondary);
                    const contributedSets = (secondaryContribution || 0.5) * numSets;
                    dataByMuscle[secondary].sets += contributedSets;
                    dataByMuscle[secondary].exercises[log.exercise] = (dataByMuscle[secondary].exercises[log.exercise] || 0) + contributedSets;
                }
                if (tertiary) {
                    ensureMuscle(tertiary);
                    const contributedSets = (tertiaryContribution || 0.25) * numSets;
                    dataByMuscle[tertiary].sets += contributedSets;
                    dataByMuscle[tertiary].exercises[log.exercise] = (dataByMuscle[tertiary].exercises[log.exercise] || 0) + contributedSets;
                }
            }
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

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF42A1', '#42A1FF'];
    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, name, setsPercentage }) => {
        const radius = outerRadius + 30;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        const sin = Math.sin(-midAngle * RADIAN);
        const cos = Math.cos(-midAngle * RADIAN);
        const sx = cx + (outerRadius + 10) * cos;
        const sy = cy + (outerRadius + 10) * sin;
        const mx = cx + (outerRadius + 20) * cos;
        const my = cy + (outerRadius + 20) * sin;
        const ex = mx + (cos >= 0 ? 1 : -1) * 12;
        const ey = my;
        const textAnchor = cos >= 0 ? 'start' : 'end';

        return (
            <g>
                <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={"#9ca3af"} fill="none" />
                <circle cx={ex} cy={ey} r={2} fill={"#9ca3af"} />
                <text x={ex + (cos >= 0 ? 1 : -1) * 8} y={ey} textAnchor={textAnchor} fill="#9ca3af" dy={4} className="text-xs">
                    {`${name} (${setsPercentage}%)`}
                </text>
            </g>
        );
    };

    return (
        <div className="p-4 md:p-6 pb-24">
            <div className="flex flex-col items-center text-center mb-6">
                <div className="flex justify-center items-center">
                    <BarChart2 className="text-blue-500 dark:text-blue-400 mr-2" size={32} />
                    <h1 className="text-3xl font-bold dark:text-white">Analytics</h1>
                </div>
            </div>

            <div className="space-y-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
                     <h3 className="font-semibold dark:text-gray-200 mb-4">Individual Exercise Progression</h3>
                     <div className="mb-6 space-y-4">
                        <div>
                            <label htmlFor="exercise-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search Exercise:</label>
                            <input id="exercise-search" type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="e.g., Bench Press" className="w-full p-2 bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-600 shadow-sm"/>
                        </div>
                        <div>
                            <label htmlFor="exercise-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Exercise:</label>
                            <select id="exercise-select" value={selectedExercise} onChange={e => setSelectedExercise(e.target.value)} className="w-full p-2 bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-600 shadow-sm">
                                {filteredExercises.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                            </select>
                        </div>
                    </div>
                    {chartData.length > 0 ? (
                        <div className="space-y-8">
                            <div className="w-full aspect-video">
                                <h4 className="font-semibold text-sm dark:text-gray-300 mb-2">RIR-Adjusted e1RM Progression</h4>
                                <ResponsiveContainer>
                                    <LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" /><XAxis dataKey="sessionLabel" tick={{ fill: '#9ca3af' }} /><YAxis domain={[dataMin => Math.max(0, Math.floor(dataMin * 0.9)), 'auto']} tick={{ fill: '#9ca3af' }} /><Tooltip contentStyle={{ backgroundColor: 'var(--tooltip-bg)', border: '1px solid var(--tooltip-border)' }} /><Legend align="center" /><Line type="monotone" dataKey="e1RM" name="e1RM" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} /></LineChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="w-full aspect-video">
                                <h4 className="font-semibold text-sm dark:text-gray-300 mb-2">Load & Reps for Top Set</h4>
                                <ResponsiveContainer>
                                    <LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" /><XAxis dataKey="sessionLabel" tick={{ fill: '#9ca3af' }} /><YAxis yAxisId="left" stroke="#8884d8" label={{ value: 'Load', angle: -90, position: 'insideLeft', fill: '#8884d8' }} domain={[dataMin => Math.max(0, Math.floor(dataMin * 0.9)), 'auto']} tick={{ fill: '#8884d8' }} /><YAxis yAxisId="right" orientation="right" stroke="#82ca9d" label={{ value: 'Reps', angle: 90, position: 'insideRight', fill: '#82ca9d' }} domain={[dataMin => Math.max(0, Math.floor(dataMin * 0.8)), 'auto']} allowDecimals={false} tick={{ fill: '#82ca9d' }} /><Tooltip contentStyle={{ backgroundColor: 'var(--tooltip-bg)', border: '1px solid var(--tooltip-border)' }} /><Legend align="center" /><Line yAxisId="left" type="monotone" dataKey="load" name="Load" stroke="#8884d8" /><Line yAxisId="right" type="monotone" dataKey="reps" name="Reps" stroke="#82ca9d" /></LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    ) : (
                        <div className="aspect-video flex flex-col justify-center items-center text-center"><BarChart2 size={48} className="text-gray-400 dark:text-gray-500 mb-4" /><h3 className="font-semibold text-xl dark:text-gray-200">No Data Yet</h3><p className="text-gray-500 dark:text-gray-400">{selectedExercise ? `Log some sets for ${selectedExercise} to see your progress.` : 'Select an exercise to view your charts.'}</p></div>
                    )}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
                    <h3 className="font-semibold dark:text-gray-200 mb-2">Total Weekly Volume</h3>
                     {volumeData.length > 1 ? (
                        <div className="w-full aspect-video">
                            <ResponsiveContainer>
                                <LineChart data={volumeData}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                                    <XAxis dataKey="week" tick={{ fill: '#9ca3af' }} />
                                    <YAxis domain={[0, 'auto']} tick={{ fill: '#9ca3af' }} />
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--tooltip-bg)', border: '1px solid var(--tooltip-border)' }} formatter={(value) => [`${value.toLocaleString()} lbs`, 'Total Volume']} />
                                    <Legend align="center" />
                                    <Line type="monotone" dataKey="totalVolume" name="Total Volume" stroke="#ffc658" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="aspect-video flex flex-col justify-center items-center text-center">
                            <BarChart2 size={48} className="text-gray-400 dark:text-gray-500 mb-4" />
                            <h3 className="font-semibold text-xl dark:text-gray-200">Not Enough Data</h3>
                            <p className="text-gray-500 dark:text-gray-400">Log at least two weeks of workouts to see your volume progression.</p>
                        </div>
                    )}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
                    <h3 className="font-semibold dark:text-gray-200 mb-2">Muscle Group Set Distribution (Last Week)</h3>
                    {muscleGroupData.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-8 items-center">
                            <div className="w-full aspect-square">
                               <ResponsiveContainer>
                                    <PieChart margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                                        <Pie data={muscleGroupData} dataKey="sets" nameKey="name" cx="50%" cy="50%" outerRadius="50%" fill="#8884d8" labelLine={false} label={({ cx, cy, midAngle, outerRadius, name, setsPercentage }) => renderCustomizedLabel({ cx, cy, midAngle, outerRadius, name, setsPercentage: setsPercentage })}>
                                            {muscleGroupData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value, name, props) => [`${props.payload.sets.toLocaleString()} sets (${props.payload.setsPercentage}%)`, 'Total Sets']} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="text-sm">
                                <h4 className="font-bold text-lg mb-2">Sets Per Muscle Group</h4>
                                <input
                                    type="text"
                                    placeholder="Search muscle groups..."
                                    value={muscleSearchTerm}
                                    onChange={e => setMuscleSearchTerm(e.target.value)}
                                    className="w-full p-2 mb-3 bg-white dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600"
                                />
                                <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                    {muscleGroupData
                                        .filter(d => d.name.toLowerCase().includes(muscleSearchTerm.toLowerCase()))
                                        .map(d => (
                                        <li key={d.name}>
                                            <button onClick={() => openModal(<MuscleGroupDetailModal muscleName={d.name} exerciseData={d.exercises} onClose={closeModal}/>)} className="w-full flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-left">
                                                <span className="font-semibold">{d.name}</span>
                                                <span>{d.sets.toLocaleString()} sets ({d.setsPercentage}%)</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ) : (
                         <div className="aspect-video flex flex-col justify-center items-center text-center"><BarChart2 size={48} className="text-gray-400 dark:text-gray-500 mb-4" /><h3 className="font-semibold text-xl dark:text-gray-200">No Data for this Period</h3><p className="text-gray-500 dark:text-gray-400">Log some workouts to see your muscle distribution.</p></div>
                    )}
                </div>
            </div>
        </div>
    );
};