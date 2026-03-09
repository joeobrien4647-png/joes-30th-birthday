/* ============================================
   Schedule Page JavaScript
   ============================================ */

/* ---- Activity Voting Data ---- */
const AV_CATEGORIES = [
    { id: 'all', label: 'All', emoji: '\u2728' },
    { id: 'wine', label: 'Wine & Tasting', emoji: '\uD83C\uDF77' },
    { id: 'chateau', label: 'Châteaux', emoji: '\uD83C\uDFF0' },
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
        groupFit: 'Split across 2\u20133 hire cars with guides',
        mood: ['cultural', 'social'],
        highlight: false,
        pairedWith: null
    },
    {
        id: 'chenonceau',
        name: 'Ch\u00e2teau de Chenonceau',
        category: 'chateau',
        emoji: '\uD83C\uDFF0',
        tagline: 'The most beautiful château, spanning the River Cher',
        description: 'Perhaps the most stunning Loire ch\u00e2teau \u2014 a Renaissance masterpiece built spanning the River Cher. Famous for its gallery bridge, formal gardens, and rich history connected to Diane de Poitiers and Catherine de Medici. The on-site L\'Orangerie restaurant serves excellent French cuisine.',
        cost: { min: 19, max: 24 },
        duration: '2\u20133 hours',
        driveTime: '1h 15m',
        groupFit: 'All 26 \u2014 no group limit',
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
        groupFit: 'All 26 \u2014 e-bikes available on grounds',
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
        groupFit: 'All 26 \u2014 guided tours for groups of 15+',
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
        groupFit: 'All 26 \u2014 group rate applies!',
        mood: ['cultural', 'chill'],
        highlight: false,
        pairedWith: null
    },
    {
        id: 'hot-air-balloon',
        name: 'Hot Air Balloon Over the Châteaux',
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
        groupFit: 'All 26 \u2014 large group bookings welcome',
        mood: ['adventure', 'chill'],
        highlight: true,
        pairedWith: null,
        status: 'booked'
    },
    {
        id: 'kayak-chenonceau',
        name: 'Kayak Under Ch\u00e2teau de Chenonceau',
        category: 'adventure',
        emoji: '\uD83C\uDFDE\uFE0F',
        tagline: 'Paddle directly underneath a Renaissance château',
        description: 'A genuinely unique experience: kayak on the River Cher and pass directly underneath the arches of Ch\u00e2teau de Chenonceau. One of the most extraordinary perspectives of any ch\u00e2teau in France. Best combined with a Chenonceau visit for the ultimate combo day trip.',
        cost: { min: 15, max: 40 },
        duration: '1.5\u20133 hours',
        driveTime: '1h 15m',
        groupFit: 'All 26 \u2014 2\u20133 seater kayaks available',
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
        groupFit: 'All 26 \u2014 bikes delivered to meeting point',
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
        description: 'Learn to prepare classic French dishes with a professional chef. Options range from a 2-hour pastry masterclass (croissants, tarte Tatin) to a full half-day 3-course meal experience. Some chefs come to the château; others run it from their own kitchens. You eat everything you make!',
        cost: { min: 60, max: 150 },
        duration: '2\u20136 hours',
        driveTime: 'At château or 1h+',
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
        groupFit: 'All 26 \u2014 free-roam the market',
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
        tagline: 'Professional chef cooks a multi-course feast at the château',
        description: 'Hire a private chef to cook a stunning multi-course birthday dinner right at the château. Local options include Ryan Matthee (25min away), Unarome2chefs (2 chefs, great for large groups), and Alexandre Timar (Tours). The ultimate way to celebrate Joe\'s 30th \u2014 no washing up!',
        cost: { min: 80, max: 150 },
        duration: 'Evening',
        driveTime: 'None \u2014 they come to us',
        groupFit: 'All 26 together',
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
        description: 'Outdoor karting track with 270cc adult karts PLUS a 4,000m\u00B2 paintball zone. Group packages bundle both activities. Perfect for a 5-team showdown. Includes bar, clubhouse, and picnic area.',
        cost: { min: 55, max: 70 },
        duration: '2\u20134 hours',
        driveTime: '1h 15m',
        groupFit: 'All 26 \u2014 ideal for team battles',
        mood: ['adventure', 'party'],
        highlight: false,
        pairedWith: null
    },
    {
        id: 'son-et-lumiere',
        name: 'Son et Lumi\u00e8re at Blois',
        category: 'fun',
        emoji: '\u2728',
        tagline: 'Spectacular sound & light show on a royal château',
        description: 'A legendary sound and light show projected onto the grand courtyard of the Royal Ch\u00e2teau of Blois. Music, narration, and dramatic lighting tell the castle\'s history. The original Loire Valley son et lumi\u00e8re, running since the 1950s. Show starts at 10pm \u2014 a magical late evening out.',
        cost: { min: 9, max: 14 },
        duration: '45 min show',
        driveTime: '1h 30m',
        groupFit: 'All 26 \u2014 large courtyard',
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
        groupFit: 'All 26 \u2014 group rates for 15+',
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
        description: 'The château sits within the Brenne Regional Natural Park. The Base de Plein Air in Le Blanc offers supervised archery, climbing, mountain biking, orienteering, kayak polo, and more. Qualified staff, all equipment provided. Perfect for team competitions without a long drive.',
        cost: { min: 10, max: 25 },
        duration: 'Half to full day',
        driveTime: '15 min',
        groupFit: 'All 26 \u2014 multiple activities simultaneously',
        mood: ['adventure', 'party'],
        highlight: false,
        pairedWith: null
    },
    {
        id: 'golf-val-indre',
        name: 'Golf at Val de l\'Indre',
        category: 'adventure',
        emoji: '\u26F3',
        tagline: '9 holes on a beautiful parkland course',
        description: 'Golf du Val de l\'Indre \u2014 a par-72 parkland course set in the grounds of a ch\u00e2teau with century-old cedars and oaks. 9 holes takes about 2 hours. Full club hire and buggies available. Optional \u2014 for those who fancy a morning round while others chill by the pool.',
        cost: { min: 65, max: 65 },
        duration: '2 hours (9 holes)',
        driveTime: '50 min',
        groupFit: 'Groups of 4\u201312 \u2014 optional activity',
        mood: ['chill', 'adventure'],
        highlight: false,
        pairedWith: null,
        status: 'booked'
    },
    {
        id: 'bellebouche',
        name: 'Bellebouche Accrobranche & Lake',
        category: 'adventure',
        emoji: '\uD83C\uDF33',
        tagline: 'Treetop adventure + lake activities in one spot',
        description: 'Bellebouche outdoor leisure base in the Brenne nature park. 7 accrobranche courses from easy to extreme (zip lines, Tarzan swings, 15m jump!), plus p\u00e9dalos, paddle boards, kayaks on the lake, and mini-golf. The keen ones hit the trees, the hungover ones float on the lake. Everyone wins.',
        cost: { min: 20, max: 20 },
        duration: 'Half day',
        driveTime: '25 min',
        groupFit: 'All 26 \u2014 group booking for 10+',
        mood: ['adventure', 'chill'],
        highlight: true,
        pairedWith: null,
        status: 'booked'
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
            const current = document.querySelector('.day-content.active');
            const next = document.querySelector('.day-content[data-day="' + day + '"]');
            if (current === next) return;

            // Remove active class from all tabs
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Crossfade: fade out current, fade in next
            if (current) {
                current.classList.add('day-exit');
                current.classList.remove('active');
            }
            next.classList.add('day-enter');
            next.classList.add('active');

            // Clean up animation classes after transition
            setTimeout(function() {
                if (current) current.classList.remove('day-exit');
                next.classList.remove('day-enter');
            }, 300);
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
    secretItems.forEach(item => {
        if (item.classList.contains('unlocked')) return;
        let clickCount = 0;
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
    if (!grid || !filtersEl || !resultsEl) return;

    const guestCode = Auth.getGuestCode();
    const isAdmin = Auth.isAdmin();
    let activeFilter = 'all';

    // Load state
    let votes = Store.get('av_votes', {});
    let userVotes = Store.get('av_userVotes', {});
    let statuses = Store.get('av_statuses', {});

    // Sync confirmed activities from data into statuses (admin can still override)
    ACTIVITIES.forEach(act => {
        if (act.status && !statuses[act.id]) {
            statuses[act.id] = act.status;
        }
    });
    Store.set('av_statuses', statuses);

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
        if (!filtersEl) return;
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
        if (!resultsEl) return;
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

/* ============================================
   Activity Sign-up Board (Firebase-powered)
   ============================================ */

var SIGNUP_ACTIVITIES = [
    { id: 'golf', name: 'Golf', day: 'Thu 30 Apr \u2014 Morning', desc: '9 holes at Golf du Val de l\'Indre. Relaxed round, all levels welcome.', cost: '~\u20AC65/person', icon: '\u26F3' },
    { id: 'canoe', name: 'Canoeing', day: 'Fri 1 May \u2014 Morning', desc: 'Paddle down the Creuse river from Ciron. Beautiful scenery, easy going.', cost: '~\u20AC15\u201318/person', icon: '\uD83D\uDEF6' },
    { id: 'bellebouche', name: 'Bellebouche', day: 'Sun 3 May \u2014 Afternoon', desc: 'Accrobranche (tree-top adventure) + lake activities.', cost: '~\u20AC20/person', icon: '\uD83C\uDF32' }
];

var TOTAL_GUESTS = 26;
var SIGNUP_DEADLINE = new Date('2026-04-01');

function isSignupsClosed() {
    return new Date() > SIGNUP_DEADLINE;
}

function initActivitySignups() {
    var container = document.getElementById('activity-signups-container');
    if (!container) return;

    var signupsData = {};

    function getGuestCode() {
        return (typeof Auth !== 'undefined' && Auth.isLoggedIn()) ? Auth.getGuestCode() : null;
    }

    function getGuestName() {
        if (typeof Auth === 'undefined' || !Auth.isLoggedIn()) return null;
        var gd = Auth.getGuestData();
        return gd ? gd.fullName || gd.name : null;
    }

    function getSignupList(actId) {
        var actData = signupsData[actId];
        if (!actData) return [];
        var entries = [];
        var keys = Object.keys(actData);
        for (var i = 0; i < keys.length; i++) {
            var entry = actData[keys[i]];
            if (entry && entry.name) {
                entries.push({ code: keys[i], name: entry.name, timestamp: entry.timestamp || 0 });
            }
        }
        entries.sort(function(a, b) { return a.timestamp - b.timestamp; });
        return entries;
    }

    function handleSignup(actId) {
        var guestCode = getGuestCode();
        var guestName = getGuestName();
        if (!guestCode || !guestName) return;
        if (isSignupsClosed()) return;

        var list = getSignupList(actId);
        var isSignedUp = false;
        for (var i = 0; i < list.length; i++) {
            if (list[i].code === guestCode) { isSignedUp = true; break; }
        }

        if (isSignedUp) {
            // Withdraw — remove from Firebase, no feed post
            if (typeof FirebaseSync !== 'undefined' && FirebaseSync.isConfigured()) {
                FirebaseSync.remove('signups/' + actId, guestCode);
            }
        } else {
            // Sign up — write to Firebase + post to feed
            if (typeof FirebaseSync !== 'undefined' && FirebaseSync.isConfigured()) {
                FirebaseSync.set('signups/' + actId + '/' + guestCode, { name: guestName, timestamp: Date.now() });
                var actObj = null;
                for (var j = 0; j < SIGNUP_ACTIVITIES.length; j++) {
                    if (SIGNUP_ACTIVITIES[j].id === actId) { actObj = SIGNUP_ACTIVITIES[j]; break; }
                }
                FirebaseSync.push('feed', {
                    type: 'signup',
                    guestCode: guestCode,
                    guestName: guestName,
                    content: 'signed up for ' + (actObj ? actObj.name : actId),
                    timestamp: Date.now()
                });
            }
            if (typeof triggerMiniConfetti === 'function') triggerMiniConfetti();
        }
    }

    function handleAdminToggle(actId, code, name) {
        if (isSignupsClosed()) return;
        if (typeof FirebaseSync === 'undefined' || !FirebaseSync.isConfigured()) return;

        var list = getSignupList(actId);
        var found = false;
        for (var i = 0; i < list.length; i++) {
            if (list[i].code === code) { found = true; break; }
        }

        if (found) {
            FirebaseSync.remove('signups/' + actId, code);
        } else {
            FirebaseSync.set('signups/' + actId + '/' + code, { name: name, timestamp: Date.now() });
        }
    }

    function render() {
        var guestCode = getGuestCode();
        var guestName = getGuestName();
        var closed = isSignupsClosed();
        var isAdmin = typeof Auth !== 'undefined' && Auth.isAdmin();

        var html = '<div class="signup-grid">';

        for (var a = 0; a < SIGNUP_ACTIVITIES.length; a++) {
            var act = SIGNUP_ACTIVITIES[a];
            var list = getSignupList(act.id);
            var count = list.length;
            var isSignedUp = false;
            for (var s = 0; s < list.length; s++) {
                if (list[s].code === guestCode) { isSignedUp = true; break; }
            }

            html += '<div class="signup-card' + (closed ? ' signup-closed' : '') + '">';

            // Header
            html += '<div class="signup-card-header">' +
                '<span class="signup-emoji">' + act.icon + '</span>' +
                '<div class="signup-card-info">' +
                    '<h3>' + escapeHtml(act.name) + '</h3>' +
                    '<span class="signup-day">' + escapeHtml(act.day) + '</span>' +
                '</div>' +
                '<span class="signup-cost">' + escapeHtml(act.cost) + '</span>' +
            '</div>';

            // Description
            html += '<p class="signup-desc">' + escapeHtml(act.desc) + '</p>';

            // Headcount
            html += '<div class="signup-capacity">' +
                '<span class="signup-capacity-label">' +
                    '<strong>' + count + '</strong>/' + TOTAL_GUESTS + ' going' +
                '</span>' +
                '<div class="signup-capacity-bar">' +
                    '<div class="signup-capacity-fill" style="width:' + Math.round((count / TOTAL_GUESTS) * 100) + '%"></div>' +
                '</div>' +
            '</div>';

            // Action button
            if (closed) {
                html += '<button class="btn signup-btn signup-btn-closed" disabled>Sign-ups closed</button>';
            } else if (guestCode) {
                if (isSignedUp) {
                    html += '<button class="btn signup-btn signed-up" data-id="' + act.id + '">' +
                        "\u2705 I'm In! \u2014 Tap to withdraw</button>";
                } else {
                    html += '<button class="btn signup-btn" data-id="' + act.id + '">' +
                        "I'm In!</button>";
                }
            } else {
                html += '<p class="signup-login-note">Log in to sign up</p>';
            }

            // Expandable guest list
            html += '<div class="signup-people-toggle" data-act="' + act.id + '">';
            if (count > 0) {
                html += '<button class="signup-people-expand-btn" data-act="' + act.id + '">' +
                    '<span class="signup-people-expand-label">Who\'s going (' + count + ')</span>' +
                    '<span class="signup-people-expand-arrow">\u25BE</span>' +
                '</button>';
                html += '<div class="signup-people-list" id="signup-people-list-' + act.id + '">';
                html += '<div class="signup-people-tags">';
                for (var p = 0; p < list.length; p++) {
                    var isSelf = list[p].code === guestCode;
                    html += '<span class="signup-person-tag' + (isSelf ? ' you' : '') + '">' + escapeHtml(list[p].name) + '</span>';
                }
                html += '</div></div>';
            } else {
                html += '<div class="empty-state"><span class="empty-state-emoji">\uD83C\uDFAF</span><p>No sign-ups yet \u2014 be the first!</p></div>';
            }
            html += '</div>';

            html += '</div>'; // end signup-card
        }

        html += '</div>'; // end signup-grid

        // Admin manage section
        if (isAdmin && !closed) {
            html += renderAdminManageHTML();
        }

        container.innerHTML = html;
        bindEvents();
    }

    function renderAdminManageHTML() {
        var allGuests = [];
        var codes = Object.keys(GUEST_DATA);
        for (var i = 0; i < codes.length; i++) {
            allGuests.push({ code: codes[i], name: GUEST_DATA[codes[i]].fullName || GUEST_DATA[codes[i]].name });
        }
        allGuests.sort(function(a, b) { return a.name.localeCompare(b.name); });

        var html = '<div class="admin-activity-panel">' +
            '<div class="admin-panel-toggle" id="admin-panel-toggle">' +
                '<span>\uD83D\uDD11 Admin: Manage Sign-ups</span>' +
                '<span class="admin-toggle-arrow">\u25BE</span>' +
            '</div>' +
            '<div class="admin-panel-body" id="admin-panel-body">';

        html += '<p class="admin-panel-note">Add or remove guests from activities. Changes sync to all devices in real time.</p>';

        for (var a = 0; a < SIGNUP_ACTIVITIES.length; a++) {
            var act = SIGNUP_ACTIVITIES[a];
            var list = getSignupList(act.id);
            var signedCodes = {};
            for (var s = 0; s < list.length; s++) { signedCodes[list[s].code] = true; }

            html += '<div class="admin-act-section">' +
                '<div class="admin-act-header">' +
                    '<span>' + act.icon + ' ' + escapeHtml(act.name) + ' (' + escapeHtml(act.day) + ')</span>' +
                    '<span class="admin-act-count">' + list.length + ' signed up</span>' +
                '</div>' +
                '<div class="admin-guest-grid">';

            for (var g = 0; g < allGuests.length; g++) {
                var checked = !!signedCodes[allGuests[g].code];
                html += '<label class="admin-guest-check' + (checked ? ' checked' : '') + '">' +
                    '<input type="checkbox" data-act="' + act.id + '" data-code="' + allGuests[g].code + '" data-gname="' + escapeHtml(allGuests[g].name) + '"' + (checked ? ' checked' : '') + '> ' +
                    escapeHtml(allGuests[g].name) + '</label>';
            }

            html += '</div></div>';
        }

        html += '</div></div>';
        return html;
    }

    function bindEvents() {
        // Sign-up / withdraw buttons
        var btns = container.querySelectorAll('.signup-btn[data-id]');
        for (var i = 0; i < btns.length; i++) {
            btns[i].addEventListener('click', function() {
                handleSignup(this.getAttribute('data-id'));
            });
        }

        // Expandable guest lists
        var expandBtns = container.querySelectorAll('.signup-people-expand-btn');
        for (var j = 0; j < expandBtns.length; j++) {
            expandBtns[j].addEventListener('click', function() {
                var actId = this.getAttribute('data-act');
                var listEl = document.getElementById('signup-people-list-' + actId);
                var arrow = this.querySelector('.signup-people-expand-arrow');
                if (listEl) {
                    var isOpen = listEl.classList.contains('open');
                    if (isOpen) {
                        listEl.classList.remove('open');
                        if (arrow) arrow.textContent = '\u25BE';
                    } else {
                        listEl.classList.add('open');
                        if (arrow) arrow.textContent = '\u25B4';
                    }
                }
            });
        }

        // Admin panel toggle
        var adminToggle = document.getElementById('admin-panel-toggle');
        if (adminToggle) {
            adminToggle.addEventListener('click', function() {
                var body = document.getElementById('admin-panel-body');
                var arrow = this.querySelector('.admin-toggle-arrow');
                if (body) {
                    var open = body.style.display !== 'none';
                    body.style.display = open ? 'none' : 'block';
                    if (arrow) arrow.textContent = open ? '\u25BE' : '\u25B4';
                }
            });
        }

        // Admin checkboxes
        var adminCbs = container.querySelectorAll('.admin-guest-check input[type=checkbox]');
        for (var k = 0; k < adminCbs.length; k++) {
            adminCbs[k].addEventListener('change', function() {
                var actId = this.getAttribute('data-act');
                var code = this.getAttribute('data-code');
                var gname = this.getAttribute('data-gname');
                handleAdminToggle(actId, code, gname);
            });
        }
    }

    // Listen for real-time updates from Firebase
    if (typeof FirebaseSync !== 'undefined' && FirebaseSync.isConfigured()) {
        FirebaseSync.onUpdate('signups', function(data) {
            signupsData = data || {};
            render();
        });
    }

    // Also listen for the custom event from firebase-config.js collection listener
    document.addEventListener('signupsUpdate', function(e) {
        signupsData = e.detail || {};
        render();
    });

    // Initial render (will show empty until Firebase data arrives)
    render();
}

/* ============================================
   Swipe Navigation for Agenda Tabs
   ============================================ */

function initAgendaSwipe() {
    var content = document.querySelector('.agenda-content');
    var tabBtns = document.querySelectorAll('.tab-btn');
    var leftArrow = document.getElementById('agenda-arrow-left');
    var rightArrow = document.getElementById('agenda-arrow-right');

    if (!content || !tabBtns.length) return;

    var totalDays = tabBtns.length;

    function getCurrentDay() {
        var active = document.querySelector('.tab-btn.active');
        return active ? parseInt(active.dataset.day) : 1;
    }

    function switchToDay(day) {
        if (day < 1 || day > totalDays) return;
        var dayContents = document.querySelectorAll('.day-content');
        tabBtns.forEach(function(b) { b.classList.remove('active'); });
        dayContents.forEach(function(c) { c.classList.remove('active'); });

        var targetBtn = document.querySelector('.tab-btn[data-day="' + day + '"]');
        var targetContent = document.querySelector('.day-content[data-day="' + day + '"]');
        if (targetBtn) targetBtn.classList.add('active');
        if (targetContent) targetContent.classList.add('active');

        updateArrows(day);
    }

    function updateArrows(day) {
        if (leftArrow) leftArrow.disabled = (day <= 1);
        if (rightArrow) rightArrow.disabled = (day >= totalDays);
    }

    // Arrow buttons
    if (leftArrow) {
        leftArrow.addEventListener('click', function() {
            var current = getCurrentDay();
            switchToDay(current - 1);
        });
    }

    if (rightArrow) {
        rightArrow.addEventListener('click', function() {
            var current = getCurrentDay();
            switchToDay(current + 1);
        });
    }

    // Update arrows when tabs are clicked directly
    tabBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            var day = parseInt(this.dataset.day);
            updateArrows(day);
        });
    });

    // Touch swipe support
    var touchStartX = 0;
    var touchStartY = 0;
    var touchMoveX = 0;
    var swiping = false;

    content.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchMoveX = touchStartX;
        swiping = false;
    }, { passive: true });

    content.addEventListener('touchmove', function(e) {
        touchMoveX = e.touches[0].clientX;
        var diffX = touchMoveX - touchStartX;
        var diffY = e.touches[0].clientY - touchStartY;

        // Only treat as horizontal swipe if predominantly horizontal
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 20) {
            swiping = true;
            // Visual feedback: slight translate
            var translate = Math.max(-40, Math.min(40, diffX * 0.3));
            var activeDay = content.querySelector('.day-content.active');
            if (activeDay) {
                activeDay.style.transform = 'translateX(' + translate + 'px)';
                activeDay.style.transition = 'none';
            }
        }
    }, { passive: true });

    content.addEventListener('touchend', function() {
        var diffX = touchMoveX - touchStartX;
        var activeDay = content.querySelector('.day-content.active');

        // Reset visual transform
        if (activeDay) {
            activeDay.style.transform = '';
            activeDay.style.transition = 'transform 0.2s ease';
            setTimeout(function() {
                if (activeDay) activeDay.style.transition = '';
            }, 200);
        }

        if (!swiping) return;

        var current = getCurrentDay();
        if (diffX < -50) {
            // Swiped left -> next day
            switchToDay(current + 1);
        } else if (diffX > 50) {
            // Swiped right -> prev day
            switchToDay(current - 1);
        }
    }, { passive: true });

    // Initial arrow state
    updateArrows(getCurrentDay());
}

/* ============================================
   Empty State Cards for Schedule Sections
   ============================================ */

function initScheduleEmptyStates() {
    // Activity Sign-ups — empty state is rendered inside initActivitySignups per card
}

/* ---- Time Bucket Toggles ---- */
function initTimeBuckets() {
    var isMobile = window.matchMedia('(max-width: 768px)').matches;

    document.querySelectorAll('.time-bucket-header').forEach(function(header) {
        header.addEventListener('click', function() {
            var bucket = this.closest('.time-bucket');
            var wasCollapsed = bucket.classList.contains('collapsed');
            bucket.classList.toggle('collapsed');

            // Accordion on mobile: opening one collapses siblings
            if (isMobile && wasCollapsed) {
                var day = bucket.closest('.day-content');
                if (day) {
                    day.querySelectorAll('.time-bucket').forEach(function(sib) {
                        if (sib !== bucket) sib.classList.add('collapsed');
                    });
                }
            }
        });
    });

    // On mobile, start all buckets collapsed except the first per day
    if (isMobile) {
        document.querySelectorAll('.day-content').forEach(function(day) {
            var buckets = day.querySelectorAll('.time-bucket');
            for (var i = 1; i < buckets.length; i++) {
                buckets[i].classList.add('collapsed');
            }
        });
    }
}

/* ---- Day Hero Data ---- */
var DAY_HERO_DATA = {
    '1': { emoji: '✈️', gradient: 'linear-gradient(135deg, #f97316, #fbbf24)', subtitle: 'France, Here We Come' },
    '2': { emoji: '🏰', gradient: 'linear-gradient(135deg, #059669, #34d399)', subtitle: 'Château Life Begins' },
    '3': { emoji: '🛶', gradient: 'linear-gradient(135deg, #0ea5e9, #6366f1)', subtitle: 'Paddles & a Beautiful Village' },
    '4': { emoji: '🎂', gradient: 'linear-gradient(135deg, #f59e0b, #ec4899, #a855f7)', subtitle: "The Birthday That Can\u2019t Be Topped" },
    '5': { emoji: '🌲', gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)', subtitle: 'Treetops, Lakes & Last Night' },
    '6': { emoji: '🏠', gradient: 'linear-gradient(135deg, #ec4899, #8b5cf6)', subtitle: 'Au Revoir, Roussignol' }
};

function injectDayHeroes() {
    document.querySelectorAll('.day-content').forEach(function(day) {
        if (day.querySelector('.day-hero')) return;
        var dayNum = day.dataset.day;
        var data = DAY_HERO_DATA[dayNum];
        if (!data) return;

        var h3 = day.querySelector(':scope > h3');
        if (!h3) return;
        var fullTitle = h3.textContent.trim();
        var dashIdx = fullTitle.indexOf(' - ');
        var datePart = dashIdx > -1 ? fullTitle.substring(0, dashIdx) : fullTitle;
        var namePart = dashIdx > -1 ? fullTitle.substring(dashIdx + 3) : '';

        var highlights = Array.from(day.querySelectorAll('.timeline-item.highlight .activity h4'))
            .slice(0, 3)
            .map(function(el) { return el.textContent.trim(); });

        var chipsHtml = highlights.map(function(h) {
            return '<span class="day-hero-chip">' + h + '</span>';
        }).join('');

        var hero = document.createElement('div');
        hero.className = 'day-hero';
        hero.style.setProperty('--hero-gradient', data.gradient);
        hero.innerHTML =
            '<div class="day-hero-band">' +
                '<span class="day-hero-big-emoji">' + data.emoji + '</span>' +
                '<div class="day-hero-date">' + datePart + '</div>' +
                '<div class="day-hero-name">' + namePart + '</div>' +
                '<div class="day-hero-subtitle">' + data.subtitle + '</div>' +
            '</div>' +
            '<div class="day-hero-chips">' + chipsHtml + '</div>';

        day.insertBefore(hero, h3);
    });
}

/* ---- Day summary: group timeline items by Morning / Afternoon / Evening ---- */
function getPeriodLabel(timeRangeText) {
    var t = timeRangeText.trim().toLowerCase();
    if (t === 'afternoon') return 'Afternoon';
    if (t === 'evening') return 'Evening';
    if (t === 'morning') return 'Morning';
    // Fallback: parse numeric times like "9:00 AM"
    var match = t.match(/^~?(\d+)(?::\d+)?\s*(am|pm)/i);
    if (!match) return 'Morning';
    var hour = parseInt(match[1]);
    var ampm = match[2].toUpperCase();
    if (ampm === 'AM') return 'Morning';
    if (hour === 12 || hour <= 5) return 'Afternoon';
    return 'Evening';
}

var PERIOD_ICONS = { 'Morning': '☀️', 'Afternoon': '⛅', 'Evening': '🌙' };

function injectDaySummaries() {
    document.querySelectorAll('.day-content').forEach(function(day) {
        if (day.querySelector('.day-poster')) return;
        var timeline = day.querySelector('.timeline');
        if (!timeline) return;

        var dayNum = day.dataset.day;
        var heroData = DAY_HERO_DATA[dayNum];
        var gradient = heroData ? heroData.gradient : 'linear-gradient(135deg, #667eea, #764ba2)';

        // Group items by period, preserving order of first appearance
        var periods = [];
        var periodMap = {};
        day.querySelectorAll('.time-bucket').forEach(function(bucket) {
            var timeRangeEl = bucket.querySelector('.bucket-time-range');
            var period = timeRangeEl ? getPeriodLabel(timeRangeEl.textContent.trim()) : 'Morning';
            if (!periodMap[period]) {
                periodMap[period] = [];
                periods.push(period);
            }
            bucket.querySelectorAll('.timeline-item').forEach(function(item) {
                var h4 = item.querySelector('.activity h4');
                if (!h4) return;
                // Get text without badge spans
                var name = h4.cloneNode(true);
                var badges = name.querySelectorAll('.activity-badge');
                badges.forEach(function(b) { b.remove(); });
                periodMap[period].push({
                    name: name.textContent.trim(),
                    highlight: item.classList.contains('highlight'),
                    secret: item.classList.contains('top-secret')
                });
            });
        });

        // Build 3-column poster — max 3 items per period, highlights first
        var MAX_PER_PERIOD = 3;
        var colsHtml = periods.map(function(period, i) {
            var icon = PERIOD_ICONS[period] || '•';
            var all = periodMap[period];
            var highlights = all.filter(function(x) { return x.highlight || x.secret; });
            var rest = all.filter(function(x) { return !x.highlight && !x.secret; });
            var shown = highlights.concat(rest).slice(0, MAX_PER_PERIOD);
            var itemsHtml = shown.map(function(item) {
                var cls = 'dp-item' +
                    (item.highlight ? ' dp-highlight' : '') +
                    (item.secret ? ' dp-secret' : '');
                var name = item.secret ? '\uD83D\uDD12 Secret' : item.name;
                return '<li class="' + cls + '">' + name + '</li>';
            }).join('');
            var divider = i > 0 ? '<div class="dp-divider"></div>' : '';
            return divider +
                '<div class="dp-col">' +
                    '<div class="dp-col-header">' +
                        '<span class="dp-period-icon">' + icon + '</span>' + period +
                    '</div>' +
                    '<ul class="dp-list">' + itemsHtml + '</ul>' +
                '</div>';
        }).join('');

        var poster = document.createElement('div');
        poster.className = 'day-poster';
        poster.style.setProperty('--poster-gradient', gradient);
        poster.innerHTML = colsHtml;

        var toggle = document.createElement('button');
        toggle.className = 'full-schedule-toggle';
        toggle.innerHTML = 'Full Schedule <span class="fst-chevron">&#9660;</span>';
        toggle.addEventListener('click', function() {
            var isOpen = timeline.classList.toggle('full-schedule-open');
            toggle.classList.toggle('open', isOpen);
            toggle.innerHTML = (isOpen ? 'Hide Schedule' : 'Full Schedule') +
                ' <span class="fst-chevron">&#9660;</span>';
        });

        timeline.parentNode.insertBefore(poster, timeline);
        timeline.parentNode.insertBefore(toggle, timeline);
    });
}


/* ---- Scroll-spy: highlight active sub-nav link ---- */
function initScrollSpy() {
    var links = document.querySelectorAll('.sub-nav-links a');
    var sections = [];
    links.forEach(function(link) {
        var id = link.getAttribute('href').replace('#', '');
        var el = document.getElementById(id);
        if (el) sections.push({ el: el, link: link });
    });
    if (!sections.length) return;

    function onScroll() {
        var scrollY = window.scrollY + 180;
        var active = sections[0];
        for (var i = sections.length - 1; i >= 0; i--) {
            if (sections[i].el.offsetTop <= scrollY) {
                active = sections[i];
                break;
            }
        }
        links.forEach(function(l) { l.classList.remove('active'); });
        if (active) active.link.classList.add('active');
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

/* ============================================
   Envelope Sound Effects (Web Audio API)
   ============================================ */
var envelopeAudioCtx = null;
function getEnvelopeAudio() {
    if (!envelopeAudioCtx) {
        envelopeAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (envelopeAudioCtx.state === 'suspended') envelopeAudioCtx.resume();
    return envelopeAudioCtx;
}

function playSwordSlash() {
    try {
        var ctx = getEnvelopeAudio();
        var t = ctx.currentTime;
        // White noise swoosh
        var bufferLen = ctx.sampleRate * 0.35;
        var buffer = ctx.createBuffer(1, bufferLen, ctx.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < bufferLen; i++) data[i] = (Math.random() * 2 - 1);
        var noise = ctx.createBufferSource();
        noise.buffer = buffer;
        // Bandpass sweep for metallic slash
        var bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(800, t);
        bp.frequency.exponentialRampToValueAtTime(4000, t + 0.08);
        bp.frequency.exponentialRampToValueAtTime(1200, t + 0.3);
        bp.Q.value = 3;
        var gain = ctx.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.5, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
        noise.connect(bp); bp.connect(gain); gain.connect(ctx.destination);
        noise.start(t); noise.stop(t + 0.35);
        // Metallic ring
        var osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2800, t);
        osc.frequency.exponentialRampToValueAtTime(1400, t + 0.15);
        var g2 = ctx.createGain();
        g2.gain.setValueAtTime(0.12, t);
        g2.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.connect(g2); g2.connect(ctx.destination);
        osc.start(t); osc.stop(t + 0.25);
    } catch(e) {}
}

function playFireworksPops() {
    try {
        var ctx = getEnvelopeAudio();
        var t = ctx.currentTime;
        // Multiple pops at staggered times
        for (var i = 0; i < 12; i++) {
            (function(idx) {
                var delay = idx * 0.08 + Math.random() * 0.06;
                var bufLen = Math.floor(ctx.sampleRate * 0.12);
                var buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
                var d = buf.getChannelData(0);
                for (var j = 0; j < bufLen; j++) d[j] = (Math.random() * 2 - 1);
                var src = ctx.createBufferSource();
                src.buffer = buf;
                var hp = ctx.createBiquadFilter();
                hp.type = 'highpass';
                hp.frequency.value = 1000 + Math.random() * 3000;
                var g = ctx.createGain();
                g.gain.setValueAtTime(0, t + delay);
                g.gain.linearRampToValueAtTime(0.25 + Math.random() * 0.15, t + delay + 0.005);
                g.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.1);
                src.connect(hp); hp.connect(g); g.connect(ctx.destination);
                src.start(t + delay); src.stop(t + delay + 0.12);
            })(i);
        }
        // Low boom
        var boom = ctx.createOscillator();
        boom.type = 'sine';
        boom.frequency.setValueAtTime(120, t);
        boom.frequency.exponentialRampToValueAtTime(40, t + 0.4);
        var bg = ctx.createGain();
        bg.gain.setValueAtTime(0.35, t);
        bg.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        boom.connect(bg); bg.connect(ctx.destination);
        boom.start(t); boom.stop(t + 0.5);
    } catch(e) {}
}

function playCrowdCheer() {
    try {
        var ctx = getEnvelopeAudio();
        var t = ctx.currentTime;
        // Crowd cheer approximation: filtered noise swell
        var dur = 2.0;
        var bufLen = Math.floor(ctx.sampleRate * dur);
        var buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        var d = buf.getChannelData(0);
        for (var i = 0; i < bufLen; i++) d[i] = (Math.random() * 2 - 1);
        var src = ctx.createBufferSource();
        src.buffer = buf;
        // Bandpass to shape crowd-like frequencies
        var bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 2000;
        bp.Q.value = 0.8;
        // Second filter for warmth
        var lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 4500;
        var g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.18, t + 0.15);
        g.gain.setValueAtTime(0.18, t + 0.8);
        g.gain.linearRampToValueAtTime(0.22, t + 1.0);
        g.gain.exponentialRampToValueAtTime(0.01, t + dur);
        src.connect(bp); bp.connect(lp); lp.connect(g); g.connect(ctx.destination);
        src.start(t); src.stop(t + dur);
    } catch(e) {}
}

/* ============================================
   Envelope Opening Animation
   ============================================ */
function initEnvelopeAnimation() {
    var overlay = document.getElementById('envelope-overlay');
    if (!overlay) return;

    // Only play once per session
    var SEEN_KEY = 'envelope_seen';
    if (localStorage.getItem(SEEN_KEY)) {
        overlay.classList.add('envelope-hidden');
        return;
    }

    // Reduced motion: skip entirely
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        localStorage.setItem(SEEN_KEY, 'true');
        overlay.classList.add('envelope-hidden');
        return;
    }

    // Lock scroll and hide page content
    document.body.classList.add('envelope-active', 'modal-open');

    var envelope = document.getElementById('envelope');
    var skipBtn = document.getElementById('envelope-skip');
    var opened = false;

    // Entrance animation
    overlay.classList.add('envelope-entering');

    // After entrance settles, add gentle pulse to draw attention
    setTimeout(function() {
        if (!opened) envelope.classList.add('waiting');
    }, 2000);

    // Open sequence
    function openEnvelope() {
        envelope.classList.remove('waiting');
        if (opened) return;
        opened = true;

        // Hide tap hint immediately
        var hint = document.querySelector('.envelope-tap-hint');
        if (hint) hint.style.opacity = '0';

        // Phase 1: Seal cracks (0ms)
        envelope.classList.add('seal-cracking');

        // Phase 2: Sword slashes across the top (300ms)
        setTimeout(function() {
            envelope.classList.add('sword-slashing');
            spawnSwordSparks(envelope);
            playSwordSlash();
            // Cut line follows slightly behind the sword
            setTimeout(function() {
                envelope.classList.add('cut-opening');
            }, 100);
        }, 300);

        // Phase 3: Letter rises out of opened envelope (1100ms)
        setTimeout(function() {
            envelope.classList.add('letter-rising');
        }, 1100);

        // Phase 4: Fireworks burst (2000ms — just as letter clears the envelope)
        setTimeout(function() {
            spawnFireworks();
            playFireworksPops();
            playCrowdCheer();
        }, 2000);

        // Phase 5: Show fullscreen letter (2400ms)
        setTimeout(function() {
            showLetterFullscreen();
        }, 2400);
    }

    function spawnSwordSparks(envelopeEl) {
        var SPARK_COUNT = 8;
        var startDelay = 150; // sparks start as sword hits the envelope edge
        for (var i = 0; i < SPARK_COUNT; i++) {
            (function(idx) {
                setTimeout(function() {
                    var spark = document.createElement('div');
                    spark.className = 'sword-spark';
                    // Position along the top edge, spread across the cut path
                    var progress = idx / SPARK_COUNT;
                    spark.style.left = (progress * 85 + 5) + '%';
                    spark.style.top = '-2px';
                    spark.style.setProperty('--sx', (Math.random() * 16 - 8) + 'px');
                    spark.style.setProperty('--sy', (-10 - Math.random() * 20) + 'px');
                    envelopeEl.appendChild(spark);
                    requestAnimationFrame(function() { spark.classList.add('spark-active'); });
                    setTimeout(function() { if (spark.parentNode) spark.remove(); }, 600);
                }, startDelay + idx * 55);
            })(i);
        }
    }

    function skipAnimation() {
        // Close letter fullscreen if it's showing
        var lfs = document.getElementById('letter-fullscreen');
        if (lfs && lfs.style.display === 'flex') {
            lfs.style.opacity = '0';
            setTimeout(revealPage, 300);
            return;
        }
        if (opened) return;
        opened = true;
        revealPage();
    }

    function revealPage() {
        localStorage.setItem(SEEN_KEY, 'true');

        // Hide letter fullscreen if showing
        var lfs = document.getElementById('letter-fullscreen');
        if (lfs) { lfs.style.display = 'none'; }

        // Scroll to top BEFORE revealing content
        window.scrollTo(0, 0);

        // Mark all sections as visible so scroll-reveal doesn't re-hide them
        document.querySelectorAll('.section').forEach(function(s) {
            s.classList.add('visible');
        });

        overlay.classList.add('envelope-done');
        document.body.classList.add('envelope-revealed');
        document.body.classList.remove('modal-open');

        setTimeout(function() {
            overlay.remove();
            document.body.classList.remove('envelope-active', 'envelope-revealed');
            if (typeof triggerMiniConfetti === 'function') {
                triggerMiniConfetti();
            }
        }, 700);
    }

    function spawnFireworks() {
        var container = document.createElement('div');
        container.className = 'fireworks-container';
        document.body.appendChild(container);

        // Screen flash
        var flashEl = document.createElement('div');
        flashEl.className = 'fw-screen-flash';
        document.body.appendChild(flashEl);
        setTimeout(function() { if (flashEl.parentNode) flashEl.remove(); }, 500);

        var COLORS = [
            '#FFD700', '#FFF8DC', '#FFE066',   // golds
            '#FF6B9D', '#FFB3D1',               // pinks
            '#C8A2C8', '#A855F7',               // purples
            '#FFB347', '#FF8C00',               // oranges
            '#FFFFFF', '#FFFACD',               // whites/creams
            '#6BCB77', '#4ECDC4'                // green/teal
        ];

        var origins = [
            { x: 20, y: 20 }, { x: 50, y: 12 }, { x: 80, y: 20 },
            { x: 12, y: 55 }, { x: 88, y: 50 },
            { x: 35, y: 38 }, { x: 65, y: 35 },
            { x: 50, y: 65 }
        ];

        origins.forEach(function(origin, i) {
            setTimeout(function() {
                spawnBurst(container, origin.x, origin.y, COLORS, 48 + Math.floor(Math.random() * 18));
            }, i * 110 + Math.random() * 50);
        });

        setTimeout(function() { if (container.parentNode) container.remove(); }, 6000);
    }

    function spawnBurst(container, cx, cy, COLORS, count) {
        var flash = document.createElement('div');
        flash.className = 'fw-flash';
        flash.style.left = cx + 'vw';
        flash.style.top = cy + 'vh';
        container.appendChild(flash);

        for (var i = 0; i < count; i++) {
            var p = document.createElement('div');
            p.className = 'fw-particle';
            var angle = (i / count) * 360 + (Math.random() - 0.5) * (360 / count) * 0.8;
            var dist = 55 + Math.random() * 130;
            var dx = Math.cos(angle * Math.PI / 180) * dist;
            var dy = Math.sin(angle * Math.PI / 180) * dist;
            p.style.left = cx + 'vw';
            p.style.top = cy + 'vh';
            p.style.setProperty('--dx', dx + 'px');
            p.style.setProperty('--dy', dy + 'px');
            p.style.backgroundColor = COLORS[Math.floor(Math.random() * COLORS.length)];
            p.style.animationDelay = (Math.random() * 0.25) + 's';
            p.style.animationDuration = (0.75 + Math.random() * 0.85) + 's';
            var size = 3 + Math.random() * 7;
            p.style.width = size + 'px';
            p.style.height = size + 'px';
            if (Math.random() > 0.55) p.style.borderRadius = '2px';
            container.appendChild(p);
        }
    }

    function showLetterFullscreen() {
        var lfs = document.getElementById('letter-fullscreen');
        if (!lfs) { revealPage(); return; }

        // Darken overlay background to warm black
        overlay.style.background = 'rgba(8, 4, 2, 0.97)';

        lfs.style.display = 'flex';
        // Double rAF to allow display:flex to take effect before transition
        requestAnimationFrame(function() {
            requestAnimationFrame(function() {
                lfs.classList.add('lfs-visible');
                lfs.setAttribute('aria-hidden', 'false');
            });
        });

        function dismissLetter() {
            lfs.style.transition = 'opacity 0.4s ease';
            lfs.style.opacity = '0';
            setTimeout(revealPage, 400);
        }

        var cta = document.getElementById('letter-fs-cta');
        if (cta) cta.addEventListener('click', dismissLetter);

        var closeBtn = document.getElementById('letter-fs-close');
        if (closeBtn) closeBtn.addEventListener('click', dismissLetter);

        // Also wire skip button to dismiss letter
        skipBtn.removeEventListener('click', skipAnimation);
        skipBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            dismissLetter();
        });
    }

    // Event listeners
    envelope.addEventListener('click', openEnvelope);
    envelope.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openEnvelope();
        }
    });
    envelope.setAttribute('tabindex', '0');
    envelope.setAttribute('role', 'button');
    envelope.setAttribute('aria-label', 'Open your itinerary envelope');

    skipBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        skipAnimation();
    });

    // ESC to skip
    function handleEsc(e) {
        if (e.key === 'Escape') {
            skipAnimation();
            document.removeEventListener('keydown', handleEsc);
        }
    }
    document.addEventListener('keydown', handleEsc);

    // Focus envelope for keyboard users
    setTimeout(function() { envelope.focus(); }, 1100);
}

/* Envelope Replay Button */
(function() {
    var btn = document.getElementById('envelope-replay');
    if (!btn) return;
    btn.addEventListener('click', function() {
        localStorage.removeItem('envelope_seen');
        location.reload();
    });
})();

/* ---- Arrival Countdown ---- */
/* ---- Initialize on page load ---- */
/* ---- Agenda Overview Strip ---- */
function initOverviewStrip() {
    var overviewTiles = document.querySelectorAll('.overview-tile');
    var tabBtns = document.querySelectorAll('.tab-btn');

    if (!overviewTiles.length || !tabBtns.length) return;

    function syncOverviewActive() {
        var activeTab = document.querySelector('.tab-btn.active');
        if (!activeTab) return;
        var day = activeTab.dataset.day;
        overviewTiles.forEach(function(t) { t.classList.remove('active'); });
        var tile = document.querySelector('.overview-tile[data-day="' + day + '"]');
        if (tile) tile.classList.add('active');
    }

    // Click on overview tile → click the corresponding tab button
    overviewTiles.forEach(function(tile) {
        tile.addEventListener('click', function() {
            var tabBtn = document.querySelector('.tab-btn[data-day="' + this.dataset.day + '"]');
            if (tabBtn) tabBtn.click();
        });
    });

    // Watch tab buttons for .active class changes (covers tabs, arrows, swipe)
    var observer = new MutationObserver(syncOverviewActive);
    tabBtns.forEach(function(btn) {
        observer.observe(btn, { attributes: true, attributeFilter: ['class'] });
    });
}

/* ============================================
   Guest Highlighting — voted activity cards
   ============================================ */
function initScheduleHighlight() {
    function applyHighlights(d) {
        if (!d || !d.code) return;

        var userVotes = Store.get('av_userVotes', {});
        var myVotes = userVotes[d.code] || [];
        if (!myVotes.length) return;

        document.querySelectorAll('.av-card[data-id]').forEach(function(card) {
            if (myVotes.indexOf(card.dataset.id) !== -1) {
                card.classList.add('guest-voted-card');
            }
        });
    }

    // Listen for future events
    document.addEventListener('guestHighlight', function(e) { applyHighlights(e.detail); });

    // Apply immediately if already logged in
    if (typeof Auth !== 'undefined' && Auth.isLoggedIn()) {
        var guest = Auth.getGuestData();
        if (guest) applyHighlights({ name: guest.name, fullName: guest.fullName, room: guest.room, code: Auth.getGuestCode() });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initEnvelopeAnimation();
    initAgendaTabs();
    initSecretAgenda();
    initAgendaSwipe();
    initOverviewStrip();
    initActivitySignups();
    initScheduleEmptyStates();
    initTimeBuckets();
    injectDayHeroes();
    injectDaySummaries();
    initScrollSpy();
    initScheduleHighlight();
});
