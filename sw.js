/*
  aurigaQ · funcionar sin internet
  Guarda en el navegador los archivos de la app y de los artefactos que viven dentro de esta carpeta,
  para que el show abra y corra aunque no haya conexión en la sala.
  Las páginas se piden primero a la red (así llegan las versiones nuevas) y, sin red, salen de lo guardado.
  El resto sale de lo guardado y se actualiza por detrás.
  © 2026 Héctor Cruz Juárez · GPL-3.0-or-later
*/
const VERSION = 'aurigaq-v044';
const BASE = ['./', 'index.html', 'salida.html', 'sdk/artefacto-sdk.js', 'manifest.webmanifest', 'icono-192.png', 'icono-512.png',
  'artefactos/orbitas.html', 'artefactos/senal.html', 'artefactos/plantilla.html',
  'sdk/ejemplos/datos.html', 'sdk/ejemplos/webgl.html',
  'modulos/indice.json', 'modulos/estado-por-cue.aqmodulo', 'modulos/parpadeo-de-vela.aqmodulo', 'modulos/video-con-aspecto.aqmodulo', 'modulos/fachada-mapeada.aqmodulo'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => Promise.all(BASE.map(u => c.add(new Request(u, { cache: 'reload' })).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('aurigaq-') && k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || r.headers.has('range')) return;
  const url = new URL(r.url);
  if (url.origin !== location.origin) return;
  const guardar = res => { if (res && res.ok && res.type === 'basic') { const copia = res.clone(); caches.open(VERSION).then(c => c.put(r, copia)); } return res; };
  if (r.mode === 'navigate' || r.destination === 'document' || r.destination === 'iframe') {
    // páginas: red primero, con un tope de 2.5 s; sin red, lo guardado
    e.respondWith(new Promise(resolve => {
      let listo = false;
      const desdeCache = () => caches.match(r, { ignoreSearch: true }).then(c => c || caches.match('index.html'));
      const t = setTimeout(() => { desdeCache().then(c => { if (c && !listo) { listo = true; resolve(c); } }); }, 2500);
      fetch(r).then(res => { clearTimeout(t); guardar(res); if (!listo) { listo = true; resolve(res); } })
        .catch(() => { clearTimeout(t); desdeCache().then(c => { if (!listo) { listo = true; resolve(c || Response.error()); } }); });
    }));
    return;
  }
  // lo demás: lo guardado al instante y se actualiza por detrás
  e.respondWith(caches.match(r).then(c => { const red = fetch(r).then(guardar).catch(() => c); return c || red; }));
});
