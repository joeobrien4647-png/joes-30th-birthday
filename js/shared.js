/* ============================================
   Shared JavaScript - Loaded on every page
   ============================================ */

/* Utility: Escape HTML (single copy, used everywhere) */
function escapeHtml(text) {
    if (text == null) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/* Utility: Slugify guest name for photo keys and image paths */
function slugify(name) {
    return name.toLowerCase().replace(/['']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/* Utility: Compress and square-crop an image file for profile photo use */
function compressProfilePhoto(file, callback) {
    var reader = new FileReader();
    reader.onload = function(e) {
        var img = new Image();
        img.onload = function() {
            var canvas = document.createElement('canvas');
            var size = 200;
            canvas.width = size;
            canvas.height = size;
            var ctx = canvas.getContext('2d');
            var srcSize = Math.min(img.width, img.height);
            var srcX = (img.width - srcSize) / 2;
            var srcY = (img.height - srcSize) / 2;
            ctx.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, size, size);
            callback(canvas.toDataURL('image/jpeg', 0.6));
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

/* Utility: Get/set guest profile photo from localStorage */
function getGuestPhoto(name) {
    return Store.getRaw('guestPhoto_' + slugify(name));
}
function setGuestPhoto(name, dataUrl) {
    try { Store.setRaw('guestPhoto_' + slugify(name), dataUrl); }
    catch(e) { console.warn('Could not save profile photo — localStorage may be full'); }
}

/* Utility: Debounce */
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

/* localStorage Helpers */
const Store = {
    get(key, fallback) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : fallback;
        } catch {
            return fallback;
        }
    },
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn('localStorage full or unavailable');
        }
    },
    getRaw(key) {
        return localStorage.getItem(key);
    },
    setRaw(key, value) {
        localStorage.setItem(key, value);
    },
    remove(key) {
        localStorage.removeItem(key);
    }
};

/* ── Auth password helpers ── */
const AUTH_KEYS = {
  registered: 'joe30_registered',
  pwHash:     'joe30_pwHash',
  guestCode:  'guestCode',
};

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password) {
  const stored = localStorage.getItem(AUTH_KEYS.pwHash);
  if (!stored) return false;
  const hash = await hashPassword(password);
  return hash === stored;
}

function isFirstTimeVisitor() {
  return !localStorage.getItem(AUTH_KEYS.registered);
}

/* Guest Data - All 25 guests (invite codes are random, not guessable) */
const GUEST_DATA = {
    'JOE-7K9X': {
        name: 'Joe', fullName: 'Joe O\'Brien', room: 'Master Suite',
        team: 'TBA', nickname: 'TBA',
        missions: [
            { id: 'm1', text: 'Accept at least 3 birthday toasts gracefully', completed: false },
            { id: 'm2', text: 'Dance to Mr. Brightside at your party', completed: false },
            { id: 'm3', text: 'Thank everyone individually by end of trip', completed: false }
        ],
        personalNotes: 'You\'re the star of the show! Just enjoy yourself and let everyone spoil you.'
    },
    'SOPHIE-M3P2': {
        name: 'Sophie', fullName: 'Sophie Geen', room: 'Master Suite',
        team: 'TBA', nickname: 'TBA',
        missions: [
            { id: 'm1', text: 'Make sure Joe doesn\'t find out about the surprise activity', completed: false },
            { id: 'm2', text: 'Get a candid photo of Joe laughing', completed: false },
            { id: 'm3', text: 'Lead the birthday toast at dinner', completed: false }
        ],
        personalNotes: 'You\'re on secret keeper duty! The surprise activity on Day 4 must stay hidden.'
    },
    'LUKE-4WN8': {
        name: 'Luke', fullName: 'Luke Recchia', room: 'Room 2',
        team: 'TBA', nickname: 'TBA',
        missions: [
            { id: 'm1', text: 'Get everyone dancing at least once', completed: false },
            { id: 'm2', text: 'Challenge Joe to a game and let him win', completed: false },
            { id: 'm3', text: 'Start a spontaneous sing-along', completed: false }
        ],
        personalNotes: 'You\'re in charge of party vibes! Make sure the music is always on point.'
    },
    'SAM-R6DQ': {
        name: 'Samantha', fullName: 'Samantha Recchia', room: 'Room 2',
        team: 'TBA', nickname: 'TBA',
        missions: [
            { id: 'm1', text: 'Take at least 50 group photos', completed: false },
            { id: 'm2', text: 'Create a mini photo montage by end of trip', completed: false },
            { id: 'm3', text: 'Capture Joe\'s reaction to his birthday surprise', completed: false }
        ],
        personalNotes: 'You\'re the unofficial photographer - capture all the memories!'
    },
    'HANNAH-8FJ3': {
        name: 'Hannah', fullName: 'Hannah O\'Brien', room: 'Room 3',
        team: 'TBA', nickname: 'TBA',
        missions: [
            { id: 'm1', text: 'Share an embarrassing childhood story about Joe', completed: false },
            { id: 'm2', text: 'Make sure Joe\'s birthday cake is perfect', completed: false },
            { id: 'm3', text: 'Get a sibling photo with Joe', completed: false }
        ],
        personalNotes: 'Sibling duty: bring the embarrassing stories and the love!'
    },
    'ROBIN-2VL5': {
        name: 'Robin', fullName: 'Robin Hughes', room: 'Room 3',
        team: 'TBA', nickname: 'TBA',
        missions: [
            { id: 'm1', text: 'Suggest a spontaneous adventure', completed: false },
            { id: 'm2', text: 'Be first in the pool at least once', completed: false },
            { id: 'm3', text: 'Teach someone a new skill', completed: false }
        ],
        personalNotes: 'Bring the adventure energy! Suggest something fun and spontaneous.'
    },
    'JOHNNY-9XT4': {
        name: 'Johnny', fullName: 'Johnny Gates O\'Brien', room: 'Room 4',
        team: 'TBA', nickname: 'TBA',
        missions: [
            { id: 'm1', text: 'Tell at least 5 jokes (good or bad)', completed: false },
            { id: 'm2', text: 'Do an impression of Joe', completed: false },
            { id: 'm3', text: 'Win one game/competition', completed: false }
        ],
        personalNotes: 'You\'re the entertainment - keep the laughs coming!'
    },
    'FLORRIE-5HK7': {
        name: 'Florrie', fullName: 'Florrie Gates O\'Brien', room: 'Room 4',
        team: 'TBA', nickname: 'TBA',
        missions: [
            { id: 'm1', text: 'Lead a group cheer for Joe', completed: false },
            { id: 'm2', text: 'Help decorate for the birthday dinner', completed: false },
            { id: 'm3', text: 'Make everyone feel included', completed: false }
        ],
        personalNotes: 'Spread the good vibes and make sure everyone feels part of the celebration!'
    },
    'RAZON-3BM6': {
        name: 'Razon', fullName: 'Razon Mahebub', room: 'Room 5',
        team: 'TBA', nickname: 'TBA',
        missions: [
            { id: 'm1', text: 'Win a strategy game', completed: false },
            { id: 'm2', text: 'Help plan a surprise moment', completed: false },
            { id: 'm3', text: 'Share a heartfelt toast', completed: false }
        ],
        personalNotes: 'Put those strategic skills to use - help make the surprises work!'
    },
    'NEEVE-6PW2': {
        name: 'Neeve', fullName: 'Neeve Fletcher', room: 'Room 5',
        team: 'TBA', nickname: 'TBA',
        missions: [
            { id: 'm1', text: 'Find the best local cheese', completed: false },
            { id: 'm2', text: 'Help with one group meal', completed: false },
            { id: 'm3', text: 'Create a signature cocktail for the trip', completed: false }
        ],
        personalNotes: 'You\'re the culinary guide - find us the best food and drinks!'
    },
    'GEORGE-1CY9': {
        name: 'George', fullName: 'George Heyworth', room: 'Room 6',
        team: 'TBA', nickname: 'TBA',
        missions: [
            { id: 'm1', text: 'Start a chant at the birthday dinner', completed: false },
            { id: 'm2', text: 'Be the last one standing at the party', completed: false },
            { id: 'm3', text: 'Give a speech (even a short one)', completed: false }
        ],
        personalNotes: 'Bring the ENERGY! Get everyone hyped for Joe\'s big day.'
    },
    'EMMAW-8RJ4': {
        name: 'Emma W', fullName: 'Emma Winup', room: 'Room 6',
        team: 'TBA', nickname: 'TBA',
        missions: [
            { id: 'm1', text: 'Make sure activities run on time', completed: false },
            { id: 'm2', text: 'Help coordinate the group photo', completed: false },
            { id: 'm3', text: 'Create a mini itinerary for one activity', completed: false }
        ],
        personalNotes: 'Your organisational skills are needed - help keep things running smoothly!'
    },
    'TOM-5QL7': {
        name: 'Tom', fullName: 'Tom Heyworth', room: 'Room 7',
        team: 'TBA', nickname: 'TBA',
        missions: [
            { id: 'm1', text: 'Tell a "remember when" story about Joe', completed: false },
            { id: 'm2', text: 'Document at least one funny moment', completed: false },
            { id: 'm3', text: 'Participate in the roast (lovingly!)', completed: false }
        ],
        personalNotes: 'Bring the stories! Joe\'s 30th needs some legendary tales.'
    },
    'ROBERT-2NG8': {
        name: 'Robert', fullName: 'Robert Winup', room: 'Room 7',
        team: 'TBA', nickname: 'TBA',
        missions: [
            { id: 'm1', text: 'Recommend the best wine at tasting', completed: false },
            { id: 'm2', text: 'Teach someone something about wine', completed: false },
            { id: 'm3', text: 'Toast to Joe with a great wine pick', completed: false }
        ],
        personalNotes: 'Share your wine wisdom! Help everyone appreciate the Loire Valley.'
    },
    'SARAH-4KV3': {
        name: 'Sarah', fullName: 'Sarah Shamia', room: 'Room 8',
        team: 'TBA', nickname: 'TBA',
        missions: [
            { id: 'm1', text: 'Introduce two people who haven\'t met', completed: false },
            { id: 'm2', text: 'Start a conversation game', completed: false },
            { id: 'm3', text: 'Make someone new feel welcome', completed: false }
        ],
        personalNotes: 'Help everyone mingle and connect - be the social glue!'
    },
    'KIRAN-7DX1': {
        name: 'Kiran', fullName: 'Kiran Ruparelia', room: 'Room 9',
        team: 'TBA', nickname: 'TBA',
        missions: [
            { id: 'm1', text: 'Be part of a late-night chat', completed: false },
            { id: 'm2', text: 'Suggest a midnight activity', completed: false },
            { id: 'm3', text: 'Keep the party going when others flag', completed: false }
        ],
        personalNotes: 'You\'re the after-hours entertainment - keep the night alive!'
    },
    'SHANE-9FH6': {
        name: 'Shane', fullName: 'Shane Pallian', room: 'Room 12',
        team: 'TBA', nickname: 'TBA',
        missions: [
            { id: 'm1', text: 'Win at least one game/challenge', completed: false },
            { id: 'm2', text: 'Challenge Joe to something competitive', completed: false },
            { id: 'm3', text: 'Be a gracious winner OR loser', completed: false }
        ],
        personalNotes: 'Bring the competitive spirit! Make the games exciting.'
    },
    'OLI-3WT5': {
        name: 'Oli', fullName: 'Oli Moran', room: 'Room 10',
        team: 'TBA', nickname: 'TBA',
        missions: [
            { id: 'm1', text: 'Keep everyone calm if things get hectic', completed: false },
            { id: 'm2', text: 'Suggest a relaxing activity', completed: false },
            { id: 'm3', text: 'Give Joe some genuine birthday wisdom', completed: false }
        ],
        personalNotes: 'Balance out the chaos with some chill vibes when needed.'
    },
    'PETER-6BN2': {
        name: 'Peter', fullName: 'Peter London', room: 'Room 10',
        team: 'TBA', nickname: 'TBA',
        missions: [
            { id: 'm1', text: 'Do something unexpected', completed: false },
            { id: 'm2', text: 'Suggest a bold activity', completed: false },
            { id: 'm3', text: 'Make Joe laugh really hard', completed: false }
        ],
        personalNotes: 'Be unpredictable! Bring the surprises.'
    },
    'EMMAL-1RK8': {
        name: 'Emma L', fullName: 'Emma Levett', room: 'Room 11',
        team: 'TBA', nickname: 'TBA',
        missions: [
            { id: 'm1', text: 'Help with decorations or presentation', completed: false },
            { id: 'm2', text: 'Create a small handmade gift/card', completed: false },
            { id: 'm3', text: 'Document the trip artistically', completed: false }
        ],
        personalNotes: 'Bring your creative touch to make things special!'
    },
    'JONNYL-4VP9': {
        name: 'Jonny L', fullName: 'Jonny Levett', room: 'Room 11',
        team: 'TBA', nickname: 'TBA',
        missions: [
            { id: 'm1', text: 'Pull a harmless prank', completed: false },
            { id: 'm2', text: 'Keep the jokes coming all week', completed: false },
            { id: 'm3', text: 'Make Joe genuinely crack up', completed: false }
        ],
        personalNotes: 'Comedy is your mission - bring the laughs!'
    },
    'JONNYW-8HQ3': {
        name: 'Jonny W', fullName: 'Jonny Williams', room: 'Room 12',
        team: 'TBA', nickname: 'TBA',
        missions: [
            { id: 'm1', text: 'Share a classic Joe story', completed: false },
            { id: 'm2', text: 'Help with the birthday toast', completed: false },
            { id: 'm3', text: 'Create a memorable moment', completed: false }
        ],
        personalNotes: 'Bring the legendary energy!'
    },
    'CHRIS-2FM7': {
        name: 'Chris', fullName: 'Chris Coggin', room: 'Room 9',
        team: 'TBA', nickname: 'TBA',
        missions: [
            { id: 'm1', text: 'Be dependable when things are needed', completed: false },
            { id: 'm2', text: 'Help with setup/cleanup', completed: false },
            { id: 'm3', text: 'Support someone who needs it', completed: false }
        ],
        personalNotes: 'You\'re the reliable one - help keep things running!'
    },
    'OSCAR-5DL4': {
        name: 'Oscar', fullName: 'Oscar Walters', room: 'Room 12',
        team: 'TBA', nickname: 'TBA',
        missions: [
            { id: 'm1', text: 'Get the party started at least once', completed: false },
            { id: 'm2', text: 'Lead a drinking game', completed: false },
            { id: 'm3', text: 'Be on the dance floor first', completed: false }
        ],
        personalNotes: 'When energy is needed, you\'re the spark!'
    },
    'PRANAY-9WX6': {
        name: 'Pranay', fullName: 'Pranay Dube', room: 'Room 12',
        team: 'TBA', nickname: 'TBA',
        missions: [
            { id: 'm1', text: 'Be enthusiastic about every activity', completed: false },
            { id: 'm2', text: 'Encourage others to join in', completed: false },
            { id: 'm3', text: 'Give Joe an enthusiastic birthday hug', completed: false }
        ],
        personalNotes: 'Bring the enthusiasm - your energy is contagious!'
    }
};

/* Players mapped to teams (for leaderboard) — TODO: assign real teams before trip */
const PLAYERS = {};

/* Full name lookup: short name → full name (for leaderboard display) */
const FULL_NAMES = {};
Object.values(GUEST_DATA).forEach(function(g) {
    if (g.name && g.fullName) FULL_NAMES[g.name] = g.fullName;
});

/* Reveal Date — teams & nicknames hidden until arrival night */
const REVEAL_DATE = new Date('2026-04-29T22:00:00+02:00');

function isRevealed() {
    // Guest preview mode — admins can see what guests see
    if (sessionStorage.getItem('guestPreview') === 'true') return false;
    // Admins can always see (for testing)
    if (Auth.isAdmin()) return true;
    return Date.now() >= REVEAL_DATE.getTime();
}

/* Auth Module */
const Auth = {
    getGuestCode() {
        return localStorage.getItem('guestCode');
    },
    isLoggedIn() {
        const code = this.getGuestCode();
        return !!code && code !== 'guest';
    },
    isAdmin() {
        return ['JOE-7K9X', 'SOPHIE-M3P2', 'HANNAH-8FJ3'].includes(this.getGuestCode());
    },
    getGuestData() {
        return GUEST_DATA[this.getGuestCode()];
    },
    getGuestName() {
        const guest = this.getGuestData();
        return guest ? guest.name : 'Guest';
    },
};

/* Build sorted guest list for name picker */
const GUEST_LIST = Object.entries(GUEST_DATA)
    .map(function(entry) { return { code: entry[0], name: entry[1].fullName }; })
    .sort(function(a, b) { return a.name.localeCompare(b.name); });

/* Confetti Animation */
var _confettiAnimId = null;
var _confettiResize = null;

function triggerConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Cancel any running animation
    if (_confettiAnimId) cancelAnimationFrame(_confettiAnimId);
    if (_confettiResize) window.removeEventListener('resize', _confettiResize);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confetti = [];
    const colors = ['#FF6B9D', '#7C3AED', '#FFD93D', '#6BCB77', '#4ECDC4', '#FF6B6B'];

    for (let i = 0; i < 150; i++) {
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

    let startTime = Date.now();
    const duration = 4000;

    _confettiResize = function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', _confettiResize);

    function animate() {
        const elapsed = Date.now() - startTime;
        if (elapsed > duration) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            _confettiAnimId = null;
            window.removeEventListener('resize', _confettiResize);
            _confettiResize = null;
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
            if (particle.y > canvas.height) {
                particle.y = -20;
                particle.x = Math.random() * canvas.width;
            }
        });
        _confettiAnimId = requestAnimationFrame(animate);
    }
    animate();
}

function triggerMiniConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (_confettiAnimId) cancelAnimationFrame(_confettiAnimId);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#FF6B9D', '#7C3AED', '#FFD93D', '#6BCB77'];

    for (let i = 0; i < 30; i++) {
        particles.push({
            x: canvas.width / 2 + (Math.random() - 0.5) * 200,
            y: canvas.height / 2,
            vx: (Math.random() - 0.5) * 10,
            vy: Math.random() * -15 - 5,
            w: Math.random() * 8 + 3,
            h: Math.random() * 4 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            angle: Math.random() * 360,
            spin: Math.random() * 10 - 5,
            opacity: 1,
            gravity: 0.3
        });
    }

    let startTime = Date.now();

    function animate() {
        const elapsed = Date.now() - startTime;
        if (elapsed > 2000) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            _confettiAnimId = null;
            return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.x += p.vx;
            p.vy += p.gravity;
            p.y += p.vy;
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
        _confettiAnimId = requestAnimationFrame(animate);
    }
    animate();
}

/* Scroll Reveal */
function initScrollReveal() {
    const sections = document.querySelectorAll('.section');

    // Immediately reveal sections already in viewport (prevents blank content bug)
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            section.classList.add('visible');
        }
    });

    const observerOptions = { root: null, rootMargin: '0px 0px 50px 0px', threshold: 0.05 };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        if (!section.classList.contains('visible')) {
            observer.observe(section);
        }
    });

    // Safety fallback: reveal all sections after 2s in case observer misses any
    setTimeout(function() {
        sections.forEach(function(s) { s.classList.add('visible'); });
    }, 2000);
}

/* Dark Mode */
function initDarkMode() {
    const toggle = document.getElementById('dark-mode-toggle');
    if (!toggle) return;

    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
        toggle.textContent = '\u2600\uFE0F';
    }

    toggle.addEventListener('click', function () {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark);
        this.textContent = isDark ? '\u2600\uFE0F' : '\uD83C\uDF19';
    });
}

/* Theme Switcher */
function initThemeSwitcher() {
    const toggleBtn = document.getElementById('theme-toggle-btn');
    const options = document.getElementById('theme-options');
    if (!toggleBtn || !options) return;

    const themeButtons = options.querySelectorAll('.theme-option');
    let currentTheme = localStorage.getItem('siteTheme') || 'default';

    applyTheme(currentTheme);

    toggleBtn.addEventListener('click', function () {
        options.classList.toggle('active');
    });

    document.addEventListener('click', function (e) {
        if (!e.target.closest('.theme-switcher')) {
            options.classList.remove('active');
        }
    });

    themeButtons.forEach(btn => {
        if (btn.dataset.theme === currentTheme) btn.classList.add('active');
        btn.addEventListener('click', function () {
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

/* Daily Auto-Theme — changes theme based on trip day (only if user hasn't manually set one) */
function autoDayTheme() {
    if (localStorage.getItem('siteTheme')) return; // user picked a theme, respect it
    var DAY_THEMES = {
        1: 'france',   // Travel day — blue/white/red
        2: 'default',  // Chateau chill — default pink/purple
        3: 'wine',     // Wine day — deep reds
        4: 'disco',    // Birthday party — disco!
        5: 'sunset',   // Recovery — warm sunset
        6: 'france'    // Departure — au revoir
    };
    var start = new Date('2026-04-29').getTime();
    var day = Math.floor((Date.now() - start) / 86400000) + 1;
    if (day >= 1 && day <= 6) {
        document.documentElement.setAttribute('data-theme', DAY_THEMES[day]);
    }
}

/* Confetti Cannon Button */
function initConfettiCannon() {
    const cannon = document.getElementById('confetti-cannon');
    if (!cannon) return;

    cannon.addEventListener('click', function () {
        triggerConfetti();
        cannon.classList.remove('cannon-fired');
        void cannon.offsetWidth; // force reflow
        cannon.classList.add('cannon-fired');
    });
}

/* Admin Guest Preview Toggle */
function initGuestPreview() {
    if (!Auth.isAdmin()) return;

    const isPreview = sessionStorage.getItem('guestPreview') === 'true';

    // Floating toggle button
    const btn = document.createElement('button');
    btn.className = 'guest-preview-btn';
    btn.innerHTML = isPreview ? '&#128065; Guest View ON' : '&#128065; Guest View';
    if (isPreview) btn.classList.add('active');

    btn.addEventListener('click', function () {
        const nowPreview = sessionStorage.getItem('guestPreview') !== 'true';
        sessionStorage.setItem('guestPreview', String(nowPreview));
        location.reload();
    });

    document.body.appendChild(btn);

    // Show a banner when guest preview is active
    if (isPreview) {
        const banner = document.createElement('div');
        banner.className = 'guest-preview-banner';
        banner.innerHTML = '&#128065; GUEST PREVIEW MODE &mdash; You are seeing what guests see. ';
        const exitBtn = document.createElement('button');
        exitBtn.type = 'button';
        exitBtn.textContent = 'Exit';
        exitBtn.addEventListener('click', function () {
            sessionStorage.removeItem('guestPreview');
            location.reload();
        });
        banner.appendChild(exitBtn);
        document.body.prepend(banner);
    }
}

/* Live Leaderboard Banner (all pages) */
function initLeaderboardBanner() {
    const TEAM_NAMES = { team1: 'T1', team2: 'T2', team3: 'T3', team4: 'T4' };
    const TEAM_COLORS = { team1: '#f9d423', team2: '#4fc3f7', team3: '#81c784', team4: '#f48fb1' };
    const TEAMS = ['team1', 'team2', 'team3', 'team4'];

    const bar = document.createElement('div');
    bar.className = 'lb-banner';
    bar.id = 'lb-banner';

    function render() {
        const scores = Store.get('lb_teamScores', { team1: 0, team2: 0, team3: 0, team4: 0 });
        const sorted = TEAMS.slice().sort((a, b) => (scores[b] || 0) - (scores[a] || 0));
        const revealed = typeof isRevealed === 'function' ? isRevealed() : true;

        bar.innerHTML = '<span class="lb-banner-label">\uD83C\uDFC6</span>' +
            sorted.map((t, i) => {
                const name = revealed ? TEAM_NAMES[t] : ('T' + (i + 1));
                const color = revealed ? TEAM_COLORS[t] : 'rgba(255,255,255,0.5)';
                const pts = scores[t] || 0;
                return '<span class="lb-banner-team" style="border-color:' + color + '">' +
                    '<span class="lb-banner-name" style="color:' + color + '">' + name + '</span>' +
                    '<span class="lb-banner-pts">' + pts + '</span></span>';
            }).join('');
    }

    render();
    document.body.appendChild(bar);
    setInterval(render, 15000);
}

/* Dark Mode Auto-Switch (9pm-7am) */
function autoDarkMode() {
    const hour = new Date().getHours();
    const manualSet = localStorage.getItem('darkMode');
    // Only auto-switch if user hasn't manually toggled
    if (manualSet === null) {
        if (hour >= 21 || hour < 7) {
            document.body.classList.add('dark-mode');
            const toggle = document.getElementById('dark-mode-toggle');
            if (toggle) toggle.textContent = '\u2600\uFE0F';
        }
    }
}

/* Background Ambiance Toggle */
function initAmbiance() {
    let audioCtx = null;
    let ambianceNodes = [];
    let playing = false;

    const btn = document.createElement('button');
    btn.className = 'ambiance-btn';
    btn.innerHTML = '\uD83C\uDFB6';
    btn.title = 'Toggle ambient sounds';

    function startAmbiance() {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        // Gentle cicada-like noise + soft pad
        const bufferSize = audioCtx.sampleRate * 2;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.015;
        }
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        // Band-pass filter for cicada-like texture
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 4000;
        filter.Q.value = 2;

        const gainNode = audioCtx.createGain();
        gainNode.gain.value = 0.3;

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        noise.start();

        // Soft warm pad
        const pad = audioCtx.createOscillator();
        const padGain = audioCtx.createGain();
        pad.type = 'sine';
        pad.frequency.value = 220;
        padGain.gain.value = 0.02;
        pad.connect(padGain);
        padGain.connect(audioCtx.destination);
        pad.start();

        ambianceNodes = [noise, pad, gainNode, padGain, filter];
    }

    function stopAmbiance() {
        ambianceNodes.forEach(n => { try { n.stop ? n.stop() : n.disconnect(); } catch(e) {} });
        ambianceNodes = [];
        if (audioCtx) { audioCtx.close(); audioCtx = null; }
    }

    btn.addEventListener('click', function () {
        playing = !playing;
        if (playing) {
            try { startAmbiance(); } catch(e) { playing = false; }
        } else {
            stopAmbiance();
        }
        btn.classList.toggle('active', playing);
    });

    document.body.appendChild(btn);
}

/* Page Transition (fade-in on load) */
function initPageTransition() {
    document.body.classList.add('page-enter');
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            document.body.classList.add('page-ready');
        });
    });
}

/* Back-to-Top Button */
function initBackToTop() {
    var btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.innerHTML = '&#8679;';
    btn.setAttribute('aria-label', 'Back to top');
    btn.title = 'Back to top';
    document.body.appendChild(btn);

    var visible = false;
    window.addEventListener('scroll', debounce(function () {
        var show = window.scrollY > 600;
        if (show !== visible) {
            visible = show;
            btn.classList.toggle('visible', show);
        }
    }, 100));

    btn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* Nav Badges - show dot when new content arrives on other pages */
function initNavBadges() {
    // Map localStorage keys to their nav page
    var WATCHERS = {
        'social.html': ['messages', 'musicRequests', 'photos'],
        'games.html': ['lb_pointsLog', 'lb_individualScores']
    };

    var seen = Store.get('navBadgeSeen', {});
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // On the current page, mark all its keys as "seen" at current counts
    if (WATCHERS[currentPage]) {
        WATCHERS[currentPage].forEach(function (key) {
            var data = Store.get(key, null);
            var count = Array.isArray(data) ? data.length : (data && typeof data === 'object' ? Object.keys(data).length : 0);
            seen[key] = count;
        });
        Store.set('navBadgeSeen', seen);
    }

    // For other pages, check if counts have changed
    var navLinks = document.querySelectorAll('.nav-links a[data-page]');
    navLinks.forEach(function (link) {
        var page = link.getAttribute('data-page');
        var keys = WATCHERS[page];
        if (!keys || page === currentPage) return;

        var hasNew = keys.some(function (key) {
            var data = Store.get(key, null);
            var count = Array.isArray(data) ? data.length : (data && typeof data === 'object' ? Object.keys(data).length : 0);
            var lastSeen = seen[key] || 0;
            return count > lastSeen;
        });

        if (hasNew) {
            var dot = document.createElement('span');
            dot.className = 'nav-badge-dot';
            link.style.position = 'relative';
            link.appendChild(dot);
        }
    });
}

/* Floating Emergency Contacts Card */
function initEmergencyCard() {
    // Create toggle button
    var btn = document.createElement('button');
    btn.className = 'emergency-fab';
    btn.innerHTML = '🚨';
    btn.setAttribute('aria-label', 'Emergency contacts');
    btn.title = 'Emergency contacts';

    // Create the card
    var card = document.createElement('div');
    card.className = 'emergency-card';
    card.innerHTML =
        '<h4>Emergency Contacts</h4>' +
        '<ul>' +
        '<li><strong>EU Emergency:</strong> <a href="tel:112">112</a></li>' +
        '<li><strong>French Police:</strong> <a href="tel:17">17</a></li>' +
        '<li><strong>Ambulance (SAMU):</strong> <a href="tel:15">15</a></li>' +
        '<li><strong>Joe:</strong> <a href="tel:+447501395277">+44 7501 395277</a></li>' +
        '<li><strong>Yoke (Emergency):</strong> <a href="tel:+447799801708">07799 801708</a></li>' +
        '<li><strong>Nearest Hospital:</strong> Centre Hospitalier de Le Blanc (~15 min)</li>' +
        '</ul>' +
        '<button class="emergency-card-close">&times;</button>';

    document.body.appendChild(btn);
    document.body.appendChild(card);

    var open = false;
    function toggle() {
        open = !open;
        card.classList.toggle('open', open);
        btn.classList.toggle('active', open);
    }
    btn.addEventListener('click', toggle);
    card.querySelector('.emergency-card-close').addEventListener('click', toggle);
    document.addEventListener('click', function(e) {
        if (open && !card.contains(e.target) && e.target !== btn) {
            toggle();
        }
    });
}

/* Register Service Worker for offline support */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('sw.js').catch(function() {});
    });
}

/* ============================================
   Trip Progress Bar (under nav, all pages)
   ============================================ */
function initTripProgress() {
    var tripStart = new Date('2026-04-29T07:00:00+01:00').getTime();
    var tripEnd   = new Date('2026-05-04T12:00:00+02:00').getTime();
    var now = Date.now();

    // Only show during/after trip start
    if (now < tripStart - 86400000) return; // show 1 day before

    var pct = Math.max(0, Math.min(100, ((now - tripStart) / (tripEnd - tripStart)) * 100));

    var bar = document.createElement('div');
    bar.className = 'trip-progress';
    bar.innerHTML = '<div class="trip-progress-fill" style="width:' + pct + '%"></div>' +
        '<span class="trip-progress-label">' +
        (now < tripStart ? 'Tomorrow!' : (pct >= 100 ? 'Trip complete!' : 'Day ' + Math.min(6, Math.ceil(((now - tripStart) / 86400000) + 0.01)) + ' of 6')) +
        '</span>';

    var nav = document.querySelector('.main-nav') || document.querySelector('nav');
    if (nav) nav.parentNode.insertBefore(bar, nav.nextSibling);
}

/* ============================================
   Scroll-Triggered Stagger Animations
   ============================================ */
function initScrollStagger() {
    var grids = document.querySelectorAll('.stagger-grid');
    if (grids.length === 0) return;

    // Auto-apply stagger-item to direct children that don't have it
    grids.forEach(function (g) {
        Array.from(g.children).forEach(function (child) {
            if (!child.classList.contains('stagger-item')) {
                child.classList.add('stagger-item');
            }
        });
    });

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var children = entry.target.querySelectorAll('.stagger-item');
            children.forEach(function (child, i) {
                child.style.transitionDelay = (i * 0.07) + 's';
                child.classList.add('stagger-visible');
            });
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.15 });

    grids.forEach(function (g) { observer.observe(g); });
}

/* ============================================
   Sticky Scroll Spy Label
   ============================================ */
function initScrollSpy() {
    var sections = document.querySelectorAll('.section[id]');
    if (sections.length < 3) return; // only on pages with enough sections

    var pill = document.createElement('div');
    pill.className = 'scroll-spy-pill';
    pill.setAttribute('aria-hidden', 'true');
    document.body.appendChild(pill);

    var currentLabel = '';
    var hideTimer = null;

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var title = entry.target.querySelector('.section-title');
            if (!title) return;
            var text = title.textContent.trim();
            if (text === currentLabel) return;
            currentLabel = text;
            pill.textContent = text;
            pill.classList.add('visible');
            clearTimeout(hideTimer);
            hideTimer = setTimeout(function () { pill.classList.remove('visible'); }, 2000);
        });
    }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });

    sections.forEach(function (s) { observer.observe(s); });
}

/* ============================================
   Live Pulse Dot (on "Live" tab buttons)
   ============================================ */
function initLivePulseDots() {
    document.querySelectorAll('.lb-tab[data-lb="feed"]').forEach(function (tab) {
        if (tab.querySelector('.live-pulse-dot')) return;
        var dot = document.createElement('span');
        dot.className = 'live-pulse-dot';
        tab.appendChild(dot);
    });
}

/* ============================================
   Copy-to-Clipboard with Feedback
   ============================================ */
function copyWithFeedback(text, btn) {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text).then(function () {
        var original = btn.textContent;
        btn.classList.add('copy-feedback', 'copied');
        btn.textContent = '\u2713 Copied!';
        setTimeout(function () {
            btn.classList.remove('copied');
            btn.textContent = original;
        }, 1500);
        showToast('Copied to clipboard', 'success');
    });
}

/* ============================================
   Smooth Tab Indicator Slide
   ============================================ */
function initTabSlide() {
    document.querySelectorAll('.crew-tab-bar, .lb-toggle, .challenge-tabs').forEach(function (bar) {
        var indicator = document.createElement('span');
        indicator.className = 'tab-slide-indicator';
        bar.style.position = 'relative';
        bar.appendChild(indicator);

        function positionIndicator() {
            var active = bar.querySelector('.active');
            if (!active) { indicator.style.opacity = '0'; return; }
            var barRect = bar.getBoundingClientRect();
            var activeRect = active.getBoundingClientRect();
            indicator.style.width = activeRect.width + 'px';
            indicator.style.left = (activeRect.left - barRect.left) + 'px';
            indicator.style.opacity = '1';
        }

        positionIndicator();

        bar.addEventListener('click', function (e) {
            var tab = e.target.closest('button');
            if (!tab) return;
            // Wait a frame for active class to update
            requestAnimationFrame(positionIndicator);
        });

        window.addEventListener('resize', debounce(positionIndicator, 150));
    });
}

/* Scroll depth indicator — thin gradient bar at very top */
function initScrollDepth() {
    var bar = document.createElement('div');
    bar.className = 'scroll-depth';
    document.body.appendChild(bar);

    window.addEventListener('scroll', function () {
        var scrollTop = window.scrollY || document.documentElement.scrollTop;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight > 0) {
            bar.style.width = (scrollTop / docHeight * 100) + '%';
        }
    }, { passive: true });
}

/* "Today" tile glow on schedule page */
function initTodayGlow() {
    var tiles = document.querySelectorAll('.overview-tile[data-day]');
    if (!tiles.length) return;

    var tripStart = new Date('2026-04-29T00:00:00+02:00');
    var now = new Date();
    var diff = Math.floor((now - tripStart) / (1000 * 60 * 60 * 24));
    var todayDay = diff + 1;

    if (todayDay >= 1 && todayDay <= 6) {
        tiles.forEach(function (tile) {
            if (parseInt(tile.dataset.day) === todayDay) {
                tile.classList.add('today-glow');
            }
        });
    }
}

/* ============================================
   Admin Shared State (same-origin config file + localStorage)
   Reads from /site-config.json (served by GitHub Pages).
   Admin writes via GitHub web editor (Push Live button).
   All guests poll the config every 2 min.
   ============================================ */
const AdminState = {
    CONFIG_URL: 'site-config.json',
    EDIT_URL: 'https://github.com/joeobrien4647-png/joes-30th-birthday/edit/main/site-config.json',
    POLL_MS: 120000,
    _cache: null,
    _listeners: [],

    defaults: function() {
        return { teamsRevealed: false, announcement: null, secretOverrides: [], updatedAt: 0 };
    },

    get: function() {
        if (this._cache) return this._cache;
        return Store.get('adminState', this.defaults());
    },

    fetch: function(callback) {
        var self = this;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', self.CONFIG_URL + '?t=' + Date.now());
        xhr.timeout = 5000;
        xhr.onload = function() {
            if (xhr.status === 200) {
                try {
                    var state = JSON.parse(xhr.responseText);
                    self._cache = state;
                    Store.set('adminState', state);
                    self._notify(state);
                    if (callback) callback(state);
                } catch(e) { if (callback) callback(self.get()); }
            } else { if (callback) callback(self.get()); }
        };
        xhr.onerror = xhr.ontimeout = function() { if (callback) callback(self.get()); };
        xhr.send();
    },

    /* Save to localStorage (instant local effect) and copy JSON for GitHub push */
    save: function(state, callback) {
        state.updatedAt = Date.now();
        this._cache = state;
        Store.set('adminState', state);
        this._notify(state);
        if (callback) callback(true);
    },

    /* Copy config JSON to clipboard and open GitHub editor */
    pushLive: function(callback) {
        var json = JSON.stringify(this.get(), null, 2) + '\n';
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(json).then(function() {
                window.open(AdminState.EDIT_URL, '_blank');
                if (callback) callback(true);
            }).catch(function() {
                prompt('Copy this JSON, then paste in the GitHub editor:', json);
                window.open(AdminState.EDIT_URL, '_blank');
                if (callback) callback(true);
            });
        } else {
            prompt('Copy this JSON, then paste in the GitHub editor:', json);
            window.open(AdminState.EDIT_URL, '_blank');
            if (callback) callback(true);
        }
    },

    onChange: function(fn) { this._listeners.push(fn); },
    _notify: function(state) { this._listeners.forEach(function(fn) { fn(state); }); },

    startPolling: function() {
        var self = this;
        self.fetch();
        setInterval(function() { if (!document.hidden) self.fetch(); }, self.POLL_MS);
    }
};

/* Apply admin-controlled shared state on every page */
function initAdminState() {
    AdminState.startPolling();
    AdminState.onChange(function(state) {
        applyAnnouncement(state.announcement);
        applySecretOverrides(state.secretOverrides || []);
    });
    var state = AdminState.get();
    applyAnnouncement(state.announcement);
    applySecretOverrides(state.secretOverrides || []);
}

function applyAnnouncement(announcement) {
    var existing = document.getElementById('admin-announcement');
    if (existing) existing.remove();
    if (!announcement || !announcement.text) return;

    var banner = document.createElement('div');
    banner.id = 'admin-announcement';
    banner.className = 'admin-announcement admin-announcement--' + (announcement.type || 'info');
    banner.innerHTML = '<span class="announcement-text">' + escapeHtml(announcement.text) + '</span>' +
        '<button class="announcement-dismiss" aria-label="Dismiss">&times;</button>';
    banner.querySelector('.announcement-dismiss').addEventListener('click', function() {
        banner.style.opacity = '0';
        banner.style.transition = 'opacity 0.3s';
        setTimeout(function() { banner.remove(); }, 300);
    });

    var nav = document.querySelector('.main-nav');
    if (nav) nav.parentNode.insertBefore(banner, nav.nextSibling);
    else document.body.prepend(banner);
}

function applySecretOverrides(overrides) {
    if (!overrides.length) return;
    document.querySelectorAll('.top-secret[data-unlock]').forEach(function(item) {
        var unlockDate = item.dataset.unlock.split('T')[0];
        if (overrides.indexOf(unlockDate) !== -1 || overrides.indexOf(item.dataset.unlock) !== -1) {
            var overlay = item.querySelector('.secret-overlay');
            var content = item.querySelector('.secret-content');
            if (overlay) overlay.style.display = 'none';
            if (content) content.style.display = 'block';
            item.classList.add('unlocked');
            item.classList.remove('top-secret');
        }
    });
}

/* Admin Panel — floating drawer for joe30/admin users */
function initAdminPanel() {
    if (!Auth.isAdmin()) return;

    var fab = document.createElement('button');
    fab.className = 'admin-fab';
    fab.innerHTML = '&#9881;';
    fab.title = 'Admin Panel';

    var backdrop = document.createElement('div');
    backdrop.className = 'admin-backdrop';

    var drawer = document.createElement('div');
    drawer.className = 'admin-drawer';

    var SECRETS = [
        { date: '2026-04-29', label: 'Day 1: Team Reveal & Ice Breakers' },
        { date: '2026-05-02', label: 'Day 4: Birthday Olympics & Roast' }
    ];

    function buildContent() {
        var state = AdminState.get();
        drawer.innerHTML =
            '<div class="admin-drawer-header">' +
                '<h3>Admin Panel</h3>' +
                '<button class="admin-drawer-close">&times;</button>' +
            '</div>' +
            '<div class="admin-drawer-body">' +
                '<div class="admin-section">' +
                    '<h4>Team Reveal</h4>' +
                    '<label class="admin-toggle">' +
                        '<input type="checkbox" id="admin-teams-toggle" ' + (state.teamsRevealed ? 'checked' : '') + '>' +
                        '<span class="admin-toggle-slider"></span>' +
                        '<span class="admin-toggle-label">' + (state.teamsRevealed ? 'Teams Visible' : 'Teams Hidden') + '</span>' +
                    '</label>' +
                '</div>' +
                '<div class="admin-section">' +
                    '<h4>Unlock Secrets</h4>' +
                    '<p class="admin-hint">Override date locks to reveal content early.</p>' +
                    '<div class="admin-secret-list">' +
                        SECRETS.map(function(s) {
                            var checked = (state.secretOverrides || []).indexOf(s.date) !== -1;
                            return '<label class="admin-secret-item">' +
                                '<input type="checkbox" data-date="' + s.date + '" ' + (checked ? 'checked' : '') + '>' +
                                '<span>' + s.label + '</span></label>';
                        }).join('') +
                    '</div>' +
                '</div>' +
                '<div class="admin-section">' +
                    '<h4>Announcement</h4>' +
                    '<textarea id="admin-announce-text" placeholder="Type a message for all guests..." rows="3">' +
                        escapeHtml(state.announcement ? state.announcement.text : '') +
                    '</textarea>' +
                    '<div class="admin-announce-types">' +
                        '<button class="admin-announce-type' + (!state.announcement || state.announcement.type === 'info' ? ' active' : '') + '" data-type="info">Info</button>' +
                        '<button class="admin-announce-type' + (state.announcement && state.announcement.type === 'warning' ? ' active' : '') + '" data-type="warning">Warning</button>' +
                        '<button class="admin-announce-type' + (state.announcement && state.announcement.type === 'celebration' ? ' active' : '') + '" data-type="celebration">Party</button>' +
                    '</div>' +
                    '<div class="admin-announce-actions">' +
                        '<button class="admin-btn admin-btn-primary" id="admin-announce-post">Post</button>' +
                        '<button class="admin-btn admin-btn-secondary" id="admin-announce-clear">Clear</button>' +
                    '</div>' +
                '</div>' +
                '<div class="admin-section admin-push">' +
                    '<button class="admin-btn admin-btn-push" id="admin-push-live">Push Live to All Guests</button>' +
                    '<p class="admin-hint" style="margin-top:8px">Copies config to clipboard &amp; opens GitHub editor. Paste, replace all, commit. Changes go live in ~1 min.</p>' +
                '</div>' +
            '</div>';

        attachEvents(state);
    }

    function attachEvents(state) {
        drawer.querySelector('.admin-drawer-close').addEventListener('click', closeDrawer);

        var teamsToggle = drawer.querySelector('#admin-teams-toggle');
        if (teamsToggle) {
            teamsToggle.addEventListener('change', function() {
                state.teamsRevealed = this.checked;
                this.nextElementSibling.nextElementSibling.textContent = this.checked ? 'Teams Visible' : 'Teams Hidden';
                saveState(state);
            });
        }

        drawer.querySelectorAll('.admin-secret-item input').forEach(function(cb) {
            cb.addEventListener('change', function() {
                var date = this.dataset.date;
                var overrides = state.secretOverrides || [];
                if (this.checked) { if (overrides.indexOf(date) === -1) overrides.push(date); }
                else { overrides = overrides.filter(function(d) { return d !== date; }); }
                state.secretOverrides = overrides;
                saveState(state);
            });
        });

        var announceType = (state.announcement && state.announcement.type) || 'info';
        drawer.querySelectorAll('.admin-announce-type').forEach(function(btn) {
            btn.addEventListener('click', function() {
                drawer.querySelectorAll('.admin-announce-type').forEach(function(b) { b.classList.remove('active'); });
                this.classList.add('active');
                announceType = this.dataset.type;
            });
        });

        var postBtn = drawer.querySelector('#admin-announce-post');
        if (postBtn) {
            postBtn.addEventListener('click', function() {
                var text = drawer.querySelector('#admin-announce-text').value.trim();
                if (!text) return;
                state.announcement = { text: text, type: announceType, timestamp: Date.now() };
                saveState(state);
            });
        }

        var clearBtn = drawer.querySelector('#admin-announce-clear');
        if (clearBtn) {
            clearBtn.addEventListener('click', function() {
                state.announcement = null;
                drawer.querySelector('#admin-announce-text').value = '';
                saveState(state);
            });
        }

        var pushBtn = drawer.querySelector('#admin-push-live');
        if (pushBtn) {
            pushBtn.addEventListener('click', function() {
                AdminState.pushLive(function() {
                    pushBtn.textContent = 'Copied! Paste in GitHub editor';
                    setTimeout(function() { pushBtn.textContent = 'Push Live to All Guests'; }, 4000);
                });
            });
        }
    }

    function saveState(state) {
        AdminState.save(state);
    }

    function openDrawer() {
        buildContent();
        drawer.classList.add('open');
        backdrop.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        drawer.classList.remove('open');
        backdrop.classList.remove('open');
        document.body.style.overflow = '';
    }

    fab.addEventListener('click', function() {
        drawer.classList.contains('open') ? closeDrawer() : openDrawer();
    });
    backdrop.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
    });

    document.body.appendChild(fab);
    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);
}

/* Initialize shared components on every page */
document.addEventListener('DOMContentLoaded', function () {
    // Page transition
    initPageTransition();
    // Apply saved dark mode
    initDarkMode();
    // Auto dark mode (time-based)
    autoDarkMode();
    // Apply saved theme (or auto-theme for trip days)
    initThemeSwitcher();
    autoDayTheme();
    // Scroll reveal for sections
    initScrollReveal();
    // Confetti cannon button
    initConfettiCannon();
    // Update nav with guest name
    updateNavGuest();
    // Admin guest preview toggle
    initGuestPreview();
    // Live leaderboard banner
    initLeaderboardBanner();
    // Background ambiance toggle
    initAmbiance();
    // Keyboard shortcuts
    initKeyboardShortcuts();
    // Animated scroll counters
    initScrollCounters();
    // Enhanced lightbox with swipe
    initEnhancedLightbox();
    // Back-to-top button
    initBackToTop();
    // New-content nav badges
    initNavBadges();
    // Floating emergency contacts
    initEmergencyCard();
    // Trip progress bar
    initTripProgress();
    // Scroll-triggered stagger animations
    initScrollStagger();
    // Sticky scroll spy label
    initScrollSpy();
    // Live pulse dots on feed tabs
    initLivePulseDots();
    // Smooth tab indicator slide
    initTabSlide();
    // Scroll depth indicator
    initScrollDepth();
    // "Today" tile glow on schedule page
    initTodayGlow();
    // Guest name picker (all pages)
    initGuestPicker();
    // My Trip floating drawer
    initMyTripDrawer();
    // Contextual guest highlighting
    applyGuestHighlighting();
    // Admin shared state sync
    initAdminState();
    // Admin panel (admin users only)
    initAdminPanel();
});

/* Update nav to show guest name */
function updateNavGuest() {
    const guestNameEl = document.getElementById('nav-guest-name');
    if (guestNameEl && Auth.isLoggedIn()) {
        guestNameEl.textContent = 'Hi, ' + Auth.getGuestName();
        guestNameEl.style.display = 'inline-block';
    }
}

/* ============================================
   Guest Name Picker (replaces code login)
   ============================================ */
function initGuestPicker() {
    if (document.getElementById('auth-modal')) return;
    if (Auth.isLoggedIn()) return;
    if (document.getElementById('guest-picker-overlay')) return;

    var overlay = document.createElement('div');
    overlay.id = 'guest-picker-overlay';
    overlay.className = 'guest-picker-overlay';

    var card = document.createElement('div');
    card.className = 'guest-picker-card';
    card.innerHTML =
        '<h2>Welcome to Joe\'s 30th!</h2>' +
        '<p>Pick your name to unlock your personal experience</p>' +
        '<select id="guest-picker-select" class="guest-picker-select">' +
        '<option value="" disabled selected>Choose your name\u2026</option>' +
        GUEST_LIST.map(function(g) {
            return '<option value="' + g.code + '">' + escapeHtml(g.name) + '</option>';
        }).join('') +
        '</select>' +
        '<button id="guest-picker-go" class="btn btn-primary guest-picker-btn" disabled>That\u2019s Me!</button>' +
        '<button id="guest-picker-skip" class="guest-picker-skip">Explore as Guest \u2192</button>';

    overlay.appendChild(card);
    document.body.appendChild(overlay);

    var select = document.getElementById('guest-picker-select');
    var goBtn = document.getElementById('guest-picker-go');
    var skipBtn = document.getElementById('guest-picker-skip');

    select.addEventListener('change', function() { goBtn.disabled = !this.value; });

    goBtn.addEventListener('click', function() {
        var code = select.value;
        if (!code) return;
        localStorage.setItem('guestCode', code);
        overlay.classList.add('guest-picker-closing');
        setTimeout(function() { overlay.remove(); }, 300);
        updateNavGuest();
        initMyTripDrawer();
        applyGuestHighlighting();
        if (typeof triggerConfetti === 'function') triggerConfetti();
        // Tell home.js to show dashboard
        document.dispatchEvent(new CustomEvent('guestLoggedIn', { detail: { code: code } }));
    });

    skipBtn.addEventListener('click', function() {
        localStorage.setItem('guestCode', 'guest');
        overlay.classList.add('guest-picker-closing');
        setTimeout(function() { overlay.remove(); }, 300);
    });
}

/* ============================================
   My Trip Floating Drawer
   ============================================ */
function initMyTripDrawer() {
    if (!Auth.isLoggedIn()) return;
    if (document.getElementById('my-trip-fab')) return;

    var guest = Auth.getGuestData();
    if (!guest) return;
    var guestCode = Auth.getGuestCode();

    // FAB
    var fab = document.createElement('button');
    fab.id = 'my-trip-fab';
    fab.className = 'my-trip-fab';
    fab.innerHTML = '<span class="my-trip-fab-icon">\uD83C\uDF92</span><span class="my-trip-fab-label">My Trip</span>';
    fab.setAttribute('aria-label', 'Open My Trip panel');

    // Backdrop
    var backdrop = document.createElement('div');
    backdrop.id = 'my-trip-backdrop';
    backdrop.className = 'my-trip-backdrop';

    // Drawer
    var drawer = document.createElement('div');
    drawer.id = 'my-trip-drawer';
    drawer.className = 'my-trip-drawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-label', 'My Trip');

    var isOpen = false;

    function buildContent() {
        var progress = Store.get('missionProgress', {});
        var gp = progress[guestCode] || {};
        var done = guest.missions.filter(function(m) { return gp[m.id]; }).length;
        var teamDisplay = isRevealed() ? escapeHtml(guest.team) : '??? (Revealed 29 Apr)';
        var scores = Store.get('lb_individualScores', {});
        var pts = scores[guest.name] || 0;
        var sorted = Object.entries(scores).sort(function(a, b) { return b[1] - a[1]; });
        var rank = sorted.findIndex(function(e) { return e[0] === guest.name; }) + 1;

        drawer.innerHTML =
            '<div class="my-trip-header">' +
                '<h3>My Trip</h3>' +
                '<button class="my-trip-close" id="my-trip-close">\u00D7</button>' +
            '</div>' +
            '<div class="my-trip-body">' +
                '<div class="my-trip-identity">' +
                    '<div class="my-trip-name">' + escapeHtml(guest.fullName) + '</div>' +
                    '<div class="my-trip-meta">' + escapeHtml(guest.room) + ' \u00B7 ' + teamDisplay + '</div>' +
                '</div>' +
                '<div class="my-trip-section">' +
                    '<h4>Secret Missions <span class="my-trip-count">' + done + '/' + guest.missions.length + '</span></h4>' +
                    '<div class="my-trip-missions">' +
                        guest.missions.map(function(m) {
                            var c = gp[m.id] || false;
                            return '<label class="my-trip-mission' + (c ? ' done' : '') + '">' +
                                '<input type="checkbox"' + (c ? ' checked' : '') + ' data-mid="' + m.id + '">' +
                                '<span>' + escapeHtml(m.text) + '</span>' +
                            '</label>';
                        }).join('') +
                    '</div>' +
                '</div>' +
                '<div class="my-trip-section">' +
                    '<h4>Personal Note</h4>' +
                    '<p class="my-trip-notes">' + escapeHtml(guest.personalNotes) + '</p>' +
                '</div>' +
                (isRevealed() ?
                    '<div class="my-trip-section">' +
                        '<h4>Stats</h4>' +
                        '<div class="my-trip-stats-grid">' +
                            '<div class="my-trip-stat"><span class="my-trip-stat-val">' + pts + '</span><span class="my-trip-stat-lbl">Points</span></div>' +
                            '<div class="my-trip-stat"><span class="my-trip-stat-val">' + (rank > 0 ? '#' + rank : '-') + '</span><span class="my-trip-stat-lbl">Rank</span></div>' +
                        '</div>' +
                    '</div>' : '') +
                '<div class="my-trip-switch">' +
                    '<button class="my-trip-switch-btn" id="my-trip-switch">Switch Guest</button>' +
                '</div>' +
            '</div>';

        // Mission checkboxes
        drawer.querySelectorAll('input[data-mid]').forEach(function(cb) {
            cb.addEventListener('change', function() {
                var mid = this.dataset.mid;
                var p = Store.get('missionProgress', {});
                if (!p[guestCode]) p[guestCode] = {};
                p[guestCode][mid] = this.checked;
                Store.set('missionProgress', p);
                this.closest('.my-trip-mission').classList.toggle('done', this.checked);
                var cnt = guest.missions.filter(function(m) { return p[guestCode][m.id]; }).length;
                var cntEl = drawer.querySelector('.my-trip-count');
                if (cntEl) cntEl.textContent = cnt + '/' + guest.missions.length;
                if (this.checked && typeof triggerMiniConfetti === 'function') triggerMiniConfetti();
            });
        });

        document.getElementById('my-trip-close').addEventListener('click', closeDrawer);

        document.getElementById('my-trip-switch').addEventListener('click', function() {
            closeDrawer();
            localStorage.removeItem('guestCode');
            var navName = document.getElementById('nav-guest-name');
            if (navName) navName.style.display = 'none';
            fab.remove(); drawer.remove(); backdrop.remove();
            var dash = document.getElementById('my-dashboard');
            if (dash) dash.style.display = 'none';
            initGuestPicker();
        });
    }

    function openDrawer() {
        buildContent();
        isOpen = true;
        drawer.classList.add('open');
        backdrop.classList.add('open');
        fab.classList.add('active');
    }

    function closeDrawer() {
        isOpen = false;
        drawer.classList.remove('open');
        backdrop.classList.remove('open');
        fab.classList.remove('active');
    }

    fab.addEventListener('click', function() { isOpen ? closeDrawer() : openDrawer(); });
    backdrop.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isOpen) closeDrawer();
    });

    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);
    document.body.appendChild(fab);
}

/* ============================================
   Guest Contextual Highlighting
   ============================================ */
function applyGuestHighlighting() {
    if (!Auth.isLoggedIn()) return;
    var guest = Auth.getGuestData();
    if (!guest) return;

    document.body.classList.add('guest-active');
    document.dispatchEvent(new CustomEvent('guestHighlight', {
        detail: { name: guest.name, fullName: guest.fullName, room: guest.room, code: Auth.getGuestCode() }
    }));
}

/* ============================================
   Confirmation Modal
   ============================================ */
function confirmAction(message, onConfirm) {
    // Remove any existing confirmation modal
    const existing = document.getElementById('confirm-modal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'confirm-modal';
    overlay.className = 'confirm-overlay';

    overlay.innerHTML =
        '<div class="confirm-card">' +
            '<p class="confirm-message">' + escapeHtml(message) + '</p>' +
            '<div class="confirm-buttons">' +
                '<button class="confirm-btn confirm-btn-cancel">Cancel</button>' +
                '<button class="confirm-btn confirm-btn-confirm">Confirm</button>' +
            '</div>' +
        '</div>';

    function close() {
        overlay.classList.add('confirm-closing');
        setTimeout(function () { overlay.remove(); }, 200);
    }

    overlay.querySelector('.confirm-btn-cancel').addEventListener('click', close);
    overlay.querySelector('.confirm-btn-confirm').addEventListener('click', function () {
        close();
        if (typeof onConfirm === 'function') onConfirm();
    });

    // Close on overlay click
    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) close();
    });

    document.body.appendChild(overlay);
    // Focus the confirm button for accessibility
    overlay.querySelector('.confirm-btn-confirm').focus();
}

/* ============================================
   Photo Compression
   ============================================ */
function compressImage(file, maxWidth, quality) {
    maxWidth = maxWidth || 800;
    quality = quality || 0.6;

    return new Promise(function (resolve, reject) {
        if (!file || !file.type.startsWith('image/')) {
            reject(new Error('Invalid image file'));
            return;
        }

        var reader = new FileReader();
        reader.onload = function (e) {
            var img = new Image();
            img.onload = function () {
                var canvas = document.createElement('canvas');
                var w = img.width;
                var h = img.height;

                if (w > maxWidth) {
                    h = Math.round(h * (maxWidth / w));
                    w = maxWidth;
                }

                canvas.width = w;
                canvas.height = h;

                var ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);

                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = function () { reject(new Error('Failed to load image')); };
            img.src = e.target.result;
        };
        reader.onerror = function () { reject(new Error('Failed to read file')); };
        reader.readAsDataURL(file);
    });
}

/* ============================================
   Keyboard Shortcuts
   ============================================ */
function initKeyboardShortcuts() {
    document.addEventListener('keydown', function (e) {
        // ESC - close modals and lightbox
        if (e.key === 'Escape') {
            // Close lightbox first
            var lightbox = document.getElementById('lightbox');
            if (lightbox && lightbox.classList.contains('active')) {
                lightbox.classList.remove('active');
                document.body.style.overflow = '';
                return;
            }
            // Close confirmation modal
            var confirmModal = document.getElementById('confirm-modal');
            if (confirmModal) {
                confirmModal.remove();
                return;
            }
            // Close any visible modal (class contains 'modal' and is visible)
            var modals = document.querySelectorAll('[class*="modal"]');
            for (var i = 0; i < modals.length; i++) {
                var m = modals[i];
                var style = window.getComputedStyle(m);
                if (style.display !== 'none' && style.visibility !== 'hidden' && m.offsetParent !== null) {
                    // Skip modals that have their own close handlers
                    if (m.id === 'guest-login-modal' || m.id === 'password-modal' || m.id === 'profile-modal') continue;
                    m.style.display = 'none';
                    return;
                }
            }
        }

        // Left/Right arrows - navigate day tabs
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            // Don't intercept when typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;

            var tabs = document.querySelectorAll('.tab-btn');
            if (tabs.length === 0) return;

            var activeIdx = -1;
            for (var j = 0; j < tabs.length; j++) {
                if (tabs[j].classList.contains('active')) { activeIdx = j; break; }
            }
            if (activeIdx === -1) return;

            var nextIdx = e.key === 'ArrowRight'
                ? Math.min(activeIdx + 1, tabs.length - 1)
                : Math.max(activeIdx - 1, 0);

            if (nextIdx !== activeIdx) {
                tabs[nextIdx].click();
            }
        }
    });
}

/* ============================================
   Notification Toasts
   ============================================ */
function showToast(message, type) {
    type = type || 'info';

    // Create container if it doesn't exist
    var container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    var icons = { success: '\u2713', info: '\u2139', warning: '\u26A0' };

    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.innerHTML = '<span class="toast-icon">' + (icons[type] || icons.info) + '</span>' +
                      '<span class="toast-message">' + escapeHtml(message) + '</span>';

    container.appendChild(toast);

    // Trigger slide-in
    requestAnimationFrame(function () {
        toast.classList.add('toast-visible');
    });

    // Auto-dismiss after 3 seconds
    setTimeout(function () {
        toast.classList.remove('toast-visible');
        toast.classList.add('toast-exit');
        setTimeout(function () { toast.remove(); }, 300);
    }, 3000);
}

/* ============================================
   Animated Scroll Counters
   ============================================ */
function initScrollCounters() {
    var counters = document.querySelectorAll('.count-up');
    if (counters.length === 0) return;

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var el = entry.target;
            if (el.dataset.counted) return;
            el.dataset.counted = 'true';

            var target = parseInt(el.textContent, 10);
            if (isNaN(target) || target === 0) return;

            var start = 0;
            var duration = 1000;
            var startTime = null;

            function step(timestamp) {
                if (!startTime) startTime = timestamp;
                var progress = Math.min((timestamp - startTime) / duration, 1);
                // Ease-out cubic
                var eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = Math.round(start + (target - start) * eased);
                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    el.textContent = target;
                }
            }

            el.textContent = '0';
            requestAnimationFrame(step);
            observer.unobserve(el);
        });
    }, { threshold: 0.3 });

    counters.forEach(function (el) { observer.observe(el); });
}

/* ============================================
   Enhanced Lightbox with Swipe Support
   ============================================ */
function initEnhancedLightbox() {
    var lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    var closeBtn = lightbox.querySelector('.lightbox-close');
    var prevBtn = lightbox.querySelector('.lightbox-prev');
    var nextBtn = lightbox.querySelector('.lightbox-next');

    // Make close button larger for touch
    if (closeBtn) {
        closeBtn.classList.add('lightbox-close-enhanced');
    }

    // Add swipe indicator arrows
    if (prevBtn) prevBtn.classList.add('lightbox-swipe-indicator');
    if (nextBtn) nextBtn.classList.add('lightbox-swipe-indicator');

    // Touch swipe handling
    var touchStartX = 0;
    var touchStartY = 0;
    var swiping = false;

    lightbox.addEventListener('touchstart', function (e) {
        touchStartX = e.changedTouches[0].clientX;
        touchStartY = e.changedTouches[0].clientY;
        swiping = true;
    }, { passive: true });

    lightbox.addEventListener('touchend', function (e) {
        if (!swiping) return;
        swiping = false;

        var touchEndX = e.changedTouches[0].clientX;
        var touchEndY = e.changedTouches[0].clientY;
        var deltaX = touchEndX - touchStartX;
        var deltaY = touchEndY - touchStartY;

        // Only trigger if horizontal swipe is dominant
        if (Math.abs(deltaX) < 50 || Math.abs(deltaY) > Math.abs(deltaX)) return;

        if (deltaX < -50 && nextBtn) {
            nextBtn.click();
        } else if (deltaX > 50 && prevBtn) {
            prevBtn.click();
        }
    }, { passive: true });
}
