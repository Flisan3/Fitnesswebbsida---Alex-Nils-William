//test

//Track active meter
let activeMeter = null;

//Check if it is a new day and if so, reset values
const today = new Date().toISOString().split("T")[0];
const lastDate = localStorage.getItem("lastDate");

if (lastDate && lastDate !== today) {
    saveDailyStats();
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

let exercises = [
    { name: "Bänkpress", info: "3x10", done: false },
    { name: "Lutande hantlar", info: "3x12", done: false },
    { name: "Pushdowns", info: "4x15", done: false }
];

function render() {
    const list = document.getElementById('exercise-list');
    
    // Om listan är tom
    if (exercises.length === 0) {
        list.innerHTML = `<div style="height:100%; display:flex; align-items:center; justify-content:center; text-align:center; color: var(--accent-light); font-weight:500;">
            Lista över övningar<br>som kan checkas av</div>`;
        return;
    }

    list.innerHTML = '';
    
    // Rendera övningarna
    exercises.forEach((ex, i) => {
        const item = document.createElement('div');
        item.className = 'ex-item';
        
        // Dynamisk styling om övningen är klar
        const textStyle = ex.done ? 'text-decoration: line-through; opacity: 0.5;' : '';

        item.innerHTML = `
            <input type="checkbox" id="check-${i}" ${ex.done ? 'checked' : ''}>
            <label for="check-${i}" style="${textStyle} flex: 1; cursor: pointer;">
                <strong>${ex.name}</strong> - ${ex.info}
            </label>
            <button onclick="removeTask(${i})" style="background:none; border:none; cursor:pointer; font-size:1.2rem; color: var(--bg-darkest); opacity:0.6;">×</button>
        `;
        
        // Klick på checkbox
        item.querySelector('input').addEventListener('change', () => {
            exercises[i].done = !exercises[i].done;
            render();
        });
        
        list.appendChild(item);
    });
}

function editExercises() {
    const name = prompt("Övningens namn:");
    const info = prompt("Set/Reps (t.ex. 3x10):");
    if (name && info) {
        exercises.push({ name, info, done: false });
        render();
    }
}

function removeTask(index) {
    exercises.splice(index, 1);
    render();
}

document.getElementById('finish-btn').addEventListener('click', () => {
    const doneCount = exercises.filter(e => e.done).length;
    if (exercises.length === 0) {
        alert("Lägg till övningar först!");
    } else {
        alert(`Bra jobbat! Du blev klar med ${doneCount} av ${exercises.length} övningar.`);
    }
});

function saveDailyStats() {
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
    const history = JSON.parse(localStorage.getItem("history")) || [];

    const labels = history.map(h => h.date);
    const calories = history.map(h => h.calories);
    const protein = history.map(h => h.protein);

    const ctx = document.getElementById("statsChart");

    if (history.length === 0) {
    history.push(
        { date: "2026-04-14", calories: 1800, protein: 120 },
        { date: "2026-04-15", calories: 2200, protein: 140 },
        { date: "2026-04-16", calories: 2000, protein: 130 }
    );
}

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Kalorier',
                    data: calories,
                    tension: 0.3
                },
                {
                    label: 'Protein',
                    data: protein,
                    tension: 0.3
                }
            ]
        },
        options: {
    responsive: true,
    plugins: {
        legend: {
            labels: {
                color: "#EEF4ED" // text color (matches your UI)
            }
        }
    },
    scales: {
        x: {
            ticks: {
                color: "#EEF4ED"
            },
            grid: {
                color: "rgba(238, 244, 237, 0.1)"
            }
        },
        y: {
            ticks: {
                color: "#EEF4ED"
            },
            grid: {
                color: "rgba(238, 244, 237, 0.1)"
            }
        }
    }
}
    });
}

// Starta programmet
render();
renderChart();