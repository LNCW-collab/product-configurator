// app.js
import { saveQuote } from "./firebase.js";

// Data definitions
const stateToGroup = {
  AL:'Group A',AZ:'Group A',CA:'Group A',CO:'Group A',CT:'Group A',
  FL:'Group A',GA:'Group A',IL:'Group A',IN:'Group A',LA:'Group A',
  MA:'Group A',MD:'Group A',MI:'Group A',MN:'Group A',MO:'Group A',
  NJ:'Group A',NV:'Group A',NY:'Group A',OH:'Group A',OR:'Group A',
  PA:'Group A',SC:'Group A',TN:'Group A',TX:'Group A',VA:'Group A',
  WA:'Group A',WI:'Group A',
  AR:'Group B',DE:'Group B',HI:'Group B',IA:'Group B',ID:'Group B',
  KS:'Group B',KY:'Group B',ME:'Group B',MS:'Group B',NC:'Group B',
  NE:'Group B',NH:'Group B',OK:'Group B',RI:'Group B',UT:'Group B',
  WV:'Group B',
  AK:'Group C',ND:'Group C',NM:'Group C',SD:'Group C',MT:'Group C',
  WY:'Group C'
};
const tierMapping = {
  "Group A": ["State Essential","State Enhanced","State Professional","Premier"],
  "Group B": ["State Essential","State Enhanced","State Professional","Premier"],
  "Group C": ["State Essential","State Enhanced","State Professional","Premier"]
};
const featuresByTier = {
  'State Essential': {
    features:[
      'State Cases: broad state-specific case law',
      'State Statutes & Legislation: real-time updates',
      'State Briefs, Pleadings & Motions',
      'Verdicts & Settlements: largest collection',
      'State Jury Instructions',
      'Shepard’s Citations Service'
    ],
    logo:'LexisPlus.png'
  },
  'State Enhanced': {
    features:[
      'All State Essential features',
      'State Agency & Admin Materials',
      'Federal Cases: widest federal case law',
      'Federal Legislative Materials: congressional acts & bills',
      'Automated Templates: State Automated Templates',
      'Matthew Bender: State edition',
      'Practical Guidance: All Forms & Practical Guidance'
    ],
    logo:'LexisPlus.png'
  },
  'State Professional': {
    features:[
      'All State Enhanced features',
      'Federal Agency & Admin Materials',
      'CourtLink: court dockets & documents',
      'News: Law360 daily coverage',
      'Verdicts & Settlements',
      'Jury Instructions: All Jury Instructions'
    ],
    logo:'LexisPlus.png'
  },
  'Premier': {
    features:[
      'All State Professional features',
      'AI Summaries: advanced AI insights',
      'Advanced Research Tools'
    ],
    logo:'LexisPlus.png'
  }
};

// DOM refs
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

// Populate state dropdown
Object.keys(stateToGroup).forEach(s => sgSelect.add(new Option(s,s)));
sgSelect.addEventListener('change', () => {
  selectedGroup = stateToGroup[sgSelect.value];
  numSelect.disabled = false;
  numSelect.selectedIndex = 0;
  cardsCnt.innerHTML = '';
  resetAll();
});

// Number of plans
numSelect.addEventListener('change', () => {
  slotsCnt.innerHTML = '';
  for (let i = 1; i <= +numSelect.value; i++) renderSlot(i);
  setupSlots();
  cardsCnt.innerHTML = '';
  resetAll();
});

function renderSlot(i) {
  const d = document.createElement('div');
  d.className='slot'; d.id=`slot${i}`;
  d.innerHTML=`
    <label>Platform</label>
    <select id="platform${i}">
      <option disabled selected>— Select —</option>
      <option>Lexis+</option>
      <option>Protégé</option>
    </select>
    <label>Category</label>
    <select id="tier${i}" disabled>
      <option disabled selected>— Select —</option>
    </select>
    <label>Monthly Rate</label>
    <input type="number" id="price${i}" placeholder="0.00" disabled />
  `;
  slotsCnt.appendChild(d);
}

function setupSlots() {
  selectedPlans = [];
  const arr = Array.from(slotsCnt.children).map(div=>({
    plat: div.querySelector('[id^=platform]'),
    tier: div.querySelector('[id^=tier]'),
    price: div.querySelector('input[id^=price]'),
    idx: Array.from(slotsCnt.children).indexOf(div)
  }));

  arr.forEach(s => {
    s.plat.disabled = false;
    s.plat.addEventListener('change', () => {
      s.tier.disabled = false;
      s.tier.innerHTML = `<option disabled selected>— Select —</option>`;
      tierMapping[selectedGroup].forEach(t=> s.tier.add(new Option(t,t)));
      s.price.disabled = true;
      updateCards(); resetAll();
    });
    s.tier.addEventListener('change', () => { s.price.disabled=false; updateCards(); resetAll(); });
    s.price.addEventListener('input', ()=>{ updateCards(); resetAll(); });
  });
}

function updateCards() {
  cardsCnt.innerHTML = '';
  selectedPlans = [];
  Array.from(slotsCnt.children).forEach((div,i)=> {
    const platRaw = div.querySelector('[id^=platform]').value;
    const tierRaw = div.querySelector('[id^=tier]').value;
    const rateRaw = div.querySelector('input[id^=price]').value;
    const plat = platRaw.trim(), tier = tierRaw.trim(), rate = rateRaw.trim();
    if (!plat||!tier) return;

    const data = featuresByTier[tier];
    if (!data) { console.warn(`no features for ${tier}`); return; }

    const logo = plat==='Protégé' ? 'Protege.png' : data.logo;
    const card = document.createElement('div');
    card.className='card'; card.dataset.slot=i;
    card.innerHTML=`
      <button class="remove-btn" data-slot="${i}">&times;</button>
      <img src="${logo}" alt="Logo"/>
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
}

// card-buttons
cardsCnt.addEventListener('click', e=>{
  if (e.target.matches('.remove-btn')) {
    const i = +e.target.dataset.slot;
    const slot = slotsCnt.children[i];
    slot.querySelector('[id^=platform]').value='';
    const tsel = slot.querySelector('[id^=tier]');
    tsel.innerHTML=`<option disabled selected>— Select —</option>`;
    tsel.disabled = true;
    const pin = slot.querySelector('input[id^=price]');
    pin.value=''; pin.disabled=true;
    updateCards();
    return;
  }

  if (e.target.matches('.pricing-btn')) {
    const i = +e.target.dataset.slot;
    const c = e.target.closest('.card');
    if (selectedPlans.includes(i)) {
      selectedPlans = selectedPlans.filter(x=>x!==i);
      c.classList.remove('selected');
    } else {
      selectedPlans.push(i);
      c.classList.add('selected');
    }
    promoInp.disabled = promoTog.value==='no' || !selectedPlans.length;
    generateTables(); updateProceed();
    return;
  }

  if (e.target.matches('.details-btn')) {
    const i = +e.target.dataset.slot;
    const tier = slotsCnt.children[i].querySelector('[id^=tier]').value;
    showModal(featuresByTier[tier].features);
  }
});

function resetAll(){
  priceSec.style.display='none';
  promoTog.value='no';
  promoInp.disabled=true; promoInp.value='';
  yearsSel.value='1'; growthInp.value='3';
  tablesCnt.innerHTML=''; skuInput.value='';
  agreeChk.checked=false; proceedBtn.disabled=true;
  selectedPlans=[]; document.querySelectorAll('.card.selected').forEach(c=>c.classList.remove('selected'));
}

// …above this, all your existing variable & DOM refs…

// Re-work generateTables to always render y=1…N rows
function generateTables() {
  // if no plans selected, hide and bail
  if (selectedPlans.length === 0) {
    priceSec.style.display = 'none';
    tablesCnt.innerHTML = '';
    return;
  }

  const includePromo = promoTog.value === 'yes';
  const promoVal     = includePromo ? +promoInp.value : 0;
  const yrs          = +yearsSel.value;            // number of years from dropdown
  const gr           = +growthInp.value / 100;     // percentage → decimal

  // show the whole section and clear existing tables
  priceSec.style.display = 'block';
  tablesCnt.innerHTML = '';

  // for each selected plan, build a little pricing table
  selectedPlans.forEach(i => {
    const slot = slotsCnt.children[i];
    const p    = slot.querySelector('[id^=platform]').value;
    const t    = slot.querySelector('[id^=tier]').value;
    const r    = +slot.querySelector('input[id^=price]').value;
    const data = featuresByTier[t];
    const logo = p === 'Protégé' ? 'Protege.png' : data.logo;

    // build the rows string
    let rows = '';

    if (includePromo) {
      rows += `<tr><td>Promotional Period</td><td>$${promoVal.toFixed(2)}</td></tr>`;
    }

    for (let y = 1; y <= yrs; y++) {
      // Year 1 = base rate; subsequent years compound by growth rate
      const rate = y === 1
        ? r
        : r * Math.pow(1 + gr, y - 1);

      rows += `<tr><td>Year ${y}</td><td>$${rate.toFixed(2)}</td></tr>`;
    }

    // create the wrapper DIV and insert into the DOM
    const wrapper = document.createElement('div');
    wrapper.className = 'pricing-table-wrapper';
    wrapper.innerHTML = `
      <h3>${p} – ${t}</h3>
      <img src="${logo}" alt="Logo" />
      <table>
        <thead><tr><th>Period</th><th>Monthly Rate</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
    tablesCnt.appendChild(wrapper);
  });
}

// Make sure changing Years or Growth re-calls generateTables
yearsSel.addEventListener('change', () => {
  generateTables();
  updateProceed();  // if you want the Proceed button enabled/disabled immediately
});
growthInp.addEventListener('input', () => {
  generateTables();
  updateProceed();
});
promoTog.addEventListener('change', () => {
  // toggle the promo-input field enabled state
  promoInp.disabled = promoTog.value === 'no' || selectedPlans.length === 0;
  generateTables();
  updateProceed();
});
promoInp.addEventListener('input', () => {
  generateTables();
  updateProceed();
});


function showModal(list){
  featureUl.innerHTML='';
  list.forEach(f=>{
    const li = document.createElement('li');
    li.textContent = f;
    featureUl.appendChild(li);
  });
  modal.style.display='flex';
}
closeModal.addEventListener('click', ()=>modal.style.display='none');
window.addEventListener('click', e=>{ if(e.target===modal) modal.style.display='none'; });

function updateProceed(){
  const gotRadio = !!document.querySelector('input[name=chosenQuote]:checked');
  proceedBtn.disabled = !(gotRadio && agreeChk.checked);
}

// Reset & Proceed handlers
resetBtn.addEventListener('click', ()=>{
  sgSelect.selectedIndex=0;
  numSelect.disabled=true; numSelect.selectedIndex=0;
  slotsCnt.innerHTML=''; cardsCnt.innerHTML='';
  resetAll();
});
agreeChk.addEventListener('change', updateProceed);

proceedBtn.addEventListener('click', async()=>{
  const chosen = Number(document.querySelector('input[name=chosenQuote]:checked').value);
  const config = {
    state: sgSelect.value,
    plans: selectedPlans.map(i=>{
      const s = slotsCnt.children[i];
      return {
        platform: s.querySelector('[id^=platform]').value,
        tier:     s.querySelector('[id^=tier]').value,
        rate:     +s.querySelector('input[id^=price]').value
      };
    }),
    promo:  promoTog.value==='yes'?+promoInp.value:null,
    years:  +yearsSel.value,
    growth: +growthInp.value,
    skus:   skuInput.value.split('\n').filter(x=>x),
    chosenPlanIndex: chosen
  };
  const id = await saveQuote(config);
  window.location.href = `quote.html?id=${id}`;
});
