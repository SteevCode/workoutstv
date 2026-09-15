const plan = {
    "monday": {
        name: "Chest Day",
        exercises: [
            { id: "barbell_bench_press", name: "Barbell Bench Press", muscleGroups: ["chest", "triceps"], sets: 3, targetReps: "4-6" },
            { id: "incline_dumbbell_press", name: "Incline Dumbbell Press", muscleGroups: ["chest", "triceps"], sets: 3, targetReps: "6-8" },
            { id: "cable_fly", name: "Cable Fly", muscleGroups: ["chest"], sets: 2, targetReps: "10-15" },
            { id: "cable_crossover", name: "Cable Crossover — High to Low", muscleGroups: ["chest"], sets: 2, targetReps: "12-15" }
        ]
    },
    "tuesday": {
        name: "Biceps & Forearms Day",
        exercises: [
            { id: "barbell_curl", name: "Barbell/Dumbbell Curl", muscleGroups: ["biceps"], sets: 3, targetReps: "8-12" },
            { id: "hammer_curl", name: "Hammer Curl", muscleGroups: ["biceps", "forearms"], sets: 2, targetReps: "8-12" },
            { id: "wrist_curl", name: "Wrist Curls", muscleGroups: ["forearms"], sets: 3, targetReps: "12-15" }
        ]
    },
    "wednesday": {
        name: "Shoulders & Triceps Day",
        exercises: [
            { id: "overhead_press", name: "Overhead Press", muscleGroups: ["shoulders", "triceps"], sets: 3, targetReps: "5-8" },
            { id: "lateral_raise", name: "Cable/Dumbbell Lateral Raise", muscleGroups: ["shoulders"], sets: 3, targetReps: "12-20" },
            { id: "cable_pushdown", name: "Cable Pushdown", muscleGroups: ["triceps"], sets: 3, targetReps: "8-12" },
            { id: "overhead_triceps_ext", name: "Overhead Cable Triceps Extension", muscleGroups: ["triceps"], sets: 2, targetReps: "10-15" }
        ]
    },
    "thursday": {
        name: "Back & Abs Day",
        exercises: [
            { id: "pullup", name: "Pull-up / Lat Pulldown", muscleGroups: ["lats", "back", "biceps"], sets: 3, targetReps: "5-8" },
            { id: "barbell_row", name: "Barbell Row / Chest-Supported Row", muscleGroups: ["back", "lats", "biceps"], sets: 3, targetReps: "5-8" },
            { id: "one_arm_row", name: "One-Arm Cable/Dumbbell Row", muscleGroups: ["back", "lats"], sets: 2, targetReps: "8-12" },
            { id: "face_pull", name: "Face Pull", muscleGroups: ["rear delts", "upper back"], sets: 3, targetReps: "12-20" },
            { id: "rear_delt_fly", name: "Rear-Delt Fly", muscleGroups: ["rear delts"], sets: 3, targetReps: "12-20" },
            { id: "hanging_leg_raise", name: "Hanging Knee/Leg Raise", muscleGroups: ["abs/core"], sets: 3, targetReps: "8-15" },
            { id: "cable_crunch", name: "Cable Crunch", muscleGroups: ["abs/core"], sets: 3, targetReps: "10-15" },
            { id: "bird_dog", name: "Bird Dog", muscleGroups: ["abs/core", "lower back"], sets: 2, targetReps: "8-10 per side" }
        ]
    },
    "friday": {
        name: "Leg Day",
        exercises: [
            { id: "back_squat", name: "Back Squat", muscleGroups: ["quads", "glutes", "lower back"], sets: 3, targetReps: "4-6" },
            { id: "split_squat", name: "Bulgarian Split Squat", muscleGroups: ["quads", "glutes"], sets: 2, targetReps: "8-12 per leg" },
            { id: "romanian_deadlift", name: "Romanian Deadlift", muscleGroups: ["hamstrings", "glutes", "lower back"], sets: 3, targetReps: "6-8" },
            { id: "leg_curl", name: "Leg Curl", muscleGroups: ["hamstrings"], sets: 2, targetReps: "10-15" },
            { id: "cable_pull_through", name: "Cable Pull-Through", muscleGroups: ["glutes", "hamstrings"], sets: 2, targetReps: "10-15" },
            { id: "calf_raise", name: "Standing/Seated Calf Raise", muscleGroups: ["calves"], sets: 3, targetReps: "10-15" }
        ]
    },
    "saturday": {
        name: "Grip, Strength & Small Muscles",
        exercises: [
            { id: "farmers_carry", name: "Farmer's Carry", muscleGroups: ["grip", "forearms", "core"], sets: 3, targetReps: "20-40 m" },
            { id: "dead_hang", name: "Dead Hang", muscleGroups: ["grip", "forearms", "lats"], sets: 2, targetReps: "max time" }
        ]
    },
    "sunday": {
        name: "Rest Day",
        exercises: []
    }
};

const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

function getPlanForDay(dayName) {
    return plan[dayName.toLowerCase()];
}

function getTodayPlan() {
    const today = new Date().getDay();
    return getPlanForDay(dayNames[today]);
}

function getDayName(dateString) {
    const date = new Date(dateString);
    return dayNames[date.getDay()];
}

function getTodayString() {
    return new Date().toISOString().split('T')[0];
}
