// Tala app service worker: keeps the app shell available offline.
// Network first for pages, so site updates show at once.
var CACHE = 'tala-app-v5';
var SHELL = ['/app/', '/app/manifest.webmanifest', '/app/icons/icon-192.png', '/app/icons/icon-512.png', '/images/brand/tala-dark.svg'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;
  e.respondWith(fetch(req).then(function (res) {
    if (res.ok && SHELL.indexOf(url.pathname) !== -1) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(req, copy); });
    }
    return res;
  }).catch(function () {
    return caches.match(req, { ignoreSearch: true }).then(function (hit) { return hit || caches.match('/app/'); });
  }));
});
