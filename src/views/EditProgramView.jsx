import React, { useState, useContext } from 'react';
import { ChevronDown, Dumbbell, PlusCircle, Edit, Pencil, Move, XCircle, Shield } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { AppStateContext } from '../contexts/AppStateContext';
import { FirebaseContext } from '../contexts/FirebaseContext';
import { doc } from 'firebase/firestore';
import { generateUUID } from '../utils/helpers';
import { getWorkoutNameForDay } from '../utils/workout';
import { queueUpdate } from '../utils/syncQueue';

// Extracted Modals
import { EditDayWorkoutModal } from '../components/modals/EditDayWorkoutModal';
import { EditExerciseModal } from '../components/modals/EditExerciseModal';
import { AddExerciseToWorkoutModal } from '../components/modals/AddExerciseToWorkoutModal';
import { RenameWorkoutModal } from '../components/modals/RenameWorkoutModal';

// Program Components
import { EditWeekCard } from '../components/program/EditWeekCard';
import { ViewHeader } from '../components/common/ViewHeader';

export const EditProgramView = ({ programData, onProgramDataChange, allLogs, setAllLogs, embedded = false }) => {
    const { openModal, closeModal, addToast } = useContext(AppStateContext);
    const { db, customId } = useContext(FirebaseContext);
    const [isScheduleOpen, setScheduleOpen] = useState(false); // State for collapsible schedule

    const handleInfoChange = (field, value) => {
        onProgramDataChange(p => ({ ...p, info: { ...p.info, [field]: value } }));
    };

    const handleAddDayToSchedule = () => {
        onProgramDataChange(p => {
            const newSchedule = [...p.weeklySchedule];
            const newDayName = `Day ${newSchedule.length + 1}`;

            // Create a new unique rest day template for this new schedule day
            let newRestDayName;
            let restDayCounter = 1;
            do {
                newRestDayName = `Rest Day ${restDayCounter}`;
                restDayCounter++;
            } while (p.programStructure[newRestDayName]);

            const newProgramStructure = {
                ...p.programStructure,
                [newRestDayName]: { exercises: [], label: 'Rest', isRest: true, id: generateUUID() }
            };
            const newWorkoutOrder = [...p.workoutOrder, newRestDayName];

            newSchedule.push({ day: newDayName, workout: newRestDayName, id: generateUUID() });

            return {
                ...p,
                weeklySchedule: newSchedule,
                programStructure: newProgramStructure,
                workoutOrder: newWorkoutOrder
            };
        });
    };

    const handleRemoveLastDayFromSchedule = () => {
        onProgramDataChange(p => {
            if (p.weeklySchedule.length <= 1) return p;

            const newSchedule = p.weeklySchedule.slice(0, -1);

            // If the last day's workout is unique to that day (like "Rest Day X") or we are in sequential mode,
            // we should also remove the template if it's not used elsewhere.
            const removedDay = p.weeklySchedule[p.weeklySchedule.length - 1];
            const workoutName = removedDay.workout;

            let newProgramStructure = { ...p.programStructure };
            let newWorkoutOrder = [...p.workoutOrder];

            // Check if this workout is used elsewhere in the new schedule
            const isUsedElsewhere = newSchedule.some(d => d.workout === workoutName);

            if (!isUsedElsewhere && (p.programStructure[workoutName]?.isRest || !p.settings.useWeeklySchedule)) {
                 delete newProgramStructure[workoutName];
                 newWorkoutOrder = newWorkoutOrder.filter(name => name !== workoutName);
            }

            return {
                ...p,
                weeklySchedule: newSchedule,
                programStructure: newProgramStructure,
                workoutOrder: newWorkoutOrder
            };
        });
    };

    const handleAddWorkoutDay = () => {
        onProgramDataChange(p => {
            let newWorkoutName;
            let workoutCounter = 1;
            do {
                newWorkoutName = `New Workout ${workoutCounter}`;
                workoutCounter++;
            } while (p.programStructure[newWorkoutName]);

            const newProgramStructure = { ...p.programStructure, [newWorkoutName]: { exercises: [], label: 'New', isRest: false, id: generateUUID() } };
            const newWorkoutOrder = [...p.workoutOrder, newWorkoutName];

            // Sync: Add to schedule
            const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const newIndex = p.weeklySchedule.length;
            const newDayLabel = daysOfWeek[newIndex % 7] + (Math.floor(newIndex / 7) > 0 ? ` ${Math.floor(newIndex/7)+1}` : '');

            const newSchedule = [...p.weeklySchedule, { day: newDayLabel, workout: newWorkoutName, id: generateUUID() }];

            return { ...p, programStructure: newProgramStructure, workoutOrder: newWorkoutOrder, weeklySchedule: newSchedule };
        });
    };

    const handleAddNewRestDay = () => {
        onProgramDataChange(p => {
            let newRestDayName;
            let restDayCounter = 1;
            do {
                newRestDayName = `Rest Day ${Object.values(p.programStructure).filter(p => p.isRest).length + restDayCounter}`;
                restDayCounter++;
            } while (p.programStructure[newRestDayName]);

            const newProgramStructure = {
                ...p.programStructure,
                [newRestDayName]: { exercises: [], label: 'Rest', isRest: true, id: generateUUID() }
            };
            const newWorkoutOrder = [...p.workoutOrder, newRestDayName];

            // Sync: Add to schedule
            const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const newIndex = p.weeklySchedule.length;
            const newDayLabel = daysOfWeek[newIndex % 7] + (Math.floor(newIndex / 7) > 0 ? ` ${Math.floor(newIndex/7)+1}` : '');

            const newSchedule = [...p.weeklySchedule, { day: newDayLabel, workout: newRestDayName, id: generateUUID() }];

            return { ...p, programStructure: newProgramStructure, workoutOrder: newWorkoutOrder, weeklySchedule: newSchedule };
        });
    };

    const handleToggleTemplateType = (workoutName) => {
        onProgramDataChange(p => {
            const newProgramStructure = JSON.parse(JSON.stringify(p.programStructure));
            const template = newProgramStructure[workoutName];
            if (template) {
                template.isRest = !template.isRest;
            }
            return { ...p, programStructure: newProgramStructure };
        });
    };

    const handleDeleteWorkoutDay = (workoutNameToDelete) => {
        onProgramDataChange(p => {
            let newProgramStructure = { ...p.programStructure };
            delete newProgramStructure[workoutNameToDelete];

            let newWorkoutOrder = p.workoutOrder.filter(name => name !== workoutNameToDelete);

            // Remove from weeklySchedule (Dynamic Days: No set amount)
            let newSchedule = p.weeklySchedule.filter(d => d.workout !== workoutNameToDelete);

            // Regenerate day labels to keep them sequential
            const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            newSchedule = newSchedule.map((day, index) => ({
                ...day,
                day: daysOfWeek[index % 7] + (Math.floor(index / 7) > 0 ? ` ${Math.floor(index/7)+1}` : '')
            }));

            // Clean overrides for the deleted workout
            const newOverrides = JSON.parse(JSON.stringify(p.weeklyOverrides || {}));
            for (const week in newOverrides) {
                for (const day in newOverrides[week]) {
                    if (newOverrides[week][day] === workoutNameToDelete) {
                        delete newOverrides[week][day];
                    }
                }
            }

            return {
                ...p,
                programStructure: newProgramStructure,
                workoutOrder: newWorkoutOrder,
                weeklySchedule: newSchedule,
                weeklyOverrides: newOverrides,
            };
        });
    };

    const handleRenameWorkoutDay = (oldName, newName) => {
        onProgramDataChange(p => {
            if (!newName || newName === oldName || p.programStructure[newName]) {
                return p;
            }

            const newProgramStructure = { ...p.programStructure };
            // Sync label with new name for concurrency
            newProgramStructure[newName] = { ...newProgramStructure[oldName], label: newName };
            delete newProgramStructure[oldName];

            const newWorkoutOrder = p.workoutOrder.map(name => name === oldName ? newName : name);
            const newSchedule = p.weeklySchedule.map(d => d.workout === oldName ? { ...d, workout: newName } : d);

            const newOverrides = JSON.parse(JSON.stringify(p.weeklyOverrides || {}));
            for (const week in newOverrides) {
                for (const day in newOverrides[week]) {
                    if (newOverrides[week][day] === oldName) {
                        newOverrides[week][day] = newName;
                    }
                }
            }

            return {
                ...p,
                programStructure: newProgramStructure,
                workoutOrder: newWorkoutOrder,
                weeklySchedule: newSchedule,
                weeklyOverrides: newOverrides,
            };
        });
        closeModal();
    };

    const startEditingName = (name) => {
        openModal(<RenameWorkoutModal oldName={name} onSave={(newName) => handleRenameWorkoutDay(name, newName)} onClose={closeModal} />)
    };

    const handleAddExerciseToWorkout = (workoutName) => {
        const myExercises = programData.masterExerciseList;

        openModal(
            <AddExerciseToWorkoutModal
                masterExerciseList={myExercises}
                onAdd={(exerciseName, exerciseDetails) => {
                    onProgramDataChange(p => {
                        const newProgramStructure = JSON.parse(JSON.stringify(p.programStructure));
                        newProgramStructure[workoutName].exercises.push({ id: generateUUID(), name: exerciseName });

                        let newMasterList = { ...p.masterExerciseList };
                        if (exerciseDetails && !newMasterList[exerciseName]) {
                            newMasterList[exerciseName] = exerciseDetails;
                        }

                        return {
                            ...p,
                            programStructure: newProgramStructure,
                            masterExerciseList: newMasterList
                        };
                    });
                    closeModal();
                }}
                onClose={closeModal}
            />, 'lg'
        )
    };

    const handleEditExerciseDetails = (exerciseName) => {
        const exerciseDetails = programData.masterExerciseList[exerciseName];
        openModal(
            <EditExerciseModal
                exerciseName={exerciseName}
                exercise={exerciseDetails}
                onSave={(newDetails, newName) => {
                    onProgramDataChange(p => {
                        const newMasterList = { ...p.masterExerciseList };
                        if (exerciseName !== newName) {
                            delete newMasterList[exerciseName];

                            // Migrate Logs if renamed
                            setAllLogs(currentLogs => {
                                const updatedLogs = { ...currentLogs };
                                Object.keys(updatedLogs).forEach(logKey => {
                                    if (updatedLogs[logKey].exercise === exerciseName) {
                                        updatedLogs[logKey].exercise = newName;
                                    }
                                });
                                return updatedLogs;
                            });
                        }
                        newMasterList[newName] = newDetails;

                        const newProgramStructure = JSON.parse(JSON.stringify(p.programStructure));
                        Object.keys(newProgramStructure).forEach(workoutKey => {
                            newProgramStructure[workoutKey].exercises = newProgramStructure[workoutKey].exercises.map(ex => ex.name === exerciseName ? { ...ex, name: newName } : ex);
                        });

                        return { ...p, masterExerciseList: newMasterList, programStructure: newProgramStructure };
                    });
                    closeModal();
                }}
                onDelete={(nameToDelete) => {
                    const confirmMsg = `Are you sure you want to delete ${nameToDelete}? All historical logs for this exercise will be permanently removed from analytics.`;
                    if (window.confirm(confirmMsg)) {
                        onProgramDataChange(p => {
                            const newMasterList = { ...p.masterExerciseList };
                            delete newMasterList[nameToDelete];

                            // Cleanup Logs if deleted
                            setAllLogs(currentLogs => {
                                const updatedLogs = { ...currentLogs };
                                Object.keys(updatedLogs).forEach(logKey => {
                                    if (updatedLogs[logKey].exercise === nameToDelete) {
                                        delete updatedLogs[logKey];
                                    }
                                });
                                return updatedLogs;
                            });

                            const newProgramStructure = JSON.parse(JSON.stringify(p.programStructure));
                            Object.keys(newProgramStructure).forEach(workoutKey => {
                                newProgramStructure[workoutKey].exercises = newProgramStructure[workoutKey].exercises.filter(ex => ex.name !== nameToDelete);
                            });

                            return { ...p, masterExerciseList: newMasterList, programStructure: newProgramStructure };
                        });
                        closeModal();
                    }
                }}
                onClose={closeModal}
            />,
            'lg'
        );
    };

    const handleCreateNewExercise = () => {
        openModal(
            <EditExerciseModal
                isNew={true}
                onSave={(newDetails, newName) => {
                    onProgramDataChange(p => ({
                        ...p,
                        masterExerciseList: { ...p.masterExerciseList, [newName]: newDetails }
                    }));
                    closeModal();
                }}
                onClose={closeModal}
            />,
            'lg'
        )
    };

    const handleRemoveExerciseFromWorkout = (workoutName, exerciseIndex) => {
        onProgramDataChange(p => {
            const newProgramStructure = JSON.parse(JSON.stringify(p.programStructure));
            newProgramStructure[workoutName].exercises.splice(exerciseIndex, 1);
            return { ...p, programStructure: newProgramStructure };
        });
    };

    const handleToggleRestDay = (week, dayKey) => {
        onProgramDataChange(p => {
            const currentWorkoutName = getWorkoutNameForDay(p, week, dayKey);
            const isCurrentlyRest = p.programStructure[currentWorkoutName]?.isRest;
            let newOverrides = JSON.parse(JSON.stringify(p.weeklyOverrides || {}));
            if (!newOverrides[week]) {
                newOverrides[week] = {};
            }

            if (!isCurrentlyRest) {
                const restTemplate = Object.keys(p.programStructure).find(name => p.programStructure[name]?.isRest) || 'Rest Day';
                newOverrides[week][dayKey] = restTemplate;
            } else {
                const masterWorkout = p.weeklySchedule.find(d => d.day === dayKey)?.workout;
                if (masterWorkout && !p.programStructure[masterWorkout]?.isRest) {
                    delete newOverrides[week][dayKey];
                } else {
                    const firstWorkout = p.workoutOrder.find(name => !p.programStructure[name]?.isRest);
                    if (firstWorkout) {
                        newOverrides[week][dayKey] = firstWorkout;
                    } else {
                        return p;
                    }
                }
            }

            if (Object.keys(newOverrides[week]).length === 0) {
                delete newOverrides[week];
            }
            return { ...p, weeklyOverrides: newOverrides };
        });
    };

    const onDragEnd = (result) => {
        if (!result.destination) return;
        const { source, destination, type } = result;

        if (type === 'workoutDay') {
            onProgramDataChange(p => {
                const reorderedWorkoutOrder = Array.from(p.workoutOrder);
                const [movedItem] = reorderedWorkoutOrder.splice(source.index, 1);
                reorderedWorkoutOrder.splice(destination.index, 0, movedItem);

                // Sync with Main Page (Weekly Schedule)
                // Reorder the schedule entries to match, but keep existing day labels
                // so that log keys (which use day labels like "Mon", "Tue") remain valid.
                const originalSchedule = Array.from(p.weeklySchedule);
                const oldDayKeys = originalSchedule.map(s => s.day);

                const newSchedule = Array.from(p.weeklySchedule);
                const [movedScheduleItem] = newSchedule.splice(source.index, 1);
                if (movedScheduleItem) {
                    newSchedule.splice(destination.index, 0, movedScheduleItem);
                }

                // Create a mapping from OLD dayKey to NEW dayKey to migrate logs
                const dayKeyMapping = {};
                newSchedule.forEach((entry, index) => {
                    dayKeyMapping[entry.day] = oldDayKeys[index];
                });

                // Re-assign workout names to match the new template order,
                // but preserve the day labels from the schedule entries
                const updatedSchedule = newSchedule.map((entry, index) => ({
                    ...entry,
                    workout: reorderedWorkoutOrder[index] || entry.workout,
                    day: oldDayKeys[index] // Force keeping the original day label position
                }));

                // Migrate logs
                setAllLogs(currentLogs => {
                    const newLogsState = {};

                    // Build the new complete logs object and replace the whole field.
                    Object.keys(currentLogs).forEach(logId => {
                        const log = currentLogs[logId];
                        const oldDayKey = log.dayKey;

                        if (dayKeyMapping[oldDayKey] && dayKeyMapping[oldDayKey] !== oldDayKey) {
                            const newDayKey = dayKeyMapping[oldDayKey];
                            const newLogId = `${log.week}-${newDayKey}-${log.exercise}-${log.set}`;
                            newLogsState[newLogId] = { ...log, dayKey: newDayKey };
                        } else {
                            newLogsState[logId] = log;
                        }
                    });

                    if (db && customId) {
                        try {
                            const userDocRef = doc(db, 'workoutLogs', customId);
                            // Replace the entire 'logs' object in Firebase
                            queueUpdate(userDocRef, { logs: newLogsState });
                        } catch (error) {
                            console.error("Error migrating logs in Firebase:", error);
                        }
                    }

                    return newLogsState;
                });

                return { ...p, workoutOrder: reorderedWorkoutOrder, weeklySchedule: updatedSchedule };
            });
            return;
        }

        if (type === 'weeklyDay') {
            onProgramDataChange(p => {
                const weekNumber = parseInt(source.droppableId.replace('week-droppable-', ''));
                const weekSchedule = Array.from(p.weeklyScheduleOverrides?.[weekNumber] || p.weeklySchedule);
                const [movedItem] = weekSchedule.splice(source.index, 1);
                weekSchedule.splice(destination.index, 0, movedItem);

                const newOverrides = { ...(p.weeklyScheduleOverrides || {}), [weekNumber]: weekSchedule };
                return { ...p, weeklyScheduleOverrides: newOverrides };
            });
            return;
        }

        if (type === 'exercise') {
            onProgramDataChange(p => {
                const { droppableId: sourceWorkoutName, index: sourceIndex } = source;
                const { droppableId: destWorkoutName, index: destIndex } = destination;

                const newProgramStructure = JSON.parse(JSON.stringify(p.programStructure));
                const sourceList = newProgramStructure[sourceWorkoutName].exercises;
                const destList = newProgramStructure[destWorkoutName].exercises;

                const [movedItem] = sourceList.splice(sourceIndex, 1);
                if (movedItem) {
                    destList.splice(destIndex, 0, movedItem);
                    return { ...p, programStructure: newProgramStructure };
                }
                return p;
            });
        }
    };

    const handleEditDay = (week, dayKey) => {
        const onSaveFromModal = (workoutName, updatedWorkout) => {
            onProgramDataChange(p => ({
                ...p,
                programStructure: {
                    ...p.programStructure,
                    [workoutName]: updatedWorkout,
                }
            }));
            closeModal();
        };

        const onSetRestFromModal = () => {
            onProgramDataChange(p => {
                let newOverrides = JSON.parse(JSON.stringify(p.weeklyOverrides || {}));
                if (!newOverrides[week]) {
                    newOverrides[week] = {};
                }
                const restTemplate = Object.keys(p.programStructure).find(name => p.programStructure[name]?.isRest) || 'Rest Day';
                newOverrides[week][dayKey] = restTemplate;
                return { ...p, weeklyOverrides: newOverrides };
            });
            closeModal();
        };

        const onAddExerciseFromModal = (addExerciseCallback) => {
            openModal(
                <AddExerciseToWorkoutModal
                    masterExerciseList={programData.masterExerciseList}
                    onAdd={(exerciseName, exerciseDetails) => {
                        addExerciseCallback(exerciseName, exerciseDetails);

                        if (exerciseDetails && !programData.masterExerciseList[exerciseName]) {
                             onProgramDataChange(p => ({
                                 ...p,
                                 masterExerciseList: { ...p.masterExerciseList, [exerciseName]: exerciseDetails }
                             }));
                        }

                        closeModal();
                    }}
                    onClose={closeModal}
                />, 'lg'
            );
        };

        const baseWorkoutName = getWorkoutNameForDay(programData, week, dayKey);
        const existingOverride = programData.weeklyOverrides?.[week]?.[dayKey];

        if (existingOverride) {
            const workoutToEdit = programData.programStructure[existingOverride];
            openModal(
                <EditDayWorkoutModal
                    workout={workoutToEdit}
                    workoutName={existingOverride}
                    onSave={onSaveFromModal}
                    onClose={closeModal}
                    onEditExercise={handleEditExerciseDetails}
                    onAddExercise={onAddExerciseFromModal}
                    onSetRest={onSetRestFromModal}
                />,
                'lg'
            );
        } else {
            const customWorkoutName = `${programData.programStructure[baseWorkoutName]?.isRest ? 'New Workout' : baseWorkoutName} (Custom W${week}-${dayKey})`;
            let baseWorkout = programData.programStructure[baseWorkoutName];
            if (!baseWorkout) {
                console.warn(`Dangling reference found for workout "${baseWorkoutName}". Using fallback.`);
                const fallbackWorkoutName = programData.workoutOrder.find(name => programData.programStructure[name] && !programData.programStructure[name].isRest);
                if (fallbackWorkoutName) {
                    baseWorkout = programData.programStructure[fallbackWorkoutName];
                } else {
                    baseWorkout = { exercises: [], label: 'New Workout', isRest: false };
                }
            }
            const newCustomWorkout = baseWorkout ? JSON.parse(JSON.stringify(baseWorkout)) : { exercises: [], label: `Custom ${dayKey}`, isRest: false };

            onProgramDataChange(p => {
                const newProgramStructure = { ...p.programStructure, [customWorkoutName]: newCustomWorkout };
                const newWorkoutOrder = p.workoutOrder.includes(customWorkoutName) ? p.workoutOrder : [...p.workoutOrder, customWorkoutName];
                const newOverrides = JSON.parse(JSON.stringify(p.weeklyOverrides || {}));
                if (!newOverrides[week]) {
                    newOverrides[week] = {};
                }
                newOverrides[week][dayKey] = customWorkoutName;

                return {
                    ...p,
                    programStructure: newProgramStructure,
                    workoutOrder: newWorkoutOrder,
                    weeklyOverrides: newOverrides,
                };
            });

            openModal(
                <EditDayWorkoutModal
                    workout={newCustomWorkout}
                    workoutName={customWorkoutName}
                    onSave={onSaveFromModal}
                    onClose={closeModal}
                    onEditExercise={handleEditExerciseDetails}
                    onAddExercise={onAddExerciseFromModal}
                    onSetRest={onSetRestFromModal}
                />,
                'lg'
            );
        }
    };

    const handleAddDayToWeek = (week) => {
        onProgramDataChange(p => {
            const weekSchedule = p.weeklyScheduleOverrides?.[week] || [...p.weeklySchedule];
            const newDayName = `Day ${weekSchedule.length + 1}`;

            // Find or create a rest day template
            let restDayName = Object.keys(p.programStructure).find(name => p.programStructure[name]?.isRest);
            if (!restDayName) {
                restDayName = 'Rest Day';
            }

            const newSchedule = [...weekSchedule, { day: newDayName, workout: restDayName, id: generateUUID() }];
            const newOverrides = { ...(p.weeklyScheduleOverrides || {}), [week]: newSchedule };

            return { ...p, weeklyScheduleOverrides: newOverrides };
        });
    };

    const handleRemoveSpecificDay = (week, dayKeyToRemove) => {
        openModal(
            <div>
                <p className="ee-eyebrow text-coral"><XCircle size={12} /> Remove day</p>
                <h2 className="mt-2 font-display text-xl font-bold text-bone">Confirm deletion</h2>
                <p className="mt-3 text-sm leading-6 text-mute">Are you sure you want to remove {dayKeyToRemove} from Week {week}?</p>
                <div className="mt-6 flex justify-end gap-2">
                     <button onClick={closeModal} className="ee-secondary">Cancel</button>
                     <button onClick={() => {
                        onProgramDataChange(p => {
                            const weekSchedule = p.weeklyScheduleOverrides?.[week] || [...p.weeklySchedule];
                            if (weekSchedule.length <= 1) {
                                alert("Cannot remove the last day of the week.");
                                return p;
                            }
                            const newSchedule = weekSchedule.filter(d => d.day !== dayKeyToRemove);
                            const newOverrides = { ...(p.weeklyScheduleOverrides || {}), [week]: newSchedule };
                            return { ...p, weeklyScheduleOverrides: newOverrides };
                        });
                        closeModal();
                     }} className="ee-danger">Delete</button>
                </div>
            </div>
        );
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className={embedded ? '' : 'py-6 md:py-9'}>
                {!embedded && (
                    <ViewHeader
                        icon={Edit}
                        eyebrow="Editor"
                        title="Edit program"
                        description="Tune program info, adjust week-specific overrides, and shape the master workout templates."
                    >
                        <button onClick={handleCreateNewExercise} className="ee-primary">
                            <PlusCircle size={15} /> New exercise
                        </button>
                    </ViewHeader>
                )}
                {embedded && (
                    <div className="mb-5 flex justify-end">
                        <button onClick={handleCreateNewExercise} className="ee-primary">
                            <PlusCircle size={15} /> New exercise
                        </button>
                    </div>
                )}

                <div className="mb-5 grid gap-5 lg:grid-cols-[1fr_260px]">
                    <div className="ee-panel p-5 sm:p-6">
                        <p className="ee-eyebrow text-teal">Program info</p>
                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="ee-label" htmlFor="program-name">Program name</label>
                                <input id="program-name" type="text" value={programData.info.name} onChange={(e) => handleInfoChange('name', e.target.value)} className="ee-input" />
                            </div>
                            <div>
                                <label className="ee-label" htmlFor="program-weeks">Weeks</label>
                                <input id="program-weeks" type="number" value={programData.info.weeks} onChange={(e) => handleInfoChange('weeks', parseInt(e.target.value, 10) || 1)} className="ee-input font-mono tabular-nums" />
                            </div>
                        </div>
                    </div>

                    <div className="ee-panel flex flex-col justify-center gap-2.5 p-5">
                        <button onClick={handleAddWorkoutDay} className="ee-primary w-full">
                            <PlusCircle size={16} /> Add workout day
                        </button>
                        <button onClick={handleAddNewRestDay} className="ee-secondary w-full text-sky">
                            <Shield size={16} /> Add rest day
                        </button>
                        <p className="mt-1 text-center text-[11px] leading-4 text-mute">
                            New templates join the library and the schedule below.
                        </p>
                    </div>
                </div>

                <div className="ee-panel mb-6 overflow-hidden">
                    <button onClick={() => setScheduleOpen(!isScheduleOpen)} className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6" aria-expanded={isScheduleOpen}>
                        <div>
                            <p className="ee-eyebrow text-amber">Week-specific tuning</p>
                            <h3 className="mt-2 font-display text-lg font-bold text-bone">Weekly schedule &amp; overrides</h3>
                            <p className="mt-1 text-xs text-mute">Open only when a specific week needs to deviate from the master plan.</p>
                        </div>
                        <span className={`ee-icon-btn flex-shrink-0 transition-transform duration-200 ${isScheduleOpen ? 'rotate-180' : ''}`}>
                            <ChevronDown size={16} />
                        </span>
                    </button>
                    {isScheduleOpen && (
                        <div className="space-y-3 border-t border-line/60 p-4 animate-fade-in sm:p-5">
                            {Array.from({ length: programData.info.weeks }, (_, i) => i + 1).map(week => (
                                <EditWeekCard
                                    key={week}
                                    week={week}
                                    program={programData}
                                    onEditDay={handleEditDay}
                                    onToggleRest={handleToggleRestDay}
                                    onAddDayToWeek={handleAddDayToWeek}
                                    onRemoveSpecificDay={handleRemoveSpecificDay}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className="mb-4">
                    <p className="ee-eyebrow text-teal">Master templates</p>
                    <h3 className="mt-2 font-display text-lg font-bold text-bone">Workout library</h3>
                    <p className="mt-1 text-xs text-mute">Drag to reorder. Click a name to rename; hover an exercise for edit and remove.</p>
                </div>

                <Droppable droppableId="workout-templates" direction="vertical" type="workoutDay">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                            {programData.workoutOrder.map((workoutName, index) => {
                                const workoutDetails = programData.programStructure[workoutName];
                                if (!workoutDetails) return null;
                                const isRest = workoutDetails.isRest;

                                return (
                                    <Draggable key={workoutName} draggableId={workoutName} index={index}>
                                        {(provided) => (
                                            <div ref={provided.innerRef} {...provided.draggableProps} id={`workout-day-editor-${workoutName}`}>
                                                <div className={`rounded-2xl border p-4 sm:p-5 ${isRest ? 'border-sky/30 bg-sky/[0.05]' : 'border-line bg-panel'}`}>
                                                    <div className="mb-3 flex items-center justify-between gap-3 border-b border-line/60 pb-3">
                                                        <div {...provided.dragHandleProps} className="flex min-w-0 flex-grow cursor-grab items-center gap-2.5">
                                                            <Move size={17} className="flex-shrink-0 text-mute/60" />
                                                            <button onClick={() => startEditingName(workoutName)} className="truncate text-left font-display text-lg font-bold text-bone transition-colors hover:text-amber">
                                                                {workoutName}
                                                            </button>
                                                            {isRest && <span className="ee-chip border-sky/40 text-sky">Rest</span>}
                                                        </div>
                                                        <div className="flex flex-shrink-0 items-center gap-1.5">
                                                            <button onClick={() => handleToggleTemplateType(workoutName)} title={isRest ? 'Change to workout day' : 'Change to rest day'} className="ee-icon-btn" aria-label={isRest ? 'Change to workout day' : 'Change to rest day'}>
                                                                {isRest ? <Dumbbell size={15} className="text-teal" /> : <Shield size={15} className="text-sky" />}
                                                            </button>
                                                            <button onClick={() => handleDeleteWorkoutDay(workoutName)} title="Delete template" className="ee-icon-btn text-coral" aria-label={`Delete ${workoutName}`}>
                                                                <XCircle size={15} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    {!isRest && (
                                                        <>
                                                            <Droppable droppableId={workoutName} type="exercise">
                                                                {(provided) => (
                                                                    <ul {...provided.droppableProps} ref={provided.innerRef} className="mb-3 min-h-[50px] space-y-1.5">
                                                                        {workoutDetails.exercises.map((ex, index) => (
                                                                            <Draggable key={ex.id} draggableId={ex.id} index={index}>
                                                                                {(provided) => (
                                                                                    <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="group flex items-center justify-between rounded-xl border border-line bg-panel2/70 p-3">
                                                                                        <span className="truncate text-sm font-bold text-bone">{ex.name || `Exercise name missing (id: ${ex.id})`}</span>
                                                                                        <div className="flex flex-shrink-0 items-center gap-1 text-mute">
                                                                                            <button onClick={() => handleEditExerciseDetails(ex.name)} className="rounded-lg p-1.5 opacity-0 transition-all hover:bg-line/40 hover:text-bone group-hover:opacity-100" aria-label={`Edit ${ex.name}`}>
                                                                                                <Pencil size={14} />
                                                                                            </button>
                                                                                            <button onClick={() => handleRemoveExerciseFromWorkout(workoutName, index)} className="rounded-lg p-1.5 opacity-0 transition-all hover:bg-coral/15 hover:text-coral group-hover:opacity-100" aria-label={`Remove ${ex.name}`}>
                                                                                                <XCircle size={14} />
                                                                                            </button>
                                                                                        </div>
                                                                                    </li>
                                                                                )}
                                                                            </Draggable>
                                                                        ))}
                                                                        {provided.placeholder}
                                                                    </ul>
                                                                )}
                                                            </Droppable>
                                                            <button onClick={() => handleAddExerciseToWorkout(workoutName)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-well/50 p-2.5 text-sm font-bold text-mute transition-colors hover:border-teal/40 hover:text-teal">
                                                                <PlusCircle size={15} /> Add exercise
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                );
                            })}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </div>
        </DragDropContext>
    );
};
