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

/* Utility: Get/set guest profile photo (Firebase-backed with localStorage fallback) */
function getGuestPhoto(name) {
    // Prefer Firebase-synced URL
    if (typeof ProfileSync !== 'undefined' && ProfileSync.isConfigured()) {
        var fbPhoto = ProfileSync.getPhoto(name);
        if (fbPhoto) return fbPhoto;
    }
    return Store.getRaw('guestPhoto_' + slugify(name));
}
function setGuestPhoto(name, dataUrl) {
    // Always keep localStorage copy as fallback
    try { Store.setRaw('guestPhoto_' + slugify(name), dataUrl); }
    catch(e) { /* quota exceeded */ }
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
  var stored = localStorage.getItem(AUTH_KEYS.pwHash);
  // If no local hash, try Firebase
  if (!stored && typeof ProfileSync !== 'undefined' && ProfileSync.isConfigured()) {
    var code = localStorage.getItem(AUTH_KEYS.guestCode);
    if (code && typeof GUEST_DATA !== 'undefined' && GUEST_DATA[code]) {
      var slug = GUEST_DATA[code].fullName.toLowerCase().replace(/['']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      var profile = ProfileSync.getAll()[slug];
      if (profile && profile.pwHash) {
        stored = profile.pwHash;
        // Cache locally for next time
        localStorage.setItem(AUTH_KEYS.pwHash, stored);
        localStorage.setItem(AUTH_KEYS.registered, 'true');
      }
    }
  }
  if (!stored) return false;
  const hash = await hashPassword(password);
  return hash === stored;
}

function isFirstTimeVisitor() {
  var localReg = localStorage.getItem(AUTH_KEYS.registered);
  if (localReg) return false;
  // Check Firebase for existing registration
  var code = localStorage.getItem(AUTH_KEYS.guestCode);
  if (code && typeof ProfileSync !== 'undefined' && ProfileSync.isConfigured() && typeof GUEST_DATA !== 'undefined' && GUEST_DATA[code]) {
    var slug = GUEST_DATA[code].fullName.toLowerCase().replace(/['']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    var profile = ProfileSync.getAll()[slug];
    if (profile && profile.registered) {
      localStorage.setItem(AUTH_KEYS.registered, 'true');
      if (profile.pwHash) localStorage.setItem(AUTH_KEYS.pwHash, profile.pwHash);
      return false;
    }
  }
  return true;
}

/* Guest Data - 24 guests + 1 toddler (Shane + Pranay no longer attending) */
const GUEST_DATA = {
    'JOE-7K9X': { name: 'Joe', fullName: 'Joe O\'Brien', room: 'Master Suite', team: 'TBA', nickname: 'TBA' },
    'SOPHIE-M3P2': { name: 'Sophie', fullName: 'Sophie Geen', room: 'Master Suite', team: 'TBA', nickname: 'TBA' },
    'LUKE-4WN8': { name: 'Luke', fullName: 'Luke Recchia', room: 'Room 2', team: 'TBA', nickname: 'TBA' },
    'SAM-R6DQ': { name: 'Samantha', fullName: 'Samantha Recchia', room: 'Room 2', team: 'TBA', nickname: 'TBA' },
    'HANNAH-8FJ3': { name: 'Hannah', fullName: 'Hannah O\'Brien', room: 'Room 3', team: 'TBA', nickname: 'TBA' },
    'ROBIN-2VL5': { name: 'Robin', fullName: 'Robin Hughes', room: 'Room 3', team: 'TBA', nickname: 'TBA' },
    'JOHNNY-9XT4': { name: 'Johnny', fullName: 'Johnny Gates O\'Brien', room: 'Room 4', team: 'TBA', nickname: 'TBA' },
    'FLORRIE-5HK7': { name: 'Florrie', fullName: 'Florrie Gates O\'Brien', room: 'Room 4', team: 'TBA', nickname: 'TBA' },
    'RAZON-3BM6': { name: 'Razon', fullName: 'Razon Mahebub', room: 'Room 5', team: 'TBA', nickname: 'TBA' },
    'NEEVE-6PW2': { name: 'Neeve', fullName: 'Neeve Fletcher', room: 'Room 5', team: 'TBA', nickname: 'TBA' },
    'GEORGE-1CY9': { name: 'George', fullName: 'George Heyworth', room: 'Room 6', team: 'TBA', nickname: 'TBA' },
    'EMMAW-8RJ4': { name: 'Emma W', fullName: 'Emma Winup', room: 'Room 6', team: 'TBA', nickname: 'TBA' },
    'TOM-5QL7': { name: 'Tom', fullName: 'Tom Heyworth', room: 'Room 7', team: 'TBA', nickname: 'TBA' },
    'ROBERT-2NG8': { name: 'Robert', fullName: 'Robert Winup', room: 'Room 7', team: 'TBA', nickname: 'TBA' },
    'SARAH-4KV3': { name: 'Sarah', fullName: 'Sarah Shamia', room: 'Room 8', team: 'TBA', nickname: 'TBA' },
    'KIRAN-7DX1': { name: 'Kiran', fullName: 'Kiran Ruparelia', room: 'Room 9', team: 'TBA', nickname: 'TBA' },
    'OLI-3WT5': { name: 'Oli', fullName: 'Oli Moran', room: 'Room 10', team: 'TBA', nickname: 'TBA' },
    'PETER-6BN2': { name: 'Peter', fullName: 'Peter London', room: 'Room 10', team: 'TBA', nickname: 'TBA' },
    'JONNYW-8HQ3': { name: 'Jonny W', fullName: 'Jonny Williams', room: 'Room 12', team: 'TBA', nickname: 'TBA' },
    'CHRIS-2FM7': { name: 'Chris', fullName: 'Chris Coggin', room: 'Room 9', team: 'TBA', nickname: 'TBA' },
    'OSCAR-5DL4': { name: 'Oscar', fullName: 'Oscar Walters', room: 'Room 12', team: 'TBA', nickname: 'TBA' },
    'MATT-3B7K': { name: 'Matt', fullName: 'Matt Hill', room: 'Room 12', team: 'TBA', nickname: 'TBA' }
};

/* Players mapped to teams (for leaderboard) */
const PLAYERS = {
    'Joe': 'titans', 'Samantha': 'titans', 'Robin': 'titans', 'Kiran': 'titans', 'Oscar': 'titans', 'Chris': 'titans',
    'Razon': 'spartans', 'Sophie': 'spartans', 'Robert': 'spartans', 'Florrie': 'spartans', 'Jonny W': 'spartans', 'Matt': 'spartans',
    'Hannah': 'vikings', 'George': 'vikings', 'Neeve': 'vikings', 'Oli': 'vikings',
    'Peter': 'gladiators', 'Johnny': 'gladiators', 'Tom': 'gladiators', 'Sarah': 'gladiators', 'Emma W': 'gladiators', 'Luke': 'gladiators'
};

/* Team Configuration */
const TEAM_CONFIG = {
    titans: {
        name: 'Titans',
        color: '#f9a825',
        darkColor: '#f57f17',
        captain: 'Joe',
        logo: '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M20 2 L24 15 L38 15 L27 23 L31 37 L20 29 L9 37 L13 23 L2 15 L16 15 Z" fill="#f9a825" stroke="#c17900" stroke-width="1.5"/><path d="M20 6 L22 14 L16 20 Z" fill="#fff8e1" opacity="0.5"/></svg>'
    },
    spartans: {
        name: 'Spartans',
        color: '#c62828',
        darkColor: '#b71c1c',
        captain: 'Razon',
        logo: '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M20 2 C12 2 6 8 6 16 L6 30 C6 30 12 38 20 38 C28 38 34 30 34 30 L34 16 C34 8 28 2 20 2Z" fill="#c62828" stroke="#8e0000" stroke-width="1.5"/><path d="M16 14 L16 28" stroke="#fff" stroke-width="2" opacity="0.6"/><path d="M24 14 L24 28" stroke="#fff" stroke-width="2" opacity="0.6"/><path d="M13 20 L27 20" stroke="#fff" stroke-width="2" opacity="0.6"/><path d="M20 8 L20 12" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>'
    },
    vikings: {
        name: 'Vikings',
        color: '#1565c0',
        darkColor: '#0d47a1',
        captain: 'Hannah',
        logo: '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M8 18 C8 10 13 4 20 4 C27 4 32 10 32 18 L32 28 L8 28 Z" fill="#1565c0" stroke="#0d47a1" stroke-width="1.5"/><path d="M8 18 L2 10 L8 14" fill="#1565c0" stroke="#0d47a1" stroke-width="1.2"/><path d="M32 18 L38 10 L32 14" fill="#1565c0" stroke="#0d47a1" stroke-width="1.2"/><rect x="12" y="28" width="16" height="4" rx="1" fill="#0d47a1"/><path d="M14 20 L18 20 L16 24 Z" fill="#fff" opacity="0.5"/><path d="M22 20 L26 20 L24 24 Z" fill="#fff" opacity="0.5"/></svg>'
    },
    gladiators: {
        name: 'Gladiators',
        color: '#424242',
        darkColor: '#212121',
        captain: 'Peter',
        logo: '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="17" fill="#2a2a2a" stroke="#616161" stroke-width="1.5"/><path d="M20 5 L20 35" stroke="#e0e0e0" stroke-width="2" opacity="0.8"/><path d="M13 12 L27 12 M10 20 L30 20" stroke="#e0e0e0" stroke-width="1.5" opacity="0.5"/><circle cx="20" cy="20" r="4" fill="none" stroke="#b388ff" stroke-width="1.5" opacity="0.7"/></svg>'
    }
};

const TEAM_CAPTAINS = {
    titans: 'Joe',
    spartans: 'Razon',
    vikings: 'Hannah',
    gladiators: 'Peter'
};

/* ============================================
   Payments — activity + car hire (per guest)
   All values in £. Joe is host (excluded).
   Stansted parking handled separately.
   Source of truth: France-Expense-Tracker-v5.xlsx
   ============================================ */
const PAYMENT_RATES = {
    golf:  { label: 'Golf (Sarrays)',         amount: 42, note: 'Thu 30 Apr · €46 → £42' },
    canoe: { label: 'Canoe (La Fourmy)',      amount: 16, note: 'Fri 1 May · €17 → £16' },
    accro: { label: 'Accrobranche (Laleuf)',  amount: 18, note: 'Sun 3 May · €20 → £18' },
    car:   { label: 'Car Hire (France)',      amount: 60, note: 'Shared across 14 drivers' }
};

const PAYMENT_BANK = {
    sortCode: '60-84-07',
    accountNumber: '41194141',
    accountName: 'Joseph J Z O\'Brien',
    refHint: 'Use your first name as the reference'
};

/* Group food/drink/BBQ kitty — pro-rated by nights at the chateau.
   Source: France-Expense-Tracker-v5.xlsx (Attendance sheet).
   Final amount reconciled after trip from actual receipts. */
const FOOD_KITTY = {
    perNightGBP: 0,           // 0 until reconciled post-trip from receipts
    perNightLow: 15,          // estimate range — display only
    perNightHigh: 20,
    description: 'Groceries, wine, BBQ supplies, shared drinks'
};

/* Daily attendance: [Wed 29, Thu 30, Fri 1, Sat 2, Sun 3, Mon 4]
   Values: 1 = full day, 0.5 = half day, 0 = absent */
const TRIP_DAYS = [
    { date: 'Wed 29', label: 'W', full: 'Wed 29 Apr' },
    { date: 'Thu 30', label: 'T', full: 'Thu 30 Apr' },
    { date: 'Fri 1',  label: 'F', full: 'Fri 1 May' },
    { date: 'Sat 2',  label: 'S', full: 'Sat 2 May' },
    { date: 'Sun 3',  label: 'S', full: 'Sun 3 May' },
    { date: 'Mon 4',  label: 'M', full: 'Mon 4 May' }
];

const GUEST_ATTENDANCE = {
    'JOE-7K9X':     [0.5, 1, 1, 1, 1, 0.5],
    'SOPHIE-M3P2':  [0.5, 1, 1, 1, 1, 0.5],
    'HANNAH-8FJ3':  [0.5, 1, 1, 1, 0.5, 0],
    'ROBIN-2VL5':   [0.5, 1, 1, 1, 0.5, 0],
    'RAZON-3BM6':   [0.5, 1, 1, 1, 1, 0.5],
    'NEEVE-6PW2':   [0.5, 1, 1, 1, 1, 0.5],
    'ROBERT-2NG8':  [0.5, 1, 1, 1, 1, 0.5],
    'SARAH-4KV3':   [0.5, 1, 1, 1, 1, 0.5],
    'KIRAN-7DX1':   [0.5, 1, 1, 1, 1, 0.5],
    'CHRIS-2FM7':   [0.5, 1, 1, 1, 1, 0.5],
    'OLI-3WT5':     [0.5, 1, 1, 1, 1, 0.5],
    'PETER-6BN2':   [0.5, 1, 1, 1, 1, 0.5],
    'TOM-5QL7':     [0.5, 1, 1, 1, 1, 0.5],
    'GEORGE-1CY9':  [0.5, 1, 1, 1, 1, 0.5],
    'EMMAW-8RJ4':   [0.5, 1, 1, 1, 1, 0.5],
    'JONNYW-8HQ3':  [0.5, 1, 1, 1, 1, 0.5],
    'OSCAR-5DL4':   [0.5, 1, 1, 1, 1, 0.5],
    'LUKE-4WN8':    [0, 1, 1, 1, 0.5, 0],
    'SAM-R6DQ':     [0, 1, 1, 1, 0.5, 0],
    'JOHNNY-9XT4':  [0, 0.5, 1, 1, 0.5, 0],
    'FLORRIE-5HK7': [0, 0.5, 1, 1, 0.5, 0],
    'MATT-3B7K':    [0, 0, 0.5, 1, 1, 0.5],
    'EMMAL-1RK8':   [0, 0, 0, 1, 1, 0.5],
    'JONNYL-4VP9':  [0, 0, 0, 1, 1, 0.5]
};

/* Pre-computed per-guest nights (sum of attendance) */
const GUEST_NIGHTS = (function() {
    var out = {};
    Object.keys(GUEST_ATTENDANCE).forEach(function(code) {
        out[code] = GUEST_ATTENDANCE[code].reduce(function(a, b) { return a + b; }, 0);
    });
    return out;
})();

/* Per-guest line items (true = owes that line).
   `paid: { line: true }` marks a specific line as already settled
   (e.g. host Joe paid everything upfront, Sophie & Kiran paid car hire). */
const PAYMENTS = {
    'JOE-7K9X':     { golf: true,  canoe: true,  accro: true,  car: true,  paid: { golf: true, canoe: true, accro: true, car: true } },
    'SOPHIE-M3P2':  { golf: false, canoe: true,  accro: true,  car: true,  paid: { car: true } },
    'HANNAH-8FJ3':  { golf: false, canoe: true,  accro: false, car: true  },
    'ROBIN-2VL5':   { golf: true,  canoe: true,  accro: false, car: true  },
    'RAZON-3BM6':   { golf: false, canoe: true,  accro: true,  car: true  },
    'NEEVE-6PW2':   { golf: false, canoe: true,  accro: true,  car: true  },
    'ROBERT-2NG8':  { golf: false, canoe: true,  accro: true,  car: false },
    'SARAH-4KV3':   { golf: false, canoe: true,  accro: true,  car: true  },
    'KIRAN-7DX1':   { golf: false, canoe: true,  accro: true,  car: true,  paid: { car: true } },
    'CHRIS-2FM7':   { golf: true,  canoe: true,  accro: true,  car: true,  paid: { car: true } },
    'OLI-3WT5':     { golf: true,  canoe: true,  accro: true,  car: true  },
    'PETER-6BN2':   { golf: true,  canoe: true,  accro: true,  car: true  },
    'TOM-5QL7':     { golf: true,  canoe: true,  accro: false, car: false },
    'GEORGE-1CY9':  { golf: false, canoe: true,  accro: true,  car: false },
    'EMMAW-8RJ4':   { golf: false, canoe: true,  accro: true,  car: false },
    'JONNYW-8HQ3':  { golf: false, canoe: true,  accro: true,  car: true,  paid: { car: true } },
    'OSCAR-5DL4':   { golf: false, canoe: false, accro: false, car: true  },
    'LUKE-4WN8':    { golf: false, canoe: true,  accro: false, car: false },
    'SAM-R6DQ':     { golf: false, canoe: true,  accro: false, car: false },
    'JOHNNY-9XT4':  { golf: true,  canoe: false, accro: false, car: false },
    'FLORRIE-5HK7': { golf: false, canoe: false, accro: false, car: false },
    'MATT-3B7K':    { golf: false, canoe: false, accro: true,  car: true  },
    'EMMAL-1RK8':   { golf: false, canoe: false, accro: true,  car: false },
    'JONNYL-4VP9':  { golf: false, canoe: false, accro: true,  car: false }
};

/* Helpers */
function getPaymentLines(guestCode) {
    var record = PAYMENTS[guestCode];
    if (!record) return [];
    var paid = record.paid || {};
    var lines = [];
    Object.keys(PAYMENT_RATES).forEach(function(k) {
        if (record[k]) lines.push({
            key: k,
            label: PAYMENT_RATES[k].label,
            amount: PAYMENT_RATES[k].amount,
            note: PAYMENT_RATES[k].note,
            paid: !!paid[k]
        });
    });
    return lines;
}

function getPaymentTotal(guestCode) {
    /* Outstanding only — excludes already-paid lines */
    return getPaymentLines(guestCode).reduce(function(sum, l) {
        return sum + (l.paid ? 0 : l.amount);
    }, 0);
}

function getPaymentTotalGross(guestCode) {
    /* Full charge, ignoring paid status */
    return getPaymentLines(guestCode).reduce(function(sum, l) { return sum + l.amount; }, 0);
}

function getNights(guestCode) {
    return (typeof GUEST_NIGHTS !== 'undefined' && GUEST_NIGHTS[guestCode]) || 0;
}

function getFoodKittyEstimate(guestCode) {
    var nights = getNights(guestCode);
    if (!nights) return 0;
    return Math.round(nights * FOOD_KITTY.perNightGBP);
}

function getFoodKittyRange(guestCode) {
    var nights = getNights(guestCode);
    if (!nights) return { low: 0, high: 0 };
    return {
        low: Math.round(nights * FOOD_KITTY.perNightLow),
        high: Math.round(nights * FOOD_KITTY.perNightHigh)
    };
}

function getGrandTotalEstimate(guestCode) {
    return getPaymentTotal(guestCode) + getFoodKittyEstimate(guestCode);
}

/* Captain Responsibilities */
const CAPTAIN_DUTIES = [
    'Rally your team for games and challenges',
    'Organise cooking rota shifts and make sure your team shows up',
    'Settle disputes and pick team order for games',
    'Apply face paint and hand out headbands on Day 1',
    'Represent the team in captain-only challenges',
    'Keep team morale and energy high all trip'
];

/* Full name lookup: short name → full name (for leaderboard display) */
const FULL_NAMES = {};
Object.values(GUEST_DATA).forEach(function(g) {
    if (g.name && g.fullName) FULL_NAMES[g.name] = g.fullName;
});

/* Reveal Date — teams & nicknames hidden until arrival night */
const REVEAL_DATE = new Date('2026-04-28T00:00:00+02:00');

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
        banner.innerHTML = '&#128065; GUEST PREVIEW MODE - You are seeing what guests see. ';
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
    const TEAM_NAMES = { titans: 'TIT', spartans: 'SPA', vikings: 'VIK', gladiators: 'GLA' };
    const TEAM_COLORS = { titans: TEAM_CONFIG.titans.color, spartans: TEAM_CONFIG.spartans.color, vikings: TEAM_CONFIG.vikings.color, gladiators: TEAM_CONFIG.gladiators.color };
    const TEAMS = ['titans', 'spartans', 'vikings', 'gladiators'];

    const bar = document.createElement('div');
    bar.className = 'lb-banner';
    bar.id = 'lb-banner';

    function render() {
        const scores = Store.get('lb_teamScores', { titans: 0, spartans: 0, vikings: 0, gladiators: 0 });
        const sorted = TEAMS.slice().sort((a, b) => (scores[b] || 0) - (scores[a] || 0));
        const _c = localStorage.getItem('guestCode') || '';
        const _spunBanner = _c && localStorage.getItem('teamRevealed_' + _c) === 'true';
        const revealed = _spunBanner && (typeof isRevealed === 'function' ? isRevealed() : false);

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
   Install App Banner
   Captures beforeinstallprompt (Android/Chrome)
   and detects iOS for manual instructions.
   ============================================ */
(function() {
    var deferredPrompt = null;
    var bannerDismissed = localStorage.getItem('installBannerDismissed');
    var isStandalone = window.matchMedia('(display-mode: standalone)').matches
        || window.navigator.standalone === true;

    // Already installed or dismissed recently
    if (isStandalone) return;
    if (bannerDismissed) {
        var dismissedAt = parseInt(bannerDismissed, 10);
        // Don't show again for 3 days after dismiss
        if (Date.now() - dismissedAt < 3 * 24 * 60 * 60 * 1000) return;
    }

    var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    var isAndroid = /Android/.test(navigator.userAgent);

    // Capture the install prompt (Chrome/Edge/Samsung)
    window.addEventListener('beforeinstallprompt', function(e) {
        e.preventDefault();
        deferredPrompt = e;
        showBanner('android');
    });

    // On iOS, show after a delay since there's no beforeinstallprompt
    if (isIOS) {
        setTimeout(function() { showBanner('ios'); }, 3000);
    }

    function showBanner(platform) {
        if (document.querySelector('.install-banner')) return;

        var banner = document.createElement('div');
        banner.className = 'install-banner';
        var isIOSPlatform = platform === 'ios';

        banner.innerHTML =
            '<div class="install-banner-inner">' +
                '<div class="install-banner-card">' +
                    '<div class="install-banner-gradient"></div>' +
                    '<div class="install-banner-body">' +
                        '<img class="install-banner-icon" src="images/icon-192.png" alt="App icon">' +
                        '<div class="install-banner-text">' +
                            '<div class="install-banner-title">Get the Joe\'s 30th app</div>' +
                            '<div class="install-banner-desc">' +
                                (isIOSPlatform
                                    ? 'Add to your home screen for the full experience'
                                    : 'Install for push notifications & offline access') +
                            '</div>' +
                        '</div>' +
                        '<div class="install-banner-actions">' +
                            '<button class="install-banner-btn install-banner-btn-primary" id="install-btn">' +
                                (isIOSPlatform ? 'Show me' : 'Install') +
                            '</button>' +
                            '<button class="install-banner-btn install-banner-btn-dismiss" id="install-dismiss">&times;</button>' +
                        '</div>' +
                    '</div>' +
                    '<div class="install-ios-instructions" id="install-ios-steps">' +
                        '<div class="install-ios-step">' +
                            '<span class="install-ios-step-num">1</span>' +
                            '<span>Tap the <strong>Share</strong> button</span>' +
                            '<span class="install-ios-icon">\uD83D\uDCE4</span>' +
                        '</div>' +
                        '<div class="install-ios-step">' +
                            '<span class="install-ios-step-num">2</span>' +
                            '<span>Scroll down and tap <strong>Add to Home Screen</strong></span>' +
                            '<span class="install-ios-icon">+</span>' +
                        '</div>' +
                        '<div class="install-ios-step">' +
                            '<span class="install-ios-step-num">3</span>' +
                            '<span>Tap <strong>Add</strong> — that\'s it!</span>' +
                            '<span class="install-ios-icon">\u2705</span>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';

        document.body.appendChild(banner);

        // Slide in after a frame
        requestAnimationFrame(function() {
            requestAnimationFrame(function() {
                banner.classList.add('visible');
            });
        });

        // Install button
        var installBtn = document.getElementById('install-btn');
        installBtn.addEventListener('click', function() {
            if (isIOSPlatform) {
                // Toggle iOS instructions
                var steps = document.getElementById('install-ios-steps');
                steps.classList.toggle('show');
                installBtn.textContent = steps.classList.contains('show') ? 'Got it' : 'Show me';
                if (!steps.classList.contains('show')) {
                    dismissBanner(banner);
                }
            } else if (deferredPrompt) {
                // Trigger native Chrome install
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then(function(result) {
                    deferredPrompt = null;
                    dismissBanner(banner);
                });
            }
        });

        // Dismiss button
        document.getElementById('install-dismiss').addEventListener('click', function() {
            dismissBanner(banner);
        });
    }

    function dismissBanner(banner) {
        localStorage.setItem('installBannerDismissed', String(Date.now()));
        banner.classList.remove('visible');
        setTimeout(function() { banner.remove(); }, 500);
    }
})();

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

    /* Scoring wizard state */
    var scoreState = {
        step: 1,
        source: '',
        mode: 'team',
        target: '',
        targetLabel: '',
        points: 0,
        customPoints: false,
        reason: ''
    };

    var SOURCE_OPTIONS = [
        { key: 'game', emoji: '\uD83C\uDFAE', label: 'Game' },
        { key: 'bingo', emoji: '\u2705', label: 'Bingo' },
        { key: 'duty', emoji: '\uD83C\uDF73', label: 'Duty' },
        { key: 'bonus', emoji: '\u2B50', label: 'Bonus' },
        { key: 'penalty', emoji: '\u274C', label: 'Penalty' }
    ];

    var POINT_OPTIONS = [
        { val: 1, label: '+1' },
        { val: 2, label: '+2' },
        { val: 3, label: '+3' },
        { val: 5, label: '+5' },
        { val: 10, label: '+10' },
        { val: -1, label: '-1' }
    ];

    var TEAMS_LIST = ['titans', 'spartans', 'vikings', 'gladiators'];

    /* Build sorted guest list for scoring */
    var allGuests = [];
    var guestKeys = Object.keys(PLAYERS);
    guestKeys.sort();
    for (var gi = 0; gi < guestKeys.length; gi++) {
        allGuests.push({ name: guestKeys[gi], fullName: FULL_NAMES[guestKeys[gi]] || guestKeys[gi], team: PLAYERS[guestKeys[gi]] });
    }

    /* Trip day helper (matches games.js) */
    function getTripDay() {
        var start = new Date('2026-04-29').getTime();
        var day = Math.floor((Date.now() - start) / 86400000) + 1;
        return Math.max(1, Math.min(6, day));
    }

    /* ---- Main menu content ---- */
    function buildMainMenu() {
        drawer.innerHTML =
            '<div class="admin-drawer-header">' +
                '<h3>Admin Panel</h3>' +
                '<button class="admin-drawer-close">&times;</button>' +
            '</div>' +
            '<div class="admin-drawer-body admin-menu-body">' +
                '<button class="admin-menu-btn admin-menu-score" data-action="score">' +
                    '<span class="admin-menu-icon">\uD83C\uDFAF</span>' +
                    '<span class="admin-menu-label">Score Points</span>' +
                '</button>' +
                '<button class="admin-menu-btn admin-menu-announce" data-action="announce">' +
                    '<span class="admin-menu-icon">\uD83D\uDCE2</span>' +
                    '<span class="admin-menu-label">Send Announcement</span>' +
                '</button>' +
                '<button class="admin-menu-btn admin-menu-settings" data-action="settings">' +
                    '<span class="admin-menu-icon">\u2699\uFE0F</span>' +
                    '<span class="admin-menu-label">Settings</span>' +
                '</button>' +
            '</div>';

        drawer.querySelector('.admin-drawer-close').addEventListener('click', closeDrawer);
        var menuBtns = drawer.querySelectorAll('.admin-menu-btn');
        for (var i = 0; i < menuBtns.length; i++) {
            (function(btn) {
                btn.addEventListener('click', function() {
                    var action = btn.getAttribute('data-action');
                    if (action === 'score') { resetScoreState(); buildScoreStep1(); }
                    else if (action === 'announce') { buildAnnouncementView(); }
                    else if (action === 'settings') { buildSettingsView(); }
                });
            })(menuBtns[i]);
        }
    }

    function resetScoreState() {
        scoreState = { step: 1, source: '', mode: 'team', target: '', targetLabel: '', points: 0, customPoints: false, reason: '' };
    }

    /* ---- Step indicator ---- */
    function stepIndicator(current) {
        var dots = '';
        for (var s = 1; s <= 4; s++) {
            var cls = 'admin-step-dot';
            if (s === current) cls += ' active';
            else if (s < current) cls += ' done';
            dots += '<span class="' + cls + '"></span>';
        }
        return '<div class="admin-step-indicator">' + dots + '</div>';
    }

    /* ---- Score Step 1: Source ---- */
    function buildScoreStep1() {
        scoreState.step = 1;
        var html = '<div class="admin-drawer-header">' +
            '<button class="admin-back-btn">\u2190</button>' +
            '<h3>What\'s it for?</h3>' +
            '<button class="admin-drawer-close">&times;</button>' +
        '</div>' +
        stepIndicator(1) +
        '<div class="admin-drawer-body">' +
            '<div class="admin-source-grid">';

        for (var i = 0; i < SOURCE_OPTIONS.length; i++) {
            var s = SOURCE_OPTIONS[i];
            var sel = scoreState.source === s.key ? ' selected' : '';
            html += '<button class="admin-source-btn' + sel + '" data-source="' + s.key + '">' +
                '<span class="admin-source-emoji">' + s.emoji + '</span>' +
                '<span class="admin-source-label">' + s.label + '</span>' +
            '</button>';
        }

        html += '</div></div>';
        drawer.innerHTML = html;

        drawer.querySelector('.admin-drawer-close').addEventListener('click', closeDrawer);
        drawer.querySelector('.admin-back-btn').addEventListener('click', function() { buildMainMenu(); });

        var sourceBtns = drawer.querySelectorAll('.admin-source-btn');
        for (var j = 0; j < sourceBtns.length; j++) {
            (function(btn) {
                btn.addEventListener('click', function() {
                    scoreState.source = btn.getAttribute('data-source');
                    /* If penalty, pre-set negative points */
                    if (scoreState.source === 'penalty' && scoreState.points >= 0) {
                        scoreState.points = -1;
                    }
                    buildScoreStep2();
                });
            })(sourceBtns[j]);
        }
    }

    /* ---- Score Step 2: Who ---- */
    function buildScoreStep2() {
        scoreState.step = 2;
        var html = '<div class="admin-drawer-header">' +
            '<button class="admin-back-btn">\u2190</button>' +
            '<h3>Who gets the points?</h3>' +
            '<button class="admin-drawer-close">&times;</button>' +
        '</div>' +
        stepIndicator(2) +
        '<div class="admin-drawer-body">' +
            '<div class="admin-mode-toggle">' +
                '<button class="admin-mode-btn' + (scoreState.mode === 'team' ? ' active' : '') + '" data-mode="team">Team</button>' +
                '<button class="admin-mode-btn' + (scoreState.mode === 'individual' ? ' active' : '') + '" data-mode="individual">Individual</button>' +
            '</div>' +
            '<div id="admin-target-area"></div>' +
        '</div>';
        drawer.innerHTML = html;

        drawer.querySelector('.admin-drawer-close').addEventListener('click', closeDrawer);
        drawer.querySelector('.admin-back-btn').addEventListener('click', function() { buildScoreStep1(); });

        var modeBtns = drawer.querySelectorAll('.admin-mode-btn');
        for (var i = 0; i < modeBtns.length; i++) {
            (function(btn) {
                btn.addEventListener('click', function() {
                    scoreState.mode = btn.getAttribute('data-mode');
                    scoreState.target = '';
                    scoreState.targetLabel = '';
                    for (var k = 0; k < modeBtns.length; k++) modeBtns[k].classList.remove('active');
                    btn.classList.add('active');
                    renderTargetArea();
                });
            })(modeBtns[i]);
        }

        renderTargetArea();
    }

    function renderTargetArea() {
        var area = document.getElementById('admin-target-area');
        if (!area) return;
        var html = '';

        if (scoreState.mode === 'team') {
            html += '<div class="admin-team-grid">';
            for (var t = 0; t < TEAMS_LIST.length; t++) {
                var teamKey = TEAMS_LIST[t];
                var tc = TEAM_CONFIG[teamKey];
                var sel = scoreState.target === teamKey ? ' selected' : '';
                html += '<button class="admin-team-btn' + sel + '" data-team="' + teamKey + '" style="--team-color:' + tc.color + '">' +
                    '<span class="admin-team-logo">' + tc.logo + '</span>' +
                    '<span class="admin-team-name">' + tc.name + '</span>' +
                '</button>';
            }
            html += '</div>';
        } else {
            html += '<div class="admin-search-wrap">' +
                '<input type="text" class="admin-guest-search" placeholder="Search guests..." id="admin-guest-filter">' +
            '</div>';
            html += '<div class="admin-guest-list" id="admin-guest-list">';
            html += renderGuestList('');
            html += '</div>';
        }

        area.innerHTML = html;

        if (scoreState.mode === 'team') {
            var teamBtns = area.querySelectorAll('.admin-team-btn');
            for (var i = 0; i < teamBtns.length; i++) {
                (function(btn) {
                    btn.addEventListener('click', function() {
                        var team = btn.getAttribute('data-team');
                        scoreState.target = team;
                        scoreState.targetLabel = TEAM_CONFIG[team].name;
                        for (var j = 0; j < teamBtns.length; j++) teamBtns[j].classList.remove('selected');
                        btn.classList.add('selected');
                        setTimeout(function() { buildScoreStep3(); }, 200);
                    });
                })(teamBtns[i]);
            }
        } else {
            var filterInput = document.getElementById('admin-guest-filter');
            if (filterInput) {
                filterInput.addEventListener('input', function() {
                    var list = document.getElementById('admin-guest-list');
                    if (list) list.innerHTML = renderGuestList(filterInput.value);
                    attachGuestListEvents();
                });
            }
            attachGuestListEvents();
        }
    }

    function renderGuestList(filter) {
        var html = '';
        var f = (filter || '').toLowerCase();
        for (var i = 0; i < allGuests.length; i++) {
            var g = allGuests[i];
            if (f && g.fullName.toLowerCase().indexOf(f) === -1 && g.name.toLowerCase().indexOf(f) === -1) continue;
            var sel = scoreState.target === g.name ? ' selected' : '';
            var teamColor = TEAM_CONFIG[g.team] ? TEAM_CONFIG[g.team].color : '#999';
            html += '<button class="admin-guest-row' + sel + '" data-name="' + escapeHtml(g.name) + '">' +
                '<span class="admin-guest-dot" style="background:' + teamColor + '"></span>' +
                '<span class="admin-guest-name">' + escapeHtml(g.fullName) + '</span>' +
                '<span class="admin-guest-team">' + escapeHtml(TEAM_CONFIG[g.team] ? TEAM_CONFIG[g.team].name : '') + '</span>' +
            '</button>';
        }
        return html;
    }

    function attachGuestListEvents() {
        var rows = drawer.querySelectorAll('.admin-guest-row');
        for (var i = 0; i < rows.length; i++) {
            (function(row) {
                row.addEventListener('click', function() {
                    var name = row.getAttribute('data-name');
                    scoreState.target = name;
                    scoreState.targetLabel = FULL_NAMES[name] || name;
                    for (var j = 0; j < rows.length; j++) rows[j].classList.remove('selected');
                    row.classList.add('selected');
                    setTimeout(function() { buildScoreStep3(); }, 200);
                });
            })(rows[i]);
        }
    }

    /* ---- Score Step 3: Points ---- */
    function buildScoreStep3() {
        scoreState.step = 3;
        var isPenalty = scoreState.source === 'penalty';
        var html = '<div class="admin-drawer-header">' +
            '<button class="admin-back-btn">\u2190</button>' +
            '<h3>How many?</h3>' +
            '<button class="admin-drawer-close">&times;</button>' +
        '</div>' +
        stepIndicator(3) +
        '<div class="admin-drawer-body">' +
            '<div class="admin-points-grid">';

        for (var i = 0; i < POINT_OPTIONS.length; i++) {
            var p = POINT_OPTIONS[i];
            var sel = scoreState.points === p.val ? ' selected' : '';
            var neg = p.val < 0 ? ' negative' : '';
            html += '<button class="admin-points-btn' + sel + neg + '" data-points="' + p.val + '">' + p.label + '</button>';
        }

        var customSel = scoreState.customPoints ? ' selected' : '';
        html += '<button class="admin-points-btn admin-points-custom' + customSel + '" data-points="custom">Custom</button>';
        html += '</div>';

        if (scoreState.customPoints) {
            html += '<div class="admin-custom-input">' +
                '<input type="number" id="admin-custom-pts" placeholder="Enter points" value="' + (scoreState.points || '') + '">' +
            '</div>';
        }

        html += '<div class="admin-reason-wrap">' +
            '<input type="text" class="admin-reason-input" id="admin-reason" placeholder="Reason: e.g. Won petanque" value="' + escapeHtml(scoreState.reason) + '">' +
        '</div>' +
        '<div class="admin-step-actions">' +
            '<button class="admin-btn admin-btn-primary admin-next-btn" id="admin-to-confirm"' + (scoreState.points === 0 && !scoreState.customPoints ? ' disabled' : '') + '>Next \u2192</button>' +
        '</div>' +
        '</div>';
        drawer.innerHTML = html;

        drawer.querySelector('.admin-drawer-close').addEventListener('click', closeDrawer);
        drawer.querySelector('.admin-back-btn').addEventListener('click', function() { buildScoreStep2(); });

        var ptsBtns = drawer.querySelectorAll('.admin-points-btn');
        for (var j = 0; j < ptsBtns.length; j++) {
            (function(btn) {
                btn.addEventListener('click', function() {
                    var val = btn.getAttribute('data-points');
                    if (val === 'custom') {
                        scoreState.customPoints = true;
                        scoreState.points = 0;
                        buildScoreStep3();
                        return;
                    }
                    scoreState.customPoints = false;
                    scoreState.points = parseInt(val);
                    for (var k = 0; k < ptsBtns.length; k++) ptsBtns[k].classList.remove('selected');
                    btn.classList.add('selected');
                    var nextBtn = document.getElementById('admin-to-confirm');
                    if (nextBtn) nextBtn.disabled = false;
                });
            })(ptsBtns[j]);
        }

        var customInput = document.getElementById('admin-custom-pts');
        if (customInput) {
            customInput.addEventListener('input', function() {
                var v = parseInt(customInput.value);
                scoreState.points = isNaN(v) ? 0 : v;
                var nextBtn = document.getElementById('admin-to-confirm');
                if (nextBtn) nextBtn.disabled = (scoreState.points === 0);
            });
            customInput.focus();
        }

        var reasonInput = document.getElementById('admin-reason');
        if (reasonInput) {
            reasonInput.addEventListener('input', function() {
                scoreState.reason = reasonInput.value;
            });
        }

        var confirmBtn = document.getElementById('admin-to-confirm');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', function() {
                if (scoreState.customPoints) {
                    var ci = document.getElementById('admin-custom-pts');
                    if (ci) scoreState.points = parseInt(ci.value) || 0;
                }
                if (scoreState.points === 0) return;
                var ri = document.getElementById('admin-reason');
                if (ri) scoreState.reason = ri.value;
                buildScoreStep4();
            });
        }
    }

    /* ---- Score Step 4: Confirm ---- */
    function buildScoreStep4() {
        scoreState.step = 4;
        var sign = scoreState.points > 0 ? '+' : '';
        var targetDisplay = scoreState.targetLabel || scoreState.target;
        var sourceLabel = '';
        for (var i = 0; i < SOURCE_OPTIONS.length; i++) {
            if (SOURCE_OPTIONS[i].key === scoreState.source) { sourceLabel = SOURCE_OPTIONS[i].label; break; }
        }
        var summary = sign + scoreState.points + ' to ' + escapeHtml(targetDisplay);
        if (sourceLabel) summary += ' for ' + sourceLabel;
        if (scoreState.reason) summary += ': ' + escapeHtml(scoreState.reason);

        var html = '<div class="admin-drawer-header">' +
            '<button class="admin-back-btn">\u2190</button>' +
            '<h3>Confirm</h3>' +
            '<button class="admin-drawer-close">&times;</button>' +
        '</div>' +
        stepIndicator(4) +
        '<div class="admin-drawer-body admin-confirm-body">' +
            '<div class="admin-confirm-summary">' +
                '<div class="admin-confirm-points ' + (scoreState.points < 0 ? 'negative' : 'positive') + '">' + sign + scoreState.points + '</div>' +
                '<div class="admin-confirm-target">' + escapeHtml(targetDisplay) + '</div>' +
                '<div class="admin-confirm-detail">' +
                    (sourceLabel ? '<span class="admin-confirm-source">' + sourceLabel + '</span>' : '') +
                    (scoreState.reason ? '<span class="admin-confirm-reason">' + escapeHtml(scoreState.reason) + '</span>' : '') +
                '</div>' +
            '</div>' +
            '<button class="admin-btn admin-btn-confirm" id="admin-award-btn">\uD83C\uDFC6 Award Points</button>' +
            '<button class="admin-cancel-link" id="admin-cancel-award">Cancel</button>' +
        '</div>';
        drawer.innerHTML = html;

        drawer.querySelector('.admin-drawer-close').addEventListener('click', closeDrawer);
        drawer.querySelector('.admin-back-btn').addEventListener('click', function() { buildScoreStep3(); });

        document.getElementById('admin-cancel-award').addEventListener('click', function() { closeDrawer(); });

        document.getElementById('admin-award-btn').addEventListener('click', function() {
            doAwardPoints();
        });
    }

    /* ---- Actually award the points ---- */
    function doAwardPoints() {
        var teamScores = Store.get('lb_teamScores', { titans: 0, spartans: 0, vikings: 0, gladiators: 0 });
        var individualScores = Store.get('lb_individualScores', {});
        var pointsLog = Store.get('lb_pointsLog', []);

        var type = scoreState.mode;
        var target = scoreState.target;
        var amount = scoreState.points;
        var reason = scoreState.reason || scoreState.source;
        var category = scoreState.source || 'bonus';

        if (amount < 0) category = 'penalty';

        var entry = {
            type: type,
            target: target,
            amount: amount,
            reason: reason,
            time: new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
            timestamp: Date.now(),
            category: category,
            day: getTripDay(),
            awardedBy: Auth.getGuestName()
        };

        if (type === 'team') {
            teamScores[target] = (teamScores[target] || 0) + amount;
        } else {
            individualScores[target] = (individualScores[target] || 0) + amount;
            var team = PLAYERS[target];
            if (team) {
                teamScores[team] = (teamScores[team] || 0) + amount;
            }
        }

        pointsLog.unshift(entry);

        Store.set('lb_teamScores', teamScores);
        Store.set('lb_individualScores', individualScores);
        Store.set('lb_pointsLog', pointsLog);

        /* Push to live feed */
        if (typeof FirebaseSync !== 'undefined' && FirebaseSync.isConfigured()) {
            var sign = amount > 0 ? '+' : '';
            var feedText = sign + amount + ' pts to ' + (scoreState.targetLabel || target);
            if (reason) feedText += ' (' + reason + ')';
            FirebaseSync.push('feed', {
                type: 'points',
                text: feedText,
                author: Auth.getGuestName(),
                target: target,
                amount: amount,
                category: category,
                timestamp: Date.now()
            });
        }

        /* Dispatch event so leaderboard UI updates */
        document.dispatchEvent(new CustomEvent('leaderboardUpdate'));

        /* Show toast */
        showAdminToast('Points awarded!');
        closeDrawer();
    }

    /* ---- Announcement view ---- */
    function buildAnnouncementView() {
        var state = AdminState.get();
        var announceType = (state.announcement && state.announcement.type) || 'info';

        var html = '<div class="admin-drawer-header">' +
            '<button class="admin-back-btn">\u2190</button>' +
            '<h3>Send Announcement</h3>' +
            '<button class="admin-drawer-close">&times;</button>' +
        '</div>' +
        '<div class="admin-drawer-body">' +
            '<div class="admin-section">' +
                '<textarea id="admin-announce-text" placeholder="Type a message for all guests..." rows="4">' +
                    escapeHtml(state.announcement ? state.announcement.text : '') +
                '</textarea>' +
                '<div class="admin-announce-type-grid">' +
                    '<button class="admin-atype-btn' + (announceType === 'info' ? ' active' : '') + '" data-type="info">' +
                        '<span class="admin-atype-emoji">\uD83D\uDCE2</span><span>Info</span>' +
                    '</button>' +
                    '<button class="admin-atype-btn' + (announceType === 'celebration' ? ' active' : '') + '" data-type="celebration">' +
                        '<span class="admin-atype-emoji">\uD83C\uDF89</span><span>Party</span>' +
                    '</button>' +
                    '<button class="admin-atype-btn' + (announceType === 'warning' ? ' active' : '') + '" data-type="warning">' +
                        '<span class="admin-atype-emoji">\u26A0\uFE0F</span><span>Alert</span>' +
                    '</button>' +
                '</div>' +
                '<button class="admin-btn admin-btn-confirm admin-announce-send" id="admin-announce-send">\uD83D\uDCE8 Send to Everyone</button>' +
                (state.announcement && state.announcement.text ?
                    '<button class="admin-cancel-link" id="admin-announce-clear-btn">Clear current announcement</button>' : '') +
            '</div>' +
        '</div>';
        drawer.innerHTML = html;

        drawer.querySelector('.admin-drawer-close').addEventListener('click', closeDrawer);
        drawer.querySelector('.admin-back-btn').addEventListener('click', function() { buildMainMenu(); });

        var typeBtns = drawer.querySelectorAll('.admin-atype-btn');
        for (var i = 0; i < typeBtns.length; i++) {
            (function(btn) {
                btn.addEventListener('click', function() {
                    for (var j = 0; j < typeBtns.length; j++) typeBtns[j].classList.remove('active');
                    btn.classList.add('active');
                    announceType = btn.getAttribute('data-type');
                });
            })(typeBtns[i]);
        }

        document.getElementById('admin-announce-send').addEventListener('click', function() {
            var text = document.getElementById('admin-announce-text').value.trim();
            if (!text) return;
            state.announcement = { text: text, type: announceType, timestamp: Date.now() };
            AdminState.save(state);

            /* Push to feed and announcements collection */
            if (typeof FirebaseSync !== 'undefined' && FirebaseSync.isConfigured()) {
                var feedData = {
                    type: 'announcement',
                    text: text,
                    announcementType: announceType,
                    author: Auth.getGuestName(),
                    timestamp: Date.now()
                };
                FirebaseSync.push('feed', feedData);
                FirebaseSync.push('announcements', feedData);
            }

            showAdminToast('Announcement sent!');
            closeDrawer();
        });

        var clearBtn = document.getElementById('admin-announce-clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', function() {
                state.announcement = null;
                AdminState.save(state);
                document.getElementById('admin-announce-text').value = '';
                showAdminToast('Announcement cleared');
                buildAnnouncementView();
            });
        }
    }

    /* ---- Settings view ---- */
    function buildSettingsView() {
        var state = AdminState.get();
        var html = '<div class="admin-drawer-header">' +
            '<button class="admin-back-btn">\u2190</button>' +
            '<h3>Settings</h3>' +
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
            '<div class="admin-section admin-push">' +
                '<button class="admin-btn admin-btn-push" id="admin-push-live">Push Live to All Guests</button>' +
                '<p class="admin-hint" style="margin-top:8px">Copies config to clipboard &amp; opens GitHub editor. Paste, replace all, commit. Changes go live in ~1 min.</p>' +
            '</div>' +
        '</div>';
        drawer.innerHTML = html;

        drawer.querySelector('.admin-drawer-close').addEventListener('click', closeDrawer);
        drawer.querySelector('.admin-back-btn').addEventListener('click', function() { buildMainMenu(); });

        var teamsToggle = drawer.querySelector('#admin-teams-toggle');
        if (teamsToggle) {
            teamsToggle.addEventListener('change', function() {
                state.teamsRevealed = this.checked;
                this.nextElementSibling.nextElementSibling.textContent = this.checked ? 'Teams Visible' : 'Teams Hidden';
                AdminState.save(state);
            });
        }

        var secretCbs = drawer.querySelectorAll('.admin-secret-item input');
        for (var i = 0; i < secretCbs.length; i++) {
            (function(cb) {
                cb.addEventListener('change', function() {
                    var date = cb.getAttribute('data-date');
                    var overrides = state.secretOverrides || [];
                    if (cb.checked) { if (overrides.indexOf(date) === -1) overrides.push(date); }
                    else {
                        var filtered = [];
                        for (var x = 0; x < overrides.length; x++) { if (overrides[x] !== date) filtered.push(overrides[x]); }
                        overrides = filtered;
                    }
                    state.secretOverrides = overrides;
                    AdminState.save(state);
                });
            })(secretCbs[i]);
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

    /* ---- Toast ---- */
    function showAdminToast(msg) {
        var existing = document.getElementById('admin-toast');
        if (existing) existing.remove();
        var toast = document.createElement('div');
        toast.id = 'admin-toast';
        toast.className = 'admin-toast';
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(function() { toast.classList.add('show'); }, 10);
        setTimeout(function() {
            toast.classList.remove('show');
            setTimeout(function() { toast.remove(); }, 300);
        }, 2500);
    }

    /* ---- Open / Close ---- */
    function openDrawer() {
        buildMainMenu();
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

/* Bingo notification dot on nav when new claims since last visit */
function initBingoNotifDot() {
    var bingoLink = document.getElementById('nav-bingo');
    if (!bingoLink) return;
    // On bingo page, update lastSeen and don't show dot
    if (window.location.pathname.indexOf('bingo.html') !== -1) {
        localStorage.setItem('bingoLastSeen', String(Date.now()));
        return;
    }
    document.addEventListener('feedUpdate', function(e) {
        var feed = e.detail;
        if (!feed) return;
        var lastSeen = parseInt(localStorage.getItem('bingoLastSeen') || '0', 10);
        var hasNew = false;
        var keys = Object.keys(feed);
        for (var i = 0; i < keys.length; i++) {
            var item = feed[keys[i]];
            if (item && item.type === 'bingo' && item.timestamp > lastSeen) {
                hasNew = true;
                break;
            }
        }
        if (hasNew) {
            bingoLink.classList.add('has-notif');
        } else {
            bingoLink.classList.remove('has-notif');
        }
    });
}

/* Initialize shared components on every page */
document.addEventListener('DOMContentLoaded', function () {
    // Page transition
    initPageTransition();
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
    // Auto-sync local profile photo to Firebase (if not already there)
    if (Auth.isLoggedIn() && typeof ProfileSync !== 'undefined' && ProfileSync.isConfigured()) {
        var _guest = Auth.getGuestData();
        if (_guest) {
            // Wait for profiles to load from Firebase, then sync
            ProfileSync.onUpdate(function() {
                ProfileSync.syncLocal(_guest.fullName);
            });
        }
    }
    // Contextual guest highlighting
    applyGuestHighlighting();
    // Admin shared state sync
    initAdminState();
    // Admin panel (admin users only)
    initAdminPanel();
    // Bingo notification dot
    initBingoNotifDot();
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
        // Subscribe to push notifications
        if (typeof window.PushNotifications !== 'undefined' && window.PushNotifications.subscribe) {
            setTimeout(function() { window.PushNotifications.subscribe(code); }, 2000);
        }
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

    // Subscribe to push notifications if not already
    if (typeof window.PushNotifications !== 'undefined' && window.PushNotifications.subscribe) {
        window.PushNotifications.subscribe(guestCode);
    }

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
        var _spun = localStorage.getItem('teamRevealed_' + guestCode) === 'true';
        var teamDisplay = _spun ? escapeHtml(guest.team) : '??? (Revealed on arrival)';
        var scores = Store.get('lb_individualScores', {});
        var pts = scores[guest.name] || 0;
        var sorted = Object.entries(scores).sort(function(a, b) { return b[1] - a[1]; });
        var rank = sorted.findIndex(function(e) { return e[0] === guest.name; }) + 1;

        // Load existing profile data
        var profileKey = 'guestProfile_' + guestCode;
        var profile = JSON.parse(localStorage.getItem(profileKey) || '{}');
        var currentPhoto = getGuestPhoto(guest.fullName);

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
                (_spun ?
                    '<div class="my-trip-section">' +
                        '<h4>Stats</h4>' +
                        '<div class="my-trip-stats-grid">' +
                            '<div class="my-trip-stat"><span class="my-trip-stat-val">' + pts + '</span><span class="my-trip-stat-lbl">Points</span></div>' +
                            '<div class="my-trip-stat"><span class="my-trip-stat-val">' + (rank > 0 ? '#' + rank : '-') + '</span><span class="my-trip-stat-lbl">Rank</span></div>' +
                        '</div>' +
                    '</div>' : '') +
                '<div class="my-trip-section">' +
                    '<button class="my-trip-edit-btn" id="my-trip-edit-btn">Edit Profile</button>' +
                    '<div class="my-trip-edit-form" id="my-trip-edit-form">' +
                        '<label>Photo</label>' +
                        '<div class="my-trip-edit-photo">' +
                            '<div class="my-trip-edit-avatar" id="my-trip-edit-avatar">' +
                                (currentPhoto ? '<img src="' + currentPhoto + '">' : guest.name.charAt(0)) +
                            '</div>' +
                            '<button type="button" class="my-trip-edit-photo-btn" id="my-trip-edit-photo-btn">Change Photo</button>' +
                            '<input type="file" accept="image/*" id="my-trip-edit-photo-input" style="display:none">' +
                        '</div>' +
                        '<label>Nickname</label>' +
                        '<input type="text" id="my-trip-edit-nickname" placeholder="e.g. Big Joe, The Legend" value="' + escapeHtml(profile.nickname || '') + '" maxlength="30">' +
                        '<label>Bio</label>' +
                        '<textarea id="my-trip-edit-bio" rows="3" placeholder="A few words about yourself..." maxlength="120">' + escapeHtml(profile.bio || '') + '</textarea>' +
                        '<button class="my-trip-edit-save" id="my-trip-edit-save">Save Changes</button>' +
                        '<div class="my-trip-edit-saved" id="my-trip-edit-saved">Saved!</div>' +
                    '</div>' +
                '</div>' +
                '<div class="my-trip-switch">' +
                    '<button class="my-trip-switch-btn" id="my-trip-switch">Switch Guest</button>' +
                '</div>' +
            '</div>';

        document.getElementById('my-trip-close').addEventListener('click', closeDrawer);

        // Edit Profile toggle
        document.getElementById('my-trip-edit-btn').addEventListener('click', function() {
            var form = document.getElementById('my-trip-edit-form');
            var isOpen = form.classList.contains('open');
            form.classList.toggle('open');
            this.textContent = isOpen ? 'Edit Profile' : 'Cancel';
            if (isOpen) {
                this.classList.remove('cancel');
                this.style.background = '';
                this.style.color = '';
            } else {
                this.style.background = 'none';
                this.style.border = '1px solid rgba(0,0,0,0.1)';
                this.style.color = 'var(--text-light)';
            }
        });

        // Photo upload
        document.getElementById('my-trip-edit-photo-btn').addEventListener('click', function() {
            document.getElementById('my-trip-edit-photo-input').click();
        });
        document.getElementById('my-trip-edit-photo-input').addEventListener('change', function(e) {
            var file = e.target.files[0];
            if (!file) return;
            var avatarEl = document.getElementById('my-trip-edit-avatar');
            if (typeof compressProfilePhoto === 'function') {
                compressProfilePhoto(file, function(dataUrl) {
                    setGuestPhoto(guest.fullName, dataUrl);
                    avatarEl.innerHTML = '<img src="' + dataUrl + '">';
                });
            } else {
                var reader = new FileReader();
                reader.onload = function(ev) {
                    setGuestPhoto(guest.fullName, ev.target.result);
                    avatarEl.innerHTML = '<img src="' + ev.target.result + '">';
                };
                reader.readAsDataURL(file);
            }
            // Sync to Firebase
            if (typeof ProfileSync !== 'undefined' && ProfileSync.isConfigured()) {
                ProfileSync.upload(guest.fullName, file);
            }
        });

        // Save
        document.getElementById('my-trip-edit-save').addEventListener('click', function() {
            var nickname = document.getElementById('my-trip-edit-nickname').value.trim();
            var bio = document.getElementById('my-trip-edit-bio').value.trim();
            var existing = JSON.parse(localStorage.getItem(profileKey) || '{}');
            existing.nickname = nickname;
            existing.bio = bio;
            localStorage.setItem(profileKey, JSON.stringify(existing));
            // Sync to Firebase
            if (typeof ProfileSync !== 'undefined' && ProfileSync.isConfigured()) {
                var slug = guest.fullName.toLowerCase().replace(/['']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                var updates = { name: guest.fullName, updatedAt: Date.now() };
                if (nickname) updates.nickname = nickname;
                if (bio) updates.bio = bio;
                FirebaseSync.update('profiles/' + slug, updates);
            }
            var saved = document.getElementById('my-trip-edit-saved');
            saved.classList.add('show');
            setTimeout(function() { saved.classList.remove('show'); }, 2000);
        });

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

/* One-time migration: move Luke to Gladiators in Firebase */
(function() {
    if (typeof firebase === 'undefined' || !firebase.database) return;
    var db = firebase.database();
    db.ref('registrations/LUKE-4WN8/team').once('value', function(snap) {
        if (snap.val() === 'vikings') {
            db.ref('registrations/LUKE-4WN8/team').set('gladiators');
        }
    });
})();

/* One-time migration: fix bingo claims + leaderboard (run once, v2) */
(function() {
    if (typeof firebase === 'undefined' || !firebase.database) return;
    var db = firebase.database();
    var migrationKey = 'bingo_migration_v3';
    if (localStorage.getItem(migrationKey)) return;

    db.ref('bingo/claims').once('value', function(snap) {
        var claims = snap.val() || {};

        // Remove Joe's self-claim on "Convince Joe" (index 9)
        if (claims['9'] && claims['9']['JOE-7K9X']) {
            db.ref('bingo/claims/9/JOE-7K9X').remove();
        }

        // Remove George's "Three different spirits" (index 15)
        if (claims['15'] && claims['15']['GEORGE-1CY9']) {
            db.ref('bingo/claims/15/GEORGE-1CY9').remove();
        }

        // Remove Jonny W's disputed chant claim (index 2)
        if (claims['2'] && claims['2']['JONNYW-8HQ3']) {
            db.ref('bingo/claims/2/JONNYW-8HQ3').remove();
        }

        // Add Kiran's toast claim (index 5) as pending
        if (!claims['5'] || !claims['5']['KIRAN-7DX1']) {
            db.ref('bingo/claims/5/KIRAN-7DX1').set({
                claimedBy: 'Kiran',
                claimedByCode: 'KIRAN-7DX1',
                team: 'titans',
                timestamp: Date.now(),
                pending: true
            });
        }

        // Add Tom's "Convince Joe" claim (index 9) as pending
        if (!claims['9'] || !claims['9']['TOM-5QL7']) {
            db.ref('bingo/claims/9/TOM-5QL7').set({
                claimedBy: 'Tom',
                claimedByCode: 'TOM-5QL7',
                team: 'gladiators',
                timestamp: Date.now(),
                pending: true
            });
        }

        // Correct leaderboard (bingo claims + Stack Cup Thu + Boat Race Fri)
        // Individual: Joe 2(bingo)-2(boat race)=0, Sophie +2(stacks), Neeve -2(stacked)
        db.ref('leaderboard/individualScores/Joe').set(0);
        db.ref('leaderboard/individualScores/George').set(1);
        db.ref('leaderboard/individualScores/Jonny W').set(0);
        db.ref('leaderboard/individualScores/Sophie').set(2);
        db.ref('leaderboard/individualScores/Neeve').set(-2);

        // Teams: bingo + stack cup(5/3/1/1) + boat race(5/3/1/1)
        db.ref('leaderboard/teamScores/titans').set(4);
        db.ref('leaderboard/teamScores/spartans').set(11);
        db.ref('leaderboard/teamScores/gladiators').set(7);
        db.ref('leaderboard/teamScores/vikings').set(3);

        // Points log entries for the games
        var gameResults = [
            { type: 'team', target: 'Spartans', amount: 5, reason: 'Stack Cup Tournament - Winners', category: 'games', day: 2 },
            { type: 'team', target: 'Gladiators', amount: 3, reason: 'Stack Cup Tournament - Runner Up', category: 'games', day: 2 },
            { type: 'team', target: 'Titans', amount: 1, reason: 'Stack Cup Tournament - Participation', category: 'games', day: 2 },
            { type: 'team', target: 'Vikings', amount: 1, reason: 'Stack Cup Tournament - Participation', category: 'games', day: 2 },
            { type: 'individual', target: 'Sophie', amount: 2, reason: 'Stack Cup - Most Stacks', category: 'bonus', day: 2 },
            { type: 'individual', target: 'Neeve', amount: -2, reason: 'Stack Cup - Most Stacked', category: 'penalty', day: 2 },
            { type: 'team', target: 'Spartans', amount: 5, reason: 'Boat Race Relay - Winners', category: 'games', day: 3 },
            { type: 'team', target: 'Gladiators', amount: 3, reason: 'Boat Race Relay - Runner Up', category: 'games', day: 3 },
            { type: 'team', target: 'Titans', amount: 1, reason: 'Boat Race Relay - Participation', category: 'games', day: 3 },
            { type: 'team', target: 'Vikings', amount: 1, reason: 'Boat Race Relay - Participation', category: 'games', day: 3 },
            { type: 'individual', target: 'Joe', amount: -2, reason: 'Boat Race - Sabotaged own team', category: 'penalty', day: 3 }
        ];
        for (var g = 0; g < gameResults.length; g++) {
            var gr = gameResults[g];
            db.ref('leaderboard/pointsLog').push({
                type: gr.type,
                target: gr.target,
                amount: gr.amount,
                reason: gr.reason,
                category: gr.category,
                day: gr.day,
                time: new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
                timestamp: Date.now(),
                awardedBy: 'Admin'
            });
        }

        localStorage.setItem(migrationKey, 'true');
    });
})();

/* Migration v4: Sardines + Treetop points */
(function() {
    if (typeof firebase === 'undefined' || !firebase.database) return;
    var db = firebase.database();
    var migrationKey = 'bingo_migration_v4';
    if (localStorage.getItem(migrationKey)) return;

    db.ref('leaderboard/individualScores').once('value', function(snap) {
        var scores = snap.val() || {};

        // Sardines: captain bonuses
        scores['Joe'] = (scores['Joe'] || 0) + 2;
        scores['Razon'] = (scores['Razon'] || 0) + 2;
        scores['Hannah'] = (scores['Hannah'] || 0) - 2;

        // Sardines: finders +1 each
        scores['Florrie'] = (scores['Florrie'] || 0) + 1;
        scores['Oscar'] = (scores['Oscar'] || 0) + 1;
        scores['Robin'] = (scores['Robin'] || 0) + 1;
        scores['Jonny W'] = (scores['Jonny W'] || 0) + 1;
        scores['Sophie'] = (scores['Sophie'] || 0) + 1;
        scores['Emma W'] = (scores['Emma W'] || 0) + 1;
        scores['Luke'] = (scores['Luke'] || 0) + 1;
        scores['Sarah'] = (scores['Sarah'] || 0) + 1;

        // Treetop Super Black Noir +1 each
        scores['Peter'] = (scores['Peter'] || 0) + 1;
        scores['Kiran'] = (scores['Kiran'] || 0) + 1;
        scores['Robert'] = (scores['Robert'] || 0) + 1;
        scores['George'] = (scores['George'] || 0) + 1;

        db.ref('leaderboard/individualScores').set(scores);

        // Points log
        var entries = [
            { type: 'individual', target: 'Joe', amount: 2, reason: 'Sardines - Best Hider (0 found)', category: 'games', day: 4 },
            { type: 'individual', target: 'Razon', amount: 2, reason: 'Sardines - Best Hider (0 found)', category: 'games', day: 4 },
            { type: 'individual', target: 'Hannah', amount: -2, reason: 'Sardines - Worst Hider (8 found)', category: 'penalty', day: 4 },
            { type: 'individual', target: 'Florrie', amount: 1, reason: 'Sardines - Found Peter', category: 'games', day: 4 },
            { type: 'individual', target: 'Oscar', amount: 1, reason: 'Sardines - Found Hannah', category: 'games', day: 4 },
            { type: 'individual', target: 'Robin', amount: 1, reason: 'Sardines - Found Hannah', category: 'games', day: 4 },
            { type: 'individual', target: 'Jonny W', amount: 1, reason: 'Sardines - Found Hannah', category: 'games', day: 4 },
            { type: 'individual', target: 'Sophie', amount: 1, reason: 'Sardines - Found Hannah', category: 'games', day: 4 },
            { type: 'individual', target: 'Emma W', amount: 1, reason: 'Sardines - Found Hannah', category: 'games', day: 4 },
            { type: 'individual', target: 'Luke', amount: 1, reason: 'Sardines - Found Hannah', category: 'games', day: 4 },
            { type: 'individual', target: 'Sarah', amount: 1, reason: 'Sardines - Found Hannah', category: 'games', day: 4 },
            { type: 'individual', target: 'Peter', amount: 1, reason: 'Treetop - Super Black Noir', category: 'bonus', day: 5 },
            { type: 'individual', target: 'Kiran', amount: 1, reason: 'Treetop - Super Black Noir', category: 'bonus', day: 5 },
            { type: 'individual', target: 'Robert', amount: 1, reason: 'Treetop - Super Black Noir', category: 'bonus', day: 5 },
            { type: 'individual', target: 'George', amount: 1, reason: 'Treetop - Super Black Noir', category: 'bonus', day: 5 }
        ];
        for (var i = 0; i < entries.length; i++) {
            var e = entries[i];
            db.ref('leaderboard/pointsLog').push({
                type: e.type, target: e.target, amount: e.amount, reason: e.reason,
                category: e.category, day: e.day,
                time: new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
                timestamp: Date.now(), awardedBy: 'Admin'
            });
        }

        localStorage.setItem(migrationKey, 'true');
    });
})();
