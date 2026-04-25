import React, { useState, useMemo, useContext } from 'react';
import { CheckCircle, Award, Lock, Trophy } from 'lucide-react';
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
        'scout': { bg: 'bg-amber-500/10', text: 'text-amber-300', border: 'border-amber-400/40', progress: 'bg-amber-400' },
        'marksman': { bg: 'bg-teal-400/10', text: 'text-teal-300', border: 'border-teal-300/40', progress: 'bg-teal-300' },
        'overwatch': { bg: 'bg-blue-400/10', text: 'text-blue-300', border: 'border-blue-300/40', progress: 'bg-blue-300' },
        'patrol': { bg: 'bg-orange-400/10', text: 'text-orange-300', border: 'border-orange-300/40', progress: 'bg-orange-300' },
        'air': { bg: 'bg-cyan-400/10', text: 'text-cyan-300', border: 'border-cyan-300/40', progress: 'bg-cyan-300' },
        'no-fly': { bg: 'bg-rose-400/10', text: 'text-rose-300', border: 'border-rose-300/40', progress: 'bg-rose-300' },
        'wing': { bg: 'bg-yellow-400/10', text: 'text-yellow-300', border: 'border-yellow-300/40', progress: 'bg-yellow-300' },
        'squadron': { bg: 'bg-emerald-400/10', text: 'text-emerald-300', border: 'border-emerald-300/40', progress: 'bg-emerald-300' },
        'command': { bg: 'bg-purple-400/10', text: 'text-purple-300', border: 'border-purple-300/40', progress: 'bg-purple-300' },
        'default': { bg: 'bg-white/[0.055]', text: 'text-[#9ca89d]', border: 'border-white/10', progress: 'bg-[#f3b548]' }
    }[colorKey] || { bg: 'bg-white/[0.055]', text: 'text-[#9ca89d]', border: 'border-white/10', progress: 'bg-[#f3b548]' };

    const cardClasses = `relative p-4 rounded-2xl flex flex-col items-center justify-center text-center aspect-square transition-all duration-300 border ${isUnlocked ? `${colorScheme.bg} ${colorScheme.border} shadow-lg` : 'bg-white/[0.025] border-white/10 grayscale opacity-45 hover:opacity-80'}`;
    const iconClasses = isUnlocked ? colorScheme.text : 'text-gray-500';
    const textClasses = isUnlocked ? 'text-[#efe7d5]' : 'text-[#9ca89d]';

    return (
        <button onClick={(e) => onClick(e, achievementId)} className={cardClasses}>
            {!isUnlocked && (
                <span className="absolute right-3 top-3 rounded-full border border-white/10 bg-black/30 p-1 text-[#9ca89d]">
                    <Lock size={14} />
                </span>
            )}
            <div className="flex flex-col items-center justify-center flex-grow">
                <Icon size={36} className={iconClasses} />
                <h3 className={`mt-2 font-bold text-sm ${textClasses}`}>{displayName}</h3>
            </div>
            {(nextTier) && (
                 <div className="w-full mt-2 self-end">
                    <div className="w-full bg-white/10 rounded-full h-1.5">
                        <div className={`${isUnlocked ? colorScheme.progress : 'bg-blue-500'} h-1.5 rounded-full`} style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                    <p className="text-xs text-[#9ca89d] mt-1">
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
                    <Icon size={32} className="text-[#f3b548]" />
                    <h2 className="text-xl font-black text-[#efe7d5]">{achievement.name}</h2>
                </div>
                <p className="text-[#9ca89d] mb-4">{achievement.description}</p>
                {achievement.type === 'tiered' && (
                    <div className="space-y-2">
                        <h3 className="font-semibold text-[#efe7d5]">Tiers:</h3>
                        {achievement.tiers.map((tier, index) => (
                            <div key={tier.name} className={`flex items-center gap-3 p-3 rounded-xl border ${unlockedStatus >= index ? 'border-[#4dd6c6]/35 bg-[#4dd6c6]/10' : 'border-white/10 bg-white/[0.035] opacity-70'}`}>
                                <CheckCircle size={20} className={unlockedStatus >= index ? 'text-[#4dd6c6]' : 'text-[#6f786f]'} />
                                <div>
                                    <p className="font-bold text-[#efe7d5]">{tier.name} ({formatTierValue(tier)})</p>
                                    <p className="text-xs text-[#9ca89d]">{tier.description(tier.value, weightUnit)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex justify-end mt-6">
                    <button onClick={closeModal} className="ee-primary">Close</button>
                </div>
            </div>,
            'lg'
        );
    };

    return (
        <div className="py-5 md:py-8 pb-24">
            <div className="ee-panel mb-6 rounded-2xl p-5 md:p-6">
                <div className="flex items-center gap-3">
                    <Award className="text-[#f3b548]" size={32} />
                    <div>
                        <p className="text-xs font-bold uppercase text-[#f3b548]">Reward grid</p>
                        <h1 className="text-3xl font-black text-[#efe7d5]">Achievements</h1>
                    </div>
                </div>
                <p className="mt-3 text-[#9ca89d]">A trophy hall for every measurable win. Locked awards stay grayed out until the data earns them.</p>
            </div>
            <div className="ee-panel rounded-2xl p-5">
                <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                        <div className="ee-chip"><Trophy size={14} /> Trophy Hall</div>
                        <h2 className="mt-3 text-2xl font-black text-[#efe7d5]">Unlock Gallery</h2>
                    </div>
                    <div className="text-right text-sm text-[#9ca89d]">
                        <span className="block text-2xl font-black text-[#f3b548]">{processedAchievements.filter(a => a.unlockedStatus !== undefined && a.unlockedStatus > -1).length}</span>
                        unlocked
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
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
        </div>
    );
};
