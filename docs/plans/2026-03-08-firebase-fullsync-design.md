# Firebase Full Sync & Live Trip Experience

**Date:** 2026-03-08
**Status:** Approved

## Overview

Transform joes30.com from a localStorage-based static site into a real-time shared app powered by Firebase. Every interactive feature syncs across all 26 guests' devices. Bingo becomes a central game mechanic with a rewards/punishment engine. A unified Live Feed replaces the Social tab as the trip's heartbeat.

## Firebase Project

- **Project:** joes-30th
- **Database:** Realtime Database (europe-west1)
- **Storage:** Firebase Storage (for photos)
- **Functions:** Cloud Functions (for push notifications)
- **Plan:** Blaze (pay-as-you-go, free tier covers 26 users)

## 1. Firebase Data Architecture

### Synced via Firebase (shared across all devices)

```
/registrations/{code}        — team reveal data
/leaderboard/                — teamScores, individualScores, pointsLog, badges
/messages/                   — birthday messages + emoji reactions
/confessions/                — anonymous confessions + reactions
/music/                      — song requests + upvotes
/photos/{id}                 — photo metadata (images in Firebase Storage)
/predictions/                — "By 40 Joe will..." entries
/superlatives/               — trip award votes
/highlights/                 — daily highlight nominations + votes
/toasts/                     — speech sign-ups
/signups/{activityId}        — activity sign-ups (lock after 1 April)
/announcements/              — admin announcements (triggers push)
/admin/                      — admin state (team reveal, secret overrides)
/bingo/claims/{itemIndex}    — who claimed each bingo item + timestamp
/bingo/lines/{guestCode}     — lines completed + rewards chosen
/bingo/rewards/{id}          — reward/punishment events
/feed/                       — unified live feed entries
/subscriptions/{guestCode}   — push notification subscriptions
```

### Stays in localStorage (personal/device-specific)

- `guestCode` — logged-in user
- `darkMode`, `theme` — UI preferences
- `packingChecklist` — personal checklist
- `missionProgress` — personal missions
- `gestureHintSeen`, `countdownConfettiFired` — UI state

### Sync Pattern

Extend the existing Store.get/set interception in firebase-config.js. All synced keys go through Firebase with localStorage as fallback. Existing code requires minimal changes.

## 2. Bingo — Trip-Wide Game

### Card
- 4x4 grid (16 items), shared across all guests
- Each square shows challenge text when unclaimed
- Claimed squares flip to show claimant's name + timestamp
- Lines glow when completed

### Items (finalised)
1. Photobomb someone's photo without them noticing
2. Wear someone else's outfit for an entire meal
3. Do a blind taste test and get it right
4. Give a completely improvised 60-second motivational speech
5. Convince a local you're French (1 min+)
6. Swap shoes with someone for a whole activity
7. Get a conga line going with at least 5 people
8. Start a chant that the whole group joins
9. Get a genuine standing ovation from the group
10. Make someone laugh so hard they cry
11. Jump in the pool fully clothed (or push someone in)
12. Be the first up AND last to bed on the same day
13. Eat the spiciest thing you can find — straight face
14. Down a drink with no hands
15. Do the washing up without being asked
16. Take a photo so good the group votes it "photo of the trip"

### Points Integration
All bingo points flow into the same leaderboard as daily games, duties, and challenges.

| Milestone | Points | Reward/Punishment |
|-----------|--------|-------------------|
| 1st claim | +2 team | — |
| Any claim | +1 team | — |
| 1st line | +10 team | Pick someone: down their drink, French accent 30 min, clothes inside out, 5 compliments in a row, or 20 press-ups |
| 2nd line | +15 team | Pick someone: swap clothing item for the day, 60s serenade at dinner, wear a sign for 1hr, speak in song lyrics 30 min, eat something spicy straight-faced, or do impression of someone |
| 3rd line | +20 team | Pick someone: group makeover for 1hr, washing up duty, 2-min stand-up about themselves, mystery cocktail, or announce everything out loud for 1hr |
| Full house | +50 team | "King/Queen of the Chateau" — crown, pick music, pick who does chores, sit at head of table, choose afternoon activity, immunity from next punishment, everyone uses your chosen title for 24hrs |

### Live Feed Integration
Every bingo claim, line completion, and punishment is posted to the Live Feed with push notification for milestones.

### Auditing
Honour system + public feed. All claims visible in real-time. Group pressure handles policing. Anyone can call BS in person.

## 3. Admin Scoring Panel

### Access
- **Super admin:** Joe (JOE-7K9X)
- **Backup:** Sophie (SOPHIE-M3P2)
- Existing Auth.isAdmin() check, existing FAB button

### Mobile-First Scoring Flow
1. Tap FAB → **Score Points** or **Announcements**
2. Score Points → pick source: Game / Bingo / Duty / Bonus / Penalty
3. Pick team or individual (autocomplete from guest list)
4. Big tap buttons: +1, +2, +3, +5, +10, -1, custom
5. Optional reason text
6. Confirm → Firebase → instant update everywhere

### Announcements
- Type message → pick type (info/party/alert) → send
- Triggers push notification to all guests
- Appears as banner on site + in Live Feed

## 4. Activity Sign-ups

### Activities
- Golf (Thu AM) — Golf du Val de l'Indre
- Canoeing (Fri AM) — Canoe Decouverte
- Wine tasting (Fri PM) — Loire Valley Wine Tour
- Bellebouche (Sun PM) — Accrobranche + lake

### How It Works
- Card per activity: description, time, rough cost
- "I'm in" button → adds guest to Firebase
- Live headcount visible ("12/26 signed up")
- Guest list visible (who's going)
- Locks 1 April — button greys out after deadline
- Admin can manually add/remove people

## 5. Push Notifications

### Setup
- First visit → browser permission prompt
- Service worker handles push subscription
- Subscription stored in Firebase `/subscriptions/{guestCode}`
- Firebase Cloud Functions sends pushes

### Triggers
- Admin announcement → push to everyone
- Bingo line completed → push to everyone
- Points awarded → push to individual
- Activity sign-up closing soon → auto-reminder

## 6. Photo Wall

### Storage
- Firebase Storage (5GB free tier)
- Client-side compression (max 1200px wide, ~200KB)
- Metadata in Realtime Database `/photos/{id}`

### Features
- Upload from camera roll or take photo
- Optional caption
- Heart reactions
- Grid thumbnail gallery → tap to expand
- Sorted newest first
- No cap on uploads

## 7. Nav Restructure

### Before
Home | Schedule | Games | Social | Practical

### After
Home | Schedule | Live Feed | Games | Practical

### Live Feed (replaces Social)
Unified real-time timeline of everything:
- Bingo claims + milestones + punishments
- Points awarded
- Photo uploads
- Birthday messages
- Confessions
- Music requests
- Predictions
- Announcements
- Activity sign-up updates

### Games Tab Restructure
1. **Bingo** — hero position, top of page. Card, rewards tracker, mini leaderboard
2. **Leaderboard** — team standings, individual rankings, points log
3. **Daily Games** — today's games highlighted, previous days collapsed
4. **Chateau Duties** — rota and duty points

## 8. Shared Social Features (moved to Live Feed)

All move from localStorage → Firebase. Posted to Live Feed:
- Birthday messages + emoji reactions
- Confessions + reactions
- Music requests + upvotes
- Predictions
- Superlatives voting
- Daily highlights nominations + votes
- Toast sign-ups

## Security

### Firebase Realtime Database Rules
- `/registrations` — read: all, write: all (validated)
- `/leaderboard` — read: all, write: all
- `/bingo` — read: all, write: all
- `/messages`, `/confessions`, `/music`, `/photos`, `/predictions`, `/superlatives`, `/highlights`, `/toasts` — read: all, write: all
- `/signups` — read: all, write: conditional (before 1 April)
- `/announcements` — read: all, write: admin only
- `/admin` — read: all, write: admin only
- `/subscriptions` — read: admin, write: own code only
- Everything else — blocked

### Firebase Storage Rules
- `/photos/*` — read: all, write: authenticated (any guest code)
