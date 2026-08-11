const CACHE_NAME = 'gps-watermark-v2';
const STATIC_ASSETS_CACHE = 'gps-watermark-static-v2';
const CDN_CACHE = 'gps-watermark-cdn-v2';
const FALLBACK_CACHE = 'gps-watermark-fallback-v2';

// Critical assets untuk offline functionality
const CRITICAL_ASSETS = [
    './',
    './index.php',
    './styles.css',
    './app.js',
    './db.js',
    './watermark.js',
    './weather.js',
    './openlocationcode.js',
    './offline-handler.js',
    './favicon.svg',
    './icon-192.png',
    './icon-512.png',
];

// External CDN resources dengan fallback
const EXTERNAL_RESOURCES = [
    {
        url: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.min.css',
        fallback: './fallbacks/leaflet.min.css'
    },
    {
        url: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.min.js',
        fallback: './fallbacks/leaflet.min.js'
    },
    {
        url: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
        fallback: './fallbacks/fontawesome.min.css'
    },
    {
        url: 'https://cdn.jsdelivr.net/npm/piexifjs@1.0.6/piexif.min.js',
        fallback: './fallbacks/piexif.min.js'
    }
];

// Install — cache all critical assets
self.addEventListener('install', (e) => {
    e.waitUntil(
        Promise.all([
            caches.open(STATIC_ASSETS_CACHE).then((cache) => cache.addAll(CRITICAL_ASSETS)),
            caches.open(CDN_CACHE).then((cache) => {
                return Promise.allSettled(
                    EXTERNAL_RESOURCES.map(resource => 
                        fetch(resource.url).then(response => {
                            if (response.ok) {
                                cache.put(resource.url, response.clone());
                            }
                        }).catch(() => {
                            // Silently fail if CDN is unreachable during install
                        })
                    )
                );
            })
        ])
    );
    self.skipWaiting();
});

// Message handler untuk trigger manual sync
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Activate — clean old caches
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            const validCaches = [STATIC_ASSETS_CACHE, CDN_CACHE, FALLBACK_CACHE, CACHE_NAME];
            return Promise.all(
                keys.filter((k) => !validCaches.includes(k)).map((k) => caches.delete(k))
            );
        })
    );
    self.clients.claim();
});

// Fetch — Smart caching strategy
self.addEventListener('fetch', (e) => {
    const url = new URL(e.request.url);
    
    // Only handle GET requests
    if (e.request.method !== 'GET') return;

    // IMPORTANT: Intercept all navigation requests (HTML pages)
    // This ensures app loads even in offline mode
    if (e.request.mode === 'navigate' || url.pathname.endsWith('.php') || url.pathname === '/') {
        e.respondWith(
            // First try to fetch from network
            fetch(e.request)
                .then((response) => {
                    // Cache successful responses
                    if (response && response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(STATIC_ASSETS_CACHE).then((cache) => {
                            cache.put('./index.php', responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Network failed or offline - return cached index.php
                    return caches.match('./index.php')
                        .then((cached) => cached)
                        .catch(() => {
                            // No cache, return empty but valid HTML
                            return caches.match('./')
                                .then((cached) => cached)
                                .catch(() => {
                                    // Last resort - return minimal working page
                                    return new Response(
                                        `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GPS Watermark — Loading...</title>
    <script>
        // Auto-reload atau redirect to cache
        setTimeout(() => {
            if ('caches' in window) {
                caches.match('./index.php').then(r => {
                    if (r) location.reload();
                });
            }
        }, 1000);
    </script>
</head>
<body>
    <p>Loading application...</p>
</body>
</html>`,
                                        {
                                            status: 200,
                                            headers: { 'Content-Type': 'text/html; charset=utf-8' }
                                        }
                                    );
                                });
                        });
                })
        );
        return;
    }

    // Internal assets — stale-while-revalidate
    if (url.hostname === self.location.hostname) {
        e.respondWith(
            caches.match(e.request).then((cached) => {
                const fetchPromise = fetch(e.request).then((response) => {
                    if (response && response.status === 200) {
                        const clone = response.clone();
                        caches.open(STATIC_ASSETS_CACHE).then((c) => {
                            c.put(e.request, clone);
                        });
                    }
                    return response;
                }).catch(() => cached);

                return cached || fetchPromise;
            })
        );
        return;
    }

    // External CDN resources — cache-first with network fallback
    if (e.request.url.includes('cdn.jsdelivr.net') || 
        e.request.url.includes('cdnjs.cloudflare.com')) {
        
        e.respondWith(
            caches.open(CDN_CACHE).then((cache) => {
                return cache.match(e.request).then((cached) => {
                    // Try network first for fresh content
                    return fetch(e.request, { mode: 'cors', credentials: 'omit' })
                        .then((response) => {
                            if (response && response.status === 200) {
                                cache.put(e.request, response.clone());
                            }
                            return response;
                        })
                        .catch(() => {
                            // If network fails, return cached or create fallback response
                            if (cached) return cached;
                            
                            // Return appropriate fallback
                            if (e.request.url.includes('leaflet')) {
                                return new Response('/* Leaflet offline */', { 
                                    status: 200,
                                    headers: { 'Content-Type': 'text/css' }
                                });
                            }
                            if (e.request.url.includes('piexif')) {
                                return new Response('window.piexif=window.piexif||{};', {
                                    status: 200,
                                    headers: { 'Content-Type': 'application/javascript' }
                                });
                            }
                            if (e.request.url.includes('font-awesome')) {
                                return new Response('/* FontAwesome offline */', {
                                    status: 200,
                                    headers: { 'Content-Type': 'text/css' }
                                });
                            }
                            
                            return new Response('', { status: 503 });
                        });
                });
            })
        );
        return;
    }

    // Weather API — network-first with timeout
    if (e.request.url.includes('open-meteo.com') || 
        e.request.url.includes('nominatim.openstreetmap.org')) {
        
        e.respondWith(
            Promise.race([
                fetch(e.request, { signal: AbortSignal.timeout(5000) }),
                new Promise(resolve => 
                    setTimeout(() => resolve(new Response(JSON.stringify({ 
                        offline: true,
                        message: 'Server tidak merespon'
                    }), {
                        status: 503,
                        headers: { 'Content-Type': 'application/json' }
                    })), 5000)
                )
            ]).catch(() => {
                return new Response(JSON.stringify({ 
                    offline: true,
                    message: 'Layanan cuaca & lokasi tidak tersedia'
                }), {
                    status: 503,
                    headers: { 'Content-Type': 'application/json' }
                });
            })
        );
        return;
    }
});
