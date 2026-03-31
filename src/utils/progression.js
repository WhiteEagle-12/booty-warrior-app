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
    
    // Getting the target RIR for set 1 as a baseline
    let targetRir = 0;
    if (exerciseDetails.rir && exerciseDetails.rir.length > 0) {
        const rirMatch = String(exerciseDetails.rir[0]).match(/\d+/);
        if (rirMatch) targetRir = parseInt(rirMatch[0], 10);
    }

    const rirThreshold = programData?.settings?.rirThreshold ?? 3;

    const lastSets = Object.values(lastSession);
    const lastTopSet = lastSets.reduce((best, current) => (!best || calculateE1RM(current.load, current.reps, current.rir) > calculateE1RM(best.load, best.reps, best.rir) ? current : best), null);
    if (!lastTopSet) return "Log your first set to get a baseline.";

    const lastReps = parseInt(lastTopSet.reps, 10);
    const lastWeight = parseFloat(lastTopSet.load);
    const lastRir = parseInt(lastTopSet.rir, 10);
    
    // Suggest getting closer to failure
    if (lastRir > rirThreshold) {
        return `Last set was ${lastWeight}x${lastReps} with ${lastRir} RIR. You should aim to get closer to failure (<= ${rirThreshold} RIR). Consider adding weight or pushing for more reps.`;
    }

    if (lastRir > targetRir + 1) {
        return `Last set was ${lastRir} RIR, but target is ~${targetRir} RIR. Push a bit harder or add weight to get closer to failure.`;
    } else if (lastRir < targetRir - 1) {
        return `Last set was ${lastRir} RIR, which is past the target of ~${targetRir} RIR. You might want to back off slightly if form broke down.`;
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

    let increment = 5;
    if (['dumbbell', 'kettlebell'].includes(exerciseDetails.equipment)) increment = 5; 

    // Suggest increasing weight to get back in rep range if over max reps
    if (lastReps > maxReps) {
        if (exerciseDetails.equipment === 'bodyweight') return `You hit ${lastReps} reps! Try adding weight to stay in the ${minReps}-${maxReps} rep range.`;
        
        // Calculate appropriate weight jump. Epley formula estimate
        // E1RM = w * (1 + r/30)
        // Target w = E1RM / (1 + target_reps/30)
        let lastE1RM = calculateE1RM(lastWeight, lastReps, lastRir);
        let targetRepsMiddle = (minReps + maxReps) / 2;
        let estimatedNewWeight = lastE1RM / (1 + (targetRepsMiddle + targetRir) / 30);
        
        let calculatedDiff = estimatedNewWeight - lastWeight;
        let proposedIncrement = Math.max(increment, Math.round(calculatedDiff / increment) * increment);
        const newWeight = lastWeight + proposedIncrement;
        
        if (trend === "improving") {
            return `Trend is up and you exceeded the rep range! Try increasing weight by ${proposedIncrement} lbs/kg to ${newWeight} lbs/kg for ${minReps}-${maxReps} reps.`;
        }
        return `You exceeded the target rep range. Try increasing weight by ${proposedIncrement} lbs/kg to ${newWeight} lbs/kg for ${minReps}-${maxReps} reps.`;
    }

    if (lastReps === maxReps && lastRir <= (targetRir + 1)) {
        if (exerciseDetails.equipment === 'bodyweight') return `Add weight or aim for ${lastReps + 1} reps. You're getting stronger!`;
        const newWeight = lastWeight + increment;
        if (trend === "improving") {
            return `Trend is up! Let's increase the weight. Try for ${newWeight} lbs/kg in the ${minReps}-${maxReps} rep range.`;
        }
        return `You hit the top of the rep range. Try increasing weight to ${newWeight} lbs/kg for ${minReps}-${maxReps} reps.`;
    }
    
    if (lastReps >= minReps && lastReps < maxReps) {
        if (trend === "declining") {
            return `Strength seems to be trending down. Let's focus on hitting ${lastReps} reps with solid form at ${lastWeight} lbs/kg before pushing for more.`;
        }
        return `You're in the sweet spot. Aim for ${lastReps + 1} reps with ${lastWeight} lbs/kg to progress within the rep range.`;
    }

    if (lastReps < minReps) {
        const newWeight = Math.max(0, lastWeight - increment);
        return `Last session was below the target rep range. Try lowering weight to ~${newWeight} lbs/kg to hit ${minReps}-${maxReps} reps with good form.`;
    }

    return `Last: ${lastWeight}x${lastReps}. Aim for the ${minReps}-${maxReps} rep range.`;
};
