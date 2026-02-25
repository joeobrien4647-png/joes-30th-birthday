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

        var overlay = document.createElement('div');
        overlay.className = 'profile-overlay';

        var card = document.createElement('div');
        card.className = 'profile-card';

        var closeBtn = document.createElement('button');
        closeBtn.className = 'profile-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', function (e) { e.stopPropagation(); closeProfile(); });
        card.appendChild(closeBtn);

        var header = document.createElement('div');
        header.className = 'profile-header';

        var avatar = document.createElement('div');
        var isBirthday = data.birthday === 'true';
        avatar.className = 'profile-avatar' + (isBirthday ? ' birthday' : '');

        var photoPath = 'images/guests/' + slugify(data.name) + '.jpg';
        var avatarImg = document.createElement('img');
        avatarImg.addEventListener('load', function () { this.style.display = 'block'; avatarInitials.style.display = 'none'; });
        avatarImg.addEventListener('error', function () { this.style.display = 'none'; });
        avatarImg.src = photoPath;
        var avatarInitials = document.createElement('span');
        avatarInitials.textContent = data.initials || '';
        avatar.appendChild(avatarImg);
        avatar.appendChild(avatarInitials);

        var titleDiv = document.createElement('div');
        var nameEl = document.createElement('h2');
        nameEl.className = 'profile-name';
        nameEl.textContent = data.name || '';
        var roomEl = document.createElement('p');
        roomEl.className = 'profile-room';
        roomEl.textContent = data.room || '';
        titleDiv.appendChild(nameEl);
        titleDiv.appendChild(roomEl);

        header.appendChild(avatar);
        header.appendChild(titleDiv);
        card.appendChild(header);

        var videoWrap = document.createElement('div');
        videoWrap.className = 'profile-video-wrap';

        // Only load video if guest has a data-video attribute
        if (data.video) {
            var videoEl = document.createElement('video');
            videoEl.className = 'profile-video';
            videoEl.setAttribute('playsinline', '');
            videoEl.muted = true;
            videoEl.loop = true;

            var soundBtn = document.createElement('button');
            soundBtn.className = 'profile-video-sound';
            soundBtn.textContent = '\uD83D\uDD07';
            soundBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                videoEl.muted = !videoEl.muted;
                soundBtn.textContent = videoEl.muted ? '\uD83D\uDD07' : '\uD83D\uDD0A';
            });

            videoWrap.appendChild(videoEl);
            videoWrap.appendChild(soundBtn);
            card.appendChild(videoWrap);

            videoEl.oncanplay = function () {
                videoWrap.style.display = 'block';
                videoEl.play().catch(function () {});
                videoEl.oncanplay = null;
            };
            videoEl.onerror = function () { videoEl.onerror = null; };
            videoEl.src = data.video;
        }

        var body = document.createElement('div');
        body.className = 'profile-body';

        var fields = [
            ['Superlative', data.superlative],
            ['Fun Fact', data.fact],
            ['Bringing to the Trip', data.bringing],
            ['Party Anthem', data.anthem]
        ];
        fields.forEach(function (f) {
            if (!f[1]) return;
            var field = document.createElement('div');
            field.className = 'profile-field';
            var label = document.createElement('span');
            label.className = 'profile-label';
            label.textContent = f[0];
            var value = document.createElement('p');
            value.className = 'profile-value';
            value.textContent = f[1];
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
        var submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn && submitBtn.disabled) return;
        if (submitBtn) submitBtn.disabled = true;

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
        setTimeout(function() { if (submitBtn) submitBtn.disabled = false; }, 1000);
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
   Initialize All Social Features
   ============================================ */
document.addEventListener('DOMContentLoaded', function() {
    initProfiles();
    initBirthdayMessages();
});
