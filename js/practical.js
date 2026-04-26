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
    var arrivalDate = new Date('2026-04-29T08:30:00Z'); // 10:30 CEST
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
            el.textContent = days + 'd ' + hrs + 'h until château arrival';
        } else if (hrs > 0) {
            el.textContent = hrs + 'h ' + mins + 'm until château arrival';
        } else {
            el.textContent = mins + 'm until château arrival!';
        }
    }
    update();
    setInterval(update, 60000);
}

/* ============================================
   Pre-trip Checklist (localStorage persistence)
   ============================================ */
function initPretripChecklist() {
    var checks = document.querySelectorAll('#prettrip-checklist input[type="checkbox"]');
    if (!checks.length) return;

    var saved = Store.get('pretripChecklist', {});

    function updateProgress() {
        var total = checks.length;
        var done = Array.from(checks).filter(function(cb) { return cb.checked; }).length;
        var fill = document.getElementById('checklist-progress-fill');
        var text = document.getElementById('checklist-progress-text');
        if (fill) fill.style.width = (total ? Math.round(done / total * 100) : 0) + '%';
        if (text) text.textContent = done + ' / ' + total + ' done' + (done === total ? ' 🎉' : '');
    }

    checks.forEach(function (cb) {
        var key = cb.getAttribute('data-check');
        if (saved[key]) cb.checked = true;

        cb.addEventListener('change', function () {
            saved[key] = cb.checked;
            Store.set('pretripChecklist', saved);
            updateProgress();
        });
    });

    updateProgress();
}

/* ============================================
   Initialize All on DOMContentLoaded
   ============================================ */
/* ============================================
   Guest Highlighting — travel arrival chip
   ============================================ */
function initPracticalHighlight() {
    function applyHighlights(d) {
        if (!d || !d.name) return;
        var gName = d.name.toLowerCase();

        // Highlight the guest's name in arrival chips
        // Handles: exact match, nickname (Pete vs Peter), pairs (Luke & Sam vs Samantha)
        document.querySelectorAll('.arrival-chip').forEach(function(chip) {
            var text = chip.textContent.trim();
            var parts = text.split('&').map(function(s) { return s.trim().toLowerCase(); });
            var match = parts.some(function(p) {
                return p === gName || gName.indexOf(p) === 0 || p.indexOf(gName) === 0;
            });
            if (match) chip.classList.add('guest-travel-highlight');
        });
    }

    // Listen for future events
    document.addEventListener('guestHighlight', function(e) { applyHighlights(e.detail); });

    // Apply immediately if already logged in
    if (typeof Auth !== 'undefined' && Auth.isLoggedIn()) {
        var guest = Auth.getGuestData();
        if (guest) applyHighlights({ name: guest.name, fullName: guest.fullName, room: guest.room, code: Auth.getGuestCode() });
    }
}

/* ============================================
   Chateau Gallery Carousel
   ============================================ */
function initGalleryCarousel() {
    var track = document.getElementById('gallery-track');
    var dotsWrap = document.getElementById('gallery-dots');
    var counter = document.getElementById('gallery-counter');
    if (!track || !dotsWrap) return;

    var imgs = track.querySelectorAll('img');
    var total = imgs.length;
    var idx = 0;

    // Build dots
    for (var i = 0; i < total; i++) {
        var dot = document.createElement('button');
        dot.className = 'gallery-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Photo ' + (i + 1));
        dot.dataset.i = i;
        dotsWrap.appendChild(dot);
    }

    function go(n) {
        idx = (n + total) % total;
        track.style.transform = 'translateX(-' + (idx * 100) + '%)';
        dotsWrap.querySelectorAll('.gallery-dot').forEach(function(d, j) {
            d.classList.toggle('active', j === idx);
        });
        if (counter) counter.textContent = (idx + 1) + ' / ' + total;
    }

    document.getElementById('gallery-prev').addEventListener('click', function(e) { e.stopPropagation(); go(idx - 1); });
    document.getElementById('gallery-next').addEventListener('click', function(e) { e.stopPropagation(); go(idx + 1); });
    dotsWrap.addEventListener('click', function(e) {
        e.stopPropagation();
        if (e.target.dataset.i != null) go(+e.target.dataset.i);
    });

    // Touch swipe
    var startX = 0;
    track.addEventListener('touchstart', function(e) { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', function(e) {
        var diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) { go(idx + (diff > 0 ? 1 : -1)); return; }
    });

    // Lightbox
    var lightbox = document.getElementById('gallery-lightbox');
    var lbImg = document.getElementById('gallery-lightbox-img');
    if (!lightbox || !lbImg) return;

    function openLightbox() {
        lbImg.src = imgs[idx].src;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    document.getElementById('gallery-carousel').addEventListener('click', openLightbox);
    document.getElementById('gallery-lightbox-close').addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function(e) { if (e.target === lightbox) closeLightbox(); });

    document.getElementById('gallery-lightbox-prev').addEventListener('click', function(e) {
        e.stopPropagation();
        go(idx - 1);
        lbImg.src = imgs[idx].src;
    });
    document.getElementById('gallery-lightbox-next').addEventListener('click', function(e) {
        e.stopPropagation();
        go(idx + 1);
        lbImg.src = imgs[idx].src;
    });

    document.addEventListener('keydown', function(e) {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') { go(idx - 1); lbImg.src = imgs[idx].src; }
        if (e.key === 'ArrowRight') { go(idx + 1); lbImg.src = imgs[idx].src; }
    });
}

/* ============================================
   Money Owed Section
   - Personal breakdown for logged-in guest
   - Admin tracker (Joe / Sophie / Hannah)
   - Firebase sync via PaymentSync (paid/unpaid status)
   ============================================ */
function initMoneySection() {
    var loginNote = document.getElementById('money-login-note');
    var personalEl = document.getElementById('money-personal');
    var publicEl = document.getElementById('money-public');
    var adminEl = document.getElementById('money-admin');
    if (!personalEl || !adminEl || !loginNote) return;

    var guestCode = (typeof Auth !== 'undefined' && Auth.isLoggedIn()) ? Auth.getGuestCode() : null;

    // Not logged in → prompt
    if (!guestCode) {
        loginNote.style.display = 'block';
        return;
    }

    var isAdmin = Auth.isAdmin();
    personalEl.style.display = 'block';
    if (publicEl) publicEl.style.display = 'flex';
    if (isAdmin) adminEl.style.display = 'block';

    // Show kitty rate amount on public panel
    var kittyRateEl = document.getElementById('kitty-rate-amount');
    if (kittyRateEl && typeof FOOD_KITTY !== 'undefined') {
        kittyRateEl.textContent = '£' + FOOD_KITTY.perNightGBP;
    }

    // ---- Personal panel ----
    function renderPersonal() {
        if (typeof PAYMENT_RATES === 'undefined' || typeof PAYMENT_BANK === 'undefined') return;

        var guest = Auth.getGuestData();
        var firstName = guest ? guest.name : 'there';
        document.getElementById('money-greeting').textContent = 'Hi ' + firstName + ' 👋';

        var lines = (typeof getPaymentLines === 'function') ? getPaymentLines(guestCode) : [];
        var activitiesTotal = (typeof getPaymentTotal === 'function') ? getPaymentTotal(guestCode) : 0;
        var nights = (typeof getNights === 'function') ? getNights(guestCode) : 0;
        var kittyEstimate = (typeof getFoodKittyEstimate === 'function') ? getFoodKittyEstimate(guestCode) : 0;
        var grandTotal = activitiesTotal + kittyEstimate;
        var paid = (typeof PaymentSync !== 'undefined' && PaymentSync.isPaid(guestCode));

        // Activities lines
        var linesEl = document.getElementById('money-lines');
        if (lines.length === 0) {
            linesEl.innerHTML = '<div class="money-empty">Nothing owed here — you\'re all good ✅</div>';
        } else {
            linesEl.innerHTML = lines.map(function(l) {
                return '<div class="money-line">' +
                    '<div>' +
                        '<span class="money-line-label">' + escapeHtml(l.label) + '</span>' +
                        '<span class="money-line-note">' + escapeHtml(l.note) + '</span>' +
                    '</div>' +
                    '<span class="money-line-amount">£' + l.amount + '</span>' +
                '</div>';
            }).join('');
        }
        document.getElementById('money-activities-total').textContent = '£' + activitiesTotal;

        // My stay summary
        var nightsEl = document.getElementById('money-mystay-nights');
        var amountEl = document.getElementById('money-mystay-amount');
        if (nightsEl) {
            if (nights === 0) {
                nightsEl.textContent = 'Not staying at the chateau';
                if (amountEl) amountEl.textContent = 'No group spend share';
            } else {
                nightsEl.textContent = nights + (nights === 1 ? ' night' : ' nights') + ' at the chateau';
                if (amountEl) amountEl.textContent = '~£' + kittyEstimate + ' group spend share (estimated)';
            }
        }

        // Grand total + status
        document.getElementById('money-grand-total').textContent = '£' + grandTotal;
        var badge = document.getElementById('money-status-badge');
        if (grandTotal === 0) {
            badge.textContent = '✅ All clear';
            badge.classList.add('paid');
        } else if (paid) {
            badge.textContent = '✅ Activities paid';
            badge.classList.add('paid');
        } else {
            badge.textContent = '⏳ Outstanding';
            badge.classList.remove('paid');
        }

        // Bank
        document.getElementById('money-bank-sort').textContent = PAYMENT_BANK.sortCode;
        document.getElementById('money-bank-acct').textContent = PAYMENT_BANK.accountNumber;
        document.getElementById('money-bank-name').textContent = PAYMENT_BANK.accountName;
        document.getElementById('money-bank-ref').textContent = firstName;
    }

    // ---- Stay Calendar (public to all guests) ----
    function renderStayCalendar() {
        if (typeof TRIP_DAYS === 'undefined' || typeof GUEST_ATTENDANCE === 'undefined') return;
        if (typeof GUEST_DATA === 'undefined') return;

        var headEl = document.getElementById('stay-calendar-head');
        var bodyEl = document.getElementById('stay-calendar-body');
        var totalsEl = document.getElementById('stay-calendar-totals');
        if (!headEl || !bodyEl || !totalsEl) return;

        // Header row
        var headHtml = '<th>Guest</th>';
        TRIP_DAYS.forEach(function(d) {
            headHtml += '<th>' + escapeHtml(d.label) + '<span class="day-date">' + escapeHtml(d.date) + '</span></th>';
        });
        headHtml += '<th class="nights-col">Nights</th>';
        headEl.innerHTML = headHtml;

        // Body rows — sorted by nights desc, then name
        var entries = Object.keys(GUEST_ATTENDANCE)
            .filter(function(code) {
                var sum = GUEST_ATTENDANCE[code].reduce(function(a, b) { return a + b; }, 0);
                return sum > 0; // hide guests not coming
            })
            .map(function(code) {
                var g = GUEST_DATA[code];
                return {
                    code: code,
                    name: g ? g.name : code,
                    fullName: g ? g.fullName : code,
                    days: GUEST_ATTENDANCE[code],
                    nights: GUEST_ATTENDANCE[code].reduce(function(a, b) { return a + b; }, 0)
                };
            })
            .sort(function(a, b) {
                if (b.nights !== a.nights) return b.nights - a.nights;
                return a.fullName.localeCompare(b.fullName);
            });

        var dailyTotals = TRIP_DAYS.map(function() { return 0; });
        var rowsHtml = '';
        entries.forEach(function(entry) {
            var isMe = entry.code === guestCode;
            rowsHtml += '<tr class="' + (isMe ? 'is-self' : '') + '">';
            rowsHtml += '<td class="' + (isMe ? 'is-self' : '') + '">' + escapeHtml(entry.fullName) + '</td>';
            entry.days.forEach(function(val, i) {
                dailyTotals[i] += val;
                var cls = val === 1 ? 'full' : (val === 0.5 ? 'half' : 'none');
                rowsHtml += '<td class="stay-cell ' + cls + '" title="' + escapeHtml(TRIP_DAYS[i].full) + ': ' + (val === 1 ? 'Full day' : val === 0.5 ? 'Half day' : 'Travelling') + '"><span class="dot"></span></td>';
            });
            rowsHtml += '<td class="nights-col">' + entry.nights + '</td>';
            rowsHtml += '</tr>';
        });
        bodyEl.innerHTML = rowsHtml;

        // Totals row
        var totalsHtml = '<td>Total bodies</td>';
        dailyTotals.forEach(function(t) {
            totalsHtml += '<td>' + t + '</td>';
        });
        var grandNights = dailyTotals.reduce(function(a, b) { return a + b; }, 0);
        totalsHtml += '<td class="nights-col">' + grandNights + '</td>';
        totalsEl.innerHTML = totalsHtml;
    }

    // Copy bank details
    var copyBtn = document.getElementById('money-copy-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            var text = PAYMENT_BANK.accountName + '\n' +
                'Sort code: ' + PAYMENT_BANK.sortCode + '\n' +
                'Account: ' + PAYMENT_BANK.accountNumber + '\n' +
                'Reference: ' + Auth.getGuestName();
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(function() {
                    copyBtn.textContent = '✅ Copied!';
                    copyBtn.classList.add('copied');
                    setTimeout(function() {
                        copyBtn.textContent = '📋 Copy bank details';
                        copyBtn.classList.remove('copied');
                    }, 1800);
                });
            }
        });
    }

    // ---- Admin panel ----
    function renderAdmin() {
        if (!isAdmin) return;
        if (typeof PAYMENTS === 'undefined' || typeof GUEST_DATA === 'undefined') return;

        var totalOwed = 0;
        var totalPaid = 0;
        var rows = [];

        // Build rows in sorted name order
        var entries = Object.keys(PAYMENTS).map(function(code) {
            var guest = GUEST_DATA[code];
            return { code: code, name: guest ? guest.fullName : code };
        }).sort(function(a, b) { return a.name.localeCompare(b.name); });

        entries.forEach(function(entry) {
            var code = entry.code;
            var record = PAYMENTS[code];
            var activitiesTotal = getPaymentTotal(code);
            var nights = getNights(code);
            var kitty = getFoodKittyEstimate(code);
            var grand = activitiesTotal + kitty;
            var paid = (typeof PaymentSync !== 'undefined' && PaymentSync.isPaid(code));

            totalOwed += grand;
            if (paid) totalPaid += grand;

            function cell(flag, key) {
                if (!flag) return '<td class="money-cell-dash">—</td>';
                return '<td class="money-cell-tick">£' + PAYMENT_RATES[key].amount + '</td>';
            }

            rows.push(
                '<tr class="' + (paid ? 'paid' : '') + '" data-code="' + escapeHtml(code) + '">' +
                    '<td>' + escapeHtml(entry.name) + '</td>' +
                    cell(record.golf, 'golf') +
                    cell(record.canoe, 'canoe') +
                    cell(record.accro, 'accro') +
                    cell(record.car, 'car') +
                    '<td class="money-cell-total">' + (activitiesTotal > 0 ? '£' + activitiesTotal : '—') + '</td>' +
                    '<td>' + (nights > 0 ? nights : '—') + '</td>' +
                    '<td class="money-cell-kitty">' + (kitty > 0 ? '£' + kitty : '—') + '</td>' +
                    '<td class="money-cell-grand">' + (grand > 0 ? '£' + grand : '—') + '</td>' +
                    '<td>' + (activitiesTotal > 0
                        ? '<input type="checkbox" class="money-admin-paid-toggle" data-code="' + escapeHtml(code) + '"' + (paid ? ' checked' : '') + '>'
                        : '<span class="money-cell-dash">—</span>'
                    ) + '</td>' +
                '</tr>'
            );
        });

        document.getElementById('money-admin-tbody').innerHTML = rows.join('');
        document.getElementById('money-stat-total').textContent = '£' + totalOwed;
        document.getElementById('money-stat-paid').textContent = '£' + totalPaid;
        document.getElementById('money-stat-outstanding').textContent = '£' + (totalOwed - totalPaid);

        // Wire up toggles
        var toggles = document.querySelectorAll('.money-admin-paid-toggle');
        toggles.forEach(function(t) {
            t.addEventListener('change', function() {
                var code = this.dataset.code;
                if (this.checked) {
                    PaymentSync.markPaid(code, Auth.getGuestName());
                } else {
                    PaymentSync.markUnpaid(code);
                }
            });
        });
    }

    renderPersonal();
    renderStayCalendar();
    renderAdmin();

    // Re-render on Firebase updates
    if (typeof PaymentSync !== 'undefined' && PaymentSync.isConfigured()) {
        PaymentSync.onUpdate(function() {
            renderPersonal();
            renderAdmin();
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initSubNavHighlight();
    initTravelPlans();
    initArrivalCountdown();
    initPretripChecklist();
    initPracticalHighlight();
    initGalleryCarousel();
    initMoneySection();
});
