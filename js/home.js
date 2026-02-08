/* ============================================
   Home Page JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    initLoadingScreen();
    initPasswordProtection();
    initCountdown();
    initGuestLogin();
    initFactsTicker();
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

/* Countdown Timer */
function initCountdown() {
    const tripDate = new Date('April 29, 2026 16:00:00').getTime();

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = tripDate - now;

        if (distance < 0) {
            daysEl.textContent = '00';
            hoursEl.textContent = '00';
            minutesEl.textContent = '00';
            secondsEl.textContent = '00';
            return;
        }

        daysEl.textContent = Math.floor(distance / (1000 * 60 * 60 * 24)).toString().padStart(3, '0');
        hoursEl.textContent = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
        minutesEl.textContent = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
        secondsEl.textContent = Math.floor((distance % (1000 * 60)) / 1000).toString().padStart(2, '0');
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

/* Facts Ticker */
function initFactsTicker() {
    const ticker = document.getElementById('facts-ticker');
    if (!ticker) return;
    // Ticker is CSS-driven, just needs the HTML content
}
