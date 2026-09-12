/* ============================================================
   sw.js — Service worker de Granja Piloño
   Guarda una copia del sitio para que arranque sin conexión y se
   pueda instalar como aplicación.

   IMPORTANTE AL PUBLICAR: sube el número de VERSION cada vez que
   cambies style.css o main.js. Los nombres de archivo no llevan
   hash, así que la versión es lo que fuerza la renovación de caché.
   ============================================================ */

const VERSION = 'v1';
const CACHE = 'granja-pilono-' + VERSION;

/* Copia base: lo mínimo para que la web abra sin conexión */
const SHELL = [
  './',
  './index.html',
  './legal.html',
  './404.html',
  './manifest.webmanifest',
  './assets/css/style.css',
  './assets/js/main.js',
  './assets/fonts/archivo-var.woff2',
  './assets/fonts/fraunces-var.woff2',
  './assets/fonts/fraunces-italic-var.woff2',
  './assets/img/icono-192.png',
  './assets/img/og-granja.jpg'
];

/* --- Instalación: guarda la copia base ---
   Cada archivo se pide por separado: si uno falla, el service worker
   sigue instalándose en vez de romperse entero. */
self.addEventListener('install', evento => {
  evento.waitUntil(
    caches.open(CACHE)
      .then(cache => Promise.all(SHELL.map(url => cache.add(url).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

/* --- Activación: borra las versiones anteriores --- */
self.addEventListener('activate', evento => {
  evento.waitUntil(
    caches.keys()
      .then(claves => Promise.all(
        claves.filter(clave => clave !== CACHE).map(clave => caches.delete(clave))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', evento => {
  const peticion = evento.request;

  // Solo GET del propio dominio: el resto va directo a la red
  if (peticion.method !== 'GET') return;
  const url = new URL(peticion.url);
  if (url.origin !== self.location.origin) return;

  // Navegación: primero la red (así siempre se ve la última versión
  // publicada) y, si no hay conexión, lo último que se guardó.
  if (peticion.mode === 'navigate') {
    evento.respondWith(
      fetch(peticion)
        .then(respuesta => {
          const copia = respuesta.clone();
          caches.open(CACHE).then(cache => cache.put(peticion, copia));
          return respuesta;
        })
        .catch(() =>
          caches.match(peticion).then(guardada => guardada || caches.match('./index.html'))
        )
    );
    return;
  }

  // Recursos: se sirve al instante lo guardado y se actualiza por detrás
  // (stale-while-revalidate). Carga instantánea en visitas repetidas.
  evento.respondWith(
    caches.match(peticion).then(guardada => {
      const desdeRed = fetch(peticion)
        .then(respuesta => {
          if (respuesta && respuesta.ok && respuesta.type === 'basic') {
            const copia = respuesta.clone();
            caches.open(CACHE).then(cache => cache.put(peticion, copia));
          }
          return respuesta;
        })
        .catch(() => guardada);
      return guardada || desdeRed;
    })
  );
});
