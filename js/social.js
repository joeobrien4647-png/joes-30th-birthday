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

    // slugify() is now in shared.js

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
        var localPhoto = getGuestPhoto(data.name);
        var avatarImg = document.createElement('img');
        avatarImg.addEventListener('load', function () { this.style.display = 'block'; avatarInitials.style.display = 'none'; avatar.classList.add('has-photo'); });
        avatarImg.addEventListener('error', function () {
            if (!this.dataset.triedLocal && localPhoto) {
                this.dataset.triedLocal = 'true';
                this.src = localPhoto;
                return;
            }
            this.style.display = 'none';
        });
        avatarImg.src = photoPath;
        var avatarInitials = document.createElement('span');
        avatarInitials.textContent = data.initials || '';
        avatar.appendChild(avatarImg);
        avatar.appendChild(avatarInitials);

        // Upload button — own profile or admin
        var isOwnProfile = false;
        if (typeof Auth !== 'undefined' && Auth.isLoggedIn()) {
            var gd = Auth.getGuestData();
            if (gd && gd.fullName === data.name) isOwnProfile = true;
        }
        if (isOwnProfile || (typeof Auth !== 'undefined' && Auth.isAdmin())) {
            var uploadBtn = document.createElement('button');
            uploadBtn.className = 'profile-upload-btn';
            uploadBtn.innerHTML = '&#128247;';
            uploadBtn.title = 'Upload photo';
            var uploadInput = document.createElement('input');
            uploadInput.type = 'file';
            uploadInput.accept = 'image/*';
            uploadInput.setAttribute('capture', 'user');
            uploadInput.style.display = 'none';
            uploadBtn.addEventListener('click', function(e) { e.stopPropagation(); uploadInput.click(); });
            uploadInput.addEventListener('change', function() {
                if (!this.files || !this.files[0]) return;
                compressProfilePhoto(this.files[0], function(dataUrl) {
                    setGuestPhoto(data.name, dataUrl);
                    avatarImg.dataset.triedLocal = '';
                    avatarImg.src = dataUrl;
                    avatarImg.style.display = 'block';
                    avatarInitials.style.display = 'none';
                    avatar.classList.add('has-photo');
                    updateCrewCardPhoto(data.name, dataUrl);
                });
            });
            avatar.appendChild(uploadBtn);
            avatar.appendChild(uploadInput);
        }

        var titleDiv = document.createElement('div');
        var nameEl = document.createElement('h2');
        nameEl.className = 'profile-name';
        nameEl.textContent = data.name || '';
        var roomEl = document.createElement('p');
        roomEl.className = 'profile-room';
        roomEl.textContent = data.room || '';
        titleDiv.appendChild(nameEl);
        titleDiv.appendChild(roomEl);
        if (data.tagline) {
            var taglineEl = document.createElement('p');
            taglineEl.className = 'profile-tagline';
            taglineEl.textContent = data.tagline;
            titleDiv.appendChild(taglineEl);
        }

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

        // Team info — match full name to PLAYERS keys
        var teamName = null;
        if (typeof PLAYERS !== 'undefined' && typeof TEAM_CONFIG !== 'undefined') {
            var fullName = data.name || '';
            var firstName = fullName.split(' ')[0];
            var lastInitial = fullName.split(' ').length > 1 ? fullName.split(' ')[1][0] : '';
            // Try: exact full name, "First L" short form, first name only
            var candidates = [fullName, firstName + ' ' + lastInitial, firstName];
            candidates.forEach(function(c) {
                if (!teamName && PLAYERS[c]) teamName = PLAYERS[c];
            });
        }
        if (teamName && TEAM_CONFIG[teamName]) {
            var teamInfo = document.createElement('div');
            teamInfo.className = 'profile-team';
            teamInfo.style.color = TEAM_CONFIG[teamName].color;
            teamInfo.innerHTML = '<span class="profile-team-logo">' + TEAM_CONFIG[teamName].logo + '</span> ' + TEAM_CONFIG[teamName].name;
            card.appendChild(teamInfo);
        }
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

    // Handle guest avatar images — hide broken, show on load, fallback to localStorage
    document.querySelectorAll('.guest-avatar img').forEach(function (img) {
        img.style.display = 'none';
        img.addEventListener('load', function () {
            this.style.display = 'block';
            var initials = this.nextElementSibling;
            if (initials) initials.style.display = 'none';
        });
        img.addEventListener('error', function () {
            var card = this.closest('.guest[data-name]');
            if (card && !this.dataset.triedLocal) {
                var localPhoto = getGuestPhoto(card.dataset.name);
                if (localPhoto) {
                    this.dataset.triedLocal = 'true';
                    this.src = localPhoto;
                    return;
                }
            }
            this.style.display = 'none';
        });
        // Re-trigger for cached images
        if (img.complete && img.naturalWidth > 0) {
            img.style.display = 'block';
            var initials = img.nextElementSibling;
            if (initials) initials.style.display = 'none';
        }
    });

    // Collect all navigable guests
    var allGuests = [];
    var currentGuestIdx = -1;

    function refreshGuestList() {
        allGuests = Array.from(document.querySelectorAll('.guest[data-name]'));
    }

    function navigateProfile(dir) {
        if (allGuests.length === 0) return;
        currentGuestIdx = (currentGuestIdx + dir + allGuests.length) % allGuests.length;
        closeProfile();
        openProfile(allGuests[currentGuestIdx].dataset);
        addProfileNav();
    }

    function addProfileNav() {
        if (!activeOverlay || allGuests.length < 2) return;
        var card = activeOverlay.querySelector('.profile-card');
        if (!card) return;

        // Arrows
        var arrows = document.createElement('div');
        arrows.className = 'profile-nav-arrows';
        arrows.innerHTML = '<button class="profile-nav-arrow" data-dir="-1">&#8249;</button>' +
            '<button class="profile-nav-arrow" data-dir="1">&#8250;</button>';
        card.appendChild(arrows);
        arrows.querySelectorAll('.profile-nav-arrow').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                navigateProfile(parseInt(this.dataset.dir));
            });
        });

        // Page dots (max 12 visible)
        if (allGuests.length <= 30) {
            var dots = document.createElement('div');
            dots.className = 'profile-nav-dots';
            allGuests.forEach(function (_, i) {
                var dot = document.createElement('button');
                dot.className = 'profile-nav-dot' + (i === currentGuestIdx ? ' active' : '');
                dot.addEventListener('click', function (e) {
                    e.stopPropagation();
                    currentGuestIdx = i;
                    closeProfile();
                    openProfile(allGuests[i].dataset);
                    addProfileNav();
                });
                dots.appendChild(dot);
            });
            card.appendChild(dots);
        }
    }

    // Event delegation — catches clicks on .guest anywhere
    document.addEventListener('click', function (e) {
        var guest = e.target.closest('.guest[data-name]');
        if (!guest) return;
        refreshGuestList();
        currentGuestIdx = allGuests.indexOf(guest);
        openProfile(guest.dataset);
        addProfileNav();
    });

    // Escape to close, arrows to navigate
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && activeOverlay) closeProfile();
        if (activeOverlay && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            e.preventDefault();
            navigateProfile(e.key === 'ArrowRight' ? 1 : -1);
        }
    });
}

/* (Birthday Messages and WhatsApp share moved to Live Feed) */

/* ============================================
   Crew Tabs (Rooms / Teams)
   ============================================ */
function initCrewTabs() {
    var tabs = document.querySelectorAll('.crew-tab-btn');
    var roomsView = document.getElementById('crew-view-rooms');
    var teamsView = document.getElementById('crew-view-teams');
    var barsAnimated = false;

    if (!tabs.length || !roomsView || !teamsView) return;

    function animateTeamsView() {
        // Stagger team member rows
        teamsView.querySelectorAll('.team-member').forEach(function(m, i) {
            m.style.opacity = '0';
            m.style.transform = 'translateX(-10px)';
            m.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            m.style.transitionDelay = (i * 30) + 'ms';
        });
        requestAnimationFrame(function() {
            requestAnimationFrame(function() {
                teamsView.querySelectorAll('.team-member').forEach(function(m) {
                    m.style.opacity = '1';
                    m.style.transform = 'translateX(0)';
                });
            });
        });
    }

    tabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
            tabs.forEach(function(t) { t.classList.remove('active'); });
            this.classList.add('active');

            if (this.dataset.tab === 'teams') {
                roomsView.style.display = 'none';
                teamsView.style.display = '';
                animateTeamsView();
            } else {
                teamsView.style.display = 'none';
                roomsView.style.display = '';
            }
        });
    });
}

/* ============================================
   Initialize All Social Features
   ============================================ */
/* Crew Avatar Skeleton Loaders */
function initCrewSkeletons() {
    document.querySelectorAll('.guest-avatar img').forEach(function (img) {
        var avatar = img.closest('.guest-avatar');
        function onLoad() {
            avatar.classList.add('img-loaded');
        }
        function onError() {
            img.style.display = 'none'; // reveal initials behind
            avatar.classList.add('img-loaded'); // stop shimmer
        }
        if (img.complete) {
            img.naturalWidth > 0 ? onLoad() : onError();
        } else {
            img.addEventListener('load', onLoad);
            img.addEventListener('error', onError);
        }
    });
}

/* (Message skeletons and gesture hints moved to Live Feed) */

/* (Scroll-spy removed — only crew section remains) */

/* Room card flip reveal on scroll */
function initRoomFlip() {
    var cards = document.querySelectorAll('.room-card');
    if (!cards.length) return;

    cards.forEach(function(card) { card.classList.add('flip-hidden'); });

    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.remove('flip-hidden');
                entry.target.classList.add('flip-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    cards.forEach(function(card, i) {
        card.style.transitionDelay = (i % 3) * 0.1 + 's';
        observer.observe(card);
    });
}

/* ============================================
   Guest Highlighting — own room + own profile
   ============================================ */
function initGuestHighlight() {
    function applyHighlights(d) {
        if (!d || !d.fullName) return;

        // Room matching: GUEST_DATA "Master Suite" = social.html "Room 1"
        var ROOM_MAP = { 'Master Suite': 'Room 1' };
        var roomLabel = ROOM_MAP[d.room] || d.room;

        // Highlight own room card
        document.querySelectorAll('.room-card').forEach(function(card) {
            var roomNum = card.querySelector('.room-number');
            if (roomNum && roomNum.textContent.trim() === roomLabel) {
                card.classList.add('guest-room-highlight');
                var header = card.querySelector('.room-header');
                if (header && !header.querySelector('.guest-room-badge')) {
                    var badge = document.createElement('span');
                    badge.className = 'guest-room-badge';
                    badge.textContent = 'Your Room';
                    header.appendChild(badge);
                }
            }
        });

        // Highlight own profile card
        document.querySelectorAll('.guest[data-name]').forEach(function(card) {
            if (card.dataset.name === d.fullName) {
                card.classList.add('guest-self-highlight');
                if (!card.querySelector('.guest-self-badge')) {
                    var tag = document.createElement('span');
                    tag.className = 'guest-self-badge';
                    tag.textContent = '\uD83D\uDC48 You';
                    card.appendChild(tag);
                }
            }
        });
    }

    // Listen for future events (e.g. after switching guest)
    document.addEventListener('guestHighlight', function(e) { applyHighlights(e.detail); });

    // Apply immediately if already logged in
    if (typeof Auth !== 'undefined' && Auth.isLoggedIn()) {
        var guest = Auth.getGuestData();
        if (guest) applyHighlights({ name: guest.name, fullName: guest.fullName, room: guest.room, code: Auth.getGuestCode() });
    }
}

/* Tap-to-toggle scouting report on mobile */
function initAnonTraitTap() {
    document.addEventListener('click', function(e) {
        var member = e.target.closest('.anon-member');
        document.querySelectorAll('.anon-member.anon-trait-open').forEach(function(m) {
            if (m !== member) m.classList.remove('anon-trait-open');
        });
        if (member) member.classList.toggle('anon-trait-open');
    });
}

/* Update crew grid card photo after upload (no reload needed) */
function updateCrewCardPhoto(name, dataUrl) {
    document.querySelectorAll('.guest[data-name="' + name + '"]').forEach(function(card) {
        var img = card.querySelector('.guest-avatar img');
        if (img) {
            img.dataset.triedLocal = '';
            img.src = dataUrl;
            img.style.display = 'block';
            var initials = card.querySelector('.guest-initials');
            if (initials) initials.style.display = 'none';
            var av = card.querySelector('.guest-avatar');
            if (av) av.classList.add('img-loaded');
        }
    });
}

/* Teams Reveal — members appear as they register via Firebase */
function initTeamsReveal() {
    var teamMembers = document.querySelectorAll('.team-member');
    if (!teamMembers.length) return;

    // Anonymize all team members initially
    teamMembers.forEach(function(el) {
        var nameEl = el.querySelector('.tm-name');
        var badgeEl = el.querySelector('.tm-badge');
        if (nameEl) {
            nameEl.dataset.realName = nameEl.textContent;
            nameEl.textContent = '???';
        }
        if (badgeEl) badgeEl.style.display = 'none';
        el.classList.add('tm-locked');
    });

    // Update member counts to show "0/N joined"
    function updateCounts(registeredNames) {
        document.querySelectorAll('.team-card').forEach(function(card) {
            var total = card.querySelectorAll('.team-member').length;
            var revealed = 0;
            card.querySelectorAll('.team-member .tm-name').forEach(function(n) {
                if (n.dataset.realName && registeredNames[n.dataset.realName]) revealed++;
            });
            var meta = card.querySelector('.team-hero-meta');
            if (meta) meta.textContent = revealed + '/' + total + ' joined';
        });
    }

    // Reveal members from Firebase
    function revealFromRegistrations(regs) {
        var registeredNames = {};
        Object.values(regs).forEach(function(r) {
            if (r && r.name) registeredNames[r.name] = true;
        });

        teamMembers.forEach(function(el) {
            var nameEl = el.querySelector('.tm-name');
            var badgeEl = el.querySelector('.tm-badge');
            if (!nameEl || !nameEl.dataset.realName) return;
            var realName = nameEl.dataset.realName;

            if (registeredNames[realName]) {
                if (el.classList.contains('tm-locked')) {
                    nameEl.textContent = realName;
                    if (badgeEl) badgeEl.style.display = '';
                    el.classList.remove('tm-locked');
                    el.classList.add('tm-revealed');
                }
            }
        });

        updateCounts(registeredNames);
    }

    if (typeof TeamRegistrations !== 'undefined' && TeamRegistrations.isConfigured()) {
        TeamRegistrations.onUpdate(revealFromRegistrations);
    } else {
        // Fallback: no Firebase, show all members
        teamMembers.forEach(function(el) {
            var nameEl = el.querySelector('.tm-name');
            var badgeEl = el.querySelector('.tm-badge');
            if (nameEl && nameEl.dataset.realName) nameEl.textContent = nameEl.dataset.realName;
            if (badgeEl) badgeEl.style.display = '';
            el.classList.remove('tm-locked');
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initCrewTabs();
    initProfiles();
    initCrewSkeletons();
    initRoomFlip();
    initAnonTraitTap();
    initGuestHighlight();
    initTeamsReveal();
});
