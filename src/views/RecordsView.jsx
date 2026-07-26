import React, { useState, useMemo } from 'react';
import { Trophy, Search, Medal } from 'lucide-react';
import { calculateE1RM } from '../utils/helpers';
import { formatWeight } from '../utils/formatters';
import { ViewHeader } from '../components/common/ViewHeader';

const RANK_STYLES = [
    'border-amber/50 bg-amber/[0.08]',
    'border-line bg-panel2/70',
    'border-line bg-panel2/70',
];

export const RecordsView = ({ allLogs, programData, onBack, weightUnit = 'lbs' }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const personalRecords = useMemo(() => {
        const records = {};
        const masterList = programData?.masterExerciseList || {};
        const validLogs = Object.values(allLogs).filter(log =>
            !log.skipped &&
            (log.load !== undefined && log.load !== null) &&
            log.reps &&
            !!masterList[log.exercise]
        );

        validLogs.forEach(log => {
            const e1rm = calculateE1RM(log.load, log.reps, log.rir);
            if (!records[log.exercise] || e1rm > records[log.exercise].e1rm) {
                records[log.exercise] = {
                    e1rm,
                    log,
                };
            }
        });
        return Object.entries(records)
            .sort(([, a], [, b]) => b.e1rm - a.e1rm)
            .map(([exercise, data]) => ({ exercise, ...data }));
    }, [allLogs, programData]);

    const filteredRecords = useMemo(() => {
        return personalRecords.filter(record =>
            record.exercise.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [personalRecords, searchTerm]);

    return (
        <div className="py-5 md:py-7">
            <ViewHeader
                icon={Trophy}
                eyebrow="Record book"
                title="Personal records"
                description="Your strongest estimated one-rep-max sighting for every lift in the program."
            >
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mute" size={16} />
                    <input
                        type="text"
                        placeholder="Search lifts..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="ee-input pl-10"
                        aria-label="Search records"
                    />
                </div>
            </ViewHeader>

            <div className="space-y-2.5 animate-stagger">
                {filteredRecords.length > 0 ? filteredRecords.map(({ exercise, e1rm, log }, index) => (
                    <div key={exercise} className={`ee-panel-soft flex items-center justify-between gap-4 p-4 ${RANK_STYLES[index] || 'border-line bg-panel2/50'}`}>
                        <div className="flex min-w-0 items-center gap-3.5">
                            <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg font-display text-sm font-bold ${index === 0 ? 'bg-amber/15 text-amber' : 'bg-well text-mute'}`}>
                                {index === 0 ? <Medal size={17} /> : index + 1}
                            </span>
                            <div className="min-w-0">
                                <h3 className="truncate font-display text-base font-bold text-bone">{exercise}</h3>
                                <p className="mt-0.5 text-xs text-mute">
                                    {formatWeight(log.load, weightUnit)} × {log.reps} @ {log.rir || 0} RIR
                                    <span className="text-mute/60"> · Week {log.week}, {log.dayKey}</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                            <p className="font-display text-xl font-bold text-teal sm:text-2xl">{formatWeight(e1rm, weightUnit, false)}</p>
                            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-mute">e1RM {weightUnit}</p>
                        </div>
                    </div>
                )) : (
                    <div className="ee-panel flex flex-col items-center p-12 text-center">
                        <Trophy size={36} className="text-line" />
                        <p className="mt-4 text-sm text-mute">
                            {searchTerm ? `No records found for "${searchTerm}".` : 'Log your first session to start the record book.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
