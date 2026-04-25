import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Dumbbell, PlusCircle, Pencil, Shield, XCircle, Sparkles } from 'lucide-react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { getWorkoutForWeek, getWorkoutNameForDay } from '../../utils/workout';

export const EditWeekCard = ({ week, program, onEditDay, onToggleRest, onAddDayToWeek, onRemoveSpecificDay }) => {
    const [isOpen, setIsOpen] = useState(false);

    const hasOverrides = program.weeklyOverrides && program.weeklyOverrides[week];
    const overrideCount = hasOverrides ? Object.keys(program.weeklyOverrides[week]).length : 0;

    // Get the effective schedule for this week (master + overrides)
    const weekSchedule = program.weeklyScheduleOverrides?.[week] || program.weeklySchedule;

    return (
        <div className={`rounded-xl border transition-all duration-200 ${
            hasOverrides 
                ? 'border-[#4dd6c6]/35 bg-[#4dd6c6]/10'
                : 'border-white/10 bg-white/[0.045]'
        }`}>
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="w-full flex justify-between items-center text-left p-4"
            >
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                        hasOverrides 
                            ? 'bg-[#4dd6c6]/15 text-[#4dd6c6]'
                            : 'bg-white/10 text-[#efe7d5]'
                    }`}>
                        W{week}
                    </div>
                    <div>
                        <h4 className="font-bold text-base text-[#efe7d5]">
                            Week {week}
                        </h4>
                        <p className="text-xs text-[#9ca89d]">
                            {weekSchedule.length} days
                            {hasOverrides && (
                                <span className="ml-2 inline-flex items-center gap-1 text-[#4dd6c6]">
                                    <Sparkles size={10} />
                                    {overrideCount} override{overrideCount !== 1 ? 's' : ''}
                                </span>
                            )}
                        </p>
                    </div>
                </div>
                <div className={`p-1.5 rounded-full transition-colors ${
                    isOpen ? 'bg-white/10' : 'bg-transparent'
                }`}>
                    {isOpen 
                        ? <ChevronUp size={18} className="text-[#9ca89d]" />
                        : <ChevronDown size={18} className="text-[#9ca89d]" />
                    }
                </div>
            </button>
            {isOpen && (
                <div className="px-4 pb-4 space-y-3">
                    <Droppable droppableId={`week-droppable-${week}`} direction="horizontal" type="weeklyDay">
                        {(provided) => (
                            <div 
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2"
                            >
                                {weekSchedule.map(({ day, id }, index) => {
                                    const workoutName = getWorkoutNameForDay(program, week, day);
                                    const workoutDetails = getWorkoutForWeek(program, week, workoutName);
                                    const isRest = !workoutDetails;
                                    const displayWorkoutName = isRest 
                                        ? (program.programStructure[workoutName]?.label || 'Rest') 
                                        : (workoutDetails.label || workoutName);

                                    const hasOverrideForDay = program.weeklyOverrides?.[week]?.[day];

                                    return (
                                        <Draggable key={id || day} draggableId={id || day} index={index}>
                                            {(provided) => (
                                                <div 
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className={`relative rounded-xl p-3 text-center flex flex-col justify-between transition-all duration-200 border ${
                                                        isRest 
                                                            ? 'bg-[#5b83c4]/10 border-[#5b83c4]/35'
                                                            : hasOverrideForDay
                                                                ? 'bg-[#4dd6c6]/10 border-[#4dd6c6]/35'
                                                                : 'bg-white/[0.045] border-white/10'
                                                    }`}
                                                >
                                                    <button 
                                                        onClick={() => onRemoveSpecificDay(week, day)} 
                                                        className="absolute -top-2 -right-2 bg-[#101820] border border-[#f36f52]/50 text-[#f36f52] rounded-full p-0.5 hover:bg-[#f36f52]/10 shadow-sm z-10"
                                                        title="Remove this day"
                                                    >
                                                        <XCircle size={16} />
                                                    </button>
                                                    <div>
                                                        <div className="font-bold text-xs text-[#9ca89d] uppercase tracking-wider mb-1">{day}</div>
                                                        <div className={`text-xs mb-2 truncate h-8 flex items-center justify-center font-medium ${
                                                            isRest 
                                                                ? 'text-[#5b83c4]'
                                                                : 'text-[#efe7d5]'
                                                        }`}>
                                                            {displayWorkoutName}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-center gap-1 mt-1">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); onEditDay(week, day); }}
                                                            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                                                isRest 
                                                                    ? 'text-[#6f786f] cursor-not-allowed'
                                                                    : 'text-[#4dd6c6] hover:bg-[#4dd6c6]/10'
                                                            }`}
                                                            disabled={isRest}
                                                        >
                                                            <Pencil size={12} />
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); onToggleRest(week, day); }}
                                                            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-white/10"
                                                        >
                                                            {isRest ? (
                                                                <>
                                                                    <Dumbbell size={12} className="text-[#4dd6c6]" />
                                                                    <span className="text-[#4dd6c6]">Set</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Shield size={12} className="text-[#5b83c4]" />
                                                                    <span className="text-[#5b83c4]">Rest</span>
                                                                </>
                                                            )}
                                                        </button>
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
                    {/* Add/Remove day controls for this specific week */}
                    <div className="flex gap-2 pt-1">
                        <button 
                            onClick={() => onAddDayToWeek(week)} 
                            className="ee-secondary flex-1 p-2 text-xs"
                        >
                            <PlusCircle size={14}/> Add Day
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
        <div className="ee-panel rounded-xl p-4 mb-6">
            <h3 className="text-lg font-black text-[#efe7d5] mb-3">Master Weekly Schedule</h3>
            <p className="text-sm text-[#9ca89d] mb-4">Set the default workout for each day of the week.</p>
            <div className="space-y-2">
                {program.weeklySchedule.map(({ day, workout }) => (
                    <div key={day} className="ee-panel-soft p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-[#efe7d5]">{day}</span>
                            <span className="truncate pr-2 text-[#9ca89d]">{program.programStructure[workout]?.label || workout}</span>
                            <button onClick={() => setEditingDay(editingDay === day ? null : day)} className="text-sm text-[#4dd6c6] hover:underline flex-shrink-0">
                                {editingDay === day ? 'Cancel' : 'Change'}
                            </button>
                        </div>
                        {editingDay === day && (
                            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {availableWorkouts.map(woName => (
                                    <button
                                        key={woName}
                                        onClick={() => handleScheduleChange(day, woName)}
                                        className={`p-2 text-sm rounded-md ${woName === workout ? 'bg-[#f3b548] text-[#15100a] font-bold' : 'bg-white/5 text-[#efe7d5] hover:bg-white/10'}`}
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
