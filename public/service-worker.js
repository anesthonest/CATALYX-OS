/**
 * CATALYX Production-Safe Service Worker
 * Version: v30.0.0
 * 
 * STRICT CACHING BOUNDARIES:
 * - App Shell & static assets only (CSS, JS, Fonts, Icons, Manifest)
 * - SENSITIVE API ROUTES ARE NEVER CACHED:
 *   /api/auth/*, /api/payments/*, /api/billing/*, /api/subscriptions/*,
 *   /api/coach-chat, /api/legal/*
 * - Server remains authoritative for state, auth, entitlements, and finances.
 */

const CACHE_VERSION = 'catalyx-static-v30.0';
const FONT_CACHE = 'catalyx-fonts-v1';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/manifest.json',
  '/icon.svg',
  '/catalyx_logo.jpg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png',
  '/favicon.ico',
  '/favicon.png'
];

// Sensitive endpoint patterns that MUST NEVER touch service worker cache
const SENSITIVE_API_PATTERNS = [
  /\/api\/auth\//i,
  /\/api\/payments\//i,
  /\/api\/billing\//i,
  /\/api\/subscriptions\//i,
  /\/api\/coach-chat/i,
  /\/api\/legal\//i,
  /\/api\/marketplace\/purchase/i,
  /\/api\/user\//i,
  /\/api\/admin\//i
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      // Precache app shell quietly, do not abort on single missing asset
      return Promise.allSettled(
        PRECACHE_ASSETS.map((url) =>
          cache.add(new Request(url, { cache: 'reload' })).catch((err) => {
            console.warn('[PWA SW] Precache missed optional asset:', url, err);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_VERSION && name !== FONT_CACHE)
          .map((name) => {
            console.log('[PWA SW] Removing obsolete cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Non-GET requests (POST, PUT, DELETE, PATCH): Always Network Only
  if (request.method !== 'GET') {
    return;
  }

  // 2. Sensitive APIs: STRICT Network-Only. Never cache.
  const isSensitiveApi = SENSITIVE_API_PATTERNS.some((pattern) => pattern.test(url.pathname));
  if (isSensitiveApi) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({
            error: 'NETWORK_OFFLINE',
            offline: true,
            message: "You're offline. Some features are temporarily unavailable."
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      })
    );
    return;
  }

  // 3. Other API requests (/api/*): Network-First, do not cache private state
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({
            error: 'NETWORK_OFFLINE',
            offline: true,
            message: "You're offline. Some features are temporarily unavailable."
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      })
    );
    return;
  }

  // 4. Google Fonts: Cache-First with fallback to network
  if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
    event.respondWith(
      caches.open(FONT_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => cachedResponse);
        });
      })
    );
    return;
  }

  // 5. HTML Navigation Requests (App Shell): Network-First with Cache Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // If valid response, update App Shell cache
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // If offline, serve cached App Shell index.html
          return caches.match('/index.html').then((cached) => {
            return (
              cached ||
              caches.match('/') ||
              new Response(
                '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>CATALYX Offline</title></head><body style="background:#030712;color:#f8fafc;font-family:sans-serif;padding:2rem;text-align:center;"><h1>CATALYX</h1><p>You are currently offline. Please reconnect to access the workspace.</p></body></html>',
                { headers: { 'Content-Type': 'text/html' } }
              )
            );
          });
        })
    );
    return;
  }

  // 6. Static Assets (Vite chunks in /assets/, images, icons): Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const clone = networkResponse.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

// Listen for messages from client app (e.g. SKIP_WAITING on user click)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
