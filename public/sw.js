// Service Worker для PWA
// Базовая версия без офлайн кэширования

const CACHE_NAME = '10dreamers-v1'

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  return self.clients.claim()
})

// Fetch event - простая стратегия network-first
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request)
    })
  )
})
