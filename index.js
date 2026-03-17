let exercises = [
    { name: "Bänkpress", sets: "3x10", done: false },
    { name: "Lutande hantelpress", sets: "3x12", done: false },
    { name: "Triceps pushdowns", sets: "4x15", done: false }
];

function render() {
    const container = document.getElementById('exercise-list');
    container.innerHTML = ''; 

    exercises.forEach((ex, index) => {
        const div = document.createElement('div');
        div.className = 'exercise-item';
        
        div.innerHTML = `
            <input type="checkbox" id="ex-${index}" ${ex.done ? 'checked' : ''}>
            <label for="ex-${index}">
                <strong>${ex.name}</strong> <span style="color: #666;">- ${ex.sets}</span>
            </label>
        `;

        div.querySelector('input').addEventListener('change', () => {
            exercises[index].done = !exercises[index].done;
        });

        container.appendChild(div);
    });
}

document.getElementById('finish-workout-btn').addEventListener('click', () => {
    const completedCount = exercises.filter(ex => ex.done).length;
    alert(`Bra jobbat! Du blev klar med ${completedCount} av ${exercises.length} övningar.`);
});

function editExercises() {
    const name = prompt("Vad heter övningen?");
    const sets = prompt("Hur många set/reps? (t.ex. 3x10)");
    
    if (name && sets) {
        exercises.push({ name: name, sets: sets, done: false });
        render();
    }
}

render();