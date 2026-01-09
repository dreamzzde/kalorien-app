// ==========================
// Helpers
// ==========================
function getToday() {
    return new Date().toISOString().slice(0, 10);
  }
  
  // ==========================
  // Datenmodell
  // ==========================
  let appData = {
    date: getToday(),
    meals: [],
    calorieGoal: 2000
  };
  
  // ==========================
  // Laden + Tageswechsel
  // ==========================
  function loadData() {
    const saved = localStorage.getItem("calorieData");
  
    if (saved) {
      const parsed = JSON.parse(saved);
  
      if (parsed.date === getToday()) {
        appData = parsed;
      } else {
        appData.date = getToday();
        appData.meals = [];
        saveData();
      }
    }
  }
  
  // ==========================
  // Speichern
  // ==========================
  function saveData() {
    localStorage.setItem("calorieData", JSON.stringify(appData));
  }
  
  // ==========================
  // Logik
  // ==========================
  function addMeal(name, calories) {
    if (!name || calories <= 0) return;
  
    appData.meals.push({
      id: Date.now(),
      name,
      calories: Number(calories)
    });
  
    saveData();
    render();
  }
  
  function deleteMeal(id) {
    appData.meals = appData.meals.filter(m => m.id !== id);
    saveData();
    render();
  }
  
  function getTotalCalories() {
    return appData.meals.reduce((sum, m) => sum + m.calories, 0);
  }
  
  function setGoal(value) {
    appData.calorieGoal = Number(value);
    saveData();
    render();
  }
  
  // ==========================
  // UI
  // ==========================
  function render() {
    const list = document.getElementById("mealList");
    const total = document.getElementById("totalCalories");
    const goal = document.getElementById("goalValue");
    const progress = document.getElementById("progress");
  
    list.innerHTML = "";
  
    appData.meals.forEach(meal => {
      const li = document.createElement("li");
      li.innerHTML = `
        ${meal.name} – ${meal.calories} kcal
        <button onclick="deleteMeal(${meal.id})">✖</button>
      `;
      list.appendChild(li);
    });
  
    const totalCals = getTotalCalories();
    total.textContent = totalCals;
    goal.textContent = appData.calorieGoal;
  
    const percent = Math.min(
      (totalCals / appData.calorieGoal) * 100,
      100
    );
  
    progress.style.width = percent + "%";
  }
  
  // ==========================
  // Events
  // ==========================
  document.getElementById("addMealForm").addEventListener("submit", e => {
    e.preventDefault();
    addMeal(
      mealName.value,
      mealCalories.value
    );
    mealName.value = "";
    mealCalories.value = "";
  });
  
  document.getElementById("goalInput").addEventListener("change", e => {
    setGoal(e.target.value);
  });
  
  // ==========================
  // Start
  // ==========================
  loadData();
  render();
  