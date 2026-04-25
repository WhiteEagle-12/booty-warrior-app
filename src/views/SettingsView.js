import React, { useState, useEffect, useMemo, useContext, useRef } from 'react';
import { Settings, Download, Upload, Repeat, AlertTriangle, HelpCircle, Crosshair } from 'lucide-react';
import { ThemeContext } from '../contexts/ThemeContext';
import { FirebaseContext } from '../contexts/FirebaseContext';
import { AppStateContext } from '../contexts/AppStateContext';
import { calculateE1RM } from '../utils/helpers';
import { InfoTooltip } from '../components/common/InfoTooltip';

export const SettingsView = ({ allLogs, historicalLogs, weightUnit, onWeightUnitChange, onResetMeso, programData, onProgramDataChange, onShowTutorial, bodyWeight, onBodyWeightChange, onFileImport, onDeleteUserData }) => {
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
                    <h2 className="text-xl font-black text-[#efe7d5] mb-4">No Data to Export</h2>
                    <p className="text-[#9ca89d]">There is no logged data for the selected option.</p>
                    <div className="flex justify-end gap-2 mt-6">
                        <button onClick={closeModal} className="ee-primary">OK</button>
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
        if (exportSelection === 'all') { exportData(historicalLogs, 'eagle_eye_training_all_data.csv'); return; }
        const [type, value] = exportSelection.split(':');
        let logsToExport = {};
        if (type === 'week') {
            logsToExport = Object.fromEntries(Object.entries(historicalLogs).filter(([, log]) => log.week?.toString() === value));
        } else if (type === 'workout') {
            const [week, dayKey] = value.split('-');
            logsToExport = Object.fromEntries(Object.entries(historicalLogs).filter(([, log]) => log.week?.toString() === week && log.dayKey === dayKey));
        }
        exportData(logsToExport, `eagle_eye_training_${type}_${value.replace('-', '_')}_data.csv`);
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
                <h2 className="text-xl font-black text-[#efe7d5] mb-4">Confirm New Mesocycle</h2>
                <p className="text-[#9ca89d]">Your data has been downloaded. Are you sure you want to archive all logs and start a new mesocycle? This action cannot be undone.</p>
                <div className="flex justify-end gap-2 mt-6">
                    <button onClick={closeModal} className="ee-secondary">Cancel</button>
                    <button onClick={() => { onResetMeso(); closeModal(); }} className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-bold text-white bg-[#f36f52] hover:brightness-110">Confirm & Reset</button>
                </div>
            </div>
        );
    };

    const handleDeleteUserDataClick = () => {
        openModal(
            <div>
                <h2 className="text-xl font-black text-[#efe7d5] mb-4">Delete All User Data</h2>
                <p className="text-[#9ca89d]">Are you absolute sure you want to delete all your data? This will remove everything from the cloud (Firebase) and cannot be undone.</p>
                <div className="flex justify-end gap-2 mt-6">
                    <button onClick={closeModal} className="ee-secondary">Cancel</button>
                    <button onClick={() => { onDeleteUserData(); closeModal(); }} className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-bold text-white bg-[#f36f52] hover:brightness-110">Permanently Delete Data</button>
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
        <div className="py-5 md:py-8 pb-24">
            <div className="ee-panel mb-6 rounded-2xl p-5 md:p-6">
                 <div className="flex items-center gap-3">
                    <Settings className="text-[#f3b548]" size={32} />
                    <div>
                        <p className="text-xs font-bold uppercase text-[#f3b548]">Control room</p>
                        <h1 className="text-3xl font-black text-[#efe7d5]">App Settings</h1>
                    </div>
                </div>
                <div className="mt-5 rounded-xl border border-[#f3b548]/20 bg-[#f3b548]/10 p-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#f3b548]">
                        <Crosshair size={14} />
                        Mission Focus
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#efe7d5]">Log with precision. Progress with intent. Keep setup, sync, timers, and exports here so the training screens stay clean.</p>
                </div>
            </div>
            <div className="ee-panel rounded-2xl p-6 space-y-6">
                
                {/* Sync & Data */}
                <div>
                    <h3 className="text-lg font-black text-[#efe7d5] mb-3">Sync & Data</h3>
                    <div className="ee-panel-soft p-4 rounded-xl space-y-3">
                        <div>
                            <label htmlFor="customIdInput" className="block text-sm font-medium text-[#9ca89d] mb-1">Personal Sync ID</label>
                            <div className="flex gap-2">
                                <input id="customIdInput" type="text" value={tempId} onChange={e => setTempId(e.target.value)} placeholder="Enter a memorable ID" className="ee-input" />
                                <button onClick={() => handleSetCustomId(tempId)} className="ee-primary">Set</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10"></div>

                {/* Display & Units */}
                <div>
                    <h3 className="text-lg font-black text-[#efe7d5] mb-3">Display & Program</h3>
                    <div className="space-y-4">
                         <div className="flex justify-between items-center">
                            <span className="font-semibold text-[#efe7d5]">Dark Mode</span>
                            <button onClick={toggleTheme} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${theme === 'dark' ? 'bg-[#4dd6c6]' : 'bg-white/20'}`}><span className={`inline-block w-4 h-4 transform bg-[#090d12] rounded-full transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} /></button>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-[#efe7d5]">Weight Unit</span>
                            <div className="flex items-center gap-2 rounded-lg border border-white/10 p-1 bg-white/5">
                                <button onClick={() => onWeightUnitChange('lbs')} className={`px-3 py-1 text-sm rounded-md ${weightUnit === 'lbs' ? 'bg-[#f3b548] text-[#15100a]' : 'text-[#9ca89d]'}`}>lbs</button>
                                <button onClick={() => onWeightUnitChange('kg')} className={`px-3 py-1 text-sm rounded-md ${weightUnit === 'kg' ? 'bg-[#f3b548] text-[#15100a]' : 'text-[#9ca89d]'}`}>kg</button>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <label htmlFor="bodyWeight" className="font-semibold text-[#efe7d5]">Body Weight ({weightUnit})</label>
                            <div className="flex items-center gap-2">
                                <input id="bodyWeight" type="number" value={localBodyWeight} onChange={(e) => setLocalBodyWeight(e.target.value)} className="ee-input w-24" />
                                <button onClick={() => onBodyWeightChange(localBodyWeight, true)} className="ee-primary">Log</button>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                             <div className="flex items-center gap-2">
                                <span className="font-semibold text-[#efe7d5]">Use Weekly Schedule</span>
                                <InfoTooltip content="ON: Workouts follow Mon-Sun. OFF: Workouts are sequential (A, B, C...)." />
                            </div>
                            <button onClick={() => handleSettingsChange('useWeeklySchedule', !programData.settings.useWeeklySchedule)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${programData.settings.useWeeklySchedule ? 'bg-[#4dd6c6]' : 'bg-white/20'}`}><span className={`inline-block w-4 h-4 transform bg-[#090d12] rounded-full transition-transform ${programData.settings.useWeeklySchedule ? 'translate-x-6' : 'translate-x-1'}`} /></button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10"></div>

                {/* Rest Timer Settings */}
                <div>
                    <h3 className="text-lg font-black text-[#efe7d5] mb-3">Rest Timer</h3>
                    <div className="ee-panel-soft p-4 rounded-xl space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-[#efe7d5]">Auto-start Timer After Set</span>
                            <button onClick={() => handleTimerSettingsChange('enabled', !programData.settings.restTimer.enabled)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${programData.settings.restTimer.enabled ? 'bg-[#4dd6c6]' : 'bg-white/20'}`}><span className={`inline-block w-4 h-4 transform bg-[#090d12] rounded-full transition-transform ${programData.settings.restTimer.enabled ? 'translate-x-6' : 'translate-x-1'}`} /></button>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-[#efe7d5]">Timer Duration</span>
                            <div className="flex items-center gap-2">
                                <input type="number" value={timerMinutes} onChange={(e) => handleDurationChange('minutes', e.target.value)} className="ee-input w-16 text-center" />
                                <span className="text-[#9ca89d]">min</span>
                                <input type="number" value={timerSeconds} onChange={(e) => handleDurationChange('seconds', e.target.value)} className="ee-input w-16 text-center" />
                                <span className="text-[#9ca89d]">sec</span>
                            </div>
                        </div>
                    </div>
                </div>

                 <div className="border-t border-white/10"></div>

                {/* AI Progression Settings */}
                <div>
                    <h3 className="text-lg font-black text-[#efe7d5] mb-3">AI / Progression Settings</h3>
                    <div className="ee-panel-soft p-4 rounded-xl space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <span className="font-semibold text-[#efe7d5]">RIR Alert Threshold</span>
                                <span className="text-xs text-[#9ca89d]">Warn if RIR goes above this number (default: 3).</span>
                            </div>
                            <input 
                                type="number" 
                                min="0" 
                                max="10" 
                                value={programData?.settings?.rirThreshold ?? 3} 
                                onChange={(e) => handleSettingsChange('rirThreshold', parseInt(e.target.value, 10) || 3)} 
                                className="ee-input w-16 text-center"
                            />
                        </div>
                    </div>
                </div>

                 <div className="border-t border-white/10"></div>

                {/* Data Management */}
                <div>
                    <h3 className="text-lg font-black text-[#efe7d5] mb-3">Data Management</h3>
                    <div className="ee-panel-soft p-4 rounded-xl space-y-3">
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            <select value={exportSelection} onChange={(e) => setExportSelection(e.target.value)} className="ee-input w-full sm:w-auto flex-grow" disabled={!hasLogs}>
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
                            <button onClick={handleExport} disabled={!hasLogs} className="ee-primary w-full sm:w-auto disabled:opacity-40 disabled:cursor-not-allowed">
                                <Download size={16} /> Export CSV
                            </button>
                        </div>
                         <div className="border-t border-white/10"></div>
                        <div>
                            <p className="text-sm text-[#9ca89d] mb-2">Import a program (JSON) or workout history (CSV) from a file.</p>
                            <button onClick={handleFileImportClick} className="ee-secondary w-full">
                                <Upload size={16} /> Import from File
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".json,.csv" style={{ display: 'none' }} />
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10"></div>

                {/* Program Reset */}
                <div>
                    <h3 className="text-lg font-black text-[#efe7d5] mb-3">Program Reset</h3>
                     <div className="rounded-xl border border-[#f36f52]/30 bg-[#f36f52]/10 p-4 space-y-3">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="text-[#f36f52] flex-shrink-0 mt-1" />
                            <div>
                                <h4 className="font-bold text-[#efe7d5]">Start New Mesocycle</h4>
                                <p className="text-sm text-[#e0a092]">This will download all your current logs as a CSV, then archive them and clear your progress to start fresh.</p>
                            </div>
                        </div>
                        <button onClick={handleStartNewMeso} className="w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white bg-[#f36f52] hover:brightness-110 transition">
                            <Repeat size={16} /> Start New Mesocycle
                        </button>
                    </div>
                </div>

                <div className="border-t border-white/10"></div>

                {/* Danger Zone */}
                <div>
                    <h3 className="text-lg font-black text-[#efe7d5] mb-3">Danger Zone</h3>
                    <div className="rounded-xl border border-[#f36f52]/40 bg-[#f36f52]/10 p-4 space-y-3">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="text-[#f36f52] flex-shrink-0 mt-1" />
                            <div>
                                <h4 className="font-bold text-[#efe7d5]">Delete User Data</h4>
                                <p className="text-sm text-[#e0a092]">Permanently delete all your workout logs and settings from Firebase. This action cannot be undone.</p>
                            </div>
                        </div>
                        <button onClick={handleDeleteUserDataClick} className="w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white bg-[#f36f52] hover:brightness-110 transition mt-4">
                            <AlertTriangle size={16} /> Delete All User Data
                        </button>
                    </div>
                </div>

                {/* Help Section */}
                <div>
                    <h3 className="text-lg font-black text-[#efe7d5] mb-3">Help</h3>
                    <div className="ee-panel-soft p-4 rounded-xl space-y-3">
                        <p className="text-sm text-[#9ca89d]">Need a refresher on how the app works?</p>
                        <button onClick={onShowTutorial} className="ee-secondary w-full">
                            <HelpCircle size={16} /> Show Tutorial
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
