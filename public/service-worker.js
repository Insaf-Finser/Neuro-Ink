const CACHE_NAME = 'my-app-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/offline.html'
];





//INSTALL
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then((cache) => {
            console.log('Opened cache');
            return cache.addAll(urlsToCache);
        })
        .catch((error) => {
            console.error('Cache installation failed:', error);
        })
    );
    // Force the waiting service worker to become active
    self.skipWaiting();
});

//listen
self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    // Handle navigation requests (page loads) differently
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Cache successful responses
                    if (response && response.status === 200) {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // When offline, try to get the requested page from cache first
                    return caches.match(event.request)
                        .then((cachedResponse) => {
                            // If the requested page is cached, return it
                            if (cachedResponse) {
                                return cachedResponse;
                            }
                            // Otherwise, return offline page
                            return caches.match('/offline.html');
                        })
                        .catch(() => {
                            // Final fallback to offline page
                            return caches.match('/offline.html');
                        });
                })
        );
        return;
    }

    // Handle other requests (assets, API calls, etc.)
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached response if found
                if (response) {
                    return response;
                }
                // Otherwise fetch from network
                return fetch(event.request)
                    .then((response) => {
                        // Cache successful responses
                        if (response && response.status === 200) {
                            const responseToCache = response.clone();
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        }
                        return response;
                    })
                    .catch(() => {
                        // Return cached version if available, or undefined
                        return caches.match(event.request);
                    });
            })
    );
});

//activate
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            ))
    );
    // Take control of all pages immediately
    return self.clients.claim();
});
