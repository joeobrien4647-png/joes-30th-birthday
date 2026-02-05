/* ============================================
   Crew Page JavaScript
   ============================================ */

/* ============================================
   Profile Modal
   ============================================ */
function initProfiles() {
    const modal = document.getElementById('profile-modal');
    if (!modal) return;

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
        guest.addEventListener('click', function () {
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
    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            closeProfile();
        }
    });

    // Close on escape key
    document.addEventListener('keydown', function (e) {
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

    // Load RSVP status using Store helper
    const rsvpStatus = Store.get('rsvpStatus', {});

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

        // Click to cycle status
        card.addEventListener('click', function () {
            const currentStatus = rsvpStatus[guest] || 'pending';
            const nextStatus = currentStatus === 'pending' ? 'confirmed' :
                              currentStatus === 'confirmed' ? 'maybe' : 'pending';

            rsvpStatus[guest] = nextStatus;
            Store.set('rsvpStatus', rsvpStatus);

            this.className = `tracker-card ${nextStatus}`;
            this.querySelector('.tracker-status').textContent = getStatusEmoji(nextStatus);
            updateCounts();
        });

        grid.appendChild(card);
    });

    updateCounts();

    function getStatusEmoji(status) {
        return status === 'confirmed' ? '\u2705' :
               status === 'maybe' ? '\uD83E\uDD14' : '\u23F3';
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
   Voting System
   ============================================ */
function initVoting() {
    const polls = document.querySelectorAll('.poll');

    // Load saved votes using Store helper
    const savedVotes = Store.get('tripVotes', {});

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
            const userVotes = Store.get('userVotes', {});
            if (userVotes[pollName] && userVotes[pollName].includes(optionName)) {
                option.classList.add('voted');
            }

            // Click handler
            option.addEventListener('click', function () {
                const userVotes = Store.get('userVotes', {});

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
                Store.set('userVotes', userVotes);
                savedVotes[pollName] = voteCounts;
                Store.set('tripVotes', savedVotes);

                // Update all options in this poll
                options.forEach(opt => {
                    updateOptionDisplay(opt, voteCounts[opt.dataset.option], getTotalVotes(voteCounts));
                });
            });
        });

        // Save initial votes
        savedVotes[pollName] = voteCounts;
        Store.set('tripVotes', savedVotes);
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

    // Load saved suggestions using Store helper
    const savedSuggestions = Store.get('tripSuggestions', []);

    // Display saved suggestions
    savedSuggestions.forEach(suggestion => {
        addSuggestionToList(suggestion, false);
    });

    form.addEventListener('submit', function (e) {
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
            Store.set('tripSuggestions', savedSuggestions);

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
        // Uses global escapeHtml from shared.js
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
}

/* ============================================
   Initialize all crew page features
   ============================================ */
document.addEventListener('DOMContentLoaded', function () {
    initProfiles();
    initRSVPTracker();
    initVoting();
    initSuggestions();
});
