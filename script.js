/* ============================================================
   SMART TRASH BIN – FRONTEND SIMULATION
   Mirrors the Python prototype logic using JS and localStorage
   ============================================================ */

console.log("Smart Trash Bin simulation initialized.");

/* ========== GLOBAL VARIABLES ========== */
const USER_NAME = "Sushanth";
const STORAGE_KEY = "smartTrashUserData";

/* ========== INITIALIZATION ========== */
function initUserData() {
  let data = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (!data) {
    data = {
      username: USER_NAME,
      points: 0,
      balance: 0,
      logs: []
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
  return data;
}

function saveUserData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* ========== UTILITY FUNCTIONS ========== */
function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomFloat(min, max) {
  return (Math.random() * (max - min) + min).toFixed(2);
}

/* ========== CHEMICAL SIGNATURES ========== */
const CHEMICAL_SIGNS = {
  organic: ["C6H12O6", "CH4", "CO2"],
  plastic: ["C2H4", "C8H8", "C3H6"],
  metal: ["Fe", "Al", "Cu"],
  glass: ["SiO2", "Na2O", "CaO"]
};

/* ========== SENSOR DETECTION ========== */
function detectWaste(type) {
  const allChemicals = Object.values(CHEMICAL_SIGNS).flat();
  const detectedChemical = getRandom(allChemicals);
  const confidence = parseFloat(randomFloat(0.6, 1.0));
  const correct = CHEMICAL_SIGNS[type]?.includes(detectedChemical) && confidence > 0.75;
  return { type, detectedChemical, confidence, correct };
}

/* ========== LOG HANDLING ========== */
function addLog(entry) {
  const data = initUserData();
  data.logs.push(entry);
  if (data.logs.length > 20) data.logs.shift();
  saveUserData(data);
}

/* ========== REWARD HANDLING ========== */
function updateRewards(points) {
  const data = initUserData();
  data.points += points;
  data.balance += points;
  saveUserData(data);
}

/* ========== THROW WASTE FEATURE ========== */
function handleThrowWaste() {
  const type = document.getElementById("wasteType").value;
  const output = document.getElementById("output");

  const result = detectWaste(type);
  const { detectedChemical, confidence, correct } = result;

  let message = `🧪 Detected Chemical: ${detectedChemical}<br>Confidence: ${confidence * 100}%`;

  if (correct) {
    const points = Math.floor(confidence * 10);
    updateRewards(points);
    addLog({ ...result, timestamp: new Date().toISOString() });
    message += `<br><br>✅ Correct disposal of ${type} waste!<br>🏅 You earned ${points} eco-points!`;
  } else {
    addLog({ ...result, timestamp: new Date().toISOString() });
    message += `<br><br>⚠️ Detection uncertain. Please dispose properly again.`;
  }

  output.innerHTML = message;
}

/* ========== STATUS PAGE ========== */
function loadStatus() {
  const data = initUserData();
  document.getElementById("userName").textContent = data.username;
  document.getElementById("userPoints").textContent = data.points;
  document.getElementById("userBalance").textContent = data.balance;
}

/* ========== CALIBRATION ========== */
function recalibrateSensors() {
  const sensors = ["organic", "plastic", "metal", "glass"];
  const output = document.getElementById("output");
  output.innerHTML = "Recalibrating sensors...<br>";
  sensors.forEach(sensor => {
    const offset = randomFloat(-0.05, 0.05);
    const multiplier = randomFloat(0.9, 1.1);
    output.innerHTML += `🔧 ${sensor.toUpperCase()} recalibrated (offset=${offset}, mult=${multiplier})<br>`;
  });
}

/* ========== MAINTENANCE CHECK ========== */
function maintenanceCheck() {
  const sensors = ["organic", "plastic", "metal", "glass"];
  const output = document.getElementById("output");
  output.innerHTML = "Running diagnostics...<br>";
  sensors.forEach(sensor => {
    const health = Math.floor(Math.random() * 15) + 85;
    const temp = randomFloat(22, 30);
    const status = health >= 90 ? "OK ✅" : "Needs Cleaning ⚠️";
    output.innerHTML += `${sensor.toUpperCase()}: Health=${health}%, Temp=${temp}°C → ${status}<br>`;
  });
}

/* ========== VIEW LOGS ========== */
function loadLogs() {
  const data = initUserData();
  const logList = document.getElementById("logList");
  logList.innerHTML = "";

  if (data.logs.length === 0) {
    logList.innerHTML = "<li>No logs available.</li>";
    return;
  }

  data.logs.slice(-10).reverse().forEach(log => {
    const li = document.createElement("li");
    li.textContent = `${log.timestamp} | ${log.type.toUpperCase()} | ${log.detectedChemical} | Conf: ${log.confidence} | ${log.correct ? "✔ Correct" : "✖ Incorrect"}`;
    logList.appendChild(li);
  });
}

/* ========== REWARD SHOP ========== */
function loadRewards() {
  const data = initUserData();
  document.getElementById("userBalance").textContent = data.balance;
}

function buyItem(item, cost) {
  const data = initUserData();
  const output = document.getElementById("output");
  if (data.balance >= cost) {
    data.balance -= cost;
    saveUserData(data);
    output.innerHTML = `✅ You purchased <b>${item}</b> for ${cost} coins.<br>Remaining Balance: ${data.balance}`;
    document.getElementById("userBalance").textContent = data.balance;
  } else {
    output.innerHTML = `❌ Not enough coins to buy ${item}.`;
  }
}

/* ========== EVENT MAPPING ========== */
document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  if (page === "throw") {
    document.getElementById("throwBtn").addEventListener("click", handleThrowWaste);
  } else if (page === "status") {
    loadStatus();
  } else if (page === "calibration") {
    document.getElementById("calibrateBtn").addEventListener("click", recalibrateSensors);
  } else if (page === "maintenance") {
    document.getElementById("maintainBtn").addEventListener("click", maintenanceCheck);
  } else if (page === "logs") {
    loadLogs();
  } else if (page === "rewards") {
    loadRewards();
  }
});
