# Artefacto SDK · aurigaQ

**SDK 0.2 · protocolo `artefacto/v0` · aurigaQ v040** · Alchemy of Meaning (Alquimia del Significado) · Héctor Cruz Juárez · GPL-3.0-or-later

Un **artefacto** es una app web (un instrumento visual o sonoro hecho en HTML, Canvas o WebGL) que aurigaQ presenta en vivo. El SDK es un solo archivo JavaScript, sin dependencias, que conecta la app con aQ:

- aQ toma la imagen de su canvas;
- sus **parámetros** se vuelven entradas del nodo Artefacto: se guardan por cue, se interpolan y se mueven con cables;
- sus **datos** (desde el SDK 0.2) se vuelven salidas: números y eventos que mueven otros nodos o disparan cues.

Fuera de aQ, la app funciona igual: el SDK no hace nada si no hay un host.

Este SDK sirve para crear piezas nuevas y para adaptar materiales que ya existen (apps de Canvas 2D, WebGL, p5.js o Three.js) a distintas condiciones: un show, un museo, un taller o un equipo ligero.

## Contenido

| Archivo | Qué es |
|---|---|
| `artefacto-sdk.js` | El SDK actual. Es el que usa aQ y el que conviene copiar. |
| `versiones/` | Una copia congelada de cada versión del SDK (`artefacto-sdk-0.1.js`, `artefacto-sdk-0.2.js`…), para piezas que dependan de una en particular. |
| `version.json` | Versión del SDK, del protocolo y de aQ con la que se publicó. |
| `CHANGELOG.md` | Qué cambió en cada versión. |
| `ejemplos/datos.html` | Canvas 2D que publica números y eventos (SDK 0.2). |
| `ejemplos/webgl.html` | WebGL2 con `preserveDrawingBuffer`, `onResize` y calidad según el equipo. |
| `../artefactos/plantilla.html` | Plantilla comentada con todos los tipos de parámetro y de dato. |
| `../PROTOCOLO.md` | Los mensajes del protocolo, por si se quiere hablar con aQ sin el SDK. |
| `../crear-artefacto-aurigaq.md` | Guía completa: reglas, estados entre cues, entrega y pruebas, con la plantilla y el SDK listos para pegar. |
| `../docs/guia-de-medios.md` | Buenas prácticas de video, audio, imagen, artefactos y equipo. |

## Empezar

```html
<canvas id="c" width="1280" height="720"></canvas>
<script src="artefacto-sdk.js"></script>
<script>
const art = Artefacto.register({
  id: 'mi-pieza', name: 'Mi pieza', version: '0.1', author: 'Nombre',
  canvas: document.getElementById('c'),
  params: [
    { id: 'velocidad', label: 'Velocidad', type: 'float', min: 0, max: 2, default: 1 },
    { id: 'modo', label: 'Modo', type: 'enum', options: ['calma', 'tormenta'] },
    { id: 'destello', label: 'Destello', type: 'trigger' }
  ],
  data: [
    { id: 'nivel', label: 'nivel', type: 'float', min: 0, max: 1 },
    { id: 'golpe', label: 'golpe', type: 'event' }
  ],
  onParam(id, valor, todos) { /* guardar el valor y usarlo en el siguiente cuadro */ },
  onTrigger(id) { /* un evento desde aQ */ },
  onResize(w, h) { /* el canvas ya tiene el tamaño nuevo: recalcular */ },
  onStart() { /* entra a escena: arrancar audio, cámara, procesos */ },
  onStop() { /* sale de escena: liberar de verdad */ },
  onHud(visible) { /* mostrar u ocultar la interfaz propia */ },
  onHost(info) { /* info.version, info.width, info.height, info.calidad */ }
});

// en el ciclo de dibujo
art.emit('nivel', 0.42);   // un número; se puede llamar en cada cuadro
art.fire('golpe');         // un evento: en aQ llega como pulso
art.set('velocidad', 1.3); // la interfaz propia cambió un parámetro
</script>
```

Para una app de un solo archivo, pega el contenido de `artefacto-sdk.js` dentro de un `<script>` del `index.html`. Escribe `<\/script>` en lugar de `</script>` si aparece dentro de un comentario.

## Referencia

### `Artefacto.register(def)` → `art`

| Campo | Tipo | |
|---|---|---|
| `id`, `name`, `version`, `author` | texto | identidad de la pieza; `id` es obligatorio |
| `canvas` | elemento canvas | obligatorio: lo único que aQ ve |
| `params` | lista | `{ id, label, type, min, max, step, default, options }`; tipos `float`, `int`, `enum`, `bool`, `color`, `trigger` |
| `data` | lista (0.2) | `{ id, label, type, min, max }`; tipos `float` y `event` |
| `outputs` | lista | `['video']` por omisión; `['video','audio']` si la pieza suena |
| `onParam(id, valor, todos)` | función | aQ cambió un parámetro (puede llegar en cada cuadro) |
| `onTrigger(id)` | función | aQ disparó un `trigger` |
| `onResize(w, h)` | función | aQ fijó la resolución del canvas |
| `onStart()`, `onStop()` | función | la pieza entra o sale de escena |
| `onHud(visible)` | función | mostrar u ocultar la interfaz propia |
| `onHost(info)` | función (0.2) | `{ host, version, sdk, width, height, calidad }`; `calidad` es `'ligera'` o `'completa'` |

### `art`

| | |
|---|---|
| `art.set(id, valor)` | avisa a aQ de un parámetro que cambió la propia app |
| `art.emit(id, número)` | publica un dato `float` (0.2); se juntan y salen como mucho uno por cuadro |
| `art.fire(id)` | publica un evento (0.2) |
| `art.status(texto)` | un aviso breve que aQ muestra en Fuentes |
| `art.values` | los valores actuales de los parámetros |
| `art.inHost` | `true` dentro de aQ |
| `art.mode` | `'direct'` (mismo servidor, sin costo) o `'bitmap'` (copia por cuadro) |
| `art.host` | lo último que llegó por `onHost`, o `null` |

## Adaptar materiales que ya existen

**Canvas 2D.** Registra el canvas donde se dibuja. Si la app dibuja a un tamaño fijo, en `onResize` recalcula márgenes y escalas a partir de `w` y `h`.

**WebGL o shaders.** Crea el contexto con `preserveDrawingBuffer: true` y ajusta el viewport en `onResize`. Ver `ejemplos/webgl.html`.

**Three.js.**

```js
const renderer = new THREE.WebGLRenderer({ canvas, preserveDrawingBuffer: true });
Artefacto.register({ id: 'pieza3d', canvas: renderer.domElement, /* … */
  onResize(w, h) { renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
});
```

Copia `three.module.js` dentro de la carpeta de la pieza para que funcione sin internet.

**p5.js.**

```js
let art;
function setup() {
  const cnv = createCanvas(1280, 720);
  art = Artefacto.register({ id: 'pieza-p5', canvas: cnv.elt, /* … */
    onResize(w, h) { resizeCanvas(w, h); } });
}
```

**Piezas con audio, cámara o micrófono.** Arranca en `onStart` y apaga en `onStop`. Dentro de aQ no muestres botones de «empezar»: el lanzador de aQ ya permite el audio. Dale a la pieza un parámetro de volumen.

**Piezas que miden algo.** Lo que antes solo se veía en pantalla (un nivel, una posición, una cuenta, un choque) puede salir como dato. Así una escena de aQ reacciona a la pieza sin tocar su código.

**Calidad según el equipo.** En `onHost`, con `calidad: 'ligera'` (salida a 720p o artefactos a menor resolución), baja partículas, octavas, muestras o pasadas.

## Compatibilidad

| aurigaQ | SDK | Protocolo | Notas |
|---|---|---|---|
| hasta v039 | 0.1 | artefacto/v0 | parámetros, `trigger`, `start`, `stop`, `hud`, `status` |
| v040 | 0.2 | artefacto/v0 | `data`, `emit`, `fire`, `onHost`; salidas en el nodo Artefacto |

El protocolo sigue siendo `artefacto/v0`: lo nuevo se agrega sin romper lo anterior. Una pieza con SDK 0.1 funciona en aQ v040, y una con SDK 0.2 funciona en un aQ anterior (sin sus salidas de datos).

## Cómo se actualiza con cada versión de aQ

1. Si cambia el SDK, sube su versión (`var SDK` en `artefacto-sdk.js`), anota el cambio en `CHANGELOG.md` y agrega una fila a la tabla de compatibilidad.
2. Corre `python3 herramientas/armar-docs.py` desde la raíz del repositorio. Eso:
   - congela el SDK en `versiones/`;
   - actualiza `version.json`;
   - copia la plantilla y el SDK a `crear-artefacto-aurigaq.md`;
   - regenera `docs/guia-de-medios.md` desde la app.
3. Sube todo junto con la versión de aQ.

## English

The Artefacto SDK is a single dependency-free JavaScript file that connects a web app (a visual or sound "artefact") to aurigaQ:

- aQ takes the frames from its canvas;
- its **params** become inputs of the Artefacto node, stored per cue and driven by cables;
- since SDK 0.2, its **data** (numbers via `art.emit`, events via `art.fire`) become outputs that can drive other nodes or trigger cues.

`onHost(info)` tells the piece the aQ version, resolution and quality level (`ligera` for light machines).

The protocol stays `artefacto/v0` and every addition is backwards compatible. Each SDK release is frozen in `versiones/`, and `herramientas/armar-docs.py` keeps the docs in sync with every aQ release.
