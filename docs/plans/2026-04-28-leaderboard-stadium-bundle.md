# Leaderboard Stadium Bundle Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ship a TV/projector "Stadium Mode" page plus phone-side drama (overtake banners, hot streak / comeback / underdog tags, profile cards, daily MVP crown, optional push notifications) for the 30th birthday trip leaderboard.

**Architecture:** New `scoreboard.html` standalone fullscreen page with auto-cycling panels, listening to existing Firebase `leaderboard/` sync. Existing `games.html` gets phone enhancements that listen to derived events (`overtake`, `mvpChange`) fired by a new position-tracker in `js/games.js`.

**Tech Stack:** Vanilla JS, Firebase Realtime DB (already integrated), Web Audio API (already used in admin sounds), CSS animations + WebAnimations, optional FCM (sw.js already has push handler).

**Verification model:** This repo has no automated test framework. Each task verifies via `preview_eval` against the running dev server (`http://localhost:8765`, started by `mcp__Claude_Preview__preview_start name="joes-30th"`). A task is "passing" when its eval returns the expected shape AND console has no new errors.

**Cache-buster discipline:** Every task that edits a `.js` or `.css` file must bump the corresponding `?v=N` query string in every HTML file that loads it. Final task does a sweep to catch any misses.

---

## Phase 1 — Foundation

### Task 1: Position History Tracker + Custom Events

**Why:** Every theatrical feature (overtake banner, MVP crown, comeback tag) needs to know "what changed since the last render". A single tracker module does this once and dispatches DOM events the rest of the code listens to.

**Files:**
- Modify: `js/games.js` (add tracker module near top of `initLeaderboard`, hook into existing `renderAll` flow)

**Step 1: Read existing render flow**

Read `js/games.js:820-984` (`renderAll`, `renderTeams`, `renderIndividuals`) to understand current position-tracking via `getPreviousPositions` / `savePositions`.

**Step 2: Add module skeleton**

After the existing `savePositions` helper, add:

```js
/* ---- Derived Events ---- */
function dispatchDerivedEvents(prevTeamRanks, newTeamRanks, prevIndRanks, newIndRanks, prevMvp, newMvp) {
    Object.keys(newTeamRanks).forEach(team => {
        if (prevTeamRanks[team] && prevTeamRanks[team] !== newTeamRanks[team]) {
            const detail = { team, from: prevTeamRanks[team], to: newTeamRanks[team] };
            if (newTeamRanks[team] < prevTeamRanks[team]) {
                document.dispatchEvent(new CustomEvent('teamOvertake', { detail }));
            }
        }
    });
    Object.keys(newIndRanks).forEach(name => {
        if (prevIndRanks[name] && prevIndRanks[name] !== newIndRanks[name]) {
            if (newIndRanks[name] < prevIndRanks[name]) {
                document.dispatchEvent(new CustomEvent('individualOvertake', {
                    detail: { name, from: prevIndRanks[name], to: newIndRanks[name] }
                }));
            }
        }
    });
    if (newMvp && prevMvp !== newMvp) {
        document.dispatchEvent(new CustomEvent('mvpChange', { detail: { from: prevMvp, to: newMvp } }));
    }
}

function getDailyMvp(day) {
    const today = day || getTripDay();
    const totals = {};
    pointsLog.forEach(e => {
        if (e.type === 'individual' && (e.day || 1) === today && e.amount > 0) {
            totals[e.target] = (totals[e.target] || 0) + e.amount;
        }
    });
    let topName = null, topPts = 0;
    Object.entries(totals).forEach(([n, p]) => { if (p > topPts) { topPts = p; topName = n; } });
    return topName;
}
```

**Step 3: Hook into renderAll**

Find `function renderAll()` at ~line 820. Wrap the body to capture before/after state:

```js
function renderAll() {
    const prevTeamRanks = computeTeamRanks();
    const prevIndRanks = computeIndividualRanks();
    const prevMvp = sessionStorage.getItem('lb_currentMvp') || null;

    renderTeams();
    renderFeed();
    renderIndividuals();
    renderLog();
    renderDailyRecap();

    const newTeamRanks = computeTeamRanks();
    const newIndRanks = computeIndividualRanks();
    const newMvp = getDailyMvp();
    if (newMvp) sessionStorage.setItem('lb_currentMvp', newMvp);

    dispatchDerivedEvents(prevTeamRanks, newTeamRanks, prevIndRanks, newIndRanks, prevMvp, newMvp);
}

function computeTeamRanks() {
    const sorted = TEAMS.slice().sort((a, b) => (teamScores[b] || 0) - (teamScores[a] || 0));
    const ranks = {};
    sorted.forEach((t, i) => { ranks[t] = i + 1; });
    return ranks;
}

function computeIndividualRanks() {
    const sorted = Object.keys(individualScores).sort((a, b) => (individualScores[b] || 0) - (individualScores[a] || 0));
    const ranks = {};
    sorted.forEach((n, i) => { ranks[n] = i + 1; });
    return ranks;
}
```

**Step 4: Bump cache buster**

In `games.html`, bump `js/games.js?v=36` → `?v=37`.

**Step 5: Verify in preview**

Hard-refresh the preview at `/games.html?cb=<ts>`, log in as admin, then:

```js
let captured = null;
document.addEventListener('teamOvertake', e => { captured = e.detail; });
// Award +10 to a non-leading team via the admin panel programmatically:
Store.set('lb_teamScores', { titans: 0, spartans: 100, vikings: 0, gladiators: 0 });
// renderAll fires from the lb 'leaderboardUpdate' listener
setTimeout(() => console.log('captured', captured), 1000);
```

**Expected:** `captured` becomes `{ team: 'spartans', from: <n>, to: 1 }`. No console errors.

**Step 6: Commit**

```bash
git add js/games.js games.html
git commit -m "Leaderboard: position tracker fires teamOvertake / individualOvertake / mvpChange events"
```

---

## Phase 2 — Phone Enhancements

### Task 2: Hot Streak / Comeback / Brave Last Badges

**Why:** Visible drama on the phone individuals tab. Earned in the last 15 min, jumped 3+ ranks, last-place team — all read straight from `pointsLog` and the previous-positions store, no new persistence.

**Files:**
- Modify: `js/games.js` — `renderIndividuals` (~line 924) and `renderTeams` (~line 829)
- Modify: `css/games.css` — add badge styles

**Step 1: Helper functions**

Above `renderIndividuals`, add:

```js
function isHotStreak(name) {
    const fifteenMinAgo = Date.now() - 15 * 60 * 1000;
    const recent = pointsLog.filter(e =>
        e.type === 'individual' && e.target === name && e.amount > 0 && e.timestamp >= fifteenMinAgo
    );
    return recent.length >= 3;
}
function isComeback(name, currRank) {
    const prev = getPreviousPositions()[name];
    return prev && (prev - currRank) >= 3;
}
```

**Step 2: Render badges in `renderIndividuals`**

In the `sorted.forEach((player, i) => { ... })` loop, after the existing `posArrow` block, build a badge string:

```js
let badges = '';
if (isHotStreak(player.name)) badges += '<span class="ind-badge badge-hot" title="Hot streak — 3+ awards in 15 min">🔥</span>';
if (isComeback(player.name, i + 1)) badges += '<span class="ind-badge badge-comeback" title="Climbed 3+ positions">🚀</span>';
```

Append `${badges}` inside the row template, after `${posArrow}` in the `ind-rank` span.

**Step 3: Brave Last on team cards**

In `renderTeams`, after the leader-highlight loop, add:

```js
const minScore = Math.min(...TEAMS.map(t => teamScores[t] || 0));
const allZero = maxScore === 0;
cards.forEach(card => {
    card.classList.remove('brave-last');
    if (!allZero && (teamScores[card.dataset.team] || 0) === minScore && minScore < maxScore) {
        card.classList.add('brave-last');
    }
});
```

And inject a "💪 Brave Last" tag into the card markup if class is present (use a `::after` CSS rule — see Step 4).

**Step 4: CSS**

Append to `css/games.css`:

```css
.ind-badge { display: inline-block; margin-left: 4px; font-size: 0.85em; }
.badge-hot { animation: hotPulse 1.2s ease-in-out infinite; }
@keyframes hotPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.18); } }
.team-card.brave-last { position: relative; }
.team-card.brave-last::after {
    content: "💪 Brave Last";
    position: absolute;
    top: 8px; right: 8px;
    font-size: 0.7rem;
    background: rgba(255,255,255,0.18);
    padding: 2px 8px;
    border-radius: 99px;
    font-weight: 600;
    letter-spacing: 0.04em;
}
```

**Step 5: Bump cache busters**

`games.html`: `games.js?v=37` → `?v=38`, `games.css?v=34` → `?v=35`.

**Step 6: Verify**

```js
// Force scenarios
Store.set('lb_individualScores', { ['Joe O\'Brien']: 5, 'Sophie Geen': 2 });
Store.set('lb_pointsLog', [
  { type:'individual', target:"Joe O'Brien", amount:1, timestamp:Date.now()-1000, day:1, category:'games', reason:'a' },
  { type:'individual', target:"Joe O'Brien", amount:2, timestamp:Date.now()-2000, day:1, category:'games', reason:'b' },
  { type:'individual', target:"Joe O'Brien", amount:2, timestamp:Date.now()-3000, day:1, category:'games', reason:'c' },
]);
document.querySelector('.lb-tab[data-lb="individuals"]').click();
return Array.from(document.querySelectorAll('.ind-row')).slice(0,3).map(r => r.textContent.replace(/\s+/g,' ').trim());
```

**Expected:** Joe's row contains `🔥`. Then RESET the data so we don't pollute Firebase: `Store.set('lb_individualScores', {}); Store.set('lb_pointsLog', []); Store.set('lb_teamScores', { titans:0, spartans:0, vikings:0, gladiators:0 });`.

**Step 7: Commit**

```bash
git add js/games.js css/games.css games.html
git commit -m "Leaderboard: hot streak, comeback, brave-last badges"
```

---

### Task 3: Daily MVP Crown

**Why:** Ambient "you are winning today" cue on the individuals tab.

**Files:**
- Modify: `js/games.js` — `renderIndividuals`
- Modify: `css/games.css` — crown style

**Step 1: Render the crown**

Inside the `sorted.forEach` loop in `renderIndividuals`, after computing `rankDisplay`:

```js
const dailyMvp = getDailyMvp();
const mvpCrown = (dailyMvp === player.name && player.points > 0)
    ? '<span class="ind-mvp-crown" title="Today\'s MVP">👑</span>'
    : '';
```

Append `${mvpCrown}` inside the `ind-rank` span (or right after it).

**Step 2: CSS**

```css
.ind-mvp-crown {
    display: inline-block;
    margin-left: 4px;
    font-size: 1.05em;
    animation: crownBob 2.4s ease-in-out infinite;
    filter: drop-shadow(0 0 6px rgba(255, 215, 0, 0.7));
}
@keyframes crownBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
```

**Step 3: Bump cache busters**

`games.js?v=38` → `?v=39`, `games.css?v=35` → `?v=36`.

**Step 4: Verify**

```js
Store.set('lb_individualScores', { 'Sophie Geen': 8, "Joe O'Brien": 3 });
Store.set('lb_pointsLog', [
  { type:'individual', target:'Sophie Geen', amount:8, timestamp:Date.now(), day:1, category:'games', reason:'a' }
]);
document.querySelector('.lb-tab[data-lb="individuals"]').click();
return document.querySelector('.ind-row .ind-mvp-crown')?.parentElement.textContent;
```

**Expected:** Output contains "👑" and Sophie Geen's name. Reset data.

**Step 5: Commit**

```bash
git add js/games.js css/games.css games.html
git commit -m "Leaderboard: daily MVP crown on individuals tab"
```

---

### Task 4: Profile Card Modal

**Why:** Tap any player → see their stats: total, rank, category breakdown bar, last 5 awards, biggest single. Reuses existing `getIndividualCategoryBreakdown` + `pointsLog`.

**Files:**
- Modify: `games.html` — modal markup
- Modify: `js/games.js` — modal logic + click handler in `renderIndividuals`
- Modify: `css/games.css` — modal styles

**Step 1: Add modal markup**

In `games.html`, just before `</body>`:

```html
<div class="player-card-modal" id="player-card-modal" style="display:none;" role="dialog" aria-modal="true">
    <div class="pcm-backdrop" data-pcm-close></div>
    <div class="pcm-content">
        <button class="pcm-close" data-pcm-close aria-label="Close">×</button>
        <div class="pcm-header">
            <div class="pcm-avatar" id="pcm-avatar"></div>
            <h2 id="pcm-name">Player</h2>
            <p id="pcm-meta">Rank · Team</p>
        </div>
        <div class="pcm-stats">
            <div class="pcm-stat"><div class="pcm-stat-label">Total</div><div class="pcm-stat-value" id="pcm-total">0</div></div>
            <div class="pcm-stat"><div class="pcm-stat-label">Rank</div><div class="pcm-stat-value" id="pcm-rank">—</div></div>
            <div class="pcm-stat"><div class="pcm-stat-label">Biggest</div><div class="pcm-stat-value" id="pcm-biggest">—</div></div>
        </div>
        <div class="pcm-section">
            <h3>Category Breakdown</h3>
            <div class="pcm-cats" id="pcm-cats"></div>
        </div>
        <div class="pcm-section">
            <h3>Recent Awards</h3>
            <div class="pcm-recent" id="pcm-recent"></div>
        </div>
    </div>
</div>
```

**Step 2: Open / close logic**

In `js/games.js`, near the bottom of `initLeaderboard`:

```js
function openPlayerCard(name) {
    const modal = document.getElementById('player-card-modal');
    if (!modal) return;
    const total = individualScores[name] || 0;
    const ranks = computeIndividualRanks();
    const rank = ranks[name] || '—';
    const team = PLAYERS[name] || null;
    const breakdown = getIndividualCategoryBreakdown(name);
    const recent = pointsLog
        .filter(e => e.type === 'individual' && e.target === name)
        .slice(0, 5);
    const biggest = pointsLog
        .filter(e => e.type === 'individual' && e.target === name && e.amount > 0)
        .reduce((max, e) => e.amount > max.amount ? e : max, { amount: 0 });

    document.getElementById('pcm-name').textContent = FULL_NAMES[name] || name;
    document.getElementById('pcm-meta').textContent = (team ? TEAM_NAMES[team] + ' · ' : '') + 'Rank ' + rank;
    document.getElementById('pcm-total').textContent = total;
    document.getElementById('pcm-rank').textContent = rank === '—' ? '—' : '#' + rank;
    document.getElementById('pcm-biggest').textContent = biggest.amount > 0 ? '+' + biggest.amount : '—';

    const total2 = Math.max(1, Object.values(breakdown).reduce((s, v) => s + Math.max(0, v), 0));
    document.getElementById('pcm-cats').innerHTML = Object.entries(breakdown)
        .filter(([, v]) => v !== 0)
        .map(([cat, pts]) => `
            <div class="pcm-cat-row">
                <span class="pcm-cat-label">${CATEGORY_EMOJI[cat] || ''} ${CATEGORY_LABELS[cat] || cat}</span>
                <div class="pcm-cat-bar"><div class="pcm-cat-fill cat-${cat}" style="width:${Math.max(2, (pts/total2)*100)}%"></div></div>
                <span class="pcm-cat-pts">${pts}</span>
            </div>
        `).join('') || '<p class="pcm-empty">No points yet</p>';

    document.getElementById('pcm-recent').innerHTML = recent.length === 0
        ? '<p class="pcm-empty">No awards yet</p>'
        : recent.map(e => {
            const ts = relativeTime(e.timestamp);
            const sign = e.amount > 0 ? '+' : '';
            return `<div class="pcm-award">
                <span class="pcm-award-pts ${e.amount>0?'positive':'negative'}">${sign}${e.amount}</span>
                <span class="pcm-award-reason">${escapeHtml(e.reason)}</span>
                <span class="pcm-award-time">${ts}</span>
            </div>`;
        }).join('');

    modal.style.display = 'flex';
}

function closePlayerCard() {
    const modal = document.getElementById('player-card-modal');
    if (modal) modal.style.display = 'none';
}

document.getElementById('individual-board')?.addEventListener('click', e => {
    const row = e.target.closest('.ind-row');
    if (!row) return;
    const nameEl = row.querySelector('.ind-name');
    if (!nameEl) return;
    // Reverse-lookup short name from full name
    const fullName = nameEl.textContent.trim();
    const shortName = Object.keys(FULL_NAMES).find(k => FULL_NAMES[k] === fullName) || fullName;
    openPlayerCard(shortName);
});

document.querySelectorAll('[data-pcm-close]').forEach(el => el.addEventListener('click', closePlayerCard));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closePlayerCard(); });
```

**Step 3: CSS**

```css
.player-card-modal {
    position: fixed; inset: 0; z-index: 9999;
    display: none;
    align-items: center; justify-content: center;
    padding: 20px;
}
.pcm-backdrop {
    position: absolute; inset: 0;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(6px);
}
.pcm-content {
    position: relative;
    max-width: 480px; width: 100%;
    max-height: 90vh; overflow-y: auto;
    background: linear-gradient(180deg, #2a2050 0%, #1a1230 100%);
    border-radius: 20px;
    padding: 24px 20px;
    box-shadow: 0 24px 60px rgba(0,0,0,0.5);
    color: #fff;
    animation: pcmIn 0.3s cubic-bezier(.16,.84,.34,1.06);
}
@keyframes pcmIn { from { transform: scale(0.92) translateY(20px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
.pcm-close { position: absolute; top: 12px; right: 12px; background: rgba(255,255,255,0.1); border: none; color: #fff; font-size: 24px; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; }
.pcm-header { text-align: center; padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 16px; }
.pcm-header h2 { margin: 8px 0 4px; font-size: 1.5rem; }
.pcm-header p { margin: 0; opacity: 0.7; font-size: 0.9rem; }
.pcm-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 20px; }
.pcm-stat { background: rgba(255,255,255,0.06); border-radius: 12px; padding: 12px; text-align: center; }
.pcm-stat-label { font-size: 0.7rem; opacity: 0.6; text-transform: uppercase; letter-spacing: 0.06em; }
.pcm-stat-value { font-size: 1.6rem; font-weight: 700; margin-top: 4px; }
.pcm-section { margin-top: 20px; }
.pcm-section h3 { font-size: 0.85rem; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 10px; }
.pcm-cat-row { display: grid; grid-template-columns: 110px 1fr 36px; gap: 8px; align-items: center; margin-bottom: 6px; font-size: 0.85rem; }
.pcm-cat-bar { height: 8px; background: rgba(255,255,255,0.08); border-radius: 99px; overflow: hidden; }
.pcm-cat-fill { height: 100%; border-radius: 99px; transition: width 0.4s ease; }
.pcm-cat-fill.cat-games { background: #4caf50; }
.pcm-cat-fill.cat-duties { background: #ff9800; }
.pcm-cat-fill.cat-challenges { background: #2196f3; }
.pcm-cat-fill.cat-bonus { background: #ffc107; }
.pcm-cat-fill.cat-penalty { background: #f44336; }
.pcm-award { display: grid; grid-template-columns: 50px 1fr auto; gap: 10px; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 0.85rem; }
.pcm-award-pts.positive { color: #6ee07b; font-weight: 700; }
.pcm-award-pts.negative { color: #ff7575; font-weight: 700; }
.pcm-award-time { opacity: 0.5; font-size: 0.75rem; }
.pcm-empty { opacity: 0.5; text-align: center; font-size: 0.9rem; }
.ind-row { cursor: pointer; transition: background 0.15s; }
.ind-row:hover { background: rgba(255,255,255,0.05); }
```

**Step 4: Bump cache busters**

`games.js?v=39` → `?v=40`, `games.css?v=36` → `?v=37`.

**Step 5: Verify**

```js
Store.set('lb_individualScores', { "Joe O'Brien": 5 });
Store.set('lb_pointsLog', [
  { type:'individual', target:"Joe O'Brien", amount:5, timestamp:Date.now(), day:1, category:'games', reason:'big win' }
]);
document.querySelector('.lb-tab[data-lb="individuals"]').click();
document.querySelector('.ind-row').click();
return {
    visible: getComputedStyle(document.getElementById('player-card-modal')).display,
    name: document.getElementById('pcm-name').textContent,
    total: document.getElementById('pcm-total').textContent,
};
```

**Expected:** `{ visible: 'flex', name: 'Joe O\'Brien', total: '5' }`. Reset data.

**Step 6: Commit**

```bash
git add games.html js/games.js css/games.css
git commit -m "Leaderboard: tap any player for stats card modal"
```

---

### Task 5: Phone Overtake Banner

**Why:** Phone-side hype when a team or individual changes position. Listens to events from Task 1, slides a banner in for 4 seconds.

**Files:**
- Modify: `games.html` — banner markup
- Modify: `js/games.js` — banner controller
- Modify: `css/games.css` — banner styles

**Step 1: Markup**

In `games.html` just before `</body>`:

```html
<div class="overtake-banner" id="overtake-banner" aria-live="polite"></div>
```

**Step 2: Banner controller**

In `js/games.js`, after `initLeaderboard`'s end (or in a new init function called from `initLeaderboard`):

```js
(function initOvertakeBanner() {
    const banner = document.getElementById('overtake-banner');
    if (!banner) return;
    let hideTimer = null;
    function show(html, themeClass) {
        banner.className = 'overtake-banner show ' + (themeClass || '');
        banner.innerHTML = html;
        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => banner.classList.remove('show'), 4000);
    }
    document.addEventListener('teamOvertake', e => {
        const t = e.detail.team;
        const display = (typeof TEAM_NAMES !== 'undefined' && TEAM_NAMES[t]) || t;
        const emoji = (typeof TEAM_EMOJI !== 'undefined' && TEAM_EMOJI[t]) || '🏆';
        show(`<span class="ob-icon">${emoji}</span><span class="ob-text"><strong>${display}</strong> jump to #${e.detail.to}!</span>`, 'team-' + t);
    });
    document.addEventListener('individualOvertake', e => {
        if (e.detail.to !== 1) return;
        const display = (typeof FULL_NAMES !== 'undefined' && FULL_NAMES[e.detail.name]) || e.detail.name;
        show(`<span class="ob-icon">👑</span><span class="ob-text"><strong>${display}</strong> takes the lead!</span>`);
    });
})();
```

**Step 3: CSS**

```css
.overtake-banner {
    position: fixed; top: -80px; left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(90deg, #6e3ed8, #b94aef);
    color: #fff;
    padding: 14px 20px;
    border-radius: 99px;
    font-weight: 700;
    box-shadow: 0 12px 40px rgba(0,0,0,0.4);
    z-index: 10000;
    transition: top 0.4s cubic-bezier(.16,.84,.34,1.06);
    display: flex; align-items: center; gap: 10px;
    max-width: 92vw; pointer-events: none;
}
.overtake-banner.show { top: 16px; }
.overtake-banner.team-titans { background: linear-gradient(90deg,#f9a825,#ffc94e); color:#3a2700; }
.overtake-banner.team-spartans { background: linear-gradient(90deg,#c62828,#ff5252); }
.overtake-banner.team-vikings { background: linear-gradient(90deg,#1565c0,#42a5f5); }
.overtake-banner.team-gladiators { background: linear-gradient(90deg,#424242,#757575); }
.ob-icon { font-size: 1.5em; }
```

**Step 4: Bump cache busters**

`games.js?v=40` → `?v=41`, `games.css?v=37` → `?v=38`.

**Step 5: Verify**

```js
document.dispatchEvent(new CustomEvent('teamOvertake', { detail: { team: 'spartans', from: 4, to: 1 } }));
return { content: document.getElementById('overtake-banner').innerText, classes: document.getElementById('overtake-banner').className };
```

**Expected:** `content` includes "Spartans" and "#1", classes include `show team-spartans`.

**Step 6: Commit**

```bash
git add games.html js/games.js css/games.css
git commit -m "Leaderboard: phone overtake banner reacts to position changes"
```

---

## Phase 3 — Stadium Mode

### Task 6: Stadium Shell — HTML, CSS, Cycling JS

**Why:** Standalone fullscreen page that just works on a Smart TV browser. Auto-cycles between panels, no nav chrome.

**Files:**
- Create: `scoreboard.html`
- Create: `js/scoreboard.js`
- Create: `css/scoreboard.css`

**Step 1: `scoreboard.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Scoreboard — Joe's 30th</title>
    <meta name="theme-color" content="#0a0820">
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏟️</text></svg>">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@500;700;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/scoreboard.css?v=1">
</head>
<body class="stadium">
    <canvas id="confetti-canvas"></canvas>

    <!-- Tap-to-start overlay -->
    <div class="sb-start" id="sb-start">
        <div class="sb-start-inner">
            <div class="sb-start-icon">🏟️</div>
            <h1>Joe's 30th</h1>
            <p>Tap to start the scoreboard</p>
            <button class="sb-start-btn" id="sb-start-btn">Start</button>
        </div>
    </div>

    <!-- Big top header -->
    <header class="sb-header">
        <div class="sb-logo">JOE'S 30th 🏆</div>
        <div class="sb-day" id="sb-day">Day 1 · Wednesday</div>
        <div class="sb-controls"><button class="sb-mute" id="sb-mute" aria-label="Mute">🔊</button></div>
    </header>

    <!-- Cycling panels -->
    <main class="sb-stage">
        <section class="sb-panel" data-panel="teams">
            <div class="sb-grid sb-grid-teams" id="sb-teams"></div>
        </section>
        <section class="sb-panel" data-panel="players" hidden>
            <h2 class="sb-panel-title">Top 5 Players</h2>
            <div class="sb-players" id="sb-players"></div>
        </section>
        <section class="sb-panel" data-panel="recap" hidden>
            <h2 class="sb-panel-title">Today's Story</h2>
            <div class="sb-recap" id="sb-recap"></div>
        </section>
        <section class="sb-panel" data-panel="feed" hidden>
            <h2 class="sb-panel-title">Live Feed</h2>
            <div class="sb-feed" id="sb-feed"></div>
        </section>
    </main>

    <!-- Persistent ticker -->
    <footer class="sb-ticker"><div class="sb-ticker-track" id="sb-ticker-track"></div></footer>

    <!-- Theatrical overlays -->
    <div class="sb-flash" id="sb-flash"></div>
    <div class="sb-overtake" id="sb-overtake"></div>

    <!-- Firebase -->
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-database-compat.js"></script>
    <script src="js/shared.js?v=21"></script>
    <script src="js/firebase-config.js?v=19"></script>
    <script src="js/scoreboard.js?v=1"></script>
</body>
</html>
```

**Step 2: `css/scoreboard.css`**

```css
:root {
    --titans: #f9a825;
    --spartans: #c62828;
    --vikings: #1565c0;
    --gladiators: #424242;
    --bg: #0a0820;
    --bg-2: #1a1240;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { height: 100%; overflow: hidden; background: radial-gradient(ellipse at top, var(--bg-2), var(--bg) 70%); color: #fff; font-family: 'Inter', system-ui, sans-serif; }
body.stadium { display: grid; grid-template-rows: auto 1fr auto; }
#confetti-canvas { position: fixed; inset: 0; pointer-events: none; z-index: 100; }

.sb-start { position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); }
.sb-start.hidden { display: none; }
.sb-start-inner { text-align: center; }
.sb-start-icon { font-size: 6rem; margin-bottom: 12px; }
.sb-start h1 { font-family: 'Bebas Neue', sans-serif; font-size: 4rem; letter-spacing: 0.04em; }
.sb-start p { opacity: 0.7; margin: 8px 0 24px; font-size: 1.2rem; }
.sb-start-btn { padding: 16px 48px; font-size: 1.4rem; font-weight: 700; background: linear-gradient(90deg,#7a3eef,#b94aef); color: #fff; border: none; border-radius: 99px; cursor: pointer; box-shadow: 0 12px 40px rgba(122,62,239,0.6); }

.sb-header { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; padding: 24px 40px; gap: 20px; border-bottom: 1px solid rgba(255,255,255,0.08); }
.sb-logo { font-family: 'Bebas Neue', sans-serif; font-size: 2.4rem; letter-spacing: 0.08em; }
.sb-day { text-align: center; font-weight: 700; font-size: 1.4rem; opacity: 0.85; }
.sb-controls { text-align: right; }
.sb-mute { background: rgba(255,255,255,0.08); border: none; color: #fff; padding: 8px 14px; font-size: 1.2rem; border-radius: 99px; cursor: pointer; }

.sb-stage { position: relative; padding: 24px 40px; min-height: 0; }
.sb-panel { position: absolute; inset: 24px 40px; display: flex; flex-direction: column; opacity: 0; transition: opacity 0.6s ease; }
.sb-panel.active { opacity: 1; }
.sb-panel[hidden] { display: none; }

.sb-panel-title { font-family: 'Bebas Neue', sans-serif; font-size: 3rem; letter-spacing: 0.06em; margin-bottom: 18px; opacity: 0.9; }

.sb-grid-teams { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 18px; flex: 1; }
.sb-team-card { position: relative; padding: 32px; border-radius: 24px; background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)); border: 2px solid rgba(255,255,255,0.08); display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; }
.sb-team-card.leader { border-color: gold; box-shadow: 0 0 60px rgba(255,215,0,0.3); animation: leaderPulse 2.4s ease-in-out infinite; }
@keyframes leaderPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.015); } }
.sb-team-card[data-team="titans"] { background: linear-gradient(135deg, rgba(249,168,37,0.25), rgba(249,168,37,0.05)); }
.sb-team-card[data-team="spartans"] { background: linear-gradient(135deg, rgba(198,40,40,0.25), rgba(198,40,40,0.05)); }
.sb-team-card[data-team="vikings"] { background: linear-gradient(135deg, rgba(21,101,192,0.25), rgba(21,101,192,0.05)); }
.sb-team-card[data-team="gladiators"] { background: linear-gradient(135deg, rgba(150,150,150,0.25), rgba(150,150,150,0.05)); }
.sb-team-name { font-family: 'Bebas Neue', sans-serif; font-size: 4.5rem; letter-spacing: 0.04em; }
.sb-team-emoji { font-size: 3rem; }
.sb-team-score { font-family: 'Bebas Neue', sans-serif; font-size: 9rem; line-height: 1; align-self: flex-end; text-shadow: 0 4px 18px rgba(0,0,0,0.4); }
.sb-team-rank { position: absolute; top: 16px; right: 16px; font-size: 1.4rem; font-weight: 700; opacity: 0.6; }

.sb-players { display: grid; gap: 12px; flex: 1; }
.sb-player-row { display: grid; grid-template-columns: 80px 1fr auto; align-items: center; gap: 18px; padding: 18px 24px; border-radius: 16px; background: rgba(255,255,255,0.04); }
.sb-player-row.first { background: linear-gradient(90deg, rgba(255,215,0,0.2), rgba(255,215,0,0.05)); border: 1px solid rgba(255,215,0,0.4); }
.sb-player-rank { font-family: 'Bebas Neue', sans-serif; font-size: 3rem; }
.sb-player-name { font-size: 2.2rem; font-weight: 700; }
.sb-player-pts { font-family: 'Bebas Neue', sans-serif; font-size: 3rem; }

.sb-recap { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; flex: 1; }
.sb-recap-card { padding: 24px; border-radius: 20px; background: rgba(255,255,255,0.05); }
.sb-recap-card h3 { font-family: 'Bebas Neue', sans-serif; font-size: 2rem; opacity: 0.7; margin-bottom: 8px; letter-spacing: 0.06em; }
.sb-recap-card .v { font-size: 2.4rem; font-weight: 700; }

.sb-feed { display: grid; gap: 8px; align-content: start; }
.sb-feed-row { display: grid; grid-template-columns: auto 80px 1fr auto; gap: 18px; align-items: center; padding: 14px 20px; border-radius: 14px; background: rgba(255,255,255,0.04); font-size: 1.3rem; }
.sb-feed-emoji { font-size: 1.8rem; }
.sb-feed-pts { font-family: 'Bebas Neue', sans-serif; font-size: 2rem; }
.sb-feed-pts.positive { color: #6ee07b; }
.sb-feed-pts.negative { color: #ff7575; }
.sb-feed-time { opacity: 0.5; font-size: 1rem; }

.sb-ticker { background: rgba(0,0,0,0.5); border-top: 2px solid rgba(255,255,255,0.1); padding: 12px 0; overflow: hidden; white-space: nowrap; }
.sb-ticker-track { display: inline-block; padding-left: 100%; animation: tickerScroll 60s linear infinite; font-size: 1.3rem; }
.sb-ticker-track:hover { animation-play-state: paused; }
.sb-ticker-item { display: inline-block; margin-right: 60px; }
.sb-ticker-pts { font-weight: 700; color: #ffcc4d; margin: 0 6px; }
@keyframes tickerScroll { from { transform: translateX(0); } to { transform: translateX(-100%); } }

.sb-flash { position: fixed; inset: 0; background: rgba(255,255,255,0); pointer-events: none; z-index: 200; transition: background 0.15s; }
.sb-flash.fire { background: rgba(255,255,255,0.9); transition: background 0.05s; }
.sb-overtake { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; z-index: 300; opacity: 0; transition: opacity 0.4s; }
.sb-overtake.fire { opacity: 1; }
.sb-overtake-inner { padding: 48px 80px; border-radius: 40px; background: linear-gradient(135deg, rgba(0,0,0,0.85), rgba(40,30,80,0.85)); border: 4px solid gold; text-align: center; box-shadow: 0 30px 100px rgba(255,215,0,0.4); }
.sb-overtake-title { font-family: 'Bebas Neue', sans-serif; font-size: 6rem; letter-spacing: 0.04em; }
.sb-overtake-sub { font-size: 2rem; opacity: 0.8; }
```

**Step 3: `js/scoreboard.js`**

```js
/* Stadium Mode — runs the TV scoreboard at the château */
(function() {
    var PANELS = ['teams', 'players', 'recap', 'feed'];
    var CYCLE_MS = 12000;
    var TEAMS = ['titans', 'spartans', 'vikings', 'gladiators'];
    var TEAM_NAMES = { titans: 'Titans', spartans: 'Spartans', vikings: 'Vikings', gladiators: 'Gladiators' };
    var TEAM_EMOJI = { titans: '⚡', spartans: '🛡️', vikings: '⚔️', gladiators: '🗡️' };
    var CATEGORY_EMOJI = { games: '🎮', duties: '👨‍🍳', challenges: '🏆', bonus: '⭐', penalty: '🟥' };

    var currentPanel = 0;
    var cycleTimer = null;
    var muted = false;
    var audioCtx = null;

    function $(sel) { return document.querySelector(sel); }
    function $all(sel) { return Array.from(document.querySelectorAll(sel)); }
    function show(el) { el.removeAttribute('hidden'); requestAnimationFrame(() => el.classList.add('active')); }
    function hide(el) { el.classList.remove('active'); setTimeout(() => el.setAttribute('hidden',''), 600); }

    function getData() {
        return {
            teamScores: Store.get('lb_teamScores', { titans:0, spartans:0, vikings:0, gladiators:0 }),
            individualScores: Store.get('lb_individualScores', {}),
            pointsLog: Store.get('lb_pointsLog', []),
        };
    }

    function getTripDay() {
        var start = new Date('2026-04-29').getTime();
        var d = Math.floor((Date.now() - start) / 86400000) + 1;
        return Math.max(1, Math.min(6, d));
    }
    var DAY_NAMES = ['Wednesday','Thursday','Friday','Saturday','Sunday','Monday'];

    function fullName(name) { return (typeof FULL_NAMES !== 'undefined' && FULL_NAMES[name]) || name; }

    /* ---- Renders ---- */
    function renderTeams() {
        var d = getData();
        var sorted = TEAMS.slice().sort((a,b) => (d.teamScores[b]||0) - (d.teamScores[a]||0));
        var maxScore = d.teamScores[sorted[0]] || 0;
        $('#sb-teams').innerHTML = sorted.map((team, i) => `
            <div class="sb-team-card ${(d.teamScores[team]||0) === maxScore && maxScore > 0 ? 'leader' : ''}" data-team="${team}">
                <div class="sb-team-rank">#${i+1}</div>
                <div>
                    <div class="sb-team-emoji">${TEAM_EMOJI[team]}</div>
                    <div class="sb-team-name">${TEAM_NAMES[team]}</div>
                </div>
                <div class="sb-team-score">${d.teamScores[team] || 0}</div>
            </div>
        `).join('');
    }

    function renderPlayers() {
        var d = getData();
        var sorted = Object.keys(d.individualScores)
            .map(n => ({ name: n, pts: d.individualScores[n] || 0 }))
            .sort((a,b) => b.pts - a.pts)
            .slice(0, 5);
        var medals = ['🥇','🥈','🥉','4️⃣','5️⃣'];
        $('#sb-players').innerHTML = sorted.map((p, i) => `
            <div class="sb-player-row ${i===0 && p.pts > 0 ? 'first' : ''}">
                <div class="sb-player-rank">${medals[i] || (i+1)}</div>
                <div class="sb-player-name">${fullName(p.name)}</div>
                <div class="sb-player-pts">${p.pts}</div>
            </div>
        `).join('') || '<p class="sb-empty">Awaiting first awards...</p>';
    }

    function renderRecap() {
        var d = getData();
        var day = getTripDay();
        var todayLog = d.pointsLog.filter(e => (e.day || 1) === day);
        var totals = {};
        todayLog.forEach(e => { if (e.type === 'individual') { totals[e.target] = (totals[e.target]||0) + e.amount; } });
        var mvp = Object.entries(totals).sort((a,b)=>b[1]-a[1])[0];
        var biggest = todayLog.filter(e => e.amount > 0).sort((a,b)=>b.amount-a.amount)[0];
        var totalPts = todayLog.reduce((s,e) => s + e.amount, 0);
        $('#sb-recap').innerHTML = `
            <div class="sb-recap-card"><h3>Today's MVP</h3><div class="v">${mvp ? '👑 ' + fullName(mvp[0]) + ' (+' + mvp[1] + ')' : '—'}</div></div>
            <div class="sb-recap-card"><h3>Biggest Award</h3><div class="v">${biggest ? '+' + biggest.amount + ' · ' + fullName(biggest.target) : '—'}</div></div>
            <div class="sb-recap-card"><h3>Total Points Today</h3><div class="v">${totalPts}</div></div>
            <div class="sb-recap-card"><h3>Awards Today</h3><div class="v">${todayLog.length}</div></div>
        `;
    }

    function renderFeed() {
        var d = getData();
        var feed = d.pointsLog.slice(0, 10);
        $('#sb-feed').innerHTML = feed.map(e => {
            var emoji = CATEGORY_EMOJI[e.category || 'bonus'] || '⭐';
            var sign = e.amount > 0 ? '+' : '';
            var target = e.type === 'team' ? (TEAM_NAMES[e.target] || e.target) : fullName(e.target);
            return `
                <div class="sb-feed-row">
                    <span class="sb-feed-emoji">${emoji}</span>
                    <span class="sb-feed-pts ${e.amount>0?'positive':'negative'}">${sign}${e.amount}</span>
                    <span><strong>${target}</strong> — ${e.reason || ''}</span>
                    <span class="sb-feed-time">${e.time || ''}</span>
                </div>
            `;
        }).join('') || '<p class="sb-empty">No awards yet</p>';
    }

    function renderTicker() {
        var d = getData();
        var items = d.pointsLog.slice(0, 8).map(e => {
            var emoji = CATEGORY_EMOJI[e.category || 'bonus'] || '⭐';
            var sign = e.amount > 0 ? '+' : '';
            var target = e.type === 'team' ? (TEAM_NAMES[e.target] || e.target) : fullName(e.target);
            return `<span class="sb-ticker-item">${emoji} <strong>${target}</strong> <span class="sb-ticker-pts">${sign}${e.amount}</span> ${e.reason || ''}</span>`;
        }).join('');
        $('#sb-ticker-track').innerHTML = items || '<span class="sb-ticker-item">Waiting for first award...</span>';
    }

    function renderHeader() {
        var day = getTripDay();
        $('#sb-day').textContent = 'Day ' + day + ' · ' + (DAY_NAMES[day-1] || '');
    }

    function renderAll() {
        renderHeader();
        renderTeams();
        renderPlayers();
        renderRecap();
        renderFeed();
        renderTicker();
    }

    /* ---- Cycling ---- */
    function showPanel(idx) {
        var panels = $all('.sb-panel');
        panels.forEach(p => hide(p));
        var target = panels[idx];
        if (target) show(target);
        currentPanel = idx;
    }
    function nextPanel() { showPanel((currentPanel + 1) % PANELS.length); }
    function startCycle() {
        showPanel(0);
        clearInterval(cycleTimer);
        cycleTimer = setInterval(nextPanel, CYCLE_MS);
    }

    /* ---- Audio (real impl in Task 7) ---- */
    function playTone(freqs, type, duration) {
        if (muted || !audioCtx) return;
        freqs.forEach((f, i) => {
            var osc = audioCtx.createOscillator();
            var gain = audioCtx.createGain();
            osc.type = type || 'sine';
            osc.frequency.value = f;
            gain.gain.setValueAtTime(0.18, audioCtx.currentTime + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.1 + duration);
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc.start(audioCtx.currentTime + i * 0.1);
            osc.stop(audioCtx.currentTime + i * 0.1 + duration);
        });
    }

    /* ---- Init ---- */
    function start() {
        $('#sb-start').classList.add('hidden');
        try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
        renderAll();
        startCycle();
    }
    document.addEventListener('leaderboardUpdate', renderAll);
    $('#sb-start-btn').addEventListener('click', start);
    $('#sb-mute').addEventListener('click', () => {
        muted = !muted;
        $('#sb-mute').textContent = muted ? '🔇' : '🔊';
    });
    // Render once even before start (so the start screen has data behind it)
    document.addEventListener('DOMContentLoaded', renderAll);
})();
```

**Step 4: Verify**

```js
window.location.href = '/scoreboard.html?cb=' + Date.now();
// then in a follow-up eval:
return {
    panels: Array.from(document.querySelectorAll('.sb-panel')).length,
    startVisible: getComputedStyle(document.getElementById('sb-start')).display,
};
```

**Expected:** `panels: 4`, `startVisible` is not 'none'. Click the Start button:

```js
document.getElementById('sb-start-btn').click();
return new Promise(r => setTimeout(() => r({
    activePanel: document.querySelector('.sb-panel:not([hidden])')?.dataset.panel,
    teamCount: document.querySelectorAll('.sb-team-card').length,
}), 800));
```

**Expected:** `{ activePanel: 'teams', teamCount: 4 }`. Wait 13s, eval again, expect `activePanel: 'players'`.

**Step 5: Commit**

```bash
git add scoreboard.html js/scoreboard.js css/scoreboard.css
git commit -m "Stadium Mode: TV scoreboard shell with auto-cycling panels and ticker"
```

---

### Task 7: Stadium Theatrical Interrupts (overtake / +5 / new #1)

**Why:** The "wow" moments. Big-screen overtake banner + air horn on +5 + camera-flash on new individual #1.

**Files:**
- Modify: `js/scoreboard.js` — listen to derived events, fire interrupts
- (Stadium needs the same derived-event tracker as games.js. Since `scoreboard.html` doesn't load `games.js`, replicate the dispatcher.)

**Step 1: Replicate event tracker on Stadium**

In `js/scoreboard.js`, before the `renderAll` you already wrote, add:

```js
var prevTeamRanks = {};
var prevIndRanks = {};
var prevTopIndividual = null;
var prevTopAmount = 0;

function captureRanks() {
    var d = getData();
    var tSorted = TEAMS.slice().sort((a,b) => (d.teamScores[b]||0) - (d.teamScores[a]||0));
    var tRanks = {}; tSorted.forEach((t,i) => { tRanks[t] = i+1; });
    var iSorted = Object.keys(d.individualScores).sort((a,b) => (d.individualScores[b]||0) - (d.individualScores[a]||0));
    var iRanks = {}; iSorted.forEach((n,i) => { iRanks[n] = i+1; });
    return { tRanks, iRanks, topIndividual: iSorted[0] || null };
}

function detectAndFire(prev, next) {
    Object.keys(next.tRanks).forEach(team => {
        if (prev.tRanks[team] && prev.tRanks[team] !== next.tRanks[team] && next.tRanks[team] < prev.tRanks[team]) {
            fireOvertake(team, prev.tRanks[team], next.tRanks[team]);
        }
    });
    if (next.topIndividual && prev.topIndividual && next.topIndividual !== prev.topIndividual) {
        fireNewLeader(next.topIndividual);
    }
    var lastEntry = (Store.get('lb_pointsLog', [])[0] || {});
    if (lastEntry.timestamp && lastEntry.amount >= 5 && lastEntry.timestamp !== prevTopAmount) {
        fireBigAward(lastEntry);
        prevTopAmount = lastEntry.timestamp;
    }
}
```

**Step 2: Hook into renderAll**

Replace the existing renderAll body to capture state diff:

```js
function renderAll() {
    var prev = { tRanks: prevTeamRanks, iRanks: prevIndRanks, topIndividual: prevTopIndividual };
    renderHeader(); renderTeams(); renderPlayers(); renderRecap(); renderFeed(); renderTicker();
    var next = captureRanks();
    detectAndFire(prev, next);
    prevTeamRanks = next.tRanks;
    prevIndRanks = next.iRanks;
    prevTopIndividual = next.topIndividual;
}
```

**Step 3: Theatrical fire functions**

```js
function fireOvertake(team, fromRank, toRank) {
    if (toRank !== 1) return; // only celebrate taking #1
    pauseCycle(5000);
    var node = $('#sb-overtake');
    node.innerHTML = `
        <div class="sb-overtake-inner team-${team}">
            <div class="sb-overtake-title">${TEAM_EMOJI[team]} ${TEAM_NAMES[team].toUpperCase()}</div>
            <div class="sb-overtake-sub">TAKE THE LEAD!</div>
        </div>
    `;
    node.classList.add('fire');
    fireConfetti();
    playTone([220, 330, 440, 660], 'square', 0.4);
    setTimeout(() => node.classList.remove('fire'), 4000);
}

function fireNewLeader(name) {
    pauseCycle(3500);
    playTone([523, 659, 784], 'sine', 0.3);
    flash();
}

function fireBigAward(entry) {
    pauseCycle(2500);
    playTone([800, 1000, 1200], 'sawtooth', 0.25);
    flash();
}

function flash() {
    $('#sb-flash').classList.add('fire');
    setTimeout(() => $('#sb-flash').classList.remove('fire'), 200);
}

function pauseCycle(ms) {
    clearInterval(cycleTimer);
    setTimeout(() => { cycleTimer = setInterval(nextPanel, CYCLE_MS); }, ms);
}

function fireConfetti() {
    var c = $('#confetti-canvas');
    if (!c) return;
    var ctx = c.getContext('2d');
    c.width = innerWidth; c.height = innerHeight;
    var pieces = [];
    var colours = ['#f9a825','#c62828','#1565c0','#fff','#ffd700','#ff5252'];
    for (var i = 0; i < 200; i++) {
        pieces.push({
            x: Math.random()*c.width, y: -10,
            vx: (Math.random()-0.5)*4, vy: Math.random()*3 + 2,
            r: Math.random()*4 + 2, col: colours[i%colours.length],
        });
    }
    var t0 = performance.now();
    function tick(now) {
        var elapsed = now - t0;
        ctx.clearRect(0,0,c.width,c.height);
        pieces.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.05; ctx.fillStyle = p.col; ctx.fillRect(p.x, p.y, p.r, p.r); });
        if (elapsed < 4000) requestAnimationFrame(tick);
        else ctx.clearRect(0,0,c.width,c.height);
    }
    requestAnimationFrame(tick);
}
```

**Step 4: Bump cache buster**

`scoreboard.js?v=1` → `?v=2`.

**Step 5: Verify**

```js
// Already on /scoreboard.html, audio already started
Store.set('lb_teamScores', { titans:0, spartans:5, vikings:0, gladiators:0 });
return new Promise(r => setTimeout(() => r({
    overtakeFiring: document.getElementById('sb-overtake').classList.contains('fire'),
    confettiPieces: document.getElementById('confetti-canvas').width > 0,
}), 200));
// Reset:
Store.set('lb_teamScores', { titans:0, spartans:0, vikings:0, gladiators:0 });
```

**Expected:** `overtakeFiring: true`, `confettiPieces: true`. Reset data.

**Step 6: Commit**

```bash
git add js/scoreboard.js scoreboard.html
git commit -m "Stadium Mode: overtake banner, +5 air horn, new-leader sting, confetti"
```

---

## Phase 4 — Push Notifications (stretch)

### Task 8: FCM Spike

**Why:** Push notifications when *you* get overtaken. Optional — if FCM client wiring is too heavy, ship without push and add post-trip.

**Files:**
- Modify: `js/firebase-config.js` — register service worker, request notification permission, store FCM token under `users/{guestCode}/fcmToken`
- Modify: `sw.js` — verify push handler shape matches FCM payload

**Step 1: Investigate**

Read `sw.js` push handler (lines 59-70). Check whether `firebase.messaging` is loaded anywhere. Likely **not** loaded, so this requires:
- Adding `firebase-messaging-compat.js` script tag to all HTML pages (or just games.html)
- Calling `firebase.messaging().getToken({ vapidKey })` — needs a VAPID key from Firebase Console
- A Cloud Function or external service to actually send pushes when leaderboard changes

**Step 2: Decision gate**

If VAPID key is not available in `js/firebase-config.js` and no Cloud Function exists in `functions/`, **abort this task and document as out-of-scope for the trip**. Add a note to the design doc.

**Step 3: If aborted**

Add a `<!-- TODO post-trip: FCM push -->` comment in `js/firebase-config.js` near the messagingSenderId, commit, move on.

```bash
git add js/firebase-config.js docs/plans/2026-04-28-leaderboard-stadium-bundle-design.md
git commit -m "Push notifications: deferred post-trip (FCM client wiring)"
```

**Step 4: If feasible (only if VAPID + Cloud Function exist)**

Implement client subscribe + server-side trigger. This is its own ~3-hour subtask. Skip and ship if it would push the trip deadline.

---

## Phase 5 — Ship

### Task 9: Final Cache Buster Sweep

**Why:** Ensure every page picks up the new shared.js / games.js / games.css versions. Catch any I missed.

**Files:**
- All HTML files

**Step 1: Audit**

```bash
cd "C:\Users\joe-o\Github\joes-30th-birthday"
grep -n "shared.js?v=\|games.js?v=\|games.css?v=\|scoreboard.js?v=" *.html
```

Confirm:
- All `shared.js?v=` are equal (latest version after Task 5)
- `games.js?v=`, `games.css?v=` match the latest after Tasks 1–5
- `scoreboard.html` references `scoreboard.js?v=2`, `scoreboard.css?v=1`

**Step 2: Fix any mismatches** with `sed` (pattern from earlier in this session).

**Step 3: Commit**

```bash
git add *.html
git commit -m "Cache buster sweep for Stadium Bundle"
```

### Task 10: Push to GitHub Pages

```bash
cd "C:\Users\joe-o\Github\joes-30th-birthday"
git pull --rebase origin main
git push origin main
```

If conflicts (likely on cache busters), resolve by keeping highest version numbers (Python sed pattern from earlier in session).

After push, GitHub Pages deploys in ~1-2 min. Verify on production:

```bash
curl -s -o /dev/null -w "%{http_code}" https://joes30.com/scoreboard.html
```

**Expected:** `200`.

---

## Risk Register

| Risk | Mitigation |
|---|---|
| Browsers block autoplay audio on TV | Tap-to-start overlay in Task 6 |
| Smart TV browser too old for ES6 | Use Chrome/Edge browser via streaming stick (Chromecast/Fire TV) |
| Confetti canvas drops FPS on old TV | Confetti runs ≤ 4s; ticker continues; cycle resumes |
| FCM not wired | Task 8 abort path; in-app banner still works |
| Firebase rate limits during testing | Reset state via the eval pattern from Task 1 verify |

## Time Budget

| Phase | Tasks | Estimate |
|---|---|---|
| 1 — Foundation | 1 | 30 min |
| 2 — Phone | 2-5 | 2 hr |
| 3 — Stadium | 6-7 | 3 hr |
| 4 — Push | 8 | 30 min spike, defer or +3 hr |
| 5 — Ship | 9-10 | 30 min |
| **Total** | | **6-9 hr** |
