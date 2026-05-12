// ORION Build Calculator
// Single source of truth for kit / add-on pricing.
// Each kit has: base (one-time), monthly (recurring per unit), and add-ons.
// Each add-on can have one-time and/or monthly cost; max is constrained by kit qty.

const KITS = [
  {
    id: 'core',
    num: '001',
    name: 'ORION-Core',
    role: 'Wing HQ anchor',
    base: 1595,
    monthly: 9.99,
    monthlyLabel: 'UniFi Talk Plus (per line)',
    addons: [
      { id: 'core-2nd-phone', name: 'Second phone', desc: 'G3 Touch Pro phone + PoE injector. Adds a second Talk line.', oneTime: 207, monthly: 9.99, type: 'qty' }
    ],
    status: 'progress',
    statusLabel: 'In Progress'
  },
  {
    id: 'trailer',
    num: '002',
    name: 'ORION-Trailer',
    role: 'Mobile network core',
    base: 4995,
    monthly: 155,
    monthlyLabel: 'Starlink Business 500 GB',
    addons: [],
    status: 'tested',
    statusLabel: 'Field Tested'
  },
  {
    id: 'base',
    num: '003',
    name: 'ORION-Base',
    role: 'Mission base extension',
    base: 4995,
    monthly: 0,
    addons: [
      { id: 'base-wan',     name: 'Standalone WAN package', desc: 'UDM-Pro + Starlink Standard for independent operation. Adds $55/mo Starlink Business.', oneTime: 750, monthly: 55, type: 'qty' },
      { id: 'base-display', name: 'Display package',        desc: '4,000-lumen projector + screen + second Display Cast Pro + cables, transit bag.', oneTime: 1500, monthly: 0, type: 'qty' },
      { id: 'base-cable',   name: 'Cable trailer link',     desc: '300 ft outdoor Cat6 (surge-protected) or armored fiber + SFP+ modules.',                 oneTime: 250, monthly: 0, type: 'qty' }
    ],
    status: 'proposed',
    statusLabel: 'Proposed'
  },
  {
    id: 'fleet',
    num: '004',
    name: 'ORION-Fleet',
    role: 'Vehicle node',
    base: 2495,
    monthly: 55,
    monthlyLabel: 'Starlink Business 50 GB',
    addons: [
      { id: 'fleet-df',      name: 'Direction finding',      desc: 'KrakenSDR + magnetic antenna set + Raspberry Pi 5. ELT bearings into ATAK.', oneTime: 1200, monthly: 0, type: 'qty' },
      { id: 'fleet-readyop', name: 'ReadyOp gateway',        desc: 'VHF base radio comms over IP. Procured through National.', oneTime: 0, monthly: 0, type: 'qty', tag: 'rec', tagLabel: 'Recommended' },
      { id: 'fleet-suas',    name: 'sUAS package',           desc: '32" display + lockable wall mount + awning + 1,000 W pure sine inverter. Vans only.', oneTime: 1000, monthly: 0, type: 'qty', tag: 'rec', tagLabel: 'Vans only' }
    ],
    status: 'proposed',
    statusLabel: 'Proposed'
  },
  {
    id: 'air',
    num: '005',
    name: 'ORION-Air',
    role: 'Aircraft node',
    base: 0,
    monthly: 0,
    concept: true,
    addons: [],
    status: 'concept',
    statusLabel: 'Concept — pricing TBD'
  }
];

// ---------- State ----------
const state = {
  qty: {},        // kitId -> quantity
  addonQty: {}    // addonId -> quantity
};
KITS.forEach(k => { state.qty[k.id] = 0; k.addons.forEach(a => state.addonQty[a.id] = 0); });

// ---------- Format ----------
const fmt = (n) => {
  if (Math.abs(n - Math.round(n)) < 0.005) return '$' + Math.round(n).toLocaleString();
  return '$' + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// ---------- Render the kit blocks ----------
function renderKits() {
  const root = document.getElementById('calc-kits');
  root.innerHTML = '';
  KITS.forEach(kit => {
    const card = document.createElement('div');
    card.className = 'calc-kit' + (kit.concept ? ' concept' : '');
    card.innerHTML = `
      <div class="calc-kit-head">
        <div>
          <div class="num">KIT ${kit.num} · ${kit.statusLabel}</div>
          <div class="name">${kit.name}</div>
          <div class="muted" style="font-size:0.82rem;">${kit.role}</div>
        </div>
        <div class="price-hint">
          ${kit.concept ? '<span class="muted">Pricing TBD</span>' : fmt(kit.base) + '<span class="suffix">one-time</span>' + (kit.monthly ? '<br><span style="color:var(--soft); font-size:0.72rem;">+' + fmt(kit.monthly) + '/mo' + (kit.monthlyLabel ? ' · ' + kit.monthlyLabel : '') + '</span>' : '')}
        </div>
      </div>
      <div class="calc-row">
        <div class="label">
          <span class="lbl-name">Quantity</span>
          <span class="lbl-desc">${kit.concept ? 'Disabled — see the kit page for the open questions.' : 'How many of this kit to include.'}</span>
        </div>
        ${kit.concept
          ? '<span class="lbl-tag concept">Concept</span>'
          : qtyControl(kit.id, state.qty[kit.id], 0, 50, e => onQtyChange(kit.id, e))
        }
      </div>
      ${kit.addons.map(a => addonRow(kit, a)).join('')}
    `;
    root.appendChild(card);
  });
  // Wire the qty controls after insertion
  KITS.forEach(kit => {
    if (kit.concept) return;
    wireQty('kit-' + kit.id, state.qty[kit.id], v => onQtyChange(kit.id, v));
    kit.addons.forEach(a => {
      wireQty('addon-' + a.id, state.addonQty[a.id], v => onAddonChange(a.id, v));
    });
  });
}

function qtyControl(id, value, min, max, _onChange) {
  return `
    <div class="qty-control" data-target="kit-${id}">
      <button type="button" class="qty-btn" data-act="dec">−</button>
      <input type="number" class="qty-input" id="kit-${id}" value="${value}" min="${min}" max="${max}" inputmode="numeric">
      <button type="button" class="qty-btn" data-act="inc">+</button>
    </div>
  `;
}

function addonRow(kit, a) {
  const max = state.qty[kit.id]; // capped by parent kit qty
  const tag = a.tag ? ` <span class="lbl-tag ${a.tag}">${a.tagLabel || ''}</span>` : '';
  const priceLine = a.oneTime > 0
    ? `+${fmt(a.oneTime)}` + (a.monthly ? `<span class="suffix"> + ${fmt(a.monthly)}/mo</span>` : '<span class="suffix"> one-time</span>')
    : (a.monthly > 0 ? `+${fmt(a.monthly)}<span class="suffix">/mo</span>` : `${fmt(0)}`);
  return `
    <div class="calc-row addon-row" data-parent="${kit.id}">
      <div class="label">
        <span class="lbl-name">${a.name}${tag}</span>
        <span class="lbl-desc">${a.desc}</span>
        <span class="lbl-desc"><strong style="color:var(--navy);">${priceLine}</strong> · max ${max}</span>
      </div>
      <div class="qty-control" data-target="addon-${a.id}">
        <button type="button" class="qty-btn" data-act="dec">−</button>
        <input type="number" class="qty-input" id="addon-${a.id}" value="${state.addonQty[a.id]}" min="0" max="${max}" inputmode="numeric" ${max === 0 ? 'disabled' : ''}>
        <button type="button" class="qty-btn" data-act="inc" ${max === 0 ? 'disabled' : ''}>+</button>
      </div>
    </div>
  `;
}

function wireQty(inputId, _initial, cb) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const wrap = input.closest('.qty-control');
  wrap.querySelector('[data-act="dec"]').addEventListener('click', () => {
    const v = Math.max(parseInt(input.min || '0', 10), (parseInt(input.value, 10) || 0) - 1);
    input.value = v; cb(v);
  });
  wrap.querySelector('[data-act="inc"]').addEventListener('click', () => {
    const max = parseInt(input.max, 10);
    const v = Math.min(isNaN(max) ? 999 : max, (parseInt(input.value, 10) || 0) + 1);
    input.value = v; cb(v);
  });
  input.addEventListener('input', () => {
    let v = parseInt(input.value, 10);
    if (isNaN(v) || v < 0) v = 0;
    const max = parseInt(input.max, 10);
    if (!isNaN(max) && v > max) v = max;
    input.value = v;
    cb(v);
  });
}

function onQtyChange(kitId, v) {
  state.qty[kitId] = v;
  const kit = KITS.find(k => k.id === kitId);
  // Update each add-on's max cap inline (avoids losing focus during typing).
  kit.addons.forEach(a => {
    if (state.addonQty[a.id] > v) state.addonQty[a.id] = v;
    const input = document.getElementById('addon-' + a.id);
    if (input) {
      input.max = v;
      input.value = state.addonQty[a.id];
      input.disabled = v === 0;
      const wrap = input.closest('.qty-control');
      wrap.querySelectorAll('.qty-btn').forEach(b => { b.disabled = v === 0; });
      const desc = wrap.parentElement.querySelector('.label .lbl-desc:last-of-type');
      if (desc) desc.innerHTML = desc.innerHTML.replace(/max \d+/, 'max ' + v);
    }
  });
  recalc();
}

function onAddonChange(addonId, v) {
  state.addonQty[addonId] = v;
  recalc();
}

// ---------- Totals ----------
function recalc() {
  let oneTime = 0;
  let monthly = 0;
  const lines = [];

  KITS.forEach(kit => {
    const q = state.qty[kit.id];
    if (q > 0 && !kit.concept) {
      const sub = kit.base * q;
      oneTime += sub;
      if (kit.monthly) monthly += kit.monthly * q;
      lines.push({ name: `${q} × ${kit.name}`, one: sub, mo: kit.monthly * q });
    }
    kit.addons.forEach(a => {
      const aq = state.addonQty[a.id];
      if (aq > 0) {
        const sub1 = a.oneTime * aq;
        const subM = a.monthly * aq;
        oneTime += sub1;
        monthly += subM;
        lines.push({ name: `${aq} × ${a.name}`, one: sub1, mo: subM });
      }
    });
  });

  const summary = document.getElementById('calc-summary-lines');
  if (lines.length === 0) {
    summary.innerHTML = '<div class="calc-line empty"><span class="nm">No kits selected</span><span class="vl">—</span></div>';
  } else {
    summary.innerHTML = lines.map(l =>
      `<div class="calc-line"><span class="nm">${l.name}</span><span class="vl">${fmt(l.one)}${l.mo ? ' <span style="color:var(--silver-soft); font-size:0.78rem;">+ ' + fmt(l.mo) + '/mo</span>' : ''}</span></div>`
    ).join('');
  }

  document.getElementById('total-onetime').textContent = fmt(oneTime);
  document.getElementById('total-monthly').textContent = fmt(monthly) + '/mo';
  document.getElementById('total-year1').textContent = fmt(oneTime + monthly * 12);
  document.getElementById('total-3year').textContent = fmt(oneTime + monthly * 36);
}

// ---------- Actions ----------
function resetAll() {
  KITS.forEach(k => { state.qty[k.id] = 0; k.addons.forEach(a => state.addonQty[a.id] = 0); });
  renderKits(); recalc();
}

function printSummary() { window.print(); }

document.addEventListener('DOMContentLoaded', () => {
  renderKits();
  recalc();
  document.getElementById('btn-reset').addEventListener('click', resetAll);
  document.getElementById('btn-print').addEventListener('click', printSummary);
});
