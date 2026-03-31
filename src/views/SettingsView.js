import React, { useState, useEffect, useMemo, useContext, useRef } from 'react';
import { Settings, Download, Upload, Repeat, AlertTriangle, HelpCircle } from 'lucide-react';
import { ThemeContext } from '../contexts/ThemeContext';
import { FirebaseContext } from '../contexts/FirebaseContext';
import { AppStateContext } from '../contexts/AppStateContext';
import { calculateE1RM } from '../utils/helpers';
import { InfoTooltip } from '../components/common/InfoTooltip';

export const SettingsView = ({ allLogs, historicalLogs, weightUnit, onWeightUnitChange, onResetMeso, programData, onProgramDataChange, onShowTutorial, bodyWeight, onBodyWeightChange, onBack, onFileImport, onDeleteUserData }) => {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const { customId, handleSetCustomId } = useContext(FirebaseContext);
    const { openModal, closeModal } = useContext(AppStateContext);
    const [tempId, setTempId] = useState(customId);
    const [exportSelection, setExportSelection] = useState('all');
    const fileInputRef = useRef(null);
    const [localBodyWeight, setLocalBodyWeight] = useState('');

    useEffect(() => {
        const bwInLbs = parseFloat(bodyWeight);
        if (!isNaN(bwInLbs) && bwInLbs > 0) {
            if (weightUnit === 'kg') {
                setLocalBodyWeight((bwInLbs / 2.20462).toFixed(1));
            } else {
                setLocalBodyWeight(Math.round(bwInLbs).toString());
            }
        } else {
            setLocalBodyWeight('');
        }
    }, [bodyWeight, weightUnit]);

    const handleFileImport = (event) => {
        const file = event.target.files[0];
        if (file) {
            onFileImport(file);
        }
        event.target.value = null;
    };

    const handleFileImportClick = () => {
        fileInputRef.current?.click();
    };

    const exportData = (logsToExport, filename) => {
        const validLogs = Object.values(logsToExport).filter(log => !log.skipped && log.exercise);
        if (validLogs.length === 0) {
            openModal(
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">No Data to Export</h2>
                    <p className="text-gray-600 dark:text-gray-400">There is no logged data for the selected option.</p>
                    <div className="flex justify-end gap-2 mt-6">
                        <button onClick={closeModal} className="px-4 py-2 bg-blue-600 text-white rounded-lg">OK</button>
                    </div>
                </div>
            );
            return;
        }
        const dayOrder = programData.weeklySchedule.reduce((acc, day, index) => {
            acc[day.day] = index;
            return acc;
        }, {});
        const scheduleLength = programData.weeklySchedule.length || 7;
        const sortedLogs = validLogs.sort((a, b) => {
            const dayNumA = (a.week - 1) * scheduleLength + (dayOrder[a.dayKey] ?? 99);
            const dayNumB = (b.week - 1) * scheduleLength + (dayOrder[b.dayKey] ?? 99);
            return dayNumA - dayNumB || a.set - b.set;
        });
        const headers = ['Week', 'Day', 'Session', 'Exercise', 'Set', 'Load (lbs)', 'Reps', 'RIR', 'e1RM'];
        const csvContent = [headers.join(','), ...sortedLogs.map(log => [log.week, log.dayKey, `"${log.session}"`, `"${log.exercise}"`, log.set, log.load, log.reps, log.rir || '', calculateE1RM(log.load, log.reps, log.rir)].join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const handleExport = () => {
        if (exportSelection === 'all') { exportData(historicalLogs, 'project_overload_all_data.csv'); return; }
        const [type, value] = exportSelection.split(':');
        let logsToExport = {};
        if (type === 'week') {
            logsToExport = Object.fromEntries(Object.entries(historicalLogs).filter(([, log]) => log.week?.toString() === value));
        } else if (type === 'workout') {
            const [week, dayKey] = value.split('-');
            logsToExport = Object.fromEntries(Object.entries(historicalLogs).filter(([, log]) => log.week?.toString() === week && log.dayKey === dayKey));
        }
        exportData(logsToExport, `project_overload_${type}_${value.replace('-', '_')}_data.csv`);
    };

    const hasLogs = Object.keys(historicalLogs).filter(k => !historicalLogs[k].skipped).length > 0;
    
    const exportOptions = useMemo(() => {
        if (!hasLogs) return { weeks: [], workouts: [] };
        const logs = Object.values(historicalLogs).filter(log => log.exercise && log.week && log.dayKey && !log.skipped);
        const dayOrder = programData.weeklySchedule.reduce((acc, day, index) => {
            acc[day.day] = index;
            return acc;
        }, {});
        const scheduleLength = programData.weeklySchedule.length || 7;
        const loggedWeeks = [...new Set(logs.map(log => log.week))].sort((a, b) => a - b);
        const loggedWorkouts = [...new Set(logs.map(log => `workout:${log.week}-${log.dayKey}`))].sort((a, b) => {
            const [, weekA, dayA] = a.split(/-|:/);
            const [, weekB, dayB] = b.split(/-|:/);
            const dayNumA = (parseInt(weekA) - 1) * scheduleLength + (dayOrder[dayA] ?? 99);
            const dayNumB = (parseInt(weekB) - 1) * scheduleLength + (dayOrder[dayB] ?? 99);
            return dayNumA - dayNumB;
        });
        return { weeks: loggedWeeks, workouts: loggedWorkouts };
    }, [historicalLogs, hasLogs]);


    const handleStartNewMeso = () => {
        exportData(allLogs, `mesocycle_data_${new Date().toISOString().split('T')[0]}.csv`);
        openModal(
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Confirm New Mesocycle</h2>
                <p className="text-gray-600 dark:text-gray-400">Your data has been downloaded. Are you sure you want to archive all logs and start a new mesocycle? This action cannot be undone.</p>
                <div className="flex justify-end gap-2 mt-6">
                    <button onClick={closeModal} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg">Cancel</button>
                    <button onClick={() => { onResetMeso(); closeModal(); }} className="px-4 py-2 bg-red-600 text-white rounded-lg">Confirm & Reset</button>
                </div>
            </div>
        );
    };

    const handleDeleteUserDataClick = () => {
        openModal(
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Delete All User Data</h2>
                <p className="text-gray-600 dark:text-gray-400">Are you absolute sure you want to delete all your data? This will remove everything from the cloud (Firebase) and cannot be undone.</p>
                <div className="flex justify-end gap-2 mt-6">
                    <button onClick={closeModal} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg">Cancel</button>
                    <button onClick={() => { onDeleteUserData(); closeModal(); }} className="px-4 py-2 bg-red-600 text-white rounded-lg">Permanently Delete Data</button>
                </div>
            </div>
        );
    };

    const handleSettingsChange = (field, value) => {
        const newSettings = {
            ...programData.settings,
            [field]: value,
        };
        onProgramDataChange({ ...programData, settings: newSettings });
    };

    const handleTimerSettingsChange = (field, value) => {
        const newSettings = {
            ...programData.settings,
            restTimer: {
                ...programData.settings.restTimer,
                [field]: value
            }
        };
        onProgramDataChange({ ...programData, settings: newSettings });
    };

    const handleDurationChange = (part, value) => {
        const currentDuration = programData.settings.restTimer.duration;
        const minutes = Math.floor(currentDuration / 60);
        const seconds = currentDuration % 60;
        let newDuration;
        if (part === 'minutes') {
            newDuration = (parseInt(value, 10) || 0) * 60 + seconds;
        } else {
            newDuration = minutes * 60 + (parseInt(value, 10) || 0);
        }
        handleTimerSettingsChange('duration', newDuration);
    };

    const timerMinutes = Math.floor(programData.settings.restTimer.duration / 60);
    const timerSeconds = programData.settings.restTimer.duration % 60;

    return (
        <div className="p-4 md:p-6 pb-24">
            <div className="flex justify-center items-center mb-6 text-center">
                 <div className="flex flex-col items-center">
                    <Settings className="text-blue-500 dark:text-blue-400 mb-2" size={32} />
                    <h1 className="text-3xl font-bold dark:text-white">App Settings</h1>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md space-y-6">
                
                {/* Sync & Data */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Sync & Data</h3>
                    <div className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg space-y-3">
                        <div>
                            <label htmlFor="customIdInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Personal Sync ID</label>
                            <div className="flex gap-2">
                                <input id="customIdInput" type="text" value={tempId} onChange={e => setTempId(e.target.value)} placeholder="Enter a memorable ID" className="w-full p-2 bg-white dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600 shadow-sm" />
                                <button onClick={() => handleSetCustomId(tempId)} className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors">Set</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700"></div>

                {/* Display & Units */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Display & Program</h3>
                    <div className="space-y-4">
                         <div className="flex justify-between items-center">
                            <span className="font-semibold dark:text-gray-200">Dark Mode</span>
                            <button onClick={toggleTheme} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200'}`}><span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} /></button>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-semibold dark:text-gray-200">Weight Unit</span>
                            <div className="flex items-center gap-2 rounded-lg p-1 bg-gray-100 dark:bg-gray-700">
                                <button onClick={() => onWeightUnitChange('lbs')} className={`px-3 py-1 text-sm rounded-md ${weightUnit === 'lbs' ? 'bg-white dark:bg-gray-900 shadow' : ''}`}>lbs</button>
                                <button onClick={() => onWeightUnitChange('kg')} className={`px-3 py-1 text-sm rounded-md ${weightUnit === 'kg' ? 'bg-white dark:bg-gray-900 shadow' : ''}`}>kg</button>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <label htmlFor="bodyWeight" className="font-semibold dark:text-gray-200">Body Weight ({weightUnit})</label>
                            <div className="flex items-center gap-2">
                                <input id="bodyWeight" type="number" value={localBodyWeight} onChange={(e) => setLocalBodyWeight(e.target.value)} className="w-24 p-2 bg-white dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600 shadow-sm" />
                                <button onClick={() => onBodyWeightChange(localBodyWeight, true)} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Log</button>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                             <div className="flex items-center gap-2">
                                <span className="font-semibold dark:text-gray-200">Use Weekly Schedule</span>
                                <InfoTooltip content="ON: Workouts follow Mon-Sun. OFF: Workouts are sequential (A, B, C...)." />
                            </div>
                            <button onClick={() => handleSettingsChange('useWeeklySchedule', !programData.settings.useWeeklySchedule)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${programData.settings.useWeeklySchedule ? 'bg-blue-600' : 'bg-gray-200'}`}><span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${programData.settings.useWeeklySchedule ? 'translate-x-6' : 'translate-x-1'}`} /></button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700"></div>

                {/* Rest Timer Settings */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Rest Timer</h3>
                    <div className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold dark:text-gray-200">Auto-start Timer After Set</span>
                            <button onClick={() => handleTimerSettingsChange('enabled', !programData.settings.restTimer.enabled)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${programData.settings.restTimer.enabled ? 'bg-blue-600' : 'bg-gray-200'}`}><span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${programData.settings.restTimer.enabled ? 'translate-x-6' : 'translate-x-1'}`} /></button>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-semibold dark:text-gray-200">Timer Duration</span>
                            <div className="flex items-center gap-2">
                                <input type="number" value={timerMinutes} onChange={(e) => handleDurationChange('minutes', e.target.value)} className="w-16 p-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" />
                                <span className="text-gray-500 dark:text-gray-400">min</span>
                                <input type="number" value={timerSeconds} onChange={(e) => handleDurationChange('seconds', e.target.value)} className="w-16 p-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" />
                                <span className="text-gray-500 dark:text-gray-400">sec</span>
                            </div>
                        </div>
                    </div>
                </div>

                 <div className="border-t border-gray-200 dark:border-gray-700"></div>

                {/* Data Management */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Data Management</h3>
                    <div className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg space-y-3">
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            <select value={exportSelection} onChange={(e) => setExportSelection(e.target.value)} className="w-full sm:w-auto flex-grow p-2 bg-white dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600 shadow-sm" disabled={!hasLogs}>
                                <option value="all">All Data</option>
                                {exportOptions.weeks?.length > 0 && (
                                    <optgroup label="By Week">
                                        {exportOptions.weeks.map(w => <option key={`week-${w}`} value={`week:${w}`}>Week {w}</option>)}
                                    </optgroup>
                                )}
                                {exportOptions.workouts?.length > 0 && (
                                    <optgroup label="By Single Workout">
                                        {exportOptions.workouts.map(w_key => { 
                                            const [, week, day] = w_key.split(/-|:/); 
                                            return (<option key={w_key} value={`workout:${week}-${day}`}>Week {week} - {day}</option>);
                                        })}
                                    </optgroup>
                                )}
                            </select>
                            <button onClick={handleExport} disabled={!hasLogs} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                                <Download size={16} /> Export CSV
                            </button>
                        </div>
                         <div className="border-t border-gray-200 dark:border-gray-700"></div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Import a program (JSON) or workout history (CSV) from a file.</p>
                            <button onClick={handleFileImportClick} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors">
                                <Upload size={16} /> Import from File
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".json,.csv" style={{ display: 'none' }} />
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700"></div>

                {/* Program Reset */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Program Reset</h3>
                     <div className="bg-red-100 dark:bg-red-900/50 p-4 rounded-lg space-y-3">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="text-red-500 flex-shrink-0 mt-1" />
                            <div>
                                <h4 className="font-bold text-red-800 dark:text-red-200">Start New Mesocycle</h4>
                                <p className="text-sm text-red-700 dark:text-red-300">This will download all your current logs as a CSV, then archive them and clear your progress to start fresh.</p>
                            </div>
                        </div>
                        <button onClick={handleStartNewMeso} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-colors">
                            <Repeat size={16} /> Start New Mesocycle
                        </button>
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700"></div>

                {/* Danger Zone */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Danger Zone</h3>
                    <div className="bg-red-100 dark:bg-red-900/50 p-4 rounded-lg space-y-3 border border-red-500">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="text-red-500 flex-shrink-0 mt-1" />
                            <div>
                                <h4 className="font-bold text-red-800 dark:text-red-200">Delete User Data</h4>
                                <p className="text-sm text-red-700 dark:text-red-300">Permanently delete all your workout logs and settings from Firebase. This action cannot be undone.</p>
                            </div>
                        </div>
                        <button onClick={handleDeleteUserDataClick} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-colors mt-4">
                            <AlertTriangle size={16} /> Delete All User Data
                        </button>
                    </div>
                </div>

                {/* Help Section */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Help</h3>
                    <div className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg space-y-3">
                        <p className="text-sm text-gray-600 dark:text-gray-300">Need a refresher on how the app works?</p>
                        <button onClick={onShowTutorial} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition-colors">
                            <HelpCircle size={16} /> Show Tutorial
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};