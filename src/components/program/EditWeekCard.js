import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Edit, Dumbbell, Eye, PlusCircle, Pencil, Shield, XCircle, Calendar, Sparkles } from 'lucide-react';
import { getWorkoutForWeek, getWorkoutNameForDay } from '../../utils/workout';

export const EditWeekCard = ({ week, program, onEditDay, onToggleRest, onAddDayToWeek, onRemoveDayFromWeek }) => {
    const [isOpen, setIsOpen] = useState(false);

    const hasOverrides = program.weeklyOverrides && program.weeklyOverrides[week];
    const overrideCount = hasOverrides ? Object.keys(program.weeklyOverrides[week]).length : 0;

    // Get the effective schedule for this week (master + overrides)
    const weekSchedule = program.weeklyScheduleOverrides?.[week] || program.weeklySchedule;

    return (
        <div className={`rounded-xl border transition-all duration-200 ${
            hasOverrides 
                ? 'border-blue-300 dark:border-blue-600 bg-blue-50/50 dark:bg-blue-950/20' 
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50'
        }`}>
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="w-full flex justify-between items-center text-left p-4"
            >
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                        hasOverrides 
                            ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}>
                        W{week}
                    </div>
                    <div>
                        <h4 className="font-bold text-base text-gray-900 dark:text-white">
                            Week {week}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {weekSchedule.length} days
                            {hasOverrides && (
                                <span className="ml-2 inline-flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                    <Sparkles size={10} />
                                    {overrideCount} override{overrideCount !== 1 ? 's' : ''}
                                </span>
                            )}
                        </p>
                    </div>
                </div>
                <div className={`p-1.5 rounded-full transition-colors ${
                    isOpen ? 'bg-gray-200 dark:bg-gray-600' : 'bg-transparent'
                }`}>
                    {isOpen 
                        ? <ChevronUp size={18} className="text-gray-600 dark:text-gray-300" /> 
                        : <ChevronDown size={18} className="text-gray-600 dark:text-gray-300" />
                    }
                </div>
            </button>
            {isOpen && (
                <div className="px-4 pb-4 space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2">
                        {weekSchedule.map(({ day }) => {
                            const workoutName = getWorkoutNameForDay(program, week, day);
                            const workoutDetails = getWorkoutForWeek(program, week, workoutName);
                            const isRest = !workoutDetails;
                            const displayWorkoutName = isRest 
                                ? (program.programStructure[workoutName]?.label || 'Rest') 
                                : (workoutDetails.label || workoutName);

                            // Check if this specific day has an override
                            const hasOverrideForDay = program.weeklyOverrides?.[week]?.[day];

                            return (
                                <div 
                                    key={`${week}-${day}`} 
                                    className={`rounded-xl p-3 text-center flex flex-col justify-between transition-all duration-200 border ${
                                        isRest 
                                            ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800' 
                                            : hasOverrideForDay
                                                ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-700'
                                                : 'bg-white dark:bg-gray-700/80 border-gray-200 dark:border-gray-600'
                                    }`}
                                >
                                    <div>
                                        <div className="font-bold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{day}</div>
                                        <div className={`text-xs mb-2 truncate h-8 flex items-center justify-center font-medium ${
                                            isRest 
                                                ? 'text-indigo-600 dark:text-indigo-300' 
                                                : 'text-gray-800 dark:text-gray-200'
                                        }`}>
                                            {displayWorkoutName}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-center gap-1 mt-1">
                                        <button
                                            onClick={() => onEditDay(week, day)}
                                            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                                isRest 
                                                    ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                                                    : 'text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40'
                                            }`}
                                            disabled={isRest}
                                        >
                                            <Pencil size={12} />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => onToggleRest(week, day)}
                                            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-600/50"
                                        >
                                            {isRest ? (
                                                <>
                                                    <Dumbbell size={12} className="text-green-600 dark:text-green-400" />
                                                    <span className="text-green-700 dark:text-green-300">Set</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Shield size={12} className="text-indigo-600 dark:text-indigo-400" />
                                                    <span className="text-indigo-700 dark:text-indigo-300">Rest</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {/* Add/Remove day controls for this specific week */}
                    <div className="flex gap-2 pt-1">
                        <button 
                            onClick={() => onAddDayToWeek(week)} 
                            className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-semibold bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                        >
                            <PlusCircle size={14}/> Add Day
                        </button>
                        <button 
                            onClick={() => onRemoveDayFromWeek(week)} 
                            disabled={weekSchedule.length <= 1} 
                            className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-semibold bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <XCircle size={14}/> Remove Last Day
                        </button>
                    </div>
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
                            <span className="font-bold text-gray-900 dark:text-white">{day}</span>
                            <span className="truncate pr-2 text-gray-700 dark:text-gray-300">{program.programStructure[workout]?.label || workout}</span>
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
                                        className={`p-2 text-sm rounded-md ${woName === workout ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
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