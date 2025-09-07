// Service Worker for PWA
const CACHE_NAME = 'sambuja-family-v6-mobile-fix';
const urlsToCache = [
  '/',
  '/schedule',
  '/goals', 
  '/communication',
  '/help',
  '/profile',
  '/dad-avatar.png',
  '/eldest-avatar.png',
  '/youngest-avatar.png',
  '/manifest.json'
];

// API endpoints and dynamic content that should never be cached
const NO_CACHE_URLS = [
  '/api/',
  'firestore.googleapis.com',
  'firebase',
  '_next/static/chunks/',
  '_next/static/css/',
  '.css',
  '.js'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - smart caching strategy
self.addEventListener('fetch', (event) => {
  // Skip caching for non-HTTP requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // Skip caching for API calls and Firebase requests
  const shouldNotCache = NO_CACHE_URLS.some(url => event.request.url.includes(url));
  
  if (shouldNotCache) {
    // For API calls, always fetch fresh data
    event.respondWith(fetch(event.request));
    return;
  }

  // For static assets and pages, use cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response, but also fetch fresh data in background
        if (response) {
          // Background fetch to update cache
          fetch(event.request).then((freshResponse) => {
            if (freshResponse && freshResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, freshResponse.clone());
              });
            }
          }).catch(() => {
            // Silently fail background updates
          });
          
          return response;
        }

        // No cache hit - fetch from network
        return fetch(event.request).then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Skip caching for non-same-origin requests
          if (!event.request.url.startsWith(self.location.origin)) {
            return response;
          }

          // Clone the response and cache it
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            })
            .catch((error) => {
              console.log('Cache put failed:', error);
            });

          return response;
        }).catch(() => {
          // If network fails and we have no cache, return a basic offline response
          if (event.request.destination === 'document') {
            return caches.match('/');
          }
        });
      })
  );
});

// Service Worker for push notifications
self.addEventListener('push', function(event) {
  console.log('Push event received:', event);
  
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/dad-avatar.png',
      badge: '/dad-avatar.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.id
      },
      actions: [
        {
          action: 'explore',
          title: '확인하기',
          icon: '/dad-avatar.png'
        },
        {
          action: 'close',
          title: '닫기'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  console.log('Notification click received.');

  event.notification.close();

  if (event.action === 'explore') {
    // 앱으로 이동
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// 백그라운드 동기화
self.addEventListener('sync', function(event) {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // 백그라운드에서 새 글 확인 등의 작업 수행
  console.log('Background sync triggered');
}