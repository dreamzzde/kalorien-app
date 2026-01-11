/* ===============================
   Utilities
================================ */
function getToday() {
  return new Date().toISOString().split("T")[0];
}
function haptic() {
  if (navigator.vibrate) navigator.vibrate(20);
}

/* ===============================
   State
================================ */
let appData = { days: {} };
function ensureToday() {
  const today = getToday();
  if (!appData.days[today]) appData.days[today] = { meals: [], calorieGoal: 2000 };
  return appData.days[today];
}

/* ===============================
   Storage
================================ */
function saveData() {
  localStorage.setItem("calorieData", JSON.stringify(appData));
}
function loadData() {
  const saved = localStorage.getItem("calorieData");
  if (saved) appData = JSON.parse(saved);
  ensureToday();
}

/* ===============================
   Meals
================================ */
function addMeal(name, calories) {
  if (!name || calories <= 0) return;
  ensureToday().meals.push({ id: Date.now(), name, calories: Number(calories) });
  saveData();
  render();
  haptic();
}
function deleteMeal(id) {
  const today = ensureToday();
  today.meals = today.meals.filter(m => m.id !== id);
  saveData();
  render();
  haptic();
}
function getTotalCalories() {
  return ensureToday().meals.reduce((s, m) => s + m.calories, 0);
}

/* ===============================
   Rendering
================================ */
function render() {
  const list = document.getElementById("mealList");
  const total = document.getElementById("totalCalories");
  list.innerHTML = "";
  ensureToday().meals.forEach(meal => {
    const li = document.createElement("li");
    li.innerHTML = `${meal.name} – ${meal.calories.toFixed(0)} kcal
                    <button onclick="deleteMeal(${meal.id})">✕</button>`;
    list.appendChild(li);
  });
  total.textContent = getTotalCalories().toFixed(0);
  renderWeekChart();
}

/* ===============================
   Weekly Statistics
================================ */
function getLast7DaysStats() {
  return Object.keys(appData.days)
    .sort()
    .slice(-7)
    .map(date => appData.days[date].meals.reduce((s, m) => s + m.calories, 0));
}
function renderWeekChart() {
  const canvas = document.getElementById("weekChart");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const data = getLast7DaysStats();
  const max = Math.max(...data, 1);
  const barWidth = 30;
  data.forEach((val, i) => {
    const h = (val / max) * canvas.height;
    ctx.fillStyle = "#34c759";
    ctx.fillRect(10 + i * (barWidth + 10), canvas.height - h, barWidth, h);
  });
}

/* ===============================
   Barcode Workflow
================================ */
const barcodeInput = document.getElementById("barcodeInput");
const scanBtn = document.getElementById("scanBtn");

scanBtn.addEventListener("click", () => barcodeInput.click());

barcodeInput.addEventListener("change", () => {
  const barcode = prompt("Bitte Barcode-Nummer eingeben:");
  if (!barcode) return;
  const portion = prompt("Portion in g eingeben:", "100");
  if (!portion) return;
  fetchFood(barcode, Number(portion));
});

function fetchFood(barcode, portion) {
  fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
    .then(r => r.json())
    .then(d => {
      if (!d.product) { alert("Produkt nicht gefunden"); return; }
      const name = d.product.product_name || "Unbekannt";
      const kcalPer100g = d.product.nutriments?.energy_kcal_100g;
      if (!kcalPer100g) { alert("Keine Kalorienangabe vorhanden"); return; }
      const totalCalories = (kcalPer100g * portion) / 100;
      addMeal(name, totalCalories);
    });
}

/* ===============================
   Init
================================ */
document.getElementById("mealForm").addEventListener("submit", e => {
  e.preventDefault();
  const nameInput = document.getElementById("mealName");
  const calorieInput = document.getElementById("mealCalories");
  const amountInput = document.getElementById("mealAmount");
  const caloriesPer100g = Number(calorieInput.value);
  const portion = Number(amountInput.value);
  const totalCalories = (caloriesPer100g * portion) / 100;
  addMeal(nameInput.value, totalCalories);
  e.target.reset();
});

loadData();
render();
