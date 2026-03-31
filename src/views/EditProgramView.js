import React, { useState, useEffect, useMemo, useContext, useCallback, useRef } from 'react';
import { ChevronDown, ChevronUp, Dumbbell, ArrowLeft, PlusCircle, Edit, ArrowUp, ArrowDown, Save, X, Search, Eye, Pencil, Move, XCircle, Shield } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { AppStateContext } from '../contexts/AppStateContext';
import { FirebaseContext } from '../contexts/FirebaseContext';
import { doc, updateDoc } from 'firebase/firestore';
import { generateUUID, getExerciseDetails } from '../utils/helpers';
import { getWorkoutForWeek, getWorkoutNameForDay } from '../utils/workout';
import { exerciseBank } from '../data/exerciseBank';

// Extracted Modals
import { EditDayWorkoutModal } from '../components/modals/EditDayWorkoutModal';
import { EditExerciseModal } from '../components/modals/EditExerciseModal';
import { AddExerciseToWorkoutModal } from '../components/modals/AddExerciseToWorkoutModal';
import { RenameWorkoutModal } from '../components/modals/RenameWorkoutModal';

// Program Components
import { EditWeekCard } from '../components/program/EditWeekCard';


export const EditProgramView = ({ programData, onProgramDataChange, allLogs, setAllLogs, onBack, onNavigate }) => {
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
                    const firebaseUpdates = {};

                    // First, clear all logs in Firebase (by setting them to delete) - actually easier to just overwrite `logs` field entirely.
                    // But to be safe, we'll build the new complete logs object.
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
                            updateDoc(userDocRef, { logs: newLogsState });
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
    
    const scrollToWorkout = (workoutName) => {
        const element = document.getElementById(`workout-day-editor-${workoutName}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.style.transition = 'background-color 0.5s ease-in-out';
            element.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
            setTimeout(() => {
                element.style.backgroundColor = '';
            }, 1500);
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
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Confirm Deletion</h2>
                <p className="text-gray-600 dark:text-gray-400">Are you sure you want to remove {dayKeyToRemove} from Week {week}?</p>
                <div className="flex justify-end gap-2 mt-6">
                     <button onClick={closeModal} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg">Cancel</button>
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
                     }} className="px-4 py-2 bg-red-600 text-white rounded-lg">Delete</button>
                </div>
            </div>
        );
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="p-4 md:p-6 pb-24">
                 <div className="flex justify-between items-center text-center mb-6">
                    <div className="flex items-center gap-3">
                        <Edit className="text-blue-500 dark:text-blue-400" size={32} />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Program</h1>
                        </div>
                    </div>
                    <button onClick={handleCreateNewExercise} className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                        <PlusCircle size={16} /> Add Exercise
                    </button>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-6 items-start">
                    <div className="flex-grow w-full space-y-4">
                        {/* Program Details Editor */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Program Info</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Program Name</label>
                                    <input type="text" value={programData.info.name} onChange={(e) => handleInfoChange('name', e.target.value)} className="w-full p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md border-gray-300 dark:border-gray-600" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Weeks</label>
                                    <input type="number" value={programData.info.weeks} onChange={(e) => handleInfoChange('weeks', parseInt(e.target.value, 10) || 1)} className="w-full p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md border-gray-300 dark:border-gray-600" />
                                </div>
                            </div>
                        </div>

                        {/* Removed Schedule Length Section per requested */}
                    </div>

                    {/* Quick Add Buttons Bar */}
                    <div className="w-full md:w-64 flex flex-col gap-3">
                        <button onClick={handleAddWorkoutDay} className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-green-600 text-white shadow-lg hover:bg-green-700 transition-all font-bold">
                            <PlusCircle size={20}/> Add Workout Day
                        </button>
                        <button onClick={handleAddNewRestDay} className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-all font-bold">
                            <Shield size={20}/> Add Rest Day
                        </button>
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center px-2">
                            Quickly add new workout templates or rest days to your library.
                        </p>
                    </div>
                </div>

                {/* Weekly Schedule Editor - Collapsible */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
                    <button onClick={() => setScheduleOpen(!isScheduleOpen)} className="w-full flex justify-between items-center text-left">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Weekly Schedule & Overrides</h3>
                        {isScheduleOpen ? <ChevronUp className="text-gray-600 dark:text-gray-300" /> : <ChevronDown className="text-gray-600 dark:text-gray-300" />}
                    </button>
                    {isScheduleOpen && (
                        <div className="mt-4 space-y-3">
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

                {/* Workout Day List */}
                 <h3 className="text-lg font-semibold text-gray-900 dark:text-white my-3">Master Workout Templates</h3>
                 <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Drag to reorder templates. Exercises can be dragged within or between workouts.</p>
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
                                                <div className={`rounded-xl shadow-md p-4 ${isRest ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'bg-white dark:bg-gray-800'}`}>
                                                    <div className="flex justify-between items-center mb-3 border-b border-gray-200 dark:border-gray-700 pb-3">
                                                        <div {...provided.dragHandleProps} className="flex items-center gap-2 cursor-grab flex-grow">
                                                            <Move size={20} className="text-gray-400" />
                                                            <button onClick={() => startEditingName(workoutName)} className="text-xl font-bold text-gray-800 dark:text-gray-200 text-left hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                                                                {workoutName}
                                                            </button>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => handleToggleTemplateType(workoutName)} title={isRest ? "Change to Workout Day" : "Change to Rest Day"} className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                                                {isRest ? <Dumbbell size={18} className="text-green-600 dark:text-green-400" /> : <Shield size={18} className="text-indigo-600 dark:text-indigo-400" />}
                                                            </button>
                                                            <button onClick={() => handleDeleteWorkoutDay(workoutName)} title="Delete Day Template" className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"><XCircle size={18} className="text-red-500"/></button>
                                                        </div>
                                                    </div>
                                                    {!isRest && (
                                                        <>
                                                            <Droppable droppableId={workoutName} type="exercise">
                                                                {(provided) => (
                                                                    <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-2 mb-3 min-h-[50px]">
                                                                        {workoutDetails.exercises.map((ex, index) => (
                                                                            <Draggable key={ex.id} draggableId={ex.id} index={index}>
                                                                                {(provided) => (
                                                                                    <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md group">
                                                                                        <span className="font-medium text-gray-900 dark:text-white">{ex.name || `Exercise name missing (id: ${ex.id})`}</span>
                                                                                        <div className="flex items-center gap-1 text-gray-500">
                                                                                            <button onClick={() => handleEditExerciseDetails(ex.name)} className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Pencil size={16}/></button>
                                                                                            <button onClick={() => handleRemoveExerciseFromWorkout(workoutName, index)} className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"><XCircle size={16}/></button>
                                                                                        </div>
                                                                                    </li>
                                                                                )}
                                                                            </Draggable>
                                                                        ))}
                                                                        {provided.placeholder}
                                                                    </ul>
                                                                )}
                                                            </Droppable>
                                                            <button onClick={() => handleAddExerciseToWorkout(workoutName)} className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/50">
                                                                <PlusCircle size={16}/> Add Exercise
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