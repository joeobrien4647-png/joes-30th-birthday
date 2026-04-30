# Arrival Shop Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the Day 1 "Arrival Shop" feature on joes30.com — a captain-led, 5-trolley plan rendered on `schedule.html` with Firebase-synced item checklists and a printable PDF brief.

**Architecture:** Single source of truth (`ARRIVAL_SHOP` constant in `js/shared.js`) drives both the website rendering and the Python PDF generator. Static briefing + dynamic checklists. Firebase live sync via existing `FirebaseSync` API (matches signups/feed pattern). PDF generated separately by `build_arrival_shop_pdf.py` using `reportlab`.

**Tech Stack:** Vanilla HTML/CSS/JS · Firebase Realtime DB · Python (`reportlab`) · Playwright for tests.

**Design source:** `docs/plans/2026-04-28-arrival-shop-design.md`

---

## File map

- **Modify:** `js/shared.js` — append `ARRIVAL_SHOP` after line 224 (`TEAM_CAPTAINS`)
- **Modify:** `schedule.html` — replace lines 309-315 ("The Big Shop" timeline-item) with full arrival-shop section
- **Modify:** `js/schedule.js` — add `renderArrivalShop()` and Firebase wiring
- **Modify:** `css/schedule.css` — append trolley card styles
- **Modify:** `index.html` — add reminder card
- **Modify:** `js/home.js` — wire reminder card click
- **Create:** `build_arrival_shop_pdf.py` — PDF generator
- **Create:** `tests/arrival-shop.spec.js` — Playwright smoke test
- **Create:** `arrival-shop-brief.pdf` — generated artefact (gitignored)

---

## Phase 1 — Data foundation (no UI yet)

### Task 1: Add ARRIVAL_SHOP constant

**Files:**
- Modify: `js/shared.js` after line 224

**Step 1: Append the constant**

Insert after `TEAM_CAPTAINS` block (line 224):

```javascript
/* ============================================
   Arrival Shop — Wed 29 Apr Leclerc Le Blanc
   5-trolley plan + dietary cohort
   Source of truth: docs/plans/2026-04-28-arrival-shop-design.md
   ============================================ */
const ARRIVAL_SHOP = {
    date: '2026-04-29',
    location: 'Leclerc Le Blanc',
    schedule: {
        arrive: '15:00',
        deploy: '15:10',
        checkout: '16:00',
        loaded:  '16:15',
        depart:  '16:30'
    },
    budget: { target: 1345, working: 1450, currency: 'EUR' },
    trolleys: [
        {
            id: 'drinks', emoji: '🍷', name: 'Drinks',
            captain: 'JOE-7K9X',
            helpers: ['OLI-3WT5', 'CHRIS-2FM7'],
            budget: 700,
            aisleHint: 'Wine/spirits aisle, back of store. Heaviest load — bring 2 trollies.',
            watchOut: 'Amex sometimes declined in France — Joe carries Visa backup.',
            items: [
                { id: 'wine',          label: 'Wine ~30 bottles (mix red/white/rosé)' },
                { id: 'champagne',     label: 'Champagne + prosecco × 12' },
                { id: 'beer',          label: 'Beer 3-4 cases (lager + Coronas)' },
                { id: 'spirits',       label: 'Spirits × 1 each: gin, vodka, rum, tequila, Aperol, Pimms, Cointreau, Malibu, brandy' },
                { id: 'mixers',        label: 'Mixers: tonic, soda, ginger ale, lemonade, juices' },
                { id: 'water',         label: 'Bottled water — still + sparkling cases' },
                { id: 'ice',           label: 'Ice × 4-5 bags' }
            ]
        },
        {
            id: 'meat', emoji: '🥩', name: 'Meat + BBQ',
            captain: 'JONNYW-8HQ3',
            helpers: ['OSCAR-5DL4', 'PETER-6BN2'],
            budget: 175,
            aisleHint: 'Butcher counter is slow — hit it FIRST.',
            watchOut: 'Cool bag essential for car ride home. Confirm chateau fridge space before maxing meat.',
            items: [
                { id: 'steaks',        label: 'Steaks (rib-eye or sirloin) × 18' },
                { id: 'sausages',      label: 'Sausages mix (merguez, chorizo, classic) × 30' },
                { id: 'burgers',       label: 'Burgers × 25' },
                { id: 'halloumi',      label: 'Halloumi × 2 (veggie)' },
                { id: 'veggie-burgers',label: 'Veggie burgers/sausages × 6 (Sophie)' },
                { id: 'charcoal',      label: 'Charcoal 3kg + firelighters' },
                { id: 'bacon',         label: 'Bacon 1kg (birthday brekkie)' },
                { id: 'brekkie-saus',  label: 'Birthday brekkie sausages × 12' },
                { id: 'black-pudding', label: 'Black pudding × 2 packs' }
            ]
        },
        {
            id: 'produce', emoji: '🥦', name: 'Produce + Dairy',
            captain: 'NEEVE-6PW2',
            helpers: ['SOPHIE-M3P2'],
            budget: 150,
            aisleHint: 'Largest aisle variety — go methodically: produce → dairy → deli counter.',
            watchOut: "Don't buy meal-specific veg (pak choi, fresh basil) — that's Day 2.",
            items: [
                { id: 'bbq-veg',    label: 'BBQ veg: peppers × 8, courgettes × 4, aubergines × 2, sweetcorn × 8' },
                { id: 'salad',      label: 'Salad: lettuce × 4, tomatoes × 1kg, cucumber × 3, red onion × 4' },
                { id: 'potatoes',   label: 'Potatoes × 4kg' },
                { id: 'fruit',      label: 'Fruit: lemons × 6, limes × 4, oranges × 2kg, strawberries × 2 punnets, apples × 2kg, bananas × 2 bunches' },
                { id: 'milk',       label: 'Milk × 8 × 1.5L' },
                { id: 'dairy',      label: 'Butter × 1kg block, eggs × 30, cream, yoghurt × 2 × 1kg' },
                { id: 'deli',       label: 'Deli: prosciutto, salami, smoked salmon, pâté' },
                { id: 'df-milk',    label: '🩺 Oat/almond milk × 4-5L (DF cohort)' },
                { id: 'df-butter',  label: '🩺 DF butter × 2 packs' },
                { id: 'df-yoghurt', label: '🩺 DF yoghurt × 2 tubs' }
            ]
        },
        {
            id: 'pantry', emoji: '🍝', name: 'Pantry + Breakfast',
            captain: 'HANNAH-8FJ3',
            helpers: ['SARAH-4KV3'],
            budget: 120,
            aisleHint: 'Spread across aisles — split list (Hannah breakfast, Sarah pantry).',
            watchOut: "Don't buy team-dinner pantry (pasta, rice, tinned tomatoes, cooking sauces) — Day 2.",
            items: [
                { id: 'coffee',     label: 'Coffee (ground × 2kg) + filters' },
                { id: 'tea',        label: 'Tea bags' },
                { id: 'bread',      label: 'Sliced bread × 2 loaves' },
                { id: 'buns',       label: 'Burger buns × 30' },
                { id: 'baguettes',  label: 'Baguettes × 6 (top up daily from David Moreau bakery)' },
                { id: 'cereal',     label: 'Cereals: cornflakes, Special K, muesli' },
                { id: 'spreads',    label: 'Spreads: jam (strawberry, apricot, marmalade), Nutella, honey' },
                { id: 'marmite',    label: 'Marmite (if available)' },
                { id: 'oil',        label: 'Oil (olive + sunflower)' },
                { id: 'vinegar',    label: 'Vinegar (wine + balsamic)' },
                { id: 'spices',     label: 'Salt, pepper, basic spices' },
                { id: 'gf-bread',   label: '🩺 GF bread × 3 loaves (GF cohort)' },
                { id: 'gf-cereal',  label: '🩺 GF cereal × 2 boxes' },
                { id: 'gf-crackers',label: '🩺 GF crackers × 2 packs' }
            ]
        },
        {
            id: 'party', emoji: '🎂', name: 'Party + Snacks + Frozen',
            captain: ['RAZON-3BM6', 'KIRAN-7DX1'],
            helpers: [],
            budget: 200,
            aisleHint: 'Bakery + freezer + party aisle — checkout LAST so frozen stays cold.',
            watchOut: 'Skip team-dinner desserts (tiramisu, churros, coconut ice cream) — Day 2.',
            items: [
                { id: 'cake',        label: '🎂 Birthday cake (or pre-order David Moreau bakery — confirm with Joe)' },
                { id: 'sparklers',   label: 'Sparkler candles' },
                { id: 'crisps',      label: 'Crisps × 3 multi-packs, nuts, olives, crackers' },
                { id: 'cheeseboard', label: 'Cheese board: 6 cheeses (cheddar, brie, blue, goat, gruyère, comté)' },
                { id: 'sweets',      label: 'Chocolate, Toblerone, sweets' },
                { id: 'popcorn',     label: 'Cinema night popcorn + sweets' },
                { id: 'frozen',      label: 'Frozen: ice cream multiple tubs, peas, hash browns' },
                { id: 'partyware',   label: 'Party plates, plastic cups, napkins, cutlery' },
                { id: 'kitchen-kit', label: 'Bin bags, kitchen roll, foil, cling film' },
                { id: 'sauces',      label: 'Sauces: ketchup, mustard, mayo, salad dressing' },
                { id: 'gf-crackers2',label: '🩺 GF cheese-board crackers × 2 (GF cohort)' },
                { id: 'df-choc',     label: '🩺 DF dark chocolate' },
                { id: 'df-icecream', label: '🩺 DF ice cream × 2 tubs' }
            ]
        }
    ],
    dietary: {
        auditor: 'ROBIN-2VL5',
        cohort: {
            gfdf: ['ROBIN-2VL5', 'EMMAW-8RJ4', 'FLORRIE-5HK7', 'JOHNNY-9XT4'],
            veggie: ['SOPHIE-M3P2']
        },
        notes: "Robin is allergic, not just intolerant — cross-contamination matters. Look for certified GF symbol (crossed grain) and dairy-free labelling, not 'may contain traces.'"
    },
    drivers: [
        'LUKE-4WN8', 'SAM-R6DQ', 'JOHNNY-9XT4', 'FLORRIE-5HK7',
        'GEORGE-1CY9', 'EMMAW-8RJ4', 'EMMAL-1RK8', 'JONNYL-4VP9', 'PRANAY-9WX6'
    ],
    chateauCrew: ['SHANE-9FH6', 'TOM-5QL7', 'ROBERT-2NG8'],
    payment: 'Joe pays everything on Amex kitty card. Visa backup. Photograph receipts.',
    whatsappGroupName: 'Leclerc Live'
};
```

**Step 2: Verify the file parses**

Run: `node -e "require('fs').readFileSync('./js/shared.js','utf8'); console.log('OK')"`
Expected: `OK` (no syntax errors).

Better — use Node to actually evaluate the file:
Run: `node --check js/shared.js`
Expected: no output, exit 0.

**Step 3: Commit**

```bash
git add js/shared.js
git commit -m "feat(shop): add ARRIVAL_SHOP data structure"
```

---

## Phase 2 — Static UI

### Task 2: Add CSS for trolley cards

**Files:**
- Modify: `css/schedule.css` (append)

**Step 1: Append styles**

Add to bottom of file:

```css
/* ============================================
   Arrival Shop — Day 1 trolley plan
   ============================================ */
.arrival-shop {
    margin-top: 1.5rem;
    padding: 1.5rem;
    background: linear-gradient(135deg, #fff8e7 0%, #fef3d7 100%);
    border: 2px solid #c84a3e;
    border-radius: 16px;
}
.arrival-shop-header {
    text-align: center;
    margin-bottom: 1.5rem;
}
.arrival-shop-header h3 {
    margin: 0 0 0.25rem;
    font-size: 1.5rem;
    color: #c84a3e;
}
.arrival-shop-header .as-tagline {
    margin: 0;
    font-size: 0.9rem;
    color: #6b5b3e;
}
.arrival-shop-timing {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    margin: 1rem 0;
    font-size: 0.85rem;
    color: #555;
}
.arrival-shop-timing span {
    background: rgba(255,255,255,0.7);
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
}
.dietary-banner {
    background: #fff3cd;
    border-left: 4px solid #d39e00;
    padding: 0.75rem 1rem;
    margin: 1rem 0;
    border-radius: 8px;
    font-size: 0.9rem;
}
.dietary-banner strong { color: #806000; }
.trolley-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-top: 1.5rem;
}
@media (min-width: 720px) {
    .trolley-grid { grid-template-columns: 1fr 1fr; }
}
.trolley-card {
    background: white;
    border: 1px solid #e8d5a8;
    border-radius: 12px;
    padding: 1rem;
    box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}
.trolley-card-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
}
.trolley-emoji { font-size: 1.5rem; }
.trolley-name {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
}
.trolley-budget {
    margin-left: auto;
    font-weight: 700;
    color: #c84a3e;
}
.trolley-captains {
    font-size: 0.85rem;
    color: #555;
    margin: 0.25rem 0 0.75rem;
}
.trolley-captains strong { color: #2c2c2c; }
.trolley-hint {
    font-size: 0.8rem;
    color: #6b5b3e;
    background: #f9f3e3;
    padding: 0.4rem 0.6rem;
    border-radius: 6px;
    margin-bottom: 0.75rem;
}
.trolley-checklist {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
}
.trolley-checklist li {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    font-size: 0.9rem;
    line-height: 1.3;
}
.trolley-checklist input[type="checkbox"] {
    margin-top: 0.2rem;
    width: 18px;
    height: 18px;
    cursor: pointer;
    flex-shrink: 0;
}
.trolley-checklist li.checked label {
    text-decoration: line-through;
    color: #888;
}
.checked-by {
    font-size: 0.7rem;
    color: #999;
    margin-left: 0.4rem;
}
.drivers-callout {
    background: #e8f4f8;
    border-left: 4px solid #4a90a4;
    padding: 0.75rem 1rem;
    margin: 1rem 0;
    border-radius: 8px;
    font-size: 0.85rem;
}
.drivers-callout strong { color: #2c5e6f; }
.day2-placeholder {
    margin-top: 1.5rem;
    padding: 0.75rem 1rem;
    background: rgba(255,255,255,0.5);
    border: 1px dashed #c0a874;
    border-radius: 8px;
    font-size: 0.85rem;
    color: #6b5b3e;
    text-align: center;
}
```

**Step 2: Bump cache-buster on schedule.html**

Find `<link rel="stylesheet" href="css/schedule.css?v=44">` (line 27 in `schedule.html`) and bump to `?v=45`.

**Step 3: Commit**

```bash
git add css/schedule.css schedule.html
git commit -m "style(shop): add trolley card styles"
```

---

### Task 3: Replace "Big Shop" timeline item with arrival-shop section

**Files:**
- Modify: `schedule.html` lines 309-315

**Step 1: Replace the existing timeline-item**

Find lines 309-315:
```html
<div class="timeline-item">
    <div class="time">&#128722;</div>
    <div class="activity">
        <h4>The Big Shop</h4>
        <p>Supermarket stop on the way. Stock up on wine, beer, BBQ supplies and food for the week. All hands on deck.</p>
    </div>
</div>
```

Replace with:
```html
<div class="timeline-item">
    <div class="time">&#128722;</div>
    <div class="activity">
        <h4>The Big Shop — Operation Leclerc</h4>
        <p>5 trolleys, 13 crew, 60 minutes. Captain-led plan below. <a href="#arrival-shop">Jump to plan ↓</a></p>
    </div>
</div>

<!-- Arrival Shop full plan — rendered by js/schedule.js -->
<div id="arrival-shop" class="arrival-shop"></div>
```

**Step 2: Verify HTML still renders**

Open `schedule.html` in browser at `http://localhost:5500/schedule.html`. Expected: page loads, Day 1 visible, empty `#arrival-shop` div present in DOM (inspect with devtools).

**Step 3: Commit**

```bash
git add schedule.html
git commit -m "feat(shop): add arrival-shop anchor to schedule.html Day 1"
```

---

### Task 4: Render trolley cards (static, no Firebase yet)

**Files:**
- Modify: `js/schedule.js` (append a new function)

**Step 1: Add render function**

At the bottom of `js/schedule.js`, append:

```javascript
/* ============================================
   Arrival Shop renderer — Day 1 trolley plan
   ============================================ */
function getPlayerName(code) {
    if (typeof PLAYERS === 'undefined') return code;
    const p = PLAYERS[code];
    return p ? p.name.split(' ')[0] : code;
}

function renderTrolleyCard(trolley) {
    const captains = Array.isArray(trolley.captain) ? trolley.captain : [trolley.captain];
    const captainNames = captains.map(getPlayerName).join(' + ');
    const helperNames = trolley.helpers.map(getPlayerName).join(', ') || '—';

    const items = trolley.items.map(item => `
        <li data-item-id="${item.id}" data-trolley-id="${trolley.id}">
            <input type="checkbox" id="chk-${trolley.id}-${item.id}" />
            <label for="chk-${trolley.id}-${item.id}">${item.label}</label>
            <span class="checked-by"></span>
        </li>
    `).join('');

    return `
        <div class="trolley-card" data-trolley-id="${trolley.id}">
            <div class="trolley-card-header">
                <span class="trolley-emoji">${trolley.emoji}</span>
                <h4 class="trolley-name">${trolley.name}</h4>
                <span class="trolley-budget">€${trolley.budget}</span>
            </div>
            <p class="trolley-captains">
                <strong>Captain:</strong> ${captainNames} ·
                <strong>Helpers:</strong> ${helperNames}
            </p>
            <p class="trolley-hint">💡 ${trolley.aisleHint}</p>
            ${trolley.watchOut ? `<p class="trolley-hint">⚠️ ${trolley.watchOut}</p>` : ''}
            <ul class="trolley-checklist">${items}</ul>
        </div>
    `;
}

function renderArrivalShop() {
    const root = document.getElementById('arrival-shop');
    if (!root || typeof ARRIVAL_SHOP === 'undefined') return;

    const driverNames = ARRIVAL_SHOP.drivers.map(getPlayerName).join(', ');

    root.innerHTML = `
        <div class="arrival-shop-header">
            <h3>🛒 Operation Leclerc</h3>
            <p class="as-tagline">5 trolleys · 60 minutes · €${ARRIVAL_SHOP.budget.target} target</p>
        </div>
        <div class="arrival-shop-timing">
            <span>🕒 ${ARRIVAL_SHOP.schedule.arrive} arrive</span>
            <span>🛒 ${ARRIVAL_SHOP.schedule.deploy} deploy</span>
            <span>💳 ${ARRIVAL_SHOP.schedule.checkout} checkout</span>
            <span>🚗 ${ARRIVAL_SHOP.schedule.depart} depart</span>
        </div>
        <div class="dietary-banner">
            <strong>🩺 Dietary auditor — ${getPlayerName(ARRIVAL_SHOP.dietary.auditor)}.</strong>
            GF+DF cohort (4): ${ARRIVAL_SHOP.dietary.cohort.gfdf.map(getPlayerName).join(', ')}.
            Veggie (1): ${ARRIVAL_SHOP.dietary.cohort.veggie.map(getPlayerName).join(', ')}.
            <em>${ARRIVAL_SHOP.dietary.notes}</em>
        </div>
        <div class="drivers-callout">
            <strong>🚗 Driving direct to chateau (9):</strong> ${driverNames}.
            They're not on the shop — meeting us at Roussignol.
        </div>
        <div class="trolley-grid">
            ${ARRIVAL_SHOP.trolleys.map(renderTrolleyCard).join('')}
        </div>
        <div class="day2-placeholder">
            🍝 <strong>Team-dinner shop is Day 2 (Thu morning).</strong>
            Each team captain leads their own run. Plan TBD.
        </div>
    `;
}

// Hook into existing init flow — find the line that calls existing renders
// (search file for "DOMContentLoaded" or the existing init function)
document.addEventListener('DOMContentLoaded', renderArrivalShop);
```

**Step 2: Verify it renders**

Hard reload `http://localhost:5500/schedule.html` (Ctrl+F5).
Expected:
- Day 1 has the new "Operation Leclerc" section
- 5 trolley cards visible
- Each card has captain, helpers, budget, aisle hint, item checklist
- Dietary banner + drivers callout + Day 2 placeholder all present
- No console errors

**Step 3: Commit**

```bash
git add js/schedule.js
git commit -m "feat(shop): render trolley cards on schedule.html Day 1"
```

---

## Phase 3 — Live sync

### Task 5: Wire checkbox → Firebase

**Files:**
- Modify: `js/schedule.js` — extend the renderer

**Step 1: Add tick handler**

After `renderArrivalShop` definition, add:

```javascript
function getCurrentGuestCode() {
    return localStorage.getItem('guestCode') || 'ANON';
}

function applyTickState(trolleyId, itemId, tick) {
    const li = document.querySelector(
        `li[data-trolley-id="${trolleyId}"][data-item-id="${itemId}"]`
    );
    if (!li) return;
    const checkbox = li.querySelector('input[type="checkbox"]');
    const byLabel = li.querySelector('.checked-by');
    if (tick) {
        li.classList.add('checked');
        checkbox.checked = true;
        byLabel.textContent = tick.checkedBy ? `· ${getPlayerName(tick.checkedBy)}` : '';
    } else {
        li.classList.remove('checked');
        checkbox.checked = false;
        byLabel.textContent = '';
    }
}

function wireArrivalShopCheckboxes() {
    document.querySelectorAll('#arrival-shop .trolley-checklist input[type="checkbox"]')
        .forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const li = e.target.closest('li');
                const trolleyId = li.dataset.trolleyId;
                const itemId = li.dataset.itemId;
                const guestCode = getCurrentGuestCode();
                const path = `arrivalShop/checked/${trolleyId}/${itemId}`;

                if (e.target.checked) {
                    const tick = { checkedBy: guestCode, checkedAt: Date.now() };
                    applyTickState(trolleyId, itemId, tick);
                    if (typeof FirebaseSync !== 'undefined' && FirebaseSync.isConfigured()) {
                        FirebaseSync.set(path, tick);
                    } else {
                        // localStorage fallback
                        const local = JSON.parse(localStorage.getItem('arrivalShopChecked') || '{}');
                        local[`${trolleyId}/${itemId}`] = tick;
                        localStorage.setItem('arrivalShopChecked', JSON.stringify(local));
                    }
                } else {
                    applyTickState(trolleyId, itemId, null);
                    if (typeof FirebaseSync !== 'undefined' && FirebaseSync.isConfigured()) {
                        FirebaseSync.remove(`arrivalShop/checked/${trolleyId}`, itemId);
                    } else {
                        const local = JSON.parse(localStorage.getItem('arrivalShopChecked') || '{}');
                        delete local[`${trolleyId}/${itemId}`];
                        localStorage.setItem('arrivalShopChecked', JSON.stringify(local));
                    }
                }
            });
        });
}

function listenArrivalShop() {
    if (typeof FirebaseSync === 'undefined' || !FirebaseSync.isConfigured()) {
        // Replay localStorage state on load
        const local = JSON.parse(localStorage.getItem('arrivalShopChecked') || '{}');
        Object.entries(local).forEach(([key, tick]) => {
            const [trolleyId, itemId] = key.split('/');
            applyTickState(trolleyId, itemId, tick);
        });
        return;
    }
    FirebaseSync.onUpdate('arrivalShop/checked', (data) => {
        if (!data) {
            // Clear all
            ARRIVAL_SHOP.trolleys.forEach(t => {
                t.items.forEach(i => applyTickState(t.id, i.id, null));
            });
            return;
        }
        ARRIVAL_SHOP.trolleys.forEach(trolley => {
            const trolleyTicks = data[trolley.id] || {};
            trolley.items.forEach(item => {
                applyTickState(trolley.id, item.id, trolleyTicks[item.id] || null);
            });
        });
    });
}
```

**Step 2: Wire on init**

Find the existing `document.addEventListener('DOMContentLoaded', renderArrivalShop);` line and replace with:

```javascript
document.addEventListener('DOMContentLoaded', () => {
    renderArrivalShop();
    wireArrivalShopCheckboxes();
    listenArrivalShop();
});
```

**Step 3: Verify live sync**

- Open `http://localhost:5500/schedule.html` in two browsers (or one normal + one incognito).
- Tick an item in browser A.
- Within ~1 second, browser B's same item shows ticked + "· Joe" attribution.
- Untick in B → A unticks.
- DevTools console: no errors.

**Step 4: Verify offline fallback**

- DevTools → Network tab → throttle to "Offline".
- Tick an item — UI updates locally.
- Reload page — still ticked (from localStorage).
- Re-enable network — ticks merge with Firebase state on next listener fire.

**Step 5: Commit**

```bash
git add js/schedule.js
git commit -m "feat(shop): live-sync trolley checklist via Firebase"
```

---

## Phase 4 — Homepage reminder

### Task 6: Add reminder card to index.html

**Files:**
- Modify: `index.html` — find the dashboard cards section, add a card

**Step 1: Locate insert point**

Run: `grep -n "card\|dashboard" index.html | head -20`
Find the section where existing dashboard cards live (e.g. team card, leaderboard card).

**Step 2: Insert reminder card**

Add after the existing first dashboard card:

```html
<a class="dashboard-card arrival-shop-reminder" href="schedule.html#arrival-shop">
    <div class="card-emoji">🛒</div>
    <div class="card-body">
        <h3>Day 1: Arrival Shop</h3>
        <p>Operation Leclerc · 5 trolleys · €1,345 target. Find your trolley.</p>
    </div>
    <div class="card-arrow">→</div>
</a>
```

**Step 3: Style (only if reusing existing card class isn't enough)**

Append to `css/components.css`:

```css
.arrival-shop-reminder {
    background: linear-gradient(135deg, #fff8e7 0%, #fef3d7 100%);
    border: 1px solid #c84a3e;
}
.arrival-shop-reminder h3 { color: #c84a3e; }
```

**Step 4: Verify**

Reload `http://localhost:5500/index.html`. Expected: new card visible. Click → navigates to `schedule.html#arrival-shop`, scrolls to the trolley plan.

**Step 5: Commit**

```bash
git add index.html css/components.css
git commit -m "feat(shop): add homepage reminder card linking to Day 1 plan"
```

---

## Phase 5 — Printable PDF

### Task 7: Build the PDF generator

**Files:**
- Create: `build_arrival_shop_pdf.py`

**Step 1: Install reportlab if needed**

Run: `pip install reportlab`
Expected: install OK or "already satisfied".

**Step 2: Create the script**

```python
"""Generate the printable Arrival Shop brief PDF.

Source of truth: docs/plans/2026-04-28-arrival-shop-design.md
Run: python build_arrival_shop_pdf.py
Output: arrival-shop-brief.pdf
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak,
)

OUTPUT = 'arrival-shop-brief.pdf'

# French market palette
CLARET = HexColor('#c84a3e')
MUSTARD = HexColor('#d39e00')
SAGE = HexColor('#7a9b6e')
CREAM = HexColor('#fff8e7')
INK = HexColor('#2c2c2c')

# Trolley data — manually mirrored from js/shared.js ARRIVAL_SHOP.
# When updating, keep both in sync.
TROLLEYS = [
    {
        'emoji': '🍷', 'name': 'DRINKS', 'budget': '€700',
        'captain': 'Joe', 'helpers': 'Oli, Chris',
        'aisle': 'Wine/spirits aisle, back of store. Heaviest load — bring 2 trollies.',
        'watch': 'Amex sometimes declined. Joe carries Visa backup.',
        'items': [
            'Wine ~30 bottles (mix red/white/rosé)',
            'Champagne + prosecco × 12',
            'Beer 3-4 cases (lager + Coronas)',
            'Spirits × 1 each: gin, vodka, rum, tequila, Aperol, Pimms, Cointreau, Malibu, brandy',
            'Mixers: tonic, soda, ginger ale, lemonade, juices',
            'Bottled water — still + sparkling cases',
            'Ice × 4-5 bags',
        ],
    },
    {
        'emoji': '🥩', 'name': 'MEAT + BBQ', 'budget': '€175',
        'captain': 'Jonny W', 'helpers': 'Oscar, Pete',
        'aisle': 'Butcher counter is slow — hit it FIRST.',
        'watch': 'Cool bag essential for car ride. Confirm chateau fridge space.',
        'items': [
            'Steaks (rib-eye or sirloin) × 18',
            'Sausages mix (merguez, chorizo, classic) × 30',
            'Burgers × 25',
            'Halloumi × 2 (veggie)',
            'Veggie burgers/sausages × 6 (Sophie)',
            'Charcoal 3kg + firelighters',
            'Bacon 1kg (birthday brekkie)',
            'Birthday brekkie sausages × 12',
            'Black pudding × 2 packs',
        ],
    },
    {
        'emoji': '🥦', 'name': 'PRODUCE + DAIRY', 'budget': '€150',
        'captain': 'Neeve', 'helpers': 'Sophie',
        'aisle': 'Largest variety — go methodically: produce → dairy → deli.',
        'watch': "Don't buy meal-specific veg (pak choi, fresh basil) — that's Day 2.",
        'items': [
            'BBQ veg: peppers × 8, courgettes × 4, aubergines × 2, sweetcorn × 8',
            'Salad: lettuce × 4, tomatoes × 1kg, cucumber × 3, red onion × 4',
            'Potatoes × 4kg',
            'Fruit: lemons × 6, limes × 4, oranges × 2kg, strawberries × 2 punnets, apples × 2kg, bananas × 2 bunches',
            'Milk × 8 × 1.5L',
            'Butter × 1kg block, eggs × 30, cream, yoghurt × 2 × 1kg',
            'Deli: prosciutto, salami, smoked salmon, pâté',
            '🩺 DF: Oat/almond milk × 4-5L, DF butter × 2, DF yoghurt × 2',
        ],
    },
    {
        'emoji': '🍝', 'name': 'PANTRY + BREAKFAST', 'budget': '€120',
        'captain': 'Hannah', 'helpers': 'Sarah',
        'aisle': 'Spread across aisles — split list (Hannah breakfast, Sarah pantry).',
        'watch': "Don't buy team-dinner pantry (pasta, rice, tinned, sauces) — Day 2.",
        'items': [
            'Coffee (ground × 2kg) + filters',
            'Tea bags',
            'Sliced bread × 2 loaves, burger buns × 30, baguettes × 6',
            'Cereals: cornflakes, Special K, muesli',
            'Spreads: jam, marmalade, Nutella, honey',
            'Marmite (if available)',
            'Oil (olive + sunflower), vinegar (wine + balsamic)',
            'Salt, pepper, basic spices',
            '🩺 GF: GF bread × 3, GF cereal × 2, GF crackers × 2',
        ],
    },
    {
        'emoji': '🎂', 'name': 'PARTY + SNACKS + FROZEN', 'budget': '€200',
        'captain': 'Razon + Kiran', 'helpers': '—',
        'aisle': 'Bakery + freezer + party aisle — checkout LAST so frozen stays cold.',
        'watch': 'Skip team-dinner desserts (tiramisu, churros, coconut ice cream) — Day 2.',
        'items': [
            '🎂 Birthday cake (or pre-order David Moreau bakery)',
            'Sparkler candles',
            'Crisps × 3 multi-packs, nuts, olives, crackers',
            'Cheese board: 6 cheeses (cheddar, brie, blue, goat, gruyère, comté)',
            'Chocolate, Toblerone, sweets',
            'Cinema night popcorn + sweets',
            'Frozen: ice cream, peas, hash browns',
            'Party plates, cups, napkins, cutlery',
            'Bin bags, kitchen roll, foil, cling film',
            'Sauces: ketchup, mustard, mayo, dressing',
            '🩺 GF crackers × 2, DF dark chocolate, DF ice cream × 2',
        ],
    },
]


def build_styles():
    base = getSampleStyleSheet()
    styles = {
        'h1': ParagraphStyle('h1', parent=base['Heading1'], fontSize=22, textColor=CLARET, alignment=TA_CENTER, spaceAfter=4),
        'subtitle': ParagraphStyle('subtitle', parent=base['Normal'], fontSize=11, textColor=INK, alignment=TA_CENTER, spaceAfter=12),
        'h2': ParagraphStyle('h2', parent=base['Heading2'], fontSize=16, textColor=CLARET, spaceBefore=4, spaceAfter=8),
        'meta': ParagraphStyle('meta', parent=base['Normal'], fontSize=10, textColor=INK, spaceAfter=6),
        'item': ParagraphStyle('item', parent=base['Normal'], fontSize=10.5, textColor=INK, leftIndent=14, leading=14),
        'hint': ParagraphStyle('hint', parent=base['Normal'], fontSize=9.5, textColor=MUSTARD, spaceAfter=4, italic=True),
        'note': ParagraphStyle('note', parent=base['Normal'], fontSize=9, textColor=HexColor('#666'), alignment=TA_CENTER),
    }
    return styles


def build_cover(styles):
    elements = [
        Spacer(1, 4*cm),
        Paragraph('🛒 OPERATION LECLERC', styles['h1']),
        Paragraph('Wed 29 Apr 2026 · Joe&rsquo;s 30th', styles['subtitle']),
        Spacer(1, 1*cm),
        Paragraph('5 trolleys · 60 minutes · €1,345 target', styles['subtitle']),
        Spacer(1, 2*cm),
        Paragraph('<b>Crew:</b> 13 people, 2 cars', styles['meta']),
        Paragraph('<b>Location:</b> Leclerc Le Blanc', styles['meta']),
        Paragraph('<b>Pay:</b> Joe Amex (Visa backup)', styles['meta']),
        Paragraph('<b>Comms:</b> WhatsApp &ldquo;Leclerc Live&rdquo;', styles['meta']),
        Spacer(1, 2*cm),
        Paragraph('<i>Skim before arrival. Photograph your page. Done by 4:30.</i>', styles['note']),
        PageBreak(),
    ]
    return elements


def build_trolley_page(t, styles):
    e = []
    e.append(Paragraph(f"{t['emoji']} TROLLEY — {t['name']}", styles['h2']))
    e.append(Paragraph(f"<b>Captain:</b> {t['captain']} &nbsp;&nbsp; <b>Helpers:</b> {t['helpers']}", styles['meta']))
    e.append(Paragraph(f"<b>Budget:</b> {t['budget']} (±15% OK; more = ping Joe)", styles['meta']))
    e.append(Spacer(1, 0.3*cm))
    e.append(Paragraph(f"💡 <i>{t['aisle']}</i>", styles['hint']))
    e.append(Paragraph(f"⚠️ <i>{t['watch']}</i>", styles['hint']))
    e.append(Spacer(1, 0.3*cm))
    e.append(Paragraph('<b>Buy:</b>', styles['meta']))
    for item in t['items']:
        e.append(Paragraph(f"☐ {item}", styles['item']))
    e.append(PageBreak())
    return e


def build_dietary(styles):
    return [
        Paragraph('🩺 DIETARY CROSS-CHECK — ROBIN', styles['h2']),
        Paragraph('<b>Cohort:</b>', styles['meta']),
        Paragraph('• <b>GF + DF (4):</b> Robin (allergic), Emma W, Florrie, Johnny', styles['item']),
        Paragraph('• <b>Veggie (1):</b> Sophie', styles['item']),
        Spacer(1, 0.5*cm),
        Paragraph('<b>Job in store:</b> roam Trolleys 3, 4, 5. Confirm in basket: oat milk, DF butter, DF yoghurt, GF bread, GF cereal, GF crackers, DF ice cream.', styles['meta']),
        Spacer(1, 0.3*cm),
        Paragraph('⚠️ <i>Allergy ≠ intolerance. Look for certified GF symbol (crossed grain) and dairy-free labelling, not "may contain traces."</i>', styles['hint']),
        Spacer(1, 0.5*cm),
        Paragraph('<b>Day 2 prep brief:</b> talk to team-dinner captains about separate prep surfaces / utensils for GF+DF dishes.', styles['meta']),
        PageBreak(),
    ]


def build_logistics(styles):
    return [
        Paragraph('🕒 LOGISTICS', styles['h2']),
        Paragraph('<b>Timing</b>', styles['meta']),
        Paragraph('15:00 arrive Leclerc · 15:05 huddle · 15:10 deploy · 16:00 checkout · 16:15 paid + loaded · 16:30 depart', styles['item']),
        Spacer(1, 0.4*cm),
        Paragraph('<b>Payment</b>', styles['meta']),
        Paragraph('Joe pays everything on Amex kitty. Visa backup. One transaction per trolley = 5 receipts (or merge at one till). Photograph receipts.', styles['item']),
        Spacer(1, 0.4*cm),
        Paragraph('<b>Comms</b>', styles['meta']),
        Paragraph('WhatsApp group "Leclerc Live" for "do we need X?" One person stays free as runner.', styles['item']),
        Spacer(1, 0.4*cm),
        Paragraph('<b>Driving direct (9 — meeting at chateau)</b>', styles['meta']),
        Paragraph('Luke, Sam, Johnny, Florrie, George, Emma W, Emma L, Jonny L, Pranay', styles['item']),
        Spacer(1, 0.4*cm),
        Paragraph('<b>Stays at chateau (3 — pool/setup)</b>', styles['meta']),
        Paragraph('Shane, Tom, Robert', styles['item']),
        Spacer(1, 0.5*cm),
        Paragraph('<b>Day 2 shop (Thu morning, separate)</b>', styles['meta']),
        Paragraph('Team-dinner ingredients · ~€400 split 4 ways · captains lead their own runs', styles['item']),
    ]


def main():
    doc = SimpleDocTemplate(OUTPUT, pagesize=A4,
                            leftMargin=2*cm, rightMargin=2*cm,
                            topMargin=2*cm, bottomMargin=2*cm,
                            title="Operation Leclerc — Arrival Shop Brief")
    styles = build_styles()
    elements = []
    elements += build_cover(styles)
    for t in TROLLEYS:
        elements += build_trolley_page(t, styles)
    elements += build_dietary(styles)
    elements += build_logistics(styles)
    doc.build(elements)
    print(f"✅ Built {OUTPUT}")


if __name__ == '__main__':
    main()
```

**Step 3: Generate the PDF**

Run: `python build_arrival_shop_pdf.py`
Expected output: `✅ Built arrival-shop-brief.pdf`. File appears in project root.

**Step 4: Verify the PDF**

- Open `arrival-shop-brief.pdf`. Expected: 8 pages — cover + 5 trolleys + dietary + logistics.
- Check: each trolley page is readable at A4, items render, hints visible, emojis render (note: some PDF viewers show squares for emojis — that's a font issue but content still readable).

**Step 5: Add to .gitignore (artefact, don't commit)**

Append to `.gitignore` (create if missing):

```
arrival-shop-brief.pdf
```

**Step 6: Commit**

```bash
git add build_arrival_shop_pdf.py .gitignore
git commit -m "feat(shop): add Python PDF generator for trolley briefs"
```

---

## Phase 6 — Tests + verification

### Task 8: Playwright smoke test

**Files:**
- Create: `tests/arrival-shop.spec.js`

**Step 1: Write the test**

```javascript
const { test, expect } = require('@playwright/test');

test.describe('Arrival Shop — Day 1', () => {
    test('renders all 5 trolley cards', async ({ page }) => {
        await page.goto('/schedule.html');
        // Skip envelope animation if present
        const skip = page.locator('#envelope-skip');
        if (await skip.isVisible({ timeout: 2000 }).catch(() => false)) {
            await skip.click();
        }
        // Activate Day 1 tab if needed
        const day1 = page.locator('.tab-btn[data-day="1"]');
        if (await day1.isVisible()) await day1.click();

        const cards = page.locator('#arrival-shop .trolley-card');
        await expect(cards).toHaveCount(5);
    });

    test('renders dietary banner with 4 GF+DF + 1 veggie', async ({ page }) => {
        await page.goto('/schedule.html');
        const skip = page.locator('#envelope-skip');
        if (await skip.isVisible({ timeout: 2000 }).catch(() => false)) await skip.click();

        await expect(page.locator('#arrival-shop .dietary-banner')).toContainText('4');
        await expect(page.locator('#arrival-shop .dietary-banner')).toContainText('Veggie');
    });

    test('drinks trolley shows Joe as captain and €700 budget', async ({ page }) => {
        await page.goto('/schedule.html');
        const skip = page.locator('#envelope-skip');
        if (await skip.isVisible({ timeout: 2000 }).catch(() => false)) await skip.click();

        const drinks = page.locator('.trolley-card[data-trolley-id="drinks"]');
        await expect(drinks).toContainText('Joe');
        await expect(drinks).toContainText('€700');
    });

    test('ticking an item updates UI immediately', async ({ page }) => {
        await page.goto('/schedule.html');
        const skip = page.locator('#envelope-skip');
        if (await skip.isVisible({ timeout: 2000 }).catch(() => false)) await skip.click();

        const item = page.locator('li[data-trolley-id="drinks"][data-item-id="ice"]');
        await item.locator('input[type="checkbox"]').check();
        await expect(item).toHaveClass(/checked/);
    });
});
```

**Step 2: Run the tests**

Run: `npx playwright test tests/arrival-shop.spec.js`
Expected: 4 passed.

**Step 3: Commit**

```bash
git add tests/arrival-shop.spec.js
git commit -m "test(shop): smoke tests for arrival shop rendering + tick"
```

---

### Task 9: End-to-end manual verification

**Step 1: Start the local server**

Run: `python -m http.server 5500`

**Step 2: Walk through the flow**

- Open `http://localhost:5500/index.html`. Login as Joe (JOE-7K9X). Confirm the new "Day 1: Arrival Shop" reminder card.
- Click it → lands on `schedule.html#arrival-shop`, page scrolls to the section.
- Verify all 5 trolleys, dietary banner, drivers callout, Day 2 placeholder.
- Tick 3 items. Open same page in incognito. Confirm ticks present (Firebase synced).
- Open DevTools mobile mode (iPhone 12). Confirm cards stack vertically, all readable, checkboxes tappable.
- Print preview (Ctrl+P) — confirm trolley cards render cleanly across pages (this is a fallback if PDF isn't used).

**Step 3: Generate + open the PDF**

Run: `python build_arrival_shop_pdf.py && start arrival-shop-brief.pdf` (or `open` on macOS)
Expected: 8-page PDF opens in default viewer. All content readable.

**Step 4: Capture verification proof**

Take screenshots:
- Mobile view of the trolley plan
- Two-window sync demo (one ticked, other shows tick)
- PDF first page

**Step 5: Update site-config.json version (cache-buster)**

If `site-config.json` has a version field, bump it.

**Step 6: Final commit + push**

```bash
git add -A
git commit -m "chore(shop): bump site config version after arrival shop launch"
git push origin master
```

GitHub Pages deploys to `joes30.com` within ~2 minutes.

---

## Open questions to resolve during execution

1. **Birthday breakfast meats** (bacon/sausages/black pudding) — confirmed Day 1 in plan. Joe to confirm if deferred to Day 2 instead.
2. **Cake** — currently "Leclerc OR pre-order David Moreau bakery." Joe to confirm in chat or before printing PDF.
3. **Veggie burger quantity** — currently 6. Confirm with Sophie / canvas BBQ veggie demand.
4. **`js/shared.js` PLAYERS update for Matt** — out of scope for this work. Track separately.

---

## Definition of done

- [ ] All 9 tasks completed and committed
- [ ] Playwright tests pass (`npx playwright test`)
- [ ] Manual verification checklist done (Task 9)
- [ ] PDF generated and reviewed
- [ ] Live on joes30.com (post-push)
- [ ] Joe confirms the trolley plan reads correctly to him as the user
