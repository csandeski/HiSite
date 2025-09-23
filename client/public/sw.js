// Import Firebase scripts for push notifications - only if supported
// Initialize variables for Firebase
let firebase = null;
let messaging = null;

// Check if Firebase should be initialized
const shouldInitFirebase = () => {
  try {
    // Check if we're in a secure context
    if (self.location.protocol !== 'https:' && 
        self.location.hostname !== 'localhost' && 
        self.location.hostname !== '127.0.0.1') {
      console.log('Firebase Messaging requires HTTPS or localhost');
      return false;
    }
    return true;
  } catch (error) {
    console.log('Could not check Firebase support:', error);
    return false;
  }
};

// Conditionally import Firebase scripts
if (shouldInitFirebase()) {
  try {
    importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
    importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');
    console.log('Firebase scripts loaded successfully');
  } catch (error) {
    console.log('Could not load Firebase scripts:', error);
  }
}

// Service Worker for RádioPlay PWA
const CACHE_VERSION = 'v2';
const CACHE_NAME = `radioplay-${CACHE_VERSION}`;
const urlsToCache = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/icon-16x16.png',
  '/icon-32x32.png',
  '/icon-48x48.png',
  '/icon-72x72.png',
  '/icon-96x96.png',
  '/icon-128x128.png',
  '/icon-144x144.png',
  '/icon-152x152.png',
  '/icon-180x180.png',
  '/icon-192x192.png',
  '/icon-384x384.png',
  '/icon-512x512.png'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip API requests - always fetch fresh data
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch new
        if (response) {
          return response;
        }

        return fetch(event.request).then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type === 'opaque') {
            return response;
          }

          // Clone the response as it's a stream and can only be consumed once
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              // Cache the fetched response for future use
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // Return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
        // For other requests, return a fallback response
        return new Response('Offline', { status: 503 });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-points') {
    event.waitUntil(syncPoints());
  }
});

async function syncPoints() {
  // Sync any offline data when connection is restored
  try {
    const response = await fetch('/api/sync', {
      method: 'POST',
      credentials: 'include'
    });
    console.log('Points synced successfully');
  } catch (error) {
    console.error('Failed to sync points:', error);
  }
}

// Initialize Firebase in Service Worker if scripts were loaded
if (typeof firebase !== 'undefined' && shouldInitFirebase()) {
  try {
    firebase.initializeApp({
      apiKey: "AIzaSyDummy-Key",
      authDomain: "radioplay-app.firebaseapp.com",
      projectId: "radioplay-app",
      storageBucket: "radioplay-app.appspot.com",
      messagingSenderId: "123456789",
      appId: "1:123456789:web:dummy"
    });

    messaging = firebase.messaging();

    // Handle background messages
    if (messaging) {
      messaging.onBackgroundMessage((payload) => {
        console.log('Received background message:', payload);

        const notificationTitle = payload.notification?.title || 'RádioPlay';
        const notificationOptions = {
          body: payload.notification?.body || 'Nova notificação',
          icon: '/icon-192x192.png',
          badge: '/icon-96x96.png',
          tag: payload.data?.tag || 'radioplay-notification',
          data: payload.data || {},
          requireInteraction: false,
          actions: payload.data?.actions ? JSON.parse(payload.data.actions) : [],
          image: payload.notification?.image || null
        };

        return self.registration.showNotification(notificationTitle, notificationOptions);
      });
    }
  } catch (error) {
    console.error('Failed to initialize Firebase in Service Worker:', error);
  }
} else {
  console.log('Firebase not initialized in Service Worker - scripts not loaded or not in secure context');
}

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();

  // Handle action buttons
  if (event.action) {
    if (event.action === 'open') {
      event.waitUntil(clients.openWindow(event.notification.data.url || '/'));
    }
    return;
  }

  // Default click - open the app or focus existing window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if available
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus().then(() => {
            if (event.notification.data.url) {
              return client.navigate(event.notification.data.url);
            }
          });
        }
      }
      // Open new window if no existing window
      return clients.openWindow(event.notification.data.url || '/');
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
  // Track notification dismissal if needed
});