import React, { useState, useEffect, useMemo, useContext, useCallback } from 'react';
import { doc, updateDoc, onSnapshot, setDoc, arrayUnion, deleteDoc } from 'firebase/firestore';

import { generateUUID, getExerciseDetails, isSetLogComplete } from '../utils/helpers';
import { getWorkoutForWeek, getWorkoutNameForDay } from '../utils/workout';
import { migrateProgramData } from '../utils/migration';
import { presets } from '../data/presets';
import { achievementsList } from '../data/achievements';

import { AppStateContext } from '../contexts/AppStateContext';
import { FirebaseContext } from '../contexts/FirebaseContext';
import { ThemeContext } from '../contexts/ThemeContext';

import { TutorialModal } from '../components/modals/TutorialModal';
import { RestoreProgramModal } from '../views/ProgramManagerView';

export const useApplicationData = () => {
    const [pageState, setPageState] = useState({ view: 'main', data: {} });
    const [programInstances, setProgramInstances] = useState([]);
    const [activeInstanceId, setActiveInstanceId] = useState(null);
    const [allLogs, setAllLogs] = useState({});
    const [archivedLogs, setArchivedLogs] = useState([]);
    const [skippedDays, setSkippedDays] = useState({});
    const [weightUnit, setWeightUnit] = useState('lbs');
    const [bodyWeight, setBodyWeight] = useState('');
    const [bodyWeightHistory, setBodyWeightHistory] = useState([]);
    const { user, db, isLoading, customId, handleSetCustomId } = useContext(FirebaseContext);
    const { setTheme } = useContext(ThemeContext);
    const { openModal, closeModal, addToast } = useContext(AppStateContext);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [activeTimer, setActiveTimer] = useState(null);
    const [unlockedAchievements, setUnlockedAchievements] = useState({});

    const programData = useMemo(() => {
        let programToMigrate;
        if (programInstances.length === 0) {
            programToMigrate = presets['optimal-ppl-ul'];
        } else {
            const activeInstance =
                programInstances.find(p => p.id === activeInstanceId) || programInstances[0];
            programToMigrate = activeInstance.program;
        }
        return migrateProgramData(programToMigrate);
    }, [activeInstanceId, programInstances]);

    const handleUpdateAndSave = useCallback((updates) => {
        if (db && customId) {
            const userDocRef = doc(db, 'workoutLogs', customId);
            updateDoc(userDocRef, updates);
        }
    }, [db, customId]);

    const handleProgramDataChange = useCallback((updater) => {
        setProgramInstances(prevInstances => {
            if (prevInstances.length === 0) {
                return prevInstances;
            }
            const targetId = activeInstanceId || prevInstances[0].id;
            const newInstances = prevInstances.map(p => {
                if (p.id === targetId) {
                    const newProgram = typeof updater === 'function' ? updater(p.program) : updater;
                    return { ...p, program: newProgram, lastModified: new Date().toISOString() };
                }
                return p;
            });
            handleUpdateAndSave({ programInstances: newInstances });
            if (!activeInstanceId) {
                setActiveInstanceId(targetId);
            }
            return newInstances;
        });
    }, [activeInstanceId, handleUpdateAndSave]);

    const navigate = useCallback((view, data = {}) => {
        const newPageState = { view, data };
        if (pageState.view === newPageState.view && JSON.stringify(pageState.data) === JSON.stringify(newPageState.data)) {
            return;
        }
        window.history.pushState(newPageState, '', window.location.pathname);
        setPageState(newPageState);
    }, [pageState]);

    const handleProgramUpdate = useCallback((newProgramTemplate) => {
        const newInstance = {
            id: generateUUID(),
            program: migrateProgramData(newProgramTemplate), // All program data is encapsulated here
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };

        // Ensure weeklyOverrides is a blank slate for a new program instance.
        if (!newInstance.program.weeklyOverrides) {
            newInstance.program.weeklyOverrides = {};
        }

        setProgramInstances(prevInstances => {
            const newInstances = [...prevInstances, newInstance];
            // When loading a new program, we are creating a new "instance" of it.
            // We only need to save the new list of instances and set the active one.
            handleUpdateAndSave({
                programInstances: newInstances,
                activeInstanceId: newInstance.id,
            });
            return newInstances;
        });

        setActiveInstanceId(newInstance.id);
        addToast(`Program "${newInstance.program.name}" loaded!`, "success");
        navigate('main');
    }, [handleUpdateAndSave, addToast, navigate]);
    
    const handleInstanceSwitch = (instanceId) => {
        setActiveInstanceId(instanceId);
        handleUpdateAndSave({ activeInstanceId: instanceId });
        addToast("Switched program!", "success");
    }

    const handleDeleteProgram = (instanceId) => {
        setProgramInstances(prev => {
            const newInstances = prev.filter(p => p.id !== instanceId);
            handleUpdateAndSave({ programInstances: newInstances });
            return newInstances;
        });
        addToast("Program deleted.", "success");
    };

    const handleBodyWeightChange = useCallback((newWeight, save = false) => {
        if (save) {
            const weightValue = parseFloat(newWeight); // newWeight is in current display unit
            if (!isNaN(weightValue) && weightValue > 0) {
                const weightInLbs = weightUnit === 'kg' ? weightValue * 2.20462 : weightValue;
                const newEntry = { weight: weightInLbs, date: new Date().toISOString() };

                setBodyWeight(weightInLbs.toString());
                setBodyWeightHistory(prevHistory => {
                    const newHistory = [...prevHistory, newEntry];
                    handleUpdateAndSave({ bodyWeight: weightInLbs.toString(), bodyWeightHistory: newHistory });
                    addToast("Weight logged successfully!", "success");
                    return newHistory;
                });
            } else {
                addToast("Invalid weight value.", "error");
            }
        }
    }, [handleUpdateAndSave, addToast, weightUnit]);
    
    const showTutorial = useCallback((isReview = false) => {
        if (!isReview && customId) {
            console.log("User already has a custom ID, skipping tutorial.");
            return;
        }
        openModal(
            <TutorialModal 
                isReview={isReview}
                onClose={closeModal} 
                onProgramSelect={handleProgramUpdate}
                onBodyWeightSet={handleBodyWeightChange}
                onSetSyncId={handleSetCustomId}
            />, 
            'lg'
        );
    }, [openModal, closeModal, handleProgramUpdate, handleBodyWeightChange, handleSetCustomId, customId]);

    useEffect(() => {
        if (!user || !db) {
            if (!isLoading) setIsDataLoading(false);
            return;
        }
        if (!customId) {
            const defaultProgram = migrateProgramData(presets['optimal-ppl-ul']);
            const localInstance = {
                id: generateUUID(),
                program: defaultProgram,
                createdAt: new Date().toISOString(),
                lastModified: new Date().toISOString()
            };
            setProgramInstances([localInstance]);
            setActiveInstanceId(localInstance.id);
            setIsDataLoading(false);
            showTutorial(false);
            return;
        }

        setIsDataLoading(true);
        const userDocRef = doc(db, 'workoutLogs', customId);
        const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setAllLogs(data.logs || {});
                setArchivedLogs(data.archivedLogs || []);
                setSkippedDays(data.skippedDays || {});
                setTheme(data.theme || 'dark');
                setWeightUnit(data.weightUnit || 'lbs');
                setBodyWeight(data.bodyWeight || '');
                setBodyWeightHistory(data.bodyWeightHistory || []);
                setUnlockedAchievements(data.unlockedAchievements || {});

                // Migration for program instances
                if (data.programInstances && data.activeInstanceId) {
                    const migratedInstances = data.programInstances.map(instance => ({
                        ...instance,
                        program: migrateProgramData(instance.program)
                    }));

                    if (JSON.stringify(migratedInstances) !== JSON.stringify(data.programInstances)) {
                        handleUpdateAndSave({ programInstances: migratedInstances });
                    }

                    setProgramInstances(migratedInstances);
                    setActiveInstanceId(data.activeInstanceId);
                } else {
                    // One-time migration from old data structure
                    const defaultProgram = presets['optimal-ppl-ul'];
                     const loadedProgram = {
                        name: data.name || defaultProgram.name,
                        info: data.info || defaultProgram.info,
                        masterExerciseList: data.masterExerciseList || defaultProgram.masterExerciseList,
                        programStructure: data.programStructure || defaultProgram.programStructure,
                        weeklySchedule: data.weeklySchedule || defaultProgram.weeklySchedule,
                        workoutOrder: data.workoutOrder || defaultProgram.workoutOrder,
                        settings: { ...defaultProgram.settings, ...data.settings },
                        weeklyOverrides: data.weeklyOverrides || {},
                    };
                    const migratedProgram = migrateProgramData(loadedProgram);
                    const initialInstance = {
                        id: generateUUID(),
                        program: migratedProgram,
                        createdAt: new Date().toISOString(),
                        lastModified: new Date().toISOString()
                    };
                    setProgramInstances([initialInstance]);
                    setActiveInstanceId(initialInstance.id);
                    // Save the new structure
                    handleUpdateAndSave({ programInstances: [initialInstance], activeInstanceId: initialInstance.id });
                }
            } else {
                // Safeguard against overwriting data on flaky connections.
                // Only create a new profile if we get a definitive "doesn't exist" from the server.
                if (!docSnap.metadata.fromCache) {
                    const firstProgram = presets['optimal-ppl-ul'];
                    const firstInstance = {
                        id: generateUUID(),
                        program: firstProgram,
                        createdAt: new Date().toISOString(),
                        lastModified: new Date().toISOString()
                    };
                    const initialData = {
                        programInstances: [firstInstance],
                        activeInstanceId: firstInstance.id,
                        logs: {},
                        skippedDays: {},
                        theme: 'dark',
                        weightUnit: 'lbs',
                        bodyWeight: '',
                        bodyWeightHistory: [],
                        archivedLogs: [],
                        unlockedAchievements: {},
                        hasSeenTutorial: true
                    };
                    setDoc(userDocRef, initialData);
                } else {
                    console.log("Offline and no data in cache. Waiting for connection to create profile.");
                }
            }
            setIsDataLoading(false);
        }, (error) => {
            console.error("Error fetching data from Firestore:", error);
            setIsDataLoading(false);
        });
        return () => unsubscribe();
    }, [user, db, customId, setTheme, isLoading, handleUpdateAndSave, showTutorial]);

    const historicalLogs = useMemo(() => {
        const combined = { ...allLogs };
        archivedLogs.forEach(archive => {
            Object.assign(combined, archive.logs);
        });
        
        // Filter out stale logs for exercises that no longer exist in the program
        const masterList = programData?.masterExerciseList || {};
        return Object.fromEntries(
            Object.entries(combined).filter(([, log]) => !!masterList[log.exercise])
        );
    }, [allLogs, archivedLogs, programData?.masterExerciseList]);

    // Achievement checking
    useEffect(() => {
        if (isDataLoading) return;

        const verifyAchievements = () => {
            const newUnlocks = {};
            let achievementsChanged = false;

            Object.entries(achievementsList).forEach(([id, achievement]) => {
                const currentValue = achievement.getValue
                    ? achievement.getValue(historicalLogs, programData, parseFloat(bodyWeight) || 0, weightUnit, bodyWeightHistory)
                    : 0;
                const oldTier = unlockedAchievements[id] ?? -1;
                let newTier = -1;

                if (achievement.type === 'tiered') {
                    achievement.tiers.forEach((tier, index) => {
                        if (currentValue >= tier.value) {
                            newTier = index;
                        }
                    });
                } else { // Single-tier
                    newTier = currentValue >= 1 ? 0 : -1;
                }

                if (newTier !== oldTier) {
                    achievementsChanged = true;
                    if (newTier > oldTier) {
                        if (achievement.type === 'tiered') {
                            const tier = achievement.tiers[newTier];
                            addToast(`Achievement: ${achievement.name} - ${tier.name}!`, tier.name.toLowerCase());
                        } else {
                            addToast(`Achievement: ${achievement.name}!`, 'success');
                        }
                    }
                }
                if (newTier > -1) {
                    newUnlocks[id] = newTier;
                }
            });

            if (achievementsChanged) {
                setUnlockedAchievements(newUnlocks);
                handleUpdateAndSave({ unlockedAchievements: newUnlocks });
            }
        };

        verifyAchievements();
    }, [isDataLoading, historicalLogs, programData, bodyWeight, addToast, unlockedAchievements, handleUpdateAndSave]);

    useEffect(() => {
        window.history.replaceState(pageState, '', window.location.pathname);

        const handlePopState = (event) => {
            if (event.state) {
                setPageState(event.state);
            }
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []); // Empty dependency array ensures this runs only once.

    const handleWeightUnitChange = (newUnit) => {
        setWeightUnit(newUnit);
        handleUpdateAndSave({ weightUnit: newUnit });
    };

    const handleSkipDay = (week, dayKey) => {
        const skipKey = `${week}-${dayKey}`;
        const newSkippedDays = { ...skippedDays, [skipKey]: true };
        setSkippedDays(newSkippedDays);
        handleUpdateAndSave({ skippedDays: newSkippedDays });
        navigate('main');
    };

    const handleUnskipDay = (week, dayKey) => {
        const skipKey = `${week}-${dayKey}`;
        const newSkippedDays = { ...skippedDays };
        delete newSkippedDays[skipKey];
        setSkippedDays(newSkippedDays);
        handleUpdateAndSave({ skippedDays: newSkippedDays });
    };

    const handleResetMeso = () => {
        if (db && customId && Object.keys(allLogs).length > 0) {
            const userDocRef = doc(db, 'workoutLogs', customId);
            updateDoc(userDocRef, {
                archivedLogs: arrayUnion({ logs: allLogs, date: new Date().toISOString(), programName: programData.name }),
                logs: {},
                skippedDays: {},
            });
             // Also clear overrides in the active instance
            const newProgramData = { ...programData, weeklyOverrides: {} };
            handleProgramDataChange(newProgramData);

        } else if (db && customId) {
            // Handle case where there are no logs to archive.
            updateDoc(doc(db, 'workoutLogs', customId), { logs: {}, skippedDays: {} });
        }
    };

    const handleRestoreLogs = useCallback((csvData) => {
        if (!csvData) {
            addToast('The selected file is empty.', 'error');
            return;
        }

        try {
            const lines = csvData.trim().split('\n');
            if (lines.length < 2) {
                throw new Error("CSV is empty or has only a header.");
            }
            const headers = lines[0].split(',').map(h => h.trim());

            const requiredHeaders = ['Week', 'Day', 'Exercise', 'Set', 'Load (lbs)', 'Reps'];
            if (!requiredHeaders.every(h => headers.includes(h))) {
                throw new Error("Invalid CSV format. Missing required headers like 'Week', 'Day', 'Exercise', etc.");
            }

            const newLogs = {};
            lines.slice(1).forEach((line, index) => {
                const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g).map(v => v.replace(/"/g, ''));

                const logData = headers.reduce((obj, header, i) => {
                    obj[header] = values[i] ? values[i].trim() : '';
                    return obj;
                }, {});

                const { Week, Day, Exercise, Set } = logData;
                if (!Week || !Day || !Exercise || !Set) {
                    console.warn(`Skipping invalid row ${index + 2} in CSV.`);
                    return;
                }

                const logId = `${Week}-${Day}-${Exercise}-${Set}`;
                const loadInLbs = parseFloat(logData['Load (lbs)']);
                const displayLoad = weightUnit === 'kg'
                    ? (loadInLbs / 2.20462).toFixed(1)
                    : (logData['Load (lbs)'] || '');

                newLogs[logId] = {
                    week: parseInt(Week, 10),
                    dayKey: Day,
                    session: logData['Session'] || 'Restored Session',
                    exercise: Exercise,
                    set: parseInt(Set, 10),
                    load: loadInLbs,
                    displayLoad: displayLoad,
                    reps: logData['Reps'],
                    rir: logData['RIR'] || '',
                    date: new Date().toISOString(),
                };
            });

            if (Object.keys(newLogs).length === 0) {
                throw new Error("No valid log entries found in the CSV file.");
            }

            openModal(
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Confirm Restore</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        This will replace all your current workout logs with the data from the CSV file.
                        Found {Object.keys(newLogs).length} log entries to restore. This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-2 mt-6">
                        <button onClick={closeModal} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg">Cancel</button>
                        <button onClick={() => {
                            setAllLogs(newLogs);
                            handleUpdateAndSave({ logs: newLogs });
                            addToast('Data restored successfully!', 'success');
                            closeModal();
                        }} className="px-4 py-2 bg-red-600 text-white rounded-lg">Confirm & Restore</button>
                    </div>
                </div>
            );

        } catch (error) {
            console.error("Error restoring from CSV:", error);
            addToast(`Import Failed: ${error.message}`, 'error');
        }
    }, [openModal, closeModal, addToast, handleUpdateAndSave, weightUnit]);

    const handleFileImport = useCallback((file) => {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            try {
                if (file.name.endsWith('.json')) {
                    const importedProgram = JSON.parse(content);
                    if (
                        importedProgram.name && typeof importedProgram.name === 'string' &&
                        importedProgram.info && typeof importedProgram.info === 'object' &&
                        importedProgram.masterExerciseList && typeof importedProgram.masterExerciseList === 'object' &&
                        importedProgram.programStructure && typeof importedProgram.programStructure === 'object' &&
                        importedProgram.weeklySchedule && Array.isArray(importedProgram.weeklySchedule) &&
                        importedProgram.workoutOrder && Array.isArray(importedProgram.workoutOrder)
                    ) {
                        handleProgramUpdate(importedProgram);
                        addToast(`Program "${importedProgram.name}" imported successfully!`, 'success');
                    } else {
                        throw new Error("Invalid or incomplete program file structure.");
                    }
                } else if (file.name.endsWith('.csv')) {
                    const lines = content.trim().split('\n');
                    if (lines.length > 0) {
                        const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
                        if (headers.includes('week') && headers.includes('load (lbs)')) {
                            handleRestoreLogs(content);
                        } else if (headers.includes('workout day') && headers.includes('day of week')) {
                            openModal(<RestoreProgramModal csvData={content} onRestore={handleProgramUpdate} onClose={closeModal} />);
                        } else {
                            throw new Error("Unrecognized CSV format.");
                        }
                    } else {
                        throw new Error("CSV file is empty.");
                    }
                } else {
                    throw new Error("Unsupported file type. Please select a .json or .csv file.");
                }
            } catch (error) {
                console.error("Failed to import file:", error);
                addToast(`Import Failed: ${error.message}`, 'error');
            }
        };
        reader.readAsText(file);
    }, [openModal, closeModal, handleProgramUpdate, addToast, handleRestoreLogs]);

    const handleTimerEnd = useCallback(() => {
        setActiveTimer(null);
         openModal(
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Time's Up!</h2>
                <p className="text-gray-600 dark:text-gray-400">Your rest is over. Time to hit the next set!</p>
                <div className="flex justify-end gap-2 mt-6">
                    <button onClick={closeModal} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Let's Go!</button>
                </div>
            </div>
        );
    }, [openModal, closeModal]);

    const handleStartTimer = () => {
        if (programData.settings.restTimer.enabled) {
            setActiveTimer(programData.settings.restTimer.duration);
        }
    };
    
    const completedDays = useMemo(() => {
        const status = new Map();
        if (!programData || !programData.info) return status;

        for (let week = 1; week <= programData.info.weeks; week++) {
            const weekSchedule = programData.weeklyScheduleOverrides?.[week] || programData.weeklySchedule;
            weekSchedule.forEach(day => {
                const dayId = day.id || day.day; const dayKey = `${week}-${dayId}`;
                const workoutName = getWorkoutNameForDay(programData, week, day.day);
                const workout = getWorkoutForWeek(programData, week, workoutName);
                const isSkipped = !!skippedDays[dayKey];
                
                if (!workout || workoutName === 'Rest') {
                    status.set(dayKey, { isDayComplete: true, isSkipped: false });
                    return;
                }

                const isDayComplete = workout.exercises.every(ex => {
                    const exDetails = getExerciseDetails(ex.name, programData.masterExerciseList);
                    if (!exDetails) return false;
                    return Array.from({ length: Number(exDetails.sets) }, (_, i) => i + 1).every(setNum => {
                        const log = allLogs[`${dayKey}-${ex.name}-${setNum}`];
                        return isSetLogComplete(log);
                    });
                });
                status.set(dayKey, { isDayComplete, isSkipped });
            });
        }
        return status;
    }, [allLogs, skippedDays, programData]);

    const handleDeleteAllUserData = useCallback(async () => {
        if (!db || !customId) {
            addToast("No active sync session found.", "error");
            return;
        }
        try {
            const userRef = doc(db, 'users', customId);
            await deleteDoc(userRef);
            localStorage.removeItem('projectOverloadSyncId');
            addToast("All user data has been deleted. Reloading...", "success");
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            console.error("Error deleting user data:", error);
            addToast(`Failed to delete data: ${error.message}`, 'error');
        }
    }, [db, customId, addToast]);

    const onBack = () => navigate('main');

    return {
        pageState,
        navigate,
        onBack,
        programInstances,
        activeInstanceId,
        allLogs,
        setAllLogs,
        historicalLogs,
        skippedDays,
        weightUnit,
        handleWeightUnitChange,
        bodyWeight,
        handleBodyWeightChange,
        bodyWeightHistory,
        isDataLoading,
        activeTimer,
        setActiveTimer,
        handleStartTimer,
        handleTimerEnd,
        unlockedAchievements,
        programData,
        handleProgramDataChange,
        handleProgramUpdate,
        handleInstanceSwitch,
        handleDeleteProgram,
        showTutorial,
        handleSkipDay,
        handleUnskipDay,
        handleResetMeso,
        handleRestoreLogs,
        handleFileImport,
        handleDeleteAllUserData,
        completedDays
    };
};
