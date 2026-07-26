import React, { useMemo } from 'react';
import { History } from 'lucide-react';
import { findLastPerformanceLogs } from '../../utils/progression';

export const ExerciseHistoryModal = ({ exerciseName, allLogs, programData }) => {
    // To get all historical logs, we can pass a future week number.
    const { historicalSessions } = useMemo(() => findLastPerformanceLogs(exerciseName, 999, 'Sun', allLogs, programData), [exerciseName, allLogs, programData]);

    if (!historicalSessions || historicalSessions.length === 0) {
        return (
            <div className="text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-line bg-panel2">
                    <History size={24} className="text-mute" />
                </span>
                <h2 className="mt-4 font-display text-xl font-bold text-bone">{exerciseName}</h2>
                <p className="mt-2 text-sm text-mute">No past performance data found for this exercise.</p>
            </div>
        );
    }

    return (
        <div>
            <p className="ee-eyebrow text-teal"><History size={12} /> Performance history</p>
            <h2 className="mt-2 font-display text-xl font-bold text-bone">{exerciseName}</h2>
            <div className="mt-5 max-h-[60vh] space-y-3 overflow-y-auto pr-1">
                {historicalSessions.map((session, index) => (
                    <div key={index} className="ee-panel-soft p-3.5">
                        <h3 className="mb-2 font-display text-sm font-bold text-bone">
                            Week {session.week} · {session.dayKey}
                        </h3>
                        <ul className="space-y-1">
                            {session.logs.map((log, logIndex) => (
                                <li key={logIndex} className="flex items-center justify-between text-sm">
                                    <span className="text-mute">Set {log.set}</span>
                                    <span className="font-mono text-xs tabular-nums text-bone">
                                        {log.load || 0} lbs × {log.reps || 0} @ {log.rir === '' ? '—' : log.rir} RIR
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};
