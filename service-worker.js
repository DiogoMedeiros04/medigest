const CACHE_NAME = "medigest-cache-v1"
const urlsToCache = [
  "index.html",
  "style.css",
  "manifest.json",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "offline.html"
]

// Instala o Service Worker
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache)
    })
  )
})

// Ativa e remove caches antigos
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) return caches.delete(name)
        })
      )
    })
  )
})

// Intercepta requisições
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match(event.request).then(response => response || caches.match("offline.html"))
    )
  )
})
