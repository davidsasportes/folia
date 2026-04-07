const CACHE = 'folia-v3';
const ASSETS = ['./','./index.html','./manifest.webmanifest','./apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(() => caches.match('./index.html')))
  );
});

// Weekly notification check
self.addEventListener('periodicsync', e => {
  if(e.tag === 'folia-weekly'){
    e.waitUntil(sendWeeklyNotif());
  }
});

async function sendWeeklyNotif(){
  const clients = await self.clients.matchAll();
  if(clients.length > 0) return; // app is open, skip
  self.registration.showNotification('Folia · by David', {
    body: '📊 Rappel budget hebdo — 2 min pour vérifier ton mois en cours ?',
    icon: './apple-touch-icon.png',
    badge: './favicon.png',
    tag: 'folia-weekly',
    renotify: true,
    data: { url: './' }
  });
}

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data?.url || './'));
});
