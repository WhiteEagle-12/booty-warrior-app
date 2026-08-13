import React from 'react';
import { SegmentedTabs } from '../components/common/SegmentedTabs';

export const PROGRAM_TABS = [
    { id: 'programHub', label: 'Library' },
    { id: 'editProgram', label: 'Editor' },
];

export const ProgramView = ({ current, onNavigate, children }) => (
    <div className="py-6 md:py-9">
        <header className="mb-6">
            <p className="ee-kicker">This block</p>
            <h1 className="ee-display mt-2 text-3xl sm:text-4xl">Program</h1>
            <p className="ee-lede mt-2">Switch templates, import a plan, or shape the days you train.</p>
        </header>
        <SegmentedTabs tabs={PROGRAM_TABS} value={current} onChange={onNavigate} />
        <div className="mt-6">{children}</div>
    </div>
);
