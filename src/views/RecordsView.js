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
        <div className="p-4 md:p-6 pb-24">
             <div className="flex flex-col items-center text-center mb-6">
                <div className="flex justify-center items-center">
                    <Trophy className="text-yellow-500 dark:text-yellow-400 mr-2" size={32} />
                    <h1 className="text-3xl font-bold dark:text-white">Personal Records</h1>
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-400">Your Best Lifts (e1RM)</p>
            </div>
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text"
                        placeholder="Search for an exercise..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full p-2 pl-10 bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-600 shadow-sm"
                    />
                </div>
            </div>
            <div className="space-y-3">
                {filteredRecords.length > 0 ? filteredRecords.map(({ exercise, e1rm, log }) => (
                    <div key={exercise} className="bg-white dark:bg-gray-800 rounded-lg p-4 flex justify-between items-center shadow-md">
                        <div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{exercise}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {log.load} lbs x {log.reps} reps @ {log.rir || 0} RIR
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                Set on: Week {log.week}, {log.dayKey}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{e1rm}</p>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">e1RM</p>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-10">
                        <p className="text-gray-500 dark:text-gray-400">No records found for "{searchTerm}".</p>
                    </div>
                )}
            </div>
        </div>
    );
};