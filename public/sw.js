// Weather Dashboard service worker.
//
// Two caching strategies, kept deliberately simple rather than pulling in
// a build-time tool like Workbox:
//   - App shell (same-origin JS/CSS/images/fonts, navigation requests):
//     stale-while-revalidate, so repeat loads are instant and still stay
//     fresh in the background.
//   - OpenWeather API calls: network-first with a cache fallback, so a
//     dropped connection shows the last successfully fetched weather
//     instead of an error screen. New data always wins when online.
//
// Bump these version strings when you want to force clients to drop old
// caches (e.g. after a significant asset change).
const SHELL_CACHE = 'weather-shell-v1';
const API_CACHE = 'weather-api-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== SHELL_CACHE && key !== API_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  // OpenWeather API: network-first, falling back to the last cached
  // response for that exact request when offline.
  if (url.hostname === 'api.openweathermap.org') {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  // Full page navigations: network-first with a cached fallback, so a
  // hard refresh while offline still loads the app shell.
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, SHELL_CACHE));
    return;
  }

  // Same-origin static assets: stale-while-revalidate.
  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(request, SHELL_CACHE));
  }
});

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw err;
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then((response) => {
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => undefined);
  return cached || (await networkPromise) || Response.error();
}
