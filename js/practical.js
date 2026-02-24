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
   Expense Splitter
   ============================================ */
function initExpenseSplitter() {
    var container = document.getElementById('expense-splitter-container');
    if (!container) return;

    var guestCode = Auth.getGuestCode();
    var isAdmin = Auth.isAdmin();

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
   Initialize All on DOMContentLoaded
   ============================================ */
document.addEventListener('DOMContentLoaded', function() {
    initSubNavHighlight();
    initTravelPlans();
    initExpenseSplitter();
});
