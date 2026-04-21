//test

//Track active meter
let activeMeter = null;

//Check if it is a new day and if so, reset values
const today = new Date().toISOString().split("T")[0];
const lastDate = localStorage.getItem("lastDate");

if (lastDate && lastDate !== today) {
    saveDailyStats();

    let exercises = JSON.parse(localStorage.getItem("exercises")) || [];
    exercises = exercises.map(ex => ({
        ...ex,
        done: false
    }));
    localStorage.setItem("exercises", JSON.stringify(exercises));
}

if (lastDate !== today) {
    localStorage.removeItem("value_calMeter");
    localStorage.removeItem("value_proteinMeter");

    localStorage.setItem("lastDate", today);
}

//Setup meters
document.querySelectorAll(".calMeter, .proteinMeter").forEach(meter => {
    const minusBtn = meter.querySelector(".meterControls button:first-child");
    const plusBtn = meter.querySelector(".meterControls button:last-child");
    const input = meter.querySelector(".addInput");
    const goalBtn = meter.querySelector(".goalBtn");
    const circle = meter.querySelector(".meterCircle");
    const valueText = meter.querySelector(".meterText");

    //Identify meter type
    const type = meter.classList.contains("calMeter") ? "calMeter" : "proteinMeter";

    //Load saved data
    let value = parseInt(localStorage.getItem(`value_${type}`)) || 0;
    let goal = parseInt(localStorage.getItem(`goal_${type}`)) || 100;

    function save() {
        localStorage.setItem(`value_${type}`, value);
        localStorage.setItem(`goal_${type}`, goal);
    }

    //Update meter number text and styling
    function updateMeter() {
        valueText.textContent = `${value} / ${goal}`;

        const targetPercent = Math.min((value / goal) * 100, 100);
        let currentPercent = circle._percent || 0;

        const step = () => {
            const diff = targetPercent - currentPercent;

            if (Math.abs(diff) < 0.5) {
                currentPercent = targetPercent;
            } else {
                currentPercent += diff * 0.1;
                requestAnimationFrame(step);
            }

            let fillColor = "#8DA9C4";

        if (type === "calMeter" && value > goal) {
            fillColor = "#FF4D4D";
        }

        if (type === "proteinMeter" && value >= goal) {
            fillColor = "#4CAF50";
        }

        circle.style.background = `conic-gradient(
            ${fillColor} ${currentPercent}%,
            #0B2545 ${currentPercent}%
        )`;

        valueText.style.color = fillColor;

            circle._percent = currentPercent;
        };

        step();
        save();
    }

    //Get step value
    function getStep() {
        return parseInt(input.value) || 0;
    }

    //add step value
    plusBtn.addEventListener("click", () => {
        value += getStep();
        updateMeter();
    });

    //remove step value
    minusBtn.addEventListener("click", () => {
        value = Math.max(0, value - getStep());
        updateMeter();
    });

    //Open goal modal
    goalBtn.addEventListener("click", () => {
        const modal = document.getElementById("goalModal");
        const goalInput = document.getElementById("goalInput");

        //Store reference to meter
        activeMeter = {
            setGoal: (v) => {
                goal = v;
                save();
            },
            update: updateMeter
        };

        modal.style.display = "flex";
        goalInput.value = goal;
        goalInput.focus();
    });

    updateMeter();
});


// Modal buttons
document.getElementById("goalCancel").addEventListener("click", () => {
    document.getElementById("goalModal").style.display = "none";
});

document.getElementById("goalSave").addEventListener("click", () => {
    const newGoal = parseInt(document.getElementById("goalInput").value);

    if (!isNaN(newGoal) && activeMeter) {
        activeMeter.setGoal(newGoal);
        activeMeter.update();
    }

    document.getElementById("goalModal").style.display = "none";
});

let exercises = JSON.parse(localStorage.getItem("exercises")) || [
    { name: "Bänkpress", sets: 3, reps: 10, done: false },
    { name: "Lutande hantlar", sets: 3, reps: 12, done: false },
    { name: "Pushdowns", sets: 4, reps: 15, done: false }
];

function saveExercises() {
    localStorage.setItem("exercises", JSON.stringify(exercises));
}

function render() {
    const list = document.getElementById('exercise-list');

    if (exercises.length === 0) {
        list.innerHTML = `<div style="height:100%; display:flex; align-items:center; justify-content:center; text-align:center; color: var(--accent-light); font-weight:500;">Lista över övningar<br>som kan checkas av</div>`;
        return;
    }

    list.innerHTML = '';

    exercises.forEach((ex, i) => {
        const item = document.createElement('div');
        item.className = 'ex-item';

        const textStyle = ex.done ? 'text-decoration: line-through; opacity: 0.5;' : '';

        item.innerHTML = `
            <input type="checkbox" id="check-${i}" ${ex.done ? 'checked' : ''}>
            <label for="check-${i}" style="${textStyle} flex: 1; cursor: pointer;">
                <strong>${ex.name}</strong> - ${ex.sets}x${ex.reps}
            </label>
            <button onclick="removeTask(${i})" style="background:none; border:none; cursor:pointer; font-size:1.2rem; color: var(--bg-darkest); opacity:0.6;">×</button>
        `;

        item.querySelector('input').addEventListener('change', () => {
            exercises[i].done = !exercises[i].done;
            saveExercises();
            render();
        });

        list.appendChild(item);
    });
}

function editExercises() {
    document.getElementById("exerciseModal").style.display = "flex";
}

function removeTask(index) {
    exercises.splice(index, 1);
    saveExercises();
    render();
}

document.addEventListener("DOMContentLoaded", () => {

    const finishBtn = document.getElementById('finish-btn');
    const finishModal = document.getElementById("finishModal");
    const finishMessage = document.getElementById("finishMessage");
    const finishClose = document.getElementById("finishClose");

    if (finishBtn) {
        finishBtn.addEventListener('click', () => {
            const doneCount = exercises.filter(e => e.done).length;

            if (exercises.length === 0) {
                finishMessage.textContent = "Lägg till övningar först!";
            } else {
                finishMessage.textContent =
                    `Du blev klar med ${doneCount} av ${exercises.length} övningar.`;
            }

            finishModal.style.display = "flex";
        });
    }

    if (finishClose) {
        finishClose.addEventListener("click", () => {
            finishModal.style.display = "none";
        });
    }

});

document.getElementById("exCancel").addEventListener("click", () => {
    document.getElementById("exerciseModal").style.display = "none";
});

document.getElementById("exSave").addEventListener("click", () => {
    const name = document.getElementById("exName").value.trim();
    const sets = parseInt(document.getElementById("exSets").value);
    const reps = parseInt(document.getElementById("exReps").value);

    if (!name || isNaN(sets) || isNaN(reps) || sets <= 0 || reps <= 0) {
        alert("Fyll i giltiga värden!");
        return;
    }

    exercises.push({
        name,
        sets,
        reps,
        done: false
    });

    saveExercises();
    render();

    document.getElementById("exName").value = "";
    document.getElementById("exSets").value = "";
    document.getElementById("exReps").value = "";

    document.getElementById("exerciseModal").style.display = "none";
});

function saveDailyStats() {
    //Sparar kalorie och protein-värden i en historik lokalt.
    const today = new Date().toISOString().split("T")[0];

    let history = JSON.parse(localStorage.getItem("history")) || [];

    history = history.filter(entry => entry.date !== today);

    history.push({
        date: today,
        calories: parseInt(localStorage.getItem("value_calMeter")) || 0,
        protein: parseInt(localStorage.getItem("value_proteinMeter")) || 0
    });

    localStorage.setItem("history", JSON.stringify(history));
}

function renderChart() {
    //Renderar ut ett diagram med hjälp av Chart.js
    let history = JSON.parse(localStorage.getItem("history")) || [];

    const labels = history.map(h => h.date);
    const calories = history.map(h => h.calories);
    const protein = history.map(h => h.protein);

    const ctx = document.getElementById("statsChart").getContext("2d");

    new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Kalorier',
                    data: calories,
                    tension: 0
                },
                {
                    label: 'Protein',
                    data: protein,
                    tension: 0
                }
            ]
        }
    });
}

// Starta programmet
render();
renderChart();

const hamburger = document.getElementById("fhHamburger");
const navMenu = document.getElementById("fhNavMenu");

if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
        navMenu.classList.toggle("active");
        hamburger.classList.toggle("open");
    });

    // Close menu when clicking a link
    document.querySelectorAll(".fh-navbar__link").forEach(link => {
        link.addEventListener("click", () => {
            navMenu.classList.remove("active");
            hamburger.classList.remove("open");
        });
    });

    // Close when clicking outside
    document.addEventListener("click", (e) => {
        if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
            navMenu.classList.remove("active");
            hamburger.classList.remove("open");
        }
    });
}
