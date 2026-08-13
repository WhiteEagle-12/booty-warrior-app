import React, { useState, useContext, useRef } from 'react';
import { BookOpen, Download, Upload, Eye, CalendarDays, Zap, XCircle, CheckCircle, Layers } from 'lucide-react';
import { AppStateContext } from '../contexts/AppStateContext';
import { generateUUID, getExerciseDetails } from '../utils/helpers';
import { presets } from '../data/presets';
import { getWorkoutNameForDay } from '../utils/workout';
import { ViewHeader } from '../components/common/ViewHeader';

export const SharedProgramPreview = ({ program, onBack, onSelect, backButtonText = "Back", selectButtonText = "Select Program" }) => {
    return (
        <div>
            <p className="ee-eyebrow text-amber"><BookOpen size={12} /> Program preview</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-bone">{program.name}</h2>
            <div className="mt-2 flex flex-wrap gap-4 text-xs font-bold text-mute">
                <span className="inline-flex items-center gap-1.5"><CalendarDays size={13} className="text-teal" /> {program.info.weeks} weeks</span>
                <span className="inline-flex items-center gap-1.5"><Zap size={13} className="text-amber" /> {program.info.split}</span>
            </div>
            <div className="mt-5 max-h-[50vh] space-y-3 overflow-y-auto pr-1">
                {(program.workoutOrder || []).map(workoutName => {
                    const workoutDetails = program.programStructure[workoutName];
                    if (!workoutDetails) return null;
                    return (
                        <div key={workoutName} className="ee-panel-soft p-3.5">
                            <h3 className="mb-2 font-display text-sm font-bold text-bone">{workoutName}</h3>
                            <ul className="space-y-1">
                                {(workoutDetails.exercises || []).map((ex, idx) => {
                                    const exName = typeof ex === 'string' ? ex : ex.name;
                                    const k = typeof ex === 'string' ? idx : ex.id;
                                    return (
                                        <li key={k} className="flex items-center gap-2 text-sm text-mute">
                                            <span className="h-1 w-1 rounded-full bg-teal" />
                                            {exName}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    );
                })}
            </div>
            <div className="mt-6 flex items-center justify-between gap-2">
                <button onClick={onBack} className="ee-secondary">{backButtonText}</button>
                <button onClick={onSelect} className="ee-primary">
                    <Download size={15} /> {selectButtonText}
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
            <p className="ee-eyebrow text-amber"><Upload size={12} /> Import</p>
            <h2 className="mt-2 font-display text-xl font-bold text-bone">Restore program</h2>
            <p className="mt-3 text-sm leading-6 text-mute">
                You've uploaded a CSV file. Review the detected data and click "Restore" to import it as a new program.
            </p>
            {error && <p className="mt-4 rounded-xl border border-coral/30 bg-coral/10 p-3 text-sm font-semibold text-coral">{error}</p>}
            <div className="mt-6 flex justify-end gap-2">
                <button onClick={onClose} className="ee-secondary">Cancel</button>
                <button onClick={handleRestore} className="ee-primary">Restore</button>
            </div>
        </div>
    );
};

export const ProgramManagerView = ({ onProgramUpdate, activeProgram, programInstances, onInstanceSwitch, onDeleteProgram, embedded = false }) => {
    const { openModal, closeModal, addToast } = useContext(AppStateContext);
    const fileInputRef = useRef(null);

    const handleDeleteProgram = (instanceId) => {
        const programToDelete = programInstances.find(p => p.id === instanceId);
        if (!programToDelete) return;

        openModal(
            <div>
                <p className="ee-eyebrow text-coral"><XCircle size={12} /> Danger</p>
                <h2 className="mt-2 font-display text-xl font-bold text-bone">Delete program</h2>
                <p className="mt-3 text-sm leading-6 text-mute">Are you sure you want to delete "{programToDelete.program.name}"? This action cannot be undone.</p>
                <div className="mt-6 flex justify-end gap-2">
                    <button onClick={closeModal} className="ee-secondary">Cancel</button>
                    <button onClick={() => {
                        onDeleteProgram(instanceId);
                        closeModal();
                    }} className="ee-danger">Delete</button>
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
                        const exDetails = getExerciseDetails(ex.name, masterExerciseList);
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
                                exDetails.muscles?.tertiaryContribution ?? 0.5
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

    const libraryActions = (
        <>
            <button onClick={handleExportProgramToCSV} className="ee-secondary">
                <Download size={15} /> Export CSV
            </button>
            <button onClick={handleImportClick} className="ee-primary">
                <Upload size={15} /> Import file
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".json,.csv" className="hidden" />
        </>
    );

    return (
        <div className={embedded ? '' : 'py-6 md:py-9'}>
            {!embedded && (
                <ViewHeader
                    icon={BookOpen}
                    eyebrow="Library"
                    title="Program Hub"
                    description="Import, export, preview, and switch training blocks from one place."
                >
                    {libraryActions}
                </ViewHeader>
            )}
            {embedded && <div className="mb-5 flex flex-wrap gap-2">{libraryActions}</div>}

            {programInstances.length > 0 && (
                <section className="ee-panel mb-5 p-5 sm:p-6">
                    <p className="ee-eyebrow text-teal"><Layers size={12} /> Saved blocks</p>
                    <h2 className="mb-4 mt-2 font-display text-lg font-bold text-bone">Your programs</h2>
                    <div className="space-y-2.5">
                        {programInstances.map((instance) => {
                            const isActive = instance.id === activeProgram.id;
                            return (
                                <div key={instance.id} className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${isActive ? 'border-amber/40 bg-amber/[0.06]' : 'border-line bg-panel2/60'}`}>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="truncate font-display text-base font-bold text-bone">{instance.program.name}</h4>
                                            {isActive && <span className="ee-chip border-amber/40 text-amber"><CheckCircle size={11} /> Active</span>}
                                        </div>
                                        <p className="mt-1 text-xs text-mute">Last used {new Date(instance.lastModified).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex flex-shrink-0 items-center gap-2">
                                        {!isActive && (
                                            <button onClick={() => onInstanceSwitch(instance.id)} className="ee-primary px-3.5 py-2 text-xs">
                                                Switch to
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDeleteProgram(instance.id)}
                                            disabled={isActive}
                                            className="ee-icon-btn text-coral disabled:opacity-40"
                                            title="Delete program"
                                            aria-label={`Delete ${instance.program.name}`}
                                        >
                                            <XCircle size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            <section className="ee-panel p-5 sm:p-6">
                <p className="ee-eyebrow text-amber"><BookOpen size={12} /> Preset library</p>
                <h2 className="mb-4 mt-2 font-display text-lg font-bold text-bone">Load a preset</h2>
                <div className="grid gap-3 lg:grid-cols-2">
                    {Object.entries(presets).map(([key, preset]) => (
                        <div key={key} className="ee-panel-soft flex flex-col justify-between gap-4 p-4 transition-colors hover:bg-line/20 sm:flex-row sm:items-center">
                            <div className="min-w-0">
                                <h4 className="truncate font-display text-base font-bold text-bone">{preset.name}</h4>
                                <p className="mt-1 text-xs text-mute">{preset.info.weeks} weeks · {preset.info.split}</p>
                            </div>
                            <div className="flex flex-shrink-0 items-center gap-2">
                                <button onClick={() => handlePreview(preset)} className="ee-secondary px-3.5 py-2 text-xs">
                                    <Eye size={14} /> Preview
                                </button>
                                <button onClick={() => onProgramUpdate(preset)} className="ee-primary px-3.5 py-2 text-xs">Load</button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};
