self.addEventListener('fetch', (e) => {
  // Estrategia básica: si está en red úsala, si no, busca en caché (simplificado para GH Pages)
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
