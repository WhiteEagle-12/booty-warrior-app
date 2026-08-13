import React from 'react';
import { SegmentedTabs } from '../components/common/SegmentedTabs';

export const PROGRESS_TABS = [
    { id: 'dashboard', label: 'Overview' },
    { id: 'analytics', label: 'Trends' },
    { id: 'records', label: 'Records' },
    { id: 'achievements', label: 'Badges' },
];

export const ProgressView = ({ current, onNavigate, children }) => (
    <div className="py-6 md:py-9">
        <header className="mb-6">
            <p className="ee-kicker">Your training</p>
            <h1 className="ee-display mt-2 text-3xl sm:text-4xl">Progress</h1>
            <p className="ee-lede mt-2">Volume, strength, and the marks you’ve earned — in one place.</p>
        </header>
        <SegmentedTabs tabs={PROGRESS_TABS} value={current} onChange={onNavigate} />
        <div className="mt-6">{children}</div>
    </div>
);
