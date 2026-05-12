// ORION Build Calculator
// Single source of truth for kit / add-on pricing.
// Each kit has: base (one-time), monthly (recurring per unit), and add-ons.
// Each add-on can have one-time and/or monthly cost.
// Add-ons may declare:
//   - perKitMax: max quantity per parent kit (default 1)
//   - scalingRule: triggers an auto-added support item once a threshold is crossed.
//       { thresholdPerKit, capPerSwitch, switchCost, switchLabel }
//     Switches needed = max(0, ceil((qty - kitQty * thresholdPerKit) / capPerSwitch))

const STANDARD_16_POE = {
  cost: 299,
  capPerSwitch: 9,
  label: 'UniFi Standard 16 PoE Switch'
};

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
      {
        id: 'core-phones',
        name: 'Additional phones',
        desc: 'UniFi G3 Touch Pro desktop phone, $199 each. Max 10 phones total per Core. Talk line cost not added here — add lines to suit your dial plan separately.',
        oneTime: 199,
        monthly: 0,
        type: 'qty',
        perKitMax: 9,
        scalingRule: {
          thresholdPerKit: 1,
          capPerSwitch: STANDARD_16_POE.capPerSwitch,
          switchCost: STANDARD_16_POE.cost,
          switchLabel: STANDARD_16_POE.label,
          note: 'Auto-added once phone count exceeds 2 per Core. The UDM SE handles the first 2 phones; beyond that, a UniFi Standard 16 PoE Switch is needed.'
        }
      }
    ]
  },
  {
    id: 'trailer',
    num: '002',
    name: 'ORION-Trailer',
    role: 'Mobile network core',
    base: 4995,
    monthly: 155,
    monthlyLabel: 'Starlink Business 500 GB',
    addons: []
  },
  {
    id: 'base',
    num: '003',
    name: 'ORION-Base',
    role: 'Mission base extension',
    base: 4995,
    monthly: 0,
    addons: [
      {
        id: 'base-wan',
        name: 'Standalone WAN package',
        desc: 'UDM-Pro + Starlink Standard for independent operation. Adds $55/mo Starlink Business.',
        oneTime: 750, monthly: 55, type: 'qty', perKitMax: 1
      },
      {
        id: 'base-display',
        name: 'Display package',
        desc: '4,000-lumen projector + screen + second Display Cast Pro + cables, transit bag. Each package adds one display position. Max 10 displays total per Base.',
        oneTime: 1500, monthly: 0, type: 'qty', perKitMax: 9,
        scalingRule: {
          thresholdPerKit: 1,
          capPerSwitch: STANDARD_16_POE.capPerSwitch,
          switchCost: STANDARD_16_POE.cost,
          switchLabel: STANDARD_16_POE.label,
          note: 'Auto-added once display count exceeds 2 per Base. The Pro Switch 24 PoE handles the first 2; beyond that, an additional UniFi Standard 16 PoE Switch is needed.'
        }
      },
      {
        id: 'base-cable',
        name: 'Cable trailer link',
        desc: '300 ft outdoor Cat6 (surge-protected) or armored fiber + SFP+ modules.',
        oneTime: 250, monthly: 0, type: 'qty', perKitMax: 1
      }
    ]
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
      {
        id: 'fleet-df',
        name: 'Direction finding',
        desc: 'KrakenSDR + magnetic antenna set + Raspberry Pi 5. ELT bearings into ATAK. One per vehicle.',
        oneTime: 1200, monthly: 0, type: 'qty', perKitMax: 1
      },
      {
        id: 'fleet-readyop',
        name: 'ReadyOp gateway',
        desc: 'VHF base radio comms over IP. Procured through National. One per vehicle.',
        oneTime: 0, monthly: 0, type: 'qty', perKitMax: 1,
        tag: 'rec', tagLabel: 'Recommended'
      },
      {
        id: 'fleet-suas',
        name: 'sUAS package',
        desc: '32" display + lockable wall mount + awning + 1,000 W pure sine inverter. Vans only. One per vehicle.',
        oneTime: 1000, monthly: 0, type: 'qty', perKitMax: 1,
        tag: 'rec', tagLabel: 'Vans only'
      }
    ]
  },
  {
    id: 'air',
    num: '005',
    name: 'ORION-Air',
    role: 'Aircraft node',
    base: 0,
    monthly: 0,
    concept: true,
    addons: []
  }
];

// ---------- State ----------
const state = {
  qty: {},
  addonQty: {}
};
KITS.forEach(k => { state.qty[k.id] = 0; k.addons.forEach(a => state.addonQty[a.id] = 0); });

// ---------- Format ----------
const fmt = (n) => {
  if (Math.abs(n - Math.round(n)) < 0.005) return '$' + Math.round(n).toLocaleString();
  return '$' + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

function addonPerKitMax(a) { return a.perKitMax != null ? a.perKitMax : 1; }
function addonAbsoluteMax(kit, a) {
  const raw = state.qty[kit.id] * addonPerKitMax(a);
  return a.maxTotal != null ? Math.min(raw, a.maxTotal) : raw;
}

function switchesFor(kit, a) {
  if (!a.scalingRule) return 0;
  const k = state.qty[kit.id];
  const q = state.addonQty[a.id];
  const r = a.scalingRule;
  const excess = q - k * r.thresholdPerKit;
  if (excess <= 0) return 0;
  return Math.ceil(excess / r.capPerSwitch);
}

// ---------- Render ----------
function renderKits() {
  const root = document.getElementById('calc-kits');
  root.innerHTML = '';
  KITS.forEach(kit => {
    const card = document.createElement('div');
    card.className = 'calc-kit' + (kit.concept ? ' concept' : '');
    card.innerHTML = `
      <div class="calc-kit-head">
        <div>
          <div class="num">KIT ${kit.num}${kit.concept ? ' · Concept' : ''}</div>
          <div class="name">${kit.name}</div>
          <div class="muted" style="font-size:0.85rem;">${kit.role}</div>
        </div>
        <div class="price-hint">
          ${kit.concept
            ? '<span class="muted">Pricing TBD</span>'
            : fmt(kit.base) + '<span class="suffix">one-time</span>' +
              (kit.monthly ? '<br><span style="color:var(--soft); font-size:0.78rem;">+ ' + fmt(kit.monthly) + '/mo' + (kit.monthlyLabel ? ' · ' + kit.monthlyLabel : '') + '</span>' : '')
          }
        </div>
      </div>
      <div class="calc-row">
        <div class="label">
          <span class="lbl-name">Quantity</span>
          <span class="lbl-desc">${kit.concept ? 'Disabled — see the kit page for the open questions.' : 'How many of this kit to include.'}</span>
        </div>
        ${kit.concept
          ? '<span class="lbl-tag concept">Concept</span>'
          : qtyControl('kit-' + kit.id, state.qty[kit.id], 0, 50)
        }
      </div>
      ${kit.addons.map(a => addonRow(kit, a)).join('')}
    `;
    root.appendChild(card);
  });
  KITS.forEach(kit => {
    if (kit.concept) return;
    wireQty('kit-' + kit.id, v => onQtyChange(kit.id, v));
    kit.addons.forEach(a => {
      wireQty('addon-' + a.id, v => onAddonChange(kit.id, a.id, v));
    });
  });
}

function qtyControl(id, value, min, max) {
  return `
    <div class="qty-control" data-target="${id}">
      <button type="button" class="qty-btn" data-act="dec">−</button>
      <input type="number" class="qty-input" id="${id}" value="${value}" min="${min}" max="${max}" inputmode="numeric">
      <button type="button" class="qty-btn" data-act="inc">+</button>
    </div>
  `;
}

function addonRow(kit, a) {
  const max = addonAbsoluteMax(kit, a);
  const tag = a.tag ? ` <span class="lbl-tag ${a.tag}">${a.tagLabel || ''}</span>` : '';
  const priceLine = a.oneTime > 0
    ? `+${fmt(a.oneTime)}` + (a.monthly ? ` + ${fmt(a.monthly)}/mo each` : ' each')
    : (a.monthly > 0 ? `+${fmt(a.monthly)}/mo each` : `${fmt(0)} each`);
  const scalingNote = a.scalingRule
    ? `<span class="lbl-desc" style="color:var(--soft);"><em>${a.scalingRule.note}</em></span>`
    : '';
  const limitText = (state.qty[kit.id] === 0)
    ? `<em>add ${kit.name} first</em>`
    : `max ${max}`;
  return `
    <div class="calc-row addon-row" data-parent="${kit.id}">
      <div class="label">
        <span class="lbl-name">${a.name}${tag}</span>
        <span class="lbl-desc">${a.desc}</span>
        <span class="lbl-desc"><strong style="color:var(--navy);">${priceLine}</strong> · <span class="addon-limit">${limitText}</span></span>
        ${scalingNote}
      </div>
      <div class="qty-control" data-target="addon-${a.id}">
        <button type="button" class="qty-btn" data-act="dec">−</button>
        <input type="number" class="qty-input" id="addon-${a.id}" value="${state.addonQty[a.id]}" min="0" max="${max}" inputmode="numeric" ${max === 0 ? 'disabled' : ''}>
        <button type="button" class="qty-btn" data-act="inc" ${max === 0 ? 'disabled' : ''}>+</button>
      </div>
    </div>
  `;
}

function wireQty(inputId, cb) {
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
  // Update each add-on's max cap inline (no full re-render → preserves focus).
  const kit = KITS.find(k => k.id === kitId);
  kit.addons.forEach(a => {
    const newMax = addonAbsoluteMax(kit, a);
    if (state.addonQty[a.id] > newMax) state.addonQty[a.id] = newMax;
    const input = document.getElementById('addon-' + a.id);
    if (input) {
      input.max = newMax;
      input.value = state.addonQty[a.id];
      input.disabled = newMax === 0;
      const wrap = input.closest('.qty-control');
      wrap.querySelectorAll('.qty-btn').forEach(b => { b.disabled = newMax === 0; });
      const limit = wrap.parentElement.querySelector('.addon-limit');
      if (limit) {
        limit.innerHTML = (v === 0)
          ? `<em>add ${kit.name} first</em>`
          : `max ${newMax}`;
      }
    }
  });
  recalc();
}

function onAddonChange(_kitId, addonId, v) {
  state.addonQty[addonId] = v;
  recalc();
}

// ---------- Totals ----------
function recalc() {
  let oneTime = 0;
  let monthly = 0;
  const lines = [];
  const autoLines = [];

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
        if (sub1 > 0 || subM > 0) {
          lines.push({ name: `${aq} × ${a.name}`, one: sub1, mo: subM });
        } else {
          lines.push({ name: `${aq} × ${a.name}`, one: 0, mo: 0 });
        }
        const n = switchesFor(kit, a);
        if (n > 0) {
          const cost = n * a.scalingRule.switchCost;
          oneTime += cost;
          autoLines.push({ name: `${n} × ${a.scalingRule.switchLabel}`, one: cost, kit: kit.name });
        }
      }
    });
  });

  // Render summary lines
  const summary = document.getElementById('calc-summary-lines');
  if (lines.length === 0 && autoLines.length === 0) {
    summary.innerHTML = '<div class="calc-line empty"><span class="nm">No kits selected</span><span class="vl">—</span></div>';
  } else {
    let html = lines.map(l =>
      `<div class="calc-line"><span class="nm">${l.name}</span><span class="vl">${l.one > 0 ? fmt(l.one) : '—'}${l.mo ? ' <span style="color:var(--silver-soft); font-size:0.78rem;">+ ' + fmt(l.mo) + '/mo</span>' : ''}</span></div>`
    ).join('');
    if (autoLines.length > 0) {
      html += autoLines.map(l =>
        `<div class="calc-line" style="opacity:0.92;"><span class="nm" style="color:var(--yellow); font-size:0.82rem;">↳ ${l.name}<span style="color:var(--silver-soft); font-size:0.72rem; display:block;">auto-added for ${l.kit}</span></span><span class="vl">${fmt(l.one)}</span></div>`
      ).join('');
    }
    summary.innerHTML = html;
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
