# Bingo & Live Feed Revamp — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Elevate bingo to its own page with satisfying interactions, integrate it deeply with the live feed, add punishment tracking and cap reactions.

**Architecture:** Extract bingo from games.html into standalone bingo.html with its own CSS/JS. Upgrade the claim flow to a bottom drawer with optional photo. Add punishment board and cap reaction to live feed. Update nav across all pages.

**Tech Stack:** Vanilla HTML/CSS/JS, Firebase Realtime Database, Firebase Storage (photos), Web Vibration API, CSS animations.

---

### Task 1: Create bingo.html page shell

**Files:**
- Create: `bingo.html`
- Create: `css/bingo.css`
- Create: `js/bingo.js`

**Step 1:** Create `bingo.html` with the standard head (copy from games.html), same meta tags, manifest, apple PWA tags, Firebase SDK scripts. Nav with Bingo as active page. Empty sections for each component:

```html
<!-- Page Header -->
<header class="page-header bingo-page-header">
    <h1>Trip Bingo 🎯</h1>
    <p>Claim challenges. Complete lines. Punish your mates.</p>
</header>

<!-- Stats Bar -->
<section class="section bingo-stats-bar" id="bingoStatsBar">
    <div class="container">
        <div class="bingo-stats-grid">
            <div class="bingo-stat-box"><span class="bsb-val" id="bsbClaims">0/16</span><span class="bsb-label">Your Claims</span></div>
            <div class="bingo-stat-box"><span class="bsb-val" id="bsbLines">0</span><span class="bsb-label">Your Lines</span></div>
            <div class="bingo-stat-box"><span class="bsb-val" id="bsbTeamRank">-</span><span class="bsb-label">Team Rank</span></div>
            <div class="bingo-stat-box"><span class="bsb-val" id="bsbTotal">0/16</span><span class="bsb-label">Total</span></div>
        </div>
    </div>
</section>

<!-- The Grid -->
<section class="section bingo-grid-section">
    <div class="container">
        <div class="bingo-grid-wrap" id="bingoGrid"></div>
    </div>
</section>

<!-- Points Guide (collapsible) -->
<section class="section bingo-points-section">
    <div class="container">
        <details class="bingo-points-details">
            <summary>How points work ▸</summary>
            <!-- tier table -->
        </details>
    </div>
</section>

<!-- Punishment Board -->
<section class="section bingo-punishments-section">
    <div class="container">
        <h2 class="section-title-sm">Active Punishments</h2>
        <div id="bingoPunishments"></div>
    </div>
</section>

<!-- Bingo Leaderboard -->
<section class="section bingo-lb-section">
    <div class="container">
        <h2 class="section-title-sm">🏆 Bingo Leaders</h2>
        <div id="bingoLeaderboard"></div>
    </div>
</section>

<!-- Recent Activity -->
<section class="section bingo-activity-section">
    <div class="container">
        <h2 class="section-title-sm">Recent Activity</h2>
        <div id="bingoFeed"></div>
    </div>
</section>

<!-- Admin Panel (joe30 only) -->
<div class="bingo-admin" id="bingoAdmin" style="display: none;">
    <div class="bingo-admin-header"><h3>Bingo Admin</h3><span id="bingoAdminCount">0 claims</span></div>
    <div id="bingoAdminClaims"></div>
</div>

<!-- Claim Drawer (slides up from bottom) -->
<div class="bingo-claim-drawer" id="bingoClaimDrawer">
    <div class="bingo-claim-drawer-inner">
        <div class="bingo-claim-drawer-handle"></div>
        <p class="bingo-claim-drawer-challenge" id="bingoClaimChallenge"></p>
        <p class="bingo-claim-drawer-prompt">Did you actually do this?</p>
        <div class="bingo-claim-drawer-photo">
            <button class="bingo-photo-btn" id="bingoPhotoBtn">📷 Add proof (optional)</button>
            <input type="file" id="bingoPhotoInput" accept="image/*" capture="environment" style="display:none">
            <div class="bingo-photo-preview" id="bingoPhotoPreview" style="display:none">
                <img id="bingoPhotoImg">
                <button class="bingo-photo-remove" id="bingoPhotoRemove">✕</button>
            </div>
        </div>
        <div class="bingo-claim-drawer-actions">
            <button class="btn btn-primary bingo-claim-btn" id="bingoClaimYes">Claim it ✓</button>
            <button class="btn btn-secondary bingo-claim-btn" id="bingoClaimNo">Not yet</button>
        </div>
    </div>
</div>
<div class="bingo-claim-backdrop" id="bingoClaimBackdrop"></div>

<!-- Line Celebration Modal -->
<div class="bingo-line-modal" id="bingoLineModal" style="display: none;">
    <!-- reuse existing structure from games.html -->
</div>
```

**Step 2:** Create empty `css/bingo.css` and `js/bingo.js` files.

**Step 3:** Commit.

```bash
git add bingo.html css/bingo.css js/bingo.js
git commit -m "feat(bingo): create standalone bingo page shell"
```

---

### Task 2: Extract bingo CSS from games.css into bingo.css

**Files:**
- Modify: `css/games.css` — remove all `.bingo-*` styles
- Modify: `css/bingo.css` — paste and restructure bingo styles

**Step 1:** Identify all bingo-related CSS blocks in `css/games.css` (search for `.bingo-`). These are roughly lines 281–706 plus the admin styles added recently.

**Step 2:** Move them to `css/bingo.css`. Restructure into sections:
1. Stats bar (new)
2. Grid cells (upgraded — larger, team colours, pulse animation)
3. Claim drawer (new — replaces centered modal)
4. Line celebration modal (existing)
5. Punishment board (new)
6. Leaderboard (new)
7. Activity feed (existing)
8. Admin panel (existing)
9. Animations (claim pop, pulse, confetti, line glow)
10. Dark mode overrides
11. Mobile responsive

**Step 3:** Add new styles for:

**Grid cells (upgraded):**
```css
.bingo-grid-wrap {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    max-width: 500px;
    margin: 0 auto;
}
.bingo-cell {
    position: relative;
    min-height: 90px;
    padding: 12px 10px;
    background: white;
    border: 2px solid var(--border-color);
    border-radius: var(--radius-md);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    transition: all 0.2s ease;
}
.bingo-cell.unclaimed {
    animation: bingoPulse 3s ease-in-out infinite;
}
.bingo-cell.claimed {
    cursor: default;
    border-left: 4px solid var(--team-colour);
    background: var(--team-colour-bg);
}
.bingo-cell.claimed-self { border-color: var(--accent); }
.bingo-cell.in-line { box-shadow: 0 0 12px var(--team-colour); }
@keyframes bingoPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.85; }
}
```

**Claim drawer (bottom sheet):**
```css
.bingo-claim-drawer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 10001;
    transform: translateY(100%);
    transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.bingo-claim-drawer.open { transform: translateY(0); }
.bingo-claim-drawer-inner {
    background: white;
    border-radius: 20px 20px 0 0;
    padding: 12px 20px 28px;
    max-width: 480px;
    margin: 0 auto;
    box-shadow: 0 -8px 30px rgba(0,0,0,0.15);
}
.bingo-claim-drawer-handle {
    width: 40px;
    height: 4px;
    background: #ddd;
    border-radius: 2px;
    margin: 0 auto 16px;
}
.bingo-claim-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.4);
    z-index: 10000;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
}
.bingo-claim-backdrop.open { opacity: 1; pointer-events: auto; }
```

**Punishment board:**
```css
.bingo-punishment-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px;
    background: white;
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);
    margin-bottom: 8px;
}
.bingo-punishment-done-btn {
    background: var(--accent-alt);
    color: white;
    border: none;
    border-radius: var(--radius-pill);
    padding: 6px 14px;
    font-weight: 700;
    font-size: 0.8rem;
    cursor: pointer;
}
```

**Step 4:** Commit.

```bash
git add css/games.css css/bingo.css
git commit -m "feat(bingo): extract and upgrade bingo styles to bingo.css"
```

---

### Task 3: Extract bingo JS from games.js into bingo.js

**Files:**
- Modify: `js/games.js` — remove `initBingo()` and all bingo helper functions (~350 lines)
- Modify: `js/bingo.js` — rewritten bingo logic

**Step 1:** Remove from `js/games.js`:
- `BINGO_PUNISHMENTS` object
- `BINGO_FULLHOUSE_REWARDS` array
- `initBingo()` function and everything inside it (renderBingoGrid, showClaimModal, checkForNewLines, showLineModal, showFullHouseModal, updateBingoStats, renderBingoActivity, relativeTimeBingo, initBingoAdmin, renderBingoAdmin)
- The `initBingo()` call in the DOMContentLoaded listener

**Step 2:** Write `js/bingo.js` with upgraded functionality:

Key functions to implement:
1. `initBingo()` — main entry point, called on DOMContentLoaded
2. `renderGrid()` — 4x4 grid with team colours, photo indicators, pulse animation
3. `openClaimDrawer(idx)` — bottom sheet with optional photo capture
4. `submitClaim(idx, photoFile)` — claim + optional photo upload + vibrate + toast
5. `checkForNewLines()` — existing line detection logic
6. `showLineCelebration(lineData)` — full-screen overlay with confetti
7. `showPunishmentPicker(lineData)` — face-down cards that flip
8. `showVictimPicker(lineData)` — guest avatar grid
9. `showFullHouseCelebration()` — nuclear celebration
10. `renderPunishments()` — active punishment board from `bingo/punishments`
11. `markPunishmentDone(id)` — victim marks complete, posts to feed
12. `renderLeaderboard()` — top 5 bingo claimers
13. `renderActivity()` — last 10 bingo feed events
14. `renderAdmin()` — existing admin panel (revoke/restore)
15. `updateStats()` — hero stats bar

**Key upgrades vs current code:**
- Claim uses bottom drawer not centered modal
- Photo capture via `<input type="file" accept="image/*" capture="environment">`
- Photo compressed + uploaded to Firebase Storage via `PhotoStorage.upload()`
- Claim data includes `photoUrl` if photo was attached
- `navigator.vibrate(50)` on successful claim
- Toast notification slides in from top (reuse shared toast if exists, else create)
- Punishment tracking: on line completion, write to `bingo/punishments/` with `completed: false`
- Listen to `bingo/punishments` for real-time punishment board updates

**Step 3:** Commit.

```bash
git add js/games.js js/bingo.js
git commit -m "feat(bingo): extract and upgrade bingo JS with claim drawer, photos, punishments"
```

---

### Task 4: Update navigation across all pages

**Files:**
- Modify: `index.html` — add Bingo link to nav, update Social link
- Modify: `schedule.html` — same nav change
- Modify: `games.html` — same nav change, remove bingo tile from games-nav-grid
- Modify: `social.html` — same nav change
- Modify: `livefeed.html` — same nav change
- Modify: `practical.html` — same nav change
- Modify: `bingo.html` — nav already has Bingo active

**Step 1:** In ALL 6 existing HTML files, replace the nav `<ul class="nav-links">` block:

**From:**
```html
<li><a href="index.html" data-page="index.html">Home</a></li>
<li><a href="schedule.html" data-page="schedule.html">Schedule</a></li>
<li><a href="games.html" data-page="games.html">Games</a></li>
<li><a href="livefeed.html" data-page="livefeed.html">Live Feed</a></li>
<li><a href="practical.html" data-page="practical.html">Info</a></li>
```

**To:**
```html
<li><a href="index.html" data-page="index.html">Home</a></li>
<li><a href="schedule.html" data-page="schedule.html">Schedule</a></li>
<li><a href="bingo.html" data-page="bingo.html" id="nav-bingo">Bingo</a></li>
<li><a href="games.html" data-page="games.html">Games</a></li>
<li><a href="livefeed.html" data-page="livefeed.html">Live Feed</a></li>
<li><a href="practical.html" data-page="practical.html">Info</a></li>
```

**Step 2:** In `games.html`, remove the bingo tile from `.games-nav-grid`:
Remove the `<button class="games-nav-tile games-nav-tile--bingo" ...>` block.

**Step 3:** In `index.html`, update the Social quick link to point to social.html with label "The Crew".

**Step 4:** Commit.

```bash
git add index.html schedule.html games.html social.html livefeed.html practical.html bingo.html
git commit -m "feat(nav): add Bingo tab, restructure navigation across all pages"
```

---

### Task 5: Bingo notification dot

**Files:**
- Modify: `js/shared.js` — add notification dot logic
- Modify: `css/base.css` — dot styles

**Step 1:** In `js/shared.js`, add to the DOMContentLoaded init list a call to `initBingoNotifDot()`:

```javascript
function initBingoNotifDot() {
    var bingoLink = document.getElementById('nav-bingo');
    if (!bingoLink) return;
    // Don't show dot on bingo page itself
    if (window.location.pathname.indexOf('bingo.html') !== -1) {
        localStorage.setItem('bingoLastSeen', String(Date.now()));
        return;
    }

    if (typeof FirebaseSync === 'undefined' || !FirebaseSync.isConfigured()) return;

    document.addEventListener('feedUpdate', function(e) {
        var feed = e.detail;
        if (!feed) return;
        var lastSeen = parseInt(localStorage.getItem('bingoLastSeen') || '0', 10);
        var hasNew = false;
        var keys = Object.keys(feed);
        for (var i = 0; i < keys.length; i++) {
            var item = feed[keys[i]];
            if (item && item.type === 'bingo' && item.timestamp > lastSeen) {
                hasNew = true;
                break;
            }
        }
        if (hasNew) {
            bingoLink.classList.add('has-notif');
        } else {
            bingoLink.classList.remove('has-notif');
        }
    });
}
```

**Step 2:** Add CSS in `css/base.css`:

```css
.nav-links a.has-notif::after {
    content: '';
    position: absolute;
    top: 4px;
    right: -6px;
    width: 8px;
    height: 8px;
    background: #ef4444;
    border-radius: 50%;
    border: 2px solid white;
}
.nav-links a { position: relative; }
```

**Step 3:** Commit.

```bash
git add js/shared.js css/base.css
git commit -m "feat(bingo): notification dot on nav when new claims"
```

---

### Task 6: Cap (🧢) reaction on live feed

**Files:**
- Modify: `js/livefeed.js` — add cap emoji to reactions, add CAPPED badge logic
- Modify: `css/livefeed.css` — cap badge styles

**Step 1:** In `js/livefeed.js`, find the reactions array and add the cap emoji:

**From:** `var emojis = ['❤️', '😂', '🔥'];`
**To:** `var emojis = ['❤️', '😂', '🔥', '🧢'];`

**Step 2:** In the feed item rendering function, after the reactions HTML, add CAPPED badge logic:

```javascript
// After reactions HTML generation
var capCount = (item.reactions && item.reactions['🧢']) || 0;
if (capCount >= 5 && (item.type === 'bingo' || item.type === 'bingo_claim')) {
    html += '<div class="feed-capped-badge">🧢 CAPPED</div>';
}
```

**Step 3:** Add CSS in `css/livefeed.css`:

```css
.feed-capped-badge {
    display: inline-block;
    background: #fef3c7;
    color: #92400e;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 20px;
    margin-top: 6px;
    border: 1px solid #f59e0b;
}
body.dark-mode .feed-capped-badge {
    background: #451a03;
    color: #fbbf24;
    border-color: #92400e;
}
```

**Step 4:** Commit.

```bash
git add js/livefeed.js css/livefeed.css
git commit -m "feat(feed): add cap (🧢) reaction and CAPPED badge for disputed claims"
```

---

### Task 7: Rich bingo feed cards in live feed

**Files:**
- Modify: `js/livefeed.js` — upgrade bingo item rendering
- Modify: `css/livefeed.css` — bingo card styles

**Step 1:** In `js/livefeed.js`, find the feed item rendering function. Add special rendering for bingo types:

```javascript
// Inside renderFeedItem(), check item.type
if (item.type === 'bingo' && item.photoUrl) {
    // Rich card with photo
    html += '<div class="feed-bingo-card">';
    html += '<img class="feed-bingo-photo" src="' + escapeHtml(item.photoUrl) + '" alt="Proof">';
    html += '<div class="feed-bingo-caption">' + escapeHtml(item.text) + '</div>';
    html += '</div>';
} else if (item.type === 'bingo') {
    // Text-only bingo card with team colour border
    var teamColour = getTeamColour(item.team);
    html += '<div class="feed-bingo-card feed-bingo-text" style="border-left-color:' + teamColour + '">';
    html += '<div class="feed-bingo-caption">' + escapeHtml(item.text) + '</div>';
    html += '</div>';
}
```

**Step 2:** For bingo line events, render a bigger gold-bordered card:

```javascript
if (item.type === 'bingo_line' || (item.type === 'bingo' && item.text && item.text.indexOf('bingo line') !== -1)) {
    html += '<div class="feed-bingo-line-card">';
    html += '<div class="feed-bingo-line-title">🎯 BINGO LINE!</div>';
    html += '<div class="feed-bingo-line-text">' + escapeHtml(item.text) + '</div>';
    html += '</div>';
}
```

**Step 3:** Add CSS in `css/livefeed.css`:

```css
.feed-bingo-card {
    border-radius: 12px;
    overflow: hidden;
    border-left: 4px solid var(--secondary);
    margin: 8px 0;
}
.feed-bingo-photo {
    width: 100%;
    max-height: 300px;
    object-fit: cover;
    cursor: pointer;
}
.feed-bingo-caption {
    padding: 10px 14px;
    font-size: 0.9rem;
}
.feed-bingo-line-card {
    background: linear-gradient(135deg, #fef3c7, #fff7ed);
    border: 2px solid #f59e0b;
    border-radius: 12px;
    padding: 16px;
    margin: 8px 0;
    text-align: center;
}
.feed-bingo-line-title {
    font-size: 1.1rem;
    font-weight: 800;
    color: #92400e;
    margin-bottom: 6px;
}
```

**Step 4:** Commit.

```bash
git add js/livefeed.js css/livefeed.css
git commit -m "feat(feed): rich bingo claim cards with photos and gold line cards"
```

---

### Task 8: Punishment tracking in Firebase

**Files:**
- Modify: `js/firebase-config.js` — add punishment collection listener + methods to BingoEngine
- Modify: `js/bingo.js` — write punishment on line completion, render punishment board

**Step 1:** In `js/firebase-config.js`, add to the BingoEngine IIFE:

```javascript
// Inside the firebase-config IIFE, after bingoLines setup
var bingoPunishments = {};
var punishmentListeners = [];

if (db) {
    db.ref('bingo/punishments').on('value', function(snap) {
        bingoPunishments = snap.val() || {};
        punishmentListeners.forEach(function(fn) { fn(bingoPunishments); });
    });
}

// Add to window.BingoEngine:
window.BingoEngine.addPunishment = function(data) {
    if (!db) return;
    db.ref('bingo/punishments').push({
        guestCode: data.guestCode,
        guestName: data.guestName,
        team: data.team,
        description: data.description,
        assignedBy: data.assignedBy,
        completed: false,
        completedAt: null,
        timestamp: Date.now()
    });
};

window.BingoEngine.completePunishment = function(id) {
    if (!db) return;
    db.ref('bingo/punishments/' + id).update({
        completed: true,
        completedAt: Date.now()
    });
    // Post to feed
    var p = bingoPunishments[id];
    if (p) {
        FirebaseSync.push('feed', {
            type: 'bingo',
            text: p.guestName + ' survived their punishment: ' + p.description,
            author: p.guestName,
            team: p.team || '',
            timestamp: Date.now()
        });
    }
};

window.BingoEngine.getPunishments = function() { return bingoPunishments; };
window.BingoEngine.onPunishmentsUpdate = function(fn) {
    punishmentListeners.push(fn);
    if (Object.keys(bingoPunishments).length > 0) fn(bingoPunishments);
};
```

**Step 2:** In `js/bingo.js`, in the line completion flow, after calling `BingoEngine.completeLine()`, also call `BingoEngine.addPunishment()` with the victim and punishment data.

**Step 3:** In `js/bingo.js`, implement `renderPunishments()`:
- Get punishments from `BingoEngine.getPunishments()`
- Filter to `completed === false`
- Render as cards with "Done ✓" button visible only to the victim or admin
- On Done click, call `BingoEngine.completePunishment(id)`

**Step 4:** Commit.

```bash
git add js/firebase-config.js js/bingo.js
git commit -m "feat(bingo): punishment tracking with Firebase, done button, feed integration"
```

---

### Task 9: Remove bingo from games.html

**Files:**
- Modify: `games.html` — remove bingo section HTML, bingo modals
- Modify: `js/games.js` — confirm bingo code already removed in Task 3
- Modify: `css/games.css` — confirm bingo styles already removed in Task 2

**Step 1:** In `games.html`, remove:
- The `<section id="bingo" ...>` block (the entire bingo panel)
- The `<div class="bingo-line-modal" ...>` block
- The `<div class="bingo-claim-modal" ...>` block
- The bingo tile from `.games-nav-grid` (if not already removed in Task 4)

**Step 2:** Verify games.html still works — the remaining panels (How It Works, Daily Games, Leaderboard) should be unaffected.

**Step 3:** Commit.

```bash
git add games.html
git commit -m "refactor: remove bingo section from games page (now standalone)"
```

---

### Task 10: Update service worker and final polish

**Files:**
- Modify: `sw.js` — add bingo files to cache, bump version
- Modify: `CLAUDE.md` — update file structure docs
- Modify: `css/nav.css` — ensure nav handles 6 items cleanly on mobile

**Step 1:** In `sw.js`, add to ASSETS array:
```javascript
'bingo.html',
'css/bingo.css',
'js/bingo.js',
```
Bump `CACHE_NAME` to next version.

**Step 2:** In `css/nav.css`, check that 6 nav items fit on mobile. May need to reduce font-size slightly or allow horizontal scroll on very small screens.

**Step 3:** Update `CLAUDE.md` file structure section to reflect new bingo files.

**Step 4:** Test locally:
```bash
cd "/c/Users/joe-o/OneDrive/Documents/30th Birthday Trip"
python -m http.server 5500
```
Verify:
- Bingo page loads at localhost:5500/bingo.html
- Grid renders, cells are tappable
- Claim drawer slides up
- Nav shows Bingo tab on all pages
- Games page no longer shows bingo
- Live feed shows bingo events

**Step 5:** Final commit and push.

```bash
git add -A
git commit -m "feat: bingo & live feed revamp complete — standalone page, claim drawer, punishments, cap reaction"
git push
```

---

## Task Summary

| Task | Description | Est. Size |
|------|------------|-----------|
| 1 | Create bingo.html page shell | Small |
| 2 | Extract + upgrade bingo CSS | Medium |
| 3 | Extract + upgrade bingo JS (claim drawer, photos, celebrations) | Large |
| 4 | Update nav across all pages | Small |
| 5 | Bingo notification dot | Small |
| 6 | Cap (🧢) reaction on live feed | Small |
| 7 | Rich bingo feed cards | Medium |
| 8 | Punishment tracking in Firebase | Medium |
| 9 | Remove bingo from games.html | Small |
| 10 | Service worker, polish, test | Small |

**Critical path:** Tasks 1-3 are sequential (page → styles → logic). Tasks 4-8 can be parallelised after Task 1. Task 9 depends on Tasks 1-3. Task 10 is last.
