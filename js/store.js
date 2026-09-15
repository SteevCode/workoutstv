class Store {
    constructor() {
        this.init();
    }

    init() {
        if (!localStorage.getItem('workoutstv_workouts')) {
            localStorage.setItem('workoutstv_workouts', JSON.stringify({}));
        }
        if (!localStorage.getItem('workoutstv_profile')) {
            localStorage.setItem('workoutstv_profile', JSON.stringify({
                weight: "70",
                height: "160",
                xp: 0,
                level: 1,
                streak: 0,
                longestStreak: 0,
                workouts: 0
            }));
        }
        if (!localStorage.getItem('workoutstv_custom_exercises')) {
            localStorage.setItem('workoutstv_custom_exercises', JSON.stringify([]));
        }
    }

    getWorkouts() {
        return JSON.parse(localStorage.getItem('workoutstv_workouts'));
    }

    saveWorkouts(workouts) {
        localStorage.setItem('workoutstv_workouts', JSON.stringify(workouts));
    }

    getWorkout(dateString) {
        const workouts = this.getWorkouts();
        return workouts[dateString] || null;
    }

    saveWorkout(dateString, workoutData) {
        const workouts = this.getWorkouts();
        workouts[dateString] = workoutData;
        this.saveWorkouts(workouts);
    }

    getProfile() {
        return JSON.parse(localStorage.getItem('workoutstv_profile'));
    }

    saveProfile(profile) {
        localStorage.setItem('workoutstv_profile', JSON.stringify(profile));
    }

    getCustomExercises() {
        return JSON.parse(localStorage.getItem('workoutstv_custom_exercises'));
    }

    addCustomExercise(exercise) {
        const custom = this.getCustomExercises();
        custom.push(exercise);
        localStorage.setItem('workoutstv_custom_exercises', JSON.stringify(custom));
    }

    exportData() {
        const data = {
            workouts: this.getWorkouts(),
            profile: this.getProfile(),
            customExercises: this.getCustomExercises()
        };
        return JSON.stringify(data, null, 2);
    }

    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (data.workouts && data.profile) {
                localStorage.setItem('workoutstv_workouts', JSON.stringify(data.workouts));
                localStorage.setItem('workoutstv_profile', JSON.stringify(data.profile));
                if (data.customExercises) {
                    localStorage.setItem('workoutstv_custom_exercises', JSON.stringify(data.customExercises));
                }
                return true;
            }
            return false;
        } catch (e) {
            console.error("Import failed:", e);
            return false;
        }
    }
}

const store = new Store();
