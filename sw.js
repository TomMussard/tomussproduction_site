self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));

self.addEventListener('push', (e) => {
  const data = e.data ? e.data.json() : {};
  e.waitUntil(
    self.registration.showNotification(data.title || 'Tomuss Production', {
      body: data.body || '',
      icon: data.icon || '/uploads/Plan de travail 5logotest.png',
      badge: data.badge || '/uploads/Plan de travail 5logotest.png',
      vibrate: [200, 100, 200],
      tag: 'tomuss-notif',
      renotify: true,
    })
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(clients.openWindow('/dashboard/'));
});
