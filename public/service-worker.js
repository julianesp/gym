// Service worker placeholder — GymSaaS no usa PWA por ahora.
// Este archivo existe para evitar el 404 que Next.js genera
// cuando el navegador solicita /service-worker.js automáticamente.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
