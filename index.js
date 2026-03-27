//Track active meter
let activeMeter = null;

//Check if it is a new day and if so, reset values
const today = new Date().toDateString();
const lastDate = localStorage.getItem("lastDate");

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