// ==========================================================
// SMART TRASH BIN PROJECT - SCRIPT.JS
// Author: Sushanth Thenraj
// Version: 2.0 (Fully Interactive & Linked)
// ==========================================================

// === INITIALIZATION ===
function initUserData() {
  let userData = localStorage.getItem("smartBinUser");
  if (!userData) {
    userData = {
      username: "EcoUser01",
      balance: 200,
      rewards: [],
      totalWaste: 0,
      binsUsed: 0,
    };
    localStorage.setItem("smartBinUser", JSON.stringify(userData));
  }
  return JSON.parse(userData);
}

function saveUserData(data) {
  localStorage.setItem("smartBinUser", JSON.stringify(data));
}

// === DISPLAY USER INFO ON EACH PAGE ===
function displayUserInfo() {
  const data = initUserData();
  const balanceElement = document.getElementById("userBalance");
  if (balanceElement) balanceElement.textContent = data.balance;

  const usernameElement = document.getElementById("username");
  if (usernameElement) usernameElement.textContent = data.username;
}

// === ADD WASTE AND REWARD POINTS ===
function addWaste(wasteType) {
  const data = initUserData();
  let points = 0;

  switch (wasteType) {
    case "organic": points = 10; break;
    case "plastic": points = 20; break;
    case "metal": points = 30; break;
    case "glass": points = 25; break;
    default: points = 5;
  }

  data.balance += points;
  data.totalWaste += 1;
  data.binsUsed += 1;

  saveUserData(data);

  const output = document.getElementById("output");
  if (output) {
    output.innerHTML = `♻️ You threw <b>${wasteType}</b> waste correctly and earned ${points} points!<br>
                        Total Balance: ${data.balance} coins.`;
  }

  displayUserInfo();
}

// === BUY REWARD ITEM ===
function buyItem(item, cost) {
  const data = initUserData();
  const output = document.getElementById("output");

  if (data.balance >= cost) {
    data.balance -= cost;
    data.rewards.push(item);
    saveUserData(data);
    displayUserInfo();

    if (output) {
      output.innerHTML = `✅ You purchased <b>${item}</b> for ${cost} coins.<br>Remaining Balance: ${data.balance}`;
    }

    // Eco Crystal Special Animation
    if (item === "Eco Crystal") {
      const popup = document.createElement("div");
      popup.id = "rarePopup";
      popup.innerHTML = "✨ You unlocked a <b>Rare Eco Crystal!</b> 💎";
      document.body.appendChild(popup);
      popup.style.display = "block";
      setTimeout(() => popup.remove(), 3000);
    }

  } else {
    if (output) {
      output.innerHTML = `❌ Not enough coins to buy ${item}.`;
    }
  }
}

// === SHOW STATUS PAGE DETAILS ===
function showStatus() {
  const data = initUserData();
  const statusBox = document.getElementById("statusInfo");
  if (statusBox) {
    statusBox.innerHTML = `
      <h3>User Status</h3>
      <p><b>Name:</b> ${data.username}</p>
      <p><b>Balance:</b> ${data.balance} coins</p>
      <p><b>Total Waste Thrown:</b> ${data.totalWaste}</p>
      <p><b>Bins Used:</b> ${data.binsUsed}</p>
      <p><b>Rewards:</b> ${data.rewards.join(", ") || "None"}</p>
    `;
  }
}

// === RESET DATA (MAINTENANCE / CALIBRATION) ===
function resetData() {
  localStorage.removeItem("smartBinUser");
  const msg = document.getElementById("output");
  if (msg) {
    msg.innerHTML = "⚙️ All system data reset successfully.";
  }
  displayUserInfo();
}

// === BUTTON LISTENERS ===
document.addEventListener("DOMContentLoaded", () => {
  displayUserInfo();

  // Waste throw buttons
  const wasteBtns = document.querySelectorAll(".throwBtn");
  wasteBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      addWaste(btn.dataset.type);
    });
  });

  // Reward buy buttons
  const buyBtns = document.querySelectorAll(".buyBtn");
  buyBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      buyItem(btn.dataset.item, parseInt(btn.dataset.cost));
    });
  });

  // Reset system button
  const resetBtn = document.getElementById("resetBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", resetData);
  }

  // Status load
  if (document.body.dataset.page === "status") {
    showStatus();
  }
});

// === ANIMATIONS & VISUAL FEEDBACK ===
function animateButton(btn) {
  btn.classList.add("clicked");
  setTimeout(() => btn.classList.remove("clicked"), 300);
}

// === DEBUG TOOL (Optional) ===
function debugUser() {
  console.log("User Data:", initUserData());
}
