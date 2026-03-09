# Bingo & Live Feed Revamp — Design Doc

> Date: 2026-03-09
> Status: Approved

## Problem

Bingo is buried inside the Games page. The grid is visually flat. There's no reason to keep coming back. The live feed exists but bingo events don't feel like moments. The two features are disconnected.

## Design Principles

- **Calm idle, punchy moments** — the page is a dashboard most of the time; animations fire on claims, lines, full house
- **Bingo drives the feed** — it's the only all-week game, so it becomes the engine that generates live feed content
- **Optional photo proof** — no friction, but incentivises richer feed items
- **Social pressure over moderation** — Cap (🧢) reaction + admin revoke, not formal approval flows

## Navigation

**New nav order:** Home | Schedule | **Bingo** | Games | Live Feed | Practical

- Bingo gets its own page: `bingo.html`
- Social page becomes "The Crew" — profiles/rooms/teams, moved to "More" dropdown
- Live Feed absorbs social posting features (messages, confessions, music, predictions)
- Red notification dot on Bingo nav tab when new claims since last visit

## Bingo Page Layout (bingo.html)

Top to bottom:

### 1. Hero Stats Bar
Compact, glanceable. 4 stat boxes:
- Your Claims (X/16)
- Your Lines
- Team Rank (1st–4th)
- Total Claims (X/16)

### 2. The Grid (4x4)
Each cell ~80px tall on mobile. States:
- **Unclaimed:** white/light card, challenge text readable, subtle opacity pulse every 3s
- **Claimed:** team colour fill at 15% opacity, solid team-colour left border, checkmark + claimer first name, tiny 📷 icon if photo attached
- **In-line:** glow animation on the 4 cells
- Tapping a claimed cell with photo opens lightbox

### 3. Claim Flow
1. Tap unclaimed cell → **claim drawer** slides up from bottom (not centered modal)
2. Shows challenge text + "Did you actually do this?"
3. Optional camera button — snap/pick a photo, or skip
4. "Claim it" → drawer closes → cell pops (scale 1.2x), fills with team colour, checkmark animates in
5. Phone vibrates (`navigator.vibrate(50)`)
6. Toast notification: "Nice! +1 point for [Team]"
7. Auto-posts to live feed (with photo if attached)

### 4. Line Completion
1. After claim, if line detected → 1s pause
2. Full-screen overlay: "YOU GOT A LINE!" + confetti burst
3. The 4 cells glow and pulse in sequence
4. Punishment picker: 3 face-down cards, flip to reveal on tap
5. Victim picker: grid of guest avatars
6. Confirmation: "[Victim] must: [punishment]"
7. Posted to feed + push notification to everyone

### 5. Full House
- Everything above dialled to 11
- Crown animation, screen shake, "KING/QUEEN OF THE CHATEAU"
- Gold feed card pinned at top of live feed for 24 hours

### 6. Points Guide (collapsible)
- Collapsed by default: "How points work ▸"
- Expands to tier table: claim +1 (first claim +3), line +10/15/20, house +50

### 7. Punishment Board
Active punishments as cards:
- "[Person] must: [punishment]" with "Pending" badge
- Victim sees "Done ✓" button → marks complete → posts to feed
- Admin (joe30) sees Done buttons for all
- Firebase path: `bingo/punishments/{id}` with `completed: bool`

### 8. Bingo Leaderboard (top 5)
- Name + team colour dot + claim count + line count
- Tap name → highlights their claimed cells in the grid briefly

### 9. Recent Activity (last 10 bingo events)
- Pulled from feed, filtered to bingo types
- Avatar + text + timestamp
- Tap to jump to that item in live feed

### 10. Admin Panel (joe30 only)
- Existing claim management (revoke/restore)
- Moved to bottom of page

## Live Feed Upgrades

### Bingo Claim Cards (new)
- Rich card with team-colour left border
- Challenge text + claimer name
- If photo: full-width image (Instagram-style)
- If no photo: category icon/illustration
- Reactions: existing ❤️ 😂 🔥 plus new 🧢 (Cap)

### Cap (🧢) Reaction
- "I don't believe you" — social, not mechanical
- If 5+ people cap a claim → "CAPPED" badge appears on the claim
- Admin can then revoke from bingo admin panel
- Funny, not aggressive

### Bingo Line Cards
- Gold border, bigger than normal feed items
- Shows the 4 challenges that made the line
- Shows punishment assignment
- "Done" button for victim to mark punishment complete

### Announcements
- Pinned to top of feed until dismissed
- Gradient background, stands out

### Everything Else
- Messages, confessions, music, photos, predictions — keep current design
- Ensure visual consistency with new bingo cards

## Data Model Changes

### New Firebase paths
- `bingo/punishments/{id}` — `{ guestCode, guestName, team, description, assignedBy, completed, completedAt, timestamp }`
- `bingo/claims/{idx}.photoUrl` — optional photo URL on claims
- `feed/{id}.capCount` — number of cap reactions
- `feed/{id}.caps.{guestCode}` — individual cap tracking

### New localStorage
- `bingLastSeen` — timestamp of last bingo page visit (for notification dot)

## Files to Create/Modify

### New
- `bingo.html` — new standalone page
- `css/bingo.css` — all bingo styles (extracted from games.css)
- `js/bingo.js` — all bingo UI logic (extracted from games.js)

### Modify
- `js/shared.js` — nav structure (add Bingo tab), notification dot logic
- `js/firebase-config.js` — BingoEngine: add photo support, punishment tracking
- `js/livefeed.js` — new bingo card rendering, cap reaction, pinned announcements
- `css/livefeed.css` — bingo card styles, cap badge
- `games.html` — remove bingo section (moved to own page)
- `js/games.js` — remove bingo code (moved to bingo.js)
- `css/games.css` — remove bingo styles (moved to bingo.css)
- `sw.js` — add bingo.html, css/bingo.css, js/bingo.js to cache
- `manifest.json` — no changes needed
- Nav HTML in all pages — add Bingo link

## Out of Scope
- AI-generated bingo items (stick with curated 16)
- Per-user bingo cards (shared grid is better for social interaction)
- Video proof (photo is enough)
- Formal claim approval flow (admin revoke + cap reaction is sufficient)
