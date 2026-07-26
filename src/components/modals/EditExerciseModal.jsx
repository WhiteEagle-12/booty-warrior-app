import React, { useState, useEffect } from 'react';
import { Trash2, Dumbbell, Target } from 'lucide-react';
import { normalizeExerciseDetails } from '../../utils/helpers';

const Field = ({ label, children }) => (
    <div>
        <label className="ee-label">{label}</label>
        {children}
    </div>
);

export const EditExerciseModal = ({ exercise, exerciseName, onSave, onClose, onDelete, isNew }) => {
    const getInitialState = () => {
        if (isNew) {
            return {
                name: '',
                sets: '',
                reps: '',
                rir: [],
                rest: '',
                lastSetTechnique: '',
                equipment: 'barbell',
                muscles: {
                    primary: '',
                    secondary: '',
                    tertiary: '',
                    primaryContribution: 1,
                    secondaryContribution: 0.5,
                    tertiaryContribution: 0.5,
                }
            };
        }
        const normalizedExercise = normalizeExerciseDetails(exercise);
        return {
            name: exerciseName || '',
            sets: normalizedExercise?.sets || 3,
            reps: normalizedExercise?.reps || '8-12',
            rir: Array.isArray(normalizedExercise?.rir) ? normalizedExercise.rir : Array(normalizedExercise?.sets || 3).fill('1-2'),
            rest: normalizedExercise?.rest || '2-3 min',
            lastSetTechnique: normalizedExercise?.lastSetTechnique || '',
            equipment: normalizedExercise?.equipment || 'barbell',
            muscles: {
                primary: normalizedExercise?.muscles?.primary || '',
                secondary: normalizedExercise?.muscles?.secondary || '',
                tertiary: normalizedExercise?.muscles?.tertiary || '',
                primaryContribution: normalizedExercise?.muscles?.primaryContribution ?? 1,
                secondaryContribution: normalizedExercise?.muscles?.secondaryContribution ?? 0.5,
                tertiaryContribution: normalizedExercise?.muscles?.tertiaryContribution ?? 0.5,
            }
        };
    };

    const [details, setDetails] = useState(getInitialState);

    useEffect(() => {
        const numSets = parseInt(details.sets, 10) || 0;
        if (details.rir.length !== numSets) {
            setDetails(prev => ({
                ...prev,
                rir: Array.from({ length: numSets }, (_, i) => prev.rir[i] || '0')
            }));
        }
    }, [details.sets, details.rir]);

    const handleRirChange = (index, value) => {
        const newRir = [...details.rir];
        newRir[index] = value;
        setDetails(prev => ({ ...prev, rir: newRir }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (['primary', 'secondary', 'tertiary', 'primaryContribution', 'secondaryContribution', 'tertiaryContribution'].includes(name)) {
            setDetails(prev => ({ ...prev, muscles: { ...prev.muscles, [name]: value } }));
        } else {
            setDetails(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = () => {
        if (!details.name) {
            alert("Exercise name is required.");
            return;
        }
        const { name, ...otherDetails } = details;
        onSave(normalizeExerciseDetails(otherDetails), name);
    };

    const handleDelete = () => {
        if(window.confirm(`Are you sure you want to delete "${exerciseName}"? This will remove it from the master list and all workouts.`)){
            onDelete(exerciseName);
        }
    };

    const setCount = parseInt(details.sets, 10) || 0;

    return (
        <div>
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="ee-eyebrow text-amber"><Dumbbell size={12} /> {isNew ? 'New exercise' : 'Exercise editor'}</p>
                    <h2 className="mt-2 font-display text-xl font-bold text-bone">{isNew ? 'Create exercise' : exerciseName}</h2>
                </div>
                {!isNew && (
                    <button onClick={handleDelete} className="ee-icon-btn text-coral" title="Delete exercise" aria-label="Delete exercise">
                        <Trash2 size={16} />
                    </button>
                )}
            </div>

            <div className="mt-6 space-y-5">
                <Field label="Exercise name">
                    <input id="name" type="text" name="name" value={details.name} onChange={handleChange} className="ee-input" />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                    <Field label="Sets">
                        <input id="sets" type="number" name="sets" value={details.sets} onChange={handleChange} className="ee-input font-mono tabular-nums" />
                    </Field>
                    <Field label="Reps">
                        <input id="reps" type="text" name="reps" value={details.reps} onChange={handleChange} placeholder="e.g., 8-12" className="ee-input font-mono tabular-nums" />
                    </Field>
                </div>

                <div className="ee-well p-4">
                    <p className="ee-eyebrow mb-3 text-teal"><Target size={11} /> RIR targets per set</p>
                    {setCount > 0 ? (
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                            {Array.from({ length: setCount }, (_, i) => (
                                <div key={i}>
                                    <label htmlFor={`rir-${i}`} className="mb-1 block text-[10px] font-bold uppercase tracking-[0.1em] text-mute">Set {i + 1}</label>
                                    <input id={`rir-${i}`} type="text" value={details.rir[i] || ''} onChange={(e) => handleRirChange(i, e.target.value)} className="ee-input px-2 py-2 text-center font-mono text-sm tabular-nums" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-mute">Set a set count above to configure per-set effort targets.</p>
                    )}
                </div>

                <Field label="Rest">
                    <input id="rest" type="text" name="rest" value={details.rest} onChange={handleChange} placeholder="e.g., 2-3 min" className="ee-input" />
                </Field>

                <div className="ee-well p-4">
                    <p className="ee-eyebrow mb-1 text-teal">Muscle groups &amp; volume</p>
                    <p className="mb-4 text-[11px] text-mute">Direct muscles count as 1.0 set. Indirect muscles count as 0.5 set.</p>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Field label="Primary muscle">
                            <input id="primary" type="text" name="primary" value={details.muscles.primary} onChange={handleChange} className="ee-input" />
                        </Field>
                        <Field label="Primary contribution">
                            <select id="primaryContribution" name="primaryContribution" value={details.muscles.primaryContribution} onChange={handleChange} className="ee-input">
                                <option value={1}>100% (Primary)</option>
                            </select>
                        </Field>
                        <Field label="Secondary muscle">
                            <input id="secondary" type="text" name="secondary" value={details.muscles.secondary} onChange={handleChange} className="ee-input" />
                        </Field>
                        <Field label="Secondary contribution">
                            <select id="secondaryContribution" name="secondaryContribution" value={details.muscles.secondaryContribution} onChange={handleChange} className="ee-input">
                                <option value={0.5}>50% (Indirect)</option>
                                <option value={0}>0%</option>
                            </select>
                        </Field>
                        <Field label="Tertiary muscle">
                            <input id="tertiary" type="text" name="tertiary" value={details.muscles.tertiary} onChange={handleChange} className="ee-input" />
                        </Field>
                        <Field label="Tertiary contribution">
                            <select id="tertiaryContribution" name="tertiaryContribution" value={details.muscles.tertiaryContribution} onChange={handleChange} className="ee-input">
                                <option value={0.5}>50% (Indirect)</option>
                                <option value={0}>0%</option>
                            </select>
                        </Field>
                    </div>
                </div>

                <Field label="Intensity technique (e.g., Dropset)">
                    <input id="lastSetTechnique" type="text" name="lastSetTechnique" value={details.lastSetTechnique} onChange={handleChange} className="ee-input" />
                </Field>
            </div>

            <div className="mt-7 flex justify-end gap-2">
                <button onClick={onClose} className="ee-secondary">Cancel</button>
                <button onClick={handleSave} className="ee-primary">Save exercise</button>
            </div>
        </div>
    );
};
