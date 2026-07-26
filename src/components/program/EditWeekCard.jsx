import React, { useState } from 'react';
import { ChevronDown, Dumbbell, PlusCircle, Pencil, Shield, XCircle, Sparkles } from 'lucide-react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { getWorkoutForWeek, getWorkoutNameForDay } from '../../utils/workout';

export const EditWeekCard = ({ week, program, onEditDay, onToggleRest, onAddDayToWeek, onRemoveSpecificDay }) => {
    const [isOpen, setIsOpen] = useState(false);

    const hasOverrides = program.weeklyOverrides && program.weeklyOverrides[week];
    const overrideCount = hasOverrides ? Object.keys(program.weeklyOverrides[week]).length : 0;

    // Get the effective schedule for this week (master + overrides)
    const weekSchedule = program.weeklyScheduleOverrides?.[week] || program.weeklySchedule;

    return (
        <div className={`rounded-2xl border transition-colors ${
            hasOverrides
                ? 'border-teal/30 bg-teal/[0.05]'
                : 'border-line bg-panel2/50'
        }`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between p-4 text-left"
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl font-display text-xs font-bold ${
                        hasOverrides
                            ? 'bg-teal/15 text-teal'
                            : 'bg-well text-bone'
                    }`}>
                        W{week}
                    </div>
                    <div>
                        <h4 className="font-display text-sm font-bold text-bone">Week {week}</h4>
                        <p className="mt-0.5 text-xs text-mute">
                            {weekSchedule.length} days
                            {hasOverrides && (
                                <span className="ml-2 inline-flex items-center gap-1 font-bold text-teal">
                                    <Sparkles size={10} />
                                    {overrideCount} override{overrideCount !== 1 ? 's' : ''}
                                </span>
                            )}
                        </p>
                    </div>
                </div>
                <span className={`ee-icon-btn transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown size={15} />
                </span>
            </button>
            {isOpen && (
                <div className="space-y-3 px-4 pb-4 animate-fade-in">
                    <Droppable droppableId={`week-droppable-${week}`} direction="horizontal" type="weeklyDay">
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7"
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
                                                    className={`relative flex flex-col justify-between rounded-xl border p-3 text-center transition-colors ${
                                                        isRest
                                                            ? 'border-sky/30 bg-sky/[0.06]'
                                                            : hasOverrideForDay
                                                                ? 'border-teal/30 bg-teal/[0.07]'
                                                                : 'border-line bg-well/50'
                                                    }`}
                                                >
                                                    <button
                                                        onClick={() => onRemoveSpecificDay(week, day)}
                                                        className="absolute -right-1.5 -top-1.5 z-10 rounded-full border border-coral/40 bg-panel p-0.5 text-coral shadow-sm transition-colors hover:bg-coral/15"
                                                        title="Remove this day"
                                                        aria-label={`Remove ${day}`}
                                                    >
                                                        <XCircle size={13} />
                                                    </button>
                                                    <div>
                                                        <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-mute">{day}</div>
                                                        <div className={`mb-2 flex h-8 items-center justify-center truncate text-xs font-bold ${
                                                            isRest ? 'text-sky' : 'text-bone'
                                                        }`}>
                                                            {displayWorkoutName}
                                                        </div>
                                                    </div>
                                                    <div className="mt-1 flex items-center justify-center gap-1">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); onEditDay(week, day); }}
                                                            className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-bold transition-colors ${
                                                                isRest
                                                                    ? 'cursor-not-allowed text-mute/50'
                                                                    : 'text-teal hover:bg-teal/10'
                                                            }`}
                                                            disabled={isRest}
                                                        >
                                                            <Pencil size={11} />
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); onToggleRest(week, day); }}
                                                            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-bold transition-colors hover:bg-line/40"
                                                        >
                                                            {isRest ? (
                                                                <>
                                                                    <Dumbbell size={11} className="text-teal" />
                                                                    <span className="text-teal">Set</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Shield size={11} className="text-sky" />
                                                                    <span className="text-sky">Rest</span>
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
                    <div className="flex gap-2 pt-1">
                        <button
                            onClick={() => onAddDayToWeek(week)}
                            className="ee-secondary flex-1 py-2 text-xs"
                        >
                            <PlusCircle size={13} /> Add day
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
        <div className="ee-panel mb-6 p-5">
            <h3 className="mb-1 font-display text-lg font-bold text-bone">Master weekly schedule</h3>
            <p className="mb-4 text-sm text-mute">Set the default workout for each day of the week.</p>
            <div className="space-y-2">
                {program.weeklySchedule.map(({ day, workout }) => (
                    <div key={day} className="ee-panel-soft p-3">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-bold text-bone">{day}</span>
                            <span className="truncate pr-2 text-sm text-mute">{program.programStructure[workout]?.label || workout}</span>
                            <button onClick={() => setEditingDay(editingDay === day ? null : day)} className="flex-shrink-0 text-xs font-bold text-teal hover:underline">
                                {editingDay === day ? 'Cancel' : 'Change'}
                            </button>
                        </div>
                        {editingDay === day && (
                            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                                {availableWorkouts.map(woName => (
                                    <button
                                        key={woName}
                                        onClick={() => handleScheduleChange(day, woName)}
                                        className={`rounded-lg p-2 text-xs font-bold transition-colors ${woName === workout ? 'bg-amber text-base' : 'bg-well text-bone hover:bg-line/40'}`}
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
