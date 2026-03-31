import { calculateE1RM, getExerciseDetails } from './helpers';

export const findLastPerformanceLogs = (exerciseName, currentWeek, currentDayKey, allLogs, programData, sessionHistoryCount = 5) => {
    const dayOrder = (programData?.weeklySchedule || []).reduce((acc, day, index) => {
        acc[day.day] = index;
        return acc;
    }, {});
    const scheduleLength = programData?.weeklySchedule?.length || 7;

    const getDayIndex = (dayKey) => {
        if (dayOrder[dayKey] !== undefined) return dayOrder[dayKey];
        const match = dayKey.match(/\d+$/);
        if (match) return parseInt(match[0], 10) -1;
        return 99;
    };

    const allSessions = {};

    for (const logId in allLogs) {
        const log = allLogs[logId];
        if (log.exercise === exerciseName && !log.skipped && (log.load || log.load === 0) && log.reps) {
            const sessionKey = `${log.week}-${log.dayKey}`;
            if (!allSessions[sessionKey]) {
                const dayIndex = getDayIndex(log.dayKey);
                const logDayNum = (log.week - 1) * scheduleLength + dayIndex;
                allSessions[sessionKey] = { week: log.week, dayKey: log.dayKey, dayNum: logDayNum, logs: [] };
            }
            allSessions[sessionKey].logs.push(log);
        }
    }
    
    const currentDayIndex = getDayIndex(currentDayKey);
    const currentDayNum = (currentWeek - 1) * scheduleLength + currentDayIndex;
    
    const pastSessions = Object.values(allSessions)
        .filter(session => session.dayNum < currentDayNum)
        .sort((a, b) => b.dayNum - a.dayNum);

    if (pastSessions.length === 0) return { lastSession: null, historicalSessions: [] };
    
    const lastSessionLogs = pastSessions[0].logs.reduce((acc, log) => { acc[log.set] = log; return acc; }, {});
    
    return {
        lastSession: lastSessionLogs,
        historicalSessions: pastSessions.slice(0, sessionHistoryCount)
    };
};

export const getProgressionSuggestion = (exerciseName, lastPerformanceData, masterList, programData) => {
    const { lastSession, historicalSessions } = lastPerformanceData;

    if (!lastSession) {
        return "This is your first time doing this exercise. Focus on good form and finding a challenging weight for the target reps.";
    }

    const exerciseDetails = getExerciseDetails(exerciseName, masterList);
    if (!exerciseDetails) return "Log your first set to get a baseline.";

    const [minRepsStr, maxRepsStr] = (exerciseDetails.reps || '0-0').split('-');
    const minReps = parseInt(minRepsStr, 10);
    const maxReps = parseInt(maxRepsStr, 10);

    const lastSets = Object.values(lastSession);
    const lastTopSet = lastSets.reduce((best, current) => (!best || calculateE1RM(current.load, current.reps, current.rir) > calculateE1RM(best.load, best.reps, best.rir) ? current : best), null);
    if (!lastTopSet) return "Log your first set to get a baseline.";

    const lastReps = parseInt(lastTopSet.reps, 10);
    const lastWeight = parseFloat(lastTopSet.load);
    const lastRir = parseInt(lastTopSet.rir, 10) || 0;
    
    // Get target RIR for this set (using first set as baseline if we can't determine)
    const setIndex = Math.max(0, parseInt(lastTopSet.set, 10) - 1);
    const targetRirStr = exerciseDetails.rir && exerciseDetails.rir[setIndex] ? exerciseDetails.rir[setIndex].toString() : '1-2';
    // Parse target RIR (e.g. "1-2" -> 1.5, "0" -> 0)
    let targetRirAvg = 1.5;
    if (targetRirStr.includes('-')) {
        const parts = targetRirStr.split('-');
        targetRirAvg = (parseInt(parts[0], 10) + parseInt(parts[1], 10)) / 2;
    } else {
        targetRirAvg = parseInt(targetRirStr, 10) || 0;
    }

    const historicalE1RMs = historicalSessions
        .map(s => Math.max(...s.logs.map(l => calculateE1RM(l.load, l.reps, l.rir))))
        .reverse();

    let trend = "stable";
    if (historicalE1RMs.length > 2) {
        const latestE1RM = historicalE1RMs[historicalE1RMs.length - 1];
        const avgPreviousE1RM = historicalE1RMs.slice(0, -1).reduce((a, b) => a + b, 0) / (historicalE1RMs.length - 1);
        if (latestE1RM > avgPreviousE1RM * 1.02) trend = "improving";
        if (latestE1RM < avgPreviousE1RM * 0.98) trend = "declining";
    }

    // Advanced setting for RIR warning
    const rirWarningThreshold = programData?.settings?.rirWarningThreshold ?? 3;

    // RIR Feedback Check
    if (lastRir >= rirWarningThreshold && lastRir > targetRirAvg + 1) {
        return `You left a lot in the tank last time (${lastRir} RIR). Push closer to failure (Target: ~${targetRirStr} RIR) to maximize hypertrophy!`;
    }
    if (lastRir < targetRirAvg - 1 && targetRirAvg > 0) {
        return `You went closer to failure than intended last time (${lastRir} RIR). Consider keeping ~${targetRirStr} reps in reserve to manage fatigue.`;
    }

    // Helper to calculate theoretical load for target reps
    const calculateTargetLoad = (e1rm, targetReps, targetRir) => {
        const effectiveReps = targetReps + targetRir;
        const load = e1rm / (1 + (effectiveReps / 30));
        let increment = 5;
        if (['barbell'].includes(exerciseDetails.equipment)) increment = 5;
        if (['dumbbell', 'kettlebell'].includes(exerciseDetails.equipment)) increment = 5;
        return Math.round(load / increment) * increment;
    };

    const targetRepsAvg = Math.round((minReps + maxReps) / 2);
    const lastE1RM = calculateE1RM(lastWeight, lastReps, lastRir);

    if (lastReps > maxReps) {
        if (exerciseDetails.equipment === 'bodyweight') return `You crushed the rep range! Add weight or aim for ${lastReps + 1} reps. You're getting stronger!`;
        
        let newWeight = calculateTargetLoad(lastE1RM, targetRepsAvg, targetRirAvg);
        // Ensure it actually increases
        if (newWeight <= lastWeight) newWeight = lastWeight + 5;

        if (trend === "improving") {
            return `Trend is up! Let's bump the weight to ${newWeight} lbs/kg to stay in the ${minReps}-${maxReps} rep range.`;
        }
        return `You exceeded the top of the rep range. Try increasing weight to ${newWeight} lbs/kg for ${minReps}-${maxReps} reps.`;
    }
    
    if (lastReps >= minReps && lastReps <= maxReps) {
        if (trend === "declining") {
            return `Strength seems to be trending down. Let's focus on hitting ${lastReps} reps with solid form at ${lastWeight} lbs/kg before pushing for more.`;
        }
        return `You're in the sweet spot. Aim for ${Math.min(maxReps, lastReps + 1)} reps with ${lastWeight} lbs/kg (Target: ~${targetRirStr} RIR).`;
    }

    if (lastReps < minReps) {
        if (exerciseDetails.equipment === 'bodyweight') return `Keep practicing! Try using bands or an easier variation to hit ${minReps}+ reps.`;

        let newWeight = calculateTargetLoad(lastE1RM, targetRepsAvg, targetRirAvg);
        // Ensure it actually decreases
        if (newWeight >= lastWeight) newWeight = Math.max(0, lastWeight - 5);

        return `Last session was below the target rep range. Try lowering weight to ~${newWeight} lbs/kg to hit ${minReps}-${maxReps} reps with good form.`;
    }

    return `Last: ${lastWeight}x${lastReps} @ ${lastRir} RIR. Aim for the ${minReps}-${maxReps} rep range.`;
};
