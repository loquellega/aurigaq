# Protocolo artefacto/v0 · SDK 0.1

Cómo se conecta una app web de la colección con aurigaQ.


Mensajes `postMessage` con `ns: "artefacto/v0"`.

### Del artefacto al host

| type | campos | cuándo |
|---|---|---|
| `hello` | `manifest` | al cargar, y como respuesta a `ping` |
| `param` | `id`, `value` | la app cambió un parámetro por sí misma (mouse, teclado) |
| `state` | `reqId`, `values` | respuesta a `getState` |
| `frame` | `bitmap` (ImageBitmap) | solo en transporte `bitmap` |
| `status` | `text` | aviso breve que el host muestra en la biblioteca (SDK 0.1) |

### Del host al artefacto

| type | campos | efecto |
|---|---|---|
| `setParam` | `id`, `value` | fija un parámetro |
| `applyState` | `values` | fija varios a la vez (preset) |
| `trigger` | `id` | dispara un evento |
| `resize` | `width`, `height` | resolución de trabajo del canvas |
| `transport` | `mode` | `direct` o `bitmap` |
| `getState` | `reqId` | pide los valores actuales |
| `start` | — | arranca la pieza, sin pantalla de inicio (SDK 0.1) |
| `stop` | — | detiene la pieza: fuentes de audio, procesos (SDK 0.1) |
| `hud` | `visible` | muestra u oculta la interfaz propia del artefacto (SDK 0.1) |
| `ping` | — | pide un `hello` nuevo |

### Manifiesto

```json
{
  "protocol": "artefacto/v0",
  "id": "fonoestratonika",
  "name": "Fonoestratonika",
  "version": "0.45",
  "outputs": ["video", "audio"],
  "params": [
    { "id": "densidad", "label": "Densidad", "type": "float", "min": 0, "max": 1, "default": 0.5 },
    { "id": "puntos", "type": "int", "min": 100, "max": 20000, "default": 4000 },
    { "id": "motor", "type": "enum", "options": ["olas", "viento", "aves"] },
    { "id": "congelar", "type": "bool", "default": false },
    { "id": "tinta", "type": "color", "default": "#e8e3d8" },
    { "id": "siguiente", "label": "Siguiente imagen", "type": "trigger" }
  ]
}
```

Tipos: `float`, `int`, `enum`, `bool`, `color`, `trigger`.

### Transporte de imagen

- **direct**: mismo origen. El host lee `window.__artefacto.canvas` y lo sube como textura cada cuadro. Sin costo extra.
- **bitmap**: el host no puede leer el canvas (otro origen o sandbox). El SDK envía cada cuadro como `ImageBitmap` transferible. Más costoso, pero funciona.

El host elige solo y cae a `bitmap` si `direct` falla.

## Plantilla

`artefactos/plantilla.html` es un artefacto mínimo y comentado con los tipos de parámetro (float, enum, color, bool y trigger), `onStart`, `onStop`, `onHud` y la interfaz propia avisando al host con `art.set`. Cópialo como punto de partida.

## Adaptar una app existente

1. Agrega el SDK: `<script src="../aurigaq/sdk/artefacto-sdk.js"></script>`, o pega su contenido dentro del `index.html` para que la app siga siendo un solo archivo.
2. Registra su canvas principal y sus parámetros:

```js
Artefacto.register({
  id: 'belkagraph', name: 'Belkagraph', version: '0.3',
  canvas: document.querySelector('#lienzo'),
  params: [
    { id: 'exposicion', label: 'Exposición', type: 'float', min: 0, max: 1, default: 0.6 },
    { id: 'signo', label: 'Signo', type: 'trigger' }
  ],
  onParam(id, value) { estado[id] = value; },
  onTrigger(id) { if (id === 'signo') mostrarSigno(); },
  onResize(w, h) { /* recalcular layout si dibuja según el tamaño */ }
});
```

3. Si la app cambia un valor por su cuenta (gesto del público, teclado), avisa con `art.set(id, valor)` para que el host lo refleje.

Fuera del host la app sigue funcionando igual.

