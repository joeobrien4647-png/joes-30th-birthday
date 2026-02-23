/* ============================================
   Home Page JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    initLoadingScreen();
    initPasswordProtection();
    initCountdown();
    initGuestLogin();
    initLiveStats();
});

/* Loading Screen */
function initLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (!loadingScreen) return;
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
    const tripDate = new Date('April 29, 2026 16:00:00').getTime();

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
            daysEl.textContent = '00';
            hoursEl.textContent = '00';
            minutesEl.textContent = '00';
            secondsEl.textContent = '00';
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
    setInterval(updateCountdown, 1000);
}

/* Guest Login */
function initGuestLogin() {
    const modal = document.getElementById('guest-login-modal');
    const form = document.getElementById('guest-login-form');
    const errorEl = document.getElementById('guest-login-error');
    const skipBtn = document.getElementById('skip-guest-login');
    const logoutBtn = document.getElementById('dashboard-logout');
    const dashboardSection = document.getElementById('my-dashboard');

    if (!modal || !form) return;

    // Check if already logged in
    const savedGuest = localStorage.getItem('guestCode');
    if (savedGuest && GUEST_DATA[savedGuest]) {
        modal.style.display = 'none';
        showDashboard(savedGuest);
    } else {
        setTimeout(() => { modal.style.display = 'flex'; }, 2000);
    }

    // Handle login
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const code = document.getElementById('guest-code').value.toLowerCase().trim();
        if (GUEST_DATA[code]) {
            localStorage.setItem('guestCode', code);
            modal.style.display = 'none';
            showDashboard(code);
            triggerConfetti();
            updateNavGuest();
        } else {
            errorEl.style.display = 'block';
            document.getElementById('guest-code').value = '';
        }
    });

    // Skip
    if (skipBtn) {
        skipBtn.addEventListener('click', function () {
            modal.style.display = 'none';
            localStorage.setItem('guestCode', 'guest');
        });
    }

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            localStorage.removeItem('guestCode');
            localStorage.removeItem('missionProgress');
            if (dashboardSection) dashboardSection.style.display = 'none';
            modal.style.display = 'flex';
            const guestNameEl = document.getElementById('nav-guest-name');
            if (guestNameEl) guestNameEl.style.display = 'none';
        });
    }

    function showDashboard(code) {
        const guest = GUEST_DATA[code];
        if (!guest || !dashboardSection) return;

        dashboardSection.style.display = 'block';

        document.getElementById('dashboard-name').textContent = guest.name;
        document.getElementById('stat-room').textContent = guest.room;
        document.getElementById('stat-team').textContent = isRevealed() ? guest.team : '??? (Revealed 26 Apr)';
        document.getElementById('stat-nickname').textContent = isRevealed() ? guest.nickname : '??? (Revealed 26 Apr)';

        const personalAgenda = document.getElementById('personal-agenda');
        if (personalAgenda) personalAgenda.innerHTML = '<p>' + escapeHtml(guest.personalNotes) + '</p>';

        renderMissions(code, guest.missions);
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
    }
}

/* Live Stats Dashboard */
function initLiveStats() {
    const TEAMS_LIST = ['champagne', 'bordeaux', 'rose'];
    const TEAM_NAMES_MAP = { champagne: 'Champagne', bordeaux: 'Bordeaux', rose: 'Rose' };

    function render() {
        const guestCode = localStorage.getItem('guestCode');
        if (!guestCode || !GUEST_DATA[guestCode]) return;

        const guestName = GUEST_DATA[guestCode].name;
        const individualScores = Store.get('lb_individualScores', {});
        const teamScores = Store.get('lb_teamScores', { champagne: 0, bordeaux: 0, rose: 0 });
        const badges = Store.get('lb_badges', {});
        const pointsLog = Store.get('lb_pointsLog', []);

        // Personal points
        const myPts = individualScores[guestName] || 0;
        const ptsEl = document.getElementById('stat-points');
        if (ptsEl) ptsEl.textContent = myPts;

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
        if (badgeCountEl) badgeCountEl.textContent = myBadges.length;

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
            totalPtsEl.textContent = total;
        }

        const totalMsgsEl = document.getElementById('stat-total-msgs');
        if (totalMsgsEl) {
            const msgs = Store.get('messages', []);
            totalMsgsEl.textContent = msgs.length;
        }

        const totalPhotosEl = document.getElementById('stat-total-photos');
        if (totalPhotosEl) {
            const photos = Store.get('photos', []);
            totalPhotosEl.textContent = photos.length;
        }

        const totalSongsEl = document.getElementById('stat-total-songs');
        if (totalSongsEl) {
            const songs = Store.get('musicRequests', []);
            totalSongsEl.textContent = songs.length;
        }
    }

    render();
    // Refresh stats every 30 seconds
    setInterval(render, 30000);
}
