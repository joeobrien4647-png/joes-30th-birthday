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
    initFAQ();
    initLightbox();
});
