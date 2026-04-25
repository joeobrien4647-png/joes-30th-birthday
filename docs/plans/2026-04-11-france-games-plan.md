# France Games Plan

> Date: 2026-04-25 (updated)
> Status: Draft — shopping done, games plan needs final sign-off
> Branch: `claude/plan-france-games-04xrk`

## Purpose

Fill the blank slate. The site scaffolding for games, leaderboard, chef ratings, bingo and admin all exists, but there are **zero actual games defined**. `games.html:223-245` just shows "Revealed on arrival" locked cards. This doc is the source-of-truth list of every game, rule, prop and point allocation so we can rewrite `games.html` / `js/games.js` with real content.

## Design Principles

- **Don't over-schedule.** People came for the chateau, the pool and each other. Aim for 2-3 structured game slots per day max, not a back-to-back activity camp.
- **Mix the muscles.** Physical / mental / silly / boozy — rotate through so nobody's strengths dominate.
- **Everyone plays.** 4 teams of 6-7. Nothing that benches people for 20 minutes.
- **Low-prep wins.** Rules simple enough to explain in 60 seconds after drinks have been flowing.
- **Camera-worthy.** Each game should produce at least one moment worth filming for the trailer reel.

## Open Questions for Joe

Decide these before I rewrite the games page:

1. **Do we want a formal "Birthday Olympics" block on Day 4** (6 events back-to-back, medals table) or **one or two big events** and leave the rest of the afternoon for pool/BBQ chill?
2. **Secret Assassin all week — in or out?** It's divisive. Some love it, some find it annoying being "dead" from Day 2. I'd vote in, with a respawn mechanic.
3. **How competitive vs silly?** i.e. do you want a tight overall leaderboard where the winning team really earns it, or is it more of a running joke with points awarded loosely? This affects how carefully I balance point values.
4. **Drinking games — how prominent?** Some guests don't drink / drink less. I'll default to "drinking optional, you can do all games sober and still win", but flag if you want specific booze-heavy games.
5. **Prizes** — `games.html:189` teases "Glory, bragging rights & something special." Have you decided what? The engraved wooden spoon is ordered for the losers — what about the winners?
6. **Forfeits for the losing team** — Ideas: cook breakfast on departure day, do all the bin runs, buy the airport beers. The wooden spoon is the trophy of shame.

---

## Game Plan by Day

### Day 1 — Wed 29 Apr · Welcome Night

Arrival is chaos — bags, beds, BBQ, first dip. Keep games light, icebreaker-y. The Team Reveal is the anchor.

| Slot | Game | Type | Points | Props |
|---|---|---|---|---|
| 10pm | **Team Reveal Wheel** | Individual spin → team | — (already built) | Spin the wheel (ordered) |
| 10:30pm | **Two Truths & a Lie (Chateau Edition)** | Team | +2 per correct guess, +5 for most at end | None |
| 11pm | **Flip Cup: Welcome Tournament** | Team (4v4 brackets) | Winner +5, runner-up +3 | Plastic cups (ordered), cheap beer |

**Why this set:** All 26 people sitting around the fire pit, no setup, no running. Flip cup is loud and breaks the ice. If anyone's dying from the 4am start, they can bow out to bed guilt-free.

---

### Day 2 — Thu 30 Apr · First Full Day

Golf in the morning, pool in the afternoon, dinner and evening games. Afternoon is pool-games territory; evening is sit-down stuff.

| Slot | Game | Type | Points | Props |
|---|---|---|---|---|
| ~3pm | **Petanque Tournament** | Team 3v3, best of brackets | Winner +5, runner-up +3 | Petanque set (to order on Amazon.fr) |
| ~4pm | **Pool Noodle Jousting** | Team relay, knock opponent off lilo | Winner +5, runner-up +3 | Lilos (ordered) + pool noodles (to order on Amazon.fr) |
| 8:30pm | **Mr & Mrs: Joe vs Sophie** | Hosted quiz, teams buzz in on tiebreakers | Top team +5, all others +2 | Printed face paddles (print at home) |
| 9:30pm | **Wine Tasting Blindfold Challenge** | Individual, pools into team score | +1 per correct wine identified (max +5) | Blindfolds (ordered), 5 Loire wines |

**Why this set:** Afternoon is active-but-poolside so the golfers can join straight off the course. Evening is brain-on, ass-on-couch. Wine Tasting Blindfold piggybacks on the sommelier session so it's zero extra logistics.

---

### Day 3 — Fri 1 May · Adventure Day

Canoeing AM (the big scored event), then Angles-sur-l'Anglin lunch, pool, then team dinner. Evening games lean French to keep the flavour up.

| Slot | Game | Type | Points | Props |
|---|---|---|---|---|
| 10am | **Canoe Team Race on the Creuse** | Team (4-6 per canoe) | 1st +10 / 2nd +7 / 3rd +5 / 4th +3 | None (booked activity) |
| Afternoon (passive) | **Angles-sur-l'Anglin Photo Hunt** | Individual — snap photos of 5 prompts | +1 per matching prompt (max +5) | Prompt list on phone |
| 8pm dinner | **Accent Hour** | Individual — everyone must speak in a French accent for 1hr, penalty for breaking | +1 per spotless hour, -1 per lapse | None |
| 9:30pm | **Name That French Tune** | Team buzzer quiz | Winner +5, runner-up +3 | Spotify playlist (pre-built) |

**Why this set:** The canoe race is the anchor event of the week outside Day 4 — it deserves the biggest individual-day point pot. Accent Hour is hilarious when everyone commits. Skip if the room's exhausted from the river.

---

### Day 4 — Sat 2 May · PopWorld Party Day (THE BIG ONE)

Already branded on `schedule.html` as "PopWorld Party Day" with a 90s Icons theme. Lawn Olympics in the afternoon, costumed chaos in the evening. This is where the bulk of trip points are handed out.

#### Birthday Olympics Block (~2pm-4pm, 6 events)

Format: round-robin of 6 mini-events, all teams compete in each, medals table across the block. 6x 15-minute events with a 10-min break in the middle. Whiteboard scoreboard trackig standings live.

| # | Event | Format | Points | Props |
|---|---|---|---|---|
| 1 | **Egg & Spoon Relay** | 6-person relay per team, length of the lawn | 1st +5 / 2nd +3 / 3rd +2 | Wooden spoons + eggs (buy locally) |
| 2 | **Giant Jenga Tumble** | Teams take turns pulling, last standing | 1st +5 / 2nd +3 / 3rd +2 | Giant Jenga (to order on Amazon.fr) |
| 3 | **Human Hungry Hippos** | 4 players per team face-down on a sheet being pulled out to grab balls | 1st +5 / 2nd +3 / 3rd +2 | Plastic balls x50 (to order on Amazon.fr) + bed sheet |
| 4 | **Blindfolded Tic Tac Toe** | One player blindfolded, team shouts directions to place bean bags on the grid | 1st +5 / 2nd +3 / 3rd +2 | Giant Tic Tac Toe set (ordered) |
| 5 | **Water Balloon Toss** | Pairs step back each throw, farthest unbroken wins | 1st +5 / 2nd +3 / 3rd +2 | Water balloons (ordered) |
| 6 | **Tug of War Final** | 4-team knockout bracket | Winner +10 / final loser +5 / 3rd +3 | Tug of war rope (to order on Amazon.fr) |

**Overall Olympics champion team: +10 bonus** on top of event points.

#### Evening Event Block

| Slot | Event | Type | Points |
|---|---|---|---|
| After dinner, ~9pm | **The Roast of Joe** | Each team writes and performs a 2-minute roast bit. Joe + Sophie judge. | Best roast +10, others +3 |
| During 90s party | **Best 90s Costume** | Individual vote via livefeed | Winner +5, 5 runner-ups +2 |
| During 90s party | **Team Dance-Off** | Each team does 60s choreo to a 90s banger | Winner +5, runner-up +3 |

---

### Day 5 — Sun 3 May · Last Full Day (Bellebouche)

Lazy brunch, Bellebouche PM (accrobranche / mini golf / pedalos), last dinner, outdoor cinema. Keep it chill — people are cooked from Day 4.

| Slot | Game | Type | Points | Props |
|---|---|---|---|---|
| At Bellebouche | **Accrobranche Fastest Team** | Team — first team to finish full course | Winner +5, runner-up +3 | None (at venue) |
| At Bellebouche | **Pedalo Race** | Team pairs across the lake and back | Winner +5, runner-up +3 | None (at venue) |
| At Bellebouche | **Mini Golf Stroke Play** | Individual scores pool into team total | Lowest team total +5 | None (at venue) |
| Dinner ~8pm | **Superlatives Awards** | Everyone nominates for "Most Likely To..." etc., Joe reads results | +2 per nomination win | Via livefeed poll |
| Cinema 11pm | **Final Leaderboard Reveal + Prize Ceremony** | — | — | Wooden spoon (ordered) for losers, winner's prize TBD |

**Why this set:** Bellebouche already has 3 built-in competitive activities — we just layer scoring on top instead of inventing new games. Evening is awards-ceremony-as-entertainment which doubles as a closing narrative for the trip.

---

## All-Week Challenges (running continuously)

Lower-stakes point drip that keeps things going between the big scheduled blocks.

| Challenge | How it works | Points | Notes |
|---|---|---|---|
| **Trip Bingo** | 16 squares on `bingo.html`, claim with optional photo | +1 each, +2 per line, +5 full house | Already built, just needs the 16 squares filled in |
| **Secret Assassin** | Each guest drawn a target at start. Eliminate by tapping shoulder + saying "au revoir" while target is alone. Killer inherits victim's target. Last standing wins. | +2 per kill, +20 last standing | **Needs Joe's call** — see open question 2 |
| **Taskmaster** | 1 sealed envelope task revealed each morning. Submissions due by dinner. Joe judges. | Winner +3, funny submissions +1 | ~5 envelopes total |
| **Chef Ratings** | After each dinner, rate the cook-team 1-5 across 5 categories (already built in `games.html`) | +2 to +6 based on average | Already wired up |
| **Photo of the Day** | Daily winner via livefeed likes | +2/day to winner | Already supported by livefeed |
| **Pool Dip Streak** | Dip every single day -> bonus | +5 bonus if all 6 days | Honor system, admin toggle |
| **Early Bird / Night Owl** | First up (before 8am) +1, last standing past 2am +1 | +1 each per day | Admin awards |
| **French Phrase of the Day** | Joe posts one phrase each morning. Use it correctly in the wild = point. | +1 per correct usage | Caps at 3/person/day |

---

## Points Structure Summary

| Source | Per-team typical points | Notes |
|---|---|---|
| Daily games x 4 days | ~40-60 | Mix of wins/runners-up |
| Birthday Olympics | ~25-40 | The big swing |
| Bingo | ~10-20 | Depends on engagement |
| Chef ratings (1 cook shift) | ~5 | One dinner per team |
| Ongoing challenges | ~15-25 | Assassin, Taskmaster, misc |
| **Total** | **~100-150 pts** | Winning team probably ~140-160 |

---

## Props Shopping List — ORDERED

### Amazon.co.uk — Ordered (delivering Mon 27 Apr to Sevenoaks)

| Item | Price | For | Status |
|---|---|---|---|
| 6-pack blindfolds | £3.49 | Wine Tasting Blindfold Challenge | Ordered |
| Spin the wheel (8-slot) | £8.54 | Team Reveal night | Ordered |
| Giant playing cards (24x17cm) | £8.99 | Card games, visible from distance | Ordered |
| 2x Jumbo inflatable dice (12") | £8.99 | Pool games / dice challenges | Ordered |
| 100x plastic cups + 10 ping pong balls (x2) | £33.98 | Beer pong + Flip Cup | Ordered |
| Rainbow spring slinky | £4.18 | Prize / forfeit prop | Ordered |
| Whoopee cushion | £2.85 | Pranks | Ordered |
| Engraved wooden spoon | £5.99 | Losing team trophy | Ordered |
| Giant Tic Tac Toe (bean bag toss) | £19.99 | Blindfolded Tic Tac Toe (Olympics) | Ordered |
| Water balloons (multi-pack) | TBC | Water Balloon Toss (Olympics) | Ordered |
| **UK Total** | **~£97** | | |

### Amazon.fr — Ordered (delivering Tue 28 Apr to Chateau)

| Item | Price | For | Status |
|---|---|---|---|
| 2x SEBRUANC LED disco lights | €26.09 | PopWorld party night | Ordered |
| Hanging mirror disco ball 20cm | €18.95 | PopWorld party night | Ordered |
| Faburo inflatable lilo (155x76cm) | €31.78 | Pool lounging + jousting | Ordered |
| **FR Total** | **€76.82** | | |

### Amazon.fr — Still to Order

| Item | Est. Cost | For |
|---|---|---|
| Giant Jenga | ~€25-30 | Olympics Day 4 |
| Petanque set | ~€20-25 | Day 2 tournament |
| Tug of war rope | ~€12-15 | Olympics Day 4 finale |
| Plastic balls x50 | ~€10 | Human Hungry Hippos |
| Pool noodles x6 | ~€10-12 | Pool jousting + messing about |
| More lilos (x3-5) | ~€15-25 | Pool lounging for 26 people |
| Glow sticks (bulk 100-pack) | ~€10 | PopWorld party night |
| Beach ball / inflatable ball | ~€5-8 | Pool volleyball |
| Inflatable beer pong table | ~€15-20 | Floating beer pong |
| Giant inflatable (flamingo/unicorn) | ~€15-20 | Photo ops, pool fun |
| **Still to order total** | **~€140-180** | |

### Bring from UK in suitcase

- [x] Bluetooth speaker (Joe's own, Wking)
- [ ] Small whiteboard + coloured markers (gold/red/blue/black for team colours) — WHSmith/Wilko ~£3-5
- [ ] Printed Mr & Mrs face paddles (Joe + Sophie) — print at home
- [ ] Sealed envelopes — Taskmaster tasks
- [ ] Folded name slips — Secret Assassin
- [ ] French phrase cards — printed at home

### Buy locally in France (Intermarche/Geant Casino, Day 1)

- [ ] Cheap beer/wine — Flip Cup + general
- [ ] Wooden spoons x6 + eggs — Egg & Spoon Relay
- [ ] Any last-minute bits

---

## Implementation Plan (for when this plan is approved)

1. **`games.html` rewrite** — Replace both `ch-locked-card` placeholders with real content:
   - Daily Games tab: expandable day cards (Day 1-5), each showing games with rules/points/timing
   - All-Week tab: challenge cards with live progress where Firebase-tracked
2. **`js/games.js`** — Add the daily games data object, render helpers for expand/collapse
3. **`css/games.css`** — New styles for expanded game cards, Olympics medal table, challenge cards
4. **Bingo squares** — Fill in the 16 bingo squares (separate small task)
5. **Secret Assassin tracker** — Only if open question 2 = "yes". New Firebase path `assassin/`
6. **Props shopping list card** — Add a small section on `games.html` showing the shopping list so Joe has it on-site as a checklist
7. **Admin day-quick-awards** — Wire up contextual buttons per trip day for the admin panel
