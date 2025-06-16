// quote.js
import { loadQuote, acceptQuote } from "./firebase.js";

// Grab elements
const cardsGrid    = document.getElementById("cards");
const pricingSec   = document.getElementById("pricingSection");
const tablesGrid   = document.getElementById("pricingTablesContainer");
const acceptChk    = document.getElementById("acceptQuote");
const checkoutBtn  = document.getElementById("checkoutBtn");
const featureModal = document.getElementById("featureModal");
const featureList  = document.getElementById("featureList");
const closeModal   = featureModal.querySelector(".close");

// 1. Read quote ID from URL
const params = new URLSearchParams(window.location.search);
const quoteId = params.get("id");
if (!quoteId) {
  document.body.innerHTML = "<p>No quote specified.</p>";
  throw new Error("Missing quote ID");
}

// 2. Load and render
(async function() {
  try {
    const config = await loadQuote(quoteId);

    // Render cards
    config.plans.forEach((plan, i) => {
      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = `
        <img src="${plan.platform === "Protégé" ? "Protege.png" : "LexisPlus.png"}" alt="Logo" />
        <h2>${plan.platform} – ${plan.tier}</h2>
        <p><strong>Monthly Rate:</strong> $${plan.rate.toFixed(2)}</p>
        <button data-plan="${i}" class="details-btn">View Full Features</button>
      `;
      cardsGrid.appendChild(div);

      // Pricing table
      // (Compute exactly as in app.js but read-only)
    });

    // Build pricing tables
    buildPricingTables(config);

  } catch (e) {
    document.body.innerHTML = `<p>Error loading quote: ${e.message}</p>`;
  }
})();

// Reuse your pricing-table generator logic, e.g.:
function buildPricingTables(cfg) {
  tablesGrid.innerHTML = "";
  cfg.plans.forEach((plan, idx) => {
    let rows = "";
    if (cfg.promo != null) {
      rows += `<tr><td>Promotional Period</td><td>$${cfg.promo.toFixed(2)}</td></tr>`;
    }
    for (let y = 1; y <= cfg.years; y++) {
      const rate = y === 1
        ? plan.rate
        : plan.rate * Math.pow(1 + cfg.growth, y - 1);
      rows += `<tr><td>Year ${y}</td><td>$${rate.toFixed(2)}</td></tr>`;
    }
    const w = document.createElement("div");
    w.className = "pricing-table-wrapper";
    w.innerHTML = `
      <h3>${plan.platform} – ${plan.tier}</h3>
      <table>
        <thead><tr><th>Period</th><th>Monthly Rate</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
    tablesGrid.appendChild(w);
  });
  pricingSec.style.display = "block";
}

// 3. Enable checkout when they accept
acceptChk.addEventListener("change", () => {
  checkoutBtn.disabled = !acceptChk.checked;
});

// 4. On checkout click: mark accepted & go to payment
checkoutBtn.addEventListener("click", async () => {
  await acceptQuote(quoteId);
  // TODO: create a Stripe Checkout Session for `config` amount
  // then `window.location.href = session.url`
  window.location.href = "/payment.html?quote=" + quoteId;
});

// 5. Feature‐modal (optional)
document.querySelectorAll(".details-btn").forEach(btn =>
  btn.addEventListener("click", e => {
    featureList.innerHTML = "";
    const plan = /* pull correct plan.features from loaded config */;
    plan.features.forEach(f => {
      const li = document.createElement("li");
      li.textContent = f;
      featureList.appendChild(li);
    });
    featureModal.style.display = "flex";
  })
);
closeModal.addEventListener("click", () => (featureModal.style.display = "none"));
window.addEventListener("click", e => { if (e.target === featureModal) featureModal.style.display = "none"; });
