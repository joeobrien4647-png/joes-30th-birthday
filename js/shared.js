/* ============================================
   Shared JavaScript - Loaded on every page
   ============================================ */

/* Utility: Escape HTML (single copy, used everywhere) */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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

/* Guest Data - All 27 guests */
const GUEST_DATA = {
    'joe30': {
        name: 'Joe', fullName: 'Joe O\'Brien', room: 'Master Suite',
        team: 'Team Vouvray', nickname: 'His Royal Ancientness',
        missions: [
            { id: 'm1', text: 'Accept at least 3 birthday toasts gracefully', completed: false },
            { id: 'm2', text: 'Dance to Mr. Brightside at your party', completed: false },
            { id: 'm3', text: 'Thank everyone individually by end of trip', completed: false }
        ],
        personalNotes: 'You\'re the star of the show! Just enjoy yourself and let everyone spoil you.'
    },
    'sophie30': {
        name: 'Sophie', fullName: 'Sophie Geen', room: 'Master Suite',
        team: 'Team Chinon', nickname: 'The Control Freak',
        missions: [
            { id: 'm1', text: 'Make sure Joe doesn\'t find out about the surprise activity', completed: false },
            { id: 'm2', text: 'Get a candid photo of Joe laughing', completed: false },
            { id: 'm3', text: 'Lead the birthday toast at dinner', completed: false }
        ],
        personalNotes: 'You\'re on secret keeper duty! The surprise activity on Day 4 must stay hidden.'
    },
    'luke30': {
        name: 'Luke', fullName: 'Luke Recchia', room: 'Room 2',
        team: 'Team Chinon', nickname: 'DJ No-Requests',
        missions: [
            { id: 'm1', text: 'Get everyone dancing at least once', completed: false },
            { id: 'm2', text: 'Challenge Joe to a game and let him win', completed: false },
            { id: 'm3', text: 'Start a spontaneous sing-along', completed: false }
        ],
        personalNotes: 'You\'re in charge of party vibes! Make sure the music is always on point.'
    },
    'sam30': {
        name: 'Samantha', fullName: 'Samantha Recchia', room: 'Room 2',
        team: 'Team Vouvray', nickname: 'The Paparazzi',
        missions: [
            { id: 'm1', text: 'Take at least 50 group photos', completed: false },
            { id: 'm2', text: 'Create a mini photo montage by end of trip', completed: false },
            { id: 'm3', text: 'Capture Joe\'s reaction to his birthday surprise', completed: false }
        ],
        personalNotes: 'You\'re the unofficial photographer - capture all the memories!'
    },
    'hannah30': {
        name: 'Hannah', fullName: 'Hannah O\'Brien', room: 'Room 3',
        team: 'Team Chinon', nickname: 'The Snitch',
        missions: [
            { id: 'm1', text: 'Share an embarrassing childhood story about Joe', completed: false },
            { id: 'm2', text: 'Make sure Joe\'s birthday cake is perfect', completed: false },
            { id: 'm3', text: 'Get a sibling photo with Joe', completed: false }
        ],
        personalNotes: 'Sibling duty: bring the embarrassing stories and the love!'
    },
    'robin30': {
        name: 'Robin', fullName: 'Robin Hughes', room: 'Room 3',
        team: 'Team Vouvray', nickname: 'The Liability',
        missions: [
            { id: 'm1', text: 'Suggest a spontaneous adventure', completed: false },
            { id: 'm2', text: 'Be first in the pool at least once', completed: false },
            { id: 'm3', text: 'Teach someone a new skill', completed: false }
        ],
        personalNotes: 'Bring the adventure energy! Suggest something fun and spontaneous.'
    },
    'johnny30': {
        name: 'Johnny', fullName: 'Johnny Gates O\'Brien', room: 'Room 4',
        team: 'Team Sancerre', nickname: 'Thinks He\'s Funny',
        missions: [
            { id: 'm1', text: 'Tell at least 5 jokes (good or bad)', completed: false },
            { id: 'm2', text: 'Do an impression of Joe', completed: false },
            { id: 'm3', text: 'Win one game/competition', completed: false }
        ],
        personalNotes: 'You\'re the entertainment - keep the laughs coming!'
    },
    'florrie30': {
        name: 'Florrie', fullName: 'Florrie Gates O\'Brien', room: 'Room 4',
        team: 'Team Vouvray', nickname: 'The Loud One',
        missions: [
            { id: 'm1', text: 'Lead a group cheer for Joe', completed: false },
            { id: 'm2', text: 'Help decorate for the birthday dinner', completed: false },
            { id: 'm3', text: 'Make everyone feel included', completed: false }
        ],
        personalNotes: 'Spread the good vibes and make sure everyone feels part of the celebration!'
    },
    'razon30': {
        name: 'Razon', fullName: 'Razon Mahebub', room: 'Room 5',
        team: 'Team Muscadet', nickname: 'The Schemer',
        missions: [
            { id: 'm1', text: 'Win a strategy game', completed: false },
            { id: 'm2', text: 'Help plan a surprise moment', completed: false },
            { id: 'm3', text: 'Share a heartfelt toast', completed: false }
        ],
        personalNotes: 'Put those strategic skills to use - help make the surprises work!'
    },
    'neeve30': {
        name: 'Neeve', fullName: 'Neeve Fletcher', room: 'Room 5',
        team: 'Team Chinon', nickname: 'The Hangry One',
        missions: [
            { id: 'm1', text: 'Find the best local cheese', completed: false },
            { id: 'm2', text: 'Help with one group meal', completed: false },
            { id: 'm3', text: 'Create a signature cocktail for the trip', completed: false }
        ],
        personalNotes: 'You\'re the culinary guide - find us the best food and drinks!'
    },
    'george30': {
        name: 'George', fullName: 'George Heyworth', room: 'Room 6',
        team: 'Team Muscadet', nickname: 'The Foghorn',
        missions: [
            { id: 'm1', text: 'Start a chant at the birthday dinner', completed: false },
            { id: 'm2', text: 'Be the last one standing at the party', completed: false },
            { id: 'm3', text: 'Give a speech (even a short one)', completed: false }
        ],
        personalNotes: 'Bring the ENERGY! Get everyone hyped for Joe\'s big day.'
    },
    'emmaw30': {
        name: 'Emma W', fullName: 'Emma Winup', room: 'Room 6',
        team: 'Team Sancerre', nickname: 'Spreadsheet Queen',
        missions: [
            { id: 'm1', text: 'Make sure activities run on time', completed: false },
            { id: 'm2', text: 'Help coordinate the group photo', completed: false },
            { id: 'm3', text: 'Create a mini itinerary for one activity', completed: false }
        ],
        personalNotes: 'Your organisational skills are needed - help keep things running smoothly!'
    },
    'tom30': {
        name: 'Tom', fullName: 'Tom Heyworth', room: 'Room 7',
        team: 'Team Vouvray', nickname: 'The Exaggerator',
        missions: [
            { id: 'm1', text: 'Tell a "remember when" story about Joe', completed: false },
            { id: 'm2', text: 'Document at least one funny moment', completed: false },
            { id: 'm3', text: 'Participate in the roast (lovingly!)', completed: false }
        ],
        personalNotes: 'Bring the stories! Joe\'s 30th needs some legendary tales.'
    },
    'robert30': {
        name: 'Robert', fullName: 'Robert Winup', room: 'Room 7',
        team: 'Team Sancerre', nickname: 'The Wine Snob',
        missions: [
            { id: 'm1', text: 'Recommend the best wine at tasting', completed: false },
            { id: 'm2', text: 'Teach someone something about wine', completed: false },
            { id: 'm3', text: 'Toast to Joe with a great wine pick', completed: false }
        ],
        personalNotes: 'Share your wine wisdom! Help everyone appreciate the Loire Valley.'
    },
    'sarah30': {
        name: 'Sarah', fullName: 'Sarah', room: 'Room 8',
        team: 'Team Muscadet', nickname: 'The Gossip',
        missions: [
            { id: 'm1', text: 'Introduce two people who haven\'t met', completed: false },
            { id: 'm2', text: 'Start a conversation game', completed: false },
            { id: 'm3', text: 'Make someone new feel welcome', completed: false }
        ],
        personalNotes: 'Help everyone mingle and connect - be the social glue!'
    },
    'kiran30': {
        name: 'Kiran', fullName: 'Kiran Ruparelia', room: 'Room 8',
        team: 'Team Sancerre', nickname: 'Last Man Standing',
        missions: [
            { id: 'm1', text: 'Be part of a late-night chat', completed: false },
            { id: 'm2', text: 'Suggest a midnight activity', completed: false },
            { id: 'm3', text: 'Keep the party going when others flag', completed: false }
        ],
        personalNotes: 'You\'re the after-hours entertainment - keep the night alive!'
    },
    'shane30': {
        name: 'Shane', fullName: 'Shane Pallian', room: 'Room 9',
        team: 'Team Chinon', nickname: 'The Sore Loser',
        missions: [
            { id: 'm1', text: 'Win at least one game/challenge', completed: false },
            { id: 'm2', text: 'Challenge Joe to something competitive', completed: false },
            { id: 'm3', text: 'Be a gracious winner OR loser', completed: false }
        ],
        personalNotes: 'Bring the competitive spirit! Make the games exciting.'
    },
    'oli30': {
        name: 'Oli', fullName: 'Oli Moran', room: 'Room 9',
        team: 'Team Anjou', nickname: 'The Horizontal One',
        missions: [
            { id: 'm1', text: 'Keep everyone calm if things get hectic', completed: false },
            { id: 'm2', text: 'Suggest a relaxing activity', completed: false },
            { id: 'm3', text: 'Give Joe some genuine birthday wisdom', completed: false }
        ],
        personalNotes: 'Balance out the chaos with some chill vibes when needed.'
    },
    'peter30': {
        name: 'Peter', fullName: 'Peter London', room: 'Room 10',
        team: 'Team Anjou', nickname: 'The Loose Cannon',
        missions: [
            { id: 'm1', text: 'Do something unexpected', completed: false },
            { id: 'm2', text: 'Suggest a bold activity', completed: false },
            { id: 'm3', text: 'Make Joe laugh really hard', completed: false }
        ],
        personalNotes: 'Be unpredictable! Bring the surprises.'
    },
    'emmal30': {
        name: 'Emma L', fullName: 'Emma Levett', room: 'Room 10',
        team: 'Team Muscadet', nickname: 'The Pinterest Addict',
        missions: [
            { id: 'm1', text: 'Help with decorations or presentation', completed: false },
            { id: 'm2', text: 'Create a small handmade gift/card', completed: false },
            { id: 'm3', text: 'Document the trip artistically', completed: false }
        ],
        personalNotes: 'Bring your creative touch to make things special!'
    },
    'jonnyl30': {
        name: 'Jonny L', fullName: 'Jonny Levett', room: 'Room 11',
        team: 'Team Sancerre', nickname: 'The Menace',
        missions: [
            { id: 'm1', text: 'Pull a harmless prank', completed: false },
            { id: 'm2', text: 'Keep the jokes coming all week', completed: false },
            { id: 'm3', text: 'Make Joe genuinely crack up', completed: false }
        ],
        personalNotes: 'Comedy is your mission - bring the laughs!'
    },
    'jonnyw30': {
        name: 'Jonny W', fullName: 'Jonny Williams', room: 'Room 11',
        team: 'Team Vouvray', nickname: 'Self-Proclaimed Legend',
        missions: [
            { id: 'm1', text: 'Share a classic Joe story', completed: false },
            { id: 'm2', text: 'Help with the birthday toast', completed: false },
            { id: 'm3', text: 'Create a memorable moment', completed: false }
        ],
        personalNotes: 'Bring the legendary energy!'
    },
    'will30': {
        name: 'Will', fullName: 'Will Turner', room: 'Room 12',
        team: 'Team Anjou', nickname: 'Captain Obvious',
        missions: [
            { id: 'm1', text: 'Lead a group activity', completed: false },
            { id: 'm2', text: 'Make sure no one gets left behind', completed: false },
            { id: 'm3', text: 'Give a captain\'s toast', completed: false }
        ],
        personalNotes: 'Take charge when needed - you\'re a natural leader!'
    },
    'chris30': {
        name: 'Chris', fullName: 'Chris Coggin', room: 'Room 12',
        team: 'Team Muscadet', nickname: 'The Quiet Assassin',
        missions: [
            { id: 'm1', text: 'Be dependable when things are needed', completed: false },
            { id: 'm2', text: 'Help with setup/cleanup', completed: false },
            { id: 'm3', text: 'Support someone who needs it', completed: false }
        ],
        personalNotes: 'You\'re the reliable one - help keep things running!'
    },
    'oscar30': {
        name: 'Oscar', fullName: 'Oscar Walters', room: 'Room 13',
        team: 'Team Anjou', nickname: 'The Bad Influence',
        missions: [
            { id: 'm1', text: 'Get the party started at least once', completed: false },
            { id: 'm2', text: 'Lead a drinking game', completed: false },
            { id: 'm3', text: 'Be on the dance floor first', completed: false }
        ],
        personalNotes: 'When energy is needed, you\'re the spark!'
    },
    'matt30': {
        name: 'Matt', fullName: 'Matt Hill', room: 'Room 13',
        team: 'Team Anjou', nickname: 'The Diplomat',
        missions: [
            { id: 'm1', text: 'Keep conversations flowing', completed: false },
            { id: 'm2', text: 'Help resolve any friendly disputes', completed: false },
            { id: 'm3', text: 'Be the voice of reason when needed', completed: false }
        ],
        personalNotes: 'Keep the peace and keep things smooth!'
    },
    'pranay30': {
        name: 'Pranay', fullName: 'Pranay Dube', room: 'Room 14',
        team: 'Team Chinon', nickname: 'The Human Puppy',
        missions: [
            { id: 'm1', text: 'Be enthusiastic about every activity', completed: false },
            { id: 'm2', text: 'Encourage others to join in', completed: false },
            { id: 'm3', text: 'Give Joe an enthusiastic birthday hug', completed: false }
        ],
        personalNotes: 'Bring the enthusiasm - your energy is contagious!'
    }
};

/* Players mapped to teams (for leaderboard) */
const PLAYERS = {
    'Joe': 'vouvray', 'Sam': 'vouvray', 'Robin': 'vouvray',
    'Florrie': 'vouvray', 'Tom': 'vouvray', 'Jonny W': 'vouvray',
    'Sophie': 'chinon', 'Luke': 'chinon', 'Hannah': 'chinon',
    'Neeve': 'chinon', 'Shane': 'chinon', 'Pranay': 'chinon',
    'Johnny': 'sancerre', 'Emma W': 'sancerre', 'Jonny L': 'sancerre',
    'Robert': 'sancerre', 'Kiran': 'sancerre',
    'George': 'muscadet', 'Razon': 'muscadet', 'Emma L': 'muscadet',
    'Sarah': 'muscadet', 'Chris': 'muscadet',
    'Peter': 'anjou', 'Oli': 'anjou', 'Oscar': 'anjou',
    'Will': 'anjou', 'Matt': 'anjou'
};

/* Reveal Date — teams & nicknames hidden until this date */
const REVEAL_DATE = new Date('2026-04-26T00:00:00');

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
        return ['joe30', 'sophie30', 'hannah30'].includes(this.getGuestCode());
    },
    getGuestData() {
        return GUEST_DATA[this.getGuestCode()];
    },
    getGuestName() {
        const guest = this.getGuestData();
        return guest ? guest.name : 'Guest';
    },
    checkAuth() {
        // On non-home pages, redirect to index if not site-authenticated
        const isHomePage = window.location.pathname.endsWith('index.html') ||
                           window.location.pathname.endsWith('/');
        if (!isHomePage) {
            // If password protection was set and not authenticated, redirect
            const siteAuth = localStorage.getItem('siteAuthenticated');
            // Only redirect if site password was actually set (we check this loosely)
            // Guest login is optional, so we don't force redirect for that
        }
    }
};

/* Confetti Animation */
function triggerConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confetti = [];
    const colors = ['#FF6B9D', '#7C3AED', '#FFD93D', '#6BCB77', '#4ECDC4', '#FF6B6B'];
    const confettiCount = 150;

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
    const duration = 4000;

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
            if (particle.y > canvas.height) {
                particle.y = -20;
                particle.x = Math.random() * canvas.width;
            }
        });
        animationId = requestAnimationFrame(animate);
    }
    animate();

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

function triggerMiniConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

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
        animationId = requestAnimationFrame(animate);
    }
    animate();
}

/* Scroll Reveal */
function initScrollReveal() {
    const sections = document.querySelectorAll('.section');
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
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

/* Confetti Cannon Button */
function initConfettiCannon() {
    const cannon = document.getElementById('confetti-cannon');
    if (!cannon) return;

    cannon.addEventListener('click', function () {
        triggerConfetti();
        this.style.transform = 'scale(0.9)';
        setTimeout(() => { this.style.transform = ''; }, 100);
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

/* Initialize shared components on every page */
document.addEventListener('DOMContentLoaded', function () {
    // Apply saved dark mode
    initDarkMode();
    // Apply saved theme
    initThemeSwitcher();
    // Scroll reveal for sections
    initScrollReveal();
    // Confetti cannon button
    initConfettiCannon();
    // Update nav with guest name
    updateNavGuest();
    // Admin guest preview toggle
    initGuestPreview();
});

/* Update nav to show guest name */
function updateNavGuest() {
    const guestNameEl = document.getElementById('nav-guest-name');
    if (guestNameEl && Auth.isLoggedIn()) {
        guestNameEl.textContent = 'Hi, ' + Auth.getGuestName();
        guestNameEl.style.display = 'inline-block';
    }
}
