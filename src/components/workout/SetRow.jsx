import React from 'react';
import { Check, Ban, RotateCcw } from 'lucide-react';
import { isSetLogComplete } from '../../utils/helpers';

const toDisplayLoad = (load, weightUnit) => {
    if (load === undefined || load === null || load === '') return null;
    return weightUnit === 'kg' ? (load / 2.20462).toFixed(1) : load;
};

export const SetRow = ({ setNumber, logData, onLogChange, lastSetData, exerciseDetails, weightUnit, exerciseName, totalSets, displaySetNumber, isDropSet, setIdentifier }) => {
    const logId = setIdentifier || setNumber;
    const targetRir = (exerciseDetails.rir && Array.isArray(exerciseDetails.rir) && setNumber > 0 && exerciseDetails.rir[setNumber - 1]) || 'N/A';
    const targetEffort = isDropSet ? 'Failure' : `~${targetRir} RIR`;

    const prevLoad = toDisplayLoad(lastSetData?.load, weightUnit);
    const placeholderWeight = prevLoad ?? '—';

    const isSkipped = logData.skipped;
    const isComplete = isSetLogComplete(logData) && !isSkipped;

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const currentField = e.target.name;
            let nextField;

            if (currentField === 'load') {
                nextField = 'reps';
            } else if (currentField === 'reps') {
                nextField = 'rir';
            } else {
                e.target.blur();
                return;
            }

            const nextInputId = `input-${exerciseName}-${logId}-${nextField}`;
            document.getElementById(nextInputId)?.focus();
        }
    };

    const rowTone = isSkipped
        ? 'border-line/50 bg-well/40 opacity-55'
        : isComplete
            ? 'border-teal/30 bg-teal/[0.05]'
            : isDropSet
                ? 'border-coral/35 bg-coral/[0.06]'
                : 'border-line bg-panel2/50';

    const inputClass = 'ee-input px-2 py-2 text-center font-mono text-sm tabular-nums disabled:opacity-60';

    return (
        <div className={`rounded-xl border px-3 py-2.5 transition-colors duration-200 ${rowTone}`}>
            {/* Row header: identity + targets */}
            <div className="mb-2 flex items-center justify-between gap-2 sm:hidden">
                <span className={`font-display text-xs font-bold ${isDropSet ? 'text-coral' : 'text-bone'}`}>
                    {displaySetNumber || `Set ${setNumber}`}
                </span>
                <span className="text-[11px] text-mute">
                    {isDropSet ? 'As many reps as possible' : `${exerciseDetails.reps} reps · ${targetEffort}`}
                </span>
                {lastSetData && !isDropSet && (
                    <span className="font-mono text-[10px] tabular-nums text-mute/70">
                        last {prevLoad ?? '—'}×{lastSetData.reps ?? '—'}
                    </span>
                )}
            </div>

            <div className="grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-2 sm:grid-cols-[3.5rem_4.5rem_5.5rem_1fr_1fr_1fr_4rem] sm:items-center">
                {/* Desktop identity cells */}
                <div className={`hidden items-center gap-1.5 font-display text-sm font-bold sm:flex ${isDropSet ? 'text-coral' : 'text-bone'}`}>
                    {isComplete && <Check size={13} className="text-teal" />}
                    {displaySetNumber || `${setNumber}`}
                </div>
                <div className="hidden text-center font-mono text-xs tabular-nums text-mute sm:block">
                    {isDropSet ? 'AMRAP' : exerciseDetails.reps}
                </div>
                <div className="hidden text-center font-mono text-xs font-semibold tabular-nums text-teal sm:block">
                    {targetEffort}
                </div>

                <div>
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.1em] text-mute sm:hidden">Load</label>
                    <input
                        id={`input-${exerciseName}-${logId}-load`}
                        name="load"
                        type="number"
                        inputMode="decimal"
                        placeholder={placeholderWeight}
                        value={logData.displayLoad || ''}
                        onChange={(e) => onLogChange(logId, 'load', e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isSkipped}
                        aria-label={`Load in ${weightUnit} for set ${displaySetNumber || setNumber}`}
                        className={inputClass}
                    />
                </div>
                <div>
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.1em] text-mute sm:hidden">Reps</label>
                    <input
                        id={`input-${exerciseName}-${logId}-reps`}
                        name="reps"
                        type="number"
                        inputMode="numeric"
                        placeholder={lastSetData?.reps || '—'}
                        value={logData.reps || ''}
                        onChange={(e) => onLogChange(logId, 'reps', e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isSkipped}
                        aria-label={`Reps for set ${displaySetNumber || setNumber}`}
                        className={inputClass}
                    />
                </div>
                <div>
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.1em] text-mute sm:hidden">RIR</label>
                    <input
                        id={`input-${exerciseName}-${logId}-rir`}
                        name="rir"
                        type="number"
                        inputMode="numeric"
                        placeholder={isDropSet ? '0' : (lastSetData?.rir ?? '—')}
                        value={logData.rir || ''}
                        onChange={(e) => onLogChange(logId, 'rir', e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isSkipped}
                        aria-label={`Reps in reserve for set ${displaySetNumber || setNumber}`}
                        className={inputClass}
                    />
                </div>
                <div>
                    {isSkipped ? (
                        <button
                            onClick={() => onLogChange(logId, 'unskip', false)}
                            className="flex w-full items-center justify-center gap-1 rounded-lg bg-amber/15 px-2 py-2 text-[11px] font-bold text-amber transition-colors hover:bg-amber/25 sm:w-16"
                            aria-label="Restore set"
                        >
                            <RotateCcw size={12} /> Undo
                        </button>
                    ) : (
                        <button
                            onClick={() => onLogChange(logId, 'skip', true)}
                            className="flex w-full items-center justify-center gap-1 rounded-lg bg-well/70 px-2 py-2 text-[11px] font-bold text-mute transition-colors hover:bg-coral/15 hover:text-coral sm:w-16"
                            aria-label="Skip set"
                        >
                            <Ban size={12} /> Skip
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
