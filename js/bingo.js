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

/* ---- Punishment tiers (line 1 / 2 / 3) ---- */
var BINGO_PUNISHMENTS = {
    1: [
        'Down your drink',
        'Speak in a French accent for 30 minutes',
        'Wear your clothes inside out until someone notices',
        'Give 5 genuine compliments to 5 different people in a row',
        'Do 20 press-ups right now'
    ],
    2: [
        'Swap an item of clothing with someone of your choice for the rest of the day',
        'Do a 60-second serenade to someone at dinner',
        'Wear a sign saying whatever you write for 1 hour',
        'Only speak in song lyrics for 30 minutes',
        'Do an impression of someone in the group (group votes who)'
    ],
    3: [
        'Let the group give you a makeover and stay like it for an hour',
        'Do the washing up for the whole group after dinner',
        'Stand on a chair and do a 2-minute stand-up comedy set about yourself',
        'Drink a mystery cocktail made by the group',
        'Announce everything you do out loud for an hour'
    ]
};

var BINGO_FULLHOUSE_REWARDS = [
    'King/Queen of the Chateau crown for the day',
    'Pick the music, pick who does washing up, sit at head of table',
    'Choose the group activity for the afternoon',
    'Immunity from the next punishment',
    'Everyone calls you by a title of your choosing for 24 hours'
];

/* ---- Team colour map ---- */
var TEAM_COLOURS = {
    titans:     '#f9a825',
    spartans:   '#c62828',
    vikings:    '#1565c0',
    gladiators: '#424242'
};

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

    // State for line-modal flow
    var pendingLineData = null;
    var pendingPunishment = '';
    var drawerIdx = -1;

    // Initial render
    renderGrid();
    updateStats();
    renderLeaderboard();
    renderActivity();
    renderPunishments();
    initBingoAdmin();

    // Live updates
    BingoEngine.onUpdate(function() {
        renderGrid();
        updateStats();
        renderLeaderboard();
        renderActivity();
        renderPunishments();
    });

    document.addEventListener('feedUpdate', function() {
        renderActivity();
    });

    // Listen for punishment updates if available
    if (typeof FirebaseSync !== 'undefined' && FirebaseSync.isConfigured()) {
        FirebaseSync.onUpdate('bingo/punishments', function() {
            renderPunishments();
        });
    }

    /* ============================================
       Grid
       ============================================ */
    function renderGrid() {
        grid.innerHTML = '';
        var claims = BingoEngine.getClaims();

        for (var i = 0; i < items.length; i++) {
            (function(idx) {
                var cell = document.createElement('div');
                cell.className = 'bingo-cell';
                var claim = claims[idx];
                var isRevoked = claim && claim.revoked;

                if (claim && !isRevoked) {
                    cell.classList.add('claimed');
                    if (claim.claimedByCode === guestCode) {
                        cell.classList.add('claimed-self');
                    }

                    // Team colour
                    var teamColour = TEAM_COLOURS[claim.team] || '#888';
                    cell.style.setProperty('--team-colour', teamColour);
                    cell.style.setProperty('--team-colour-bg', teamColour + '1F'); // ~12% opacity hex

                    // Photo indicator
                    if (claim.photoUrl) {
                        cell.classList.add('has-photo');
                    }

                    var textEl = document.createElement('span');
                    textEl.className = 'bingo-cell-text';
                    textEl.textContent = items[idx];
                    cell.appendChild(textEl);

                    var claimantEl = document.createElement('span');
                    claimantEl.className = 'bingo-cell-claimant';
                    claimantEl.innerHTML = '&#10003; ' + escapeHtml(claim.claimedBy);
                    if (claim.photoUrl) {
                        claimantEl.innerHTML += ' &#128247;';
                    }
                    cell.appendChild(claimantEl);
                } else {
                    cell.classList.add('unclaimed');
                    var textEl2 = document.createElement('span');
                    textEl2.className = 'bingo-cell-text';
                    textEl2.textContent = items[idx];
                    cell.appendChild(textEl2);

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

    /* ============================================
       Claim Drawer (bottom sheet)
       ============================================ */
    function openClaimDrawer(idx) {
        drawerIdx = idx;
        var backdrop = document.getElementById('bingoClaimBackdrop');
        var drawer  = document.getElementById('bingoClaimDrawer');
        var challengeEl = document.getElementById('bingoDrawerChallenge');
        var photoInput = document.getElementById('bingoPhotoInput');

        if (!drawer) return;

        if (challengeEl) challengeEl.textContent = items[idx];

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
                    FirebaseSync.update('bingo/claims/' + idx, { photoUrl: photoData.url });
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

        // Check for new lines after sync
        setTimeout(function() {
            checkForNewLines();
        }, 500);
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

        if (!modal) return;

        var stats = BingoEngine.getGuestStats(guestCode);
        var lineNumber = stats.lines + 1;
        var lineLabel = lineNumber === 1 ? '1st' : (lineNumber === 2 ? '2nd' : '3rd');
        var pts = lineNumber === 1 ? 10 : (lineNumber === 2 ? 15 : 20);

        if (descEl) descEl.textContent = 'Your ' + lineLabel + ' line! +' + pts + ' points!';

        if (celebration) celebration.style.display = '';
        if (punishmentPicker) punishmentPicker.style.display = 'none';
        if (guestPicker) guestPicker.style.display = 'none';
        if (confirmPanel) confirmPanel.style.display = 'none';
        modal.style.display = 'flex';

        spawnConfetti();
        if (typeof triggerConfetti === 'function') triggerConfetti();

        setTimeout(function() {
            showPunishmentPicker(lineNumber);
        }, 1500);
    }

    function showPunishmentPicker(lineNumber) {
        var celebration = document.getElementById('bingoLineCelebration');
        var punishmentPicker = document.getElementById('bingoPunishmentPicker');
        var cardsContainer = document.getElementById('bingoPunishmentCards');
        if (!punishmentPicker || !cardsContainer) return;

        if (celebration) celebration.style.display = 'none';

        var punishments = BINGO_PUNISHMENTS[Math.min(lineNumber, 3)] || BINGO_PUNISHMENTS[1];
        var shuffled = punishments.slice().sort(function() { return Math.random() - 0.5; });
        var picked = shuffled.slice(0, 3);

        cardsContainer.innerHTML = '';

        for (var i = 0; i < picked.length; i++) {
            (function(punishment) {
                var card = document.createElement('div');
                card.className = 'bingo-punishment-card face-down';
                card.innerHTML = '<span class="card-back">?</span><span class="card-front">' + escapeHtml(punishment) + '</span>';
                card.addEventListener('click', function() {
                    if (card.classList.contains('face-down')) {
                        card.classList.remove('face-down');
                        card.classList.add('flipped');
                        pendingPunishment = punishment;
                        setTimeout(function() {
                            showVictimPicker();
                        }, 800);
                    }
                });
                cardsContainer.appendChild(card);
            })(picked[i]);
        }

        punishmentPicker.style.display = '';
    }

    function showVictimPicker() {
        var punishmentPicker = document.getElementById('bingoPunishmentPicker');
        var guestPicker = document.getElementById('bingoGuestPicker');
        var guestGrid = document.getElementById('bingoGuestGrid');
        if (!guestPicker || !guestGrid) return;

        if (punishmentPicker) punishmentPicker.style.display = 'none';
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
                    finishLine(guest.name);
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
            celebration.querySelector('h2').innerHTML = '&#128081; KING/QUEEN OF THE CH&#194;TEAU! &#128081;';
        }
        if (descEl) descEl.textContent = 'FULL HOUSE! +50 points! You absolute legend!';
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
            el.innerHTML = '<p class="bingo-feed-empty">No punishments yet. Complete a line to dish one out!</p>';
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
                + '<span class="bingo-punishment-by"> &mdash; assigned by ' + escapeHtml(pun.assignedBy) + '</span>'
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
            el.innerHTML = '<p class="bingo-feed-empty">No claims yet. Be the first!</p>';
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
            feedEl.innerHTML = '<p class="bingo-feed-empty">No bingo activity yet. Be the first to claim!</p>';
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
            feedEl.innerHTML = '<p class="bingo-feed-empty">No bingo activity yet. Be the first to claim!</p>';
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
        var linesEl = document.getElementById('bsLines');
        var teamRankEl = document.getElementById('bsTeamRank');
        var totalEl = document.getElementById('bsTotalClaims');

        if (guestCode) {
            var stats = BingoEngine.getGuestStats(guestCode);
            if (youEl) youEl.textContent = stats.claims + '/16';
            if (linesEl) linesEl.textContent = stats.lines;
        }

        var claims = BingoEngine.getClaims();
        var totalClaims = 0;
        var teamClaims = {};
        var claimKeys = Object.keys(claims);
        for (var i = 0; i < claimKeys.length; i++) {
            var c = claims[claimKeys[i]];
            if (c && !c.revoked) {
                totalClaims++;
                if (c.team) {
                    teamClaims[c.team] = (teamClaims[c.team] || 0) + 1;
                }
            }
        }
        if (totalEl) totalEl.textContent = totalClaims + '/16';

        if (teamRankEl && guestTeam) {
            var teams = Object.keys(teamClaims).sort(function(a, b) {
                return (teamClaims[b] || 0) - (teamClaims[a] || 0);
            });
            var rank = teams.indexOf(guestTeam) + 1;
            if (rank === 0) rank = Object.keys(TEAM_COLOURS).length;
            teamRankEl.textContent = '#' + rank;
        }
    }

    /* ============================================
       Admin Panel (admin only)
       ============================================ */
    function initBingoAdmin() {
        if (!Auth.isAdmin()) return;
        var adminEl = document.getElementById('bingoAdmin');
        if (!adminEl) return;
        adminEl.style.display = 'block';
        renderBingoAdmin();

        BingoEngine.onUpdate(function() {
            renderBingoAdmin();
        });
    }

    function renderBingoAdmin() {
        var claimsEl = document.getElementById('bingoAdminClaims');
        var countEl = document.getElementById('bingoAdminCount');
        if (!claimsEl) return;

        var claims = BingoEngine.getClaims();
        var claimKeys = Object.keys(claims);

        if (countEl) countEl.textContent = claimKeys.length + ' claim' + (claimKeys.length !== 1 ? 's' : '');

        if (claimKeys.length === 0) {
            claimsEl.innerHTML = '<p class="bingo-admin-empty">No claims yet.</p>';
            return;
        }

        claimKeys.sort(function(a, b) {
            return (claims[b].timestamp || 0) - (claims[a].timestamp || 0);
        });

        var html = '';
        for (var i = 0; i < claimKeys.length; i++) {
            var idx = claimKeys[i];
            var claim = claims[idx];
            var itemText = items[idx] || 'Unknown item';
            var ago = relativeTimeBingo(claim.timestamp);
            var revoked = claim.revoked;

            html += '<div class="bingo-admin-claim' + (revoked ? ' revoked' : '') + '" data-idx="' + idx + '">'
                + '<div class="bingo-admin-claim-info">'
                + '<span class="bingo-admin-claim-item">' + escapeHtml(itemText) + '</span>'
                + '<span class="bingo-admin-claim-meta">'
                + escapeHtml(claim.claimedBy) + ' (' + escapeHtml(claim.team || '?') + ') &middot; ' + ago
                + '</span>'
                + '</div>'
                + '<button class="bingo-admin-btn ' + (revoked ? 'bingo-admin-btn-restore' : 'bingo-admin-btn-revoke') + '" data-idx="' + idx + '">'
                + (revoked ? 'Restore' : 'Revoke')
                + '</button>'
                + '</div>';
        }
        claimsEl.innerHTML = html;

        var btns = claimsEl.querySelectorAll('.bingo-admin-btn');
        for (var b = 0; b < btns.length; b++) {
            btns[b].addEventListener('click', function() {
                var claimIdx = this.getAttribute('data-idx');
                var claim = BingoEngine.getClaims()[claimIdx];
                if (!claim) return;

                if (claim.revoked) {
                    FirebaseSync.update('bingo/claims/' + claimIdx, { revoked: null });
                } else {
                    FirebaseSync.update('bingo/claims/' + claimIdx, { revoked: true, revokedBy: 'admin', revokedAt: Date.now() });

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
