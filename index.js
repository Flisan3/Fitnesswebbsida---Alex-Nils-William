const dailyExercises = ["knäböj", "Marklyft", "militärpress"];

const listElement = document.getElementById("exercise-list");

function renderExercises() {
  listElement.innerHTML = "";
  dailyExercises.forEach((ex, index) => {
    listElement.innerHTML += `
      <li>
        <input type="checkbox" id="exercise-${index}">
        <label for="exercise-${index}">${ex}</label>
      </li>
    `;
  });
}

function finishWorkout() {
    const checkboxes = document.querySelectorAll("input[type='checkbox']");
    const completed = Array.from(checkboxes).filter(checkbox => checkbox.checked).length;
    
    alert(`Bra jobbat! Du genomförde ${completed} av ${dailyExercises.length} övningar!`);
}

renderExercises();