# Artefacto SDK · cambios

## 0.2 · aurigaQ v040 · 9 de noviembre de 2026

- **Datos hacia el host.** El manifiesto acepta `data: [{ id, label, type, min, max }]` con tipos `float` y `event`.
  - `art.emit(id, número)` publica un valor; el SDK junta los valores y manda como mucho uno por cuadro.
  - `art.fire(id)` publica un evento.
  - En aQ, cada dato es una salida del nodo Artefacto: los números se conectan a cualquier entrada y los eventos llegan como pulsos.
- **`onHost(info)` y `art.host`.** El host se presenta al conectar y cada vez que cambia la resolución, con `{ host, version, sdk, width, height, calidad }`. `calidad` es `'ligera'` (salida a 720p o artefactos a menor resolución) o `'completa'`.
- **`Artefacto.SDK`** da la versión del SDK.
- **Mensajes nuevos del protocolo:** `data` y `event` (del artefacto al host) y `welcome` (del host al artefacto). El protocolo sigue siendo `artefacto/v0`; un host anterior ignora lo nuevo.
- **Ejemplos nuevos:** `ejemplos/datos.html` y `ejemplos/webgl.html`. La plantilla publica posición y vueltas.

## 0.1 · hasta aurigaQ v039

- **Parámetros:** `float`, `int`, `enum`, `bool`, `color` y `trigger`, con `art.set` para avisar cambios hechos en la propia app.
- **Ciclo de vida:** `onStart`, `onStop`, `onHud`, `onResize`.
- **Transportes de imagen:** `direct` (mismo origen) y `bitmap` (copia por cuadro).
- **Otros:** `status`, `getState` y respuesta automática a `ping` para la vigilancia del host.
