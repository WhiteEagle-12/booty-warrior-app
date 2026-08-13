import React from 'react';

export const SegmentedTabs = ({ tabs, value, onChange }) => (
    <div className="ee-tabs" role="tablist">
        {tabs.map((tab) => {
            const isActive = value === tab.id;
            return (
                <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => onChange(tab.id)}
                    className={`ee-tab ${isActive ? 'is-active' : ''}`}
                >
                    {tab.label}
                </button>
            );
        })}
    </div>
);
