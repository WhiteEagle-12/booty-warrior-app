import React, { useState, useEffect, useMemo, useContext, useRef } from 'react';
import { BookOpen, PlusCircle, Download, Upload, Edit, X, Dumbbell, Search, Eye, Save, AlertTriangle, CheckCircle, CalendarDays, Zap, XCircle } from 'lucide-react';
import { AppStateContext } from '../contexts/AppStateContext';
import { generateUUID } from '../utils/helpers';
import { migrateProgramData } from '../utils/migration';
import { presets } from '../data/presets';
import { getWorkoutNameForDay } from '../utils/workout';

export const SharedProgramPreview = ({ program, onBack, onSelect, backButtonText = "Back", selectButtonText = "Select Program" }) => {
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{program.name}</h2>
            <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <span><CalendarDays size={14} className="inline-block mr-1"/>{program.info.weeks} Weeks</span>
                <span><Zap size={14} className="inline-block mr-1"/>{program.info.split}</span>
            </div>
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                {(program.workoutOrder || []).map(workoutName => {
                    const workoutDetails = program.programStructure[workoutName];
                    if (!workoutDetails) return null;
                    return (
                        <div key={workoutName} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{workoutName}</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                {(workoutDetails.exercises || []).map((ex, idx) => {
                                    const exName = typeof ex === 'string' ? ex : ex.name;
                                    const k = typeof ex === 'string' ? idx : ex.id;
                                    return <li key={k} className="text-gray-700 dark:text-gray-300">{exName}</li>;
                                })}
                            </ul>
                        </div>
                    );
                })}
            </div>
            <div className="flex justify-between items-center mt-6">
                <button onClick={onBack} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg">{backButtonText}</button>
                <button onClick={onSelect} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2">
                    <Download size={16}/> {selectButtonText}
                </button>
            </div>
        </div>
    );
};

export const ProgramPreviewModal = ({ program, onClose, onLoad }) => {
    return (
        <SharedProgramPreview
            program={program}
            onBack={onClose}
            onSelect={() => { onLoad(); onClose(); }}
            backButtonText="Cancel"
            selectButtonText="Load Program"
        />
    );
};

export const RestoreProgramModal = ({ csvData, onRestore, onClose }) => {
    const [error, setError] = useState('');

    const handleRestore = () => {
        try {
            const lines = csvData.split('\n').filter(line => line.trim() !== '');
            if (lines.length < 2) throw new Error("CSV file must have a header and at least one data row.");

            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            const requiredHeaders = ['Workout Day', 'Day of Week', 'Exercise', 'Sets', 'Reps', 'RIR', 'Rest', 'Equipment', 'Last Set Technique', 'Muscles Primary', 'Muscles Secondary', 'Muscles Tertiary', 'Primary Contribution', 'Secondary Contribution', 'Tertiary Contribution'];
            for (const header of requiredHeaders) {
                if (!headers.includes(header)) throw new Error(`Missing required CSV header: ${header}`);
            }

            const programName = "Restored Program";
            const masterExerciseList = {};
            const programStructure = {};
            const weeklySchedule = [
                { day: 'Mon', workout: 'Rest Day' }, { day: 'Tue', workout: 'Rest Day' },
                { day: 'Wed', workout: 'Rest Day' }, { day: 'Thu', workout: 'Rest Day' },
                { day: 'Fri', workout: 'Rest Day' }, { day: 'Sat', workout: 'Rest Day' },
                { day: 'Sun', workout: 'Rest Day' },
            ];
            const workoutDays = new Set();

            lines.slice(1).forEach(line => {
                const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
                const exerciseData = headers.reduce((obj, header, index) => {
                    obj[header] = values[index] || '';
                    return obj;
                }, {});

                const exName = exerciseData['Exercise'];
                if (!masterExerciseList[exName]) {
                    masterExerciseList[exName] = {
                        sets: parseInt(exerciseData['Sets'], 10),
                        reps: exerciseData['Reps'],
                        rir: exerciseData['RIR'].split(';'),
                        rest: exerciseData['Rest'],
                        equipment: exerciseData['Equipment'],
                        lastSetTechnique: exerciseData['Last Set Technique'],
                        muscles: {
                            primary: exerciseData['Muscles Primary'],
                            secondary: exerciseData['Muscles Secondary'],
                            tertiary: exerciseData['Muscles Tertiary'],
                            primaryContribution: parseFloat(exerciseData['Primary Contribution']),
                            secondaryContribution: parseFloat(exerciseData['Secondary Contribution']),
                            tertiaryContribution: parseFloat(exerciseData['Tertiary Contribution']),
                        }
                    };
                }

                const workoutDay = exerciseData['Workout Day'];
                if (workoutDay) {
                    workoutDays.add(workoutDay);
                    if (!programStructure[workoutDay]) {
                        programStructure[workoutDay] = { exercises: [], label: workoutDay.charAt(0).toUpperCase() + workoutDay.slice(1, 3) };
                    }
                    if (!programStructure[workoutDay].exercises.some(ex => ex.name === exName)) {
                         programStructure[workoutDay].exercises.push({ id: generateUUID(), name: exName });
                    }

                    const dayOfWeek = exerciseData['Day of Week'];
                    const scheduleEntry = weeklySchedule.find(d => d.day === dayOfWeek);
                    if (scheduleEntry) {
                        scheduleEntry.workout = workoutDay;
                    }
                }
            });

            programStructure['Rest Day'] = { exercises: [], label: 'Rest', isRest: true };
            workoutDays.add('Rest Day');

            const restoredProgram = {
                name: programName,
                info: { name: programName, weeks: 8, split: "Custom" },
                masterExerciseList,
                programStructure,
                weeklySchedule,
                workoutOrder: Array.from(workoutDays),
                settings: presets['optimal-ppl-ul'].settings,
                weeklyOverrides: {},
            };

            onRestore(restoredProgram);
            onClose();

        } catch (err) {
            setError(`Error parsing CSV: ${err.message}`);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Restore Program</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
                You've uploaded a CSV file. Review the detected data and click "Restore" to import it as a new program.
            </p>
            {error && <p className="text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-md">{error}</p>}
            <div className="flex justify-end gap-2 mt-6">
                <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg">Cancel</button>
                <button onClick={handleRestore} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Restore</button>
            </div>
        </div>
    );
};

export const ProgramManagerView = ({ onProgramUpdate, activeProgram, programInstances, onInstanceSwitch, onBack, onDeleteProgram }) => {
    const { openModal, closeModal, addToast } = useContext(AppStateContext);
    const fileInputRef = useRef(null);

    const handleDeleteProgram = (instanceId) => {
        const programToDelete = programInstances.find(p => p.id === instanceId);
        if (!programToDelete) return;

        openModal(
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Confirm Deletion</h2>
                <p className="text-gray-600 dark:text-gray-400">Are you sure you want to delete the program "{programToDelete.program.name}"? This action cannot be undone.</p>
                <div className="flex justify-end gap-2 mt-6">
                    <button onClick={closeModal} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg">Cancel</button>
                    <button onClick={() => {
                        onDeleteProgram(instanceId);
                        closeModal();
                    }} className="px-4 py-2 bg-red-600 text-white rounded-lg">Delete</button>
                </div>
            </div>
        );
    };

    const handleFileImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                if (file.name.endsWith('.csv')) {
                    openModal(<RestoreProgramModal csvData={e.target.result} onRestore={onProgramUpdate} onClose={closeModal} />);
                } else {
                    const importedProgram = JSON.parse(e.target.result);
                    if (
                        importedProgram.name && typeof importedProgram.name === 'string' &&
                        importedProgram.info && typeof importedProgram.info === 'object' &&
                        importedProgram.masterExerciseList && typeof importedProgram.masterExerciseList === 'object' &&
                        importedProgram.programStructure && typeof importedProgram.programStructure === 'object' &&
                        importedProgram.weeklySchedule && Array.isArray(importedProgram.weeklySchedule) &&
                        importedProgram.workoutOrder && Array.isArray(importedProgram.workoutOrder)
                    ) {
                        onProgramUpdate(importedProgram);
                        addToast(`Program "${importedProgram.name}" imported successfully!`, 'success');
                    } else {
                        throw new Error("Invalid or incomplete program file structure.");
                    }
                }
            } catch (error) {
                console.error("Failed to import program:", error);
                addToast(`Failed to import: ${error.message}`, 'error');
            }
        };
        reader.readAsText(file);
        event.target.value = null;
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleExportProgramToCSV = () => {
        const { name, masterExerciseList, programStructure, weeklySchedule } = activeProgram;
        const headers = ['Workout Day', 'Day of Week', 'Exercise', 'Sets', 'Reps', 'RIR', 'Rest', 'Equipment', 'Last Set Technique', 'Muscles Primary', 'Muscles Secondary', 'Muscles Tertiary', 'Primary Contribution', 'Secondary Contribution', 'Tertiary Contribution'];
        const rows = [];

        weeklySchedule.forEach(({ day }) => {
            const workoutName = getWorkoutNameForDay(activeProgram, 1, day); // Using week 1 for template
            if (programStructure[workoutName] && !programStructure[workoutName].isRest) {
                const workoutDetails = programStructure[workoutName];
                if (workoutDetails) {
                    workoutDetails.exercises.forEach(ex => {
                        const exDetails = masterExerciseList[ex.name];
                        if (exDetails) {
                            rows.push([
                                `"${workoutName}"`,
                                `"${day}"`,
                                `"${ex.name}"`,
                                exDetails.sets,
                                `"${exDetails.reps}"`,
                                `"${Array.isArray(exDetails.rir) ? exDetails.rir.join(';') : exDetails.rir}"`,
                                `"${exDetails.rest}"`,
                                `"${exDetails.equipment || ''}"`,
                                `"${exDetails.lastSetTechnique || ''}"`,
                                `"${exDetails.muscles?.primary || ''}"`,
                                `"${exDetails.muscles?.secondary || ''}"`,
                                `"${exDetails.muscles?.tertiary || ''}"`,
                                exDetails.muscles?.primaryContribution ?? 1,
                                exDetails.muscles?.secondaryContribution ?? 0.5,
                                exDetails.muscles?.tertiaryContribution ?? 0.25
                            ].join(','));
                        }
                    });
                }
            }
        });

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        const fileName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.download = `${fileName}_program_structure.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePreview = (programData) => {
        openModal(
            <ProgramPreviewModal 
                program={programData} 
                onClose={closeModal} 
                onLoad={() => onProgramUpdate(programData)} 
            />,
            'lg'
        );
    };

    return (
        <div className="p-4 md:p-6 pb-24">
            <div className="flex justify-center items-center mb-6 text-center">
                 <div className="flex flex-col items-center">
                    <BookOpen className="text-blue-500 dark:text-blue-400 mb-2" size={32} />
                    <h1 className="text-3xl font-bold dark:text-white">Program Hub</h1>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md mb-6">
                 <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Manage Your Program</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <button onClick={handleExportProgramToCSV} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 text-white rounded-lg shadow-md hover:bg-teal-700 transition-colors">
                        <Download size={16}/> Export Program (CSV)
                    </button>
                    <button onClick={handleImportClick} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors">
                        <Upload size={16}/> Import from File
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".json,.csv" style={{ display: 'none' }} />
                 </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center col-span-1 sm:col-span-2">
                    Export your current program to share or back it up. Import a JSON or CSV file to load a new program structure.
                </p>
            </div>

            {/* Custom/Archived Programs */}
            {programInstances.length > 1 && (
                 <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md mb-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Your Saved Programs</h3>
                    <div className="space-y-3">
                        {programInstances.map((instance) => (
                            <div key={instance.id} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg flex justify-between items-center gap-3">
                                <div>
                                    <h4 className="font-semibold text-lg">{instance.program.name}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Last used: {new Date(instance.lastModified).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => onInstanceSwitch(instance.id)} disabled={instance.id === activeProgram.id} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 disabled:bg-gray-400">
                                        {instance.id === activeProgram.id ? 'Active' : 'Switch To'}
                                    </button>
                                    <button onClick={() => handleDeleteProgram(instance.id)} disabled={instance.id === activeProgram.id} className="p-2 text-sm bg-red-600 text-white rounded-lg shadow hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">
                                        <XCircle size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Load a Preset Program</h3>
                <div className="space-y-3">
                    {Object.entries(presets).map(([key, preset]) => (
                        <div key={key} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-3">
                            <div>
                                <h4 className="font-semibold text-lg">{preset.name}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{preset.info.weeks} Weeks | {preset.info.split}</p>
                            </div>
                             <div className="flex items-center gap-2 flex-shrink-0">
                                <button onClick={() => handlePreview(preset)} className="flex items-center gap-1 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"><Eye size={20}/> Preview</button>
                                <button onClick={() => onProgramUpdate(preset)} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700">Load</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};