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
        pairedWith: null,
        status: 'booked'
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
        pairedWith: null,
        status: 'booked'
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
        description: 'Outdoor karting track with 270cc adult karts PLUS a 4,000m\u00B2 paintball zone. Group packages bundle both activities. Perfect for a 5-team showdown. Includes bar, clubhouse, and picnic area.',
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
        groupFit: 'All 27 \u2014 group booking for 10+',
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
   Meal Planner / Dinner Voting
   ============================================ */

const MEAL_DAYS = [
    {
        day: 'Wed 29 Apr',
        label: 'Arrival Night',
        team: 'Everyone',
        options: [
            { id: 'wed-bbq', name: 'Welcome BBQ', emoji: '\uD83C\uDF56', desc: 'Fire up the BBQ - burgers, sausages, salads' },
            { id: 'wed-pasta', name: 'Big Pasta Night', emoji: '\uD83C\uDF5D', desc: 'Easy crowd-pleaser after a long drive' },
            { id: 'wed-takeaway', name: 'Order In / Takeaway', emoji: '\uD83D\uDCE6', desc: 'Keep it simple - order from Le Blanc' }
        ]
    },
    {
        day: 'Thu 30 Apr',
        label: 'First Full Day',
        team: 'Team 1',
        options: [
            { id: 'thu-bbq', name: 'BBQ Feast', emoji: '\uD83E\uDD69', desc: 'Steaks, chicken, grilled veg, salads' },
            { id: 'thu-curry', name: 'Big Curry Night', emoji: '\uD83C\uDF5B', desc: 'Curry, rice, naan - feeds the masses' },
            { id: 'thu-mexican', name: 'Taco Night', emoji: '\uD83C\uDF2E', desc: 'Build-your-own tacos, guac, salsa' },
            { id: 'thu-roast', name: 'French Roast Chicken', emoji: '\uD83C\uDF57', desc: 'Whole roast chickens with veg & potatoes' }
        ]
    },
    {
        day: 'Fri 1 May',
        label: 'Adventure Day',
        team: 'Team 2',
        options: [
            { id: 'fri-french', name: 'French Bistro Night', emoji: '\uD83C\uDDEB\uD83C\uDDF7', desc: 'Coq au vin, ratatouille, baguettes' },
            { id: 'fri-pizza', name: 'Homemade Pizza', emoji: '\uD83C\uDF55', desc: 'Everyone makes their own - fun & easy' },
            { id: 'fri-seafood', name: 'Seafood Spread', emoji: '\uD83E\uDD90', desc: 'Moules frites, prawns, fish' },
            { id: 'fri-out', name: 'Eat Out (restaurant)', emoji: '\uD83C\uDF7D\uFE0F', desc: 'Find a local restaurant instead' }
        ]
    },
    {
        day: 'Sat 2 May',
        label: 'JOE\'S BIRTHDAY!',
        team: 'Team 3',
        options: [
            { id: 'sat-feast', name: 'Birthday Feast', emoji: '\uD83C\uDF82', desc: 'Three-course birthday dinner - the works!' },
            { id: 'sat-bbqparty', name: 'Birthday BBQ Party', emoji: '\uD83C\uDF89', desc: 'Garden party vibes - BBQ + buffet' },
            { id: 'sat-banquet', name: 'French Banquet', emoji: '\uD83E\uDD42', desc: 'Cheese board, charcuterie, wine, proper French spread' }
        ]
    },
    {
        day: 'Sun 3 May',
        label: 'Recovery Day',
        team: 'Team 4',
        options: [
            { id: 'sun-comfort', name: 'Comfort Food', emoji: '\uD83C\uDF72', desc: 'Mac & cheese, shepherd\'s pie - hangover cures' },
            { id: 'sun-bbq2', name: 'Last Night BBQ', emoji: '\uD83D\uDD25', desc: 'Use up the rest - final BBQ blowout' },
            { id: 'sun-fajitas', name: 'Fajita Night', emoji: '\uD83C\uDF36\uFE0F', desc: 'Chicken & veggie fajitas with all the toppings' },
            { id: 'sun-leftover', name: 'Leftover Fiesta', emoji: '\uD83C\uDF7D\uFE0F', desc: 'Creative use of what\'s left - zero waste!' }
        ]
    }
];

function initMealPlanner() {
    const container = document.getElementById('meal-days');
    if (!container) return;

    const guestName = Auth.isLoggedIn() ? Auth.getGuestName() : null;
    let allVotes = Store.get('mealVotes', {});

    function render() {
        container.innerHTML = MEAL_DAYS.map(day => {
            const dayVotes = allVotes[day.day] || {};
            const myVote = guestName ? (dayVotes[guestName] || null) : null;

            return `
                <div class="meal-day-card">
                    <div class="meal-day-header">
                        <div>
                            <h3>${day.day}</h3>
                            <p class="meal-day-label">${escapeHtml(day.label)}</p>
                        </div>
                        <span class="meal-team-badge">${escapeHtml(day.team)} cooking</span>
                    </div>
                    <div class="meal-options">
                        ${day.options.map(opt => {
                            const voteCount = Object.values(dayVotes).filter(v => v === opt.id).length;
                            const isMyVote = myVote === opt.id;
                            return `
                                <button class="meal-option ${isMyVote ? 'voted' : ''}"
                                        data-day="${day.day}" data-option="${opt.id}"
                                        ${!guestName ? 'disabled title="Log in to vote"' : ''}>
                                    <span class="meal-emoji">${opt.emoji}</span>
                                    <div class="meal-option-info">
                                        <strong>${escapeHtml(opt.name)}</strong>
                                        <p>${escapeHtml(opt.desc)}</p>
                                    </div>
                                    <span class="meal-vote-count">${voteCount} vote${voteCount !== 1 ? 's' : ''}</span>
                                </button>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }).join('');

        // Bind click events
        container.querySelectorAll('.meal-option:not([disabled])').forEach(btn => {
            btn.addEventListener('click', function() {
                const day = this.dataset.day;
                const option = this.dataset.option;
                if (!allVotes[day]) allVotes[day] = {};

                if (allVotes[day][guestName] === option) {
                    delete allVotes[day][guestName];
                } else {
                    allVotes[day][guestName] = option;
                }

                Store.set('mealVotes', allVotes);
                render();
                triggerMiniConfetti();
            });
        });
    }

    render();
}

/* ============================================
   Rate the Chef
   ============================================ */

const CHEF_DINNERS = [
    { day: 2, team: 'Vouvray', label: 'Thu 30 Apr', emoji: '\uD83C\uDF77' },
    { day: 3, team: 'Chinon', label: 'Fri 1 May', emoji: '\uD83C\uDDEB\uD83C\uDDF7' },
    { day: 4, team: 'Sancerre', label: 'Sat 2 May', emoji: '\uD83C\uDF82', special: 'Birthday Feast!' },
    { day: 5, team: 'Muscadet', label: 'Sun 3 May', emoji: '\uD83C\uDF19' }
];

function initRateTheChef() {
    const container = document.getElementById('chef-ratings-container');
    if (!container) return;

    const guestCode = Auth.getGuestCode();
    let allRatings = Store.get('chefRatings', {});

    function getAverage(day) {
        const dayRatings = allRatings[day] || [];
        if (dayRatings.length === 0) return 0;
        const sum = dayRatings.reduce((s, r) => s + r.rating, 0);
        return (sum / dayRatings.length).toFixed(1);
    }

    function hasVoted(day) {
        const dayRatings = allRatings[day] || [];
        return dayRatings.some(r => r.voter === guestCode);
    }

    function getWinner() {
        const teams = CHEF_DINNERS.map(d => ({
            team: d.team,
            avg: parseFloat(getAverage(d.day)),
            count: (allRatings[d.day] || []).length
        }));
        const allRated = teams.every(t => t.count > 0);
        if (!allRated) return null;
        teams.sort((a, b) => b.avg - a.avg);
        return teams[0];
    }

    function render() {
        const winner = getWinner();

        let html = '';

        if (winner) {
            html += '<div class="chef-winner">' +
                '<span class="chef-winner-trophy">\uD83C\uDFC6</span>' +
                '<h3>Best Chefs: Team ' + escapeHtml(winner.team) + '!</h3>' +
                '<p>' + winner.avg + ' / 5 average rating</p>' +
            '</div>';
        }

        html += '<div class="chef-cards">';

        CHEF_DINNERS.forEach(function(dinner) {
            const dayRatings = allRatings[dinner.day] || [];
            const avg = getAverage(dinner.day);
            const voted = hasVoted(dinner.day);
            const bestDishes = dayRatings.filter(function(r) { return r.bestDish; }).map(function(r) { return r.bestDish; });
            const needsWork = dayRatings.filter(function(r) { return r.needsWork; }).map(function(r) { return r.needsWork; });

            html += '<div class="chef-card' + (dinner.special ? ' chef-card-special' : '') + '">' +
                '<div class="chef-card-header">' +
                    '<span class="chef-card-emoji">' + dinner.emoji + '</span>' +
                    '<div>' +
                        '<h4>Team ' + escapeHtml(dinner.team) + '</h4>' +
                        '<span class="chef-card-date">' + escapeHtml(dinner.label) + (dinner.special ? ' - ' + escapeHtml(dinner.special) : '') + '</span>' +
                    '</div>' +
                '</div>' +
                '<div class="chef-avg">' +
                    '<span class="chef-avg-number">' + (dayRatings.length > 0 ? avg : '-') + '</span>' +
                    '<span class="chef-avg-label">/ 5 (' + dayRatings.length + ' rating' + (dayRatings.length !== 1 ? 's' : '') + ')</span>' +
                '</div>' +
                '<div class="chef-stars-display">' + renderStarsDisplay(parseFloat(avg) || 0) + '</div>';

            if (!voted && guestCode) {
                html += '<div class="chef-rate-form" data-day="' + dinner.day + '">' +
                    '<div class="chef-stars-input">';
                for (var s = 1; s <= 5; s++) {
                    html += '<button class="chef-star" data-value="' + s + '">\u2606</button>';
                }
                html += '</div>' +
                    '<input type="text" class="chef-input" placeholder="Best dish?" data-field="bestDish" maxlength="80">' +
                    '<input type="text" class="chef-input" placeholder="Needs work?" data-field="needsWork" maxlength="80">' +
                    '<button class="btn btn-primary chef-submit-btn" data-day="' + dinner.day + '">Submit Rating</button>' +
                '</div>';
            } else if (voted) {
                html += '<div class="chef-voted-badge">\u2705 You\'ve rated this dinner</div>';
            } else {
                html += '<div class="chef-voted-badge">Log in to rate</div>';
            }

            if (bestDishes.length > 0) {
                html += '<div class="chef-feedback">' +
                    '<strong>\uD83C\uDF1F Best dishes:</strong>' +
                    '<div class="chef-feedback-list">' +
                        bestDishes.map(function(d) { return '<span class="chef-feedback-tag">' + escapeHtml(d) + '</span>'; }).join('') +
                    '</div>' +
                '</div>';
            }

            if (needsWork.length > 0) {
                html += '<div class="chef-feedback">' +
                    '<strong>\uD83D\uDCA1 Could improve:</strong>' +
                    '<div class="chef-feedback-list">' +
                        needsWork.map(function(d) { return '<span class="chef-feedback-tag needs-work">' + escapeHtml(d) + '</span>'; }).join('') +
                    '</div>' +
                '</div>';
            }

            html += '</div>';
        });

        html += '</div>';
        container.innerHTML = html;

        // Bind star clicks
        container.querySelectorAll('.chef-rate-form').forEach(function(form) {
            var selectedRating = 0;
            var stars = form.querySelectorAll('.chef-star');

            stars.forEach(function(star) {
                star.addEventListener('mouseenter', function() {
                    var val = parseInt(this.dataset.value);
                    stars.forEach(function(s) {
                        s.textContent = parseInt(s.dataset.value) <= val ? '\u2605' : '\u2606';
                        s.classList.toggle('active', parseInt(s.dataset.value) <= val);
                    });
                });

                star.addEventListener('mouseleave', function() {
                    stars.forEach(function(s) {
                        s.textContent = parseInt(s.dataset.value) <= selectedRating ? '\u2605' : '\u2606';
                        s.classList.toggle('active', parseInt(s.dataset.value) <= selectedRating);
                    });
                });

                star.addEventListener('click', function() {
                    selectedRating = parseInt(this.dataset.value);
                    stars.forEach(function(s) {
                        s.textContent = parseInt(s.dataset.value) <= selectedRating ? '\u2605' : '\u2606';
                        s.classList.toggle('active', parseInt(s.dataset.value) <= selectedRating);
                    });
                });
            });

            var submitBtn = form.querySelector('.chef-submit-btn');
            submitBtn.addEventListener('click', function() {
                if (selectedRating === 0) return;
                var day = parseInt(this.dataset.day);
                var bestDish = (form.querySelector('[data-field="bestDish"]').value || '').trim();
                var needsWorkVal = (form.querySelector('[data-field="needsWork"]').value || '').trim();

                if (!allRatings[day]) allRatings[day] = [];
                allRatings[day].push({
                    voter: guestCode,
                    rating: selectedRating,
                    bestDish: bestDish,
                    needsWork: needsWorkVal
                });

                Store.set('chefRatings', allRatings);
                render();
                if (typeof triggerMiniConfetti === 'function') triggerMiniConfetti();
            });
        });
    }

    function renderStarsDisplay(avg) {
        var html = '';
        for (var i = 1; i <= 5; i++) {
            if (avg >= i) {
                html += '<span class="chef-star-display filled">\u2605</span>';
            } else if (avg >= i - 0.5) {
                html += '<span class="chef-star-display half">\u2605</span>';
            } else {
                html += '<span class="chef-star-display">\u2606</span>';
            }
        }
        return html;
    }

    render();
}

/* ============================================
   Grocery List Builder
   ============================================ */

const GROCERY_TEAMS = [
    { id: 'vouvray', name: 'Vouvray', label: 'Day 2 - Thu Dinner' },
    { id: 'chinon', name: 'Chinon', label: 'Day 3 - Fri Dinner' },
    { id: 'sancerre', name: 'Sancerre', label: 'Day 4 - Sat Birthday Feast' },
    { id: 'muscadet', name: 'Muscadet', label: 'Day 5 - Sun Dinner' },
    { id: 'anjou', name: 'Anjou', label: 'Day 6 - Mon Breakfast' }
];

const GROCERY_STAPLES = [
    'Bread', 'Wine (red)', 'Wine (white)', 'Wine (ros\u00e9)',
    'Cheese', 'Butter', 'Olive oil', 'Salt & pepper', 'Garlic'
];

const GROCERY_MENUS = [
    { name: 'BBQ', emoji: '\uD83C\uDF56', items: ['Burgers', 'Sausages', 'Chicken', 'Corn on the cob', 'Salad', 'Bread rolls', 'BBQ sauce', 'Ketchup', 'Mustard'] },
    { name: 'French Classic', emoji: '\uD83C\uDDEB\uD83C\uDDF7', items: ['Ratatouille veg (courgettes, peppers, aubergine, tomatoes)', 'Coq au vin (chicken, mushrooms, bacon)', 'Croque monsieur (ham, Gruy\u00e8re, bread)', 'Dijon mustard'] },
    { name: 'Pasta Night', emoji: '\uD83C\uDF5D', items: ['Pasta (2-3 types)', 'Tomato sauce', 'Garlic bread', 'Parmesan', 'Salad', 'Minced beef', 'Onions'] },
    { name: 'Roast Dinner', emoji: '\uD83C\uDF57', items: ['Whole chickens (x4)', 'Roast potatoes', 'Mixed veg (carrots, broccoli, green beans)', 'Gravy granules', 'Yorkshire puddings', 'Stuffing'] }
];

function initGroceryList() {
    var container = document.getElementById('grocery-container');
    if (!container) return;

    var allLists = Store.get('groceryLists', {});
    var activeTeam = GROCERY_TEAMS[0].id;

    // Initialize default staples for any team that doesn't have a list yet
    GROCERY_TEAMS.forEach(function(team) {
        if (!allLists[team.id]) {
            allLists[team.id] = GROCERY_STAPLES.map(function(item) {
                return { text: item, checked: false };
            });
            Store.set('groceryLists', allLists);
        }
    });

    function render() {
        var teamData = GROCERY_TEAMS.find(function(t) { return t.id === activeTeam; });
        var items = allLists[activeTeam] || [];
        var checkedCount = items.filter(function(i) { return i.checked; }).length;

        var html = '<div class="grocery-tabs">';
        GROCERY_TEAMS.forEach(function(team) {
            html += '<button class="grocery-tab' + (team.id === activeTeam ? ' active' : '') + '" data-team="' + team.id + '">' +
                escapeHtml(team.name) + '<span>' + escapeHtml(team.label) + '</span></button>';
        });
        html += '</div>';

        html += '<div class="grocery-list-panel">' +
            '<div class="grocery-list-header">' +
                '<h4>Team ' + escapeHtml(teamData.name) + ' Shopping List</h4>' +
                '<span class="grocery-count">' + checkedCount + ' / ' + items.length + ' items</span>' +
            '</div>' +
            '<div class="grocery-add-row">' +
                '<input type="text" class="grocery-add-input" placeholder="Add an item..." maxlength="60" id="grocery-add-input">' +
                '<button class="btn btn-primary grocery-add-btn" id="grocery-add-btn">Add Item</button>' +
            '</div>' +
            '<div class="grocery-items">';

        items.forEach(function(item, idx) {
            html += '<label class="grocery-item' + (item.checked ? ' checked' : '') + '">' +
                '<input type="checkbox"' + (item.checked ? ' checked' : '') + ' data-idx="' + idx + '">' +
                '<span>' + escapeHtml(item.text) + '</span>' +
            '</label>';
        });

        html += '</div></div>';

        // Suggested Menus
        html += '<div class="grocery-menus">' +
            '<h4>Suggested Menus</h4>' +
            '<p class="grocery-menus-subtitle">Click items to add them to the current list</p>' +
            '<div class="grocery-menu-cards">';

        GROCERY_MENUS.forEach(function(menu) {
            html += '<div class="grocery-menu-card">' +
                '<h5>' + menu.emoji + ' ' + escapeHtml(menu.name) + '</h5>' +
                '<div class="grocery-menu-items">';

            menu.items.forEach(function(item) {
                var alreadyAdded = items.some(function(li) { return li.text.toLowerCase() === item.toLowerCase(); });
                html += '<button class="grocery-menu-item' + (alreadyAdded ? ' added' : '') + '" data-item="' + escapeHtml(item) + '">' +
                    (alreadyAdded ? '\u2713 ' : '+ ') + escapeHtml(item) +
                '</button>';
            });

            html += '</div></div>';
        });

        html += '</div></div>';

        container.innerHTML = html;

        // Bind events
        container.querySelectorAll('.grocery-tab').forEach(function(tab) {
            tab.addEventListener('click', function() {
                activeTeam = this.dataset.team;
                render();
            });
        });

        container.querySelectorAll('.grocery-item input').forEach(function(cb) {
            cb.addEventListener('change', function() {
                var idx = parseInt(this.dataset.idx);
                allLists[activeTeam][idx].checked = this.checked;
                Store.set('groceryLists', allLists);
                render();
            });
        });

        var addBtn = document.getElementById('grocery-add-btn');
        var addInput = document.getElementById('grocery-add-input');

        if (addBtn && addInput) {
            function addItem() {
                var text = addInput.value.trim();
                if (!text) return;
                allLists[activeTeam].push({ text: text, checked: false });
                Store.set('groceryLists', allLists);
                render();
            }

            addBtn.addEventListener('click', addItem);
            addInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') { e.preventDefault(); addItem(); }
            });
        }

        container.querySelectorAll('.grocery-menu-item:not(.added)').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var itemText = this.dataset.item;
                var exists = allLists[activeTeam].some(function(li) { return li.text.toLowerCase() === itemText.toLowerCase(); });
                if (!exists) {
                    allLists[activeTeam].push({ text: itemText, checked: false });
                    Store.set('groceryLists', allLists);
                    render();
                }
            });
        });
    }

    render();
}

/* ============================================
   Activity Sign-up Board
   ============================================ */

function initActivitySignups() {
    var container = document.getElementById('activity-signups-container');
    if (!container) return;

    var guestCode = Auth.getGuestCode();
    var guestName = Auth.isLoggedIn() ? Auth.getGuestName() : null;

    var SIGNUP_ACTIVITIES = [
        {
            id: 'golf',
            name: 'Golf - Val de l\'Indre',
            day: 'Day 2 (Thu 30 Apr)',
            cost: '~\u00A365/pp',
            max: 12,
            emoji: '\u26F3',
            description: '9-hole parkland course with century-old cedars. Club hire and buggies available. ~50 min drive from the chateau.'
        },
        {
            id: 'canoe',
            name: 'Canoeing on the Creuse',
            day: 'Day 3 (Fri 1 May)',
            cost: '~\u20AC15\u201318/pp',
            max: 27,
            emoji: '\uD83D\uDEF6',
            description: 'Paddle downstream past castles and through the countryside. All equipment and shuttle service provided. Just 5 min from the chateau!'
        },
        {
            id: 'bellebouche',
            name: 'Bellebouche Accrobranche',
            day: 'Day 5 (Sun 3 May)',
            cost: '~\u20AC20/pp',
            max: 27,
            emoji: '\uD83C\uDF33',
            description: 'Treetop adventure courses (zip lines, Tarzan swings!) plus lake activities: p\u00E9dalos, paddle boards, kayaks. ~25 min drive.'
        }
    ];

    var signups = Store.get('activitySignups', { golf: [], canoe: [], bellebouche: [] });

    function render() {
        var html = '<div class="signup-grid">';

        SIGNUP_ACTIVITIES.forEach(function(act) {
            var list = signups[act.id] || [];
            var count = list.length;
            var isFull = count >= act.max;
            var isSignedUp = guestName && list.includes(guestName);
            var waitlistPos = 0;
            if (isFull && !isSignedUp && guestName) {
                // Not signed up and full means they'd be on waitlist
            }
            if (isSignedUp && list.indexOf(guestName) >= act.max) {
                waitlistPos = list.indexOf(guestName) - act.max + 1;
            }

            html += '<div class="signup-card' + (isFull && !isSignedUp ? ' signup-full' : '') + '">';
            html += '<div class="signup-card-header">' +
                '<span class="signup-emoji">' + act.emoji + '</span>' +
                '<div class="signup-card-info">' +
                    '<h3>' + escapeHtml(act.name) + '</h3>' +
                    '<span class="signup-day">' + escapeHtml(act.day) + '</span>' +
                '</div>' +
                '<span class="signup-cost">' + act.cost + '</span>' +
            '</div>';

            html += '<p class="signup-desc">' + escapeHtml(act.description) + '</p>';

            // Capacity bar
            var pct = Math.min(100, (count / act.max) * 100);
            html += '<div class="signup-capacity">' +
                '<div class="signup-capacity-bar">' +
                    '<div class="signup-capacity-fill' + (isFull ? ' full' : '') + '" style="width:' + pct + '%"></div>' +
                '</div>' +
                '<span class="signup-capacity-label">' + Math.min(count, act.max) + ' / ' + act.max + ' signed up' +
                    (count > act.max ? ' (+' + (count - act.max) + ' waitlist)' : '') +
                '</span>' +
                (isFull && !isSignedUp ? '<span class="signup-full-badge">FULL</span>' : '') +
            '</div>';

            // Action button
            if (guestName) {
                if (isSignedUp) {
                    if (waitlistPos > 0) {
                        html += '<button class="btn signup-btn signed-up waitlisted" data-id="' + act.id + '">' +
                            'On Waitlist (#' + waitlistPos + ') \u2014 Tap to leave</button>';
                    } else {
                        html += '<button class="btn signup-btn signed-up" data-id="' + act.id + '">' +
                            '\u2705 You\'re In! Tap to cancel</button>';
                    }
                } else if (isFull) {
                    html += '<button class="btn signup-btn join-waitlist" data-id="' + act.id + '">' +
                        'Join Waitlist</button>';
                } else {
                    html += '<button class="btn signup-btn" data-id="' + act.id + '">' +
                        'Sign Me Up!</button>';
                }
            } else {
                html += '<p class="signup-login-note">Log in to sign up</p>';
            }

            // Who's signed up
            if (list.length > 0) {
                html += '<div class="signup-people">';
                var mainList = list.slice(0, act.max);
                html += '<div class="signup-people-tags">';
                mainList.forEach(function(name) {
                    html += '<span class="signup-person-tag' + (name === guestName ? ' you' : '') + '">' + escapeHtml(name) + '</span>';
                });
                html += '</div>';
                if (list.length > act.max) {
                    html += '<div class="signup-waitlist-section">';
                    html += '<strong>Waitlist:</strong> ';
                    var waitlist = list.slice(act.max);
                    waitlist.forEach(function(name, idx) {
                        html += '<span class="signup-person-tag waitlist' + (name === guestName ? ' you' : '') + '">#' + (idx + 1) + ' ' + escapeHtml(name) + '</span>';
                    });
                    html += '</div>';
                }
                html += '</div>';
            } else {
                html += '<div class="empty-state"><span class="empty-state-emoji">\uD83C\uDFAF</span><p>No sign-ups yet \u2014 be the first!</p></div>';
            }

            html += '</div>';
        });

        html += '</div>';
        container.innerHTML = html;

        // Bind buttons
        container.querySelectorAll('.signup-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var actId = this.dataset.id;
                if (!signups[actId]) signups[actId] = [];
                var idx = signups[actId].indexOf(guestName);
                if (idx > -1) {
                    signups[actId].splice(idx, 1);
                } else {
                    signups[actId].push(guestName);
                    if (typeof triggerMiniConfetti === 'function') triggerMiniConfetti();
                }
                Store.set('activitySignups', signups);
                render();
            });
        });
    }

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
    // Rate the Chef
    var chefContainer = document.getElementById('chef-ratings-container');
    if (chefContainer && chefContainer.children.length === 0) {
        var ratings = Store.get('chefRatings', {});
        var hasRatings = Object.keys(ratings).some(function(k) { return ratings[k].length > 0; });
        if (!hasRatings) {
            // The initRateTheChef will render its own content, so we inject empty state
            // only if it hasn't rendered yet — handled via MutationObserver after init
        }
    }

    // Grocery Lists — empty state is rendered inside initGroceryList when items are empty
    // Activity Sign-ups — empty state is rendered inside initActivitySignups per card
}

/* ---- Time Bucket Toggles ---- */
function initTimeBuckets() {
    document.querySelectorAll('.time-bucket-header').forEach(function(header) {
        header.addEventListener('click', function() {
            this.closest('.time-bucket').classList.toggle('collapsed');
        });
    });
}

/* ---- Style Toggle ---- */
var DAY_HERO_DATA = {
    '1': { emoji: '✈️', gradient: 'linear-gradient(135deg, #f97316, #fbbf24)' },
    '2': { emoji: '🏰', gradient: 'linear-gradient(135deg, #059669, #34d399)' },
    '3': { emoji: '🛶', gradient: 'linear-gradient(135deg, #0ea5e9, #6366f1)' },
    '4': { emoji: '🎂', gradient: 'linear-gradient(135deg, #f59e0b, #ec4899, #a855f7)' },
    '5': { emoji: '🌲', gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)' },
    '6': { emoji: '🏠', gradient: 'linear-gradient(135deg, #ec4899, #8b5cf6)' }
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
            '</div>' +
            '<div class="day-hero-chips">' + chipsHtml + '</div>';

        day.insertBefore(hero, h3);
    });
}

function initStyleToggle() {
    var toggle = document.getElementById('view-toggle');
    if (!toggle) return;
    var agenda = document.getElementById('agenda');

    // Restore saved preference (default: festival)
    var saved = localStorage.getItem('agendaStyle') || 'festival';
    agenda.setAttribute('data-agenda-style', saved);
    toggle.querySelectorAll('.view-toggle-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.style === saved);
    });

    toggle.addEventListener('click', function(e) {
        var btn = e.target.closest('.view-toggle-btn');
        if (!btn) return;
        var style = btn.dataset.style;
        toggle.querySelectorAll('.view-toggle-btn').forEach(function(b) {
            b.classList.toggle('active', b === btn);
        });
        agenda.setAttribute('data-agenda-style', style);
        localStorage.setItem('agendaStyle', style);
    });
}

/* ---- Initialize on page load ---- */
document.addEventListener('DOMContentLoaded', function() {
    initAgendaTabs();
    initSecretAgenda();
    initAgendaSwipe();
    initActivitySignups();
    initScheduleEmptyStates();
    initTimeBuckets();
    injectDayHeroes();
    initStyleToggle();
});
