/* ============================================
   Live Feed Page JavaScript
   ES5 only — var, no arrow functions, no template literals
   ============================================ */

/* Type config: icon + colour + label */
var FEED_TYPES = {
    message:      { icon: '💬', color: '#4CAF50',  label: 'Message' },
    confession:   { icon: '🤫', color: '#9C27B0',  label: 'Confession' },
    photo:        { icon: '📸', color: '#FF9800',  label: 'Photo' },
    bingo:        { icon: '🎯', color: '#00BCD4',  label: 'Bingo' },
    bingo_claim:  { icon: '✅', color: '#00BCD4',  label: 'Bingo Claim' },
    bingo_line:   { icon: '🎯', color: '#FF5722',  label: 'Bingo Line' },
    bingo_house:  { icon: '👑', color: '#FFD700',  label: 'Full House' },
    points:       { icon: '🏆', color: '#FFC107',  label: 'Points' },
    announcement: { icon: '📢', color: '#F44336',  label: 'Announcement' },
    punishment:   { icon: '😈', color: '#FF5722',  label: 'Punishment' }
};

/* Filter groups */
var FILTER_MAP = {
    all:    null,
    bingo:  ['bingo', 'bingo_claim', 'bingo_line', 'bingo_house', 'punishment'],
    photos: ['photo'],
    social: ['message', 'confession']
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
    var emojis = ['❤️', '😂', '🔥', '🧢'];

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

    /* CAPPED badge: if bingo-type item has 5+ cap reactions */
    var capCount = reactions['🧢'] || 0;
    if (item.type && item.type.indexOf('bingo') !== -1 && capCount >= 5) {
        reactionsHtml += '<div class="feed-capped-badge">🧢 CAPPED</div>';
    }

    /* Content */
    var contentHtml = '';
    if (item.type === 'photo') {
        var photoSrc = item.photoUrl || item.imageUrl || '';
        var photoCaption = item.content || item.caption || '';
        contentHtml = '<div class="feed-item-content">';
        if (photoSrc) {
            contentHtml += '<img src="' + escapeHtml(photoSrc) + '" alt="Photo" class="feed-photo" loading="lazy" onclick="openLightbox(\'' + escapeHtml(photoSrc).replace(/'/g, "\\'") + '\', \'' + escapeHtml(photoCaption).replace(/'/g, "\\'") + '\')">';
        }
        if (photoCaption) {
            contentHtml += '<p class="feed-photo-caption">' + escapeHtml(photoCaption) + '</p>';
        }
        contentHtml += '</div>';
    } else if (item.type === 'bingo_line' || item.type === 'bingo_house' || ((item.text || item.content || '').toLowerCase().indexOf('bingo line') !== -1)) {
        /* Bingo line / full house — gold celebration card */
        contentHtml = '<div class="feed-item-content">';
        contentHtml += '<div class="feed-bingo-line-card">';
        contentHtml += '<div class="feed-bingo-line-title">' + (item.type === 'bingo_house' ? '👑 FULL HOUSE!' : '🎯 BINGO LINE!') + '</div>';
        contentHtml += '<div class="feed-bingo-line-text">' + escapeHtml(item.text || item.content || '') + '</div>';
        contentHtml += '</div>';
        contentHtml += '</div>';
    } else if (item.type === 'bingo_claim' && item.photoUrl) {
        /* Bingo claim with photo proof */
        contentHtml = '<div class="feed-item-content">';
        contentHtml += '<div class="feed-bingo-card">';
        contentHtml += '<img class="feed-bingo-photo" src="' + escapeHtml(item.photoUrl) + '" alt="Proof" loading="lazy">';
        contentHtml += '<div class="feed-bingo-caption">' + escapeHtml(item.text || item.content || '') + '</div>';
        contentHtml += '</div>';
        contentHtml += '</div>';
    } else if (item.type === 'bingo_claim') {
        /* Bingo claim without photo — team-colour left border */
        var teamColours = { titans: '#f9a825', spartans: '#c62828', vikings: '#1565c0', gladiators: '#424242' };
        var tc = teamColours[item.team] || '#7C3AED';
        contentHtml = '<div class="feed-item-content">';
        contentHtml += '<div class="feed-bingo-card feed-bingo-text" style="border-left-color:' + tc + '">';
        contentHtml += '<div class="feed-bingo-caption">' + escapeHtml(item.text || item.content || '') + '</div>';
        contentHtml += '</div>';
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
    } else if (type === 'photo') {
        html = '<div class="feed-modal-title">' + typeConf.icon + ' Share a Photo</div>';
        html += '<div class="photo-upload-area" id="photoUploadArea">';
        html += '<input type="file" id="photoFileInput" accept="image/*" capture="environment" style="display:none;">';
        html += '<div class="photo-upload-placeholder" id="photoPlaceholder">';
        html += '<div class="photo-upload-icon">📷</div>';
        html += '<p>Tap to take or choose a photo</p>';
        html += '</div>';
        html += '<div class="photo-preview-container" id="photoPreviewContainer" style="display:none;">';
        html += '<img id="photoPreview" class="feed-photo-preview" alt="Preview">';
        html += '<button class="photo-change-btn" id="photoChangeBtn">Change</button>';
        html += '</div>';
        html += '</div>';
        html += '<input type="text" id="photoCaption" placeholder="Add a caption (optional)" maxlength="200">';
        html += '<div class="feed-modal-char-count"><span id="photoCaptionCount">0</span> / 200</div>';
        html += '<div class="photo-progress-bar" id="photoProgressBar" style="display:none;">';
        html += '<div class="photo-progress-fill" id="photoProgressFill"></div>';
        html += '</div>';
        html += '<div class="feed-modal-actions">';
        html += '<button class="feed-modal-cancel" onclick="closeCompose()">Cancel</button>';
        html += '<button class="feed-modal-submit" id="composeSubmit" disabled>Upload</button>';
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

    /* Submit handler */
    var submitBtn = document.getElementById('composeSubmit');
    if (submitBtn) {
        submitBtn.addEventListener('click', function () {
            handleSubmit(type);
        });
    }

    /* Photo-specific bindings */
    if (type === 'photo') {
        var fileInput = document.getElementById('photoFileInput');
        var placeholder = document.getElementById('photoPlaceholder');
        var previewContainer = document.getElementById('photoPreviewContainer');
        var preview = document.getElementById('photoPreview');
        var changeBtn = document.getElementById('photoChangeBtn');
        var captionInput = document.getElementById('photoCaption');
        var captionCount = document.getElementById('photoCaptionCount');

        if (placeholder) {
            placeholder.addEventListener('click', function() {
                if (fileInput) fileInput.click();
            });
        }
        if (changeBtn) {
            changeBtn.addEventListener('click', function() {
                if (fileInput) fileInput.click();
            });
        }
        if (fileInput) {
            fileInput.addEventListener('change', function() {
                var file = fileInput.files && fileInput.files[0];
                if (!file) return;
                var reader = new FileReader();
                reader.onload = function(e) {
                    if (preview) preview.src = e.target.result;
                    if (placeholder) placeholder.style.display = 'none';
                    if (previewContainer) previewContainer.style.display = 'block';
                    if (submitBtn) submitBtn.disabled = false;
                };
                reader.readAsDataURL(file);
            });
        }
        if (captionInput && captionCount) {
            captionInput.addEventListener('input', function() {
                captionCount.textContent = captionInput.value.length;
            });
        }
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
    }

    if (type === 'photo') {
        var fileInput = document.getElementById('photoFileInput');
        var captionInput = document.getElementById('photoCaption');
        var file = fileInput && fileInput.files && fileInput.files[0];
        if (!file) {
            if (submitBtn) submitBtn.disabled = false;
            return;
        }
        var caption = captionInput ? captionInput.value.trim() : '';
        var progressBar = document.getElementById('photoProgressBar');
        var progressFill = document.getElementById('photoProgressFill');
        if (progressBar) progressBar.style.display = 'block';
        if (submitBtn) submitBtn.textContent = 'Uploading...';

        if (typeof PhotoStorage !== 'undefined') {
            PhotoStorage.upload(file, guestCode, guestName, caption,
                function(progress) {
                    if (progressFill) progressFill.style.width = Math.round(progress) + '%';
                },
                function(photoData, error) {
                    if (error) {
                        if (submitBtn) {
                            submitBtn.disabled = false;
                            submitBtn.textContent = 'Upload';
                        }
                        if (progressBar) progressBar.style.display = 'none';
                        alert('Upload failed: ' + error);
                        return;
                    }
                    closeCompose();
                }
            );
        }
        return;
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
            confession: 'confessions'
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

/* ============================================
   Photo Lightbox
   ============================================ */
function openLightbox(src, caption) {
    /* Remove existing lightbox if any */
    var existing = document.getElementById('photoLightbox');
    if (existing) existing.remove();

    var overlay = document.createElement('div');
    overlay.className = 'photo-lightbox';
    overlay.id = 'photoLightbox';

    var inner = '<button class="photo-lightbox-close" onclick="closeLightbox()">&times;</button>';
    inner += '<img src="' + src + '" class="photo-lightbox-img" alt="Photo">';
    if (caption) {
        inner += '<div class="photo-lightbox-caption">' + escapeHtml(caption) + '</div>';
    }

    overlay.innerHTML = inner;
    document.body.appendChild(overlay);

    /* Close on overlay click (not on image) */
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closeLightbox();
        }
    });

    /* Close on Escape key */
    document.addEventListener('keydown', lightboxKeyHandler);
}

function closeLightbox() {
    var lb = document.getElementById('photoLightbox');
    if (lb) lb.remove();
    document.removeEventListener('keydown', lightboxKeyHandler);
}

function lightboxKeyHandler(e) {
    if (e.key === 'Escape') {
        closeLightbox();
    }
}
