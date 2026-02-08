/* ============================================
   Social Page JavaScript
   All init functions for the Social Wall page.
   Uses global escapeHtml() from shared.js.
   Uses Store.get / Store.set from shared.js.
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

    if (!closeBtn || !profileAvatar || !profileName || !profileRoom || !profileSuperlative ||
        !profileFact || !profileBringing || !profileAnthem) {
        return;
    }

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
   Birthday Messages
   ============================================ */
function initBirthdayMessages() {
    const form = document.getElementById('message-form');
    const wall = document.getElementById('messages-wall');

    if (!form || !wall) return;

    const savedMessages = Store.get('birthdayMessages', []);

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
            Store.set('birthdayMessages', savedMessages);

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

        const example = wall.querySelector('.example');
        if (example) {
            wall.insertBefore(card, example);
        } else if (wall.firstChild) {
            wall.insertBefore(card, wall.firstChild);
        } else {
            wall.appendChild(card);
        }
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

    let votes = Store.get('superlativeVotes', {});

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
            Store.set('superlativeVotes', votes);
            updateResults(category);
        });

        updateResults(category);
    });

    function updateResults(category) {
        const card = grid.querySelector(`[data-category="${category}"]`);
        if (!card) return;
        const resultsDiv = card.querySelector('.superlative-results');
        if (!resultsDiv) return;

        if (votes[category]) {
            resultsDiv.innerHTML = `<span class="superlative-leader">Your pick: ${escapeHtml(votes[category])}</span>`;
        }
    }
}

/* ============================================
   Memory Timeline
   ============================================ */
function initMemoryTimeline() {
    const form = document.getElementById('memory-form');
    const timeline = document.getElementById('memory-timeline');

    if (!form || !timeline) return;

    let memories = Store.get('memories', []);

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
        Store.set('memories', memories);

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
}

/* ============================================
   Music Requests
   ============================================ */
function initMusicRequests() {
    const form = document.getElementById('music-form');
    const list = document.getElementById('music-list');

    if (!form || !list) return;

    let songs = Store.get('musicRequests', []);
    let upvotes = Store.get('musicUpvotes', {});

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

        Store.set('musicRequests', songs);
        Store.set('musicUpvotes', upvotes);

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
            Store.set('musicUpvotes', upvotes);
            this.querySelector('span').textContent = upvotes[song.id];
            this.classList.add('voted');
        });

        list.appendChild(item);
    }
}

/* ============================================
   Photo Wall
   ============================================ */
function initPhotoWall() {
    const form = document.getElementById('photo-upload-form');
    const input = document.getElementById('photo-input');
    const grid = document.getElementById('photo-grid');
    const captionInput = document.getElementById('photo-caption');
    const uploaderInput = document.getElementById('photo-uploader');

    if (!form || !input || !grid) return;

    let photos = Store.get('tripPhotos', []);

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
                const caption = captionInput ? captionInput.value.trim() : '';
                const uploader = uploaderInput && uploaderInput.value.trim()
                    ? uploaderInput.value.trim()
                    : 'Anonymous';

                const photo = {
                    id: Date.now().toString() + Math.random(),
                    data: event.target.result,
                    caption,
                    uploader,
                    timestamp: Date.now()
                };

                photos.push(photo);

                // Only keep last 20 photos in localStorage (size limit)
                if (photos.length > 20) {
                    photos = photos.slice(-20);
                }

                Store.set('tripPhotos', photos);

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
        if (captionInput) captionInput.value = '';
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
}

/* ============================================
   Lightbox Close Handler
   ============================================ */
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    const closeBtn = lightbox.querySelector('.lightbox-close');
    if (!closeBtn) return;

    closeBtn.addEventListener('click', function() {
        lightbox.classList.remove('active');
    });

    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            lightbox.classList.remove('active');
        }
    });
}

/* ============================================
   Initialize All Social Features
   ============================================ */
document.addEventListener('DOMContentLoaded', function() {
    initProfiles();
    initBirthdayMessages();
    initSuperlatives();
    initMemoryTimeline();
    initMusicRequests();
    initPhotoWall();
    initLightbox();
});
