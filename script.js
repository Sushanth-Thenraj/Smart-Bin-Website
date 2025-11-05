// REWARDS PAGE FIX — attach to DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  try {
    const STORAGE_KEY = "ECBIN_ECO_BALANCE";

    // default starting balance if none exists
    function getBalance() {
      return parseInt(localStorage.getItem(STORAGE_KEY) || "500", 10);
    }
    function setBalance(v) {
      localStorage.setItem(STORAGE_KEY, String(v));
      renderBalance();
    }

    // Create balance display at top of .container if not present
    function ensureBalanceDisplay() {
      const container = document.querySelector(".container");
      if (!container) return null;
      let bd = container.querySelector("#balanceDisplay");
      if (!bd) {
        bd = document.createElement("div");
        bd.id = "balanceDisplay";
        bd.style.marginBottom = "18px";
        bd.style.fontWeight = "700";
        bd.style.fontSize = "1.05rem";
        bd.textContent = `Balance: ${getBalance()} coins`;
        container.insertBefore(bd, container.firstChild);
      }
      return bd;
    }

    function renderBalance() {
      const bd = document.querySelector("#balanceDisplay");
      if (bd) bd.textContent = `Balance: ${getBalance()} coins`;
    }

    // Parse cost from a <p> element like "Cost: 20 coins"
    function parseCostFromCard(card) {
      if (!card) return NaN;
      // look for element that includes "Cost"
      const p = Array.from(card.querySelectorAll("p")).find(el => /cost\s*[:\-]/i.test(el.textContent));
      if (p) {
        const m = p.textContent.match(/(\d+)/);
        if (m) return parseInt(m[1], 10);
      }
      // fallback: look for data-cost attribute on card or button
      const dc = card.getAttribute("data-cost");
      if (dc && !Number.isNaN(parseInt(dc,10))) return parseInt(dc,10);
      return NaN;
    }

    // Disable purchased item visually
    function markPurchased(card, btn) {
      card.style.opacity = "0.6";
      btn.disabled = true;
      btn.textContent = "Purchased";
      btn.style.cursor = "default";
    }

    // Attach handlers to redeem buttons in reward-card
    function wireUpRewards() {
      const cards = document.querySelectorAll(".reward-card, .reward-item, .card");
      if (!cards || cards.length === 0) {
        // fallback: find buttons directly inside container
        const fallbackBtns = document.querySelectorAll(".container button");
        fallbackBtns.forEach(btn => attachButtonHandler(btn, null));
        return;
      }

      cards.forEach(card => {
        const btn = card.querySelector("button");
        if (!btn) return;
        // read item name from h3 or h2 inside card
        const titleEl = card.querySelector("h3, h2, .title");
        const itemName = titleEl ? titleEl.textContent.trim() : "Item";
        // cost parsing
        const cost = parseCostFromCard(card);
        // if purchase already recorded, disable
        const purchasedKey = `ECBIN_PURCHASED_${itemName.replace(/\s+/g, "_")}`;
        const already = localStorage.getItem(purchasedKey) === "1";
        if (already) {
          markPurchased(card, btn);
        }

        // attach click handler
        btn.addEventListener("click", (ev) => {
          ev.preventDefault();
          const bal = getBalance();
          if (Number.isNaN(cost)) {
            alert(`No cost found for "${itemName}". Contact admin.`);
            return;
          }
          if (bal >= cost) {
            const newBal = bal - cost;
            setBalance(newBal);
            // store purchased state so reload keeps it disabled
            localStorage.setItem(purchasedKey, "1");
            markPurchased(card, btn);
            alert(`✅ You purchased "${itemName}" for ${cost} coins.\nRemaining balance: ${newBal} coins.`);
          } else {
            alert(`❌ Not enough coins. ${itemName} costs ${cost} coins but you have ${bal}.`);
          }
        });
      });
    }

    // initialize
    ensureBalanceDisplay();
    renderBalance();
    wireUpRewards();

    // expose helper for debugging
    window.ECBin = window.ECBin || {};
    window.ECBin.getBalance = getBalance;
    window.ECBin.setBalance = setBalance;
  } catch (e) {
    console.error("Rewards fix failed:", e);
  }
});
