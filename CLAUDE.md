# Joe's 30th Birthday Trip - Project Guide

## Overview
A comprehensive static website for Joe O'Brien's 30th birthday trip to **Chateau Roussignol, Loire Valley, France** (Wed 29 Apr - Mon 4 May 2026). The site serves as the central hub for 26 guests covering logistics, activities, games, and social features.

## Tech Stack
- **Vanilla HTML5, CSS3, JavaScript** - No frameworks
- **Firebase Realtime Database** for cross-device data sync
- **CSS Custom Properties** for theming (4 themes: france, wine, sunset, disco)
- **Web Audio API** for soundboard
- **FileReader API** for photo uploads
- Hosted on **GitHub Pages** at **joes30.com**

## File Structure
```
index.html          - Home/dashboard page
schedule.html       - 6-day agenda
games.html          - Games & challenges
bingo.html          - Trip bingo
social.html         - Social features (messages, photos, music)
livefeed.html       - Live feed / confessions
practical.html      - Practical info, FAQ, packing
crew.html           - Guest profiles
trailer.html        - Cinematic trailer (self-contained)
js/shared.js        - Shared guest data, teams, Firebase config
js/home.js          - Home page logic
js/schedule.js      - Schedule page logic
js/games.js         - Games page logic
js/bingo.js         - Bingo logic
js/social.js        - Social features logic
js/livefeed.js      - Live feed logic
js/practical.js     - Practical info logic
css/base.css        - Base/shared styles
css/schedule.css    - Schedule styles
css/games.css       - Games styles
css/bingo.css       - Bingo styles
css/social.css      - Social styles
css/livefeed.css    - Live feed styles
css/practical.css   - Practical info styles
css/components.css  - Shared component styles
images/             - Chateau photos, guest photos
```

## Architecture Patterns
- **Multi-page static site**: Each section is its own HTML page with dedicated JS/CSS
- **Shared module**: `js/shared.js` loaded on every page — contains guest data, teams, Firebase config, theme switcher, navigation
- **Firebase sync**: All interactive data (leaderboard, messages, photos, votes) syncs across devices via Firebase Realtime Database (EU region)
- **XSS prevention**: `escapeHtml()` function used throughout
- **Admin access**: Locked to codes `JOE-7K9X`, `SOPHIE-M3P2`, `HANNAH-8FJ3` (checks against `localStorage.getItem('guestCode')`)
- **Date-locked content**: `.top-secret` items unlock based on `data-unlock` attribute dates

## Guest Login System
Guests pick their name from a dropdown and click "That's Me!" — no codes are typed. The codes below are internal identifiers stored in `localStorage.guestCode`. Guest data is defined in the `PLAYERS` object in `js/shared.js`.

### Login Flow
1. Site loads -> Loading screen -> Guest name picker dropdown
2. Guest selects their name -> clicks "That's Me!" -> Dashboard appears with team/missions/stats
3. Code stored in `localStorage.guestCode`

### All Guest Codes
| Code | Name | Room | Team |
|------|------|------|------|
| JOE-7K9X | Joe O'Brien | Master Suite | Titans |
| SOPHIE-M3P2 | Sophie Geen | Master Suite | Spartans |
| LUKE-4WN8 | Luke Recchia | Room 2 | Vikings |
| SAM-R6DQ | Samantha Recchia | Room 2 | Titans |
| HANNAH-8FJ3 | Hannah O'Brien | Room 3 | Vikings |
| ROBIN-2VL5 | Robin Hughes | Room 3 | Titans |
| JOHNNY-9XT4 | Johnny Gates O'Brien | Room 4 | Gladiators |
| FLORRIE-5HK7 | Florrie Gates O'Brien | Room 4 | Spartans |
| RAZON-3BM6 | Razon Mahebub | Room 5 | Spartans |
| NEEVE-6PW2 | Neeve Fletcher | Room 5 | Vikings |
| GEORGE-1CY9 | George Heyworth | Room 6 | Vikings |
| EMMAW-8RJ4 | Emma Winup | Room 6 | Gladiators |
| TOM-5QL7 | Tom Heyworth | Room 7 | Gladiators |
| ROBERT-2NG8 | Robert Winup | Room 7 | Spartans |
| SARAH-4KV3 | Sarah Shamia | Room 8 (solo) | Gladiators |
| KIRAN-7DX1 | Kiran Ruparelia | Room 9 | Titans |
| CHRIS-2FM7 | Chris Coggin | Room 9 | Titans |
| SHANE-9FH6 | Shane Pallian | Room 12 | Spartans |
| OLI-3WT5 | Oli Moran | Room 10 | Vikings |
| PETER-6BN2 | Peter London | Room 10 | Gladiators |
| EMMAL-1RK8 | Emma Levett | Room 11 | Titans |
| JONNYL-4VP9 | Jonny Levett | Room 11 | Vikings |
| JONNYW-8HQ3 | Jonny Williams | Room 12 | Spartans |
| OSCAR-5DL4 | Oscar Walters | Room 12 | Titans |
| PRANAY-9WX6 | Pranay Dube | Room 12 | Gladiators |
| MATT-3B7K | Matt Hill | Room 12 | Spartans |

## Four Teams (2 × 7 + 2 × 6 = 26 total)
| Team | Colour | Captain | Members |
|------|--------|---------|---------|
| **Titans** | Gold `#f9a825` | Joe | Sam, Robin, Emma L, Kiran, Oscar, Chris |
| **Spartans** | Red `#c62828` | Razon | Sophie, Robert, Florrie, Shane, Jonny W, Matt Hill |
| **Vikings** | Blue `#1565c0` | Hannah | Luke, George, Neeve, Oli, Jonny L |
| **Gladiators** | Black `#424242` | Peter | Johnny, Tom, Sarah, Emma W, Pranay |

- Teams revealed via rigged spin-the-wheel on first registration (not date-locked)
- Team data in `PLAYERS` and `TEAM_CONFIG` objects in `js/shared.js`
- `localStorage.teamRevealed_[code]` tracks whether guest has spun
- Couples deliberately split across teams

## Travel Arrangements
**Flying from London Stansted to Poitiers:**
- Outbound: Wed 29 Apr, depart 5:55 AM, arrive 8:25 AM
- Return: Mon 4 May, depart ~4:15 PM, arrive ~5:40 PM
- Some guests making their own way (driving): Luke & Sam, Johnny & Florrie, George & Emma W, Emma L & Jonny L, Pranay

## Top Secret / Date-Locked Items
Items with class `.top-secret` and `data-unlock` attribute:
- **Day 1 (2026-04-29)**: Team Reveal & Ice Breaker Games
- **Day 4 (2026-05-02)**: Birthday Olympics, The Roast of Joe, Awards Ceremony & Photo Booth

Admin override: Click a secret item 5 times to reveal (for testing).

## Leaderboard Points System
- **Team scores** and **individual scores** synced via Firebase
- Individual points automatically add to that person's team total
- Admin panel only visible to `JOE-7K9X`, `SOPHIE-M3P2`, `HANNAH-8FJ3` logins
- Quick award buttons: Game Win (+5), Runner Up (+3), Participation (+2), Bonus (+1), Challenge Champ (+10), Penalty (-1)

## Games Points Structure
### Daily Games (Days 1-5)
- Team games: +3 to +10 pts
- Individual games: +2 to +5 pts
- Birthday Olympics (Day 4): +10 pts

### Chateau Duties
- Cooking: +3, Clean-up: +2, Shopping: +3, Breakfast: +3
- BBQ: +3, Drinks run: +2, Bins: +2, Designated Driver: +5, Decorating: +3

### All-Week Challenges
- Photo of Day: +2/day, Early Bird: +1/day, Night Owl: +1/day
- French speaking: +1/-1, Pool Dip Streak: +5 bonus
- Good Sport Award: +5, Funniest Moment: +1/day

## Agenda (Finalized)
### Day 1 - Wed 29 Apr: Travel Day (Flights)
- 2:00 AM: Leave for Stansted
- 5:55 AM: Depart London Stansted
- 8:25 AM: Land at Poitiers Airport
- ~10:30 AM: Arrive at Château Roussignol (check-in 10:30am)
- Afternoon: Shops run, explore, first pool dip
- 7:00 PM: Party & drinking games
- 8:30 PM: Welcome BBQ
- 10:00 PM: TOP SECRET (Team Reveal)

### Day 2 - Thu 30 Apr: First Full Day
- Morning: Golf (optional) / Yoga / Sleep in
- Afternoon: Pool & chill
- 7:30 PM: Team dinner + evening games

### Day 3 - Fri 1 May: Adventure Day
- 10:00 AM: Canoe team race on the Creuse
- 1:00 PM: Lunch & explore Angles-sur-l'Anglin
- 4:00 PM: Pool & chill
- 8:00 PM: Team dinner + pre-birthday eve

### Day 4 - Sat 2 May: THE BIG DAY
- 9:00 AM: Birthday breakfast
- 10:30 AM: Birthday Olympics (TOP SECRET)
- 1:00 PM: Birthday BBQ + pool party
- 5:00 PM: 90s Icons costumes on
- 7:00 PM: Birthday dinner
- 9:00 PM: Toasts, cake, awards (TOP SECRET)
- 10:15 PM: 90s ICONS PARTY!

### Day 5 - Sun 3 May: Last Full Day
- 10:00 AM: Lazy brunch
- 1:00 PM: Bellebouche (accrobranche, mini golf, pédalos)
- 7:30 PM: Last dinner together
- 11:00 PM: Outdoor cinema

### Day 6 - Mon 4 May: Au Revoir
- 8:00 AM: Last breakfast
- 9:00 AM: Pack up & big clean
- 10:30 AM: Group photo, depart
- 4:15 PM: Fly Poitiers → Stansted (~5:40 PM)

## Key localStorage Keys
| Key | Purpose |
|-----|---------|
| `guestCode` | Current logged-in guest |
| `missionProgress` | Secret mission completion |
| `lb_teamScores` | Team leaderboard scores |
| `lb_individualScores` | Individual scores |
| `lb_pointsLog` | Points history log |
| `challengeStatuses` | Which challenges are marked done |
| `packingChecklist` | Checked packing items |

## Important Notes
- Most interactive data syncs via Firebase Realtime Database. localStorage used for local preferences and caching.
- Guest codes are in plain text in the JS. This is fine for a friend group trip site but not production security.
- GitHub Pages serves the site at joes30.com (custom domain).

## Running Locally
```bash
cd "c:\Users\joe-o\OneDrive\Documents\30th Birthday Trip"
python -m http.server 5500
# Visit http://localhost:5500
```
Note: Port 3000 is used by another app on this machine.
