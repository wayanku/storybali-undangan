const CACHE_NAME = 'storybali-cache-v4.0'; // [UPDATE] Naikkan ke 4.0 agar cache lama terhapus
const urlsToCache = [
    '/',
    '/index.html',
    '/admin.html',
    '/style.css',
    '/main.js',
    '/catalog.js',
    '/manifest.json',
    '/edit-tamu.html'
    // Hapus path yang menggunakan spasi atau folder aneh dulu untuk testing
];

self.addEventListener('install', event => {
    self.skipWaiting(); 
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
