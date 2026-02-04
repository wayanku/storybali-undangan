const CACHE_NAME = 'storybali-cache-v2.4'; // Cocokkan dengan APP_VERSION di main.js
const urlsToCache = [
    './',
    './index.html',
    './admin.html',
    './style.css',
    './main.js',
    './catalog.js',
    './manifest.json',
    './edit-tamu.html',
    './buat%20undangan/metatah.html',
    'https://wayanku.github.io/storybali-undangan/IMG_6302%20(2).JPG',
    'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Playfair+Display:wght@900&family=Poppins:wght@400;700;900&display=swap',
    'https://fonts.gstatic.com/s/manrope/v15/xn7gYHE41ni1AdIRggexSg.woff2' // Contoh file font
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// [BARU] Event Activate untuk membersihkan cache lama agar update manifest terbaca
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});
