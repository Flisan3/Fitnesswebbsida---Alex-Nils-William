document.querySelectorAll(".calMeter, .proteinMeter").forEach(meter => {
    const minusBtn = meter.querySelector(".meterControls button:first-child");
    const plusBtn = meter.querySelector(".meterControls button:last-child");
    const input = meter.querySelector(".addInput");
    const goalBtn = meter.querySelector(".goalBtn");
    const circle = meter.querySelector(".meterCircle");
    const valueText = meter.querySelector(".meterText");

    let value = 0;
    let goal = 100;

    //Updates the meters by comparing value to goal
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

        //Applies the styling

        circle.style.background = `conic-gradient(
            #8DA9C4 ${currentPercent}%,
            #0B2545 ${currentPercent}%
        )`;

        circle._percent = currentPercent;
    };

    step();
    }

    //Get step from input and change the value depending on action
    function getStep() {
        return parseInt(input.value) || 0;
    }

    plusBtn.addEventListener("click", () => {
        value += getStep();
        updateMeter();
    });

    minusBtn.addEventListener("click", () => {
        value = Math.max(0, value - getStep());
        updateMeter();
    });

    input.addEventListener("input", () => {
    });

    //Make the modal show when button is pressed
    goalBtn.addEventListener("click", () => {
    const modal = document.getElementById("goalModal");
    const input = document.getElementById("goalInput");
    modal.style.display = "flex";
    input.value = "";
    input.focus();
    });

    document.getElementById("goalCancel").addEventListener("click", () => {
        document.getElementById("goalModal").style.display = "none";
    });

    document.getElementById("goalSave").addEventListener("click", () => {
    const newGoal = parseInt(document.getElementById("goalInput").value);
    if (!isNaN(newGoal)) {
        goal = newGoal;
        updateMeter();
    }

    document.getElementById("goalModal").style.display = "none";
    });

    updateMeter();
});