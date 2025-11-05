/* =========================================================
   SMART TRASH BIN - Unified frontend script
   - Robust: only attaches listeners when elements exist
   - Single localStorage key: SMART_BIN_USER
   - Supports pages: index, throw, status, calibration,
     maintenance, logs, rewards
   - Defensive logging for debugging
   ========================================================= */

(() => {
  const STORAGE_KEY = "SMART_BIN_USER";

  // ---------- Utility ----------
  const log = (...args) => console.log("[SmartBin]", ...args);
  const err = (...args) => console.error("[SmartBin]", ...args);

  const randFloat = (min, max) => +(Math.random() * (max - min) + min).toFixed(2);
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  const CHEMICAL_SIGNS = {
    organic: ["C6H12O6", "CH4", "CO2"],
    plastic: ["C2H4", "C8H8", "C3H6"],
    metal: ["Fe", "Al", "Cu"],
    glass: ["SiO2", "Na2O", "CaO"]
  };

  // ---------- Data Layer ----------
  function defaultData() {
    return {
      username: "Sushanth",
      points: 0,
      balance: 200,
      logs: [],          // {type, detected, confidence, correct, ts}
      purchases: []      // list of strings
    };
  }

  function readData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const d = defaultData();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
        return d;
      }
      return JSON.parse(raw);
    } catch (e) {
      err("Failed to read localStorage — resetting data", e);
      const d = defaultData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
      return d;
    }
  }

  function saveData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      err("Failed to save data to localStorage", e);
    }
  }

  function addLog(entry) {
    const d = readData();
    d.logs.push(entry);
    if (d.logs.length > 200) d.logs.shift();
    saveData(d);
  }

  function addPoints(points) {
    const d = readData();
    d.points += points;
    d.balance += points;
    saveData(d);
  }

  function spendBalance(cost) {
    const d = readData();
    if (d.balance >= cost) {
      d.balance -= cost;
      saveData(d);
      return true;
    }
    return false;
  }

  // ---------- DOM helpers ----------
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  function setTextIfExists(selector, text) {
    const el = $(selector);
    if (el) el.textContent = text;
  }
  function setHTMLIfExists(selector, html) {
    const el = $(selector);
    if (el) el.innerHTML = html;
  }

  // ---------- Nav active highlighting ----------
  function setActiveNav() {
    const path = window.location.pathname.split("/").pop() || "index.html";
    $$(".navbar a").forEach(a => {
      const href = a.getAttribute("href");
      if (!href) return;
      if (href === path) a.classList.add("active");
      else a.classList.remove("active");
    });
  }

  // ---------- Page behaviors ----------
  function initIndex() {
    // show mini status in home if placeholder exists
    const data = readData();
    setTextIfExists("#home-username", data.username);
    setTextIfExists("#home-balance", data.balance);
  }

  function initThrowPage() {
    const select = $("#wasteType");
    const detectBtn = $("#detectBtn") || $("#detectWasteBtn");
    const resultBox = $("#result") || $(".output");

    if (!select || !detectBtn || !resultBox) {
      log("Throw page: required elements missing, skipping init");
      return;
    }

    detectBtn.addEventListener("click", () => {
      const val = (select.value || "").toLowerCase();
      if (!val) {
        resultBox.textContent = "⚠️ Please select a waste type.";
        return;
      }

      // simulate multi-sensor detection: choose detected chemical from all pool
      const all = Object.values(CHEMICAL_SIGNS).flat();
      const detected = pick(all);
      const confidence = randFloat(0.6, 1.0);
      const correct = CHEMICAL_SIGNS[val] && CHEMICAL_SIGNS[val].includes(detected) && confidence > 0.75;

      const ts = new Date().toISOString();
      addLog({ type: val, detected, confidence, correct, ts });

      let html = `<strong>Detected chemical:</strong> ${detected} <br>`;
      html += `<strong>Confidence:</strong> ${(confidence * 100).toFixed(0)}%<br>`;

      if (correct) {
        const points = Math.max(5, Math.floor(confidence * 10)); // minimum reward
        addPoints(points);
        html += `✅ Correct disposal! You earned <b>${points}</b> points.`;
      } else {
        html += `⚠️ Detection uncertain or mismatch. No points awarded.`;
      }

      resultBox.innerHTML = html;
      // update status/balance displays if present
      updateStatusUI();
    });
  }

  function initStatusPage() {
    updateStatusUI();
  }

  function updateStatusUI() {
    const d = readData();
    setTextIfExists("#userName", d.username);
    setTextIfExists("#userPoints", d.points);
    setTextIfExists("#userBalance", d.balance);
    // if a status area exists for extended info:
    const statusArea = $("#statusInfo");
    if (statusArea) {
      statusArea.innerHTML = `
        <p><strong>User:</strong> ${d.username}</p>
        <p><strong>Points:</strong> ${d.points}</p>
        <p><strong>Balance:</strong> ${d.balance} coins</p>
        <p><strong>Logs Stored:</strong> ${d.logs.length}</p>
        <p><strong>Purchases:</strong> ${d.purchases.length ? d.purchases.join(", ") : "None"}</p>
      `;
    }
  }

  function initCalibrationPage() {
    const btn = $("#calibrateBtn") || $("#calibrateAll") || $("#runCalibrate");
    const out = $("#calibrationResult") || $("#calibrationOutput");
    if (!btn || !out) { log("Calibration elements missing, skip"); return; }
    btn.addEventListener("click", () => {
      out.innerHTML = "🔧 Recalibrating sensors...";
      setTimeout(() => {
        const sensors = ["organic", "plastic", "metal", "glass"];
        const lines = sensors.map(s => {
          const offset = randFloat(-0.05, 0.05);
          const mult = randFloat(0.9, 1.1);
          return `✅ ${s.toUpperCase()} recalibrated (offset=${offset}, multiplier=${mult})`;
        });
        out.innerHTML = lines.join("<br>");
      }, 900);
    });
  }

  function initMaintenancePage() {
    const btn = $("#runDiagnostics") || $("#checkBtn") || $("#diagnosticBtn");
    const out = $("#diagnosticResults") || $("#maintenanceOutput");
    if (!btn || !out) { log("Maintenance elements missing, skip"); return; }
    btn.addEventListener("click", () => {
      out.innerHTML = "🔍 Running diagnostics...";
      setTimeout(() => {
        const sensors = ["organic", "plastic", "metal", "glass"];
        const lines = sensors.map(s => {
          const health = Math.floor(Math.random() * 16) + 85; // 85-100
          const temp = randFloat(22.0, 30.0);
          const status = health >= 90 ? "OK" : "Needs Cleaning";
          return `${s.toUpperCase()}: Health ${health}% | Temp ${temp}°C → ${status}`;
        });
        out.innerHTML = lines.join("<br>");
      }, 900);
    });
  }

  function initLogsPage() {
    const list = $("#logList") || $("#logs-body") || $("#logsList") || $(".output");
    const clearBtn = $("#clearLogsBtn");
    const refreshBtn = $("#refreshLogsBtn");

    function render() {
      const d = readData();
      const logs = (d.logs || []).slice(-50).reverse();
      if (!list) return;
      if (!logs.length) {
        list.innerHTML = "<li>No logs yet.</li>";
        return;
      }
      // render depending on element type
      if (list.tagName === "UL" || list.tagName === "OL") {
        list.innerHTML = "";
        logs.forEach(l => {
          const li = document.createElement("li");
          li.textContent = `${l.ts || l.timestamp || ""} | ${l.type.toUpperCase()} | ${l.detected} | Conf:${(l.confidence*100||0).toFixed(0)}% | ${l.correct ? "✔" : "✖"}`;
          list.appendChild(li);
        });
      } else if (list.tagName === "DIV" || list.tagName === "SECTION") {
        list.innerHTML = logs.map(l => `<div class="log-row">${l.ts || l.timestamp || ""} • ${l.type.toUpperCase()} • ${l.detected} • ${(l.confidence*100||0).toFixed(0)}% • ${l.correct ? "✔" : "✖"}</div>`).join("");
      } else {
        // generic fallback
        list.innerHTML = logs.map(l => `${l.ts||l.timestamp||""} | ${l.type} | ${l.detected} | ${l.confidence}`).join("<br>");
      }
    }

    if (refreshBtn) refreshBtn.addEventListener("click", render);
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        const d = readData();
        d.logs = [];
        saveData(d);
        render();
      });
    }
    render();
  }

  function initRewardsPage() {
    const balanceEl = $("#userBalance") || $("#balanceDisplay");
    const output = $("#output") || $("#purchaseMessage") || $(".output");
    const buyButtons = $$(".buyBtn, .reward-btn, button.buy"); // support multiple button classes
    // Update balance field if present
    const d = readData();
    if (balanceEl) balanceEl.textContent = d.balance;

    buyButtons.forEach(btn => {
      // read item/cost from multiple possible places
      const item = btn.dataset.item || btn.getAttribute("data-item") || btn.getAttribute("data-name") || (btn.closest(".card") && btn.closest(".card").querySelector("h3") && btn.closest(".card").querySelector("h3").innerText);
      const costStr = btn.dataset.cost || btn.getAttribute("data-cost") || btn.getAttribute("data-price");
      const cost = costStr ? parseInt(costStr, 10) : NaN;

      btn.addEventListener("click", () => {
        if (!item || Number.isNaN(cost)) {
          (output) && (output.innerHTML = "⚠️ Reward configuration missing (item/cost).");
          return;
        }
        const success = spendBalance(cost);
        if (success) {
          // record purchase
          const data = readData();
          data.purchases = data.purchases || [];
          data.purchases.push(item);
          saveData(data);
          if (balanceEl) balanceEl.textContent = data.balance;
          if (output) output.innerHTML = `✅ Purchased <b>${item}</b> for ${cost} coins. Remaining: ${data.balance}`;
          // rare item popup
          if (item.toLowerCase().includes("eco crystal") || item.toLowerCase().includes("crystal") || item.toLowerCase().includes("golden")) {
            showRarePopup(item);
          }
        } else {
          if (output) output.innerHTML = `❌ Not enough coins to buy ${item}.`;
        }
      });
    });
  }

  function showRarePopup(itemName) {
    const popup = document.createElement("div");
    popup.id = "rarePopup";
    popup.style.position = "fixed";
    popup.style.left = "50%";
    popup.style.top = "40%";
    popup.style.transform = "translate(-50%, -50%)";
    popup.style.background = "linear-gradient(135deg,#2b0036,#6a0080)";
    popup.style.color = "white";
    popup.style.padding = "20px 28px";
    popup.style.borderRadius = "12px";
    popup.style.boxShadow = "0 10px 40px rgba(106,0,128,0.6)";
    popup.style.zIndex = 9999;
    popup.style.textAlign = "center";
    popup.innerHTML = `✨ You unlocked a <b>${itemName}</b>! 💎`;
    document.body.appendChild(popup);
    setTimeout(() => {
      popup.style.transition = "opacity 0.5s ease, transform 0.5s ease";
      popup.style.opacity = "0";
      popup.style.transform = "translate(-50%, -60%) scale(0.95)";
      setTimeout(() => popup.remove(), 500);
    }, 2000);
  }

  function initGlobalUI() {
    // Update any balance placeholders immediately
    const d = readData();
    $$("#userBalance, #balanceDisplay, #home-balance").forEach(el => el.textContent = d.balance);
    $$("#userPoints, #home-points").forEach(el => el.textContent = d.points);
    $$("#userName, #home-username, #username").forEach(el => el.textContent = d.username);
  }

  // ---------- Bootstrap ----------
  document.addEventListener("DOMContentLoaded", () => {
    try {
      setActiveNav();
      initGlobalUI();

      // init page-specific modules if elements exist
      initIndex();
      if (document.querySelector("#wasteType") || document.querySelector("#detectBtn") || document.querySelector("#detectWasteBtn")) initThrowPage();
      if (document.querySelector("#userPoints") || document.querySelector("#userBalance") || document.querySelector("#statusInfo")) initStatusPage();
      if (document.querySelector("#calibrateBtn") || document.querySelector("#calibrateAll") || document.querySelector("#runCalibrate")) initCalibrationPage();
      if (document.querySelector("#runDiagnostics") || document.querySelector("#checkBtn") || document.querySelector("#diagnosticResults") || document.querySelector("#maintenanceOutput")) initMaintenancePage();
      if (document.querySelector("#logList") || document.querySelector("#logs-body") || document.querySelector(".log-row")) initLogsPage();
      if (document.querySelector(".buyBtn") || document.querySelector(".reward-btn")) initRewardsPage();

      log("Initialization complete.");
    } catch (e) {
      err("Initialization failed:", e);
    }
  });

  // expose for debugging
  window.SmartBin = {
    readData, saveData, addPoints, addLog, simulateDetection: (t) => {
      const all = Object.values(CHEMICAL_SIGNS).flat();
      const detected = pick(all); const confidence = randFloat(0.6, 1.0);
      const correct = CHEMICAL_SIGNS[t] && CHEMICAL_SIGNS[t].includes(detected) && confidence > 0.75;
      return { type: t, detected, confidence, correct, ts: new Date().toISOString() };
    }
  };

})();
// --- Reward Page Notification ---
document.addEventListener("DOMContentLoaded", () => {
  const rewardButtons = document.querySelectorAll(".buyBtn, .reward-btn, button.buy");

  rewardButtons.forEach(button => {
    button.addEventListener("click", () => {
      const itemName = button.dataset.item || button.textContent.trim() || "Reward";
      
      // Create toast/notification
      const toast = document.createElement("div");
      toast.textContent = `🎁 You clicked on "${itemName}"!`;
      toast.style.position = "fixed";
      toast.style.bottom = "20px";
      toast.style.right = "20px";
      toast.style.background = "#0078ff";
      toast.style.color = "white";
      toast.style.padding = "12px 18px";
      toast.style.borderRadius = "8px";
      toast.style.boxShadow = "0 4px 15px rgba(0,0,0,0.2)";
      toast.style.zIndex = "9999";
      toast.style.fontFamily = "Poppins, sans-serif";
      toast.style.fontSize = "14px";
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.3s ease";

      document.body.appendChild(toast);
      setTimeout(() => { toast.style.opacity = "1"; }, 10);
      setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 500);
      }, 2000);
    });
  });
});
