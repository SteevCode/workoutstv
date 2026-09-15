class Stats {
    constructor(storeInstance) {
        this.store = storeInstance;
    }

    calculateWorkoutStats(workoutData) {
        let volume = 0;
        let setsCompleted = 0;
        let xpGained = 0;

        workoutData.exercises.forEach(ex => {
            ex.sets.forEach(set => {
                if (set.completed) {
                    setsCompleted++;
                    const w = parseFloat(set.weight) || 0;
                    const r = parseInt(set.reps) || 0;
                    volume += (w * r);

                    // Basic XP rule per completed set
                    // Compound vs Isolation could be distinguished by muscle groups (e.g. chest vs biceps),
                    // but for simplicity, we award a flat amount per rep/weight or set.
                    // Let's do 5 XP per set as base.
                    xpGained += 5;
                }
            });
        });

        return { volume, setsCompleted, xpGained };
    }

    updateProfileAfterWorkout(dateString, workoutData) {
        if (workoutData.xpAwarded) return; // Prevent duplicate XP

        const stats = this.calculateWorkoutStats(workoutData);
        const profile = this.store.getProfile();
        
        profile.xp += stats.xpGained;
        // bonus for finishing workout
        if (workoutData.completed) {
            profile.xp += 50;
        }

        // Calculate Level (e.g. level up every 1000 XP)
        profile.level = Math.floor(profile.xp / 1000) + 1;
        
        profile.workouts += 1;

        // Streaks
        // simple logic: check if yesterday was completed
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        const yesterdayWorkout = this.store.getWorkout(yesterdayStr);
        if (yesterdayWorkout && yesterdayWorkout.completed) {
            profile.streak += 1;
        } else {
            // Also need to consider if yesterday was a planned rest day?
            const yesterdayPlan = getPlanForDay(getDayName(yesterdayStr));
            if (yesterdayPlan && yesterdayPlan.exercises.length === 0) {
                // it was a rest day, keep streak alive maybe?
                // we'll just keep it simple: streak increments if worked out.
            } else {
                profile.streak = 1;
            }
        }
        
        if (profile.streak > profile.longestStreak) {
            profile.longestStreak = profile.streak;
        }

        this.store.saveProfile(profile);

        workoutData.xpAwarded = true;
        this.store.saveWorkout(dateString, workoutData);
    }

    getPreviousExercisePerformance(exerciseId) {
        const workouts = this.store.getWorkouts();
        let lastPerf = null;
        let lastDate = null;

        // Sort dates descending
        const dates = Object.keys(workouts).sort((a, b) => new Date(b) - new Date(a));
        
        for (let date of dates) {
            const w = workouts[date];
            if (w.exercises) {
                const ex = w.exercises.find(e => e.id === exerciseId);
                if (ex && ex.sets.some(s => s.completed)) {
                    lastPerf = ex.sets.filter(s => s.completed);
                    lastDate = date;
                    break;
                }
            }
        }
        
        return { lastDate, sets: lastPerf };
    }

    getGlobalStats() {
        const workouts = this.store.getWorkouts();
        let totalVolume = 0;
        let totalSets = 0;
        let totalReps = 0;
        let muscleStats = {};
        
        for (let date in workouts) {
            const w = workouts[date];
            if (!w.completed) continue;

            w.exercises.forEach(ex => {
                let exVolume = 0;
                let exSets = 0;
                
                ex.sets.forEach(set => {
                    if (set.completed) {
                        const wgt = parseFloat(set.weight) || 0;
                        const r = parseInt(set.reps) || 0;
                        exVolume += (wgt * r);
                        exSets++;
                        
                        totalVolume += (wgt * r);
                        totalSets++;
                        totalReps += r;
                    }
                });

                if (ex.muscleGroups) {
                    ex.muscleGroups.forEach(m => {
                        if (!muscleStats[m]) {
                            muscleStats[m] = { sessions: 0, sets: 0, volume: 0, _trackedDate: null };
                        }
                        muscleStats[m].sets += exSets;
                        muscleStats[m].volume += exVolume;
                        if (muscleStats[m]._trackedDate !== date && exSets > 0) {
                            muscleStats[m].sessions++;
                            muscleStats[m]._trackedDate = date;
                        }
                    });
                }
            });
        }

        return { totalVolume, totalSets, totalReps, muscleStats };
    }
}

const stats = new Stats(store);
