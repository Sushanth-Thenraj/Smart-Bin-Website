// ==============================================
// SMART TRASH BIN WEBSITE — script.js
// ==============================================

// --- GLOBAL STATE ---
let user = {
  name: "Sushanth",
  points: parseInt(localStorage.getItem("points")) || 0,
  balance: parseInt(localStorage.getItem("balance")) || 0
};

// --- SAVE DATA ---
function saveUserData() {
  localStorage.setItem("points", user.points);
  localStorage.setItem("balance", user.balance);
}

// --- NAVIGATION HANDLER ---
document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll("nav a");
  links.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const href = e.target.getAttribute("href");
      window.location.href = href;
    });
  });

  // Identify current page
  const page = window.location.pathname.split("/").pop();

  if (page === "index.html" || page === "") homePage();
  else if (page === "throw.html") throwPage();
  else if (page === "status.html") statusPage();
  else if (page === "calibration.html") calibrationPage();
  else if (page === "maintenance.html") maintenancePage();
  else if (page === "logs.html") logsPage();
  else if (page === "rewards.html") rewardsPage();
});

// ==============================================
// PAGE FUNCTIONS
// ==============================================

// --- HOME PAGE ---
function homePage() {
  const greeting = document.getElementById("greeting");
  if (greeting) {
    greeting.innerHTML = `Welcome back, <b>${user.name}</b> 👋`;
  }
}

// --- THROW PAGE ---
function throwPage() {
  const btn = document.getElementById("detectBtn");
  const result = document.getElementById("result");

  const chemicals = {
    organic: ["C6H12O6", "CH4", "CO2"],
    plastic: ["C2H4", "C8H8", "C3H6"],
    metal: ["Fe", "Al", "Cu"],
    glass: ["SiO2", "Na2O"]
  };

  btn.addEventListener("click", () => {
    const type = document.getElementById("wasteType").value;
    if (!type) {
      result.innerHTML = "⚠️ Please select a waste type first.";
      return;
    }

    const chemicalList = chemicals[type];
    const detected = chemicalList[Math.floor(Math.random() * chemicalList.length)];
    const confidence = (Math.random() * 0.3 + 0.7).toFixed(2);

    result.innerHTML = `
      🧪 Detected: <b>${detected}</b><br>
      Confidence: <b>${confidence * 100}%</b>
    `;

    if (confidence > 0.75) {
      const points = Math.round(confidence * 10);
      user.points += points;
      user.balance += points;
      saveUserData();
      result.innerHTML += `<br>✅ Correct! You earned <b>${points}</b> eco-points!`;
    } else {
      result.innerHTML += `<br>⚠️ Detection uncertain. Try again.`;
    }
  });
}

// --- STATUS PAGE ---
function statusPage() {
  const name = document.getElementById("userName");
  const points = document.getElementById("userPoints");
  const balance = document.getElementById("userBalance");

  name.textContent = user.name;
  points.textContent = user.points;
  balance.textContent = user.balance;
}

// --- CALIBRATION PAGE ---
function calibrationPage() {
  const btn = document.getElementById("calibrateBtn");
  const output = document.getElementById("calibrationResult");

  btn.addEventListener("click", () => {
    const sensors = ["Organic", "Plastic", "Metal", "Glass"];
    output.innerHTML = "";
    sensors.forEach(sensor => {
      const offset = (Math.random() * 0.1 - 0.05).toFixed(3);
      const multiplier = (Math.random() * 0.2 + 0.9).toFixed(3);
      const msg = `🔧 ${sensor} recalibrated (offset=${offset}, mult=${multiplier})`;
      const p = document.createElement("p");
      p.textContent = msg;
      output.appendChild(p);
    });
  });
}

// --- MAINTENANCE PAGE ---
function maintenancePage() {
  const btn = document.getElementById("checkBtn");
  const output = document.getElementById("maintenanceOutput");

  btn.addEventListener("click", () => {
    output.innerHTML = "";
    const sensors = ["Organic", "Plastic", "Metal", "Glass"];
    sensors.forEach(sensor => {
      const health = Math.floor(Math.random() * 15) + 85;
      const temp = (Math.random() * 8 + 22).toFixed(1);
      const status = health >= 90 ? "OK" : "Needs Cleaning";
      const msg = `${sensor}: Health ${health}%, Temp ${temp}°C — ${status}`;
      const p = document.createElement("p");
      p.textContent = msg;
      output.appendChild(p);
    });
  });
}

// --- LOGS PAGE ---
function logsPage() {
  const output = document.getElementById("logOutput");
  const logs = JSON.parse(localStorage.getItem("logs")) || [];
  output.innerHTML = logs.map(log => `<li>${log}</li>`).join("") || "No logs yet.";
}

// --- REWARDS PAGE ---
function rewardsPage() {
  const output = document.getElementById("rewardList");
  const btns = document.querySelectorAll(".buyBtn");
  const balance = document.getElementById("balanceDisplay");

  balance.textContent = user.balance;

  btns.forEach(btn => {
    btn.addEventListener("click", () => {
      const cost = parseInt(btn.getAttribute("data-cost"));
      const item = btn.getAttribute("data-item");
      if (user.balance >= cost) {
        user.balance -= cost;
        saveUserData();
        balance.textContent = user.balance;
        alert(`✅ Purchased ${item}! Remaining balance: ${user.balance}`);
      } else {
        alert(`❌ Not enough coins to buy ${item}.`);
      }
    });
  });
}
