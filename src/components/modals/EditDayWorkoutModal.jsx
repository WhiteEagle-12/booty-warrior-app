import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Move, Pencil, XCircle, PlusCircle, Shield } from 'lucide-react';
import { generateUUID } from '../../utils/helpers';

export const EditDayWorkoutModal = ({
    workout,
    workoutName,
    onSave,
    onClose,
    onEditExercise,
    onAddExercise,
    onSetRest,
}) => {
    const [editedWorkout, setEditedWorkout] = useState(workout);

    useEffect(() => {
        setEditedWorkout(workout);
    }, [workout]);

    const handleRemoveExercise = (exerciseIndex) => {
        const newExercises = [...editedWorkout.exercises];
        newExercises.splice(exerciseIndex, 1);
        setEditedWorkout({ ...editedWorkout, exercises: newExercises });
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;
        const newExercises = Array.from(editedWorkout.exercises);
        const [reorderedItem] = newExercises.splice(result.source.index, 1);
        newExercises.splice(result.destination.index, 0, reorderedItem);
        setEditedWorkout({ ...editedWorkout, exercises: newExercises });
    };

    const handleAddExerciseCallback = (exerciseName, exerciseDetails) => {
        const newExercises = [...editedWorkout.exercises, { id: generateUUID(), name: exerciseName }];
        setEditedWorkout({ ...editedWorkout, exercises: newExercises });
        // The parent component will handle adding the details to the master list if needed
        // This is passed to onAddExercise which should handle the modal logic
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div>
                <p className="ee-eyebrow text-amber"><Pencil size={12} /> Day editor</p>
                <h2 className="mt-2 font-display text-xl font-bold text-bone">{workoutName}</h2>
                <p className="mt-1.5 text-sm text-mute">Drag to reorder, or use the buttons to edit and remove exercises.</p>

                <Droppable droppableId="day-workout-exercises">
                    {(provided) => (
                        <ul {...provided.droppableProps} ref={provided.innerRef} className="mb-3 mt-5 max-h-72 min-h-[60px] space-y-1.5 overflow-y-auto pr-1">
                            {editedWorkout.exercises.map((ex, index) => (
                                <Draggable key={ex.id} draggableId={ex.id} index={index}>
                                    {(provided) => (
                                        <li
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className="group flex items-center justify-between rounded-xl border border-line bg-panel2/70 p-2.5"
                                        >
                                            <div className="flex min-w-0 items-center gap-2.5">
                                                <Move size={15} className="flex-shrink-0 cursor-grab text-mute/60" />
                                                <span className="truncate text-sm font-bold text-bone">{ex.name}</span>
                                            </div>
                                            <div className="flex flex-shrink-0 items-center gap-1 text-mute">
                                                <button onClick={() => onEditExercise(ex.name)} className="rounded-lg p-1.5 transition-colors hover:bg-line/40 hover:text-bone" aria-label={`Edit ${ex.name}`}>
                                                    <Pencil size={14} />
                                                </button>
                                                <button onClick={() => handleRemoveExercise(index)} className="rounded-lg p-1.5 transition-colors hover:bg-coral/15 hover:text-coral" aria-label={`Remove ${ex.name}`}>
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

                <button
                    onClick={() => onAddExercise(handleAddExerciseCallback)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-teal/40 bg-teal/[0.06] p-2.5 text-sm font-bold text-teal transition-colors hover:bg-teal/15"
                >
                    <PlusCircle size={15} /> Add exercise
                </button>

                <div className="mt-6 flex items-center justify-between gap-2">
                    <button onClick={onSetRest} className="ee-secondary text-sky">
                        <Shield size={14} /> Mark as rest
                    </button>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="ee-secondary">Cancel</button>
                        <button onClick={() => onSave(workoutName, editedWorkout)} className="ee-primary">Save changes</button>
                    </div>
                </div>
            </div>
        </DragDropContext>
    );
};
