import React, { useMemo, useContext } from 'react';
import { CheckCircle, Award, Lock, Trophy } from 'lucide-react';
import { AppStateContext } from '../contexts/AppStateContext';
import { achievementsList } from '../data/achievements';
import { formatWeight } from '../utils/formatters';
import { ViewHeader } from '../components/common/ViewHeader';
import { ProgressRing } from '../components/common/ProgressRing';

const TIER_ACCENTS = {
    bronze: '#d08a3e',
    silver: '#aab4c0',
    gold: '#f2c14e',
    platinum: '#67e8f9',
    diamond: '#a78bfa',
    '1.0x': '#4ade80',
    '1.5x': '#60a5fa',
    '2.0x': '#818cf8',
    '2.5x': '#c084fc',
    '3.0x': '#f472b6',
    two: '#ef4444',
    three: '#60a5fa',
    four: '#4ade80',
    five: '#facc15',
    scout: '#fbbf24',
    marksman: '#2dd4bf',
    overwatch: '#60a5fa',
    patrol: '#fb923c',
    air: '#22d3ee',
    'no-fly': '#fb7185',
    wing: '#fde047',
    squadron: '#34d399',
    command: '#c084fc',
    default: 'rgb(var(--c-amber))',
};

const formatProgress = (currentValue, target, unit, weightUnit) => {
    const current = Math.floor(currentValue);
    switch (unit) {
        case 'ratio': return `${currentValue.toFixed(2)}x / ${target.toFixed(2)}x BW`;
        case 'reps': return `${current} / ${target} reps`;
        case 'days': return `${current} / ${target} days`;
        case 'sets': return `${current} / ${target} sets`;
        case 'sessions': return `${current} / ${target} sessions`;
        default: return `${formatWeight(currentValue, weightUnit, false)} / ${formatWeight(target, weightUnit, false)}`;
    }
};

export const AchievementCard = ({ achievementId, achievement, unlockedStatus, currentValue, weightUnit, onClick }) => {
    // ROBUSTNESS FIX: Add a strong guard clause to prevent rendering with invalid data.
    if (!achievement || typeof achievement !== 'object' || !achievement.name || !achievement.icon) {
        return null;
    }

    const { icon: Icon } = achievement;
    let isUnlocked = false;
    let displayName = achievement.name;
    let tierName = null;
    let nextTier = null;
    let progressPercentage = 0;

    if (achievement.type === 'tiered') {
        const unlockedTierIndex = unlockedStatus; // Can be undefined, -1, or a number
        if (unlockedTierIndex !== undefined && unlockedTierIndex > -1) {
            isUnlocked = true;
            const currentTier = achievement.tiers[unlockedTierIndex];
            tierName = currentTier.name;
            displayName = `${achievement.name} - ${tierName}`;
            if (unlockedTierIndex < achievement.tiers.length - 1) {
                nextTier = achievement.tiers[unlockedTierIndex + 1];
                const prevTierValue = unlockedTierIndex > 0 ? achievement.tiers[unlockedTierIndex - 1].value : 0;
                const range = nextTier.value - prevTierValue;
                progressPercentage = range > 0 ? Math.min(100, ((currentValue - prevTierValue) / range) * 100) : (currentValue >= nextTier.value ? 100 : 0);
            } else {
                progressPercentage = 100;
            }
        } else { // Not unlocked any tiers yet
            nextTier = achievement.tiers[0];
            progressPercentage = nextTier.value > 0 ? Math.min(100, (currentValue / nextTier.value) * 100) : (currentValue >= nextTier.value ? 100 : 0);
        }
    } else {
        isUnlocked = !!unlockedStatus;
        progressPercentage = isUnlocked ? 100 : 0;
    }

    const colorKey = tierName ? tierName.toLowerCase().split(' ')[0] : 'default';
    const unit = achievement.unit || 'weight';
    const accent = TIER_ACCENTS[colorKey] || TIER_ACCENTS.default;

    return (
        <button
            onClick={(e) => onClick(e, achievementId)}
            className={`group relative flex aspect-square flex-col items-center justify-center rounded-2xl border p-3 text-center transition-all duration-200 ${
                isUnlocked
                    ? 'bg-panel2 hover:-translate-y-0.5'
                    : 'border-line/70 bg-panel2/40 opacity-55 hover:opacity-90'
            }`}
            style={isUnlocked ? { borderColor: `${accent}55`, boxShadow: `0 8px 28px ${accent}14` } : undefined}
        >
            {!isUnlocked && (
                <span className="absolute right-2.5 top-2.5 rounded-full border border-line bg-well/70 p-1 text-mute">
                    <Lock size={11} />
                </span>
            )}
            <div className="flex flex-grow flex-col items-center justify-center">
                <span
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={isUnlocked ? { backgroundColor: `${accent}1f`, color: accent } : { backgroundColor: 'rgb(var(--c-well))', color: 'rgb(var(--c-mute))' }}
                >
                    <Icon size={24} />
                </span>
                <h3 className={`mt-2.5 text-xs font-bold leading-4 ${isUnlocked ? 'text-bone' : 'text-mute'}`}>{displayName}</h3>
            </div>
            {nextTier && (
                <div className="w-full self-end">
                    <div className="h-1 w-full overflow-hidden rounded-full bg-line/50">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${progressPercentage}%`, backgroundColor: isUnlocked ? accent : 'rgb(var(--c-amber))' }}
                        />
                    </div>
                    <p className="mt-1.5 font-mono text-[10px] tabular-nums text-mute">
                        {formatProgress(currentValue, nextTier.value, unit, weightUnit)}
                    </p>
                </div>
            )}
        </button>
    );
};

export const AchievementsView = ({ unlockedAchievements, historicalLogs, programData, bodyWeight, weightUnit, onBack, bodyWeightHistory, embedded = false }) => {
    const { openModal, closeModal } = useContext(AppStateContext);

    const processedAchievements = useMemo(() => {
        if (!programData || !historicalLogs) return [];

        return Object.entries(achievementsList)
            .filter(([id, achievement]) => achievement && typeof achievement === 'object' && achievement.name && achievement.getValue)
            .map(([id, achievement]) => {
                const currentValue = achievement.getValue(historicalLogs, programData, parseFloat(bodyWeight) || 0, weightUnit, bodyWeightHistory);
                const unlockedStatus = unlockedAchievements[id];
                return { id, achievement, currentValue, unlockedStatus };
            });
    }, [historicalLogs, programData, bodyWeight, unlockedAchievements, weightUnit, bodyWeightHistory]);

    const unlockedCount = processedAchievements.filter(a => a.unlockedStatus !== undefined && a.unlockedStatus > -1).length;
    const unlockPercent = processedAchievements.length > 0 ? Math.round((unlockedCount / processedAchievements.length) * 100) : 0;

    const handleShowDescription = (e, achievementId) => {
        e.preventDefault();
        const achievementData = processedAchievements.find(a => a.id === achievementId);
        if (!achievementData || !achievementData.achievement) {
            console.error("Could not find achievement data for ID:", achievementId);
            return;
        }

        const { achievement, unlockedStatus } = achievementData;
        const Icon = achievement.icon;

        const unit = achievement.unit || 'weight';
        const formatTierValue = (tier) => {
            const target = tier.value;
            switch (unit) {
                case 'ratio': return `${target.toFixed(2)}x BW`;
                case 'reps': return `${target} reps`;
                case 'days': return `${target} days`;
                case 'sets': return `${target} sets`;
                case 'sessions': return `${target} sessions`;
                case 'weight':
                default: return formatWeight(target, weightUnit);
            }
        };

        openModal(
            <div>
                <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber/10 text-amber">
                        <Icon size={26} />
                    </span>
                    <div>
                        <p className="ee-eyebrow text-amber">Achievement</p>
                        <h2 className="mt-1 font-display text-xl font-bold text-bone">{achievement.name}</h2>
                    </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-mute">{achievement.description}</p>
                {achievement.type === 'tiered' && (
                    <div className="mt-5 space-y-2">
                        {achievement.tiers.map((tier, index) => (
                            <div key={tier.name} className={`flex items-center gap-3 rounded-xl border p-3 ${unlockedStatus >= index ? 'border-teal/30 bg-teal/[0.07]' : 'border-line bg-panel2/50 opacity-60'}`}>
                                <CheckCircle size={18} className={unlockedStatus >= index ? 'text-teal' : 'text-line'} />
                                <div>
                                    <p className="text-sm font-bold text-bone">{tier.name} <span className="font-mono text-xs font-semibold text-mute">({formatTierValue(tier)})</span></p>
                                    <p className="mt-0.5 text-xs text-mute">{tier.description(tier.value, weightUnit)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div className="mt-6 flex justify-end">
                    <button onClick={closeModal} className="ee-primary">Close</button>
                </div>
            </div>,
            'lg'
        );
    };

    const unlockSummary = (
        <div className="flex items-center gap-3 rounded-2xl border border-line bg-panel2/70 px-4 py-3">
            <ProgressRing size={52} stroke={4.5} progress={unlockPercent} color="rgb(var(--c-amber))">
                <Trophy size={17} className="text-amber" />
            </ProgressRing>
            <div>
                <p className="font-display text-lg font-medium leading-none text-bone">{unlockedCount}<span className="text-mute">/{processedAchievements.length}</span></p>
                <p className="mt-1 text-[11px] font-medium text-mute">Unlocked</p>
            </div>
        </div>
    );

    return (
        <div className={embedded ? '' : 'py-6 md:py-9'}>
            {!embedded && (
                <ViewHeader
                    icon={Award}
                    eyebrow="Badges"
                    title="Achievements"
                    description="Every measurable win. Locked awards stay quiet until the data earns them."
                >
                    {unlockSummary}
                </ViewHeader>
            )}
            {embedded && <div className="mb-5">{unlockSummary}</div>}

            <div className="grid grid-cols-2 gap-3 animate-stagger sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {processedAchievements.map(({ id, achievement, currentValue, unlockedStatus }) => (
                    <AchievementCard
                        key={id}
                        achievementId={id}
                        achievement={achievement}
                        unlockedStatus={unlockedStatus}
                        currentValue={currentValue}
                        weightUnit={weightUnit}
                        onClick={handleShowDescription}
                    />
                ))}
            </div>
        </div>
    );
};
