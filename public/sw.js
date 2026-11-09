const CACHE = "pokedex-151-v2";
const SHELL = ["./", "./manifest.webmanifest", "./favicon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

// Borra cachés de versiones anteriores para no servir builds viejos.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

const saveCopy = (request, response) => {
  if (response.ok) caches.open(CACHE).then((cache) => cache.put(request, response.clone()));
  return response;
};

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  // Páginas: red primero para recibir siempre el último despliegue; sin conexión, la copia guardada.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => saveCopy("./", response))
        .catch(() => caches.match("./")),
    );
    return;
  }

  // Recursos (JS/CSS con hash, datos de PokéAPI, sprites): caché primero, luego red.
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => saveCopy(request, response))),
  );
});
