import React, { useState, useEffect, useMemo, useContext, useRef } from 'react';
import { Settings, Download, Upload, Repeat, AlertTriangle, HelpCircle, CloudUpload, Sun, Timer, Gauge, Database, ShieldAlert } from 'lucide-react';
import { ThemeContext } from '../contexts/ThemeContext';
import { FirebaseContext } from '../contexts/FirebaseContext';
import { AppStateContext } from '../contexts/AppStateContext';
import { calculateE1RM } from '../utils/helpers';
import { InfoTooltip } from '../components/common/InfoTooltip';
import { ViewHeader } from '../components/common/ViewHeader';

const SettingsSection = ({ icon: Icon, eyebrow, title, children, tone = 'default' }) => (
    <section className={`ee-panel p-5 sm:p-6 ${tone === 'danger' ? 'border-coral/30' : ''}`}>
        <p className={`ee-eyebrow ${tone === 'danger' ? 'text-coral' : 'text-amber'}`}>
            <Icon size={12} /> {eyebrow}
        </p>
        <h2 className="mb-5 mt-2 font-display text-lg font-bold text-bone">{title}</h2>
        {children}
    </section>
);

const SettingsRow = ({ label, hint, children }) => (
    <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
        <div className="min-w-0">
            <p className="text-sm font-bold text-bone">{label}</p>
            {hint && <p className="mt-0.5 text-xs leading-5 text-mute">{hint}</p>}
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">{children}</div>
    </div>
);

const Switch = ({ on, onToggle, label }) => (
    <button onClick={onToggle} className="ee-switch" data-on={on ? 'true' : 'false'} role="switch" aria-checked={on} aria-label={label}>
        <span />
    </button>
);

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
                <div className="text-center">
                    <Download size={32} className="mx-auto text-line" />
                    <h2 className="mt-4 font-display text-xl font-bold text-bone">No data to export</h2>
                    <p className="mt-2 text-sm text-mute">There is no logged data for the selected option.</p>
                    <div className="mt-6 flex justify-center">
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
    }, [historicalLogs, hasLogs, programData]);

    const handleStartNewMeso = () => {
        exportData(allLogs, `mesocycle_data_${new Date().toISOString().split('T')[0]}.csv`);
        openModal(
            <div>
                <p className="ee-eyebrow text-coral"><Repeat size={12} /> New block</p>
                <h2 className="mt-2 font-display text-xl font-bold text-bone">Start new mesocycle</h2>
                <p className="mt-3 text-sm leading-6 text-mute">Your data has been downloaded. Are you sure you want to archive all logs and start a new mesocycle? This action cannot be undone.</p>
                <div className="mt-6 flex justify-end gap-2">
                    <button onClick={closeModal} className="ee-secondary">Cancel</button>
                    <button onClick={() => { onResetMeso(); closeModal(); }} className="ee-danger">Confirm &amp; reset</button>
                </div>
            </div>
        );
    };

    const handleDeleteUserDataClick = () => {
        openModal(
            <div>
                <p className="ee-eyebrow text-coral"><ShieldAlert size={12} /> Permanent</p>
                <h2 className="mt-2 font-display text-xl font-bold text-bone">Delete all user data</h2>
                <p className="mt-3 text-sm leading-6 text-mute">Are you absolutely sure? This removes everything from the cloud and cannot be undone.</p>
                <div className="mt-6 flex justify-end gap-2">
                    <button onClick={closeModal} className="ee-secondary">Cancel</button>
                    <button onClick={() => { onDeleteUserData(); closeModal(); }} className="ee-danger">Permanently delete</button>
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
        <div className="py-6 md:py-9">
            <ViewHeader
                icon={Settings}
                eyebrow="Your account"
                title="You"
                description="How the app feels, how it saves, and the data that belongs to you."
            />

            <div className="grid gap-5 lg:grid-cols-2">
                <div className="space-y-5">
                    <SettingsSection icon={CloudUpload} eyebrow="Cloud" title="Your athlete ID">
                        <label htmlFor="customIdInput" className="ee-label">Athlete ID</label>
                        <div className="flex gap-2">
                            <input id="customIdInput" type="text" value={tempId} onChange={e => setTempId(e.target.value)} placeholder="Something you'll remember" className="ee-input" />
                            <button onClick={() => handleSetCustomId(tempId)} className="ee-primary flex-shrink-0">Save</button>
                        </div>
                        <p className="mt-3 text-xs leading-5 text-mute">Same ID on another device, same journal. Keep it private — it is the key to your training history.</p>
                    </SettingsSection>

                    <SettingsSection icon={Sun} eyebrow="Display" title="Preferences">
                        <div className="divide-y divide-line/50">
                            <SettingsRow label="Dark mode" hint="Easy on the eyes under gym lighting.">
                                <Switch on={theme === 'dark'} onToggle={toggleTheme} label="Toggle dark mode" />
                            </SettingsRow>
                            <SettingsRow label="Weight unit">
                                <div className="flex items-center gap-1 rounded-xl border border-line bg-well p-1">
                                    {['lbs', 'kg'].map(unit => (
                                        <button
                                            key={unit}
                                            onClick={() => onWeightUnitChange(unit)}
                                            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${weightUnit === unit ? 'bg-amber text-base' : 'text-mute hover:text-bone'}`}
                                        >
                                            {unit}
                                        </button>
                                    ))}
                                </div>
                            </SettingsRow>
                            <SettingsRow label={`Body weight (${weightUnit})`} hint="Feeds bodyweight-ratio achievements.">
                                <input id="bodyWeight" type="number" value={localBodyWeight} onChange={(e) => setLocalBodyWeight(e.target.value)} className="ee-input w-24 text-center font-mono tabular-nums" aria-label={`Body weight in ${weightUnit}`} />
                                <button onClick={() => onBodyWeightChange(localBodyWeight, true)} className="ee-primary px-3.5">Log</button>
                            </SettingsRow>
                            <SettingsRow
                                label={<span className="inline-flex items-center gap-1.5">Weekly schedule <InfoTooltip content="ON: workouts follow Mon–Sun. OFF: workouts run sequentially (A, B, C...)." /></span>}
                            >
                                <Switch on={programData.settings.useWeeklySchedule} onToggle={() => handleSettingsChange('useWeeklySchedule', !programData.settings.useWeeklySchedule)} label="Toggle weekly schedule" />
                            </SettingsRow>
                        </div>
                    </SettingsSection>

                    <SettingsSection icon={Timer} eyebrow="Rest timer" title="Between sets">
                        <div className="divide-y divide-line/50">
                            <SettingsRow label="Auto-start after each set" hint="The timer launches when a set is fully logged.">
                                <Switch on={programData.settings.restTimer.enabled} onToggle={() => handleTimerSettingsChange('enabled', !programData.settings.restTimer.enabled)} label="Toggle auto-start rest timer" />
                            </SettingsRow>
                            <SettingsRow label="Timer duration">
                                <input type="number" value={timerMinutes} onChange={(e) => handleDurationChange('minutes', e.target.value)} className="ee-input w-16 text-center font-mono tabular-nums" aria-label="Timer minutes" />
                                <span className="text-xs font-bold text-mute">min</span>
                                <input type="number" value={timerSeconds} onChange={(e) => handleDurationChange('seconds', e.target.value)} className="ee-input w-16 text-center font-mono tabular-nums" aria-label="Timer seconds" />
                                <span className="text-xs font-bold text-mute">sec</span>
                            </SettingsRow>
                        </div>
                    </SettingsSection>
                </div>

                <div className="space-y-5">
                    <SettingsSection icon={Gauge} eyebrow="Progression" title="Effort guidance">
                        <SettingsRow label="RIR alert threshold" hint="Suggestions warn you when reps in reserve climb above this number.">
                            <input
                                type="number"
                                min="0"
                                max="10"
                                value={programData?.settings?.rirThreshold ?? 3}
                                onChange={(e) => handleSettingsChange('rirThreshold', parseInt(e.target.value, 10) || 3)}
                                className="ee-input w-16 text-center font-mono tabular-nums"
                                aria-label="RIR alert threshold"
                            />
                        </SettingsRow>
                    </SettingsSection>

                    <SettingsSection icon={Database} eyebrow="Data management" title="Export & import">
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <select value={exportSelection} onChange={(e) => setExportSelection(e.target.value)} className="ee-input flex-grow" disabled={!hasLogs} aria-label="Export scope">
                                <option value="all">All data</option>
                                {exportOptions.weeks?.length > 0 && (
                                    <optgroup label="By week">
                                        {exportOptions.weeks.map(w => <option key={`week-${w}`} value={`week:${w}`}>Week {w}</option>)}
                                    </optgroup>
                                )}
                                {exportOptions.workouts?.length > 0 && (
                                    <optgroup label="By single workout">
                                        {exportOptions.workouts.map(w_key => {
                                            const [, week, day] = w_key.split(/-|:/);
                                            return (<option key={w_key} value={`workout:${week}-${day}`}>Week {week} · {day}</option>);
                                        })}
                                    </optgroup>
                                )}
                            </select>
                            <button onClick={handleExport} disabled={!hasLogs} className="ee-primary flex-shrink-0">
                                <Download size={15} /> Export CSV
                            </button>
                        </div>
                        <div className="ee-divider my-4" />
                        <p className="mb-2 text-xs leading-5 text-mute">Import a program (JSON) or workout history (CSV) from a file.</p>
                        <button onClick={handleFileImportClick} className="ee-secondary w-full">
                            <Upload size={15} /> Import from file
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".json,.csv" className="hidden" />
                    </SettingsSection>

                    <SettingsSection icon={Repeat} eyebrow="Fresh start" title="Program reset" tone="danger">
                        <div className="rounded-xl border border-coral/25 bg-coral/[0.06] p-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="mt-0.5 flex-shrink-0 text-coral" size={17} />
                                <p className="text-xs leading-5 text-mute">Downloads all current logs as a CSV, then archives them and clears your progress for a new mesocycle.</p>
                            </div>
                            <button onClick={handleStartNewMeso} className="ee-danger mt-4 w-full">
                                <Repeat size={15} /> Start new mesocycle
                            </button>
                        </div>
                    </SettingsSection>

                    <SettingsSection icon={ShieldAlert} eyebrow="Irreversible" title="Danger zone" tone="danger">
                        <div className="rounded-xl border border-coral/30 bg-coral/[0.08] p-4">
                            <div className="flex items-start gap-3">
                                <ShieldAlert className="mt-0.5 flex-shrink-0 text-coral" size={17} />
                                <p className="text-xs leading-5 text-mute">Permanently delete all workout logs and settings from the cloud. There is no recovery.</p>
                            </div>
                            <button onClick={handleDeleteUserDataClick} className="ee-danger mt-4 w-full">
                                <AlertTriangle size={15} /> Delete all user data
                            </button>
                        </div>
                    </SettingsSection>

                    <SettingsSection icon={HelpCircle} eyebrow="Help" title="A quick tour">
                        <p className="mb-3 text-xs leading-5 text-mute">Need a refresher on Today, logging, and your program?</p>
                        <button onClick={onShowTutorial} className="ee-secondary w-full">
                            <HelpCircle size={15} /> Show the tour
                        </button>
                    </SettingsSection>
                </div>
            </div>
        </div>
    );
};
