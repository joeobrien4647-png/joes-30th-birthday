/* ============================================
   Games Page JavaScript
   All game init functions for the Games page.
   Uses globals from shared.js:
     - escapeHtml()
     - PLAYERS
     - GUEST_DATA
     - Store.get / Store.set
     - Auth.isAdmin()
     - triggerConfetti()
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    initQuiz();
    initBingo();
    initChallenges();
    initLeaderboard();
    initDailyChallengeReveal();
    initDailyRecapGenerator();
});

/* ============================================
   Quiz - "How Well Do You Know Joe?"
   ============================================ */
function initQuiz() {
    const startBtn = document.getElementById('start-quiz');
    const retryBtn = document.getElementById('retry-quiz');
    const shareBtn = document.getElementById('share-score');

    if (!startBtn) return;

    // Quiz questions
    const questions = [
        {
            question: "What year was Joe born?",
            options: ["1994", "1995", "1996", "1997"],
            correct: 2
        },
        {
            question: "What's Joe's favorite drink?",
            options: ["Beer", "Wine", "Gin & Tonic", "Whisky"],
            correct: 0
        },
        {
            question: "Where did Joe grow up?",
            options: ["London", "Manchester", "Bristol", "Birmingham"],
            correct: 0
        },
        {
            question: "What's Joe's go-to karaoke song?",
            options: ["Mr. Brightside", "Don't Look Back in Anger", "Sweet Caroline", "Wonderwall"],
            correct: 0
        },
        {
            question: "What football team does Joe support?",
            options: ["Arsenal", "Chelsea", "Tottenham", "West Ham"],
            correct: 0
        },
        {
            question: "What's Joe's biggest fear?",
            options: ["Spiders", "Heights", "Public Speaking", "Clowns"],
            correct: 1
        },
        {
            question: "What's Joe's favorite cuisine?",
            options: ["Italian", "Mexican", "Thai", "Indian"],
            correct: 0
        },
        {
            question: "What's Joe's hidden talent?",
            options: ["Juggling", "Cooking", "Dancing", "Card tricks"],
            correct: 1
        },
        {
            question: "What was Joe's first job?",
            options: ["Barista", "Shop assistant", "Waiter", "Office intern"],
            correct: 2
        },
        {
            question: "What's Joe's most-watched film?",
            options: ["The Godfather", "Anchorman", "Shawshank Redemption", "Pulp Fiction"],
            correct: 1
        }
    ];

    let currentQuestion = 0;
    let score = 0;
    let playerName = '';

    const startScreen = document.getElementById('quiz-start');
    const gameScreen = document.getElementById('quiz-game');
    const resultScreen = document.getElementById('quiz-result');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('quiz-options');
    const progressFill = document.getElementById('quiz-progress-fill');
    const questionNum = document.getElementById('question-num');

    // Load leaderboard
    loadQuizLeaderboard();

    startBtn.addEventListener('click', function () {
        playerName = prompt('Enter your name:');
        if (!playerName) return;

        currentQuestion = 0;
        score = 0;
        startScreen.style.display = 'none';
        gameScreen.style.display = 'block';
        resultScreen.style.display = 'none';
        showQuestion();
    });

    retryBtn.addEventListener('click', function () {
        currentQuestion = 0;
        score = 0;
        startScreen.style.display = 'none';
        gameScreen.style.display = 'block';
        resultScreen.style.display = 'none';
        showQuestion();
    });

    shareBtn.addEventListener('click', function () {
        const text = `I scored ${score}/10 on the "How Well Do You Know Joe?" quiz! \uD83C\uDF82`;
        if (navigator.share) {
            navigator.share({ text: text });
        } else {
            navigator.clipboard.writeText(text);
            alert('Score copied to clipboard!');
        }
    });

    function showQuestion() {
        const q = questions[currentQuestion];
        questionNum.textContent = currentQuestion + 1;
        progressFill.style.width = ((currentQuestion + 1) / questions.length * 100) + '%';
        questionText.textContent = q.question;

        optionsContainer.innerHTML = '';
        q.options.forEach((option, index) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option';
            btn.textContent = option;
            btn.addEventListener('click', () => selectAnswer(index));
            optionsContainer.appendChild(btn);
        });
    }

    function selectAnswer(index) {
        const q = questions[currentQuestion];
        const options = optionsContainer.querySelectorAll('.quiz-option');

        options.forEach((opt, i) => {
            opt.style.pointerEvents = 'none';
            if (i === q.correct) {
                opt.classList.add('correct');
            } else if (i === index && i !== q.correct) {
                opt.classList.add('incorrect');
            }
        });

        if (index === q.correct) {
            score++;
        }

        setTimeout(() => {
            currentQuestion++;
            if (currentQuestion < questions.length) {
                showQuestion();
            } else {
                showResult();
            }
        }, 1000);
    }

    function showResult() {
        gameScreen.style.display = 'none';
        resultScreen.style.display = 'block';

        const resultEmoji = document.getElementById('result-emoji');
        const resultTitle = document.getElementById('result-title');
        const resultScore = document.getElementById('result-score');

        resultScore.textContent = `You scored ${score} out of 10!`;

        if (score === 10) {
            resultEmoji.textContent = '\uD83C\uDFC6';
            resultTitle.textContent = 'Perfect! You REALLY know Joe!';
            triggerConfetti();
        } else if (score >= 7) {
            resultEmoji.textContent = '\uD83C\uDF89';
            resultTitle.textContent = 'Great job! True friend material!';
        } else if (score >= 4) {
            resultEmoji.textContent = '\uD83D\uDE05';
            resultTitle.textContent = 'Not bad! Room for improvement!';
        } else {
            resultEmoji.textContent = '\uD83D\uDE2C';
            resultTitle.textContent = 'Oops! Time to spend more time with Joe!';
        }

        // Save to leaderboard
        saveQuizScore(playerName, score);
        loadQuizLeaderboard();
    }

    function saveQuizScore(name, score) {
        const leaderboard = Store.get('quizLeaderboard', []);
        leaderboard.push({ name, score, date: Date.now() });
        leaderboard.sort((a, b) => b.score - a.score);
        Store.set('quizLeaderboard', leaderboard.slice(0, 10));
    }

    function loadQuizLeaderboard() {
        const list = document.getElementById('leaderboard-list');
        const leaderboard = Store.get('quizLeaderboard', []);

        if (leaderboard.length === 0) {
            list.innerHTML = '<p class="no-scores">\uD83C\uDFAF No quiz legends yet! Be the first to test your Joe knowledge!</p>';
            return;
        }

        list.innerHTML = leaderboard.slice(0, 5).map((entry, i) => `
            <div class="leaderboard-item">
                <span class="rank">${i + 1}.</span>
                <span class="name">${escapeHtml(entry.name)}</span>
                <span class="score">${entry.score}/10</span>
            </div>
        `).join('');
    }
}

/* ============================================
   Trip Bingo
   ============================================ */
function initBingo() {
    const bingoCard = document.getElementById('bingo-card');
    const newCardBtn = document.getElementById('new-bingo-card');
    const resetBtn = document.getElementById('reset-bingo');
    const winnerDisplay = document.getElementById('bingo-winner');

    if (!bingoCard) return;

    const bingoItems = [
        "Someone falls asleep by the pool",
        "Joe makes a toast",
        "Group photo taken",
        "Someone speaks French",
        "Wine tasting trip",
        "Late night pool swim",
        "Someone loses their phone",
        "Burnt BBQ moment",
        "Someone gets sunburnt",
        "Cheese plate ordered",
        "\"Remember when...\" story",
        "Someone oversleeps",
        "Dance party starts",
        "Someone cries (happy tears)",
        "Champagne popped",
        "Group sing-along",
        "Someone gets lost",
        "Midnight snack raid",
        "Hangover breakfast",
        "\"One more drink!\"",
        "Someone takes 50+ photos",
        "Card games played",
        "Someone falls in pool",
        "Birthday cake served",
        "Sunset drinks"
    ];

    let markedCells = Store.get('bingoMarked', []);
    let currentCard = Store.get('bingoCard', null);

    if (!currentCard) {
        generateNewCard();
    } else {
        renderCard();
    }

    newCardBtn.addEventListener('click', generateNewCard);
    resetBtn.addEventListener('click', resetCard);

    function generateNewCard() {
        const shuffled = [...bingoItems].sort(() => Math.random() - 0.5);
        currentCard = shuffled.slice(0, 24);
        currentCard.splice(12, 0, 'FREE');
        markedCells = [12]; // Free space is always marked
        Store.set('bingoCard', currentCard);
        Store.set('bingoMarked', markedCells);
        renderCard();
        winnerDisplay.style.display = 'none';
    }

    function resetCard() {
        markedCells = [12];
        Store.set('bingoMarked', markedCells);
        renderCard();
        winnerDisplay.style.display = 'none';
    }

    function renderCard() {
        bingoCard.innerHTML = '';
        currentCard.forEach((item, index) => {
            const cell = document.createElement('div');
            cell.className = 'bingo-cell' + (markedCells.includes(index) ? ' marked' : '') + (index === 12 ? ' free' : '');
            cell.textContent = item;
            cell.addEventListener('click', () => toggleCell(index));
            bingoCard.appendChild(cell);
        });
    }

    function toggleCell(index) {
        if (index === 12) return; // Can't unmark free space

        if (markedCells.includes(index)) {
            markedCells = markedCells.filter(i => i !== index);
        } else {
            markedCells.push(index);
        }
        Store.set('bingoMarked', markedCells);
        renderCard();
        checkWin();
    }

    function checkWin() {
        const winPatterns = [
            [0,1,2,3,4], [5,6,7,8,9], [10,11,12,13,14], [15,16,17,18,19], [20,21,22,23,24], // Rows
            [0,5,10,15,20], [1,6,11,16,21], [2,7,12,17,22], [3,8,13,18,23], [4,9,14,19,24], // Columns
            [0,6,12,18,24], [4,8,12,16,20] // Diagonals
        ];

        const hasWin = winPatterns.some(pattern =>
            pattern.every(index => markedCells.includes(index))
        );

        if (hasWin) {
            winnerDisplay.style.display = 'block';
        }
    }
}

/* ============================================
   Spin the Wheel
   ============================================ */
function initSpinWheel() {
    const spinner = document.getElementById('wheel-spinner');
    const spinBtn = document.getElementById('spin-wheel');
    const result = document.getElementById('wheel-result');
    const tabs = document.querySelectorAll('.wheel-tab');

    if (!spinner || !spinBtn) return;

    const wheelData = {
        drinking: ['Take 2 sips', 'Give 3 sips', 'Waterfall!', 'Truth or Dare', 'Categories', 'Make a rule', 'Skip turn', 'Cheers!'],
        cooking: ['Joe', 'Sophie', 'Luke', 'Hannah', 'George', 'Tom', 'Emma L', 'Jonny W'],
        activity: ['Pool party', 'Wine tasting', 'Board games', 'Karaoke', 'Movie night', 'Poker', 'Explore town', 'BBQ'],
        dare: ['Do an impression', 'Tell a secret', 'Sing a song', 'Dance battle', 'Call someone', 'Do 10 pushups', 'Act like Joe', 'Speak French']
    };

    let currentWheel = 'drinking';
    let isSpinning = false;
    let rotation = 0;

    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentWheel = this.dataset.wheel;
        });
    });

    spinBtn.addEventListener('click', function () {
        if (isSpinning) return;

        isSpinning = true;
        spinBtn.disabled = true;

        const options = wheelData[currentWheel];
        const segmentAngle = 360 / options.length;
        const randomIndex = Math.floor(Math.random() * options.length);
        const extraSpins = 5 * 360; // 5 full rotations
        const targetAngle = extraSpins + (360 - (randomIndex * segmentAngle + segmentAngle / 2));

        rotation += targetAngle;
        spinner.style.transform = `rotate(${rotation}deg)`;

        setTimeout(() => {
            result.innerHTML = `<p>\uD83C\uDFAF ${options[randomIndex]}!</p>`;
            result.classList.add('winner');
            setTimeout(() => result.classList.remove('winner'), 500);
            isSpinning = false;
            spinBtn.disabled = false;
        }, 4000);
    });
}

/* ============================================
   Games & Challenges
   ============================================ */
function initChallenges() {
    const tabs = document.querySelectorAll('.ch-tab');
    const contents = document.querySelectorAll('.ch-content[data-ch]');
    const dayBtns = document.querySelectorAll('.ch-day-btn');
    const dayContents = document.querySelectorAll('.ch-day-content');

    if (!tabs.length) return;

    // Main tab switching (Daily / Duties / Ongoing)
    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            const target = document.querySelector(`.ch-content[data-ch="${this.dataset.ch}"]`);
            if (target) target.classList.add('active');
        });
    });

    // Day switching within Daily Games
    dayBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            dayBtns.forEach(b => b.classList.remove('active'));
            dayContents.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            const target = document.querySelector(`.ch-day-content[data-chday="${this.dataset.chday}"]`);
            if (target) target.classList.add('active');
        });
    });

    // Load saved challenge statuses
    const savedStatuses = Store.get('challengeStatuses', {});

    // Apply saved statuses
    document.querySelectorAll('.ch-status').forEach(status => {
        const id = status.dataset.challenge;
        if (savedStatuses[id]) {
            status.textContent = savedStatuses[id];
            status.classList.add('done');
            status.closest('.ch-card').classList.add('completed');
        }
    });

    // Admin: click status to toggle complete
    const isAdmin = Auth.isAdmin();
    if (isAdmin) {
        document.querySelectorAll('.ch-status').forEach(status => {
            status.style.cursor = 'pointer';
            status.title = 'Click to mark complete';
            status.addEventListener('click', function () {
                const id = this.dataset.challenge;
                const card = this.closest('.ch-card');

                if (this.classList.contains('done')) {
                    this.classList.remove('done');
                    this.textContent = 'Pending';
                    card.classList.remove('completed');
                    delete savedStatuses[id];
                } else {
                    this.classList.add('done');
                    this.textContent = 'Done \u2713';
                    card.classList.add('completed');
                    savedStatuses[id] = 'Done \u2713';
                }

                Store.set('challengeStatuses', savedStatuses);
            });
        });
    }

    // Card expand/collapse for rules panels
    document.querySelectorAll('.ch-card').forEach(card => {
        const header = card.querySelector('.ch-card-header');
        if (!header) return;

        header.addEventListener('click', function (e) {
            // Don't toggle when clicking the status badge (admin feature)
            if (e.target.closest('.ch-status')) return;
            card.classList.toggle('expanded');
        });
    });

    // Props shopping list toggle
    const propsToggle = document.getElementById('props-toggle');
    if (propsToggle) {
        propsToggle.addEventListener('click', function () {
            this.closest('.props-card').classList.toggle('expanded');
        });
    }
}

/* ============================================
   Leaderboard (Upgraded)
   - Category breakdown, live feed, badges,
     daily recap, multi-admin, polished UX
   ============================================ */
function initLeaderboard() {
    const tabs = document.querySelectorAll('.lb-tab');
    const contents = document.querySelectorAll('.lb-content');
    const adminPanel = document.getElementById('lb-admin');
    const adminBtn = document.getElementById('admin-toggle-btn');
    const form = document.getElementById('award-points-form');
    const typeSelect = document.getElementById('award-type');
    const targetSelect = document.getElementById('award-target');
    const categorySelect = document.getElementById('award-category');

    if (!tabs.length) return;

    /* ---- Constants ---- */
    const TEAMS = ['vouvray', 'chinon', 'sancerre', 'muscadet', 'anjou'];
    const TEAM_NAMES = { vouvray: 'Team Vouvray', chinon: 'Team Chinon', sancerre: 'Team Sancerre', muscadet: 'Team Muscadet', anjou: 'Team Anjou' };
    const TEAM_HIDDEN = { vouvray: 'Team 1', chinon: 'Team 2', sancerre: 'Team 3', muscadet: 'Team 4', anjou: 'Team 5' };
    const TEAM_EMOJI = { vouvray: '\uD83C\uDF7E', chinon: '\uD83C\uDF77', sancerre: '\uD83E\uDD42', muscadet: '\uD83C\uDF4B', anjou: '\uD83C\uDF39' };
    const CATEGORY_EMOJI = { games: '\uD83C\uDFAE', duties: '\uD83D\uDC68\u200D\uD83C\uDF73', challenges: '\uD83C\uDFC6', bonus: '\u2B50', penalty: '\uD83D\uDFE5' };
    const CATEGORY_LABELS = { games: 'Games', duties: 'Duties', challenges: 'Challenges', bonus: 'Bonus', penalty: 'Penalty' };

    function teamDisplayName(team) {
        return isRevealed() ? TEAM_NAMES[team] : TEAM_HIDDEN[team];
    }

    /* ---- Badge Definitions ---- */
    const BADGES = [
        { id: 'first_blood', name: 'First Blood', icon: '\u2694\uFE0F', desc: 'First to earn points' },
        { id: 'iron_chef', name: 'Iron Chef', icon: '\uD83D\uDC68\u200D\uD83C\uDF73', desc: '3+ duty awards' },
        { id: 'hat_trick', name: 'Hat Trick', icon: '\uD83C\uDFA9', desc: 'Points on 3 consecutive days' },
        { id: 'night_owl', name: 'Night Owl', icon: '\uD83E\uDD89', desc: 'Points awarded after 11pm' },
        { id: 'centurion', name: 'Centurion', icon: '\uD83D\uDCAF', desc: '100+ total points' },
        { id: 'team_player', name: 'Team Player', icon: '\uD83E\uDD1D', desc: '5+ duty awards' },
        { id: 'rule_breaker', name: 'Rule Breaker', icon: '\uD83D\uDE08', desc: 'Received a penalty' },
        { id: 'mvp', name: 'MVP', icon: '\uD83C\uDFC5', desc: 'Highest scorer on a day' },
        { id: 'on_fire', name: 'On Fire', icon: '\uD83D\uDD25', desc: '3+ awards in one day' },
        { id: 'all_rounder', name: 'All-Rounder', icon: '\uD83C\uDFAF', desc: 'Points in 3+ categories' },
        { id: 'silent_killer', name: 'Silent Killer', icon: '\uD83D\uDDE1\uFE0F', desc: '3+ assassin kills' },
        { id: 'taskmaster', name: 'Taskmaster', icon: '\uD83D\uDCCB', desc: 'Won a Taskmaster task' },
        { id: 'standup_star', name: 'Stand-Up Star', icon: '\uD83C\uDFA4', desc: 'Won Try Not to Laugh or Best Roast' },
        { id: 'olympian', name: 'Olympian', icon: '\uD83E\uDD47', desc: 'Won a Birthday Olympics event' },
        { id: 'le_francais', name: 'Le Fran\u00E7ais', icon: '\uD83C\uDDEB\uD83C\uDDF7', desc: '5+ French speaking points' },
        { id: 'social_butterfly', name: 'Social Butterfly', icon: '\uD83E\uDD8B', desc: 'Points in 4+ categories' },
        { id: 'comeback_kid', name: 'Comeback Kid', icon: '\uD83D\uDD04', desc: 'Gained 10+ pts in one day' },
        { id: 'triple_threat', name: 'Triple Threat', icon: '\u26A1', desc: '5+ awards in a single day' }
    ];

    /* ---- Quick Award -> Category Mapping ---- */
    const QUICK_CATEGORY = {
        'Game Winner': 'games', 'Runner Up': 'games', 'Participation': 'bonus',
        'Bonus Point': 'bonus', 'Challenge Champion': 'challenges', 'Penalty': 'penalty'
    };

    /* ---- Day-Specific Quick Awards ---- */
    const DAY_QUICK_AWARDS = {
        1: [
            { label: '\uD83D\uDE90 Travel Bingo Winner', pts: 3, cat: 'games' },
            { label: '\uD83D\uDD0A Whisper Challenge', pts: 3, cat: 'games' }
        ],
        2: [
            { label: '\uD83E\uDD9B Hungry Hippos 1st', pts: 5, cat: 'games' },
            { label: '\uD83C\uDFB2 Dice Jackpot', pts: 2, cat: 'games' },
            { label: '\uD83D\uDE02 Last to Laugh', pts: 3, cat: 'games' },
            { label: '\u26BD P\u00E9tanque Winner', pts: 5, cat: 'games' }
        ],
        3: [
            { label: '\uD83D\uDEF6 Canoe Race 1st', pts: 5, cat: 'games' },
            { label: '\uD83C\uDDEB\uD83C\uDDF7 French Phrase', pts: 2, cat: 'challenges' },
            { label: '\uD83C\uDF77 Wine Tasting', pts: 3, cat: 'games' },
            { label: '\uD83C\uDFAD Charades Relay', pts: 5, cat: 'games' }
        ],
        4: [
            { label: '\uD83C\uDFC6 Olympics Event Win', pts: 5, cat: 'games' },
            { label: '\uD83D\uDC91 Mr & Mrs Winner', pts: 5, cat: 'games' },
            { label: '\uD83C\uDFB5 Name That Tune', pts: 1, cat: 'games' },
            { label: '\uD83C\uDFA4 Best Roast', pts: 5, cat: 'games' }
        ],
        5: [
            { label: '\uD83C\uDF33 Accrobranche 1st', pts: 5, cat: 'games' },
            { label: '\uD83D\uDEB4 P\u00E9dalo Race', pts: 3, cat: 'games' },
            { label: '\uD83C\uDFA4 Lip Sync Winner', pts: 5, cat: 'games' },
            { label: '\uD83D\uDCCB Taskmaster Win', pts: 5, cat: 'challenges' }
        ],
        6: [
            { label: '\uD83E\uDDF9 Cleanup Champ', pts: 2, cat: 'duties' },
            { label: '\uD83D\uDDE1\uFE0F Last Assassin', pts: 5, cat: 'challenges' }
        ]
    };

    /* ---- Animated Score Counter ---- */
    function animateScore(el, from, to, duration) {
        if (from === to) return;
        const start = performance.now();
        const diff = to - from;
        function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(from + diff * eased);
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        // Score bump animation
        el.classList.add('score-bump');
        setTimeout(() => el.classList.remove('score-bump'), 800);
    }

    /* ---- Award Sound Effects ---- */
    function playAwardSound(amount) {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            if (amount >= 5) {
                // Fanfare: ascending triumphant tones
                [523, 659, 784, 1047].forEach((freq, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.value = freq;
                    gain.gain.setValueAtTime(0.15, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(ctx.currentTime + i * 0.12);
                    osc.stop(ctx.currentTime + 0.4 + i * 0.12);
                });
            } else if (amount < 0) {
                // Sad trombone: descending
                [300, 280, 260, 200].forEach((freq, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.value = freq;
                    gain.gain.setValueAtTime(0.08, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(ctx.currentTime + i * 0.2);
                    osc.stop(ctx.currentTime + 0.5 + i * 0.2);
                });
            } else {
                // Simple ding
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.value = 880;
                gain.gain.setValueAtTime(0.12, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.3);
            }
        } catch (e) { /* Audio not available */ }
    }

    /* ---- Position Tracking ---- */
    function getPreviousPositions() {
        try { return JSON.parse(sessionStorage.getItem('lb_positions') || '{}'); } catch (e) { return {}; }
    }
    function savePositions(positions) {
        sessionStorage.setItem('lb_positions', JSON.stringify(positions));
    }

    /* ---- Load Data ---- */
    let teamScores = Store.get('lb_teamScores', { vouvray: 0, chinon: 0, sancerre: 0, muscadet: 0, anjou: 0 });
    let individualScores = Store.get('lb_individualScores', {});
    let pointsLog = Store.get('lb_pointsLog', []);
    let badges = Store.get('lb_badges', {});
    let dayOverride = null; // session-only admin override

    Object.keys(PLAYERS).forEach(name => {
        if (!(name in individualScores)) individualScores[name] = 0;
    });

    /* ---- Trip Day Helper ---- */
    function getTripDay() {
        if (dayOverride) return dayOverride;
        const start = new Date('2026-04-29').getTime();
        const day = Math.floor((Date.now() - start) / 86400000) + 1;
        return Math.max(1, Math.min(6, day));
    }

    /* ---- Relative Time ---- */
    function relativeTime(timestamp) {
        if (!timestamp) return '';
        const diff = Math.floor((Date.now() - timestamp) / 1000);
        if (diff < 60) return 'just now';
        if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
        if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
        return Math.floor(diff / 86400) + 'd ago';
    }

    /* ---- Category Helpers ---- */
    function getCategoryForEntry(entry) {
        return entry.category || 'bonus';
    }

    function getTeamCategoryBreakdown(team) {
        const breakdown = {};
        const teamMembers = Object.keys(PLAYERS).filter(n => PLAYERS[n] === team);
        pointsLog.forEach(e => {
            if (e.type === 'team' && e.target === team) {
                const cat = getCategoryForEntry(e);
                breakdown[cat] = (breakdown[cat] || 0) + e.amount;
            } else if (e.type === 'individual' && teamMembers.includes(e.target)) {
                const cat = getCategoryForEntry(e);
                breakdown[cat] = (breakdown[cat] || 0) + e.amount;
            }
        });
        return breakdown;
    }

    function getIndividualCategoryBreakdown(name) {
        const breakdown = {};
        pointsLog.forEach(e => {
            if (e.type === 'individual' && e.target === name) {
                const cat = getCategoryForEntry(e);
                breakdown[cat] = (breakdown[cat] || 0) + e.amount;
            }
        });
        return breakdown;
    }

    /* ---- Tab Switching ---- */
    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            const target = document.querySelector(`.lb-content[data-lb="${this.dataset.lb}"]`);
            if (target) target.classList.add('active');
        });
    });

    /* ---- Admin Setup ---- */
    const isAdmin = Auth.isAdmin();
    if (isAdmin && adminBtn) {
        adminBtn.style.display = 'block';
        adminBtn.textContent = '\uD83D\uDD10 Admin Panel';
    } else if (adminBtn) {
        adminBtn.style.display = 'none';
    }

    if (adminBtn) {
        adminBtn.addEventListener('click', function () {
            if (!isAdmin) return;
            adminPanel.style.display = adminPanel.style.display === 'none' ? 'block' : 'none';
        });
    }

    /* ---- Day Override (Admin) ---- */
    const dayOverrideSelect = document.getElementById('day-override');
    if (dayOverrideSelect && isAdmin) {
        dayOverrideSelect.addEventListener('change', function () {
            dayOverride = this.value === 'auto' ? null : parseInt(this.value);
            renderDayQuickAwards();
        });
    }

    /* ---- Day-Specific Quick Awards Render ---- */
    function renderDayQuickAwards() {
        const container = document.getElementById('day-quick-awards');
        if (!container) return;
        const day = getTripDay();
        const awards = DAY_QUICK_AWARDS[day];
        if (!awards || awards.length === 0) {
            container.style.display = 'none';
            return;
        }
        container.style.display = 'block';
        container.innerHTML = '<h5>Day ' + day + ' Awards:</h5><div class="quick-btns">' +
            awards.map(a =>
                '<button class="quick-award day-award" data-points="' + a.pts + '" data-reason="' + escapeHtml(a.label.replace(/^[^\s]+\s/, '')) + '" data-category="' + a.cat + '">' +
                a.label + ' (+' + a.pts + ')</button>'
            ).join('') + '</div>';

        container.querySelectorAll('.day-award').forEach(btn => {
            btn.addEventListener('click', function () {
                const pts = parseInt(this.dataset.points);
                const reason = this.dataset.reason;
                const cat = this.dataset.category || 'games';
                const type = typeSelect ? typeSelect.value : 'individual';
                const target = targetSelect ? targetSelect.value : '';
                if (!target) return;
                awardPoints(type, target, pts, reason, cat);
            });
        });
    }

    /* ---- Auto-Generated Highlights ---- */
    function generateHighlights(day) {
        const dayEntries = pointsLog.filter(e => (e.day || 1) === day);
        const highlights = [];

        // Biggest single award
        const biggest = dayEntries.filter(e => e.amount > 0).sort((a, b) => b.amount - a.amount)[0];
        if (biggest) {
            highlights.push({
                icon: '\uD83C\uDFC6',
                text: 'Biggest award: +' + biggest.amount + ' to ' + biggest.target + ' for ' + biggest.reason
            });
        }

        // Most active player
        const activity = {};
        dayEntries.filter(e => e.type === 'individual').forEach(e => {
            activity[e.target] = (activity[e.target] || 0) + 1;
        });
        const mostActive = Object.entries(activity).sort((a, b) => b[1] - a[1])[0];
        if (mostActive) {
            highlights.push({
                icon: '\uD83D\uDD25',
                text: 'Most active: ' + mostActive[0] + ' (' + mostActive[1] + ' awards)'
            });
        }

        // Team of the day
        const teamDay = {};
        dayEntries.forEach(e => {
            let team = null;
            if (e.type === 'team') team = e.target;
            else if (e.type === 'individual' && PLAYERS[e.target]) team = PLAYERS[e.target];
            if (team) teamDay[team] = (teamDay[team] || 0) + e.amount;
        });
        const topTeam = Object.entries(teamDay).sort((a, b) => b[1] - a[1])[0];
        if (topTeam) {
            highlights.push({
                icon: '\uD83C\uDF1F',
                text: 'Team of the day: ' + (TEAM_NAMES[topTeam[0]] || topTeam[0]) + ' (+' + topTeam[1] + ' pts)'
            });
        }

        return highlights;
    }

    /* ---- Target Options ---- */
    function updateTargetOptions() {
        if (!targetSelect) return;
        targetSelect.innerHTML = '';
        if (typeSelect.value === 'team') {
            TEAMS.forEach(t => {
                const opt = document.createElement('option');
                opt.value = t;
                opt.textContent = TEAM_NAMES[t];
                targetSelect.appendChild(opt);
            });
        } else {
            Object.keys(PLAYERS).sort().forEach(name => {
                const opt = document.createElement('option');
                opt.value = name;
                opt.textContent = name;
                targetSelect.appendChild(opt);
            });
        }
    }

    if (typeSelect) {
        typeSelect.addEventListener('change', updateTargetOptions);
        updateTargetOptions();
    }

    /* ---- Recent Players Shortcuts ---- */
    function renderRecentPlayers() {
        const container = document.getElementById('recent-players');
        if (!container) return;
        const recent = [];
        const seen = new Set();
        for (const entry of pointsLog) {
            if (entry.type === 'individual' && !seen.has(entry.target)) {
                recent.push(entry.target);
                seen.add(entry.target);
            }
            if (recent.length >= 5) break;
        }
        if (recent.length === 0) { container.style.display = 'none'; return; }
        container.style.display = 'flex';
        container.innerHTML = '<span class="recent-label">Recent:</span>' +
            recent.map(name => `<button class="recent-player-btn" data-player="${escapeHtml(name)}">${escapeHtml(name)}</button>`).join('');

        container.querySelectorAll('.recent-player-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                if (typeSelect) typeSelect.value = 'individual';
                updateTargetOptions();
                if (targetSelect) targetSelect.value = this.dataset.player;
            });
        });
    }

    /* ---- Award Points ---- */
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const type = typeSelect.value;
            const target = targetSelect.value;
            const amount = parseInt(document.getElementById('award-amount').value);
            const reason = document.getElementById('award-reason').value.trim();
            const category = categorySelect ? categorySelect.value : 'bonus';

            if (!amount || !reason) return;
            awardPoints(type, target, amount, reason, category);
            form.reset();
            updateTargetOptions();
            if (categorySelect) categorySelect.value = 'games';
        });
    }

    /* ---- Quick Awards ---- */
    document.querySelectorAll('.quick-award').forEach(btn => {
        btn.addEventListener('click', function () {
            const points = parseInt(this.dataset.points);
            const reason = this.dataset.reason;
            const type = typeSelect ? typeSelect.value : 'individual';
            const target = targetSelect ? targetSelect.value : '';
            const category = QUICK_CATEGORY[reason] || 'bonus';

            if (!target) return;
            awardPoints(type, target, points, reason, category);
        });
    });

    function awardPoints(type, target, amount, reason, category) {
        // Auto-detect penalty category
        if (amount < 0) category = 'penalty';

        const entry = {
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
            const team = PLAYERS[target];
            if (team) {
                teamScores[team] = (teamScores[team] || 0) + amount;
            }
        }

        pointsLog.unshift(entry);

        Store.set('lb_teamScores', teamScores);
        Store.set('lb_individualScores', individualScores);
        Store.set('lb_pointsLog', pointsLog);

        // Check badges
        if (type === 'individual') {
            checkBadges(target);
        }

        // Sound effect
        playAwardSound(amount);

        // Milestone confetti (50pts, 100pts)
        if (type === 'individual') {
            const total = individualScores[target] || 0;
            const prev = total - amount;
            if ((prev < 50 && total >= 50) || (prev < 100 && total >= 100)) {
                if (typeof triggerConfetti === 'function') triggerConfetti();
            }
        }

        renderAll();
        renderRecentPlayers();
        showToast(amount, target, reason, type);
    }

    /* ---- Toast Notification ---- */
    function showToast(amount, target, reason, type) {
        const existing = document.querySelector('.lb-toast');
        if (existing) existing.remove();

        const displayTarget = type === 'team' ? teamDisplayName(target) : target;
        const toast = document.createElement('div');
        toast.className = 'lb-toast';
        toast.innerHTML = `\u2705 ${amount > 0 ? '+' : ''}${amount} to ${escapeHtml(displayTarget)} for ${escapeHtml(reason)}`;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('visible'), 10);
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /* ---- Badge Toast ---- */
    function showBadgeToast(name, badge) {
        const existing = document.querySelector('.badge-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'badge-toast';
        toast.innerHTML = `${badge.icon} <strong>${escapeHtml(name)}</strong> unlocked <strong>${badge.name}</strong>!`;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('visible'), 10);
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    /* ---- Badge Checking ---- */
    function checkBadges(playerName) {
        if (!badges[playerName]) badges[playerName] = [];
        const playerBadges = badges[playerName];
        let newBadge = null;

        const playerEntries = pointsLog.filter(e => e.type === 'individual' && e.target === playerName);

        BADGES.forEach(badge => {
            if (playerBadges.includes(badge.id)) return;

            let earned = false;
            switch (badge.id) {
                case 'first_blood': {
                    const allIndividualEntries = pointsLog.filter(e => e.type === 'individual' && e.amount > 0);
                    if (allIndividualEntries.length > 0) {
                        const first = allIndividualEntries[allIndividualEntries.length - 1];
                        earned = first.target === playerName;
                    }
                    break;
                }
                case 'iron_chef':
                    earned = playerEntries.filter(e => getCategoryForEntry(e) === 'duties').length >= 3;
                    break;
                case 'hat_trick': {
                    const days = new Set(playerEntries.map(e => e.day || 1));
                    for (let d = 1; d <= 4; d++) {
                        if (days.has(d) && days.has(d + 1) && days.has(d + 2)) { earned = true; break; }
                    }
                    break;
                }
                case 'night_owl':
                    earned = playerEntries.some(e => {
                        if (!e.timestamp) return false;
                        return new Date(e.timestamp).getHours() >= 23;
                    });
                    break;
                case 'centurion':
                    earned = (individualScores[playerName] || 0) >= 100;
                    break;
                case 'team_player':
                    earned = playerEntries.filter(e => getCategoryForEntry(e) === 'duties').length >= 5;
                    break;
                case 'rule_breaker':
                    earned = playerEntries.some(e => e.amount < 0);
                    break;
                case 'mvp': {
                    for (let d = 1; d <= 6; d++) {
                        const dayEntries = pointsLog.filter(e => e.type === 'individual' && (e.day || 1) === d && e.amount > 0);
                        if (dayEntries.length === 0) continue;
                        const totals = {};
                        dayEntries.forEach(e => { totals[e.target] = (totals[e.target] || 0) + e.amount; });
                        const maxPts = Math.max(...Object.values(totals));
                        if (totals[playerName] === maxPts && maxPts > 0) { earned = true; break; }
                    }
                    break;
                }
                case 'on_fire': {
                    for (let d = 1; d <= 6; d++) {
                        const count = playerEntries.filter(e => (e.day || 1) === d && e.amount > 0).length;
                        if (count >= 3) { earned = true; break; }
                    }
                    break;
                }
                case 'all_rounder': {
                    const cats = new Set(playerEntries.filter(e => e.amount > 0).map(e => getCategoryForEntry(e)));
                    earned = cats.size >= 3;
                    break;
                }
                case 'silent_killer': {
                    const assassinKills = Store.get('assassin_kills', []);
                    earned = assassinKills.filter(k => k.killer === playerName).length >= 3;
                    break;
                }
                case 'taskmaster':
                    earned = playerEntries.some(e => e.reason && e.reason.toLowerCase().includes('taskmaster'));
                    break;
                case 'standup_star':
                    earned = playerEntries.some(e => e.reason && (e.reason.toLowerCase().includes('laugh') || e.reason.toLowerCase().includes('roast')));
                    break;
                case 'olympian':
                    earned = playerEntries.some(e => e.reason && e.reason.toLowerCase().includes('olympics'));
                    break;
                case 'le_francais': {
                    const frenchPts = playerEntries
                        .filter(e => e.reason && e.reason.toLowerCase().includes('french') && e.amount > 0)
                        .reduce((sum, e) => sum + e.amount, 0);
                    earned = frenchPts >= 5;
                    break;
                }
                case 'social_butterfly': {
                    const catSet = new Set(playerEntries.filter(e => e.amount > 0).map(e => getCategoryForEntry(e)));
                    earned = catSet.size >= 4;
                    break;
                }
                case 'comeback_kid': {
                    for (let d = 1; d <= 6; d++) {
                        const dayPts = playerEntries.filter(e => (e.day || 1) === d && e.amount > 0).reduce((s, e) => s + e.amount, 0);
                        if (dayPts >= 10) { earned = true; break; }
                    }
                    break;
                }
                case 'triple_threat': {
                    for (let d = 1; d <= 6; d++) {
                        const count = playerEntries.filter(e => (e.day || 1) === d && e.amount > 0).length;
                        if (count >= 5) { earned = true; break; }
                    }
                    break;
                }
            }

            if (earned) {
                playerBadges.push(badge.id);
                newBadge = badge;
            }
        });

        if (newBadge) {
            badges[playerName] = playerBadges;
            Store.set('lb_badges', badges);
            triggerMiniConfetti();
            showBadgeToast(playerName, newBadge);
        }
    }

    /* ---- Render All ---- */
    function renderAll() {
        renderTeams();
        renderFeed();
        renderIndividuals();
        renderLog();
        renderDailyRecap();
    }

    /* ---- Render Teams ---- */
    function renderTeams() {
        TEAMS.forEach(team => {
            const card = document.querySelector(`.team-card[data-team="${team}"]`);
            if (card) {
                const h3 = card.querySelector('h3');
                if (h3) h3.textContent = teamDisplayName(team);
                const badge = card.querySelector('.team-badge');
                if (badge) {
                    badge.textContent = isRevealed() ? (TEAM_EMOJI[team] || '?') : '?';
                    if (!isRevealed()) {
                        badge.className = 'team-badge';
                    } else {
                        badge.className = 'team-badge ' + team + '-bg';
                    }
                }
            }

            const scoreEl = document.getElementById(`score-${team}`);
            if (scoreEl) {
                const oldVal = parseInt(scoreEl.textContent) || 0;
                const newVal = teamScores[team] || 0;
                if (oldVal !== newVal) {
                    animateScore(scoreEl, oldVal, newVal, 800);
                } else {
                    scoreEl.textContent = newVal;
                }
            }

            const membersEl = document.getElementById(`members-${team}`);
            if (membersEl) {
                if (isRevealed()) {
                    const members = Object.keys(PLAYERS).filter(n => PLAYERS[n] === team);
                    membersEl.textContent = members.join(', ');
                } else {
                    membersEl.innerHTML = '<em>Teams revealed 26 Apr...</em>';
                }
            }

            // Category breakdown chips
            const chipsEl = document.getElementById(`cats-${team}`);
            if (chipsEl) {
                const breakdown = getTeamCategoryBreakdown(team);
                const chips = Object.entries(breakdown)
                    .filter(([, v]) => v !== 0)
                    .map(([cat, pts]) => `<span class="cat-chip cat-${cat}">${CATEGORY_EMOJI[cat] || ''} ${pts}</span>`)
                    .join('');
                chipsEl.innerHTML = chips || '<span class="cat-chip cat-none">No points yet</span>';
            }
        });

        // Highlight leader
        const cards = document.querySelectorAll('.team-card');
        const maxScore = Math.max(...TEAMS.map(t => teamScores[t] || 0));
        cards.forEach(card => {
            card.classList.remove('leading');
            const team = card.dataset.team;
            if ((teamScores[team] || 0) === maxScore && maxScore > 0) {
                card.classList.add('leading');
            }
        });
    }

    /* ---- Render Activity Feed ---- */
    function renderFeed() {
        const feed = document.getElementById('activity-feed');
        if (!feed) return;

        const recentEntries = pointsLog.filter(e => e.type === 'individual').slice(0, 10);

        if (recentEntries.length === 0) {
            feed.innerHTML = '<p class="feed-empty">No activity yet - let the games begin!</p>';
            return;
        }

        feed.innerHTML = recentEntries.map((entry, i) => {
            const cat = getCategoryForEntry(entry);
            const emoji = CATEGORY_EMOJI[cat] || '\u2B50';
            const isPositive = entry.amount > 0;
            const time = relativeTime(entry.timestamp);
            return `
                <div class="feed-item" style="animation-delay: ${i * 0.05}s">
                    <span class="feed-emoji">${emoji}</span>
                    <div class="feed-detail">
                        <strong>${escapeHtml(entry.target)}</strong>
                        <span class="feed-points ${isPositive ? 'positive' : 'negative'}">${isPositive ? '+' : ''}${entry.amount}</span>
                        <span class="feed-reason">${escapeHtml(entry.reason)}</span>
                    </div>
                    <span class="feed-time">${time}</span>
                </div>
            `;
        }).join('');
    }

    /* ---- Render Individuals ---- */
    function renderIndividuals() {
        const board = document.getElementById('individual-board');
        if (!board) return;

        const sorted = Object.keys(individualScores)
            .map(name => ({ name, points: individualScores[name], team: PLAYERS[name] }))
            .sort((a, b) => b.points - a.points);

        // Position change tracking
        const prevPositions = getPreviousPositions();
        const newPositions = {};
        sorted.forEach((p, i) => { newPositions[p.name] = i + 1; });

        board.innerHTML = '';
        sorted.forEach((player, i) => {
            const row = document.createElement('div');
            row.className = 'ind-row' + (i < 3 && player.points > 0 ? ' top-3' : '');

            let rankDisplay = i + 1;
            if (i === 0 && player.points > 0) rankDisplay = '\uD83E\uDD47';
            else if (i === 1 && player.points > 0) rankDisplay = '\uD83E\uDD48';
            else if (i === 2 && player.points > 0) rankDisplay = '\uD83E\uDD49';

            // Position change arrow
            let posArrow = '';
            const prev = prevPositions[player.name];
            const curr = i + 1;
            if (prev && prev !== curr && player.points > 0) {
                const diff = prev - curr;
                if (diff > 0) {
                    posArrow = '<span class="pos-change pos-up">\u25B2' + diff + '</span>';
                } else {
                    posArrow = '<span class="pos-change pos-down">\u25BC' + Math.abs(diff) + '</span>';
                }
            } else if (!prev && player.points > 0) {
                posArrow = '<span class="pos-change pos-new">NEW</span>';
            }

            // Badge icons
            const playerBadges = badges[player.name] || [];
            const badgeIcons = playerBadges.map(bid => {
                const b = BADGES.find(x => x.id === bid);
                return b ? `<span class="ind-badge" title="${b.name}: ${b.desc}">${b.icon}</span>` : '';
            }).join('');

            // Category breakdown dots
            const catBreakdown = getIndividualCategoryBreakdown(player.name);
            const catDots = Object.entries(catBreakdown)
                .filter(([, v]) => v > 0)
                .map(([cat]) => `<span class="cat-dot cat-${cat}" title="${CATEGORY_LABELS[cat] || cat}"></span>`)
                .join('');

            row.innerHTML = `
                <span class="ind-rank">${rankDisplay}${posArrow}</span>
                <span class="ind-team-dot ${isRevealed() ? (player.team || '') : ''}"></span>
                <span class="ind-name">${escapeHtml(player.name)}${badgeIcons ? '<span class="ind-badges">' + badgeIcons + '</span>' : ''}</span>
                <span class="ind-cats">${catDots}</span>
                <span class="ind-points">${player.points} pts</span>
            `;
            board.appendChild(row);
        });

        savePositions(newPositions);
    }

    /* ---- Render Log ---- */
    function renderLog() {
        const log = document.getElementById('points-log');
        if (!log) return;

        if (pointsLog.length === 0) {
            log.innerHTML = '<p class="log-empty">No points awarded yet - let the games begin!</p>';
            return;
        }

        log.innerHTML = '';
        pointsLog.slice(0, 50).forEach(entry => {
            const div = document.createElement('div');
            div.className = 'log-entry';
            const isPositive = entry.amount > 0;
            const displayTarget = entry.type === 'team' ? teamDisplayName(entry.target) : entry.target;
            const cat = getCategoryForEntry(entry);
            const emoji = CATEGORY_EMOJI[cat] || '';

            div.innerHTML = `
                <span class="log-cat">${emoji}</span>
                <span class="log-points ${isPositive ? 'positive' : 'negative'}">${isPositive ? '+' : ''}${entry.amount}</span>
                <span class="log-target">${escapeHtml(displayTarget)}</span>
                <span class="log-reason">${escapeHtml(entry.reason)}</span>
                <span class="log-time">${entry.time}</span>
            `;
            log.appendChild(div);
        });
    }

    /* ---- Render Daily Recap ---- */
    function renderDailyRecap() {
        const container = document.getElementById('daily-recap');
        if (!container) return;

        const dayBtns = container.querySelectorAll('.recap-day-btn');
        let selectedDay = getTripDay();

        function renderDay(day) {
            const dayEntries = pointsLog.filter(e => (e.day || 1) === day);
            const mvpSection = document.getElementById('recap-mvp');
            const topSection = document.getElementById('recap-top');
            const teamBars = document.getElementById('recap-teams');
            const badgesSection = document.getElementById('recap-badges');

            // MVP of the day
            const indEntries = dayEntries.filter(e => e.type === 'individual' && e.amount > 0);
            const dayTotals = {};
            indEntries.forEach(e => { dayTotals[e.target] = (dayTotals[e.target] || 0) + e.amount; });

            if (mvpSection) {
                if (Object.keys(dayTotals).length === 0) {
                    mvpSection.innerHTML = '<div class="recap-empty">No points awarded on Day ' + day + ' yet</div>';
                } else {
                    const maxPts = Math.max(...Object.values(dayTotals));
                    const mvpName = Object.keys(dayTotals).find(n => dayTotals[n] === maxPts);
                    mvpSection.innerHTML = `
                        <div class="mvp-card">
                            <span class="mvp-icon">\uD83C\uDFC5</span>
                            <div class="mvp-info">
                                <span class="mvp-label">MVP of Day ${day}</span>
                                <span class="mvp-name">${escapeHtml(mvpName)}</span>
                                <span class="mvp-pts">${maxPts} pts</span>
                            </div>
                        </div>
                    `;
                }
            }

            // Top 5 earners
            if (topSection) {
                const sorted = Object.entries(dayTotals).sort((a, b) => b[1] - a[1]).slice(0, 5);
                if (sorted.length === 0) {
                    topSection.innerHTML = '';
                } else {
                    topSection.innerHTML = sorted.map(([name, pts], i) =>
                        `<div class="recap-row"><span class="recap-rank">${i + 1}.</span><span class="recap-name">${escapeHtml(name)}</span><span class="recap-pts">+${pts}</span></div>`
                    ).join('');
                }
            }

            // Team performance bars
            if (teamBars) {
                const teamDay = { vouvray: 0, chinon: 0, sancerre: 0, muscadet: 0, anjou: 0 };
                dayEntries.forEach(e => {
                    if (e.type === 'team') {
                        teamDay[e.target] = (teamDay[e.target] || 0) + e.amount;
                    } else if (e.type === 'individual') {
                        const team = PLAYERS[e.target];
                        if (team) teamDay[team] = (teamDay[team] || 0) + e.amount;
                    }
                });
                const maxTeamPts = Math.max(...Object.values(teamDay), 1);
                teamBars.innerHTML = TEAMS.map(team => {
                    const pts = teamDay[team] || 0;
                    const pct = (pts / maxTeamPts) * 100;
                    return `
                        <div class="recap-team-bar">
                            <span class="recap-team-name">${teamDisplayName(team)}</span>
                            <div class="recap-bar-track"><div class="recap-bar-fill ${isRevealed() ? team + '-bar' : ''}" style="width: ${pct}%; ${!isRevealed() ? 'background: rgba(255,255,255,0.3)' : ''}"></div></div>
                            <span class="recap-team-pts">${pts}</span>
                        </div>
                    `;
                }).join('');
            }

            // Badges earned that day
            if (badgesSection) {
                const dayBadges = [];
                Object.entries(badges).forEach(([name, bids]) => {
                    bids.forEach(bid => {
                        // Check if any entry for this player on this day could have triggered this badge
                        const hasEntryThisDay = pointsLog.some(e => e.type === 'individual' && e.target === name && (e.day || 1) === day);
                        if (hasEntryThisDay) {
                            const b = BADGES.find(x => x.id === bid);
                            if (b) dayBadges.push({ name, badge: b });
                        }
                    });
                });
                if (dayBadges.length > 0) {
                    badgesSection.innerHTML = '<h5>Badges Earned</h5>' + dayBadges.map(({ name, badge }) =>
                        `<span class="recap-badge">${badge.icon} ${escapeHtml(name)}</span>`
                    ).join('');
                } else {
                    badgesSection.innerHTML = '';
                }
            }

            // Auto-generated highlights
            const highlightsEl = document.getElementById('recap-highlights');
            if (highlightsEl) {
                const highlights = generateHighlights(day);
                if (highlights.length > 0) {
                    highlightsEl.innerHTML = highlights.map(h =>
                        '<div class="highlight-card"><span class="highlight-icon">' + h.icon + '</span><span class="highlight-text">' + escapeHtml(h.text) + '</span></div>'
                    ).join('');
                } else {
                    highlightsEl.innerHTML = '';
                }
            }
        }

        dayBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                dayBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                selectedDay = parseInt(this.dataset.day);
                renderDay(selectedDay);
            });
        });

        // Set current day button active
        dayBtns.forEach(btn => {
            if (parseInt(btn.dataset.day) === selectedDay) btn.classList.add('active');
        });

        renderDay(selectedDay);
    }

    /* ---- Auto-refresh Feed ---- */
    setInterval(() => {
        const freshLog = Store.get('lb_pointsLog', []);
        if (freshLog.length !== pointsLog.length) {
            pointsLog = freshLog;
            teamScores = Store.get('lb_teamScores', { vouvray: 0, chinon: 0, sancerre: 0, muscadet: 0, anjou: 0 });
            individualScores = Store.get('lb_individualScores', {});
            badges = Store.get('lb_badges', {});
            renderAll();
        }
    }, 30000);

    /* ---- Auto-set penalty category ---- */
    const amountInput = document.getElementById('award-amount');
    if (amountInput && categorySelect) {
        amountInput.addEventListener('input', function () {
            if (parseInt(this.value) < 0) categorySelect.value = 'penalty';
        });
    }

    /* ---- Initial Render ---- */
    renderAll();
    renderRecentPlayers();
    if (isAdmin) renderDayQuickAwards();
}

/* ============================================
   Soundboard
   ============================================ */
function initSoundboard() {
    const buttons = document.querySelectorAll('.sound-btn');

    if (!buttons.length) return;

    // Web Audio API for generating sounds
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    const sounds = {
        airhorn: () => playTone([350, 450, 550], 0.5, 'sawtooth'),
        applause: () => playNoise(1.5),
        drumroll: () => playDrumroll(),
        birthday: () => playMelody([262, 262, 294, 262, 349, 330]),
        cheers: () => playTone([400, 500, 600], 0.3, 'sine'),
        woohoo: () => playTone([300, 400, 500, 600], 0.4, 'sine'),
        fail: () => playTone([400, 300, 200], 0.5, 'sawtooth'),
        rimshot: () => playRimshot()
    };

    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            const sound = this.dataset.sound;
            if (sounds[sound]) {
                this.classList.add('playing');
                sounds[sound]();
                setTimeout(() => this.classList.remove('playing'), 300);
            }
        });
    });

    function playTone(frequencies, duration, type) {
        frequencies.forEach((freq, i) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.type = type;
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.3, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.start(audioContext.currentTime + i * 0.1);
            osc.stop(audioContext.currentTime + duration + i * 0.1);
        });
    }

    function playNoise(duration) {
        const bufferSize = audioContext.sampleRate * duration;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = audioContext.createBufferSource();
        const gain = audioContext.createGain();
        noise.buffer = buffer;
        gain.gain.setValueAtTime(0.1, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        noise.connect(gain);
        gain.connect(audioContext.destination);
        noise.start();
    }

    function playDrumroll() {
        for (let i = 0; i < 20; i++) {
            setTimeout(() => playTone([100 + Math.random() * 50], 0.05, 'square'), i * 50);
        }
    }

    function playRimshot() {
        playTone([200], 0.1, 'square');
        setTimeout(() => playTone([150], 0.1, 'square'), 100);
        setTimeout(() => playTone([300, 400], 0.2, 'triangle'), 200);
    }

    function playMelody(notes) {
        notes.forEach((note, i) => {
            setTimeout(() => playTone([note], 0.3, 'sine'), i * 300);
        });
    }
}

/* ============================================
   Secret Assassin
   ============================================ */
function initAssassin() {
    const tracker = document.getElementById('assassin-tracker');
    if (!tracker) return;

    const allPlayers = Object.keys(PLAYERS);
    let alive = Store.get('assassin_alive', allPlayers);
    let kills = Store.get('assassin_kills', []);

    function save() {
        Store.set('assassin_alive', alive);
        Store.set('assassin_kills', kills);
    }

    function render() {
        const aliveEl = document.getElementById('assassin-alive-count');
        const deadEl = document.getElementById('assassin-dead-count');
        const feedEl = document.getElementById('assassin-kills');
        if (!aliveEl || !deadEl || !feedEl) return;

        aliveEl.textContent = alive.length;
        deadEl.textContent = allPlayers.length - alive.length;

        if (kills.length === 0) {
            feedEl.innerHTML = '<p class="assassin-empty">No kills yet... the game begins Day 1 evening &#128481;</p>';
            return;
        }

        feedEl.innerHTML = kills.slice().reverse().map(k => {
            const time = new Date(k.timestamp);
            const timeStr = time.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
            return '<div class="assassin-kill-entry">' +
                '<span class="kill-icon">&#128481;</span>' +
                '<span class="kill-text"><strong>' + escapeHtml(k.killer) + '</strong> eliminated <strong>' + escapeHtml(k.victim) + '</strong></span>' +
                '<span class="kill-word">word: "' + escapeHtml(k.word) + '"</span>' +
                '<span class="kill-time">' + escapeHtml(timeStr) + '</span>' +
            '</div>';
        }).join('');
    }

    /* Admin: Report Kill form */
    if (Auth.isAdmin()) {
        const adminSection = document.getElementById('assassin-admin');
        if (adminSection) {
            const killerSelect = adminSection.querySelector('#assassin-killer');
            const victimSelect = adminSection.querySelector('#assassin-victim');

            function populateSelects() {
                [killerSelect, victimSelect].forEach(sel => {
                    if (!sel) return;
                    const prev = sel.value;
                    sel.innerHTML = '<option value="">Select player</option>';
                    alive.sort().forEach(name => {
                        sel.innerHTML += '<option value="' + escapeHtml(name) + '">' + escapeHtml(name) + '</option>';
                    });
                    if (prev) sel.value = prev;
                });
            }

            populateSelects();
            adminSection.style.display = 'block';

            const form = adminSection.querySelector('#assassin-kill-form');
            if (form) {
                form.addEventListener('submit', function (e) {
                    e.preventDefault();
                    const killer = killerSelect.value;
                    const victim = victimSelect.value;
                    const wordInput = adminSection.querySelector('#assassin-word');
                    const word = wordInput ? wordInput.value.trim() : '';

                    if (!killer || !victim || !word) return;
                    if (killer === victim) return;

                    kills.push({ killer: killer, victim: victim, word: word, timestamp: Date.now() });
                    alive = alive.filter(n => n !== victim);
                    save();
                    render();
                    populateSelects();
                    form.reset();
                });
            }

            /* Admin reset */
            const resetBtn = adminSection.querySelector('#assassin-reset');
            if (resetBtn) {
                resetBtn.addEventListener('click', function () {
                    if (!confirm('Reset Secret Assassin? This clears all kills.')) return;
                    alive = allPlayers.slice();
                    kills = [];
                    save();
                    render();
                    populateSelects();
                });
            }
        }
    }

    render();

    /* Refresh every 30s to pick up kills from other admin devices */
    setInterval(function () {
        alive = Store.get('assassin_alive', allPlayers);
        kills = Store.get('assassin_kills', []);
        render();
    }, 30000);
}

/* ============================================
   Truth or Dare Deck
   ============================================ */
function initTruthOrDare() {
    const cardInner = document.getElementById('tod-card-inner');
    const cardBack = document.getElementById('tod-card-back');
    const cardType = document.getElementById('tod-card-type');
    const cardText = document.getElementById('tod-card-text');
    const cardDiff = document.getElementById('tod-card-diff');
    const counter = document.getElementById('tod-counter');
    const drawTruth = document.getElementById('draw-truth');
    const drawDare = document.getElementById('draw-dare');

    if (!drawTruth || !drawDare) return;

    const TRUTHS = [
        { text: "What's the most embarrassing thing you've done in front of Joe?", diff: "mild" },
        { text: "Show everyone your most recent Google search", diff: "spicy" },
        { text: "What's your honest opinion of Joe's dancing?", diff: "mild" },
        { text: "If you had to swap lives with someone on this trip, who and why?", diff: "mild" },
        { text: "What's the drunkest you've ever been?", diff: "spicy" },
        { text: "Read out your last 3 sent texts", diff: "nuclear" },
        { text: "What's your guilty pleasure song?", diff: "mild" },
        { text: "Tell us a secret about yourself nobody here knows", diff: "spicy" },
        { text: "What's the most French thing you've done today?", diff: "mild" },
        { text: "Describe your worst date ever", diff: "spicy" },
        { text: "What's the worst thing in your camera roll right now?", diff: "nuclear" },
        { text: "Who on this trip would you trust with your life? And who wouldn't you?", diff: "spicy" },
        { text: "What's the biggest lie you've ever told?", diff: "spicy" },
        { text: "What's your most unpopular opinion?", diff: "mild" },
        { text: "If you were stranded here forever, who from this trip would you want with you?", diff: "mild" },
        { text: "What's the worst gift you've ever given or received?", diff: "mild" },
        { text: "Show the last photo you took on your phone", diff: "spicy" },
        { text: "What's the most childish thing you still do?", diff: "mild" },
        { text: "What's the most embarrassing song on your Spotify?", diff: "mild" },
        { text: "What's the craziest rumour you've heard about someone on this trip?", diff: "nuclear" },
        { text: "Who here do you think will get into trouble first this trip?", diff: "mild" },
        { text: "What's the longest you've gone without showering?", diff: "spicy" },
        { text: "If Joe had to roast you, what would he say?", diff: "mild" },
        { text: "What's the worst thing you've done on a holiday?", diff: "spicy" },
        { text: "Read out the last WhatsApp message you sent about someone here", diff: "nuclear" },
        { text: "What's one thing about yourself you'd change?", diff: "mild" },
        { text: "Who was your first celebrity crush?", diff: "mild" },
        { text: "What's the pettiest reason you've ended a friendship?", diff: "spicy" },
        { text: "What's your most irrational fear?", diff: "mild" },
        { text: "If you could un-invite one person from this trip, who? (don't say Joe)", diff: "nuclear" },
        { text: "What's the most money you've wasted on something stupid?", diff: "mild" },
        { text: "Who do you think will be first to cry on this trip?", diff: "mild" },
        { text: "Tell us about a time you got caught doing something you shouldn't", diff: "spicy" },
        { text: "What's one thing you've never told Joe?", diff: "spicy" },
        { text: "Describe the person to your left using only 3 words", diff: "mild" }
    ];

    const DARES = [
        { text: "Do your best impression of Joe for 30 seconds", diff: "mild" },
        { text: "Take a shot of whatever drink the person to your left chooses", diff: "spicy" },
        { text: "Post a selfie on Instagram with the caption 'I love Joe O'Brien'", diff: "spicy" },
        { text: "Speak only in a French accent for the next 10 minutes", diff: "mild" },
        { text: "Let the group post one story on your Instagram", diff: "nuclear" },
        { text: "Give someone a piggyback ride around the pool", diff: "spicy" },
        { text: "Text your mum 'I've decided to move to France permanently'", diff: "nuclear" },
        { text: "Swap an item of clothing with the person opposite you", diff: "spicy" },
        { text: "Do 10 push-ups while singing Happy Birthday", diff: "mild" },
        { text: "Let someone draw something on your face with a marker", diff: "nuclear" },
        { text: "Serenade Joe with any song of your choice", diff: "spicy" },
        { text: "Do a catwalk around the room in the most dramatic way possible", diff: "mild" },
        { text: "Speak in rhymes for the next 5 minutes", diff: "mild" },
        { text: "Let the group send a text from your phone to anyone", diff: "nuclear" },
        { text: "Hold hands with the person to your right until your next turn", diff: "mild" },
        { text: "Do your best French waiter impression and take everyone's order", diff: "mild" },
        { text: "Attempt the worm on the floor. Commitment counts.", diff: "spicy" },
        { text: "Make up a 30-second rap about Joe's 30th birthday", diff: "spicy" },
        { text: "Call a random contact and sing the first line of any song", diff: "nuclear" },
        { text: "Eat a condiment of the group's choice straight from the bottle", diff: "spicy" },
        { text: "Do a handstand (or attempt one) for as long as you can", diff: "mild" },
        { text: "Talk in a whisper for the next 15 minutes", diff: "mild" },
        { text: "Let someone style your hair however they want for the rest of the game", diff: "spicy" },
        { text: "Recreate a famous movie scene with someone the group picks", diff: "mild" },
        { text: "Down whatever's in your glass right now", diff: "spicy" },
        { text: "Belly flop into the pool (if available) or do 20 star jumps", diff: "nuclear" },
        { text: "Act like a butler to the person on your right for 10 minutes", diff: "mild" },
        { text: "Post on social media that Joe is the greatest person alive", diff: "spicy" },
        { text: "Propose to Joe on one knee with a heartfelt speech", diff: "spicy" },
        { text: "Wear your t-shirt inside out for the rest of the game", diff: "mild" },
        { text: "Balance a drink on your head for 30 seconds", diff: "mild" },
        { text: "Do your best TikTok dance in front of everyone", diff: "spicy" },
        { text: "Let someone tickle you for 10 seconds without moving", diff: "nuclear" },
        { text: "Swap shoes with the person across from you for the rest of the game", diff: "mild" },
        { text: "Act out a charade of the most embarrassing moment of the trip so far", diff: "spicy" }
    ];

    let drawn = Store.get('truthDareDrawn', { truths: [], dares: [] });
    let currentDiff = 'all';

    // Difficulty tabs
    document.querySelectorAll('.tod-tab').forEach(tab => {
        tab.addEventListener('click', function () {
            document.querySelectorAll('.tod-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentDiff = this.dataset.diff;
            updateCounter();
        });
    });

    function getAvailable(deck, type) {
        const drawnIds = drawn[type] || [];
        let available = deck.filter((_, i) => !drawnIds.includes(i));
        if (currentDiff !== 'all') {
            available = available.filter(c => c.diff === currentDiff);
        }
        return available.map(c => ({ ...c, idx: deck.indexOf(c) }));
    }

    function drawCard(type) {
        const deck = type === 'truths' ? TRUTHS : DARES;
        const available = getAvailable(deck, type);
        if (available.length === 0) {
            alert('No more ' + (type === 'truths' ? 'truths' : 'dares') + ' available! Reset or change difficulty.');
            return;
        }

        const card = available[Math.floor(Math.random() * available.length)];
        drawn[type].push(card.idx);
        Store.set('truthDareDrawn', drawn);

        // Set card content
        cardType.textContent = type === 'truths' ? 'TRUTH' : 'DARE';
        cardType.className = 'tod-card-type tod-type-' + type;
        cardText.textContent = card.text;
        cardDiff.textContent = card.diff.charAt(0).toUpperCase() + card.diff.slice(1);
        cardDiff.className = 'tod-card-diff tod-diff-' + card.diff;

        // Trigger flip
        cardInner.classList.remove('flipped');
        void cardInner.offsetWidth; // force reflow
        cardInner.classList.add('flipped');
        updateCounter();
    }

    drawTruth.addEventListener('click', function () { drawCard('truths'); });
    drawDare.addEventListener('click', function () { drawCard('dares'); });

    function updateCounter() {
        const tAvail = getAvailable(TRUTHS, 'truths').length;
        const dAvail = getAvailable(DARES, 'dares').length;
        counter.textContent = tAvail + ' truths / ' + dAvail + ' dares remaining';
    }

    updateCounter();
}

/* ============================================
   Never Have I Ever
   ============================================ */
function initNeverHaveIEver() {
    const cardEl = document.getElementById('nhie-card');
    const textEl = document.getElementById('nhie-text');
    const nextBtn = document.getElementById('nhie-next');
    const reshuffleBtn = document.getElementById('nhie-reshuffle');
    const counterEl = document.getElementById('nhie-counter');

    if (!cardEl || !nextBtn) return;

    const STATEMENTS = [
        "Never have I ever been sick on a night out with Joe",
        "Never have I ever forgotten someone's name on this trip",
        "Never have I ever pretended to like wine",
        "Never have I ever used Google Translate on this trip",
        "Never have I ever danced on a table",
        "Never have I ever texted an ex after midnight",
        "Never have I ever cried watching a film with friends",
        "Never have I ever been thrown out of somewhere",
        "Never have I ever faked being ill to avoid plans",
        "Never have I ever eaten something off the floor",
        "Never have I ever lied about how much I drank",
        "Never have I ever stalked someone's Instagram",
        "Never have I ever had a crush on a friend's partner",
        "Never have I ever gone skinny dipping",
        "Never have I ever broken something at someone's house and not told them",
        "Never have I ever pretended to know a song everyone else knows",
        "Never have I ever worn the same outfit two days in a row on holiday",
        "Never have I ever walked into a glass door",
        "Never have I ever sent a text to the wrong person",
        "Never have I ever cried on a plane",
        "Never have I ever blamed a fart on someone else",
        "Never have I ever had a conversation with someone and forgotten their name mid-chat",
        "Never have I ever re-gifted a present",
        "Never have I ever snuck food into a cinema",
        "Never have I ever lied on my CV",
        "Never have I ever fallen asleep in public",
        "Never have I ever ghosted someone",
        "Never have I ever peed in a pool",
        "Never have I ever pretended to be asleep to avoid someone",
        "Never have I ever been caught talking about someone behind their back",
        "Never have I ever drunk-dialled my parents",
        "Never have I ever kissed someone at a party and forgotten who",
        "Never have I ever been the last one standing on a night out",
        "Never have I ever stolen a glass or sign from a pub",
        "Never have I ever been to a karaoke bar sober",
        "Never have I ever cried in a work meeting",
        "Never have I ever lied about my age to get into somewhere",
        "Never have I ever been on a disastrous date and stayed anyway",
        "Never have I ever embarrassed myself in front of a celebrity",
        "Never have I ever pretended to like something to impress someone",
        "Never have I ever lost my wallet or keys on a night out",
        "Never have I ever gone an entire day without looking at my phone",
        "Never have I ever done a dare I immediately regretted",
        "Never have I ever accidentally liked someone's old Instagram photo",
        "Never have I ever said 'I love you' to someone by accident",
        "Never have I ever faked knowing how to cook something",
        "Never have I ever waved back at someone who wasn't waving at me",
        "Never have I ever cried at a wedding",
        "Never have I ever told someone I was 'on my way' while still in bed",
        "Never have I ever pretended to be on the phone to avoid someone",
        "Never have I ever eaten an entire share bag of crisps alone",
        "Never have I ever blamed autocorrect for something I actually meant to say"
    ];

    let deck = [];
    let position = 0;

    function shuffle() {
        deck = [...STATEMENTS].sort(() => Math.random() - 0.5);
        position = 0;
        updateDisplay();
    }

    function next() {
        if (position >= deck.length) {
            textEl.textContent = "That's all! Tap 'New Round' to reshuffle.";
            counterEl.textContent = deck.length + ' / ' + deck.length;
            return;
        }
        // Slide animation
        cardEl.classList.remove('nhie-slide-in');
        void cardEl.offsetWidth;
        cardEl.classList.add('nhie-slide-in');
        textEl.textContent = deck[position];
        position++;
        updateDisplay();
    }

    function updateDisplay() {
        counterEl.textContent = position + ' / ' + deck.length;
    }

    nextBtn.addEventListener('click', next);
    cardEl.addEventListener('click', next);
    reshuffleBtn.addEventListener('click', function () {
        shuffle();
        textEl.textContent = 'Tap to start!';
    });

    shuffle();
    textEl.textContent = 'Tap to start!';
}

/* ============================================
   Scavenger Hunt
   ============================================ */
function initScavengerHunt() {
    const listEl = document.getElementById('scav-list');
    const fillEl = document.getElementById('scav-progress-fill');
    const labelEl = document.getElementById('scav-progress-label');

    if (!listEl) return;

    const CHALLENGES = [
        "Selfie with a baguette as a sword",
        "Group recreating a famous album cover",
        "Someone doing a handstand by the pool",
        "Photo with a local French person",
        "Catching someone napping",
        "Sunset silhouette at the chateau",
        "Team photo in matching poses",
        "Someone cooking in a chef's hat (or makeshift one)",
        "Action shot of someone falling in the pool",
        "Recreate a family photo from childhood",
        "Photo of the messiest room",
        "Someone reading a French newspaper",
        "Group photo at the most scenic spot",
        "Catching someone singing in the shower/kitchen",
        "Human pyramid",
        "Photo where everyone is doing a different activity",
        "Best 'tourist' photo with the chateau",
        "Someone being carried like a baby",
        "Everyone pointing at Joe",
        "The last photo of the trip"
    ];

    const guestCode = Auth.getGuestCode() || 'guest';
    const storageKey = 'scavengerHunt_' + guestCode;
    let completed = Store.get(storageKey, []);

    function render() {
        const count = completed.length;
        fillEl.style.width = (count / CHALLENGES.length * 100) + '%';
        labelEl.textContent = count + ' / ' + CHALLENGES.length;

        listEl.innerHTML = CHALLENGES.map(function (challenge, i) {
            const done = completed.includes(i);
            return '<div class="scav-item ' + (done ? 'scav-done' : '') + '">' +
                '<label class="scav-label">' +
                '<input type="checkbox" class="scav-check" data-idx="' + i + '" ' + (done ? 'checked' : '') + '>' +
                '<span class="scav-num">' + (i + 1) + '.</span> ' +
                '<span class="scav-text">' + escapeHtml(challenge) + '</span>' +
                '</label>' +
                '</div>';
        }).join('');

        // Bonus message
        if (count === CHALLENGES.length) {
            listEl.innerHTML += '<div class="scav-bonus">All 20 complete! +5 bonus points!</div>';
        }

        // Bind checkbox events
        listEl.querySelectorAll('.scav-check').forEach(function (cb) {
            cb.addEventListener('change', function () {
                var idx = parseInt(this.dataset.idx);
                if (this.checked) {
                    if (!completed.includes(idx)) completed.push(idx);
                } else {
                    completed = completed.filter(function (c) { return c !== idx; });
                }
                Store.set(storageKey, completed);
                render();
            });
        });
    }

    render();
}

/* ============================================
   Head-to-Head Quiz
   ============================================ */
function initH2HQuiz() {
    var setupEl = document.getElementById('h2h-setup');
    var gameEl = document.getElementById('h2h-game');
    var resultEl = document.getElementById('h2h-result');
    var startBtn = document.getElementById('h2h-start');
    var rematchBtn = document.getElementById('h2h-rematch');
    var p1Select = document.getElementById('h2h-p1');
    var p2Select = document.getElementById('h2h-p2');

    if (!startBtn) return;

    var QUESTIONS = [
        { question: "What year was Joe born?", options: ["1994", "1995", "1996", "1997"], correct: 2 },
        { question: "What's Joe's favorite drink?", options: ["Beer", "Wine", "Gin & Tonic", "Whisky"], correct: 0 },
        { question: "Where did Joe grow up?", options: ["London", "Manchester", "Bristol", "Birmingham"], correct: 0 },
        { question: "What's Joe's go-to karaoke song?", options: ["Mr. Brightside", "Don't Look Back in Anger", "Sweet Caroline", "Wonderwall"], correct: 0 },
        { question: "What football team does Joe support?", options: ["Arsenal", "Chelsea", "Tottenham", "West Ham"], correct: 0 },
        { question: "What's Joe's biggest fear?", options: ["Spiders", "Heights", "Public Speaking", "Clowns"], correct: 1 },
        { question: "What's Joe's favorite cuisine?", options: ["Italian", "Mexican", "Thai", "Indian"], correct: 0 },
        { question: "What's Joe's hidden talent?", options: ["Juggling", "Cooking", "Dancing", "Card tricks"], correct: 1 },
        { question: "What was Joe's first job?", options: ["Barista", "Shop assistant", "Waiter", "Office intern"], correct: 2 },
        { question: "What's Joe's most-watched film?", options: ["The Godfather", "Anchorman", "Shawshank Redemption", "Pulp Fiction"], correct: 1 }
    ];

    // Populate player dropdowns
    var playerNames = Object.keys(PLAYERS).sort();
    playerNames.forEach(function (name) {
        var opt1 = document.createElement('option');
        opt1.value = name; opt1.textContent = name;
        p1Select.appendChild(opt1);
        var opt2 = document.createElement('option');
        opt2.value = name; opt2.textContent = name;
        p2Select.appendChild(opt2);
    });

    var p1Name = '', p2Name = '', currentQ = 0, s1 = 0, s2 = 0, currentPlayer = 1;

    startBtn.addEventListener('click', function () {
        p1Name = p1Select.value;
        p2Name = p2Select.value;
        if (!p1Name || !p2Name || p1Name === p2Name) {
            alert('Select two different players!');
            return;
        }
        currentQ = 0; s1 = 0; s2 = 0; currentPlayer = 1;
        setupEl.style.display = 'none';
        resultEl.style.display = 'none';
        gameEl.style.display = 'block';
        showH2HQuestion();
    });

    rematchBtn.addEventListener('click', function () {
        resultEl.style.display = 'none';
        setupEl.style.display = 'block';
    });

    function showH2HQuestion() {
        var q = QUESTIONS[currentQ];
        document.getElementById('h2h-qnum').textContent = currentQ + 1;
        document.getElementById('h2h-question').textContent = q.question;
        document.getElementById('h2h-turn').textContent = (currentPlayer === 1 ? escapeHtml(p1Name) : escapeHtml(p2Name)) + "'s turn";
        document.getElementById('h2h-turn').className = 'h2h-turn-indicator h2h-p' + currentPlayer;
        document.getElementById('h2h-score1').textContent = s1;
        document.getElementById('h2h-score2').textContent = s2;

        var optionsEl = document.getElementById('h2h-options');
        optionsEl.innerHTML = '';
        q.options.forEach(function (opt, i) {
            var btn = document.createElement('button');
            btn.className = 'quiz-option';
            btn.textContent = opt;
            btn.addEventListener('click', function () { h2hAnswer(i); });
            optionsEl.appendChild(btn);
        });
    }

    function h2hAnswer(idx) {
        var q = QUESTIONS[currentQ];
        var opts = document.querySelectorAll('#h2h-options .quiz-option');
        opts.forEach(function (o, i) {
            o.style.pointerEvents = 'none';
            if (i === q.correct) o.classList.add('correct');
            else if (i === idx && i !== q.correct) o.classList.add('incorrect');
        });

        if (idx === q.correct) {
            if (currentPlayer === 1) s1++;
            else s2++;
        }

        setTimeout(function () {
            if (currentPlayer === 1) {
                currentPlayer = 2;
                showH2HQuestion();
            } else {
                currentPlayer = 1;
                currentQ++;
                if (currentQ < QUESTIONS.length) {
                    showH2HQuestion();
                } else {
                    showH2HResult();
                }
            }
        }, 800);
    }

    function showH2HResult() {
        gameEl.style.display = 'none';
        resultEl.style.display = 'block';

        var finalEl = document.getElementById('h2h-final-score');
        finalEl.innerHTML = '<span class="h2h-name">' + escapeHtml(p1Name) + '</span> <span class="h2h-big-score">' + s1 + '</span>' +
            ' <span class="h2h-vs-result">vs</span> ' +
            '<span class="h2h-big-score">' + s2 + '</span> <span class="h2h-name">' + escapeHtml(p2Name) + '</span>';

        var winnerText = document.getElementById('h2h-winner-text');
        if (s1 > s2) {
            winnerText.textContent = escapeHtml(p1Name) + ' wins! Better luck next time, ' + escapeHtml(p2Name) + '!';
            if (typeof triggerConfetti === 'function') triggerConfetti();
        } else if (s2 > s1) {
            winnerText.textContent = escapeHtml(p2Name) + ' wins! Better luck next time, ' + escapeHtml(p1Name) + '!';
            if (typeof triggerConfetti === 'function') triggerConfetti();
        } else {
            winnerText.textContent = "It's a draw! You know Joe equally well.";
        }

        // Save result
        var results = Store.get('h2hResults', []);
        results.unshift({ p1: p1Name, p2: p2Name, s1: s1, s2: s2, timestamp: Date.now() });
        Store.set('h2hResults', results.slice(0, 20));
        renderH2HHistory();
    }

    function renderH2HHistory() {
        var histEl = document.getElementById('h2h-history');
        if (!histEl) return;
        var results = Store.get('h2hResults', []);
        if (results.length === 0) {
            histEl.innerHTML = '';
            return;
        }
        histEl.innerHTML = '<h4>Recent Battles</h4>' +
            results.slice(0, 5).map(function (r) {
                var winner = r.s1 > r.s2 ? r.p1 : (r.s2 > r.s1 ? r.p2 : 'Draw');
                return '<div class="h2h-history-row">' +
                    '<span>' + escapeHtml(r.p1) + ' <strong>' + r.s1 + '</strong></span>' +
                    '<span class="h2h-hist-vs">vs</span>' +
                    '<span><strong>' + r.s2 + '</strong> ' + escapeHtml(r.p2) + '</span>' +
                    '</div>';
            }).join('');
    }

    renderH2HHistory();
}

/* ============================================
   Morning Roll Call
   ============================================ */
function initRollCall() {
    var statusEl = document.getElementById('rc-status');
    var actionEl = document.getElementById('rc-action');
    var listEl = document.getElementById('rc-list');

    if (!statusEl) return;

    function getTripDay() {
        var start = new Date('2026-04-29').getTime();
        var day = Math.floor((Date.now() - start) / 86400000) + 1;
        return Math.max(1, Math.min(6, day));
    }

    function getCurrentHour() {
        return new Date().getHours();
    }

    var day = getTripDay();
    var rollCall = Store.get('rollCall', {});
    var dayKey = 'day' + day;
    if (!rollCall[dayKey]) rollCall[dayKey] = [];

    var guestCode = Auth.getGuestCode();
    var guestData = Auth.getGuestData();
    var guestName = guestData ? guestData.name : null;
    var hour = getCurrentHour();
    var isOpen = hour >= 7 && hour < 10;

    function render() {
        rollCall = Store.get('rollCall', {});
        if (!rollCall[dayKey]) rollCall[dayKey] = [];
        var entries = rollCall[dayKey];

        // Status
        if (isOpen) {
            statusEl.innerHTML = '<div class="rc-open">Roll call is OPEN! Check in before 10 AM.</div>';
        } else if (hour < 7) {
            statusEl.innerHTML = '<div class="rc-closed">Roll call opens at 7:00 AM</div>';
        } else {
            statusEl.innerHTML = '<div class="rc-closed">Roll call is closed for today</div>';
        }

        // Action button
        var alreadyCheckedIn = entries.some(function (e) { return e.code === guestCode; });
        if (isOpen && guestName && !alreadyCheckedIn) {
            actionEl.innerHTML = '<button class="btn btn-primary rc-checkin-btn" id="rc-checkin">I\'m Alive! (' + escapeHtml(guestName) + ')</button>';
            document.getElementById('rc-checkin').addEventListener('click', function () {
                entries.push({
                    name: guestName,
                    code: guestCode,
                    time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                    timestamp: Date.now()
                });
                rollCall[dayKey] = entries;
                Store.set('rollCall', rollCall);
                render();
            });
        } else if (alreadyCheckedIn) {
            actionEl.innerHTML = '<div class="rc-checked">You\'re checked in!</div>';
        } else {
            actionEl.innerHTML = '';
        }

        // List
        if (entries.length === 0) {
            listEl.innerHTML = '<p class="rc-empty">No one has checked in yet today.</p>';
            return;
        }

        var sortedEntries = entries.slice().sort(function (a, b) { return a.timestamp - b.timestamp; });
        listEl.innerHTML = sortedEntries.map(function (e, i) {
            var tag = '';
            if (i === 0) tag = '<span class="rc-tag rc-early">Early Bird</span>';
            if (i === sortedEntries.length - 1 && sortedEntries.length > 1) tag = '<span class="rc-tag rc-zombie">Zombie</span>';
            return '<div class="rc-entry">' +
                '<span class="rc-rank">' + (i + 1) + '.</span>' +
                '<span class="rc-name">' + escapeHtml(e.name) + '</span>' +
                tag +
                '<span class="rc-time">' + escapeHtml(e.time) + '</span>' +
                '</div>';
        }).join('');

        // Admin award buttons
        if (Auth.isAdmin() && entries.length > 0) {
            listEl.innerHTML += '<div class="rc-admin">' +
                '<p class="rc-admin-note">Admin: Award +1 to Early Bird, -1 to Zombie via Leaderboard</p>' +
                '</div>';
        }
    }

    render();
}

/* ============================================
   Drinking Game Tracker
   ============================================ */
function initDrinkTracker() {
    var boardEl = document.getElementById('dt-board');
    if (!boardEl) return;

    var tracker = Store.get('drinkTracker', {});
    var isAdmin = Auth.isAdmin();

    function getBadge(count) {
        if (count >= 30) return { label: 'Liver of Steel', cls: 'dt-liver' };
        if (count >= 15) return { label: 'Heavyweight', cls: 'dt-heavy' };
        if (count >= 5) return { label: 'Social Drinker', cls: 'dt-social' };
        return { label: 'Lightweight', cls: 'dt-light' };
    }

    function render() {
        tracker = Store.get('drinkTracker', {});

        // Ensure all players exist
        Object.keys(PLAYERS).forEach(function (name) {
            if (!(name in tracker)) tracker[name] = 0;
        });

        var sorted = Object.keys(tracker)
            .map(function (name) { return { name: name, count: tracker[name] }; })
            .sort(function (a, b) { return b.count - a.count; });

        boardEl.innerHTML = sorted.map(function (p, i) {
            var badge = getBadge(p.count);
            var adminBtns = isAdmin ?
                '<button class="dt-btn dt-plus" data-name="' + escapeHtml(p.name) + '">+</button>' +
                '<button class="dt-btn dt-minus" data-name="' + escapeHtml(p.name) + '">-</button>' : '';
            return '<div class="dt-row">' +
                '<span class="dt-rank">' + (i + 1) + '.</span>' +
                '<span class="dt-name">' + escapeHtml(p.name) + '</span>' +
                '<span class="dt-badge ' + badge.cls + '">' + badge.label + '</span>' +
                '<span class="dt-count">' + p.count + '</span>' +
                adminBtns +
                '</div>';
        }).join('');

        // Non-admin: show a +1 button for all players
        if (!isAdmin) {
            boardEl.querySelectorAll('.dt-row').forEach(function (row) {
                // Add a simple +1 button for everyone
            });
        }

        // Bind admin buttons
        boardEl.querySelectorAll('.dt-plus').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var name = this.dataset.name;
                tracker[name] = (tracker[name] || 0) + 1;
                Store.set('drinkTracker', tracker);
                render();
            });
        });
        boardEl.querySelectorAll('.dt-minus').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var name = this.dataset.name;
                tracker[name] = Math.max(0, (tracker[name] || 0) - 1);
                Store.set('drinkTracker', tracker);
                render();
            });
        });
    }

    // Also let any logged-in user add a drink for anyone (tap the count)
    boardEl.addEventListener('click', function (e) {
        var countEl = e.target.closest('.dt-count');
        if (countEl && !isAdmin) {
            var row = countEl.closest('.dt-row');
            var nameEl = row.querySelector('.dt-name');
            if (nameEl) {
                var name = nameEl.textContent;
                tracker[name] = (tracker[name] || 0) + 1;
                Store.set('drinkTracker', tracker);
                render();
            }
        }
    });

    render();
}

/* ============================================
   Awards Night Builder (admin only)
   ============================================ */
function initAwardsNight() {
    var container = document.getElementById('awards-container');
    if (!container) return;

    var isAdmin = Auth.isAdmin();
    var awardsData = Store.get('awardsNight', { categories: [], revealed: false });

    var SUGGESTIONS = [
        'Best Travel Companion', 'Kitchen Nightmare', 'Pool Shark',
        'Most Improved French', 'Party Animal', 'Best Costume',
        'Funniest Moment', 'Best Sport', 'Drama Queen/King',
        'Most Likely to Move to France', 'Best Dance Moves', 'Iron Chef'
    ];

    var playerNames = Object.keys(PLAYERS).sort();

    function render() {
        awardsData = Store.get('awardsNight', { categories: [], revealed: false });

        if (!isAdmin && !awardsData.revealed) {
            container.innerHTML = '<div class="awards-locked"><span class="awards-lock-icon">&#128274;</span><p>Awards will be revealed by Joe at the ceremony!</p></div>';
            return;
        }

        if (!isAdmin && awardsData.revealed) {
            // Show awards in presentation mode
            container.innerHTML = awardsData.categories.map(function (cat) {
                return '<div class="award-reveal-card">' +
                    '<h3 class="award-category">' + escapeHtml(cat.name) + '</h3>' +
                    '<div class="award-winner-name">' + escapeHtml(cat.winner || 'TBD') + '</div>' +
                    '</div>';
            }).join('');
            return;
        }

        // Admin view
        var html = '<div class="awards-admin">';

        // Add category form
        html += '<div class="awards-add">' +
            '<h4>Add Award Category</h4>' +
            '<div class="awards-suggestions">' +
            SUGGESTIONS.map(function (s) {
                return '<button class="awards-sug-btn" data-name="' + escapeHtml(s) + '">' + escapeHtml(s) + '</button>';
            }).join('') +
            '</div>' +
            '<div class="awards-custom-row">' +
            '<input type="text" id="awards-custom-name" placeholder="Custom category...">' +
            '<button class="btn btn-primary" id="awards-add-btn">Add</button>' +
            '</div>' +
            '</div>';

        // Category list
        html += '<div class="awards-list">';
        awardsData.categories.forEach(function (cat, i) {
            html += '<div class="award-item">' +
                '<span class="award-cat-name">' + escapeHtml(cat.name) + '</span>' +
                '<select class="award-winner-select" data-idx="' + i + '">' +
                '<option value="">Select winner</option>' +
                playerNames.map(function (n) {
                    return '<option value="' + escapeHtml(n) + '" ' + (cat.winner === n ? 'selected' : '') + '>' + escapeHtml(n) + '</option>';
                }).join('') +
                '</select>' +
                '<button class="btn btn-outline awards-remove" data-idx="' + i + '">X</button>' +
                '</div>';
        });
        html += '</div>';

        // Reveal button
        html += '<div class="awards-actions">' +
            '<button class="btn ' + (awardsData.revealed ? 'btn-secondary' : 'btn-primary') + '" id="awards-reveal-btn">' +
            (awardsData.revealed ? 'Hide Awards' : 'Reveal to All') +
            '</button>' +
            '</div>';

        html += '</div>';
        container.innerHTML = html;

        // Bind events
        container.querySelectorAll('.awards-sug-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                addCategory(this.dataset.name);
            });
        });

        var addBtn = document.getElementById('awards-add-btn');
        if (addBtn) {
            addBtn.addEventListener('click', function () {
                var input = document.getElementById('awards-custom-name');
                if (input && input.value.trim()) {
                    addCategory(input.value.trim());
                    input.value = '';
                }
            });
        }

        container.querySelectorAll('.award-winner-select').forEach(function (sel) {
            sel.addEventListener('change', function () {
                awardsData.categories[parseInt(this.dataset.idx)].winner = this.value;
                Store.set('awardsNight', awardsData);
            });
        });

        container.querySelectorAll('.awards-remove').forEach(function (btn) {
            btn.addEventListener('click', function () {
                awardsData.categories.splice(parseInt(this.dataset.idx), 1);
                Store.set('awardsNight', awardsData);
                render();
            });
        });

        var revealBtn = document.getElementById('awards-reveal-btn');
        if (revealBtn) {
            revealBtn.addEventListener('click', function () {
                awardsData.revealed = !awardsData.revealed;
                Store.set('awardsNight', awardsData);
                render();
            });
        }
    }

    function addCategory(name) {
        if (awardsData.categories.some(function (c) { return c.name === name; })) return;
        awardsData.categories.push({ name: name, winner: '' });
        Store.set('awardsNight', awardsData);
        render();
    }

    render();
}

/* ============================================
   Daily Challenge Reveal (Feature 8)
   - Staggered card entrance on day-tab switch
   - "Today's Games" highlight card
   - Auto-select today's day tab
   ============================================ */
function initDailyChallengeReveal() {
    var dayBtns = document.querySelectorAll('.ch-day-btn');
    var dayContents = document.querySelectorAll('.ch-day-content');

    if (!dayBtns.length) return;

    function getTripDay() {
        var start = new Date('2026-04-29').getTime();
        var day = Math.floor((Date.now() - start) / 86400000) + 1;
        return Math.max(1, Math.min(6, day));
    }

    function animateCards(container) {
        var cards = container.querySelectorAll('.ch-card');
        cards.forEach(function (card, i) {
            card.classList.remove('ch-card-enter');
            void card.offsetWidth;
            card.style.animationDelay = (i * 100) + 'ms';
            card.classList.add('ch-card-enter');
        });
    }

    function updateTodayHighlight(dayNum) {
        // Remove existing highlight
        var existing = document.querySelector('.todays-games-highlight');
        if (existing) existing.remove();

        var dayContent = document.querySelector('.ch-day-content[data-chday="' + dayNum + '"]');
        if (!dayContent) return;

        var cards = dayContent.querySelectorAll('.ch-card');
        var gameCount = cards.length;
        var totalPoints = 0;
        cards.forEach(function (card) {
            var ptsEl = card.querySelector('.ch-points');
            if (ptsEl) {
                var match = ptsEl.textContent.match(/\+?(\d+)/);
                if (match) totalPoints += parseInt(match[1]);
            }
        });

        var highlight = document.createElement('div');
        highlight.className = 'todays-games-highlight';
        highlight.innerHTML = '<span class="tgh-icon">&#127918;</span>' +
            '<div class="tgh-info">' +
            '<strong>Day ' + dayNum + ': ' + gameCount + ' games to play</strong>' +
            '<span>' + totalPoints + ' total points available</span>' +
            '</div>';

        var dailyContent = document.querySelector('.ch-content[data-ch="daily"]');
        if (dailyContent) {
            var daySelect = dailyContent.querySelector('.ch-day-select');
            if (daySelect) {
                daySelect.after(highlight);
            }
        }
    }

    // Override existing day button clicks to add animations
    dayBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var dayNum = parseInt(this.dataset.chday);
            // Wait for display to kick in, then animate
            setTimeout(function () {
                var target = document.querySelector('.ch-day-content.active[data-chday="' + dayNum + '"]');
                if (target) animateCards(target);
            }, 50);
            updateTodayHighlight(dayNum);
        });
    });

    // Auto-select today's day tab
    var today = getTripDay();
    var todayBtn = document.querySelector('.ch-day-btn[data-chday="' + today + '"]');
    if (todayBtn) {
        dayBtns.forEach(function (b) { b.classList.remove('active'); });
        dayContents.forEach(function (c) { c.classList.remove('active'); });
        todayBtn.classList.add('active');
        var todayContent = document.querySelector('.ch-day-content[data-chday="' + today + '"]');
        if (todayContent) {
            todayContent.classList.add('active');
            setTimeout(function () { animateCards(todayContent); }, 100);
        }
        updateTodayHighlight(today);
    } else {
        // Fallback: show today's highlight for day 1
        var activeDay = document.querySelector('.ch-day-btn.active');
        if (activeDay) {
            updateTodayHighlight(parseInt(activeDay.dataset.chday));
        }
    }
}

/* ============================================
   Feature 1: Would You Rather?
   Daily question with live vote split
   ============================================ */
function initWouldYouRather() {
    var card = document.getElementById('wyr-card');
    if (!card) return;

    function escapeHtml(t) { var d = document.createElement('div'); d.textContent = t; return d.innerHTML; }

    var QUESTIONS = [
        { a: "Only drink wine for the whole trip", b: "Only drink beer" },
        { a: "Share a room with Joe's snoring", b: "Do all the washing up for the trip" },
        { a: "Do karaoke solo in front of everyone", b: "Skinny dip in the pool" },
        { a: "Eat only baguettes for a week", b: "Eat only cheese for a week" },
        { a: "Be Joe's PA for a day", b: "Be his personal chef for a day" },
        { a: "Have to speak only French for 24 hours", b: "Wear a beret and stripy top all day" },
        { a: "Never use your phone on holiday again", b: "Never drink alcohol on holiday again" },
        { a: "Do a 5am run every morning of the trip", b: "Stay up until 4am every night" },
        { a: "Give a 5-minute speech about Joe in front of everyone", b: "Let Joe choose your outfit for the whole day" },
        { a: "Swap wardrobes with Joe for the trip", b: "Swap diets with Joe for the trip" },
        { a: "Only communicate through charades for a day", b: "Only communicate through song lyrics for a day" },
        { a: "Be the designated driver for the entire trip", b: "Cook every single meal" },
        { a: "Get a temporary tattoo of Joe's face", b: "Change your Instagram bio to 'Joe O'Brien's #1 fan' for a month" },
        { a: "Relive your most embarrassing moment in front of the group", b: "Have the group read your search history" },
        { a: "Live at the chateau forever but never leave", b: "Never visit France again" },
        { a: "Have Joe plan your wedding", b: "Have Joe plan your next birthday party" }
    ];

    var guestCode = (typeof Auth !== 'undefined' && Auth.getGuestCode) ? Auth.getGuestCode() || 'anon' : 'anon';

    function getDay() {
        if (typeof getTripDay === 'function') return getTripDay();
        var start = new Date('2026-04-29').getTime();
        var day = Math.floor((Date.now() - start) / 86400000) + 1;
        return Math.max(1, Math.min(6, day));
    }

    var day = getDay();
    var qIndex = (day - 1) % QUESTIONS.length;
    var q = QUESTIONS[qIndex];

    var data = Store.get('wouldYouRather', {});
    if (!data[qIndex]) data[qIndex] = { a: [], b: [] };
    var qData = data[qIndex];

    var questionEl = document.getElementById('wyr-question');
    var textA = document.getElementById('wyr-text-a');
    var textB = document.getElementById('wyr-text-b');
    var barA = document.getElementById('wyr-bar-a');
    var barB = document.getElementById('wyr-bar-b');
    var pctA = document.getElementById('wyr-pct-a');
    var pctB = document.getElementById('wyr-pct-b');
    var totalEl = document.getElementById('wyr-total');
    var optA = document.getElementById('wyr-option-a');
    var optB = document.getElementById('wyr-option-b');

    questionEl.textContent = 'Would you rather...';
    textA.textContent = q.a;
    textB.textContent = q.b;

    var hasVoted = qData.a.includes(guestCode) || qData.b.includes(guestCode);

    function render() {
        var totalVotes = qData.a.length + qData.b.length;
        var pA = totalVotes > 0 ? Math.round((qData.a.length / totalVotes) * 100) : 50;
        var pB = totalVotes > 0 ? 100 - pA : 50;

        if (hasVoted || totalVotes > 0) {
            barA.style.width = pA + '%';
            barB.style.width = pB + '%';
            pctA.textContent = pA + '%';
            pctB.textContent = pB + '%';
            totalEl.textContent = totalVotes + ' vote' + (totalVotes !== 1 ? 's' : '');
        } else {
            barA.style.width = '0%';
            barB.style.width = '0%';
            pctA.textContent = '';
            pctB.textContent = '';
            totalEl.textContent = 'Tap to vote!';
        }

        if (hasVoted) {
            card.classList.add('wyr-voted');
            if (qData.a.includes(guestCode)) optA.classList.add('wyr-selected');
            if (qData.b.includes(guestCode)) optB.classList.add('wyr-selected');
        }
    }

    function vote(choice) {
        if (hasVoted) return;
        qData[choice].push(guestCode);
        hasVoted = true;
        data[qIndex] = qData;
        Store.set('wouldYouRather', data);
        render();
    }

    optA.addEventListener('click', function () { vote('a'); });
    optB.addEventListener('click', function () { vote('b'); });

    render();
}

/* ============================================
   Feature 2: Challenge Countdown Timers
   Admin-triggered countdown with audio + visuals
   ============================================ */
function initChallengeTimers() {
    var overlay = document.getElementById('timer-overlay');
    if (!overlay) return;

    var displayEl = document.getElementById('timer-display');
    var labelEl = document.getElementById('timer-label');
    var ringEl = document.getElementById('timer-ring-progress');
    var closeBtn = document.getElementById('timer-close');

    var timerInterval = null;
    var totalSeconds = 0;
    var remaining = 0;

    var circumference = 2 * Math.PI * 52; // r=52 from SVG
    if (ringEl) {
        ringEl.style.strokeDasharray = circumference;
        ringEl.style.strokeDashoffset = 0;
    }

    function formatTime(s) {
        var m = Math.floor(s / 60);
        var sec = s % 60;
        return m + ':' + (sec < 10 ? '0' : '') + sec;
    }

    function playTickSound() {
        try {
            var ctx = new (window.AudioContext || window.webkitAudioContext)();
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = 800;
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        } catch (e) { /* Audio not available */ }
    }

    function playTimesUpSound() {
        try {
            var ctx = new (window.AudioContext || window.webkitAudioContext)();
            [523, 659, 784].forEach(function (freq, i) {
                var osc = ctx.createOscillator();
                var gain = ctx.createGain();
                osc.type = 'square';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.2, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(ctx.currentTime + i * 0.15);
                osc.stop(ctx.currentTime + 0.5 + i * 0.15);
            });
        } catch (e) { /* Audio not available */ }
    }

    function startTimer(seconds) {
        stopTimer();
        totalSeconds = seconds;
        remaining = seconds;
        overlay.style.display = 'flex';
        overlay.classList.remove('timer-danger', 'timer-timesup');
        labelEl.textContent = 'GO!';
        updateDisplay();

        timerInterval = setInterval(function () {
            remaining--;
            if (remaining <= 0) {
                remaining = 0;
                stopTimer();
                displayEl.textContent = '0:00';
                labelEl.textContent = "TIME'S UP!";
                overlay.classList.add('timer-timesup');
                playTimesUpSound();
                if (typeof triggerMiniConfetti === 'function') triggerMiniConfetti();
                return;
            }
            updateDisplay();

            if (remaining <= 10) {
                overlay.classList.add('timer-danger');
            }
            if (remaining <= 5) {
                playTickSound();
            }
        }, 1000);
    }

    function updateDisplay() {
        displayEl.textContent = formatTime(remaining);
        if (ringEl) {
            var progress = 1 - (remaining / totalSeconds);
            ringEl.style.strokeDashoffset = circumference * (1 - progress);
        }
    }

    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    closeBtn.addEventListener('click', function () {
        stopTimer();
        overlay.style.display = 'none';
        overlay.classList.remove('timer-danger', 'timer-timesup');
    });

    // Add "Start Timer" buttons to challenge cards (admin only)
    if (Auth.isAdmin()) {
        document.querySelectorAll('.ch-card').forEach(function (card) {
            var header = card.querySelector('.ch-card-header');
            if (!header) return;

            var timerBtn = document.createElement('button');
            timerBtn.className = 'ch-timer-btn';
            timerBtn.innerHTML = '&#9201;';
            timerBtn.title = 'Start Timer';
            timerBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                var duration = prompt('Timer duration (seconds):', '60');
                if (duration && !isNaN(duration) && parseInt(duration) > 0) {
                    startTimer(parseInt(duration));
                }
            });

            // Insert before the expand icon
            var expandIcon = header.querySelector('.ch-expand-icon');
            if (expandIcon) {
                header.insertBefore(timerBtn, expandIcon);
            } else {
                header.appendChild(timerBtn);
            }
        });
    }
}

/* ============================================
   Feature 3: Photo Scavenger Hunt Proof
   Camera upload + gallery + admin approval
   ============================================ */
function initScavengerPhotos() {
    var listEl = document.getElementById('scav-list');
    var galleryEl = document.getElementById('scav-gallery');
    if (!listEl || !galleryEl) return;

    function escapeHtml(t) { var d = document.createElement('div'); d.textContent = t; return d.innerHTML; }

    var guestCode = (typeof Auth !== 'undefined' && Auth.getGuestCode) ? Auth.getGuestCode() || 'guest' : 'guest';
    var photoKey = 'scavengerPhotos_' + guestCode;
    var photos = Store.get(photoKey, {});
    var allPhotosKey = 'scavengerPhotos_all';
    var allPhotos = Store.get(allPhotosKey, []);
    var isAdmin = Auth.isAdmin();

    // View toggle
    var viewBtns = document.querySelectorAll('.scav-view-btn');
    viewBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            viewBtns.forEach(function (b) { b.classList.remove('active'); });
            this.classList.add('active');
            var view = this.dataset.view;
            listEl.style.display = view === 'list' ? '' : 'none';
            galleryEl.style.display = view === 'gallery' ? 'grid' : 'none';
            if (view === 'gallery') renderGallery();
        });
    });

    function compressImage(file, callback) {
        var reader = new FileReader();
        reader.onload = function (e) {
            var img = new Image();
            img.onload = function () {
                var canvas = document.createElement('canvas');
                var maxW = 400;
                var scale = maxW / img.width;
                if (scale > 1) scale = 1;
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                callback(canvas.toDataURL('image/jpeg', 0.5));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // Inject camera buttons into scavenger items after they render
    function injectCameraButtons() {
        var items = listEl.querySelectorAll('.scav-item');
        items.forEach(function (item) {
            // Skip if already has camera button
            if (item.querySelector('.scav-camera-btn')) return;

            var label = item.querySelector('.scav-label');
            if (!label) return;

            var idx = label.querySelector('.scav-check');
            if (!idx) return;
            var itemIdx = idx.dataset.idx;

            var cameraBtn = document.createElement('button');
            cameraBtn.className = 'scav-camera-btn';
            cameraBtn.innerHTML = '&#128247;';
            cameraBtn.title = 'Upload photo proof';

            var fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.capture = 'environment';
            fileInput.style.display = 'none';

            cameraBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                fileInput.click();
            });

            fileInput.addEventListener('change', function () {
                if (!this.files || !this.files[0]) return;
                compressImage(this.files[0], function (dataUrl) {
                    photos[itemIdx] = dataUrl;
                    Store.set(photoKey, photos);

                    // Also save to global list for gallery
                    allPhotos = Store.get(allPhotosKey, []);
                    allPhotos.push({
                        itemIdx: parseInt(itemIdx),
                        photo: dataUrl,
                        guest: guestCode,
                        timestamp: Date.now(),
                        approved: false
                    });
                    // Keep last 40 entries to avoid localStorage overflow
                    if (allPhotos.length > 40) allPhotos = allPhotos.slice(-40);
                    Store.set(allPhotosKey, allPhotos);

                    renderThumbnails();
                });
            });

            item.appendChild(fileInput);
            item.appendChild(cameraBtn);

            // Show existing thumbnail
            if (photos[itemIdx]) {
                var thumb = document.createElement('img');
                thumb.className = 'scav-thumb';
                thumb.src = photos[itemIdx];
                thumb.alt = 'Proof photo';
                item.appendChild(thumb);
            }
        });
    }

    function renderThumbnails() {
        listEl.querySelectorAll('.scav-thumb').forEach(function (t) { t.remove(); });
        listEl.querySelectorAll('.scav-item').forEach(function (item) {
            var check = item.querySelector('.scav-check');
            if (!check) return;
            var idx = check.dataset.idx;
            if (photos[idx]) {
                var thumb = document.createElement('img');
                thumb.className = 'scav-thumb';
                thumb.src = photos[idx];
                thumb.alt = 'Proof photo';
                item.appendChild(thumb);
            }
        });
    }

    function renderGallery() {
        allPhotos = Store.get(allPhotosKey, []);
        if (allPhotos.length === 0) {
            galleryEl.innerHTML = '<p class="scav-gallery-empty">No photos uploaded yet - start snapping!</p>';
            return;
        }

        galleryEl.innerHTML = allPhotos.slice().reverse().map(function (entry, i) {
            var idx = allPhotos.length - 1 - i;
            var statusClass = entry.approved ? 'scav-approved' : '';
            var adminBtns = isAdmin ? '<div class="scav-gallery-admin">' +
                (entry.approved
                    ? '<span class="scav-status-approved">Approved +1</span>'
                    : '<button class="scav-approve-btn" data-idx="' + idx + '">Approve</button><button class="scav-reject-btn" data-idx="' + idx + '">Reject</button>') +
                '</div>' : '';
            return '<div class="scav-gallery-item ' + statusClass + '">' +
                '<img src="' + entry.photo + '" alt="Scavenger proof" loading="lazy">' +
                '<div class="scav-gallery-info">' +
                '<span class="scav-gallery-guest">' + escapeHtml(entry.guest) + '</span>' +
                '</div>' +
                adminBtns +
                '</div>';
        }).join('');

        if (isAdmin) {
            galleryEl.querySelectorAll('.scav-approve-btn').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    allPhotos[parseInt(this.dataset.idx)].approved = true;
                    Store.set(allPhotosKey, allPhotos);
                    renderGallery();
                });
            });
            galleryEl.querySelectorAll('.scav-reject-btn').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    allPhotos.splice(parseInt(this.dataset.idx), 1);
                    Store.set(allPhotosKey, allPhotos);
                    renderGallery();
                });
            });
        }
    }

    // Use MutationObserver to inject camera buttons after scav items render
    var observer = new MutationObserver(function () {
        if (listEl.querySelectorAll('.scav-item').length > 0) {
            injectCameraButtons();
        }
    });
    observer.observe(listEl, { childList: true });

    // Also inject immediately in case items are already rendered
    setTimeout(function () { injectCameraButtons(); }, 200);
}

/* ============================================
   Feature 4: MVP of the Day
   Auto-calculated from points log
   ============================================ */
function initMVPOfDay() {
    var card = document.getElementById('mvp-day-card');
    if (!card) return;

    function escapeHtml(t) { var d = document.createElement('div'); d.textContent = t; return d.innerHTML; }

    function getDay() {
        if (typeof getTripDay === 'function') return getTripDay();
        var start = new Date('2026-04-29').getTime();
        var day = Math.floor((Date.now() - start) / 86400000) + 1;
        return Math.max(1, Math.min(6, day));
    }

    function render() {
        var day = getDay();
        var log = Store.get('lb_pointsLog', []);
        var dayEntries = log.filter(function (e) { return e.type === 'individual' && (e.day || 1) === day && e.amount > 0; });

        if (dayEntries.length === 0) {
            card.innerHTML = '<div class="mvp-empty">' +
                '<span class="mvp-empty-icon">&#127942;</span>' +
                '<p>No points awarded yet today - get playing!</p>' +
                '</div>';
            return;
        }

        // Sum by player
        var totals = {};
        dayEntries.forEach(function (e) {
            totals[e.target] = (totals[e.target] || 0) + e.amount;
        });

        // Sort and get top 3
        var sorted = Object.entries(totals).sort(function (a, b) { return b[1] - a[1]; });
        var top3 = sorted.slice(0, 3);

        var medals = [
            { emoji: '&#129351;', cls: 'mvp-gold', label: '1st' },
            { emoji: '&#129352;', cls: 'mvp-silver', label: '2nd' },
            { emoji: '&#129353;', cls: 'mvp-bronze', label: '3rd' }
        ];

        card.innerHTML = '<div class="mvp-podium">' +
            top3.map(function (entry, i) {
                var medal = medals[i];
                return '<div class="mvp-podium-item ' + medal.cls + '">' +
                    '<span class="mvp-medal">' + medal.emoji + '</span>' +
                    '<span class="mvp-podium-name">' + escapeHtml(entry[0]) + '</span>' +
                    '<span class="mvp-podium-pts">' + entry[1] + ' pts</span>' +
                    '</div>';
            }).join('') +
            '</div>';
    }

    render();

    // Auto-refresh every 30 seconds
    setInterval(render, 30000);
}

/* ============================================
   Feature 5: Head-to-Head Challenge Bracket
   Visual bracket from h2hResults
   ============================================ */
function initH2HBracket() {
    var container = document.getElementById('bracket-container');
    if (!container) return;

    function escapeHtml(t) { var d = document.createElement('div'); d.textContent = t; return d.innerHTML; }

    var isAdmin = Auth.isAdmin();

    function render() {
        var bracketData = Store.get('h2hBracket', null);

        if (!bracketData) {
            // Generate empty bracket from results or allow admin to set up
            var results = Store.get('h2hResults', []);

            if (isAdmin) {
                container.innerHTML = '<div class="bracket-setup">' +
                    '<p>Set up the tournament bracket. Select up to 16 players.</p>' +
                    '<div class="bracket-player-select" id="bracket-player-select"></div>' +
                    '<button class="btn btn-primary" id="bracket-generate">Generate Bracket</button>' +
                    '</div>';

                var selectArea = document.getElementById('bracket-player-select');
                var playerNames = Object.keys(PLAYERS).sort();
                selectArea.innerHTML = playerNames.map(function (name) {
                    return '<label class="bracket-player-label">' +
                        '<input type="checkbox" value="' + escapeHtml(name) + '" class="bracket-player-cb">' +
                        ' ' + escapeHtml(name) +
                        '</label>';
                }).join('');

                document.getElementById('bracket-generate').addEventListener('click', function () {
                    var selected = [];
                    document.querySelectorAll('.bracket-player-cb:checked').forEach(function (cb) {
                        selected.push(cb.value);
                    });
                    if (selected.length < 2) { alert('Select at least 2 players!'); return; }
                    // Pad to nearest power of 2
                    var size = 2;
                    while (size < selected.length) size *= 2;
                    while (selected.length < size) selected.push(null); // null = BYE

                    // Shuffle
                    selected.sort(function () { return Math.random() - 0.5; });

                    // Build rounds
                    var rounds = [];
                    var matchups = [];
                    for (var i = 0; i < selected.length; i += 2) {
                        var match = { p1: selected[i], p2: selected[i + 1], s1: null, s2: null, winner: null };
                        // Auto-advance BYEs
                        if (!match.p2) {
                            match.winner = match.p1;
                            match.s1 = 'BYE';
                            match.s2 = '';
                        }
                        if (!match.p1) {
                            match.winner = match.p2;
                            match.s1 = '';
                            match.s2 = 'BYE';
                        }
                        matchups.push(match);
                    }
                    rounds.push(matchups);

                    // Create empty subsequent rounds
                    var prevCount = matchups.length;
                    while (prevCount > 1) {
                        var nextRound = [];
                        for (var j = 0; j < prevCount / 2; j++) {
                            nextRound.push({ p1: null, p2: null, s1: null, s2: null, winner: null });
                        }
                        rounds.push(nextRound);
                        prevCount = nextRound.length;
                    }

                    bracketData = { rounds: rounds };
                    Store.set('h2hBracket', bracketData);
                    render();
                });
                return;
            } else {
                container.innerHTML = '<div class="bracket-empty">' +
                    '<p>Tournament bracket not set up yet. Check back soon!</p>' +
                    '</div>';
                return;
            }
        }

        // Render bracket
        var rounds = bracketData.rounds;
        var roundLabels = [];
        var numRounds = rounds.length;
        if (numRounds === 1) roundLabels = ['Final'];
        else if (numRounds === 2) roundLabels = ['Semi-Finals', 'Final'];
        else if (numRounds === 3) roundLabels = ['Quarter-Finals', 'Semi-Finals', 'Final'];
        else if (numRounds === 4) roundLabels = ['Round 1', 'Quarter-Finals', 'Semi-Finals', 'Final'];
        else {
            for (var r = 0; r < numRounds; r++) {
                if (r === numRounds - 1) roundLabels.push('Final');
                else if (r === numRounds - 2) roundLabels.push('Semi-Finals');
                else if (r === numRounds - 3) roundLabels.push('Quarter-Finals');
                else roundLabels.push('Round ' + (r + 1));
            }
        }

        var html = '<div class="bracket-grid">';

        rounds.forEach(function (round, rIdx) {
            html += '<div class="bracket-round">';
            html += '<div class="bracket-round-label">' + roundLabels[rIdx] + '</div>';
            round.forEach(function (match, mIdx) {
                var p1Name = match.p1 || 'TBD';
                var p2Name = match.p2 || 'TBD';
                var p1Class = match.winner === match.p1 && match.p1 ? 'bracket-winner' : '';
                var p2Class = match.winner === match.p2 && match.p2 ? 'bracket-winner' : '';
                var p1Score = match.s1 !== null && match.s1 !== '' ? match.s1 : '-';
                var p2Score = match.s2 !== null && match.s2 !== '' ? match.s2 : '-';

                html += '<div class="bracket-match">';
                html += '<div class="bracket-player ' + p1Class + '">' +
                    '<span class="bracket-name">' + escapeHtml(p1Name) + '</span>' +
                    '<span class="bracket-score">' + p1Score + '</span>' +
                    '</div>';
                html += '<div class="bracket-player ' + p2Class + '">' +
                    '<span class="bracket-name">' + escapeHtml(p2Name) + '</span>' +
                    '<span class="bracket-score">' + p2Score + '</span>' +
                    '</div>';
                html += '</div>';
            });
            html += '</div>';
        });

        html += '</div>';

        if (isAdmin) {
            html += '<div class="bracket-admin">' +
                '<h4>Set Match Result</h4>' +
                '<div class="bracket-admin-form">' +
                '<select id="bracket-round-sel"><option value="">Round</option></select>' +
                '<select id="bracket-match-sel"><option value="">Match</option></select>' +
                '<input type="number" id="bracket-s1" placeholder="P1 Score" min="0">' +
                '<input type="number" id="bracket-s2" placeholder="P2 Score" min="0">' +
                '<button class="btn btn-primary" id="bracket-submit">Set Result</button>' +
                '</div>' +
                '<button class="btn btn-outline" id="bracket-reset" style="margin-top:0.5rem;font-size:0.8rem;">Reset Bracket</button>' +
                '</div>';
        }

        container.innerHTML = html;

        // Admin logic
        if (isAdmin) {
            var roundSel = document.getElementById('bracket-round-sel');
            var matchSel = document.getElementById('bracket-match-sel');

            rounds.forEach(function (round, rIdx) {
                var opt = document.createElement('option');
                opt.value = rIdx;
                opt.textContent = roundLabels[rIdx];
                roundSel.appendChild(opt);
            });

            roundSel.addEventListener('change', function () {
                matchSel.innerHTML = '<option value="">Match</option>';
                var rIdx = parseInt(this.value);
                if (isNaN(rIdx)) return;
                rounds[rIdx].forEach(function (m, mIdx) {
                    var opt = document.createElement('option');
                    opt.value = mIdx;
                    opt.textContent = (m.p1 || 'TBD') + ' vs ' + (m.p2 || 'TBD');
                    matchSel.appendChild(opt);
                });
            });

            document.getElementById('bracket-submit').addEventListener('click', function () {
                var rIdx = parseInt(roundSel.value);
                var mIdx = parseInt(matchSel.value);
                var s1 = parseInt(document.getElementById('bracket-s1').value);
                var s2 = parseInt(document.getElementById('bracket-s2').value);
                if (isNaN(rIdx) || isNaN(mIdx) || isNaN(s1) || isNaN(s2)) return;

                var match = bracketData.rounds[rIdx][mIdx];
                match.s1 = s1;
                match.s2 = s2;
                match.winner = s1 > s2 ? match.p1 : (s2 > s1 ? match.p2 : null);

                // Advance winner to next round
                if (match.winner && rIdx + 1 < bracketData.rounds.length) {
                    var nextMatchIdx = Math.floor(mIdx / 2);
                    var nextSlot = mIdx % 2 === 0 ? 'p1' : 'p2';
                    bracketData.rounds[rIdx + 1][nextMatchIdx][nextSlot] = match.winner;
                }

                Store.set('h2hBracket', bracketData);
                render();
            });

            document.getElementById('bracket-reset').addEventListener('click', function () {
                if (!confirm('Reset the entire bracket?')) return;
                Store.set('h2hBracket', null);
                render();
            });
        }
    }

    render();
}

/* ============================================
   Feature 6: Daily Recap Generator
   Newspaper-style "Daily Gazette" card
   ============================================ */
function initDailyRecapGenerator() {
    var recapContent = document.querySelector('.recap-content');
    if (!recapContent) return;

    function escapeHtml(t) { var d = document.createElement('div'); d.textContent = t; return d.innerHTML; }

    function getDay() {
        if (typeof getTripDay === 'function') return getTripDay();
        var start = new Date('2026-04-29').getTime();
        var day = Math.floor((Date.now() - start) / 86400000) + 1;
        return Math.max(1, Math.min(6, day));
    }

    // Check if gazette already injected
    if (document.getElementById('recap-gazette')) return;

    var gazette = document.createElement('div');
    gazette.id = 'recap-gazette';
    gazette.className = 'recap-gazette';
    recapContent.insertBefore(gazette, recapContent.firstChild);

    function generateGazette(day) {
        var log = Store.get('lb_pointsLog', []);
        var dayEntries = log.filter(function (e) { return (e.day || 1) === day; });

        if (dayEntries.length === 0) {
            gazette.innerHTML = '<div class="gazette-empty">No data for Day ' + day + ' yet.</div>';
            return;
        }

        var DAY_NAMES = ['', 'Travel Day', 'Chateau Day', 'Adventure Day', 'Birthday!', 'Last Full Day', 'Departure'];

        // Top scorer
        var indEntries = dayEntries.filter(function (e) { return e.type === 'individual' && e.amount > 0; });
        var totals = {};
        indEntries.forEach(function (e) { totals[e.target] = (totals[e.target] || 0) + e.amount; });
        var topScorerEntry = Object.entries(totals).sort(function (a, b) { return b[1] - a[1]; })[0];
        var topScorer = topScorerEntry ? topScorerEntry[0] : 'N/A';
        var topScorerPts = topScorerEntry ? topScorerEntry[1] : 0;

        // Most active team
        var teamDay = {};
        dayEntries.forEach(function (e) {
            var team = null;
            if (e.type === 'team') team = e.target;
            else if (e.type === 'individual' && PLAYERS[e.target]) team = PLAYERS[e.target];
            if (team) teamDay[team] = (teamDay[team] || 0) + e.amount;
        });
        var topTeamEntry = Object.entries(teamDay).sort(function (a, b) { return b[1] - a[1]; })[0];
        var topTeam = topTeamEntry ? topTeamEntry[0] : 'N/A';

        // Quote of the day
        var quotes = Store.get('quoteWall', []);
        var dayQuotes = quotes.filter(function (q) { return q && q.day === day; });
        var bestQuote = dayQuotes.length > 0 ? dayQuotes[dayQuotes.length - 1].text : null;

        // Photos uploaded
        var allPhotos = Store.get('scavengerPhotos_all', []);
        var dayDate = new Date('2026-04-' + (28 + day));
        var dayStart = dayDate.getTime();
        var dayEnd = dayStart + 86400000;
        var photoCount = allPhotos.filter(function (p) { return p.timestamp >= dayStart && p.timestamp < dayEnd; }).length;

        // Messages count
        var messages = Store.get('birthdayMessages', []);
        var msgCount = messages.filter(function (m) {
            return m.timestamp >= dayStart && m.timestamp < dayEnd;
        }).length;

        // Games completed
        var statuses = Store.get('challengeStatuses', {});
        var gamesComplete = Object.keys(statuses).length;

        var TEAM_NAMES = { vouvray: 'Team Vouvray', chinon: 'Team Chinon', sancerre: 'Team Sancerre', muscadet: 'Team Muscadet', anjou: 'Team Anjou' };

        var html = '<div class="gazette-header">' +
            '<div class="gazette-masthead">The Daily Gazette</div>' +
            '<div class="gazette-edition">Day ' + day + ' - ' + (DAY_NAMES[day] || '') + ' Edition</div>' +
            '</div>' +
            '<div class="gazette-body">' +
            '<div class="gazette-headline">' +
            '<span class="gazette-stat-icon">&#127942;</span>' +
            '<div><strong>Top Scorer:</strong> ' + escapeHtml(topScorer) + ' (' + topScorerPts + ' pts)</div>' +
            '</div>' +
            '<div class="gazette-stat">' +
            '<span class="gazette-stat-icon">&#127941;</span>' +
            '<div><strong>Most Active Team:</strong> ' + escapeHtml(TEAM_NAMES[topTeam] || topTeam) + '</div>' +
            '</div>' +
            (bestQuote ? '<div class="gazette-stat"><span class="gazette-stat-icon">&#128172;</span><div><strong>Quote of the Day:</strong> "' + escapeHtml(bestQuote) + '"</div></div>' : '') +
            '<div class="gazette-stats-row">' +
            '<div class="gazette-mini-stat"><span>&#128247;</span><strong>' + photoCount + '</strong> photos</div>' +
            '<div class="gazette-mini-stat"><span>&#128172;</span><strong>' + msgCount + '</strong> messages</div>' +
            '<div class="gazette-mini-stat"><span>&#127918;</span><strong>' + gamesComplete + '</strong> games done</div>' +
            '</div>' +
            '</div>' +
            '<button class="btn btn-outline gazette-share" id="gazette-share">Share Recap</button>';

        gazette.innerHTML = html;

        // Share button
        document.getElementById('gazette-share').addEventListener('click', function () {
            var text = 'DAY ' + day + ' RECAP - Joe\'s 30th Birthday Trip\n' +
                'Top Scorer: ' + topScorer + ' (' + topScorerPts + ' pts)\n' +
                'Most Active Team: ' + (TEAM_NAMES[topTeam] || topTeam) + '\n' +
                'Photos: ' + photoCount + ' | Messages: ' + msgCount + ' | Games Done: ' + gamesComplete;
            if (bestQuote) text += '\nQuote of the Day: "' + bestQuote + '"';

            if (navigator.clipboard) {
                navigator.clipboard.writeText(text).then(function () {
                    alert('Recap copied to clipboard!');
                });
            } else {
                prompt('Copy this recap:', text);
            }
        });
    }

    // Listen for day button clicks to update gazette
    var dayBtns = document.querySelectorAll('.recap-day-btn');
    dayBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var day = parseInt(this.dataset.day);
            generateGazette(day);
        });
    });

    // Initial render for current day
    var activeBtn = document.querySelector('.recap-day-btn.active');
    var initDay = activeBtn ? parseInt(activeBtn.dataset.day) : getDay();
    generateGazette(initDay);
}
