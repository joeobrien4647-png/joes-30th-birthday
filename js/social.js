/* ============================================
   Social Page JavaScript
   All init functions for the Social Wall page.
   Uses global escapeHtml() from shared.js.
   Uses Store.get / Store.set from shared.js.
   ============================================ */

/* ============================================
   Profile Modal — dynamically created overlay
   Bypasses all CSS by building the modal from scratch.
   ============================================ */
function initProfiles() {
    var activeOverlay = null;

    function slugify(name) {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    function openProfile(data) {
        if (activeOverlay) closeProfile();

        // Build overlay from scratch — no dependency on HTML modal element
        var overlay = document.createElement('div');
        overlay.id = 'profile-overlay-dynamic';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;backdrop-filter:blur(5px);';

        var card = document.createElement('div');
        card.style.cssText = 'background:#fff;border-radius:25px;max-width:450px;width:100%;max-height:90vh;overflow-y:auto;position:relative;animation:profilePop 0.3s ease;';

        // Close button
        var closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.cssText = 'position:absolute;top:12px;right:16px;background:none;border:none;font-size:2rem;cursor:pointer;color:#666;z-index:2;line-height:1;';
        closeBtn.addEventListener('click', function (e) { e.stopPropagation(); closeProfile(); });
        card.appendChild(closeBtn);

        // Header
        var header = document.createElement('div');
        header.style.cssText = 'display:flex;align-items:center;gap:15px;padding:30px 25px 15px;';

        var avatar = document.createElement('div');
        var isBirthday = data.birthday === 'true';
        avatar.style.cssText = 'width:70px;height:70px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;font-size:1.3rem;flex-shrink:0;overflow:hidden;' +
            (isBirthday ? 'background:#ffd93d;color:#1a1a2e;box-shadow:0 0 20px rgba(255,217,61,0.5);' : 'background:linear-gradient(135deg,#667eea,#764ba2);');

        // Try to show photo, fallback to initials
        var photoPath = 'images/guests/' + slugify(data.name) + '.jpg';
        var avatarImg = document.createElement('img');
        avatarImg.style.cssText = 'width:100%;height:100%;object-fit:cover;display:none;';
        avatarImg.addEventListener('load', function () { this.style.display = 'block'; avatarInitials.style.display = 'none'; });
        avatarImg.addEventListener('error', function () { this.style.display = 'none'; });
        avatarImg.src = photoPath;
        var avatarInitials = document.createElement('span');
        avatarInitials.textContent = data.initials || '';
        avatar.appendChild(avatarImg);
        avatar.appendChild(avatarInitials);

        var titleDiv = document.createElement('div');
        var nameEl = document.createElement('h2');
        nameEl.textContent = data.name || '';
        nameEl.style.cssText = 'margin:0;font-size:1.4rem;color:#1a1a2e;';
        var roomEl = document.createElement('p');
        roomEl.textContent = data.room || '';
        roomEl.style.cssText = 'margin:4px 0 0;font-size:0.9rem;color:#888;';
        titleDiv.appendChild(nameEl);
        titleDiv.appendChild(roomEl);

        header.appendChild(avatar);
        header.appendChild(titleDiv);
        card.appendChild(header);

        // Video container
        var videoWrap = document.createElement('div');
        videoWrap.style.cssText = 'display:none;margin:0 20px;border-radius:15px;overflow:hidden;background:#000;position:relative;';

        var videoEl = document.createElement('video');
        videoEl.setAttribute('playsinline', '');
        videoEl.muted = true;
        videoEl.loop = true;
        videoEl.style.cssText = 'width:100%;max-height:320px;object-fit:cover;display:block;';

        var soundBtn = document.createElement('button');
        soundBtn.textContent = '\uD83D\uDD07';
        soundBtn.style.cssText = 'position:absolute;bottom:10px;right:10px;background:rgba(0,0,0,0.6);border:none;border-radius:50%;width:36px;height:36px;cursor:pointer;font-size:1.2rem;color:#fff;';
        soundBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            videoEl.muted = !videoEl.muted;
            soundBtn.textContent = videoEl.muted ? '\uD83D\uDD07' : '\uD83D\uDD0A';
        });

        videoWrap.appendChild(videoEl);
        videoWrap.appendChild(soundBtn);
        card.appendChild(videoWrap);

        // Try to load video
        var slug = slugify(data.name);
        var videoPath = data.video || ('videos/' + slug + '.mp4');
        videoEl.oncanplay = function () {
            videoWrap.style.display = 'block';
            videoEl.play().catch(function () {});
            videoEl.oncanplay = null;
        };
        videoEl.onerror = function () { videoEl.onerror = null; };
        videoEl.src = videoPath;

        // Info fields
        var body = document.createElement('div');
        body.style.cssText = 'padding:20px 25px 30px;';

        var fields = [
            ['Superlative', data.superlative],
            ['Fun Fact', data.fact],
            ['Bringing to the Trip', data.bringing],
            ['Party Anthem', data.anthem]
        ];
        fields.forEach(function (f) {
            if (!f[1]) return;
            var field = document.createElement('div');
            field.style.cssText = 'margin-bottom:15px;';
            var label = document.createElement('span');
            label.textContent = f[0];
            label.style.cssText = 'display:block;font-size:0.75rem;text-transform:uppercase;letter-spacing:1px;color:#888;margin-bottom:4px;font-weight:600;';
            var value = document.createElement('p');
            value.textContent = f[1];
            value.style.cssText = 'margin:0;color:#333;font-size:0.95rem;line-height:1.5;';
            field.appendChild(label);
            field.appendChild(value);
            body.appendChild(field);
        });

        card.appendChild(body);
        overlay.appendChild(card);

        // Close on background click
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) closeProfile();
        });

        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';
        activeOverlay = overlay;
    }

    function closeProfile() {
        if (activeOverlay) {
            document.body.removeChild(activeOverlay);
            activeOverlay = null;
        }
        document.body.style.overflow = '';
    }

    // Handle guest avatar images — hide broken, show on load
    document.querySelectorAll('.guest-avatar img').forEach(function (img) {
        img.style.display = 'none';
        img.addEventListener('load', function () {
            this.style.display = 'block';
            var initials = this.nextElementSibling;
            if (initials) initials.style.display = 'none';
        });
        img.addEventListener('error', function () {
            this.style.display = 'none';
        });
        // Re-trigger for cached images
        if (img.complete && img.naturalWidth > 0) {
            img.style.display = 'block';
            var initials = img.nextElementSibling;
            if (initials) initials.style.display = 'none';
        }
    });

    // Event delegation — catches clicks on .guest anywhere
    document.addEventListener('click', function (e) {
        var guest = e.target.closest('.guest[data-name]');
        if (!guest) return;
        openProfile(guest.dataset);
    });

    // Escape to close
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && activeOverlay) closeProfile();
    });
}

/* ============================================
   WhatsApp Share Helper
   ============================================ */
function createWhatsAppBtn(text) {
    const btn = document.createElement('button');
    btn.className = 'wa-share-btn';
    btn.title = 'Share on WhatsApp';
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.387 0-4.588-.832-6.32-2.222l-.44-.362-2.81.942.942-2.81-.362-.44A9.956 9.956 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>';
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const url = 'https://wa.me/?text=' + encodeURIComponent(text);
        window.open(url, '_blank');
    });
    return btn;
}

/* ============================================
   Birthday Messages (with Emoji Reactions)
   ============================================ */
function initBirthdayMessages() {
    const form = document.getElementById('message-form');
    const wall = document.getElementById('messages-wall');

    if (!form || !wall) return;

    const savedMessages = Store.get('birthdayMessages', []);
    let reactions = Store.get('messageReactions', {});
    let userReactions = Store.get('messageUserReactions', {});
    const guestCode = Auth.getGuestCode() || 'anon';

    const EMOJIS = [
        { key: 'heart', emoji: '\u2764\uFE0F' },
        { key: 'laugh', emoji: '\uD83D\uDE02' },
        { key: 'fire', emoji: '\uD83D\uDD25' },
        { key: 'skull', emoji: '\uD83D\uDC80' },
        { key: 'hundred', emoji: '\uD83D\uDCAF' }
    ];

    savedMessages.forEach(msg => addMessageToWall(msg, false));

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const nameInput = document.getElementById('message-name');
        const textInput = document.getElementById('message-text');

        const message = {
            id: Date.now().toString(),
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

    function getMessageId(message) {
        return message.id || ('msg_' + message.timestamp);
    }

    function addMessageToWall(message, isNew) {
        const msgId = getMessageId(message);
        if (!reactions[msgId]) {
            reactions[msgId] = { heart: 0, laugh: 0, fire: 0, skull: 0, hundred: 0 };
        }

        const card = document.createElement('div');
        card.className = 'message-card' + (isNew ? ' new' : '');

        const reactionsHtml = EMOJIS.map(e => {
            const userKey = msgId + '_' + e.key;
            const reacted = userReactions[userKey] === guestCode;
            return `<button class="emoji-react-btn${reacted ? ' reacted' : ''}" data-msg="${msgId}" data-emoji="${e.key}">${e.emoji} <span>${reactions[msgId][e.key] || 0}</span></button>`;
        }).join('');

        card.innerHTML = `
            <div class="message-author">${escapeHtml(message.name)}</div>
            <p>${escapeHtml(message.text)}</p>
            <div class="emoji-reactions">${reactionsHtml}</div>
        `;

        // WhatsApp share button
        const shareText = 'From Joe\'s 30th Birthday: "' + message.text + '" - ' + message.name;
        card.appendChild(createWhatsAppBtn(shareText));

        card.querySelectorAll('.emoji-react-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const emojiKey = this.dataset.emoji;
                const mid = this.dataset.msg;
                const userKey = mid + '_' + emojiKey;

                if (userReactions[userKey] === guestCode) return;

                userReactions[userKey] = guestCode;
                if (!reactions[mid]) reactions[mid] = { heart: 0, laugh: 0, fire: 0, skull: 0, hundred: 0 };
                reactions[mid][emojiKey] = (reactions[mid][emojiKey] || 0) + 1;

                Store.set('messageReactions', reactions);
                Store.set('messageUserReactions', userReactions);

                this.classList.add('reacted');
                this.querySelector('span').textContent = reactions[mid][emojiKey];
            });
        });

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
        'Jonny Williams', 'Chris Coggin', 'Oscar Walters', 'Pranay Dube'
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
   Music Requests (Enhanced with Genres, Downvotes, Now Playing)
   ============================================ */
function initMusicRequests() {
    const form = document.getElementById('music-form');
    const list = document.getElementById('music-list');

    if (!form || !list) return;

    const GENRES = ['Pop', 'Rock', '90s', 'Dance', 'Indie', 'Other'];
    let songs = Store.get('musicRequests', []);
    let votes = Store.get('musicVotes', {}); // { songId: { up: n, down: n } }
    let userVotes = Store.get('musicUserVotes', {}); // { songId_guestCode: 'up'|'down' }
    let nowPlaying = Store.get('musicNowPlaying', null);
    let activeGenre = null;
    const guestCode = Auth.getGuestCode() || 'anon';

    // Migrate old upvotes to new format
    const oldUpvotes = Store.get('musicUpvotes', null);
    if (oldUpvotes && Object.keys(votes).length === 0) {
        Object.entries(oldUpvotes).forEach(function(entry) {
            votes[entry[0]] = { up: entry[1] || 0, down: 0 };
        });
        Store.set('musicVotes', votes);
    }

    // Add genre select to form if not present
    if (!document.getElementById('song-genre')) {
        const genreSelect = document.createElement('select');
        genreSelect.id = 'song-genre';
        genreSelect.required = true;
        genreSelect.innerHTML = '<option value="">Genre</option>' +
            GENRES.map(function(g) { return '<option value="' + g + '">' + g + '</option>'; }).join('');
        const formRow = form.querySelector('.form-row');
        const submitBtn = formRow.querySelector('.btn');
        formRow.insertBefore(genreSelect, submitBtn);
    }

    // Add genre filter bar + now-playing display
    let filterBar = document.getElementById('music-filter-bar');
    if (!filterBar) {
        filterBar = document.createElement('div');
        filterBar.id = 'music-filter-bar';
        filterBar.className = 'music-filter-bar';
        list.parentNode.insertBefore(filterBar, list);
    }

    let nowPlayingEl = document.getElementById('music-now-playing');
    if (!nowPlayingEl) {
        nowPlayingEl = document.createElement('div');
        nowPlayingEl.id = 'music-now-playing';
        nowPlayingEl.className = 'music-now-playing';
        list.parentNode.insertBefore(nowPlayingEl, filterBar);
    }

    renderFilterBar();
    renderNowPlaying();
    renderSongs();

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const title = document.getElementById('song-title').value.trim();
        const artist = document.getElementById('song-artist').value.trim();
        const requester = document.getElementById('song-requester').value.trim();
        const genre = document.getElementById('song-genre').value;

        if (!title || !artist || !requester || !genre) return;

        const song = {
            id: Date.now().toString(),
            title: title,
            artist: artist,
            requester: requester,
            genre: genre,
            timestamp: Date.now()
        };
        songs.push(song);
        votes[song.id] = { up: 0, down: 0 };

        Store.set('musicRequests', songs);
        Store.set('musicVotes', votes);

        form.reset();
        renderSongs();
    });

    function getNetScore(songId) {
        const v = votes[songId] || { up: 0, down: 0 };
        return (v.up || 0) - (v.down || 0);
    }

    function renderFilterBar() {
        filterBar.innerHTML = '<button class="genre-filter-btn active" data-genre="">All</button>' +
            GENRES.map(function(g) {
                return '<button class="genre-filter-btn" data-genre="' + g + '">' + g + '</button>';
            }).join('');

        filterBar.querySelectorAll('.genre-filter-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                activeGenre = this.dataset.genre || null;
                filterBar.querySelectorAll('.genre-filter-btn').forEach(function(b) { b.classList.remove('active'); });
                this.classList.add('active');
                renderSongs();
            });
        });
    }

    function renderNowPlaying() {
        if (nowPlaying) {
            const song = songs.find(function(s) { return s.id === nowPlaying; });
            if (song) {
                nowPlayingEl.innerHTML = '<span class="now-playing-label">Now Playing</span> <span class="now-playing-title">' +
                    escapeHtml(song.title) + '</span> <span class="now-playing-artist">by ' + escapeHtml(song.artist) + '</span>';
                nowPlayingEl.style.display = '';
                return;
            }
        }
        nowPlayingEl.style.display = 'none';
    }

    function renderSongs() {
        list.innerHTML = '';

        // Filter by genre
        let filtered = activeGenre ? songs.filter(function(s) { return s.genre === activeGenre; }) : songs.slice();

        // Sort by net score descending
        filtered.sort(function(a, b) { return getNetScore(b.id) - getNetScore(a.id); });

        if (filtered.length === 0) {
            list.innerHTML = '<p class="empty-state">No songs yet. Request the first tune!</p>';
            return;
        }

        filtered.forEach(function(song) {
            const net = getNetScore(song.id);
            const v = votes[song.id] || { up: 0, down: 0 };
            const userVoteKey = song.id + '_' + guestCode;
            const userVote = userVotes[userVoteKey] || null;
            const isNowPlaying = nowPlaying === song.id;

            const item = document.createElement('div');
            item.className = 'music-item' + (isNowPlaying ? ' now-playing-highlight' : '');
            item.innerHTML =
                (isNowPlaying ? '<span class="now-playing-badge">Now Playing</span>' : '') +
                '<div class="music-info">' +
                    '<span class="song-title">' + escapeHtml(song.title) + '</span>' +
                    '<span class="song-artist">' + escapeHtml(song.artist) + '</span>' +
                    (song.genre ? '<span class="song-genre-tag">' + escapeHtml(song.genre) + '</span>' : '') +
                '</div>' +
                '<span class="song-requester">' + escapeHtml(song.requester) + '</span>' +
                '<div class="vote-controls">' +
                    '<button class="vote-btn vote-up' + (userVote === 'up' ? ' voted' : '') + '" data-song="' + song.id + '" data-dir="up">&#9650; ' + (v.up || 0) + '</button>' +
                    '<span class="vote-net">' + net + '</span>' +
                    '<button class="vote-btn vote-down' + (userVote === 'down' ? ' voted' : '') + '" data-song="' + song.id + '" data-dir="down">&#9660; ' + (v.down || 0) + '</button>' +
                '</div>' +
                (Auth.isAdmin() ? '<button class="music-np-btn" data-song="' + song.id + '" title="Set as Now Playing">&#9654;</button>' : '');

            // Vote button handlers
            item.querySelectorAll('.vote-btn').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var sid = this.dataset.song;
                    var dir = this.dataset.dir;
                    var key = sid + '_' + guestCode;
                    if (userVotes[key] === dir) return; // already voted this direction

                    // If switching vote, undo previous
                    if (userVotes[key]) {
                        var prev = userVotes[key];
                        if (votes[sid]) votes[sid][prev] = Math.max(0, (votes[sid][prev] || 0) - 1);
                    }

                    if (!votes[sid]) votes[sid] = { up: 0, down: 0 };
                    votes[sid][dir] = (votes[sid][dir] || 0) + 1;
                    userVotes[key] = dir;

                    Store.set('musicVotes', votes);
                    Store.set('musicUserVotes', userVotes);
                    renderSongs();
                });
            });

            // Admin: set now playing
            var npBtn = item.querySelector('.music-np-btn');
            if (npBtn) {
                npBtn.addEventListener('click', function() {
                    nowPlaying = nowPlaying === this.dataset.song ? null : this.dataset.song;
                    Store.set('musicNowPlaying', nowPlaying);
                    renderNowPlaying();
                    renderSongs();
                });
            }

            list.appendChild(item);
        });
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

        // WhatsApp share button
        const shareText = photo.caption
            ? 'Check out this photo from Joe\'s 30th: "' + photo.caption + '" - ' + photo.uploader
            : 'Check out this photo from Joe\'s 30th! - ' + photo.uploader;
        item.appendChild(createWhatsAppBtn(shareText));

        // Click to view in lightbox
        item.addEventListener('click', function() {
            const lightbox = document.getElementById('lightbox');
            if (lightbox) {
                lightbox.querySelector('.lightbox-image').src = photo.data;
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
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
        document.body.style.overflow = '';
    });

    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

/* ============================================
   Shared Guest List for new features
   ============================================ */
const ALL_GUESTS = [
    'Joe O\'Brien', 'Sophie Geen', 'Luke Recchia', 'Samantha Recchia',
    'Hannah O\'Brien', 'Robin Hughes', 'Johnny Gates O\'Brien', 'Florrie Gates O\'Brien',
    'Razon Mahebub', 'Neeve Fletcher', 'George Heyworth', 'Emma Winup',
    'Tom Heyworth', 'Robert Winup', 'Sarah', 'Kiran Ruparelia', 'Shane Pallian',
    'Oli Moran', 'Peter London', 'Emma Levett', 'Jonny Levett',
    'Jonny Williams', 'Chris Coggin', 'Oscar Walters', 'Pranay Dube'
];

function populateGuestSelect(selectEl, placeholder) {
    selectEl.innerHTML = '';
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = placeholder || 'Select someone...';
    selectEl.appendChild(opt);
    ALL_GUESTS.forEach(name => {
        const o = document.createElement('option');
        o.value = name;
        o.textContent = name;
        selectEl.appendChild(o);
    });
}

function getTripDay() {
    const tripStart = new Date('2026-04-29T00:00:00');
    const now = new Date();
    const diff = Math.floor((now - tripStart) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 1;
    if (diff > 5) return 6;
    return diff + 1;
}

/* ============================================
   1. Quote Wall — "Overheard at the Chateau"
   ============================================ */
function initQuoteWall() {
    const form = document.getElementById('quote-form');
    const wall = document.getElementById('quote-wall-grid');
    if (!form || !wall) return;

    let quotes = Store.get('quoteWall', []);
    const guestCode = Auth.getGuestCode() || 'anon';

    const speakerSelect = form.querySelector('#quote-speaker');
    if (speakerSelect) populateGuestSelect(speakerSelect, 'Who said it?');

    renderQuotes();

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const quoteText = form.querySelector('#quote-text').value.trim();
        const speaker = form.querySelector('#quote-speaker').value;
        const heardBy = form.querySelector('#quote-heard-by').value.trim();

        if (!quoteText || !speaker || !heardBy) return;

        const quote = {
            id: Date.now().toString(),
            quote: quoteText,
            speaker: speaker,
            heardBy: heardBy,
            votes: 0,
            votedBy: [],
            timestamp: Date.now()
        };
        quotes.push(quote);
        Store.set('quoteWall', quotes);
        form.reset();
        renderQuotes();
    });

    function renderQuotes() {
        const sorted = [...quotes].sort((a, b) => (b.votes || 0) - (a.votes || 0));
        const colors = ['#FF6B9D', '#7C3AED', '#FFD93D', '#4ECDC4', '#6BCB77', '#FF6B6B'];

        wall.innerHTML = sorted.length === 0
            ? '<p class="empty-state">No quotes yet. Eavesdrop harder!</p>'
            : '';

        sorted.forEach((q, i) => {
            const bubble = document.createElement('div');
            bubble.className = 'quote-bubble';
            bubble.style.setProperty('--bubble-color', colors[i % colors.length]);

            const hasVoted = (q.votedBy || []).includes(guestCode);
            const adminDelete = Auth.isAdmin()
                ? `<button class="quote-delete-btn" data-id="${q.id}" title="Delete quote">&times;</button>`
                : '';

            bubble.innerHTML = `
                ${adminDelete}
                <p class="quote-text">"${escapeHtml(q.quote)}"</p>
                <div class="quote-attribution">
                    <strong>${escapeHtml(q.speaker)}</strong>
                    <span class="quote-heard">overheard by ${escapeHtml(q.heardBy)}</span>
                </div>
                <button class="quote-upvote${hasVoted ? ' voted' : ''}" data-id="${q.id}">
                    \uD83D\uDC4F <span>${q.votes || 0}</span>
                </button>
            `;

            // WhatsApp share button
            const shareText = 'Overheard at Joe\'s 30th: "' + q.quote + '" - ' + q.speaker;
            bubble.appendChild(createWhatsAppBtn(shareText));

            bubble.querySelector('.quote-upvote').addEventListener('click', function() {
                const qObj = quotes.find(x => x.id === this.dataset.id);
                if (!qObj) return;
                if (!qObj.votedBy) qObj.votedBy = [];
                if (qObj.votedBy.includes(guestCode)) return;
                qObj.votedBy.push(guestCode);
                qObj.votes = (qObj.votes || 0) + 1;
                Store.set('quoteWall', quotes);
                renderQuotes();
            });

            const delBtn = bubble.querySelector('.quote-delete-btn');
            if (delBtn) {
                delBtn.addEventListener('click', function() {
                    quotes = quotes.filter(x => x.id !== this.dataset.id);
                    Store.set('quoteWall', quotes);
                    renderQuotes();
                });
            }

            wall.appendChild(bubble);
        });
    }
}

/* ============================================
   3. Trip Predictions Board
   ============================================ */
function initPredictions() {
    const container = document.getElementById('predictions-container');
    if (!container) return;

    const guestCode = Auth.getGuestCode() || 'anon';
    let allPredictions = Store.get('tripPredictions', {});

    const QUESTIONS = [
        'Who will fall in the pool fully clothed?',
        'Who will be last to bed every night?',
        'Who will attempt to speak the most French?',
        'Who will get lost?',
        'Who will be the best cook?',
        'Who will cry during the roast?',
        'Who will be first to lose at a game and blame the rules?',
        'Who will take the most selfies?',
        'Who will start a 3am deep conversation?',
        'Who will be the first to say \'I need a holiday from this holiday\'?'
    ];

    const myPredictions = allPredictions[guestCode] || null;
    const isLocked = !!myPredictions;

    renderPredictions();

    function renderPredictions() {
        if (isLocked) {
            renderResults();
        } else {
            renderForm();
        }
    }

    function renderForm() {
        let html = '<form id="predictions-form" class="predictions-form">';
        QUESTIONS.forEach((q, i) => {
            html += `
                <div class="prediction-question">
                    <label>${i + 1}. ${escapeHtml(q)}</label>
                    <select class="prediction-select" data-index="${i}" required>
                        <option value="">Pick someone...</option>
                    </select>
                </div>
            `;
        });
        html += '<button type="submit" class="btn btn-primary">Lock In Predictions</button></form>';
        container.innerHTML = html;

        container.querySelectorAll('.prediction-select').forEach(sel => {
            populateGuestSelect(sel, 'Pick someone...');
        });

        container.querySelector('#predictions-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const selects = container.querySelectorAll('.prediction-select');
            const answers = {};
            let allFilled = true;
            selects.forEach(s => {
                if (!s.value) allFilled = false;
                answers[s.dataset.index] = s.value;
            });
            if (!allFilled) return;

            allPredictions[guestCode] = answers;
            Store.set('tripPredictions', allPredictions);
            renderResults();
        });
    }

    function renderResults() {
        const tallies = {};
        QUESTIONS.forEach((_, i) => { tallies[i] = {}; });

        Object.values(allPredictions).forEach(answers => {
            Object.entries(answers).forEach(([idx, name]) => {
                if (!tallies[idx]) tallies[idx] = {};
                tallies[idx][name] = (tallies[idx][name] || 0) + 1;
            });
        });

        const totalVoters = Object.keys(allPredictions).length;

        let html = `<div class="predictions-locked-banner">Your predictions are locked in!</div>`;
        html += `<p class="predictions-count">${totalVoters} crew member${totalVoters !== 1 ? 's have' : ' has'} predicted</p>`;
        html += '<div class="predictions-results">';
        QUESTIONS.forEach((q, i) => {
            const sorted = Object.entries(tallies[i] || {}).sort((a, b) => b[1] - a[1]);
            const topPick = sorted.length > 0 ? sorted[0] : null;
            const myPick = allPredictions[guestCode] ? allPredictions[guestCode][i] : '';
            html += `
                <div class="prediction-result-card">
                    <p class="prediction-q">${i + 1}. ${escapeHtml(q)}</p>
                    <div class="prediction-answer">
                        ${topPick ? `<span class="prediction-top">${escapeHtml(topPick[0])} <small>(${topPick[1]} vote${topPick[1] !== 1 ? 's' : ''})</small></span>` : '<span class="prediction-top">No votes yet</span>'}
                    </div>
                    <p class="prediction-yours">Your pick: <strong>${escapeHtml(myPick)}</strong></p>
                    <button class="wa-share-btn wa-share-inline" title="Share on WhatsApp" data-share="Prediction from Joe's 30th: &quot;${escapeHtml(q)}&quot; - Top pick: ${topPick ? escapeHtml(topPick[0]) : 'TBD'}">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.387 0-4.588-.832-6.32-2.222l-.44-.362-2.81.942.942-2.81-.362-.44A9.956 9.956 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
                    </button>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;

        // Wire up inline WhatsApp share buttons
        container.querySelectorAll('.wa-share-inline').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const text = this.getAttribute('data-share');
                window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
            });
        });
    }
}

/* ============================================
   4. Time Capsule
   ============================================ */
function initTimeCapsule() {
    const form = document.getElementById('capsule-form');
    const display = document.getElementById('capsule-display');
    if (!form || !display) return;

    let capsules = Store.get('timeCapsule', []);
    const guestCode = Auth.getGuestCode() || 'anon';
    const guestName = Auth.getGuestName();
    const OPEN_DATE = new Date('2027-05-02T00:00:00');

    let clickCount = 0;
    let lastClickTime = 0;
    const sealedContainer = document.getElementById('capsule-sealed');

    renderCapsule();

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const text = form.querySelector('#capsule-message').value.trim();
        const to = form.querySelector('#capsule-to').value;

        if (!text || !to) return;

        capsules.push({
            author: guestName,
            authorCode: guestCode,
            to: to,
            message: text,
            timestamp: Date.now()
        });
        Store.set('timeCapsule', capsules);
        form.reset();
        renderCapsule();
        triggerMiniConfetti();
    });

    function isUnlocked() {
        return Date.now() >= OPEN_DATE.getTime();
    }

    function renderCapsule() {
        const count = capsules.length;
        const unlocked = isUnlocked();

        let html = `<div class="capsule-count">${count} message${count !== 1 ? 's' : ''} sealed</div>`;

        if (unlocked) {
            html += '<div class="capsule-opened">';
            capsules.forEach(c => {
                html += `
                    <div class="capsule-letter">
                        <p class="capsule-letter-to">To: ${escapeHtml(c.to)}</p>
                        <p class="capsule-letter-body">${escapeHtml(c.message)}</p>
                        <p class="capsule-letter-from">- ${escapeHtml(c.author)}</p>
                    </div>
                `;
            });
            html += '</div>';
        } else {
            html += '<div class="capsule-sealed-grid" id="capsule-sealed">';
            for (let i = 0; i < Math.min(count, 12); i++) {
                html += '<div class="capsule-envelope">&#9993;</div>';
            }
            if (count === 0) {
                html += '<p class="empty-state">No messages yet. Be the first to write one!</p>';
            }
            html += '</div>';
            html += '<p class="capsule-unlock-date">Opens 2 May 2027</p>';
        }

        display.innerHTML = html;

        // Admin 5-click override to reveal
        if (!unlocked) {
            const sealedGrid = display.querySelector('.capsule-sealed-grid');
            if (sealedGrid) {
                sealedGrid.addEventListener('click', function() {
                    const now = Date.now();
                    if (now - lastClickTime > 2000) clickCount = 0;
                    clickCount++;
                    lastClickTime = now;
                    if (clickCount >= 5 && Auth.isAdmin()) {
                        // Temporarily render as opened
                        let revealHtml = '<div class="capsule-opened"><p class="admin-reveal-note">[Admin Preview]</p>';
                        capsules.forEach(c => {
                            revealHtml += `
                                <div class="capsule-letter">
                                    <p class="capsule-letter-to">To: ${escapeHtml(c.to)}</p>
                                    <p class="capsule-letter-body">${escapeHtml(c.message)}</p>
                                    <p class="capsule-letter-from">- ${escapeHtml(c.author)}</p>
                                </div>
                            `;
                        });
                        revealHtml += '</div>';
                        display.innerHTML = `<div class="capsule-count">${count} message${count !== 1 ? 's' : ''} sealed</div>` + revealHtml;
                        clickCount = 0;
                    }
                });
            }
        }
    }
}

/* ============================================
   5. Costume Voting Gallery
   ============================================ */
function initCostumeContest() {
    const section = document.getElementById('costume-contest');
    if (!section) return;

    // Date-lock: only active from Day 4 (2026-05-02) onwards
    const unlockDate = new Date('2026-05-02T00:00:00');
    const isActive = Date.now() >= unlockDate.getTime() || Auth.isAdmin();

    const lockOverlay = section.querySelector('.date-lock-overlay');
    if (!isActive && lockOverlay) {
        lockOverlay.style.display = 'flex';
    }

    let contest = Store.get('costumeContest', { entries: [], votes: {} });
    const guestCode = Auth.getGuestCode() || 'anon';

    const form = document.getElementById('costume-form');
    const gallery = document.getElementById('costume-gallery');
    const resultsDiv = document.getElementById('costume-results');

    if (!form || !gallery) return;

    const whoSelect = form.querySelector('#costume-who');
    if (whoSelect) populateGuestSelect(whoSelect, 'Who is this?');

    renderGallery();

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (!isActive) return;

        const fileInput = form.querySelector('#costume-photo');
        const who = form.querySelector('#costume-who').value;
        const dressedAs = form.querySelector('#costume-dressed-as').value.trim();

        if (!fileInput.files.length || !who || !dressedAs) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const entry = {
                id: Date.now().toString(),
                photo: event.target.result,
                who: who,
                dressedAs: dressedAs,
                timestamp: Date.now()
            };
            contest.entries.push(entry);

            if (contest.entries.length > 20) {
                contest.entries = contest.entries.slice(-20);
            }

            Store.set('costumeContest', contest);
            form.reset();
            renderGallery();
        };
        reader.readAsDataURL(fileInput.files[0]);
    });

    function renderGallery() {
        if (contest.entries.length === 0) {
            gallery.innerHTML = '<p class="empty-state">No costumes uploaded yet. Party starts Day 4!</p>';
            if (resultsDiv) resultsDiv.innerHTML = '';
            return;
        }

        const categories = ['accurate', 'creative', 'funniest'];
        const catLabels = { accurate: 'Most Accurate', creative: 'Most Creative', funniest: 'Funniest' };

        gallery.innerHTML = '';
        contest.entries.forEach(entry => {
            const card = document.createElement('div');
            card.className = 'costume-card';

            const voteBtns = categories.map(cat => {
                const voteKey = cat + '_' + guestCode;
                const myVote = contest.votes[voteKey] || null;
                const isVoted = myVote === entry.id;
                return `<button class="costume-vote-btn${isVoted ? ' voted' : ''}" data-cat="${cat}" data-entry="${entry.id}">${catLabels[cat]}</button>`;
            }).join('');

            card.innerHTML = `
                <img src="${entry.photo}" alt="Costume photo" class="costume-photo">
                <div class="costume-info">
                    <strong>${escapeHtml(entry.who)}</strong>
                    <span>as ${escapeHtml(entry.dressedAs)}</span>
                </div>
                <div class="costume-vote-row">${voteBtns}</div>
            `;

            card.querySelectorAll('.costume-vote-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    if (!isActive) return;
                    const cat = this.dataset.cat;
                    const entryId = this.dataset.entry;
                    const voteKey = cat + '_' + guestCode;
                    contest.votes[voteKey] = entryId;
                    Store.set('costumeContest', contest);
                    renderGallery();
                });
            });

            gallery.appendChild(card);
        });

        renderResults();
    }

    function renderResults() {
        if (!resultsDiv) return;
        const categories = ['accurate', 'creative', 'funniest'];
        const catLabels = { accurate: 'Most Accurate', creative: 'Most Creative', funniest: 'Funniest' };

        const tallies = {};
        categories.forEach(cat => { tallies[cat] = {}; });

        Object.entries(contest.votes).forEach(([key, entryId]) => {
            const cat = key.split('_')[0];
            if (tallies[cat]) {
                tallies[cat][entryId] = (tallies[cat][entryId] || 0) + 1;
            }
        });

        let html = '';
        categories.forEach(cat => {
            const sorted = Object.entries(tallies[cat]).sort((a, b) => b[1] - a[1]);
            if (sorted.length > 0) {
                const winnerId = sorted[0][0];
                const winner = contest.entries.find(e => e.id === winnerId);
                if (winner) {
                    html += `<div class="costume-winner"><span class="costume-winner-cat">${catLabels[cat]}</span> <strong>${escapeHtml(winner.who)}</strong> as ${escapeHtml(winner.dressedAs)} (${sorted[0][1]} votes)</div>`;
                }
            }
        });

        resultsDiv.innerHTML = html || '<p class="empty-state">Vote on costumes to see results!</p>';
    }
}

/* ============================================
   6. Daily Photo Challenge
   ============================================ */
function initPhotoChallenge() {
    const section = document.getElementById('photo-challenge');
    if (!section) return;

    const CHALLENGES = {
        1: 'First photo on French soil',
        2: 'Best pool action shot',
        3: 'Selfie with the canoe team',
        4: 'Best 90s costume group shot',
        5: 'Sunset from the chateau',
        6: 'The goodbye group hug'
    };

    const day = getTripDay();
    const challenge = CHALLENGES[day] || CHALLENGES[1];

    const titleEl = section.querySelector('.challenge-today-title');
    const dayEl = section.querySelector('.challenge-day-label');
    if (titleEl) titleEl.textContent = challenge;
    if (dayEl) dayEl.textContent = 'Day ' + day + ' Challenge';

    let allData = Store.get('photoChallenge', {});
    if (!allData[day]) allData[day] = [];
    const todayPhotos = allData[day];

    const form = document.getElementById('challenge-upload-form');
    const grid = document.getElementById('challenge-gallery');

    renderChallengeGallery();

    if (form) {
        const input = form.querySelector('#challenge-photo-input');
        if (input) {
            input.addEventListener('change', function(e) {
                const files = Array.from(e.target.files);
                const guestName = Auth.getGuestName();

                files.forEach(file => {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        const entry = {
                            id: Date.now().toString() + Math.random(),
                            data: event.target.result,
                            uploader: guestName,
                            uploaderCode: Auth.getGuestCode() || 'anon',
                            timestamp: Date.now(),
                            awarded: false
                        };
                        todayPhotos.push(entry);
                        if (todayPhotos.length > 20) {
                            allData[day] = todayPhotos.slice(-20);
                        }
                        Store.set('photoChallenge', allData);
                        renderChallengeGallery();
                    };
                    reader.readAsDataURL(file);
                });
                input.value = '';
            });
        }
    }

    function renderChallengeGallery() {
        if (!grid) return;
        if (todayPhotos.length === 0) {
            grid.innerHTML = '<p class="empty-state">No submissions yet. Be the first!</p>';
            return;
        }
        grid.innerHTML = '';
        todayPhotos.forEach(photo => {
            const item = document.createElement('div');
            item.className = 'challenge-photo-item' + (photo.awarded ? ' awarded' : '');

            const adminBtn = Auth.isAdmin()
                ? `<button class="challenge-award-btn${photo.awarded ? ' given' : ''}" data-id="${photo.id}">${photo.awarded ? 'Awarded +2' : 'Award +2 pts'}</button>`
                : (photo.awarded ? '<span class="challenge-award-badge">+2 pts</span>' : '');

            item.innerHTML = `
                <img src="${photo.data}" alt="Challenge submission">
                <div class="challenge-photo-info">
                    <span>${escapeHtml(photo.uploader)}</span>
                    ${adminBtn}
                </div>
            `;

            const awardBtn = item.querySelector('.challenge-award-btn');
            if (awardBtn) {
                awardBtn.addEventListener('click', function() {
                    const p = todayPhotos.find(x => x.id === this.dataset.id);
                    if (p && !p.awarded) {
                        p.awarded = true;
                        Store.set('photoChallenge', allData);
                        renderChallengeGallery();
                    }
                });
            }

            grid.appendChild(item);
        });
    }
}

/* ============================================
   7. Trip Yearbook (auto-generated stats)
   ============================================ */
function initYearbook() {
    const container = document.getElementById('yearbook-stats');
    if (!container) return;

    function gatherStats() {
        const pointsLog = Store.get('lb_pointsLog', []);
        const messages = Store.get('birthdayMessages', []);
        const photos = Store.get('tripPhotos', []);
        const musicReqs = Store.get('musicRequests', []);
        const memories = Store.get('memories', []);
        const quotes = Store.get('quoteWall', []);
        const indScores = Store.get('lb_individualScores', {});
        const teamScores = Store.get('lb_teamScores', {});

        const totalPoints = pointsLog.reduce((sum, e) => sum + (e.points || 0), 0);
        const totalMessages = messages.length;
        const totalPhotos = photos.length;
        const totalSongs = musicReqs.length;
        const totalMemories = memories.length;

        // Most active player
        let topPlayer = 'TBD';
        let topScore = 0;
        Object.entries(indScores).forEach(([name, score]) => {
            if (score > topScore) { topScore = score; topPlayer = name; }
        });

        // Quote of the trip
        let topQuote = null;
        if (quotes.length > 0) {
            const sorted = [...quotes].sort((a, b) => (b.votes || 0) - (a.votes || 0));
            topQuote = sorted[0];
        }

        // Team standings
        const teams = Object.entries(teamScores).sort((a, b) => b[1] - a[1]);

        return { totalPoints, totalMessages, totalPhotos, totalSongs, totalMemories, topPlayer, topScore, topQuote, teams };
    }

    function render() {
        const s = gatherStats();

        const stats = [
            { label: 'Points Awarded', value: s.totalPoints, icon: '\u2B50' },
            { label: 'Birthday Messages', value: s.totalMessages, icon: '\uD83D\uDCAC' },
            { label: 'Photos Uploaded', value: s.totalPhotos, icon: '\uD83D\uDCF8' },
            { label: 'Song Requests', value: s.totalSongs, icon: '\uD83C\uDFB5' },
            { label: 'Memories Shared', value: s.totalMemories, icon: '\uD83D\uDCAD' },
            { label: 'MVP', value: s.topPlayer + (s.topScore > 0 ? ' (' + s.topScore + 'pts)' : ''), icon: '\uD83C\uDFC6' }
        ];

        let html = '<div class="yearbook-grid">';
        stats.forEach(st => {
            html += `<div class="yearbook-stat"><span class="yearbook-icon">${st.icon}</span><span class="yearbook-number">${typeof st.value === 'number' ? st.value : escapeHtml(String(st.value))}</span><span class="yearbook-label">${st.label}</span></div>`;
        });
        html += '</div>';

        if (s.topQuote) {
            html += `<div class="yearbook-highlight"><span class="yearbook-highlight-label">Quote of the Trip</span><p>"${escapeHtml(s.topQuote.quote)}" — ${escapeHtml(s.topQuote.speaker)}</p></div>`;
        }

        if (s.teams.length > 0) {
            html += '<div class="yearbook-teams"><span class="yearbook-highlight-label">Team Standings</span>';
            const medals = ['\uD83E\uDD47', '\uD83E\uDD48', '\uD83E\uDD49'];
            s.teams.forEach(([team, score], i) => {
                html += `<div class="yearbook-team-row">${medals[i] || ''} ${escapeHtml(team)}: ${score} pts</div>`;
            });
            html += '</div>';
        }

        container.innerHTML = html;
    }

    render();
    // Auto-refresh every 30s
    setInterval(render, 30000);
}

/* ============================================
   8. "This Day in History"
   ============================================ */
function initThisDayInHistory() {
    const container = document.getElementById('history-timeline');
    if (!container) return;

    const day = getTripDay();

    const HISTORY = {
        1: {
            era: '1996-2001 (Age 0-5)',
            facts: [
                '1996: Baby Joe arrives. The NHS has never been the same.',
                '1997: Joe says his first word. Nobody can agree what it was.',
                '1998: Joe discovers the TV remote. A lifelong couch career begins.',
                '1999: Joe survives the Millennium Bug. Barely.'
            ]
        },
        2: {
            era: '2001-2006 (Age 5-10)',
            facts: [
                '2001: Joe discovers football. Still thinks he could\'ve gone pro.',
                '2002: Joe starts school. Teachers were not prepared.',
                '2003: Joe\'s first sleepover. Legend has it he stayed up until 9:30pm.',
                '2004: Joe learns to ride a bike. Multiple plasters were involved.'
            ]
        },
        3: {
            era: '2006-2011 (Age 10-15)',
            facts: [
                '2006: Joe\'s emo phase. We don\'t talk about the fringe.',
                '2007: Joe joins Facebook. His first status: "is bored lol".',
                '2008: Joe discovers hair gel. Uses enough to waterproof a boat.',
                '2009: Joe goes to his first house party. His mum picks him up at 10pm.'
            ]
        },
        4: {
            era: '2011-2016 (Age 15-20)',
            facts: [
                '2011: Joe legally allowed to drink. His liver files a complaint.',
                '2012: Joe\'s first lads holiday. What happened in Malia stays in Malia.',
                '2013: Joe starts university. His cooking consists entirely of pasta.',
                '2015: Joe graduates. His mum is more excited than he is.'
            ]
        },
        5: {
            era: '2016-2021 (Age 20-25)',
            facts: [
                '2016: Joe and Sophie\'s first date. She still regrets swiping right.',
                '2017: Joe gets a "proper job". Still not entirely sure what he does.',
                '2018: Joe discovers craft beer. Won\'t shut up about IPAs.',
                '2020: Lockdown Joe. Banana bread phase lasted exactly 3 days.'
            ]
        },
        6: {
            era: '2021-2026 (Age 25-30)',
            facts: [
                '2021: Joe becomes a proper adult. Allegedly.',
                '2022: Joe and Sophie move in together. He\'s still learning to load the dishwasher.',
                '2024: Joe starts saying "I\'m too old for this" unironically.',
                '2026: Joe turns 30. A chateau in France seems about right.'
            ]
        }
    };

    const data = HISTORY[day] || HISTORY[1];

    let html = `<div class="history-era">${escapeHtml(data.era)}</div>`;
    html += '<div class="history-facts">';
    data.facts.forEach(fact => {
        html += `<div class="history-fact-card"><p>${escapeHtml(fact)}</p></div>`;
    });
    html += '</div>';

    container.innerHTML = html;
}

/* ============================================
   Toast / Speech Sign-ups
   ============================================ */
function initSpeechSignups() {
    const section = document.getElementById('speech-signups');
    if (!section) return;

    const form = section.querySelector('#speech-form');
    const listEl = section.querySelector('#speech-list');
    const totalEl = section.querySelector('#speech-total-time');
    if (!form || !listEl) return;

    let signups = Store.get('speechSignups', []);
    const guestCode = Auth.getGuestCode() || 'anon';
    const guestName = Auth.getGuestName();
    const MAX_SIGNUPS = 10;

    // Auto-fill name
    const nameInput = form.querySelector('#speech-name');
    if (nameInput && Auth.isLoggedIn()) {
        nameInput.value = guestName;
    }

    renderSignups();

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (signups.length >= MAX_SIGNUPS) return;

        const name = form.querySelector('#speech-name').value.trim();
        const title = form.querySelector('#speech-title').value.trim();
        const lengthEl = form.querySelector('input[name="speech-length"]:checked');
        if (!name || !title || !lengthEl) return;

        const length = parseInt(lengthEl.value, 10);

        signups.push({
            id: Date.now().toString(),
            name: name,
            title: title,
            length: length,
            guestCode: guestCode,
            timestamp: Date.now()
        });
        Store.set('speechSignups', signups);
        form.reset();
        if (nameInput && Auth.isLoggedIn()) nameInput.value = guestName;
        renderSignups();
        triggerMiniConfetti();
    });

    function renderSignups() {
        if (signups.length === 0) {
            listEl.innerHTML = '<p class="empty-state">No speeches yet. Be the first to sign up!</p>';
            if (totalEl) totalEl.textContent = '';
            updateFormState();
            return;
        }

        let totalMinutes = 0;
        let html = '<ol class="speech-order">';
        signups.forEach(function(s, i) {
            totalMinutes += s.length;
            const canRemove = s.guestCode === guestCode || Auth.isAdmin();
            html += '<li class="speech-item" data-id="' + s.id + '">' +
                '<div class="speech-item-info">' +
                    '<strong>' + escapeHtml(s.name) + '</strong>' +
                    '<span class="speech-item-title">"' + escapeHtml(s.title) + '"</span>' +
                    '<span class="speech-item-length">' + s.length + ' min</span>' +
                '</div>' +
                '<div class="speech-item-actions">' +
                    (Auth.isAdmin() && i > 0 ? '<button class="speech-move-btn" data-dir="up" data-id="' + s.id + '" title="Move up">&#9650;</button>' : '') +
                    (Auth.isAdmin() && i < signups.length - 1 ? '<button class="speech-move-btn" data-dir="down" data-id="' + s.id + '" title="Move down">&#9660;</button>' : '') +
                    (canRemove ? '<button class="speech-remove-btn" data-id="' + s.id + '" title="Remove">&times;</button>' : '') +
                '</div>' +
            '</li>';
        });
        html += '</ol>';
        listEl.innerHTML = html;

        if (totalEl) {
            totalEl.textContent = 'Total time: ~' + totalMinutes + ' min (' + signups.length + '/' + MAX_SIGNUPS + ' slots)';
        }

        // Wire up move/remove buttons
        listEl.querySelectorAll('.speech-move-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var id = this.dataset.id;
                var dir = this.dataset.dir;
                var idx = signups.findIndex(function(s) { return s.id === id; });
                if (idx < 0) return;
                var swapIdx = dir === 'up' ? idx - 1 : idx + 1;
                if (swapIdx < 0 || swapIdx >= signups.length) return;
                var temp = signups[idx];
                signups[idx] = signups[swapIdx];
                signups[swapIdx] = temp;
                Store.set('speechSignups', signups);
                renderSignups();
            });
        });

        listEl.querySelectorAll('.speech-remove-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                signups = signups.filter(function(s) { return s.id !== btn.dataset.id; });
                Store.set('speechSignups', signups);
                renderSignups();
            });
        });

        updateFormState();
    }

    function updateFormState() {
        var submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            if (signups.length >= MAX_SIGNUPS) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Fully Booked!';
            } else {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Sign Up to Speak';
            }
        }
    }
}

/* ============================================
   Memory Map
   ============================================ */
function initMemoryMap() {
    const section = document.getElementById('memory-map');
    if (!section) return;

    const gridEl = section.querySelector('#memory-map-grid');
    const memoriesEl = section.querySelector('#memory-map-memories');
    if (!gridEl || !memoriesEl) return;

    const ZONES = [
        { key: 'pool', label: 'Pool', icon: '\uD83C\uDFCA' },
        { key: 'garden', label: 'Garden', icon: '\uD83C\uDF3B' },
        { key: 'kitchen', label: 'Kitchen', icon: '\uD83C\uDF73' },
        { key: 'terrace', label: 'Terrace', icon: '\u2615' },
        { key: 'dining', label: 'Dining Room', icon: '\uD83C\uDF7D\uFE0F' },
        { key: 'master', label: 'Master Suite', icon: '\uD83D\uDC51' },
        { key: 'driveway', label: 'Driveway', icon: '\uD83D\uDE97' },
        { key: 'petanque', label: 'P\u00e9tanque Court', icon: '\u26BD' },
        { key: 'bbq', label: 'BBQ Area', icon: '\uD83D\uDD25' }
    ];

    let memoryData = Store.get('memoryMap', {});
    let activeZone = null;
    const guestName = Auth.getGuestName();

    renderGrid();

    function getZoneMemories(zoneKey) {
        return memoryData[zoneKey] || [];
    }

    function renderGrid() {
        gridEl.innerHTML = '';
        ZONES.forEach(function(zone) {
            var count = getZoneMemories(zone.key).length;
            var card = document.createElement('div');
            card.className = 'mm-zone' + (activeZone === zone.key ? ' active' : '');
            card.dataset.zone = zone.key;
            card.innerHTML =
                '<span class="mm-zone-icon">' + zone.icon + '</span>' +
                '<span class="mm-zone-label">' + escapeHtml(zone.label) + '</span>' +
                (count > 0 ? '<span class="mm-zone-badge">' + count + '</span>' : '');

            card.addEventListener('click', function() {
                activeZone = activeZone === zone.key ? null : zone.key;
                renderGrid();
                renderMemories();
            });
            gridEl.appendChild(card);
        });
    }

    function renderMemories() {
        if (!activeZone) {
            memoriesEl.innerHTML = '<p class="empty-state">Click a zone to see memories</p>';
            return;
        }

        var zone = ZONES.find(function(z) { return z.key === activeZone; });
        var memories = getZoneMemories(activeZone);

        var html = '<h4 class="mm-memories-title">' + zone.icon + ' Memories at the ' + escapeHtml(zone.label) + '</h4>';
        html += '<form class="mm-add-form" id="mm-add-form">' +
            '<input type="text" id="mm-memory-text" placeholder="Remember when... happened at the ' + escapeHtml(zone.label) + '?" required>' +
            '<button type="submit" class="btn btn-primary">Add</button>' +
        '</form>';

        if (memories.length > 0) {
            html += '<div class="mm-memory-list">';
            memories.forEach(function(m) {
                html += '<div class="mm-memory-item">' +
                    '<p>"' + escapeHtml(m.text) + '"</p>' +
                    '<span class="mm-memory-author">- ' + escapeHtml(m.author) + '</span>' +
                '</div>';
            });
            html += '</div>';
        } else {
            html += '<p class="empty-state">No memories here yet. Be the first!</p>';
        }

        memoriesEl.innerHTML = html;

        var addForm = memoriesEl.querySelector('#mm-add-form');
        if (addForm) {
            addForm.addEventListener('submit', function(e) {
                e.preventDefault();
                var textInput = memoriesEl.querySelector('#mm-memory-text');
                var text = textInput.value.trim();
                if (!text) return;

                if (!memoryData[activeZone]) memoryData[activeZone] = [];
                memoryData[activeZone].push({
                    text: text,
                    author: guestName,
                    timestamp: Date.now()
                });
                Store.set('memoryMap', memoryData);
                renderGrid();
                renderMemories();
            });
        }
    }

    renderMemories();
}

/* ============================================
   Roast Material Builder
   ============================================ */
function initRoastBuilder() {
    const section = document.getElementById('roast-builder');
    if (!section) return;

    const guestCode = Auth.getGuestCode();

    // Must be logged in (not guest mode)
    if (!guestCode || guestCode === 'guest') {
        section.style.display = 'none';
        return;
    }

    // Date-locked: only visible after April 20, 2026
    const unlockDate = new Date('2026-04-20T00:00:00');
    if (Date.now() < unlockDate.getTime() && !Auth.isAdmin()) {
        section.style.display = 'none';
        return;
    }

    const textarea = section.querySelector('#roast-textarea');
    const charCount = section.querySelector('#roast-char-count');
    const promptsEl = section.querySelector('#roast-prompts');
    if (!textarea) return;

    const PROMPTS = [
        "What's Joe's most embarrassing moment?",
        "Finish this sentence: Joe is the kind of friend who...",
        "If Joe were an animal, he'd be a ___",
        "The first time I met Joe...",
        "Joe's worst habit is..."
    ];

    // Load saved notes
    const storageKey = 'roastNotes_' + guestCode;
    textarea.value = Store.getRaw(storageKey) || '';
    updateCharCount();

    // Auto-save on input
    textarea.addEventListener('input', function() {
        Store.setRaw(storageKey, textarea.value);
        updateCharCount();
    });

    function updateCharCount() {
        if (charCount) {
            charCount.textContent = textarea.value.length + ' characters';
        }
    }

    // Render prompt buttons
    if (promptsEl) {
        PROMPTS.forEach(function(prompt) {
            var btn = document.createElement('button');
            btn.className = 'roast-prompt-btn';
            btn.textContent = prompt;
            btn.addEventListener('click', function() {
                var heading = '\n\n## ' + prompt + '\n';
                textarea.value += heading;
                textarea.focus();
                textarea.scrollTop = textarea.scrollHeight;
                Store.setRaw(storageKey, textarea.value);
                updateCharCount();
            });
            promptsEl.appendChild(btn);
        });
    }
}

/* ============================================
   Team Chat Channels
   ============================================ */
function initTeamChat() {
    const section = document.getElementById('team-chat');
    if (!section) return;

    const tabsEl = section.querySelector('#team-chat-tabs');
    const messagesEl = section.querySelector('#team-chat-messages');
    const formEl = section.querySelector('#team-chat-form');
    if (!tabsEl || !messagesEl || !formEl) return;

    const TEAM_KEYS = ['team1', 'team2', 'team3', 'team4'];
    const TEAM_LABELS = { team1: 'Team 1', team2: 'Team 2', team3: 'Team 3', team4: 'Team 4' };
    const TEAM_HIDDEN = { team1: 'Team 1 \u2014 \uD83D\uDD12 TBA', team2: 'Team 2 \u2014 \uD83D\uDD12 TBA', team3: 'Team 3 \u2014 \uD83D\uDD12 TBA', team4: 'Team 4 \u2014 \uD83D\uDD12 TBA' };
    const MAX_MESSAGES = 50;

    const guestCode = Auth.getGuestCode() || 'anon';
    const guestName = Auth.getGuestName();
    const isAdmin = Auth.isAdmin();
    const revealed = isRevealed();

    // Determine the guest's team
    var myTeam = null;
    if (PLAYERS[guestName]) {
        myTeam = PLAYERS[guestName];
    }

    var activeTab = myTeam || TEAM_KEYS[0];

    // If not admin and no team, hide section
    if (!isAdmin && !myTeam) {
        section.style.display = 'none';
        return;
    }

    renderTabs();
    renderMessages();
    updateFormVisibility();

    formEl.addEventListener('submit', function(e) {
        e.preventDefault();
        var input = formEl.querySelector('#team-chat-input');
        var text = input.value.trim();
        if (!text) return;

        var messages = Store.get('teamChat_' + activeTab, []);
        messages.push({
            author: guestName,
            guestCode: guestCode,
            text: text,
            timestamp: Date.now()
        });

        // Trim to max
        if (messages.length > MAX_MESSAGES) {
            messages = messages.slice(-MAX_MESSAGES);
        }

        Store.set('teamChat_' + activeTab, messages);
        input.value = '';
        renderMessages();
    });

    function renderTabs() {
        tabsEl.innerHTML = '';
        var allowedTabs = isAdmin ? TEAM_KEYS : [myTeam];

        allowedTabs.forEach(function(teamKey) {
            var btn = document.createElement('button');
            btn.className = 'team-chat-tab' + (activeTab === teamKey ? ' active' : '');
            btn.textContent = revealed ? TEAM_LABELS[teamKey] : TEAM_HIDDEN[teamKey];
            btn.dataset.team = teamKey;
            btn.addEventListener('click', function() {
                activeTab = teamKey;
                renderTabs();
                renderMessages();
                updateFormVisibility();
            });
            tabsEl.appendChild(btn);
        });
    }

    function renderMessages() {
        var messages = Store.get('teamChat_' + activeTab, []);
        if (messages.length === 0) {
            messagesEl.innerHTML = '<p class="empty-state">No messages yet. Start the conversation!</p>';
            return;
        }

        var html = '';
        messages.forEach(function(m) {
            var time = new Date(m.timestamp);
            var timeStr = time.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
            var isMe = m.guestCode === guestCode;
            html += '<div class="tc-message' + (isMe ? ' tc-mine' : '') + '">' +
                '<div class="tc-message-header">' +
                    '<strong>' + escapeHtml(m.author) + '</strong>' +
                    '<span class="tc-message-time">' + escapeHtml(timeStr) + '</span>' +
                '</div>' +
                '<p>' + escapeHtml(m.text) + '</p>' +
            '</div>';
        });
        messagesEl.innerHTML = html;
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function updateFormVisibility() {
        // Only show form if this is my team or I'm admin
        var canPost = isAdmin || activeTab === myTeam;
        formEl.style.display = canPost ? '' : 'none';
    }
}

/* ============================================
   Initialize All Social Features
   ============================================ */
document.addEventListener('DOMContentLoaded', function() {
    initProfiles();
    initBirthdayMessages();
    initSuperlatives();
    initMusicRequests();
    initPhotoWall();
    initLightbox();
});
