const CACHE_NAME = 'storybali-cache-v3.0'; // [UPDATE] Versi baru untuk reset cache
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
    './buat%20undangan/pernikahan.html', // [BARU] Tambahkan file ini
    'https://wayanku.github.io/storybali-undangan/IMG_6302%20(2).JPG',
    'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Playfair+Display:wght@900&family=Poppins:wght@400;700;900&display=swap',
    'https://fonts.gstatic.com/s/manrope/v15/xn7gYHE41ni1AdIRggexSg.woff2'
];

// Install Service Worker
self.addEventListener('install', event => {
    // [PENTING] Paksa SW baru untuk segera aktif menggantikan yang rusak
    self.skipWaiting(); 
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Activate & Hapus Cache Lama
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Menghapus cache lama:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // [PENTING] Ambil alih kontrol halaman segera
            return self.clients.claim();
        })
    );
});

// Fetch Strategy: Network First untuk HTML (Navigasi), Cache First untuk Aset
self.addEventListener('fetch', event => {
    // Jika request adalah navigasi halaman (HTML)
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Jika berhasil ambil dari network, simpan copy ke cache
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    return response;
                })
                .catch(() => {
                    // Jika offline/gagal, baru ambil dari cache
                    return caches.match(event.request);
                })
        );
    } else {
        // Untuk gambar, css, js -> Ambil dari cache dulu biar cepat
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    return response || fetch(event.request);
                })
        );
    }
});
