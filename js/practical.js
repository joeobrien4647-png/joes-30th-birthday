/* ============================================
   Practical / Info Page JavaScript
   ============================================ */

/* ============================================
   Sub-Nav Active Highlighting
   ============================================ */
function initSubNavHighlight() {
    const subNavLinks = document.querySelectorAll('.sub-nav-links a');
    const sections = document.querySelectorAll('.section');

    if (subNavLinks.length === 0 || sections.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                subNavLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === '#' + id);
                });
            }
        });
    }, {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
    });

    sections.forEach(section => observer.observe(section));
}

/* ============================================
   Travel Confirmation
   ============================================ */
function initTravelPlans() {
    const optionsEl = document.getElementById('travel-status-options');
    const confirmedEl = document.getElementById('travel-status-confirmed');
    const confirmedMsg = document.getElementById('travel-confirmed-msg');
    const changeBtn = document.getElementById('travel-change-btn');
    const loginNote = document.getElementById('travel-login-note');
    const adminPanel = document.getElementById('travel-admin-panel');

    if (!optionsEl) return;

    const STATUS_LABELS = {
        'booked': '\u2705 Flights booked (29 Apr, Stansted \u2192 Poitiers)',
        'booking-soon': '\uD83D\uDD52 Will book this week',
        'different-flight': '\u2708\uFE0F Flying but different dates / airport',
        'own-way': '\uD83D\uDE97 Making my own way',
        'tbc': '\u2753 Still to sort'
    };

    const guestCode = typeof Auth !== 'undefined' && Auth.isLoggedIn() ? localStorage.getItem('guestCode') : null;

    if (!guestCode) {
        loginNote && (loginNote.style.display = 'block');
        optionsEl.style.display = 'none';
        return;
    }

    const storageKey = 'travelStatus_' + guestCode;
    const saved = Store.get(storageKey, null);

    function showConfirmed(status) {
        optionsEl.style.display = 'none';
        confirmedEl.style.display = 'block';
        confirmedMsg.innerHTML = '<strong>Your status:</strong> ' + escapeHtml(STATUS_LABELS[status] || status);
    }

    if (saved) {
        showConfirmed(saved);
    }

    optionsEl.querySelectorAll('.travel-status-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const status = this.dataset.status;
            Store.set(storageKey, status);

            const allStatuses = Store.get('allTravelStatuses', {});
            allStatuses[guestCode] = { status: status, timestamp: Date.now() };
            Store.set('allTravelStatuses', allStatuses);

            showConfirmed(status);
            renderTravelOverview();
        });
    });

    if (changeBtn) {
        changeBtn.addEventListener('click', function() {
            optionsEl.style.display = 'flex';
            confirmedEl.style.display = 'none';
        });
    }

    // Public travel overview (visible to all logged-in guests)
    renderTravelOverview();

    function renderTravelOverview() {
        var overviewPanel = document.getElementById('travel-overview-panel');
        if (!overviewPanel || !guestCode) return;

        var allStatuses = Store.get('allTravelStatuses', {});
        var totalResponses = Object.keys(allStatuses).length;
        if (totalResponses === 0) return;

        overviewPanel.style.display = 'block';

        // Guest name lookup from global GUEST_DATA
        function getName(code) {
            if (typeof GUEST_DATA !== 'undefined' && GUEST_DATA[code]) {
                return GUEST_DATA[code].name || GUEST_DATA[code].fullName || code;
            }
            var name = code.replace('30', '');
            return name.charAt(0).toUpperCase() + name.slice(1);
        }

        // Group by status
        var grouped = {};
        Object.keys(STATUS_LABELS).forEach(function(k) { grouped[k] = []; });

        Object.entries(allStatuses).forEach(function(entry) {
            var code = entry[0];
            var data = entry[1];
            var s = data.status || 'unknown';
            if (!grouped[s]) grouped[s] = [];
            grouped[s].push(getName(code));
        });

        // Stats bar
        var statsEl = document.getElementById('travel-overview-stats');
        var bookedCount = (grouped['booked'] || []).length;
        statsEl.innerHTML = '<div class="travel-stat-bar">' +
            '<span class="travel-stat">' + bookedCount + ' booked</span>' +
            '<span class="travel-stat">' + totalResponses + ' responded</span>' +
            '</div>';

        // Breakdown
        var breakdownEl = document.getElementById('travel-overview-breakdown');
        var html = '';
        Object.entries(STATUS_LABELS).forEach(function(entry) {
            var key = entry[0];
            var label = entry[1];
            var names = grouped[key] || [];
            if (names.length === 0) return;
            html += '<div class="travel-overview-row">' +
                '<div class="travel-overview-label">' + escapeHtml(label) + '</div>' +
                '<div class="travel-overview-names">' + names.map(escapeHtml).join(', ') + '</div>' +
            '</div>';
        });

        breakdownEl.innerHTML = html || '<p>No responses yet</p>';
    }
}

/* ============================================
   Arrival Countdown
   ============================================ */
function initArrivalCountdown() {
    var el = document.getElementById('arrival-countdown');
    if (!el) return;
    var arrivalDate = new Date('2026-04-29T10:30:00Z'); // 12:30 CEST
    function update() {
        var now = Date.now();
        var diff = arrivalDate.getTime() - now;
        if (diff <= 0) {
            el.textContent = 'Everyone has arrived! Let the party begin!';
            return;
        }
        var days = Math.floor(diff / 86400000);
        var hrs = Math.floor((diff % 86400000) / 3600000);
        var mins = Math.floor((diff % 3600000) / 60000);
        if (days > 0) {
            el.textContent = days + 'd ' + hrs + 'h until chateau arrival';
        } else if (hrs > 0) {
            el.textContent = hrs + 'h ' + mins + 'm until chateau arrival';
        } else {
            el.textContent = mins + 'm until chateau arrival!';
        }
    }
    update();
    setInterval(update, 60000);
}

/* ============================================
   Initialize All on DOMContentLoaded
   ============================================ */
document.addEventListener('DOMContentLoaded', function() {
    initSubNavHighlight();
    initTravelPlans();
    initArrivalCountdown();
});
