# Firebase Full Sync & Live Trip Experience — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform joes30.com into a real-time shared app with Firebase sync, live feed, bingo rewards engine, admin scoring, push notifications, and photo sharing.

**Architecture:** Vanilla HTML/CSS/JS static site on GitHub Pages. Firebase Realtime Database for shared state, Firebase Storage for photos, Firebase Cloud Functions for push notifications. Existing Store.get/set interception pattern extends to all shared keys. New `livefeed.html` replaces `social.html` in nav.

**Tech Stack:** HTML5, CSS3, vanilla JS, Firebase Compat SDK v10.7.1 (already loaded), Firebase Storage, Firebase Cloud Functions (Node.js)

**Design doc:** `docs/plans/2026-03-08-firebase-fullsync-design.md`

---

## Phase 1: Firebase Infrastructure (extend sync to all shared features)

### Task 1.1: Extend firebase-config.js with full sync

**Files:**
- Modify: `js/firebase-config.js`

**Step 1:** Add all synced Firebase paths as constants and initialise listeners for each. The pattern already exists for leaderboard — replicate for messages, confessions, music, predictions, superlatives, highlights, toasts, bingo, feed, announcements.

Each synced collection needs:
- A local cache object
- A Firebase `.on('value')` listener that updates the cache
- A custom event dispatch on update (e.g. `messagesUpdate`, `feedUpdate`)

**Step 2:** Extend Store.get/set interception to cover all synced keys:
```
SYNCED_KEYS = [
  'lb_teamScores', 'lb_individualScores', 'lb_pointsLog', 'lb_badges',
  'birthdayMessages', 'messageReactions',
  'confessions', 'confessionReactions',
  'musicRequests',
  'predictions',
  'superlativeVotes',
  'dailyHighlights',
  'toastSignups',
  'activitySignups'
]
```

**Step 3:** Add helper functions for push-style writes (lists that need push IDs):
```javascript
window.FirebaseSync = {
  push: function(path, data) { ... },    // add to list
  set: function(path, data) { ... },     // overwrite
  update: function(path, data) { ... },  // merge
  remove: function(path, id) { ... },    // delete entry
  onUpdate: function(path, fn) { ... }   // listen
};
```

**Step 4:** Verify Firebase SDK is loaded on all pages (index.html, schedule.html, games.html, social.html, practical.html). Already done from previous session.

**Step 5:** Test by opening site in two browser tabs, writing to a synced key in one, confirming it appears in the other.

**Step 6:** Commit: "feat: extend Firebase sync to all shared features"

---

### Task 1.2: Update Firebase security rules

**Files:**
- Modify: `database.rules.json`

**Step 1:** Expand rules to cover all new paths:
```json
{
  "rules": {
    "registrations": { ".read": true, ".write": true },
    "leaderboard": { ".read": true, ".write": true },
    "messages": { ".read": true, ".write": true },
    "confessions": { ".read": true, ".write": true },
    "music": { ".read": true, ".write": true },
    "photos": { ".read": true, ".write": true },
    "predictions": { ".read": true, ".write": true },
    "superlatives": { ".read": true, ".write": true },
    "highlights": { ".read": true, ".write": true },
    "toasts": { ".read": true, ".write": true },
    "signups": { ".read": true, ".write": true },
    "announcements": { ".read": true, ".write": true },
    "admin": { ".read": true, ".write": true },
    "bingo": { ".read": true, ".write": true },
    "feed": { ".read": true, ".write": true },
    "subscriptions": { ".read": true, ".write": true },
    "$other": { ".read": false, ".write": false }
  }
}
```

**Step 2:** Deploy rules via Firebase Console (paste and publish) or `firebase deploy --only database` if CLI is authenticated.

**Step 3:** Commit: "chore: update Firebase security rules for all paths"

---

## Phase 2: Live Feed (replaces Social tab)

### Task 2.1: Create livefeed.html page

**Files:**
- Create: `livefeed.html`
- Create: `css/livefeed.css`
- Create: `js/livefeed.js`

**Step 1:** Create `livefeed.html` with the same shell as other pages (head, nav, scripts). Nav link: "Live Feed" replacing "Social".

**Step 2:** Page structure:
```html
<!-- Compose bar (top) -->
<div class="feed-compose">
  <button class="feed-compose-btn" data-type="message">Message</button>
  <button class="feed-compose-btn" data-type="photo">Photo</button>
  <button class="feed-compose-btn" data-type="confession">Confession</button>
  <button class="feed-compose-btn" data-type="music">Song Request</button>
  <button class="feed-compose-btn" data-type="prediction">Prediction</button>
</div>

<!-- Compose modal (shows form for selected type) -->
<div class="feed-compose-modal" id="composeModal">...</div>

<!-- Filter tabs -->
<div class="feed-filters">
  <button class="feed-filter active" data-filter="all">All</button>
  <button class="feed-filter" data-filter="bingo">Bingo</button>
  <button class="feed-filter" data-filter="scores">Scores</button>
  <button class="feed-filter" data-filter="photos">Photos</button>
  <button class="feed-filter" data-filter="social">Social</button>
  <button class="feed-filter" data-filter="announcements">Announcements</button>
</div>

<!-- Feed -->
<div class="feed-list" id="feedList"></div>
```

**Step 3:** CSS — card-based feed items, each with an icon badge (camera for photo, trophy for points, grid for bingo, megaphone for announcements, etc.), timestamp, guest avatar, and content. Newest at top. Smooth entry animation.

**Step 4:** JS — `livefeed.js`:
- Listen to `FirebaseSync.onUpdate('feed', renderFeed)`
- `renderFeed()` — sort by timestamp desc, render each item as a card
- Filter buttons filter by `item.type`
- Compose buttons open modal with appropriate form
- On submit, push to Firebase `/feed` AND to the specific collection (e.g. `/messages`)
- Reactions (heart, laugh, fire) on each feed item

**Step 5:** Feed item types and their rendering:
```javascript
var FEED_TYPES = {
  message:      { icon: '💬', label: 'Message', color: '#4CAF50' },
  confession:   { icon: '🤫', label: 'Confession', color: '#9C27B0' },
  music:        { icon: '🎵', label: 'Song Request', color: '#2196F3' },
  photo:        { icon: '📸', label: 'Photo', color: '#FF9800' },
  prediction:   { icon: '🔮', label: 'Prediction', color: '#E91E63' },
  bingo_claim:  { icon: '✅', label: 'Bingo', color: '#00BCD4' },
  bingo_line:   { icon: '🎯', label: 'BINGO LINE!', color: '#FF5722' },
  bingo_house:  { icon: '👑', label: 'FULL HOUSE!', color: '#FFD700' },
  points:       { icon: '🏆', label: 'Points', color: '#FFC107' },
  announcement: { icon: '📢', label: 'Announcement', color: '#F44336' },
  signup:       { icon: '✋', label: 'Sign-up', color: '#8BC34A' },
  punishment:   { icon: '😈', label: 'Punishment', color: '#FF5722' },
  reward:       { icon: '🎁', label: 'Reward', color: '#FFD700' }
};
```

**Step 6:** Test: post a message from one tab, see it appear in the feed on another tab.

**Step 7:** Commit: "feat: add Live Feed page replacing Social tab"

---

### Task 2.2: Update nav across all pages

**Files:**
- Modify: `index.html`
- Modify: `schedule.html`
- Modify: `games.html`
- Modify: `practical.html`
- Modify: `js/nav.js`

**Step 1:** Replace Social nav link with Live Feed on all pages:
```html
<a href="livefeed.html" class="nav-link">Live Feed</a>
```

**Step 2:** Keep `social.html` temporarily (redirect to `livefeed.html` via JS) so any cached/bookmarked links still work.

**Step 3:** Update `sw.js` cache list — add `livefeed.html`, `css/livefeed.css`, `js/livefeed.js`. Bump cache version.

**Step 4:** Commit: "feat: replace Social with Live Feed in nav"

---

## Phase 3: Bingo Overhaul

### Task 3.1: Bingo data model and Firebase integration

**Files:**
- Modify: `js/firebase-config.js` (add bingo helpers)
- Modify: `js/games.js` (rewrite bingo section)

**Step 1:** Define bingo items as a constant array (shared, not per-user):
```javascript
var BINGO_ITEMS = [
  'Photobomb someone\'s photo without them noticing',
  'Wear someone else\'s outfit for an entire meal',
  // ... all 16 items
];
```

**Step 2:** Firebase bingo structure:
```
/bingo/claims/{itemIndex} → { claimedBy, claimedByCode, timestamp }
/bingo/lines/{claimId} → { guestCode, guestName, lineType, lineIndex, rewardChosen, punishmentTarget, timestamp }
/bingo/rewards/{rewardId} → { type, from, to, description, timestamp }
```

**Step 3:** Add `window.BingoEngine` to firebase-config.js:
```javascript
window.BingoEngine = {
  claim: function(itemIndex, guestCode, guestName) { ... },
  getClaims: function() { ... },
  getClaimsForGuest: function(code) { ... },
  checkLines: function(code) { ... },  // returns array of completed lines
  completeLine: function(lineData) { ... },
  onUpdate: function(fn) { ... }
};
```

**Step 4:** Line detection logic — check all rows (4), columns (4), diagonals (2) = 10 possible lines. A line is complete when all 4 items in it are claimed by the same guest.

**Step 5:** Auto-award points on claim (+1 team, +2 for first claim). Auto-award line bonuses (+10/+15/+20/+50).

**Step 6:** Post to `/feed` on every claim and line completion.

**Step 7:** Commit: "feat: bingo data model and Firebase engine"

---

### Task 3.2: Bingo UI — card, claims, rewards

**Files:**
- Modify: `games.html` (restructure bingo section)
- Modify: `css/games.css` (bingo styles)
- Modify: `js/games.js` (bingo UI)

**Step 1:** Restructure games.html bingo panel. Bingo becomes the first/hero panel:
```html
<div class="bingo-hero">
  <h2>Trip Bingo</h2>
  <div class="bingo-stats">
    <span class="bingo-stat">You: 3/16</span>
    <span class="bingo-stat">Lines: 1</span>
    <span class="bingo-stat">Leader: Sophie (7)</span>
  </div>
  <div class="bingo-grid" id="bingoGrid">
    <!-- 4x4 grid of .bingo-cell -->
  </div>
  <div class="bingo-rewards" id="bingoRewards">
    <!-- Active rewards/punishments -->
  </div>
  <div class="bingo-feed" id="bingoFeed">
    <!-- Recent bingo activity -->
  </div>
</div>
```

**Step 2:** CSS for bingo grid:
- 4x4 grid with gap
- Each cell: rounded card, challenge text, flip animation on claim
- Claimed cells: show claimant avatar + name, green border
- YOUR claimed cells: gold border
- Line cells: glow/pulse animation
- Full house: rainbow border animation

**Step 3:** Claim flow:
- Tap unclaimed cell → confirmation modal ("Did you really do this?")
- Confirm → Firebase claim → cell flips → confetti burst
- If this completes a line → LINE modal with trumpet sound + reward picker
- Reward picker shows tier-appropriate options (line 1/2/3/full house)
- Pick reward → pick target person → confirm → push notification + feed post

**Step 4:** Bingo mini-leaderboard:
- Shows top 5 claimers
- Your position highlighted
- Lines completed count

**Step 5:** Bingo activity feed (last 10 events):
- "Sophie claimed #7 — 3 mins ago"
- "Joe got a LINE! Razon must down his drink"

**Step 6:** Games nav restructure — reorder panels: Bingo (hero) → Leaderboard → Daily Games → Rate the Chefs → How It Works. Remove old bingo panel.

**Step 7:** Test: claim items in two tabs, verify real-time sync, line detection, reward flow.

**Step 8:** Commit: "feat: bingo UI with card, claims, rewards, and punishments"

---

## Phase 4: Admin Scoring Panel

### Task 4.1: Mobile-first scoring drawer

**Files:**
- Modify: `js/shared.js` (admin panel rewrite)
- Modify: `css/components.css` (admin drawer styles)

**Step 1:** Rewrite the admin FAB drawer. Two main actions:
```
[⚙️ FAB]
  → Score Points
  → Send Announcement
  → Manage (team reveal, unlock secrets)
```

**Step 2:** Score Points flow — full-screen mobile drawer:
```html
<div class="admin-score-drawer">
  <!-- Step 1: Source -->
  <div class="score-step" data-step="source">
    <h3>What's it for?</h3>
    <button data-source="game">Game</button>
    <button data-source="bingo">Bingo</button>
    <button data-source="duty">Duty</button>
    <button data-source="bonus">Bonus</button>
    <button data-source="penalty">Penalty</button>
  </div>

  <!-- Step 2: Who -->
  <div class="score-step" data-step="who">
    <h3>Who?</h3>
    <div class="score-toggle">
      <button data-mode="team">Team</button>
      <button data-mode="individual">Individual</button>
    </div>
    <!-- Team: 4 big team buttons -->
    <!-- Individual: autocomplete search of guest names -->
  </div>

  <!-- Step 3: Points -->
  <div class="score-step" data-step="points">
    <h3>Points</h3>
    <div class="points-grid">
      <button>+1</button>
      <button>+2</button>
      <button>+3</button>
      <button>+5</button>
      <button>+10</button>
      <button>-1</button>
      <button class="custom">Custom</button>
    </div>
    <input placeholder="Reason (optional)">
  </div>

  <!-- Step 4: Confirm -->
  <div class="score-step" data-step="confirm">
    <div class="score-summary">+5 to Titans for Game: Petanque</div>
    <button class="confirm-btn">Award Points</button>
  </div>
</div>
```

**Step 3:** Big tap targets (min 48px), swipeable steps, clear visual feedback. Works one-handed on phone.

**Step 4:** On confirm → write to Firebase leaderboard + points log + feed. Push notification to affected person/team.

**Step 5:** Announcement flow — text input, type picker (info/party/alert), send button. Writes to `/announcements` and `/feed`. Triggers push notification via Cloud Function.

**Step 6:** Test: award points from phone, verify leaderboard updates on another device.

**Step 7:** Commit: "feat: mobile-first admin scoring panel"

---

## Phase 5: Activity Sign-ups

### Task 5.1: Activity sign-up cards

**Files:**
- Modify: `schedule.html` (add sign-up section)
- Modify: `js/schedule.js` (sign-up logic)
- Modify: `css/schedule.css` (sign-up styles)

**Step 1:** Add activity sign-up section to schedule.html:
```html
<div class="signups-section">
  <h2>Activity Sign-ups</h2>
  <p class="signup-deadline">Sign up by 1 April to secure your spot</p>
  <div class="signup-cards" id="signupCards"></div>
</div>
```

**Step 2:** Activity data:
```javascript
var ACTIVITIES = [
  { id: 'golf', name: 'Golf', day: 'Thu 30 Apr AM', desc: '9 holes at Golf du Val de l\'Indre', cost: '~€65/person', icon: '⛳' },
  { id: 'canoe', name: 'Canoeing', day: 'Fri 1 May AM', desc: 'Creuse river from Ciron', cost: '~€15-18/person', icon: '🛶' },
  { id: 'wine', name: 'Wine Tasting', day: 'Fri 1 May PM', desc: 'Private sommelier at the chateau', cost: 'TBC', icon: '🍷' },
  { id: 'bellebouche', name: 'Bellebouche', day: 'Sun 3 May PM', desc: 'Accrobranche + lake activities', cost: '~€20/person', icon: '🌲' }
];
```

**Step 3:** Each card renders:
- Activity name, icon, day, description, cost
- "I'm In" / "I'm Out" toggle button
- Live headcount ("12/26 going")
- Expandable guest list (who's signed up)
- After 1 April: button disabled, "Sign-ups closed" message

**Step 4:** Firebase path: `/signups/{activityId}/{guestCode}` → `{ name, timestamp }`

**Step 5:** Post to feed when someone signs up ("Joe signed up for Golf — 14 going!")

**Step 6:** Admin can see full roster and manually add/remove people.

**Step 7:** Test: sign up from two devices, verify headcount syncs.

**Step 8:** Commit: "feat: activity sign-up cards with Firebase sync"

---

## Phase 6: Push Notifications

### Task 6.1: Service worker push handling

**Files:**
- Modify: `sw.js` (add push event handler)
- Modify: `js/firebase-config.js` (subscription management)

**Step 1:** Add push event listener to sw.js:
```javascript
self.addEventListener('push', function(event) {
  var data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'joes30.com', {
      body: data.body || '',
      icon: '/images/icon-192.png',
      badge: '/images/badge-72.png',
      data: { url: data.url || '/' }
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
```

**Step 2:** Add subscription management to firebase-config.js:
```javascript
window.PushManager = {
  subscribe: function(guestCode) {
    // Request permission
    // Get subscription from service worker
    // Store subscription in Firebase /subscriptions/{guestCode}
  },
  isSubscribed: function() { ... }
};
```

**Step 3:** Prompt for notification permission on first login (not on page load — wait until guest code is set).

**Step 4:** Commit: "feat: service worker push notification handling"

---

### Task 6.2: Firebase Cloud Function for sending pushes

**Files:**
- Create: `functions/package.json`
- Create: `functions/index.js`

**Step 1:** Initialise Cloud Functions project:
```bash
cd "30th Birthday Trip"
mkdir functions
cd functions
npm init -y
npm install firebase-admin firebase-functions web-push
```

**Step 2:** Cloud Function that triggers on new announcements:
```javascript
exports.sendPush = functions.database
  .ref('/announcements/{id}')
  .onCreate(async (snapshot, context) => {
    // Read all subscriptions from /subscriptions
    // Send web push to each
  });
```

**Step 3:** Additional triggers:
- `/bingo/lines/{id}` → push "X got a BINGO LINE!" to everyone
- `/feed/{id}` where type === 'points' → push to affected individual

**Step 4:** Generate VAPID keys for web push, store in Firebase config.

**Step 5:** Deploy: `firebase deploy --only functions`

**Step 6:** Test: send announcement from admin panel, verify push arrives on phone.

**Step 7:** Commit: "feat: Cloud Functions for push notifications"

---

## Phase 7: Photo Wall

### Task 7.1: Firebase Storage photo uploads

**Files:**
- Modify: `js/livefeed.js` (photo compose form)
- Modify: `js/firebase-config.js` (storage helpers)

**Step 1:** Add Firebase Storage SDK to all pages (add script tag):
```html
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-storage-compat.js"></script>
```

**Step 2:** Add photo helpers to firebase-config.js:
```javascript
window.PhotoStorage = {
  upload: function(file, guestCode, caption) {
    // Compress image client-side (max 1200px, JPEG 0.7 quality)
    // Upload to Firebase Storage: photos/{timestamp}_{guestCode}.jpg
    // Save metadata to /photos/{id}: { url, caption, guestCode, guestName, timestamp }
    // Post to /feed: { type: 'photo', ... }
  },
  getAll: function() { ... },
  onUpdate: function(fn) { ... }
};
```

**Step 3:** Client-side compression using canvas:
```javascript
function compressImage(file, maxWidth, quality) {
  return new Promise(function(resolve) {
    var img = new Image();
    img.onload = function() {
      var canvas = document.createElement('canvas');
      var scale = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };
    img.src = URL.createObjectURL(file);
  });
}
```

**Step 4:** Photo compose form in Live Feed:
- Camera icon button
- Opens file picker (accept="image/*", capture="environment" for phone camera)
- Preview thumbnail before upload
- Optional caption
- Upload button with progress indicator

**Step 5:** Photo feed items show the image inline (thumbnail) with tap-to-expand.

**Step 6:** Photo gallery view — accessible via filter tab "Photos" on Live Feed. Grid of thumbnails.

**Step 7:** Firebase Storage rules (set in Firebase Console → Storage → Rules):
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /photos/{allPaths=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

**Step 8:** Test: upload photo from phone, verify it appears on another device.

**Step 9:** Commit: "feat: photo wall with Firebase Storage"

---

## Phase 8: Migrate Existing Social Features to Firebase

### Task 8.1: Birthday messages sync

**Files:**
- Modify: `js/livefeed.js`

**Step 1:** The message compose form posts to both `/messages/{id}` and `/feed/{id}`.

**Step 2:** Reactions stored at `/messages/{id}/reactions/{emoji}` (count) and `/messages/{id}/userReactions/{guestCode}` (which emoji they picked).

**Step 3:** Remove old localStorage-only message code from social.js.

**Step 4:** Commit: "feat: migrate birthday messages to Firebase"

---

### Task 8.2: Confessions, music requests, predictions sync

**Files:**
- Modify: `js/livefeed.js`

**Step 1:** Each compose type writes to its own Firebase collection AND to `/feed`:
- Confession → `/confessions/{id}` + `/feed/{id}` (anonymous: show "Anonymous" not guest name)
- Music request → `/music/{id}` + `/feed/{id}` (song + artist fields, upvote button)
- Prediction → `/predictions/{id}` + `/feed/{id}` ("By 40, Joe will..." format)

**Step 2:** Upvotes on music requests: `/music/{id}/upvotes` (count) + `/music/{id}/upvoters/{guestCode}`

**Step 3:** Commit: "feat: migrate confessions, music, predictions to Firebase"

---

### Task 8.3: Superlatives and toast sign-ups

**Files:**
- Modify: `js/livefeed.js` or `js/games.js` (superlatives may stay in games)

**Step 1:** Superlatives voting — categories defined in code, votes stored at `/superlatives/{category}/{guestCode}` → votedFor.

**Step 2:** Toast sign-ups — `/toasts/{guestCode}` → { name, topic, timestamp }. Display as a list on schedule or live feed.

**Step 3:** Commit: "feat: migrate superlatives and toasts to Firebase"

---

## Phase 9: Final Polish

### Task 9.1: Update sw.js cache

**Files:**
- Modify: `sw.js`

**Step 1:** Add all new files to cache list. Bump version.

**Step 2:** Add firebase-storage-compat.js to cache list.

**Step 3:** Commit: "chore: update service worker cache for new features"

---

### Task 9.2: Clean up old social.html

**Files:**
- Modify: `social.html` (redirect to livefeed.html)

**Step 1:** Replace social.html content with a redirect:
```html
<script>window.location.replace('livefeed.html');</script>
```

**Step 2:** Keep crew/rooms view accessible — move to its own section on practical.html or as a panel within Live Feed.

**Step 3:** Commit: "chore: redirect social.html to Live Feed"

---

### Task 9.3: Test end-to-end

**Steps:**
1. Open site on two devices (or two browsers)
2. Log in as different guests
3. Test bingo claim → verify real-time sync + line detection + reward picker
4. Test admin scoring → verify leaderboard updates everywhere
5. Test activity sign-up → verify headcount syncs
6. Test photo upload → verify appears in feed on other device
7. Test announcement → verify push notification arrives
8. Test all compose types in Live Feed
9. Test on mobile (375px) — all modals, drawers, grids work

**Step 4:** Commit: "chore: final polish and testing"

---

## Execution Order

| Phase | Dependency | Est. Size |
|-------|-----------|-----------|
| 1. Firebase Infrastructure | None | Medium |
| 2. Live Feed | Phase 1 | Large |
| 3. Bingo Overhaul | Phase 1, 2 | Large |
| 4. Admin Scoring | Phase 1 | Medium |
| 5. Activity Sign-ups | Phase 1 | Small |
| 6. Push Notifications | Phase 1, 4 | Medium |
| 7. Photo Wall | Phase 1, 2 | Medium |
| 8. Social Migration | Phase 1, 2 | Medium |
| 9. Final Polish | All above | Small |

Phases 4 and 5 can run in parallel with Phase 3. Phase 8 can run in parallel with Phases 6 and 7.
