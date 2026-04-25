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

const parseRepTarget = (rawReps) => {
    const label = String(rawReps || '').trim();
    const lower = label.toLowerCase();
    const numbers = [...label.matchAll(/\d+(?:\.\d+)?/g)].map(match => Number(match[0]));

    return {
        label: label || 'the programmed target',
        min: numbers.length > 0 ? numbers[0] : null,
        max: numbers.length > 1 ? numbers[1] : (numbers.length === 1 ? numbers[0] : null),
        isFailureTarget: /failure|amrap|max/.test(lower),
        isTimedTarget: /sec|second|min|minute/.test(lower),
    };
};

const parseRirTarget = (rirValues) => {
    const firstTarget = Array.isArray(rirValues) ? rirValues.find(value => value !== undefined && value !== null && value !== '') : rirValues;
    const targetText = String(firstTarget ?? '').toLowerCase();
    if (/failure|fail|0/.test(targetText)) return 0;

    const match = targetText.match(/\d+(?:\.\d+)?/);
    return match ? Number(match[0]) : 1;
};

const getLoadIncrement = (equipment, weightUnit) => {
    const lowerEquipment = String(equipment || '').toLowerCase();
    if (lowerEquipment.includes('dumbbell') || lowerEquipment.includes('kettlebell')) return weightUnit === 'kg' ? 2 : 5;
    if (lowerEquipment.includes('machine') || lowerEquipment.includes('cable')) return weightUnit === 'kg' ? 2.5 : 5;
    if (lowerEquipment.includes('bodyweight') || lowerEquipment.includes('band')) return 0;
    return weightUnit === 'kg' ? 2.5 : 5;
};

const toDisplayLoad = (load, weightUnit) => weightUnit === 'kg' ? load / 2.20462 : load;

const formatLoad = (load, weightUnit) => `${Math.max(0, Math.round(toDisplayLoad(load, weightUnit) * 10) / 10)} ${weightUnit}`;

const roundToIncrement = (value, increment) => {
    if (!increment || increment <= 0) return value;
    return Math.round(value / increment) * increment;
};

const getBestLoggedSet = (sets) => {
    return sets.reduce((best, current) => {
        const load = parseFloat(current.load);
        const reps = parseInt(current.reps, 10);
        if (Number.isNaN(load) || Number.isNaN(reps) || reps < 1) return best;

        const score = calculateE1RM(load, reps, current.rir);
        if (!best || score > best.score) return { ...current, load, reps, rir: parseFloat(current.rir), score };
        return best;
    }, null);
};

export const getProgressionSuggestion = (exerciseName, lastPerformanceData, masterList, programData, weightUnit = 'lbs') => {
    const { lastSession, historicalSessions = [] } = lastPerformanceData || {};

    if (!lastSession) {
        return "No previous session found. Pick a conservative load, stay inside the target rep range, and record RIR so future suggestions have a baseline.";
    }

    const exerciseDetails = getExerciseDetails(exerciseName, masterList);
    if (!exerciseDetails) return "This exercise is missing from the exercise list. Confirm its sets, reps, and RIR target before using progression advice.";

    const repTarget = parseRepTarget(exerciseDetails.reps);
    const minReps = repTarget.min;
    const maxReps = repTarget.max;
    const targetRir = parseRirTarget(exerciseDetails.rir);

    const rirThreshold = programData?.settings?.rirThreshold ?? 3;

    const lastSets = Object.values(lastSession);
    const lastTopSet = getBestLoggedSet(lastSets);
    if (!lastTopSet) return "The last session does not have a complete load and rep entry. Repeat the planned prescription and log load, reps, and RIR.";

    const lastReps = lastTopSet.reps;
    const lastWeight = lastTopSet.load;
    const lastRir = Number.isNaN(lastTopSet.rir) ? null : lastTopSet.rir;
    const increment = getLoadIncrement(exerciseDetails.equipment, weightUnit);
    const isBodyweightStyle = increment === 0;
    const loadText = isBodyweightStyle && lastWeight === 0 ? 'bodyweight' : formatLoad(lastWeight, weightUnit);

    if (lastRir === null) {
        return `Last session had ${lastReps} reps at ${loadText}, but RIR was missing. Repeat the load and log RIR before changing the prescription.`;
    }

    if (lastRir > rirThreshold) {
        return `Last top set was ${lastReps} reps at ${loadText} with ${lastRir} RIR. Keep the same load and push closer to the programmed effort, or add load only if form stays solid.`;
    }
    if (lastRir > targetRir + 1) {
        return `Last set was easier than planned (${lastRir} RIR vs ~${targetRir}). Keep the load and add reps, or make the smallest load jump if you are already near the top of the rep range.`;
    } else if (lastRir < targetRir - 1) {
        return `Last set was harder than planned (${lastRir} RIR vs ~${targetRir}). Repeat the load if form was clean; reduce slightly if reps slowed or technique broke down.`;
    }

    const historicalE1RMs = historicalSessions
        .map(s => {
            const bestSet = getBestLoggedSet(s.logs);
            return bestSet?.score || 0;
        })
        .filter(score => score > 0)
        .reverse();

    let trend = "stable";
    if (historicalE1RMs.length > 2) {
        const latestE1RM = historicalE1RMs[historicalE1RMs.length - 1];
        const avgPreviousE1RM = historicalE1RMs.slice(0, -1).reduce((a, b) => a + b, 0) / (historicalE1RMs.length - 1);
        if (latestE1RM > avgPreviousE1RM * 1.02) trend = "improving";
        if (latestE1RM < avgPreviousE1RM * 0.98) trend = "declining";
    }

    if (!minReps || !maxReps) {
        if (repTarget.isFailureTarget) {
            if (isBodyweightStyle) return `Last top set was ${lastReps} reps at ${loadText}. Add reps until performance stalls, then add external load or a harder variation.`;
            return `Last top set was ${lastReps} reps at ${loadText}. Progress only when reps increase at similar RIR; otherwise repeat the load.`;
        }
        return `The programmed rep target is "${repTarget.label}", so the app cannot calculate a precise load jump. Repeat the last load and progress by matching the target with similar RIR.`;
    }

    if (repTarget.isTimedTarget) {
        if (lastReps >= maxReps && lastRir <= targetRir + 1) {
            return `You reached the top of the timed target. Add a small load, use a harder variation, or extend the hold only if position stays clean.`;
        }
        return `Stay within the timed target and improve position quality before adding load or duration.`;
    }

    if (lastReps > maxReps) {
        if (isBodyweightStyle) return `You exceeded the ${repTarget.label} target. Add external load, choose a harder variation, or slow the tempo to bring reps back into range.`;

        const lastE1RM = calculateE1RM(lastWeight, lastReps, lastRir);
        const targetRepsMiddle = (minReps + maxReps) / 2;
        const estimatedNewWeight = lastE1RM / (1 + (targetRepsMiddle + targetRir) / 30);
        const calculatedDiff = toDisplayLoad(estimatedNewWeight - lastWeight, weightUnit);
        const proposedIncrement = Math.max(increment, roundToIncrement(calculatedDiff, increment));
        const newWeightDisplay = toDisplayLoad(lastWeight, weightUnit) + proposedIncrement;

        if (trend === "improving") {
            return `Trend is up and you exceeded the rep range. Try ${newWeightDisplay.toFixed(1).replace(/\.0$/, '')} ${weightUnit} for ${minReps}-${maxReps} reps.`;
        }
        return `You exceeded the target rep range. Try ${newWeightDisplay.toFixed(1).replace(/\.0$/, '')} ${weightUnit} and aim for ${minReps}-${maxReps} reps.`;
    }

    if (lastReps === maxReps && lastRir <= (targetRir + 1)) {
        if (isBodyweightStyle) return `You hit the top of the range. Add load, choose a harder variation, or aim for one more rep if the program allows it.`;
        const newWeightDisplay = toDisplayLoad(lastWeight, weightUnit) + increment;
        if (trend === "improving") {
            return `Trend is up. Try ${newWeightDisplay.toFixed(1).replace(/\.0$/, '')} ${weightUnit} while staying in the ${minReps}-${maxReps} rep range.`;
        }
        return `You hit the top of the rep range. Try ${newWeightDisplay.toFixed(1).replace(/\.0$/, '')} ${weightUnit} for ${minReps}-${maxReps} reps.`;
    }
    
    if (lastReps >= minReps && lastReps < maxReps) {
        if (trend === "declining") {
            return `Recent top sets are trending down. Repeat ${loadText} and match at least ${lastReps} reps before adding load.`;
        }
        return `Stay at ${loadText} and aim for ${lastReps + 1} reps while keeping RIR near ${targetRir}.`;
    }

    if (lastReps < minReps) {
        if (isBodyweightStyle) return `Last session was below the target range. Use an easier variation or assisted setup until you can reach ${minReps}-${maxReps} reps.`;
        const newWeightDisplay = Math.max(0, toDisplayLoad(lastWeight, weightUnit) - increment);
        return `Last session was below the target range. Try ${newWeightDisplay.toFixed(1).replace(/\.0$/, '')} ${weightUnit} so you can reach ${minReps}-${maxReps} reps with clean technique.`;
    }

    return `Last top set was ${lastReps} reps at ${loadText}. Aim for ${minReps}-${maxReps} reps near ${targetRir} RIR.`;
};
