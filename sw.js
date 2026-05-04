/* Service Worker - Offline Cache for Joe's 30th Birthday Trip */
var CACHE_NAME = 'joe30-v22';
var ASSETS = [
    './',
    'index.html',
    'schedule.html',
    'bingo.html',
    'games.html',
    'social.html',
    'livefeed.html',
    'practical.html',
    'css/base.css',
    'css/components.css',
    'css/nav.css',
    'css/home.css',
    'css/schedule.css',
    'css/bingo.css',
    'css/games.css',
    'css/social.css',
    'css/livefeed.css',
    'css/practical.css',
    'js/shared.js',
    'js/firebase-config.js',
    'js/nav.js',
    'js/home.js',
    'js/schedule.js',
    'js/bingo.js',
    'js/games.js',
    'js/social.js',
    'js/livefeed.js',
    'js/practical.js',
    'manifest.json'
];

// Install: cache core assets
self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys().then(function(keys) {
            return Promise.all(
                keys.filter(function(k) { return k !== CACHE_NAME; })
                    .map(function(k) { return caches.delete(k); })
            );
        })
    );
    self.clients.claim();
});

// Push notifications
self.addEventListener('push', function(e) {
    var data = {};
    try { data = e.data.json(); } catch(err) { data = { title: 'joes30.com', body: e.data ? e.data.text() : '' }; }
    e.waitUntil(
        self.registration.showNotification(data.title || 'joes30.com', {
            body: data.body || '',
            icon: 'images/icon-192.png',
            badge: 'images/icon-192.png',
            data: { url: data.url || '/' }
        })
    );
});

self.addEventListener('notificationclick', function(e) {
    e.notification.close();
    var url = e.notification.data && e.notification.data.url ? e.notification.data.url : '/';
    e.waitUntil(
        clients.matchAll({ type: 'window' }).then(function(list) {
            for (var i = 0; i < list.length; i++) {
                if (list[i].url.indexOf(url) !== -1 && 'focus' in list[i]) {
                    return list[i].focus();
                }
            }
            return clients.openWindow(url);
        })
    );
});

// Fetch: network first, fallback to cache
self.addEventListener('fetch', function(e) {
    // Skip non-GET and external requests
    if (e.request.method !== 'GET') return;
    if (!e.request.url.startsWith(self.location.origin)) return;
    // Never cache trailer - always fetch fresh
    if (e.request.url.indexOf('trailer') !== -1) return;

    e.respondWith(
        fetch(e.request).then(function(response) {
            // Cache successful responses
            if (response.ok) {
                var clone = response.clone();
                caches.open(CACHE_NAME).then(function(cache) {
                    cache.put(e.request, clone);
                });
            }
            return response;
        }).catch(function() {
            return caches.match(e.request);
        })
    );
});
