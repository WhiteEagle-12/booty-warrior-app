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
        <div className={`grid grid-cols-4 sm:grid-cols-7 gap-2 items-center py-2 px-3 rounded-md transition-all ${isSkipped ? 'bg-gray-200 dark:bg-gray-800 opacity-60' : (isDropSet ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-50 dark:bg-gray-700/50')}`}>
            <div className="text-sm font-bold text-gray-800 dark:text-gray-200 col-span-4 sm:col-span-1">{displaySetNumber || `Set ${setNumber}`}</div>
            <div className="hidden sm:block text-sm text-center text-gray-600 dark:text-gray-400">{isDropSet ? 'AMRAP' : exerciseDetails.reps}</div>
            <div className="hidden sm:block text-sm text-center font-medium text-blue-600 dark:text-blue-400">{targetEffort}</div>
            <div className="sm:hidden col-span-4 text-xs text-center text-gray-500 dark:text-gray-400 -mt-1 mb-1">
                Target: <span className="font-medium text-gray-700 dark:text-gray-300">{isDropSet ? 'As many reps as possible' : `${exerciseDetails.reps} reps, ${targetEffort}`}</span>
            </div>
            <div>
                <label className="sm:hidden text-xs text-gray-500">Load</label>
                <input id={`input-${exerciseName}-${logId}-load`} name="load" type="number" placeholder={placeholderWeight} value={logData.displayLoad || ''} onChange={(e) => onLogChange(logId, 'load', e.target.value)} onKeyDown={handleKeyDown} disabled={isSkipped} className="w-full p-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:opacity-70"/>
            </div>
            <div>
                <label className="sm:hidden text-xs text-gray-500">Reps</label>
                <input id={`input-${exerciseName}-${logId}-reps`} name="reps" type="number" placeholder={lastSetData?.reps || "Reps"} value={logData.reps || ''} onChange={(e) => onLogChange(logId, 'reps', e.target.value)} onKeyDown={handleKeyDown} disabled={isSkipped} className="w-full p-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:opacity-70"/>
            </div>
            <div>
                <label className="sm:hidden text-xs text-gray-500">RIR</label>
                <input id={`input-${exerciseName}-${logId}-rir`} name="rir" type="number" placeholder={isDropSet ? "0" : (lastSetData?.rir ?? "RIR")} value={logData.rir || ''}
                    onChange={(e) => onLogChange(logId, 'rir', e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isSkipped}
                    className="w-full p-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:opacity-70"
                />
            </div>
            <div className="sm:pl-2">
                {isSkipped ? (
                    <button onClick={() => onLogChange(logId, 'unskip', false)} className="text-xs p-1.5 w-full bg-yellow-500 text-white rounded-md transition-colors flex items-center justify-center gap-1">
                        <XCircle size={14}/> Skipped
                    </button>
                ) : (
                    <button onClick={() => onLogChange(logId, 'skip', true)} className="text-xs p-1.5 w-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-md transition-colors">Skip</button>
                )}
            </div>
        </div>
    );
};