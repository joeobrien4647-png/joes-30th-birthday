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
   Payment Tracker
   ============================================ */
function initPaymentTracker() {
    const grid = document.getElementById('payment-grid');
    const progressFill = document.getElementById('payment-progress-fill');
    const paidCount = document.getElementById('paid-count');
    const totalCollected = document.getElementById('total-collected');

    if (!grid) return;

    // Guest list for payments
    const guests = [
        'Joe O\'Brien', 'Sophie Geen', 'Luke Recchia', 'Samantha Recchia',
        'Hannah O\'Brien', 'Robin Hughes', 'Johnny Gates O\'Brien', 'Florrie Gates O\'Brien',
        'Razon Mahebub', 'Neeve Fletcher', 'George Heyworth', 'Emma Winup',
        'Tom Heyworth', 'Robert Winup', 'Sarah', 'Kiran Ruparelia', 'Shane Pallian',
        'Oli Moran', 'Peter London', 'Emma Levett', 'Jonny Levett',
        'Jonny Williams', 'Will Turner', 'Chris Coggin', 'Oscar Walters', 'Matt Hill', 'Pranay Dube'
    ];

    // Load payment status from localStorage
    const paidGuests = Store.get('paidGuests', []);

    // Create payment cards
    guests.forEach(guest => {
        const card = document.createElement('div');
        card.className = 'payment-card' + (paidGuests.includes(guest) ? ' paid' : '');
        card.innerHTML = '<span class="name">' + escapeHtml(guest.split(' ')[0]) + '</span>';
        card.dataset.guest = guest;

        card.addEventListener('click', function() {
            this.classList.toggle('paid');
            updatePaymentStatus();
        });

        grid.appendChild(card);
    });

    function updatePaymentStatus() {
        const paidCards = grid.querySelectorAll('.payment-card.paid');
        const paidNames = Array.from(paidCards).map(c => c.dataset.guest);

        Store.set('paidGuests', paidNames);

        const count = paidCards.length;
        const total = guests.length;
        const percentage = (count / total) * 100;
        const amount = (count * 245.30).toFixed(2);

        progressFill.style.width = percentage + '%';
        paidCount.textContent = count;
        totalCollected.textContent = amount;
    }

    updatePaymentStatus();
}

/* ============================================
   Packing Checklist
   ============================================ */
function initPackingChecklist() {
    const checklists = document.querySelectorAll('.checklist');
    const countEl = document.getElementById('packing-count');
    const totalEl = document.getElementById('packing-total');

    if (checklists.length === 0) return;

    // Load saved checklist from localStorage
    const savedChecklist = Store.get('packingChecklist', {});

    let totalItems = 0;

    checklists.forEach(checklist => {
        const items = checklist.querySelectorAll('input[type="checkbox"]');
        totalItems += items.length;

        items.forEach(item => {
            const itemName = item.dataset.item;

            // Restore saved state
            if (savedChecklist[itemName]) {
                item.checked = true;
            }

            item.addEventListener('change', function() {
                savedChecklist[itemName] = this.checked;
                Store.set('packingChecklist', savedChecklist);
                updatePackingCount();
            });
        });
    });

    if (totalEl) totalEl.textContent = totalItems;

    function updatePackingCount() {
        const checkedItems = document.querySelectorAll('.checklist input:checked').length;
        if (countEl) countEl.textContent = checkedItems;
    }

    updatePackingCount();
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
        'booked': '✅ Flights booked (29 Apr, Stansted → Poitiers)',
        'booking-soon': '🕒 Will book this week',
        'different-flight': '✈️ Flying but different dates / airport',
        'own-way': '🚗 Making my own way',
        'tbc': '❓ Still to sort'
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

            // Also save to master list for admin
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
   FAQ Accordion
   ============================================ */
function initFAQ() {
    const questions = document.querySelectorAll('.faq-question');

    questions.forEach(question => {
        question.addEventListener('click', function() {
            const item = this.parentElement;

            // Close other open items
            document.querySelectorAll('.faq-item.active').forEach(openItem => {
                if (openItem !== item) {
                    openItem.classList.remove('active');
                }
            });

            // Toggle current item
            item.classList.toggle('active');
        });
    });
}

/* ============================================
   Lightbox
   ============================================ */
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    const lightboxImg = lightbox.querySelector('.lightbox-image');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');
    const galleryItems = document.querySelectorAll('.gallery-item:not(.placeholder)');

    if (!lightboxImg || !closeBtn || !prevBtn || !nextBtn) return;

    let currentIndex = 0;
    let images = [];

    // Collect all images
    galleryItems.forEach((item, index) => {
        const img = item.querySelector('img');
        if (img) {
            images.push(img.src);
            item.addEventListener('click', () => {
                openLightbox(index);
            });
        }
    });

    function openLightbox(index) {
        if (images.length === 0) return;
        currentIndex = index;
        lightboxImg.src = images[currentIndex];
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function showPrev() {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        lightboxImg.src = images[currentIndex];
    }

    function showNext() {
        currentIndex = (currentIndex + 1) % images.length;
        lightboxImg.src = images[currentIndex];
    }

    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', showPrev);
    nextBtn.addEventListener('click', showNext);

    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (!lightbox.classList.contains('active')) return;

        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') showPrev();
        if (e.key === 'ArrowRight') showNext();
    });
}

/* ============================================
   Expense Splitter
   ============================================ */
function initExpenseSplitter() {
    var container = document.getElementById('expense-splitter-container');
    if (!container) return;

    var guestCode = Auth.getGuestCode();
    var isAdmin = Auth.isAdmin();

    // All guest names for the dropdown/checkboxes
    var ALL_GUESTS = Object.keys(GUEST_DATA).map(function(code) {
        return { code: code, name: GUEST_DATA[code].fullName };
    });

    var expenses = Store.get('expenses', []);

    function calcBalances() {
        var balances = {};
        ALL_GUESTS.forEach(function(g) { balances[g.name] = 0; });

        expenses.forEach(function(exp) {
            var share = exp.amount / exp.splitBetween.length;
            balances[exp.paidBy] = (balances[exp.paidBy] || 0) + exp.amount;
            exp.splitBetween.forEach(function(name) {
                balances[name] = (balances[name] || 0) - share;
            });
        });

        return balances;
    }

    function calcSettlements(balances) {
        var debtors = [];
        var creditors = [];

        Object.keys(balances).forEach(function(name) {
            var bal = Math.round(balances[name] * 100) / 100;
            if (bal < -0.01) debtors.push({ name: name, amount: -bal });
            else if (bal > 0.01) creditors.push({ name: name, amount: bal });
        });

        debtors.sort(function(a, b) { return b.amount - a.amount; });
        creditors.sort(function(a, b) { return b.amount - a.amount; });

        var settlements = [];
        var di = 0, ci = 0;

        while (di < debtors.length && ci < creditors.length) {
            var transfer = Math.min(debtors[di].amount, creditors[ci].amount);
            if (transfer > 0.01) {
                settlements.push({
                    from: debtors[di].name,
                    to: creditors[ci].name,
                    amount: Math.round(transfer * 100) / 100
                });
            }
            debtors[di].amount -= transfer;
            creditors[ci].amount -= transfer;
            if (debtors[di].amount < 0.01) di++;
            if (creditors[ci].amount < 0.01) ci++;
        }

        return settlements;
    }

    function render() {
        var totalSpend = expenses.reduce(function(s, e) { return s + e.amount; }, 0);
        var balances = calcBalances();
        var settlements = calcSettlements(balances);

        var html = '<div class="exp-layout">';

        // Add Expense Form
        html += '<div class="exp-form-card">' +
            '<h3>Add Expense</h3>' +
            '<div class="exp-form">' +
                '<input type="text" id="exp-desc" placeholder="Description (e.g. Supermarket run)" maxlength="80" class="exp-input">' +
                '<div class="exp-amount-row">' +
                    '<span class="exp-currency">\u20AC</span>' +
                    '<input type="number" id="exp-amount" placeholder="0.00" step="0.01" min="0" class="exp-input">' +
                '</div>' +
                '<select id="exp-paidby" class="exp-input">' +
                    '<option value="">Paid by...</option>' +
                    ALL_GUESTS.map(function(g) { return '<option value="' + escapeHtml(g.name) + '">' + escapeHtml(g.name) + '</option>'; }).join('') +
                '</select>' +
                '<div class="exp-split-section">' +
                    '<div class="exp-split-header">' +
                        '<strong>Split between:</strong>' +
                        '<button class="exp-select-all-btn" id="exp-select-all">Select All</button>' +
                    '</div>' +
                    '<div class="exp-split-checkboxes" id="exp-checkboxes">' +
                        ALL_GUESTS.map(function(g) {
                            return '<label class="exp-cb-label"><input type="checkbox" value="' + escapeHtml(g.name) + '"> ' + escapeHtml(g.name.split(' ')[0]) + '</label>';
                        }).join('') +
                    '</div>' +
                '</div>' +
                '<button class="btn btn-primary exp-add-btn" id="exp-add-btn">Add Expense</button>' +
            '</div>' +
        '</div>';

        // Summary / Settlements
        html += '<div class="exp-summary-card">' +
            '<div class="exp-total">' +
                '<span class="exp-total-label">Total Trip Spend</span>' +
                '<span class="exp-total-amount">\u20AC' + totalSpend.toFixed(2) + '</span>' +
            '</div>';

        if (settlements.length > 0) {
            html += '<h4>Settlements</h4>' +
                '<p class="exp-settle-subtitle">Minimum transactions to settle up:</p>' +
                '<div class="exp-settlements">';

            settlements.forEach(function(s) {
                html += '<div class="exp-settle-row">' +
                    '<span class="exp-settle-from">' + escapeHtml(s.from.split(' ')[0]) + '</span>' +
                    '<span class="exp-settle-arrow">\u2192</span>' +
                    '<span class="exp-settle-to">' + escapeHtml(s.to.split(' ')[0]) + '</span>' +
                    '<span class="exp-settle-amount">\u20AC' + s.amount.toFixed(2) + '</span>' +
                '</div>';
            });

            html += '</div>';
        } else if (expenses.length > 0) {
            html += '<p class="exp-all-settled">\u2705 All settled up!</p>';
        }

        html += '</div></div>';

        // Expense List
        if (expenses.length > 0) {
            html += '<div class="exp-list">' +
                '<h4>All Expenses (' + expenses.length + ')</h4>';

            var sortedExp = expenses.slice().reverse();
            sortedExp.forEach(function(exp) {
                html += '<div class="exp-list-item">' +
                    '<div class="exp-list-info">' +
                        '<strong>' + escapeHtml(exp.desc) + '</strong>' +
                        '<span class="exp-list-meta">' + escapeHtml(exp.paidBy.split(' ')[0]) + ' paid \u2022 split ' + exp.splitBetween.length + ' ways</span>' +
                    '</div>' +
                    '<span class="exp-list-amount">\u20AC' + exp.amount.toFixed(2) + '</span>' +
                    (isAdmin ? '<button class="exp-delete-btn" data-id="' + exp.id + '">\u2715</button>' : '') +
                '</div>';
            });

            html += '</div>';
        }

        container.innerHTML = html;

        // Bind events
        var addBtn = document.getElementById('exp-add-btn');
        var selectAllBtn = document.getElementById('exp-select-all');
        var checkboxes = document.getElementById('exp-checkboxes');

        if (selectAllBtn && checkboxes) {
            selectAllBtn.addEventListener('click', function() {
                var cbs = checkboxes.querySelectorAll('input[type="checkbox"]');
                var allChecked = Array.from(cbs).every(function(cb) { return cb.checked; });
                cbs.forEach(function(cb) { cb.checked = !allChecked; });
            });
        }

        if (addBtn) {
            addBtn.addEventListener('click', function() {
                var desc = document.getElementById('exp-desc').value.trim();
                var amount = parseFloat(document.getElementById('exp-amount').value);
                var paidBy = document.getElementById('exp-paidby').value;
                var splitBetween = [];

                if (checkboxes) {
                    checkboxes.querySelectorAll('input:checked').forEach(function(cb) {
                        splitBetween.push(cb.value);
                    });
                }

                if (!desc || !amount || amount <= 0 || !paidBy || splitBetween.length === 0) return;

                expenses.push({
                    id: Date.now().toString(),
                    desc: desc,
                    amount: amount,
                    paidBy: paidBy,
                    splitBetween: splitBetween,
                    timestamp: Date.now()
                });

                Store.set('expenses', expenses);
                render();
                if (typeof triggerMiniConfetti === 'function') triggerMiniConfetti();
            });
        }

        // Delete buttons (admin only)
        container.querySelectorAll('.exp-delete-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var id = this.dataset.id;
                expenses = expenses.filter(function(e) { return e.id !== id; });
                Store.set('expenses', expenses);
                render();
            });
        });
    }

    render();
}

/* ============================================
   Weather Widget
   ============================================ */
function initWeatherWidget() {
    var container = document.getElementById('weather-container');
    if (!container) return;

    var FORECAST = [
        { day: 'Wed 29', label: 'Day 1', temp: 17, icon: '\u26C5', desc: 'Partly Cloudy', rain: 20, uv: 'Moderate', wear: 'Light jacket for travel, layers for the evening', sunrise: '6:42 AM', sunset: '9:01 PM' },
        { day: 'Thu 30', label: 'Day 2', temp: 19, icon: '\u2600\uFE0F', desc: 'Sunny', rain: 10, uv: 'High', wear: 'Sunscreen essential! T-shirt and shorts weather', sunrise: '6:40 AM', sunset: '9:03 PM' },
        { day: 'Fri 1', label: 'Day 3', temp: 21, icon: '\u2600\uFE0F', desc: 'Sunny', rain: 5, uv: 'High', wear: 'Hat and suncream for canoeing. Light and cool', sunrise: '6:38 AM', sunset: '9:04 PM' },
        { day: 'Sat 2', label: 'Day 4', temp: 20, icon: '\u26C5', desc: 'Partly Cloudy', rain: 15, uv: 'Moderate', wear: 'Perfect birthday weather! Smart-casual for the evening', sunrise: '6:36 AM', sunset: '9:06 PM' },
        { day: 'Sun 3', label: 'Day 5', temp: 18, icon: '\uD83C\uDF27\uFE0F', desc: 'Light Showers', rain: 40, uv: 'Low', wear: 'Bring a waterproof for Bellebouche. Layers advisable', sunrise: '6:35 AM', sunset: '9:07 PM' },
        { day: 'Mon 4', label: 'Day 6', temp: 17, icon: '\u26C5', desc: 'Partly Cloudy', rain: 25, uv: 'Moderate', wear: 'Comfortable travel clothes, light jacket', sunrise: '6:33 AM', sunset: '9:09 PM' }
    ];

    var html = '<div class="weather-grid">';

    FORECAST.forEach(function(f) {
        html += '<div class="weather-card">' +
            '<div class="weather-day">' + escapeHtml(f.label) + '</div>' +
            '<div class="weather-date">' + escapeHtml(f.day) + '</div>' +
            '<div class="weather-icon">' + f.icon + '</div>' +
            '<div class="weather-temp">' + f.temp + '\u00B0C</div>' +
            '<div class="weather-desc">' + escapeHtml(f.desc) + '</div>' +
            '<div class="weather-details">' +
                '<span>\uD83C\uDF27\uFE0F ' + f.rain + '% rain</span>' +
                '<span>\u2600\uFE0F UV: ' + escapeHtml(f.uv) + '</span>' +
            '</div>' +
            '<div class="weather-sun">' +
                '<span>\uD83C\uDF05 ' + escapeHtml(f.sunrise) + '</span>' +
                '<span>\uD83C\uDF07 ' + escapeHtml(f.sunset) + '</span>' +
            '</div>' +
            '<div class="weather-wear">\uD83D\uDC55 ' + escapeHtml(f.wear) + '</div>' +
        '</div>';
    });

    html += '</div>';
    html += '<p class="weather-disclaimer">Forecast is approximate - check closer to the date!</p>';

    container.innerHTML = html;
}

/* ============================================
   Restaurant & Bar Guide
   ============================================ */
function initRestaurantGuide() {
    var container = document.getElementById('restaurant-container');
    if (!container) return;

    var RESTAURANTS = [
        { name: 'Le Relais du Moulin', location: 'Le Blanc', distance: '14km', type: 'French Bistro', price: '\u20AC\u20AC', desc: 'Perfect for a long lunch', emoji: '\uD83C\uDDEB\uD83C\uDDF7' },
        { name: 'Chez Marcel', location: 'Le Blanc', distance: '14km', type: 'Traditional French', price: '\u20AC\u20AC', desc: 'Best steak-frites in town', emoji: '\uD83E\uDD69' },
        { name: 'La Promenade', location: 'Le Blanc', distance: '14km', type: 'Brasserie', price: '\u20AC\u20AC-\u20AC\u20AC\u20AC', desc: 'Lovely terrace dining', emoji: '\u2615' },
        { name: 'Boulangerie Patisserie', location: 'Ciron (village)', distance: '1km', type: 'Bakery', price: '\u20AC', desc: 'Croissant run essential', emoji: '\uD83E\uDD50' },
        { name: 'Le P\'tit Zinc', location: 'Le Blanc', distance: '14km', type: 'Wine Bar', price: '\u20AC\u20AC', desc: 'Pre-dinner drinks spot', emoji: '\uD83C\uDF77' },
        { name: 'Super U', location: 'Le Blanc', distance: '14km', type: 'Supermarket', price: '\u20AC', desc: 'Main grocery shop - has everything', emoji: '\uD83D\uDED2' },
        { name: 'Intermarch\u00e9', location: 'B\u00e9l\u00e2bre', distance: '20km', type: 'Supermarket', price: '\u20AC', desc: 'Backup option, bigger range', emoji: '\uD83C\uDFEA' }
    ];

    var html = '<div class="restaurant-grid">';

    RESTAURANTS.forEach(function(r) {
        html += '<div class="restaurant-card">' +
            '<div class="restaurant-header">' +
                '<span class="restaurant-emoji">' + r.emoji + '</span>' +
                '<div>' +
                    '<h4>' + escapeHtml(r.name) + '</h4>' +
                    '<span class="restaurant-type">' + escapeHtml(r.type) + '</span>' +
                '</div>' +
                '<span class="restaurant-price">' + r.price + '</span>' +
            '</div>' +
            '<p class="restaurant-desc">' + escapeHtml(r.desc) + '</p>' +
            '<div class="restaurant-meta">' +
                '<span>\uD83D\uDCCD ' + escapeHtml(r.location) + '</span>' +
                '<span>\uD83D\uDE97 ~' + escapeHtml(r.distance) + '</span>' +
            '</div>' +
        '</div>';
    });

    html += '</div>';
    html += '<p class="restaurant-note">Distances are approximate. Always book ahead for groups of 27!</p>';

    container.innerHTML = html;
}

/* ============================================
   Transport Coordinator
   ============================================ */
function initTransportCoordinator() {
    var container = document.getElementById('transport-container');
    if (!container) return;

    var guestCode = Auth.getGuestCode();
    var guestName = Auth.isLoggedIn() ? Auth.getGuestName() : null;

    var ACTIVITIES = [
        { id: 'golf', label: 'Golf - Val de l\'Indre', day: 'Day 2 (Thu)', drive: '50 min drive', emoji: '\u26F3' },
        { id: 'canoe', label: 'Canoe Launch - Ciron', day: 'Day 3 (Fri)', drive: '5 min drive', emoji: '\uD83D\uDEF6' },
        { id: 'bellebouche', label: 'Bellebouche Adventure', day: 'Day 5 (Sun)', drive: '25 min drive', emoji: '\uD83C\uDF33' }
    ];

    var CAR_CAPACITY = 7;
    var NUM_CARS = 3;
    var TOTAL_SEATS = CAR_CAPACITY * NUM_CARS;

    var coordData = Store.get('transportCoord', {});

    function render() {
        var html = '<div class="transport-vans-info">' +
            '<span>\uD83D\uDE97 Hire cars from Poitiers airport</span>' +
            '<span>~' + TOTAL_SEATS + ' seats available</span>' +
        '</div>';

        html += '<div class="transport-activities">';

        ACTIVITIES.forEach(function(act) {
            if (!coordData[act.id]) coordData[act.id] = { drivers: [], riders: [] };
            var data = coordData[act.id];
            var driversCount = data.drivers.length;
            var ridersCount = data.riders.length;
            var seatsUsed = driversCount + ridersCount;
            var isDriver = guestName && data.drivers.includes(guestName);
            var isRider = guestName && data.riders.includes(guestName);

            html += '<div class="transport-card">' +
                '<div class="transport-card-header">' +
                    '<span class="transport-card-emoji">' + act.emoji + '</span>' +
                    '<div>' +
                        '<h4>' + escapeHtml(act.label) + '</h4>' +
                        '<span class="transport-card-meta">' + escapeHtml(act.day) + ' \u2022 ' + escapeHtml(act.drive) + '</span>' +
                    '</div>' +
                '</div>' +
                '<div class="transport-capacity">' +
                    '<div class="transport-capacity-bar">' +
                        '<div class="transport-capacity-fill" style="width:' + Math.min(100, (seatsUsed / TOTAL_SEATS) * 100) + '%"></div>' +
                    '</div>' +
                    '<span class="transport-capacity-label">' + seatsUsed + ' / ' + TOTAL_SEATS + ' seats filled</span>' +
                '</div>';

            if (guestName) {
                html += '<div class="transport-actions">' +
                    '<button class="transport-btn' + (isDriver ? ' active' : '') + '" data-activity="' + act.id + '" data-role="driver">' +
                        '\uD83D\uDE97 ' + (isDriver ? 'Driving!' : 'I can drive') +
                    '</button>' +
                    '<button class="transport-btn' + (isRider ? ' active' : '') + '" data-activity="' + act.id + '" data-role="rider">' +
                        '\uD83D\uDE4B ' + (isRider ? 'Need lift!' : 'I need a lift') +
                    '</button>' +
                '</div>';
            }

            // Show who
            if (data.drivers.length > 0) {
                html += '<div class="transport-people">' +
                    '<strong>\uD83D\uDE97 Drivers:</strong> ' + data.drivers.map(function(n) { return escapeHtml(n); }).join(', ') +
                '</div>';
            }
            if (data.riders.length > 0) {
                html += '<div class="transport-people">' +
                    '<strong>\uD83D\uDE4B Lifts needed:</strong> ' + data.riders.map(function(n) { return escapeHtml(n); }).join(', ') +
                '</div>';
            }

            html += '</div>';
        });

        html += '</div>';

        container.innerHTML = html;

        // Bind buttons
        container.querySelectorAll('.transport-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var actId = this.dataset.activity;
                var role = this.dataset.role;
                if (!coordData[actId]) coordData[actId] = { drivers: [], riders: [] };

                var otherRole = role === 'driver' ? 'riders' : 'drivers';
                var thisRole = role === 'driver' ? 'drivers' : 'riders';

                // Remove from other role if present
                var otherIdx = coordData[actId][otherRole].indexOf(guestName);
                if (otherIdx > -1) coordData[actId][otherRole].splice(otherIdx, 1);

                // Toggle this role
                var idx = coordData[actId][thisRole].indexOf(guestName);
                if (idx > -1) {
                    coordData[actId][thisRole].splice(idx, 1);
                } else {
                    coordData[actId][thisRole].push(guestName);
                }

                Store.set('transportCoord', coordData);
                render();
            });
        });
    }

    render();
}

/* ============================================
   Packing Comparison
   ============================================ */
function initPackingComparison() {
    var toggle = document.getElementById('packing-comparison-toggle');
    var grid = document.getElementById('packing-comparison-grid');
    if (!toggle || !grid) return;

    // All packing items from the checklist
    var PACKING_ITEMS = [
        { key: 'passport', label: 'Passport' },
        { key: 'ehic', label: 'EHIC / Travel Insurance' },
        { key: 'euros', label: 'Euros / Cards' },
        { key: 'phone-charger', label: 'Phone & Charger' },
        { key: 'adapter', label: 'EU Plug Adapter' },
        { key: 'medications', label: 'Any Medications' },
        { key: 'swimwear', label: 'Swimwear' },
        { key: 'casual', label: 'Casual outfits' },
        { key: 'nice-outfit', label: 'Nice outfit' },
        { key: 'layers', label: 'Light jacket / layers' },
        { key: 'sleepwear', label: 'Sleepwear' },
        { key: 'underwear', label: 'Underwear & socks' },
        { key: 'shoes', label: 'Comfortable shoes' },
        { key: 'flip-flops', label: 'Flip flops / sandals' },
        { key: 'sunscreen', label: 'Sunscreen' },
        { key: 'sunglasses', label: 'Sunglasses' },
        { key: 'hat', label: 'Sun hat' },
        { key: 'towel', label: 'Beach/pool towel' },
        { key: 'toothbrush', label: 'Toothbrush & toothpaste' },
        { key: 'deodorant', label: 'Deodorant' },
        { key: 'shampoo', label: 'Shampoo / conditioner' },
        { key: 'skincare', label: 'Skincare' },
        { key: 'hairbrush', label: 'Hairbrush / styling' },
        { key: 'camera', label: 'Camera' },
        { key: 'speaker', label: 'Bluetooth speaker' },
        { key: 'games', label: 'Card games / board games' },
        { key: 'book', label: 'Book / Kindle' },
        { key: 'dance-moves', label: 'Best dance moves' },
        { key: 'birthday-gift', label: 'Birthday gift' },
        { key: 'birthday-card', label: 'Birthday card' },
        { key: 'party-outfit', label: 'Party outfit / costume' }
    ];

    var TOTAL_GUESTS = 27;
    var isOpen = false;

    // On personal checklist change, update shared stats
    function updateSharedStats() {
        var guestCode = Auth.getGuestCode();
        if (!guestCode) return;

        var myChecklist = Store.get('packingChecklist', {});
        var allStats = Store.get('packingStats', {});

        // Store this guest's checklist items
        allStats[guestCode] = {};
        Object.keys(myChecklist).forEach(function(key) {
            if (myChecklist[key]) allStats[guestCode][key] = true;
        });

        Store.set('packingStats', allStats);
    }

    function render() {
        var allStats = Store.get('packingStats', {});

        // Aggregate counts
        var counts = {};
        PACKING_ITEMS.forEach(function(item) { counts[item.key] = 0; });

        Object.keys(allStats).forEach(function(guestKey) {
            var guestData = allStats[guestKey];
            Object.keys(guestData).forEach(function(itemKey) {
                if (guestData[itemKey] && counts.hasOwnProperty(itemKey)) {
                    counts[itemKey]++;
                }
            });
        });

        var html = '';
        PACKING_ITEMS.forEach(function(item) {
            var count = counts[item.key] || 0;
            var colorClass = count > 20 ? 'packing-stat-green' : count >= 10 ? 'packing-stat-orange' : 'packing-stat-red';
            html += '<div class="packing-stat-item ' + colorClass + '">' +
                '<span class="packing-stat-label">' + escapeHtml(item.label) + '</span>' +
                '<span class="packing-stat-count">' + count + '/' + TOTAL_GUESTS + '</span>' +
            '</div>';
        });

        grid.innerHTML = html;
    }

    toggle.addEventListener('click', function() {
        isOpen = !isOpen;
        grid.style.display = isOpen ? 'grid' : 'none';
        toggle.textContent = isOpen ? 'Hide Comparison' : 'What\'s Everyone Packing?';
        toggle.classList.toggle('open', isOpen);
        if (isOpen) render();
    });

    // Listen for checklist changes - hook into existing checkbox events
    document.addEventListener('change', function(e) {
        if (e.target.closest('.checklist')) {
            updateSharedStats();
            if (isOpen) render();
        }
    });

    // Initial shared stats write
    updateSharedStats();
}

/* ============================================
   Currency Converter
   ============================================ */
function initCurrencyConverter() {
    var container = document.getElementById('currency-container');
    if (!container) return;

    var RATE_GBP_TO_EUR = 1.17;
    var RATE_EUR_TO_GBP = 1 / RATE_GBP_TO_EUR;
    var isGbpToEur = true;
    var currentAmount = 10;

    var COMMON_PRICES = [
        { item: 'Coffee', eur: 2.50 },
        { item: 'Beer', eur: 5.00 },
        { item: 'Baguette', eur: 1.20 },
        { item: 'Wine bottle', eur: 8.00 },
        { item: 'Restaurant meal', eur: 25.00 },
        { item: 'Petrol / litre', eur: 1.80 }
    ];

    var QUICK_AMOUNTS = [5, 10, 20, 50, 100];

    function convert(amount) {
        if (isGbpToEur) return amount * RATE_GBP_TO_EUR;
        return amount * RATE_EUR_TO_GBP;
    }

    function formatCurrency(amount, currency) {
        var symbol = currency === 'GBP' ? '\u00A3' : '\u20AC';
        return symbol + amount.toFixed(2);
    }

    function render() {
        var fromCurrency = isGbpToEur ? 'GBP' : 'EUR';
        var toCurrency = isGbpToEur ? 'EUR' : 'GBP';
        var fromSymbol = isGbpToEur ? '\u00A3' : '\u20AC';
        var toSymbol = isGbpToEur ? '\u20AC' : '\u00A3';
        var converted = convert(currentAmount);

        var html = '<div class="currency-card">';

        // Converter
        html += '<div class="currency-converter-main">' +
            '<div class="currency-input-row">' +
                '<span class="currency-symbol">' + fromSymbol + '</span>' +
                '<input type="number" id="currency-input" value="' + currentAmount + '" min="0" step="0.01" class="currency-input">' +
                '<span class="currency-code">' + fromCurrency + '</span>' +
            '</div>' +
            '<button class="currency-swap-btn" id="currency-swap" title="Swap direction">\u21C5</button>' +
            '<div class="currency-result">' +
                '<span class="currency-result-symbol">' + toSymbol + '</span>' +
                '<span class="currency-result-amount">' + converted.toFixed(2) + '</span>' +
                '<span class="currency-code">' + toCurrency + '</span>' +
            '</div>' +
            '<div class="currency-rate">1 ' + fromCurrency + ' = ' + (isGbpToEur ? RATE_GBP_TO_EUR.toFixed(2) : RATE_EUR_TO_GBP.toFixed(2)) + ' ' + toCurrency + '</div>' +
        '</div>';

        // Quick buttons
        html += '<div class="currency-quick">';
        QUICK_AMOUNTS.forEach(function(amt) {
            html += '<button class="currency-quick-btn' + (amt === currentAmount ? ' active' : '') + '" data-amount="' + amt + '">' +
                fromSymbol + amt + '</button>';
        });
        html += '</div>';

        // Common prices
        html += '<div class="currency-reference">' +
            '<h4>Common Prices in France</h4>' +
            '<div class="currency-ref-grid">';

        COMMON_PRICES.forEach(function(p) {
            var gbp = p.eur / RATE_GBP_TO_EUR;
            html += '<div class="currency-ref-item">' +
                '<span class="currency-ref-name">' + escapeHtml(p.item) + '</span>' +
                '<span class="currency-ref-eur">\u20AC' + p.eur.toFixed(2) + '</span>' +
                '<span class="currency-ref-gbp">\u00A3' + gbp.toFixed(2) + '</span>' +
            '</div>';
        });

        html += '</div></div></div>';

        container.innerHTML = html;

        // Bind events
        var input = document.getElementById('currency-input');
        var swapBtn = document.getElementById('currency-swap');

        if (input) {
            input.addEventListener('input', function() {
                currentAmount = parseFloat(this.value) || 0;
                render();
            });
            // Focus the input
            input.focus();
            input.select();
        }

        if (swapBtn) {
            swapBtn.addEventListener('click', function() {
                isGbpToEur = !isGbpToEur;
                render();
            });
        }

        container.querySelectorAll('.currency-quick-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                currentAmount = parseFloat(this.dataset.amount);
                render();
            });
        });
    }

    render();
}

/* ============================================
   Data Export / Import (Admin Only)
   ============================================ */
function initDataSync() {
    var section = document.getElementById('data-sync');
    var container = document.getElementById('data-sync-container');
    if (!section || !container) return;

    // Only show for admins
    if (!Auth.isAdmin()) return;
    section.style.display = '';

    var EXPORT_PREFIXES = [
        'lb_', 'messages', 'photos', 'quoteWall', 'predictions',
        'expenses', 'paidGuests', 'travelPlans', 'mealVotes',
        'chefRatings', 'groceryLists', 'activitySignups', 'packingStats',
        'packingChecklist', 'transportCoord', 'av_', 'confessions',
        'superlativeVotes', 'musicRequests', 'highlights', 'toastSignups',
        'scavengerHunt', 'bingoCards', 'quizLeaderboard', 'spinHistory',
        'challengeStatuses', 'missionProgress', 'tripPrefs', 'allTripPrefs'
    ];

    function getExportKeys() {
        var keys = [];
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            var match = EXPORT_PREFIXES.some(function(prefix) {
                return key.indexOf(prefix) === 0 || key === prefix;
            });
            if (match) keys.push(key);
        }
        return keys;
    }

    function render() {
        var lastExport = Store.get('lastExportTimestamp', null);
        var keys = getExportKeys();

        var html = '<div class="data-sync-card">' +
            '<div class="data-sync-actions">' +
                '<div class="data-sync-export">' +
                    '<button class="btn btn-primary data-sync-btn" id="data-export-btn">' +
                        '\uD83D\uDCE5 Export All Data</button>' +
                    '<p class="data-sync-meta">' + keys.length + ' items to export' +
                        (lastExport ? '<br>Last export: ' + new Date(lastExport).toLocaleString() : '') +
                    '</p>' +
                '</div>' +
                '<div class="data-sync-import">' +
                    '<label class="btn data-sync-btn data-sync-import-label" for="data-import-file">' +
                        '\uD83D\uDCE4 Import Data</label>' +
                    '<input type="file" id="data-import-file" accept=".json" style="display:none;">' +
                    '<p class="data-sync-meta">Upload a .json backup file</p>' +
                '</div>' +
            '</div>' +
            '<div id="data-sync-status"></div>' +
        '</div>';

        container.innerHTML = html;

        // Export handler
        var exportBtn = document.getElementById('data-export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', function() {
                var exportData = {};
                keys.forEach(function(key) {
                    exportData[key] = localStorage.getItem(key);
                });

                var blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                var url = URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = 'joes-30th-backup-' + new Date().toISOString().slice(0, 10) + '.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                Store.set('lastExportTimestamp', Date.now());
                showStatus('\u2705 Exported ' + keys.length + ' items successfully!', 'success');
                render();
            });
        }

        // Import handler
        var importFile = document.getElementById('data-import-file');
        if (importFile) {
            importFile.addEventListener('change', function(e) {
                var file = e.target.files[0];
                if (!file) return;

                var reader = new FileReader();
                reader.onload = function(evt) {
                    try {
                        var data = JSON.parse(evt.target.result);
                        var itemCount = Object.keys(data).length;

                        if (itemCount === 0) {
                            showStatus('\u26A0\uFE0F No data found in file', 'warning');
                            return;
                        }

                        var confirmed = confirm('This will merge ' + itemCount + ' items into your data. Continue?');
                        if (!confirmed) return;

                        Object.keys(data).forEach(function(key) {
                            localStorage.setItem(key, data[key]);
                        });

                        showStatus('\u2705 Imported ' + itemCount + ' items! Refresh the page to see changes.', 'success');
                    } catch (err) {
                        showStatus('\u274C Invalid JSON file', 'error');
                    }
                };
                reader.readAsText(file);
            });
        }
    }

    function showStatus(message, type) {
        var statusEl = document.getElementById('data-sync-status');
        if (!statusEl) return;
        statusEl.innerHTML = '<p class="data-sync-status-msg ' + type + '">' + escapeHtml(message) + '</p>';
        setTimeout(function() {
            if (statusEl) statusEl.innerHTML = '';
        }, 5000);
    }

    render();
}

/* ============================================
   Empty State Cards for Practical Sections
   ============================================ */
function initPracticalEmptyStates() {
    // Expense Splitter - check for empty state after render
    setTimeout(function() {
        var expContainer = document.getElementById('expense-splitter-container');
        if (expContainer) {
            var expenses = Store.get('expenses', []);
            if (expenses.length === 0) {
                var existingEmpty = expContainer.querySelector('.empty-state');
                if (!existingEmpty) {
                    // The form is already rendered, add empty state to expense list area
                    var listArea = expContainer.querySelector('.exp-list');
                    if (!listArea) {
                        var emptyDiv = document.createElement('div');
                        emptyDiv.className = 'empty-state';
                        emptyDiv.innerHTML = '<span class="empty-state-emoji">\uD83D\uDCB0</span><p>No expenses logged yet \u2014 lucky you!</p>';
                        expContainer.appendChild(emptyDiv);
                    }
                }
            }
        }

        // Transport Coordinator
        var transContainer = document.getElementById('transport-container');
        if (transContainer) {
            var transData = Store.get('transportCoord', {});
            var hasData = Object.keys(transData).some(function(k) {
                var d = transData[k];
                return d && ((d.drivers && d.drivers.length > 0) || (d.riders && d.riders.length > 0));
            });
            // Transport coordinator always renders cards so no need for empty state at container level
        }
    }, 100);
}

/* ============================================
   Initialize All on DOMContentLoaded
   ============================================ */
document.addEventListener('DOMContentLoaded', function() {
    initSubNavHighlight();
    initTravelPlans();
    initExpenseSplitter();
    initPracticalEmptyStates();
});
