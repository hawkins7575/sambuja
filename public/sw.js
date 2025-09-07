// Service Worker for PWA with aggressive update strategy
const CACHE_NAME = `sambuja-family-v${Date.now()}`; // Dynamic cache name for immediate updates
const STATIC_CACHE_NAME = 'sambuja-static-v1';
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

// Install event - cache resources with immediate activation
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing with immediate activation');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files with timestamp:', Date.now());
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Installation complete, skipping waiting');
        // Force immediate activation of new service worker
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches and force immediate control
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating with aggressive cache cleanup');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      const deletePromises = cacheNames.map((cacheName) => {
        if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
          console.log('Service Worker: Deleting old cache', cacheName);
          return caches.delete(cacheName);
        }
      });
      return Promise.all(deletePromises);
    }).then(() => {
      console.log('Service Worker: Cache cleanup complete, claiming clients');
      // Force immediate control of all clients
      return self.clients.claim();
    }).then(() => {
      // Notify all clients about the update
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_UPDATED',
            message: '앱이 업데이트되었습니다. 새로고침하세요!',
            timestamp: Date.now()
          });
        });
      });
    }).catch(error => {
      console.error('Service Worker: Activation failed', error);
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

  // For static assets and pages, use network-first strategy for immediate updates
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Network success - cache the fresh response
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed - try cache as fallback
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              console.log('Service Worker: Serving from cache (offline)', event.request.url);
              return response;
            }
            
            // If nothing in cache and network failed, return offline page for documents
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

// Listen for skip waiting message from clients
self.addEventListener('message', function(event) {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Service Worker: Skip waiting requested');
    self.skipWaiting();
  }
});

// Force update check on focus
self.addEventListener('focus', function() {
  console.log('Service Worker: Window focused, checking for updates');
  self.registration.update();
});