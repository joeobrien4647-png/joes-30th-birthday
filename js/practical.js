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
   Travel Coordination
   ============================================ */
function initTravelPlans() {
    const form = document.getElementById('travel-form');
    const list = document.getElementById('travel-list');

    if (!form || !list) return;

    const savedPlans = Store.get('travelPlans', []);

    savedPlans.forEach(plan => addTravelPlan(plan, false));

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const plan = {
            name: document.getElementById('travel-name').value.trim(),
            type: document.getElementById('travel-type').value,
            details: document.getElementById('travel-details').value.trim(),
            canOffer: document.getElementById('travel-carshare').checked,
            needLift: document.getElementById('travel-need-lift').checked,
            timestamp: Date.now()
        };

        if (plan.name && plan.type && plan.details) {
            addTravelPlan(plan, true);
            savedPlans.push(plan);
            Store.set('travelPlans', savedPlans);

            form.reset();
        }
    });

    function addTravelPlan(plan, isNew) {
        const icons = {
            flying: '\u2708\uFE0F',
            eurostar: '\uD83D\uDE84',
            driving: '\uD83D\uDE97',
            other: '\uD83D\uDE8C'
        };

        const item = document.createElement('div');
        item.className = 'travel-item' + (isNew ? ' new' : '');

        let tags = '';
        if (plan.canOffer) tags += '<span class="travel-tag offer">Can offer lift</span> ';
        if (plan.needLift) tags += '<span class="travel-tag need">Needs lift</span>';

        item.innerHTML =
            '<div class="travel-icon">' + (icons[plan.type] || '\uD83D\uDE8C') + '</div>' +
            '<div class="travel-info">' +
                '<strong>' + escapeHtml(plan.name) + '</strong>' +
                '<p>' + escapeHtml(plan.details) + '</p>' +
                tags +
            '</div>';

        // Remove example if it exists
        const example = list.querySelector('.example');
        if (example && isNew) example.remove();

        if (isNew) {
            list.insertBefore(item, list.firstChild);
        } else {
            list.appendChild(item);
        }
    }
}

/* ============================================
   Expense Splitter
   ============================================ */
function initExpenseSplitter() {
    const form = document.getElementById('expense-form');
    const list = document.getElementById('expense-list');
    const totalEl = document.getElementById('total-expenses');
    const perPersonEl = document.getElementById('per-person');

    if (!form || !list) return;

    const savedExpenses = Store.get('tripExpenses', []);
    const GUEST_COUNT = 25;

    // Display saved expenses
    if (savedExpenses.length > 0) {
        list.innerHTML = '';
        savedExpenses.forEach(exp => addExpenseToList(exp, false));
    }
    updateTotals();

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const expense = {
            desc: document.getElementById('expense-desc').value.trim(),
            amount: parseFloat(document.getElementById('expense-amount').value),
            paidBy: document.getElementById('expense-paidby').value.trim(),
            split: document.querySelector('input[name="split"]:checked').value,
            timestamp: Date.now()
        };

        if (expense.desc && expense.amount && expense.paidBy) {
            savedExpenses.push(expense);
            Store.set('tripExpenses', savedExpenses);

            if (list.querySelector('.no-expenses')) {
                list.innerHTML = '';
            }

            addExpenseToList(expense, true);
            updateTotals();
            form.reset();
        }
    });

    function addExpenseToList(expense, isNew) {
        const item = document.createElement('div');
        item.className = 'expense-item' + (isNew ? ' new' : '');
        item.innerHTML =
            '<div class="expense-desc">' +
                '<strong>' + escapeHtml(expense.desc) + '</strong>' +
                '<span>Paid by ' + escapeHtml(expense.paidBy) + '</span>' +
            '</div>' +
            '<span class="expense-amount">\u20AC' + expense.amount.toFixed(2) + '</span>';

        if (isNew) {
            list.insertBefore(item, list.firstChild);
        } else {
            list.appendChild(item);
        }
    }

    function updateTotals() {
        const total = savedExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        totalEl.textContent = total.toFixed(2);
        perPersonEl.textContent = (total / GUEST_COUNT).toFixed(2);
    }
}

/* ============================================
   Currency Converter
   ============================================ */
function initCurrencyConverter() {
    const gbpInput = document.getElementById('gbp-input');
    const eurInput = document.getElementById('eur-input');
    const swapBtn = document.getElementById('swap-currency');
    const quickBtns = document.querySelectorAll('.quick-btn');

    if (!gbpInput || !eurInput) return;

    const RATE = 1.17; // GBP to EUR rate - update as needed

    gbpInput.addEventListener('input', function() {
        const gbp = parseFloat(this.value) || 0;
        eurInput.value = (gbp * RATE).toFixed(2);
    });

    eurInput.addEventListener('input', function() {
        const eur = parseFloat(this.value) || 0;
        gbpInput.value = (eur / RATE).toFixed(2);
    });

    swapBtn.addEventListener('click', function() {
        const temp = gbpInput.value;
        gbpInput.value = eurInput.value;
        eurInput.value = temp;
    });

    quickBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const gbp = parseFloat(this.dataset.gbp);
            gbpInput.value = gbp.toFixed(2);
            eurInput.value = (gbp * RATE).toFixed(2);
        });
    });
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
   Trip Preferences
   ============================================ */
function initTripPrefs() {
    const form = document.getElementById('prefs-form');
    const savedMsg = document.getElementById('prefs-saved-msg');
    const travelRadios = document.querySelectorAll('input[name="travel"]');
    const travelExtra = document.getElementById('travel-extra');

    if (!form) return;

    // Show/hide "coming later" extra field
    travelRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            travelExtra.style.display = this.value === 'later' ? 'block' : 'none';
        });
    });

    // Load saved preferences
    const guestCode = Store.getRaw('guestCode');
    const savedPrefs = Store.get('tripPrefs_' + guestCode, null);

    if (savedPrefs) {
        // Restore travel
        const travelRadio = form.querySelector('input[name="travel"][value="' + savedPrefs.travel + '"]');
        if (travelRadio) travelRadio.checked = true;
        if (savedPrefs.travel === 'later') travelExtra.style.display = 'block';
        if (savedPrefs.arrivalNote) document.getElementById('travel-arrival-note').value = savedPrefs.arrivalNote;

        // Restore dietary
        if (savedPrefs.dietary) document.getElementById('pref-dietary').value = savedPrefs.dietary;

        // Restore activities
        if (savedPrefs.activities) {
            savedPrefs.activities.forEach(val => {
                const cb = form.querySelector('input[name="activities"][value="' + val + '"]');
                if (cb) cb.checked = true;
            });
        }

        // Restore duties
        if (savedPrefs.duties) {
            savedPrefs.duties.forEach(val => {
                const cb = form.querySelector('input[name="duties"][value="' + val + '"]');
                if (cb) cb.checked = true;
            });
        }

        // Restore notes
        if (savedPrefs.notes) document.getElementById('pref-notes').value = savedPrefs.notes;

        savedMsg.style.display = 'block';
    }

    // Save form
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const travel = form.querySelector('input[name="travel"]:checked');
        if (!travel) return;

        const activities = Array.from(form.querySelectorAll('input[name="activities"]:checked')).map(cb => cb.value);
        const duties = Array.from(form.querySelectorAll('input[name="duties"]:checked')).map(cb => cb.value);

        const prefs = {
            travel: travel.value,
            arrivalNote: document.getElementById('travel-arrival-note').value || '',
            dietary: document.getElementById('pref-dietary').value || '',
            activities: activities,
            duties: duties,
            notes: document.getElementById('pref-notes').value || '',
            savedAt: new Date().toISOString()
        };

        Store.set('tripPrefs_' + guestCode, prefs);

        // Also save to a master list so admin can see all responses
        const allPrefs = Store.get('allTripPrefs', {});
        allPrefs[guestCode] = prefs;
        Store.set('allTripPrefs', allPrefs);

        savedMsg.style.display = 'block';
        savedMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Confetti for submitting
        if (typeof triggerConfetti === 'function') triggerConfetti();
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
   Initialize All on DOMContentLoaded
   ============================================ */
document.addEventListener('DOMContentLoaded', function() {
    initSubNavHighlight();
    initPaymentTracker();
    initPackingChecklist();
    initTravelPlans();
    initExpenseSplitter();
    initCurrencyConverter();
    initFAQ();
    initTripPrefs();
    initLightbox();
});
