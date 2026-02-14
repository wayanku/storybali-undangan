const CACHE_NAME = 'storybali-cache-v7.3'; // Naikkan versi cache
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/main.js',
    '/catalog.js',
    '/manifest.json'
    // JANGAN masukkan admin.html di sini
];

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
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
    // PROTEKSI UNTUK ADMIN: Jika URL mengandung kata 'admin', paksa ambil dari Network (Internet)
    if (event.request.url.includes('admin.html') || event.request.url.includes('/admin')) {
        return; // Biarkan browser menangani secara normal tanpa Service Worker
    }

    // [BARU] Jangan cache request ke Google Apps Script (API) agar data selalu Real-time
    if (event.request.url.includes('script.google.com')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
