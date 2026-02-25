/* Service Worker - Offline Cache for Joe's 30th Birthday Trip */
var CACHE_NAME = 'joe30-v2';
var ASSETS = [
    './',
    'index.html',
    'schedule.html',
    'games.html',
    'social.html',
    'practical.html',
    'css/base.css',
    'css/components.css',
    'css/nav.css',
    'css/home.css',
    'css/schedule.css',
    'css/games.css',
    'css/social.css',
    'css/practical.css',
    'js/shared.js',
    'js/nav.js',
    'js/home.js',
    'js/schedule.js',
    'js/games.js',
    'js/social.js',
    'js/practical.js'
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

// Fetch: network first, fallback to cache
self.addEventListener('fetch', function(e) {
    // Skip non-GET and external requests
    if (e.request.method !== 'GET') return;
    if (!e.request.url.startsWith(self.location.origin)) return;

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
