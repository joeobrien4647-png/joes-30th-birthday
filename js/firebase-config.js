/* ============================================
   Firebase Integration
   - Team registrations (real-time reveal)
   - Leaderboard sync (live scores for all guests)
   - Full sync for all shared features
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
       FirebaseSync — generic helper for all
       shared features (messages, confessions, etc.)
       ============================================ */
    window.FirebaseSync = {
        push: function(path, data) {
            if (!db) return null;
            var ref = db.ref(path).push(data);
            return ref.key;
        },
        set: function(path, data) {
            if (!db) return;
            db.ref(path).set(data);
        },
        update: function(path, data) {
            if (!db) return;
            db.ref(path).update(data);
        },
        remove: function(path, key) {
            if (!db) return;
            db.ref(path + '/' + key).remove();
        },
        onUpdate: function(path, callback) {
            if (!db) return;
            db.ref(path).on('value', function(snap) {
                callback(snap.val());
            });
        },
        isConfigured: function() {
            return !!db;
        }
    };

    /* ============================================
       Shared Collection Listeners
       Listen on each collection, cache locally,
       and dispatch custom events for UI updates.
       ============================================ */
    var COLLECTIONS = [
        'messages',
        'confessions',
        'music',
        'photos',
        'predictions',
        'superlatives',
        'highlights',
        'toasts',
        'signups',
        'announcements',
        'bingo',
        'feed',
        'admin'
    ];

    var collectionCache = {};

    function setupCollectionListener(name) {
        var eventName = name + 'Update';
        collectionCache[name] = null;

        if (!db) return;

        db.ref(name).on('value', function(snap) {
            var data = snap.val();
            collectionCache[name] = data;

            // Cache in localStorage as fallback
            try {
                localStorage.setItem('fb_' + name, JSON.stringify(data));
            } catch(e) { /* quota exceeded — non-critical */ }

            // Dispatch event so UI can react
            document.dispatchEvent(new CustomEvent(eventName, { detail: data }));
        });
    }

    COLLECTIONS.forEach(function(name) {
        setupCollectionListener(name);
    });

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
    /* ============================================
       PhotoStorage — upload photos to Firebase Storage
       and sync metadata via Realtime Database
       ============================================ */
    var storage = (configured && typeof firebase !== 'undefined' && firebase.storage) ? firebase.storage() : null;
    var photosCache = {};
    var photoListeners = [];
    var photosLoaded = false;

    if (db) {
        db.ref('photos').on('value', function(snap) {
            photosCache = snap.val() || {};
            photosLoaded = true;
            for (var i = 0; i < photoListeners.length; i++) {
                photoListeners[i](photosCache);
            }
        });
    }

    function compressImage(file, maxWidth, quality, callback) {
        var reader = new FileReader();
        reader.onload = function(e) {
            var img = new Image();
            img.onload = function() {
                var canvas = document.createElement('canvas');
                var scale = Math.min(1, maxWidth / img.width);
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                canvas.toBlob(function(blob) {
                    callback(blob);
                }, 'image/jpeg', quality);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    window.PhotoStorage = {
        upload: function(file, guestCode, guestName, caption, onProgress, onComplete) {
            if (!storage || !db) {
                if (onComplete) onComplete(null, 'Firebase Storage not configured');
                return;
            }

            compressImage(file, 1600, 0.8, function(blob) {
                var filename = 'photos/' + Date.now() + '_' + guestCode.replace(/[^a-zA-Z0-9-_]/g, '') + '.jpg';
                var ref = storage.ref(filename);
                var uploadTask = ref.put(blob, { contentType: 'image/jpeg' });

                uploadTask.on('state_changed',
                    function(snapshot) {
                        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        if (onProgress) onProgress(progress);
                    },
                    function(error) {
                        if (onComplete) onComplete(null, error.message || 'Upload failed');
                    },
                    function() {
                        uploadTask.snapshot.ref.getDownloadURL().then(function(url) {
                            var photoData = {
                                url: url,
                                caption: caption || '',
                                guestCode: guestCode,
                                guestName: guestName,
                                timestamp: Date.now()
                            };

                            /* Save to /photos collection */
                            var photoKey = db.ref('photos').push(photoData).key;

                            /* Post to /feed */
                            FirebaseSync.push('feed', {
                                type: 'photo',
                                guestCode: guestCode,
                                guestName: guestName,
                                content: caption || '',
                                photoUrl: url,
                                timestamp: Date.now()
                            });

                            photoData._id = photoKey;
                            if (onComplete) onComplete(photoData, null);
                        });
                    }
                );
            });
        },

        getAll: function() {
            return photosCache;
        },

        onUpdate: function(fn) {
            photoListeners.push(fn);
            if (photosLoaded) fn(photosCache);
        }
    };

    /* ============================================
       BingoEngine — 4x4 shared bingo with claims,
       line detection, rewards, and live feed
       ============================================ */
    var BINGO_ITEMS = [
        'Photobomb someone\'s photo without them noticing',
        'Wear someone else\'s outfit for an entire meal',
        'Do a blind taste test and get it right',
        'Give a completely improvised 60-second motivational speech',
        'Convince a local you\'re French (1 min+)',
        'Swap shoes with someone for a whole activity',
        'Get a conga line going with at least 5 people',
        'Start a chant that the whole group joins',
        'Get a genuine standing ovation from the group',
        'Make someone laugh so hard they cry',
        'Jump in the pool fully clothed (or push someone in)',
        'Be the first up AND last to bed on the same day',
        'Eat the spiciest thing you can find — straight face',
        'Down a drink with no hands',
        'Do the washing up without being asked',
        'Take a photo so good the group votes it photo of the trip'
    ];

    var BINGO_LINES = [
        [0, 1, 2, 3],
        [4, 5, 6, 7],
        [8, 9, 10, 11],
        [12, 13, 14, 15],
        [0, 4, 8, 12],
        [1, 5, 9, 13],
        [2, 6, 10, 14],
        [3, 7, 11, 15],
        [0, 5, 10, 15],
        [3, 6, 9, 12]
    ];

    var bingoClaims = {};
    var bingoLines = {};
    var bingoListeners = [];
    var bingoLoaded = false;

    if (db) {
        db.ref('bingo/claims').on('value', function(snap) {
            bingoClaims = snap.val() || {};
            bingoLoaded = true;
            bingoListeners.forEach(function(fn) { fn(); });
        });
        db.ref('bingo/lines').on('value', function(snap) {
            bingoLines = snap.val() || {};
        });
    }

    var bingoPunishments = {};
    var punishmentListeners = [];
    var punishmentsLoaded = false;

    if (db) {
        db.ref('bingo/punishments').on('value', function(snap) {
            bingoPunishments = snap.val() || {};
            punishmentsLoaded = true;
            for (var i = 0; i < punishmentListeners.length; i++) {
                punishmentListeners[i](bingoPunishments);
            }
        });
    }

    function bingoPostFeed(text, guestName, team) {
        if (!db) return;
        FirebaseSync.push('feed', {
            type: 'bingo',
            text: text,
            author: guestName,
            team: team || '',
            timestamp: Date.now()
        });
    }

    function bingoAwardPoints(guestName, team, amount, reason) {
        // Use Store.set pattern to integrate with existing leaderboard sync
        var teamScores = Store.get('lb_teamScores', { titans: 0, spartans: 0, vikings: 0, gladiators: 0 });
        var individualScores = Store.get('lb_individualScores', {});
        var pointsLog = Store.get('lb_pointsLog', []);

        individualScores[guestName] = (individualScores[guestName] || 0) + amount;
        if (team) {
            teamScores[team] = (teamScores[team] || 0) + amount;
        }

        pointsLog.unshift({
            type: 'individual',
            target: guestName,
            amount: amount,
            reason: reason,
            time: new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
            timestamp: Date.now(),
            category: 'challenges',
            day: (function() {
                var start = new Date('2026-04-29').getTime();
                var d = Math.floor((Date.now() - start) / 86400000) + 1;
                return Math.max(1, Math.min(6, d));
            })(),
            awardedBy: 'Bingo'
        });

        Store.set('lb_teamScores', teamScores);
        Store.set('lb_individualScores', individualScores);
        Store.set('lb_pointsLog', pointsLog);

        document.dispatchEvent(new CustomEvent('leaderboardUpdate'));
    }

    window.BingoEngine = {
        getItems: function() {
            return BINGO_ITEMS;
        },

        claim: function(itemIndex, guestCode, guestName, team) {
            if (!db) return;
            if (bingoClaims[itemIndex]) return; // already claimed

            var isFirstClaim = Object.keys(bingoClaims).length === 0;
            var claimData = {
                claimedBy: guestName,
                claimedByCode: guestCode,
                team: team,
                timestamp: Date.now()
            };

            db.ref('bingo/claims/' + itemIndex).set(claimData);
            bingoClaims[itemIndex] = claimData;

            // Award points: +1 team, +2 bonus for first-ever claim
            var pts = isFirstClaim ? 3 : 1;
            var reason = isFirstClaim
                ? 'Bingo: first claim! ' + BINGO_ITEMS[itemIndex]
                : 'Bingo: ' + BINGO_ITEMS[itemIndex];
            bingoAwardPoints(guestName, team, pts, reason);
            bingoPostFeed(guestName + ' claimed: "' + BINGO_ITEMS[itemIndex] + '"', guestName, team);
        },

        getClaims: function() {
            return bingoClaims;
        },

        onUpdate: function(fn) {
            bingoListeners.push(fn);
            if (bingoLoaded) fn();
        },

        checkLines: function(guestCode) {
            var completed = [];
            var existingLineKeys = {};
            var keys = Object.keys(bingoLines);
            for (var k = 0; k < keys.length; k++) {
                var ln = bingoLines[keys[k]];
                if (ln.guestCode === guestCode) {
                    existingLineKeys[ln.lineType + '_' + ln.lineIndex] = true;
                }
            }

            for (var i = 0; i < BINGO_LINES.length; i++) {
                var line = BINGO_LINES[i];
                var allClaimed = true;
                for (var j = 0; j < line.length; j++) {
                    var claim = bingoClaims[line[j]];
                    if (!claim || claim.claimedByCode !== guestCode) {
                        allClaimed = false;
                        break;
                    }
                }
                if (!allClaimed) continue;

                var lineType = i < 4 ? 'row' : (i < 8 ? 'col' : 'diag');
                var lineIndex = i < 4 ? i : (i < 8 ? i - 4 : i - 8);
                var lineKey = lineType + '_' + lineIndex;

                if (!existingLineKeys[lineKey]) {
                    completed.push({
                        lineType: lineType,
                        lineIndex: lineIndex,
                        cells: line
                    });
                }
            }
            return completed;
        },

        completeLine: function(lineData) {
            if (!db) return;

            // Count existing lines for this guest to determine line number
            var lineCount = 0;
            var keys = Object.keys(bingoLines);
            for (var k = 0; k < keys.length; k++) {
                if (bingoLines[keys[k]].guestCode === lineData.guestCode) lineCount++;
            }
            var lineNumber = lineCount + 1;

            var record = {
                guestCode: lineData.guestCode,
                guestName: lineData.guestName,
                lineNumber: lineNumber,
                lineType: lineData.lineType,
                lineIndex: lineData.lineIndex,
                rewardChosen: lineData.rewardChosen || '',
                punishmentTarget: lineData.punishmentTarget || '',
                punishmentDesc: lineData.punishmentDesc || '',
                timestamp: Date.now()
            };

            db.ref('bingo/lines').push(record);

            // Points: +10/+15/+20 for line 1/2/3
            var pts = lineNumber === 1 ? 10 : (lineNumber === 2 ? 15 : 20);
            bingoAwardPoints(lineData.guestName, lineData.team, pts, 'Bingo line ' + lineNumber + '!');

            var feedText = lineData.guestName + ' got bingo line ' + lineNumber + '!';
            if (lineData.punishmentTarget && lineData.punishmentDesc) {
                feedText += ' ' + lineData.punishmentTarget + ' must: ' + lineData.punishmentDesc;
            }
            bingoPostFeed(feedText, lineData.guestName, lineData.team);
        },

        completeFullHouse: function(guestCode, guestName, team) {
            if (!db) return;
            bingoAwardPoints(guestName, team, 50, 'BINGO FULL HOUSE!');
            bingoPostFeed(guestName + ' got a FULL HOUSE! King/Queen of the Château!', guestName, team);
        },

        getGuestStats: function(guestCode) {
            var claims = 0;
            var lines = 0;
            var cKeys = Object.keys(bingoClaims);
            for (var i = 0; i < cKeys.length; i++) {
                if (bingoClaims[cKeys[i]].claimedByCode === guestCode) claims++;
            }
            var lKeys = Object.keys(bingoLines);
            for (var j = 0; j < lKeys.length; j++) {
                if (bingoLines[lKeys[j]].guestCode === guestCode) lines++;
            }
            return { claims: claims, lines: lines, isFullHouse: claims === 16 };
        },

        getLeaderboard: function() {
            var stats = {};
            var cKeys = Object.keys(bingoClaims);
            for (var i = 0; i < cKeys.length; i++) {
                var c = bingoClaims[cKeys[i]];
                if (!stats[c.claimedByCode]) {
                    stats[c.claimedByCode] = { code: c.claimedByCode, name: c.claimedBy, claims: 0, lines: 0 };
                }
                stats[c.claimedByCode].claims++;
            }
            var lKeys = Object.keys(bingoLines);
            for (var j = 0; j < lKeys.length; j++) {
                var l = bingoLines[lKeys[j]];
                if (!stats[l.guestCode]) {
                    stats[l.guestCode] = { code: l.guestCode, name: l.guestName, claims: 0, lines: 0 };
                }
                stats[l.guestCode].lines++;
            }
            var arr = [];
            var sKeys = Object.keys(stats);
            for (var k = 0; k < sKeys.length; k++) {
                arr.push(stats[sKeys[k]]);
            }
            arr.sort(function(a, b) {
                if (b.claims !== a.claims) return b.claims - a.claims;
                return b.lines - a.lines;
            });
            return arr;
        },

        getLines: function() {
            return bingoLines;
        },

        addPunishment: function(data) {
            if (!db) return;
            db.ref('bingo/punishments').push({
                guestCode: data.guestCode,
                guestName: data.guestName,
                team: data.team,
                description: data.description,
                assignedBy: data.assignedBy,
                completed: false,
                completedAt: null,
                timestamp: Date.now()
            });
        },

        completePunishment: function(id) {
            if (!db) return;
            db.ref('bingo/punishments/' + id).update({
                completed: true,
                completedAt: Date.now()
            });
            var p = bingoPunishments[id];
            if (p) {
                FirebaseSync.push('feed', {
                    type: 'bingo',
                    text: p.guestName + ' survived their punishment: ' + p.description,
                    author: p.guestName,
                    team: p.team || '',
                    timestamp: Date.now()
                });
            }
        },

        getPunishments: function() {
            return bingoPunishments;
        },

        onPunishmentsUpdate: function(fn) {
            punishmentListeners.push(fn);
            if (punishmentsLoaded) fn(bingoPunishments);
        }
    };

    /* ============================================
       Push Notification Subscriptions
       ============================================ */
    var VAPID_PUBLIC = 'BF7CnYIwdBjsgGfpV57r8NbpM70eoQ1uW1EZjPpKX1RGuG626F8meosAeYC8oVmOJ1M_BWIzdXM1MGgAmdgD4W0';

    function urlBase64ToUint8Array(base64String) {
        var padding = '='.repeat((4 - base64String.length % 4) % 4);
        var base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        var rawData = atob(base64);
        var outputArray = new Uint8Array(rawData.length);
        for (var i = 0; i < rawData.length; i++) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    window.PushNotifications = {
        subscribe: function(guestCode) {
            if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
            if (!db || !guestCode) return;

            navigator.serviceWorker.ready.then(function(reg) {
                return reg.pushManager.getSubscription().then(function(sub) {
                    if (sub) return sub;
                    return reg.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC)
                    });
                });
            }).then(function(sub) {
                var subJson = sub.toJSON();
                db.ref('subscriptions/' + guestCode).set({
                    endpoint: subJson.endpoint,
                    keys: subJson.keys
                });
            }).catch(function(err) {
                console.warn('Push subscription failed:', err);
            });
        },

        isSubscribed: function(callback) {
            if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
                callback(false);
                return;
            }
            navigator.serviceWorker.ready.then(function(reg) {
                return reg.pushManager.getSubscription();
            }).then(function(sub) {
                callback(!!sub);
            }).catch(function() {
                callback(false);
            });
        }
    };
})();
