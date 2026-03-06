/* ============================================
   Home Page JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    initCinematicOverlay();
    initLoadingScreen();
    initPasswordProtection();
    initCountdown();
    initRegistration();
    initGuestLogin();
    if (!isFirstTimeVisitor()) {
        showAuthModal('login');
    }
    initLiveStats();
});

/* Cinematic Overlay — first-time visitor welcome sequence */
function initCinematicOverlay() {
    // Only show on first-time visitors
    if (!isFirstTimeVisitor()) return;

    const overlay = document.getElementById('cinematic-overlay');
    if (!overlay) return;

    overlay.style.display = 'flex';

    // Spawn particles
    const pc = document.getElementById('co-particles');
    for (let i = 0; i < 20; i++) {
        const p = document.createElement('div');
        p.className = 'cp';
        p.style.left = (5 + Math.random() * 90) + '%';
        p.style.animationDuration = (8 + Math.random() * 14) + 's';
        p.style.animationDelay = -(Math.random() * 10) + 's';
        pc.appendChild(p);
    }

    // Animate lines in sequence
    const l1 = document.getElementById('co-l1');
    const l2 = document.getElementById('co-l2');
    const l3 = document.getElementById('co-l3');

    // Add title class to l2
    if (l2) l2.classList.add('co-title');

    setTimeout(() => l1 && l1.classList.add('visible'), 400);
    setTimeout(() => l2 && l2.classList.add('visible'), 1400);
    setTimeout(() => l3 && l3.classList.add('visible'), 2200);

    // Fade out overlay, then show auth modal
    setTimeout(() => {
        overlay.classList.add('fade-out');
        setTimeout(() => {
            overlay.style.display = 'none';
            showAuthModal('register');
        }, 800);
    }, 4000);
}

/* Loading Screen */
function initLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (!loadingScreen) return;
    if (sessionStorage.getItem('loadingShown')) {
        loadingScreen.classList.add('hidden');
        return;
    }
    sessionStorage.setItem('loadingShown', 'true');
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
    }, 1800);
}

/* Password Protection */
function initPasswordProtection() {
    const modal = document.getElementById('password-modal');
    const form = document.getElementById('password-form');
    const errorEl = document.getElementById('password-error');

    const SITE_PASSWORD = null; // Set to 'yourpassword' to enable, null to disable

    if (!modal || !form || !SITE_PASSWORD) return;

    if (localStorage.getItem('siteAuthenticated') === 'true') {
        modal.style.display = 'none';
        return;
    }

    modal.style.display = 'flex';

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const input = document.getElementById('site-password');
        if (input.value === SITE_PASSWORD) {
            localStorage.setItem('siteAuthenticated', 'true');
            modal.style.display = 'none';
            triggerConfetti();
        } else {
            errorEl.style.display = 'block';
            input.value = '';
            input.focus();
        }
    });
}

/* Countdown Timer with Milestones */
function initCountdown() {
    const tripDate = new Date('2026-04-29T08:25:00+02:00').getTime();

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

    // Create milestone badge container
    const countdownEl = daysEl.closest('.countdown');
    let milestoneBadge = document.getElementById('countdown-milestone');
    if (!milestoneBadge && countdownEl) {
        milestoneBadge = document.createElement('div');
        milestoneBadge.id = 'countdown-milestone';
        milestoneBadge.className = 'countdown-milestone';
        countdownEl.parentNode.insertBefore(milestoneBadge, countdownEl.nextSibling);
    }

    let lastMilestone = null;

    function getMilestone(daysLeft) {
        if (daysLeft <= 0) return { text: "IT'S HERE!", emoji: '\uD83C\uDF89\uD83C\uDF8A', cls: 'milestone-now' };
        if (daysLeft === 1) return { text: 'TOMORROW!', emoji: '\uD83D\uDE31', cls: 'milestone-tomorrow' };
        if (daysLeft <= 7) return { text: 'One week to go!', emoji: '\uD83D\uDD25', cls: 'milestone-week' };
        if (daysLeft <= 30) return { text: 'One month to go!', emoji: '\u26A1', cls: 'milestone-month' };
        return null;
    }

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = tripDate - now;
        const daysLeft = Math.floor(distance / (1000 * 60 * 60 * 24));

        if (distance < 0) {
            // Trip has started — show which day we're on
            var tripStart = new Date('2026-04-29T00:00:00+02:00').getTime();
            var tripEnd = new Date('2026-05-04T23:59:59+02:00').getTime();
            var dayNumber = Math.floor((now - tripStart) / (1000 * 60 * 60 * 24)) + 1;
            var countdownWrap = daysEl.closest('.countdown');
            if (now < tripEnd && countdownWrap) {
                countdownWrap.innerHTML =
                    '<div class="countdown-live">' +
                    '<span class="countdown-live-day">Day ' + Math.min(dayNumber, 6) + ' of 6</span>' +
                    '<span class="countdown-live-sub">The adventure is happening!</span>' +
                    '</div>';
            } else if (countdownWrap) {
                countdownWrap.innerHTML =
                    '<div class="countdown-live">' +
                    '<span class="countdown-live-day">What a trip!</span>' +
                    '<span class="countdown-live-sub">Thanks for the memories</span>' +
                    '</div>';
            }
            // Auto-trigger confetti when countdown first hits zero
            if (!Store.get('countdownConfettiFired', false)) {
                Store.set('countdownConfettiFired', true);
                if (typeof triggerConfetti === 'function') triggerConfetti();
            }
            clearInterval(countdownInterval);
            return;
        } else {
            daysEl.textContent = daysLeft.toString().padStart(3, '0');
            hoursEl.textContent = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
            minutesEl.textContent = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
            secondsEl.textContent = Math.floor((distance % (1000 * 60)) / 1000).toString().padStart(2, '0');
        }

        // Update milestone badge
        if (milestoneBadge) {
            const milestone = getMilestone(distance < 0 ? 0 : daysLeft);
            const milestoneKey = milestone ? milestone.text : null;

            if (milestoneKey !== lastMilestone) {
                lastMilestone = milestoneKey;
                if (milestone) {
                    milestoneBadge.className = 'countdown-milestone ' + milestone.cls + ' milestone-visible';
                    milestoneBadge.innerHTML = '<span class="milestone-emoji">' + milestone.emoji + '</span>' +
                        '<span class="milestone-text">' + milestone.text + '</span>';
                } else {
                    milestoneBadge.className = 'countdown-milestone';
                    milestoneBadge.innerHTML = '';
                }
            }
        }
    }

    updateCountdown();
    var countdownInterval = setInterval(updateCountdown, 1000);

    // Rotating countdown tips
    var tips = [
        'Start practising your French!',
        'Pack your swimwear — there\'s a pool!',
        'Got your fancy dress sorted?',
        'Book those flights if you haven\'t!',
        'Add a song to the trip playlist!',
        'Leave Joe a message on the Social wall!',
        'Sign up for activities on the Schedule page!'
    ];
    var tipEl = document.createElement('p');
    tipEl.className = 'countdown-tip';
    var heroButtons = document.querySelector('.hero-buttons');
    if (heroButtons && countdownEl) {
        countdownEl.parentNode.insertBefore(tipEl, heroButtons);
        var tipIdx = Math.floor(Math.random() * tips.length);
        tipEl.textContent = tips[tipIdx];
        setInterval(function () {
            tipEl.style.opacity = '0';
            tipEl.style.transform = 'translateY(8px)';
            setTimeout(function () {
                tipEl.style.transition = 'none';
                tipEl.style.transform = 'translateY(-8px)';
                tipEl.offsetHeight; // force reflow
                tipEl.style.transition = '';
                tipIdx = (tipIdx + 1) % tips.length;
                tipEl.textContent = tips[tipIdx];
                tipEl.style.opacity = '1';
                tipEl.style.transform = '';
            }, 400);
        }, 6000);
    }
}

/* ── Auth modal controller ── */
function showAuthModal(mode) {
  const modal = document.getElementById('auth-modal');
  if (!modal) return;
  modal.style.display = 'flex';

  if (mode === 'register') {
    showAuthStep('auth-step-1');
    populateNameDropdown();
  } else {
    showAuthStep('auth-step-login');
    const code = localStorage.getItem(AUTH_KEYS.guestCode);
    if (code && GUEST_DATA[code]) {
      const el = document.getElementById('auth-return-name');
      if (el) el.textContent = 'Welcome back, ' + GUEST_DATA[code].name + '! 👋';
    }
  }
}

function showAuthStep(stepId) {
  document.querySelectorAll('.auth-step').forEach(s => s.style.display = 'none');
  const step = document.getElementById(stepId);
  if (step) step.style.display = 'flex';
}

function populateNameDropdown() {
  const select = document.getElementById('auth-name-select');
  if (!select) return;
  while (select.options.length > 1) select.remove(1);
  const sorted = Object.entries(GUEST_DATA).sort((a, b) =>
    a[1].fullName.localeCompare(b[1].fullName)
  );
  sorted.forEach(([code, guest]) => {
    const opt = document.createElement('option');
    opt.value = code;
    opt.textContent = guest.fullName;
    select.appendChild(opt);
  });
}

function prefillProfileStep(code) {
  const guest = GUEST_DATA[code];
  if (!guest) return;
  const ni = document.getElementById('auth-nickname');
  const bi = document.getElementById('auth-bio');
  const av = document.getElementById('auth-avatar-preview');
  if (ni) ni.value = (guest.nickname && guest.nickname !== 'TBA') ? guest.nickname : '';
  if (bi) bi.value = guest.bio || '';
  const slug = code.toLowerCase();
  const savedPhoto = localStorage.getItem('guestPhoto_' + slug);
  if (av && savedPhoto) {
    const img = document.createElement('img');
    img.src = savedPhoto;
    av.innerHTML = '';
    av.appendChild(img);
  } else if (av) {
    av.textContent = (guest.name || '?')[0].toUpperCase();
  }
}

const RESET_CODE = 'joe30reset';

function initRegistration() {
  let selectedCode = null;
  let isResettingPassword = false;

  /* Step 1: name selection */
  const select = document.getElementById('auth-name-select');
  const step1Next = document.getElementById('auth-step1-next');
  if (select && step1Next) {
    select.addEventListener('change', () => {
      selectedCode = select.value || null;
      step1Next.disabled = !selectedCode;
    });
    step1Next.addEventListener('click', () => {
      if (!selectedCode) return;
      const guest = GUEST_DATA[selectedCode];
      const nameEl = document.getElementById('auth-welcome-name');
      if (nameEl) nameEl.textContent = 'Hey ' + guest.name + '! 👋';
      showAuthStep('auth-step-2');
    });
  }

  /* Step 2: password */
  const pw = document.getElementById('auth-password');
  const pwc = document.getElementById('auth-password-confirm');
  const pwErr = document.getElementById('auth-pw-error');
  const step2Next = document.getElementById('auth-step2-next');
  const step2Back = document.getElementById('auth-step2-back');

  if (step2Back) step2Back.addEventListener('click', () => showAuthStep('auth-step-1'));

  if (step2Next && pw && pwc && pwErr) {
    step2Next.addEventListener('click', async () => {
      pwErr.style.display = 'none';
      if (pw.value.length < 4) {
        pwErr.textContent = 'Password must be at least 4 characters';
        pwErr.style.display = 'block'; return;
      }
      if (pw.value !== pwc.value) {
        pwErr.textContent = "Passwords don't match";
        pwErr.style.display = 'block'; return;
      }
      const hash = await hashPassword(pw.value);
      localStorage.setItem(AUTH_KEYS.pwHash, hash);
      if (!isResettingPassword) {
        localStorage.setItem(AUTH_KEYS.guestCode, selectedCode);
        prefillProfileStep(selectedCode);
        showAuthStep('auth-step-3');
      } else {
        isResettingPassword = false;
        const code = localStorage.getItem(AUTH_KEYS.guestCode);
        localStorage.setItem(AUTH_KEYS.registered, 'true');
        document.getElementById('auth-modal').style.display = 'none';
        document.dispatchEvent(new CustomEvent('guestLoggedIn', { detail: { code } }));
      }
    });
  }

  /* Step 3: profile */
  const photoInput = document.getElementById('auth-photo-input');
  const avatarPreview = document.getElementById('auth-avatar-preview');

  if (photoInput && avatarPreview) {
    photoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = document.createElement('img');
        img.src = ev.target.result;
        avatarPreview.innerHTML = '';
        avatarPreview.appendChild(img);
        const slug = selectedCode ? selectedCode.toLowerCase() : 'guest';
        if (typeof compressProfilePhoto === 'function') {
          compressProfilePhoto(file, (compressed) => {
            localStorage.setItem('guestPhoto_' + slug, compressed);
          });
        } else {
          localStorage.setItem('guestPhoto_' + slug, ev.target.result);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  const step3Done = document.getElementById('auth-step3-done');
  if (step3Done) {
    step3Done.addEventListener('click', () => {
      const nicknameInput = document.getElementById('auth-nickname');
      const bioInput = document.getElementById('auth-bio');
      if (selectedCode && nicknameInput && bioInput) {
        const profileKey = 'guestProfile_' + selectedCode;
        const existing = JSON.parse(localStorage.getItem(profileKey) || '{}');
        existing.nickname = nicknameInput.value.trim() || existing.nickname;
        existing.bio = bioInput.value.trim() || existing.bio;
        localStorage.setItem(profileKey, JSON.stringify(existing));
      }
      localStorage.setItem(AUTH_KEYS.registered, 'true');
      document.getElementById('auth-modal').style.display = 'none';
      // Show wheel reveal for first-time registration
      if (selectedCode && PLAYERS && PLAYERS[GUEST_DATA[selectedCode]?.name]) {
        showTeamWheel(selectedCode);
      } else {
        document.dispatchEvent(new CustomEvent('guestLoggedIn', { detail: { code: selectedCode } }));
      }
    });
  }

  /* Return visitor login */
  const returnPw = document.getElementById('auth-return-password');
  const returnErr = document.getElementById('auth-return-error');
  const returnSubmit = document.getElementById('auth-return-submit');
  const returnReset = document.getElementById('auth-return-reset');

  if (returnSubmit && returnPw && returnErr) {
    returnSubmit.addEventListener('click', async () => {
      returnErr.style.display = 'none';
      const ok = await verifyPassword(returnPw.value);
      if (ok) {
        document.getElementById('auth-modal').style.display = 'none';
        const code = localStorage.getItem(AUTH_KEYS.guestCode);
        document.dispatchEvent(new CustomEvent('guestLoggedIn', { detail: { code } }));
      } else {
        returnErr.style.display = 'block';
        returnPw.value = '';
        returnPw.focus();
      }
    });
    returnPw.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') returnSubmit.click();
    });
  }

  if (returnReset) {
    returnReset.addEventListener('click', () => {
      localStorage.removeItem(AUTH_KEYS.registered);
      localStorage.removeItem(AUTH_KEYS.pwHash);
      localStorage.removeItem(AUTH_KEYS.guestCode);
      showAuthStep('auth-step-1');
      populateNameDropdown();
    });
  }

  /* Forgot password */
  const forgotToggle = document.getElementById('auth-forgot-toggle');
  const forgotPanel = document.getElementById('auth-forgot-panel');
  const resetCodeInput = document.getElementById('auth-reset-code');
  const resetSubmit = document.getElementById('auth-reset-submit');
  const resetErr = document.getElementById('auth-reset-error');

  if (forgotToggle && forgotPanel) {
    forgotToggle.addEventListener('click', () => {
      const open = forgotPanel.style.display !== 'none';
      forgotPanel.style.display = open ? 'none' : 'block';
      forgotToggle.textContent = open ? 'Forgot your password?' : 'Cancel';
      if (!open && resetCodeInput) resetCodeInput.focus();
    });
  }

  if (resetSubmit && resetCodeInput && resetErr) {
    const doReset = () => {
      resetErr.style.display = 'none';
      if (resetCodeInput.value.trim().toLowerCase() === RESET_CODE) {
        localStorage.removeItem(AUTH_KEYS.pwHash);
        isResettingPassword = true;
        forgotPanel.style.display = 'none';
        forgotToggle.textContent = 'Forgot your password?';
        resetCodeInput.value = '';
        showAuthStep('auth-step-2');
      } else {
        resetErr.style.display = 'block';
        resetCodeInput.value = '';
        resetCodeInput.focus();
      }
    };
    resetSubmit.addEventListener('click', doReset);
    resetCodeInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doReset(); });
  }
}

/* Guest Login — delegates to shared guest picker (shared.js) */
function initGuestLogin() {
    const dashboardSection = document.getElementById('my-dashboard');
    const logoutBtn = document.getElementById('dashboard-logout');

    // Hide old modal if still in DOM
    var oldModal = document.getElementById('guest-login-modal');
    if (oldModal) oldModal.style.display = 'none';

    // Check if already logged in
    const savedGuest = localStorage.getItem('guestCode');
    if (savedGuest && GUEST_DATA[savedGuest]) {
        showDashboard(savedGuest);
    }

    // Listen for shared guest picker login
    document.addEventListener('guestLoggedIn', function (e) {
        var code = e.detail && e.detail.code;
        if (code && GUEST_DATA[code]) {
            showDashboard(code);
        }
    });

    // Logout — shows shared picker again
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            localStorage.removeItem('guestCode');
            if (dashboardSection) dashboardSection.style.display = 'none';
            var guestNameEl = document.getElementById('nav-guest-name');
            if (guestNameEl) guestNameEl.style.display = 'none';
            // Remove FAB/drawer if present
            var fab = document.getElementById('my-trip-fab');
            var drawerEl = document.getElementById('my-trip-drawer');
            var backdrop = document.querySelector('.my-trip-backdrop');
            if (fab) fab.remove();
            if (drawerEl) drawerEl.remove();
            if (backdrop) backdrop.remove();
            // Re-create shared guest picker
            if (typeof initGuestPicker === 'function') initGuestPicker();
        });
    }

    function showDashboard(code) {
        const guest = GUEST_DATA[code];
        if (!guest || !dashboardSection) return;

        dashboardSection.style.display = 'block';

        document.getElementById('dashboard-name').textContent = guest.name;
        document.getElementById('stat-room').textContent = guest.room;
        var teamKey = PLAYERS[guest.name];
        var hasRevealed = localStorage.getItem('teamRevealed_' + code) === 'true';
        var teamConfig = teamKey && TEAM_CONFIG ? TEAM_CONFIG[teamKey] : null;
        if (hasRevealed && teamConfig) {
            document.getElementById('stat-team').innerHTML = '<span style="color:' + teamConfig.color + '">' + teamConfig.name + '</span>';
        } else {
            document.getElementById('stat-team').textContent = '🔒 Spin to find out!';
        }

        var teamExplainer = document.getElementById('team-explainer');
        if (teamExplainer) teamExplainer.style.display = hasRevealed ? 'none' : 'block';

        // Points — always show (0 pre-trip, live during trip)
        const individualScores = Store.get('lb_individualScores', {});
        const myPts = individualScores[guest.name] || 0;
        const ptsEl = document.getElementById('stat-points');
        if (ptsEl) animateCount(ptsEl, myPts);

        const personalAgenda = document.getElementById('personal-agenda');
        if (personalAgenda) personalAgenda.innerHTML = '<p>' + escapeHtml(guest.personalNotes) + '</p>';
    }

    function renderMissions(code, missions) {
        const list = document.getElementById('missions-list');
        const completedEl = document.getElementById('missions-completed');
        const totalEl = document.getElementById('missions-total');
        if (!list) return;

        const savedProgress = Store.get('missionProgress', {});
        const guestProgress = savedProgress[code] || {};

        let completedCount = 0;
        list.innerHTML = '';

        missions.forEach(mission => {
            const isCompleted = guestProgress[mission.id] || false;
            if (isCompleted) completedCount++;

            const item = document.createElement('div');
            item.className = 'mission-item' + (isCompleted ? ' completed' : '');
            item.innerHTML = `
                <label class="mission-checkbox">
                    <input type="checkbox" ${isCompleted ? 'checked' : ''} data-mission="${mission.id}">
                    <span class="checkmark"></span>
                </label>
                <span class="mission-text">${escapeHtml(mission.text)}</span>
                ${isCompleted ? '<span class="mission-done">\u2713 Done!</span>' : ''}
            `;

            const checkbox = item.querySelector('input');
            checkbox.addEventListener('change', function () {
                guestProgress[mission.id] = this.checked;
                savedProgress[code] = guestProgress;
                Store.set('missionProgress', savedProgress);
                renderMissions(code, missions);
                if (this.checked) triggerMiniConfetti();
            });

            list.appendChild(item);
        });

        if (completedEl) completedEl.textContent = completedCount;
        if (totalEl) totalEl.textContent = missions.length;
        var barFill = document.getElementById('missions-bar-fill');
        if (barFill) barFill.style.width = (missions.length ? Math.round(completedCount / missions.length * 100) : 0) + '%';
    }
}

/* Animate a numeric element from its current displayed value to a new value */
function animateCount(el, to) {
    var from = parseInt(el.textContent, 10) || 0;
    if (from === to || isNaN(to)) return;
    var item = el.closest('.stat-item');
    if (item) {
        item.classList.remove('stat-pulse');
        void item.offsetWidth; // reset animation
        item.classList.add('stat-pulse');
    }
    var duration = 600;
    var start = null;
    function step(ts) {
        if (!start) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        el.textContent = Math.round(from + (to - from) * eased);
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

/* Live Stats Dashboard */
function initLiveStats() {
    const TEAMS_LIST = ['titans', 'spartans', 'vikings', 'gladiators'];
    const TEAM_NAMES_MAP = { titans: 'Titans', spartans: 'Spartans', vikings: 'Vikings', gladiators: 'Gladiators' };

    // During trip: show live stats + trip numbers cards
    var liveCard = document.getElementById('live-stats-card');
    var numbersCard = document.getElementById('trip-numbers-card');
    if (isRevealed()) {
        if (liveCard) liveCard.style.display = '';
        if (numbersCard) numbersCard.style.display = '';
    }

    function render() {
        const guestCode = localStorage.getItem('guestCode');
        if (!guestCode || !GUEST_DATA[guestCode]) return;
        if (!isRevealed()) return;

        const guestName = GUEST_DATA[guestCode].name;
        const individualScores = Store.get('lb_individualScores', {});
        const teamScores = Store.get('lb_teamScores', { titans: 0, spartans: 0, vikings: 0, gladiators: 0 });
        const badges = Store.get('lb_badges', {});
        const pointsLog = Store.get('lb_pointsLog', []);

        // Live points
        const myLivePts = individualScores[guestName] || 0;
        const livePtsEl = document.getElementById('stat-live-points');
        if (livePtsEl) animateCount(livePtsEl, myLivePts);

        // Personal rank
        const sorted = Object.entries(individualScores)
            .sort((a, b) => b[1] - a[1]);
        const myRank = sorted.findIndex(([n]) => n === guestName) + 1;
        const rankEl = document.getElementById('stat-rank');
        if (rankEl) rankEl.textContent = myRank > 0 ? ('#' + myRank + ' of ' + sorted.length) : '-';

        // Team rank
        const myTeam = typeof PLAYERS !== 'undefined' ? PLAYERS[guestName] : null;
        if (myTeam) {
            const teamSorted = TEAMS_LIST.slice().sort((a, b) => (teamScores[b] || 0) - (teamScores[a] || 0));
            const teamRank = teamSorted.indexOf(myTeam) + 1;
            const teamRankEl = document.getElementById('stat-team-rank');
            if (teamRankEl) teamRankEl.textContent = '#' + teamRank + ' ' + (isRevealed() ? TEAM_NAMES_MAP[myTeam] : '');
        }

        // Badges
        const myBadges = badges[guestName] || [];
        const badgeCountEl = document.getElementById('stat-badges');
        if (badgeCountEl) animateCount(badgeCountEl, myBadges.length);

        const badgeRowEl = document.getElementById('stat-badges-row');
        if (badgeRowEl && myBadges.length > 0) {
            const BADGE_ICONS = {
                first_blood: '\u2694\uFE0F', iron_chef: '\uD83D\uDC68\u200D\uD83C\uDF73',
                hat_trick: '\uD83C\uDFA9', night_owl: '\uD83E\uDD89', centurion: '\uD83D\uDCAF',
                team_player: '\uD83E\uDD1D', rule_breaker: '\uD83D\uDE08', mvp: '\uD83C\uDFC5',
                on_fire: '\uD83D\uDD25', all_rounder: '\uD83C\uDFAF', silent_killer: '\uD83D\uDDE1\uFE0F',
                taskmaster: '\uD83D\uDCCB', standup_star: '\uD83C\uDFA4', olympian: '\uD83E\uDD47',
                le_francais: '\uD83C\uDDEB\uD83C\uDDF7', social_butterfly: '\uD83E\uDD8B',
                comeback_kid: '\uD83D\uDD04', triple_threat: '\u26A1'
            };
            badgeRowEl.innerHTML = myBadges.map(b =>
                '<span class="dash-badge" title="' + b + '">' + (BADGE_ICONS[b] || '\u2B50') + '</span>'
            ).join('');
        }

        // Trip totals
        const totalPtsEl = document.getElementById('stat-total-pts');
        if (totalPtsEl) {
            const total = pointsLog.filter(e => e.amount > 0).reduce((s, e) => s + e.amount, 0);
            animateCount(totalPtsEl, total);
        }

        const totalMsgsEl = document.getElementById('stat-total-msgs');
        if (totalMsgsEl) {
            const msgs = Store.get('messages', []);
            animateCount(totalMsgsEl, msgs.length);
        }

        const totalPhotosEl = document.getElementById('stat-total-photos');
        if (totalPhotosEl) {
            const photos = Store.get('photos', []);
            animateCount(totalPhotosEl, photos.length);
        }

        const totalSongsEl = document.getElementById('stat-total-songs');
        if (totalSongsEl) {
            const songs = Store.get('musicRequests', []);
            animateCount(totalSongsEl, songs.length);
        }
    }

    render();
    // Refresh stats every 30 seconds
    setInterval(render, 30000);
}

/* ============================================
   Team Wheel Reveal
   ============================================ */
function showTeamWheel(guestCode) {
    var guest = GUEST_DATA[guestCode];
    if (!guest) return;
    var teamKey = PLAYERS[guest.name];
    if (!teamKey || !TEAM_CONFIG[teamKey]) {
        document.dispatchEvent(new CustomEvent('guestLoggedIn', { detail: { code: guestCode } }));
        return;
    }

    var teams = [
        { key: 'titans', name: 'Titans', color: '#f9a825', darkColor: '#c17900' },
        { key: 'spartans', name: 'Spartans', color: '#c62828', darkColor: '#8e0000' },
        { key: 'vikings', name: 'Vikings', color: '#1565c0', darkColor: '#0d47a1' },
        { key: 'gladiators', name: 'Gladiators', color: '#424242', darkColor: '#212121' }
    ];

    var targetIndex = teams.findIndex(function(t) { return t.key === teamKey; });
    var teamConfig = TEAM_CONFIG[teamKey];

    // Build overlay
    var overlay = document.createElement('div');
    overlay.id = 'wheel-overlay';
    overlay.innerHTML =
        '<div class="wheel-container">' +
            '<h2 class="wheel-title">Your Team Awaits...</h2>' +
            '<p class="wheel-subtitle">Spin the wheel to discover your destiny</p>' +
            '<div class="wheel-wrapper">' +
                '<canvas id="wheel-canvas" width="420" height="420"></canvas>' +
                '<div class="wheel-pointer"></div>' +
                '<div class="wheel-glow"></div>' +
            '</div>' +
            '<button class="btn btn-primary wheel-spin-btn" id="wheel-spin-btn">SPIN THE WHEEL</button>' +
            '<div class="wheel-result" id="wheel-result" style="display:none">' +
                '<div class="wheel-result-logo" id="wheel-result-logo"></div>' +
                '<h2 class="wheel-result-name" id="wheel-result-name"></h2>' +
                '<p class="wheel-result-caption">You are a <strong id="wheel-result-team"></strong></p>' +
                '<p class="wheel-result-captain">Captain: <strong id="wheel-result-captain"></strong></p>' +
                '<div class="wheel-teammates" id="wheel-teammates"></div>' +
                '<div class="wheel-captain-duties" id="wheel-captain-duties" style="display:none"></div>' +
                '<button class="btn btn-primary wheel-continue-btn" id="wheel-continue-btn">Let\'s Go!</button>' +
            '</div>' +
        '</div>';

    document.body.appendChild(overlay);

    // Draw wheel
    var canvas = document.getElementById('wheel-canvas');
    var ctx = canvas.getContext('2d');
    var size = canvas.width;
    var center = size / 2;
    var radius = center - 16;
    var rotation = 0;
    var spinning = false;

    var teamEmojis = { titans: '\u26A1', spartans: '\uD83D\uDEE1\uFE0F', vikings: '\u2694\uFE0F', gladiators: '\uD83D\uDDE1\uFE0F' };

    function drawWheel(angle) {
        ctx.clearRect(0, 0, size, size);
        var sliceAngle = (2 * Math.PI) / teams.length;

        // Outer ring
        ctx.beginPath();
        ctx.arc(center, center, radius + 8, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Tick marks on outer ring
        for (var t = 0; t < 24; t++) {
            var tickAngle = (t / 24) * 2 * Math.PI;
            ctx.beginPath();
            ctx.moveTo(center + Math.cos(tickAngle) * (radius + 2), center + Math.sin(tickAngle) * (radius + 2));
            ctx.lineTo(center + Math.cos(tickAngle) * (radius + 12), center + Math.sin(tickAngle) * (radius + 12));
            ctx.strokeStyle = 'rgba(255,255,255,0.25)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        teams.forEach(function(team, i) {
            var startAngle = angle + i * sliceAngle;
            var endAngle = startAngle + sliceAngle;

            // Segment
            ctx.beginPath();
            ctx.moveTo(center, center);
            ctx.arc(center, center, radius, startAngle, endAngle);
            ctx.closePath();

            // Gradient fill
            var midAngle = startAngle + sliceAngle / 2;
            var gx = center + Math.cos(midAngle) * radius * 0.5;
            var gy = center + Math.sin(midAngle) * radius * 0.5;
            var grad = ctx.createRadialGradient(center, center, 20, gx, gy, radius);
            grad.addColorStop(0, team.darkColor);
            grad.addColorStop(1, team.color);
            ctx.fillStyle = grad;
            ctx.fill();

            // Segment border
            ctx.strokeStyle = 'rgba(255,255,255,0.4)';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Emoji (inner ring)
            ctx.save();
            ctx.translate(center, center);
            ctx.rotate(startAngle + sliceAngle / 2);
            ctx.font = '32px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(teamEmojis[team.key] || '', radius * 0.38, 0);
            ctx.restore();

            // Label (outer ring)
            ctx.save();
            ctx.translate(center, center);
            ctx.rotate(startAngle + sliceAngle / 2);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = team.key === 'titans' ? '#333' : '#fff';
            ctx.font = 'bold 16px sans-serif';
            ctx.fillText(team.name.toUpperCase(), radius * 0.72, 0);
            ctx.restore();
        });

        // Center circle
        ctx.beginPath();
        ctx.arc(center, center, 30, 0, 2 * Math.PI);
        var centerGrad = ctx.createRadialGradient(center, center, 0, center, center, 30);
        centerGrad.addColorStop(0, '#fff');
        centerGrad.addColorStop(1, '#e0e0e0');
        ctx.fillStyle = centerGrad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = '#333';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', center, center);
    }

    drawWheel(0);

    // Spin logic
    var spinBtn = document.getElementById('wheel-spin-btn');
    spinBtn.addEventListener('click', function() {
        if (spinning) return;
        spinning = true;
        spinBtn.style.display = 'none';

        var sliceAngle = 360 / teams.length;
        // Target: pointer at top (270deg in canvas coords), land on target segment center
        var targetCenter = targetIndex * sliceAngle + sliceAngle / 2;
        // We need the wheel to stop so the target is at the top (pointer position)
        // Pointer is at top = -90deg in standard coords
        var stopAngle = 360 - targetCenter - 90;
        // Add random full rotations (5-8 full spins) + small random offset within segment
        var fullSpins = 8 + Math.floor(Math.random() * 4);
        var jitter = (Math.random() - 0.5) * (sliceAngle * 0.4);
        var totalDeg = fullSpins * 360 + stopAngle + jitter;
        if (totalDeg < 0) totalDeg += 360;

        // Add glow pulse during spin
        var glowEl = document.querySelector('.wheel-glow');
        if (glowEl) glowEl.classList.add('spinning');

        var duration = 6000;
        var startTime = null;
        var startRot = rotation;

        function animateSpin(ts) {
            if (!startTime) startTime = ts;
            var elapsed = ts - startTime;
            var progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            var eased = 1 - Math.pow(1 - progress, 3);
            var currentDeg = startRot + totalDeg * eased;
            rotation = currentDeg;
            drawWheel((currentDeg * Math.PI) / 180);

            if (progress < 1) {
                requestAnimationFrame(animateSpin);
            } else {
                // Reveal!
                setTimeout(showResult, 500);
            }
        }

        requestAnimationFrame(animateSpin);
    });

    function showResult() {
        document.getElementById('wheel-result-logo').innerHTML = teamConfig.logo;
        document.getElementById('wheel-result-name').textContent = teamConfig.name;
        document.getElementById('wheel-result-name').style.color = teamConfig.color;
        document.getElementById('wheel-result-team').textContent = teamConfig.name;
        document.getElementById('wheel-result-team').style.color = teamConfig.color;
        document.getElementById('wheel-result-captain').textContent = teamConfig.captain;

        // Build teammates list — show confirmed (registered) names, padlock for unregistered
        var teammatesEl = document.getElementById('wheel-teammates');
        var teamMembers = [];
        Object.keys(PLAYERS).forEach(function(name) {
            if (PLAYERS[name] === teamKey && name !== guest.name) {
                teamMembers.push(name);
            }
        });
        if (teamMembers.length > 0) {
            var tHtml = '<p class="teammates-label">Your teammates:</p><div class="teammates-list">';
            teamMembers.forEach(function(name) {
                // Check if this person has registered (spun the wheel)
                var memberCode = null;
                Object.keys(GUEST_DATA).forEach(function(code) {
                    if (GUEST_DATA[code].name === name) memberCode = code;
                });
                var revealed = memberCode && localStorage.getItem('teamRevealed_' + memberCode) === 'true';
                if (revealed) {
                    tHtml += '<span class="teammate-chip confirmed">' + escapeHtml(name) + '</span>';
                } else {
                    tHtml += '<span class="teammate-chip locked">\uD83D\uDD12</span>';
                }
            });
            tHtml += '</div>';
            teammatesEl.innerHTML = tHtml;
        }

        // Captain duties (show only if this person IS the captain)
        if (teamConfig.captain === guest.name && typeof CAPTAIN_DUTIES !== 'undefined') {
            var dutiesEl = document.getElementById('wheel-captain-duties');
            dutiesEl.style.display = 'block';
            var dHtml = '<h4>Captain\'s Duties</h4><ul>';
            CAPTAIN_DUTIES.forEach(function(d) {
                dHtml += '<li>' + d + '</li>';
            });
            dHtml += '</ul>';
            dutiesEl.innerHTML = dHtml;
        }

        // Hide wheel, show result with animation
        document.querySelector('.wheel-wrapper').style.display = 'none';
        document.querySelector('.wheel-title').textContent = 'You are a...';
        document.querySelector('.wheel-subtitle').style.display = 'none';

        var resultEl = document.getElementById('wheel-result');
        resultEl.style.display = 'block';

        // Team colour flash
        var flash = document.createElement('div');
        flash.className = 'wheel-colour-flash';
        flash.style.background = teamConfig.color;
        overlay.appendChild(flash);
        setTimeout(function() { flash.remove(); }, 1200);

        // Multiple confetti bursts
        if (typeof triggerConfetti === 'function') {
            triggerConfetti();
            setTimeout(function() { triggerConfetti(); }, 600);
            setTimeout(function() { triggerConfetti(); }, 1200);
            setTimeout(function() { triggerConfetti(); }, 2000);
        }

        // Firework particles
        launchFireworks(overlay, teamConfig.color);

        // Store revealed flag
        localStorage.setItem('teamRevealed_' + guestCode, 'true');

        // Continue button
        document.getElementById('wheel-continue-btn').addEventListener('click', function() {
            overlay.classList.add('wheel-fade-out');
            setTimeout(function() {
                overlay.remove();
                document.dispatchEvent(new CustomEvent('guestLoggedIn', { detail: { code: guestCode } }));
            }, 500);
        });
    }

    // Firework particle system
    function launchFireworks(container, color) {
        var colors = [color, '#fff', '#ffd700', '#ff6b6b', '#69db7c', '#74c0fc'];
        function burst(x, y, delay) {
            setTimeout(function() {
                for (var i = 0; i < 30; i++) {
                    var p = document.createElement('div');
                    p.className = 'firework-particle';
                    var angle = (Math.PI * 2 * i) / 30;
                    var velocity = 80 + Math.random() * 120;
                    var dx = Math.cos(angle) * velocity;
                    var dy = Math.sin(angle) * velocity;
                    var c = colors[Math.floor(Math.random() * colors.length)];
                    var size = 4 + Math.random() * 4;
                    p.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + size + 'px;height:' + size + 'px;background:' + c + ';--dx:' + dx + 'px;--dy:' + dy + 'px;';
                    container.appendChild(p);
                    (function(el) {
                        setTimeout(function() { el.remove(); }, 1200);
                    })(p);
                }
            }, delay);
        }
        var w = container.offsetWidth;
        var h = container.offsetHeight;
        burst(w * 0.3, h * 0.3, 200);
        burst(w * 0.7, h * 0.25, 600);
        burst(w * 0.5, h * 0.4, 1000);
        burst(w * 0.2, h * 0.5, 1500);
        burst(w * 0.8, h * 0.45, 1900);
    }
}
