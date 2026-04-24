let activeMeter = null;

const today = new Date().toISOString().split("T")[0];
const lastDate = localStorage.getItem("lastDate");

const hamburger = document.getElementById("fhHamburger");
const navMenu = document.getElementById("fhNavMenu");

// Hantera hamburgermenyn
//Toggla aktivitet när hamburgermenyn klickas, och stäng den när en länk klickas.
if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
        navMenu.classList.toggle("active");
        hamburger.classList.toggle("open");
    });

    document.querySelectorAll(".fh-navbar__link").forEach(link => {
        link.addEventListener("click", () => {
            navMenu.classList.remove("active");
            hamburger.classList.remove("open");
        });
    });

    document.addEventListener("click", (e) => {
        if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
            navMenu.classList.remove("active");
            hamburger.classList.remove("open");
        }
    });
}

// Hantera inloggningsmodalen
// Öppna den när inloggningsknappen klickas och stängas när avbryt klickas.
const loginBtn = document.querySelector(".fh-navbar__login-btn");
const loginModal = document.getElementById("loginModal");
const loginCancel = document.getElementById("loginCancel");

if (loginBtn && loginModal) {
    loginBtn.addEventListener("click", () => {
        loginModal.style.display = "flex";
    });
}

if (loginCancel && loginModal) {
    loginCancel.addEventListener("click", () => {
        loginModal.style.display = "none";
    });
}

if (loginModal) {
    loginModal.addEventListener("click", (e) => {
        if (e.target === loginModal) {
            loginModal.style.display = "none";
        }
    });
}

// Spara dagens statistik och återställ vid midnatt
// Om det finns en sparad datum som inte är idag sparas statistiken och dagens värden återställs.
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

const metersExist = document.querySelector(".calMeter");

// Hantera kalorimätare och proteinmätare
if (metersExist) {
    document.querySelectorAll(".calMeter, .proteinMeter").forEach(meter => {

        // Hämta alla nödvändiga element och data
        const minusBtn = meter.querySelector(".meterControls button:first-child");
        const plusBtn = meter.querySelector(".meterControls button:last-child");
        const input = meter.querySelector(".addInput");
        const goalBtn = meter.querySelector(".goalBtn");
        const circle = meter.querySelector(".meterCircle");
        const valueText = meter.querySelector(".meterText");

        const type = meter.classList.contains("calMeter") ? "calMeter" : "proteinMeter";

        // Hämta sparade värden eller sätt standardvärden
        let value = parseInt(localStorage.getItem(`value_${type}`)) || 0;
        let goal = parseInt(localStorage.getItem(`goal_${type}`)) || 100;


        // Funktion för att spara värden i localStorage
        function save() {
            localStorage.setItem(`value_${type}`, value);
            localStorage.setItem(`goal_${type}`, goal);
        }

        // Funktion för att uppdatera mätaren visuellt
        // Beräknar den nya procentandelen och animerar övergången.
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

                circle.style.background = `conic-gradient(
                    #63B3FF 0%,
                    #1E6FD9 ${currentPercent}%,
                    #0B2545 ${currentPercent}%
                )`;

                valueText.style.color = "#EAF2FF";
                circle._percent = currentPercent;
            };

            step();
            save();
        }

        // Funktion för att hämta det aktuella stegvärdet från input-fältet
        function getStep() {
            return parseInt(input.value) || 0;
        }

        // Event listeners för plus och minusknapparna samt målknappen
        plusBtn.addEventListener("click", () => {
            value += getStep();
            updateMeter();
        });

        minusBtn.addEventListener("click", () => {
            value = Math.max(0, value - getStep());
            updateMeter();
        });

        goalBtn.addEventListener("click", () => {
            const modal = document.getElementById("goalModal");
            const goalInput = document.getElementById("goalInput");

            activeMeter = {
                setGoal: (v) => {
                    goal = v;
                    save();
                },
                update: updateMeter
            };

            if (modal && goalInput) {
                modal.style.display = "flex";
                goalInput.value = goal;
                goalInput.focus();
            }
        });

        updateMeter();
    });
}


// Hantera målmodalen
const goalModal = document.getElementById("goalModal");

// Stäng modalen när avbryt klickas och spara nytt mål när spara klickas.
if (goalModal) {
    document.getElementById("goalCancel").addEventListener("click", () => {
        goalModal.style.display = "none";
    });

    document.getElementById("goalSave").addEventListener("click", () => {
        const newGoal = parseInt(document.getElementById("goalInput").value);

        if (!isNaN(newGoal) && activeMeter) {
            activeMeter.setGoal(newGoal);
            activeMeter.update();
        }

        goalModal.style.display = "none";
    });
}

// Hantera övningslistan
let exercises = JSON.parse(localStorage.getItem("exercises")) || [
    { name: "Bänkpress", sets: 3, reps: 10, done: false },
    { name: "Lutande hantlar", sets: 3, reps: 12, done: false },
    { name: "Pushdowns", sets: 4, reps: 15, done: false }
];

// Funktion för att spara övningar i localStorage
function saveExercises() {
    localStorage.setItem("exercises", JSON.stringify(exercises));
}

// Rendera övningslistan
function render() {
    const list = document.getElementById('exercise-list');
    if (!list) return;

    if (exercises.length === 0) {
        list.innerHTML = `<div style="height:100%; display:flex; align-items:center; justify-content:center; text-align:center; color: var(--accent-light); font-weight:500;">Lista över övningar<br>som kan checkas av</div>`;
        return;
    }

    list.innerHTML = '';

    //Skapa ett element för varje övning
    exercises.forEach((ex, i) => {
        const item = document.createElement('div');
        item.className = 'ex-item';

        const textStyle = ex.done ? 'text-decoration: line-through; opacity: 0.5;' : '';

        // Sätt innre HTML för att inkludera checkbox, label och ta bort knapp
        item.innerHTML = `
            <input type="checkbox" id="check-${i}" ${ex.done ? 'checked' : ''}>
            <label for="check-${i}" style="${textStyle} flex: 1; cursor: pointer;">
                <strong>${ex.name}</strong> - ${ex.sets}x${ex.reps}
            </label>
            <button onclick="removeTask(${i})" style="background:none; border:none; cursor:pointer; font-size:1.2rem; color: var(--bg-darkest); opacity:0.6;">×</button>
        `;

        // Event listener för checkboxen som togglar statusen
        item.querySelector('input').addEventListener('change', () => {
            exercises[i].done = !exercises[i].done;
            saveExercises();
            render();
        });

        list.appendChild(item);
    });
}

// Öppna modal för att lägga till eller ändra övningar
function editExercises() {
    const modal = document.getElementById("exerciseModal");
    if (modal) modal.style.display = "flex";
}

// Ta bort en övning från listan
function removeTask(index) {
    exercises.splice(index, 1);
    saveExercises();
    render();
}

// Hantera färdigt knappen och visa resultat i en modal
document.addEventListener("DOMContentLoaded", () => {
    render();

    const finishBtn = document.getElementById('finish-btn');
    const finishModal = document.getElementById("finishModal");
    const finishMessage = document.getElementById("finishMessage");
    const finishClose = document.getElementById("finishClose");

    // När "Färdigt" klickas, räkna hur många övningar som är klara och visa det i en modal.
    if (finishBtn && finishModal && finishMessage) {
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

    if (finishClose && finishModal) {
        finishClose.addEventListener("click", () => {
            finishModal.style.display = "none";
        });
    }
});

// Hantera övningslistans modal
const exModal = document.getElementById("exerciseModal");

// Stäng modalen när avbryt klickas och spara ny övning när spara klickas.
if (exModal) {
    document.getElementById("exCancel").addEventListener("click", () => {
        exModal.style.display = "none";
    });

    document.getElementById("exSave").addEventListener("click", () => {
        const name = document.getElementById("exName").value.trim();
        const sets = parseInt(document.getElementById("exSets").value);
        const reps = parseInt(document.getElementById("exReps").value);

        if (!name || isNaN(sets) || isNaN(reps) || sets <= 0 || reps <= 0) {
            alert("Fyll i giltiga värden!");
            return;
        }

        exercises.push({ name, sets, reps, done: false });

        saveExercises();
        render();

        document.getElementById("exName").value = "";
        document.getElementById("exSets").value = "";
        document.getElementById("exReps").value = "";

        exModal.style.display = "none";
    });
}

// Spara dagens statistik i historiken
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

// Rendera statistikdiagrammet med hjälp av Chart.js
function renderChart() {
    const canvas = document.getElementById("statsChart"); // FIXED
    if (!canvas || typeof Chart === "undefined") return;

    let history = JSON.parse(localStorage.getItem("history")) || [];

    const labels = history.map(h => h.date);
    const calories = history.map(h => h.calories);
    const protein = history.map(h => h.protein);

    const ctx = canvas.getContext("2d");

    new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                { label: 'Kalorier', data: calories, tension: 0 },
                { label: 'Protein', data: protein, tension: 0 }
            ]
        }
    });
}

renderChart();