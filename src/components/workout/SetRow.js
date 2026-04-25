import React from 'react';
import { XCircle } from 'lucide-react';

export const SetRow = ({ setNumber, logData, onLogChange, lastSetData, exerciseDetails, weightUnit, exerciseName, totalSets, displaySetNumber, isDropSet, setIdentifier }) => {
    const logId = setIdentifier || setNumber;
    const targetRir = (exerciseDetails.rir && Array.isArray(exerciseDetails.rir) && setNumber > 0 && exerciseDetails.rir[setNumber - 1]) || 'N/A';
    const targetEffort = isDropSet ? `To Failure` : `~${targetRir} RIR`;
    const placeholderWeight = lastSetData?.load ? (weightUnit === 'kg' ? (lastSetData.load / 2.20462).toFixed(1) : lastSetData.load) : `Weight (${weightUnit})`;

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

    const isSkipped = logData.skipped;

    return (
        <div className={`grid grid-cols-4 sm:grid-cols-7 gap-2 items-center rounded-xl border py-2 px-3 transition-all ${isSkipped ? 'border-white/5 bg-white/[0.025] opacity-60' : (isDropSet ? 'border-[#f36f52]/30 bg-[#f36f52]/10' : 'border-white/10 bg-white/[0.045]')}`}>
            <div className="text-sm font-black text-[#efe7d5] col-span-4 sm:col-span-1">{displaySetNumber || `Set ${setNumber}`}</div>
            <div className="hidden sm:block text-sm text-center text-[#9ca89d]">{isDropSet ? 'AMRAP' : exerciseDetails.reps}</div>
            <div className="hidden sm:block text-sm text-center font-bold text-[#4dd6c6]">{targetEffort}</div>
            <div className="sm:hidden col-span-4 text-xs text-center text-[#9ca89d] -mt-1 mb-1">
                Target: <span className="font-medium text-[#efe7d5]">{isDropSet ? 'As many reps as possible' : `${exerciseDetails.reps} reps, ${targetEffort}`}</span>
            </div>
            <div>
                <label className="sm:hidden text-xs text-[#9ca89d]">Load</label>
                <input id={`input-${exerciseName}-${logId}-load`} name="load" type="number" placeholder={placeholderWeight} value={logData.displayLoad || ''} onChange={(e) => onLogChange(logId, 'load', e.target.value)} onKeyDown={handleKeyDown} disabled={isSkipped} className="ee-input p-1.5 disabled:opacity-70"/>
            </div>
            <div>
                <label className="sm:hidden text-xs text-[#9ca89d]">Reps</label>
                <input id={`input-${exerciseName}-${logId}-reps`} name="reps" type="number" placeholder={lastSetData?.reps || "Reps"} value={logData.reps || ''} onChange={(e) => onLogChange(logId, 'reps', e.target.value)} onKeyDown={handleKeyDown} disabled={isSkipped} className="ee-input p-1.5 disabled:opacity-70"/>
            </div>
            <div>
                <label className="sm:hidden text-xs text-[#9ca89d]">RIR</label>
                <input id={`input-${exerciseName}-${logId}-rir`} name="rir" type="number" placeholder={isDropSet ? "0" : (lastSetData?.rir ?? "RIR")} value={logData.rir || ''}
                    onChange={(e) => onLogChange(logId, 'rir', e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isSkipped}
                    className="ee-input p-1.5 disabled:opacity-70"
                />
            </div>
            <div className="sm:pl-2">
                {isSkipped ? (
                    <button onClick={() => onLogChange(logId, 'unskip', false)} className="text-xs p-1.5 w-full bg-[#f3b548] text-[#15100a] rounded-md transition-colors flex items-center justify-center gap-1 font-bold">
                        <XCircle size={14}/> Skipped
                    </button>
                ) : (
                    <button onClick={() => onLogChange(logId, 'skip', true)} className="text-xs p-1.5 w-full bg-white/10 hover:bg-white/15 rounded-md transition-colors text-[#9ca89d]">Skip</button>
                )}
            </div>
        </div>
    );
};
