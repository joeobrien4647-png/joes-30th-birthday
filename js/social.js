/* ============================================
   Social Page JavaScript
   All init functions for the Social Wall page.
   Uses global escapeHtml() from shared.js.
   Uses Store.get / Store.set from shared.js.
   ============================================ */

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
   Toast Sign-up
   ============================================ */
function initToastSignup() {
    const form = document.getElementById('toast-form');
    const list = document.getElementById('toast-list');

    if (!form || !list) return;

    const savedToasts = Store.get('toastSignups', []);

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
            Store.set('toastSignups', savedToasts);
            addToastToList(toast, savedToasts.length, true);
            form.reset();
            triggerMiniConfetti();
        }
    });

    function addToastToList(toast, order, isNew) {
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
}

/* ============================================
   Predictions
   ============================================ */
function initPredictions() {
    const form = document.getElementById('prediction-form');
    const grid = document.getElementById('predictions-grid');

    if (!form || !grid) return;

    let predictions = Store.get('predictions', []);

    predictions.forEach(pred => addPredictionCard(pred, false));

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const author = document.getElementById('prediction-author').value.trim();
        const text = document.getElementById('prediction-text').value.trim();

        if (!author || !text) return;

        const prediction = { author, text, timestamp: Date.now() };
        predictions.push(prediction);
        Store.set('predictions', predictions);

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
        const resultsDiv = card.querySelector('.superlative-results');

        if (votes[category]) {
            resultsDiv.innerHTML = `<span class="superlative-leader">Your pick: ${votes[category]}</span>`;
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
   Joe's 30 Year Timeline
   ============================================ */
function initJoeTimeline() {
    const form = document.getElementById('add-milestone-form');
    const timeline = document.getElementById('life-timeline');

    if (!form || !timeline) return;

    let milestones = Store.get('joeMilestones', []);

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
            Store.set('joeMilestones', milestones);
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

        const highlight = timeline.querySelector('.life-event.highlight');
        if (highlight) {
            timeline.insertBefore(event, highlight);
        } else {
            timeline.appendChild(event);
        }
    }
}

/* ============================================
   Confessions
   ============================================ */
function initConfessions() {
    const form = document.getElementById('confession-form');
    const wall = document.getElementById('confessions-wall');

    if (!form || !wall) return;

    let confessions = Store.get('confessions', []);
    let reactions = Store.get('confessionReactions', {});

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

        Store.set('confessions', confessions);
        Store.set('confessionReactions', reactions);

        // Clear example if exists
        const example = wall.querySelector('.confession-card');
        if (example && !example.dataset.id) {
            wall.innerHTML = '';
        }

        addConfessionCard(confession, true);
        form.reset();
    });

    function addConfessionCard(c, prepend) {
        prepend = prepend || false;
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
            Store.set('confessionReactions', reactions);
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
}

/* ============================================
   Lightbox Close Handler
   ============================================ */
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    lightbox.querySelector('.lightbox-close').addEventListener('click', function() {
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
    initBirthdayMessages();
    initToastSignup();
    initPredictions();
    initSuperlatives();
    initMemoryTimeline();
    initMusicRequests();
    initJoeTimeline();
    initConfessions();
    initPhotoWall();
    initLightbox();
});
