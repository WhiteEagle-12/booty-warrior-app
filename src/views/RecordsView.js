import React, { useState, useMemo } from 'react';
import { Trophy, Search } from 'lucide-react';
import { calculateE1RM } from '../utils/helpers';

export const RecordsView = ({ allLogs, programData, onBack }) => {
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
    }, [allLogs]);

    const filteredRecords = useMemo(() => {
        return personalRecords.filter(record => 
            record.exercise.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [personalRecords, searchTerm]);

    return (
        <div className="py-5 md:py-8 pb-24">
             <div className="ee-panel mb-6 rounded-2xl p-5 md:p-6">
                <div className="flex items-center gap-3">
                    <Trophy className="text-[#f3b548]" size={32} />
                    <div>
                        <p className="text-xs font-bold uppercase text-[#f3b548]">PR scope</p>
                        <h1 className="text-3xl font-black text-[#efe7d5]">Personal Records</h1>
                    </div>
                </div>
                <p className="mt-3 text-[#9ca89d]">Your strongest estimated one-rep max sightings.</p>
            </div>
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca89d]" size={20} />
                    <input 
                        type="text"
                        placeholder="Search for an exercise..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="ee-input pl-10"
                    />
                </div>
            </div>
            <div className="space-y-3">
                {filteredRecords.length > 0 ? filteredRecords.map(({ exercise, e1rm, log }) => (
                    <div key={exercise} className="ee-panel-soft rounded-xl p-4 flex justify-between items-center">
                        <div>
                            <h3 className="font-black text-lg text-[#efe7d5]">{exercise}</h3>
                            <p className="text-sm text-[#9ca89d]">
                                {log.load} lbs x {log.reps} reps @ {log.rir || 0} RIR
                            </p>
                            <p className="text-xs text-[#9ca89d]">
                                Set on: Week {log.week}, {log.dayKey}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-black text-[#4dd6c6]">{e1rm}</p>
                            <p className="text-sm font-medium text-[#9ca89d]">e1RM</p>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-10">
                        <p className="text-[#9ca89d]">No records found for "{searchTerm}".</p>
                    </div>
                )}
            </div>
        </div>
    );
};
