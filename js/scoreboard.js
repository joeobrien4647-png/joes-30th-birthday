/* Stadium Mode — runs the TV scoreboard at the château */
(function() {
    var PANELS = ['teams', 'players', 'recap', 'feed'];
    var CYCLE_MS = 12000;
    var TEAMS = ['titans', 'spartans', 'vikings', 'gladiators'];
    var TEAM_NAMES = { titans: 'Titans', spartans: 'Spartans', vikings: 'Vikings', gladiators: 'Gladiators' };
    var TEAM_EMOJI = { titans: '\u26A1', spartans: '\uD83D\uDEE1\uFE0F', vikings: '\u2694\uFE0F', gladiators: '\uD83D\uDDE1\uFE0F' };
    var CATEGORY_EMOJI = { games: '\uD83C\uDFAE', duties: '\uD83D\uDC68\u200D\uD83C\uDF73', challenges: '\uD83C\uDFC6', bonus: '\u2B50', penalty: '\uD83D\uDFE5' };

    var currentPanel = 0;
    var cycleTimer = null;
    var muted = false;
    var audioCtx = null;

    function $(sel) { return document.querySelector(sel); }
    function $all(sel) { return Array.from(document.querySelectorAll(sel)); }
    function show(el) { el.removeAttribute('hidden'); setTimeout(function(){ el.classList.add('active'); }, 20); }
    function hide(el) { el.classList.remove('active'); setTimeout(function(){ el.setAttribute('hidden',''); }, 600); }

    function getData() {
        return {
            teamScores: Store.get('lb_teamScores', { titans:0, spartans:0, vikings:0, gladiators:0 }),
            individualScores: Store.get('lb_individualScores', {}),
            pointsLog: Store.get('lb_pointsLog', [])
        };
    }

    function getTripDay() {
        var start = new Date('2026-04-29').getTime();
        var d = Math.floor((Date.now() - start) / 86400000) + 1;
        return Math.max(1, Math.min(6, d));
    }
    var DAY_NAMES = ['Wednesday','Thursday','Friday','Saturday','Sunday','Monday'];

    function fullName(name) { return (typeof FULL_NAMES !== 'undefined' && FULL_NAMES[name]) || name; }
    function escapeHtml(s) { return String(s||'').replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }

    /* ---- Renders ---- */
    function renderTeams() {
        var d = getData();
        var sorted = TEAMS.slice().sort(function(a,b){ return (d.teamScores[b]||0) - (d.teamScores[a]||0); });
        var maxScore = d.teamScores[sorted[0]] || 0;
        $('#sb-teams').innerHTML = sorted.map(function(team, i){
            return '<div class="sb-team-card ' + ((d.teamScores[team]||0) === maxScore && maxScore > 0 ? 'leader' : '') + '" data-team="' + team + '">' +
                '<div class="sb-team-rank">#' + (i+1) + '</div>' +
                '<div>' +
                '<div class="sb-team-emoji">' + TEAM_EMOJI[team] + '</div>' +
                '<div class="sb-team-name">' + TEAM_NAMES[team] + '</div>' +
                '</div>' +
                '<div class="sb-team-score">' + (d.teamScores[team] || 0) + '</div>' +
                '</div>';
        }).join('');
    }

    function renderPlayers() {
        var d = getData();
        var sorted = Object.keys(d.individualScores)
            .map(function(n){ return { name: n, pts: d.individualScores[n] || 0 }; })
            .sort(function(a,b){ return b.pts - a.pts; })
            .slice(0, 5);
        var medals = ['\uD83E\uDD47','\uD83E\uDD48','\uD83E\uDD49','4\uFE0F\u20E3','5\uFE0F\u20E3'];
        $('#sb-players').innerHTML = sorted.length
            ? sorted.map(function(p, i){
                return '<div class="sb-player-row ' + (i===0 && p.pts > 0 ? 'first' : '') + '">' +
                    '<div class="sb-player-rank">' + (medals[i] || (i+1)) + '</div>' +
                    '<div class="sb-player-name">' + escapeHtml(fullName(p.name)) + '</div>' +
                    '<div class="sb-player-pts">' + p.pts + '</div>' +
                    '</div>';
            }).join('')
            : '<p class="sb-empty">Awaiting first awards...</p>';
    }

    function renderRecap() {
        var d = getData();
        var day = getTripDay();
        var todayLog = d.pointsLog.filter(function(e){ return (e.day || 1) === day; });
        var totals = {};
        todayLog.forEach(function(e){ if (e.type === 'individual') { totals[e.target] = (totals[e.target]||0) + e.amount; } });
        var mvpEntries = Object.keys(totals).map(function(k){ return [k, totals[k]]; }).sort(function(a,b){ return b[1]-a[1]; });
        var mvp = mvpEntries[0];
        var biggest = todayLog.filter(function(e){ return e.amount > 0; }).sort(function(a,b){ return b.amount-a.amount; })[0];
        var totalPts = todayLog.reduce(function(s,e){ return s + e.amount; }, 0);
        $('#sb-recap').innerHTML =
            '<div class="sb-recap-card"><h3>Today\'s MVP</h3><div class="v">' + (mvp ? '\uD83D\uDC51 ' + escapeHtml(fullName(mvp[0])) + ' (+' + mvp[1] + ')' : '\u2014') + '</div></div>' +
            '<div class="sb-recap-card"><h3>Biggest Award</h3><div class="v">' + (biggest ? '+' + biggest.amount + ' \u00B7 ' + escapeHtml(fullName(biggest.target)) : '\u2014') + '</div></div>' +
            '<div class="sb-recap-card"><h3>Total Points Today</h3><div class="v">' + totalPts + '</div></div>' +
            '<div class="sb-recap-card"><h3>Awards Today</h3><div class="v">' + todayLog.length + '</div></div>';
    }

    function renderFeed() {
        var d = getData();
        var feed = d.pointsLog.slice(0, 10);
        $('#sb-feed').innerHTML = feed.length
            ? feed.map(function(e){
                var emoji = CATEGORY_EMOJI[e.category || 'bonus'] || '\u2B50';
                var sign = e.amount > 0 ? '+' : '';
                var target = e.type === 'team' ? (TEAM_NAMES[e.target] || e.target) : fullName(e.target);
                return '<div class="sb-feed-row">' +
                    '<span class="sb-feed-emoji">' + emoji + '</span>' +
                    '<span class="sb-feed-pts ' + (e.amount>0?'positive':'negative') + '">' + sign + e.amount + '</span>' +
                    '<span><strong>' + escapeHtml(target) + '</strong> \u2014 ' + escapeHtml(e.reason || '') + '</span>' +
                    '<span class="sb-feed-time">' + escapeHtml(e.time || '') + '</span>' +
                    '</div>';
            }).join('')
            : '<p class="sb-empty">No awards yet</p>';
    }

    function renderTicker() {
        var d = getData();
        var items = d.pointsLog.slice(0, 8).map(function(e){
            var emoji = CATEGORY_EMOJI[e.category || 'bonus'] || '\u2B50';
            var sign = e.amount > 0 ? '+' : '';
            var target = e.type === 'team' ? (TEAM_NAMES[e.target] || e.target) : fullName(e.target);
            return '<span class="sb-ticker-item">' + emoji + ' <strong>' + escapeHtml(target) + '</strong> <span class="sb-ticker-pts">' + sign + e.amount + '</span> ' + escapeHtml(e.reason || '') + '</span>';
        }).join('');
        $('#sb-ticker-track').innerHTML = items || '<span class="sb-ticker-item">Waiting for first award...</span>';
    }

    function renderHeader() {
        var day = getTripDay();
        $('#sb-day').textContent = 'Day ' + day + ' \u00B7 ' + (DAY_NAMES[day-1] || '');
    }

    function renderAll() {
        renderHeader();
        renderTeams();
        renderPlayers();
        renderRecap();
        renderFeed();
        renderTicker();
    }

    /* ---- Cycling ---- */
    function showPanel(idx) {
        var panels = $all('.sb-panel');
        panels.forEach(function(p, i){ if (i !== idx) hide(p); });
        var target = panels[idx];
        if (target) show(target);
        currentPanel = idx;
    }
    function nextPanel() { showPanel((currentPanel + 1) % PANELS.length); }
    function startCycle() {
        showPanel(0);
        clearInterval(cycleTimer);
        cycleTimer = setInterval(nextPanel, CYCLE_MS);
    }

    /* ---- Audio (placeholder for Task 7) ---- */
    function playTone(freqs, type, duration) {
        if (muted || !audioCtx) return;
        freqs.forEach(function(f, i){
            var osc = audioCtx.createOscillator();
            var gain = audioCtx.createGain();
            osc.type = type || 'sine';
            osc.frequency.value = f;
            gain.gain.setValueAtTime(0.18, audioCtx.currentTime + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.1 + duration);
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc.start(audioCtx.currentTime + i * 0.1);
            osc.stop(audioCtx.currentTime + i * 0.1 + duration);
        });
    }

    /* ---- Init ---- */
    function start() {
        $('#sb-start').classList.add('hidden');
        try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
        renderAll();
        startCycle();
    }
    document.addEventListener('leaderboardUpdate', renderAll);
    document.addEventListener('DOMContentLoaded', function(){
        renderAll(); // pre-start render so the start screen has data behind it
        $('#sb-start-btn').addEventListener('click', start);
        $('#sb-mute').addEventListener('click', function(){
            muted = !muted;
            $('#sb-mute').textContent = muted ? '\uD83D\uDD07' : '\uD83D\uDD0A';
        });
    });
})();
