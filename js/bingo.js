/* ============================================
   Trip Bingo — Standalone Module
   Claim drawer, photo upload, punishments,
   line celebrations, full-house, admin panel.
   Uses globals: Auth, Store, PLAYERS, TEAM_CONFIG,
   GUEST_DATA, BingoEngine, FirebaseSync, PhotoStorage,
   triggerConfetti
   ============================================ */

/* ---- XSS helper (local copy) ---- */
function escapeHtml(text) {
    if (text == null) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/* ---- Individual punishments (per square claimed — pick one of 3) ---- */
var BINGO_SQUARE_PUNISHMENTS = [
    'Down a drink or do a shot — take it OR distribute as sips to others. Banked for any time today. Non-drinkers: 60-sec wall sit.',
    'Make a drink for one person — punisher names who. Properly made and served.',
    '20 press-ups OR a lap of the château garden — your choice'
];

/* ---- Line + Full House are points-only — no extra punishment/reward ---- */
var BINGO_LINE_PUNISHMENTS = [];
var BINGO_FULL_HOUSE_REWARDS = [];

/* ---- Team colour map ---- */
var TEAM_COLOURS = {
    titans:     '#f9a825',
    spartans:   '#c62828',
    vikings:    '#1565c0',
    gladiators: '#424242'
};

/* ---- Emoji per challenge (matches BINGO_ITEMS order) ---- */
var BINGO_EMOJIS = [
    '\uD83C\uDFB4',           // 1. Win a card or drinking game
    '\uD83E\uDD2F',           // 2. Shock 5+ people
    '\uD83D\uDCE3',           // 3. Start a chant
    '\uD83C\uDF7A',           // 4. 1v1 downing
    '\uD83E\uDD4E',           // 5. Score a run in rounders
    '\uD83E\uDD42',           // 6. Toast someone untoasted
    '\uD83D\uDCDC',           // 7. Invent a trip rule
    '\uD83C\uDFA4',           // 8. Song singalong
    '\uD83D\uDCAA',           // 9. 1v1 arm wrestle
    '\uD83E\uDD43',           // 10. Joe shot/drink
    '\uD83C\uDFCA',           // 11. Beat a captain in swim race
    '\uD83D\uDD7A',           // 12. Slut drop on 90s night
    '\uD83C\uDFD3',           // 13. Beer pong
    '\uD83C\uDF36\uFE0F',     // 14. Hot food / lemon
    '\uD83D\uDCA6',           // 15. Pool fully clothed
    '\uD83E\uDD43'            // 16. Three shots
];

/* ---- Short titles for grid cells ---- */
var BINGO_SHORT_TITLES = [
    'Win a Card or Drinking Game',
    'Shock 5+ People',
    'Start a Chant',
    '1v1 Downing Comp',
    'Score a Run in Rounders',
    'Toast Someone Untoasted',
    'Invent a Trip Rule',
    'Get a Song Singalong',
    '1v1 Arm Wrestle',
    'Get Joe to Do a Shot',
    'Beat a Captain in a Swim Race',
    'Slut Drop on 90s Night',
    'Win at Beer Pong',
    '1-Min Hot Food Challenge',
    'Pool Fully Clothed',
    'Three Shots in a Row'
];

/* ---- Structured rules (definition / accepted / not accepted / requirements)
   Shown in the drawer when tapped. Cards stay clean — emoji + title only. */
var BINGO_RULES = [
    {
        definition: 'Win any card or drinking game played in the evening at the château.',
        accepted: ['Kings Cup', 'Ring of Fire', 'Cheat / BS', 'Werewolf', 'Mafia', 'Any 4+ player card or drinking game'],
        notAccepted: ['Daytime games', '1v1 games (use the dedicated 1v1 squares instead)', 'Solo card games'],
        requirements: '4+ players, evening session, 2+ witnesses confirm you won.'
    },
    {
        definition: 'Do something that genuinely shocks at least 5 people in real time.',
        accepted: ['Stunts', 'Public confessions', 'Surprise costumes', 'Pranks', 'Unexpected actions'],
        notAccepted: ['Performative shocks where no one is actually surprised', 'Self-claimed shocks with no witness reaction'],
        requirements: '5 named witnesses must confirm they were genuinely shocked when you submit your claim.'
    },
    {
        definition: 'Initiate a chant that the whole group joins in on.',
        accepted: ['Football chants', 'Made-up chants', 'Call-and-response', 'Themed chants (e.g. "JOE! JOE! JOE!")'],
        notAccepted: ['Begging people to join', 'Chants that fizzle after 5 seconds', 'Chants of fewer than 15 voices'],
        requirements: '15+ people audibly joining in. Has to spread organically — no forcing.'
    },
    {
        definition: 'Beat one other person in a head-to-head downing competition.',
        accepted: ['Any drink', 'Any volume', 'Both start drinking on the same signal', 'First finished wins'],
        notAccepted: ['Pre-prepped or partial drinks', 'Different volumes for the two competitors', 'No witness'],
        requirements: '1 attempt only — lose and you\'re permanently out of this square. Each person can only be challenged once across this + arm wrestle. Witness names the winner.'
    },
    {
        definition: 'Run all 4 posts safely in the organised rounders match.',
        accepted: ['Full lap of all 4 posts without being caught, stumped, or run out'],
        notAccepted: ['Half-runs', 'Partial laps', 'Runs in pickup games outside the official match'],
        requirements: 'During the organised rounders match. Everyone watching counts as a witness.'
    },
    {
        definition: 'Give a proper named toast to someone in front of 10+ people.',
        accepted: ['A 30-sec+ toast with reasoning ("I toast X because…")', 'At any meal or drinks moment', 'Any guest who hasn\'t yet been toasted'],
        notAccepted: ['Generic "cheers everyone" toasts', 'Toasting yourself', 'Toasting Joe (he\'s the birthday boy — automatic)'],
        requirements: 'Target must be untoasted by anyone all trip. 10+ audience. Must include a clear reason for the toast.'
    },
    {
        definition: 'Pitch a NEW rule that the group adopts and follows unprompted.',
        accepted: ['Real rules people follow ("no phones at dinner", "shoes off in the kitchen", "cheers in French only")'],
        notAccepted: ['Existing rules already in place', 'Rules you keep reminding people about', 'Agreed-but-not-followed rules'],
        requirements: '5+ people must follow the rule unprompted (without you reminding them) within an hour of pitching it.'
    },
    {
        definition: 'Pick a song that 5+ people sing along to the chorus.',
        accepted: ['DJ requests', 'Aux requests', 'Kitchen sing-alongs', 'Any song'],
        notAccepted: ['Songs you sing solo', 'Half-hearted humming', 'Fewer than 5 audible voices'],
        requirements: 'You request the song. 5+ different people audibly sing the chorus. Video or witnesses.'
    },
    {
        definition: 'Beat one other person in arm wrestling.',
        accepted: ['Standard arm wrestle rules — both elbows on the table, free hand grips the table edge'],
        notAccepted: ['Best of 3', 'Pre-arranged "wins" between mates', 'No witness'],
        requirements: '1 attempt only — lose and you\'re permanently out of this square. Each person can only be challenged once across this + downing comp. Witness names the winner.'
    },
    {
        definition: 'Convince Joe to take an unscheduled shot or drink with you.',
        accepted: ['Surprise shots', '"Bet you can\'t" challenges Joe accepts', 'You pour, he drinks it'],
        notAccepted: ['Toasts (automatic)', 'Group cheers Joe was already doing', 'Planned drinking moments'],
        requirements: 'Must be UNSCHEDULED — Joe wasn\'t planning this drink. Witnessed by Joe + 1 other person.'
    },
    {
        definition: 'Beat any team captain in a pool swim race of your choosing.',
        accepted: ['Length of pool', 'Any stroke (freestyle, breaststroke, backstroke etc.)', 'Captains: Joe, Razon, Hannah, Peter'],
        notAccepted: ['Best of 3', 'Pre-arranged outcomes', 'Captain not actually trying'],
        requirements: 'You pick the captain + race format. 1 attempt only — lose and you can\'t try again. Witness names the winner.'
    },
    {
        definition: 'Slut drop on the dancefloor during the Sat 2 May 90s party.',
        accepted: ['A clean drop with music playing', 'In costume', 'Witnessed by anyone on or near the dancefloor'],
        notAccepted: ['Drops at any other time of the trip', 'Drops without music', 'Half-drops or fakes'],
        requirements: 'Sat 2 May only. On the dancefloor with music playing. Photo or witness.'
    },
    {
        definition: 'Win a complete game of Beer Pong by knocking out all opponent cups.',
        accepted: ['1v1 or 2v2 standard rules', 'Any cup count agreed at the start', 'Re-rack rules optional'],
        notAccepted: ['Forfeit wins', 'Partial wins', '"We got bored" wins'],
        requirements: 'Knock out all opponent cups in a full game. Witness names the winner.'
    },
    {
        definition: 'Eat something spicy/sour and keep a straight face for 60 seconds.',
        accepted: ['Whole raw chilli (chewed and swallowed)', 'Spoonful of hot sauce', 'Whole raw lemon'],
        notAccepted: ['Mild sauces', 'Cooked chilli', 'Slices of lemon', 'Breaks in composure (flinching, sweating wipes, water gulps)'],
        requirements: '60-sec stopwatch starts after swallowing. No water, no flinching, no fanning. Variants from this list (e.g. mustard, vinegar) need all 4 captains to approve.'
    },
    {
        definition: 'Get into the pool wearing a full outfit.',
        accepted: ['Top + bottoms + shoes minimum', 'Voluntary or pushed in both count', 'Phones empty pockets first (please)'],
        notAccepted: ['Underwear only', 'Swimwear under clothes', 'Just feet in'],
        requirements: 'Photo or witness proof.'
    },
    {
        definition: 'Drink 3 different spirits back-to-back.',
        accepted: ['Any 3 different spirits (vodka, gin, rum, tequila, whisky, etc.)', 'Standard shot measure (~25-50ml)'],
        notAccepted: ['Same spirit 3 times', 'Chasers between shots', 'Breaks longer than 30 sec', 'Mocktails (use the variant rule)'],
        requirements: '3 different spirits, no chasers, no breaks > 30 sec. Non-alcoholic variant (ginger / espresso / fruit cordial shots) needs all 4 captains to approve.'
    }
];

/* ---- Bingo lock: locked for everyone until manually unlocked ---- */
/* Set to true when ready to reveal challenges (e.g. during the trip) */
var BINGO_FORCE_LOCKED = false;

function isBingoUnlocked() {
    return !BINGO_FORCE_LOCKED;
}

/* ============================================
   Main entry
   ============================================ */
function initBingo() {
    var grid = document.getElementById('bingoGrid');
    if (!grid) return;
    if (typeof BingoEngine === 'undefined') return;

    var guestCode = Auth.isLoggedIn() ? Auth.getGuestCode() : null;
    var guestData = guestCode ? Auth.getGuestData() : null;
    var guestName = guestData ? guestData.name : 'Guest';
    var guestTeam = guestData ? (PLAYERS[guestName] || '') : '';
    var items = BingoEngine.getItems();
    var unlocked = isBingoUnlocked();

    // State for line-modal flow
    var pendingLineData = null;
    var pendingPunishment = '';
    var drawerIdx = -1;

    // Initial render
    renderGrid();
    if (unlocked) {
        updateStats();
        renderLeaderboard();
        renderActivity();
        renderPunishments();
        updateSectionVisibility();
        initBingoAdmin();
    } else {
        var progressEl = document.getElementById('bingoProgress');
        if (progressEl) progressEl.style.display = 'none';
    }

    // Live updates (only when unlocked)
    if (unlocked) {
        BingoEngine.onUpdate(function() {
            renderGrid();
            updateStats();
            renderLeaderboard();
            renderActivity();
            renderPunishments();
            updateSectionVisibility();
        });

        document.addEventListener('feedUpdate', function() {
            renderActivity();
        });

        if (typeof FirebaseSync !== 'undefined' && FirebaseSync.isConfigured()) {
            FirebaseSync.onUpdate('bingo/punishments', function() {
                renderPunishments();
            });
        }
    }

    /* ============================================
       Section Visibility — hide empty sections
       ============================================ */
    function updateSectionVisibility() {
        // Hide punishment section if empty
        var punSection = document.querySelector('.bingo-punishments-section');
        var punContent = document.getElementById('bingoPunishments');
        if (punSection && punContent) {
            var hasPunishments = punContent.querySelector('.bingo-punishment-item');
            punSection.style.display = hasPunishments ? '' : 'none';
        }

        // Hide leaderboard section if empty
        var lbSection = document.querySelector('.bingo-leaderboard-section');
        var lbContent = document.getElementById('bingoLeaderboard');
        if (lbSection && lbContent) {
            var hasLeaderboard = lbContent.querySelector('.bingo-leaderboard-list');
            lbSection.style.display = hasLeaderboard ? '' : 'none';
        }

        // Hide activity section if empty
        var actSection = document.querySelector('.bingo-activity-section');
        var actContent = document.getElementById('bingoFeed');
        if (actSection && actContent) {
            var hasActivity = actContent.querySelector('.bingo-feed-item');
            actSection.style.display = hasActivity ? '' : 'none';
        }
    }

    /* ============================================
       Grid
       ============================================ */
    function renderGrid() {
        grid.innerHTML = '';
        var claims = BingoEngine.getClaims();

        // If locked, show teaser grid
        if (!unlocked) {
            renderLockedGrid();
            return;
        }

        for (var i = 0; i < items.length; i++) {
            (function(idx) {
                var cell = document.createElement('div');
                cell.className = 'bingo-cell';
                var cellClaims = claims[idx] || {};
                var myClaim = guestCode ? cellClaims[guestCode] : null;
                var claimCount = Object.keys(cellClaims).length;
                var emoji = BINGO_EMOJIS[idx] || '\uD83C\uDFAF';

                // Emoji always shown
                var emojiEl = document.createElement('span');
                emojiEl.className = 'bingo-cell-emoji';
                emojiEl.textContent = emoji;
                cell.appendChild(emojiEl);

                // Clean card: emoji + title only. Tap reveals structured rules.
                var shortLabel = BINGO_SHORT_TITLES[idx] || shortenChallenge(items[idx]);

                if (myClaim) {
                    // I've claimed this square
                    cell.classList.add('claimed');
                    cell.classList.add('claimed-self');

                    var teamColour = TEAM_COLOURS[myClaim.team] || '#888';
                    cell.style.setProperty('--team-colour', teamColour);

                    var textEl = document.createElement('span');
                    textEl.className = 'bingo-cell-text';
                    textEl.textContent = shortLabel;
                    cell.appendChild(textEl);

                    // Show how many people have claimed this
                    if (claimCount > 1) {
                        var countEl = document.createElement('span');
                        countEl.className = 'bingo-cell-claimant';
                        countEl.textContent = claimCount + ' claimed';
                        cell.appendChild(countEl);
                    }
                } else {
                    // I haven't claimed this yet
                    cell.classList.add('unclaimed');

                    var textEl2 = document.createElement('span');
                    textEl2.className = 'bingo-cell-text';
                    textEl2.textContent = shortLabel;
                    cell.appendChild(textEl2);

                    // Tap hint for unclaimed cards
                    var tapHint = document.createElement('span');
                    tapHint.className = 'bingo-cell-tap';
                    tapHint.textContent = 'Tap for rules';
                    cell.appendChild(tapHint);

                    // Show count if others have claimed
                    if (claimCount > 0) {
                        var countEl2 = document.createElement('span');
                        countEl2.className = 'bingo-cell-claimant';
                        countEl2.textContent = claimCount + ' claimed';
                        cell.appendChild(countEl2);
                    }

                    if (guestCode) {
                        cell.addEventListener('click', function() {
                            openClaimDrawer(idx);
                        });
                    }
                }

                grid.appendChild(cell);
            })(i);
        }
    }

    /* Shorten challenge text for grid cells */
    function shortenChallenge(text) {
        if (text.length <= 30) return text;
        var cut = text.substring(0, 28);
        var lastSpace = cut.lastIndexOf(' ');
        if (lastSpace > 15) cut = cut.substring(0, lastSpace);
        return cut + '...';
    }

    /* Locked grid — mystery cards + banner */
    function renderLockedGrid() {
        // Add locked banner above grid if not already there
        var container = grid.parentNode;
        var existingBanner = container.querySelector('.bingo-locked-banner');
        if (!existingBanner) {
            var banner = document.createElement('div');
            banner.className = 'bingo-locked-banner';
            banner.innerHTML = '<h3>\uD83D\uDD12 Challenges Locked</h3>'
                + '<p>16 challenges will be revealed when the trip begins!</p>';
            container.insertBefore(banner, grid);
        }

        grid.innerHTML = '';
        for (var i = 0; i < 16; i++) {
            var cell = document.createElement('div');
            cell.className = 'bingo-cell bingo-cell-locked';

            var emojiEl = document.createElement('span');
            emojiEl.className = 'bingo-cell-emoji';
            emojiEl.textContent = '\uD83D\uDD12';
            cell.appendChild(emojiEl);

            var lockText = document.createElement('span');
            lockText.className = 'bingo-cell-text';
            lockText.textContent = '???';
            cell.appendChild(lockText);

            grid.appendChild(cell);
        }

        // Hide prize track and progress when locked
        var prizes = document.querySelector('.bingo-prizes');
        if (prizes) prizes.style.display = 'none';
    }

    /* ============================================
       Claim Drawer (bottom sheet)
       ============================================ */
    function openClaimDrawer(idx) {
        drawerIdx = idx;
        var backdrop = document.getElementById('bingoClaimBackdrop');
        var drawer  = document.getElementById('bingoClaimDrawer');
        var challengeEl = document.getElementById('bingoDrawerChallenge');
        var emojiEl = document.getElementById('bingoDrawerEmoji');
        var photoInput = document.getElementById('bingoPhotoInput');

        if (!drawer) return;

        if (emojiEl) emojiEl.textContent = BINGO_EMOJIS[idx] || '\uD83C\uDFAF';
        // Title from short titles array
        if (challengeEl) {
            challengeEl.textContent = BINGO_SHORT_TITLES[idx] || items[idx];
        }

        // Populate structured rules
        var rule = (typeof BINGO_RULES !== 'undefined' && BINGO_RULES[idx]) ? BINGO_RULES[idx] : null;
        var defEl = document.getElementById('bingoDrawerDefinition');
        var accList = document.getElementById('bingoDrawerAccepted');
        var notList = document.getElementById('bingoDrawerNotAccepted');
        var reqEl = document.getElementById('bingoDrawerRequirements');

        if (rule) {
            if (defEl) defEl.textContent = rule.definition || '';
            if (accList) {
                accList.innerHTML = '';
                (rule.accepted || []).forEach(function(item) {
                    var li = document.createElement('li');
                    li.textContent = item;
                    accList.appendChild(li);
                });
            }
            if (notList) {
                notList.innerHTML = '';
                (rule.notAccepted || []).forEach(function(item) {
                    var li = document.createElement('li');
                    li.textContent = item;
                    notList.appendChild(li);
                });
            }
            if (reqEl) reqEl.textContent = rule.requirements || '';
        }

        // Reset photo state
        if (photoInput) photoInput.value = '';
        clearPhotoPreview();

        // Show
        if (backdrop) {
            backdrop.style.display = '';
            backdrop.classList.add('visible');
        }
        drawer.style.display = '';
        // Force reflow then animate
        drawer.offsetHeight;
        drawer.classList.add('open');
    }

    function closeClaimDrawer() {
        var backdrop = document.getElementById('bingoClaimBackdrop');
        var drawer  = document.getElementById('bingoClaimDrawer');

        if (drawer) drawer.classList.remove('open');
        if (backdrop) backdrop.classList.remove('visible');

        setTimeout(function() {
            if (drawer) drawer.style.display = 'none';
            if (backdrop) backdrop.style.display = 'none';
        }, 300);

        drawerIdx = -1;
    }

    // Drawer buttons
    var claimBtn  = document.getElementById('bingoDrawerClaim');
    var cancelBtn = document.getElementById('bingoDrawerCancel');
    var bdrop     = document.getElementById('bingoClaimBackdrop');

    if (claimBtn) claimBtn.addEventListener('click', function() { submitClaim(); });
    if (cancelBtn) cancelBtn.addEventListener('click', function() { closeClaimDrawer(); });
    if (bdrop) bdrop.addEventListener('click', function() { closeClaimDrawer(); });

    // Photo handling
    var photoInput = document.getElementById('bingoPhotoInput');
    if (photoInput) {
        photoInput.addEventListener('change', function() {
            if (!this.files || !this.files[0]) return;
            compressPhoto(this.files[0], function(blob, previewUrl) {
                showPhotoPreview(previewUrl);
            });
        });
    }

    function compressPhoto(file, callback) {
        var reader = new FileReader();
        reader.onload = function(e) {
            var img = new Image();
            img.onload = function() {
                var canvas = document.createElement('canvas');
                var maxW = 800;
                var scale = Math.min(1, maxW / img.width);
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                var dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                canvas.toBlob(function(blob) {
                    callback(blob, dataUrl);
                }, 'image/jpeg', 0.7);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function showPhotoPreview(dataUrl) {
        var drawer = document.getElementById('bingoClaimDrawer');
        if (!drawer) return;
        clearPhotoPreview();
        var photoArea = drawer.querySelector('.bingo-drawer-photo');
        if (!photoArea) return;

        var preview = document.createElement('div');
        preview.className = 'bingo-photo-preview';
        preview.id = 'bingoPhotoPreview';

        var img = document.createElement('img');
        img.src = dataUrl;
        img.alt = 'Photo preview';
        preview.appendChild(img);

        var removeBtn = document.createElement('button');
        removeBtn.className = 'bingo-photo-remove';
        removeBtn.textContent = 'Remove';
        removeBtn.type = 'button';
        removeBtn.addEventListener('click', function() {
            clearPhotoPreview();
            var inp = document.getElementById('bingoPhotoInput');
            if (inp) inp.value = '';
        });
        preview.appendChild(removeBtn);

        photoArea.appendChild(preview);
    }

    function clearPhotoPreview() {
        var existing = document.getElementById('bingoPhotoPreview');
        if (existing) existing.parentNode.removeChild(existing);
    }

    /* ============================================
       Claim Submission
       ============================================ */
    function submitClaim() {
        if (drawerIdx < 0 || !guestCode) return;

        var idx = drawerIdx;
        var pInput = document.getElementById('bingoPhotoInput');
        var photoFile = (pInput && pInput.files && pInput.files[0]) ? pInput.files[0] : null;

        closeClaimDrawer();

        // Claim via BingoEngine (awards points + posts feed internally)
        BingoEngine.claim(idx, guestCode, guestName, guestTeam);

        // Photo upload (if file chosen)
        if (photoFile && typeof PhotoStorage !== 'undefined') {
            PhotoStorage.upload(photoFile, guestCode, guestName, items[idx], null, function(photoData, err) {
                if (photoData && photoData.url) {
                    FirebaseSync.update('bingo/claims/' + idx + '/' + guestCode, { photoUrl: photoData.url });
                }
            });
        }

        // Haptic
        if (navigator.vibrate) navigator.vibrate(50);

        // Toast
        var teamLabel = guestTeam ? (TEAM_CONFIG[guestTeam] ? TEAM_CONFIG[guestTeam].name : guestTeam) : '';
        showToast('Nice! +1 point' + (teamLabel ? ' for ' + teamLabel : ''));

        // Animate cell
        var cells = grid.querySelectorAll('.bingo-cell');
        if (cells[idx]) {
            cells[idx].classList.add('cell-pop');
        }

        // Show square punishment picker (pick a person to punish)
        setTimeout(function() {
            showSquarePunishment();
        }, 500);
    }

    /* ============================================
       Square Punishment — pick a person to punish
       ============================================ */
    function showSquarePunishment() {
        var modal = document.getElementById('bingoLineModal');
        var celebration = document.getElementById('bingoLineCelebration');
        var punishmentPicker = document.getElementById('bingoPunishmentPicker');
        var guestPicker = document.getElementById('bingoGuestPicker');
        var confirmPanel = document.getElementById('bingoLineConfirm');
        var descEl = document.getElementById('bingoLineDesc');

        if (!modal) { checkForNewLines(); return; }

        // Pick a random punishment
        var shuffled = BINGO_SQUARE_PUNISHMENTS.slice().sort(function() { return Math.random() - 0.5; });
        var punishment = shuffled[0];
        pendingPunishment = punishment;

        if (celebration) {
            celebration.style.display = '';
            celebration.querySelector('h2').innerHTML = '&#128170; SQUARE CLAIMED!';
        }
        if (descEl) descEl.textContent = 'Pick someone to punish: "' + punishment + '"';
        if (punishmentPicker) punishmentPicker.style.display = 'none';
        if (guestPicker) guestPicker.style.display = 'none';
        if (confirmPanel) confirmPanel.style.display = 'none';
        modal.style.display = 'flex';
        modal.classList.remove('fullhouse');

        // Go straight to person picker after a beat
        setTimeout(function() {
            showVictimPicker(function(targetName) {
                // Save punishment
                var punishmentData = {
                    assignedBy: guestName,
                    assignedByCode: guestCode,
                    victim: targetName,
                    description: pendingPunishment,
                    completed: false,
                    timestamp: Date.now()
                };
                if (typeof BingoEngine.addPunishment === 'function') {
                    BingoEngine.addPunishment(punishmentData);
                } else {
                    FirebaseSync.push('bingo/punishments', punishmentData);
                }

                // Show confirm
                var cp = document.getElementById('bingoLineConfirm');
                var ct = document.getElementById('bingoLineConfirmText');
                var cb = document.getElementById('bingoLineClose');
                var gp = document.getElementById('bingoGuestPicker');
                if (gp) gp.style.display = 'none';
                if (ct) ct.textContent = targetName + ' must: ' + pendingPunishment;
                if (cp) cp.style.display = '';
                if (cb) {
                    var handler = function() {
                        modal.style.display = 'none';
                        cb.removeEventListener('click', handler);
                        setTimeout(function() { checkForNewLines(); }, 300);
                    };
                    cb.addEventListener('click', handler);
                }
            });
        }, 1000);
    }

    /* ============================================
       Toast
       ============================================ */
    function showToast(message) {
        var toast = document.createElement('div');
        toast.className = 'bingo-toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        toast.offsetHeight;
        toast.classList.add('show');

        setTimeout(function() {
            toast.classList.remove('show');
            setTimeout(function() {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 400);
        }, 3000);
    }

    /* ============================================
       Line Detection & Celebration
       ============================================ */
    function checkForNewLines() {
        if (!guestCode) return;
        var newLines = BingoEngine.checkLines(guestCode);

        if (newLines.length === 0) {
            var stats = BingoEngine.getGuestStats(guestCode);
            if (stats.isFullHouse) {
                BingoEngine.completeFullHouse(guestCode, guestName, guestTeam);
                showFullHouseCelebration();
            }
            return;
        }

        pendingLineData = newLines[0];
        showLineCelebration(newLines[0]);
    }

    function showLineCelebration(lineData) {
        var modal = document.getElementById('bingoLineModal');
        var celebration = document.getElementById('bingoLineCelebration');
        var punishmentPicker = document.getElementById('bingoPunishmentPicker');
        var guestPicker = document.getElementById('bingoGuestPicker');
        var confirmPanel = document.getElementById('bingoLineConfirm');
        var descEl = document.getElementById('bingoLineDesc');
        var closeBtn = document.getElementById('bingoLineClose');

        if (!modal) return;

        var stats = BingoEngine.getGuestStats(guestCode);
        var lineNumber = stats.lines + 1;

        if (celebration) {
            celebration.style.display = '';
            celebration.querySelector('h2').innerHTML = '&#127881; YOU GOT A LINE! &#127881;';
        }
        if (descEl) descEl.textContent = 'Line ' + lineNumber + ' &mdash; +2 bonus points!';

        if (punishmentPicker) punishmentPicker.style.display = 'none';
        if (guestPicker) guestPicker.style.display = 'none';
        modal.style.display = 'flex';
        modal.classList.remove('fullhouse');

        spawnConfetti();
        if (typeof triggerConfetti === 'function') triggerConfetti();

        // Skip team punishment — just record the line + close on confirm
        BingoEngine.completeLine({
            guestCode: guestCode,
            guestName: guestName,
            team: guestTeam,
            lineType: lineData.lineType,
            lineIndex: lineData.lineIndex,
            rewardChosen: '',
            punishmentTarget: '',
            punishmentDesc: ''
        });

        // Show confirm panel with auto-close
        if (confirmPanel && closeBtn) {
            setTimeout(function() {
                confirmPanel.style.display = '';
                var confirmText = document.getElementById('bingoLineConfirmText');
                if (confirmText) confirmText.textContent = 'Line claimed! +2 bonus points added.';
                closeBtn.onclick = function() {
                    modal.style.display = 'none';
                    pendingLineData = null;
                    checkForNewLines();
                };
            }, 1500);
        }
    }

    function showTeamPicker() {
        var celebration = document.getElementById('bingoLineCelebration');
        var guestPicker = document.getElementById('bingoGuestPicker');
        var guestGrid = document.getElementById('bingoGuestGrid');
        if (!guestPicker || !guestGrid) return;

        if (celebration) celebration.style.display = 'none';

        // Update heading
        var heading = guestPicker.querySelector('h3');
        if (heading) heading.textContent = 'Which team gets punished?';

        guestGrid.innerHTML = '';

        var teamKeys = Object.keys(TEAM_CONFIG);
        for (var i = 0; i < teamKeys.length; i++) {
            (function(teamKey) {
                // Don't show your own team
                if (teamKey === guestTeam) return;
                var teamInfo = TEAM_CONFIG[teamKey];
                if (!teamInfo) return;

                var btn = document.createElement('button');
                btn.className = 'bingo-guest-btn';
                var colour = TEAM_COLOURS[teamKey] || '#888';
                var teamName = teamInfo.name || teamKey;

                btn.innerHTML = '<span class="bingo-guest-avatar" style="background:' + colour + '">' + teamName.charAt(0) + '</span>'
                    + '<span class="bingo-guest-name">' + escapeHtml(teamName) + '</span>';

                btn.addEventListener('click', function() {
                    finishLine(teamName);
                });
                guestGrid.appendChild(btn);
            })(teamKeys[i]);
        }

        guestPicker.style.display = '';
    }

    /* Show person picker — used by square punishment flow */
    function showVictimPicker(callback) {
        var celebration = document.getElementById('bingoLineCelebration');
        var guestPicker = document.getElementById('bingoGuestPicker');
        var guestGrid = document.getElementById('bingoGuestGrid');
        if (!guestPicker || !guestGrid) return;

        if (celebration) celebration.style.display = 'none';

        // Update heading
        var heading = guestPicker.querySelector('h3');
        if (heading) heading.textContent = 'Who gets punished?';

        guestGrid.innerHTML = '';

        var allGuests = Object.keys(GUEST_DATA);
        for (var i = 0; i < allGuests.length; i++) {
            (function(code) {
                if (code === guestCode) return;
                var guest = GUEST_DATA[code];
                if (!guest) return;

                var btn = document.createElement('button');
                btn.className = 'bingo-guest-btn';

                var initial = guest.name.charAt(0).toUpperCase();
                var team = PLAYERS[guest.name] || '';
                var colour = TEAM_COLOURS[team] || '#888';

                btn.innerHTML = '<span class="bingo-guest-avatar" style="background:' + colour + '">' + initial + '</span>'
                    + '<span class="bingo-guest-name">' + escapeHtml(guest.name) + '</span>';

                btn.addEventListener('click', function() {
                    if (callback) {
                        callback(guest.name);
                    }
                });
                guestGrid.appendChild(btn);
            })(allGuests[i]);
        }

        guestPicker.style.display = '';
    }

    function finishLine(targetName) {
        var guestPicker = document.getElementById('bingoGuestPicker');
        var confirmPanel = document.getElementById('bingoLineConfirm');
        var confirmText = document.getElementById('bingoLineConfirmText');
        var closeBtn = document.getElementById('bingoLineClose');

        if (guestPicker) guestPicker.style.display = 'none';

        BingoEngine.completeLine({
            guestCode: guestCode,
            guestName: guestName,
            team: guestTeam,
            lineType: pendingLineData.lineType,
            lineIndex: pendingLineData.lineIndex,
            rewardChosen: '',
            punishmentTarget: targetName,
            punishmentDesc: pendingPunishment
        });

        // Save punishment to Firebase
        var punishmentData = {
            assignedBy: guestName,
            assignedByCode: guestCode,
            victim: targetName,
            description: pendingPunishment,
            completed: false,
            timestamp: Date.now()
        };

        if (typeof BingoEngine.addPunishment === 'function') {
            BingoEngine.addPunishment(punishmentData);
        } else {
            FirebaseSync.push('bingo/punishments', punishmentData);
        }

        if (confirmText) {
            confirmText.textContent = targetName + ' must: ' + pendingPunishment;
        }
        if (confirmPanel) confirmPanel.style.display = '';

        if (closeBtn) {
            var handler = function() {
                var modal = document.getElementById('bingoLineModal');
                if (modal) modal.style.display = 'none';
                closeBtn.removeEventListener('click', handler);
                setTimeout(function() { checkForNewLines(); }, 300);
            };
            closeBtn.addEventListener('click', handler);
        }
    }

    /* ============================================
       Full House Celebration
       ============================================ */
    function showFullHouseCelebration() {
        var modal = document.getElementById('bingoLineModal');
        var celebration = document.getElementById('bingoLineCelebration');
        var punishmentPicker = document.getElementById('bingoPunishmentPicker');
        var guestPicker = document.getElementById('bingoGuestPicker');
        var confirmPanel = document.getElementById('bingoLineConfirm');
        var descEl = document.getElementById('bingoLineDesc');
        var closeBtn = document.getElementById('bingoLineClose');

        if (!modal) return;

        if (celebration) {
            celebration.style.display = '';
            celebration.querySelector('h2').innerHTML = '&#128081; FULL HOUSE! &#128081;';
        }
        if (descEl) {
            descEl.style.whiteSpace = 'normal';
            descEl.textContent = 'YOU LEGEND. +5 bonus points. Custom trophy at the Saturday awards ceremony.';
        }
        if (punishmentPicker) punishmentPicker.style.display = 'none';
        if (guestPicker) guestPicker.style.display = 'none';
        if (confirmPanel) confirmPanel.style.display = 'none';

        modal.style.display = 'flex';
        modal.classList.add('fullhouse');

        document.body.classList.add('screen-shake');
        setTimeout(function() { document.body.classList.remove('screen-shake'); }, 1000);

        spawnConfetti();
        if (typeof triggerConfetti === 'function') {
            triggerConfetti();
            setTimeout(function() { triggerConfetti(); }, 500);
            setTimeout(function() { triggerConfetti(); }, 1000);
        }

        if (confirmPanel && closeBtn) {
            setTimeout(function() {
                confirmPanel.style.display = '';
                var confirmText = document.getElementById('bingoLineConfirmText');
                if (confirmText) confirmText.textContent = 'You are the undisputed ruler of the Ch\u00e2teau!';
                closeBtn.addEventListener('click', function handler() {
                    modal.style.display = 'none';
                    modal.classList.remove('fullhouse');
                    closeBtn.removeEventListener('click', handler);
                });
            }, 3000);
        }
    }

    /* ============================================
       Simple Confetti (DOM-based fallback)
       ============================================ */
    function spawnConfetti() {
        var colours = ['#f9a825', '#c62828', '#1565c0', '#424242', '#e91e63', '#4caf50', '#ff9800', '#9c27b0'];
        var container = document.createElement('div');
        container.className = 'bingo-confetti-container';
        document.body.appendChild(container);

        for (var i = 0; i < 40; i++) {
            var piece = document.createElement('div');
            piece.className = 'bingo-confetti-piece';
            piece.style.left = Math.random() * 100 + '%';
            piece.style.background = colours[Math.floor(Math.random() * colours.length)];
            piece.style.animationDelay = (Math.random() * 0.5) + 's';
            piece.style.animationDuration = (1.5 + Math.random() * 1.5) + 's';
            container.appendChild(piece);
        }

        setTimeout(function() {
            if (container.parentNode) container.parentNode.removeChild(container);
        }, 4000);
    }

    /* ============================================
       Punishment Board
       ============================================ */
    function renderPunishments() {
        var el = document.getElementById('bingoPunishments');
        if (!el) return;

        var punishments = null;

        if (typeof BingoEngine.getPunishments === 'function') {
            punishments = BingoEngine.getPunishments();
        }

        // Fallback: read from localStorage cache
        if (!punishments) {
            try {
                var bingoData = JSON.parse(localStorage.getItem('fb_bingo'));
                if (bingoData && bingoData.punishments) {
                    punishments = bingoData.punishments;
                }
            } catch(e) {}
        }

        // Also check lines for punishment data (backwards compat)
        var lines = BingoEngine.getLines();
        var lineKeys = Object.keys(lines);
        var linePunishments = [];
        for (var lk = 0; lk < lineKeys.length; lk++) {
            var ln = lines[lineKeys[lk]];
            if (ln.punishmentTarget && ln.punishmentDesc) {
                linePunishments.push({
                    _key: 'line_' + lineKeys[lk],
                    assignedBy: ln.guestName,
                    victim: ln.punishmentTarget,
                    description: ln.punishmentDesc,
                    completed: false,
                    timestamp: ln.timestamp
                });
            }
        }

        // Merge
        var allPunishments = [];
        if (punishments) {
            var pKeys = Object.keys(punishments);
            for (var i = 0; i < pKeys.length; i++) {
                var p = punishments[pKeys[i]];
                p._key = pKeys[i];
                allPunishments.push(p);
            }
        }

        for (var j = 0; j < linePunishments.length; j++) {
            var alreadyCovered = false;
            for (var k = 0; k < allPunishments.length; k++) {
                if (allPunishments[k].victim === linePunishments[j].victim &&
                    allPunishments[k].description === linePunishments[j].description) {
                    alreadyCovered = true;
                    break;
                }
            }
            if (!alreadyCovered) allPunishments.push(linePunishments[j]);
        }

        if (allPunishments.length === 0) {
            el.innerHTML = '';
            return;
        }

        allPunishments.sort(function(a, b) { return (b.timestamp || 0) - (a.timestamp || 0); });

        var html = '';
        for (var m = 0; m < allPunishments.length; m++) {
            var pun = allPunishments[m];
            var isCompleted = pun.completed;
            var victimTeam = PLAYERS[pun.victim] || '';
            var colour = TEAM_COLOURS[victimTeam] || '#888';
            var canMarkDone = false;

            if (guestCode) {
                var victimCode = null;
                var gdKeys = Object.keys(GUEST_DATA);
                for (var g = 0; g < gdKeys.length; g++) {
                    if (GUEST_DATA[gdKeys[g]].name === pun.victim) {
                        victimCode = gdKeys[g];
                        break;
                    }
                }
                canMarkDone = (victimCode === guestCode || Auth.isAdmin()) && !isCompleted;
            }

            html += '<div class="bingo-punishment-item' + (isCompleted ? ' completed' : '') + '" style="border-left: 3px solid ' + colour + '">'
                + '<div class="bingo-punishment-info">'
                + '<strong>' + escapeHtml(pun.victim) + '</strong> must: '
                + '<em>' + escapeHtml(pun.description) + '</em>'
                + '<span class="bingo-punishment-by"> - assigned by ' + escapeHtml(pun.assignedBy) + '</span>'
                + '</div>';

            if (canMarkDone) {
                html += '<button class="bingo-punishment-done" data-key="' + escapeHtml(pun._key || '') + '">Done &#10003;</button>';
            } else if (isCompleted) {
                html += '<span class="bingo-punishment-status">&#10003; Complete</span>';
            }

            html += '</div>';
        }

        el.innerHTML = html;

        // Bind done buttons
        var doneBtns = el.querySelectorAll('.bingo-punishment-done');
        for (var d = 0; d < doneBtns.length; d++) {
            doneBtns[d].addEventListener('click', function() {
                var key = this.getAttribute('data-key');
                if (!key || key.indexOf('line_') === 0) return;

                FirebaseSync.update('bingo/punishments/' + key, { completed: true, completedAt: Date.now() });

                FirebaseSync.push('feed', {
                    type: 'bingo',
                    text: 'Punishment completed!',
                    author: guestName,
                    team: guestTeam,
                    timestamp: Date.now()
                });

                showToast('Punishment marked as done!');
            });
        }
    }

    /* ============================================
       Leaderboard
       ============================================ */
    function renderLeaderboard() {
        var el = document.getElementById('bingoLeaderboard');
        if (!el) return;

        var lb = BingoEngine.getLeaderboard();
        if (!lb || lb.length === 0) {
            el.innerHTML = '';
            return;
        }

        var top5 = lb.slice(0, 5);
        var html = '<div class="bingo-leaderboard-list">';
        for (var i = 0; i < top5.length; i++) {
            var entry = top5[i];
            var team = PLAYERS[entry.name] || '';
            var colour = TEAM_COLOURS[team] || '#888';
            var medal = i === 0 ? '&#129351;' : (i === 1 ? '&#129352;' : (i === 2 ? '&#129353;' : ''));
            var isMe = entry.code === guestCode;

            html += '<div class="bingo-lb-row' + (isMe ? ' bingo-lb-me' : '') + '">'
                + '<span class="bingo-lb-rank">' + (medal || (i + 1)) + '</span>'
                + '<span class="bingo-lb-dot" style="background:' + colour + '"></span>'
                + '<span class="bingo-lb-name">' + escapeHtml(entry.name) + '</span>'
                + '<span class="bingo-lb-claims">' + entry.claims + ' claim' + (entry.claims !== 1 ? 's' : '') + '</span>'
                + (entry.lines > 0 ? '<span class="bingo-lb-lines">' + entry.lines + ' line' + (entry.lines !== 1 ? 's' : '') + '</span>' : '')
                + '</div>';
        }
        html += '</div>';
        el.innerHTML = html;
    }

    /* ============================================
       Activity Feed
       ============================================ */
    function renderActivity() {
        var feedEl = document.getElementById('bingoFeed');
        if (!feedEl) return;

        var feedData = null;
        try { feedData = JSON.parse(localStorage.getItem('fb_feed')); } catch(e) {}
        if (!feedData) {
            feedEl.innerHTML = '';
            return;
        }

        var bingoItems = [];
        var fKeys = Object.keys(feedData);
        for (var i = 0; i < fKeys.length; i++) {
            var item = feedData[fKeys[i]];
            if (item && item.type === 'bingo') {
                bingoItems.push(item);
            }
        }

        bingoItems.sort(function(a, b) { return (b.timestamp || 0) - (a.timestamp || 0); });
        bingoItems = bingoItems.slice(0, 10);

        if (bingoItems.length === 0) {
            feedEl.innerHTML = '';
            return;
        }

        var html = '';
        for (var j = 0; j < bingoItems.length; j++) {
            var bi = bingoItems[j];
            var ago = relativeTimeBingo(bi.timestamp);
            html += '<div class="bingo-feed-item">'
                + '<span class="bingo-feed-text">' + escapeHtml(bi.text) + '</span>'
                + '<span class="bingo-feed-time">' + ago + '</span>'
                + '</div>';
        }
        feedEl.innerHTML = html;
    }

    function relativeTimeBingo(timestamp) {
        if (!timestamp) return '';
        var diff = Math.floor((Date.now() - timestamp) / 1000);
        if (diff < 60) return 'just now';
        if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
        if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
        return Math.floor(diff / 86400) + 'd ago';
    }

    /* ============================================
       Stats Bar
       ============================================ */
    function updateStats() {
        var youEl = document.getElementById('bsYou');
        var ringFill = document.getElementById('bingoRingFill');
        var myClaims = 0;
        var myLines = 0;

        if (guestCode) {
            var stats = BingoEngine.getGuestStats(guestCode);
            myClaims = stats.claims;
            myLines = stats.lines;
        }

        // Update progress ring
        if (youEl) youEl.textContent = myClaims;
        if (ringFill) {
            var circumference = 2 * Math.PI * 42; // r=42
            var progress = myClaims / 16;
            ringFill.style.strokeDashoffset = circumference * (1 - progress);
        }

        // Update prize track nodes
        var nodes = document.querySelectorAll('.prize-node');
        var connectors = document.querySelectorAll('.prize-connector');
        for (var n = 0; n < nodes.length; n++) {
            var milestone = nodes[n].getAttribute('data-milestone');
            var isUnlocked = false;
            if (milestone === 'square') {
                isUnlocked = myClaims >= 1;
            } else if (milestone === 'line') {
                isUnlocked = myLines >= 1;
            } else if (milestone === 'full') {
                isUnlocked = myClaims >= 16;
            }
            if (isUnlocked) {
                nodes[n].classList.add('unlocked');
            } else {
                nodes[n].classList.remove('unlocked');
            }
        }
        for (var c = 0; c < connectors.length; c++) {
            if (c === 0) {
                connectors[c].classList.toggle('active', myClaims >= 1);
            } else {
                connectors[c].classList.toggle('active', myLines >= 1);
            }
        }
    }

    /* ============================================
       Admin Panel (admin only)
       ============================================ */
    function initBingoAdmin() {
        if (!Auth.isAdmin()) return;

        // Show admin bar at top
        var adminBar = document.getElementById('bingoAdminBar');
        if (adminBar) adminBar.style.display = '';

        // Show admin claims panel
        var adminEl = document.getElementById('bingoAdmin');
        if (adminEl) adminEl.style.display = 'block';
        renderBingoAdmin();

        BingoEngine.onUpdate(function() {
            renderBingoAdmin();
        });

        // Preview toggle
        var previewBtn = document.getElementById('bingoPreviewToggle');
        if (previewBtn) {
            previewBtn.addEventListener('click', function() {
                unlocked = !unlocked;
                previewBtn.innerHTML = unlocked ? '&#128065; See Guest View' : '&#128065; See Admin View';

                // Remove locked banner if switching back to unlocked
                var banner = document.querySelector('.bingo-locked-banner');
                if (banner && unlocked) banner.parentNode.removeChild(banner);

                // Show/hide prize track
                var prizes = document.querySelector('.bingo-prizes');
                if (prizes) prizes.style.display = unlocked ? '' : 'none';

                // Show/hide progress ring
                var progressEl = document.getElementById('bingoProgress');
                if (progressEl) progressEl.style.display = unlocked ? '' : 'none';

                renderGrid();
                if (unlocked) {
                    updateStats();
                    renderLeaderboard();
                    renderActivity();
                    renderPunishments();
                    updateSectionVisibility();
                } else {
                    var sections = ['.bingo-punishments-section', '.bingo-leaderboard-section', '.bingo-activity-section'];
                    for (var s = 0; s < sections.length; s++) {
                        var sec = document.querySelector(sections[s]);
                        if (sec) sec.style.display = 'none';
                    }
                }
            });
        }
    }

    function renderBingoAdmin() {
        var claimsEl = document.getElementById('bingoAdminClaims');
        var countEl = document.getElementById('bingoAdminCount');
        if (!claimsEl) return;

        var claims = BingoEngine.getClaims();
        // Flatten nested claims into a list
        var flatClaims = [];
        var cellKeys = Object.keys(claims);
        for (var ci = 0; ci < cellKeys.length; ci++) {
            var cellIdx = cellKeys[ci];
            var cellClaims = claims[cellIdx];
            if (!cellClaims) continue;
            var gKeys = Object.keys(cellClaims);
            for (var gi = 0; gi < gKeys.length; gi++) {
                var c = cellClaims[gKeys[gi]];
                flatClaims.push({ idx: cellIdx, code: gKeys[gi], claim: c });
            }
        }

        if (countEl) countEl.textContent = flatClaims.length + ' claim' + (flatClaims.length !== 1 ? 's' : '');

        if (flatClaims.length === 0) {
            claimsEl.innerHTML = '<p class="bingo-admin-empty">No claims yet.</p>';
            return;
        }

        flatClaims.sort(function(a, b) {
            return (b.claim.timestamp || 0) - (a.claim.timestamp || 0);
        });

        var html = '';
        for (var i = 0; i < flatClaims.length; i++) {
            var fc = flatClaims[i];
            var itemText = items[fc.idx] || 'Unknown item';
            var ago = relativeTimeBingo(fc.claim.timestamp);
            var revoked = fc.claim.revoked;
            var dataKey = fc.idx + '/' + fc.code;

            html += '<div class="bingo-admin-claim' + (revoked ? ' revoked' : '') + '" data-key="' + dataKey + '">'
                + '<div class="bingo-admin-claim-info">'
                + '<span class="bingo-admin-claim-item">' + escapeHtml(itemText) + '</span>'
                + '<span class="bingo-admin-claim-meta">'
                + escapeHtml(fc.claim.claimedBy) + ' (' + escapeHtml(fc.claim.team || '?') + ') &middot; ' + ago
                + '</span>'
                + '</div>'
                + '<button class="bingo-admin-btn ' + (revoked ? 'bingo-admin-btn-restore' : 'bingo-admin-btn-revoke') + '" data-key="' + dataKey + '">'
                + (revoked ? 'Restore' : 'Revoke')
                + '</button>'
                + '</div>';
        }
        claimsEl.innerHTML = html;

        var btns = claimsEl.querySelectorAll('.bingo-admin-btn');
        for (var b = 0; b < btns.length; b++) {
            btns[b].addEventListener('click', function() {
                var key = this.getAttribute('data-key');
                var parts = key.split('/');
                var claimIdx = parts[0];
                var claimCode = parts[1];
                var allClaims = BingoEngine.getClaims();
                var cellClaims = allClaims[claimIdx];
                if (!cellClaims || !cellClaims[claimCode]) return;
                var claim = cellClaims[claimCode];

                if (claim.revoked) {
                    FirebaseSync.update('bingo/claims/' + claimIdx + '/' + claimCode, { revoked: null });
                } else {
                    FirebaseSync.update('bingo/claims/' + claimIdx + '/' + claimCode, { revoked: true, revokedBy: 'admin', revokedAt: Date.now() });

                    FirebaseSync.push('feed', {
                        type: 'bingo',
                        text: escapeHtml(claim.claimedBy) + '\'s claim was disputed: "' + (items[claimIdx] || '') + '" \uD83E\uDDD0',
                        author: 'Admin',
                        team: claim.team || '',
                        timestamp: Date.now()
                    });

                    var teamScores = Store.get('lb_teamScores', { titans: 0, spartans: 0, vikings: 0, gladiators: 0 });
                    var individualScores = Store.get('lb_individualScores', {});
                    var pointsLog = Store.get('lb_pointsLog', []);

                    individualScores[claim.claimedBy] = (individualScores[claim.claimedBy] || 0) - 1;
                    if (claim.team) {
                        teamScores[claim.team] = (teamScores[claim.team] || 0) - 1;
                    }

                    pointsLog.unshift({
                        type: 'individual',
                        target: claim.claimedBy,
                        amount: -1,
                        reason: 'Bingo claim revoked: ' + (items[claimIdx] || ''),
                        time: new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
                        timestamp: Date.now(),
                        category: 'challenges',
                        awardedBy: 'Admin'
                    });

                    Store.set('lb_teamScores', teamScores);
                    Store.set('lb_individualScores', individualScores);
                    Store.set('lb_pointsLog', pointsLog);
                    document.dispatchEvent(new CustomEvent('leaderboardUpdate'));
                }
            });
        }
    }
}

/* ============================================
   Boot
   ============================================ */
document.addEventListener('DOMContentLoaded', function() {
    initBingo();
});

/* Re-init after guest login so name/team are correct */
document.addEventListener('guestLoggedIn', function() {
    initBingo();
});
