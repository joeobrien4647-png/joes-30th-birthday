# France Games Plan — First Draft

> Date: 2026-04-11
> Status: Draft — needs Joe's review
> Branch: `claude/plan-france-games-04xrk`

## Purpose

Fill the blank slate. The site scaffolding for games, leaderboard, chef ratings, bingo and admin all exists, but there are **zero actual games defined**. `games.html:223-245` just shows "Revealed on arrival" locked cards. This doc is the source-of-truth list of every game, rule, prop and point allocation so we can rewrite `games.html` / `js/games.js` with real content.

## Design Principles

- **Don't over-schedule.** People came for the château, the pool and each other. Aim for 2-3 structured game slots per day max, not a back-to-back activity camp.
- **Mix the muscles.** Physical / mental / silly / boozy — rotate through so nobody's strengths dominate.
- **Everyone plays.** 4 teams of 6-7. Nothing that benches people for 20 minutes.
- **Travel-friendly props.** Everything in a single holdall Joe flies out with. If it doesn't fit in hand luggage, we cut it or buy it locally.
- **Low-prep wins.** Rules simple enough to explain in 60 seconds after drinks have been flowing.
- **Camera-worthy.** Each game should produce at least one moment worth filming for the trailer reel.

## Open Questions for Joe

Decide these before I rewrite the games page:

1. **Do we want a formal "Birthday Olympics" block on Day 4** (6 events back-to-back, medals table) or **one or two big events** and leave the rest of the afternoon for pool/BBQ chill?
2. **Secret Assassin all week — in or out?** It's divisive. Some love it, some find it annoying being "dead" from Day 2. I'd vote in, with a respawn mechanic.
3. **How competitive vs silly?** i.e. do you want a tight overall leaderboard where the winning team really earns it, or is it more of a running joke with points awarded loosely? This affects how carefully I balance point values.
4. **Drinking games — how prominent?** Some guests don't drink / drink less. I'll default to "drinking optional, you can do all games sober and still win", but flag if you want specific booze-heavy games.
5. **Prizes** — `games.html:189` teases "Glory, bragging rights & something special." Have you decided what? (Medals? Team trophy? Winner's dinner served by losers?) Needed so I can put a real prize reveal on the site.
6. **Forfeits for the losing team** — same question. Ideas: cook breakfast on departure day, do all the bin runs, buy the airport beers.

---

## Game Plan by Day

### Day 1 — Wed 29 Apr · Welcome Night

Arrival is chaos — bags, beds, BBQ, first dip. Keep games light, icebreaker-y. The Team Reveal is the anchor.

| Slot | Game | Type | Points | Props |
|---|---|---|---|---|
| 10pm | **Team Reveal Wheel** | Individual spin → team | — (already built) | None (on site) |
| 10:30pm | **Two Truths & a Lie (Château Edition)** | Team | +2 per correct guess, +5 for most at end | None |
| 11pm | **Flip Cup: Welcome Tournament** | Team (4v4 brackets) | Winner +5, runner-up +3 | Plastic cups, cheap beer |

**Why this set:** All 26 people sitting around the fire pit, no setup, no running. Flip cup is loud and breaks the ice. If anyone's dying from the 4am start, they can bow out to bed guilt-free.

---

### Day 2 — Thu 30 Apr · First Full Day

Golf in the morning, pool in the afternoon, dinner and evening games. Afternoon is pool-games territory; evening is sit-down stuff.

| Slot | Game | Type | Points | Props |
|---|---|---|---|---|
| ~3pm | **Petanque Tournament** | Team 3v3, best of brackets | Winner +5, runner-up +3 | Petanque set (Decathlon ~£20) |
| ~4pm | **Pool Noodle Jousting** | Team relay, knock opponent off lilo | Winner +5, runner-up +3 | 4× lilos, 4× pool noodles (buy on day at Intermarché) |
| 8:30pm | **Mr & Mrs: Joe vs Sophie** | Hosted quiz, teams buzz in on tiebreakers | Top team +5, all others +2 | Printed face paddles (Joe/Sophie) |
| 9:30pm | **Wine Tasting Blindfold Challenge** | Individual, pools into team score | +1 per correct wine identified (max +5) | Blindfolds ×10, 5 Loire wines (happening anyway for tasting session — just adds scoring layer) |

**Why this set:** Afternoon is active-but-poolside so the golfers can join straight off the course. Evening is brain-on, ass-on-couch. Wine Tasting Blindfold piggybacks on the sommelier session so it's zero extra logistics.

---

### Day 3 — Fri 1 May · Adventure Day

Canoeing AM (the big scored event), then Angles-sur-l'Anglin lunch, pool, then team dinner. Evening games lean French to keep the flavour up.

| Slot | Game | Type | Points | Props |
|---|---|---|---|---|
| 10am | **Canoe Team Race on the Creuse** | Team (4-6 per canoe) | 1st +10 / 2nd +7 / 3rd +5 / 4th +3 | None (booked activity) |
| Afternoon (passive) | **Angles-sur-l'Anglin Photo Hunt** | Individual — snap photos of 5 prompts | +1 per matching prompt (max +5) | Prompt list on phone (built into Bingo page as temporary overlay, or printed) |
| 8pm dinner | **Accent Hour** | Individual — everyone must speak in a French accent for 1hr, penalty for breaking | +1 per spotless hour, −1 per lapse (max 5 people caught by admin/Joe) | None |
| 9:30pm | **Name That French Tune** | Team buzzer quiz | Winner +5, runner-up +3 | Spotify playlist (pre-built), phone for each team |

**Why this set:** The canoe race is the anchor event of the week outside Day 4 — it deserves the biggest individual-day point pot. Accent Hour is our first ongoing-challenge deployment and is hilarious when everyone commits. Skip if the room's exhausted from the river.

---

### Day 4 — Sat 2 May · PopWorld Party Day (THE BIG ONE)

Already branded on `schedule.html:578` as "PopWorld Party Day" with a 90s Icons theme. Lawn Olympics in the afternoon, costumed chaos in the evening. This is where the bulk of trip points are handed out.

#### 🏆 Birthday Olympics Block (~2pm–4pm, 6 events)

Format: round-robin of 6 mini-events, all teams compete in each, medals table across the block. I'd run it as 6× 15-minute events with a 10-min break in the middle.

| # | Event | Format | Points |
|---|---|---|---|
| 1 | **Egg & Spoon Relay** | 6-person relay per team, length of the lawn | 1st +5 / 2nd +3 / 3rd +2 |
| 2 | **Giant Jenga Tumble** | Teams take turns pulling, last standing | 1st +5 / 2nd +3 / 3rd +2 |
| 3 | **Human Hungry Hippos** | 4 players per team take turns face-down on a sheet being pulled out to grab balls | 1st +5 / 2nd +3 / 3rd +2 |
| 4 | **Water Balloon Toss** | Pairs step back each throw, farthest unbroken wins | 1st +5 / 2nd +3 / 3rd +2 |
| 5 | **Whisper Challenge** | 3 per team wear headphones, read lips of crazy phrases | 1st +5 / 2nd +3 / 3rd +2 |
| 6 | **Tug of War Final** | 4-team knockout bracket | Winner +10 / final loser +5 / 3rd +3 |

**Overall Olympics champion team: +10 bonus** on top of event points. (Max theoretical haul: ~40 points if a team sweeps — we'd never see that.)

**Props needed for Olympics block:**
- Plastic balls ×50 (£10) ✓ already on shopping list
- Wooden spoons ×6, hard-boiled eggs day-of
- Water balloons (multi-pack)
- Giant Jenga (bring from UK or buy at Géant Casino)
- Noise-cancelling headphones ×2 ✓ bringing from home
- Tug of war rope (buy local)
- A bed sheet for Hungry Hippos (chateau linen, wash after)

#### 🎤 Evening Event Block

| Slot | Event | Type | Points |
|---|---|---|---|
| After dinner, ~9pm | **The Roast of Joe** | Each team writes and performs a 2-minute roast bit. Joe + Sophie judge. | Best roast +10, others +3 |
| During 90s party | **Best 90s Costume** | Individual vote via livefeed | Winner +5, 5 runner-ups +2 |
| During 90s party | **Team Dance-Off** | Each team does 60s choreo to a 90s banger | Winner +5, runner-up +3 |

---

### Day 5 — Sun 3 May · Last Full Day (Bellebouche)

Lazy brunch, Bellebouche PM (accrobranche / mini golf / pédalos), last dinner, outdoor cinema. Keep it chill — people are cooked from Day 4.

| Slot | Game | Type | Points | Props |
|---|---|---|---|---|
| At Bellebouche | **Accrobranche Fastest Team** | Team — first team to finish full course | Winner +5, runner-up +3 | None (at venue) |
| At Bellebouche | **Pédalo Race** | Team pairs across the lake and back | Winner +5, runner-up +3 | None (at venue) |
| At Bellebouche | **Mini Golf Stroke Play** | Individual scores pool into team total | Lowest team total +5 | None (at venue) |
| Dinner ~8pm | **Superlatives Awards** | Everyone nominates for "Most Likely To…" etc., Joe reads results | +2 per nomination win | Printed ballot sheets (or via livefeed poll) |
| Cinema 11pm | **Final Leaderboard Reveal + Prize Ceremony** | — | — | Medals / trophy |

**Why this set:** Bellebouche already has 3 built-in competitive activities — we just layer scoring on top instead of inventing new games. Evening is awards-ceremony-as-entertainment which doubles as a closing narrative for the trip.

---

## All-Week Challenges (running continuously)

Lower-stakes point drip that keeps things going between the big scheduled blocks.

| Challenge | How it works | Points | Notes |
|---|---|---|---|
| **Trip Bingo** | 16 squares on `bingo.html`, claim with optional photo | +1 each, +2 per line, +5 full house | Already built, just needs the 16 squares filled in |
| **Secret Assassin** | Each guest drawn a target at start. Eliminate by tapping shoulder + saying "au revoir" while target is alone. Killer inherits victim's target. Last standing wins. | +2 per kill, +20 last standing | **Needs Joe's call** — see open question 2. Needs a simple Firebase tracker. |
| **Taskmaster** | 1 sealed envelope task revealed each morning. Submissions due by dinner. Joe judges. | Winner +3, funny submissions +1 | ~5 envelopes total. Ideas: "cook a dish using only ingredients beginning with B", "produce something that Joe will treasure forever", "impress an unsuspecting local" |
| **Chef Ratings** | After each dinner, rate the cook-team 1-5 across 5 categories (already built in `games.html:387`) | +2 to +6 based on average | Already wired up, just plug in the cook rota |
| **Photo of the Day** | Daily winner via livefeed likes | +2/day to winner | Already supported by livefeed |
| **Pool Dip Streak** | Dip every single day → bonus | +5 bonus if all 6 days | Honor system, admin toggle |
| **Early Bird / Night Owl** | First up (before 8am) +1, last standing past 2am +1 | +1 each per day | Admin awards |
| **French Phrase of the Day** | Joe posts one phrase each morning. Use it correctly in the wild = point. | +1 per correct usage | Caps at 3/person/day so it's not spam |

**Cut from initial list:** Left Hand Drink and Phone Detox. Left Hand Drink only makes sense during accent hour; folded into that. Phone Detox is a nice idea but unenforceable and guilt-trippy — drop.

---

## Points Structure Summary

Rough expected point totals per team by end of trip, if things are roughly even:

| Source | Per-team typical points | Notes |
|---|---|---|
| Daily games × 4 days | ~40-60 | Mix of wins/runners-up |
| Birthday Olympics | ~25-40 | The big swing |
| Bingo | ~10-20 | Depends on engagement |
| Chef ratings (1 cook shift) | ~5 | One dinner per team |
| Ongoing challenges | ~15-25 | Assassin, Taskmaster, misc |
| **Total** | **~100-150 pts** | Winning team probably ~140-160 |

This gives us roughly 150-point swing across the week, enough that a blowout on Day 4 won't lock it in — Day 5 can still flip the leaderboard.

---

## Full Props Shopping List

### Already on Joe's TODO.md shopping list
- [x] Giant foam dice ×2 — `(not used in current plan, can drop)`
- [x] Plastic balls 50+ — Hungry Hippos
- [x] Noise-cancelling headphones ×2 — Whisper Challenge
- [x] Petanque set — Day 2
- [x] Mr & Mrs face paddles — Day 2
- [x] Blindfolds ×10 — Wine Tasting Day 2
- [x] Sealed envelopes — Taskmaster
- [x] Name slips — Secret Assassin
- [x] French phrase cards — Accent Hour + French Phrase of the Day

### New additions from this plan
- [ ] Plastic cups + cheap beer for Flip Cup (buy on arrival)
- [ ] 4× cheap lilos + 4× pool noodles (Intermarché Day 1)
- [ ] Wooden spoons ×6 (buy locally)
- [ ] Water balloons multi-pack
- [ ] Giant Jenga (bring or buy)
- [ ] Tug of war rope (buy locally — ~€15)
- [ ] Spotify Premium playlist for "Name That French Tune" (no props, just prep)
- [ ] Medals or trophy for final ceremony (Amazon £10-20) — **pending open question 5**

### Can drop from shopping list
- Giant foam dice ×2 — no game uses them in this plan. Drop unless Joe has a Dice Challenge in mind.

---

## Implementation Plan (for when this plan is approved)

Next session, once Joe signs off / edits this:

1. **`games.html` rewrite** — Replace both `ch-locked-card` placeholders with real content:
   - Daily Games tab: 4 expandable day cards (Day 1-4, Day 5 bundled in), each showing games with rules/points/timing
   - All-Week tab: 8 challenge cards with live progress where Firebase-tracked
2. **`js/games.js`** — Add the daily games data object, render helpers for expand/collapse
3. **`css/games.css`** — New styles for expanded game cards, Olympics medal table, challenge cards
4. **Bingo squares** — Fill in the 16 bingo squares (separate small task)
5. **Secret Assassin tracker** — Only if open question 2 = "yes". New Firebase path `assassin/` with `target/`, `alive/`, `kills/`.
6. **Props shopping list card** — Add a small section on `games.html` showing the shopping list so Joe has it on-site as a checklist.
7. **Admin day-quick-awards** — Already referenced in `games.html:351` (`#day-quick-awards`) but hidden. Wire it up to show the day's scheduled games as quick-award buttons when admin toggles the day override.

Rough cadence: rewrite HTML + JS first (90% of the work), then bingo squares, then the assassin tracker if we're doing it.

---

## Nothing is locked in

This is a first draft. Every game, every point value, every prop is up for swap. I picked things that (a) suit the venue, (b) work for 26 mixed-ability players, (c) don't need expensive kit, (d) have a decent chance of being memorable. Tell me what you love, what's off, and what's missing.
