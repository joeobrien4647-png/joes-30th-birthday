/* ============================================
   Live Feed Page JavaScript
   ES5 only — var, no arrow functions, no template literals
   ============================================ */

/* Type config: icon + colour + label */
var FEED_TYPES = {
    message:      { icon: '💬', color: '#4CAF50',  label: 'Message' },
    confession:   { icon: '🤫', color: '#9C27B0',  label: 'Confession' },
    music:        { icon: '🎵', color: '#2196F3',  label: 'Song' },
    photo:        { icon: '📸', color: '#FF9800',  label: 'Photo' },
    prediction:   { icon: '🔮', color: '#E91E63',  label: 'Prediction' },
    bingo_claim:  { icon: '✅', color: '#00BCD4',  label: 'Bingo Claim' },
    bingo_line:   { icon: '🎯', color: '#FF5722',  label: 'Bingo Line' },
    bingo_house:  { icon: '👑', color: '#FFD700',  label: 'Full House' },
    points:       { icon: '🏆', color: '#FFC107',  label: 'Points' },
    announcement: { icon: '📢', color: '#F44336',  label: 'Announcement' },
    signup:       { icon: '✋', color: '#8BC34A',  label: 'Sign-up' },
    punishment:   { icon: '😈', color: '#FF5722',  label: 'Punishment' },
    reward:       { icon: '🎁', color: '#FFD700',  label: 'Reward' }
};

/* Filter groups */
var FILTER_MAP = {
    all:    null,
    bingo:  ['bingo_claim', 'bingo_line', 'bingo_house', 'punishment', 'reward'],
    scores: ['points'],
    photos: ['photo'],
    social: ['message', 'confession', 'music', 'prediction']
};

var feedData = {};
var activeFilter = 'all';

/* ============================================
   Init
   ============================================ */
document.addEventListener('DOMContentLoaded', function () {
    initLiveFeed();
});

function initLiveFeed() {
    /* Compose buttons */
    var composeBtns = document.querySelectorAll('.feed-compose-btn');
    for (var i = 0; i < composeBtns.length; i++) {
        (function (btn) {
            btn.addEventListener('click', function () {
                openCompose(btn.getAttribute('data-type'));
            });
        })(composeBtns[i]);
    }

    /* Filter buttons */
    var filterBtns = document.querySelectorAll('.feed-filter');
    for (var j = 0; j < filterBtns.length; j++) {
        (function (btn) {
            btn.addEventListener('click', function () {
                for (var k = 0; k < filterBtns.length; k++) {
                    filterBtns[k].classList.remove('active');
                }
                btn.classList.add('active');
                activeFilter = btn.getAttribute('data-filter');
                renderFeed(feedData);
            });
        })(filterBtns[j]);
    }

    /* Close overlay on background click */
    var overlay = document.getElementById('composeOverlay');
    if (overlay) {
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) {
                closeCompose();
            }
        });
    }

    /* Listen to Firebase */
    if (typeof FirebaseSync !== 'undefined' && FirebaseSync.isConfigured()) {
        FirebaseSync.onUpdate('feed', function (data) {
            feedData = data || {};
            renderFeed(feedData);
        });
    }

    /* Backup: custom event */
    document.addEventListener('feedUpdate', function (e) {
        if (e.detail) {
            feedData = e.detail;
            renderFeed(feedData);
        }
    });
}

/* ============================================
   Render Feed
   ============================================ */
function renderFeed(data) {
    var list = document.getElementById('feedList');
    if (!list) return;

    /* Convert object to array with keys */
    var items = [];
    var key;
    for (key in data) {
        if (data.hasOwnProperty(key)) {
            var item = data[key];
            item._id = key;
            items.push(item);
        }
    }

    /* Sort newest first */
    items.sort(function (a, b) {
        return (b.timestamp || 0) - (a.timestamp || 0);
    });

    /* Apply filter */
    var allowed = FILTER_MAP[activeFilter];
    if (allowed) {
        items = items.filter(function (item) {
            return allowed.indexOf(item.type) !== -1;
        });
    }

    if (items.length === 0) {
        list.innerHTML = '<div class="feed-empty">No activity yet. Be the first!</div>';
        return;
    }

    var html = '';
    for (var i = 0; i < items.length; i++) {
        html += renderFeedItem(items[i]);
    }
    list.innerHTML = html;

    /* Bind reaction buttons */
    var reactionBtns = list.querySelectorAll('.feed-reaction-btn');
    for (var r = 0; r < reactionBtns.length; r++) {
        (function (btn) {
            btn.addEventListener('click', function () {
                var itemId = btn.getAttribute('data-item-id');
                var emoji = btn.getAttribute('data-emoji');
                addReaction(itemId, emoji);
            });
        })(reactionBtns[r]);
    }

    /* Bind music upvote buttons */
    var upvoteBtns = list.querySelectorAll('.feed-music-upvote');
    for (var u = 0; u < upvoteBtns.length; u++) {
        (function (btn) {
            btn.addEventListener('click', function () {
                var itemId = btn.getAttribute('data-item-id');
                addUpvote(itemId);
            });
        })(upvoteBtns[u]);
    }
}

/* ============================================
   Render Single Feed Item
   ============================================ */
function renderFeedItem(item) {
    var typeConf = FEED_TYPES[item.type] || FEED_TYPES.message;
    var guestCode = (typeof Auth !== 'undefined' && Auth.isLoggedIn()) ? Auth.getGuestCode() : '';

    /* Name: anonymous for confessions */
    var displayName = item.type === 'confession' ? 'Anonymous' : (item.guestName || 'Guest');

    /* Reactions */
    var reactions = item.reactions || {};
    var reactedBy = item.reactedBy || {};
    var myReactions = reactedBy[guestCode] || {};
    var emojis = ['❤️', '😂', '🔥'];

    var reactionsHtml = '<div class="feed-reactions">';
    for (var e = 0; e < emojis.length; e++) {
        var emoji = emojis[e];
        var count = reactions[emoji] || 0;
        var reacted = myReactions[emoji] ? ' reacted' : '';
        reactionsHtml += '<button class="feed-reaction-btn' + reacted + '" data-item-id="' + item._id + '" data-emoji="' + emoji + '">';
        reactionsHtml += '<span>' + emoji + '</span>';
        if (count > 0) {
            reactionsHtml += '<span class="feed-reaction-count">' + count + '</span>';
        }
        reactionsHtml += '</button>';
    }
    reactionsHtml += '</div>';

    /* Content */
    var contentHtml = '';
    if (item.type === 'music') {
        var upvotes = item.upvotes || 0;
        var upvotedBy = item.upvotedBy || {};
        var hasVoted = upvotedBy[guestCode] ? ' voted' : '';
        contentHtml = '<div class="feed-item-content">';
        contentHtml += '<div class="feed-music-info">';
        contentHtml += '<span class="feed-music-icon">🎵</span>';
        contentHtml += '<div class="feed-music-details">';
        contentHtml += '<div class="feed-music-song">' + escapeHtml(item.song || '') + '</div>';
        contentHtml += '<div class="feed-music-artist">' + escapeHtml(item.artist || '') + '</div>';
        contentHtml += '</div>';
        contentHtml += '<button class="feed-music-upvote' + hasVoted + '" data-item-id="' + item._id + '">👍 ' + upvotes + '</button>';
        contentHtml += '</div>';
        contentHtml += '</div>';
    } else if (item.type === 'prediction') {
        contentHtml = '<div class="feed-item-content">';
        contentHtml += '<div class="feed-prediction-prefix">By 40, Joe will...</div>';
        contentHtml += escapeHtml(item.text || '');
        contentHtml += '</div>';
    } else if (item.type === 'photo') {
        contentHtml = '<div class="feed-item-content">';
        if (item.imageUrl) {
            contentHtml += '<img src="' + escapeHtml(item.imageUrl) + '" alt="Photo" loading="lazy">';
        }
        if (item.caption) {
            contentHtml += '<p>' + escapeHtml(item.caption) + '</p>';
        }
        contentHtml += '</div>';
    } else {
        contentHtml = '<div class="feed-item-content">' + escapeHtml(item.text || item.content || '') + '</div>';
    }

    /* Assemble */
    var html = '<div class="feed-item">';
    html += '<div class="feed-item-header">';
    html += '<div class="feed-type-badge feed-type-badge--' + item.type + '">' + typeConf.icon + '</div>';
    html += '<div class="feed-item-meta">';
    html += '<div class="feed-item-name">' + escapeHtml(displayName) + '</div>';
    html += '<div class="feed-item-time">' + formatTime(item.timestamp) + '</div>';
    html += '</div>';
    html += '</div>';
    html += contentHtml;
    html += reactionsHtml;
    html += '</div>';

    return html;
}

/* ============================================
   Compose Modal
   ============================================ */
function openCompose(type) {
    var overlay = document.getElementById('composeOverlay');
    var modal = document.getElementById('composeModal');
    if (!overlay || !modal) return;

    var typeConf = FEED_TYPES[type] || FEED_TYPES.message;
    var html = '';

    if (type === 'message') {
        html = '<div class="feed-modal-title">' + typeConf.icon + ' Post a Message</div>';
        html += '<textarea id="composeText" placeholder="What\'s on your mind?" maxlength="500" rows="4"></textarea>';
        html += '<div class="feed-modal-char-count"><span id="composeCharCount">0</span> / 500</div>';
        html += '<div class="feed-modal-actions">';
        html += '<button class="feed-modal-cancel" onclick="closeCompose()">Cancel</button>';
        html += '<button class="feed-modal-submit" id="composeSubmit">Post</button>';
        html += '</div>';
    } else if (type === 'confession') {
        html = '<div class="feed-modal-title">' + typeConf.icon + ' Post a Confession</div>';
        html += '<div class="feed-modal-note">This will be posted anonymously. No one will know it was you.</div>';
        html += '<textarea id="composeText" placeholder="Spill the tea..." maxlength="500" rows="4"></textarea>';
        html += '<div class="feed-modal-char-count"><span id="composeCharCount">0</span> / 500</div>';
        html += '<div class="feed-modal-actions">';
        html += '<button class="feed-modal-cancel" onclick="closeCompose()">Cancel</button>';
        html += '<button class="feed-modal-submit" id="composeSubmit">Confess</button>';
        html += '</div>';
    } else if (type === 'music') {
        html = '<div class="feed-modal-title">' + typeConf.icon + ' Request a Song</div>';
        html += '<label for="composeSong">Song name</label>';
        html += '<input type="text" id="composeSong" placeholder="e.g. Mr. Brightside">';
        html += '<label for="composeArtist">Artist</label>';
        html += '<input type="text" id="composeArtist" placeholder="e.g. The Killers">';
        html += '<div class="feed-modal-actions">';
        html += '<button class="feed-modal-cancel" onclick="closeCompose()">Cancel</button>';
        html += '<button class="feed-modal-submit" id="composeSubmit">Add Song</button>';
        html += '</div>';
    } else if (type === 'prediction') {
        html = '<div class="feed-modal-title">' + typeConf.icon + ' Make a Prediction</div>';
        html += '<div class="feed-modal-note">By 40, Joe will...</div>';
        html += '<textarea id="composeText" placeholder="...have learnt how to cook more than pasta" maxlength="500" rows="3"></textarea>';
        html += '<div class="feed-modal-char-count"><span id="composeCharCount">0</span> / 500</div>';
        html += '<div class="feed-modal-actions">';
        html += '<button class="feed-modal-cancel" onclick="closeCompose()">Cancel</button>';
        html += '<button class="feed-modal-submit" id="composeSubmit">Predict</button>';
        html += '</div>';
    } else if (type === 'photo') {
        html = '<div class="feed-modal-title">' + typeConf.icon + ' Share a Photo</div>';
        html += '<div class="feed-modal-coming-soon">';
        html += '<div class="feed-modal-coming-soon-icon">📸</div>';
        html += '<p>Photo uploads coming soon!</p>';
        html += '<p style="font-size:0.8rem;margin-top:8px;">For now, share photos in the WhatsApp group.</p>';
        html += '</div>';
        html += '<div class="feed-modal-actions">';
        html += '<button class="feed-modal-cancel" onclick="closeCompose()">Close</button>';
        html += '</div>';
    }

    modal.innerHTML = html;
    overlay.classList.add('visible');

    /* Char count listener */
    var textArea = document.getElementById('composeText');
    var charCount = document.getElementById('composeCharCount');
    if (textArea && charCount) {
        textArea.addEventListener('input', function () {
            charCount.textContent = textArea.value.length;
        });
        textArea.focus();
    }

    /* Song field focus */
    var songInput = document.getElementById('composeSong');
    if (songInput) songInput.focus();

    /* Submit handler */
    var submitBtn = document.getElementById('composeSubmit');
    if (submitBtn) {
        submitBtn.addEventListener('click', function () {
            handleSubmit(type);
        });
    }
}

function closeCompose() {
    var overlay = document.getElementById('composeOverlay');
    if (overlay) overlay.classList.remove('visible');
}

function handleSubmit(type) {
    var submitBtn = document.getElementById('composeSubmit');
    if (submitBtn) submitBtn.disabled = true;

    var guestCode = '';
    var guestName = 'Guest';
    if (typeof Auth !== 'undefined' && Auth.isLoggedIn()) {
        guestCode = Auth.getGuestCode();
        var gd = Auth.getGuestData();
        if (gd) guestName = gd.name || gd.fullName || 'Guest';
    }

    var data = null;

    if (type === 'message' || type === 'confession') {
        var textEl = document.getElementById('composeText');
        var text = textEl ? textEl.value.trim() : '';
        if (!text) {
            if (submitBtn) submitBtn.disabled = false;
            return;
        }
        data = {
            type: type,
            guestCode: type === 'confession' ? '' : guestCode,
            guestName: type === 'confession' ? 'Anonymous' : guestName,
            text: text,
            timestamp: Date.now()
        };
    } else if (type === 'music') {
        var songEl = document.getElementById('composeSong');
        var artistEl = document.getElementById('composeArtist');
        var song = songEl ? songEl.value.trim() : '';
        var artist = artistEl ? artistEl.value.trim() : '';
        if (!song) {
            if (submitBtn) submitBtn.disabled = false;
            return;
        }
        data = {
            type: 'music',
            guestCode: guestCode,
            guestName: guestName,
            song: song,
            artist: artist,
            upvotes: 0,
            timestamp: Date.now()
        };
    } else if (type === 'prediction') {
        var predEl = document.getElementById('composeText');
        var predText = predEl ? predEl.value.trim() : '';
        if (!predText) {
            if (submitBtn) submitBtn.disabled = false;
            return;
        }
        data = {
            type: 'prediction',
            guestCode: guestCode,
            guestName: guestName,
            text: predText,
            timestamp: Date.now()
        };
    }

    if (!data) return;

    submitPost(type, data);
}

function submitPost(type, data) {
    if (typeof FirebaseSync !== 'undefined' && FirebaseSync.isConfigured()) {
        FirebaseSync.push('feed', data);

        /* Also push to the type-specific collection */
        var collectionMap = {
            message: 'messages',
            confession: 'confessions',
            music: 'musicRequests',
            prediction: 'predictions'
        };
        var collection = collectionMap[type];
        if (collection) {
            FirebaseSync.push(collection, data);
        }
    }

    closeCompose();
}

/* ============================================
   Reactions
   ============================================ */
function addReaction(feedItemId, emoji) {
    if (typeof Auth === 'undefined' || !Auth.isLoggedIn()) return;
    if (typeof FirebaseSync === 'undefined' || !FirebaseSync.isConfigured()) return;

    var guestCode = Auth.getGuestCode();
    var item = feedData[feedItemId];
    if (!item) return;

    var reactedBy = item.reactedBy || {};
    var myReactions = reactedBy[guestCode] || {};

    if (myReactions[emoji]) {
        /* Already reacted — remove */
        var currentCount = (item.reactions && item.reactions[emoji]) || 0;
        var newCount = Math.max(0, currentCount - 1);
        var updates = {};
        updates['feed/' + feedItemId + '/reactions/' + emoji] = newCount || null;
        updates['feed/' + feedItemId + '/reactedBy/' + guestCode + '/' + emoji] = null;
        FirebaseSync.update('', updates);
    } else {
        /* Add reaction */
        var count = (item.reactions && item.reactions[emoji]) || 0;
        var addUpdates = {};
        addUpdates['feed/' + feedItemId + '/reactions/' + emoji] = count + 1;
        addUpdates['feed/' + feedItemId + '/reactedBy/' + guestCode + '/' + emoji] = true;
        FirebaseSync.update('', addUpdates);
    }
}

/* ============================================
   Music Upvote
   ============================================ */
function addUpvote(feedItemId) {
    if (typeof Auth === 'undefined' || !Auth.isLoggedIn()) return;
    if (typeof FirebaseSync === 'undefined' || !FirebaseSync.isConfigured()) return;

    var guestCode = Auth.getGuestCode();
    var item = feedData[feedItemId];
    if (!item) return;

    var upvotedBy = item.upvotedBy || {};

    if (upvotedBy[guestCode]) {
        /* Already voted — remove */
        var currentVotes = item.upvotes || 0;
        var removeUpdates = {};
        removeUpdates['feed/' + feedItemId + '/upvotes'] = Math.max(0, currentVotes - 1);
        removeUpdates['feed/' + feedItemId + '/upvotedBy/' + guestCode] = null;
        FirebaseSync.update('', removeUpdates);
    } else {
        /* Add vote */
        var votes = item.upvotes || 0;
        var addUpdates = {};
        addUpdates['feed/' + feedItemId + '/upvotes'] = votes + 1;
        addUpdates['feed/' + feedItemId + '/upvotedBy/' + guestCode] = true;
        FirebaseSync.update('', addUpdates);
    }
}

/* ============================================
   Time Formatting
   ============================================ */
function formatTime(timestamp) {
    if (!timestamp) return '';
    var diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 5) return 'just now';
    if (diff < 60) return diff + 's ago';
    if (diff < 3600) return Math.floor(diff / 60) + ' mins ago';
    if (diff < 7200) return '1 hour ago';
    if (diff < 86400) return Math.floor(diff / 3600) + ' hours ago';
    if (diff < 172800) return 'yesterday';
    if (diff < 604800) return Math.floor(diff / 86400) + ' days ago';
    return new Date(timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}
