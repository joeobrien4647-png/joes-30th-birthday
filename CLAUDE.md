# Joe's 30th Birthday Trip - Project Guide

## Overview
A comprehensive static website for Joe O'Brien's 30th birthday trip to **Chateau Roussignol, Loire Valley, France** (Wed 29 Apr - Mon 4 May 2026). The site serves as the central hub for 27 guests covering logistics, activities, games, and social features.

## Tech Stack
- **Vanilla HTML5, CSS3, JavaScript** - No frameworks
- **localStorage** for all data persistence
- **CSS Custom Properties** for theming (dark mode + 4 themes: france, wine, sunset, disco)
- **Web Audio API** for soundboard
- **FileReader API** for photo uploads
- Hosted on **GitHub Pages** (repo: joeobrien4647-png/joes-30th-birthday)

## File Structure
```
index.html    - Main site (~2800+ lines, all sections)
styles.css    - All styles (~6000+ lines)
script.js     - All JavaScript (~3500+ lines)
images/       - Chateau photos (chateau_4-8.jpeg)
ACTIVITY-RESEARCH.md - Detailed activity research document
```

## Architecture Patterns
- **Modular init functions**: Every feature has an `init*()` function called from `DOMContentLoaded`
- **localStorage keys**: Each feature uses its own key (e.g., `lb_teamScores`, `tripPrefs_joe30`, `missionProgress`)
- **XSS prevention**: `escapeHtml()` function used throughout (defined locally in multiple functions)
- **Admin access**: Locked to `joe30` login (checks `localStorage.getItem('guestCode') === 'joe30'`)
- **Date-locked content**: `.top-secret` items unlock based on `data-unlock` attribute dates

## Guest Login System
Each guest has a unique code (format: `firstname30` or `firstnamelastinit30`). Login codes are defined in `GUEST_DATA` object inside `initGuestLogin()`.

### Login Flow
1. Site loads -> Loading screen -> Password modal (site password) -> Guest login modal
2. Guest enters their code -> Dashboard appears with missions/stats
3. "Skip" option available to browse as guest
4. Stored in `localStorage.guestCode`

### All Guest Codes
| Code | Name | Room | Team |
|------|------|------|------|
| joe30 | Joe O'Brien | Master Suite | Champagne |
| sophie30 | Sophie Geen | Master Suite | Champagne |
| luke30 | Luke Recchia | Room 2 | Bordeaux |
| sam30 | Samantha Recchia | Room 2 | Bordeaux |
| hannah30 | Hannah O'Brien | Room 3 | Champagne |
| robin30 | Robin Hughes | Room 3 | Rose |
| johnny30 | Johnny Gates O'Brien | Room 4 | Bordeaux |
| florrie30 | Florrie Gates O'Brien | Room 4 | Rose |
| razon30 | Razon Mahebub | Room 5 | Champagne |
| neeve30 | Neeve Fletcher | Room 5 | Bordeaux |
| george30 | George Heyworth | Room 6 | Rose |
| emmaw30 | Emma Winup | Room 6 | Champagne |
| tom30 | Tom Heyworth | Room 7 | Bordeaux |
| robert30 | Robert Winup | Room 7 | Rose |
| sarah30 | Sarah | Room 8 | Champagne |
| kiran30 | Kiran Ruparelia | Room 8 | Bordeaux |
| shane30 | Shane Pallian | Room 9 | Rose |
| oli30 | Oli Moran | Room 9 | Champagne |
| peter30 | Peter London | Room 10 | Bordeaux |
| emmal30 | Emma Levett | Room 10 | Rose |
| jonnyl30 | Jonny Levett | Room 11 | Champagne |
| jonnyw30 | Jonny Williams | Room 11 | Bordeaux |
| will30 | Will Turner | Room 12 | Rose |
| chris30 | Chris Coggin | Room 12 | Champagne |
| oscar30 | Oscar Walters | Room 13 | Bordeaux |
| matt30 | Matt Hill | Room 13 | Rose |
| pranay30 | Pranay Dube | Room 14 | Champagne |

## Three Teams
- **Team Champagne** (~10 members): Joe, Sophie, Hannah, Razon, Emma W, Sarah, Oli, Jonny L, Chris, Pranay
- **Team Bordeaux** (~10 members): Luke, Sam, Johnny, Neeve, Tom, Kiran, George, Peter, Jonny W, Oscar
- **Team Rose** (~7 members): Robin, Florrie, Robert, Emma L, Shane, Will, Matt

## Travel Arrangements
**Main convoy from Sevenoaks (17 people, 2x 9-seater vans):**
Joe, Sophie, Hannah, Robin (maybe), Razon, Neeve, Tom, Robert, Sarah, Kiran, Shane, Oli, Pete, Jonny Williams, Chris Coggin, Oscar, Matt

**Making their own way:**
Luke & Sam, Johnny & Florrie, George & Emma W, Emma L & Jonny L, Will, Pranay

## Payment Status (from spreadsheet)
- **Confirmed & Paid**: Rooms 1-12 + Chris Coggin (24 people)
- **Confirmed but not paid**: Oscar Walters
- **Unconfirmed**: Matt Hill, Pranay Dube

## All Sections/Features (in page order)

### Core
1. **Loading Screen** - Animated balloons + loading bar
2. **Password Protection** - Site-wide password gate
3. **Guest Login** - Personal codes, unlocks dashboard
4. **Personal Dashboard** - Secret missions, team/nickname/room, personal notes
5. **Navigation** - Sticky nav with "Fun" and "More" dropdowns
6. **Hero** - Countdown timer to Apr 29 2026, hero buttons
7. **Floating Balloons** - Decorative animated balloons

### Planning
8. **Agenda** - 6-day tabbed schedule (Day 1 updated with real Sevenoaks travel plan)
9. **Games & Challenges** - Daily games, chateau duties (with points), all-week challenges
10. **Leaderboard** - Team scores, individual rankings, points log, admin panel (joe30 only)
11. **Itinerary Comparison** - 3 options (Chill/Adventure/Balanced) with voting
12. **Crew Profiles** - Guest cards with photos/bios
13. **Trip Preferences** - Travel method, activity interests, duty volunteering (replaced RSVP)

### Games & Fun
14. **Quiz** - "How Well Do You Know Joe?" with leaderboard
15. **Drinking Games** - Game rules cards
16. **Spin the Wheel** - 4 categories (drinking, cooking, activity, dare)
17. **Trip Bingo** - Randomized bingo cards
18. **Predictions Wall** - "By 40, Joe will..."
19. **Superlatives Voting** - Vote for trip awards
20. **Scavenger Hunt** - Photo scavenger hunt checklist
21. **Confessions Wall** - Anonymous confessions with reactions
22. **Joe's 30 Year Timeline** - Life milestones, user-addable
23. **Soundboard** - Web Audio API generated sounds
24. **Confetti Cannon** - Fixed button triggers confetti

### Social
25. **Birthday Messages** - Message wall for Joe
26. **Memory Timeline** - Shared memories with years
27. **Music Requests** - Song request + upvote system
28. **Photo Wall** - Photo upload with captions (limited to 20)
29. **Daily Highlights** - Per-day highlight voting
30. **Toast Sign-ups** - Sign up for birthday speeches
31. **Facts Ticker** - Scrolling "fun facts about Joe" bar

### Practical
32. **Info Section** - Venue details, what to bring
33. **Payment Tracker** - Track who's paid
34. **Expense Splitter** - Split shared costs
35. **Currency Converter** - GBP to EUR
36. **French Phrases** - Useful phrases
37. **Weather Widget** - Loire Valley late April forecast
38. **Packing Checklist** - Checkable packing list
39. **Travel Plans** - Guest travel info sharing
40. **Activity Sign-ups** - Sign up for activities
41. **FAQ** - Accordion FAQ section
42. **Copy Link** - Share site link

### Settings
43. **Dark Mode** - Toggle light/dark
44. **Theme Switcher** - France, Wine, Sunset, Disco themes

## Top Secret / Date-Locked Items
Items with class `.top-secret` and `data-unlock` attribute:
- **Day 1 (2026-04-29)**: Team Reveal & Ice Breaker Games
- **Day 4 (2026-05-02)**: Birthday Olympics, The Roast of Joe, Awards Ceremony & Photo Booth

Admin override: Click a secret item 5 times to reveal (for testing).

## Leaderboard Points System
- **Team scores** stored in `lb_teamScores` (localStorage)
- **Individual scores** stored in `lb_individualScores`
- **Points log** stored in `lb_pointsLog`
- Individual points automatically add to that person's team total
- Admin panel only visible to `joe30` login
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

## Agenda (Current - Day 1 finalized)
### Day 1 - Wed 29 Apr: Travel Day
- 7:00 AM: Meet at Joe's, Sevenoaks
- 7:30 AM: Depart (2x 9-seater vans)
- ~9:30 AM: Channel crossing (tunnel/ferry TBC)
- ~12:30 PM: Lunch stop in France
- ~3:30 PM: Arrive at Chateau Roussignol
- 5:00 PM: Unpack & explore
- 7:00 PM: Welcome drinks
- 8:30 PM: First night dinner
- 10:00 PM: TOP SECRET (Team Reveal)

### Days 2-6: Still being planned
- Day 2 (Thu): Chateau chill day discussed (pool, petanque, cocktail comp, BBQ)
- Day 3 (Fri): Wine day / culture (Chenonceau, Vouvray)
- Day 4 (Sat): JOE'S BIRTHDAY - Olympics, Roast, Party
- Day 5 (Sun): Recovery / last activities
- Day 6 (Mon): Departure

## Key localStorage Keys
| Key | Purpose |
|-----|---------|
| `guestCode` | Current logged-in guest |
| `missionProgress` | Secret mission completion |
| `tripPrefs_[code]` | Individual trip preferences |
| `allTripPrefs` | Master list of all preferences |
| `lb_teamScores` | Team leaderboard scores |
| `lb_individualScores` | Individual scores |
| `lb_pointsLog` | Points history log |
| `challengeStatuses` | Which challenges are marked done |
| `itinVotes` | Itinerary voting counts |
| `itinUserVote` | Current user's itinerary vote |
| `quizLeaderboard` | Quiz high scores |
| `packingChecklist` | Checked packing items |

## Important Notes
- All data is in localStorage (client-side only). If guests use different devices, data won't sync.
- The site password and guest codes are in plain text in the JS. This is fine for a friend group trip site but not production security.
- Photo Wall limited to 20 photos to prevent localStorage overflow.
- AI videos: Recommended tools are HeyGen, D-ID, or Runway ML. Videos would be created externally and embedded.
- GitHub Pages needs to be enabled in repo settings (Settings > Pages > Source: main branch).

## Running Locally
```bash
cd "c:\Users\joe-o\OneDrive\Documents\30th Birthday Trip"
python -m http.server 5500
# Visit http://localhost:5500
```
Note: Port 3000 is used by another app on this machine.
