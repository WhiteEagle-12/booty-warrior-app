import React, { useMemo } from 'react';
import { findLastPerformanceLogs } from '../../utils/progression';

export const ExerciseHistoryModal = ({ exerciseName, allLogs, programData }) => {
    // To get all historical logs, we can pass a future week number.
    const { historicalSessions } = useMemo(() => findLastPerformanceLogs(exerciseName, 999, 'Sun', allLogs, programData), [exerciseName, allLogs, programData]);

    if (!historicalSessions || historicalSessions.length === 0) {
        return (
            <div>
                <h2 className="text-xl font-bold mb-4">History for {exerciseName}</h2>
                <p className="text-gray-600 dark:text-gray-400">No past performance data found for this exercise.</p>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">History for {exerciseName}</h2>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {historicalSessions.map((session, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <h3 className="font-semibold text-md text-gray-800 dark:text-gray-200 mb-2">
                            Week {session.week}, {session.dayKey}
                        </h3>
                        <ul className="space-y-1 text-sm">
                            {session.logs.map((log, logIndex) => (
                                <li key={logIndex} className="flex justify-between">
                                    <span>Set {log.set}:</span>
                                    <span className="font-mono">{log.load || 0} lbs x {log.reps || 0} @ {log.rir === '' ? 'N/A' : log.rir} RIR</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};