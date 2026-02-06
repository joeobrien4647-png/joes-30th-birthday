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
    initSpinWheel();
    initChallenges();
    initLeaderboard();
    initSoundboard();
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
    const TEAMS = ['champagne', 'bordeaux', 'rose'];
    const TEAM_NAMES = { champagne: 'Team Champagne', bordeaux: 'Team Bordeaux', rose: 'Team Ros\u00e9' };
    const TEAM_HIDDEN = { champagne: 'Team 1', bordeaux: 'Team 2', rose: 'Team 3' };
    const TEAM_EMOJI = { champagne: '\uD83C\uDF7E', bordeaux: '\uD83C\uDF77', rose: '\uD83C\uDF39' };
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
        { id: 'all_rounder', name: 'All-Rounder', icon: '\uD83C\uDFAF', desc: 'Points in 3+ categories' }
    ];

    /* ---- Quick Award -> Category Mapping ---- */
    const QUICK_CATEGORY = {
        'Game Winner': 'games', 'Runner Up': 'games', 'Participation': 'bonus',
        'Bonus Point': 'bonus', 'Challenge Champion': 'challenges', 'Penalty': 'penalty'
    };

    /* ---- Load Data ---- */
    let teamScores = Store.get('lb_teamScores', { champagne: 0, bordeaux: 0, rose: 0 });
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
        });
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
            if (scoreEl) scoreEl.textContent = teamScores[team] || 0;

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

        board.innerHTML = '';
        sorted.forEach((player, i) => {
            const row = document.createElement('div');
            row.className = 'ind-row' + (i < 3 && player.points > 0 ? ' top-3' : '');

            let rankDisplay = i + 1;
            if (i === 0 && player.points > 0) rankDisplay = '\uD83E\uDD47';
            else if (i === 1 && player.points > 0) rankDisplay = '\uD83E\uDD48';
            else if (i === 2 && player.points > 0) rankDisplay = '\uD83E\uDD49';

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
                <span class="ind-rank">${rankDisplay}</span>
                <span class="ind-team-dot ${isRevealed() ? (player.team || '') : ''}"></span>
                <span class="ind-name">${escapeHtml(player.name)}${badgeIcons ? '<span class="ind-badges">' + badgeIcons + '</span>' : ''}</span>
                <span class="ind-cats">${catDots}</span>
                <span class="ind-points">${player.points} pts</span>
            `;
            board.appendChild(row);
        });
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
                const teamDay = { champagne: 0, bordeaux: 0, rose: 0 };
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
            teamScores = Store.get('lb_teamScores', { champagne: 0, bordeaux: 0, rose: 0 });
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
