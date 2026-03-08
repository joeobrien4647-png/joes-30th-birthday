/* ============================================
   Firebase Integration
   - Team registrations (real-time reveal)
   - Leaderboard sync (live scores for all guests)
   ============================================ */
(function() {
    var firebaseConfig = {
        apiKey: "AIzaSyAWBGZVcKvJQJs26kByApvcvo0jcOMdGmQ",
        authDomain: "joes-30th.firebaseapp.com",
        databaseURL: "https://joes-30th-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "joes-30th",
        storageBucket: "joes-30th.firebasestorage.app",
        messagingSenderId: "133286120720",
        appId: "1:133286120720:web:7c08ab85a6c14d77e66995"
    };

    // Don't init if config is empty (dev/testing fallback)
    var configured = firebaseConfig.apiKey && firebaseConfig.databaseURL;

    if (configured && typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
    }

    var db = (configured && typeof firebase !== 'undefined') ? firebase.database() : null;

    /* ============================================
       Team Registrations
       ============================================ */
    var registrations = {};
    var regListeners = [];
    var regLoaded = false;

    if (db) {
        db.ref('registrations').on('value', function(snap) {
            registrations = snap.val() || {};
            regLoaded = true;
            regListeners.forEach(function(fn) { fn(registrations); });
        });
    }

    window.TeamRegistrations = {
        register: function(code, name, team) {
            localStorage.setItem('teamRevealed_' + code, 'true');
            if (!db) return;
            db.ref('registrations/' + code).set({
                name: name,
                team: team,
                code: code,
                timestamp: Date.now()
            });
        },
        onUpdate: function(fn) {
            regListeners.push(fn);
            if (regLoaded) fn(registrations);
        },
        getAll: function() { return registrations; },
        isRegistered: function(name) {
            return Object.values(registrations).some(function(r) { return r.name === name; });
        },
        isConfigured: function() { return !!db; }
    };

    /* ============================================
       Leaderboard Sync
       Intercepts Store.get/set for lb_* keys so
       all existing code syncs via Firebase automatically.
       ============================================ */
    var LB_KEYS = ['lb_teamScores', 'lb_individualScores', 'lb_pointsLog', 'lb_badges'];
    var lbCache = {};
    var lbLoaded = false;

    function fbKey(storeKey) {
        return storeKey.replace('lb_', '');
    }

    if (db && typeof Store !== 'undefined') {
        // Listen for leaderboard changes from Firebase
        db.ref('leaderboard').on('value', function(snap) {
            var data = snap.val() || {};
            LB_KEYS.forEach(function(key) {
                var k = fbKey(key);
                if (data[k] !== undefined) {
                    lbCache[key] = data[k];
                    // Keep localStorage in sync as fallback
                    try { localStorage.setItem(key, JSON.stringify(data[k])); } catch(e) {}
                }
            });
            lbLoaded = true;
            // Notify any listeners (e.g. leaderboard UI)
            document.dispatchEvent(new CustomEvent('leaderboardUpdate'));
        });

        // Intercept Store.set — also push lb_* writes to Firebase
        var originalSet = Store.set.bind(Store);
        Store.set = function(key, value) {
            originalSet(key, value);
            if (LB_KEYS.indexOf(key) !== -1) {
                lbCache[key] = value;
                db.ref('leaderboard/' + fbKey(key)).set(value);
            }
        };

        // Intercept Store.get — prefer Firebase cache for lb_* keys
        var originalGet = Store.get.bind(Store);
        Store.get = function(key, fallback) {
            if (LB_KEYS.indexOf(key) !== -1 && lbLoaded && lbCache[key] !== undefined) {
                return lbCache[key];
            }
            return originalGet(key, fallback);
        };
    }
})();
