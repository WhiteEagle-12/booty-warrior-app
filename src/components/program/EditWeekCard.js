import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Edit, Dumbbell, Eye, PlusCircle, Pencil, Shield } from 'lucide-react';
import { getWorkoutForWeek, getWorkoutNameForDay } from '../../utils/workout';

export const EditWeekCard = ({ week, program, onEditDay, onToggleRest }) => {
    const [isOpen, setIsOpen] = useState(false);

    const hasOverrides = program.weeklyOverrides && program.weeklyOverrides[week];
    const weekLabel = hasOverrides ? `Week ${week} (Customized)` : `Week ${week}`;
    const weekLabelColor = hasOverrides ? "text-blue-500 dark:text-blue-400" : "text-gray-800 dark:text-gray-200";

    return (
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left">
                <h4 className={`font-bold text-md ${weekLabelColor}`}>{weekLabel}</h4>
                {isOpen ? <ChevronUp /> : <ChevronDown />}
            </button>
            {isOpen && (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mt-3">
                    {program.weeklySchedule.map(({ day }) => {
                        const workoutName = getWorkoutNameForDay(program, week, day);
                        const workoutDetails = getWorkoutForWeek(program, week, workoutName);
                        const isRest = !workoutDetails;
                        const displayWorkoutName = isRest ? (program.programStructure[workoutName]?.label || 'Rest') : (workoutDetails.label || workoutName);

                        return (
                            <div key={`${week}-${day}`} className="bg-white dark:bg-gray-700 p-2 rounded-lg text-center flex flex-col justify-between">
                                <div className="font-bold text-sm mb-1">{day}</div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 truncate h-8 flex-grow flex items-center justify-center">
                                    {displayWorkoutName}
                                </p>
                                <div className="flex items-center justify-center gap-1 mt-1 text-xs">
                                    <button
                                        onClick={() => onEditDay(week, day)}
                                        className="flex items-center gap-1 p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                                        disabled={isRest}
                                    >
                                        <Pencil size={14} className={isRest ? "text-gray-400" : "text-blue-600 dark:text-blue-400"} />
                                        <span className={isRest ? "text-gray-400" : "text-gray-700 dark:text-gray-300"}>Edit</span>
                                    </button>
                                    <button
                                        onClick={() => onToggleRest(week, day)}
                                        className="flex items-center gap-1 p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                                    >
                                        {isRest ? (
                                            <>
                                                <Dumbbell size={14} className="text-green-600 dark:text-green-400" />
                                                <span className="text-gray-700 dark:text-gray-300">Workout</span>
                                            </>
                                        ) : (
                                            <>
                                                <Shield size={14} className="text-indigo-600 dark:text-indigo-400" />
                                                <span className="text-gray-700 dark:text-gray-300">Rest</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};


export const MasterScheduleEditor = ({ program, onProgramDataChange }) => {
    const [editingDay, setEditingDay] = useState(null);

    const handleScheduleChange = (day, newWorkout) => {
        const newSchedule = program.weeklySchedule.map(d => {
            if (d.day === day) {
                return { ...d, workout: newWorkout };
            }
            return d;
        });
        onProgramDataChange({ ...program, weeklySchedule: newSchedule });
        setEditingDay(null);
    };

    const availableWorkouts = [...program.workoutOrder];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Master Weekly Schedule</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Set the default workout for each day of the week.</p>
            <div className="space-y-2">
                {program.weeklySchedule.map(({ day, workout }) => (
                    <div key={day} className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                            <span className="font-bold">{day}</span>
                            <span className="truncate pr-2">{program.programStructure[workout]?.label || workout}</span>
                            <button onClick={() => setEditingDay(editingDay === day ? null : day)} className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex-shrink-0">
                                {editingDay === day ? 'Cancel' : 'Change'}
                            </button>
                        </div>
                        {editingDay === day && (
                            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {availableWorkouts.map(woName => (
                                    <button
                                        key={woName}
                                        onClick={() => handleScheduleChange(day, woName)}
                                        className={`p-2 text-sm rounded-md ${woName === workout ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                    >
                                        {program.programStructure[woName]?.label || woName}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};