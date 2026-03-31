import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Edit, Dumbbell, Eye, PlusCircle, Pencil, Shield } from 'lucide-react';
import { getWorkoutForWeek, getWorkoutNameForDay } from '../../utils/workout';

export const EditWeekCard = ({ week, program, onEditDay, onToggleRest, onAddDayToWeek, onRemoveDayFromWeek }) => {
    const [isOpen, setIsOpen] = useState(false);

    const weekOverride = program.weeklyOverrides?.[week];
    const hasOverrides = !!weekOverride;
    const weekSchedule = weekOverride?.schedule || program.weeklySchedule;
    
    const weekLabel = hasOverrides ? `Week ${week} (Customized)` : `Week ${week}`;
    const weekLabelColor = hasOverrides ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-white";

    const gridColsMap = {
        1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4',
        5: 'lg:grid-cols-5', 6: 'lg:grid-cols-6', 7: 'lg:grid-cols-7', 8: 'lg:grid-cols-8',
    };
    const gridColsClass = gridColsMap[weekSchedule.length] || 'lg:grid-cols-7';

    return (
        <div className="bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center gap-2">
                    <h4 className={`font-bold text-lg ${weekLabelColor}`}>{weekLabel}</h4>
                    {hasOverrides && <div className="text-[10px] px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded uppercase font-bold tracking-wider border border-blue-200 dark:border-blue-800">Custom</div>}
                </div>
                <div className="flex items-center gap-3">
                     <span className="text-xs text-gray-500 dark:text-gray-400">{weekSchedule.length} days</span>
                     {isOpen ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                </div>
            </button>
            {isOpen && (
                <div className="p-4 pt-0">
                    <div className={`grid grid-cols-2 sm:grid-cols-4 ${gridColsClass} gap-2 mt-2 mb-4`}>
                        {weekSchedule.map((dayItem) => {
                            const { day, id } = dayItem;
                            const effectiveDayKey = id || day;
                            const workoutName = getWorkoutNameForDay(program, week, effectiveDayKey);
                            const workoutDetails = getWorkoutForWeek(program, week, workoutName);
                            const isRest = !workoutDetails;
                            const displayWorkoutName = isRest ? (program.programStructure[workoutName]?.label || 'Rest') : (workoutDetails.label || workoutName);

                            return (
                                <div key={effectiveDayKey} className="bg-white dark:bg-gray-700/60 border border-gray-100 dark:border-gray-600 p-2.5 rounded-xl text-center flex flex-col justify-between shadow-sm group">
                                    <div className="font-bold text-xs mb-1 text-gray-500 dark:text-gray-400 uppercase tracking-tighter">{day}</div>
                                    <p className="text-sm font-bold text-gray-800 dark:text-white mb-2 truncate h-8 flex-grow flex items-center justify-center">
                                        {displayWorkoutName}
                                    </p>
                                    <div className="flex flex-col gap-1 mt-1">
                                        <button
                                            onClick={() => onEditDay(week, effectiveDayKey)}
                                            className="flex items-center justify-center gap-1.5 p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/40 disabled:opacity-50 transition-colors"
                                            disabled={isRest}
                                        >
                                            <Pencil size={12} />
                                            <span className="text-[10px] font-bold uppercase tracking-wide">Edit</span>
                                        </button>
                                        <button
                                            onClick={() => onToggleRest(week, effectiveDayKey)}
                                            className={`flex items-center justify-center gap-1.5 p-1.5 rounded-lg transition-colors ${isRest ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-800/40' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-800/40'}`}
                                        >
                                            {isRest ? (
                                                <>
                                                    <Dumbbell size={12} />
                                                    <span className="text-[10px] font-bold uppercase tracking-wide">Add Workout</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Shield size={12} />
                                                    <span className="text-[10px] font-bold uppercase tracking-wide">Set Rest</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex gap-2 border-t border-gray-100 dark:border-gray-700 pt-3">
                        <button 
                            onClick={() => onAddDayToWeek(week)}
                            className="flex-grow flex items-center justify-center gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-800/30 transition-colors text-xs font-bold uppercase tracking-wide border border-green-100 dark:border-green-800/30"
                        >
                            <PlusCircle size={14} /> Add Day
                        </button>
                        <button 
                             onClick={() => onRemoveDayFromWeek(week)}
                             disabled={weekSchedule.length <= 1}
                             className="flex-grow flex items-center justify-center gap-2 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-800/30 transition-colors text-xs font-bold uppercase tracking-wide border border-red-100 dark:border-red-800/30 disabled:opacity-50"
                        >
                            <XCircle size={14} /> Remove Day
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