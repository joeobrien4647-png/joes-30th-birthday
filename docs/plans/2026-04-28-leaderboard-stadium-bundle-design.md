# Leaderboard Stadium Bundle — Design

**Date:** 2026-04-28
**Status:** Approved
**Goal:** Make the leaderboard dramatically cooler for the trip starting 2026-04-29. Phone experience + a TV/projector "stadium" mode at the château.

## Scope

Seven features, shipped together:

1. Stadium Mode (`scoreboard.html`)
2. Live Overtake Drama (banner + sound + confetti)
3. Hot Streak / Comeback / Underdog tags
4. Live Ticker (in Stadium Mode)
5. Per-player Profile Cards
6. Daily MVP Crown
7. Push Overtake Alerts (if FCM is already wired; fallback otherwise)

## Architecture

**New files:**
- `scoreboard.html` — fullscreen TV page, no nav chrome
- `js/scoreboard.js` — panel cycling, theatrical events, audio
- `css/scoreboard.css` — TV-scale typography and layout

**Modified:**
- `js/games.js` — overtake detection, hot streak, comeback, MVP crown, profile modal, derived events
- `games.html` — profile card modal markup, MVP crown UI
- `js/firebase-config.js` — `leaderboard/positionHistory` path; push subscription if feasible
- `manifest.json` / service worker — push setup verification

Data flow unchanged. Firebase Realtime DB still owns all state. New code listens to the existing `leaderboardUpdate` event and fires derived events: `overtake`, `hotStreak`, `mvpChange`.

## Stadium Mode

Fullscreen page designed for a TV at the château. Auto-cycles every 12 seconds. Persistent ticker along the bottom (last 8 awards, scrolling).

| Panel | Content |
|---|---|
| Teams | 2×2 grid, huge team scores, leader pulses, position arrows |
| Top Players | 1–5 with 🥇🥈🥉, photos if uploaded, today's points |
| Daily Recap | Today's MVP, biggest single award, day's point total |
| Live Feed | Last 8 awards as full-screen list with relative timestamps |

**Theatrical interrupts** (pause the cycle, then resume):
- Overtake → 4s banner with team colour + crowd cheer + confetti
- +5 award → air horn + flash
- New #1 individual → "goal" sting

**Audio:** sound on by default, but browsers block autoplay. Solution: a single-screen "Tap to start" overlay on first load that unlocks the AudioContext and starts cycling. After that, everything plays normally. Mute toggle in the corner.

## Phone Enhancements

- **Overtake banner** — slides in from top when leader changes (4s, swipe to dismiss).
- **🔥 Hot Streak** — badge on player rows with 3+ awards in 15 min. Decays automatically.
- **🚀 Comeback** — badge if jumped 3+ positions since last render.
- **💪 Brave Last** — last-place team gets a defiant tag instead of fading.
- **👑 Daily MVP** — crown beside today's top individual scorer.
- **Profile card modal** — tap any player row → modal showing total, rank, category breakdown bar, last 5 awards, biggest single. Reuses existing `getIndividualCategoryBreakdown`.

## Push Notifications

When the current user's rank drops (someone overtakes them): *"⚡ Joe just stole 3rd from you!"*.

**Decision (2026-04-28): DEFERRED post-trip.**

Spike found FCM is fully wired (VAPID keys, `PushNotifications.subscribe()` API, `sw.js` push handler, `functions/index.js` Cloud Function pattern). Adding overtake-triggered push would require writing and deploying a new Cloud Function watching `leaderboard/pointsLog` for rank-change events — ~1-2 hours including test deploy. Skipped to land Tasks 1–7 polished rather than rushing 8.

Phone overtake banner (Task 5) covers in-app overtake hype. Push only matters for "when guest isn't on the app", which is rarer at a 6-day group trip than an in-app banner moment.

## Data Model

New Firebase path: `leaderboard/positionHistory` — most recent position-by-name and position-by-team. Used for overtake detection (compare new positions vs stored, fire event on diff).

Hot streak and comeback are computed client-side from `pointsLog` timestamps and the position diff — no new persistence.

## Out of Scope

- Reactions / emoji on awards (post-trip)
- Predictions / fantasy bets (post-trip)
- Photo wall integration with celebration moments (post-trip; existing photo wall stays as-is)
- Trash-talk team chat (post-trip)

## Open Questions

- FCM state — answered during implementation
- Whether to add a "demo mode" for testing theatrical events locally — yes, hidden admin-only button on Stadium page that fires fake overtakes/awards for setup verification

## Success Criteria

1. Open `scoreboard.html` on a Smart TV browser at the château, tap once, leave it running. It cycles, never freezes, plays sounds on overtakes.
2. On a guest's phone, awarding points to a different team triggers the overtake banner within 2 seconds (Firebase sync time).
3. Hot Streak / Comeback badges appear without manual refresh after the third qualifying award.
4. Tap any player row → see their stats card. Close it → back to leaderboard.
5. No regressions on the existing Teams / Individuals tabs or admin panel.

## Time Estimate

6–8 focused hours, parallelisable in places (Stadium Mode independent of phone enhancements). Push is the wildcard — could add 2 hours or be a day-after.
