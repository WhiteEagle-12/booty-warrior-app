// --- HELPERS ---
export const generateUUID = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

export const calculateE1RM = (weight, reps, rir) => {
    const numWeight = parseFloat(weight);
    const numReps = parseInt(reps, 10);
    const numRir = parseInt(rir, 10) || 0;

    if (isNaN(numWeight) || isNaN(numReps) || numReps < 1) return 0;
    
    const effectiveReps = numReps + numRir;
    if (effectiveReps <= 1) return Math.round(numWeight);

    // Using the Epley formula
    return Math.round(numWeight * (1 + (effectiveReps / 30)));
};

export const getExerciseDetails = (exerciseName, masterList) => {
    const list = masterList?.masterExerciseList || masterList;
    return normalizeExerciseDetails(list?.[exerciseName] || null);
};

export const normalizeMuscleContributions = (muscles = {}) => {
    const normalized = {
        ...muscles,
        primaryContribution: muscles.primary ? 1 : 0,
        secondaryContribution: muscles.secondary ? 0.5 : 0,
        tertiaryContribution: muscles.tertiary ? 0.5 : 0,
    };
    return normalized;
};

export const normalizeExerciseDetails = (details) => {
    if (!details) return null;
    return {
        ...details,
        muscles: normalizeMuscleContributions(details.muscles || {}),
    };
};

export const getSetVolume = (log, masterExerciseList) => {
    if (!log || log.skipped || (log.load !== 0 && !log.load) || !log.reps) return 0;
    const volume = parseFloat(log.load) * parseInt(log.reps, 10);
    const details = getExerciseDetails(log.exercise, masterExerciseList);
    if (details?.equipment === 'dumbbell' || details?.equipment === 'kettlebell') {
        return volume * 2;
    }
    return volume;
};

// Centralized, robust helper function for checking set completion.
export const isSetLogComplete = (log) => {
    if (!log) return false;
    if (log.skipped) return true;
    const isLoadValid = log.load === 0 || (log.load && !isNaN(parseFloat(log.load)));
    const areRepsValid = log.reps && !isNaN(parseInt(log.reps, 10)) && log.reps !== '';
    const isRirValid = log.rir !== undefined && log.rir !== null && log.rir !== '' && !isNaN(parseInt(log.rir, 10));
    return isLoadValid && areRepsValid && isRirValid;
};
