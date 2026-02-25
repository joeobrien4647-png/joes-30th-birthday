/* ============================================
   Social Page JavaScript
   All init functions for the Social Wall page.
   Uses global escapeHtml() from shared.js.
   Uses Store.get / Store.set from shared.js.
   ============================================ */

/* Time Ago Helper */
function timeAgo(ts) {
    if (!ts) return '';
    var diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
    return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/* ============================================
   Profile Modal — dynamically created overlay
   Bypasses all CSS by building the modal from scratch.
   ============================================ */
function initProfiles() {
    var activeOverlay = null;
    var previousFocus = null;

    function slugify(name) {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    function openProfile(data) {
        if (activeOverlay) closeProfile();
        previousFocus = document.activeElement;

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

        // Focus the close button and trap focus inside modal
        closeBtn.focus();
        overlay.addEventListener('keydown', function(e) {
            if (e.key !== 'Tab') return;
            var focusable = overlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusable.length === 0) return;
            var first = focusable[0];
            var last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        });
    }

    function closeProfile() {
        if (activeOverlay) {
            document.body.removeChild(activeOverlay);
            activeOverlay = null;
        }
        document.body.style.overflow = '';
        if (previousFocus) { try { previousFocus.focus(); } catch(e) {} previousFocus = null; }
    }

    // Assign unique gradient colours to each guest avatar fallback
    var AVATAR_PALETTES = [
        ['#667eea', '#764ba2'], ['#f093fb', '#f5576c'], ['#4facfe', '#00f2fe'],
        ['#43e97b', '#38f9d7'], ['#fa709a', '#fee140'], ['#a18cd1', '#fbc2eb'],
        ['#fccb90', '#d57eeb'], ['#e0c3fc', '#8ec5fc'], ['#f6d365', '#fda085'],
        ['#89f7fe', '#66a6ff'], ['#fddb92', '#d1fdff'], ['#c471f5', '#fa71cd'],
        ['#48c6ef', '#6f86d6'], ['#feada6', '#f5efef'], ['#a1c4fd', '#c2e9fb'],
        ['#d4fc79', '#96e6a1'], ['#84fab0', '#8fd3f4'], ['#cfd9df', '#e2ebf0'],
        ['#fbc2eb', '#a6c1ee'], ['#ffecd2', '#fcb69f'], ['#ff9a9e', '#fecfef'],
        ['#f794a4', '#fdd6bd'], ['#64b3f4', '#c2e59c'], ['#a8edea', '#fed6e3'],
        ['#d299c2', '#fef9d7'], ['#89f7fe', '#66a6ff'], ['#fdcbf1', '#e6dee9']
    ];
    function hashName(str) {
        var h = 0;
        for (var i = 0; i < str.length; i++) h = ((h << 5) - h) + str.charCodeAt(i);
        return Math.abs(h);
    }
    document.querySelectorAll('.guest-avatar').forEach(function(avatar) {
        if (avatar.classList.contains('birthday')) return;
        var initialsEl = avatar.querySelector('.guest-initials');
        var name = initialsEl ? initialsEl.textContent.trim() : '';
        if (!name) return;
        var idx = hashName(name) % AVATAR_PALETTES.length;
        var pal = AVATAR_PALETTES[idx];
        avatar.style.background = 'linear-gradient(135deg, ' + pal[0] + ' 0%, ' + pal[1] + ' 100%)';
    });

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

    // Character counter
    var textInput = document.getElementById('message-text');
    var charCount = document.getElementById('message-char-count');
    if (textInput && charCount) {
        textInput.addEventListener('input', function() {
            var len = this.value.length;
            var max = this.maxLength || 500;
            charCount.textContent = len + ' / ' + max;
            charCount.classList.toggle('char-count-warn', len > max * 0.9);
        });
    }

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
            <div class="message-author">${escapeHtml(message.name)}<span class="timestamp">${timeAgo(message.timestamp)}</span></div>
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
                '<span class="song-requester">' + escapeHtml(song.requester) + '<span class="timestamp">' + timeAgo(song.timestamp) + '</span></span>' +
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
function compressPhoto(dataUrl, maxSize, quality) {
    return new Promise(function(resolve) {
        var img = new Image();
        img.onload = function() {
            var w = img.width;
            var h = img.height;
            if (w > maxSize || h > maxSize) {
                var ratio = Math.min(maxSize / w, maxSize / h);
                w = Math.round(w * ratio);
                h = Math.round(h * ratio);
            }
            var canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = function() { resolve(dataUrl); };
        img.src = dataUrl;
    });
}

function initPhotoWall() {
    const form = document.getElementById('photo-upload-form');
    const input = document.getElementById('photo-input');
    const grid = document.getElementById('photo-grid');
    const captionInput = document.getElementById('photo-caption');
    const uploaderInput = document.getElementById('photo-uploader');

    if (!form || !input || !grid) return;

    let photos = Store.get('tripPhotos', []);

    // Photo count indicator
    var countEl = document.createElement('div');
    countEl.className = 'photo-count-info';
    form.parentNode.insertBefore(countEl, form.nextSibling);

    function updatePhotoCount() {
        var n = photos.length;
        countEl.textContent = n + ' / 10 photos';
        countEl.classList.toggle('photo-count-warn', n >= 8);
        if (input) input.disabled = n >= 10;
        var uploadBtn = form.querySelector('label, button[type="submit"]');
        if (uploadBtn) uploadBtn.classList.toggle('disabled', n >= 10);
    }

    // Render saved photos
    if (photos.length > 0) {
        grid.innerHTML = '';
        photos.forEach(p => addPhotoToGrid(p));
    }
    updatePhotoCount();

    input.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);

        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = function(event) {
                // Compress to max 800px, JPEG quality 0.6 (~50-80KB per photo)
                compressPhoto(event.target.result, 800, 0.6).then(function(compressed) {
                    const caption = captionInput ? captionInput.value.trim() : '';
                    const uploader = uploaderInput && uploaderInput.value.trim()
                        ? uploaderInput.value.trim()
                        : 'Anonymous';

                    const photo = {
                        id: Date.now().toString() + Math.random(),
                        data: compressed,
                        caption,
                        uploader,
                        timestamp: Date.now()
                    };

                    photos.push(photo);

                    // Only keep last 10 photos in localStorage (size limit)
                    if (photos.length > 10) {
                        photos = photos.slice(-10);
                    }

                    Store.set('tripPhotos', photos);

                    // Clear placeholder if exists
                    const placeholder = grid.querySelector('.photo-placeholder');
                    if (placeholder) {
                        grid.innerHTML = '';
                    }

                    addPhotoToGrid(photo);
                    updatePhotoCount();
                });
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

/* REMOVED: 12 orphaned features (QuoteWall, Predictions, TimeCapsule,
   CostumeContest, PhotoChallenge, Yearbook, ThisDayInHistory,
   SpeechSignups, MemoryMap, RoastBuilder, TeamChat, MemoryTimeline)
   — None had HTML containers or were initialised. ~1,150 lines deleted. */

/* DO NOT PASTE BACK: if you want any of these features, rebuild properly
   with HTML containers and add init calls to DOMContentLoaded. */

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
