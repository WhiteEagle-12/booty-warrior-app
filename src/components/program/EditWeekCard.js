import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Edit, Dumbbell, Eye, PlusCircle, Pencil, Shield } from 'lucide-react';
import { getWorkoutForWeek, getWorkoutNameForDay } from '../../utils/workout';

export const EditWeekCard = ({ week, program, onEditDay, onToggleRest, onProgramDataChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    const hasOverrides = program.weeklyOverrides && program.weeklyOverrides[week];
    const overrides = program.weeklyOverrides?.[week] || {};
    
    // Determine the days to show for this week
    const weekSchedule = (() => {
        // Find if this week has a custom length defined in overrides
        const customLength = overrides['_length'];
        const baseSchedule = program.weeklySchedule;
        
        if (customLength !== undefined) {
             // Create a virtual schedule for this week based on requested length
             return Array.from({ length: customLength }, (_, i) => {
                 const baseDay = baseSchedule[i];
                 const dayLabel = i < 7 ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i] : `Day ${i + 1}`;
                 return {
                     day: dayLabel,
                     baseDay: baseDay?.day // Reference to original day if it exists
                 };
             });
        }
        return baseSchedule;
    })();

    const weekLabel = hasOverrides ? `Week ${week} (Customized)` : `Week ${week}`;
    const weekLabelColor = hasOverrides ? "text-blue-500 dark:text-blue-400" : "text-gray-800 dark:text-gray-200";

    const addDayToWeek = () => {
        const currentLength = weekSchedule.length;
        onProgramDataChange(p => {
            const newOverrides = JSON.parse(JSON.stringify(p.weeklyOverrides || {}));
            if (!newOverrides[week]) newOverrides[week] = {};
            newOverrides[week]['_length'] = currentLength + 1;
            
            // Assign a default rest workout for the new day
            const dayLabel = currentLength < 7 ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][currentLength] : `Day ${currentLength + 1}`;
            const restTemplate = Object.keys(p.programStructure).find(name => p.programStructure[name]?.isRest) || 'Rest Day';
            newOverrides[week][dayLabel] = restTemplate;
            
            return { ...p, weeklyOverrides: newOverrides };
        });
    };

    const removeDayFromWeek = () => {
        if (weekSchedule.length <= 1) return;
        const currentLength = weekSchedule.length;
        onProgramDataChange(p => {
            const newOverrides = JSON.parse(JSON.stringify(p.weeklyOverrides || {}));
            if (!newOverrides[week]) newOverrides[week] = {};
            newOverrides[week]['_length'] = currentLength - 1;
            return { ...p, weeklyOverrides: newOverrides };
        });
    };

    return (
        <div className={`bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border-2 transition-all ${hasOverrides ? 'border-blue-500/30' : 'border-transparent'}`}>
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left">
                <div className="flex items-center gap-3">
                    <h4 className={`font-bold text-lg ${weekLabelColor}`}>{weekLabel}</h4>
                    {hasOverrides && <span className="text-[10px] uppercase tracking-wider font-extrabold bg-blue-100 dark:bg-blue-900/50 text-blue-600 px-2 py-0.5 rounded">Custom</span>}
                </div>
                {isOpen ? <ChevronUp /> : <ChevronDown />}
            </button>
            {isOpen && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                        {weekSchedule.map(({ day }) => {
                            const workoutName = getWorkoutNameForDay(program, week, day);
                            const workoutDetails = getWorkoutForWeek(program, week, workoutName);
                            const isRest = !workoutDetails || program.programStructure[workoutName]?.isRest;
                            const displayWorkoutName = isRest ? (program.programStructure[workoutName]?.label || 'Rest') : (workoutDetails.label || workoutName);

                            return (
                                <div key={`${week}-${day}`} className={`p-3 rounded-xl shadow-sm text-center flex flex-col justify-between transition-all group border ${isRest ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-900/30' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-blue-500/50 hover:shadow-md'}`}>
                                    <div className="font-extrabold text-sm mb-1 text-gray-500 uppercase tracking-tighter">{day}</div>
                                    <p className={`text-xs font-bold mb-3 truncate h-8 flex items-center justify-center ${isRest ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-800 dark:text-white'}`}>
                                        {displayWorkoutName}
                                    </p>
                                    <div className="flex flex-col gap-1">
                                        <button
                                            onClick={() => onEditDay(week, day)}
                                            className="flex items-center justify-center gap-1 p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-30"
                                            disabled={isRest}
                                        >
                                            <Pencil size={12} />
                                            <span className="font-bold">Edit</span>
                                        </button>
                                        <button
                                            onClick={() => onToggleRest(week, day)}
                                            className={`flex items-center justify-center gap-1 p-1.5 rounded-lg transition-colors ${isRest ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-100' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100'}`}
                                        >
                                            {isRest ? <PlusCircle size={12} /> : <Shield size={12} />}
                                            <span className="font-bold">{isRest ? 'Add' : 'Rest'}</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-4 flex justify-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button onClick={addDayToWeek} className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl hover:bg-green-200 dark:hover:bg-green-900/50 transition-all font-bold text-sm">
                            <PlusCircle size={16} /> Add Day to Week {week}
                        </button>
                        <button onClick={removeDayFromWeek} disabled={weekSchedule.length <= 1} className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50 transition-all font-bold text-sm disabled:opacity-50">
                            <X size={16} /> Remove Last Day
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