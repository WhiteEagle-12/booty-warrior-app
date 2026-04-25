import { Trophy, Award, CalendarDays, Flame, Zap, Star, TrendingUp, Shield, Pencil, Eye, Crosshair, Gauge, Crown } from 'lucide-react';
import { calculateE1RM, getExerciseDetails, isSetLogComplete, getSetVolume } from '../utils/helpers';
import { getWorkoutForWeek, getWorkoutNameForDay } from '../utils/workout';
import { formatWeight, calculateStreak, getMaxE1RMFor, getBodyweightRatioFor } from '../utils/formatters';
import { exerciseBank } from './exerciseBank';

// Using a generic Weight icon since lucide-react doesn't have a Weight icon
// The original code maps to a 'Weight' component from lucide-react
const Weight = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/><circle cx="12" cy="12" r="4"/>
    </svg>
);

export const achievementsList = {
    total_volume: {
        name: "Total Volume",
        description: "Cumulative weight lifted across all exercises. This is your career tonnage.",
        icon: Weight,
        type: 'tiered',
        unit: 'weight',
        tiers: [
            { name: "Bronze", value: 10000, description: (v, u) => `Lifted a total of ${formatWeight(v, u)}! The journey begins.` },
            { name: "Silver", value: 100000, description: (v, u) => `Lifted a total of ${formatWeight(v, u)}. That's some serious weight!` },
            { name: "Gold", value: 500000, description: (v, u) => `Lifted a total of ${formatWeight(v, u)}. Incredible strength!` },
            { name: "Platinum", value: 1000000, description: (v, u) => `Joined the ${formatWeight(v, u)} club! Truly elite.` },
            { name: "Diamond", value: 2000000, description: (v, u) => `Lifted ${formatWeight(v, u)}. You are a legend.` },
        ],
        getValue: (logs, program) => Object.values(logs).reduce((sum, log) => sum + getSetVolume(log, program.masterExerciseList), 0),
    },
    bench_press_pr: {
        name: "Bench Press Club",
        description: "Achieve new e1RM milestones in any bench press variation.",
        icon: Trophy,
        type: 'tiered',
        unit: 'weight',
        tiers: [
            { name: "135 Club", value: 135, description: (v, u) => `Achieved an e1RM of ${formatWeight(v, u)} (a plate!) on bench press.` },
            { name: "Two Wheels", value: 225, description: (v, u) => `Achieved an e1RM of ${formatWeight(v, u)} (two plates!) on bench press.` },
            { name: "Three Wheels", value: 315, description: (v, u) => `Achieved an e1RM of ${formatWeight(v, u)} (three plates!) on bench press.` },
        ],
        getValue: (logs) => getMaxE1RMFor(logs, 'bench')
    },
    squat_pr: {
        name: "Squat Club",
        description: "Achieve new e1RM milestones in any squat variation.",
        icon: Trophy,
        type: 'tiered',
        unit: 'weight',
        tiers: [
             { name: "Two Wheels", value: 225, description: (v, u) => `Achieved an e1RM of ${formatWeight(v, u)} (two plates!) on the squat.` },
            { name: "Three Wheels", value: 315, description: (v, u) => `Achieved an e1RM of ${formatWeight(v, u)} (three plates!) on the squat.` },
            { name: "Four Wheels", value: 405, description: (v, u) => `Achieved an e1RM of ${formatWeight(v, u)} (four plates!) on the squat.` },
        ],
        getValue: (logs) => getMaxE1RMFor(logs, 'squat')
    },
     deadlift_pr: {
        name: "Deadlift Club",
        description: "Achieve new e1RM milestones in any deadlift variation.",
        icon: Trophy,
        type: 'tiered',
        unit: 'weight',
        tiers: [
            { name: "Two Wheels", value: 225, description: (v, u) => `Achieved an e1RM of ${formatWeight(v,u)} on the deadlift.` },
            { name: "Three Wheels", value: 315, description: (v, u) => `Achieved an e1RM of ${formatWeight(v,u)} on the deadlift.` },
            { name: "Four Wheels", value: 405, description: (v, u) => `Achieved an e1RM of ${formatWeight(v,u)} on the deadlift.` },
            { name: "Five Wheels", value: 495, description: (v, u) => `Achieved an e1RM of ${formatWeight(v,u)} on the deadlift.` },
        ],
        getValue: (logs) => getMaxE1RMFor(logs, 'deadlift')
    },
    bodyweight_bench: {
        name: "Bench Buddy",
        description: "Bench press a multiple of your bodyweight.",
        icon: Weight,
        type: 'tiered',
        unit: 'ratio',
        tiers: [
            { name: "1.0x BW", value: 1.0, description: () => "Benching your bodyweight is a classic milestone." },
            { name: "1.5x BW", value: 1.5, description: () => "Benching 1.5x your bodyweight is seriously strong." },
            { name: "2.0x BW", value: 2.0, description: () => "Benching double your bodyweight is elite." },
        ],
        getValue: (logs, program, bodyWeight, weightUnit, bodyWeightHistory) => {
            return getBodyweightRatioFor(logs, 'bench', bodyWeightHistory);
        }
    },
    bodyweight_squat: {
        name: "Squat Society",
        description: "Squat a multiple of your bodyweight.",
        icon: Weight,
        type: 'tiered',
        unit: 'ratio',
        tiers: [
            { name: "1.5x BW", value: 1.5, description: () => "Squatting 1.5x your bodyweight." },
            { name: "2.0x BW", value: 2.0, description: () => "Squatting 2x your bodyweight. Strong foundation!" },
            { name: "2.5x BW", value: 2.5, description: () => "Squatting 2.5x your bodyweight. Powerful!" },
        ],
        getValue: (logs, program, bodyWeight, weightUnit, bodyWeightHistory) => {
            return getBodyweightRatioFor(logs, 'squat', bodyWeightHistory);
        }
    },
     bodyweight_deadlift: {
        name: "Deadlift Department",
        description: "Deadlift a multiple of your bodyweight.",
        icon: Weight,
        type: 'tiered',
        unit: 'ratio',
        tiers: [
            { name: "2.0x BW", value: 2.0, description: () => "Deadlifting 2x your bodyweight." },
            { name: "2.5x BW", value: 2.5, description: () => "Deadlifting 2.5x your bodyweight. Powerful!" },
            { name: "3.0x BW", value: 3.0, description: () => "Deadlifting 3x your bodyweight. Incredible!" },
        ],
        getValue: (logs, program, bodyWeight, weightUnit, bodyWeightHistory) => {
            return getBodyweightRatioFor(logs, 'deadlift', bodyWeightHistory);
        }
    },
    overhead_overlord: {
        name: "Overhead Overlord",
        description: "Achieve new e1RM milestones in any overhead press variation.",
        icon: Trophy,
        type: 'tiered',
        unit: 'weight',
        tiers: [
            { name: "135 Club", value: 135, description: (v, u) => `Achieved an e1RM of ${formatWeight(v, u)} on overhead press.` },
            { name: "185 Club", value: 185, description: (v, u) => `Achieved an e1RM of ${formatWeight(v, u)} on overhead press.` },
            { name: "225 Club", value: 225, description: (v, u) => `Achieved an e1RM of ${formatWeight(v, u)} on overhead press.` },
        ],
        getValue: (logs, program) => {
            if (!program || !program.masterExerciseList) return 0;
            const ohpExercises = new Set(
                Object.keys(program.masterExerciseList).filter(exName => {
                    const details = program.masterExerciseList[exName];
                    return details?.muscles?.primary === 'Shoulders' && exName.toLowerCase().includes('press');
                })
            );

            if (ohpExercises.size === 0) return 0;

            const relevantLogs = Object.values(logs).filter(l => isSetLogComplete(l) && l.exercise && ohpExercises.has(l.exercise));

            if (relevantLogs.length === 0) return 0;

            return Math.max(0, ...relevantLogs.map(l => calculateE1RM(l.load, l.reps, l.rir)));
        }
    },
    pull_up_pro: {
        name: "Pull-up Pro",
        description: "Complete a high number of strict pull-ups in a single set.",
        icon: Award,
        type: 'tiered',
        unit: 'reps',
        tiers: [
            { name: "10 Reps", value: 10, description: () => "Completed 10 strict pull-ups." },
            { name: "15 Reps", value: 15, description: () => "Completed 15 strict pull-ups." },
            { name: "20 Reps", value: 20, description: () => "Completed 20 strict pull-ups." },
        ],
        getValue: (logs) => {
            const pullupLogs = Object.values(logs).filter(l => isSetLogComplete(l) && l.exercise.toLowerCase().includes('pull-up'));
            if (pullupLogs.length === 0) return 0;
            return Math.max(0, ...pullupLogs.map(l => parseInt(l.reps, 10) || 0));
        }
    },
    workouts_completed: {
        name: "Workouts Completed",
        description: "Total number of workout sessions completed.",
        icon: CalendarDays,
        type: 'tiered',
        unit: 'sessions',
        tiers: [
            { name: "10 Sessions", value: 10, description: () => "Completed 10 workouts." },
            { name: "50 Sessions", value: 50, description: () => "Completed 50 workouts. Keep it up!" },
            { name: "100 Sessions", value: 100, description: () => "Completed 100 workouts. Incredible dedication!" },
        ],
        getValue: (logs, program) => {
            if (!program || !program.info) return 0;
            let count = 0;
            const isDayComplete = (week, dayKey, workoutName) => {
                const workout = getWorkoutForWeek(program, week, workoutName);
                if (!workout || workoutName === 'Rest Day' || workoutName === 'Rest') return true;
                return workout.exercises.every(ex => {
                    const exDetails = getExerciseDetails(ex.name, program.masterExerciseList);
                    if (!exDetails) return false;
                    return Array.from({ length: Number(exDetails.sets) }, (_, i) => i + 1).every(setNum => {
                        return isSetLogComplete(logs[`${week}-${dayKey}-${ex.name}-${setNum}`]);
                    });
                });
            };
            const checkedDays = new Set();
            Object.values(logs).forEach(log => {
                const dayKeyStr = `${log.week}-${log.dayKey}`;
                if (!checkedDays.has(dayKeyStr)) {
                    checkedDays.add(dayKeyStr);
                    const workoutName = getWorkoutNameForDay(program, log.week, log.dayKey) || log.session;
                    if (isDayComplete(log.week, log.dayKey, workoutName)) {
                        count++;
                    }
                }
            });
            return count;
        }
    },
    workout_streak: {
        name: "Workout Streak",
        description: "Number of consecutive scheduled workouts completed.",
        icon: Flame,
        type: 'tiered',
        unit: 'days',
        tiers: [
            { name: "10 Streak", value: 10, description: () => "Completed 10 workouts in a row." },
            { name: "30 Streak", value: 30, description: () => "30 consecutive workouts. Unstoppable!" },
            { name: "50 Streak", value: 50, description: () => "50 consecutive workouts. Legendary!" },
        ],
        getValue: (logs, program) => calculateStreak(logs, program)
    },
    volume_volcano: {
        name: "Volume Volcano",
        description: "Set a new personal record for single-day lifting volume.",
        icon: TrendingUp,
        type: 'single',
        unit: 'weight',
        getValue: (logs, program) => {
            const dailyVolumes = Object.values(logs).reduce((acc, log) => {
                const day = `${log.week}-${log.dayKey}`;
                acc[day] = (acc[day] || 0) + getSetVolume(log, program.masterExerciseList);
                return acc;
            }, {});
            return Math.max(0, ...Object.values(dailyVolumes));
        }
    },
    weekly_avalanche: {
        name: "Weekly Avalanche",
        description: "Set a new personal record for weekly lifting volume.",
        icon: Zap,
        type: 'single',
        unit: 'weight',
        getValue: (logs, program) => {
            const weeklyVolumes = Object.values(logs).reduce((acc, log) => {
                acc[log.week] = (acc[log.week] || 0) + getSetVolume(log, program.masterExerciseList);
                return acc;
            }, {});
            return Math.max(0, ...Object.values(weeklyVolumes));
        }
    },
    rpe_honesty: {
        name: "RPE Honesty",
        description: "Record your Reps in Reserve (RIR) for a large number of sets.",
        icon: Shield,
        type: 'tiered',
        unit: 'sets',
        tiers: [
            { name: "50 Sets", value: 50, description: () => "Logged RIR for 50 sets." },
            { name: "150 Sets", value: 150, description: () => "Logged RIR for 150 sets." },
            { name: "300 Sets", value: 300, description: () => "Logged RIR for 300 sets." },
        ],
        getValue: (logs) => Object.values(logs).filter(l => l.rir !== undefined && l.rir !== null && l.rir !== '').length
    },
    meso_master: {
        name: "Meso Master",
        description: "Complete every single workout in a full mesocycle.",
        icon: Star,
        type: 'single',
        unit: 'boolean',
        getValue: (logs, program) => {
            if (!program || !program.info) return 0;
            const { info, weeklySchedule, workoutOrder, settings } = program;
            const totalWorkouts = info.weeks * weeklySchedule.filter(d => !program.programStructure[d.workout]?.isRest).length;

            let count = 0;
            const isDayComplete = (week, dayKey, workoutName) => {
                const workout = getWorkoutForWeek(program, week, workoutName);
                if (!workout || workoutName === 'Rest Day' || workoutName === 'Rest') return true;
                return workout.exercises.every(ex => {
                    const exDetails = getExerciseDetails(ex.name, program.masterExerciseList);
                    if (!exDetails) return false;
                    return Array.from({ length: Number(exDetails.sets) }, (_, i) => i + 1).every(setNum => {
                        return isSetLogComplete(logs[`${week}-${dayKey}-${ex.name}-${setNum}`]);
                    });
                });
            };

            const checkedDays = new Set();
            Object.values(logs).forEach(log => {
                const dayKeyStr = `${log.week}-${log.dayKey}`;
                if (!checkedDays.has(dayKeyStr)) {
                    checkedDays.add(dayKeyStr);
                    const workoutName = getWorkoutNameForDay(program, log.week, log.dayKey) || log.session;
                    if (isDayComplete(log.week, log.dayKey, workoutName)) {
                        count++;
                    }
                }
            });

            return count >= totalWorkouts && totalWorkouts > 0 ? 1 : 0;
        }
    },
    eagle_eye_precision: {
        name: "Logging Precision",
        description: "Log load, reps, and RIR with disciplined consistency.",
        icon: Eye,
        type: 'tiered',
        unit: 'sets',
        tiers: [
            { name: "25 Sets", value: 25, description: () => "Logged 25 fully complete sets." },
            { name: "100 Sets", value: 100, description: () => "Logged 100 complete sets with clean tracking." },
            { name: "250 Sets", value: 250, description: () => "Logged 250 complete sets. Your data is dialed in." },
        ],
        getValue: (logs) => Object.values(logs).filter(l => isSetLogComplete(l) && !l.skipped).length
    },
    target_acquired: {
        name: "PR Coverage",
        description: "Hit repeated PRs across your exercise roster.",
        icon: Crosshair,
        type: 'tiered',
        unit: 'sessions',
        tiers: [
            { name: "3 PRs", value: 3, description: () => "Established PRs on 3 different exercises." },
            { name: "8 PRs", value: 8, description: () => "Established PRs on 8 different exercises." },
            { name: "15 PRs", value: 15, description: () => "Established PRs on 15 different exercises." },
        ],
        getValue: (logs) => {
            const exercisesWithPrs = new Set();
            Object.values(logs).forEach(log => {
                if (isSetLogComplete(log) && !log.skipped && log.exercise && (log.load || log.load === 0) && log.reps) {
                    exercisesWithPrs.add(log.exercise);
                }
            });
            return exercisesWithPrs.size;
        }
    },
    glute_airspace: {
        name: "Lower-Body Volume",
        description: "Build lower-body tonnage across glute, hip thrust, squat, and lunge work.",
        icon: Gauge,
        type: 'tiered',
        unit: 'weight',
        tiers: [
            { name: "25K", value: 25000, description: (v, u) => `Logged ${formatWeight(v, u)} of lower-body volume.` },
            { name: "125K", value: 125000, description: (v, u) => `Logged ${formatWeight(v, u)} of lower-body volume.` },
            { name: "300K", value: 300000, description: (v, u) => `Logged ${formatWeight(v, u)} of lower-body volume.` },
        ],
        getValue: (logs, program) => {
            const lowerKeywords = ['glute', 'hip thrust', 'squat', 'lunge', 'split squat', 'leg press', 'rdl', 'romanian', 'deadlift'];
            return Object.values(logs).reduce((sum, log) => {
                const name = (log.exercise || '').toLowerCase();
                return lowerKeywords.some(keyword => name.includes(keyword))
                    ? sum + getSetVolume(log, program.masterExerciseList)
                    : sum;
            }, 0);
        }
    },
    command_elite: {
        name: "Long-Term Consistency",
        description: "Complete a deep run of training sessions.",
        icon: Crown,
        type: 'tiered',
        unit: 'sessions',
        tiers: [
            { name: "25 Workouts", value: 25, description: () => "Completed 25 workouts." },
            { name: "75 Workouts", value: 75, description: () => "Completed 75 workouts." },
            { name: "150 Workouts", value: 150, description: () => "Completed 150 workouts." },
        ],
        getValue: (logs, program) => achievementsList.workouts_completed.getValue(logs, program)
    },
    posterior_chain_pilot: {
        name: "Posterior-Chain Volume",
        description: "Build volume across hamstrings, glutes, hip hinges, and back extensions.",
        icon: Zap,
        type: 'tiered',
        unit: 'weight',
        tiers: [
            { name: "20K", value: 20000, description: (v, u) => `Logged ${formatWeight(v, u)} of posterior-chain volume.` },
            { name: "100K", value: 100000, description: (v, u) => `Logged ${formatWeight(v, u)} of posterior-chain volume.` },
            { name: "250K", value: 250000, description: (v, u) => `Logged ${formatWeight(v, u)} of posterior-chain volume.` },
        ],
        getValue: (logs, program) => {
            const keywords = ['deadlift', 'rdl', 'romanian', 'hip thrust', 'glute', 'hamstring', 'leg curl', 'back extension', 'good morning', 'pull-through'];
            return Object.values(logs).reduce((sum, log) => {
                const name = (log.exercise || '').toLowerCase();
                return keywords.some(keyword => name.includes(keyword)) ? sum + getSetVolume(log, program.masterExerciseList) : sum;
            }, 0);
        }
    },
    balanced_airframe: {
        name: "Balanced Training",
        description: "Log meaningful work for every major muscle group.",
        icon: Shield,
        type: 'tiered',
        unit: 'sessions',
        tiers: [
            { name: "4 Groups", value: 4, description: () => "Logged complete sets for 4 different primary muscle groups." },
            { name: "7 Groups", value: 7, description: () => "Logged complete sets for 7 different primary muscle groups." },
            { name: "10 Groups", value: 10, description: () => "Logged complete sets for 10 different primary muscle groups." },
        ],
        getValue: (logs, program) => {
            const groups = new Set();
            Object.values(logs).forEach(log => {
                if (!isSetLogComplete(log) || log.skipped) return;
                const details = getExerciseDetails(log.exercise, program.masterExerciseList);
                if (details?.muscles?.primary) groups.add(details.muscles.primary);
            });
            return groups.size;
        }
    },
    black_box_data: {
        name: "Training Dataset",
        description: "Build a deep historical dataset of useful training logs.",
        icon: Eye,
        type: 'tiered',
        unit: 'sets',
        tiers: [
            { name: "100 Logs", value: 100, description: () => "Captured 100 complete training logs." },
            { name: "500 Logs", value: 500, description: () => "Captured 500 complete training logs." },
            { name: "1000 Logs", value: 1000, description: () => "Captured 1000 complete training logs." },
        ],
        getValue: (logs) => Object.values(logs).filter(log => isSetLogComplete(log) && !log.skipped && log.date).length
    },
    volume_repeatability: {
        name: "Weekly Volume Consistency",
        description: "Stack productive weeks with logged tonnage.",
        icon: CalendarDays,
        type: 'tiered',
        unit: 'sessions',
        tiers: [
            { name: "3 Weeks", value: 3, description: () => "Logged volume in 3 different weeks." },
            { name: "6 Weeks", value: 6, description: () => "Logged volume in 6 different weeks." },
            { name: "12 Weeks", value: 12, description: () => "Logged volume in 12 different weeks." },
        ],
        getValue: (logs, program) => {
            const weeks = new Set();
            Object.values(logs).forEach(log => {
                if (getSetVolume(log, program.masterExerciseList) > 0) weeks.add(log.week);
            });
            return weeks.size;
        }
    },
    rir_specialist: {
        name: "RIR Specialist",
        description: "Keep effort tracking consistent instead of guessing.",
        icon: Crosshair,
        type: 'tiered',
        unit: 'sets',
        tiers: [
            { name: "50 RIR Logs", value: 50, description: () => "Logged RIR for 50 completed sets." },
            { name: "250 RIR Logs", value: 250, description: () => "Logged RIR for 250 completed sets." },
            { name: "750 RIR Logs", value: 750, description: () => "Logged RIR for 750 completed sets." },
        ],
        getValue: (logs) => Object.values(logs).filter(log => isSetLogComplete(log) && !log.skipped && log.rir !== '').length
    },
    bodyweight_signal: {
        name: "Bodyweight Tracking",
        description: "Maintain bodyweight context for strength ratios and trend analysis.",
        icon: Gauge,
        type: 'tiered',
        unit: 'sessions',
        tiers: [
            { name: "3 Weigh-ins", value: 3, description: () => "Logged bodyweight 3 times." },
            { name: "10 Weigh-ins", value: 10, description: () => "Logged bodyweight 10 times." },
            { name: "25 Weigh-ins", value: 25, description: () => "Logged bodyweight 25 times." },
        ],
        getValue: (logs, program, bodyWeight, weightUnit, bodyWeightHistory) => (bodyWeightHistory || []).filter(entry => parseFloat(entry?.weight) > 0).length
    },
    the_architect: {
        name: "The Architect",
        description: "Create a custom exercise in the program editor.",
        icon: Pencil,
        type: 'single',
        unit: 'boolean',
        getValue: (logs, program) => {
            const presetExercises = new Set(Object.keys(exerciseBank));
            const customExercises = Object.keys(program.masterExerciseList).filter(ex => !presetExercises.has(ex));
            return customExercises.length > 0 ? 1 : 0;
        }
    }
};
