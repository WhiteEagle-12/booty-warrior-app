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
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Edit Day: {workoutName}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Drag to reorder, or use the buttons to edit or remove exercises.</p>
                <Droppable droppableId="day-workout-exercises">
                    {(provided) => (
                        <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-2 mb-3 min-h-[50px] max-h-60 overflow-y-auto pr-2">
                            {editedWorkout.exercises.map((ex, index) => (
                                <Draggable key={ex.id} draggableId={ex.id} index={index}>
                                    {(provided) => (
                                        <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md group">
                                            <div className="flex items-center gap-2">
                                                <Move size={16} className="text-gray-400" />
                                                <span className="font-medium text-gray-900 dark:text-white">{ex.name}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-gray-500">
                                                <button onClick={() => onEditExercise(ex.name)} className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Pencil size={16}/></button>
                                                <button onClick={() => handleRemoveExercise(index)} className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"><XCircle size={16}/></button>
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
                    className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/50"
                >
                    <PlusCircle size={16}/> Add Exercise
                </button>
                <div className="flex justify-between items-center mt-6">
                    <button onClick={onSetRest} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                        <Shield size={16} /> Mark as Rest
                    </button>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg">Cancel</button>
                        <button onClick={() => onSave(workoutName, editedWorkout)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save Changes</button>
                    </div>
                </div>
            </div>
        </DragDropContext>
    );
};