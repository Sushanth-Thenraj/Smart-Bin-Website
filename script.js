// ===============================
// SMART BIN WEBSITE – SCRIPT.JS
// ===============================

// Highlight active navigation link
document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop();
  const links = document.querySelectorAll(".navbar a");

  links.forEach(link => {
    const href = link.getAttribute("href");
    if (href === currentPage) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
});

// ===============================
// THROW WASTE PAGE FUNCTIONALITY
// ===============================
if (window.location.pathname.includes("throw.html")) {
  const form = document.getElementById("wasteForm");
  const output = document.getElementById("resultOutput");

  if (form && output) {
    form.addEventListener("submit", e => {
      e.preventDefault();

      const wasteType = document.getElementById("wasteType").value;
      if (!wasteType) {
        output.textContent = "⚠️ Please select a waste type.";
        return;
      }

      const detected = ["organic", "plastic", "metal", "glass"];
      const randomDetected = detected[Math.floor(Math.random() * detected.length)];
      const confidence = (Math.random() * 0.3 + 0.7).toFixed(2);

      let message = `Detected chemical signature matches ${randomDetected.toUpperCase()} with ${confidence * 100}% confidence.`;

      if (wasteType === randomDetected && confidence > 0.75) {
        const points = Math.round(confidence * 10);
        message += ` ✅ Correct disposal! You earned ${points} eco-points.`;
      } else {
        message += ` ❌ Incorrect bin. Please check before disposing again.`;
      }

      output.textContent = message;
    });
  }
}

// ===============================
// CALIBRATION PAGE FUNCTIONALITY
// ===============================
if (window.location.pathname.includes("calibration.html")) {
  const calibrateBtn = document.getElementById("calibrateAll");
  const statusBox = document.getElementById("calibrationStatus");

  if (calibrateBtn && statusBox) {
    calibrateBtn.addEventListener("click", () => {
      statusBox.innerHTML = "<p>🔧 Recalibrating sensors...</p>";
      setTimeout(() => {
        const sensors = ["Organic", "Plastic", "Metal", "Glass"];
        let results = sensors.map(sensor => {
          const offset = (Math.random() * 0.1 - 0.05).toFixed(3);
          const multiplier = (Math.random() * 0.2 + 0.9).toFixed(3);
          return `✅ ${sensor} sensor recalibrated (offset=${offset}, multiplier=${multiplier})`;
        }).join("<br>");
        statusBox.innerHTML = results;
      }, 2000);
    });
  }
}

// ===============================
// MAINTENANCE PAGE FUNCTIONALITY
// ===============================
if (window.location.pathname.includes("maintenance.html")) {
  const checkBtn = document.getElementById("runDiagnostics");
  const resultBox = document.getElementById("diagnosticResults");

  if (checkBtn && resultBox) {
    checkBtn.addEventListener("click", () => {
      resultBox.innerHTML = "<p>🔍 Running system diagnostics...</p>";
      setTimeout(() => {
        const sensors = ["Organic", "Plastic", "Metal", "Glass"];
        let diagnostics = sensors.map(sensor => {
          const health = Math.floor(Math.random() * 20) + 80;
          const temp = (Math.random() * 8 + 22).toFixed(1);
          const status = health >= 90 ? "✅ OK" : "⚠️ Needs Cleaning";
          return `${sensor}: Health ${health}% | Temp ${temp}°C | ${status}`;
        }).join("<br>");
        resultBox.innerHTML = diagnostics;
      }, 2000);
    });
  }
}

// ===============================
// REWARDS PAGE FUNCTIONALITY
// ===============================
if (window.location.pathname.includes("rewards.html")) {
  const buttons = document.querySelectorAll(".reward-btn");
  const balanceEl = document.getElementById("userBalance");

  let balance = 200; // Example starting balance
  if (balanceEl) balanceEl.textContent = balance;

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const cost = parseInt(btn.dataset.cost);
      const item = btn.dataset.item;

      if (balance >= cost) {
        balance -= cost;
        balanceEl.textContent = balance;
        alert(`✅ You purchased ${item}! Remaining balance: ${balance} coins.`);
      } else {
        alert(`❌ Not enough coins for ${item}.`);
      }
    });
  });
}
