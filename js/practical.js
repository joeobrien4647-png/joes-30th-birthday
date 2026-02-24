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
        });
    });

    if (changeBtn) {
        changeBtn.addEventListener('click', function() {
            optionsEl.style.display = 'flex';
            confirmedEl.style.display = 'none';
        });
    }

    // Admin panel for joe30
    if (guestCode === 'joe30' && adminPanel) {
        adminPanel.style.display = 'block';
        const allStatuses = Store.get('allTravelStatuses', {});
        const summary = document.getElementById('travel-admin-summary');

        const grouped = {};
        Object.keys(STATUS_LABELS).forEach(k => grouped[k] = []);
        grouped['unknown'] = [];

        Object.entries(allStatuses).forEach(function([code, data]) {
            const s = data.status || 'unknown';
            if (!grouped[s]) grouped[s] = [];
            grouped[s].push(code.replace('30', '').replace(/([a-z])([a-z]+)/i, (_, f, r) => f.toUpperCase() + r));
        });

        let html = '';
        Object.entries(STATUS_LABELS).forEach(function([key, label]) {
            const names = grouped[key] || [];
            html += '<div class="travel-admin-row">' +
                '<span class="travel-admin-label">' + escapeHtml(label) + '</span>' +
                '<span class="travel-admin-names">' + (names.length ? names.map(escapeHtml).join(', ') : '<em>none yet</em>') + '</span>' +
            '</div>';
        });

        summary.innerHTML = html || '<p>No responses yet</p>';
    }
}

/* ============================================
   Initialize All on DOMContentLoaded
   ============================================ */
document.addEventListener('DOMContentLoaded', function() {
    initSubNavHighlight();
    initTravelPlans();
});
