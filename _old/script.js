/* ============================================
   30th Birthday Trip - JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    initLoadingScreen();
    initPasswordProtection();
    initCountdown();
    initNavigation();
    initAgendaTabs();
    initScrollReveal();
    initLightbox();
    initFormHandling();
    initConfetti();
    initVoting();
    initSuggestions();
    initProfiles();
    initPaymentTracker();
    initBirthdayMessages();
    initPackingChecklist();
    initTravelPlans();
    initActivitySignups();
    initFAQ();
    initDarkMode();
    initQuiz();
    initToastSignup();
    initExpenseSplitter();
    initCurrencyConverter();
    initRSVPTracker();
    initCopyLink();
    initBingo();
    initPredictions();
    initSuperlatives();
    initScavengerHunt();
    initMemoryTimeline();
    initFactsTicker();
    initMusicRequests();
    initThemeSwitcher();
    initConfettiCannon();
    initSpinWheel();
    initJoeTimeline();
    initSoundboard();
    initConfessions();
    initSpeechTimer();
    initPhotoWall();
    initDailyHighlights();
    initGuestLogin();
    initSecretAgenda();
    initTripPrefs();
    initItineraryCompare();
    initChallenges();
    initLeaderboard();
});

/* ============================================
   Countdown Timer
   ============================================ */
function initCountdown() {
    // SET YOUR TRIP DATE HERE
    const tripDate = new Date('April 29, 2026 16:00:00').getTime();

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

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

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        daysEl.textContent = days.toString().padStart(3, '0');
        hoursEl.textContent = hours.toString().padStart(2, '0');
        minutesEl.textContent = minutes.toString().padStart(2, '0');
        secondsEl.textContent = seconds.toString().padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

/* ============================================
   Navigation
   ============================================ */
function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const nav = document.querySelector('.main-nav');

    // Mobile menu toggle
    navToggle.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        this.classList.toggle('active');
    });

    // Close mobile menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const navHeight = nav.offsetHeight;
                const targetPosition = targetElement.offsetTop - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Nav background change on scroll
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            nav.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.15)';
        } else {
            nav.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        }
    });
}

/* ============================================
   Agenda Tabs
   ============================================ */
function initAgendaTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const dayContents = document.querySelectorAll('.day-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const day = this.dataset.day;

            // Remove active class from all tabs and content
            tabBtns.forEach(b => b.classList.remove('active'));
            dayContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            document.querySelector(`.day-content[data-day="${day}"]`).classList.add('active');
        });
    });
}

/* ============================================
   Scroll Reveal Animation
   ============================================ */
function initScrollReveal() {
    const sections = document.querySelectorAll('.section');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });
}

/* ============================================
   Photo Lightbox
   ============================================ */
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
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
   Form Handling
   ============================================ */
function initFormHandling() {
    const form = document.querySelector('.rsvp-form');
    const successMessage = document.querySelector('.rsvp-success');

    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = new FormData(form);
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        // Show loading state
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                form.style.display = 'none';
                successMessage.style.display = 'block';

                // Trigger confetti on successful RSVP!
                triggerConfetti();
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            alert('Oops! Something went wrong. Please try again or contact Joe directly.');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

/* ============================================
   Confetti Animation
   ============================================ */
function initConfetti() {
    // Initial confetti burst on page load
    setTimeout(() => {
        triggerConfetti();
    }, 500);
}

function triggerConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confetti = [];
    const colors = ['#FF6B9D', '#7C3AED', '#FFD93D', '#6BCB77', '#4ECDC4', '#FF6B6B'];
    const confettiCount = 150;

    // Create confetti particles
    for (let i = 0; i < confettiCount; i++) {
        confetti.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            w: Math.random() * 10 + 5,
            h: Math.random() * 6 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: Math.random() * 3 + 2,
            angle: Math.random() * 360,
            spin: Math.random() * 10 - 5,
            opacity: 1
        });
    }

    let animationId;
    let startTime = Date.now();
    const duration = 4000; // 4 seconds

    function animate() {
        const elapsed = Date.now() - startTime;

        if (elapsed > duration) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            cancelAnimationFrame(animationId);
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        confetti.forEach(particle => {
            particle.y += particle.speed;
            particle.angle += particle.spin;
            particle.opacity = Math.max(0, 1 - (elapsed / duration));

            ctx.save();
            ctx.translate(particle.x, particle.y);
            ctx.rotate((particle.angle * Math.PI) / 180);
            ctx.globalAlpha = particle.opacity;
            ctx.fillStyle = particle.color;
            ctx.fillRect(-particle.w / 2, -particle.h / 2, particle.w, particle.h);
            ctx.restore();

            // Reset particle if it goes off screen
            if (particle.y > canvas.height) {
                particle.y = -20;
                particle.x = Math.random() * canvas.width;
            }
        });

        animationId = requestAnimationFrame(animate);
    }

    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

/* ============================================
   Utility: Debounce
   ============================================ */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/* ============================================
   Voting System
   ============================================ */
function initVoting() {
    const polls = document.querySelectorAll('.poll');

    // Load saved votes from localStorage
    const savedVotes = JSON.parse(localStorage.getItem('tripVotes') || '{}');

    polls.forEach(poll => {
        const pollName = poll.dataset.poll;
        const options = poll.querySelectorAll('.poll-option');

        // Initialize vote counts (simulated starting votes for demo)
        const voteCounts = savedVotes[pollName] || {};

        options.forEach(option => {
            const optionName = option.dataset.option;

            // Set initial vote count (random for demo, or from storage)
            if (!voteCounts[optionName]) {
                voteCounts[optionName] = Math.floor(Math.random() * 8) + 1;
            }

            updateOptionDisplay(option, voteCounts[optionName], getTotalVotes(voteCounts));

            // Check if user already voted for this option
            const userVotes = JSON.parse(localStorage.getItem('userVotes') || '{}');
            if (userVotes[pollName] && userVotes[pollName].includes(optionName)) {
                option.classList.add('voted');
            }

            // Click handler
            option.addEventListener('click', function() {
                const userVotes = JSON.parse(localStorage.getItem('userVotes') || '{}');

                if (!userVotes[pollName]) {
                    userVotes[pollName] = [];
                }

                if (this.classList.contains('voted')) {
                    // Remove vote
                    this.classList.remove('voted');
                    voteCounts[optionName] = Math.max(0, voteCounts[optionName] - 1);
                    userVotes[pollName] = userVotes[pollName].filter(v => v !== optionName);
                } else {
                    // Add vote
                    this.classList.add('voted');
                    voteCounts[optionName]++;
                    userVotes[pollName].push(optionName);

                    // Fun animation
                    this.style.transform = 'scale(1.05)';
                    setTimeout(() => {
                        this.style.transform = '';
                    }, 200);
                }

                // Save votes
                localStorage.setItem('userVotes', JSON.stringify(userVotes));
                savedVotes[pollName] = voteCounts;
                localStorage.setItem('tripVotes', JSON.stringify(savedVotes));

                // Update all options in this poll
                options.forEach(opt => {
                    updateOptionDisplay(opt, voteCounts[opt.dataset.option], getTotalVotes(voteCounts));
                });
            });
        });

        // Save initial votes
        savedVotes[pollName] = voteCounts;
        localStorage.setItem('tripVotes', JSON.stringify(savedVotes));
    });

    function getTotalVotes(counts) {
        return Object.values(counts).reduce((a, b) => a + b, 0);
    }

    function updateOptionDisplay(option, count, total) {
        const votesEl = option.querySelector('.poll-votes');
        const fillEl = option.querySelector('.poll-fill');

        votesEl.textContent = count;

        const percentage = total > 0 ? (count / total) * 100 : 0;
        fillEl.style.width = percentage + '%';
    }
}

/* ============================================
   Suggestions System
   ============================================ */
function initSuggestions() {
    const form = document.getElementById('suggestion-form');
    const list = document.getElementById('suggestions-list');

    if (!form || !list) return;

    // Load saved suggestions
    const savedSuggestions = JSON.parse(localStorage.getItem('tripSuggestions') || '[]');

    // Display saved suggestions
    savedSuggestions.forEach(suggestion => {
        addSuggestionToList(suggestion, false);
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const nameInput = document.getElementById('suggester-name');
        const textInput = document.getElementById('suggestion-text');

        const suggestion = {
            name: nameInput.value.trim(),
            text: textInput.value.trim(),
            timestamp: Date.now()
        };

        if (suggestion.name && suggestion.text) {
            // Add to list
            addSuggestionToList(suggestion, true);

            // Save to localStorage
            savedSuggestions.push(suggestion);
            localStorage.setItem('tripSuggestions', JSON.stringify(savedSuggestions));

            // Clear form
            nameInput.value = '';
            textInput.value = '';

            // Trigger mini confetti
            triggerMiniConfetti();
        }
    });

    function addSuggestionToList(suggestion, isNew) {
        const item = document.createElement('div');
        item.className = 'suggestion-item' + (isNew ? ' new' : '');
        item.innerHTML = `
            <span class="suggestion-author">${escapeHtml(suggestion.name)}</span>
            <p>${escapeHtml(suggestion.text)}</p>
        `;

        // Insert after the h4
        const h4 = list.querySelector('h4');
        if (h4.nextSibling) {
            list.insertBefore(item, h4.nextSibling);
        } else {
            list.appendChild(item);
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

/* ============================================
   Mini Confetti (for suggestions)
   ============================================ */
function triggerMiniConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confetti = [];
    const colors = ['#FF6B9D', '#7C3AED', '#FFD93D', '#6BCB77'];

    for (let i = 0; i < 30; i++) {
        confetti.push({
            x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
            y: window.innerHeight / 2,
            w: Math.random() * 8 + 4,
            h: Math.random() * 5 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            speedX: (Math.random() - 0.5) * 10,
            speedY: Math.random() * -10 - 5,
            gravity: 0.3,
            angle: Math.random() * 360,
            spin: Math.random() * 10 - 5,
            opacity: 1
        });
    }

    let animationId;
    let startTime = Date.now();

    function animate() {
        const elapsed = Date.now() - startTime;

        if (elapsed > 2000) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            cancelAnimationFrame(animationId);
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        confetti.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            p.speedY += p.gravity;
            p.angle += p.spin;
            p.opacity = Math.max(0, 1 - (elapsed / 2000));

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.angle * Math.PI) / 180);
            ctx.globalAlpha = p.opacity;
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();
        });

        animationId = requestAnimationFrame(animate);
    }

    animate();
}

/* ============================================
   Profile Modal System
   ============================================ */
function initProfiles() {
    const modal = document.getElementById('profile-modal');
    const closeBtn = modal.querySelector('.profile-close');
    const guests = document.querySelectorAll('.guest[data-name]');

    // Profile elements
    const profileAvatar = document.getElementById('profile-avatar');
    const profileName = document.getElementById('profile-name');
    const profileRoom = document.getElementById('profile-room');
    const profileSuperlative = document.getElementById('profile-superlative');
    const profileFact = document.getElementById('profile-fact');
    const profileBringing = document.getElementById('profile-bringing');
    const profileAnthem = document.getElementById('profile-anthem');

    // Open profile when clicking a guest
    guests.forEach(guest => {
        guest.addEventListener('click', function() {
            const data = this.dataset;

            // Populate modal with guest data
            profileAvatar.textContent = data.initials;
            profileAvatar.className = 'profile-avatar' + (data.birthday === 'true' ? ' birthday' : '');
            profileName.textContent = data.name;
            profileRoom.textContent = data.room;
            profileSuperlative.textContent = data.superlative;
            profileFact.textContent = data.fact;
            profileBringing.textContent = data.bringing;
            profileAnthem.textContent = data.anthem;

            // Show modal
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    // Close modal
    closeBtn.addEventListener('click', closeProfile);

    // Close on background click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeProfile();
        }
    });

    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeProfile();
        }
    });

    function closeProfile() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
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
    const paidGuests = JSON.parse(localStorage.getItem('paidGuests') || '[]');

    // Create payment cards
    guests.forEach(guest => {
        const card = document.createElement('div');
        card.className = 'payment-card' + (paidGuests.includes(guest) ? ' paid' : '');
        card.innerHTML = `<span class="name">${guest.split(' ')[0]}</span>`;
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

        localStorage.setItem('paidGuests', JSON.stringify(paidNames));

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
   Birthday Message Wall
   ============================================ */
function initBirthdayMessages() {
    const form = document.getElementById('message-form');
    const wall = document.getElementById('messages-wall');

    if (!form || !wall) return;

    // Load saved messages
    const savedMessages = JSON.parse(localStorage.getItem('birthdayMessages') || '[]');

    savedMessages.forEach(msg => addMessageToWall(msg, false));

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const nameInput = document.getElementById('message-name');
        const textInput = document.getElementById('message-text');

        const message = {
            name: nameInput.value.trim(),
            text: textInput.value.trim(),
            timestamp: Date.now()
        };

        if (message.name && message.text) {
            addMessageToWall(message, true);
            savedMessages.push(message);
            localStorage.setItem('birthdayMessages', JSON.stringify(savedMessages));

            nameInput.value = '';
            textInput.value = '';

            triggerMiniConfetti();
        }
    });

    function addMessageToWall(message, isNew) {
        const card = document.createElement('div');
        card.className = 'message-card' + (isNew ? ' new' : '');
        card.innerHTML = `
            <div class="message-author">${escapeHtml(message.name)}</div>
            <p>${escapeHtml(message.text)}</p>
        `;

        // Insert at the beginning (after any examples)
        const example = wall.querySelector('.example');
        if (example) {
            wall.insertBefore(card, example);
        } else if (wall.firstChild) {
            wall.insertBefore(card, wall.firstChild);
        } else {
            wall.appendChild(card);
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
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
    const savedChecklist = JSON.parse(localStorage.getItem('packingChecklist') || '{}');

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
                localStorage.setItem('packingChecklist', JSON.stringify(savedChecklist));
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
   Travel Plans
   ============================================ */
function initTravelPlans() {
    const form = document.getElementById('travel-form');
    const list = document.getElementById('travel-list');

    if (!form || !list) return;

    const savedPlans = JSON.parse(localStorage.getItem('travelPlans') || '[]');

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
            localStorage.setItem('travelPlans', JSON.stringify(savedPlans));

            form.reset();
        }
    });

    function addTravelPlan(plan, isNew) {
        const icons = {
            flying: '✈️',
            eurostar: '🚄',
            driving: '🚗',
            other: '🚌'
        };

        const item = document.createElement('div');
        item.className = 'travel-item' + (isNew ? ' new' : '');

        let tags = '';
        if (plan.canOffer) tags += '<span class="travel-tag offer">Can offer lift</span> ';
        if (plan.needLift) tags += '<span class="travel-tag need">Needs lift</span>';

        item.innerHTML = `
            <div class="travel-icon">${icons[plan.type] || '🚌'}</div>
            <div class="travel-info">
                <strong>${escapeHtml(plan.name)}</strong>
                <p>${escapeHtml(plan.details)}</p>
                ${tags}
            </div>
        `;

        // Remove example if it exists
        const example = list.querySelector('.example');
        if (example && isNew) example.remove();

        if (isNew) {
            list.insertBefore(item, list.firstChild);
        } else {
            list.appendChild(item);
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

/* ============================================
   Activity Sign-ups
   ============================================ */
function initActivitySignups() {
    const buttons = document.querySelectorAll('.activity-btn');

    if (buttons.length === 0) return;

    const savedSignups = JSON.parse(localStorage.getItem('activitySignups') || '{}');
    const userName = localStorage.getItem('activityUserName') || '';

    buttons.forEach(btn => {
        const activity = btn.dataset.activity;

        // Initialize signup list
        if (!savedSignups[activity]) savedSignups[activity] = [];

        // Check if user already signed up
        if (savedSignups[activity].includes(userName) && userName) {
            btn.classList.add('signed-up');
            btn.textContent = "I'm In!";
        }

        updateActivityDisplay(activity);

        btn.addEventListener('click', function() {
            let name = userName;

            if (!name) {
                name = prompt('Enter your name to sign up:');
                if (!name) return;
                localStorage.setItem('activityUserName', name);
            }

            if (this.classList.contains('signed-up')) {
                // Remove signup
                this.classList.remove('signed-up');
                this.textContent = "I'm In!";
                savedSignups[activity] = savedSignups[activity].filter(n => n !== name);
            } else {
                // Add signup
                this.classList.add('signed-up');
                this.textContent = "I'm In!";
                if (!savedSignups[activity].includes(name)) {
                    savedSignups[activity].push(name);
                }
            }

            localStorage.setItem('activitySignups', JSON.stringify(savedSignups));
            updateActivityDisplay(activity);
        });
    });

    function updateActivityDisplay(activity) {
        const countEl = document.getElementById(activity + '-count');
        const attendeesEl = document.getElementById(activity + '-attendees');

        if (countEl) {
            countEl.textContent = savedSignups[activity] ? savedSignups[activity].length : 0;
        }

        if (attendeesEl) {
            attendeesEl.innerHTML = savedSignups[activity]
                ? savedSignups[activity].map(name => `<span class="attendee-tag">${name}</span>`).join('')
                : '';
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
   Dark Mode Toggle
   ============================================ */
function initDarkMode() {
    const toggle = document.getElementById('dark-mode-toggle');

    if (!toggle) return;

    // Check for saved preference
    const darkMode = localStorage.getItem('darkMode') === 'true';

    if (darkMode) {
        document.body.classList.add('dark-mode');
        toggle.textContent = '☀️';
    }

    toggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');

        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark);
        this.textContent = isDark ? '☀️' : '🌙';
    });
}

/* ============================================
   Loading Screen
   ============================================ */
function initLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');

    if (!loadingScreen) return;

    // Hide loading screen after animation
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
    }, 1800);
}

/* ============================================
   Password Protection
   ============================================ */
function initPasswordProtection() {
    const modal = document.getElementById('password-modal');
    const form = document.getElementById('password-form');
    const errorEl = document.getElementById('password-error');

    // Set password here (or disable by commenting out)
    const SITE_PASSWORD = null; // Set to 'yourpassword' to enable, null to disable

    if (!modal || !form || !SITE_PASSWORD) return;

    // Check if already authenticated
    if (localStorage.getItem('siteAuthenticated') === 'true') {
        modal.style.display = 'none';
        return;
    }

    // Show password modal
    modal.style.display = 'flex';

    form.addEventListener('submit', function(e) {
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

/* ============================================
   Quiz - How Well Do You Know Joe?
   ============================================ */
function initQuiz() {
    const startBtn = document.getElementById('start-quiz');
    const retryBtn = document.getElementById('retry-quiz');
    const shareBtn = document.getElementById('share-score');

    if (!startBtn) return;

    // Quiz questions - customize these!
    const questions = [
        {
            question: "What year was Joe born?",
            options: ["1994", "1995", "1996", "1997"],
            correct: 2
        },
        {
            question: "What's Joe's favorite drink?",
            options: ["Beer", "Wine", "Gin & Tonic", "Whisky"],
            correct: 0
        },
        {
            question: "Where did Joe grow up?",
            options: ["London", "Manchester", "Bristol", "Birmingham"],
            correct: 0
        },
        {
            question: "What's Joe's go-to karaoke song?",
            options: ["Mr. Brightside", "Don't Look Back in Anger", "Sweet Caroline", "Wonderwall"],
            correct: 0
        },
        {
            question: "What football team does Joe support?",
            options: ["Arsenal", "Chelsea", "Tottenham", "West Ham"],
            correct: 0
        },
        {
            question: "What's Joe's biggest fear?",
            options: ["Spiders", "Heights", "Public Speaking", "Clowns"],
            correct: 1
        },
        {
            question: "What's Joe's favorite cuisine?",
            options: ["Italian", "Mexican", "Thai", "Indian"],
            correct: 0
        },
        {
            question: "What's Joe's hidden talent?",
            options: ["Juggling", "Cooking", "Dancing", "Card tricks"],
            correct: 1
        },
        {
            question: "What was Joe's first job?",
            options: ["Barista", "Shop assistant", "Waiter", "Office intern"],
            correct: 2
        },
        {
            question: "What's Joe's most-watched film?",
            options: ["The Godfather", "Anchorman", "Shawshank Redemption", "Pulp Fiction"],
            correct: 1
        }
    ];

    let currentQuestion = 0;
    let score = 0;
    let playerName = '';

    const startScreen = document.getElementById('quiz-start');
    const gameScreen = document.getElementById('quiz-game');
    const resultScreen = document.getElementById('quiz-result');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('quiz-options');
    const progressFill = document.getElementById('quiz-progress-fill');
    const questionNum = document.getElementById('question-num');

    // Load leaderboard
    loadLeaderboard();

    startBtn.addEventListener('click', function() {
        playerName = prompt('Enter your name:');
        if (!playerName) return;

        currentQuestion = 0;
        score = 0;
        startScreen.style.display = 'none';
        gameScreen.style.display = 'block';
        resultScreen.style.display = 'none';
        showQuestion();
    });

    retryBtn.addEventListener('click', function() {
        currentQuestion = 0;
        score = 0;
        startScreen.style.display = 'none';
        gameScreen.style.display = 'block';
        resultScreen.style.display = 'none';
        showQuestion();
    });

    shareBtn.addEventListener('click', function() {
        const text = `I scored ${score}/10 on the "How Well Do You Know Joe?" quiz! 🎂`;
        if (navigator.share) {
            navigator.share({ text: text });
        } else {
            navigator.clipboard.writeText(text);
            alert('Score copied to clipboard!');
        }
    });

    function showQuestion() {
        const q = questions[currentQuestion];
        questionNum.textContent = currentQuestion + 1;
        progressFill.style.width = ((currentQuestion + 1) / questions.length * 100) + '%';
        questionText.textContent = q.question;

        optionsContainer.innerHTML = '';
        q.options.forEach((option, index) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option';
            btn.textContent = option;
            btn.addEventListener('click', () => selectAnswer(index));
            optionsContainer.appendChild(btn);
        });
    }

    function selectAnswer(index) {
        const q = questions[currentQuestion];
        const options = optionsContainer.querySelectorAll('.quiz-option');

        options.forEach((opt, i) => {
            opt.style.pointerEvents = 'none';
            if (i === q.correct) {
                opt.classList.add('correct');
            } else if (i === index && i !== q.correct) {
                opt.classList.add('incorrect');
            }
        });

        if (index === q.correct) {
            score++;
        }

        setTimeout(() => {
            currentQuestion++;
            if (currentQuestion < questions.length) {
                showQuestion();
            } else {
                showResult();
            }
        }, 1000);
    }

    function showResult() {
        gameScreen.style.display = 'none';
        resultScreen.style.display = 'block';

        const resultEmoji = document.getElementById('result-emoji');
        const resultTitle = document.getElementById('result-title');
        const resultScore = document.getElementById('result-score');

        resultScore.textContent = `You scored ${score} out of 10!`;

        if (score === 10) {
            resultEmoji.textContent = '🏆';
            resultTitle.textContent = 'Perfect! You REALLY know Joe!';
            triggerConfetti();
        } else if (score >= 7) {
            resultEmoji.textContent = '🎉';
            resultTitle.textContent = 'Great job! True friend material!';
        } else if (score >= 4) {
            resultEmoji.textContent = '😅';
            resultTitle.textContent = 'Not bad! Room for improvement!';
        } else {
            resultEmoji.textContent = '😬';
            resultTitle.textContent = 'Oops! Time to spend more time with Joe!';
        }

        // Save to leaderboard
        saveScore(playerName, score);
        loadLeaderboard();
    }

    function saveScore(name, score) {
        const leaderboard = JSON.parse(localStorage.getItem('quizLeaderboard') || '[]');
        leaderboard.push({ name, score, date: Date.now() });
        leaderboard.sort((a, b) => b.score - a.score);
        localStorage.setItem('quizLeaderboard', JSON.stringify(leaderboard.slice(0, 10)));
    }

    function loadLeaderboard() {
        const list = document.getElementById('leaderboard-list');
        const leaderboard = JSON.parse(localStorage.getItem('quizLeaderboard') || '[]');

        if (leaderboard.length === 0) {
            list.innerHTML = '<p class="no-scores">🎯 No quiz legends yet! Be the first to test your Joe knowledge!</p>';
            return;
        }

        list.innerHTML = leaderboard.slice(0, 5).map((entry, i) => `
            <div class="leaderboard-item">
                <span class="rank">${i + 1}.</span>
                <span class="name">${escapeHtml(entry.name)}</span>
                <span class="score">${entry.score}/10</span>
            </div>
        `).join('');
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

/* ============================================
   Toast/Speech Sign-up
   ============================================ */
function initToastSignup() {
    const form = document.getElementById('toast-form');
    const list = document.getElementById('toast-list');

    if (!form || !list) return;

    const savedToasts = JSON.parse(localStorage.getItem('toastSignups') || '[]');

    savedToasts.forEach((toast, i) => addToastToList(toast, i + 1, false));

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const toast = {
            name: document.getElementById('toast-name').value.trim(),
            type: document.getElementById('toast-type').value,
            duration: document.getElementById('toast-duration').value.trim(),
            timestamp: Date.now()
        };

        if (toast.name && toast.type && toast.duration) {
            savedToasts.push(toast);
            localStorage.setItem('toastSignups', JSON.stringify(savedToasts));
            addToastToList(toast, savedToasts.length, true);
            form.reset();
            triggerMiniConfetti();
        }
    });

    function addToastToList(toast, order, isNew) {
        // Remove example if exists
        const example = list.querySelector('.example');
        if (example && isNew) example.remove();

        const item = document.createElement('div');
        item.className = 'toast-item' + (isNew ? ' new' : '');
        item.innerHTML = `
            <span class="toast-order">${order}</span>
            <div class="toast-info">
                <strong>${escapeHtml(toast.name)}</strong>
                <span class="toast-type ${toast.type}">${capitalizeFirst(toast.type)}</span>
                <span class="toast-duration">~${escapeHtml(toast.duration)}</span>
            </div>
        `;
        list.appendChild(item);
    }

    function capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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

    const savedExpenses = JSON.parse(localStorage.getItem('tripExpenses') || '[]');
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
            localStorage.setItem('tripExpenses', JSON.stringify(savedExpenses));

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
        item.innerHTML = `
            <div class="expense-desc">
                <strong>${escapeHtml(expense.desc)}</strong>
                <span>Paid by ${escapeHtml(expense.paidBy)}</span>
            </div>
            <span class="expense-amount">€${expense.amount.toFixed(2)}</span>
        `;

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

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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
   RSVP Tracker
   ============================================ */
function initRSVPTracker() {
    const grid = document.getElementById('tracker-grid');
    const confirmedCount = document.getElementById('confirmed-count');
    const maybeCount = document.getElementById('maybe-count');
    const pendingCount = document.getElementById('pending-count');

    if (!grid) return;

    const guests = [
        'Joe O\'Brien', 'Sophie Geen', 'Luke Recchia', 'Samantha Recchia',
        'Hannah O\'Brien', 'Robin Hughes', 'Johnny Gates O\'Brien', 'Florrie Gates O\'Brien',
        'Razon Mahebub', 'Neeve Fletcher', 'George Heyworth', 'Emma Winup',
        'Tom Heyworth', 'Robert Winup', 'Sarah', 'Kiran Ruparelia', 'Shane Pallian',
        'Oli Moran', 'Peter London', 'Emma Levett', 'Jonny Levett',
        'Jonny Williams', 'Will Turner', 'Chris Coggin', 'Oscar Walters', 'Matt Hill', 'Pranay Dube'
    ];

    // Load RSVP status from localStorage
    const rsvpStatus = JSON.parse(localStorage.getItem('rsvpStatus') || '{}');

    // Create tracker cards
    guests.forEach(guest => {
        const status = rsvpStatus[guest] || 'pending';
        const initials = guest.split(' ').map(n => n[0]).join('').substring(0, 2);

        const card = document.createElement('div');
        card.className = `tracker-card ${status}`;
        card.dataset.guest = guest;
        card.innerHTML = `
            <div class="tracker-avatar">${initials}</div>
            <span class="tracker-name">${guest.split(' ')[0]}</span>
            <span class="tracker-status">${getStatusEmoji(status)}</span>
        `;

        // Click to cycle status (for demo/admin purposes)
        card.addEventListener('click', function() {
            const currentStatus = rsvpStatus[guest] || 'pending';
            const nextStatus = currentStatus === 'pending' ? 'confirmed' :
                              currentStatus === 'confirmed' ? 'maybe' : 'pending';

            rsvpStatus[guest] = nextStatus;
            localStorage.setItem('rsvpStatus', JSON.stringify(rsvpStatus));

            this.className = `tracker-card ${nextStatus}`;
            this.querySelector('.tracker-status').textContent = getStatusEmoji(nextStatus);
            updateCounts();
        });

        grid.appendChild(card);
    });

    updateCounts();

    function getStatusEmoji(status) {
        return status === 'confirmed' ? '✅' :
               status === 'maybe' ? '🤔' : '⏳';
    }

    function updateCounts() {
        const confirmed = Object.values(rsvpStatus).filter(s => s === 'confirmed').length;
        const maybe = Object.values(rsvpStatus).filter(s => s === 'maybe').length;
        const pending = guests.length - confirmed - maybe;

        confirmedCount.textContent = confirmed;
        maybeCount.textContent = maybe;
        pendingCount.textContent = pending;
    }
}

/* ============================================
   Copy Link / QR Code
   ============================================ */
function initCopyLink() {
    const copyBtn = document.getElementById('copy-link');

    if (!copyBtn) return;

    copyBtn.addEventListener('click', function() {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            const originalText = this.textContent;
            this.textContent = 'Copied!';
            setTimeout(() => {
                this.textContent = originalText;
            }, 2000);
        });
    });
}

/* ============================================
   Trip Bingo
   ============================================ */
function initBingo() {
    const bingoCard = document.getElementById('bingo-card');
    const newCardBtn = document.getElementById('new-bingo-card');
    const resetBtn = document.getElementById('reset-bingo');
    const winnerDisplay = document.getElementById('bingo-winner');

    if (!bingoCard) return;

    const bingoItems = [
        "Someone falls asleep by the pool",
        "Joe makes a toast",
        "Group photo taken",
        "Someone speaks French",
        "Wine tasting trip",
        "Late night pool swim",
        "Someone loses their phone",
        "Burnt BBQ moment",
        "Someone gets sunburnt",
        "Cheese plate ordered",
        "\"Remember when...\" story",
        "Someone oversleeps",
        "Dance party starts",
        "Someone cries (happy tears)",
        "Champagne popped",
        "Group sing-along",
        "Someone gets lost",
        "Midnight snack raid",
        "Hangover breakfast",
        "\"One more drink!\"",
        "Someone takes 50+ photos",
        "Card games played",
        "Someone falls in pool",
        "Birthday cake served",
        "Sunset drinks"
    ];

    let markedCells = JSON.parse(localStorage.getItem('bingoMarked') || '[]');
    let currentCard = JSON.parse(localStorage.getItem('bingoCard') || 'null');

    if (!currentCard) {
        generateNewCard();
    } else {
        renderCard();
    }

    newCardBtn.addEventListener('click', generateNewCard);
    resetBtn.addEventListener('click', resetCard);

    function generateNewCard() {
        const shuffled = [...bingoItems].sort(() => Math.random() - 0.5);
        currentCard = shuffled.slice(0, 24);
        currentCard.splice(12, 0, 'FREE');
        markedCells = [12]; // Free space is always marked
        localStorage.setItem('bingoCard', JSON.stringify(currentCard));
        localStorage.setItem('bingoMarked', JSON.stringify(markedCells));
        renderCard();
        winnerDisplay.style.display = 'none';
    }

    function resetCard() {
        markedCells = [12];
        localStorage.setItem('bingoMarked', JSON.stringify(markedCells));
        renderCard();
        winnerDisplay.style.display = 'none';
    }

    function renderCard() {
        bingoCard.innerHTML = '';
        currentCard.forEach((item, index) => {
            const cell = document.createElement('div');
            cell.className = 'bingo-cell' + (markedCells.includes(index) ? ' marked' : '') + (index === 12 ? ' free' : '');
            cell.textContent = item;
            cell.addEventListener('click', () => toggleCell(index));
            bingoCard.appendChild(cell);
        });
    }

    function toggleCell(index) {
        if (index === 12) return; // Can't unmark free space

        if (markedCells.includes(index)) {
            markedCells = markedCells.filter(i => i !== index);
        } else {
            markedCells.push(index);
        }
        localStorage.setItem('bingoMarked', JSON.stringify(markedCells));
        renderCard();
        checkWin();
    }

    function checkWin() {
        const winPatterns = [
            [0,1,2,3,4], [5,6,7,8,9], [10,11,12,13,14], [15,16,17,18,19], [20,21,22,23,24], // Rows
            [0,5,10,15,20], [1,6,11,16,21], [2,7,12,17,22], [3,8,13,18,23], [4,9,14,19,24], // Columns
            [0,6,12,18,24], [4,8,12,16,20] // Diagonals
        ];

        const hasWin = winPatterns.some(pattern =>
            pattern.every(index => markedCells.includes(index))
        );

        if (hasWin) {
            winnerDisplay.style.display = 'block';
        }
    }
}

/* ============================================
   Predictions Wall
   ============================================ */
function initPredictions() {
    const form = document.getElementById('prediction-form');
    const grid = document.getElementById('predictions-grid');

    if (!form || !grid) return;

    let predictions = JSON.parse(localStorage.getItem('predictions') || '[]');

    // Render existing predictions
    predictions.forEach(pred => addPredictionCard(pred, false));

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const author = document.getElementById('prediction-author').value.trim();
        const text = document.getElementById('prediction-text').value.trim();

        if (!author || !text) return;

        const prediction = { author, text, timestamp: Date.now() };
        predictions.push(prediction);
        localStorage.setItem('predictions', JSON.stringify(predictions));

        addPredictionCard(prediction, true);
        form.reset();
    });

    function addPredictionCard(pred, isNew) {
        const card = document.createElement('div');
        card.className = 'prediction-card' + (isNew ? ' new' : '');
        card.innerHTML = `
            <p class="prediction-text">"${escapeHtml(pred.text)}"</p>
            <span class="prediction-author">- ${escapeHtml(pred.author)}</span>
        `;
        grid.appendChild(card);
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

/* ============================================
   Superlatives Voting
   ============================================ */
function initSuperlatives() {
    const grid = document.getElementById('superlatives-grid');

    if (!grid) return;

    const guests = [
        'Joe O\'Brien', 'Sophie Geen', 'Luke Recchia', 'Samantha Recchia',
        'Hannah O\'Brien', 'Robin Hughes', 'Johnny Gates O\'Brien', 'Florrie Gates O\'Brien',
        'Razon Mahebub', 'Neeve Fletcher', 'George Heyworth', 'Emma Winup',
        'Tom Heyworth', 'Robert Winup', 'Sarah', 'Kiran Ruparelia', 'Shane Pallian',
        'Oli Moran', 'Peter London', 'Emma Levett', 'Jonny Levett',
        'Jonny Williams', 'Will Turner', 'Chris Coggin', 'Oscar Walters', 'Matt Hill', 'Pranay Dube'
    ];

    let votes = JSON.parse(localStorage.getItem('superlativeVotes') || '{}');

    // Populate dropdowns with guest names
    const selects = grid.querySelectorAll('.superlative-vote');
    selects.forEach(select => {
        guests.forEach(guest => {
            const option = document.createElement('option');
            option.value = guest;
            option.textContent = guest;
            select.appendChild(option);
        });

        const category = select.closest('.superlative-card').dataset.category;
        if (votes[category]) {
            select.value = votes[category];
        }

        select.addEventListener('change', function() {
            votes[category] = this.value;
            localStorage.setItem('superlativeVotes', JSON.stringify(votes));
            updateResults(category);
        });

        updateResults(category);
    });

    function updateResults(category) {
        // For demo purposes, just show the current vote
        // In a real app, this would aggregate votes from all users
        const card = grid.querySelector(`[data-category="${category}"]`);
        const resultsDiv = card.querySelector('.superlative-results');

        if (votes[category]) {
            resultsDiv.innerHTML = `<span class="superlative-leader">Your pick: ${votes[category]}</span>`;
        }
    }
}

/* ============================================
   Scavenger Hunt
   ============================================ */
function initScavengerHunt() {
    const list = document.getElementById('scavenger-list');
    const progressFill = document.getElementById('scavenger-progress-fill');
    const countDisplay = document.getElementById('scavenger-count');

    if (!list) return;

    let completed = JSON.parse(localStorage.getItem('scavengerCompleted') || '[]');

    const checkboxes = list.querySelectorAll('input[type="checkbox"]');
    const totalItems = checkboxes.length;

    // Restore saved state
    checkboxes.forEach(checkbox => {
        if (completed.includes(checkbox.id)) {
            checkbox.checked = true;
        }

        checkbox.addEventListener('change', function() {
            if (this.checked) {
                if (!completed.includes(this.id)) {
                    completed.push(this.id);
                }
            } else {
                completed = completed.filter(id => id !== this.id);
            }
            localStorage.setItem('scavengerCompleted', JSON.stringify(completed));
            updateProgress();
        });
    });

    updateProgress();

    function updateProgress() {
        const completedCount = completed.length;
        const percentage = (completedCount / totalItems) * 100;

        progressFill.style.width = percentage + '%';
        countDisplay.textContent = `${completedCount}/${totalItems} completed`;
    }
}

/* ============================================
   Memory Timeline
   ============================================ */
function initMemoryTimeline() {
    const form = document.getElementById('memory-form');
    const timeline = document.getElementById('memory-timeline');

    if (!form || !timeline) return;

    let memories = JSON.parse(localStorage.getItem('memories') || '[]');

    // Sort by year and render
    memories.sort((a, b) => (a.year || 0) - (b.year || 0));
    memories.forEach(mem => addMemoryItem(mem, false));

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const author = document.getElementById('memory-author').value.trim();
        const year = document.getElementById('memory-year').value.trim();
        const text = document.getElementById('memory-text').value.trim();

        if (!author || !text) return;

        const memory = { author, year: year || '???', text, timestamp: Date.now() };
        memories.push(memory);
        localStorage.setItem('memories', JSON.stringify(memories));

        addMemoryItem(memory, true);
        form.reset();
    });

    function addMemoryItem(mem, isNew) {
        const item = document.createElement('div');
        item.className = 'memory-item' + (isNew ? ' new' : '');
        item.dataset.year = mem.year;
        item.innerHTML = `
            <div class="memory-year">${escapeHtml(mem.year)}</div>
            <div class="memory-content">
                <p>"${escapeHtml(mem.text)}"</p>
                <span class="memory-author">- ${escapeHtml(mem.author)}</span>
            </div>
        `;
        timeline.appendChild(item);
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

/* ============================================
   Facts Ticker
   ============================================ */
function initFactsTicker() {
    const ticker = document.getElementById('facts-ticker');
    const content = ticker?.querySelector('.ticker-content');

    if (!content) return;

    // Duplicate content for seamless loop
    content.innerHTML += content.innerHTML;
}

/* ============================================
   Music Requests
   ============================================ */
function initMusicRequests() {
    const form = document.getElementById('music-form');
    const list = document.getElementById('music-list');

    if (!form || !list) return;

    let songs = JSON.parse(localStorage.getItem('musicRequests') || '[]');
    let upvotes = JSON.parse(localStorage.getItem('musicUpvotes') || '{}');

    // Clear example and render saved songs
    list.innerHTML = '';
    songs.forEach(song => addSongItem(song));

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const title = document.getElementById('song-title').value.trim();
        const artist = document.getElementById('song-artist').value.trim();
        const requester = document.getElementById('song-requester').value.trim();

        if (!title || !artist || !requester) return;

        const song = {
            id: Date.now().toString(),
            title,
            artist,
            requester,
            timestamp: Date.now()
        };
        songs.push(song);
        upvotes[song.id] = 0;

        localStorage.setItem('musicRequests', JSON.stringify(songs));
        localStorage.setItem('musicUpvotes', JSON.stringify(upvotes));

        addSongItem(song);
        form.reset();
    });

    function addSongItem(song) {
        const item = document.createElement('div');
        item.className = 'music-item';
        item.innerHTML = `
            <div class="music-info">
                <span class="song-title">${escapeHtml(song.title)}</span>
                <span class="song-artist">${escapeHtml(song.artist)}</span>
            </div>
            <span class="song-requester">${escapeHtml(song.requester)}</span>
            <button class="upvote-btn" data-song="${song.id}">👍 <span>${upvotes[song.id] || 0}</span></button>
        `;

        const upvoteBtn = item.querySelector('.upvote-btn');
        upvoteBtn.addEventListener('click', function() {
            upvotes[song.id] = (upvotes[song.id] || 0) + 1;
            localStorage.setItem('musicUpvotes', JSON.stringify(upvotes));
            this.querySelector('span').textContent = upvotes[song.id];
            this.classList.add('voted');
        });

        list.appendChild(item);
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

/* ============================================
   Theme Switcher
   ============================================ */
function initThemeSwitcher() {
    const toggleBtn = document.getElementById('theme-toggle-btn');
    const options = document.getElementById('theme-options');

    if (!toggleBtn || !options) return;

    const themeButtons = options.querySelectorAll('.theme-option');
    let currentTheme = localStorage.getItem('siteTheme') || 'default';

    // Apply saved theme
    applyTheme(currentTheme);

    toggleBtn.addEventListener('click', function() {
        options.classList.toggle('active');
    });

    // Close when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.theme-switcher')) {
            options.classList.remove('active');
        }
    });

    themeButtons.forEach(btn => {
        if (btn.dataset.theme === currentTheme) {
            btn.classList.add('active');
        }

        btn.addEventListener('click', function() {
            const theme = this.dataset.theme;
            applyTheme(theme);
            localStorage.setItem('siteTheme', theme);

            themeButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            options.classList.remove('active');
        });
    });

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        currentTheme = theme;
    }
}

/* ============================================
   Confetti Cannon
   ============================================ */
function initConfettiCannon() {
    const cannon = document.getElementById('confetti-cannon');

    if (!cannon) return;

    cannon.addEventListener('click', function() {
        // Trigger big confetti explosion
        triggerConfetti();

        // Add click animation
        this.style.transform = 'scale(0.9)';
        setTimeout(() => {
            this.style.transform = '';
        }, 100);
    });
}

/* ============================================
   Spin the Wheel
   ============================================ */
function initSpinWheel() {
    const spinner = document.getElementById('wheel-spinner');
    const spinBtn = document.getElementById('spin-wheel');
    const result = document.getElementById('wheel-result');
    const tabs = document.querySelectorAll('.wheel-tab');

    if (!spinner || !spinBtn) return;

    const wheelData = {
        drinking: ['Take 2 sips', 'Give 3 sips', 'Waterfall!', 'Truth or Dare', 'Categories', 'Make a rule', 'Skip turn', 'Cheers!'],
        cooking: ['Joe', 'Sophie', 'Luke', 'Hannah', 'George', 'Tom', 'Emma L', 'Jonny W'],
        activity: ['Pool party', 'Wine tasting', 'Board games', 'Karaoke', 'Movie night', 'Poker', 'Explore town', 'BBQ'],
        dare: ['Do an impression', 'Tell a secret', 'Sing a song', 'Dance battle', 'Call someone', 'Do 10 pushups', 'Act like Joe', 'Speak French']
    };

    let currentWheel = 'drinking';
    let isSpinning = false;
    let rotation = 0;

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentWheel = this.dataset.wheel;
        });
    });

    spinBtn.addEventListener('click', function() {
        if (isSpinning) return;

        isSpinning = true;
        spinBtn.disabled = true;

        const options = wheelData[currentWheel];
        const segmentAngle = 360 / options.length;
        const randomIndex = Math.floor(Math.random() * options.length);
        const extraSpins = 5 * 360; // 5 full rotations
        const targetAngle = extraSpins + (360 - (randomIndex * segmentAngle + segmentAngle / 2));

        rotation += targetAngle;
        spinner.style.transform = `rotate(${rotation}deg)`;

        setTimeout(() => {
            result.innerHTML = `<p>🎯 ${options[randomIndex]}!</p>`;
            result.classList.add('winner');
            setTimeout(() => result.classList.remove('winner'), 500);
            isSpinning = false;
            spinBtn.disabled = false;
        }, 4000);
    });
}

/* ============================================
   Joe's Timeline (Add Milestones)
   ============================================ */
function initJoeTimeline() {
    const form = document.getElementById('add-milestone-form');
    const timeline = document.getElementById('life-timeline');

    if (!form || !timeline) return;

    let milestones = JSON.parse(localStorage.getItem('joeMilestones') || '[]');

    milestones.forEach(m => addMilestoneToTimeline(m));

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const milestone = {
            year: document.getElementById('milestone-year').value.trim(),
            title: document.getElementById('milestone-title').value.trim(),
            desc: document.getElementById('milestone-desc').value.trim()
        };

        if (milestone.year && milestone.title && milestone.desc) {
            milestones.push(milestone);
            localStorage.setItem('joeMilestones', JSON.stringify(milestones));
            addMilestoneToTimeline(milestone);
            form.reset();
        }
    });

    function addMilestoneToTimeline(m) {
        const event = document.createElement('div');
        event.className = 'life-event';
        event.dataset.year = m.year;
        event.innerHTML = `
            <div class="life-year">${escapeHtml(m.year)}</div>
            <div class="life-content">
                <h4>${escapeHtml(m.title)}</h4>
                <p>${escapeHtml(m.desc)}</p>
            </div>
        `;

        // Insert before the 2026 highlight
        const highlight = timeline.querySelector('.life-event.highlight');
        if (highlight) {
            timeline.insertBefore(event, highlight);
        } else {
            timeline.appendChild(event);
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

/* ============================================
   Soundboard
   ============================================ */
function initSoundboard() {
    const buttons = document.querySelectorAll('.sound-btn');

    if (!buttons.length) return;

    // Web Audio API for generating sounds
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    const sounds = {
        airhorn: () => playTone([350, 450, 550], 0.5, 'sawtooth'),
        applause: () => playNoise(1.5),
        drumroll: () => playDrumroll(),
        birthday: () => playMelody([262, 262, 294, 262, 349, 330]),
        cheers: () => playTone([400, 500, 600], 0.3, 'sine'),
        woohoo: () => playTone([300, 400, 500, 600], 0.4, 'sine'),
        fail: () => playTone([400, 300, 200], 0.5, 'sawtooth'),
        rimshot: () => playRimshot()
    };

    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            const sound = this.dataset.sound;
            if (sounds[sound]) {
                this.classList.add('playing');
                sounds[sound]();
                setTimeout(() => this.classList.remove('playing'), 300);
            }
        });
    });

    function playTone(frequencies, duration, type) {
        frequencies.forEach((freq, i) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.type = type;
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.3, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.start(audioContext.currentTime + i * 0.1);
            osc.stop(audioContext.currentTime + duration + i * 0.1);
        });
    }

    function playNoise(duration) {
        const bufferSize = audioContext.sampleRate * duration;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = audioContext.createBufferSource();
        const gain = audioContext.createGain();
        noise.buffer = buffer;
        gain.gain.setValueAtTime(0.1, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        noise.connect(gain);
        gain.connect(audioContext.destination);
        noise.start();
    }

    function playDrumroll() {
        for (let i = 0; i < 20; i++) {
            setTimeout(() => playTone([100 + Math.random() * 50], 0.05, 'square'), i * 50);
        }
    }

    function playRimshot() {
        playTone([200], 0.1, 'square');
        setTimeout(() => playTone([150], 0.1, 'square'), 100);
        setTimeout(() => playTone([300, 400], 0.2, 'triangle'), 200);
    }

    function playMelody(notes) {
        notes.forEach((note, i) => {
            setTimeout(() => playTone([note], 0.3, 'sine'), i * 300);
        });
    }
}

/* ============================================
   Confessions Wall
   ============================================ */
function initConfessions() {
    const form = document.getElementById('confession-form');
    const wall = document.getElementById('confessions-wall');

    if (!form || !wall) return;

    let confessions = JSON.parse(localStorage.getItem('confessions') || '[]');
    let reactions = JSON.parse(localStorage.getItem('confessionReactions') || '{}');

    // Clear example and render saved confessions
    if (confessions.length > 0) {
        wall.innerHTML = '';
        confessions.forEach(c => addConfessionCard(c));
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const text = document.getElementById('confession-text').value.trim();
        if (!text) return;

        const confession = {
            id: Date.now().toString(),
            text,
            timestamp: Date.now()
        };

        confessions.unshift(confession);
        reactions[confession.id] = 0;

        localStorage.setItem('confessions', JSON.stringify(confessions));
        localStorage.setItem('confessionReactions', JSON.stringify(reactions));

        // Clear example if exists
        const example = wall.querySelector('.confession-card');
        if (example && !example.dataset.id) {
            wall.innerHTML = '';
        }

        addConfessionCard(confession, true);
        form.reset();
    });

    function addConfessionCard(c, prepend = false) {
        const card = document.createElement('div');
        card.className = 'confession-card';
        card.dataset.id = c.id;

        const timeAgo = getTimeAgo(c.timestamp);

        card.innerHTML = `
            <p class="confession-text">"${escapeHtml(c.text)}"</p>
            <span class="confession-time">${timeAgo}</span>
            <button class="confession-react" data-id="${c.id}">😂 <span>${reactions[c.id] || 0}</span></button>
        `;

        card.querySelector('.confession-react').addEventListener('click', function() {
            reactions[c.id] = (reactions[c.id] || 0) + 1;
            localStorage.setItem('confessionReactions', JSON.stringify(reactions));
            this.querySelector('span').textContent = reactions[c.id];
        });

        if (prepend) {
            wall.insertBefore(card, wall.firstChild);
        } else {
            wall.appendChild(card);
        }
    }

    function getTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return Math.floor(seconds / 60) + ' min ago';
        if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
        return Math.floor(seconds / 86400) + ' days ago';
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

/* ============================================
   Speech Timer
   ============================================ */
function initSpeechTimer() {
    const display = document.getElementById('timer-display');
    const startBtn = document.getElementById('timer-start');
    const pauseBtn = document.getElementById('timer-pause');
    const resetBtn = document.getElementById('timer-reset');
    const progressFill = document.getElementById('timer-progress-fill');
    const status = document.getElementById('timer-status');
    const presets = document.querySelectorAll('.timer-preset');

    if (!display || !startBtn) return;

    let totalTime = 120; // Default 2 minutes
    let timeLeft = totalTime;
    let interval = null;
    let isRunning = false;

    presets.forEach(preset => {
        preset.addEventListener('click', function() {
            if (isRunning) return;

            presets.forEach(p => p.classList.remove('active'));
            this.classList.add('active');

            totalTime = parseInt(this.dataset.time);
            timeLeft = totalTime;
            updateDisplay();
            updateProgress();
        });
    });

    startBtn.addEventListener('click', function() {
        if (isRunning) return;

        isRunning = true;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        status.textContent = 'Speech in progress...';

        interval = setInterval(() => {
            timeLeft--;
            updateDisplay();
            updateProgress();

            if (timeLeft <= 30) {
                display.classList.add('warning');
            }
            if (timeLeft <= 10) {
                display.classList.remove('warning');
                display.classList.add('danger');
            }

            if (timeLeft <= 0) {
                clearInterval(interval);
                isRunning = false;
                status.textContent = "Time's up! 🎉";
                triggerConfetti();
                startBtn.disabled = false;
                pauseBtn.disabled = true;
            }
        }, 1000);
    });

    pauseBtn.addEventListener('click', function() {
        if (!isRunning) return;

        clearInterval(interval);
        isRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        status.textContent = 'Paused';
    });

    resetBtn.addEventListener('click', function() {
        clearInterval(interval);
        isRunning = false;
        timeLeft = totalTime;
        updateDisplay();
        updateProgress();
        display.classList.remove('warning', 'danger');
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        status.textContent = 'Ready to time a speech!';
    });

    function updateDisplay() {
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        display.querySelector('.timer-minutes').textContent = mins.toString().padStart(2, '0');
        display.querySelector('.timer-seconds').textContent = secs.toString().padStart(2, '0');
    }

    function updateProgress() {
        const percentage = (timeLeft / totalTime) * 100;
        progressFill.style.width = percentage + '%';
    }
}

/* ============================================
   Live Photo Wall
   ============================================ */
function initPhotoWall() {
    const form = document.getElementById('photo-upload-form');
    const input = document.getElementById('photo-input');
    const grid = document.getElementById('photo-grid');
    const captionInput = document.getElementById('photo-caption');
    const uploaderInput = document.getElementById('photo-uploader');

    if (!form || !input || !grid) return;

    let photos = JSON.parse(localStorage.getItem('tripPhotos') || '[]');

    // Render saved photos
    if (photos.length > 0) {
        grid.innerHTML = '';
        photos.forEach(p => addPhotoToGrid(p));
    }

    input.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);

        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = function(event) {
                const photo = {
                    id: Date.now().toString() + Math.random(),
                    data: event.target.result,
                    caption: captionInput.value.trim(),
                    uploader: uploaderInput.value.trim() || 'Anonymous',
                    timestamp: Date.now()
                };

                photos.push(photo);

                // Only keep last 20 photos in localStorage (size limit)
                if (photos.length > 20) {
                    photos = photos.slice(-20);
                }

                localStorage.setItem('tripPhotos', JSON.stringify(photos));

                // Clear placeholder if exists
                const placeholder = grid.querySelector('.photo-placeholder');
                if (placeholder) {
                    grid.innerHTML = '';
                }

                addPhotoToGrid(photo);
            };
            reader.readAsDataURL(file);
        });

        // Reset inputs
        input.value = '';
        captionInput.value = '';
    });

    function addPhotoToGrid(photo) {
        const item = document.createElement('div');
        item.className = 'photo-item';
        item.innerHTML = `
            <img src="${photo.data}" alt="Trip photo">
            <div class="photo-item-caption">
                ${photo.caption ? `<p>${escapeHtml(photo.caption)}</p>` : ''}
                <span>📸 ${escapeHtml(photo.uploader)}</span>
            </div>
        `;

        // Click to view in lightbox
        item.addEventListener('click', function() {
            const lightbox = document.getElementById('lightbox');
            if (lightbox) {
                lightbox.querySelector('.lightbox-image').src = photo.data;
                lightbox.classList.add('active');
            }
        });

        grid.appendChild(item);
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

/* ============================================
   Daily Highlights
   ============================================ */
function initDailyHighlights() {
    const form = document.getElementById('highlight-form');
    const list = document.getElementById('highlights-list');
    const tabs = document.querySelectorAll('.highlight-tab');
    const winnerDisplay = document.getElementById('highlight-winner');

    if (!form || !list) return;

    let highlights = JSON.parse(localStorage.getItem('dailyHighlights') || '{}');
    let votes = JSON.parse(localStorage.getItem('highlightVotes') || '{}');
    let currentDay = '4'; // Default to birthday

    // Initialize days
    for (let i = 1; i <= 6; i++) {
        if (!highlights[i]) highlights[i] = [];
        if (!votes[i]) votes[i] = {};
    }

    renderHighlights();

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentDay = this.dataset.day;
            renderHighlights();
        });
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const text = document.getElementById('highlight-text').value.trim();
        const author = document.getElementById('highlight-author').value.trim();

        if (!text || !author) return;

        const highlight = {
            id: Date.now().toString(),
            text,
            author,
            timestamp: Date.now()
        };

        highlights[currentDay].push(highlight);
        votes[currentDay][highlight.id] = 0;

        localStorage.setItem('dailyHighlights', JSON.stringify(highlights));
        localStorage.setItem('highlightVotes', JSON.stringify(votes));

        renderHighlights();
        form.reset();
    });

    function renderHighlights() {
        const dayHighlights = highlights[currentDay] || [];
        const dayVotes = votes[currentDay] || {};

        if (dayHighlights.length === 0) {
            list.innerHTML = '<p style="text-align: center; color: var(--text-light);">🌟 No epic moments recorded yet! What was the highlight of the day?</p>';
            winnerDisplay.style.display = 'none';
            return;
        }

        list.innerHTML = '';
        dayHighlights.forEach(h => {
            const item = document.createElement('div');
            item.className = 'highlight-item';
            item.innerHTML = `
                <p class="highlight-text">"${escapeHtml(h.text)}"</p>
                <div class="highlight-meta">
                    <span class="highlight-author">${escapeHtml(h.author)}</span>
                    <button class="highlight-vote" data-id="${h.id}">⭐ <span>${dayVotes[h.id] || 0}</span></button>
                </div>
            `;

            item.querySelector('.highlight-vote').addEventListener('click', function() {
                dayVotes[h.id] = (dayVotes[h.id] || 0) + 1;
                votes[currentDay] = dayVotes;
                localStorage.setItem('highlightVotes', JSON.stringify(votes));
                this.querySelector('span').textContent = dayVotes[h.id];
                this.classList.add('voted');
                updateWinner();
            });

            list.appendChild(item);
        });

        updateWinner();
    }

    function updateWinner() {
        const dayHighlights = highlights[currentDay] || [];
        const dayVotes = votes[currentDay] || {};

        if (dayHighlights.length === 0) {
            winnerDisplay.style.display = 'none';
            return;
        }

        let maxVotes = 0;
        let winner = null;

        dayHighlights.forEach(h => {
            if ((dayVotes[h.id] || 0) > maxVotes) {
                maxVotes = dayVotes[h.id];
                winner = h;
            }
        });

        if (winner && maxVotes > 0) {
            winnerDisplay.style.display = 'block';
            document.getElementById('winner-text').textContent = `"${winner.text}" - ${winner.author} (${maxVotes} ⭐)`;
        } else {
            winnerDisplay.style.display = 'none';
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

/* ============================================
   Guest Login & Personalized Dashboard
   ============================================ */
function initGuestLogin() {
    const modal = document.getElementById('guest-login-modal');
    const form = document.getElementById('guest-login-form');
    const errorEl = document.getElementById('guest-login-error');
    const skipBtn = document.getElementById('skip-guest-login');
    const logoutBtn = document.getElementById('dashboard-logout');
    const dashboardSection = document.getElementById('my-dashboard');
    const navDashboard = document.getElementById('nav-dashboard');

    if (!modal || !form) return;

    // Guest data - CUSTOMIZE THIS WITH REAL DATA!
    const GUEST_DATA = {
        'joe30': {
            name: 'Joe',
            fullName: 'Joe O\'Brien',
            room: 'Master Suite',
            team: 'Team Champagne',
            nickname: 'The Birthday King',
            missions: [
                { id: 'm1', text: 'Accept at least 3 birthday toasts gracefully', completed: false },
                { id: 'm2', text: 'Dance to Mr. Brightside at your party', completed: false },
                { id: 'm3', text: 'Thank everyone individually by end of trip', completed: false }
            ],
            personalNotes: 'You\'re the star of the show! Just enjoy yourself and let everyone spoil you.'
        },
        'sophie30': {
            name: 'Sophie',
            fullName: 'Sophie Geen',
            room: 'Master Suite',
            team: 'Team Champagne',
            nickname: 'The Organiser',
            missions: [
                { id: 'm1', text: 'Make sure Joe doesn\'t find out about the surprise activity', completed: false },
                { id: 'm2', text: 'Get a candid photo of Joe laughing', completed: false },
                { id: 'm3', text: 'Lead the birthday toast at dinner', completed: false }
            ],
            personalNotes: 'You\'re on secret keeper duty! The surprise activity on Day 4 must stay hidden.'
        },
        'luke30': {
            name: 'Luke',
            fullName: 'Luke Recchia',
            room: 'Room 2',
            team: 'Team Bordeaux',
            nickname: 'The DJ',
            missions: [
                { id: 'm1', text: 'Get everyone dancing at least once', completed: false },
                { id: 'm2', text: 'Challenge Joe to a game and let him win', completed: false },
                { id: 'm3', text: 'Start a spontaneous sing-along', completed: false }
            ],
            personalNotes: 'You\'re in charge of party vibes! Make sure the music is always on point.'
        },
        'sam30': {
            name: 'Samantha',
            fullName: 'Samantha Recchia',
            room: 'Room 2',
            team: 'Team Bordeaux',
            nickname: 'The Memory Maker',
            missions: [
                { id: 'm1', text: 'Take at least 50 group photos', completed: false },
                { id: 'm2', text: 'Create a mini photo montage by end of trip', completed: false },
                { id: 'm3', text: 'Capture Joe\'s reaction to his birthday surprise', completed: false }
            ],
            personalNotes: 'You\'re the unofficial photographer - capture all the memories!'
        },
        'hannah30': {
            name: 'Hannah',
            fullName: 'Hannah O\'Brien',
            room: 'Room 3',
            team: 'Team Champagne',
            nickname: 'The Sister Act',
            missions: [
                { id: 'm1', text: 'Share an embarrassing childhood story about Joe', completed: false },
                { id: 'm2', text: 'Make sure Joe\'s birthday cake is perfect', completed: false },
                { id: 'm3', text: 'Get a sibling photo with Joe', completed: false }
            ],
            personalNotes: 'Sibling duty: bring the embarrassing stories and the love!'
        },
        'robin30': {
            name: 'Robin',
            fullName: 'Robin Hughes',
            room: 'Room 3',
            team: 'Team Rosé',
            nickname: 'The Adventurer',
            missions: [
                { id: 'm1', text: 'Suggest a spontaneous adventure', completed: false },
                { id: 'm2', text: 'Be first in the pool at least once', completed: false },
                { id: 'm3', text: 'Teach someone a new skill', completed: false }
            ],
            personalNotes: 'Bring the adventure energy! Suggest something fun and spontaneous.'
        },
        'johnny30': {
            name: 'Johnny',
            fullName: 'Johnny Gates O\'Brien',
            room: 'Room 4',
            team: 'Team Bordeaux',
            nickname: 'The Comedian',
            missions: [
                { id: 'm1', text: 'Tell at least 5 jokes (good or bad)', completed: false },
                { id: 'm2', text: 'Do an impression of Joe', completed: false },
                { id: 'm3', text: 'Win one game/competition', completed: false }
            ],
            personalNotes: 'You\'re the entertainment - keep the laughs coming!'
        },
        'florrie30': {
            name: 'Florrie',
            fullName: 'Florrie Gates O\'Brien',
            room: 'Room 4',
            team: 'Team Rosé',
            nickname: 'The Cheerleader',
            missions: [
                { id: 'm1', text: 'Lead a group cheer for Joe', completed: false },
                { id: 'm2', text: 'Help decorate for the birthday dinner', completed: false },
                { id: 'm3', text: 'Make everyone feel included', completed: false }
            ],
            personalNotes: 'Spread the good vibes and make sure everyone feels part of the celebration!'
        },
        'razon30': {
            name: 'Razon',
            fullName: 'Razon Mahebub',
            room: 'Room 5',
            team: 'Team Champagne',
            nickname: 'The Strategist',
            missions: [
                { id: 'm1', text: 'Win a strategy game', completed: false },
                { id: 'm2', text: 'Help plan a surprise moment', completed: false },
                { id: 'm3', text: 'Share a heartfelt toast', completed: false }
            ],
            personalNotes: 'Put those strategic skills to use - help make the surprises work!'
        },
        'neeve30': {
            name: 'Neeve',
            fullName: 'Neeve Fletcher',
            room: 'Room 5',
            team: 'Team Bordeaux',
            nickname: 'The Foodie',
            missions: [
                { id: 'm1', text: 'Find the best local cheese', completed: false },
                { id: 'm2', text: 'Help with one group meal', completed: false },
                { id: 'm3', text: 'Create a signature cocktail for the trip', completed: false }
            ],
            personalNotes: 'You\'re the culinary guide - find us the best food and drinks!'
        },
        'george30': {
            name: 'George',
            fullName: 'George Heyworth',
            room: 'Room 6',
            team: 'Team Rosé',
            nickname: 'The Hype Man',
            missions: [
                { id: 'm1', text: 'Start a chant at the birthday dinner', completed: false },
                { id: 'm2', text: 'Be the last one standing at the party', completed: false },
                { id: 'm3', text: 'Give a speech (even a short one)', completed: false }
            ],
            personalNotes: 'Bring the ENERGY! Get everyone hyped for Joe\'s big day.'
        },
        'emmaw30': {
            name: 'Emma W',
            fullName: 'Emma Winup',
            room: 'Room 6',
            team: 'Team Champagne',
            nickname: 'The Planner',
            missions: [
                { id: 'm1', text: 'Make sure activities run on time', completed: false },
                { id: 'm2', text: 'Help coordinate the group photo', completed: false },
                { id: 'm3', text: 'Create a mini itinerary for one activity', completed: false }
            ],
            personalNotes: 'Your organisational skills are needed - help keep things running smoothly!'
        },
        'tom30': {
            name: 'Tom',
            fullName: 'Tom Heyworth',
            room: 'Room 7',
            team: 'Team Bordeaux',
            nickname: 'The Storyteller',
            missions: [
                { id: 'm1', text: 'Tell a "remember when" story about Joe', completed: false },
                { id: 'm2', text: 'Document at least one funny moment', completed: false },
                { id: 'm3', text: 'Participate in the roast (lovingly!)', completed: false }
            ],
            personalNotes: 'Bring the stories! Joe\'s 30th needs some legendary tales.'
        },
        'robert30': {
            name: 'Robert',
            fullName: 'Robert Winup',
            room: 'Room 7',
            team: 'Team Rosé',
            nickname: 'The Wine Expert',
            missions: [
                { id: 'm1', text: 'Recommend the best wine at tasting', completed: false },
                { id: 'm2', text: 'Teach someone something about wine', completed: false },
                { id: 'm3', text: 'Toast to Joe with a great wine pick', completed: false }
            ],
            personalNotes: 'Share your wine wisdom! Help everyone appreciate the Loire Valley.'
        },
        'sarah30': {
            name: 'Sarah',
            fullName: 'Sarah',
            room: 'Room 8',
            team: 'Team Champagne',
            nickname: 'The Social Butterfly',
            missions: [
                { id: 'm1', text: 'Introduce two people who haven\'t met', completed: false },
                { id: 'm2', text: 'Start a conversation game', completed: false },
                { id: 'm3', text: 'Make someone new feel welcome', completed: false }
            ],
            personalNotes: 'Help everyone mingle and connect - be the social glue!'
        },
        'kiran30': {
            name: 'Kiran',
            fullName: 'Kiran Ruparelia',
            room: 'Room 8',
            team: 'Team Bordeaux',
            nickname: 'The Night Owl',
            missions: [
                { id: 'm1', text: 'Be part of a late-night chat', completed: false },
                { id: 'm2', text: 'Suggest a midnight activity', completed: false },
                { id: 'm3', text: 'Keep the party going when others flag', completed: false }
            ],
            personalNotes: 'You\'re the after-hours entertainment - keep the night alive!'
        },
        'shane30': {
            name: 'Shane',
            fullName: 'Shane Pallian',
            room: 'Room 9',
            team: 'Team Rosé',
            nickname: 'The Competitor',
            missions: [
                { id: 'm1', text: 'Win at least one game/challenge', completed: false },
                { id: 'm2', text: 'Challenge Joe to something competitive', completed: false },
                { id: 'm3', text: 'Be a gracious winner OR loser', completed: false }
            ],
            personalNotes: 'Bring the competitive spirit! Make the games exciting.'
        },
        'oli30': {
            name: 'Oli',
            fullName: 'Oli Moran',
            room: 'Room 9',
            team: 'Team Champagne',
            nickname: 'The Chill One',
            missions: [
                { id: 'm1', text: 'Keep everyone calm if things get hectic', completed: false },
                { id: 'm2', text: 'Suggest a relaxing activity', completed: false },
                { id: 'm3', text: 'Give Joe some genuine birthday wisdom', completed: false }
            ],
            personalNotes: 'Balance out the chaos with some chill vibes when needed.'
        },
        'peter30': {
            name: 'Peter',
            fullName: 'Peter London',
            room: 'Room 10',
            team: 'Team Bordeaux',
            nickname: 'The Wild Card',
            missions: [
                { id: 'm1', text: 'Do something unexpected', completed: false },
                { id: 'm2', text: 'Suggest a bold activity', completed: false },
                { id: 'm3', text: 'Make Joe laugh really hard', completed: false }
            ],
            personalNotes: 'Be unpredictable! Bring the surprises.'
        },
        'emmal30': {
            name: 'Emma L',
            fullName: 'Emma Levett',
            room: 'Room 10',
            team: 'Team Rosé',
            nickname: 'The Creative',
            missions: [
                { id: 'm1', text: 'Help with decorations or presentation', completed: false },
                { id: 'm2', text: 'Create a small handmade gift/card', completed: false },
                { id: 'm3', text: 'Document the trip artistically', completed: false }
            ],
            personalNotes: 'Bring your creative touch to make things special!'
        },
        'jonnyl30': {
            name: 'Jonny L',
            fullName: 'Jonny Levett',
            room: 'Room 11',
            team: 'Team Champagne',
            nickname: 'The Joker',
            missions: [
                { id: 'm1', text: 'Pull a harmless prank', completed: false },
                { id: 'm2', text: 'Keep the jokes coming all week', completed: false },
                { id: 'm3', text: 'Make Joe genuinely crack up', completed: false }
            ],
            personalNotes: 'Comedy is your mission - bring the laughs!'
        },
        'jonnyw30': {
            name: 'Jonny W',
            fullName: 'Jonny Williams',
            room: 'Room 11',
            team: 'Team Bordeaux',
            nickname: 'The Legend',
            missions: [
                { id: 'm1', text: 'Share a classic Joe story', completed: false },
                { id: 'm2', text: 'Help with the birthday toast', completed: false },
                { id: 'm3', text: 'Create a memorable moment', completed: false }
            ],
            personalNotes: 'Bring the legendary energy!'
        },
        'will30': {
            name: 'Will',
            fullName: 'Will Turner',
            room: 'Room 12',
            team: 'Team Rosé',
            nickname: 'The Captain',
            missions: [
                { id: 'm1', text: 'Lead a group activity', completed: false },
                { id: 'm2', text: 'Make sure no one gets left behind', completed: false },
                { id: 'm3', text: 'Give a captain\'s toast', completed: false }
            ],
            personalNotes: 'Take charge when needed - you\'re a natural leader!'
        },
        'chris30': {
            name: 'Chris',
            fullName: 'Chris Coggin',
            room: 'Room 12',
            team: 'Team Champagne',
            nickname: 'The Rock',
            missions: [
                { id: 'm1', text: 'Be dependable when things are needed', completed: false },
                { id: 'm2', text: 'Help with setup/cleanup', completed: false },
                { id: 'm3', text: 'Support someone who needs it', completed: false }
            ],
            personalNotes: 'You\'re the reliable one - help keep things running!'
        },
        'oscar30': {
            name: 'Oscar',
            fullName: 'Oscar Walters',
            room: 'Room 13',
            team: 'Team Bordeaux',
            nickname: 'The Party Starter',
            missions: [
                { id: 'm1', text: 'Get the party started at least once', completed: false },
                { id: 'm2', text: 'Lead a drinking game', completed: false },
                { id: 'm3', text: 'Be on the dance floor first', completed: false }
            ],
            personalNotes: 'When energy is needed, you\'re the spark!'
        },
        'matt30': {
            name: 'Matt',
            fullName: 'Matt Hill',
            room: 'Room 13',
            team: 'Team Rosé',
            nickname: 'The Smooth Operator',
            missions: [
                { id: 'm1', text: 'Keep conversations flowing', completed: false },
                { id: 'm2', text: 'Help resolve any friendly disputes', completed: false },
                { id: 'm3', text: 'Be the voice of reason when needed', completed: false }
            ],
            personalNotes: 'Keep the peace and keep things smooth!'
        },
        'pranay30': {
            name: 'Pranay',
            fullName: 'Pranay Dube',
            room: 'Room 14',
            team: 'Team Champagne',
            nickname: 'The Enthusiast',
            missions: [
                { id: 'm1', text: 'Be enthusiastic about every activity', completed: false },
                { id: 'm2', text: 'Encourage others to join in', completed: false },
                { id: 'm3', text: 'Give Joe an enthusiastic birthday hug', completed: false }
            ],
            personalNotes: 'Bring the enthusiasm - your energy is contagious!'
        }
    };

    // Check if already logged in
    const savedGuest = localStorage.getItem('guestCode');
    if (savedGuest && GUEST_DATA[savedGuest]) {
        modal.style.display = 'none';
        showDashboard(savedGuest);
    } else {
        // Show login modal after loading screen
        setTimeout(() => {
            modal.style.display = 'flex';
        }, 2000);
    }

    // Handle login form
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const code = document.getElementById('guest-code').value.toLowerCase().trim();

        if (GUEST_DATA[code]) {
            localStorage.setItem('guestCode', code);
            modal.style.display = 'none';
            showDashboard(code);
            triggerConfetti();
        } else {
            errorEl.style.display = 'block';
            document.getElementById('guest-code').value = '';
        }
    });

    // Skip login
    skipBtn.addEventListener('click', function() {
        modal.style.display = 'none';
        localStorage.setItem('guestCode', 'guest');
    });

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('guestCode');
            localStorage.removeItem('missionProgress');
            dashboardSection.style.display = 'none';
            navDashboard.style.display = 'none';
            modal.style.display = 'flex';
        });
    }

    function showDashboard(code) {
        const guest = GUEST_DATA[code];
        if (!guest || !dashboardSection) return;

        // Show dashboard
        dashboardSection.style.display = 'block';
        navDashboard.style.display = 'inline-block';

        // Populate dashboard
        document.getElementById('dashboard-name').textContent = guest.name;
        document.getElementById('stat-room').textContent = guest.room;
        document.getElementById('stat-team').textContent = guest.team;
        document.getElementById('stat-nickname').textContent = guest.nickname;

        // Personal notes
        const personalAgenda = document.getElementById('personal-agenda');
        personalAgenda.innerHTML = `<p>${guest.personalNotes}</p>`;

        // Missions
        renderMissions(code, guest.missions);
    }

    function renderMissions(code, missions) {
        const list = document.getElementById('missions-list');
        const completedEl = document.getElementById('missions-completed');
        const totalEl = document.getElementById('missions-total');

        // Load saved progress
        const savedProgress = JSON.parse(localStorage.getItem('missionProgress') || '{}');
        const guestProgress = savedProgress[code] || {};

        let completedCount = 0;
        list.innerHTML = '';

        missions.forEach((mission, index) => {
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
                ${isCompleted ? '<span class="mission-done">✓ Done!</span>' : ''}
            `;

            const checkbox = item.querySelector('input');
            checkbox.addEventListener('change', function() {
                guestProgress[mission.id] = this.checked;
                savedProgress[code] = guestProgress;
                localStorage.setItem('missionProgress', JSON.stringify(savedProgress));
                renderMissions(code, missions);

                if (this.checked) {
                    triggerMiniConfetti();
                }
            });

            list.appendChild(item);
        });

        completedEl.textContent = completedCount;
        totalEl.textContent = missions.length;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

/* ============================================
   Secret Agenda Items (Date-locked content)
   ============================================ */
function initSecretAgenda() {
    const secretItems = document.querySelectorAll('.timeline-item.top-secret');

    if (!secretItems.length) return;

    // Check if we should unlock based on date
    const now = new Date();

    secretItems.forEach(item => {
        const unlockDate = new Date(item.dataset.unlock);
        const overlay = item.querySelector('.secret-overlay');
        const content = item.querySelector('.secret-content');

        if (now >= unlockDate) {
            // Unlock the secret content
            if (overlay) overlay.style.display = 'none';
            if (content) content.style.display = 'block';
            item.classList.add('unlocked');
            item.classList.remove('top-secret');
        }
    });

    // Admin override - click secret 5 times to reveal (for testing)
    let clickCount = 0;
    secretItems.forEach(item => {
        item.addEventListener('click', function() {
            clickCount++;
            if (clickCount >= 5) {
                const overlay = this.querySelector('.secret-overlay');
                const content = this.querySelector('.secret-content');
                if (overlay) overlay.style.display = 'none';
                if (content) content.style.display = 'block';
                this.classList.add('unlocked');
                clickCount = 0;
            }
        });
    });
}

/* ============================================
   Trip Preferences Form
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
    const guestCode = localStorage.getItem('guestCode');
    const savedPrefs = JSON.parse(localStorage.getItem('tripPrefs_' + guestCode) || 'null');

    if (savedPrefs) {
        // Restore travel
        const travelRadio = form.querySelector(`input[name="travel"][value="${savedPrefs.travel}"]`);
        if (travelRadio) travelRadio.checked = true;
        if (savedPrefs.travel === 'later') travelExtra.style.display = 'block';
        if (savedPrefs.arrivalNote) document.getElementById('travel-arrival-note').value = savedPrefs.arrivalNote;

        // Restore dietary
        if (savedPrefs.dietary) document.getElementById('pref-dietary').value = savedPrefs.dietary;

        // Restore activities
        if (savedPrefs.activities) {
            savedPrefs.activities.forEach(val => {
                const cb = form.querySelector(`input[name="activities"][value="${val}"]`);
                if (cb) cb.checked = true;
            });
        }

        // Restore duties
        if (savedPrefs.duties) {
            savedPrefs.duties.forEach(val => {
                const cb = form.querySelector(`input[name="duties"][value="${val}"]`);
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

        localStorage.setItem('tripPrefs_' + guestCode, JSON.stringify(prefs));

        // Also save to a master list so admin can see all responses
        const allPrefs = JSON.parse(localStorage.getItem('allTripPrefs') || '{}');
        allPrefs[guestCode] = prefs;
        localStorage.setItem('allTripPrefs', JSON.stringify(allPrefs));

        savedMsg.style.display = 'block';
        savedMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Confetti for submitting
        if (typeof triggerConfetti === 'function') triggerConfetti();
    });
}

/* ============================================
   Games & Challenges
   ============================================ */
function initChallenges() {
    const tabs = document.querySelectorAll('.ch-tab');
    const contents = document.querySelectorAll('.ch-content[data-ch]');
    const dayBtns = document.querySelectorAll('.ch-day-btn');
    const dayContents = document.querySelectorAll('.ch-day-content');

    if (!tabs.length) return;

    // Main tab switching (Daily / Duties / Ongoing)
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            const target = document.querySelector(`.ch-content[data-ch="${this.dataset.ch}"]`);
            if (target) target.classList.add('active');
        });
    });

    // Day switching within Daily Games
    dayBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            dayBtns.forEach(b => b.classList.remove('active'));
            dayContents.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            const target = document.querySelector(`.ch-day-content[data-chday="${this.dataset.chday}"]`);
            if (target) target.classList.add('active');
        });
    });

    // Load saved challenge statuses
    const savedStatuses = JSON.parse(localStorage.getItem('challengeStatuses') || '{}');

    // Apply saved statuses
    document.querySelectorAll('.ch-status').forEach(status => {
        const id = status.dataset.challenge;
        if (savedStatuses[id]) {
            status.textContent = savedStatuses[id];
            status.classList.add('done');
            status.closest('.ch-card').classList.add('completed');
        }
    });

    // Admin: click status to toggle complete (only for joe30)
    const isAdmin = localStorage.getItem('guestCode') === 'joe30';
    if (isAdmin) {
        document.querySelectorAll('.ch-status').forEach(status => {
            status.style.cursor = 'pointer';
            status.title = 'Click to mark complete';
            status.addEventListener('click', function() {
                const id = this.dataset.challenge;
                const card = this.closest('.ch-card');

                if (this.classList.contains('done')) {
                    this.classList.remove('done');
                    this.textContent = 'Pending';
                    card.classList.remove('completed');
                    delete savedStatuses[id];
                } else {
                    this.classList.add('done');
                    this.textContent = 'Done ✓';
                    card.classList.add('completed');
                    savedStatuses[id] = 'Done ✓';
                }

                localStorage.setItem('challengeStatuses', JSON.stringify(savedStatuses));
            });
        });
    }
}

/* ============================================
   Itinerary Comparison & Voting
   ============================================ */
function initItineraryCompare() {
    const tabs = document.querySelectorAll('.itin-tab');
    const contents = document.querySelectorAll('.itin-content');
    const voteButtons = document.querySelectorAll('.itin-vote-btn');
    const voteNote = document.getElementById('itin-vote-note');

    if (!tabs.length) return;

    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const target = this.dataset.itin;

            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            this.classList.add('active');
            const targetContent = document.querySelector(`.itin-content[data-itin="${target}"]`);
            if (targetContent) targetContent.classList.add('active');
        });
    });

    // Voting
    const votes = JSON.parse(localStorage.getItem('itinVotes') || '{"chill":0,"adventure":0,"balanced":0}');
    const userVote = localStorage.getItem('itinUserVote');

    updateVoteDisplay();

    voteButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const choice = this.dataset.vote;

            // If already voted for this, remove vote
            if (userVote === choice) {
                votes[choice] = Math.max(0, votes[choice] - 1);
                localStorage.removeItem('itinUserVote');
            } else {
                // Remove previous vote if any
                if (userVote && votes[userVote] > 0) {
                    votes[userVote]--;
                }
                votes[choice]++;
                localStorage.setItem('itinUserVote', choice);
            }

            localStorage.setItem('itinVotes', JSON.stringify(votes));
            updateVoteDisplay();
        });
    });

    function updateVoteDisplay() {
        const currentVote = localStorage.getItem('itinUserVote');

        document.getElementById('vote-chill').textContent = votes.chill;
        document.getElementById('vote-adventure').textContent = votes.adventure;
        document.getElementById('vote-balanced').textContent = votes.balanced;

        voteButtons.forEach(btn => {
            btn.classList.remove('voted');
            if (btn.dataset.vote === currentVote) {
                btn.classList.add('voted');
            }
        });

        const total = votes.chill + votes.adventure + votes.balanced;
        if (total > 0 && voteNote) {
            const names = { chill: 'Chill & Chateau', adventure: 'Adventure Seekers', balanced: 'Best of Both' };
            const leader = Object.keys(votes).reduce((a, b) => votes[a] > votes[b] ? a : b);
            voteNote.textContent = `${names[leader]} is in the lead with ${votes[leader]} vote${votes[leader] !== 1 ? 's' : ''}!`;
        } else if (voteNote) {
            voteNote.textContent = 'Cast your vote!';
        }
    }
}

/* ============================================
   Leaderboard & Points System
   ============================================ */
function initLeaderboard() {
    const tabs = document.querySelectorAll('.lb-tab');
    const contents = document.querySelectorAll('.lb-content');
    const adminPanel = document.getElementById('lb-admin');
    const adminBtn = document.getElementById('admin-toggle-btn');
    const form = document.getElementById('award-points-form');
    const typeSelect = document.getElementById('award-type');
    const targetSelect = document.getElementById('award-target');

    if (!tabs.length) return;

    // All guests with their teams
    const PLAYERS = {
        'Joe': 'champagne', 'Sophie': 'champagne', 'Hannah': 'champagne',
        'Razon': 'champagne', 'Emma W': 'champagne', 'Sarah': 'champagne',
        'Oli': 'champagne', 'Jonny L': 'champagne', 'Chris': 'champagne',
        'Pranay': 'champagne',
        'Luke': 'bordeaux', 'Sam': 'bordeaux', 'Johnny': 'bordeaux',
        'Neeve': 'bordeaux', 'Tom': 'bordeaux', 'Kiran': 'bordeaux',
        'George': 'bordeaux', 'Peter': 'bordeaux', 'Jonny W': 'bordeaux',
        'Oscar': 'bordeaux',
        'Robin': 'rose', 'Florrie': 'rose', 'Robert': 'rose',
        'Emma L': 'rose', 'Shane': 'rose', 'Will': 'rose',
        'Matt': 'rose'
    };

    const TEAMS = ['champagne', 'bordeaux', 'rose'];
    const TEAM_NAMES = { champagne: 'Team Champagne', bordeaux: 'Team Bordeaux', rose: 'Team Rosé' };

    // Load data from localStorage
    let teamScores = JSON.parse(localStorage.getItem('lb_teamScores') || '{"champagne":0,"bordeaux":0,"rose":0}');
    let individualScores = JSON.parse(localStorage.getItem('lb_individualScores') || '{}');
    let pointsLog = JSON.parse(localStorage.getItem('lb_pointsLog') || '[]');

    // Initialize individual scores
    Object.keys(PLAYERS).forEach(name => {
        if (!(name in individualScores)) individualScores[name] = 0;
    });

    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            const target = document.querySelector(`.lb-content[data-lb="${this.dataset.lb}"]`);
            if (target) target.classList.add('active');
        });
    });

    // Admin access - only joe30 can see admin panel
    const isAdmin = localStorage.getItem('guestCode') === 'joe30';
    if (isAdmin) {
        adminBtn.style.display = 'block';
        adminBtn.textContent = '🔐 Admin Panel';
    } else {
        adminBtn.style.display = 'none';
    }

    adminBtn.addEventListener('click', function() {
        if (!isAdmin) return;
        adminPanel.style.display = adminPanel.style.display === 'none' ? 'block' : 'none';
    });

    // Populate target select based on type
    function updateTargetOptions() {
        targetSelect.innerHTML = '';
        if (typeSelect.value === 'team') {
            TEAMS.forEach(t => {
                const opt = document.createElement('option');
                opt.value = t;
                opt.textContent = TEAM_NAMES[t];
                targetSelect.appendChild(opt);
            });
        } else {
            Object.keys(PLAYERS).sort().forEach(name => {
                const opt = document.createElement('option');
                opt.value = name;
                opt.textContent = name;
                targetSelect.appendChild(opt);
            });
        }
    }

    typeSelect.addEventListener('change', updateTargetOptions);
    updateTargetOptions();

    // Award points form
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const type = typeSelect.value;
        const target = targetSelect.value;
        const amount = parseInt(document.getElementById('award-amount').value);
        const reason = document.getElementById('award-reason').value.trim();

        if (!amount || !reason) return;

        awardPoints(type, target, amount, reason);
        form.reset();
        updateTargetOptions();
    });

    // Quick award buttons
    document.querySelectorAll('.quick-award').forEach(btn => {
        btn.addEventListener('click', function() {
            const points = parseInt(this.dataset.points);
            const reason = this.dataset.reason;
            const type = typeSelect.value;
            const target = targetSelect.value;

            awardPoints(type, target, points, reason);
        });
    });

    function awardPoints(type, target, amount, reason) {
        const entry = {
            type: type,
            target: target,
            amount: amount,
            reason: reason,
            time: new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
        };

        if (type === 'team') {
            teamScores[target] = (teamScores[target] || 0) + amount;
        } else {
            individualScores[target] = (individualScores[target] || 0) + amount;
            // Also add to their team
            const team = PLAYERS[target];
            if (team) {
                teamScores[team] = (teamScores[team] || 0) + amount;
            }
        }

        pointsLog.unshift(entry);

        // Save
        localStorage.setItem('lb_teamScores', JSON.stringify(teamScores));
        localStorage.setItem('lb_individualScores', JSON.stringify(individualScores));
        localStorage.setItem('lb_pointsLog', JSON.stringify(pointsLog));

        renderAll();
    }

    function renderAll() {
        renderTeams();
        renderIndividuals();
        renderLog();
    }

    function renderTeams() {
        // Update scores
        TEAMS.forEach(team => {
            const scoreEl = document.getElementById(`score-${team}`);
            if (scoreEl) scoreEl.textContent = teamScores[team] || 0;

            // Show members
            const membersEl = document.getElementById(`members-${team}`);
            if (membersEl) {
                const members = Object.keys(PLAYERS).filter(n => PLAYERS[n] === team);
                membersEl.textContent = members.join(', ');
            }
        });

        // Highlight leader
        const cards = document.querySelectorAll('.team-card');
        const maxScore = Math.max(...TEAMS.map(t => teamScores[t] || 0));
        cards.forEach(card => {
            card.classList.remove('leading');
            const team = card.dataset.team;
            if ((teamScores[team] || 0) === maxScore && maxScore > 0) {
                card.classList.add('leading');
            }
        });
    }

    function renderIndividuals() {
        const board = document.getElementById('individual-board');
        if (!board) return;

        const sorted = Object.keys(individualScores)
            .map(name => ({ name, points: individualScores[name], team: PLAYERS[name] }))
            .sort((a, b) => b.points - a.points);

        board.innerHTML = '';
        sorted.forEach((player, i) => {
            const row = document.createElement('div');
            row.className = 'ind-row' + (i < 3 && player.points > 0 ? ' top-3' : '');

            let rankDisplay = i + 1;
            if (i === 0 && player.points > 0) rankDisplay = '🥇';
            else if (i === 1 && player.points > 0) rankDisplay = '🥈';
            else if (i === 2 && player.points > 0) rankDisplay = '🥉';

            row.innerHTML = `
                <span class="ind-rank">${rankDisplay}</span>
                <span class="ind-team-dot ${player.team || ''}"></span>
                <span class="ind-name">${player.name}</span>
                <span class="ind-points">${player.points} pts</span>
            `;
            board.appendChild(row);
        });
    }

    function renderLog() {
        const log = document.getElementById('points-log');
        if (!log) return;

        if (pointsLog.length === 0) {
            log.innerHTML = '<p class="log-empty">No points awarded yet - let the games begin!</p>';
            return;
        }

        log.innerHTML = '';
        pointsLog.slice(0, 50).forEach(entry => {
            const div = document.createElement('div');
            div.className = 'log-entry';
            const isPositive = entry.amount > 0;
            const displayTarget = entry.type === 'team' ? TEAM_NAMES[entry.target] || entry.target : entry.target;

            div.innerHTML = `
                <span class="log-points ${isPositive ? 'positive' : 'negative'}">${isPositive ? '+' : ''}${entry.amount}</span>
                <span class="log-target">${displayTarget}</span>
                <span class="log-reason">${entry.reason}</span>
                <span class="log-time">${entry.time}</span>
            `;
            log.appendChild(div);
        });
    }

    // Initial render
    renderAll();
}
