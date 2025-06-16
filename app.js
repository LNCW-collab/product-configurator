// app.js
import { saveQuote } from "./firebase.js";

// --- Data Definitions ---
const stateToGroup = { /* same as before */ };
const tierMapping = { /* same as before */ };
const featuresByTier = { /* same as before */ };

// --- DOM Refs ---
const sgSelect   = document.getElementById('stateSelect');
const numSelect  = document.getElementById('numPlans');
const slotsCnt   = document.getElementById('slotsContainer');
const cardsCnt   = document.getElementById('cards');
const promoTog   = document.getElementById('promoToggle');
const promoInp   = document.getElementById('promoPrice');
const yearsSel   = document.getElementById('numYears');
const growthInp  = document.getElementById('growthRate');
const priceSec   = document.getElementById('pricingSection');
const tablesCnt  = document.getElementById('pricingTablesContainer');
const skuInput   = document.getElementById('skuInput');
const agreeChk   = document.getElementById('agreeTerms');
const proceedBtn = document.getElementById('proceedBtn');
const resetBtn   = document.getElementById('resetBtn');
const modal      = document.getElementById('featureModal');
const featureUl  = document.getElementById('featureList');
const closeModal = modal.querySelector('.close');

let selectedGroup = null;
let selectedPlans = [];

// Initialize State Dropdown
Object.keys(stateToGroup).forEach(st => sgSelect.add(new Option(st, st)));
sgSelect.addEventListener('change', () => {
  selectedGroup = stateToGroup[sgSelect.value];
  numSelect.disabled = false;
  numSelect.selectedIndex = 0;
  cardsCnt.innerHTML = '';
  resetAll();
});

// Number of Plans
numSelect.addEventListener('change', () => {
  slotsCnt.innerHTML = '';
  for (let i = 1; i <= +numSelect.value; i++) renderSlot(i);
  setupSlots();
  cardsCnt.innerHTML = '';
  resetAll();
});

function renderSlot(i) {
  const d = document.createElement('div'); d.className = 'slot'; d.id = 'slot' + i;
  d.innerHTML = `
    <label>Platform</label>
    <select id="platform${i}"><option disabled selected>— Select —</option><option>Lexis+</option><option>Protégé</option></select>
    <label>Category</label>
    <select id="tier${i}" disabled><option disabled selected>— Select —</option></select>
    <label>Monthly Rate</label>
    <input type="number" id="price${i}" placeholder="0.00" disabled />
  `;
  slotsCnt.appendChild(d);
}

function setupSlots() {
  selectedPlans = [];
  const arr = Array.from(slotsCnt.children).map(div => ({
    plat: div.querySelector('[id^=platform]'),
    tier: div.querySelector('[id^=tier]'),
    price: div.querySelector('input[id^=price]'),
    idx: Array.from(slotsCnt.children).indexOf(div)
  }));

  arr.forEach(s => {
    s.plat.disabled = false;
    s.plat.addEventListener('change', () => {
      s.tier.disabled = false;
      s.tier.innerHTML = '<option disabled selected>— Select —</option>';
      tierMapping[selectedGroup].forEach(t => s.tier.add(new Option(t, t)));
      s.price.disabled = true;
      updateCards(); resetAll();
    });
    s.tier.addEventListener('change', () => { s.price.disabled = false; updateCards(); resetAll(); });
    s.price.addEventListener('input', () => { updateCards(); resetAll(); });
  });
}

function updateCards() {
  cardsCnt.innerHTML = '';
  selectedPlans = [];
  resetAll();

  Array.from(slotsCnt.children).forEach((div, i) => {
    const platRaw = div.querySelector('[id^=platform]').value;
    const rawTier = div.querySelector('[id^=tier]').value;
    const rateRaw = div.querySelector('input[id^=price]').value;
    const plat = platRaw.trim(), tier = rawTier.trim(), rate = rateRaw.trim();
    if (!plat || !tier) return;

    console.log('rendering card for tier:', JSON.stringify(tier));
    const data = featuresByTier[tier];
    if (!data) {
      console.warn(`⚠️ No featuresByTier entry for "${tier}". Valid: ${Object.keys(featuresByTier).join(', ')}`);
      return;
    }

    const logo = plat === 'Protégé' ? 'Protege.png' : data.logo;
    const card = document.createElement('div');
    card.className = 'card'; card.dataset.slot = i;
    card.innerHTML = `
      <button class="remove-btn" data-slot="${i}">&times;</button>
      <img src="${logo}" alt="Logo" />
      <h2>${plat} – ${tier}</h2>
      <p><strong>Monthly Rate:</strong> $${rate}</p>
      <p><strong>Features:</strong> ${data.features.join('; ')}</p>
      <div class="card-footer">
        <button data-slot="${i}" class="pricing-btn">Show Pricing Table</button>
        <button data-slot="${i}" class="details-btn">View Full Features</button>
      </div>
    `;
    cardsCnt.appendChild(card);
  });

  // attach listeners to new cards...
  // remove, pricing-btn, details-btn logic unchanged
}

// rest of your generateTables(), resetAll(), modal logic, and proceed handler remain unchanged
```
