// Smart Trash Bin - unified script for all pages
const STORAGE_KEY = "smartTrashUserData_v1";

function getData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) return JSON.parse(raw);
  const init = { username: "Sushanth", points: 0, balance: 0, logs: [] };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(init));
  return init;
}
function saveData(d) { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); }

// Utilities
function randFloat(min, max) { return +(Math.random() * (max - min) + min).toFixed(2); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// Chemical signatures
const CHEMICAL_SIGNS = {
  organic: ["C6H12O6", "CH4", "CO2"],
  plastic: ["C2H4", "C8H8", "C3H6"],
  metal: ["Fe", "Al", "Cu"],
  glass: ["SiO2", "Na2O", "CaO"]
};

// Core detection logic (shared)
function simulateDetection(wasteType) {
  const all = Object.values(CHEMICAL_SIGNS).flat();
  const detected = pick(all);
  const confidence = randFloat(0.6, 1.0);
  const correct = (CHEMICAL_SIGNS[wasteType] || []).includes(detected) && confidence > 0.75;
  return { wasteType, detected, confidence, correct, timestamp: new Date().toISOString() };
}

// Wire Throw page
(function wireThrow() {
  const select = document.getElementById("wasteType");
  const btn = document.getElementById("detectBtn");
  const result = document.getElementById("result");
  if (!btn || !select || !result) return;

  btn.addEventListener("click", () => {
    const val = select.value.toLowerCase();
    if (!val) { result.textContent = "Please choose a waste type."; return; }
    result.textContent = "Scanning...";
    setTimeout(() => {
      const r = simulateDetection(val);
      const data = getData();
      data.logs.push(r);
      if (data.logs.length > 100) data.logs.shift();
      if (r.correct) {
        const points = Math.floor(r.confidence * 10);
        data.points += points;
        data.balance += points;
        result.innerHTML = `🔬 Detected: <b>${r.detected}</b><br>Confidence: ${r.confidence * 100}%<br>✅ Correct! +${points} points`;
      } else {
        result.innerHTML = `🔬 Detected: <b>${r.detected}</b><br>Confidence: ${r.confidence * 100}%<br>⚠️ Not confident enough — no points.`;
      }
      saveData(data);
    }, 800);
  });
})();

// Wire Status page
(function wireStatus() {
  const nameEl = document.getElementById("userName");
  const ptsEl = document.getElementById("userPoints");
  const balEl = document.getElementById("userBalance");
  if (!ptsEl || !balEl) return;
  const data = getData();
  if (nameEl) nameEl.textContent = data.username;
  ptsEl.textContent = data.points;
  balEl.textContent = data.balance;
})();

// Wire Calibration page
(function wireCalibration() {
  const btn = document.getElementById("calibrateBtn");
  const out = document.getElementById("calibrationResult");
  if (!btn || !out) return;
  btn.addEventListener("click", () => {
    out.innerHTML = "Recalibrating sensors...<br>";
    ["organic","plastic","metal","glass"].forEach(s => {
      const offset = randFloat(-0.05, 0.05);
      const mult = randFloat(0.9, 1.1);
      out.innerHTML += `🔧 ${s.toUpperCase()}: offset=${offset}, multiplier=${mult}<br>`;
    });
  });
})();

// Wire Maintenance page
(function wireMaintenance() {
  const btn = document.getElementById("checkBtn");
  const out = document.getElementById("maintenanceOutput");
  if (!btn || !out) return;
  btn.addEventListener("click", () => {
    out.innerHTML = "Running diagnostics...<br>";
    ["organic","plastic","metal","glass"].forEach(s => {
      const health = Math.floor(Math.random()*16)+85;
      const temp = randFloat(22, 30);
      const status = health >= 90 ? "OK" : "Needs Cleaning";
      out.innerHTML += `${s.toUpperCase()}: Health ${health}%, Temp ${temp}°C — ${status}<br>`;
    });
  });
})();

// Wire Logs page
(function wireLogs() {
  const list = document.getElementById("logList");
  const clearBtn = document.getElementById("clearLogsBtn");
  const refreshBtn = document.getElementById("refreshLogsBtn");
  if (!list) return;
  function render() {
    const data = getData();
    list.innerHTML = "";
    const logs = (data.logs || []).slice(-20).reverse();
    if (logs.length === 0) {
      list.innerHTML = "<li>No logs yet.</li>";
      return;
    }
    logs.forEach(l => {
      const li = document.createElement("li");
      li.textContent = `${l.timestamp} | ${l.wasteType.toUpperCase()} | ${l.detected} | Conf: ${l.confidence} | ${l.correct ? "✔" : "✖"}`;
      list.appendChild(li);
    });
  }
  render();
  if (refreshBtn) refreshBtn.addEventListener("click", render);
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      const d = getData(); d.logs = []; saveData(d); render();
    });
  }
})();

// Wire Rewards page
(function wireRewards() {
  const balanceEl = document.getElementById("balanceDisplay");
  const buyBtns = document.querySelectorAll(".buyBtn");
  const purchaseMessage = document.getElementById("purchaseMessage");
  if (!balanceEl) return;
  function refreshBalance() {
    balanceEl.textContent = getData().balance;
  }
  refreshBalance();
  buyBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.dataset.item;
      const cost = parseInt(btn.dataset.cost, 10);
      const d = getData();
      if (d.balance >= cost) {
        d.balance -= cost;
        saveData(d);
        purchaseMessage.textContent = `✅ Purchased ${item}. Remaining balance: ${d.balance}`;
      } else {
        purchaseMessage.textContent = `❌ Not enough coins to buy ${item}.`;
      }
      refreshBalance();
    });
  });
})();

// global: update nav 'active' class based on current file
(function setActiveNav() {
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".navbar a").forEach(a => {
    const href = a.getAttribute("href");
    if (href === path) { a.classList.add("active"); } else { a.classList.remove("active"); }
  });
})();
