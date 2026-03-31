import React, { useState, useMemo, useContext } from 'react';
import { CheckCircle, Award } from 'lucide-react';
import { AppStateContext } from '../contexts/AppStateContext';
import { achievementsList } from '../data/achievements';
import { formatWeight } from '../utils/formatters';

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

    const colorScheme = {
        'bronze': { bg: 'bg-amber-100 dark:bg-amber-900/50', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-400', progress: 'bg-amber-500' },
        'silver': { bg: 'bg-slate-100 dark:bg-slate-800/50', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-400', progress: 'bg-slate-500' },
        'gold': { bg: 'bg-yellow-100 dark:bg-yellow-900/50', text: 'text-yellow-500 dark:text-yellow-400', border: 'border-yellow-500', progress: 'bg-yellow-500' },
        'platinum': { bg: 'bg-cyan-100 dark:bg-cyan-900/50', text: 'text-cyan-500 dark:text-cyan-400', border: 'border-cyan-400', progress: 'bg-cyan-500' },
        'diamond': { bg: 'bg-violet-100 dark:bg-violet-900/50', text: 'text-violet-500 dark:text-violet-400', border: 'border-violet-400', progress: 'bg-violet-500' },
        '1.0x': { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-600 dark:text-green-400', border: 'border-green-400', progress: 'bg-green-500' },
        '1.5x': { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-400', progress: 'bg-blue-500' },
        '2.0x': { bg: 'bg-indigo-100 dark:bg-indigo-900/50', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-400', progress: 'bg-indigo-500' },
        '2.5x': { bg: 'bg-purple-100 dark:bg-purple-900/50', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-400', progress: 'bg-purple-500' },
        '3.0x': { bg: 'bg-pink-100 dark:bg-pink-900/50', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-400', progress: 'bg-pink-500' },
        'two': { bg: 'bg-red-100 dark:bg-red-800/50', text: 'text-red-500', border: 'border-red-500', progress: 'bg-red-500'},
        'three': { bg: 'bg-blue-100 dark:bg-blue-800/50', text: 'text-blue-500', border: 'border-blue-500', progress: 'bg-blue-500'},
        'four': { bg: 'bg-green-100 dark:bg-green-800/50', text: 'text-green-500', border: 'border-green-500', progress: 'bg-green-500'},
        'five': { bg: 'bg-yellow-100 dark:bg-yellow-800/50', text: 'text-yellow-500', border: 'border-yellow-500', progress: 'bg-yellow-500'},
        '135': { bg: 'bg-gray-100 dark:bg-gray-800/50', text: 'text-gray-500', border: 'border-gray-500', progress: 'bg-gray-500'},
        '185': { bg: 'bg-red-100 dark:bg-red-800/50', text: 'text-red-500', border: 'border-red-500', progress: 'bg-red-500'},
        '225': { bg: 'bg-blue-100 dark:bg-blue-800/50', text: 'text-blue-500', border: 'border-blue-500', progress: 'bg-blue-500'},
        'default': { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500', border: 'border-transparent', progress: 'bg-blue-500' }
    }[colorKey] || { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500', border: 'border-transparent', progress: 'bg-blue-500' };

    const cardClasses = `p-4 rounded-xl flex flex-col items-center justify-center text-center aspect-square transition-all duration-300 ${isUnlocked ? `${colorScheme.bg} border-2 ${colorScheme.border} shadow-lg` : 'bg-gray-100 dark:bg-gray-800 filter grayscale opacity-60 hover:opacity-100'}`;
    const iconClasses = isUnlocked ? colorScheme.text : 'text-gray-500';
    const textClasses = isUnlocked ? 'text-gray-800 dark:text-gray-200' : 'text-gray-600 dark:text-gray-400';

    return (
        <button onClick={(e) => onClick(e, achievementId)} className={cardClasses}>
            <div className="flex flex-col items-center justify-center flex-grow">
                <Icon size={36} className={iconClasses} />
                <h3 className={`mt-2 font-bold text-sm ${textClasses}`}>{displayName}</h3>
            </div>
            {(nextTier) && (
                 <div className="w-full mt-2 self-end">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div className={`${isUnlocked ? colorScheme.progress : 'bg-blue-500'} h-1.5 rounded-full`} style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {(() => {
                            const current = Math.floor(currentValue);
                            const target = nextTier.value;
                            switch (unit) {
                                case 'ratio':
                                    return `${currentValue.toFixed(2)}x / ${target.toFixed(2)}x BW`;
                                case 'reps':
                                    return `${current} / ${target} reps`;
                                case 'days':
                                    return `${current} / ${target} days`;
                                case 'sets':
                                    return `${current} / ${target} sets`;
                                case 'sessions':
                                    return `${current} / ${target} sessions`;
                                default:
                                    return `${formatWeight(currentValue, weightUnit, false)} / ${formatWeight(target, weightUnit, false)}`;
                            }
                        })()}
                    </p>
                </div>
            )}
        </button>
    );
};

export const AchievementsView = ({ unlockedAchievements, historicalLogs, programData, bodyWeight, weightUnit, onBack, bodyWeightHistory }) => {
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
                case 'ratio':
                    return `${target.toFixed(2)}x BW`;
                case 'reps':
                    return `${target} reps`;
                case 'days':
                    return `${target} days`;
                case 'sets':
                    return `${target} sets`;
                case 'sessions':
                    return `${target} sessions`;
                case 'weight':
                default:
                    return formatWeight(target, weightUnit);
            }
        };

        openModal(
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <Icon size={32} className={'text-yellow-500'} />
                    <h2 className="text-xl font-bold">{achievement.name}</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{achievement.description}</p>
                {achievement.type === 'tiered' && (
                    <div className="space-y-2">
                        <h3 className="font-semibold">Tiers:</h3>
                        {achievement.tiers.map((tier, index) => (
                            <div key={tier.name} className={`flex items-center gap-3 p-2 rounded-md ${unlockedStatus >= index ? 'bg-green-100 dark:bg-green-900/50' : 'bg-gray-100 dark:bg-gray-700/50'}`}>
                                <CheckCircle size={20} className={unlockedStatus >= index ? 'text-green-500' : 'text-gray-400'} />
                                <div>
                                    <p className="font-bold">{tier.name} ({formatTierValue(tier)})</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{tier.description(tier.value, weightUnit)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex justify-end mt-6">
                    <button onClick={closeModal} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Close</button>
                </div>
            </div>,
            'lg'
        );
    };

    return (
        <div className="p-4 md:p-6 pb-24">
            <div className="flex flex-col items-center text-center mb-6">
                <div className="flex justify-center items-center">
                    <Award className="text-yellow-500 dark:text-yellow-400 mr-2" size={32} />
                    <h1 className="text-3xl font-bold dark:text-white">Achievements</h1>
                </div>
            </div>
            {Object.keys(historicalLogs).length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
            ) : (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                    <Award size={48} className="mx-auto text-gray-400 dark:text-gray-500" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">No Achievements Yet</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Start logging your workouts to unlock achievements and track your progress!</p>
                </div>
            )}
        </div>
    );
};