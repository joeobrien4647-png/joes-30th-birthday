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
        team: 'Team 1', nickname: 'His Royal Ancientness',
        missions: [
            { id: 'm1', text: 'Accept at least 3 birthday toasts gracefully', completed: false },
            { id: 'm2', text: 'Dance to Mr. Brightside at your party', completed: false },
            { id: 'm3', text: 'Thank everyone individually by end of trip', completed: false }
        ],
        personalNotes: 'You\'re the star of the show! Just enjoy yourself and let everyone spoil you.'
    },
    'sophie30': {
        name: 'Sophie', fullName: 'Sophie Geen', room: 'Master Suite',
        team: 'Team 1', nickname: 'The Control Freak',
        missions: [
            { id: 'm1', text: 'Make sure Joe doesn\'t find out about the surprise activity', completed: false },
            { id: 'm2', text: 'Get a candid photo of Joe laughing', completed: false },
            { id: 'm3', text: 'Lead the birthday toast at dinner', completed: false }
        ],
        personalNotes: 'You\'re on secret keeper duty! The surprise activity on Day 4 must stay hidden.'
    },
    'luke30': {
        name: 'Luke', fullName: 'Luke Recchia', room: 'Room 2',
        team: 'Team 2', nickname: 'DJ No-Requests',
        missions: [
            { id: 'm1', text: 'Get everyone dancing at least once', completed: false },
            { id: 'm2', text: 'Challenge Joe to a game and let him win', completed: false },
            { id: 'm3', text: 'Start a spontaneous sing-along', completed: false }
        ],
        personalNotes: 'You\'re in charge of party vibes! Make sure the music is always on point.'
    },
    'sam30': {
        name: 'Samantha', fullName: 'Samantha Recchia', room: 'Room 2',
        team: 'Team 2', nickname: 'The Paparazzi',
        missions: [
            { id: 'm1', text: 'Take at least 50 group photos', completed: false },
            { id: 'm2', text: 'Create a mini photo montage by end of trip', completed: false },
            { id: 'm3', text: 'Capture Joe\'s reaction to his birthday surprise', completed: false }
        ],
        personalNotes: 'You\'re the unofficial photographer - capture all the memories!'
    },
    'hannah30': {
        name: 'Hannah', fullName: 'Hannah O\'Brien', room: 'Room 3',
        team: 'Team 1', nickname: 'The Snitch',
        missions: [
            { id: 'm1', text: 'Share an embarrassing childhood story about Joe', completed: false },
            { id: 'm2', text: 'Make sure Joe\'s birthday cake is perfect', completed: false },
            { id: 'm3', text: 'Get a sibling photo with Joe', completed: false }
        ],
        personalNotes: 'Sibling duty: bring the embarrassing stories and the love!'
    },
    'robin30': {
        name: 'Robin', fullName: 'Robin Hughes', room: 'Room 3',
        team: 'Team 3', nickname: 'The Liability',
        missions: [
            { id: 'm1', text: 'Suggest a spontaneous adventure', completed: false },
            { id: 'm2', text: 'Be first in the pool at least once', completed: false },
            { id: 'm3', text: 'Teach someone a new skill', completed: false }
        ],
        personalNotes: 'Bring the adventure energy! Suggest something fun and spontaneous.'
    },
    'johnny30': {
        name: 'Johnny', fullName: 'Johnny Gates O\'Brien', room: 'Room 4',
        team: 'Team 2', nickname: 'Thinks He\'s Funny',
        missions: [
            { id: 'm1', text: 'Tell at least 5 jokes (good or bad)', completed: false },
            { id: 'm2', text: 'Do an impression of Joe', completed: false },
            { id: 'm3', text: 'Win one game/competition', completed: false }
        ],
        personalNotes: 'You\'re the entertainment - keep the laughs coming!'
    },
    'florrie30': {
        name: 'Florrie', fullName: 'Florrie Gates O\'Brien', room: 'Room 4',
        team: 'Team 3', nickname: 'The Loud One',
        missions: [
            { id: 'm1', text: 'Lead a group cheer for Joe', completed: false },
            { id: 'm2', text: 'Help decorate for the birthday dinner', completed: false },
            { id: 'm3', text: 'Make everyone feel included', completed: false }
        ],
        personalNotes: 'Spread the good vibes and make sure everyone feels part of the celebration!'
    },
    'razon30': {
        name: 'Razon', fullName: 'Razon Mahebub', room: 'Room 5',
        team: 'Team 1', nickname: 'The Schemer',
        missions: [
            { id: 'm1', text: 'Win a strategy game', completed: false },
            { id: 'm2', text: 'Help plan a surprise moment', completed: false },
            { id: 'm3', text: 'Share a heartfelt toast', completed: false }
        ],
        personalNotes: 'Put those strategic skills to use - help make the surprises work!'
    },
    'neeve30': {
        name: 'Neeve', fullName: 'Neeve Fletcher', room: 'Room 5',
        team: 'Team 2', nickname: 'The Hangry One',
        missions: [
            { id: 'm1', text: 'Find the best local cheese', completed: false },
            { id: 'm2', text: 'Help with one group meal', completed: false },
            { id: 'm3', text: 'Create a signature cocktail for the trip', completed: false }
        ],
        personalNotes: 'You\'re the culinary guide - find us the best food and drinks!'
    },
    'george30': {
        name: 'George', fullName: 'George Heyworth', room: 'Room 6',
        team: 'Team 2', nickname: 'The Foghorn',
        missions: [
            { id: 'm1', text: 'Start a chant at the birthday dinner', completed: false },
            { id: 'm2', text: 'Be the last one standing at the party', completed: false },
            { id: 'm3', text: 'Give a speech (even a short one)', completed: false }
        ],
        personalNotes: 'Bring the ENERGY! Get everyone hyped for Joe\'s big day.'
    },
    'emmaw30': {
        name: 'Emma W', fullName: 'Emma Winup', room: 'Room 6',
        team: 'Team 1', nickname: 'Spreadsheet Queen',
        missions: [
            { id: 'm1', text: 'Make sure activities run on time', completed: false },
            { id: 'm2', text: 'Help coordinate the group photo', completed: false },
            { id: 'm3', text: 'Create a mini itinerary for one activity', completed: false }
        ],
        personalNotes: 'Your organisational skills are needed - help keep things running smoothly!'
    },
    'tom30': {
        name: 'Tom', fullName: 'Tom Heyworth', room: 'Room 7',
        team: 'Team 2', nickname: 'The Exaggerator',
        missions: [
            { id: 'm1', text: 'Tell a "remember when" story about Joe', completed: false },
            { id: 'm2', text: 'Document at least one funny moment', completed: false },
            { id: 'm3', text: 'Participate in the roast (lovingly!)', completed: false }
        ],
        personalNotes: 'Bring the stories! Joe\'s 30th needs some legendary tales.'
    },
    'robert30': {
        name: 'Robert', fullName: 'Robert Winup', room: 'Room 7',
        team: 'Team 3', nickname: 'The Wine Snob',
        missions: [
            { id: 'm1', text: 'Recommend the best wine at tasting', completed: false },
            { id: 'm2', text: 'Teach someone something about wine', completed: false },
            { id: 'm3', text: 'Toast to Joe with a great wine pick', completed: false }
        ],
        personalNotes: 'Share your wine wisdom! Help everyone appreciate the Loire Valley.'
    },
    'sarah30': {
        name: 'Sarah', fullName: 'Sarah', room: 'Room 8',
        team: 'Team 1', nickname: 'The Gossip',
        missions: [
            { id: 'm1', text: 'Introduce two people who haven\'t met', completed: false },
            { id: 'm2', text: 'Start a conversation game', completed: false },
            { id: 'm3', text: 'Make someone new feel welcome', completed: false }
        ],
        personalNotes: 'Help everyone mingle and connect - be the social glue!'
    },
    'kiran30': {
        name: 'Kiran', fullName: 'Kiran Ruparelia', room: 'Room 8',
        team: 'Team 2', nickname: 'Last Man Standing',
        missions: [
            { id: 'm1', text: 'Be part of a late-night chat', completed: false },
            { id: 'm2', text: 'Suggest a midnight activity', completed: false },
            { id: 'm3', text: 'Keep the party going when others flag', completed: false }
        ],
        personalNotes: 'You\'re the after-hours entertainment - keep the night alive!'
    },
    'shane30': {
        name: 'Shane', fullName: 'Shane Pallian', room: 'Room 9',
        team: 'Team 3', nickname: 'The Sore Loser',
        missions: [
            { id: 'm1', text: 'Win at least one game/challenge', completed: false },
            { id: 'm2', text: 'Challenge Joe to something competitive', completed: false },
            { id: 'm3', text: 'Be a gracious winner OR loser', completed: false }
        ],
        personalNotes: 'Bring the competitive spirit! Make the games exciting.'
    },
    'oli30': {
        name: 'Oli', fullName: 'Oli Moran', room: 'Room 9',
        team: 'Team 1', nickname: 'The Horizontal One',
        missions: [
            { id: 'm1', text: 'Keep everyone calm if things get hectic', completed: false },
            { id: 'm2', text: 'Suggest a relaxing activity', completed: false },
            { id: 'm3', text: 'Give Joe some genuine birthday wisdom', completed: false }
        ],
        personalNotes: 'Balance out the chaos with some chill vibes when needed.'
    },
    'peter30': {
        name: 'Peter', fullName: 'Peter London', room: 'Room 10',
        team: 'Team 2', nickname: 'The Loose Cannon',
        missions: [
            { id: 'm1', text: 'Do something unexpected', completed: false },
            { id: 'm2', text: 'Suggest a bold activity', completed: false },
            { id: 'm3', text: 'Make Joe laugh really hard', completed: false }
        ],
        personalNotes: 'Be unpredictable! Bring the surprises.'
    },
    'emmal30': {
        name: 'Emma L', fullName: 'Emma Levett', room: 'Room 10',
        team: 'Team 3', nickname: 'The Pinterest Addict',
        missions: [
            { id: 'm1', text: 'Help with decorations or presentation', completed: false },
            { id: 'm2', text: 'Create a small handmade gift/card', completed: false },
            { id: 'm3', text: 'Document the trip artistically', completed: false }
        ],
        personalNotes: 'Bring your creative touch to make things special!'
    },
    'jonnyl30': {
        name: 'Jonny L', fullName: 'Jonny Levett', room: 'Room 11',
        team: 'Team 1', nickname: 'The Menace',
        missions: [
            { id: 'm1', text: 'Pull a harmless prank', completed: false },
            { id: 'm2', text: 'Keep the jokes coming all week', completed: false },
            { id: 'm3', text: 'Make Joe genuinely crack up', completed: false }
        ],
        personalNotes: 'Comedy is your mission - bring the laughs!'
    },
    'jonnyw30': {
        name: 'Jonny W', fullName: 'Jonny Williams', room: 'Room 11',
        team: 'Team 2', nickname: 'Self-Proclaimed Legend',
        missions: [
            { id: 'm1', text: 'Share a classic Joe story', completed: false },
            { id: 'm2', text: 'Help with the birthday toast', completed: false },
            { id: 'm3', text: 'Create a memorable moment', completed: false }
        ],
        personalNotes: 'Bring the legendary energy!'
    },
    'chris30': {
        name: 'Chris', fullName: 'Chris Coggin', room: 'Room 12',
        team: 'Team 1', nickname: 'The Quiet Assassin',
        missions: [
            { id: 'm1', text: 'Be dependable when things are needed', completed: false },
            { id: 'm2', text: 'Help with setup/cleanup', completed: false },
            { id: 'm3', text: 'Support someone who needs it', completed: false }
        ],
        personalNotes: 'You\'re the reliable one - help keep things running!'
    },
    'oscar30': {
        name: 'Oscar', fullName: 'Oscar Walters', room: 'Room 13',
        team: 'Team 2', nickname: 'The Bad Influence',
        missions: [
            { id: 'm1', text: 'Get the party started at least once', completed: false },
            { id: 'm2', text: 'Lead a drinking game', completed: false },
            { id: 'm3', text: 'Be on the dance floor first', completed: false }
        ],
        personalNotes: 'When energy is needed, you\'re the spark!'
    },
    'pranay30': {
        name: 'Pranay', fullName: 'Pranay Dube', room: 'Room 14',
        team: 'Team 1', nickname: 'The Human Puppy',
        missions: [
            { id: 'm1', text: 'Be enthusiastic about every activity', completed: false },
            { id: 'm2', text: 'Encourage others to join in', completed: false },
            { id: 'm3', text: 'Give Joe an enthusiastic birthday hug', completed: false }
        ],
        personalNotes: 'Bring the enthusiasm - your energy is contagious!'
    }
};

/* Players mapped to teams (for leaderboard) — TODO: assign real teams before trip */
const PLAYERS = {
    'Joe': 'team1', 'Sophie': 'team1', 'Hannah': 'team1',
    'Razon': 'team1', 'Emma W': 'team1', 'Sarah': 'team1', 'Oli': 'team1',
    'Jonny L': 'team2', 'Chris': 'team2', 'Pranay': 'team2',
    'Luke': 'team2', 'Sam': 'team2', 'Johnny': 'team2', 'Neeve': 'team2',
    'Tom': 'team3', 'Kiran': 'team3', 'George': 'team3',
    'Peter': 'team3', 'Jonny W': 'team3', 'Oscar': 'team3', 'Robin': 'team3',
    'Florrie': 'team4', 'Robert': 'team4', 'Emma L': 'team4',
    'Shane': 'team4'
};

/* Reveal Date — teams & nicknames hidden until arrival night */
const REVEAL_DATE = new Date('2026-04-29T22:00:00');

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

/* Initialize shared components on every page */
document.addEventListener('DOMContentLoaded', function () {
    // Page transition
    initPageTransition();
    // Apply saved dark mode
    initDarkMode();
    // Auto dark mode (time-based)
    autoDarkMode();
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
