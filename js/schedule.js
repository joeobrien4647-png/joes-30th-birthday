/* ============================================
   Schedule Page JavaScript
   ============================================ */

/* ---- Activity Voting Data ---- */
const AV_CATEGORIES = [
    { id: 'all', label: 'All', emoji: '\u2728' },
    { id: 'wine', label: 'Wine & Tasting', emoji: '\uD83C\uDF77' },
    { id: 'chateau', label: 'Chateaux', emoji: '\uD83C\uDFF0' },
    { id: 'adventure', label: 'Adventures', emoji: '\uD83C\uDFC4' },
    { id: 'food', label: 'Food & Culture', emoji: '\uD83E\uDDC0' },
    { id: 'fun', label: 'Fun & Unique', emoji: '\uD83C\uDFAE' }
];

const ACTIVITIES = [
    {
        id: 'vouvray-wine',
        name: 'Vouvray Cave Wine Tasting',
        category: 'wine',
        emoji: '\uD83E\uDDCA',
        tagline: 'Sparkling wines in underground limestone caves',
        description: 'Visit the famous troglodyte wine caves carved into tuffeau limestone cliffs at Vouvray \u2014 home to outstanding Chenin Blanc and sparkling Cr\u00e9mant de Loire. Tour underground cellars followed by tastings of 4-8 wines. Estates like Domaine Huet offer intimate, world-class experiences.',
        cost: { min: 26, max: 99 },
        duration: '2\u20134 hours',
        driveTime: '1h 15m',
        groupFit: 'Split into 2\u20133 groups across estates',
        mood: ['cultural', 'chill'],
        highlight: false,
        pairedWith: null
    },
    {
        id: 'chinon-wine-safari',
        name: 'Chinon & Bourgueil Wine Safari',
        category: 'wine',
        emoji: '\uD83D\uDE90',
        tagline: 'Full-day tour of the Loire\'s best red wine regions',
        description: 'A full-day guided tour visiting 3\u20134 wineries across Chinon and Bourgueil \u2014 the Loire\'s premier Cabernet Franc regions. Includes cellar exploration, vineyard walks, tastings paired with local food, and a traditional French picnic lunch among the vines. Chinon\'s medieval town is worth exploring afterwards.',
        cost: { min: 30, max: 150 },
        duration: 'Full day',
        driveTime: '1h',
        groupFit: 'Split across 2\u20133 minivans with guides',
        mood: ['cultural', 'social'],
        highlight: false,
        pairedWith: null
    },
    {
        id: 'private-sommelier',
        name: 'Private Sommelier at the Chateau',
        category: 'wine',
        emoji: '\uD83C\uDF7E',
        tagline: 'Expert-led tasting without leaving home',
        description: 'A professional sommelier comes directly to the chateau for a private tasting featuring the best Loire Valley wines \u2014 Vouvray, Sancerre, Chinon, and Cr\u00e9mant \u2014 paired with local cheeses and charcuterie. No driving needed, everyone can indulge. Educational yet fun.',
        cost: { min: 15, max: 30 },
        duration: '2\u20133 hours',
        driveTime: 'None!',
        groupFit: 'All 27 together',
        mood: ['chill', 'social'],
        highlight: true,
        pairedWith: null
    },
    {
        id: 'chenonceau',
        name: 'Ch\u00e2teau de Chenonceau',
        category: 'chateau',
        emoji: '\uD83C\uDFF0',
        tagline: 'The most beautiful chateau, spanning the River Cher',
        description: 'Perhaps the most stunning Loire ch\u00e2teau \u2014 a Renaissance masterpiece built spanning the River Cher. Famous for its gallery bridge, formal gardens, and rich history connected to Diane de Poitiers and Catherine de Medici. The on-site L\'Orangerie restaurant serves excellent French cuisine.',
        cost: { min: 19, max: 24 },
        duration: '2\u20133 hours',
        driveTime: '1h 15m',
        groupFit: 'All 27 \u2014 no group limit',
        mood: ['cultural'],
        highlight: true,
        pairedWith: 'kayak-chenonceau'
    },
    {
        id: 'chambord',
        name: 'Ch\u00e2teau de Chambord',
        category: 'chateau',
        emoji: '\uD83D\uDC51',
        tagline: '440 rooms, Da Vinci\'s double-helix staircase',
        description: 'The largest and most famous Loire ch\u00e2teau: 440 rooms, 84 staircases, and a legendary double-helix staircase possibly designed by Leonardo da Vinci. Set in a 5,440-hectare estate with forest, gardens, and canal. Rent e-bikes to explore the grounds or take boat trips on the canal.',
        cost: { min: 16, max: 16 },
        duration: '2\u20134 hours',
        driveTime: '1h 45m',
        groupFit: 'All 27 \u2014 e-bikes available on grounds',
        mood: ['cultural', 'adventure'],
        highlight: false,
        pairedWith: null
    },
    {
        id: 'villandry',
        name: 'Villandry Renaissance Gardens',
        category: 'chateau',
        emoji: '\uD83C\uDF3A',
        tagline: 'Spectacular geometric gardens and a hedge maze',
        description: 'Famous for its jaw-dropping Renaissance gardens \u2014 ornamental vegetables in intricate geometric patterns, flower gardens, a water garden, and a maze. Late April/early May is perfect timing as spring planting is underway. The ch\u00e2teau itself is elegant and intimate.',
        cost: { min: 7, max: 12 },
        duration: '2\u20133 hours',
        driveTime: '1h 10m',
        groupFit: 'All 27 \u2014 guided tours for groups of 15+',
        mood: ['cultural', 'chill'],
        highlight: false,
        pairedWith: null
    },
    {
        id: 'azay-le-rideau',
        name: 'Ch\u00e2teau d\'Azay-le-Rideau',
        category: 'chateau',
        emoji: '\uD83D\uDCA7',
        tagline: 'Renaissance jewel on a river island \u2014 best value',
        description: 'A jewel of the French Renaissance set on an island in the Indre river. Smaller and more intimate than Chambord or Chenonceau, with stunning water reflections. UNESCO World Heritage site. Group rate of \u20ac9/pp kicks in at 20+ people \u2014 perfect for us.',
        cost: { min: 9, max: 11 },
        duration: '1.5\u20132 hours',
        driveTime: '1h',
        groupFit: 'All 27 \u2014 group rate applies!',
        mood: ['cultural', 'chill'],
        highlight: false,
        pairedWith: null
    },
    {
        id: 'hot-air-balloon',
        name: 'Hot Air Balloon Over the Chateaux',
        category: 'adventure',
        emoji: '\uD83C\uDF08',
        tagline: 'Float over the Loire Valley at sunrise or sunset',
        description: 'A bucket-list experience: float over ch\u00e2teaux, vineyards, and rivers from above. About 1 hour of flight time, plus setup and a traditional champagne toast on landing. Sunrise and sunset flights available. Limited to 8\u201312 per balloon, so this works best for a keen subset of the group.',
        cost: { min: 149, max: 199 },
        duration: '3\u20133.5 hours',
        driveTime: '1\u20131.5h',
        groupFit: '8\u201312 per balloon \u2014 subset of group',
        mood: ['adventure'],
        highlight: true,
        pairedWith: null
    },
    {
        id: 'canoeing-creuse',
        name: 'Canoeing on the Creuse River',
        category: 'adventure',
        emoji: '\uD83D\uDEF6',
        tagline: 'Our closest adventure \u2014 just 15 minutes away!',
        description: 'Paddle down the Creuse or Anglin rivers through the beautiful Brenne Regional Natural Park. The Creuse features stunning cliff passages and peaceful stretches. Canoe D\u00e9couverte in Le Blanc provides all equipment, shuttle service, and guided options. This is right on our doorstep!',
        cost: { min: 15, max: 25 },
        duration: '2 hours \u2014 full day',
        driveTime: '15 min',
        groupFit: 'All 27 \u2014 large group bookings welcome',
        mood: ['adventure', 'chill'],
        highlight: true,
        pairedWith: null
    },
    {
        id: 'kayak-chenonceau',
        name: 'Kayak Under Ch\u00e2teau de Chenonceau',
        category: 'adventure',
        emoji: '\uD83C\uDFDE\uFE0F',
        tagline: 'Paddle directly underneath a Renaissance chateau',
        description: 'A genuinely unique experience: kayak on the River Cher and pass directly underneath the arches of Ch\u00e2teau de Chenonceau. One of the most extraordinary perspectives of any ch\u00e2teau in France. Best combined with a Chenonceau visit for the ultimate combo day trip.',
        cost: { min: 15, max: 40 },
        duration: '1.5\u20133 hours',
        driveTime: '1h 15m',
        groupFit: 'All 27 \u2014 2\u20133 seater kayaks available',
        mood: ['adventure'],
        highlight: false,
        pairedWith: 'chenonceau'
    },
    {
        id: 'loire-cycling',
        name: 'Loire \u00e0 V\u00e9lo Cycling',
        category: 'adventure',
        emoji: '\uD83D\uDEB4',
        tagline: 'Ride one of Europe\'s great cycling routes',
        description: 'The Loire \u00e0 V\u00e9lo is a 900km flat, well-marked cycling path along the Loire river through vineyards, ch\u00e2teaux, and villages. Rent regular or electric bikes for a section suited to us \u2014 popular routes include Amboise to Chenonceau (~25km, easy). E-bikes level the playing field for mixed fitness.',
        cost: { min: 15, max: 45 },
        duration: 'Half to full day',
        driveTime: '1h to route',
        groupFit: 'All 27 \u2014 bikes delivered to meeting point',
        mood: ['adventure', 'chill'],
        highlight: false,
        pairedWith: null
    },
    {
        id: 'cooking-class',
        name: 'French Cooking Class',
        category: 'food',
        emoji: '\uD83E\uDDD1\u200D\uD83C\uDF73',
        tagline: 'Master croissants, tarte Tatin, or a 3-course meal',
        description: 'Learn to prepare classic French dishes with a professional chef. Options range from a 2-hour pastry masterclass (croissants, tarte Tatin) to a full half-day 3-course meal experience. Some chefs come to the chateau; others run it from their own kitchens. You eat everything you make!',
        cost: { min: 60, max: 150 },
        duration: '2\u20136 hours',
        driveTime: 'At chateau or 1h+',
        groupFit: 'Split into 2 groups of ~14',
        mood: ['social', 'cultural'],
        highlight: false,
        pairedWith: null
    },
    {
        id: 'tours-market',
        name: 'Tours Market Visit',
        category: 'food',
        emoji: '\uD83E\uDDC0',
        tagline: 'One of France\'s great covered food markets',
        description: 'Les Halles de Tours is a feast for the senses \u2014 local cheeses (Sainte-Maure-de-Touraine), rillettes de Tours, fresh produce, wines, and pastries. Open Wed and Sat mornings. Tours is an "International City of Gastronomy." Note: Saturday market = May 2nd = Joe\'s birthday!',
        cost: { min: 0, max: 50 },
        duration: '2\u20133 hours',
        driveTime: '1h 15m',
        groupFit: 'All 27 \u2014 free-roam the market',
        mood: ['cultural', 'chill'],
        highlight: false,
        pairedWith: null
    },
    {
        id: 'goat-cheese-farm',
        name: 'Goat Cheese Farm Visit',
        category: 'food',
        emoji: '\uD83D\uDC10',
        tagline: 'Meet the goats, learn the craft, taste the cheese',
        description: 'The Loire Valley is France\'s premier goat cheese region. Visit a working farm near Sainte-Maure-de-Touraine to meet the goats, see cheese being made, and taste the famous log-shaped cheese with its rye straw centre. Hands-on, delicious, and uniquely French.',
        cost: { min: 20, max: 50 },
        duration: '2\u20133 hours',
        driveTime: '45m \u2014 1h',
        groupFit: 'Split into 2 groups across farms',
        mood: ['cultural', 'chill'],
        highlight: false,
        pairedWith: null
    },
    {
        id: 'private-chef-dinner',
        name: 'Private Chef Birthday Dinner',
        category: 'food',
        emoji: '\uD83C\uDF7D\uFE0F',
        tagline: 'Professional chef cooks a multi-course feast at the chateau',
        description: 'Hire a private chef to cook a stunning multi-course birthday dinner right at the chateau. Local options include Ryan Matthee (25min away), Unarome2chefs (2 chefs, great for large groups), and Alexandre Timar (Tours). The ultimate way to celebrate Joe\'s 30th \u2014 no washing up!',
        cost: { min: 80, max: 150 },
        duration: 'Evening',
        driveTime: 'None \u2014 they come to us',
        groupFit: 'All 27 together',
        mood: ['social', 'party'],
        highlight: true,
        pairedWith: null
    },
    {
        id: 'battlekart',
        name: 'BattleKart (AR Go-Karts)',
        category: 'fun',
        emoji: '\uD83C\uDFAE',
        tagline: 'Mario Kart in real life \u2014 augmented reality racing',
        description: 'Real electric go-karts on a track with augmented reality projected onto the floor. Different game modes including races, battles, and team challenges \u2014 think Mario Kart come to life. Bonuses, power-ups, and mayhem guaranteed. Located near Tours.',
        cost: { min: 22, max: 22 },
        duration: '1\u20132 hours',
        driveTime: '1h 15m',
        groupFit: 'Rotate in groups of 8\u201312',
        mood: ['party', 'adventure'],
        highlight: false,
        pairedWith: null
    },
    {
        id: 'karting-paintball',
        name: 'Karting + Paintball Combo',
        category: 'fun',
        emoji: '\uD83C\uDFC1',
        tagline: 'High-speed racing AND paintball warfare',
        description: 'Outdoor karting track with 270cc adult karts PLUS a 4,000m\u00B2 paintball zone. Group packages bundle both activities. Perfect for a Team Champagne vs Team Bordeaux vs Team Ros\u00e9 showdown. Includes bar, clubhouse, and picnic area.',
        cost: { min: 55, max: 70 },
        duration: '2\u20134 hours',
        driveTime: '1h 15m',
        groupFit: 'All 27 \u2014 ideal for team battles',
        mood: ['adventure', 'party'],
        highlight: false,
        pairedWith: null
    },
    {
        id: 'son-et-lumiere',
        name: 'Son et Lumi\u00e8re at Blois',
        category: 'fun',
        emoji: '\u2728',
        tagline: 'Spectacular sound & light show on a royal chateau',
        description: 'A legendary sound and light show projected onto the grand courtyard of the Royal Ch\u00e2teau of Blois. Music, narration, and dramatic lighting tell the castle\'s history. The original Loire Valley son et lumi\u00e8re, running since the 1950s. Show starts at 10pm \u2014 a magical late evening out.',
        cost: { min: 9, max: 14 },
        duration: '45 min show',
        driveTime: '1h 30m',
        groupFit: 'All 27 \u2014 large courtyard',
        mood: ['cultural'],
        highlight: false,
        pairedWith: null
    },
    {
        id: 'troglodyte-caves',
        name: 'Troglodyte Cave Village',
        category: 'fun',
        emoji: '\uD83E\uDEA8',
        tagline: 'Ancient cave dwellings carved into limestone cliffs',
        description: 'Explore ancient cave dwellings carved into tuffeau limestone near Saumur. The Rochemenier Village features underground farms, a chapel, wine press, and twenty furnished rooms. Or combine cave exploration with wine tasting at Ackerman cellars. Uniquely Loire Valley \u2014 nowhere else like it.',
        cost: { min: 5, max: 8 },
        duration: '1\u20131.5 hours',
        driveTime: '1h 15m',
        groupFit: 'All 27 \u2014 group rates for 15+',
        mood: ['cultural'],
        highlight: false,
        pairedWith: null
    },
    {
        id: 'brenne-park',
        name: 'Brenne Park Activities',
        category: 'fun',
        emoji: '\uD83C\uDFF9',
        tagline: 'Archery, climbing, kayak polo \u2014 right on our doorstep!',
        description: 'The chateau sits within the Brenne Regional Natural Park. The Base de Plein Air in Le Blanc offers supervised archery, climbing, mountain biking, orienteering, kayak polo, and more. Qualified staff, all equipment provided. Perfect for team competitions without a long drive.',
        cost: { min: 10, max: 25 },
        duration: 'Half to full day',
        driveTime: '15 min',
        groupFit: 'All 27 \u2014 multiple activities simultaneously',
        mood: ['adventure', 'party'],
        highlight: false,
        pairedWith: null
    }
];

const AV_MAX_VOTES = 8;

const AV_MOOD_COLORS = {
    cultural: { bg: '#dbeafe', text: '#1e40af' },
    chill: { bg: '#d1fae5', text: '#065f46' },
    adventure: { bg: '#ffedd5', text: '#9a3412' },
    party: { bg: '#fce7f3', text: '#9d174d' },
    social: { bg: '#ede9fe', text: '#5b21b6' }
};

/* ---- Agenda Day Tabs ---- */
function initAgendaTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const dayContents = document.querySelectorAll('.day-content');

    if (!tabBtns.length) return;

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const day = this.dataset.day;

            // Remove active class from all tabs and content
            tabBtns.forEach(b => b.classList.remove('active'));
            dayContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            document.querySelector(`.day-content[data-day="${day}"]`).classList.add('active');
        });
    });
}

/* ---- Secret Agenda Items ---- */
function initSecretAgenda() {
    const secretItems = document.querySelectorAll('.timeline-item.top-secret');

    if (!secretItems.length) return;

    // Check if we should unlock based on date
    const now = new Date();

    secretItems.forEach(item => {
        const unlockDate = new Date(item.dataset.unlock);
        const overlay = item.querySelector('.secret-overlay');
        const content = item.querySelector('.secret-content');

        if (now >= unlockDate) {
            // Unlock the secret content
            if (overlay) overlay.style.display = 'none';
            if (content) content.style.display = 'block';
            item.classList.add('unlocked');
            item.classList.remove('top-secret');
        }
    });

    // Admin override - click secret 5 times to reveal (for testing)
    let clickCount = 0;
    secretItems.forEach(item => {
        item.addEventListener('click', function() {
            clickCount++;
            if (clickCount >= 5) {
                const overlay = this.querySelector('.secret-overlay');
                const content = this.querySelector('.secret-content');
                if (overlay) overlay.style.display = 'none';
                if (content) content.style.display = 'block';
                this.classList.add('unlocked');
                clickCount = 0;
            }
        });
    });
}

/* ---- Activity Voting ---- */
function initActivityVoting() {
    const grid = document.getElementById('av-grid');
    const filtersEl = document.getElementById('av-filters');
    const resultsEl = document.getElementById('av-results');
    const budgetUsed = document.getElementById('av-votes-used');
    if (!grid) return;

    const guestCode = Auth.getGuestCode();
    const isAdmin = Auth.isAdmin();
    let activeFilter = 'all';

    // Load state
    let votes = Store.get('av_votes', {});
    let userVotes = Store.get('av_userVotes', {});
    let statuses = Store.get('av_statuses', {});

    function getMyVotes() {
        return userVotes[guestCode] || [];
    }

    function setMyVotes(arr) {
        userVotes[guestCode] = arr;
        Store.set('av_userVotes', userVotes);
    }

    // ---- Render everything ----
    function render() {
        renderFilters();
        renderCards();
        renderResults();
        updateBudget();
    }

    // ---- Filter pills ----
    function renderFilters() {
        filtersEl.innerHTML = AV_CATEGORIES.map(cat => {
            const isActive = cat.id === activeFilter;
            const count = cat.id === 'all' ? ACTIVITIES.length :
                ACTIVITIES.filter(a => a.category === cat.id).length;
            return `<button class="av-filter-pill${isActive ? ' active' : ''}" data-cat="${cat.id}">
                ${cat.emoji} ${cat.label} <span class="av-filter-count">${count}</span>
            </button>`;
        }).join('');

        filtersEl.querySelectorAll('.av-filter-pill').forEach(btn => {
            btn.addEventListener('click', function() {
                activeFilter = this.dataset.cat;
                render();
            });
        });
    }

    // ---- Activity cards ----
    function renderCards() {
        const myVotes = getMyVotes();
        const filtered = activeFilter === 'all' ? ACTIVITIES :
            ACTIVITIES.filter(a => a.category === activeFilter);

        // Sort: booked first, then by vote count desc, cancelled last
        const sorted = [...filtered].sort((a, b) => {
            const sa = statuses[a.id] || '';
            const sb = statuses[b.id] || '';
            if (sa === 'cancelled' && sb !== 'cancelled') return 1;
            if (sb === 'cancelled' && sa !== 'cancelled') return -1;
            if (sa === 'booked' && sb !== 'booked') return -1;
            if (sb === 'booked' && sa !== 'booked') return 1;
            return (votes[b.id] || 0) - (votes[a.id] || 0);
        });

        grid.innerHTML = sorted.map(act => {
            const voteCount = votes[act.id] || 0;
            const hasVoted = myVotes.includes(act.id);
            const atLimit = myVotes.length >= AV_MAX_VOTES && !hasVoted;
            const status = statuses[act.id] || '';
            const isCancelled = status === 'cancelled';
            const isBooked = status === 'booked';
            const paired = act.pairedWith ? ACTIVITIES.find(a => a.id === act.pairedWith) : null;
            const costStr = act.cost.min === act.cost.max
                ? `\u20AC${act.cost.min}/pp`
                : act.cost.min === 0
                    ? `Free\u2013\u20AC${act.cost.max}/pp`
                    : `\u20AC${act.cost.min}\u2013${act.cost.max}/pp`;

            return `<div class="av-card${isCancelled ? ' av-cancelled' : ''}${isBooked ? ' av-booked' : ''}${act.highlight ? ' av-highlight' : ''}" data-id="${act.id}">
                ${isBooked ? '<div class="av-status-badge av-badge-booked">Booked!</div>' : ''}
                ${isCancelled ? '<div class="av-status-badge av-badge-cancelled">Not Happening</div>' : ''}
                ${act.highlight && !isBooked && !isCancelled ? '<div class="av-status-badge av-badge-pick">Top Pick</div>' : ''}
                <div class="av-card-header">
                    <span class="av-card-emoji">${act.emoji}</span>
                    <div class="av-card-title">
                        <h3>${escapeHtml(act.name)}</h3>
                        <p class="av-card-tagline">${escapeHtml(act.tagline)}</p>
                    </div>
                </div>
                <div class="av-card-stats">
                    <span class="av-stat">\uD83D\uDCB6 ${costStr}</span>
                    <span class="av-stat">\u23F1 ${escapeHtml(act.duration)}</span>
                    <span class="av-stat">\uD83D\uDE97 ${escapeHtml(act.driveTime)}</span>
                </div>
                <div class="av-card-moods">
                    ${act.mood.map(m => `<span class="av-mood" style="background:${AV_MOOD_COLORS[m].bg};color:${AV_MOOD_COLORS[m].text}">${m.charAt(0).toUpperCase() + m.slice(1)}</span>`).join('')}
                </div>
                <div class="av-card-details" id="av-details-${act.id}" style="display:none;">
                    <p>${escapeHtml(act.description)}</p>
                    <div class="av-card-meta">
                        <span>\uD83D\uDC65 ${escapeHtml(act.groupFit)}</span>
                        ${paired ? `<span>\uD83D\uDCA1 Pairs with: ${escapeHtml(paired.name)}</span>` : ''}
                    </div>
                </div>
                <div class="av-card-actions">
                    <button class="av-expand-btn" data-id="${act.id}">Details \u25BE</button>
                    <button class="av-vote-btn${hasVoted ? ' voted' : ''}${atLimit ? ' at-limit' : ''}" data-id="${act.id}" ${!guestCode ? 'disabled title="Log in to vote"' : ''}>
                        <span class="av-vote-icon">${hasVoted ? '\u2705' : '\uD83D\uDDF3\uFE0F'}</span>
                        <span class="av-vote-label">${hasVoted ? 'Voted' : 'Vote'}</span>
                        <span class="av-vote-count">${voteCount}</span>
                    </button>
                </div>
                ${isAdmin ? `<div class="av-card-admin">
                    <select class="av-status-select" data-id="${act.id}">
                        <option value=""${!status ? ' selected' : ''}>\u2014 Status \u2014</option>
                        <option value="booked"${isBooked ? ' selected' : ''}>\u2705 Booked</option>
                        <option value="cancelled"${isCancelled ? ' selected' : ''}>\u274C Not Happening</option>
                    </select>
                </div>` : ''}
            </div>`;
        }).join('');

        // Event listeners
        grid.querySelectorAll('.av-expand-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                toggleDetails(this.dataset.id);
            });
        });

        grid.querySelectorAll('.av-vote-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                if (!guestCode) return;
                handleVote(this.dataset.id);
            });
        });

        if (isAdmin) {
            grid.querySelectorAll('.av-status-select').forEach(sel => {
                sel.addEventListener('change', function() {
                    handleStatusChange(this.dataset.id, this.value);
                });
            });
        }
    }

    // ---- Results bar chart ----
    function renderResults() {
        const totalVotes = Object.values(votes).reduce((s, v) => s + v, 0);
        if (totalVotes < 1) {
            resultsEl.style.display = 'none';
            return;
        }
        resultsEl.style.display = 'block';

        const ranked = ACTIVITIES
            .map(a => ({ ...a, count: votes[a.id] || 0 }))
            .filter(a => a.count > 0)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        const maxCount = ranked[0] ? ranked[0].count : 1;

        resultsEl.innerHTML = `
            <h3 class="av-results-title">\uD83C\uDFC6 Most Popular</h3>
            <div class="av-results-bars">
                ${ranked.map((a, i) => {
                    const pct = Math.round((a.count / maxCount) * 100);
                    const status = statuses[a.id] || '';
                    return `<div class="av-result-row${status === 'booked' ? ' av-result-booked' : ''}">
                        <span class="av-result-rank">${i + 1}</span>
                        <span class="av-result-emoji">${a.emoji}</span>
                        <span class="av-result-name">${escapeHtml(a.name)}</span>
                        <div class="av-result-bar-track">
                            <div class="av-result-bar-fill" style="width:${pct}%"></div>
                        </div>
                        <span class="av-result-count">${a.count}${status === 'booked' ? ' \u2705' : ''}</span>
                    </div>`;
                }).join('')}
            </div>
        `;
    }

    // ---- Budget counter ----
    function updateBudget() {
        if (budgetUsed) {
            const count = getMyVotes().length;
            budgetUsed.textContent = count;
            budgetUsed.closest('.av-vote-budget').classList.toggle('av-budget-full', count >= AV_MAX_VOTES);
        }
    }

    // ---- Vote handler ----
    function handleVote(activityId) {
        const myVotes = getMyVotes();
        const idx = myVotes.indexOf(activityId);

        if (idx > -1) {
            // Remove vote
            myVotes.splice(idx, 1);
            votes[activityId] = Math.max(0, (votes[activityId] || 0) - 1);
        } else if (myVotes.length >= AV_MAX_VOTES) {
            // At limit - shake budget
            const budgetEl = budgetUsed ? budgetUsed.closest('.av-vote-budget') : null;
            if (budgetEl) {
                budgetEl.classList.add('av-shake');
                setTimeout(() => budgetEl.classList.remove('av-shake'), 500);
            }
            return;
        } else {
            // Add vote
            myVotes.push(activityId);
            votes[activityId] = (votes[activityId] || 0) + 1;
            if (typeof triggerMiniConfetti === 'function') triggerMiniConfetti();
        }

        setMyVotes(myVotes);
        Store.set('av_votes', votes);
        render();
    }

    // ---- Expand/collapse ----
    function toggleDetails(activityId) {
        const details = document.getElementById('av-details-' + activityId);
        const btn = grid.querySelector(`.av-expand-btn[data-id="${activityId}"]`);
        if (!details) return;

        const isOpen = details.style.display !== 'none';
        details.style.display = isOpen ? 'none' : 'block';
        if (btn) btn.textContent = isOpen ? 'Details \u25BE' : 'Details \u25B4';
    }

    // ---- Admin status ----
    function handleStatusChange(activityId, status) {
        if (status) {
            statuses[activityId] = status;
        } else {
            delete statuses[activityId];
        }
        Store.set('av_statuses', statuses);
        render();
    }

    // Go!
    render();
}

/* ---- Initialize on page load ---- */
document.addEventListener('DOMContentLoaded', function() {
    initAgendaTabs();
    initSecretAgenda();
    initActivityVoting();
});
