// Service worker de Pagaré Vivo: deja disponible sin conexión la portada,
// la calculadora de pagarés, la galería y los íconos de la app instalada.
const VERSION = "pagare-vivo-v2"; // súbelo a v2, v3... al cambiar la página
const ARCHIVOS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./img/balanza.jpg",
  "./img/clientes.jpg",
  "./img/expedientes.jpg",
  "./img/pagare.jpg",
  "./img/seguridad.jpg",
  "./img/vencimientos.jpg",
  "./img/icon-96.png",
  "./img/icon-192.png",
  "./img/icon-512.png",
  "./img/icon-maskable-512.png"
];

// 1. Instalación: guarda en caché los archivos esenciales
self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(ARCHIVOS))
  );
  self.skipWaiting();
});

// 2. Activación: borra cachés de versiones anteriores
self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys().then((nombres) =>
      Promise.all(nombres.filter((n) => n !== VERSION).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// 3. Fetch: decide de dónde responder cada solicitud
self.addEventListener("fetch", (evento) => {
  const peticion = evento.request;
  const url = new URL(peticion.url);

  // Solo GET del mismo sitio. El video (.mp4) y las peticiones por fragmentos
  // (Range) se dejan pasar a la red porque son pesadas.
  if (peticion.method !== "GET" || url.origin !== location.origin ||
      url.pathname.endsWith(".mp4") || peticion.headers.has("range")) return;

  // Páginas: primero red (siempre la versión más nueva); sin conexión se
  // muestra index.html guardado, donde la calculadora sigue funcionando
  if (peticion.mode === "navigate") {
    evento.respondWith(
      fetch(peticion).catch(() => caches.match("./index.html"))
    );
    return;
  }

  // manifest.json: primero red, para que los cambios se vean de inmediato
  if (url.pathname.endsWith("manifest.json")) {
    evento.respondWith(
      fetch(peticion).then((r) => {
        const copia = r.clone();
        caches.open(VERSION).then((cache) => cache.put(peticion, copia));
        return r;
      }).catch(() => caches.match(peticion))
    );
    return;
  }

  // Imágenes, íconos y demás: primero caché, y si no está, red
  evento.respondWith(
    caches.match(peticion).then((guardado) => {
      return guardado || fetch(peticion).then((respuesta) => {
        const copia = respuesta.clone();
        caches.open(VERSION).then((cache) => cache.put(peticion, copia));
        return respuesta;
      });
    })
  );
});
