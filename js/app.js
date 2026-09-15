document.addEventListener('DOMContentLoaded', () => {
    let currentSelectedDayStr = getTodayString();
    let activeWorkoutData = null;

    // Navigation logic
    const navBtns = {
        'workout': document.getElementById('nav-workout'),
        'progress': document.getElementById('nav-progress'),
        'history': document.getElementById('nav-history'),
        'settings': document.getElementById('nav-settings')
    };

    const views = {
        'workout': document.getElementById('view-workout'),
        'progress': document.getElementById('view-progress'),
        'history': document.getElementById('view-history'),
        'settings': document.getElementById('view-settings')
    };

    function switchView(viewName) {
        Object.keys(navBtns).forEach(key => {
            navBtns[key].classList.remove('active');
            views[key].classList.remove('active');
        });
        navBtns[viewName].classList.add('active');
        views[viewName].classList.add('active');

        if (viewName === 'progress') renderProgress();
        if (viewName === 'history') renderHistory();
        if (viewName === 'settings') loadSettings();
    }

    Object.keys(navBtns).forEach(key => {
        navBtns[key].addEventListener('click', () => switchView(key));
    });

    // Day Selector in Workout View
    const daySelector = document.getElementById('workout-day-selector');
    
    function renderDaySelector() {
        daySelector.innerHTML = '';
        const today = new Date();
        // show last 3 days, today, and next 3 days
        for(let i = -3; i <= 3; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            const dayName = dayNames[d.getDay()];
            
            const btn = document.createElement('button');
            btn.className = 'btn btn-secondary';
            btn.style.flex = '0 0 auto';
            btn.style.minWidth = '80px';
            btn.style.padding = '8px';
            if (dateStr === currentSelectedDayStr) {
                btn.style.borderColor = 'var(--accent)';
                btn.style.color = 'var(--accent)';
            }
            
            let label = dayName.substring(0,3).toUpperCase();
            if (i === 0) label = "TODAY";
            
            btn.innerText = label;
            btn.onclick = () => {
                currentSelectedDayStr = dateStr;
                renderDaySelector();
                renderWorkoutSummary();
            };
            daySelector.appendChild(btn);
        }
    }

    // Workout Summary
    function renderWorkoutSummary() {
        document.getElementById('workout-active-area').style.display = 'none';
        document.getElementById('workout-summary').style.display = 'block';

        const dayName = getDayName(currentSelectedDayStr);
        const planForDay = getPlanForDay(dayName);
        const savedWorkout = store.getWorkout(currentSelectedDayStr);

        document.getElementById('workout-title').innerText = planForDay.name.toUpperCase();
        
        let metaText = `${planForDay.exercises.length} EXERCISES`;
        let totalSets = 0;
        planForDay.exercises.forEach(e => totalSets += e.sets);
        metaText += `<br> ${totalSets} SETS`;

        if (savedWorkout && savedWorkout.completed) {
            metaText += `<br><span style="color:var(--success)">WORKOUT COMPLETED ✓</span>`;
            document.getElementById('btn-start-workout').innerText = "View Workout";
        } else {
            document.getElementById('btn-start-workout').innerText = "Start Workout";
        }

        document.getElementById('workout-meta').innerHTML = metaText;
    }

    // Start Workout
    document.getElementById('btn-start-workout').addEventListener('click', () => {
        const dayName = getDayName(currentSelectedDayStr);
        const planForDay = getPlanForDay(dayName);
        let savedWorkout = store.getWorkout(currentSelectedDayStr);

        if (!savedWorkout) {
            // Initialize new workout data from plan
            savedWorkout = {
                date: currentSelectedDayStr,
                day: dayName,
                workoutName: planForDay.name,
                exercises: planForDay.exercises.map(ex => {
                    const setsData = [];
                    for(let i=0; i<ex.sets; i++) {
                        setsData.push({ weight: '', reps: '', completed: false });
                    }
                    return {
                        id: ex.id,
                        name: ex.name,
                        muscleGroups: ex.muscleGroups,
                        sets: setsData,
                        targetReps: ex.targetReps
                    };
                }),
                notes: '',
                completed: false,
                xpAwarded: false
            };
            store.saveWorkout(currentSelectedDayStr, savedWorkout);
        }

        activeWorkoutData = savedWorkout;

        document.getElementById('workout-summary').style.display = 'none';
        document.getElementById('workout-active-area').style.display = 'block';
        
        renderActiveWorkout();
    });

    function renderActiveWorkout() {
        const container = document.getElementById('exercises-container');
        container.innerHTML = '';
        
        let totalSets = 0;
        let completedSets = 0;

        activeWorkoutData.exercises.forEach((ex, exIndex) => {
            const card = document.createElement('div');
            card.className = 'card exercise-card';
            
            const header = document.createElement('div');
            header.className = 'exercise-header';
            header.innerHTML = `
                <div>
                    <h3 style="margin-bottom:2px">${ex.name.toUpperCase()}</h3>
                    <div style="font-size:0.8rem; color:var(--text-muted)">Target: ${ex.sets} × ${ex.targetReps}</div>
                </div>
            `;
            card.appendChild(header);

            // Previous Performance
            const prevPerf = stats.getPreviousExercisePerformance(ex.id);
            if (prevPerf.sets && prevPerf.lastDate !== currentSelectedDayStr) {
                const pp = document.createElement('div');
                pp.className = 'prev-perf';
                let ppText = `<strong>LAST WORKOUT</strong><br>`;
                prevPerf.sets.forEach(s => {
                    ppText += `${s.weight} kg × ${s.reps}<br>`;
                });
                pp.innerHTML = ppText;
                card.appendChild(pp);
            } else {
                const pp = document.createElement('div');
                pp.className = 'prev-perf';
                pp.innerText = 'No previous workout recorded.';
                card.appendChild(pp);
            }

            // Sets
            ex.sets.forEach((set, setIndex) => {
                totalSets++;
                if (set.completed) completedSets++;

                const row = document.createElement('div');
                row.className = 'set-row' + (set.completed ? ' completed' : '');
                
                row.innerHTML = `
                    <div style="font-weight:bold; width: 50px;">SET ${setIndex + 1}</div>
                    <div class="set-inputs">
                        <div style="display:flex; flex-direction:column; align-items:center;">
                            <span style="font-size:0.7rem; color:var(--text-muted)">KG</span>
                            <input type="number" class="wgt-input" value="${set.weight}" ${activeWorkoutData.completed ? 'disabled' : ''}>
                        </div>
                        <div style="display:flex; flex-direction:column; align-items:center;">
                            <span style="font-size:0.7rem; color:var(--text-muted)">REPS</span>
                            <input type="number" class="rep-input" value="${set.reps}" ${activeWorkoutData.completed ? 'disabled' : ''}>
                        </div>
                    </div>
                    <div class="check-btn ${set.completed ? 'completed' : ''}">${set.completed ? '✓' : ''}</div>
                `;

                const wgtInput = row.querySelector('.wgt-input');
                const repInput = row.querySelector('.rep-input');
                const checkBtn = row.querySelector('.check-btn');

                wgtInput.addEventListener('change', (e) => {
                    activeWorkoutData.exercises[exIndex].sets[setIndex].weight = e.target.value;
                    store.saveWorkout(currentSelectedDayStr, activeWorkoutData);
                });
                
                repInput.addEventListener('change', (e) => {
                    activeWorkoutData.exercises[exIndex].sets[setIndex].reps = e.target.value;
                    store.saveWorkout(currentSelectedDayStr, activeWorkoutData);
                });

                checkBtn.addEventListener('click', () => {
                    if (activeWorkoutData.completed) return; // frozen if finished
                    
                    const isComp = !activeWorkoutData.exercises[exIndex].sets[setIndex].completed;
                    activeWorkoutData.exercises[exIndex].sets[setIndex].completed = isComp;
                    activeWorkoutData.exercises[exIndex].sets[setIndex].weight = wgtInput.value;
                    activeWorkoutData.exercises[exIndex].sets[setIndex].reps = repInput.value;
                    
                    store.saveWorkout(currentSelectedDayStr, activeWorkoutData);
                    renderActiveWorkout(); // re-render to update progress
                });

                card.appendChild(row);
            });

            container.appendChild(card);
        });

        // Notes
        const notesInput = document.getElementById('workout-notes');
        notesInput.value = activeWorkoutData.notes || '';
        notesInput.onchange = (e) => {
            activeWorkoutData.notes = e.target.value;
            store.saveWorkout(currentSelectedDayStr, activeWorkoutData);
        };
        notesInput.disabled = activeWorkoutData.completed;

        // Progress update
        const pct = totalSets === 0 ? 0 : (completedSets / totalSets) * 100;
        document.getElementById('workout-progress-bar').style.width = `${pct}%`;
        document.getElementById('workout-progress-text').innerText = `${completedSets} / ${totalSets} SETS COMPLETED`;

        const finishBtn = document.getElementById('btn-finish-workout');
        if (activeWorkoutData.completed) {
            finishBtn.style.display = 'none';
        } else {
            finishBtn.style.display = 'block';
        }
    }

    document.getElementById('btn-finish-workout').addEventListener('click', () => {
        if (!activeWorkoutData) return;
        
        activeWorkoutData.completed = true;
        
        stats.updateProfileAfterWorkout(currentSelectedDayStr, activeWorkoutData);
        
        // Show summary alert
        const s = stats.calculateWorkoutStats(activeWorkoutData);
        alert(`WORKOUT COMPLETE ✓\n\nVolume: ${s.volume} kg\nXP Gained: ${s.xpGained + 50}\n\nGreat job!`);
        
        renderWorkoutSummary();
    });

    // Progress View
    function renderProgress() {
        const p = store.getProfile();
        document.getElementById('progress-level').innerText = `LEVEL ${p.level}`;
        
        const xpForCurrentLevel = (p.level - 1) * 1000;
        const xpForNextLevel = p.level * 1000;
        const currentLevelXp = p.xp - xpForCurrentLevel;
        
        document.getElementById('progress-xp-text').innerText = `${p.xp} / ${xpForNextLevel} XP`;
        
        const pct = (currentLevelXp / 1000) * 100;
        document.getElementById('progress-xp-bar').style.width = `${pct}%`;

        const globalStats = stats.getGlobalStats();
        
        document.getElementById('stat-workouts').innerText = p.workouts;
        document.getElementById('stat-streak').innerText = p.streak;
        document.getElementById('stat-volume').innerText = globalStats.totalVolume.toLocaleString();
        document.getElementById('stat-sets').innerText = globalStats.totalSets;

        const mCont = document.getElementById('muscle-stats-container');
        mCont.innerHTML = '';
        
        for(let m in globalStats.muscleStats) {
            const sm = globalStats.muscleStats[m];
            const div = document.createElement('div');
            div.className = 'card';
            div.innerHTML = `
                <h4 style="text-transform:uppercase">${m}</h4>
                <p style="margin:0">${sm.sessions} sessions | ${sm.sets} sets | ${sm.volume.toLocaleString()} kg volume</p>
            `;
            mCont.appendChild(div);
        }
    }

    // History View
    function renderHistory() {
        const container = document.getElementById('history-container');
        container.innerHTML = '';
        
        const workouts = store.getWorkouts();
        const dates = Object.keys(workouts).sort((a, b) => new Date(b) - new Date(a));
        
        if (dates.length === 0) {
            container.innerHTML = '<p>No history available.</p>';
            return;
        }

        dates.forEach(date => {
            const w = workouts[date];
            if (!w.completed) return; // Only show completed

            let vol = 0;
            let sets = 0;
            w.exercises.forEach(ex => {
                ex.sets.forEach(s => {
                    if (s.completed) {
                        vol += (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0);
                        sets++;
                    }
                });
            });

            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div style="display:flex; justify-content:space-between;">
                    <strong>${new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase()}</strong>
                    <span style="color:var(--text-muted)">${w.workoutName}</span>
                </div>
                <div style="margin-top: 10px; color:var(--text-muted)">
                    ${sets} sets | ${vol.toLocaleString()} kg
                </div>
            `;
            
            // Expand details
            const details = document.createElement('div');
            details.style.display = 'none';
            details.style.marginTop = '10px';
            details.style.borderTop = '1px solid var(--border)';
            details.style.paddingTop = '10px';
            
            let detHTML = '';
            w.exercises.forEach(ex => {
                const compSets = ex.sets.filter(s => s.completed);
                if (compSets.length > 0) {
                    detHTML += `<div style="margin-bottom:5px"><strong>${ex.name}</strong></div>`;
                    compSets.forEach(s => {
                        detHTML += `<div style="font-size:0.85rem">${s.weight} kg × ${s.reps}</div>`;
                    });
                }
            });
            if (w.notes) {
                detHTML += `<div style="margin-top:10px; font-style:italic">Notes: ${w.notes}</div>`;
            }
            details.innerHTML = detHTML;
            card.appendChild(details);

            card.addEventListener('click', () => {
                details.style.display = details.style.display === 'none' ? 'block' : 'none';
            });

            container.appendChild(card);
        });
    }

    // Settings logic
    function loadSettings() {
        const p = store.getProfile();
        document.getElementById('profile-weight').value = p.weight || '';
        document.getElementById('profile-height').value = p.height || '';
    }

    document.getElementById('btn-save-profile').addEventListener('click', () => {
        const p = store.getProfile();
        p.weight = document.getElementById('profile-weight').value;
        p.height = document.getElementById('profile-height').value;
        store.saveProfile(p);
        alert('Profile saved!');
    });

    document.getElementById('btn-export').addEventListener('click', () => {
        const data = store.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `workoutstv_export_${getTodayString()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    });

    document.getElementById('btn-import-trigger').addEventListener('click', () => {
        document.getElementById('file-import').click();
    });

    document.getElementById('file-import').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            const success = store.importData(ev.target.result);
            if (success) {
                alert('Data imported successfully!');
                location.reload();
            } else {
                alert('Import failed. Existing data was not changed.');
            }
        };
        reader.readAsText(file);
    });

    // Init
    renderDaySelector();
    renderWorkoutSummary();
});
