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

// Starta programmet
render();